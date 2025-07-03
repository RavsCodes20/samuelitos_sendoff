// script.js

let activeTooltip = null; // Global variable to keep track of the currently active tooltip

function showTooltip(targetElement, text) {
    // Hide any currently active tooltip
    if (activeTooltip) {
        hideTooltip();
    }

    // Create tooltip container
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');

    // Add text content
    const tooltipTextSpan = document.createElement('span');
    tooltipTextSpan.className = 'custom-tooltip-text';
    tooltipTextSpan.textContent = text;
    tooltip.appendChild(tooltipTextSpan);

    // Add Google Search button
    const searchButton = document.createElement('button');
    searchButton.className = 'tooltip-search-button';
    searchButton.textContent = 'Google Search';
    searchButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling up and closing tooltip immediately
        window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank');
        hideTooltip(); // Hide tooltip after search
    });
    tooltip.appendChild(searchButton);

    // Append tooltip to body
    document.body.appendChild(tooltip);
    activeTooltip = tooltip;

    // Position the tooltip
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect(); // Get tooltip dimensions after appending

    // Calculate position (e.g., center above the target)
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    let top = targetRect.top - tooltipRect.height - 10; // 10px above target

    // Adjust if too far left
    if (left < 10) {
        left = 10;
    }
    // Adjust if too far right
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    // Adjust if too high (e.g., if it goes off screen top)
    if (top < 10) {
        top = targetRect.bottom + 10; // Place below if not enough space above
    }

    tooltip.style.left = `${left + window.scrollX}px`;
    tooltip.style.top = `${top + window.scrollY}px`;

    // Make visible after positioning
    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden', 'false');
}

function hideTooltip() {
    if (activeTooltip) {
        activeTooltip.classList.remove('visible');
        activeTooltip.setAttribute('aria-hidden', 'true');
        // Remove tooltip from DOM after transition
        activeTooltip.addEventListener('transitionend', function handler() {
            if (!activeTooltip.classList.contains('visible')) { // Only remove if it's truly hidden
                activeTooltip.remove();
                activeTooltip = null;
            }
            activeTooltip.removeEventListener('transitionend', handler);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Newsletter Content Loading Logic ---
    const newsletterLinks = document.querySelectorAll('.newsletter-links a');
    const newsletterDisplay = document.getElementById('newsletter-display');

    if (newsletterLinks.length > 0 && newsletterDisplay) {
        newsletterLinks.forEach(link => {
            link.addEventListener('click', async (event) => {
                event.preventDefault(); // Prevent default link behavior (e.g., navigating away)
                hideTooltip(); // Hide tooltip if a newsletter link is clicked

                // Remove 'active-newsletter' class from all newsletter links
                newsletterLinks.forEach(l => l.classList.remove('active-newsletter'));
                // Add 'active-newsletter' class to the currently clicked link
                event.target.classList.add('active-newsletter');

                // Get the path to the newsletter content from the data-newsletter-path attribute
                const newsletterPath = event.target.dataset.newsletterPath;

                if (newsletterPath) {
                    try {
                        // Display a loading spinner and message while content is being fetched
                        newsletterDisplay.innerHTML = '<div class="spinner"></div><p style="text-align: center; color: var(--dark-text);">Loading newsletter...</p>';

                        // Fetch the content of the specified newsletter HTML file
                        const response = await fetch(newsletterPath);
                        // Check if the HTTP response was successful (status code 200-299)
                        if (!response.ok) {
                            // If not successful, throw an error with the status
                            throw new Error(`HTTP error! status: ${response.status} - Could not load ${newsletterPath}`);
                        }
                        // Extract the HTML content as text from the response
                        const content = await response.text();
                        newsletterDisplay.innerHTML = content; // Insert the fetched content into the newsletter display area
                    } catch (error) {
                        // Log any errors to the console for debugging
                        console.error('Error loading newsletter content:', error);
                        // Display an error message to the user
                        newsletterDisplay.innerHTML = '<p style="text-align: center; color: red;">Failed to load newsletter content. Please try again later.</p>';
                    }
                }
            });
        });

        // Optional: Automatically load the first newsletter by default on page load
        // if (newsletterLinks[0]) {
        //     newsletterLinks[0].click(); // Simulate a click on the first link
        // }
    }

    // --- AI Content Generation Logic ---
    // Get references to the AI generation button and output div
    const generateButton = document.getElementById('generateAiContent');
    const aiOutputDiv = document.getElementById('aiOutput');

    // Only proceed if the AI button exists on the current page
    if (generateButton && aiOutputDiv) {
        generateButton.addEventListener('click', async () => {
            hideTooltip(); // Hide tooltip if AI button is clicked

            // Display a loading spinner in the output area
            aiOutputDiv.innerHTML = '<div class="spinner"></div>';
            // Disable the button to prevent multiple clicks during generation
            generateButton.disabled = true;
            generateButton.textContent = 'Generating...'; // Change button text

            try {
                // Define the prompt that will be sent to the AI
                const prompt = "Generate a short, inspiring quote about the future of technology and humanity, no more than 20 words.";

                // Define the URL for your Netlify Function.
                const functionUrl = '/.netlify/functions/generate-ai-content';

                // Make a POST request to your Netlify Function
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt }) // Send the prompt in JSON format
                });

                // Parse the JSON response from your Netlify Function
                const result = await response.json();

                // Check if the response was successful (HTTP status 2xx) and contains the generated text
                if (response.ok && result.generatedText) {
                    // If successful, display the AI's generated text
                    aiOutputDiv.innerHTML = `<p>${result.generatedText}</p>`;
                } else {
                    // If there was an error or unexpected response from the function
                    // Display an error message to the user and log details to console
                    aiOutputDiv.innerHTML = `<p style="color: red;">Error: ${result.error || 'Could not get a valid response from the AI function.'}</p>`;
                    console.error('Netlify function response error:', result);
                }
            } catch (error) {
                // Catch any network errors or issues with the fetch operation
                console.error('Error calling Netlify function:', error);
                aiOutputDiv.innerHTML = '<p style="color: red;">Error: Failed to connect to the AI service. Check your network or try again later.</p>';
            } finally {
                // Re-enable the button and reset its text regardless of success or failure
                generateButton.disabled = false;
                generateButton.textContent = 'Generate Idea';
            }
        });
    }

    // --- Highlighted Word Tooltip Logic ---
    // Use event delegation on the document body for efficiency
    document.body.addEventListener('click', (event) => {
        const target = event.target;

        // Check if the clicked element is a highlighted word
        if (target.classList.contains('highlight-text')) {
            const highlightedText = target.textContent;
            showTooltip(target, highlightedText);
            event.stopPropagation(); // Prevent this click from immediately closing the tooltip via the document listener
        } else if (activeTooltip && !activeTooltip.contains(target)) {
            // If a tooltip is active and the click is outside it, hide it
            hideTooltip();
        }
    });

    // Close tooltip on Escape key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && activeTooltip) {
            hideTooltip();
        }
    });

    // Hide tooltip when scrolling to prevent misalignment
    window.addEventListener('scroll', () => {
        if (activeTooltip) {
            hideTooltip();
        }
    });
});
