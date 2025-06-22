import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchProducts } from './fetchProducts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPDATED_FINAL_DIR = path.join(__dirname, '..', 'updated-final');

// Page configurations
const PAGES = [
  // Bathroom (12 pages)
  { location: 'bathroom', area: 'bathtub', dirt: 'light' },
  { location: 'bathroom', area: 'bathtub', dirt: 'heavy' },
  { location: 'bathroom', area: 'drain', dirt: 'light' },
  { location: 'bathroom', area: 'drain', dirt: 'heavy' },
  { location: 'bathroom', area: 'shower', dirt: 'light' },
  { location: 'bathroom', area: 'shower', dirt: 'heavy' },
  { location: 'bathroom', area: 'toilet', dirt: 'light' },
  { location: 'bathroom', area: 'toilet', dirt: 'heavy' },
  { location: 'bathroom', area: 'ventilation', dirt: 'light' },
  { location: 'bathroom', area: 'ventilation', dirt: 'heavy' },
  { location: 'bathroom', area: 'washstand', dirt: 'light' },
  { location: 'bathroom', area: 'washstand', dirt: 'heavy' },
  
  // Kitchen (8 pages)
  { location: 'kitchen', area: 'gas', dirt: 'light' },
  { location: 'kitchen', area: 'gas', dirt: 'heavy' },
  { location: 'kitchen', area: 'ih', dirt: 'light' },
  { location: 'kitchen', area: 'ih', dirt: 'heavy' },
  { location: 'kitchen', area: 'sink', dirt: 'light' },
  { location: 'kitchen', area: 'sink', dirt: 'heavy' },
  { location: 'kitchen', area: 'ventilation', dirt: 'light' },
  { location: 'kitchen', area: 'ventilation', dirt: 'heavy' },
  
  // Toilet (4 pages)
  { location: 'toilet', area: 'floor', dirt: 'light' },
  { location: 'toilet', area: 'floor', dirt: 'heavy' },
  { location: 'toilet', area: 'toilet', dirt: 'light' },
  { location: 'toilet', area: 'toilet', dirt: 'heavy' },
  
  // Floor (8 pages)
  { location: 'floor', area: 'carpet', dirt: 'light' },
  { location: 'floor', area: 'carpet', dirt: 'heavy' },
  { location: 'floor', area: 'flooring', dirt: 'light' },
  { location: 'floor', area: 'flooring', dirt: 'heavy' },
  { location: 'floor', area: 'tatami', dirt: 'light' },
  { location: 'floor', area: 'tatami', dirt: 'heavy' },
  { location: 'floor', area: 'tile', dirt: 'light' },
  { location: 'floor', area: 'tile', dirt: 'heavy' },
  
  // Window (4 pages)
  { location: 'window', area: 'glass', dirt: 'light' },
  { location: 'window', area: 'glass', dirt: 'heavy' },
  { location: 'window', area: 'sash', dirt: 'light' },
  { location: 'window', area: 'sash', dirt: 'heavy' },
  
  // Living (8 pages)
  { location: 'living', area: 'carpet', dirt: 'light' },
  { location: 'living', area: 'carpet', dirt: 'heavy' },
  { location: 'living', area: 'sofa', dirt: 'light' },
  { location: 'living', area: 'sofa', dirt: 'heavy' },
  { location: 'living', area: 'table', dirt: 'light' },
  { location: 'living', area: 'table', dirt: 'heavy' },
  { location: 'living', area: 'wall', dirt: 'light' },
  { location: 'living', area: 'wall', dirt: 'heavy' },
];

// Category names in Japanese
const CATEGORY_NAMES = {
  detergents: '洗剤・クリーナー',
  brushes: 'スポンジ・ブラシ類',
  ppe: '保護具'
};

