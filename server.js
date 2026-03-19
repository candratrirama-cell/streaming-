const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config(); // Mengambil data dari .env

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Folder untuk index.html

// Ambil variabel dari .env
const { SANDI_MASTER, FIREBASE_URL, AUTH_TOKEN, PORT } = process.env;

// 1. API LOGIN
app.post('/api/login', (req, res) => {
    const { sandi } = req.body;
    if (sandi === SANDI_MASTER) {
        res.json({ status: 'success', token: AUTH_TOKEN });
    } else {
        res.status(401).json({ status: 'fail', msg: 'SANDI SALAH!' });
    }
});

// 2. MIDDLEWARE PROTEKSI (Cek Token)
const checkAuth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === AUTH_TOKEN) {
        next();
    } else {
        res.status(403).json({ msg: 'Akses Ditolak' });
    }
};

// 3. API PUBLISH
app.post('/api/publish', checkAuth, async (req, res) => {
    const { slug, content } = req.body;
    const cleanSlug = slug.replace(/[^a-z0-9\-]/g, '').toLowerCase();

    try {
        await axios.put(`${FIREBASE_URL}/sites/${cleanSlug}.json`, {
            content: content,
            time: new Date().toLocaleString('id-ID'),
            views: 0
        });
        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ msg: 'Gagal ke Firebase' });
    }
});

// 4. API LIST
app.get('/api/list', checkAuth, async (req, res) => {
    try {
        const response = await axios.get(`${FIREBASE_URL}/sites.json`);
        res.json(response.data || {});
    } catch (err) {
        res.json({});
    }
});

// 5. API DELETE
app.delete('/api/delete/:key', checkAuth, async (req, res) => {
    try {
        await axios.delete(`${FIREBASE_URL}/sites/${req.params.key}.json`);
        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).send('Gagal hapus');
    }
});

app.listen(PORT, () => console.log(`Server nyala di http://localhost:${PORT}`));
