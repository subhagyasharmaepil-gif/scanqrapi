const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.epil.teacherquiz&pcampaignid=web_share';

// ------------------------------------
// MODELS FOLDER
// ------------------------------------
// Your project should have:
//
// project/
// ├── server.js
// ├── package.json
// └── models/
//     ├── 1212612.glb
//     ├── 1212612.jpg
//     └── 1212612.png
//
// Files will be accessible like:
// https://scanqrapi.onrender.com/models/1212612.glb
//
const modelsPath = path.join(__dirname, 'models');

app.use('/models', express.static(modelsPath));

// ------------------------------------
// HEALTH CHECK
// GET /
// ------------------------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ever 3D API is running',
  });
});

// ------------------------------------
// QR URL
// GET /q/1212612
// ------------------------------------
app.get('/q/:id', (req, res) => {
  const { id } = req.params;

  // Only numeric IDs
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid QR code',
    });
  }

  // Redirect to Play Store
  return res.redirect(302, PLAY_STORE_URL);
});

// ------------------------------------
// 3D MODEL API
// GET /model/1212612
// ------------------------------------
app.get('/model/:id', (req, res) => {
  const { id } = req.params;

  // Only numeric IDs
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid model ID',
    });
  }

  const files = {};

  // File paths on Render
  const glbPath = path.join(modelsPath, `${id}.glb`);
  const jpgPath = path.join(modelsPath, `${id}.jpg`);
  const pngPath = path.join(modelsPath, `${id}.png`);

  // ------------------------------------
  // Check GLB
  // ------------------------------------
  if (fs.existsSync(glbPath)) {
    files.modelUrl =
      `https://scanqrapi.onrender.com/models/${id}.glb`;
  }

  // ------------------------------------
  // Check JPG
  // ------------------------------------
  if (fs.existsSync(jpgPath)) {
    files.jpgUrl =
      `https://scanqrapi.onrender.com/models/${id}.jpg`;
  }

  // ------------------------------------
  // Check PNG
  // ------------------------------------
  if (fs.existsSync(pngPath)) {
    files.pngUrl =
      `https://scanqrapi.onrender.com/models/${id}.png`;
  }

  // ------------------------------------
  // No files found
  // ------------------------------------
  if (Object.keys(files).length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No files found for this model',
      id: id,
    });
  }

  // ------------------------------------
  // Response
  // ------------------------------------
  return res.json({
    success: true,
    id: id,
    ...files,
  });
});

// ------------------------------------
// START SERVER
// ------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ever API running on port ${PORT}`);
  console.log(`Models folder: ${modelsPath}`);
});
