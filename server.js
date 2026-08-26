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

// Files:
// models/360view.jpg
// models/360view.png
// models/1212612.glb
// models/1212612.jpg
// models/1212612.png

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
        message:
          'apple-app-site-association not found',
      });
    }

    res.type('application/json');

    return res.sendFile(filePath);
  }
);

// ==================================================
// QR LINK
//
// Example:
// https://scanqrapi.onrender.com/q/1212612
//
// This can be used if QR contains /q/ID
// ==================================================

app.get('/q/:id', (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return redirectToStore(req, res);
  }

  // If App Links / Universal Links are correctly
  // configured, installed apps will intercept this
  // URL before the browser follows this redirect.

  return redirectToStore(req, res);
});

// ==================================================
// MODEL / IMAGE LINK
//
// Example:
// https://scanqrapi.onrender.com/models/360view.jpg
//
// IMPORTANT:
// If you put this URL in the QR code, the OS needs
// /models/* in the App Links / Universal Links config.
// ==================================================

app.get('/models/:filename', (req, res) => {
  const filename = req.params.filename;

  // Security: don't allow ../ etc.
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file name',
    });
  }

  const filePath = path.join(
    modelsPath,
    filename
  );

  if (!fs.existsSync(filePath)) {
    return redirectToStore(req, res);
  }

  // IMPORTANT:
  //
  // Normally this sends the image to the browser.
  // If the app is correctly configured as an
  // App Link / Universal Link, the OS should
  // open the installed app instead.
  //
  return res.sendFile(filePath);
});

// ==================================================
// MODEL API
//
// GET:
// /model/1212612
// ==================================================

app.get('/model/:id', (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid model ID',
    });
  }

  const files = {};

  // ==================================================
  // GLB
  // ==================================================

  const glbPath = path.join(
    modelsPath,
    `${id}.glb`
  );

  if (fs.existsSync(glbPath)) {
    files.modelUrl =
      `${BASE_URL}/models/${id}.glb`;
  }

  // ==================================================
  // JPG
  // ==================================================

  const jpgPath = path.join(
    modelsPath,
    `${id}.jpg`
  );

  if (fs.existsSync(jpgPath)) {
    files.jpgUrl =
      `${BASE_URL}/models/${id}.jpg`;
  }

  // ==================================================
  // PNG
  // ==================================================

  const pngPath = path.join(
    modelsPath,
    `${id}.png`
  );

  if (fs.existsSync(pngPath)) {
    files.pngUrl =
      `${BASE_URL}/models/${id}.png`;
  }

  // ==================================================
  // 360 IMAGE
  //
  // Common 360 image
  // ==================================================

  const view360Path = path.join(
    modelsPath,
    '360view.jpg'
  );

  if (fs.existsSync(view360Path)) {
    files.view360Url =
      `${BASE_URL}/models/360view.jpg`;
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
// STORE REDIRECT FUNCTION
// ==================================================

function redirectToStore(req, res) {
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

// ==================================================
// 404
// ==================================================

app.use((req, res) => {
  return res.status(404).json({
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
