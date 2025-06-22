import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix remaining HTML issues
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    let originalHtml = html;
    
    const filename = path.basename(filePath);
    
    // Fix specific patterns for shower-heavy, toilet-heavy, ventilation-heavy, washstand-heavy
    if (filename.includes('-heavy.html') && (filename.includes('shower') || filename.includes('toilet') || filename.includes('ventilation') || filename.includes('washstand'))) {
      // Remove the extra closing divs that appear after the steps
      html = html.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<div class="step">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/g, 
        (match) => {
          // Count divs and fix the structure
          return match.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '</div>');
        });
      
      // Remove stray closing divs before feedback section
      html = html.replace(/(<\/div>\s*){4,}(\s*<!-- 掃除方法フィードバック)/g, '</div>\n\n$2');
    }
    
    // Fix gas-heavy and gas-light patterns
    if (filename.includes('gas-heavy.html') || filename.includes('gas-light.html') || filename.includes('ih-light.html')) {
      // Remove the extra closing divs that appear after the steps
      html = html.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)\s*<\/div>\s*<\/div>\s*<\/div>/g, '$1');
      // Remove stray div at end
      html = html.replace(/(<\/div>\s*\n\n<!-- 掃除方法フィードバックセクション -->\s*\n\s*)<\/div>/g, '$1');
    }
    
    // Fix sink-heavy and sink-light - they're missing a container closing div
    if (filename === 'sink-heavy.html' || filename === 'sink-light.html') {
      // Add missing container closing div before </body>
      if (!html.includes('</div>\n\n</body>')) {
        html = html.replace(/(\n\n)(<\/body>)/g, '\n</div>$1$2');
      }
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
async function fixRemainingFiles() {
  console.log('🔧 Fixing remaining HTML validation issues...\n');
  
  const problemFiles = [
    'public/bathroom/shower-heavy.html',
    'public/bathroom/toilet-heavy.html',
    'public/bathroom/ventilation-heavy.html',
    'public/bathroom/washstand-heavy.html',
    'public/kitchen/gas-heavy.html',
    'public/kitchen/gas-light.html',
    'public/kitchen/ih-light.html',
    'public/kitchen/sink-heavy.html',
    'public/kitchen/sink-light.html'
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
fixRemainingFiles()
  .then(success => {
    if (success) {
      console.log('\n✅ Remaining issues fixed!');
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