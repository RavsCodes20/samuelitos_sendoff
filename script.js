// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Logic for newsletters.html to load content dynamically
    // Removed the conditional check, as this script is only linked on newsletters.html
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

    // You can add other common JavaScript functionalities here if needed.
    // For example, if you wanted a sticky header across all pages, you would add that logic here.
});
