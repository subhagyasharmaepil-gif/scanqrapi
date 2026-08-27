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
  'https://play.google.com/store/apps/details?id=com.epil.teacherquiz';

const IOS_APP_STORE_URL =
  'https://apps.apple.com/in/app/evergreen-e-learning/id1488785145';

// ==================================================
// PATHS
// ==================================================

const modelsPath = path.join(__dirname, 'models');
const wellKnownPath = path.join(__dirname, '.well-known');

const assetLinksPath = path.join(
  wellKnownPath,
  'assetlinks.json'
);

const aasaPath = path.join(
  wellKnownPath,
  'apple-app-site-association'
);

// ==================================================
// STARTUP CHECK
// ==================================================

console.log('====================================');
console.log('EVER 3D API');
console.log('====================================');

console.log('Current directory:', __dirname);
console.log('Models:', modelsPath);
console.log('Well-known:', wellKnownPath);

console.log(
  'Models folder:',
  fs.existsSync(modelsPath)
);

console.log(
  'Well-known folder:',
  fs.existsSync(wellKnownPath)
);

console.log(
  'assetlinks.json:',
  fs.existsSync(assetLinksPath)
);

console.log(
  'apple-app-site-association:',
  fs.existsSync(aasaPath)
);

console.log('====================================');

// ==================================================
// QR DEEP LINK
//
// Example:
//
// https://scanqrapi.onrender.com/q/360views
//
// OR:
//
// https://scanqrapi.onrender.com/q/1212612
//
// ==================================================

app.get('/q/:id', (req, res) => {
  const { id } = req.params;

  console.log('====================================');
  console.log('QR REQUEST:', id);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('====================================');


  return redirectToStore(req, res);
});


// ==================================================
// STORE REDIRECT
// ==================================================

function redirectToStore(req, res) {
  const userAgent =
    req.headers['user-agent'] || '';

  const isIOS =
    /iPhone|iPad|iPod/i.test(
      userAgent
    );

  const isAndroid =
    /Android/i.test(
      userAgent
    );

  console.log(
    'Redirecting:',
    {
      isIOS,
      isAndroid,
    }
  );

  // ==================================================
  // IOS
  // ==================================================

  if (isIOS) {
    return res.redirect(
      302,
      IOS_APP_STORE_URL
    );
  }

  // ==================================================
  // ANDROID
  // ==================================================

  if (isAndroid) {
    return res.redirect(
      302,
      ANDROID_PLAY_STORE_URL
    );
  }

  // ==================================================
  // DESKTOP
  // ==================================================

  return res.redirect(
    302,
    IOS_APP_STORE_URL
  );
}

// ==================================================
// 404
// ==================================================

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.originalUrl,
    });
  }
);

// ==================================================
// START SERVER
// ==================================================

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      '===================================='
    );

    console.log(
      'Ever 3D API started'
    );

    console.log(
      `Port: ${PORT}`
    );

    console.log(
      `Base URL: ${BASE_URL}`
    );

    console.log(
      '===================================='
    );
  }
);
