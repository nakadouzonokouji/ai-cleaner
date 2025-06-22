import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE = path.join(__dirname, '..', 'products-master.json');

async function cleanupProducts() {
  console.log('Loading products-master.json...');
  
  try {
    // Read the current products
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    const productData = JSON.parse(data);
    const products = productData.products || [];
    
    console.log(`Total products before cleanup: ${products.length}`);
    
    // Filter out invalid products
    const validProducts = products.filter(product => {
      // Check if product has all required fields
      if (!product || typeof product !== 'object') return false;
      
      // Required fields
      if (!product.id || product.id === '') return false;
      if (!product.name || product.name === '' || product.name === 'タイトル不明') return false;
      if (!product.image || product.image === '' || product.image === '/img/no-image.svg') return false;
      if (!product.url || product.url === '') return false;
      if (!product.category || product.category === '') return false;
      
      // Price should be a valid number
      if (typeof product.price !== 'number' || product.price <= 0) return false;
      
      // Rating should be between 0 and 5 if present
      if (product.rating !== undefined && (product.rating < 0 || product.rating > 5)) return false;
      
      return true;
    });
    
    console.log(`Valid products after cleanup: ${validProducts.length}`);
    console.log(`Removed ${products.length - validProducts.length} invalid products`);
    
    // Sort products by category for better organization
    validProducts.sort((a, b) => {
      return a.category.localeCompare(b.category);
    });
    
    // Write back the cleaned data
    const cleanedData = {
      products: validProducts,
      totalCount: validProducts.length,
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(
      PRODUCTS_FILE,
      JSON.stringify(cleanedData, null, 2),
      'utf8'
    );
    
    console.log('✅ products-master.json has been cleaned up!');
    
    // Show breakdown by category
    const categoryCounts = {};
    validProducts.forEach(p => {
      const location = p.category.split('-')[0];
      categoryCounts[location] = (categoryCounts[location] || 0) + 1;
    });
    
    console.log('\nProducts by location:');
    Object.entries(categoryCounts).sort().forEach(([location, count]) => {
      console.log(`  ${location}: ${count} products`);
    });
    
  } catch (error) {
    console.error('Error cleaning up products:', error);
    process.exit(1);
  }
}

cleanupProducts();