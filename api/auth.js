import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "paybase-1abbd",
            // Masukkan Private Key dari Firebase Console > Project Settings > Service Accounts
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: "firebase-adminsdk-xxxxx@paybase-1abbd.iam.gserviceaccount.com"
        }),
        databaseURL: "https://paybase-1abbd-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
}

const db = admin.database();

export default async function handler(req, res) {
    const { action, email, password, username, phone } = req.body;

    if (action === 'register') {
        const apiKey = Math.random().toString(36).substring(2, 15).toUpperCase();
        const userRef = db.ref('users').push();
        await userRef.set({ username, email, password, phone, apiKey, balance: 0, role: 'user' });
        return res.status(200).json({ status: true, msg: "Berhasil Daftar" });
    }

    if (action === 'login') {
        const snapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
        const userData = snapshot.val();
        if (userData) {
            const userId = Object.keys(userData)[0];
            if (userData[userId].password === password) {
                return res.status(200).json({ status: true, data: { ...userData[userId], uid: userId } });
            }
        }
        return res.status(401).json({ status: false, msg: "Email/Password Salah" });
    }
}
