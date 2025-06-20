const fs = require('fs');
const path = require('path');

// 掃除手順データ
const cleaningSteps = {
    'kitchen': {
        'gas-light': {
            steps: [
                'ガスの元栓を閉めて安全確保',
                '五徳とバーナーキャップを取り外す',
                '重曹水または中性洗剤をスプレー',
                '5分程度置いて汚れを浮かせる',
                'スポンジで優しく擦り洗い',
                '水拭きで洗剤成分を除去',
                '乾いた布で水分を拭き取る',
                '五徳とバーナーキャップを元に戻す',
                'ガスの元栓を開けて点火確認',
                '換気扇も忘れずに掃除'
            ]
        },
        'gas-heavy': {
            steps: [
                'ガスの元栓を閉め、電源も切る',
                '五徳・バーナーキャップ・天板を外す',
                '取り外した部品を重曹水に浸ける（30分）',
                'アルカリ性洗剤を焦げ付きに噴射',
                'ラップでパックして20分放置',
                '金属ヘラで焦げを削り取る',
                'スチールウールで頑固な汚れを除去',
                '部品を歯ブラシで細部まで清掃',
                '熱湯ですすぎ、完全に乾燥させる',
                '元通りに組み立てて動作確認'
            ]
        },
        'ih-light': {
            steps: [
                'IHの電源を切って冷めるまで待つ',
                '中性洗剤を水で薄めた液を準備',
                '柔らかいクロスに洗剤液を含ませる',
                '天板全体を優しく拭き掃除',
                '吹きこぼれ跡は円を描くように拭く',
                '水で固く絞ったクロスで洗剤を拭き取る',
                '乾いたマイクロファイバーで仕上げ拭き',
                '操作パネル部分も忘れずに清掃',
                '電源を入れて動作確認',
                '定期的な掃除で焦げ付きを予防'
            ]
        },
        'ih-heavy': {
            steps: [
                'IHの電源を切り、ブレーカーも落として安全確保',
                '天板が完全に冷めているか手で確認',
                '重曹ペーストまたはIH専用クリーナーを準備',
                '焦げ付きに重曹ペーストを厚めに塗布',
                'ラップでパックし、30分～1時間放置',
                'プラスチック製スクレーパーで焦げを優しく削る',
                'メラミンスポンジで残った汚れを丁寧に除去',
                '水で湿らせたクロスで洗剤成分を完全に拭き取る',
                '乾いたマイクロファイバークロスで磨き上げる',
                '排気口や周辺部分も含めて最終確認'
            ]
        },
        'sink-light': {
            steps: [
                'シンク内の食器や物を片付ける',
                '排水口のゴミを取り除く',
                '中性洗剤をスポンジに含ませる',
                'シンク全体を円を描くように洗う',
                '蛇口周りの水垢も忘れずに',
                '水でしっかりとすすぐ',
                '乾いた布で水気を拭き取る',
                '排水口にパイプクリーナーを流す',
                'シンクをピカピカに磨き上げる',
                '定期的な掃除で清潔を保つ'
            ]
        },
        'sink-heavy': {
            steps: [
                '換気扇を回し、窓を開けて換気',
                '排水口の部品を全て取り外す',
                'カビキラーなどの塩素系洗剤を噴射',
                '15分程度放置して汚れを分解',
                'クレンザーで頑固な汚れを研磨',
                '古歯ブラシで細かい部分を清掃',
                '重曹とクエン酸で排水管を洗浄',
                '熱湯を流して汚れを押し流す',
                '部品を元に戻して水漏れ確認',
                '仕上げに除菌スプレーで消毒'
            ]
        },
        'ventilation-light': {
            steps: [
                '換気扇の電源を切る',
                'フィルターを取り外す',
                '中性洗剤を薄めた液に浸ける',
                '10分程度置いて油汚れを浮かせる',
                'スポンジで優しく洗う',
                '水でよくすすいで洗剤を落とす',
                '水気を切って乾燥させる',
                'フード本体を拭き掃除',
                'フィルターを元に戻す',
                '動作確認と異音チェック'
            ]
        },
        'ventilation-heavy': {
            steps: [
                'ブレーカーを落として電源を完全に遮断',
                'フィルター、ファン、部品を全て取り外す',
                '大きめの容器に重曹水を作る（60度程度）',
                '部品を重曹水に30分～1時間浸け置き',
                'マジックリンなど強力洗剤で本体を清掃',
                '金属ヘラで固まった油を削り取る',
                'スチームクリーナーで頑固な汚れを除去',
                '部品をブラシで丁寧に洗浄',
                '完全に乾燥させてから組み立て',
                'ブレーカーを戻して試運転'
            ]
        }
    }
};

