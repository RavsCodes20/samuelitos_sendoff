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
    // --- Newsletter Content Loading Logic (for newsletters.html) ---
    const newsletterLinks = document.querySelectorAll('.newsletter-links a');
    const newsletterDisplay = document.getElementById('newsletter-display');

    if (newsletterLinks.length > 0 && newsletterDisplay) {
        newsletterLinks.forEach(link => {
            link.addEventListener('click', async (event) => {
                event.preventDefault(); // Prevent default link behavior
                hideTooltip(); // Hide tooltip if a newsletter link is clicked

                // Remove 'active-newsletter' class from all links
                newsletterLinks.forEach(l => l.classList.remove('active-newsletter'));
                // Add 'active-newsletter' class to the clicked link
                event.target.classList.add('active-newsletter');

                const newsletterPath = event.target.dataset.newsletterPath;

                if (newsletterPath) {
                    try {
                        // Show a loading indicator
                        newsletterDisplay.innerHTML = '<div class="spinner"></div><p style="text-align: center; color: var(--dark-text);">Loading newsletter...</p>';

                        const response = await fetch(newsletterPath);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} - Could not load ${newsletterPath}`);
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
    }

    // --- AI Content Generation Logic (for news_app.html) ---
    // Get references to the new AI prompt elements
    const geminiPromptTextarea = document.getElementById('gemini-prompt');
    const sendPromptButton = document.getElementById('send-prompt-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const geminiOutputDiv = document.getElementById('geminiOutput'); // The new output div

    // Only proceed if these elements exist on the current page (i.e., news_app.html)
    if (geminiPromptTextarea && sendPromptButton && loadingIndicator && geminiOutputDiv) {
        sendPromptButton.addEventListener('click', async () => {
            hideTooltip(); // Hide any active tooltip when AI button is clicked

            const prompt = geminiPromptTextarea.value.trim();
            if (!prompt) {
                geminiOutputDiv.innerHTML = '<p style="color: red;">Please enter a prompt.</p>';
                return;
            }

            // Show loading indicator and disable button
            loadingIndicator.classList.remove('hidden');
            geminiOutputDiv.innerHTML = ''; // Clear previous output
            sendPromptButton.disabled = true;
            sendPromptButton.textContent = 'Generating...';

            try {
                const functionUrl = '/.netlify/functions/generate-ai-content';

                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt })
                });

                const result = await response.json();

                if (response.ok && result.generatedText) {
                    geminiOutputDiv.innerHTML = `<p>${result.generatedText}</p>`;
                } else {
                    geminiOutputDiv.innerHTML = `<p style="color: red;">Error: ${result.error || 'Could not get a valid response from the AI function.'}</p>`;
                    console.error('Netlify function response error:', result);
                }
            } catch (error) {
                console.error('Error calling Netlify function:', error);
                geminiOutputDiv.innerHTML = '<p style="color: red;">Error: Failed to connect to the AI service. Check your network or try again later.</p>';
            } finally {
                // Hide loading indicator and re-enable button
                loadingIndicator.classList.add('hidden');
                sendPromptButton.disabled = false;
                sendPromptButton.textContent = 'Send Prompt to Gemini';
            }
        });
    }

    // --- Highlighted Word Tooltip Logic (Applies to all pages with .highlight-text) ---
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
