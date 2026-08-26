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

const assetLinksPath = path.join(
  wellKnownPath,
  'assetlinks.json'
);

const aasaPath = path.join(
  wellKnownPath,
  'apple-app-site-association'
);

// ==================================================
// DEBUG PATHS
// ==================================================

console.log('====================================');
console.log('SERVER PATHS');
console.log('====================================');
console.log('Current directory:', __dirname);
console.log('Models path:', modelsPath);
console.log('Well-known path:', wellKnownPath);
console.log('assetlinks path:', assetLinksPath);
console.log('AASA path:', aasaPath);
console.log(
  'Models folder exists:',
  fs.existsSync(modelsPath)
);
console.log(
  'Well-known folder exists:',
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
// STATIC MODEL FILES
// ==================================================
//
// models/
// ├── 360view.jpg
// ├── 360view.png
// ├── 1212612.glb
// ├── 1212612.jpg
// └── 1212612.png
//
// URLs:
//
// https://scanqrapi.onrender.com/models/360view.jpg
// https://scanqrapi.onrender.com/models/1212612.glb
//

app.use(
  '/models',
  express.static(modelsPath)
);

// ==================================================
// WELL-KNOWN
// ==================================================
//
// Android:
// /.well-known/assetlinks.json
//
// iOS:
// /.well-known/apple-app-site-association
//

app.use(
  '/.well-known',
  express.static(wellKnownPath, {
    setHeaders: (res, filePath) => {
      if (
        filePath.endsWith('assetlinks.json') ||
        filePath.endsWith(
          'apple-app-site-association'
        )
      ) {
        res.setHeader(
          'Content-Type',
          'application/json'
        );
      }
    },
  })
);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ever 3D API is running',

    files: {
      modelsFolder: fs.existsSync(
        modelsPath
      ),

      wellKnownFolder: fs.existsSync(
        wellKnownPath
      ),

      assetlinksJson: fs.existsSync(
        assetLinksPath
      ),

      appleAppSiteAssociation: fs.existsSync(
        aasaPath
      ),
    },
  });
});

// ==================================================
// ANDROID APP LINKS
// ==================================================
//
// GET:
// /.well-known/assetlinks.json
//
// ==================================================

app.get(
  '/.well-known/assetlinks.json',
  (req, res) => {
    if (!fs.existsSync(assetLinksPath)) {
      return res.status(404).json({
        success: false,
        message: 'assetlinks.json not found',
        path: assetLinksPath,
      });
    }

    res.setHeader(
      'Content-Type',
      'application/json'
    );

    return res.sendFile(assetLinksPath);
  }
);

// ==================================================
// IOS UNIVERSAL LINKS
// ==================================================
//
// GET:
// /.well-known/apple-app-site-association
//
// ==================================================

app.get(
  '/.well-known/apple-app-site-association',
  (req, res) => {
    if (!fs.existsSync(aasaPath)) {
      return res.status(404).json({
        success: false,
        message:
          'apple-app-site-association not found',
        path: aasaPath,
      });
    }

    res.setHeader(
      'Content-Type',
      'application/json'
    );

    return res.sendFile(aasaPath);
  }
);

// ==================================================
// QR LINK
// ==================================================
//
// QR:
//
// https://scanqrapi.onrender.com/q/1212612
//
// Installed app:
//      iOS / Android intercepts the link
//
// App not installed:
//      Browser reaches this endpoint
//      and redirects to the store
//
// ==================================================

