require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TIKI_CHECKOUT_URL = 'https://tiki.vn/api/v2/checkout/virtual';
const ACCESS_TOKEN = process.env.TIKI_ACCESS_TOKEN;
const GUEST_TOKEN = process.env.TIKI_GUEST_TOKEN || '';
const EMAIL = process.env.TIKI_EMAIL || 'tuann300724@gmail.com';

// ✅ Tạo thanh toán MoMo
app.post('/tiki-create', async (req, res) => {
  try {
    const { product_id, qty = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Thiếu product_id' });

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

    const tikiResp = await axios.post(TIKI_CHECKOUT_URL, payload, { headers, validateStatus: null });
    return res.status(200).json({
      status: tikiResp.status,
      tikiData: tikiResp.data
    });

  } catch (err) {
    console.error('❌ Lỗi khi tạo thanh toán:', err.response?.data || err.message);
    return res.status(500).json({
      error: err.message,
      detail: err.response?.data || null
    });
  }
});

// ✅ Trang thông báo thanh toán thành công
app.get('/success', (req, res) => {
  res.send(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Thanh toán thành công</title>
      <style>
        body { font-family: Arial; text-align:center; background:#f0fff4; padding:80px; }
        h1 { color:#2e7d32; }
        button {
          padding:12px 25px; margin-top:20px;
          font-size:18px; border:none; border-radius:8px;
          background:#1890ff; color:white; cursor:pointer;
        }
      </style>
    </head>
    <body>
      <h1>🎉 Thanh toán thành công!</h1>
      <p>Cảm ơn bạn đã thanh toán qua MoMo.</p>
      <button onclick="window.location.href='/'">Thanh toán tiếp</button>
    </body>
    </html>
  `);
});

// ✅ Khởi chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại https://tuann300724.github.io/tiki/`));
