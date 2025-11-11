require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// ✅ Bật CORS cho GET + POST
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token", "x-guest-token"]
}));

app.use(express.json());

// ==============================
// CONFIG
// ==============================
const TIKI_CHECKOUT_URL = 'https://tiki.vn/api/v2/checkout/virtual';
const ACCESS_TOKEN = process.env.TIKI_ACCESS_TOKEN;
const GUEST_TOKEN = process.env.TIKI_GUEST_TOKEN || '';
const EMAIL = process.env.TIKI_EMAIL || 'tuann300724@gmail.com';

// ==============================
// API TẠO THANH TOÁN
// ==============================
app.post('/tiki-create', async (req, res) => {
    try {
        const { product_id, qty = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ error: 'Thiếu product_id' });
        }

        const payload = {
            product_id: String(product_id),
            qty: Number(qty),
            gift_info: { message: "" },
            payment: { selected_payment_method: "momo", bank_code: "" },
            user_info: { email: EMAIL }
        };

        const headers = {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'x-access-token': ACCESS_TOKEN,
            'x-guest-token': GUEST_TOKEN,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://tiki.vn/',
            'Origin': 'https://tiki.vn',
            'Accept': 'application/json'
        };

        const tikiResp = await axios.post(TIKI_CHECKOUT_URL, payload, {
            headers,
            validateStatus: () => true
        });

        return res.json({
            status: tikiResp.status,
            tikiData: tikiResp.data
        });

    } catch (err) {
        console.error(err.response?.data || err.message);
        return res.status(500).json({
            error: err.message,
            detail: err.response?.data || null
        });
    }
});

// ==============================
// TRANG THÀNH CÔNG
// ==============================
app.get('/success', (req, res) => {
    res.send(`
        <!doctype html>
        <html>
            <head><meta charset="utf-8"/><title>Thanh toán thành công</title></head>
            <body style="text-align:center;padding:80px;font-family:Arial">
                <h1>🎉 Thanh toán thành công!</h1>
                <p>Cảm ơn bạn đã thanh toán qua MoMo.</p>
                <button onclick="window.location.href='/'">Thanh toán tiếp</button>
            </body>
        </html>
    `);
});

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
