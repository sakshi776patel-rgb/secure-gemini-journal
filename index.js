const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API (Key humari secure .env file se aayegi)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Health Check API (Cloud Run ko check karne ke liye ki server zinda hai)
app.get('/', (req, res) => {
    res.send("Secure Gemini Journal Backend is Running! 🚀");
});

// Demo Chat API Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        res.json({ reply: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
});