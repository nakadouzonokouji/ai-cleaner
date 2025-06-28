/**
 * Gemini API 統合
 * Google Generative AI を使用した対話システム
 */

class GeminiAPI {
    constructor() {
        this.apiKey = '';
        this.model = 'gemini-1.5-flash';
        this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.initialized = false;
    }

    /**
     * APIキーを設定
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        if (apiKey && apiKey.length > 0) {
            this.initialized = true;
            console.log('✅ Gemini API キーが設定されました');
        }
    }

    /**
     * 掃除に関する質問に回答
     */
    async getCleaningAdvice(userMessage, context = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Gemini APIが初期化されていません');
            return this.getFallbackResponse(userMessage, context);
        }

        try {
            const prompt = this.buildCleaningPrompt(userMessage, context);
            
            const response = await fetch(`${this.endpoint}/${this.model}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API エラー: ${response.statusText}`);
            }

            const data = await response.json();
            return this.parseGeminiResponse(data, userMessage);

        } catch (error) {
            console.error('Gemini API エラー:', error);
            return this.getFallbackResponse(userMessage, context);
        }
    }

    /**
     * 掃除用のプロンプトを構築
     */
    buildCleaningPrompt(userMessage, context) {
        return `あなたは親切で専門的な掃除アドバイザーです。以下のルールに従って回答してください：

1. ユーザーの質問に対して、具体的で実用的な掃除方法を提案する
2. 必要な道具、手順、所要時間、ポイントを含める
3. 安全に関する注意事項も必ず含める
4. 質問が曖昧な場合は、詳細を確認するための選択肢を提供する
5. 回答は日本語で、敬語を使用する

コンテキスト:
- 前の会話: ${context.previousMessage || 'なし'}
- 現在の掃除場所: ${context.location || '未指定'}
- 汚れの種類: ${context.dirtType || '未指定'}

ユーザーの質問: ${userMessage}

回答形式:
{
  "type": "advice" または "question",
  "message": "メインの回答",
  "options": [選択肢がある場合],
  "showProducts": true/false,
  "location": "掃除場所",
  "dirtType": "汚れの種類"
}`;
    }

    /**
     * Geminiの応答を解析
     */
    parseGeminiResponse(data, userMessage) {
        try {
            const text = data.candidates[0].content.parts[0].text;
            
            // JSONとして解析を試みる
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                // JSON解析に失敗した場合はテキストとして処理
            }

            // テキストレスポンスから構造化データを生成
            return this.structureTextResponse(text, userMessage);

        } catch (error) {
            console.error('Gemini応答解析エラー:', error);
            return this.getFallbackResponse(userMessage);
        }
    }

    /**
     * テキストレスポンスを構造化
     */
    structureTextResponse(text, userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // 掃除場所の判定
        let location = 'general';
        let dirtType = '汚れ';
        
        if (lowerMessage.includes('キッチン') || lowerMessage.includes('換気扇') || lowerMessage.includes('コンロ')) {
            location = 'kitchen';
            dirtType = '油汚れ';
        } else if (lowerMessage.includes('風呂') || lowerMessage.includes('浴室') || lowerMessage.includes('シャワー')) {
            location = 'bathroom';
            dirtType = lowerMessage.includes('カビ') ? 'カビ' : '水垢';
        } else if (lowerMessage.includes('トイレ')) {
            location = 'toilet';
            dirtType = '尿石';
        }

        // 質問形式かアドバイス形式かを判定
        const isQuestion = text.includes('？') && text.length < 200;

        return {
            type: isQuestion ? 'question' : 'advice',
            message: text,
            showProducts: !isQuestion,
            location: location,
            dirtType: dirtType
        };
    }

    /**
     * フォールバックレスポンス
     */
    getFallbackResponse(userMessage, context = {}) {
        // 既存のgetMockResponseロジックを使用
        console.log('⚠️ Gemini APIが利用できないため、フォールバックレスポンスを使用');
        return null; // dialogue-app.jsのgetMockResponseを使用
    }

    /**
     * APIキーのテスト
     */
    async testConnection() {
        if (!this.apiKey) {
            return { success: false, error: 'APIキーが設定されていません' };
        }

        try {
            const response = await fetch(`${this.endpoint}/${this.model}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'テスト'
                        }]
                    }]
                })
            });

            if (response.ok) {
                return { success: true, message: 'Gemini API接続成功' };
            } else {
                return { success: false, error: `接続エラー: ${response.statusText}` };
            }

        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// グローバルインスタンス
window.geminiAPI = new GeminiAPI();

// 初期化時にローカルストレージからAPIキーを読み込む
document.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        window.geminiAPI.setApiKey(savedApiKey);
    }
});