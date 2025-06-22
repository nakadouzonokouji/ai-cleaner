import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Find all HTML files recursively
async function findHtmlFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Convert product structure from div to ul/li
async function convertHtmlFile(filePath) {
  console.log(`Converting: ${filePath}`);
  
  try {
    const html = await fs.readFile(filePath, 'utf8');
    const $ = cheerio.load(html, { 
      decodeEntities: false,
      xmlMode: false
    });
    
    // Find all product sections
    $('.section:has(h2:contains("おすすめ商品"))').each((_, section) => {
      const $section = $(section);
      
      // Process each product category
      $section.find('.product-category').each((_, category) => {
        const $category = $(category);
        const $title = $category.find('.category-title').first();
        const $container = $category.find('.horizontal-scroll-container').first();
        const $list = $container.find('.product-list').first();
        
        if ($list.length && $title.length) {
          // Create new ul element
          const $ul = $('<ul class="product-row"></ul>');
          
          // Convert each product-item div to li
          $list.find('.product-item').each((_, item) => {
            const $item = $(item);
            const $li = $('<li class="product-card"></li>');
            
            // Extract content
            const imgSrc = $item.find('img').attr('src');
            const imgAlt = $item.find('img').attr('alt');
            const title = $item.find('h4').text();
            const price = $item.find('.price').text();
            const link = $item.find('.amazon-btn').attr('href');
            const badge = $item.find('.badge').text();
            const badgeClass = $item.find('.badge').attr('class');
            
            // Build new structure
            let liContent = `<a href="${link || '#'}" target="_blank" rel="nofollow noopener">`;
            liContent += `<img src="${imgSrc || '/img/no-image.svg'}" alt="${imgAlt || title}" onerror="this.src='/img/no-image.svg'">`;
            liContent += `<p class="name">${title}</p>`;
            if (price) {
              liContent += `<p class="price">${price}</p>`;
            }
            if (badge && badgeClass) {
              liContent += `<p class="${badgeClass}">${badge}</p>`;
            }
            liContent += '</a>';
            
            $li.html(liContent);
            $ul.append($li);
          });
          
          // Replace the old structure
          $category.empty();
          $category.append($title);
          $category.append($ul);
        }
      });
    });
    
    // Remove old feedback sections and ensure it's at the end
    let feedbackHtml = '';
    
    // Extract feedback section
    $('.method-feedback-section').each((_, el) => {
      const $el = $(el);
      const $parent = $el.parent();
      feedbackHtml = `<!-- 掃除方法フィードバックセクション -->\n${$.html($parent)}`;
      $parent.remove();
    });
    
    // Also look for feedback comment
    const htmlString = $.html();
    const feedbackMatch = htmlString.match(/<!-- 掃除方法フィードバックセクション -->[\s\S]*?<\/script>/);
    if (feedbackMatch && !feedbackHtml) {
      feedbackHtml = feedbackMatch[0];
    }
    
    // Clean up body closing
    let finalHtml = $.html();
    
    // Remove feedback from current position
    finalHtml = finalHtml.replace(/<!-- 掃除方法フィードバックセクション -->[\s\S]*?<\/script>/g, '');
    
    // Add feedback before closing body
    if (feedbackHtml) {
      finalHtml = finalHtml.replace('</body>', `\n\n${feedbackHtml}\n\n</body>`);
    }
    
    // Fix any structural issues
    finalHtml = finalHtml.replace(/(<\/div>\s*)+<\/body>/, (match) => {
      const beforeBody = finalHtml.substring(0, finalHtml.lastIndexOf(match));
      const openDivs = (beforeBody.match(/<div[^>]*>/g) || []).length;
      const closeDivs = (beforeBody.match(/<\/div>/g) || []).length;
      const needed = openDivs - closeDivs;
      
      let result = '';
      for (let i = 0; i < needed; i++) {
        result += '</div>\n';
      }
      result += '</body>';
      return result;
    });
    
    await fs.writeFile(filePath, finalHtml, 'utf8');
    console.log(`✓ Converted: ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`✗ Error converting ${filePath}:`, error.message);
  }
}

// Main function
async function main() {
  console.log('Converting all HTML files to ul/li structure...\n');
  
  try {
    const htmlFiles = await findHtmlFiles(PUBLIC_DIR);
    console.log(`Found ${htmlFiles.length} HTML files\n`);
    
    for (const file of htmlFiles) {
      await convertHtmlFile(file);
    }
    
    console.log('\n✅ Conversion complete!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();