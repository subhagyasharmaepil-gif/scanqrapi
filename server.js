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
// STATIC MODEL FILES
// ==================================================

app.use(
  '/models',
  express.static(modelsPath)
);

// ==================================================
// WELL-KNOWN
// ==================================================

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
// ANDROID ASSET LINKS
// ==================================================

app.get(
  '/.well-known/assetlinks.json',
  (req, res) => {
    if (!fs.existsSync(assetLinksPath)) {
      return res.status(404).json({
        success: false,
        message: 'assetlinks.json not found',
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
// IOS AASA
// ==================================================

app.get(
  '/.well-known/apple-app-site-association',
  (req, res) => {
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

    return res.sendFile(aasaPath);
  }
);

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
  // ALLOWED QR IDS
  // ==================================================

  const is360View =
    id === '360views';

  const isNumericId =
    /^\d+$/.test(id);

  // Invalid QR
  if (!is360View && !isNumericId) {
    console.log(
      'Invalid QR ID'
    );

    return redirectToStore(req, res);
  }

  // ==================================================
  // 360 VIEW
  // ==================================================

  if (is360View) {
    const imagePath = path.join(
      modelsPath,
      '360view.jpg'
    );

    if (!fs.existsSync(imagePath)) {
      console.log(
        '360view.jpg not found'
      );

      return redirectToStore(req, res);
    }

    console.log(
      '360 image exists'
    );

    // IMPORTANT:
    //
    // Do NOT redirect to the image here.
    //
    // iOS Universal Links / Android App Links
    // should intercept /q/360views when the
    // application is installed.
    //
    // If application is NOT installed,
    // browser reaches this route and gets
    // redirected to the correct store.

    return redirectToStore(req, res);
  }

  // ==================================================
  // NUMERIC MODEL
  // ==================================================

  if (isNumericId) {
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

    if (
      !hasGlb &&
      !hasJpg &&
      !hasPng
    ) {
      return redirectToStore(req, res);
    }

    return redirectToStore(req, res);
  }

  return redirectToStore(req, res);
});

// ==================================================
// MODEL API
//
// GET /model/1212612
// ==================================================
/*
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
  // 360 JPG
  // ==================================================

  const view360JpgPath = path.join(
    modelsPath,
    '360view.jpg'
  );

  if (fs.existsSync(view360JpgPath)) {
    files.view360Url =
      `${BASE_URL}/models/360view.jpg`;
  }

  // ==================================================
  // 360 PNG
  // ==================================================

  const view360PngPath = path.join(
    modelsPath,
    '360view.png'
  );

  if (fs.existsSync(view360PngPath)) {
    files.view360PngUrl =
      `${BASE_URL}/models/360view.png`;
  }

  // ==================================================
  // NO FILES
  // ==================================================

  if (
    Object.keys(files).length === 0
  ) {
    return res.status(404).json({
      success: false,
      message:
        'No files found for this model',
      id,
    });
  }

  // ==================================================
  // RESPONSE
  // ==================================================

  return res.json({
    success: true,
    id,
    ...files,
  });
}); */

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
