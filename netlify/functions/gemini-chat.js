/**
 * Netlify Function: Gemini API プロキシ
 * クライアントからの要求を受けてGemini APIを呼び出す
 */

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message, context: userContext } = JSON.parse(event.body);
        
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Gemini API key not configured');
        }

        // Gemini APIを呼び出す
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: buildCleaningPrompt(message, userContext)
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
            }
        );

        if (!geminiResponse.ok) {
            throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
        }

        const data = await geminiResponse.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        // 応答を構造化
        const structuredResponse = parseGeminiResponse(responseText, message);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(structuredResponse)
        };

    } catch (error) {
        console.error('Gemini chat error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to process request',
                message: error.message 
            })
        };
    }
};

function buildCleaningPrompt(userMessage, context) {
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

回答は以下の形式のJSONで返してください：
{
  "type": "advice" または "question",
  "message": "メインの回答（掃除方法の詳細）",
  "options": [{"text": "選択肢テキスト", "value": "選択肢の値"}],
  "showProducts": true/false,
  "location": "掃除場所（kitchen/bathroom/toilet/floor/window等）",
  "dirtType": "汚れの種類（油汚れ/カビ/水垢/尿石等）"
}`;
}

function parseGeminiResponse(responseText, userMessage) {
    try {
        // JSONとして解析を試みる
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        // JSON解析に失敗した場合
    }

    // フォールバック：テキストから構造化データを生成
    const lowerMessage = userMessage.toLowerCase();
    
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

    const isQuestion = responseText.includes('？') && responseText.length < 200;

    return {
        type: isQuestion ? 'question' : 'advice',
        message: responseText,
        showProducts: !isQuestion,
        location: location,
        dirtType: dirtType
    };
}