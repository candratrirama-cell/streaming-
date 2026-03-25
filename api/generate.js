import axios from 'axios';
import admin from 'firebase-admin';

// (Inisialisasi Admin SDK sama seperti di atas)

export default async function handler(req, res) {
    const { uid, nominal } = req.query;
    const HOKTO_KEY = "91b24c8aeb3d364a80742a847797553b";

    try {
        // 1. Panggil Hokto
        const hoktoRes = await axios.post("https://hokto.my.id/produksi/payment/?api=create_qris", {
            amount: parseInt(nominal),
            partnerReferenceNo: `RPY-${Date.now()}`
        }, { headers: { "X-API-KEY": HOKTO_KEY } });

        // 2. Logic: Jika bayar sukses (simulasi), tambah saldo di Firebase
        // Di real world, ini biasanya pakai Webhook/Callback dari Hokto
        const userRef = admin.database().ref(`users/${uid}/balance`);
        await userRef.transaction((current) => (current || 0) + parseInt(nominal));

        res.status(200).json(hoktoRes.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
