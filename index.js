require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// CORS cho tất cả
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization");
  next();
});

app.options('*',(req,res)=>res.sendStatus(200));

// API tạo thanh toán
app.post('/tiki-create', async (req,res)=>{
  try {
    const { product_id, qty=1 } = req.body;
    if(!product_id) return res.status(400).json({error:'Thiếu product_id'});

    const payload = {
      product_id:String(product_id),
      qty:Number(qty),
      gift_info:{message:""},
      payment:{selected_payment_method:"momo",bank_code:""},
      user_info:{email:process.env.TIKI_EMAIL}
    };

    const headers = {
      'Authorization':`Bearer ${process.env.TIKI_ACCESS_TOKEN}`,
      'x-access-token':process.env.TIKI_ACCESS_TOKEN,
      'x-guest-token':process.env.TIKI_GUEST_TOKEN||'',
      'Content-Type':'application/json',
      'User-Agent':'Mozilla/5.0',
      'Referer':'https://tiki.vn/',
      'Origin':'https://tiki.vn',
      'Accept':'application/json'
    };

    const tikiResp = await axios.post('https://tiki.vn/api/v2/checkout/virtual', payload, {headers});
    res.json({status:tikiResp.status,tikiData:tikiResp.data});

  } catch(err) {
    console.error(err.response?.data||err.message);
    res.status(err.response?.status||500).json({error:err.message,detail:err.response?.data||null});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`✅ Server chạy tại http://localhost:${PORT}`));
