#!/usr/bin/env node

const fs = require('fs');

// ih-heavy.htmlを読み込み
let content = fs.readFileSync('kitchen/ih-heavy.html', 'utf8');

// より包括的な商品フィルタリング関数に更新
const improvedDisplayProducts = `
        // 商品をカテゴリごとにグループ化して表示
        async function displayProducts() {
            const currentCategory = document.body.getAttribute('data-category');
            const container = document.getElementById('product-container');
            
            if (!container) return;
            
            // ローディング表示
            container.innerHTML = '<div class="loading">商品を読み込んでいます...</div>';
            
            const products = await loadProducts();
            const categoryProducts = getProductsByCategory(products, currentCategory);
            
            // より詳細なカテゴリ分け
            const cleaners = [];
            const tools = [];
            const protective = [];
            
            categoryProducts.forEach(p => {
                const name = p.name.toLowerCase();
                
                // 洗剤・クリーナー類
                if (name.includes('キュキュット') || 
                    name.includes('ジョイ') || 
                    name.includes('マジックリン') ||
                    name.includes('ウタマロ') ||
                    name.includes('クリーナー') ||
                    name.includes('洗剤') || 
                    name.includes('重曹') ||
                    name.includes('セスキ')) {
                    if (cleaners.length < 5) cleaners.push(p);
                }
                // スポンジ・ブラシ・道具類
                else if (name.includes('スポンジ') || 
                         name.includes('ブラシ') || 
                         name.includes('クロス') ||
                         name.includes('メラミン') ||
                         name.includes('スクレーパー') ||
                         name.includes('たわし')) {
                    if (tools.length < 5) tools.push(p);
                }
                // 保護具類
                else if (name.includes('手袋') || 
                         name.includes('グローブ') ||
                         name.includes('ビニール') ||
                         name.includes('ニトリル') ||
                         name.includes('ゴム手')) {
                    if (protective.length < 5) protective.push(p);
                }
            });
            
            // 不足分を補充
            categoryProducts.forEach(p => {
                if (!cleaners.includes(p) && !tools.includes(p) && !protective.includes(p)) {
                    if (cleaners.length < 5) cleaners.push(p);
                    else if (tools.length < 5) tools.push(p);
                    else if (protective.length < 5) protective.push(p);
                }
            });
            
            // HTMLを生成
            let html = '';
            
            if (cleaners.length > 0) {
                html += '<h3>洗剤</h3><div class="product-list">';
                html += cleaners.map(p => createProductCard(p)).join('');
                html += '</div>';
            }
            
            if (tools.length > 0) {
                html += '<h3>スポンジ・ブラシ</h3><div class="product-list">';
                html += tools.map(p => createProductCard(p)).join('');
                html += '</div>';
            }
            
            if (protective.length > 0) {
                html += '<h3>保護具</h3><div class="product-list">';
                html += protective.map(p => createProductCard(p)).join('');
                html += '</div>';
            }
            
            container.innerHTML = html;
            
            console.log('表示した商品数:', {
                cleaners: cleaners.length,
                tools: tools.length,
                protective: protective.length
            });
        }`;

// displayProducts関数を置き換え
content = content.replace(
    /\/\/ 商品をカテゴリごとにグループ化して表示[\s\S]*?container\.innerHTML = html;\s*}/m,
    improvedDisplayProducts.trim()
);

// ファイルを保存
fs.writeFileSync('kitchen/ih-heavy.html', content, 'utf8');

console.log('✅ 商品フィルタリングを改善しました');
console.log('- より包括的なキーワードマッチング');
console.log('- 各カテゴリ最大5個まで表示');
console.log('- 不足分は自動補充');