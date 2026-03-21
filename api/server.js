const express = require('express');
const app = express();
const admin = require('firebase-admin');

// Inisialisasi Firebase Admin (Hanya sekali)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "broser-ff83e",
      // Penting: Gunakan Environment Variables di Vercel untuk Service Account
      clientEmail: "firebase-adminsdk-xxxxx@broser-ff83e.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: "https://broser-ff83e-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

const db = admin.database();
app.use(express.json());

// Endpoint Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === "Septina2209@") {
    res.json({ success: true, token: "SESSION_ACTIVE_OK" });
  } else {
    res.status(401).json({ success: false, message: "Password Salah" });
  }
});

// Endpoint Ambil Proyek
app.get('/api/projects', async (req, res) => {
  const snapshot = await db.ref('lockbase/projects').once('value');
  res.json(snapshot.val() || {});
});

// Endpoint Tambah Proyek
app.post('/api/projects', async (req, res) => {
  const newProj = req.body;
  const projectID = Math.random().toString(36).substring(2, 10).toUpperCase();
  await db.ref('lockbase/projects/' + projectID).set({
    ...newProj,
    id: projectID,
    endpoint: `https://lockbase.vercel.app/api/${projectID}`
  });
  res.json({ success: true, id: projectID });
});

module.exports = app;
