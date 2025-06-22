import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

// Fix HTML validation errors comprehensively
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    
    // Split into lines for easier processing
    const lines = html.split('\n');
    const fixedLines = [];
    let inProductsSection = false;
    let afterStepsSection = false;
    let skipNextDivs = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Detect when we're after the steps section
      if (trimmedLine.includes('class="step-title">換気扇') || 
          trimmedLine.includes('防カビコーティング') ||
          trimmedLine.includes('最終チェック') ||
          trimmedLine.includes('仕上げに除菌スプレー')) {
        afterStepsSection = true;
      }
      
      // Skip the orphaned divs after steps section
      if (afterStepsSection && !inProductsSection) {
        if (trimmedLine === '</div>' && skipNextDivs < 5) {
          // Check if this is the problematic area
          if (i + 1 < lines.length && lines[i + 1].trim().includes('category-title')) {
            skipNextDivs++;
            continue;
          }
          if (i + 2 < lines.length && lines[i + 2].trim().includes('category-title')) {
            skipNextDivs++;
            continue;
          }
          if (i + 3 < lines.length && lines[i + 3].trim() === '</div>') {
            skipNextDivs++;
            continue;
          }
        }
      }
      
      // Detect products section
      if (trimmedLine.includes('class="section products-section"')) {
        inProductsSection = true;
        afterStepsSection = false;
      }
      
      // Detect end of products section
      if (inProductsSection && trimmedLine.includes('<!-- 掃除方法フィードバック')) {
        inProductsSection = false;
      }
      
      // Add button type attribute
      let processedLine = line;
      if (line.includes('<button') && !line.includes('type=')) {
        processedLine = processedLine.replace(/<button/g, '<button type="button"');
      }
      
      // Fix unescaped & in content
      if (!processedLine.includes('href=') && !processedLine.includes('src=')) {
        processedLine = processedLine.replace(/&(?!(amp|lt|gt|quot|#039|#\d+);)/g, '&amp;');
      }
      
      fixedLines.push(processedLine);
    }
    
    html = fixedLines.join('\n');
    
    // Now fix the structure issues more aggressively
    // Remove the problematic section between steps and products
    html = html.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<h3[^>]*class="category-title"[^>]*>.*?<\/h3>\s*<\/div>\s*<\/div>\s*<\/div>)/gs, '');
    
    // Fix the feedback section placement
    html = html.replace(/(<\/ul>\s*)(<!-- 掃除方法フィードバックセクション -->)/g, '$1\n        </div>\n\n$2');
    
    // Ensure proper closing before body tag
    html = html.replace(/(<\/ul>\s*)(<\/body>)/g, '$1\n        </div>\n\n$2');
    
    // Remove duplicate </body> or </html> tags
    html = html.replace(/(<\/body>\s*<\/html>\s*)+$/g, '\n</body>\n</html>');
    
    await fs.writeFile(filePath, html, 'utf8');
    console.log(`✅ Fixed: ${path.relative(PUBLIC_DIR, filePath)}`);
    return true;
    
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
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await getHTMLFiles(fullPath));
      } else if (entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const htmlFiles = await getHTMLFiles(PUBLIC_DIR);
  console.log(`Found ${htmlFiles.length} HTML files to process.\n`);
  
  for (const file of htmlFiles) {
    try {
      const fixed = await fixHTMLFile(file);
      if (fixed) totalFixed++;
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error.message);
      totalErrors++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Processed ${totalFixed} files`);
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
      console.log('\n✅ Final validation fixes applied!');
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