    // script.js for The Sendoff 🔊

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

        // Logic for the News App page to interact with Gemini API (via backend) and handle tabs
        if (document.body.classList.contains('news-app-page')) {
            const promptInput = document.getElementById('gemini-prompt');
            const sendPromptBtn = document.getElementById('send-prompt-btn');
            const geminiResponseDisplay = document.getElementById('gemini-response-display');
            const loadingIndicator = document.getElementById('loading-indicator');

            // Tab functionality for news categories
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');

            // Function to show a specific tab
            const showTab = (tabId) => {
                // Deactivate all buttons and hide all content
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.add('hidden'));

                // Activate clicked button and show corresponding content
                const activeTabButton = document.querySelector(`.tab-button[data-tab-id="${tabId}"]`);
                const activeTabContent = document.getElementById(`tab-${tabId}`);

                if (activeTabButton) activeTabButton.classList.add('active');
                if (activeTabContent) activeTabContent.classList.remove('hidden');
            };

            // Add event listeners to tab buttons
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabId = button.dataset.tabId;
                    showTab(tabId);
                });
            });

            // Ensure the default tab is shown on load
            // Check if there's an active tab button, otherwise default to 'general'
            const initialActiveTabButton = document.querySelector('.tab-button.active');
            if (initialActiveTabButton) {
                showTab(initialActiveTabButton.dataset.tabId);
            } else {
                showTab('general'); // Fallback to 'general' if no active class is set
            }


            // Gemini API interaction logic
            if (sendPromptBtn) {
                sendPromptBtn.addEventListener('click', async () => {
                    const prompt = promptInput.value.trim();
                    if (!prompt) {
                        geminiResponseDisplay.innerHTML = '<p class="text-red-500">Please enter a prompt.</p>';
                        return;
                    }

                    loadingIndicator.classList.remove('hidden'); // Show loading indicator
                    geminiResponseDisplay.innerHTML = ''; // Clear previous response
                    geminiResponseDisplay.classList.add('flex', 'items-center', 'justify-center'); // Center initial text

                    try {
                        const response = await fetch('http://localhost:3000/generate-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt: prompt })
                        });

                        const result = await response.json();

                        if (result.imageUrl) {
                            geminiResponseDisplay.classList.remove('flex', 'items-center', 'justify-center');
                            geminiResponseDisplay.innerHTML = `<img src="${result.imageUrl}" alt="Generated Image" class="max-w-full h-auto rounded-lg shadow-md mt-0 mx-auto block">`;
                        } else if (result.error) {
                            geminiResponseDisplay.innerHTML = `<p class="text-red-500">Error: ${result.error}</p>`;
                        } else {
                            geminiResponseDisplay.innerHTML = '<p class="text-red-500">Failed to get a valid response for image generation.</p>';
                        }
                    } catch (error) {
                        console.error('Error communicating with The Sendoff 🔊 backend for image generation:', error);
                        geminiResponseDisplay.innerHTML = `<p class="text-red-500">An error occurred while connecting to the server: ${error.message}. Ensure your backend server is running.</p>`;
                    } finally {
                        loadingIndicator.classList.add('hidden'); // Hide loading indicator
                    }
                });
            }
        }
    });
    
