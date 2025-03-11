const express = require('express');
const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');

const app = express();
app.use(express.json());

const ollamaUrl = 'https://ollama-bb-bot-753741223620.us-central1.run.app'; 

app.post('/ollama', async (req, res) => {
    try {
        const auth = new GoogleAuth();
        const client = await auth.getIdTokenClient(ollamaUrl);
        const idToken = await client.getIdToken(ollamaUrl);

        const ollamaResponse = await fetch(ollamaUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!ollamaResponse.ok) {
            // Log the error response from Ollama
            const errorBody = await ollamaResponse.text();
            console.error(`Ollama API error: ${ollamaResponse.status}, body: ${errorBody}`);
            res.status(ollamaResponse.status).send(`Ollama API error: ${ollamaResponse.status}`);
            return;
        }

        const data = await ollamaResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Proxy service listening on port ${port}`);
});
