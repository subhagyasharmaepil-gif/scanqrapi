const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ==================================================
// CONFIG
// ==================================================

const BASE_URL = 'https://scanqrapi.onrender.com';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.epil.teacherquiz&pcampaignid=web_share';

// ==================================================
// PATHS
// ==================================================

const modelsPath = path.join(__dirname, 'models');

const wellKnownPath = path.join(__dirname, '.well-known');

// ==================================================
// STATIC MODEL FILES
// ==================================================
//
// Files inside:
//
// models/
//   1212612.glb
//   1212612.jpg
//   1212612.png
//
// Will be available at:
//
// /models/1212612.glb
// /models/1212612.jpg
// /models/1212612.png
//

app.use('/models', express.static(modelsPath));

// ==================================================
// HEALTH CHECK
// ==================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ever 3D API is running',
  });
});

// ==================================================
// ANDROID APP LINKS
// ==================================================
//
// URL:
//
// https://scanqrapi.onrender.com/.well-known/assetlinks.json
//

app.get('/.well-known/assetlinks.json', (req, res) => {
  const filePath = path.join(
    wellKnownPath,
    'assetlinks.json'
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'assetlinks.json not found',
    });
  }

  res.type('application/json');

  return res.sendFile(filePath);
});

// ==================================================
// IOS UNIVERSAL LINKS
// ==================================================
//
// URL:
//
// https://scanqrapi.onrender.com/.well-known/apple-app-site-association
//

app.get(
  '/.well-known/apple-app-site-association',
  (req, res) => {
    const filePath = path.join(
      wellKnownPath,
      'apple-app-site-association'
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'apple-app-site-association not found',
      });
    }

    res.type('application/json');

    return res.sendFile(filePath);
  }
);

// ==================================================
// QR URL
// ==================================================
//
// Example:
//
// https://scanqrapi.onrender.com/q/1212612
//
// App installed:
// Android App Links / iOS Universal Links
// → Flutter app
//
// App not installed:
// → Play Store
//

app.get('/q/:id', (req, res) => {
  const { id } = req.params;

  // ------------------------------------------------
  // Invalid ID
  // ------------------------------------------------

  if (!/^\d+$/.test(id)) {
    return res.redirect(302, PLAY_STORE_URL);
  }

  // ------------------------------------------------
  // Check whether model files exist
  // ------------------------------------------------

  const glbPath = path.join(
    modelsPath,
    `${id}.glb`
  );

  const jpgPath = path.join(
    modelsPath,
    `${id}.jpg`
  );

  const pngPath = path.join(
    modelsPath,
    `${id}.png`
  );

  const hasGlb = fs.existsSync(glbPath);
  const hasJpg = fs.existsSync(jpgPath);
  const hasPng = fs.existsSync(pngPath);

  // ------------------------------------------------
  // No files
  // ------------------------------------------------

  if (!hasGlb && !hasJpg && !hasPng) {
    return res.redirect(302, PLAY_STORE_URL);
  }

  // ------------------------------------------------
  // Valid QR
  // ------------------------------------------------
  //
  // If app is installed:
  //
  // Android/iOS handles the Universal/App Link.
  //
  // If app is not installed:
  //
  // Browser reaches this fallback → Play Store.
  //

  return res.redirect(302, PLAY_STORE_URL);
});

// ==================================================
// MODEL API
// ==================================================
//
// GET:
//
// /model/1212612
//
// Response:
//
// {
//   success: true,
//   id: "1212612",
//   modelUrl: "...",
//   jpgUrl: "...",
//   pngUrl: "..."
// }
//

app.get('/model/:id', (req, res) => {
  const { id } = req.params;

  // ------------------------------------------------
  // Validate ID
  // ------------------------------------------------

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid model ID',
    });
  }

  const files = {};

  // ------------------------------------------------
  // File paths
  // ------------------------------------------------

  const glbPath = path.join(
    modelsPath,
    `${id}.glb`
  );

  const jpgPath = path.join(
    modelsPath,
    `${id}.jpg`
  );

  const pngPath = path.join(
    modelsPath,
    `${id}.png`
  );

  // ------------------------------------------------
  // GLB
  // ------------------------------------------------

  if (fs.existsSync(glbPath)) {
    files.modelUrl =
      `${BASE_URL}/models/${id}.glb`;
  }

  // ------------------------------------------------
  // JPG
  // ------------------------------------------------

  if (fs.existsSync(jpgPath)) {
    files.jpgUrl =
      `${BASE_URL}/models/${id}.jpg`;
  }

  // ------------------------------------------------
  // PNG
  // ------------------------------------------------

  if (fs.existsSync(pngPath)) {
    files.pngUrl =
      `${BASE_URL}/models/${id}.png`;
  }

  // ------------------------------------------------
  // No files found
  // ------------------------------------------------

  if (Object.keys(files).length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No files found for this model',
      id: id,
    });
  }

  // ------------------------------------------------
  // Return response
  // ------------------------------------------------

  return res.json({
    success: true,
    id: id,
    ...files,
  });
});

// ==================================================
// 404 HANDLER
// ==================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================');
  console.log('Ever 3D API started');
  console.log(`Port: ${PORT}`);
  console.log(`Models: ${modelsPath}`);
  console.log(`Well Known: ${wellKnownPath}`);
  console.log('====================================');
});
