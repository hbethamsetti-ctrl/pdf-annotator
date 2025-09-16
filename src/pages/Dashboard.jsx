import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard(){
  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{ fetchFiles(); }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return alert('Select a file');
    const fd = new FormData(); fd.append('file', fileToUpload);
    try {
      await api.post('/files/upload', fd, { headers: {'Content-Type': 'multipart/form-data'}});
      setFileToUpload(null);
      fetchFiles();
    } catch (err) { alert('Upload failed'); console.error(err); }
  };

  const openFile = (uuid) => navigate(`/file/${uuid}`);

  const del = async (uuid) => {
    if (!confirm('Delete file?')) return;
    await api.delete(`/files/${uuid}`);
    fetchFiles();
  };

  return (
    <div>
      <h2>My Library</h2>

      <form onSubmit={upload} style={{ marginBottom: 12 }}>
        <input type="file" onChange={e=>setFileToUpload(e.target.files[0])} accept="application/pdf" />
        <button type="submit">Upload PDF</button>
      </form>

      <div className="library-grid">
        {files.map(f => (
          <div className="card" key={f.uuid}>
            <h4>{f.originalName}</h4>
            <p>UUID: {f.uuid}</p>
            <button onClick={()=>openFile(f.uuid)}>Open</button>
            <button onClick={()=>del(f.uuid)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
