const fs = require('fs');
const path = require('path');

function extractASINsFromHTML(html) {
    const asins = new Set();
    
    // Pattern 1: Amazon product URLs with /dp/ASIN (more flexible)
    const dpPattern = /\/dp\/([A-Z0-9]{10})/gi;
    let match;
    while ((match = dpPattern.exec(html)) !== null) {
        if (isValidASIN(match[1])) {
            asins.add(match[1]);
        }
    }
    
    // Pattern 2: Amazon product URLs with /gp/product/ASIN
    const gpPattern = /https?:\/\/www\.amazon\.co\.jp\/gp\/product\/([A-Z0-9]{10})/gi;
    while ((match = gpPattern.exec(html)) !== null) {
        if (isValidASIN(match[1])) {
            asins.add(match[1]);
        }
    }
    
    // Pattern 3: Direct ASIN references in data attributes or IDs
    const asinPattern = /data-asin=["']([A-Z0-9]{10})["']/gi;
    while ((match = asinPattern.exec(html)) !== null) {
        if (isValidASIN(match[1])) {
            asins.add(match[1]);
        }
    }
    
    // Pattern 4: Look for ASINs in image URLs or other attributes
    const imagePattern = /[/=]([A-Z0-9]{10})[._]/gi;
    while ((match = imagePattern.exec(html)) !== null) {
        if (isValidASIN(match[1])) {
            asins.add(match[1]);
        }
    }
    
    // Pattern 5: Handle short Amazon URLs
    const shortUrlPattern = /amzn\.to\/([a-zA-Z0-9]+)/gi;
    const shortUrls = [];
    while ((match = shortUrlPattern.exec(html)) !== null) {
        shortUrls.push(match[0]);
    }
    
    if (shortUrls.length > 0) {
        console.log(`Found ${shortUrls.length} short Amazon URLs that need resolution`);
    }
    
    return Array.from(asins);
}

function isValidASIN(asin) {
    // Valid ASINs are 10 characters and contain only uppercase letters and numbers
    // Most start with 'B' but some start with numbers
    return /^[A-Z0-9]{10}$/.test(asin) && !asin.match(/^[0-9]{10}$/);
}

// ディレクトリ内のHTMLファイルからASINを抽出する関数
function extractAsinsFromDirectory(directoryPath) {
    const allAsins = new Set();
    const fileAsins = {};
    
    function processDirectory(dirPath) {
        try {
            const files = fs.readdirSync(dirPath);
            
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    // サブディレクトリを再帰的に処理
                    processDirectory(filePath);
                } else if (file.endsWith('.html')) {
                    // HTMLファイルを処理
                    const htmlContent = fs.readFileSync(filePath, 'utf8');
                    const asins = extractASINsFromHTML(htmlContent);
                    
                    const relativePath = path.relative(directoryPath, filePath);
                    fileAsins[relativePath] = asins;
                    asins.forEach(asin => allAsins.add(asin));
                    
                    console.log(`${relativePath}: Found ${asins.length} ASINs`);
                }
            });
        } catch (error) {
            console.error('Error reading directory:', error);
            throw error;
        }
    }
    
    processDirectory(directoryPath);
    
    return {
        allAsins: Array.from(allAsins),
        fileAsins: fileAsins
    };
}

module.exports = { 
    extractASINsFromHTML,
    extractAsinsFromDirectory
};