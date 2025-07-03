# Samuelito's Sendoff

## Project Overview

"Samuelito's Sendoff" is a personal website designed to serve as an archive for monthly publications, offer quick access to various news sources, and provide an interactive AI prompt tool. It's built with a focus on clear content delivery and a subtle, engaging visual experience.

## Features

* **Home Page:** A welcoming introduction to the platform and its purpose.

* **Newsletters Archive:** Browse and read past monthly newsletters dynamically loaded into the page.

* **News Link Generator:** A categorized directory of links to prominent news websites, allowing for quick access to various information sources.

* **Ask Gemini:** An integrated tool on the "News App" page that allows users to send text prompts to the Gemini AI model and receive responses directly on the site.

* **Contributors Page:** Information about the writers and researchers behind the content.

* **About Us:** Details about the mission of "Samuelito's Sendoff" and a professional bio of its creator, Samuel Ravelo Jr., highlighting his background in political science, theatre, and non-profit work with the Entertainment Community Fund.

* **Dynamic Background Animations:** Subtle visual effects enhance the user experience.

* **Responsive Design:** Optimized for viewing across various devices (desktop, tablet, mobile).

## Technologies Used

The project is built using standard web technologies:

* **HTML5:** For structuring the content of each page.

* **CSS3:** For styling and visual presentation, including responsive design and animations.

* **JavaScript (ES6+):** For interactive elements, dynamic content loading (e.g., newsletters), and integration with the Gemini API.

* **Tailwind CSS:** A utility-first CSS framework used for rapid styling and responsive design.

* **Google Gemini API (gemini-2.0-flash):** For enabling AI-powered text generation within the "News App" feature.

## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone or Download the Repository:** If this were a Git repository, you would clone it. Since it's a set of files, simply download all the provided HTML, CSS, and JavaScript files.

2.  **Organize Files:** Ensure all files are in the same directory:

    * `index.html`

    * `newsletters.html`

    * `news_app.html`

    * `contributors.html`

    * `about.html`

    * `may_2025_content.html` (and any other future newsletter content files)

    * `style.css`

    * `script.js`

3.  **Open in Browser:** Simply open `index.html` in your preferred web browser. All other pages are linked internally.

No complex build tools or server-side configurations are required as this is a client-side only application.

## Usage

* **Navigation:** Use the navigation bar at the top of any page to switch between sections (Home, Newsletters, News App, Contributors, About).

* **Reading Newsletters:** On the "Newsletters" page, click on any newsletter title to load its content dynamically into the display area.

* **Using the News App:** On the "News App" page, click on any link in the categorized grids to visit external news sources. In the "Ask Gemini" section, type your prompt into the text area and click "Send Prompt to Gemini" to get an AI-generated response.

## Adding New Newsletters

The process for adding new newsletters is designed to be straightforward:

1.  **Create a New Content File:**

    * Create a new `.html` file (e.g., `june_2025_content.html`) in the same directory as your other website files.

    * This file should **only** contain the HTML for the newsletter's content (e.g., `<h2>`, `<p>`, `<span>`, etc.), ideally wrapped in a `div` like `<div class="newsletter-article">`. Do **not** include `<html>`, `<head>`, or `<body>` tags.

2.  **Add a Link in `newsletters.html`:**

    * Open `newsletters.html`.

    * Locate the `<ul class="newsletter-links">` section.

    * Add a new `<li>` element with an `<a>` tag. Set the `data-newsletter-path` attribute to the exact filename of your new content file.

    Example:

    ```html
    <li><a href="#" data-newsletter-path="june_2025_content.html">June 2025: Your Latest Insights</a></li>
    ```

    The `script.js` will automatically handle loading this content when the link is clicked.
