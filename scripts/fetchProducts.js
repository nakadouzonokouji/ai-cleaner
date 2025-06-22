import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Product type definition
/**
 * @typedef {Object} Product
 * @property {string} asin
 * @property {string} title
 * @property {string} image
 * @property {string} price
 * @property {"bestseller"|"amazon-choice"|""} badge
 */

// Search queries mapped by location and category
const SEARCH_QUERIES = {
  bathroom: {
    detergents: ['バスマジックリン', 'カビキラー', 'バスクリーナー', '風呂用洗剤'],
    brushes: ['バスブラシ', '風呂掃除ブラシ', 'スポンジ', 'たわし'],
    ppe: ['ゴム手袋', '掃除用手袋', 'マスク', '保護メガネ']
  },
  kitchen: {
    detergents: ['キッチンマジックリン', '油汚れクリーナー', '食器用洗剤', 'キッチン用洗剤'],
    brushes: ['キッチンスポンジ', 'たわし', 'キッチンブラシ', '排水口ブラシ'],
    ppe: ['キッチン手袋', 'ゴム手袋', 'エプロン', '使い捨て手袋']
  },
  toilet: {
    detergents: ['トイレマジックリン', 'サンポール', 'トイレ洗剤', '便器クリーナー'],
    brushes: ['トイレブラシ', 'トイレ掃除ブラシ', 'トイレスポンジ'],
    ppe: ['トイレ掃除手袋', 'ゴム手袋', '使い捨て手袋']
  },
  floor: {
    detergents: ['フローリング洗剤', '床用クリーナー', 'ワックス', 'フロアクリーナー'],
    brushes: ['フロアモップ', '床ブラシ', 'フローリングワイパー', 'ほうき'],
    ppe: ['掃除用手袋', 'スリッパ', '膝パッド']
  },
  window: {
    detergents: ['ガラスクリーナー', '窓用洗剤', 'ガラスマジックリン'],
    brushes: ['窓用スポンジ', 'ガラスワイパー', 'スクイージー', '窓掃除ブラシ'],
    ppe: ['ゴム手袋', '安全ベルト', '保護メガネ']
  },
  living: {
    detergents: ['マルチクリーナー', 'カーペットクリーナー', '布用洗剤', 'ソファークリーナー'],
    brushes: ['カーペットブラシ', 'ハンディモップ', 'ほこり取り', 'コロコロ'],
    ppe: ['掃除用手袋', 'マスク', 'エプロン']
  }
};

// Simulate PA-API response (replace with actual PA-API SDK integration)
async function callPAAPI(searchQuery) {
  // In production, replace this with actual paapi5-nodejs-sdk implementation
  // For now, return mock data with realistic structure
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock product data based on search query
  const mockProducts = [];
  const baseASINs = ['B00TGKMZ7O', 'B071XBTM63', 'B08KZNQF6V', 'B09J4V2Z1M', 'B01M0Q3Y0X',
                      'B07K1QG9ZM', 'B08L4Q3YVN', 'B09MKQF7JN', 'B0BJ3D9QWM', 'B0C4N9YXHM'];
  
  for (let i = 0; i < 10; i++) {
    const isQualifiedProduct = i < 6; // First 6 products are qualified
    mockProducts.push({
      ASIN: baseASINs[i] || `B0${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      ItemInfo: {
        Title: {
          DisplayValue: `${searchQuery} - 高評価商品 ${i + 1}`
        },
        Images: {
          Primary: {
            Large: {
              URL: `https://m.media-amazon.com/images/I/${41 + i}KMUPH0UGL._SL500_.jpg`
            }
          }
        }
      },
      Offers: {
        Listings: [{
          Price: {
            DisplayAmount: `¥${Math.floor(Math.random() * 3000 + 500)}`
          }
        }]
      },
      BrowseNodeInfo: {
        BrowseNodes: isQualifiedProduct && i === 0 ? [{
          DisplayName: 'ベストセラー'
        }] : []
      },
      CustomerReviews: {
        Rating: isQualifiedProduct ? (4.0 + Math.random() * 0.9).toFixed(1) : '3.8',
        TotalReviewCount: isQualifiedProduct ? Math.floor(Math.random() * 900 + 100) : 50
      },
      IsAmazonChoice: isQualifiedProduct && i === 1
    });
  }
  
  return { ItemsResult: { Items: mockProducts } };
}

// Check if item qualifies based on criteria
function isQualified(item) {
  const hasBestsellerBadge = item.BrowseNodeInfo?.BrowseNodes?.some(
    node => /ベストセラー/.test(node.DisplayName)
  );
  const hasAmazonChoice = item.IsAmazonChoice === true;
  const rating = parseFloat(item.CustomerReviews?.Rating || '0');
  const reviewCount = parseInt(item.CustomerReviews?.TotalReviewCount || '0', 10);
  
  return (hasBestsellerBadge || hasAmazonChoice) && rating >= 4.0 && reviewCount >= 100;
}

// Convert PA-API item to Product type
function itemToProduct(item) {
  let badge = '';
  if (item.BrowseNodeInfo?.BrowseNodes?.some(n => /ベストセラー/.test(n.DisplayName))) {
    badge = 'bestseller';
  } else if (item.IsAmazonChoice) {
    badge = 'amazon-choice';
  }
  
  return {
    asin: item.ASIN,
    title: item.ItemInfo?.Title?.DisplayValue || '',
    image: item.ItemInfo?.Images?.Primary?.Large?.URL || '',
    price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || '',
    badge
  };
}

// Get cache key for search query
function getCacheKey(location, dirt, category) {
  return crypto.createHash('md5')
    .update(`${location}-${dirt}-${category}`)
    .digest('hex');
}

// Read from cache
async function readCache(cacheKey) {
  try {
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    const stats = await fs.stat(cachePath);
    
    // Check if cache is still valid
    if (Date.now() - stats.mtime.getTime() > CACHE_DURATION) {
      return null;
    }
    
    const data = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Write to cache
async function writeCache(cacheKey, data) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    await fs.writeFile(cachePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// Exponential backoff for rate limiting
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Fetch products for a specific category
async function fetchCategoryProducts(location, dirt, category) {
  const cacheKey = getCacheKey(location, dirt, category);
  
  // Try cache first
  const cached = await readCache(cacheKey);
  if (cached) {
    console.log(`Using cached data for ${location}-${dirt}-${category}`);
    return cached;
  }
  
  // Get search queries for this category
  const queries = SEARCH_QUERIES[location]?.[category] || [];
  const allProducts = [];
  
  for (const query of queries) {
    try {
      const response = await withRetry(() => callPAAPI(query));
      const items = response.ItemsResult?.Items || [];
      
      // Filter qualified products and convert to our format
      const qualifiedProducts = items
        .filter(isQualified)
        .map(itemToProduct);
      
      allProducts.push(...qualifiedProducts);
      
      // Stop if we have enough products
      if (allProducts.length >= 5) {
        break;
      }
    } catch (error) {
      console.error(`Error fetching products for query "${query}":`, error);
    }
  }
  
  // Take top 5 products
  const topProducts = allProducts.slice(0, 5);
  
  // Cache the results
  await writeCache(cacheKey, topProducts);
  
  return topProducts;
}

// Main function to fetch all products for a page
export async function fetchProducts({ location, dirt }) {
  console.log(`Fetching products for ${location}-${dirt}`);
  
  const categories = ['detergents', 'brushes', 'ppe'];
  const results = {};
  
  for (const category of categories) {
    results[category] = await fetchCategoryProducts(location, dirt, category);
  }
  
  return results;
}

// Export for testing
export { isQualified, itemToProduct };