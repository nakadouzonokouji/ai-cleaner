import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixHtmlStructure(html) {
    // Fix the specific issue with malformed h2/h3 tags in heavy files
    html = html.replace(/<h2>掃除手順<\/h2>専門道具（5選）<\/h3>/g, '<h2>掃除手順</h2>');
    html = html.replace(/<h2>掃除手順<\/h2>.*?<\/h3>/g, '<h2>掃除手順</h2>');
    
    // Fix stray h3 tags in warning sections
    html = html.replace(/<h3 class="category-title">専門道具（5選）<\/h3>\s*<h3 class="category-title">保護具.*?<\/h3>/g, '');
    
    // Fix product item structure - ensure price and link are inside product-item div
    html = html.replace(/<\/div>\s*<\/div>\s*<p class="price">(.*?)<\/p>\s*<a href="(.*?)".*?class="amazon-btn">([\s\S]*?)<\/a>\s*<\/div>\s*<\/div>/g, 
        (match, price, href, text) => {
            return `        <p class="price">${price}</p>
        <a href="${href}" target="_blank" rel="nofollow noopener" class="amazon-btn">
            ${text.trim()}
        </a>
    </div>`;
        });

    // Fix empty product categories
    html = html.replace(/<div class="product-category">\s*<h3 class="category-title">(.*?)<\/h3>\s*<div class="horizontal-scroll-container">\s*<div class="product-list">\s*<\/div>\s*<\/div>\s*<\/div>/g,
        '');

    // Fix product-grid that appear inside product categories
    html = html.replace(/<\/div>\s*<div class="product-grid">/g, `                </div>
            </div>
            
            <div class="product-grid">`);

    // Remove duplicate closing divs at the end of sections
    html = html.replace(/(<\/div>\s*){4,}<div class="product-grid">/g, `            </div>
            <div class="product-grid">`);

    // Fix missing closing divs for product-grid sections
    html = html.replace(/<div class="product-grid">\s*<div class="product-grid-inner">([\s\S]*?)<\/div>\s*<\/div>\s*(?!<\/div>)/g,
        (match, content) => {
            return `<div class="product-grid">
                <div class="product-grid-inner">
${content}                </div>
            </div>
        </div>`;
        });

    // Ensure proper body and html closing
    if (!html.includes('</body>')) {
        html = html.replace(/<\/div>\s*$/, `    </div>
</body>
</html>`);
    } else {
        // Fix cases where body/html close too early
        html = html.replace(/<\/body>\s*<\/html>[\s\S]*$/, (match) => {
            const remainingContent = match.replace(/<\/body>\s*<\/html>/, '').trim();
            if (remainingContent) {
                return remainingContent + '\n</body>\n</html>';
            }
            return '</body>\n</html>';
        });
    }

    // Clean up excessive whitespace
    html = html.replace(/\n{4,}/g, '\n\n');

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
console.log('Fixing specific structural issues in public directory...\n');

const totalFixed = processDirectory(publicDir);
console.log(`\nTotal files fixed: ${totalFixed}`);