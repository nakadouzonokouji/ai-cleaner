#!/usr/bin/env node
/**
 * ASIN確認スクリプト
 * 実際のAmazon商品のASINが有効かチェックします
 */

const https = require('https');

function checkASIN(asin) {
    return new Promise((resolve) => {
        const url = `https://www.amazon.co.jp/dp/${asin}`;
        https.get(url, { 
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            if (res.statusCode === 200) {
                console.log(`✓ ${asin} - 有効`);
                resolve(true);
            } else {
                console.log(`✗ ${asin} - 無効 (${res.statusCode})`);
                resolve(false);
            }
        }).on('error', (err) => {
            console.log(`✗ ${asin} - エラー: ${err.message}`);
            resolve(false);
        });
    });
}

// テスト用ASIN（実際のASINに置き換えてください）
const testASINs = [
    // 例: 実際にAmazonで検索して見つけたASINをここに入力
    // 'B07XV8VSZT', // ウタマロクリーナー（例）
    // 'B08DXXXXX',  // マジックリン（例）
];

async function verifyAll() {
    console.log('=== Amazon ASIN 確認ツール ===\n');
    console.log('使い方:');
    console.log('1. Amazon.co.jpで商品を検索');
    console.log('2. 商品URLから「/dp/XXXXXXXXXX」の部分をコピー');
    console.log('3. testASINs配列に追加して実行\n');
    
    if (testASINs.length === 0) {
        console.log('⚠️  testASINs配列にASINを追加してください');
        console.log('例: const testASINs = ["B07XV8VSZT", "B08DXXXXX"];');
        return;
    }
    
    console.log('確認開始...\n');
    
    let validCount = 0;
    for (const asin of testASINs) {
        const isValid = await checkASIN(asin);
        if (isValid) validCount++;
        await new Promise(r => setTimeout(r, 1000)); // 1秒待機
    }
    
    console.log(`\n結果: ${validCount}/${testASINs.length} のASINが有効です`);
}

// コマンドライン引数からASINを受け取る場合
const args = process.argv.slice(2);
if (args.length > 0) {
    console.log('コマンドライン引数からASINを確認...\n');
    args.forEach(async (asin, index) => {
        await checkASIN(asin);
        if (index < args.length - 1) {
            await new Promise(r => setTimeout(r, 1000));
        }
    });
} else {
    verifyAll();
}