import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix kitchen pages HTML validation errors
async function fixKitchenPages() {
  console.log('🔧 Fixing kitchen pages HTML validation errors...\n');
  
  const kitchenPages = [
    'public/kitchen/gas-heavy.html',
    'public/kitchen/gas-light.html',
    'public/kitchen/ih-light.html'
  ];
  
  let totalFixed = 0;
  let totalErrors = 0;
  
  for (const file of kitchenPages) {
    const filePath = path.join(__dirname, file);
    const filename = path.basename(file);
    
    try {
      let html = await fs.readFile(filePath, 'utf8');
      const originalHtml = html;
      
      // Fix the extra closing divs after the cleaning steps section
      // Pattern: Multiple closing divs after step list ending with </div>
      html = html.replace(
        /(<\/div>\s*<\/div>)\s*<\/div>\s*<\/div>\s*<\/div>\s*(<\/div>\s*<!-- 掃除方法フィードバックセクション -->)/g,
        '$1\n$2'
      );
      
      // Alternative pattern if above doesn't match
      // Remove the extra closing divs between cleaning steps and feedback section
      html = html.replace(
        /(<\/div>\s*)\n\s*<\/div>\s*<\/div>\s*<\/div>\s*(\n\s*<\/div>\s*<!-- 掃除方法フィードバックセクション -->)/g,
        '$1$2'
      );
      
      // Fix the stray closing div before </body>
      html = html.replace(
        /(<\/div>)\s*(<\/div>)\s*(\n\s*<!-- 掃除方法フィードバックセクション -->\s*\n\s*\n\s*<\/body>)/g,
        '$1$3'
      );
      
      // Clean up any remaining duplicate closing divs
      html = html.replace(
        /(<\/ul>\s*<\/div>)\s*(<\/div>)\s*(\n\s*<!-- 掃除方法フィードバックセクション -->)/g,
        '$1$3'
      );
      
      if (html !== originalHtml) {
        await fs.writeFile(filePath, html, 'utf8');
        console.log(`✅ Fixed: ${filename}`);
        totalFixed++;
      } else {
        console.log(`✔️ No changes needed: ${filename}`);
      }
      
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
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
fixKitchenPages()
  .then(success => {
    if (success) {
      console.log('\n✅ Kitchen pages fixed successfully!');
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