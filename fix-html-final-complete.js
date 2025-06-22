import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Final comprehensive HTML fix
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    let originalHtml = html;
    
    // Fix the step divs - ensure each step div is properly closed
    // Pattern: <div class="step"> ... <div class="step-content"> ... </div> BUT missing closing </div> for step
    html = html.replace(/(<div class="step">[\s\S]*?<div class="step-content">[\s\S]*?<\/div>)\s*(?=<div class="step">|<!-- 掃除方法フィードバック)/g, '$1\n            </div>\n            ');
    
    // Fix the last step in each section (before feedback section)
    html = html.replace(/(<div class="step">[\s\S]*?<div class="step-content">[\s\S]*?<\/div>)\s*(<!-- 掃除方法フィードバック)/g, '$1\n            </div>\n        </div>\n    </div>\n\n$2');
    
    // Fix sink-heavy.html specific issues
    if (filePath.includes('sink-heavy.html')) {
      // Remove orphaned h3 tags
      html = html.replace(/<h3 class="category-title">専門掃除道具（5選）<\/h3>[\s\S]*?<\/div>\s*<\/div>/g, '');
      // Fix the structure around products section
      html = html.replace(/(<\/div>)\s*(<div class="back-button-container">)/g, '$1\n        \n$2');
    }
    
    // Ensure feedback section structure is correct
    html = html.replace(/(<div class="feedback-comment"[^>]*>[\s\S]*?<button[^>]*>[^<]*<\/button>)\s*(<div class="feedback-message")/g, '$1\n    </div>\n    $2');
    
    // Fix the overall page structure - ensure all main sections are properly closed
    html = html.replace(/(<\/script>)\s*(<!-- 掃除方法フィードバック)/g, '$1\n\n\n\n$2');
    
    // Clean up excessive whitespace
    html = html.replace(/\n{5,}/g, '\n\n\n\n');
    
    // Only write if changes were made
    if (html !== originalHtml) {
      await fs.writeFile(filePath, html, 'utf8');
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`✔️ No changes needed: ${path.basename(filePath)}`);
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Process all HTML files
async function fixAllHTMLFiles() {
  console.log('🔧 Final comprehensive HTML fix...\n');
  
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
      console.log('\nRun validation to confirm: npm run validate');
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