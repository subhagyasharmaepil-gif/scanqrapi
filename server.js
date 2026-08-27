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
// APP STORE LINKS
// ==================================================

const ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.epil.teacherquiz';

const IOS_APP_STORE_URL =
  'https://apps.apple.com/in/app/evergreen-e-learning/id1488785145';

// ==================================================
// ACTUAL FILE SERVER
// ==================================================

const FILE_BASE_URL =
  'https://evergreenpublications.in/Downloads/demo';

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
  'Well-known directory:',
  wellKnownPath
);

console.log(
  'Well-known exists:',
  fs.existsSync(wellKnownPath)
);

console.log(
  'AASA:',
  aasaPath
);

console.log(
  'AASA exists:',
  fs.existsSync(aasaPath)
);

console.log(
  'AssetLinks:',
  assetLinksPath
);

console.log(
  'AssetLinks exists:',
  fs.existsSync(assetLinksPath)
);

console.log('====================================');

// ==================================================
// HEALTH CHECK
// ==================================================

app.get('/', (req, res) => {

  return res.json({
    success: true,
    message: 'Ever 3D API is running',

    config: {
      baseUrl: BASE_URL,
      fileBaseUrl: FILE_BASE_URL,
    },

    wellKnown: {
      folderExists:
        fs.existsSync(wellKnownPath),

      assetLinksExists:
        fs.existsSync(assetLinksPath),

      aasaExists:
        fs.existsSync(aasaPath),
    },
  });
});

// ==================================================
// IOS AASA
//
// IMPORTANT:
//
// We send the file contents directly.
// Do NOT use sendFile().
//
// URL:
//
// https://scanqrapi.onrender.com/.well-known/apple-app-site-association
// ==================================================

app.get(
  '/.well-known/apple-app-site-association',
  (req, res) => {

    console.log(
      '===================================='
    );

    console.log(
      'AASA REQUEST'
    );

    console.log(
      'AASA PATH:',
      aasaPath
    );

    console.log(
      'AASA EXISTS:',
      fs.existsSync(aasaPath)
    );

    console.log(
      '===================================='
    );

    if (!fs.existsSync(aasaPath)) {

      console.log(
        'AASA FILE NOT FOUND'
      );

      return res.status(404).send(
        'apple-app-site-association not found'
      );
    }

    try {

      const aasaContent =
        fs.readFileSync(
          aasaPath,
          'utf8'
        );

      res.setHeader(
        'Content-Type',
        'application/json'
      );

      res.setHeader(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      );

      return res.status(200).send(
        aasaContent
      );

    } catch (error) {

      console.error(
        'AASA READ ERROR:',
        error
      );

      return res.status(500).send(
        'Unable to read AASA file'
      );
    }
  }
);

// ==================================================
// ANDROID ASSET LINKS
//
// URL:
//
// https://scanqrapi.onrender.com/.well-known/assetlinks.json
// ==================================================

app.get(
  '/.well-known/assetlinks.json',
  (req, res) => {

    console.log(
      '===================================='
    );

    console.log(
      'ASSETLINKS REQUEST'
    );

    console.log(
      'ASSETLINKS PATH:',
      assetLinksPath
    );

    console.log(
      'ASSETLINKS EXISTS:',
      fs.existsSync(assetLinksPath)
    );

    console.log(
      '===================================='
    );

    if (!fs.existsSync(assetLinksPath)) {

      return res.status(404).send(
        'assetlinks.json not found'
      );
    }

    try {

      const content =
        fs.readFileSync(
          assetLinksPath,
          'utf8'
        );

      res.setHeader(
        'Content-Type',
        'application/json'
      );

      res.setHeader(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      );

      return res.status(200).send(
        content
      );

    } catch (error) {

      console.error(
        'AssetLinks read error:',
        error
      );

      return res.status(500).send(
        'Unable to read assetlinks.json'
      );
    }
  }
);

// ==================================================
// QR DEEP LINK
//
// Examples:
//
// /q/360view.jpg
// /q/360view.png
// /q/heart.glb
// /q/12345.glb
//
// ==================================================

app.get(
  '/q/:id',
  (req, res) => {

    const { id } = req.params;

    console.log(
      '===================================='
    );

    console.log(
      'QR REQUEST'
    );

    console.log(
      'ID:',
      id
    );

    console.log(
      'URL:',
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
        'Invalid filename'
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

    // ==================================================
    // ONLY ALLOW THESE FILE TYPES
    // ==================================================

    if (
      !isJpg &&
      !isJpeg &&
      !isPng &&
      !isGlb
    ) {

      console.log(
        'Unsupported QR file:',
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
      'VALID QR:',
      id
    );

    // ==================================================
    // IMPORTANT
    //
    // DO NOT:
    //
    // res.json()
    //
    // DO NOT:
    //
    // redirect to FILE_BASE_URL
    //
    // The URL itself is the Universal Link.
    //
    // iOS will intercept:
    //
    // /q/360view.jpg
    //
    // when the app is installed.
    //
    // If iOS does NOT open the application,
    // this request reaches the server and we
    // redirect to App Store.
    //
    // ==================================================

    return redirectToStore(
      req,
      res
    );
  }
);

// ==================================================
// OPTIONAL FILE INFORMATION API
//
// This is NOT used by QR.
//
// /file/360view.jpg
//
// ==================================================

app.get(
  '/file/:id',
  (req, res) => {

    const { id } = req.params;

    if (
      id.includes('/') ||
      id.includes('\\') ||
      id.includes('..')
    ) {

      return res.status(400).json({
        success: false,
        message: 'Invalid filename',
      });
    }

    const fileUrl =
      `${FILE_BASE_URL}/${encodeURIComponent(id)}`;

    return res.json({
      success: true,
      id,
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
    'STORE REDIRECT:',
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
  // DESKTOP
  // ==================================================

  console.log(
    'Desktop → App Store'
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
      `File Base URL: ${FILE_BASE_URL}`
    );

    console.log(
      'Models static: DISABLED'
    );

    console.log(
      'AASA: ENABLED'
    );

    console.log(
      'Android App Links: ENABLED'
    );

    console.log(
      '===================================='
    );
  }
);
