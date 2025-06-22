import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixHtmlStructure(html) {
    // First, ensure all product items have closing divs
    html = html.replace(/<div class="product-item">[\s\S]*?<\/a>\s*(?!<\/div>)/g, (match) => {
        return match + '\n    </div>';
    });

    // Fix product-list sections - ensure they're properly closed
    html = html.replace(/<div class="product-list">\s*<div class="product-item">[\s\S]*?<\/div>\s*(?!<\/div>)/g, (match) => {
        return match + '\n                    </div>';
    });

    // Fix horizontal-scroll-container sections
    html = html.replace(/<div class="horizontal-scroll-container">\s*<div class="product-list">[\s\S]*?<\/div>\s*<\/div>\s*(?!<\/div>)/g, (match) => {
        return match + '\n                </div>';
    });

    // Fix product-category sections
    html = html.replace(/<div class="product-category">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*(?!<\/div>)/g, (match) => {
        return match + '\n            </div>';
    });

    // Fix product-grid sections
    html = html.replace(/<div class="product-grid">\s*<div class="product-grid-inner">[\s\S]*?<\/div>\s*<\/div>\s*(?!<\/div>)/g, (match) => {
        return match + '\n            </div>';
    });

    // Remove any stray closing divs before </body>
    html = html.replace(/(<\/div>\s*)+<\/body>/g, '</div>\n</body>');

    // Ensure proper closing of body and html tags
    if (!html.includes('</body>')) {
        // Find the last content and add closing tags
        const lastDivMatch = html.lastIndexOf('</div>');
        if (lastDivMatch !== -1) {
            html = html.substring(0, lastDivMatch + 6) + '\n</body>\n</html>';
        }
    } else if (!html.includes('</html>')) {
        html = html.replace('</body>', '</body>\n</html>');
    }

    // Fix multiple consecutive closing divs (cleanup)
    html = html.replace(/(<\/div>\s*){4,}/g, '</div>\n</div>\n</div>\n');

    // Encode unencoded ampersands
    html = html.replace(/&(?![#a-z0-9]+;)/gi, '&amp;');

    // Add type attribute to buttons without it
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
console.log('Fixing HTML structure in public directory...\n');

const totalFixed = processDirectory(publicDir);
console.log(`\nTotal files fixed: ${totalFixed}`);