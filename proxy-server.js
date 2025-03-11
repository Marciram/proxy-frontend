// proxy-server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: 'https://banbajio-frontend-753741223620.us-central1.run.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Proxy endpoint for Ollama
app.post('/api/chat', async (req, res) => {
  try {
    // Forward request to Ollama service
    const response = await fetch('https://ollama-bb-bot-753741223620.us-central1.run.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama service returned ${response.status}:`, errorText);
      return res.status(response.status).send(errorText);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying to Ollama:', error);
    res.status(500).json({ error: 'Failed to communicate with Ollama service' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
