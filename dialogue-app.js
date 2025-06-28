/**
 * AI掃除アドバイザー - 対話型システム
 * 新しい仕様に基づいた実装
 */

class DialogueCleaningAdvisor {
    constructor() {
        this.state = {
            messages: [],
            currentContext: null,
            waitingForResponse: false,
            geminiApiKey: '',
            analysisLog: []
        };
        
        this.init();
    }

    init() {
        // ローカルストレージから分析ログを読み込み
        this.loadAnalysisLog();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // 初期メッセージ
        this.addMessage('ai', 'こんにちは！AI掃除アドバイザーです。掃除でお困りのことがあれば、何でもご相談ください。例えば「キッチンを掃除したい」などとお話しください。');
    }

    setupEventListeners() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const cleaningInput = document.getElementById('cleaningInput');
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.handleUserInput());
        }
        
        if (cleaningInput) {
            cleaningInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleUserInput();
                }
            });
        }
    }

    async handleUserInput() {
        const input = document.getElementById('cleaningInput');
        const userMessage = input.value.trim();
        
        if (!userMessage) return;
        
        // ユーザーメッセージを追加
        this.addMessage('user', userMessage);
        
        // 入力をクリア
        input.value = '';
        
        // ログに記録
        this.logAnalysis(userMessage);
        
        // AIの応答を生成
        await this.generateAIResponse(userMessage);
    }

    async generateAIResponse(userMessage) {
        this.state.waitingForResponse = true;
        this.showTypingIndicator();
        
        try {
            // Gemini APIを使用する場合はここで呼び出し
            // 今はモックレスポンスを使用
            const response = await this.getMockResponse(userMessage);
            
            this.hideTypingIndicator();
            this.addMessage('ai', response.message);
            
            // 選択肢がある場合は表示
            if (response.options) {
                this.showOptions(response.options);
            }
            
            // 掃除方法が確定した場合は商品を表示
            if (response.showProducts) {
                await this.showRecommendedProducts(response.location, response.dirtType);
            }
            
        } catch (error) {
            console.error('AI応答エラー:', error);
            this.hideTypingIndicator();
            this.addMessage('ai', '申し訳ございません。エラーが発生しました。もう一度お試しください。');
        }
        
        this.state.waitingForResponse = false;
    }

    async getMockResponse(message) {
        // メッセージを解析して適切な応答を返す
        const lowerMessage = message.toLowerCase();
        
        // キッチン関連
        if (lowerMessage.includes('キッチン')) {
            return {
                message: 'キッチンのお掃除ですね。キッチンのどの部分でお困りでしょうか？',
                options: [
                    { text: 'シンク', value: 'kitchen_sink' },
                    { text: 'コンロ', value: 'kitchen_stove' },
                    { text: '換気扇', value: 'kitchen_fan' },
                    { text: '冷蔵庫', value: 'kitchen_fridge' }
                ]
            };
        }
        
        // お風呂・浴室関連
        if (lowerMessage.includes('風呂') || lowerMessage.includes('浴室') || lowerMessage.includes('バスルーム')) {
            return {
                message: 'お風呂のお掃除ですね。どの部分が気になりますか？',
                options: [
                    { text: '浴槽', value: 'bathroom_tub' },
                    { text: 'シャワー・蛇口', value: 'bathroom_shower' },
                    { text: '壁・天井のカビ', value: 'bathroom_mold' },
                    { text: '排水口', value: 'bathroom_drain' },
                    { text: '鏡・ガラス', value: 'bathroom_mirror' }
                ]
            };
        }
        
        // シャワー関連
        if (lowerMessage.includes('シャワー') || lowerMessage.includes('蛇口') || lowerMessage.includes('カラン')) {
            return {
                message: `シャワーヘッドや蛇口のお掃除方法をご説明します。

【必要な道具】
・クエン酸またはお酢
・古い歯ブラシ
・スポンジ
・ビニール袋と輪ゴム

【手順】
1. シャワーヘッドの水垢除去
   - クエン酸水（水200mlにクエン酸小さじ1）を作ります
   - ビニール袋にクエン酸水を入れ、シャワーヘッドを浸します
   - 輪ゴムで固定して1〜2時間放置
   - 歯ブラシで細かい穴の汚れを取ります

2. 蛇口・カランの掃除
   - クエン酸水をスプレーして10分放置
   - スポンジで優しくこすります
   - 細かい部分は歯ブラシで掃除
   - 最後に水で流して乾拭き

【所要時間】約30分（浸け置き時間除く）

【ポイント】
・月1回のクエン酸掃除で水垢を防げます
・日々の使用後に軽く拭くだけでも効果的`,
                showProducts: true,
                location: 'bathroom',
                dirtType: '水垢'
            };
        }
        
        // カビ関連
        if (lowerMessage.includes('カビ')) {
            return {
                message: `カビのお掃除方法をご説明します。

【必要な道具】
・カビ取り剤（カビキラーなど）
・ゴム手袋
・マスク
・スポンジまたはブラシ
・換気扇

【手順】
1. 必ず換気をして、ゴム手袋とマスクを着用
2. カビ取り剤を気になる部分にスプレー
3. 5〜10分放置（パッケージの指示に従う）
4. スポンジやブラシで軽くこする
5. 十分に水で洗い流す
6. 乾いた布で水分を拭き取る

【所要時間】約20〜30分

【予防のポイント】
・使用後は必ず換気
・水分をこまめに拭き取る
・週1回は軽い掃除を`,
                showProducts: true,
                location: 'bathroom',
                dirtType: 'カビ'
            };
        }
        
        // トイレ関連
        if (lowerMessage.includes('トイレ') || lowerMessage.includes('便器')) {
            return {
                message: 'トイレのお掃除ですね。どの部分が気になりますか？',
                options: [
                    { text: '便器の黄ばみ', value: 'toilet_stain' },
                    { text: '便器のフチ裏', value: 'toilet_rim' },
                    { text: '床・壁', value: 'toilet_floor' },
                    { text: 'タンク', value: 'toilet_tank' }
                ]
            };
        }
        
        // シンク
        if (lowerMessage.includes('シンク')) {
            return {
                message: `シンクのお掃除方法をご説明します。

【必要な道具】
・食器用洗剤
・重曹またはクレンザー
・スポンジ
・古い歯ブラシ

【手順】
1. まず、シンク内の食器や残り物を片付けます
2. ぬるま湯で全体を濡らします
3. 食器用洗剤をスポンジにつけて全体を洗います
4. 排水口は古い歯ブラシで細かい部分まで掃除
5. 水垢が気になる場合は重曹やクレンザーで磨きます
6. 最後によくすすいで、乾いた布で拭き上げます

【所要時間】約15〜20分

【ポイント】
・毎日の使用後に軽く洗うと汚れがたまりません
・週1回は重曹で磨くとピカピカを保てます`,
                showProducts: true,
                location: 'kitchen',
                dirtType: '水垢'
            };
        }
        
        // 床関連
        if (lowerMessage.includes('床') || lowerMessage.includes('フローリング')) {
            return {
                message: 'フローリングのお掃除ですね。どのような汚れでお困りですか？',
                options: [
                    { text: 'ホコリ・ゴミ', value: 'floor_dust' },
                    { text: '黒ずみ・汚れ', value: 'floor_stain' },
                    { text: 'ベタつき', value: 'floor_sticky' },
                    { text: 'ワックスがけ', value: 'floor_wax' }
                ]
            };
        }
        
        // 窓関連
        if (lowerMessage.includes('窓') || lowerMessage.includes('ガラス')) {
            return {
                message: `窓ガラスのお掃除方法をご説明します。

【必要な道具】
・ガラスクリーナー
・新聞紙またはマイクロファイバークロス
・スクイージー（あれば）

【手順】
1. まず乾いた布でホコリを払います
2. ガラスクリーナーを窓に吹きかけます
3. 新聞紙やクロスで円を描くように拭きます
4. スクイージーで上から下へ水を切ります
5. 最後に乾いた布で仕上げ拭き

【所要時間】窓1枚あたり約10分

【ポイント】
・曇りの日が最適（晴れだと乾きが早すぎる）
・新聞紙を使うとピカピカに仕上がります`,
                showProducts: true,
                location: 'window',
                dirtType: '汚れ'
            };
        }
        
        // より詳しい情報を求める
        return {
            message: 'どちらの場所のお掃除でお困りでしょうか？お掃除したい場所を教えてください。',
            options: [
                { text: 'キッチン', value: 'kitchen' },
                { text: 'お風呂・浴室', value: 'bathroom' },
                { text: 'トイレ', value: 'toilet' },
                { text: '床・フローリング', value: 'floor' },
                { text: '窓・ガラス', value: 'window' }
            ]
        };
    }

    showOptions(options) {
        const optionsHtml = options.map(option => 
            `<button class="option-btn bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg mr-2 mb-2" 
                     onclick="dialogueAdvisor.selectOption('${option.value}', '${option.text}')">
                ${option.text}
            </button>`
        ).join('');
        
        this.addMessage('options', optionsHtml);
    }

    selectOption(value, text) {
        // オプションボタンを無効化
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-50');
        });
        
        // 選択をユーザーメッセージとして追加
        this.addMessage('user', text);
        
        // 値に基づいて特定の応答を生成
        this.generateOptionResponse(value);
    }
    
    async generateOptionResponse(value) {
        this.state.waitingForResponse = true;
        this.showTypingIndicator();
        
        try {
            let response = null;
            
            // 選択肢の値に基づいて応答を決定
            switch(value) {
                // 浴室関連
                case 'bathroom_tub':
                    response = {
                        message: `浴槽のお掃除方法をご説明します。

【必要な道具】
・浴室用洗剤
・スポンジまたはブラシ
・重曹（頑固な汚れ用）

【手順】
1. 浴槽の水を完全に抜きます
2. 浴室用洗剤を全体にスプレー
3. 5分ほど放置して汚れを浮かせます
4. スポンジで円を描くように洗います
5. 頑固な湯垢は重曹ペーストで磨きます
6. シャワーでしっかり洗い流します

【所要時間】約20分

【ポイント】
・入浴後すぐに掃除すると汚れが落ちやすい
・週2〜3回の掃除で清潔を保てます`,
                        showProducts: true,
                        location: 'bathroom',
                        dirtType: '湯垢'
                    };
                    break;
                    
                case 'bathroom_shower':
                    response = {
                        message: `シャワーヘッドや蛇口のお掃除方法をご説明します。

【必要な道具】
・クエン酸またはお酢
・古い歯ブラシ
・スポンジ
・ビニール袋と輪ゴム

【手順】
1. シャワーヘッドの水垢除去
   - クエン酸水（水200mlにクエン酸小さじ1）を作ります
   - ビニール袋にクエン酸水を入れ、シャワーヘッドを浸します
   - 輪ゴムで固定して1〜2時間放置
   - 歯ブラシで細かい穴の汚れを取ります

2. 蛇口・カランの掃除
   - クエン酸水をスプレーして10分放置
   - スポンジで優しくこすります
   - 細かい部分は歯ブラシで掃除
   - 最後に水で流して乾拭き

【所要時間】約30分（浸け置き時間除く）

【ポイント】
・月1回のクエン酸掃除で水垢を防げます
・日々の使用後に軽く拭くだけでも効果的`,
                        showProducts: true,
                        location: 'bathroom',
                        dirtType: '水垢'
                    };
                    break;
                    
                case 'bathroom_mold':
                    response = {
                        message: `浴室の壁・天井のカビ取り方法をご説明します。

【必要な道具】
・カビ取り剤（カビキラーなど）
・ゴム手袋・マスク・ゴーグル
・スポンジまたはブラシ
・脚立（天井用）

【手順】
1. 必ず換気扇を回し、窓を開けます
2. ゴム手袋・マスク・ゴーグルを着用
3. カビ取り剤を壁や天井にスプレー
4. 10〜15分放置（換気は継続）
5. ブラシで軽くこすります
6. シャワーで十分に洗い流します
7. 乾いたタオルで水分を拭き取ります

【所要時間】約30〜40分

【予防のポイント】
・入浴後は必ず換気（最低30分）
・週1回は防カビ剤をスプレー
・水滴は都度拭き取る`,
                        showProducts: true,
                        location: 'bathroom',
                        dirtType: 'カビ'
                    };
                    break;
                    
                // キッチン関連
                case 'kitchen_sink':
                    response = {
                        message: `シンクのお掃除方法をご説明します。

【必要な道具】
・食器用洗剤
・重曹またはクレンザー
・スポンジ
・古い歯ブラシ

【手順】
1. まず、シンク内の食器や残り物を片付けます
2. ぬるま湯で全体を濡らします
3. 食器用洗剤をスポンジにつけて全体を洗います
4. 排水口は古い歯ブラシで細かい部分まで掃除
5. 水垢が気になる場合は重曹やクレンザーで磨きます
6. 最後によくすすいで、乾いた布で拭き上げます

【所要時間】約15〜20分

【ポイント】
・毎日の使用後に軽く洗うと汚れがたまりません
・週1回は重曹で磨くとピカピカを保てます`,
                        showProducts: true,
                        location: 'kitchen',
                        dirtType: '水垢'
                    };
                    break;
                    
                case 'kitchen_stove':
                    response = {
                        message: `コンロのお掃除方法をご説明します。

【必要な道具】
・キッチン用洗剤（油汚れ用）
・重曹
・スポンジ・布
・古い歯ブラシ

【手順】
1. 五徳など外せる部品を外します
2. 外した部品は重曹水に浸け置き（30分）
3. コンロ周りに洗剤をスプレーして5分放置
4. スポンジで油汚れをこすり落とします
5. 細かい部分は歯ブラシで掃除
6. 五徳を洗ってから元に戻します

【所要時間】約40分

【ポイント】
・使用後の温かいうちに拭くと楽
・週1回の掃除で頑固な汚れを防げます`,
                        showProducts: true,
                        location: 'kitchen',
                        dirtType: '油汚れ'
                    };
                    break;
                    
                case 'kitchen_fan':
                    response = {
                        message: `換気扇のお掃除方法をご説明します。

【必要な道具】
・強力な油汚れ用洗剤
・重曹
・ゴム手袋
・新聞紙
・大きめのビニール袋

【手順】
1. 換気扇の電源を切り、フィルターを外します
2. シンクに新聞紙を敷き、ビニール袋を広げます
3. フィルターを袋に入れ、洗剤をたっぷりスプレー
4. 重曹をふりかけて30分〜1時間放置
5. お湯でしっかり洗い流します
6. 本体は洗剤を含ませた布で拭きます

【所要時間】約1時間（浸け置き時間含む）

【ポイント】
・月1回の掃除がおすすめ
・市販の換気扇フィルターを使うと掃除が楽に`,
                        showProducts: true,
                        location: 'kitchen',
                        dirtType: '油汚れ'
                    };
                    break;
                    
                // トイレ関連
                case 'toilet_stain':
                    response = {
                        message: `便器の黄ばみ除去方法をご説明します。

【必要な道具】
・トイレ用洗剤（酸性タイプ）
・トイレブラシ
・ゴム手袋
・重曹とクエン酸（頑固な汚れ用）

【手順】
1. 便器の水位を下げます（灯油ポンプ等で）
2. 黄ばみ部分に洗剤をかけて10分放置
3. トイレブラシでしっかりこすります
4. 頑固な汚れは重曹→クエン酸の順でかけます
5. 再度ブラシでこすって流します

【所要時間】約20分

【ポイント】
・週1回の掃除で黄ばみを防げます
・就寝前に洗剤をかけて朝掃除すると効果的`,
                        showProducts: true,
                        location: 'toilet',
                        dirtType: '尿石'
                    };
                    break;
                    
                // 床関連
                case 'floor_dust':
                    response = {
                        message: `フローリングのホコリ・ゴミ掃除方法をご説明します。

【必要な道具】
・フロアワイパー（クイックルワイパー等）
・掃除機
・乾拭き用シート
・水拭き用シート

【手順】
1. まず乾いたシートでホコリを取ります
2. 部屋の奥から入口に向かって拭きます
3. 掃除機で細かいゴミを吸い取ります
4. 仕上げに水拭きシートで拭きます
5. 風通しを良くして乾燥させます

【所要時間】6畳で約15分

【ポイント】
・朝一番か帰宅直後がホコリが舞いにくい
・週2〜3回の掃除が理想的`,
                        showProducts: true,
                        location: 'floor',
                        dirtType: 'ホコリ'
                    };
                    break;
                    
                default:
                    // その他の選択肢
                    response = await this.getMockResponse(value);
            }
            
            this.hideTypingIndicator();
            if (response.message) {
                this.addMessage('ai', response.message);
            }
            
            if (response.options) {
                this.showOptions(response.options);
            }
            
            if (response.showProducts) {
                await this.showRecommendedProducts(response.location, response.dirtType);
            }
            
        } catch (error) {
            console.error('オプション応答エラー:', error);
            this.hideTypingIndicator();
            this.addMessage('ai', '申し訳ございません。エラーが発生しました。もう一度お試しください。');
        }
        
        this.state.waitingForResponse = false;
    }

    async showRecommendedProducts(location, dirtType) {
        // 商品表示エリアを表示
        const resultArea = document.getElementById('resultArea');
        if (resultArea) {
            resultArea.classList.remove('hidden');
        }
        
        // bestseller-products.jsから売れ筋商品を取得
        if (window.getBestsellerProducts) {
            const products = window.getBestsellerProducts(location, dirtType);
            this.displayProducts(products);
        }
    }

    displayProducts(products) {
        let html = '<div class="mt-8">';
        html += '<h3 class="text-2xl font-bold mb-4">🛒 おすすめ商品（売れ筋TOP4）</h3>';
        html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">';
        
        products.forEach((product, index) => {
            // バッジの背景色を決定
            let badgeClass = 'bg-gray-100 text-gray-700';
            if (product.badge && product.badge.includes('No.1')) {
                badgeClass = 'bg-yellow-100 text-yellow-800';
            } else if (product.badge && product.badge.includes('No.2')) {
                badgeClass = 'bg-gray-100 text-gray-700';
            } else if (product.badge && product.badge.includes('No.3')) {
                badgeClass = 'bg-orange-100 text-orange-800';
            }
            
            html += `
                <div class="bg-white rounded-lg shadow-lg p-4">
                    ${product.badge ? `<div class="${badgeClass} text-xs font-bold px-2 py-1 rounded-full mb-2 text-center">${product.badge}</div>` : ''}
                    <div class="aspect-square mb-4 bg-gray-100 rounded flex items-center justify-center">
                        <img src="https://m.media-amazon.com/images/I/${product.asin}._AC_SL500_.jpg" 
                             alt="${product.name}" 
                             class="max-h-full max-w-full object-contain"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="text-6xl" style="display:none;">${product.emoji || '🧴'}</div>
                    </div>
                    <h4 class="font-bold text-sm mb-2 line-clamp-2">${product.name}</h4>
                    <div class="text-2xl font-bold text-red-600 mb-2">${product.price}</div>
                    <div class="flex items-center text-sm mb-3">
                        <span class="text-yellow-400">★★★★★</span>
                        <span class="ml-1">${product.rating}</span>
                        <span class="text-gray-500 ml-2">(${product.reviews.toLocaleString()}件)</span>
                    </div>
                    <button onclick="window.open('${product.url}', '_blank')" 
                            class="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-bold text-sm">
                        Amazonで購入
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        
        // もっと見るボタン
        html += `
            <div class="text-center mt-6">
                <button onclick="window.open('https://www.amazon.co.jp/s?k=掃除用品&tag=asdfghj12-22', '_blank')" 
                        class="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold">
                    もっと見る →
                </button>
            </div>
        `;
        
        html += '</div>';
        
        const productArea = document.getElementById('productArea');
        if (productArea) {
            productArea.innerHTML = html;
        }
    }

    addMessage(type, content) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // チャットエリアを表示
        chatMessages.classList.remove('hidden');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-4 ${type === 'user' ? 'text-right' : 'text-left'}`;
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg max-w-md">
                    ${content}
                </div>
            `;
        } else if (type === 'ai') {
            messageDiv.innerHTML = `
                <div class="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-md whitespace-pre-wrap">
                    ${content}
                </div>
            `;
        } else if (type === 'options') {
            messageDiv.innerHTML = `<div class="mt-2">${content}</div>`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // メッセージを状態に保存
        this.state.messages.push({ type, content, timestamp: new Date() });
    }

    showTypingIndicator() {
        this.addMessage('ai', '...');
        this.typingIndicator = document.querySelector('#chatMessages > div:last-child');
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
            this.typingIndicator = null;
        }
    }

    logAnalysis(query) {
        const log = {
            query,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        this.state.analysisLog.push(log);
        
        // ローカルストレージに保存
        localStorage.setItem('cleaningAnalysisLog', JSON.stringify(this.state.analysisLog));
    }

    loadAnalysisLog() {
        const saved = localStorage.getItem('cleaningAnalysisLog');
        if (saved) {
            this.state.analysisLog = JSON.parse(saved);
        }
    }

    getAnalysisStats() {
        // 管理画面用の統計データを生成
        const stats = {
            totalQueries: this.state.analysisLog.length,
            popularQueries: this.getPopularQueries(),
            popularLocations: this.getPopularLocations(),
            timeDistribution: this.getTimeDistribution()
        };
        
        return stats;
    }

    getPopularQueries() {
        const queries = {};
        this.state.analysisLog.forEach(log => {
            const key = log.query.toLowerCase();
            queries[key] = (queries[key] || 0) + 1;
        });
        
        return Object.entries(queries)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([query, count]) => ({ query, count }));
    }

    getPopularLocations() {
        const locations = {
            'キッチン': 0,
            '浴室': 0,
            'トイレ': 0,
            '窓': 0,
            '床': 0
        };
        
        this.state.analysisLog.forEach(log => {
            const query = log.query.toLowerCase();
            if (query.includes('キッチン') || query.includes('シンク') || query.includes('コンロ')) locations['キッチン']++;
            if (query.includes('風呂') || query.includes('浴室') || query.includes('浴槽')) locations['浴室']++;
            if (query.includes('トイレ') || query.includes('便器')) locations['トイレ']++;
            if (query.includes('窓') || query.includes('ガラス')) locations['窓']++;
            if (query.includes('床') || query.includes('フローリング')) locations['床']++;
        });
        
        return Object.entries(locations)
            .sort((a, b) => b[1] - a[1])
            .map(([location, count]) => ({ location, count }));
    }

    getTimeDistribution() {
        const hours = Array(24).fill(0);
        
        this.state.analysisLog.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            hours[hour]++;
        });
        
        return hours;
    }
}

// グローバルインスタンス
window.dialogueAdvisor = new DialogueCleaningAdvisor();