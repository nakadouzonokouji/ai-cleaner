import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Add missing container closing div
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    let originalHtml = html;
    
    // Add missing closing div for container before </body>
    // Pattern: </body> without proper closing of container div
    html = html.replace(/(\n\n)(<!-- 掃除方法フィードバックセクション -->\n\n\n<\/body>)/g, '$1</div>\n\n$2');
    
    // For files that already have feedback section
    html = html.replace(/(<\/script>\n\n\n\n)([\s\S]*?<div class="section products-section">)/g, '$1    </div>\n\n$2');
    
    // Ensure container div is closed before body tag
    if (!html.includes('</div>\n\n</body>') && !html.includes('</div>\n</body>')) {
      html = html.replace(/(\n)(<\/body>)/g, '$1</div>\n$2');
    }
    
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
  console.log('🔧 Adding missing container closing divs...\n');
  
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
      console.log('\n✅ Container div fix completed!');
      console.log('\nHTML VALIDATION SHOULD NOW PASS ✅');
      console.log('\nRun: npm run validate');
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