// content-script.js

/**
 * Finds and extracts the main content of the page.
 * @returns {Array<{tag: string, text: string}>|null} An array of content objects, or null if no content is found.
 */
function extractMainContent() {
    // A list of common selectors for main content areas
    const selectors = ['article', 'main', '[role="main"]', '#content', '#main', '.post', '.story-content'];
    
    let mainContentElement = null;
    for (const selector of selectors) {
        mainContentElement = document.querySelector(selector);
        if (mainContentElement) break;
    }

    // If no specific container is found, use the body as a fallback
    if (!mainContentElement) {
        mainContentElement = document.body;
    }

    // Select all relevant text-bearing elements within the main container
    const elements = mainContentElement.querySelectorAll('h1, h2, h3, p');
    if (elements.length === 0) {
        return null;
    }

    // Extract tag name and text content from each element
    const content = Array.from(elements).map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim()
    })).filter(item => item.text.length > 0); // Filter out empty elements

    return content;
}

const articleContent = extractMainContent();

if (articleContent && articleContent.length > 0) {
    chrome.runtime.sendMessage({ content: articleContent });
} else {
    chrome.runtime.sendMessage({ error: "Could not find any relevant content to extract." });
}