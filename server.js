// server.js

// Import necessary modules
const express = require('express');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing
require('dotenv').config(); // For loading environment variables from a .env file

const app = express();
const port = 3000; // The port your backend server will listen on

// Middleware
app.use(cors()); // Enable CORS for all routes, allowing your frontend to make requests
app.use(express.json()); // Enable parsing of JSON request bodies

// Gemini API Key from environment variables
// IMPORTANT: Store your actual API key in a .env file like this:
// GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Endpoint for generating images using Imagen-3.0
app.post('/generate-image', async (req, res) => {
    // Check if the API key is set
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured.' });
    }

    const { prompt } = req.body; // Get the prompt from the request body

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        const payload = {
            instances: { prompt: prompt },
            parameters: { "sampleCount": 1 } // Request one image
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`;

        // Make the API call to Gemini
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            // Send the base64 encoded image data back to the frontend
            const imageData = result.predictions[0].bytesBase64Encoded;
            res.json({ imageUrl: `data:image/png;base64,${imageData}` });
        } else if (result.error && result.error.message) {
            console.error('Gemini API Error:', result.error.message);
            res.status(result.error.code || 500).json({ error: result.error.message });
        } else {
            console.error('Unexpected Gemini API response:', result);
            res.status(500).json({ error: 'Failed to generate image: Unexpected API response.' });
        }
    } catch (error) {
        console.error('Error in /generate-image endpoint:', error);
        res.status(500).json({ error: `Backend server error: ${error.message}` });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log('Remember to set your GEMINI_API_KEY in a .env file.');
});
