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
// Health check
// ------------------------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ever 3D API is running',
  });
});

// ------------------------------------
// QR URL
// https://ever.com/q/1212612
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

  // Normal phone camera/browser
  return res.redirect(PLAY_STORE_URL);
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

  // File paths
  const glbPath = path.join(__dirname, 'models', `${id}.glb`);
  const jpgPath = path.join(__dirname, 'models', `${id}.jpg`);
  const pngPath = path.join(__dirname, 'models', `${id}.png`);

  // Check GLB
  if (fs.existsSync(glbPath)) {
    files.modelUrl = `https://api.ever.com/${id}.glb`;
  }

  // Check JPG
  if (fs.existsSync(jpgPath)) {
    files.jpgUrl = `https://api.ever.com/${id}.jpg`;
  }

  // Check PNG
  if (fs.existsSync(pngPath)) {
    files.pngUrl = `https://api.ever.com/${id}.png`;
  }

  // No files found
  if (Object.keys(files).length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No files found for this model',
      id: id,
    });
  }

  // Return available files
  return res.json({
    success: true,
    id: id,
    ...files,
  });
});

// ------------------------------------
// Start server
// ------------------------------------
app.listen(PORT, () => {
  console.log(`Ever API running on port ${PORT}`);
});
