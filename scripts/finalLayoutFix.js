import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public');
const PUBLIC_DIR = OUTPUT_DIR; // Keep for backward compatibility

// Sample feedback HTML
const FEEDBACK_HTML = `
<!-- 掃除方法フィードバックセクション -->
<div class="method-feedback-section">
    <h3>この掃除方法は役に立ちましたか？</h3>
    <div class="feedback-buttons">
        <button type="button" class="feedback-btn helpful">役に立った</button>
        <button type="button" class="feedback-btn not-helpful">改善が必要</button>
    </div>
    <div class="feedback-message" style="display: none;">
        ご意見ありがとうございました！
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    const feedbackMsg = document.querySelector('.feedback-message');
    
    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const isHelpful = this.classList.contains('helpful');
            const category = document.body.dataset.category || 'unknown';
            
            // Store feedback
            const feedbackData = {
                category: category,
                helpful: isHelpful,
                timestamp: new Date().toISOString()
            };
            
            // Get existing feedback from localStorage
            let allFeedback = JSON.parse(localStorage.getItem('cleaningFeedback') || '[]');
            allFeedback.push(feedbackData);
            localStorage.setItem('cleaningFeedback', JSON.stringify(allFeedback));
            
            // Show thank you message
            feedbackMsg.style.display = 'block';
            feedbackBtns.forEach(b => b.style.display = 'none');
        });
    });
});
</script>`;

// Find all HTML files
async function findHtmlFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix a single HTML file
async function fixHtmlFile(filePath) {
  console.log(`Fixing: ${path.basename(filePath)}`);
  
  try {
    let html = await fs.readFile(filePath, 'utf8');
    
    // Remove all existing feedback sections
    html = html.replace(/<!-- 掃除方法フィードバックセクション -->[\s\S]*?<\/script>/g, '');
    html = html.replace(/<div class="method-feedback-section">[\s\S]*?<\/script>/g, '');
    
    // Find the last closing div before body
    const bodyIndex = html.lastIndexOf('</body>');
    if (bodyIndex === -1) {
      console.error(`No </body> tag found in ${filePath}`);
      return;
    }
    
    // Count divs to ensure proper structure
    const beforeBody = html.substring(0, bodyIndex);
    const openDivs = (beforeBody.match(/<div[^>]*>/g) || []).length;
    const closeDivs = (beforeBody.match(/<\/div>/g) || []).length;
    const missingDivs = openDivs - closeDivs;
    
    // Build the ending
    let ending = '';
    
    // Add missing closing divs
    for (let i = 0; i < missingDivs; i++) {
      ending += '    </div>\n';
    }
    
    // Add feedback section
    ending += '\n' + FEEDBACK_HTML + '\n\n';
    
    // Add closing tags
    ending += '</body>\n</html>';
    
    // Replace everything from the last proper content to the end
    const lastContentMatch = html.match(/(<\/div>\s*)+$/);
    if (lastContentMatch) {
      const lastContentIndex = html.lastIndexOf(lastContentMatch[0]);
      html = html.substring(0, lastContentIndex) + '\n' + ending;
    } else {
      html = html.substring(0, bodyIndex) + '\n' + ending;
    }
    
    // Final cleanup
    html = html.replace(/\n\n\n+/g, '\n\n');
    
    await fs.writeFile(filePath, html, 'utf8');
    console.log(`✓ Fixed: ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
  }
}

// Main function
async function main() {
  console.log('Applying final layout fixes...\n');
  
  try {
    const htmlFiles = await findHtmlFiles(PUBLIC_DIR);
    console.log(`Found ${htmlFiles.length} HTML files\n`);
    
    for (const file of htmlFiles) {
      await fixHtmlFile(file);
    }
    
    console.log('\n✅ Final layout fixes applied!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();