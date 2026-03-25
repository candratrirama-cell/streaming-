export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { amount, balance } = req.body;
    
    const adminFee = 1000;
    const totalRequired = parseInt(amount) + adminFee;

    if (amount < 10000) return res.status(400).json({ status: false, msg: "Minimal 10rb" });
    if (balance < totalRequired) return res.status(400).json({ status: false, msg: "Saldo Kurang" });

    res.status(200).json({ status: true, total: totalRequired });
}
