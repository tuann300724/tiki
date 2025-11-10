require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
app.use(cors());

const app = express();
app.use(express.json());

const TIKI_CHECKOUT_URL = 'https://tiki.vn/api/v2/checkout/virtual';
const ACCESS_TOKEN = process.env.TIKI_ACCESS_TOKEN;
const GUEST_TOKEN = process.env.TIKI_GUEST_TOKEN || '';
const EMAIL = process.env.TIKI_EMAIL || 'tuann300724@gmail.com';

// ✅ Route front-end HTML
app.get('/', (req, res) => {
    res.send(`
    <!doctype html>
    <html lang="vi">
    <head>
      <meta charset="utf-8"/>
      <title>Tiki MoMo Pay</title>
     <style>
    :root {
      --main-color: #ff4081;
      --bg-light: #fff7f9;
      --text-dark: #222;
    }
    body {
      font-family: 'Poppins', Arial, sans-serif;
      background: var(--bg-light);
      color: var(--text-dark);
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    header {
      text-align: center;
      padding: 30px 20px 10px;
    }
    .logo {
      width: 90px;
      height: 90px;
      background: #eee;
      border-radius: 50%;
      margin: 0 auto 15px;
      background-size: cover;
      background-position: center;
      /* 🖼️ bạn chỉ cần đổi URL hình logo ở đây */
    background-image: url('https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Circle.png');
    }
    h1 { font-size: 1.5rem; margin-bottom: 6px; }
    h2 { font-size: 1rem; color: #666; margin: 0 0 25px; }

    .illustration {
      width: 100%;
      max-width: 320px;
      height: 180px;
      margin: 0 auto 25px;
      border-radius: 16px;
      background: #f0f0f0;
      background-size: cover;
      background-position: center;
      /* 🖼️ chỗ này bạn chèn hình minh hoạ "ông trùm rút VTS" */
   background-image: url('https://scontent.fsgn2-6.fna.fbcdn.net/v/t39.30808-6/503999165_2782095978652295_3148674311317614257_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=t7uAa4gSJcQQ7kNvwHtwhhX&_nc_oc=Adkzmy40pt60nvNpuiSJwcCz1HSO1yxZfCrWeywONtMEpImfl5mvzI8nGjwZfVvpEw7WM74yBzq5tvct7WgZolEN&_nc_zt=23&_nc_ht=scontent.fsgn2-6.fna&_nc_gid=XqYAIRUIaPbYiFbJ23LCBg&oh=00_AfierMg--vz78j7aZq5rMSHZNBq2z-qTNLd7FFHzewitMA&oe=6917C688');
    }

    .btn-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 100%;
      max-width: 300px;
      margin-bottom: 40px;
    }

    button {
      padding: 15px 25px;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      background: var(--main-color);
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(255,64,129,0.3);
      transition: all 0.2s ease;
    }
    button:hover { background: #ff5c96; transform: scale(1.03); }

    footer {
      font-size: 0.9rem;
      color: #999;
      text-align: center;
      margin-top: auto;
      padding-bottom: 15px;
    }

    /* Popup xác nhận */
    .popup {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .popup-content {
      background: white;
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      width: 85%;
      max-width: 300px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    .popup h3 {
      margin-bottom: 20px;
      font-size: 1.1rem;
    }
    .popup button {
      margin: 8px;
      width: 45%;
      font-size: 1rem;
    }

    /* Loading overlay */
    .loading {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(255,255,255,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 200;
      font-size: 1.2rem;
      color: var(--main-color);
      font-weight: 600;
    }
    .spinner {
      border: 4px solid #eee;
      border-top: 4px solid var(--main-color);
      border-radius: 50%;
      width: 40px; height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    @media (min-width: 768px) {
      h1 { font-size: 2rem; }
      .illustration { height: 220px; }
    }
  </style>
    </head>
    <body>
    <header>
  <div class="logo"></div>
  <h1>Ông Trùm Rút VTS</h1>
  <h2>Thanh toán MoMo Tiki</h2>
</header>

<div class="illustration"></div>

<div class="btn-container">
  <button onclick="confirmPay(1559413,'50.000đ')">💸 Thanh toán 50.000đ</button>
  <button onclick="confirmPay(1559417,'100.000đ')">💸 Thanh toán 100.000đ</button>
  <button onclick="confirmPay(1559583,'200.000đ')">💸 Thanh toán 200.000đ</button>
</div>

<footer>© 2025 Ông Trùm Rút VTS - Bản quyền giữ toàn bộ</footer>

<div class="popup" id="confirmPopup">
  <div class="popup-content">
    <h3 id="popupMessage">Bạn có chắc muốn thanh toán?</h3>
    <div>
      <button id="confirmYes">Có</button>
      <button id="confirmNo" style="background:#ccc;color:#333;">Hủy</button>
    </div>
  </div>
</div>

<div class="loading" id="loading">
  <div class="spinner"></div>
  Đang tạo link thanh toán...
</div>

      <script>
        let selectedProductId = null;

        function confirmPay(product_id,label){
          selectedProductId = product_id;
          if(!confirm('Bạn có chắc muốn thanh toán '+label+'?')) return;
          document.getElementById('loading').style.display='flex';

          fetch('https://tiki-ffkp.onrender.com/tiki-create',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({product_id:selectedProductId,qty:1})
          }).then(res=>res.json())
          .then(data=>{
            if(data?.tikiData?.redirect_url){
              window.location.href = data.tikiData.redirect_url;
            } else alert('Không tạo được link thanh toán');
          })
          .catch(err=>alert('Lỗi: '+err.message))
          .finally(()=>document.getElementById('loading').style.display='none');
        }
      </script>
    </body>
    </html>
  `);
});

// ✅ API tạo thanh toán MoMo
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
        res.json({ status: tikiResp.status, tikiData: tikiResp.data });

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: err.message, detail: err.response?.data || null });
    }
});

// ✅ Trang thành công
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

// ✅ Khởi chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
