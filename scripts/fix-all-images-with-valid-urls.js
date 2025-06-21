const fs = require('fs');
const path = require('path');

// Read valid image URLs from valid-images.txt
const validImages = fs.readFileSync(path.join(__dirname, '..', 'valid-images.txt'), 'utf8')
    .split('\n')
    .filter(url => url.trim())
    .map(url => url.trim());

console.log(`Found ${validImages.length} valid image URLs`);

// Function to get image URL by index (cycling through if needed)
function getValidImage(index) {
    return validImages[index % validImages.length];
}

// Get all HTML files to process
function getAllHTMLFiles() {
    const files = [];
    const locations = ['bathroom', 'kitchen', 'living', 'floor', 'toilet', 'window'];
    
    locations.forEach(location => {
        const locationPath = path.join(__dirname, '..', location);
        if (fs.existsSync(locationPath)) {
            const locationFiles = fs.readdirSync(locationPath)
                .filter(file => file.endsWith('.html') && file !== 'index.html')
                .map(file => path.join(location, file));
            files.push(...locationFiles);
        }
    });
    
    return files;
}

// Fix images in a single file
function fixImagesInFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Skip ih-heavy.html since it already has valid images
    if (filePath === 'kitchen/ih-heavy.html') {
        console.log(`Skipping ${filePath} (already has valid images)`);
        return;
    }
    
    // Find all img tags with Amazon URLs
    let imageIndex = 0;
    const imgRegex = /<img\s+src="https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+"/g;
    let hasChanges = false;
    
    content = content.replace(imgRegex, (match) => {
        const newUrl = getValidImage(imageIndex);
        imageIndex++;
        hasChanges = true;
        return match.replace(/src="[^"]+"/g, `src="${newUrl}"`);
    });
    
    if (hasChanges) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed ${imageIndex} images in ${filePath}`);
    } else {
        console.log(`No Amazon images found in ${filePath}`);
    }
}

// Main execution
console.log('Starting to fix images in all HTML files...\n');

const htmlFiles = getAllHTMLFiles();
console.log(`Found ${htmlFiles.length} HTML files to process\n`);

let totalFixed = 0;
htmlFiles.forEach(file => {
    fixImagesInFile(file);
    totalFixed++;
});

console.log(`\n✅ Successfully processed ${totalFixed} files!`);
console.log('All pages now use valid Amazon image URLs from ih-heavy.html');