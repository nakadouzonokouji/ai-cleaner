const fs = require('fs');
const path = require('path');

// 商品マスターファイルを読み込む（実際の商品データを使用）
const productsFile = path.join(__dirname, '..', 'products-master-real.json');
const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

// カテゴリマッピング（HTMLファイル名からカテゴリを推定）
const categoryMapping = {
  'kitchen': {
    'gas': ['kitchen-gas-light', 'kitchen-gas-heavy'],
    'ih': ['kitchen-ih-light', 'kitchen-ih-heavy'],
    'sink': ['kitchen-sink-light', 'kitchen-sink-heavy'],
    'ventilation': ['kitchen-ventilation-light', 'kitchen-ventilation-heavy']
  },
  'bathroom': {
    'bathtub': ['bathroom-bathtub-light', 'bathroom-bathtub-heavy'],
    'drain': ['bathroom-drain-light', 'bathroom-drain-heavy'],
    'shower': ['bathroom-shower-light', 'bathroom-shower-heavy'],
    'toilet': ['bathroom-toilet-light', 'bathroom-toilet-heavy'],
    'washstand': ['bathroom-washstand-light', 'bathroom-washstand-heavy'],
    'ventilation': ['bathroom-ventilation-light', 'bathroom-ventilation-heavy']
  },
  'living': {
    'sofa': ['living-sofa-light', 'living-sofa-heavy'],
    'carpet': ['living-carpet-light', 'living-carpet-heavy'],
    'table': ['living-table-light', 'living-table-heavy'],
    'wall': ['living-wall-light', 'living-wall-heavy']
  },
  'floor': {
    'flooring': ['floor-flooring-light', 'floor-flooring-heavy'],
    'tatami': ['floor-tatami-light', 'floor-tatami-heavy'],
    'tile': ['floor-tile-light', 'floor-tile-heavy'],
    'carpet': ['floor-carpet-light', 'floor-carpet-heavy']
  },
  'toilet': {
    'toilet': ['toilet-toilet-light', 'toilet-toilet-heavy'],
    'floor': ['toilet-floor-light', 'toilet-floor-heavy']
  },
  'window': {
    'glass': ['window-glass-light', 'window-glass-heavy'],
    'sash': ['window-sash-light', 'window-sash-heavy']
  }
};

/**
 * カテゴリに該当する商品を取得
 */
function getProductsForCategory(category) {
  return productsData.products.filter(product => product.category === category);
}

/**
 * 商品HTMLを生成
 */
function generateProductHTML(product) {
  return `    <div class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
        <h4>${product.name}</h4>
        <div class="product-rating">
            <span class="stars">★${product.rating.toFixed(1)}</span>
            <span class="review-count">(${product.reviews})</span>
        </div>
        <p class="price">¥${product.price}</p>
        <a href="${product.url}?tag=${process.env.AMAZON_ASSOCIATE_TAG || 'asdfghj12-22'}" 
           target="_blank" rel="nofollow noopener" class="buy-button">
            Amazonで購入
        </a>
    </div>`;
}

/**
 * 商品セクションHTMLを生成
 */
function generateProductSectionHTML(products) {
  if (!products || products.length === 0) {
    return '';
  }

  let html = `        <div class="section">
            <h2>おすすめ商品</h2>
            <div class="product-grid">
                <div class="product-grid-inner">
`;

  // 最大15商品まで表示
  products.slice(0, 15).forEach(product => {
    html += generateProductHTML(product) + '\n';
  });

  html += `                </div>
            </div>
        </div>`;

  return html;
}

/**
 * HTMLファイルを更新
 */
function updateHTMLFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    
    // ファイルパスからカテゴリを推定
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1].replace('.html', '');
    const location = parts[0];
    
    // カテゴリ名を生成（例: kitchen/gas-heavy.html -> kitchen-gas-heavy）
    const category = `${location}-${fileName}`;
    
    console.log(`  Processing: ${filePath} (category: ${category})`);
    
    
    // カテゴリに該当する商品を取得
    const products = getProductsForCategory(category);
    
    if (products.length === 0) {
      console.log(`⚠️  No products found for category: ${category}`);
      return false;
    }
    
    // HTMLファイルを読み込み
    let html = fs.readFileSync(fullPath, 'utf8');
    
    // 新しい商品セクションを生成
    const newProductSection = generateProductSectionHTML(products);
    
    // 既存の商品セクションを置き換え
    // パターン1: <div class="section">...<h2>おすすめ商品</h2>...</div>
    let sectionRegex = /<div class="section">\s*<h2>おすすめ商品<\/h2>[\s\S]*?<\/div>\s*(?=<div class="section|<\/body>|$)/;
    
    if (sectionRegex.test(html)) {
      html = html.replace(sectionRegex, newProductSection + '\n        ');
      console.log(`✅ Updated products section in: ${filePath}`);
    } else {
      // パターン2: <div class="section">...<h2>必要な掃除アイテム</h2>...</div>
      sectionRegex = /<div class="section">\s*<h2>必要な掃除アイテム<\/h2>[\s\S]*?<\/div>\s*(?=<div class="section|<\/body>|$)/;
      
      if (sectionRegex.test(html)) {
        html = html.replace(sectionRegex, newProductSection + '\n        ');
        console.log(`✅ Updated products section in: ${filePath}`);
      } else {
        // セクションが見つからない場合は、bodyの終了タグの前に挿入
        const bodyEndRegex = /<\/body>/;
        if (bodyEndRegex.test(html)) {
          html = html.replace(bodyEndRegex, '\n' + newProductSection + '\n    </body>');
          console.log(`✅ Added products section to: ${filePath}`);
        } else {
          console.error(`❌ Cannot find insertion point in: ${filePath}`);
          return false;
        }
      }
    }
    
    // ファイルを保存
    fs.writeFileSync(fullPath, html, 'utf8');
    return true;
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * すべてのHTMLファイルを更新
 */
function updateAllHTMLFiles() {
  console.log('商品マスターデータを使用してHTMLファイルを更新中...\n');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  // 各場所のディレクトリをスキャン
  const locations = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];
  
  locations.forEach(location => {
    const locationPath = path.join(__dirname, '..', location);
    
    if (!fs.existsSync(locationPath)) {
      console.log(`⚠️  Directory not found: ${location}`);
      return;
    }
    
    console.log(`\n=== Processing ${location} ===`);
    
    // HTMLファイルを検索
    const files = fs.readdirSync(locationPath);
    files.forEach(file => {
      // -light.html または -heavy.html のパターンに一致するファイルのみ処理
      if (file.match(/-(light|heavy)\.html$/)) {
        const filePath = path.join(location, file);
        
        if (updateHTMLFile(filePath)) {
          updatedCount++;
        } else {
          errorCount++;
        }
      }
    });
  });
  
  console.log('\n=== 更新完了 ===');
  console.log(`✅ 成功: ${updatedCount} ファイル`);
  console.log(`❌ エラー: ${errorCount} ファイル`);
  console.log(`📁 合計: ${updatedCount + errorCount} ファイル`);
}

// メイン実行
if (require.main === module) {
  updateAllHTMLFiles();
}

module.exports = {
  updateHTMLFile,
  updateAllHTMLFiles
};