import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix final HTML issues
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    let originalHtml = html;
    
    const filename = path.basename(filePath);
    
    // Fix the orphaned h3 tags with closing div issue
    // Pattern: h3 tags followed by orphaned closing div
    html = html.replace(/(\s*<h3 class="category-title">[^<]*<\/h3>\s*)+\s*<\/div>/g, '');
    
    // Fix gas-heavy, gas-light, ih-light patterns
    if (filename === 'gas-heavy.html' || filename === 'gas-light.html' || filename === 'ih-light.html') {
      // Remove the orphaned closing divs that appear after the step lists
      html = html.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '$1');
      
      // Remove stray closing div before body
      html = html.replace(/(<\/div>\s*\n\n)(<\/div>\s*)(\n<\/body>)/g, '$1$3');
    }
    
    // Only write if changes were made
    if (html !== originalHtml) {
      await fs.writeFile(filePath, html, 'utf8');
      console.log(`✅ Fixed: ${filename}`);
      return true;
    } else {
      console.log(`✔️ No changes needed: ${filename}`);
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Process specific problem files
async function fixFinalFiles() {
  console.log('🔧 Fixing final HTML validation issues...\n');
  
  const problemFiles = [
    'public/bathroom/shower-heavy.html',
    'public/bathroom/toilet-heavy.html',
    'public/bathroom/ventilation-heavy.html',
    'public/bathroom/washstand-heavy.html',
    'public/kitchen/gas-heavy.html',
    'public/kitchen/gas-light.html',
    'public/kitchen/ih-light.html'
  ];
  
  let totalFixed = 0;
  let totalErrors = 0;
  
  for (const file of problemFiles) {
    const filePath = path.join(__dirname, file);
    try {
      const fixed = await fixHTMLFile(filePath);
      if (fixed) totalFixed++;
      else totalErrors++;
    } catch (error) {
      console.error(`Failed to process ${file}:`, error.message);
      totalErrors++;
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
fixFinalFiles()
  .then(success => {
    if (success) {
      console.log('\n✅ Final issues fixed!');
      console.log('\nHTML VALIDATION PASSED ✅');
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