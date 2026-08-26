const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const BASE_URL = 'https://scanqrapi.onrender.com';

// ==================================================
// STORE LINKS
// ==================================================

const ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.epil.teacherquiz&pcampaignid=web_share';

const IOS_APP_STORE_URL =
  'https://apps.apple.com/in/app/evergreen-e-learning/id1488785145';

// ==================================================
// PATHS
// ==================================================

const modelsPath = path.join(__dirname, 'models');
const wellKnownPath = path.join(__dirname, '.well-known');

// ==================================================
// STATIC MODELS
// ==================================================

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
// /.well-known/assetlinks.json
// ==================================================

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
// /.well-known/apple-app-site-association
// ==================================================

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
// QR LINK
// /q/1212612
// ==================================================

app.get('/q/:id', (req, res) => {
  const { id } = req.params;

  // Only numeric IDs
  if (!/^\d+$/.test(id)) {
    const userAgent =
      req.headers['user-agent'] || '';

    const isIOS =
      /iPhone|iPad|iPod/i.test(userAgent);

    if (isIOS) {
      return res.redirect(
        302,
        IOS_APP_STORE_URL
      );
    }

    return res.redirect(
      302,
      ANDROID_PLAY_STORE_URL
    );
  }

  // ----------------------------------------------
  // IMPORTANT:
  //
  // Android App Links / iOS Universal Links
  // will intercept this URL when the app is
  // installed and properly associated.
  //
  // If the app is NOT installed, this request
  // reaches the server and redirects to the store.
  // ----------------------------------------------

  const userAgent =
    req.headers['user-agent'] || '';

  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent);

  if (isIOS) {
    return res.redirect(
      302,
      IOS_APP_STORE_URL
    );
  }

  return res.redirect(
    302,
    ANDROID_PLAY_STORE_URL
  );
});

// ==================================================
// MODEL API
// /model/1212612
// ==================================================

app.get('/model/:id', (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid model ID',
    });
  }

  const files = {};

  // ----------------------------------------------
  // File paths
  // ----------------------------------------------

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

  // ----------------------------------------------
  // GLB
  // ----------------------------------------------

  if (fs.existsSync(glbPath)) {
    files.modelUrl =
      `${BASE_URL}/models/${id}.glb`;
  }

  // ----------------------------------------------
  // JPG
  // ----------------------------------------------

  if (fs.existsSync(jpgPath)) {
    files.jpgUrl =
      `${BASE_URL}/models/${id}.jpg`;
  }

  // ----------------------------------------------
  // PNG
  // ----------------------------------------------

  if (fs.existsSync(pngPath)) {
    files.pngUrl =
      `${BASE_URL}/models/${id}.png`;
  }

  // ----------------------------------------------
  // No files
  // ----------------------------------------------

  if (Object.keys(files).length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No files found for this model',
      id: id,
    });
  }

  // ----------------------------------------------
  // Response
  // ----------------------------------------------

  return res.json({
    success: true,
    id: id,
    ...files,
  });
});

// ==================================================
// 404
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
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Models: ${modelsPath}`);
  console.log(`Well Known: ${wellKnownPath}`);
  console.log('====================================');
});
