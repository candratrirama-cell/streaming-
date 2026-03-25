import axios from 'axios';

export default async function handler(req, res) {
    const { apikey, nominal } = req.query;
    const HOKTO_KEY = "91b24c8aeb3d364a80742a847797553b";

    if (!apikey || !nominal) {
        return res.status(400).json({ status: false, msg: "Missing Params" });
    }

    try {
        const response = await axios.post("https://hokto.my.id/produksi/payment/?api=create_qris", {
            amount: parseInt(nominal),
            partnerReferenceNo: `RPY-${Date.now()}-${apikey.slice(0, 4)}`
        }, {
            headers: { "X-API-KEY": HOKTO_KEY }
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ status: false, msg: "Hokto Error" });
    }
}
