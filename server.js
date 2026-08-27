const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const BASE_URL =
  'https://scanqrapi.onrender.com';

// ==================================================
// STORE LINKS
// ==================================================

const ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.epil.teacherquiz';

const IOS_APP_STORE_URL =
  'https://apps.apple.com/in/app/evergreen-e-learning/id1488785145';

// ==================================================
// WELL-KNOWN PATH
// ==================================================

const wellKnownPath =
  path.join(__dirname, '.well-known');

const assetLinksPath =
  path.join(
    wellKnownPath,
    'assetlinks.json'
  );

const aasaPath =
  path.join(
    wellKnownPath,
    'apple-app-site-association'
  );

// ==================================================
// STARTUP CHECK
// ==================================================

console.log(
  '===================================='
);

console.log(
  'EVER 3D API'
);

console.log(
  '===================================='
);

console.log(
  'Current directory:',
  __dirname
);

console.log(
  'Well-known:',
  wellKnownPath
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

console.log(
  '===================================='
);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Ever 3D API is running',
  });
});

// ==================================================
// IOS UNIVERSAL LINKS
//
// File:
// .well-known/apple-app-site-association
//
// URL:
// https://scanqrapi.onrender.com/.well-known/apple-app-site-association
// ==================================================

app.get(
  '/.well-known/apple-app-site-association',
  (req, res) => {

    if (!fs.existsSync(aasaPath)) {
      return res.status(404).json({
        success: false,
        message:
          'apple-app-site-association file not found',
      });
    }

    res.type('application/json');

    return res.sendFile(
      aasaPath
    );
  }
);

// ==================================================
// ANDROID APP LINKS
//
// File:
// .well-known/assetlinks.json
//
// URL:
// https://scanqrapi.onrender.com/.well-known/assetlinks.json
// ==================================================

app.get(
  '/.well-known/assetlinks.json',
  (req, res) => {

    if (!fs.existsSync(assetLinksPath)) {
      return res.status(404).json({
        success: false,
        message:
          'assetlinks.json file not found',
      });
    }

    res.type('application/json');

    return res.sendFile(
      assetLinksPath
    );
  }
);

// ==================================================
// QR DEEP LINK
//
// Examples:
//
// /q/360views
// /q/1212612
// /q/1ccaa.jpg
// /q/car.glb
// /q/image.png
// ==================================================

app.get(
  '/q/:id',
  (req, res) => {

    const { id } =
      req.params;

    console.log(
      '===================================='
    );

    console.log(
      'QR REQUEST:',
      id
    );

    console.log(
      'User-Agent:',
      req.headers['user-agent']
    );

    console.log(
      '===================================='
    );

    // ==================================================
    // SECURITY
    // ==================================================

    if (
      id.includes('/') ||
      id.includes('\\') ||
      id.includes('..')
    ) {

      console.log(
        'Invalid QR ID'
      );

      return redirectToStore(
        req,
        res
      );
    }

    // ==================================================
    // FILE TYPES
    // ==================================================

    const lowerId =
      id.toLowerCase();

    const isJpg =
      lowerId.endsWith('.jpg');

    const isJpeg =
      lowerId.endsWith('.jpeg');

    const isPng =
      lowerId.endsWith('.png');

    const isGlb =
      lowerId.endsWith('.glb');

    const hasSupportedExtension =
      isJpg ||
      isJpeg ||
      isPng ||
      isGlb;

    // ==================================================
    // IDs WITHOUT EXTENSION
    //
    // Example:
    //
    // /q/360views
    // /q/1212612
    // ==================================================

    const hasNoExtension =
      !lowerId.includes('.');

    if (
      !hasSupportedExtension &&
      !hasNoExtension
    ) {

      console.log(
        'Unsupported QR:',
        id
      );

      return redirectToStore(
        req,
        res
      );
    }

    console.log(
      'Valid QR:',
      id
    );

    // ==================================================
    // REDIRECT
    // ==================================================

    return redirectToStore(
      req,
      res
    );
  }
);

// ==================================================
// STORE REDIRECT
// ==================================================

function redirectToStore(
  req,
  res
) {

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

    console.log(
      'iOS → App Store'
    );

    return res.redirect(
      302,
      IOS_APP_STORE_URL
    );
  }

  // ==================================================
  // ANDROID
  // ==================================================

  if (isAndroid) {

    console.log(
      'Android → Play Store'
    );

    return res.redirect(
      302,
      ANDROID_PLAY_STORE_URL
    );
  }

  // ==================================================
  // DESKTOP / UNKNOWN
  // ==================================================

  console.log(
    'Desktop / Unknown → App Store'
  );

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
      message:
        'Route not found',
      path:
        req.originalUrl,
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
      'Models folder: NOT USED'
    );

    console.log(
      'Well-known folder: USED'
    );

    console.log(
      '===================================='
    );
  }
);
