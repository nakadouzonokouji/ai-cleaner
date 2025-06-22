import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

// Comprehensive fix for HTML structure
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    
    // Fix unclosed divs in step content
    html = html.replace(/(<div class="step-content">[\s\S]*?<div class="step-detail">[\s\S]*?<\/div>)\s*$/gm, '$1\n                </div>');
    
    // Fix unclosed step divs
    html = html.replace(/(<div class="step">[\s\S]*?<\/div>\s*<\/div>)(\s*<div class="step">)/g, '$1\n            </div>$2');
    
    // Fix the last step in the steps section
    html = html.replace(/(<div class="step-detail">[\s\S]*?<\/div>)\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*<!-- 掃除方法フィードバック/g, '$1\n                </div>\n            </div>\n        </div>\n    </div>\n\n<!-- 掃除方法フィードバック');
    
    // Fix unclosed divs in feedback comment section
    html = html.replace(/(<textarea[^>]*>[\s\S]*?<\/textarea>\s*<button[^>]*>[\s\S]*?<\/button>)\s*(<div class="feedback-message")/g, '$1\n    </div>\n    $2');
    
    // Ensure products section is properly closed
    html = html.replace(/(<\/ul>\s*)\n\s*\n\s*<\/div>\s*\n\s*<!-- 掃除方法フィードバック/g, '$1\n        </div>\n\n<!-- 掃除方法フィードバック');
    
    // Fix any remaining structure issues by ensuring proper nesting
    const lines = html.split('\n');
    const fixedLines = [];
    let divStack = [];
    let inBody = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Track when we enter body
      if (trimmedLine.includes('<body')) {
        inBody = true;
        divStack = [];
      }
      
      // Track div openings
      if (inBody && line.includes('<div')) {
        const matches = line.match(/<div/g);
        if (matches) {
          for (let j = 0; j < matches.length; j++) {
            divStack.push(i);
          }
        }
      }
      
      // Track div closings
      if (inBody && line.includes('</div>')) {
        const matches = line.match(/<\/div>/g);
        if (matches) {
          for (let j = 0; j < matches.length; j++) {
            if (divStack.length > 0) {
              divStack.pop();
            }
          }
        }
      }
      
      // Before body close, ensure all divs are closed
      if (trimmedLine === '</body>' && divStack.length > 0) {
        // Add missing closing divs
        for (let j = 0; j < divStack.length; j++) {
          fixedLines.push('    </div>');
        }
        divStack = [];
      }
      
      fixedLines.push(line);
    }
    
    html = fixedLines.join('\n');
    
    // Final cleanup - ensure no duplicate body/html closing tags
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
  console.log('🔧 Complete HTML structure fix...\n');
  
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
  console.log(`✅ Fixed ${totalFixed} files`);
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
      console.log('\n✅ HTML structure completely fixed!');
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