const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// KONFIGURASI DATABASE (Hanya ada di server)
const FIREBASE_DB_URL = "https://miningtransaction-default-rtdb.asia-southeast1.firebasedatabase.app";

// Inisialisasi Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        databaseURL: FIREBASE_DB_URL
    });
}

const db = admin.database();

// Endpoint API untuk mengambil data tema
app.get('/api/get-themes', async (req, res) => {
    try {
        const ref = db.ref('apps/');
        const snapshot = await ref.once('value');
        const data = snapshot.val();
        
        // Kirim data ke frontend
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Melayani file statis index.html
app.use(express.static(path.join(__dirname, '../')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

module.exports = app;
