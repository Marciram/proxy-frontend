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

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).send('Proxy server is running');
});

// Proxy endpoint for Ollama
app.post('/api/chat', async (req, res) => {
  console.log('Received request from frontend to /api/chat');
  console.log('Request body:', JSON.stringify(req.body));
  
  try {
    const ollama_url = 'https://ollama-bb-bot-753741223620.us-central1.run.app/api/chat';
    console.log(`Forwarding request to Ollama at: ${ollama_url}`);
    
    // Forward request to Ollama service
    const response = await fetch(ollama_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body),
      // Add timeout to prevent hanging
      timeout: 30000
    });
    
    console.log(`Ollama response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama service returned ${response.status}:`, errorText);
      return res.status(response.status).send(errorText);
    }
    
    console.log('Successfully received response from Ollama');
    const data = await response.json();
    console.log('Sending response back to frontend');
    res.json(data);
  } catch (error) {
    console.error('Error proxying to Ollama:', error);
    // More detailed error information
    res.status(500).json({ 
      error: 'Failed to communicate with Ollama service',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// Add this to your proxy-server.js
app.get('/test-ollama-connection', async (req, res) => {
  try {
    console.log('Testing direct connection to Ollama service...');
    const response = await fetch('https://ollama-bb-bot-753741223620.us-central1.run.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'bb-bot',
        messages: [{ role: 'user', content: 'test message' }]
      }),
      timeout: 5000
    });
    
    const status = response.status;
    console.log(`Test connection status: ${status}`);
    
    if (response.ok) {
      res.status(200).json({ success: true, status, message: 'Connection to Ollama successful' });
    } else {
      const errorText = await response.text();
      res.status(200).json({ 
        success: false, 
        status, 
        message: 'Connection to Ollama failed', 
        error: errorText 
      });
    }
  } catch (error) {
    console.error('Error testing Ollama connection:', error);
    res.status(200).json({ 
      success: false, 
      message: 'Connection to Ollama failed with exception', 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
