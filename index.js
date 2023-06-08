const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const app = express();
const port = process.env.PORT || 4000;

// middlewarwe

app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('Pot is boiling')
})

app.listen(port, ()=>{
    console.log('Pot is boiling on port:', port);
})