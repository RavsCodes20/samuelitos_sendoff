// netlify/functions/generate-ai-content.js

// This is the main handler function for the Netlify Function.
// It will be triggered when your frontend makes a request to /.netlify/functions/generate-ai-content
exports.handler = async (event, context) => {
    // Ensure the request method is POST, as we expect data in the body.
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            body: JSON.stringify({ error: 'Method Not Allowed. Only POST requests are accepted.' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow requests from any origin (CORS)
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    // Handle preflight OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204, // No Content
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    try {
        // Parse the request body to get the prompt from the frontend.
        const { prompt } = JSON.parse(event.body);

        // Retrieve the Gemini API key from Netlify Environment Variables.
        // It's crucial to store API keys this way for security!
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        // Basic validation for the API key and prompt.
        if (!GEMINI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Gemini API Key not configured in Netlify Environment Variables.' }),
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            };
        }

        if (!prompt) {
            return {
                statusCode: 400, // Bad Request
                body: JSON.stringify({ error: 'Prompt is required in the request body.' }),
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            };
        }

        // Construct the payload for the Gemini API.
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };

        // Define the Gemini API endpoint.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        // Make the fetch request to the Gemini API.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Parse the JSON response from the Gemini API.
        const result = await response.json();

        // Check if the AI response structure is valid and extract the text.
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const aiText = result.candidates[0].content.parts[0].text;

            // Return a successful response to the frontend.
            return {
                statusCode: 200,
                body: JSON.stringify({ generatedText: aiText }),
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            };
        } else {
            // Handle cases where the AI response is unexpected.
            console.error('AI response structure unexpected:', result);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Unexpected response from AI service.', details: result }),
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            };
        }

    } catch (error) {
        // Catch any errors during the process and return a server error.
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process AI request.', details: error.message }),
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        };
    }
};

