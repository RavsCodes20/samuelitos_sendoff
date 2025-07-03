// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Newsletter Content Loading Logic ---
    const newsletterLinks = document.querySelectorAll('.newsletter-links a');
    const newsletterDisplay = document.getElementById('newsletter-display');

    if (newsletterLinks.length > 0 && newsletterDisplay) {
        newsletterLinks.forEach(link => {
            link.addEventListener('click', async (event) => {
                event.preventDefault(); // Prevent default link behavior

                // Remove active class from all links
                newsletterLinks.forEach(l => l.classList.remove('active-newsletter'));
                // Add active class to the clicked link
                event.target.classList.add('active-newsletter');

                const newsletterPath = event.target.dataset.newsletterPath;

                if (newsletterPath) {
                    try {
                        // Show a loading indicator
                        newsletterDisplay.innerHTML = '<div class="spinner"></div><p style="text-align: center; color: var(--dark-text);">Loading newsletter...</p>';

                        const response = await fetch(newsletterPath);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const content = await response.text();
                        newsletterDisplay.innerHTML = content; // Load the content into the display div
                    } catch (error) {
                        console.error('Error loading newsletter content:', error);
                        newsletterDisplay.innerHTML = '<p style="text-align: center; color: red;">Failed to load newsletter content. Please try again later.</p>';
                    }
                }
            });
        });

        // Optionally, load the first newsletter by default on page load
        // if (newsletterLinks[0]) {
        //     newsletterLinks[0].click(); // Simulate a click on the first link
        // }
    }

    // --- AI Content Generation Logic ---
    // Check if the AI button exists on the current page before adding listener
    const generateButton = document.getElementById('generateAiContent');
    if (generateButton) {
        const aiOutputDiv = document.getElementById('aiOutput');

        generateButton.addEventListener('click', async () => {
            // Show loading spinner and disable button
            aiOutputDiv.innerHTML = '<div class="spinner"></div>';
            generateButton.disabled = true;
            generateButton.textContent = 'Generating...';

            try {
                // Define the prompt for the AI
                const prompt = "Generate a short, inspiring quote about the future of technology and humanity, no more than 20 words.";

                // Call your Netlify Function endpoint
                // The path is /.netlify/functions/ followed by your function file name (without .js extension).
                const functionUrl = '/.netlify/functions/generate-ai-content';

                // Make the API call to your Netlify Function
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt }) // Send the prompt in the body
                });

                const result = await response.json();

                // Check if the response from your Netlify Function contains the generated text
                if (response.ok && result.generatedText) { // Check response.ok for HTTP success (2xx)
                    aiOutputDiv.innerHTML = `<p>${result.generatedText}</p>`; // Display the AI's response
                } else {
                    // Handle errors returned by the Netlify function or unexpected structure
                    aiOutputDiv.innerHTML = `<p style="color: red;">Error: ${result.error || 'Could not get a valid response from the AI function.'}</p>`;
                    console.error('Netlify function response error:', result);
                }
            } catch (error) {
                aiOutputDiv.innerHTML = '<p style="color: red;">Error: Failed to connect to the AI service. Check your network or try again later.</p>';
                console.error('Error calling Netlify function:', error);
            } finally {
                // Re-enable the button and reset its text
                generateButton.disabled = false;
                generateButton.textContent = 'Generate Idea';
            }
        });
    }
});
