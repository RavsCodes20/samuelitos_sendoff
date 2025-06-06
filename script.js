// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Logic for newsletters.html to load content dynamically
    const newsletterLinks = document.querySelectorAll('.newsletter-links a');
    const newsletterDisplay = document.getElementById('newsletter-display');

    newsletterLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default link behavior

            // Remove active class from all links and add to clicked one
            newsletterLinks.forEach(navLink => navLink.classList.remove('active-newsletter'));
            link.classList.add('active-newsletter');

            const newsletterPath = link.getAttribute('data-newsletter-path');
            if (newsletterPath) {
                try {
                    // Show a loading indicator
                    newsletterDisplay.innerHTML = '<p style="text-align: center; color: var(--dark-text);">Loading newsletter...</p>';

                    const response = await fetch(newsletterPath);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const content = await response.text();
                    newsletterDisplay.innerHTML = content; // Inject the fetched content

                } catch (error) {
                    console.error('Failed to load newsletter content:', error);
                    newsletterDisplay.innerHTML = '<p style="text-align: center; color: var(--dark-text); color: var(--accent2);">Failed to load newsletter. Please try again later.</p>';
                }
            }
        });
    });

    // Logic for the News App page to interact with Gemini API
    if (document.body.classList.contains('news-app-page')) {
        const promptInput = document.getElementById('gemini-prompt');
        const sendPromptBtn = document.getElementById('send-prompt-btn');
        const geminiResponseDisplay = document.getElementById('gemini-response-display');
        const loadingIndicator = document.getElementById('loading-indicator');

        if (sendPromptBtn) {
            sendPromptBtn.addEventListener('click', async () => {
                const prompt = promptInput.value.trim();
                if (!prompt) {
                    geminiResponseDisplay.innerHTML = '<p class="text-red-500">Please enter a prompt.</p>';
                    return;
                }

                loadingIndicator.classList.remove('hidden'); // Show loading indicator
                geminiResponseDisplay.innerHTML = ''; // Clear previous response

                try {
                    let chatHistory = [];
                    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                    const payload = { contents: chatHistory };
                    const apiKey = ""; // Leave as-is; Canvas will provide
                    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const result = await response.json(); // Await the JSON parsing

                    if (result.candidates && result.candidates.length > 0 &&
                        result.candidates[0].content && result.candidates[0].content.parts &&
                        result.candidates[0].content.parts.length > 0) {
                        const text = result.candidates[0].content.parts[0].text;
                        geminiResponseDisplay.innerHTML = `<p>${text}</p>`;
                    } else if (result.error && result.error.message) {
                        geminiResponseDisplay.innerHTML = `<p class="text-red-500">Error: ${result.error.message}</p>`;
                    } else {
                        geminiResponseDisplay.innerHTML = '<p class="text-red-500">Failed to get a valid response from Gemini API.</p>';
                    }
                } catch (error) {
                    console.error('Error calling Gemini API:', error);
                    geminiResponseDisplay.innerHTML = `<p class="text-red-500">An error occurred: ${error.message}</p>`;
                } finally {
                    loadingIndicator.classList.add('hidden'); // Hide loading indicator
                }
            });
        }
    }
});
