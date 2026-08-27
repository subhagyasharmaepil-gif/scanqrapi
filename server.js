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
// WELL-KNOWN
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
// STARTUP
// ==================================================

console.log('====================================');
console.log('EVER 3D API');
console.log('====================================');

console.log(
  'Current directory:',
  __dirname
);

console.log(
  'Well-known folder:',
  wellKnownPath
);

console.log(
  'Well-known exists:',
  fs.existsSync(wellKnownPath)
);

console.log(
  'assetlinks.json exists:',
  fs.existsSync(assetLinksPath)
);

console.log(
  'apple-app-site-association exists:',
  fs.existsSync(aasaPath)
);

console.log('====================================');

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
// ANDROID APP LINKS
//
// https://scanqrapi.onrender.com/.well-known/assetlinks.json
// ==================================================

app.get(
  '/.well-known/assetlinks.json',
  (req, res) => {

    console.log(
      'Android assetlinks requested'
    );

    if (!fs.existsSync(assetLinksPath)) {
      return res.status(404).json({
        success: false,
        message:
          'assetlinks.json not found',
      });
    }

    res.setHeader(
      'Content-Type',
      'application/json'
    );

    return res.sendFile(
      assetLinksPath
    );
  }
);

// ==================================================
// IOS UNIVERSAL LINKS
//
// https://scanqrapi.onrender.com/.well-known/apple-app-site-association
// ==================================================

app.get(
  '/.well-known/apple-app-site-association',
  (req, res) => {

    console.log(
      'iOS AASA requested'
    );

    if (!fs.existsSync(aasaPath)) {
      return res.status(404).json({
        success: false,
        message:
          'apple-app-site-association not found',
      });
    }

    res.setHeader(
      'Content-Type',
      'application/json'
    );

    return res.sendFile(
      aasaPath
    );
  }
);

// ==================================================
// QR DEEP LINK
//
// QR EXAMPLES:
//
// https://scanqrapi.onrender.com/q/360view.jpg
//
// https://scanqrapi.onrender.com/q/360view.png
//
// https://scanqrapi.onrender.com/q/heart.glb
//
// https://scanqrapi.onrender.com/q/12345.jpg
//
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
      'Full URL:',
      `${BASE_URL}/q/${id}`
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
    // FILE EXTENSION
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

    // ==================================================
    // ALLOWED FILE TYPES
    // ==================================================

    if (
      !isJpg &&
      !isJpeg &&
      !isPng &&
      !isGlb
    ) {

      console.log(
        'Unsupported file type:',
        id
      );

      return redirectToStore(
        req,
        res
      );
    }

    // ==================================================
    // VALID QR
    // ==================================================

    console.log(
      'Valid QR:',
      id
    );

    // ==================================================
    // IMPORTANT
    //
    // DO NOT send JSON.
    //
    // DO NOT send the Evergreen file.
    //
    // DO NOT use /models.
    //
    // If the application is installed:
    //
    // iOS Universal Links / Android App Links
    // should open the Flutter application BEFORE
    // this fallback redirect is used.
    //
    // If the application is NOT installed:
    //
    // browser reaches this route and gets sent
    // to the appropriate store.
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

    console.log(
      '404:',
      req.originalUrl
    );

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
      'Models folder: NOT USED'
    );

    console.log(
      '===================================='
    );
  }
);
