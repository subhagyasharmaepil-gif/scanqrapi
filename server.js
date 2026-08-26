const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.epil.teacherquiz';

// ------------------------------------
// QR URL
// https://ever.com/q/1212612
// ------------------------------------
app.get('/q/:id', (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!/^\d+$/.test(id)) {
    return res.status(400).send('Invalid QR code');
  }

  // Normal phone camera
  return res.redirect(PLAY_STORE_URL);
});

// ------------------------------------
// 3D MODEL API
// GET /model/1212612
// ------------------------------------
app.get('/model/:id', (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid model ID',
    });
  }

  return res.json({
    success: true,
    id: id,
    modelUrl: `https://api.ever.com/${id}.glb`,
  });
});

app.listen(PORT, () => {
  console.log(`Ever API running on port ${PORT}`);
});
