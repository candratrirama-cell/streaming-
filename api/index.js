const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Ambil Config (Gunakan Process Env agar aman)
const SANDI_MASTER = process.env.SANDI_MASTER || "190713";
const FIREBASE_URL = process.env.FIREBASE_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN || "BKI_BOSS_SECRET_2026";

// API LOGIN
app.post('/api/login', (req, res) => {
    const { sandi } = req.body;
    if (sandi === SANDI_MASTER) {
        res.json({ status: 'success', token: AUTH_TOKEN });
    } else {
        res.status(401).json({ status: 'fail', msg: 'SANDI SALAH!' });
    }
});

// API PUBLISH
app.post('/api/publish', async (req, res) => {
    const token = req.headers['authorization'];
    if (token !== AUTH_TOKEN) return res.status(403).json({ msg: 'Forbidden' });

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

// API LIST
app.get('/api/list', async (req, res) => {
    const token = req.headers['authorization'];
    if (token !== AUTH_TOKEN) return res.status(403).json({ msg: 'Forbidden' });

    try {
        const response = await axios.get(`${FIREBASE_URL}/sites.json`);
        res.json(response.data || {});
    } catch (err) {
        res.json({});
    }
});

module.exports = app; // PENTING: Untuk Vercel Serverless
