#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ih-heavy.htmlを完全に復元する
function restoreIHHeavy() {
    console.log('kitchen/ih-heavy.htmlを完全に復元します...\n');
    
    try {
        // オリジナルのコンテンツを取得
        const originalContent = execSync('git show a18b9d0:kitchen/ih-heavy.html', { encoding: 'utf8' });
        
        // 現在のコンテンツを取得
        const currentContent = fs.readFileSync('kitchen/ih-heavy.html', 'utf8');
        
        // 必要な部分を抽出
        // 1. ヘッダーとタイトル部分（現在のものを使用）
        const headerMatch = currentContent.match(/^[\s\S]*?<main[^>]*>/);
        const header = headerMatch ? headerMatch[0] : '';
        
        // 2. 注意事項から掃除手順まで（オリジナルから）
        const mainContentMatch = originalContent.match(/<h1>.*?頑固な焦げ付き<\/h1>[\s\S]*?<\/div>\s*<\/div>(?=\s*<div class="section">[\s\S]*?<h2>おすすめ商品<\/h2>)/);
        const mainContent = mainContentMatch ? mainContentMatch[0] : '';
        
        // 3. フィードバックセクション（現在のものから）
        const feedbackMatch = currentContent.match(/<div class="method-feedback-section">[\s\S]*?<\/script>/);
        const feedbackSection = feedbackMatch ? feedbackMatch[0] : '';
        
        // 4. 商品コンテナ（現在のものから）
        const productMatch = currentContent.match(/<h2>おすすめ商品<\/h2>[\s\S]*?<\/script>\s*<\/body>/);
        const productSection = productMatch ? productMatch[0] : '';
        
        // 5. フッター
        const footer = '</html>';
        
        // 組み立て
        const restoredContent = header + '\n' + 
            mainContent + '\n\n        ' +
            feedbackSection + '\n\n    ' +
            productSection + '\n' +
            footer;
        
        // ファイルを保存
        fs.writeFileSync('kitchen/ih-heavy.html', restoredContent, 'utf8');
        console.log('✅ kitchen/ih-heavy.html を復元しました');
        
        // 商品レイアウトを修正
        fixProductLayout();
        
    } catch (error) {
        console.error('❌ エラー:', error.message);
    }
}

// 商品表示レイアウトを3カテゴリに修正
function fixProductLayout() {
    console.log('\n商品レイアウトを修正中...');
    
    let content = fs.readFileSync('kitchen/ih-heavy.html', 'utf8');
    
    // CSSを修正（3列表示）
    content = content.replace(
        /grid-template-columns: repeat\(auto-fill, minmax\(280px, 1fr\)\);/,
        'grid-template-columns: repeat(3, 1fr);'
    );
    
    // カテゴリごとにグループ化する表示ロジックを追加
    const newDisplayLogic = `
// 商品をカテゴリごとにグループ化して表示
async function displayProducts() {
    const currentCategory = document.body.getAttribute('data-category');
    const container = document.getElementById('product-container');
    
    if (!container) return;
    
    // ローディング表示
    container.innerHTML = '<div class="loading">商品を読み込んでいます...</div>';
    
    const products = await loadProducts();
    const categoryProducts = getProductsByCategory(products, currentCategory);
    
    // カテゴリごとにグループ化
    const cleaners = categoryProducts.filter(p => p.name.includes('クリーナー') || p.name.includes('洗剤') || p.name.includes('重曹'));
    const tools = categoryProducts.filter(p => p.name.includes('スポンジ') || p.name.includes('ブラシ') || p.name.includes('スクレーパー'));
    const protective = categoryProducts.filter(p => p.name.includes('手袋') || p.name.includes('マスク') || p.name.includes('メガネ'));
    
    // HTMLを生成
    let html = '';
    
    if (cleaners.length > 0) {
        html += '<h3 style="grid-column: 1/-1; margin-top: 20px;">洗剤・クリーナー</h3>';
        html += cleaners.slice(0, 5).map(p => createProductCard(p)).join('');
    }
    
    if (tools.length > 0) {
        html += '<h3 style="grid-column: 1/-1; margin-top: 30px;">スポンジ・ブラシ</h3>';
        html += tools.slice(0, 5).map(p => createProductCard(p)).join('');
    }
    
    if (protective.length > 0) {
        html += '<h3 style="grid-column: 1/-1; margin-top: 30px;">保護具</h3>';
        html += protective.slice(0, 5).map(p => createProductCard(p)).join('');
    }
    
    container.innerHTML = html;
    
    // フィードバック数を更新
    updateAllFeedbackCounts();
}

// 商品カードを生成
function createProductCard(product) {
    return \`
        <div class="product-card" data-product-id="\${product.id}">
            <div class="product-image-wrapper">
                <img src="\${product.image}" alt="\${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                \${product.prime ? '<div class="prime-badge">Prime</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">\${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">★\${product.rating}</span>
                    <span class="review-count">(\${product.reviews.toLocaleString()})</span>
                </div>
                <div class="product-price">¥\${product.price.toLocaleString()}</div>
                <div class="product-status">
                    \${product.inStock ? '<span class="in-stock">✓ 在庫あり</span>' : '<span class="out-stock">在庫なし</span>'}
                </div>
                <div class="product-actions">
                    <a href="\${product.url}" target="_blank" rel="noopener noreferrer" class="amazon-button">
                        Amazonで見る
                    </a>
                </div>
                <div class="feedback-section">
                    <div class="feedback-buttons">
                        <button class="feedback-btn good-btn" onclick="submitProductFeedback('\${product.id}', 'good', this)">
                            👍 役立った
                        </button>
                        <button class="feedback-btn bad-btn" onclick="submitProductFeedback('\${product.id}', 'bad', this)">
                            👎 微妙
                        </button>
                    </div>
                    <div class="feedback-count" id="feedback-\${product.id}"></div>
                </div>
            </div>
        </div>
    \`;
}`;
    
    // displayProducts関数を置き換え
    content = content.replace(
        /async function displayProducts\(\) {[\s\S]*?^}/m,
        newDisplayLogic.trim()
    );
    
    fs.writeFileSync('kitchen/ih-heavy.html', content, 'utf8');
    console.log('✅ 商品レイアウトを修正しました');
}

// 実行
restoreIHHeavy();