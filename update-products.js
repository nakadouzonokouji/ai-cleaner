const fs = require('fs');
const path = require('path');

// Read the products master file
const productsData = JSON.parse(fs.readFileSync('./products-master.json', 'utf8'));

// Directories to process
const directories = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];

// Function to extract category from file path
function getCategoryFromPath(dir, filename) {
    // Remove .html extension and combine with directory
    const base = filename.replace('.html', '');
    // Skip index.html files
    if (base === 'index') return null;
    
    // Create category like "kitchen-sink-light"
    return `${dir}-${base}`;
}

// Function to get products for a category
function getProductsForCategory(category) {
    return productsData.products.filter(product => product.category === category);
}

// Function to generate product HTML with dynamic loading
function generateProductHTML(category, products) {
    const productDataScript = `
<script>
// Product data for this page
const pageProducts = ${JSON.stringify(products, null, 2)};

// Function to render products
function renderProducts() {
    // Render 洗剤・クリーナー products
    const cleanerProducts = pageProducts.slice(0, 5);
    renderProductSection('cleaner-products', cleanerProducts);
    
    // Render スポンジ・ブラシ products
    const spongeProducts = pageProducts.slice(5, 10);
    renderProductSection('sponge-products', spongeProducts);
    
    // Render 保護具 products
    const protectiveProducts = pageProducts.slice(10, 15);
    renderProductSection('protective-products', protectiveProducts);
}

// Function to render a product section
function renderProductSection(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = products.map((product, index) => {
        const badgeHtml = index === 0 ? '<span class="badge best-seller">ベストセラー</span>' : 
                         index === 1 ? '<span class="badge amazon-choice">Amazonチョイス</span>' : '';
        
        return \`
            <div class="product" data-product-id="\${product.id}">
                \${badgeHtml}
                <img src="\${product.image}" alt="\${product.name}" onerror="handleImageError(this)">
                <h4>\${product.name}</h4>
                <div class="rating">★★★★☆ \${product.rating}</div>
                <div class="price">¥\${product.price.toLocaleString()}</div>
                <div class="product-desc">\${product.description}</div>
                <a href="\${product.url}?tag=asdfghj12-22" class="amazon-btn" target="_blank">Amazonで購入</a>
                <div class="feedback-buttons">
                    <button class="feedback-btn good" onclick="sendFeedback('\${product.id}', 'good')">👍 役立つ</button>
                    <button class="feedback-btn bad" onclick="sendFeedback('\${product.id}', 'bad')">👎 役立たない</button>
                </div>
            </div>
        \`;
    }).join('');
}

// Handle image loading errors
function handleImageError(img) {
    img.onerror = null;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y0ZjRmNCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
}

// Send feedback function
function sendFeedback(productId, type) {
    // Store feedback in localStorage
    const feedbackKey = 'productFeedback_' + productId;
    const existingFeedback = localStorage.getItem(feedbackKey);
    
    if (existingFeedback) {
        alert('フィードバックありがとうございます。既に評価済みです。');
        return;
    }
    
    localStorage.setItem(feedbackKey, type);
    
    // Update button states
    const productEl = document.querySelector(\`[data-product-id="\${productId}"]\`);
    if (productEl) {
        const buttons = productEl.querySelectorAll('.feedback-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.classList.contains(type)) {
                btn.classList.add('selected');
            }
        });
    }
    
    // Show thank you message
    alert('フィードバックありがとうございます！');
    
    // In a real implementation, this would send data to a server
    console.log('Feedback sent:', { productId, type, timestamp: new Date().toISOString() });
}

// Initialize feedback button states on load
function initializeFeedbackButtons() {
    pageProducts.forEach(product => {
        const feedbackKey = 'productFeedback_' + product.id;
        const existingFeedback = localStorage.getItem(feedbackKey);
        
        if (existingFeedback) {
            const productEl = document.querySelector(\`[data-product-id="\${product.id}"]\`);
            if (productEl) {
                const buttons = productEl.querySelectorAll('.feedback-btn');
                buttons.forEach(btn => {
                    btn.disabled = true;
                    if (btn.classList.contains(existingFeedback)) {
                        btn.classList.add('selected');
                    }
                });
            }
        }
    });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    initializeFeedbackButtons();
});
</script>

<style>
/* Additional styles for feedback buttons */
.feedback-buttons {
    display: flex;
    gap: 5px;
    margin-top: 10px;
}

.feedback-btn {
    flex: 1;
    padding: 5px 10px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s;
}

.feedback-btn:hover:not(:disabled) {
    background: #f5f5f5;
}

.feedback-btn.good:hover:not(:disabled) {
    border-color: #28a745;
    color: #28a745;
}

.feedback-btn.bad:hover:not(:disabled) {
    border-color: #dc3545;
    color: #dc3545;
}

.feedback-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.feedback-btn.selected {
    font-weight: bold;
}

.feedback-btn.good.selected {
    background: #d4edda;
    border-color: #28a745;
    color: #155724;
}

.feedback-btn.bad.selected {
    background: #f8d7da;
    border-color: #dc3545;
    color: #721c24;
}

/* Error handling for images */
.product img {
    min-height: 150px;
    background: #f4f4f4;
}
</style>
`;

    // Generate new product sections HTML
    const newProductSections = `
            <h3 class="category-title">洗剤・クリーナー（5選）</h3>
            <div class="products">
                <div class="product-list" id="cleaner-products">
                    <!-- Products will be loaded dynamically -->
                </div>
            </div>
            
            <h3 class="category-title">スポンジ・ブラシ（5選）</h3>
            <div class="products">
                <div class="product-list" id="sponge-products">
                    <!-- Products will be loaded dynamically -->
                </div>
            </div>
            
            <h3 class="category-title">保護具（5選）</h3>
            <div class="products">
                <div class="product-list" id="protective-products">
                    <!-- Products will be loaded dynamically -->
                </div>
            </div>`;

    return { script: productDataScript, sections: newProductSections };
}

