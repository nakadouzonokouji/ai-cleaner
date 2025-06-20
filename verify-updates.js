const fs = require('fs');
const path = require('path');

console.log('検証: HTMLファイルの更新状況\n');

// チェック項目
const checks = {
    hasDataCategory: 0,
    hasCleaningSteps: 0,
    hasProductContainer: 0,
    hasJavaScript: 0,
    total: 0
};

// Kitchenディレクトリのファイルをチェック
const kitchenPath = path.join(__dirname, 'kitchen');
const files = fs.readdirSync(kitchenPath);

files.forEach(file => {
    if (file.match(/-(light|heavy)\.html$/)) {
        checks.total++;
        const filePath = path.join(kitchenPath, file);
        const html = fs.readFileSync(filePath, 'utf8');
        
        console.log(`\n${file}:`);
        
        // data-category チェック
        const categoryMatch = html.match(/data-category="([^"]+)"/);
        if (categoryMatch) {
            console.log(`  ✅ data-category: ${categoryMatch[1]}`);
            checks.hasDataCategory++;
        } else {
            console.log(`  ❌ data-category なし`);
        }
        
        // 掃除手順チェック
        if (html.includes('<h2>掃除手順</h2>')) {
            const stepCount = (html.match(/<div class="step">/g) || []).length;
            console.log(`  ✅ 掃除手順: ${stepCount}ステップ`);
            checks.hasCleaningSteps++;
        } else {
            console.log(`  ❌ 掃除手順なし`);
        }
        
        // 商品コンテナチェック
        if (html.includes('id="product-container"')) {
            console.log(`  ✅ 動的商品コンテナあり`);
            checks.hasProductContainer++;
        } else {
            console.log(`  ❌ 動的商品コンテナなし`);
        }
        
        // JavaScript関数チェック
        if (html.includes('displayProducts()')) {
            console.log(`  ✅ JavaScript商品表示機能あり`);
            checks.hasJavaScript++;
        } else {
            console.log(`  ❌ JavaScript商品表示機能なし`);
        }
    }
});

console.log('\n\n=== 集計結果 ===');
console.log(`総ファイル数: ${checks.total}`);
console.log(`data-category設定済み: ${checks.hasDataCategory}/${checks.total}`);
console.log(`掃除手順あり: ${checks.hasCleaningSteps}/${checks.total}`);
console.log(`動的商品コンテナ: ${checks.hasProductContainer}/${checks.total}`);
console.log(`JavaScript機能: ${checks.hasJavaScript}/${checks.total}`);

// 商品マスターファイルの確認
console.log('\n=== 商品データ ===');
if (fs.existsSync(path.join(__dirname, 'products-master.json'))) {
    const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products-master.json'), 'utf8'));
    console.log(`✅ products-master.json: ${productsData.products.length}商品`);
    
    // カテゴリ別集計
    const categories = {};
    productsData.products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    console.log('\nカテゴリ別:');
    Object.entries(categories).sort().forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}商品`);
    });
} else {
    console.log(`❌ products-master.jsonが見つかりません`);
}

console.log('\n✅ 検証完了！');