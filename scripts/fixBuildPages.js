import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixBuildPagesScript() {
    const buildPagesPath = path.join(__dirname, 'buildPages.js');
    let content = await fs.readFile(buildPagesPath, 'utf8');
    
    // Find the section where HTML is finalized
    const finalCleanupSection = `  // Final cleanup
  // 1. Fix stray closing divs before </body> or </section>
  html = html.replace(/<\\/div>\\s*<\\/div>\\s*(<\\/(?:body|section)>)/g, '</div>$1');
  
  // 2. Encode unencoded ampersands
  html = html.replace(/&(?![#a-z0-9]+;)/gi, '&amp;');
  
  // 3. Add type attribute to buttons
  html = html.replace(/<button(?![^>]*\\btype=)/gi, '<button type="button"');`;

    const improvedCleanup = `  // Final cleanup
  // 1. Count and balance divs
  const openDivs = (html.match(/<div[^>]*>/g) || []).length;
  const closeDivs = (html.match(/<\\/div>/g) || []).length;
  
  if (closeDivs > openDivs) {
    // Remove extra closing divs before </body>
    const bodyMatch = html.match(/(<\\/div>\\s*)+<\\/body>/);
    if (bodyMatch) {
      const extraDivs = closeDivs - openDivs;
      let fixedEnding = '</body>';
      for (let i = 0; i < (openDivs - (closeDivs - extraDivs)); i++) {
        fixedEnding = '</div>\\n' + fixedEnding;
      }
      html = html.replace(/(<\\/div>\\s*)+<\\/body>/, fixedEnding);
    }
  }
  
  // 2. Ensure proper closing structure
  if (!html.includes('</body>')) {
    html = html.replace(/(<\\/div>\\s*)+$/, '</div>\\n    </div>\\n</body>\\n</html>');
  } else if (!html.includes('</html>')) {
    html = html.replace('</body>', '</body>\\n</html>');
  }
  
  // 3. Fix any duplicate </html> tags
  html = html.replace(/(<\\/html>\\s*)+$/, '</html>');
  
  // 4. Encode unencoded ampersands
  html = html.replace(/&(?![#a-z0-9]+;)/gi, '&amp;');
  
  // 5. Add type attribute to buttons
  html = html.replace(/<button(?![^>]*\\btype=)/gi, '<button type="button"');`;

    // Replace the cleanup section
    content = content.replace(finalCleanupSection, improvedCleanup);
    
    // Save the updated file
    await fs.writeFile(buildPagesPath, content, 'utf8');
    console.log('✅ Updated buildPages.js with improved HTML structure handling');
}

fixBuildPagesScript();