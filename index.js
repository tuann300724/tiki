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
        body { font-family: Arial; text-align:center; padding:30px; }
        button { padding:15px 25px; margin:10px; cursor:pointer; }
        .loading { display:none; position:fixed; top:0; left:0; width:100%; height:100%; 
                   background:rgba(255,255,255,0.8); align-items:center; justify-content:center; }
      </style>
    </head>
    <body>
      <h1>Ông Trùm Rút VTS</h1>
      <h2>Thanh toán MoMo Tiki</h2>

      <button onclick="confirmPay(1559413,'50.000đ')">💸 Thanh toán 50.000đ</button>
      <button onclick="confirmPay(1559417,'100.000đ')">💸 Thanh toán 100.000đ</button>
      <button onclick="confirmPay(1559583,'200.000đ')">💸 Thanh toán 200.000đ</button>

      <div class="loading" id="loading">Đang tạo link thanh toán...</div>

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
    const { product_id, qty=1 } = req.body;
    if(!product_id) return res.status(400).json({error:'Thiếu product_id'});

    const payload = {
      product_id:String(product_id),
      qty:Number(qty),
      gift_info:{message:""},
      payment:{selected_payment_method:"momo",bank_code:""},
      user_info:{email:EMAIL}
    };

    const headers = {
      'Authorization':`Bearer ${ACCESS_TOKEN}`,
      'x-access-token':ACCESS_TOKEN,
      'x-guest-token':GUEST_TOKEN,
      'Content-Type':'application/json',
      'User-Agent':'Mozilla/5.0',
      'Referer':'https://tiki.vn/',
      'Origin':'https://tiki.vn',
      'Accept':'application/json'
    };

    const tikiResp = await axios.post(TIKI_CHECKOUT_URL,payload,{headers,validateStatus:null});
    res.json({status:tikiResp.status,tikiData:tikiResp.data});

  } catch(err){
    console.error(err.response?.data||err.message);
    res.status(500).json({error:err.message,detail:err.response?.data||null});
  }
});

// ✅ Trang thành công
app.get('/success',(req,res)=>{
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
const PORT = process.env.PORT||3000;
app.listen(PORT,()=>console.log(`Server chạy tại http://localhost:${PORT}`));
