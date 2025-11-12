require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();

// ✅ CORS cho mọi domain
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

// ==============================
// API Tạo thanh toán Tiki MoMo
// ==============================
app.post('/tiki-create', async (req, res) => {
  try {
    // ✅ Bước 1: Gọi API để lấy token động
    const tokenResp = await fetch('https://vannghimomo.onrender.com/api/token/tuan');
    const tokenData = await tokenResp.json();

    const ACCESS_TOKEN = tokenData.accessToken;
    const GUEST_TOKEN = tokenData.guestToken;

    // ✅ Kiểm tra token
    if (!ACCESS_TOKEN || !GUEST_TOKEN) {
      return res.status(500).json({ error: 'Không lấy được token từ API token/tuan' });
    }

    // ✅ Bước 2: Nhận dữ liệu từ client
    const { product_id, qty = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Thiếu product_id' });

    // ✅ Bước 3: Gửi request đến API Tiki
    const TIKI_CHECKOUT_URL = 'https://tiki.vn/api/v2/checkout/virtual';
    const EMAIL = process.env.EMAIL || 'tuann300724@gmail.com';

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
      'Referer': 'https://tiki.vn',
      'Origin': 'https://tiki.vn',
      'Accept': 'application/json'
    };

    const tikiResp = await axios.post(TIKI_CHECKOUT_URL, payload, { headers });

    // ✅ Bước 4: Trả dữ liệu về client
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

// ==============================
// Lắng nghe PORT từ Render
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
