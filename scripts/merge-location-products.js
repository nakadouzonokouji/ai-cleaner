const fs = require('fs');
const path = require('path');

// 場所別データを統合して products-master.json を生成
function mergeLocationProducts() {
    console.log('📦 場所別商品データの統合を開始します...\n');
    
    const productsDir = path.join(__dirname, '..', 'products-by-location');
    const outputFile = path.join(__dirname, '..', 'products-master.json');
    
    // 既存のマスターファイルをバックアップ
    if (fs.existsSync(outputFile)) {
        const backupFile = outputFile.replace('.json', `-backup-${Date.now()}.json`);
        fs.copyFileSync(outputFile, backupFile);
        console.log(`📋 既存ファイルをバックアップ: ${path.basename(backupFile)}`);
    }
    
    // 全商品データを格納
    const masterData = {
        metadata: {
            version: '2.0',
            generatedAt: new Date().toISOString(),
            totalProducts: 0,
            collectedWith: 'amazon-paapi-sdk-v2',
            description: 'SDK版による実在商品データベース'
        },
        products: {},
        statistics: {
            byLocation: {},
            byArea: {},
            byLevel: { light: 0, heavy: 0 }
        }
    };
    
    // products-by-location ディレクトリ内の全JSONファイルを読み込み
    const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));
    
    console.log(`📂 ${files.length}個の場所別ファイルを発見\n`);
    
    let totalProducts = 0;
    
    files.forEach(file => {
        const filePath = path.join(productsDir, file);
        const locationData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`📍 ${locationData.locationName} (${locationData.location})`);
        console.log(`   商品数: ${locationData.totalProducts}`);
        
        // 商品データを統合
        locationData.products.forEach(product => {
            const key = `${product.location}-${product.area}-${product.level}`;
            
            if (!masterData.products[key]) {
                masterData.products[key] = [];
            }
            
            masterData.products[key].push({
                asin: product.asin,
                title: product.title,
                price: product.price,
                priceDisplay: product.priceDisplay,
                image: product.image,
                link: product.link,
                searchQuery: product.searchQuery
            });
            
            // 統計情報の更新
            masterData.statistics.byLocation[product.location] = 
                (masterData.statistics.byLocation[product.location] || 0) + 1;
            
            const areaKey = `${product.location}-${product.area}`;
            masterData.statistics.byArea[areaKey] = 
                (masterData.statistics.byArea[areaKey] || 0) + 1;
            
            masterData.statistics.byLevel[product.level]++;
            
            totalProducts++;
        });
    });
    
    masterData.metadata.totalProducts = totalProducts;
    
    // ファイルに保存
    fs.writeFileSync(outputFile, JSON.stringify(masterData, null, 2));
    
    console.log('\n✅ 統合完了！');
    console.log('\n📊 === 統合結果 ===');
    console.log(`総商品数: ${totalProducts}`);
    console.log(`総カテゴリ数: ${Object.keys(masterData.products).length}`);
    
    console.log('\n📍 場所別商品数:');
    Object.entries(masterData.statistics.byLocation)
        .sort(([,a], [,b]) => b - a)
        .forEach(([loc, count]) => {
            console.log(`  ${loc}: ${count}商品`);
        });
    
    console.log('\n📊 レベル別商品数:');
    console.log(`  軽い汚れ用: ${masterData.statistics.byLevel.light}商品`);
    console.log(`  頑固な汚れ用: ${masterData.statistics.byLevel.heavy}商品`);
    
    console.log(`\n💾 保存先: ${outputFile}`);
    
    // 不足している場所をチェック
    const expectedLocations = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];
    const collectedLocations = Object.keys(masterData.statistics.byLocation);
    const missingLocations = expectedLocations.filter(loc => !collectedLocations.includes(loc));
    
    if (missingLocations.length > 0) {
        console.log('\n⚠️  未収集の場所:');
        missingLocations.forEach(loc => console.log(`  - ${loc}`));
    }
    
    return masterData;
}

// 実行
if (require.main === module) {
    mergeLocationProducts();
}

module.exports = { mergeLocationProducts };