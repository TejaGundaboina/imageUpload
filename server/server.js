import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3001;

const uploadDir = path.join(__dirname, '..', 'client', 'src', 'assets', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use('/uploads', express.static(uploadDir));

app.get('/api/images', (req, res) => {
  const files = fs
    .readdirSync(uploadDir)
    .filter((file) => /\.(jpe?g|png|gif|svg|webp)$/i.test(file))
    .sort();

  const images = files.map((file) => ({
    id: file,
    src: `http://localhost:${PORT}/uploads/${file}`,
    label: file.replace(/\.[^.]+$/, ''),
  }));

  res.json(images);
});

app.post('/api/upload', upload.array('images', 20), (req, res) => {
  const uploadedFiles = (req.files || []).map((file) => ({
    id: file.filename,
    src: `http://localhost:${PORT}/uploads/${file.filename}`,
    label: file.originalname.replace(/\.[^.]+$/, ''),
  }));

  res.json({ images: uploadedFiles });
});

app.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`);
});