// Process each directory
directories.forEach(dir => {
    const dirPath = path.join('.', dir);
    
    // Get all HTML files in the directory
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html') && f !== 'index.html');
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const category = getCategoryFromPath(dir, file);
        
        if (!category) return;
        
        console.log(`Processing ${filePath} for category ${category}`);
        
        // Get products for this category
        const categoryProducts = getProductsForCategory(category);
        
        if (categoryProducts.length === 0) {
            console.log(`  No products found for category ${category}`);
            return;
        }
        
        console.log(`  Found ${categoryProducts.length} products`);
        
        // Read the HTML file
        let html = fs.readFileSync(filePath, 'utf8');
        
        // Generate new product HTML
        const { script, sections } = generateProductHTML(category, categoryProducts);
        
        // Find the closing </head> tag and insert the script before it
        html = html.replace('</head>', script + '\n</head>');
        
        // Replace the product sections
        // Find the section containing products (between おすすめ商品 and the closing div)
        const productSectionRegex = /<h2>おすすめ商品<\/h2>[\s\S]*?<h3 class="category-title">.*?<\/h3>[\s\S]*?<\/div>\s*<\/div>/g;
        
        // If we can find the product section, replace it
        if (productSectionRegex.test(html)) {
            html = html.replace(productSectionRegex, '<h2>おすすめ商品</h2>\n' + sections);
        } else {
            // Try a different pattern for finding product sections
            const altRegex = /<h3 class="category-title">洗剤・クリーナー.*?<\/h3>[\s\S]*?(?=<\/div>\s*<\/div>\s*<div class="section">|<\/div>\s*<\/div>\s*<\/div>\s*<\/body>)/;
            
            if (altRegex.test(html)) {
                html = html.replace(altRegex, sections);
            } else {
                console.log(`  Warning: Could not find product section to replace`);
            }
        }
        
        // Write the updated HTML back to the file
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`  Updated ${filePath}`);
    });
});

console.log('\nAll files have been updated successfully!');