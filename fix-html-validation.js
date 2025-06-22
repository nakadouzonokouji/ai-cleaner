import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

// HTML entity encoding
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

// Fix HTML validation errors in a file
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    const originalHtml = html;
    
    // 1. Remove duplicate meta tags
    const metaViewportMatches = html.match(/<meta\s+name="viewport"[^>]*>/gi);
    if (metaViewportMatches && metaViewportMatches.length > 1) {
      // Keep only the first viewport meta tag
      let firstFound = false;
      html = html.replace(/<meta\s+name="viewport"[^>]*>/gi, (match) => {
        if (!firstFound) {
          firstFound = true;
          return match;
        }
        return '';
      });
    }
    
    // 2. Fix unescaped & characters in text content (not in URLs)
    // First protect URLs
    const urlPlaceholders = [];
    html = html.replace(/href="[^"]+"/g, (match) => {
      const placeholder = `__URL_PLACEHOLDER_${urlPlaceholders.length}__`;
      urlPlaceholders.push(match);
      return placeholder;
    });
    
    // Fix & in content (but not &amp; &lt; etc)
    html = html.replace(/>([^<]*)</g, (match, content) => {
      const fixed = content.replace(/&(?!(amp|lt|gt|quot|#039|#\d+);)/g, '&amp;');
      return `>${fixed}<`;
    });
    
    // Restore URLs
    urlPlaceholders.forEach((url, index) => {
      html = html.replace(`__URL_PLACEHOLDER_${index}__`, url);
    });
    
    // 3. Remove orphaned closing divs before the products section
    html = html.replace(/(\s*<\/div>\s*){2,}(\s*<div class="section products-section">)/g, '$2');
    
    // 4. Remove extra closing divs after the products section
    html = html.replace(/(<\/div>\s*<!-- ——— 保護具 ——— -->)/g, '<!-- ——— 保護具 ——— -->');
    html = html.replace(/(<\/div>\s*<h2 class="category-title">)/g, '<h2 class="category-title">');
    html = html.replace(/(<\/div>\s*<h3 class="category-title">)/g, '<h3 class="category-title">');
    
    // 5. Clean up the old product-grid sections that remain after our products
    // Find our products section end and remove everything until feedback section or body close
    const productsEndPattern = /<\/div>\s*<\/div>\s*<h3>掃除道具<\/h3>/;
    const feedbackStartPattern = /<!-- 掃除方法フィードバックセクション -->/;
    
    const productsEndMatch = html.match(productsEndPattern);
    const feedbackStartMatch = html.match(feedbackStartPattern);
    
    if (productsEndMatch && feedbackStartMatch) {
      const startPos = html.indexOf(productsEndMatch[0]);
      const endPos = html.indexOf(feedbackStartMatch[0]);
      
      if (startPos < endPos) {
        // Replace the messy middle section with clean divs
        const beforeSection = html.substring(0, startPos);
        const afterSection = html.substring(endPos);
        html = beforeSection + '\n        </div>\n\n' + afterSection;
      }
    }
    
    // 6. Fix unclosed product-grid divs by removing them entirely
    html = html.replace(/<h3>掃除道具<\/h3>\s*<div class="product-grid">\s*<div class="product-grid-inner">[\s\S]*?(?=<h3>保護具|<!-- 掃除方法フィードバック|<\/body>)/g, '');
    html = html.replace(/<h3>保護具.*?<\/h3>\s*<div class="product-grid">\s*<div class="product-grid-inner">[\s\S]*?(?=<!-- 掃除方法フィードバック|<\/body>)/g, '');
    
    // 7. Ensure proper structure - count divs and fix imbalances
    let divBalance = 0;
    let inProductsSection = false;
    const lines = html.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track when we're in products section
      if (line.includes('class="section products-section"')) {
        inProductsSection = true;
        divBalance = 0;
      }
      
      if (inProductsSection) {
        if (line.includes('<div')) {
          divBalance += (line.match(/<div/g) || []).length;
        }
        if (line.includes('</div>')) {
          divBalance -= (line.match(/<\/div>/g) || []).length;
        }
        
        // If we're at the end of products section and divs are balanced
        if (divBalance === 0 && line.trim() === '</div>' && i > 0 && fixedLines[fixedLines.length - 1].includes('</ul>')) {
          inProductsSection = false;
        }
      }
      
      // Skip orphaned closing divs right before products section
      if (!inProductsSection && line.trim() === '</div>' && i < lines.length - 1 && lines[i + 1].includes('class="section products-section"')) {
        continue;
      }
      
      fixedLines.push(line);
    }
    
    html = fixedLines.join('\n');
    
    // 8. Add type="button" to button elements
    html = html.replace(/<button\s+([^>]*?)(?!type=)([^>]*?)>/g, '<button type="button" $1$2>');
    
    // 9. Remove obsolete attributes
    html = html.replace(/\s+border="0"/g, '');
    html = html.replace(/\s+cellpadding="\d+"/g, '');
    html = html.replace(/\s+cellspacing="\d+"/g, '');
    
    // 10. Final cleanup - ensure body and html close properly
    if (!html.includes('</body>')) {
      html = html.replace(/<\/html>\s*$/, '</body>\n</html>');
    }
    
    // Only write if changes were made
    if (html !== originalHtml) {
      await fs.writeFile(filePath, html, 'utf8');
      console.log(`✅ Fixed: ${path.relative(PUBLIC_DIR, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Process all HTML files
async function fixAllHTMLFiles() {
  console.log('🔧 Fixing HTML validation errors...\n');
  
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
      console.log('\n✅ All validation errors fixed!');
      console.log('Run "npm run validate" to verify.');
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