// Escape HTML entities
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Create product HTML
function createProductHTML(product) {
  const badgeHTML = product.badge === 'bestseller' ? '<p class="badge bestseller">ベストセラー</p>' : 
                    product.badge === 'amazon-choice' ? '<p class="badge amazon-choice">Amazon\'s Choice</p>' : '';
  
  // Escape HTML entities in title and alt attributes
  const escapedTitle = escapeHtml(product.title);
  
  return `                <li class="product-card">
                    <a href="https://www.amazon.co.jp/dp/${product.asin}?tag=asdfghj12-22" target="_blank" rel="nofollow noopener">
                        <img src="${product.image}" alt="${escapedTitle}" onerror="this.src='/img/no-image.svg'">
                        <p class="name">${escapedTitle}</p>
                        ${product.price ? `<p class="price">${product.price}</p>` : ''}
                        ${badgeHTML}
                    </a>
                </li>`;
}

// Create complete products section HTML
function createProductsSection(products) {
  return `
        <div class="section products-section">
            <h2>おすすめ商品</h2>
            
            <!-- ——— 洗剤・クリーナー ——— -->
            <h2 class="category-title">洗剤・クリーナー</h2>
            
            <!-- ——— Horizontal scroll row ——— -->
            <ul class="product-row">
${products.detergents.map(createProductHTML).join('\n')}
            </ul>
            
            <!-- ——— スポンジ・ブラシ類 ——— -->
            <h2 class="category-title">スポンジ・ブラシ類</h2>
            
            <!-- ——— Horizontal scroll row ——— -->
            <ul class="product-row">
${products.brushes.map(createProductHTML).join('\n')}
            </ul>
            
            <!-- ——— 保護具 ——— -->
            <h2 class="category-title">保護具</h2>
            
            <!-- ——— Horizontal scroll row ——— -->
            <ul class="product-row">
${products.ppe.map(createProductHTML).join('\n')}
            </ul>
        </div>`;
}

// Update HTML with new products - Fixed version
function updateHTMLWithProducts(originalHTML, products) {
  let html = originalHTML;
  
  // Add CSS link if not present
  if (!html.includes('product.css')) {
    html = html.replace('</head>', `    <link rel="stylesheet" href="/style/product.css">\n</head>`);
  }
  
  // Find the section containing おすすめ商品
  const recommendedStart = html.indexOf('<h2>おすすめ商品</h2>');
  
  if (recommendedStart !== -1) {
    // Find the parent section div
    let sectionStart = -1;
    let searchPos = recommendedStart;
    
    // Look backwards for the section div
    while (searchPos > 0) {
      searchPos = html.lastIndexOf('<div', searchPos - 1);
      if (searchPos !== -1) {
        const divText = html.substring(searchPos, searchPos + 30);
        if (divText.includes('class="section"')) {
          sectionStart = searchPos;
          break;
        }
      }
    }
    
    if (sectionStart !== -1) {
      // Count divs to find the matching closing tag
      let divCount = 0;
      let pos = sectionStart;
      let sectionEnd = -1;
      
      while (pos < html.length) {
        const nextOpen = html.indexOf('<div', pos);
        const nextClose = html.indexOf('</div>', pos);
        
        if (nextClose === -1) break;
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
          divCount++;
          pos = nextOpen + 4;
        } else {
          divCount--;
          pos = nextClose + 6;
          if (divCount === 0) {
            sectionEnd = pos;
            break;
          }
        }
      }
      
      if (sectionEnd !== -1) {
        // Replace the entire section
        const beforeSection = html.substring(0, sectionStart);
        const afterSection = html.substring(sectionEnd);
        const newProductsSection = createProductsSection(products);
        
        html = beforeSection + newProductsSection + afterSection;
      }
    }
  } else {
    // If no existing products section, find a good place to insert it
    // Look for the feedback section and insert before it
    const feedbackIndex = html.indexOf('method-feedback-section');
    if (feedbackIndex !== -1) {
      // Find the parent div of feedback section
      let insertPos = feedbackIndex;
      for (let i = feedbackIndex; i >= 0; i--) {
        if (html.substring(i - 5, i) === '<div>') {
          insertPos = i - 5;
          break;
        }
      }
      
      const beforeInsert = html.substring(0, insertPos);
      const afterInsert = html.substring(insertPos);
      const newProductsSection = createProductsSection(products);
      
      html = beforeInsert + newProductsSection + '\n\n' + afterInsert;
    }
  }
  
  // Clean up any duplicate closing divs at the end
  html = html.replace(/(\s*<\/div>\s*){4,}$/, '\n    </div>\n</body>\n</html>');
  
  // Also clean up orphaned closing divs in the old product sections
  html = html.replace(/(<\/div>\s*){2,}<h3>掃除道具<\/h3>/g, '\n            <h3>掃除道具</h3>');
  html = html.replace(/(<\/div>\s*){2,}<h3>保護具/g, '\n            <h3>保護具');
  
  return html;
}

