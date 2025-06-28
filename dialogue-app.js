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
        
        // デフォルト
        return {
            message: 'もう少し詳しく教えていただけますか？どちらの場所のお掃除でお困りでしょうか？'
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
        
        // 対応する応答を生成
        this.generateAIResponse(text);
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