import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.join(__dirname, '..', 'updated-final');  // Source templates
const DEST = path.join(__dirname, '..', 'templates-clean'); // Output directory

async function cleanFile(srcPath, destPath) {
    try {
        const html = await fs.readFile(srcPath, 'utf8');
        const $ = cheerio.load(html, { 
            decodeEntities: false,
            xmlMode: false
        });

        /* ---------------------------------
         * ① Fix structural issues first
         * --------------------------------- */
        // Fix the malformed h2/h3 tags
        $('h2:contains("掃除手順")').each((_, el) => {
            const $el = $(el);
            const parent = $el.parent();
            const htmlContent = parent.html();
            if (htmlContent && htmlContent.includes('</h2>専門道具')) {
                parent.html(htmlContent.replace(/<\/h2>.*?<\/h3>/g, '</h2>'));
            }
        });

        // Remove stray h3 tags in warning sections
        $('.warning h3.category-title').remove();

        /* ---------------------------------
         * ② Fix product structure issues
         * --------------------------------- */
        // Fix product items with price/link outside the div
        $('p.price').each((_, el) => {
            const $price = $(el);
            const $prevDiv = $price.prev();
            
            // If price is outside product-item, move it inside
            if ($prevDiv.hasClass('product-rating') || $prevDiv.find('.product-rating').length > 0) {
                const $link = $price.next('a.amazon-btn');
                const $container = $price.closest('.product-item');
                
                if ($container.length === 0) {
                    // Find the nearest product-item
                    let $item = $price.prevAll('.product-item').first();
                    if ($item.length === 0) {
                        $item = $price.parent().find('.product-item').last();
                    }
                    
                    if ($item.length > 0) {
                        $item.append($price);
                        if ($link.length > 0) {
                            $item.append($link);
                        }
                    }
                }
            }
        });

        /* ---------------------------------
         * ③ Remove empty/broken structures
         * --------------------------------- */
        // Remove empty product categories
        $('.product-category').each((_, el) => {
            const $cat = $(el);
            const $list = $cat.find('.product-list');
            if ($list.children().length === 0) {
                $cat.remove();
            }
        });

        // Fix unclosed divs by ensuring proper structure
        $('body > div.container').each((_, container) => {
            const $container = $(container);
            
            // Ensure all sections are properly closed
            $container.find('.section').each((_, section) => {
                const $section = $(section);
                // Make sure section content is properly structured
                const $children = $section.children();
                if ($children.length === 0) {
                    $section.remove();
                }
            });
        });

        /* ---------------------------------
         * ④ Encode unencoded ampersands
         * --------------------------------- */
        $('*').each((_, el) => {
            const $el = $(el);
            const text = $el.text();
            if (text && text.includes('&') && !text.match(/&[#a-z0-9]+;/i)) {
                $el.contents().filter(function() {
                    return this.nodeType === 3; // Text nodes only
                }).each(function() {
                    this.nodeValue = this.nodeValue.replace(/&(?![#a-z0-9]+;)/gi, '&amp;');
                });
            }
        });

        /* ---------------------------------
         * ⑤ Add type attribute to buttons
         * --------------------------------- */
        $('button:not([type])').attr('type', 'button');

        /* ---------------------------------
         * ⑥ Ensure proper HTML structure
         * --------------------------------- */
        // Make sure html has proper closing tags
        const finalHtml = $.html();
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        
        // Write cleaned HTML
        await fs.writeFile(destPath, finalHtml, 'utf8');
        console.log('✔ cleaned', destPath);
        
    } catch (error) {
        console.error('Error cleaning', srcPath, ':', error.message);
    }
}

async function getAllHtmlFiles(dir, fileList = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            await getAllHtmlFiles(filePath, fileList);
        } else if (file.name.endsWith('.html')) {
            fileList.push(filePath);
        }
    }
    
    return fileList;
}

async function run() {
    try {
        console.log('Starting template cleanup...\n');
        
        // Get all HTML files from source directory
        const htmlFiles = await getAllHtmlFiles(SRC);
        console.log(`Found ${htmlFiles.length} HTML files to clean\n`);
        
        // Process each file
        for (const srcFile of htmlFiles) {
            const relativePath = path.relative(SRC, srcFile);
            const destFile = path.join(DEST, relativePath);
            await cleanFile(srcFile, destFile);
        }
        
        console.log('\n✅ Template cleanup complete!');
        
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

run();