const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// ==================================================
// SERVER
// ==================================================

const PORT = process.env.PORT || 3000;

const BASE_URL =
  'https://scanqrapi.onrender.com';

// ==================================================
// EVERGREEN FILE BASE URL
//
// Example:
//
// https://evergreenpublications.in/Downloads/demo/360view.jpg
//
// ==================================================

const FILE_BASE_URL =
  'https://evergreenpublications.in/Downloads/demo';

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
  path.join(
    __dirname,
    '.well-known'
  );

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
  'Port:',
  PORT
);

console.log(
  'Base URL:',
  BASE_URL
);

console.log(
  'File Base URL:',
  FILE_BASE_URL
);

console.log(
  'Well-known folder:',
  fs.existsSync(
    wellKnownPath
  )
);

console.log(
  'assetlinks.json:',
  fs.existsSync(
    assetLinksPath
  )
);

console.log(
  'apple-app-site-association:',
  fs.existsSync(
    aasaPath
  )
);

console.log(
  'Models folder: NOT USED'
);

console.log(
  '===================================='
);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
  '/',
  (req, res) => {

    return res.json({
      success: true,

      message:
        'Ever 3D API is running',

      baseUrl:
        BASE_URL,

      fileBaseUrl:
        FILE_BASE_URL,

      models:
        'NOT USED',
    });
  }
);

// ==================================================
// ANDROID APP LINKS
//
// GET:
//
// /.well-known/assetlinks.json
//
// ==================================================

app.get(
  '/.well-known/assetlinks.json',
  (req, res) => {

    console.log(
      'Android assetlinks requested'
    );

    if (
      !fs.existsSync(
        assetLinksPath
      )
    ) {

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
// GET:
//
// /.well-known/apple-app-site-association
//
// ==================================================

app.get(
  '/.well-known/apple-app-site-association',
  (req, res) => {

    console.log(
      'iOS AASA requested'
    );

    if (
      !fs.existsSync(
        aasaPath
      )
    ) {

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
// ANY FILE NAME IS ACCEPTED
//
// Examples:
//
// /q/360view.jpg
// /q/360view.png
// /q/heart.glb
// /q/book123.jpeg
// /q/abc.glb
//
// ==================================================

app.get(
  '/q/:filename',
  (req, res) => {

    const filename =
      req.params.filename;

    console.log(
      '===================================='
    );

    console.log(
      'QR REQUEST:',
      filename
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
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('..')
    ) {

      console.log(
        'Invalid filename:',
        filename
      );

      return redirectToStore(
        req,
        res
      );
    }

    // ==================================================
    // FILE EXTENSION
    // ==================================================

    const lowerFilename =
      filename.toLowerCase();

    const isJpg =
      lowerFilename.endsWith(
        '.jpg'
      );

    const isJpeg =
      lowerFilename.endsWith(
        '.jpeg'
      );

    const isPng =
      lowerFilename.endsWith(
        '.png'
      );

    const isGlb =
      lowerFilename.endsWith(
        '.glb'
      );

    // ==================================================
    // SUPPORTED FILE
    // ==================================================

    if (
      isJpg ||
      isJpeg ||
      isPng ||
      isGlb
    ) {

      console.log(
        'Valid QR file:',
        filename
      );

      // ==================================================
      // IMPORTANT
      //
      // DO NOT REDIRECT TO FILE HERE.
      //
      // Universal Links / App Links need to use
      // this /q/ URL.
      //
      // If the app is installed:
      //
      // iOS / Android opens Flutter app.
      //
      // Flutter receives:
      //
      // 360view.jpg
      //
      // Flutter then creates:
      //
      // https://evergreenpublications.in/
      // Downloads/demo/360view.jpg
      //
      // ==================================================

      return redirectToStore(
        req,
        res
      );
    }

    // ==================================================
    // UNSUPPORTED FILE
    // ==================================================

    console.log(
      'Unsupported file:',
      filename
    );

    return redirectToStore(
      req,
      res
    );
  }
);

// ==================================================
// FILE INFORMATION API
//
// OPTIONAL
//
// GET:
//
// /file/360view.jpg
//
// Response contains Evergreen URL.
//
// ==================================================

app.get(
  '/file/:filename',
  (req, res) => {

    const filename =
      req.params.filename;

    // ==================================================
    // SECURITY
    // ==================================================

    if (
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('..')
    ) {

      return res.status(400).json({
        success: false,

        message:
          'Invalid filename',
      });
    }

    // ==================================================
    // EVERGREEN URL
    // ==================================================

    const fileUrl =
      FILE_BASE_URL +
      '/' +
      encodeURIComponent(
        filename
      );

    console.log(
      'File URL:',
      fileUrl
    );

    return res.json({

      success: true,

      filename:
        filename,

      fileUrl:
        fileUrl,
    });
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
      `File Base URL: ${FILE_BASE_URL}`
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
