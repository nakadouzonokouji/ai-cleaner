const fs = require('fs');
const path = require('path');

console.log('全カテゴリの商品データを統合中...\n');

const productsDir = path.join(__dirname, 'products-by-location');
const categories = ['bathroom', 'kitchen', 'living', 'floor', 'toilet', 'window'];
let allProducts = [];

// 各カテゴリのデータを読み込み
categories.forEach(category => {
    const filePath = path.join(productsDir, `${category}-products.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`✅ ${category}: ${data.products.length}商品`);
        allProducts = allProducts.concat(data.products);
    } else {
        console.log(`❌ ${category}: ファイルが見つかりません`);
    }
});

// マスターデータを作成
const masterData = {
    totalProducts: allProducts.length,
    lastUpdated: new Date().toISOString(),
    categories: categories.reduce((acc, cat) => {
        const filePath = path.join(productsDir, `${cat}-products.json`);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            acc[cat] = data.products.length;
        }
        return acc;
    }, {}),
    products: allProducts
};

// バックアップを作成
const masterPath = path.join(__dirname, 'products-master.json');
if (fs.existsSync(masterPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, `products-master-backup-${timestamp}.json`);
    fs.copyFileSync(masterPath, backupPath);
    console.log(`\n✅ バックアップ作成: ${backupPath}`);
}

// マスターファイルを保存
fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2));
console.log(`✅ マスターデータ保存: ${masterPath}`);

// 統計情報を表示
console.log('\n=== 統合結果 ===');
console.log(`総商品数: ${masterData.totalProducts}`);
console.log('カテゴリ別:');
Object.entries(masterData.categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}商品`);
});