// Read the original HTML file
async function readOriginalHTML(location, area, dirt) {
  const filePath = path.join(UPDATED_FINAL_DIR, location, `${area}-${dirt}.html`);
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading original file: ${filePath}`, error);
    return null;
  }
}

// Generate HTML for a single page
async function generatePage(pageConfig) {
  const { location, area, dirt } = pageConfig;
  console.log(`Generating: ${location}/${area}-${dirt}.html`);
  
  try {
    // Read original HTML
    const originalHTML = await readOriginalHTML(location, area, dirt);
    if (!originalHTML) {
      console.error(`Skipping ${location}/${area}-${dirt}.html - original file not found`);
      return false;
    }
    
    // Fetch products
    const products = await fetchProducts({ location, dirt });
    
    // Validate we have 5 products per category
    for (const [category, items] of Object.entries(products)) {
      if (items.length < 5) {
        console.warn(`Warning: Only ${items.length} products for ${category} in ${location}-${dirt}`);
        // Pad with empty products if needed
        while (items.length < 5) {
          items.push({
            asin: `PLACEHOLDER${items.length}`,
            title: `商品準備中`,
            image: '/img/no-image.svg',
            price: '',
            badge: ''
          });
        }
      }
    }
    
    // Update HTML with new products
    const updatedHTML = updateHTMLWithProducts(originalHTML, products);
    
    // Create output directory
    const outputDir = path.join(PUBLIC_DIR, location);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write the file
    const outputPath = path.join(outputDir, `${area}-${dirt}.html`);
    await fs.writeFile(outputPath, updatedHTML, 'utf8');
    
    console.log(`✓ Generated: ${outputPath}`);
    return true;
    
  } catch (error) {
    console.error(`Error generating ${location}/${area}-${dirt}.html:`, error);
    return false;
  }
}

// Create no-image.svg if it doesn't exist
async function createNoImageSVG() {
  const imgDir = path.join(PUBLIC_DIR, 'img');
  await fs.mkdir(imgDir, { recursive: true });
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f0f0f0"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial" font-size="14">No Image</text>
</svg>`;
  
  await fs.writeFile(path.join(imgDir, 'no-image.svg'), svgContent);
}

// Main build function
async function buildAllPages() {
  console.log('Starting static site generation (with fixes)...\n');
  console.log(`Total pages to generate: ${PAGES.length}`);
  console.log('=' .repeat(50) + '\n');
  
  // Create necessary directories and files
  await createNoImageSVG();
  
  let successCount = 0;
  let failCount = 0;
  
  // Process all pages
  for (const pageConfig of PAGES) {
    const success = await generatePage(pageConfig);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Build complete!`);
  console.log(`Success: ${successCount} pages`);
  console.log(`Failed: ${failCount} pages`);
  console.log(`Total: ${PAGES.length} pages`);
  console.log('='.repeat(50));
  
  return failCount === 0;
}

// Run the build
buildAllPages()
  .then(success => {
    if (success) {
      console.log('\n✅ All pages generated successfully!');
      console.log('\nRun validation: npm run validate');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some pages failed to generate');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  });