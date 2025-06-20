const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// 全カテゴリのリスト
const locations = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];

async function recollectLocation(location) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔄 ${location} の再収集を開始します...`);
        
        const child = spawn('node', ['scripts/collect-products-by-location.js', location], {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${location} の収集が完了しました`);
                resolve();
            } else {
                console.error(`❌ ${location} の収集でエラーが発生しました`);
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
}

async function recollectAllLocations() {
    console.log('🚀 全カテゴリの日本語商品データ再収集を開始します');
    console.log(`対象カテゴリ: ${locations.join(', ')}`);
    console.log('各カテゴリ間に10秒の待機時間を設けます\n');
    
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    
    for (const location of locations) {
        try {
            await recollectLocation(location);
            successCount++;
            
            // 最後のカテゴリでなければ待機
            if (location !== locations[locations.length - 1]) {
                console.log('⏳ 10秒待機中...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        } catch (error) {
            console.error(`エラー: ${location}`, error.message);
            errorCount++;
        }
    }
    
    const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
    
    console.log('\n📊 === 再収集完了 ===');
    console.log(`✅ 成功: ${successCount}/${locations.length}`);
    console.log(`❌ エラー: ${errorCount}`);
    console.log(`⏱️  総実行時間: ${elapsed}分`);
    
    if (successCount === locations.length) {
        console.log('\n🎉 全カテゴリの収集が成功しました！');
        console.log('次のステップ: node scripts/merge-location-products.js');
    }
}

// 実行
recollectAllLocations().catch(console.error);