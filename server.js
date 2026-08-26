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
// STATIC MODEL FILES
// ==================================================

app.use('/models', express.static(modelsPath));

// ==================================================
// HEALTH CHECK
// GET /
// ==================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ever 3D API is running',
  });
});

// ==================================================
// ANDROID APP LINKS
// GET /.well-known/assetlinks.json
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
// GET /.well-known/apple-app-site-association
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
// QR ROUTE
// GET /q/1212612
// ==================================================

app.get('/q/:id', (req, res) => {
  const { id } = req.params;

  const userAgent =
    req.headers['user-agent'] || '';

  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent);

  const isAndroid =
    /Android/i.test(userAgent);

  // ==================================================
  // INVALID QR ID
  // ==================================================

  if (!/^\d+$/.test(id)) {
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

  // ==================================================
  // CHECK MODEL FILES
  // ==================================================

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

  const hasGlb =
    fs.existsSync(glbPath);

  const hasJpg =
    fs.existsSync(jpgPath);

  const hasPng =
    fs.existsSync(pngPath);

  // ==================================================
  // MODEL DOES NOT EXIST
  // ==================================================

  if (!hasGlb && !hasJpg && !hasPng) {
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

  // ==================================================
  // VALID MODEL
  //
  // Android App Links / iOS Universal Links
  // should open the installed app.
  //
  // If the app isn't installed, browser reaches
  // this fallback and goes to the correct store.
  // ==================================================

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
// GET /model/1212612
// ==================================================

app.get('/model/:id', (req, res) => {
  const { id } = req.params;

  // ==================================================
  // VALIDATE ID
  // ==================================================

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid model ID',
    });
  }

  const files = {};

  // ==================================================
  // FILE PATHS
  // ==================================================

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

  // ==================================================
  // GLB
  // ==================================================

  if (fs.existsSync(glbPath)) {
    files.modelUrl =
      `${BASE_URL}/models/${id}.glb`;
  }

  // ==================================================
  // JPG
  // ==================================================

  if (fs.existsSync(jpgPath)) {
    files.jpgUrl =
      `${BASE_URL}/models/${id}.jpg`;
  }

  // ==================================================
  // PNG
  // ==================================================

  if (fs.existsSync(pngPath)) {
    files.pngUrl =
      `${BASE_URL}/models/${id}.png`;
  }

  // ==================================================
  // NO FILES
  // ==================================================

  if (Object.keys(files).length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No files found for this model',
      id: id,
    });
  }

  // ==================================================
  // RESPONSE
  // ==================================================

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
