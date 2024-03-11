const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = 10101 ;

const { API_KEY_GEMINI, START_CHAT, GENERATION_CONFIG } = require('./config');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const app = express();


app.use(bodyParser.json()); 
app.use(cors({
    origin: 'http://localhost:5173'
  }));

app.get('/chat', (req, res) => {
    res.send('GET request to /api/chat');
});
  

app.post('/chat', async (req, res) => {
    let history = req.body.history;
    let question = req.body.question;
    let historyChat = START_CHAT.concat(history)
    const chat = model.startChat({
        history: historyChat,
        generationConfig: GENERATION_CONFIG
    });
    const sendQuestion = await chat.sendMessage(question);
    const response = await sendQuestion.response;
    const text = response.text();
    history.push({ role: "user", parts: question });
    history.push({ role: "model", parts: text });
    return res.status(200).json({ history: history });
});

app.listen(port, () => {
    console.log(`SERVER LISTEN ON PORT : ${port}`);
});
