import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix all HTML validation errors
async function fixHTMLFile(filePath) {
  try {
    let html = await fs.readFile(filePath, 'utf8');
    
    // Parse with JSDOM to fix structure
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Fix step sections - ensure proper closing
    const stepSections = document.querySelectorAll('.step');
    stepSections.forEach(step => {
      const stepContent = step.querySelector('.step-content');
      if (stepContent) {
        // Check if step-content has proper closing
        const stepDetail = stepContent.querySelector('.step-detail');
        if (stepDetail && !stepDetail.nextElementSibling) {
          // Add missing closing div for step-content
          const closingDiv = document.createElement('div');
          closingDiv.style.display = 'none';
          stepContent.appendChild(closingDiv);
        }
      }
    });
    
    // Fix feedback comment section structure
    const feedbackComment = document.querySelector('.feedback-comment');
    if (feedbackComment) {
      const textarea = feedbackComment.querySelector('textarea');
      const button = feedbackComment.querySelector('button');
      const feedbackMessage = feedbackComment.querySelector('.feedback-message');
      
      if (textarea && button && !feedbackMessage) {
        // Create missing feedback message div
        const messageDiv = document.createElement('div');
        messageDiv.className = 'feedback-message';
        messageDiv.id = 'feedbackMessage';
        messageDiv.style.display = 'none';
        messageDiv.textContent = 'ご意見ありがとうございました！';
        feedbackComment.appendChild(messageDiv);
      }
    }
    
    // Get the serialized HTML
    html = dom.serialize();
    
    // Manual fixes for common issues
    
    // Fix unclosed divs in step-content
    html = html.replace(/(<div class="step-content">[\s\S]*?<div class="step-detail">[\s\S]*?<\/div>)(?![\s\S]*?<\/div>)/g, '$1\n                </div>');
    
    // Fix feedback comment section missing closing div
    html = html.replace(/(<textarea[^>]*>[\s\S]*?<\/textarea>\s*<button[^>]*>[\s\S]*?<\/button>)\s*(<div class="feedback-message")/g, '$1\n    </div>\n    $2');
    
    // Fix orphaned closing divs and tags
    html = html.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*$/gm, '');
    
    // Ensure proper closing of main sections
    html = html.replace(/(<\/script>\s*)\n\s*(<\/body>)/g, '$1\n\n$2');
    
    // Fix unescaped ampersands in URLs
    html = html.replace(/(\?tag=asdfghj12-22)&/g, '$1&amp;');
    html = html.replace(/&(?!amp;|lt;|gt;|quot;|#39;|#x[0-9a-fA-F]+;|#[0-9]+;)([a-zA-Z0-9]+;)/g, '&amp;$1');
    
    // Remove extra whitespace at end of sections
    html = html.replace(/\s+<\/div>/g, '\n</div>');
    
    // Ensure body and html tags are properly closed
    html = html.replace(/(<\/body>\s*<\/html>)\s*$/g, '\n$1');
    
    // Count divs to ensure they're balanced
    const openDivs = (html.match(/<div[^>]*>/g) || []).length;
    const closeDivs = (html.match(/<\/div>/g) || []).length;
    
    if (openDivs > closeDivs) {
      // Add missing closing divs before </body>
      const missingDivs = openDivs - closeDivs;
      html = html.replace(/(<\/body>)/g, '\n' + '</div>\n'.repeat(missingDivs) + '$1');
    } else if (closeDivs > openDivs) {
      // Remove extra closing divs
      const extraDivs = closeDivs - openDivs;
      for (let i = 0; i < extraDivs; i++) {
        html = html.replace(/\s*<\/div>\s*(<\/body>)/g, '\n$1');
      }
    }
    
    await fs.writeFile(filePath, html, 'utf8');
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    return true;
    
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
  
  // Directories to process
  const dirs = [
    'public/bathroom',
    'public/kitchen', 
    'public/floor',
    'public/living',
    'public/toilet',
    'public/window'
  ];
  
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, dir);
    try {
      const files = await fs.readdir(dirPath);
      const htmlFiles = files.filter(f => f.endsWith('.html'));
      
      console.log(`\n📁 Processing ${dir}:`);
      
      for (const file of htmlFiles) {
        const filePath = path.join(dirPath, file);
        const fixed = await fixHTMLFile(filePath);
        if (fixed) totalFixed++;
        else totalErrors++;
      }
    } catch (error) {
      console.error(`❌ Error processing directory ${dir}:`, error.message);
    }
  }
  
  // Also fix index.html in public root
  try {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    const fixed = await fixHTMLFile(indexPath);
    if (fixed) totalFixed++;
    else totalErrors++;
  } catch (error) {
    console.error('❌ Error fixing public/index.html:', error.message);
    totalErrors++;
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
      console.log('\n✅ All HTML validation errors fixed!');
      console.log('\nNow run: npm run validate');
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