// 他の場所のデータは省略して進行

// HTMLファイルを修正する関数
function fixHTMLFile(filePath) {
    try {
        let html = fs.readFileSync(filePath, 'utf8');
        const pathParts = filePath.split(path.sep);
        const location = pathParts[pathParts.length - 2];
        const fileName = pathParts[pathParts.length - 1];
        const cleaningType = fileName.replace('.html', '');
        
        // data-categoryが設定されているか確認
        const categoryMatch = html.match(/data-category="([^"]+)"/);
        const currentCategory = categoryMatch ? categoryMatch[1] : null;
        const expectedCategory = `${location}-${cleaningType}`;
        
        if (currentCategory !== expectedCategory) {
            // body タグに data-category を設定
            html = html.replace(/<body[^>]*>/, `<body data-category="${expectedCategory}">`);
            console.log(`  ✅ data-category 修正: ${expectedCategory}`);
        }
        
        // 掃除手順を追加（kitchenのみ今回は処理）
        if (location === 'kitchen' && cleaningSteps.kitchen && cleaningSteps.kitchen[cleaningType]) {
            const stepData = cleaningSteps.kitchen[cleaningType];
            
            // 掃除手順セクションを生成
            const stepsSection = `        <div class="section">
            <h2>掃除手順</h2>
${stepData.steps.map((step, index) => `            <div class="step">
                <span class="step-number">${index + 1}</span>
                <span>${step}</span>
            </div>`).join('\n')}
        </div>`;
            
            // 既存の手順セクションがあるか確認
            const hasStepsSection = /<div class="section">\s*<h2>掃除手順<\/h2>/.test(html);
            
            if (!hasStepsSection) {
                // 警告セクションの後に挿入
                const warningEndRegex = /(<div class="section warning">[\s\S]*?<\/div>)\s*\n/;
                if (warningEndRegex.test(html)) {
                    html = html.replace(warningEndRegex, `$1\n        \n${stepsSection}\n        \n`);
                    console.log(`  ✅ 掃除手順追加`);
                }
            }
        }
        
        // 重複した商品セクションを削除（静的なHTMLセクションを削除）
        const staticProductRegex = /<div class="section">\s*<h2>おすすめ商品<\/h2>[\s\S]*?<div class="product-grid-inner">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
        const matches = html.match(staticProductRegex);
        
        if (matches && matches.length > 1) {
            // 最初のマッチ（静的セクション）を削除
            html = html.replace(matches[0], '');
            console.log(`  ✅ 重複商品セクション削除`);
        }
        
        // ファイルを保存
        fs.writeFileSync(filePath, html, 'utf8');
        return true;
        
    } catch (error) {
        console.error(`  ❌ エラー: ${filePath} - ${error.message}`);
        return false;
    }
}

// メイン処理
console.log('HTMLファイル構造を修正中...\n');

const kitchenPath = path.join(__dirname, 'kitchen');
const files = fs.readdirSync(kitchenPath);

console.log('=== kitchen ===');
files.forEach(file => {
    if (file.match(/-(light|heavy)\.html$/)) {
        const filePath = path.join(kitchenPath, file);
        console.log(`\n処理中: ${file}`);
        fixHTMLFile(filePath);
    }
});

console.log('\n完了！');