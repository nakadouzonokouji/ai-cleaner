import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix bathroom heavy pages structure
async function fixBathroomHeavyPages() {
  console.log('🔧 Fixing bathroom heavy pages structure...\n');
  
  const bathroomHeavyPages = [
    'public/bathroom/shower-heavy.html',
    'public/bathroom/toilet-heavy.html',
    'public/bathroom/ventilation-heavy.html',
    'public/bathroom/washstand-heavy.html'
  ];
  
  const cleaningStepsData = {
    'shower-heavy.html': {
      steps: [
        { number: 1, title: "シャワーヘッドを完全分解する", detail: "ネジを外し、全パーツを取り外します" },
        { number: 2, title: "パーツごとに汚れをチェック", detail: "各部品の汚れ具合を確認します" },
        { number: 3, title: "強力洗剤で事前処理", detail: "頑固な汚れに洗剤を直接塗布します" },
        { number: 4, title: "熱湯に浸けて汚れを軟化", detail: "60℃以上の熱湯に30分浸けます" },
        { number: 5, title: "専用ブラシで徹底的にこする", detail: "硬めのブラシで汚れを削り落とします" },
        { number: 6, title: "超音波洗浄または長時間浸け置き", detail: "細かい汚れを完全に除去します" },
        { number: 7, title: "細部の汚れを針や爪楊枝で除去", detail: "穴の詰まりを丁寧に取り除きます" },
        { number: 8, title: "酸性洗剤で仕上げ洗浄", detail: "水垢を完全に溶かします" },
        { number: 9, title: "完全乾燥と除菌処理", detail: "アルコールで除菌後、完全に乾燥させます" },
        { number: 10, title: "組み立てと防汚コーティング", detail: "元通りに組み立て、防汚剤を塗布します" }
      ]
    },
    'toilet-heavy.html': {
      steps: [
        { number: 1, title: "換気を十分に行い保護具を装着", detail: "窓を開け、マスクと手袋を着用します" },
        { number: 2, title: "便器の水を抜いて汚れを露出させる", detail: "灯油ポンプで水を抜き取ります" },
        { number: 3, title: "強力酸性洗剤を汚れに直接塗布", detail: "尿石に洗剤をたっぷり塗ります" },
        { number: 4, title: "ラップで覆い密着させる", detail: "洗剤の効果を高めるため密封します" },
        { number: 5, title: "30分以上放置して汚れを分解", detail: "頑固な汚れは1時間以上置きます" },
        { number: 6, title: "耐酸性ブラシで力強くこする", detail: "溶けた汚れを物理的に除去します" },
        { number: 7, title: "尿石はスクレーパーで削り取る", detail: "固い汚れは削って落とします" },
        { number: 8, title: "水を流して洗剤を完全に除去", detail: "何度も水を流して洗い流します" },
        { number: 9, title: "残った汚れに再度洗剤塗布", detail: "落ちない汚れは繰り返し処理します" },
        { number: 10, title: "仕上げに除菌・コーティング処理", detail: "防汚コートで再付着を防ぎます" }
      ]
    },
    'ventilation-heavy.html': {
      steps: [
        { number: 1, title: "電源を切りブレーカーを落として安全確保", detail: "感電防止のため必ず電源を切ります" },
        { number: 2, title: "防護装備を完全装着して作業準備", detail: "防塵マスクとゴーグルを装着します" },
        { number: 3, title: "換気扇を完全分解して部品を取り出す", detail: "カバー、羽根、モーターを外します" },
        { number: 4, title: "大量のホコリを掃除機で徹底除去", detail: "ブラシ付きノズルで隅々まで吸い取ります" },
        { number: 5, title: "強力アルカリ洗剤を全体に塗布", detail: "油汚れに効果的な洗剤を使用します" },
        { number: 6, title: "1時間以上放置して汚れを分解", detail: "頑固な油汚れを軟化させます" },
        { number: 7, title: "硬質ブラシで頑固な汚れを削り落とす", detail: "金属ブラシで強力に擦ります" },
        { number: 8, title: "熱湯で洗剤と汚れを完全洗浄", detail: "60℃以上の熱湯で洗い流します" },
        { number: 9, title: "部品を完全乾燥させて防カビ処理", detail: "カビ防止剤をスプレーします" },
        { number: 10, title: "組み立てて試運転・動作確認", detail: "異音がないか確認して完了です" }
      ]
    },
    'washstand-heavy.html': {
      steps: [
        { number: 1, title: "洗面台周りを完全に片付けて作業準備", detail: "歯ブラシ等を全て移動させます" },
        { number: 2, title: "換気を十分に行い保護具を装着", detail: "窓を開け、手袋を着用します" },
        { number: 3, title: "排水口の部品を全て取り外す", detail: "ヘアキャッチャー等を外します" },
        { number: 4, title: "強力洗剤を汚れ全体に塗布", detail: "水垢、石鹸カスに洗剤を塗ります" },
        { number: 5, title: "30分以上放置して汚れを分解", detail: "洗剤の力で汚れを軟化させます" },
        { number: 6, title: "メラミンスポンジで頑固な汚れを削る", detail: "水垢を物理的に削り落とします" },
        { number: 7, title: "金属部分は研磨剤で磨き上げ", detail: "蛇口等を研磨剤でピカピカにします" },
        { number: 8, title: "排水管に強力パイプクリーナー投入", detail: "髪の毛等の詰まりを溶かします" },
        { number: 9, title: "熱湯で全体を徹底洗浄", detail: "洗剤と汚れを完全に流し去ります" },
        { number: 10, title: "防カビコーティングで仕上げ", detail: "カビ防止剤で再発を防ぎます" }
      ]
    }
  };
  
  let totalFixed = 0;
  let totalErrors = 0;
  
  for (const file of bathroomHeavyPages) {
    const filePath = path.join(__dirname, file);
    const filename = path.basename(file);
    
    try {
      let html = await fs.readFile(filePath, 'utf8');
      const originalHtml = html;
      
      // Get cleaning steps for this page
      const stepData = cleaningStepsData[filename];
      if (!stepData) {
        console.log(`⚠️ No cleaning steps data for ${filename}`);
        continue;
      }
      
      // Generate cleaning steps HTML
      const cleaningStepsHTML = `
        <div class="section">
            <h2>掃除手順（10ステップ）</h2>
            ${stepData.steps.map(step => `
            <div class="step">
                <div class="step-number">${step.number}</div>
                <div class="step-content">
                    <h3>${step.title}</h3>
                    <div class="step-detail">${step.detail}</div>
                </div>
            </div>`).join('')}
        </div>`;
      
      // Find the location to insert cleaning steps (after the feedback section)
      const feedbackEndMatch = html.match(/(<\/script>\s*<\/div>)\s*(<div class="section products-section">)/);
      if (feedbackEndMatch) {
        html = html.replace(
          feedbackEndMatch[0],
          `${feedbackEndMatch[1]}\n\n${cleaningStepsHTML}\n\n        ${feedbackEndMatch[2]}`
        );
      }
      
      // Remove duplicate category titles and empty sections
      // Pattern: Multiple category titles followed by empty divs
      html = html.replace(
        /<h3 class="category-title">洗剤・クリーナー<\/h3>\s*<\/div>\s*<h3 class="category-title">スポンジ・ブラシ類<\/h3>\s*<\/div>\s*<h3 class="category-title">保護具<\/h3>\s*<\/div>/g,
        ''
      );
      
      // Remove orphaned category titles
      html = html.replace(
        /<h3 class="category-title">専門掃除道具（5選）<\/h3>\s*<\/div>\s*<\/div>\s*<h3 class="category-title">強化保護具（5選）<\/h3>/g,
        ''
      );
      
      // Fix the duplicate feedback section comment at the end
      html = html.replace(
        /(<\/div>\s*<!-- 掃除方法フィードバックセクション -->\s*<\/div>\s*<\/body>)/,
        '</div>\n\n</body>'
      );
      
      // Remove any remaining stray closing divs before </body>
      html = html.replace(
        /(<\/div>)\s*(<\/div>)\s*(<\/body>)/,
        '$1\n\n$3'
      );
      
      // Clean up excessive whitespace
      html = html.replace(/\n{4,}/g, '\n\n\n');
      
      if (html !== originalHtml) {
        await fs.writeFile(filePath, html, 'utf8');
        console.log(`✅ Fixed: ${filename}`);
        totalFixed++;
      } else {
        console.log(`✔️ No changes needed: ${filename}`);
      }
      
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
      totalErrors++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Fixed ${totalFixed} files`);
  if (totalErrors > 0) {
    console.log(`❌ Failed to fix ${totalErrors} files`);
  }
  console.log('='.repeat(50));
  
  return totalErrors === 0;
}

// Run the fixes
fixBathroomHeavyPages()
  .then(success => {
    if (success) {
      console.log('\n✅ Bathroom heavy pages fixed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Some files could not be fixed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });