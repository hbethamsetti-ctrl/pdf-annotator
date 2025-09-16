require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const filesRoutes = require('./routes/files');
const highlightsRoutes = require('./routes/highlights');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pdf_annotator';

connectDB(MONGO_URI);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/highlights', highlightsRoutes);

// serve uploaded files statically
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
