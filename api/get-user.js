import admin from 'firebase-admin';
// (Inisialisasi Admin SDK)

export default async function handler(req, res) {
    const { uid } = req.query;
    const snapshot = await admin.database().ref(`users/${uid}`).once('value');
    res.status(200).json(snapshot.val());
}
