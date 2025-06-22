import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixHtmlStructure(html) {
    // Fix the broken product-item structure
    // Pattern: price and link outside of product-item div
    html = html.replace(/<\/div>\s*<\/div>\s*<p class="price">(.*?)<\/p>\s*<a href="(.*?)".*?class="amazon-btn">(.*?)<\/a>\s*<\/div>\s*<\/div>/g, 
        (match, price, href, text) => {
            return `        <p class="price">${price}</p>
        <a href="${href}" target="_blank" rel="nofollow noopener" class="amazon-btn">
            ${text}
        </a>
    </div>`;
        });

    // Fix product categories with empty product lists
    html = html.replace(/<div class="product-category">\s*<h3 class="category-title">(.*?)<\/h3>\s*<div class="horizontal-scroll-container">\s*<div class="product-list">\s*<\/div>\s*<\/div>\s*<\/div>/g,
        (match, title) => {
            return `            <div class="product-category">
                <h3 class="category-title">${title}</h3>
                <div class="horizontal-scroll-container">
                    <div class="product-list">
                    </div>
                </div>
            </div>`;
        });

    // Fix the main section structure
    html = html.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="section">/g, `        </div>
        
        <div class="section">`);

    // Remove duplicate closing divs before product-grid
    html = html.replace(/<\/div>\s*<\/div>\s*<div class="product-grid">/g, `            <div class="product-grid">`);

    // Fix the warning section
    html = html.replace(/<div class="warning">([\s\S]*?)<h3 class="category-title">/g, (match, content) => {
        // Extract the warning content
        const warningContent = content.replace(/<\/div>[\s\S]*$/, '');
        return `        <div class="section warning">
            ${warningContent.trim()}
        </div>
        
        <div class="section">
            <h2>掃除手順</h2>`;
    });

    // Ensure proper closing structure
    if (!html.includes('</body>')) {
        html = html.replace(/<\/div>\s*$/, '</div>\n    </div>\n</body>\n</html>');
    } else if (!html.includes('</html>')) {
        html = html.replace('</body>', '</body>\n</html>');
    }

    // Clean up extra closing divs at the end
    html = html.replace(/(<\/div>\s*)+<\/body>/, '    </div>\n</body>');

    // Encode unencoded ampersands
    html = html.replace(/&(?![#a-z0-9]+;)/gi, '&amp;');

    // Add type attribute to buttons
    html = html.replace(/<button(?![^>]*\btype=)/gi, '<button type="button"');

    return html;
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    let processedCount = 0;

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.includes('node_modules')) {
            processedCount += processDirectory(filePath);
        } else if (file.endsWith('.html')) {
            console.log(`Processing: ${filePath}`);
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            
            content = fixHtmlStructure(content);
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✓ Fixed: ${filePath}`);
                processedCount++;
            }
        }
    });

    return processedCount;
}

// Process the public directory
const publicDir = path.join(__dirname, '..', 'public');
console.log('Fixing final HTML structure in public directory...\n');

const totalFixed = processDirectory(publicDir);
console.log(`\nTotal files fixed: ${totalFixed}`);