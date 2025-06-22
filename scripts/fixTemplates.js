import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPDATED_FINAL_DIR = path.join(__dirname, '..', 'updated-final');

// Fix HTML content
function fixHTMLContent(html) {
  let fixed = html;
  
  // 1. Fix stray closing divs before </body> or </section>
  fixed = fixed.replace(/<\/div>\s*<\/div>\s*(<\/(?:body|section)>)/g, '</div>$1');
  
  // 2. Encode unencoded ampersands
  fixed = fixed.replace(/&(?![#a-z0-9]+;)/gi, '&amp;');
  
  // 3. Add type attribute to buttons
  fixed = fixed.replace(/<button(?![^>]*\btype=)/gi, '<button type="button"');
  
  // 4. Fix specific patterns that cause validation errors
  // Remove extra closing divs at the end of sections
  fixed = fixed.replace(/(<\/div>\s*){3,}<\/body>/g, '</div>\n</body>');
  
  // Fix broken div structures around product sections
  fixed = fixed.replace(/\s*<\/div>\s*<\/div>\s*<\/div>\s*\n\s*<\/div>/g, '\n            </div>');
  
  // Clean up empty div sections
  fixed = fixed.replace(/<div class="product-grid">\s*<div class="product-grid-inner">\s*<\/div>\s*<\/div>/g, '');
  
  // Fix incomplete sections
  fixed = fixed.replace(/\s*<\/div>\s*\n\s*<h3/g, '\n            <h3');
  
  // 5. Fix unclosed divs in sections
  // Count opening and closing divs to balance them
  let divStack = [];
  let result = '';
  let buffer = '';
  let inTag = false;
  let tagName = '';
  
  for (let i = 0; i < fixed.length; i++) {
    const char = fixed[i];
    
    if (char === '<') {
      inTag = true;
      tagName = '';
      buffer = '<';
    } else if (inTag && char === '>') {
      buffer += char;
      inTag = false;
      
      // Check if it's an opening or closing div
      if (tagName.toLowerCase() === 'div') {
        divStack.push(i);
      } else if (tagName.toLowerCase() === '/div') {
        if (divStack.length > 0) {
          divStack.pop();
        }
      }
      
      result += buffer;
      buffer = '';
    } else if (inTag) {
      buffer += char;
      if (char !== ' ' && char !== '\n' && char !== '\t') {
        tagName += char;
      }
    } else {
      result += char;
    }
  }
  
  // If we're about to close body but have unclosed divs, close them
  if (divStack.length > 0) {
    const bodyMatch = result.match(/(<\/body>)/);
    if (bodyMatch) {
      const closingDivs = '</div>\n'.repeat(divStack.length);
      result = result.replace(/<\/body>/, closingDivs + '</body>');
    }
  }
  
  // Final cleanup - remove stray closing divs that don't have matching opening divs
  result = result.replace(/^\s*<\/div>\s*\n/gm, '');
  result = result.replace(/\s*<\/div>\s*<\/div>\s*<\/div>\s*$/gm, '</div>');
  
  return result;
}

// Process a single HTML file
async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const fixed = fixHTMLContent(content);
    
    if (content !== fixed) {
      await fs.writeFile(filePath, fixed, 'utf8');
      console.log(`✓ Fixed: ${path.relative(UPDATED_FINAL_DIR, filePath)}`);
      return true;
    } else {
      console.log(`  No changes needed: ${path.relative(UPDATED_FINAL_DIR, filePath)}`);
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
async function fixAllTemplates() {
  console.log('Starting template cleanup...\n');
  console.log(`Directory: ${UPDATED_FINAL_DIR}`);
  console.log('=' .repeat(50) + '\n');
  
  try {
    // Find all HTML files
    const htmlFiles = await findHTMLFiles(UPDATED_FINAL_DIR);
    console.log(`Found ${htmlFiles.length} HTML files\n`);
    
    let fixedCount = 0;
    
    // Process each file
    for (const file of htmlFiles) {
      const wasFixed = await processFile(file);
      if (wasFixed) fixedCount++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Cleanup complete!`);
    console.log(`Fixed: ${fixedCount} files`);
    console.log(`Total: ${htmlFiles.length} files`);
    console.log('='.repeat(50));
    
    return fixedCount > 0;
  } catch (error) {
    console.error('Failed to process templates:', error);
    return false;
  }
}

// Run the fix
fixAllTemplates()
  .then(hasChanges => {
    if (hasChanges) {
      console.log('\n✅ Templates have been cleaned!');
      console.log('\nNext steps:');
      console.log('1. Run: node scripts/buildPages.js');
      console.log('2. Run: npm run validate');
    } else {
      console.log('\n✅ All templates were already clean!');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Template cleanup failed:', error);
    process.exit(1);
  });