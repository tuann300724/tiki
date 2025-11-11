require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();

// Cho phép trình duyệt gửi preflight request
app.options('*', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});


app.use(express.json());

// ==============================
// API TẠO THANH TOÁN TIKI MOMO
// ==============================
app.post('/tiki-create', async (req, res) => {
  try {
    const TIKI_CHECKOUT_URL = 'https://tiki.vn/api/v2/checkout/virtual';
    const ACCESS_TOKEN = process.env.TIKI_ACCESS_TOKEN;
    const GUEST_TOKEN = process.env.TIKI_GUEST_TOKEN || '';
    const EMAIL = process.env.TIKI_EMAIL || 'tuann300724@gmail.com';

    const { product_id, qty = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Thiếu product_id' });

    // Payload gửi lên Tiki
    const payload = {
      product_id: String(product_id),
      qty: Number(qty),
      gift_info: { message: "" },
      payment: { selected_payment_method: "momo", bank_code: "" },
      user_info: { email: EMAIL }
    };

    // Header bắt buộc cho Tiki API
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

    // Gửi request đến Tiki
    const tikiResp = await axios.post(TIKI_CHECKOUT_URL, payload, { headers });

    res.json({
      status: tikiResp.status,
      tikiData: tikiResp.data
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.message,
      detail: err.response?.data || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});