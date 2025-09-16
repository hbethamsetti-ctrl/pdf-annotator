import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../api';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewerPage(){
  const { uuid } = useParams();
  const [fileMeta, setFileMeta] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);
  const [highlights, setHighlights] = useState([]);
  const [scale, setScale] = useState(1.2);
  const pageRef = useRef();

  useEffect(()=>{ loadMeta(); loadHighlights(); }, [uuid]);

  async function loadMeta(){
    try {
      const res = await api.get(`/files/${uuid}`);
      setFileMeta(res.data);
      // file served from /uploads/<filename>
      const filename = res.data.filename;
      const base = (import.meta.env.VITE_UPLOAD_BASE || 'http://localhost:5000') + '/uploads';
      setFileUrl(`${base}/${filename}`);
    } catch (err) { console.error(err); }
  }

  async function loadHighlights(){
    try {
      const res = await api.get(`/highlights/${uuid}`);
      setHighlights(res.data || []);
    } catch (err) { console.error(err); }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPage(1);
  }

  // selection -> convert to bbox relative to page viewport and send to backend
  function handleMouseUp(e) {
    // only if selection contained in our page container
    const sel = window.getSelection();
    const selected = sel && sel.toString().trim();
    if (!selected) return;
    const range = sel.getRangeAt(0);
    const clientRects = range.getClientRects();
    if (!clientRects || clientRects.length === 0) return;
    // pick first rect for demo (multi-rect selections require more work)
    const rect = clientRects[0];
    const pageNode = pageRef.current;
    if (!pageNode) return;
    const pageRect = pageNode.getBoundingClientRect();
    // compute relative bbox
    const x = (rect.left - pageRect.left) / pageRect.width;
    const y = (rect.top - pageRect.top) / pageRect.height;
    const width = rect.width / pageRect.width;
    const height = rect.height / pageRect.height;

    const bbox = { x, y, width, height };
    const payload = { pdfUuid: uuid, page, text: selected, bbox };

    // save highlight
    api.post('/highlights', payload).then(res => {
      setHighlights(prev => [...prev, res.data]);
      sel.removeAllRanges();
    }).catch(err => {
      console.error(err);
      alert('Could not save highlight');
    });
  }

  return (
    <div>
      <h3>{fileMeta?.originalName}</h3>
      <div className="controls">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
        <span>Page {page} / {numPages || '?'}</span>
        <button onClick={()=>setPage(p=>Math.min(numPages||p+1,p+1))}>Next</button>
        <label>Zoom:</label>
        <input type="range" min="0.6" max="2.0" step="0.1" value={scale} onChange={e=>setScale(parseFloat(e.target.value))} />
      </div>

      <div className="viewer">
        <div className="pdf-canvas" style={{ flex: 1 }} onMouseUp={handleMouseUp}>
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={page} scale={scale} width={800} renderTextLayer={true} renderAnnotationLayer={false} inputRef={pageRef}>
              {/* react-pdf v7: to get ref to page container we use onRenderSuccess; fallback: query DOM */}
            </Page>
          </Document>

          {/* highlights overlay for current page */}
          <div style={{ position:'relative' }}>
            {highlights.filter(h=>h.page===page).map(h => (
              <div key={h._id}
                   className="highlight"
                   style={{
                     left: `${h.bbox.x*100}%`,
                     top: `${h.bbox.y*100}%`,
                     width: `${h.bbox.width*100}%`,
                     height: `${h.bbox.height*100}%`
                   }}
                   title={h.text}
              />
            ))}
          </div>
        </div>

        <aside className="sidebar">
          <h4>Highlights</h4>
          <div>
            {highlights.filter(h=>h.page===page).map(h => (
              <div key={h._id} style={{borderBottom:'1px solid #eee', padding:'6px 0'}}>
                <div><small>{h.text.length>120? h.text.slice(0,120)+'...':h.text}</small></div>
                <div style={{marginTop:6}}>
                  <button onClick={async ()=>{ await api.delete(`/highlights/${h._id}`); setHighlights(prev=>prev.filter(x=>x._id!==h._id)); }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