app.get('/q/:id', (req, res) => {
  const { id } = req.params;

  // ----------------------------------------------
  // Validate ID
  // ----------------------------------------------

  if (!/^\d+$/.test(id)) {
    return redirectToStore(req, res);
  }

  console.log(
    `QR request received for ID: ${id}`
  );

  // ----------------------------------------------
  // Check model files
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

  const hasGlb =
    fs.existsSync(glbPath);

  const hasJpg =
    fs.existsSync(jpgPath);

  const hasPng =
    fs.existsSync(pngPath);

  console.log({
    id,
    hasGlb,
    hasJpg,
    hasPng,
  });

  // ----------------------------------------------
  // No model
  // ----------------------------------------------

  if (!hasGlb && !hasJpg && !hasPng) {
    return redirectToStore(req, res);
  }

  // ----------------------------------------------
  // App Links / Universal Links
  //
  // If the app is installed and correctly
  // configured, the OS opens the app before
  // this browser redirect happens.
  //
  // If the app isn't installed, this fallback
  // sends the user to the correct store.
  // ----------------------------------------------

  return redirectToStore(req, res);
});

// ==================================================
// MODEL API
// ==================================================
//
// GET:
// https://scanqrapi.onrender.com/model/1212612
//
// ==================================================

app.get('/model/:id', (req, res) => {
  const { id } = req.params;

  // ----------------------------------------------
  // Validate ID
  // ----------------------------------------------

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid model ID',
    });
  }

  const files = {};

  // ----------------------------------------------
  // GLB
  // ----------------------------------------------

  const glbPath = path.join(
    modelsPath,
    `${id}.glb`
  );

  if (fs.existsSync(glbPath)) {
    files.modelUrl =
      `${BASE_URL}/models/${id}.glb`;
  }

  // ----------------------------------------------
  // JPG
  // ----------------------------------------------

  const jpgPath = path.join(
    modelsPath,
    `${id}.jpg`
  );

  if (fs.existsSync(jpgPath)) {
    files.jpgUrl =
      `${BASE_URL}/models/${id}.jpg`;
  }

  // ----------------------------------------------
  // PNG
  // ----------------------------------------------

  const pngPath = path.join(
    modelsPath,
    `${id}.png`
  );

  if (fs.existsSync(pngPath)) {
    files.pngUrl =
      `${BASE_URL}/models/${id}.png`;
  }

  // ----------------------------------------------
  // 360 IMAGE
  // ----------------------------------------------

  const view360JpgPath = path.join(
    modelsPath,
    '360view.jpg'
  );

  if (fs.existsSync(view360JpgPath)) {
    files.view360Url =
      `${BASE_URL}/models/360view.jpg`;
  }

  // ----------------------------------------------
  // 360 PNG
  // ----------------------------------------------

  const view360PngPath = path.join(
    modelsPath,
    '360view.png'
  );

  if (fs.existsSync(view360PngPath)) {
    files.view360PngUrl =
      `${BASE_URL}/models/360view.png`;
  }

  // ----------------------------------------------
  // NO FILES
  // ----------------------------------------------

  if (
    Object.keys(files).length === 0
  ) {
    return res.status(404).json({
      success: false,
      message: 'No files found for this model',
      id: id,
    });
  }

  // ----------------------------------------------
  // RESPONSE
  // ----------------------------------------------

  return res.json({
    success: true,
    id: id,
    ...files,
  });
});

// ==================================================
// STORE REDIRECT
// ==================================================

function redirectToStore(req, res) {
  const userAgent =
    req.headers['user-agent'] || '';

  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent);

  const isAndroid =
    /Android/i.test(userAgent);

  console.log(
    'User Agent:',
    userAgent
  );

  // ----------------------------------------------
  // iOS
  // ----------------------------------------------

  if (isIOS) {
    console.log(
      'Redirecting to Apple App Store'
    );

    return res.redirect(
      302,
      IOS_APP_STORE_URL
    );
  }

  // ----------------------------------------------
  // Android
  // ----------------------------------------------

  if (isAndroid) {
    console.log(
      'Redirecting to Google Play Store'
    );

    return res.redirect(
      302,
      ANDROID_PLAY_STORE_URL
    );
  }

  // ----------------------------------------------
  // Desktop / unknown
  //
  // Default to Android Play Store
  // ----------------------------------------------

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
      `Models: ${modelsPath}`
    );

    console.log(
      `Well Known: ${wellKnownPath}`
    );

    console.log(
      '===================================='
    );
  }
);
