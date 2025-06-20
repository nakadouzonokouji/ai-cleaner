const { generateSearchQueries, LOCATIONS } = require('./collect-all-products');
const { generateProductSectionHTML } = require('./generate-page-html');

console.log('=== AI掃除アドバイザー 商品マスターデータシステム テスト ===\n');

// 1. 場所とエリアの確認
console.log('1. 登録されている場所とエリア:');
Object.entries(LOCATIONS).forEach(([key, location]) => {
    console.log(`\n${location.name} (${key}):`);
    Object.entries(location.areas).forEach(([areaKey, areaName]) => {
        console.log(`  - ${areaName} (${areaKey})`);
    });
});

// 2. 検索クエリのテスト
console.log('\n\n2. 検索クエリ例 (kitchen/ih/heavy):');
const queries = generateSearchQueries('kitchen', 'ih', 'heavy');
console.log('洗剤:', queries.cleaners);
console.log('道具:', queries.tools);
console.log('保護具:', queries.protection);

// 3. 商品セクションHTML生成のテスト（ダミーデータ使用）
console.log('\n\n3. 商品セクションHTML生成例:');
console.log('（注: 実際のPA-APIデータがないため、プレースホルダーが表示されます）');

// マスターデータが存在しない場合のメッセージ
const fs = require('fs');
const path = require('path');
const masterDataPath = path.join(__dirname, '..', 'products-master-complete.json');

if (!fs.existsSync(masterDataPath)) {
    console.log('\n⚠️  マスターデータファイルが見つかりません。');
    console.log('以下のコマンドを実行してマスターデータを生成してください:');
    console.log('  node scripts/collect-all-products.js');
    console.log('\n（注: Amazon PA-APIの認証情報が必要です）');
}

// 4. システム統計
console.log('\n\n4. システム統計:');
let totalAreas = 0;
let totalPages = 0;

Object.values(LOCATIONS).forEach(location => {
    totalAreas += Object.keys(location.areas).length;
    totalPages += Object.keys(location.areas).length * 2; // light + heavy
});

console.log(`- 場所数: ${Object.keys(LOCATIONS).length}`);
console.log(`- エリア数: ${totalAreas}`);
console.log(`- HTMLページ数: ${totalPages}`);
console.log(`- 必要な商品数: ${totalPages * 15} (各ページ15商品)`);

// 5. GitHub Actions設定の確認
const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'update-all-products.yml');
if (fs.existsSync(workflowPath)) {
    console.log('\n✅ GitHub Actionsワークフローが設定されています');
    console.log('  - 毎週月曜日に自動更新');
    console.log('  - 手動実行も可能');
} else {
    console.log('\n⚠️  GitHub Actionsワークフローが見つかりません');
}

console.log('\n=== テスト完了 ===');