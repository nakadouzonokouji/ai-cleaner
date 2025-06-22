import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Comprehensive HTML structure fix
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    let originalHtml = html;
    
    // 1. Fix step-content divs that are not properly closed
    // Match step-content with step-detail but missing closing div
    html = html.replace(/(<div class="step-content">\s*<div class="step-title">[^<]*<\/div>\s*<div class="step-detail">[^<]*<\/div>)\s*(?!<\/div>)/g, '$1\n                </div>');
    
    // 2. Fix feedback comment section structure
    // Ensure feedback-comment div is properly closed
    html = html.replace(/(<textarea[^>]*>[\s\S]*?<\/textarea>\s*<button[^>]*>[\s\S]*?<\/button>)\s*(<div class="feedback-message")/g, '$1\n    </div>\n    $2');
    
    // 3. Fix missing closing divs after feedback message
    html = html.replace(/(<div class="feedback-message"[^>]*>[\s\S]*?<\/div>)(?!\s*<\/div>)/g, '$1\n</div>');
    
    // 4. Fix orphaned closing divs at end of file
    html = html.replace(/(\s*<\/div>\s*){5,}$/g, '');
    
    // 5. Fix unclosed sections before <!-- 掃除方法フィードバック
    html = html.replace(/(<\/div>)\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*<!-- 掃除方法フィードバック/g, '$1\n                </div>\n            </div>\n        </div>\n    </div>\n\n<!-- 掃除方法フィードバック');
    
    // 6. Fix products section closing
    html = html.replace(/(<\/ul>\s*)\n\s*\n\s*<\/div>\s*\n\s*<!-- 掃除方法フィードバック/g, '$1\n        </div>\n\n<!-- 掃除方法フィードバック');
    
    // 7. Ensure proper body and html closing
    html = html.replace(/(<\/body>\s*<\/html>)\s*$/g, '\n$1');
    
    // 8. Count and balance divs
    let divBalance = 0;
    let inScript = false;
    let inComment = false;
    
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip script and comment content
      if (line.includes('<script')) inScript = true;
      if (line.includes('</script>')) inScript = false;
      if (line.includes('<!--')) inComment = true;
      if (line.includes('-->')) inComment = false;
      
      if (!inScript && !inComment) {
        // Count opening divs
        const openDivs = (line.match(/<div[^>]*>/g) || []).length;
        // Count closing divs
        const closeDivs = (line.match(/<\/div>/g) || []).length;
        divBalance += openDivs - closeDivs;
      }
    }
    
    // Add missing closing divs before </body>
    if (divBalance > 0) {
      const closingDivs = '</div>\n'.repeat(divBalance);
      html = html.replace(/(\s*)(<\/body>)/g, `$1${closingDivs}$1$2`);
    }
    
    // 9. Fix specific structural issues in sink-heavy.html
    if (filePath.includes('sink-heavy.html')) {
      // Fix the broken structure after step list
      html = html.replace(/(<\/div>\s*<div class="back-button-container">)/g, '</div>\n        \n$1');
      // Fix orphaned h3 tags
      html = html.replace(/\s*<h3 class="category-title">[^<]*<\/h3>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');
    }
    
    // 10. Remove excessive empty lines
    html = html.replace(/\n{4,}/g, '\n\n\n');
    
    // Only write if changes were made
    if (html !== originalHtml) {
      await fs.writeFile(filePath, html, 'utf8');
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`✔️ Already valid: ${path.basename(filePath)}`);
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Process all HTML files
async function fixAllHTMLFiles() {
  console.log('🔧 Final HTML validation fix...\n');
  
  let totalFixed = 0;
  let totalErrors = 0;
  
  // Get all HTML files recursively
  async function getHTMLFiles(dir) {
    const files = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.includes('node_modules')) {
          files.push(...await getHTMLFiles(fullPath));
        } else if (entry.name.endsWith('.html')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
    
    return files;
  }
  
  const publicDir = path.join(__dirname, 'public');
  const htmlFiles = await getHTMLFiles(publicDir);
  
  console.log(`Found ${htmlFiles.length} HTML files to process.\n`);
  
  // Group files by directory
  const filesByDir = {};
  htmlFiles.forEach(file => {
    const dir = path.dirname(file).replace(publicDir, 'public');
    if (!filesByDir[dir]) filesByDir[dir] = [];
    filesByDir[dir].push(file);
  });
  
  // Process files by directory
  for (const [dir, files] of Object.entries(filesByDir)) {
    console.log(`\n📁 ${dir}:`);
    for (const file of files) {
      const fixed = await fixHTMLFile(file);
      if (fixed) totalFixed++;
      else totalErrors++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Processed ${totalFixed} files successfully`);
  if (totalErrors > 0) {
    console.log(`❌ Failed to fix ${totalErrors} files`);
  }
  console.log('='.repeat(50));
  
  return totalErrors === 0;
}

// Run the fixes
fixAllHTMLFiles()
  .then(success => {
    if (success) {
      console.log('\n✅ HTML validation fixes completed!');
      console.log('\nNext: Run validation check');
      process.exit(0);
    } else {
      console.log('\n⚠️ Some files could not be fixed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });