import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Fix HTML validation errors
function fixHTMLValidation(html) {
  let fixed = html;
  
  // 1. Encode unencoded ampersands
  fixed = fixed.replace(/&(?![#a-z0-9]+;)/gi, '&amp;');
  
  // 2. Add type attribute to buttons
  fixed = fixed.replace(/<button(?![^>]*\btype=)/gi, '<button type="button"');
  
  // 3. Fix the structure issues
  // Remove empty product grids
  fixed = fixed.replace(/<div class="product-grid">\s*<div class="product-grid-inner">\s*<\/div>\s*<\/div>/g, '');
  
  // Fix broken product sections
  fixed = fixed.replace(/<\/div>\s*<h3>掃除道具<\/h3>\s*<div class="product-grid">\s*<div class="product-grid-inner">\s*<\/div>\s*<\/div>/g, '');
  fixed = fixed.replace(/<\/div>\s*<h3>保護具<\/h3>\s*<div class="product-grid">\s*<div class="product-grid-inner">\s*<\/div>\s*<\/div>/g, '');
  
  // Fix unclosed product list divs
  fixed = fixed.replace(/<div class="product-list">\s*<\/div>/g, '<div class="product-list">\n                    </div>\n                </div>\n            </div>');
  
  // Fix specific patterns that break structure
  fixed = fixed.replace(/<\/div>\s*<h3>掃除道具<\/h3>/g, '</div>\n                </div>\n            </div>');
  fixed = fixed.replace(/<\/div>\s*<h3>保護具<\/h3>/g, '</div>\n                </div>\n            </div>');
  
  // Fix orphaned h3 tags
  fixed = fixed.replace(/(<\/div>\s*)+<h3>([^<]+)<\/h3>\s*$/gm, '');
  
  // Fix specific heavy file issues with stray closing divs
  if (html.includes('class="warning"') || html.includes('class="notice"')) {
    // Fix stray closing divs after warning/notice sections
    fixed = fixed.replace(/(<div class="(?:warning|notice)">[\s\S]*?<\/div>)\s*<\/div>\s*<\/div>\s*<\/div>/g, '$1');
    // Fix h3 tags that appear outside proper structure
    fixed = fixed.replace(/<\/div>\s*<h3 class="category-title">/g, '\n            <h3 class="category-title">');
  }
  
  // Fix feedback section structure
  fixed = fixed.replace(/(<div class="method-feedback-section">[\s\S]*?<\/div>)\s*<\/div>\s*<\/div>/g, '$1');
  
  // Clean up excessive closing divs before body
  let bodyIndex = fixed.lastIndexOf('</body>');
  if (bodyIndex > -1) {
    let beforeBody = fixed.substring(0, bodyIndex);
    let afterBody = fixed.substring(bodyIndex);
    
    // Count unclosed divs
    let openDivs = (beforeBody.match(/<div[^>]*>/g) || []).length;
    let closeDivs = (beforeBody.match(/<\/div>/g) || []).length;
    let unclosed = openDivs - closeDivs;
    
    if (unclosed > 0) {
      // Add missing closing divs
      let closingDivs = '';
      for (let i = 0; i < unclosed; i++) {
        closingDivs += '</div>\n';
      }
      fixed = beforeBody + '\n' + closingDivs + afterBody;
    } else if (unclosed < 0) {
      // Remove extra closing divs
      let extraDivs = Math.abs(unclosed);
      for (let i = 0; i < extraDivs; i++) {
        beforeBody = beforeBody.replace(/\s*<\/div>\s*$/, '');
      }
      fixed = beforeBody + '\n' + afterBody;
    }
  }
  
  // Final cleanup
  fixed = fixed.replace(/\n\n\n+/g, '\n\n');
  fixed = fixed.replace(/\s*<\/body>/g, '\n</body>');
  
  return fixed;
}

// Process a single HTML file
async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const fixed = fixHTMLValidation(content);
    
    if (content !== fixed) {
      await fs.writeFile(filePath, fixed, 'utf8');
      console.log(`✓ Fixed: ${path.relative(PUBLIC_DIR, filePath)}`);
      return true;
    } else {
      console.log(`  No changes needed: ${path.relative(PUBLIC_DIR, filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursively find all HTML files
async function findHTMLFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findHTMLFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main function
async function fixAllHTML() {
  console.log('Starting HTML structure fix...\n');
  console.log(`Directory: ${PUBLIC_DIR}`);
  console.log('=' .repeat(50) + '\n');
  
  try {
    // Find all HTML files
    const htmlFiles = await findHTMLFiles(PUBLIC_DIR);
    console.log(`Found ${htmlFiles.length} HTML files\n`);
    
    let fixedCount = 0;
    
    // Process each file
    for (const file of htmlFiles) {
      const wasFixed = await processFile(file);
      if (wasFixed) fixedCount++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Fix complete!`);
    console.log(`Fixed: ${fixedCount} files`);
    console.log(`Total: ${htmlFiles.length} files`);
    console.log('='.repeat(50));
    
    return fixedCount > 0;
  } catch (error) {
    console.error('Failed to fix HTML:', error);
    return false;
  }
}

// Run the fix
fixAllHTML()
  .then(hasChanges => {
    if (hasChanges) {
      console.log('\n✅ HTML files have been fixed!');
      console.log('\nNext step: npm run validate');
    } else {
      console.log('\n✅ All HTML files were already valid!');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ HTML fix failed:', error);
    process.exit(1);
  });