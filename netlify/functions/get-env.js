/**
 * Netlify Function: 環境変数を安全に取得
 * APIキーをクライアントに直接露出させずに使用
 */

exports.handler = async (event, context) => {
    // CORS対応
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // OPTIONSリクエストへの対応
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // 環境変数の存在確認（値は返さない）
        const envStatus = {
            hasAmazonKeys: !!(process.env.AMAZON_ACCESS_KEY && process.env.AMAZON_SECRET_KEY),
            hasAmazonTag: !!process.env.AMAZON_ASSOCIATE_TAG,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            // アソシエイトタグは公開しても問題ないので返す
            associateTag: process.env.AMAZON_ASSOCIATE_TAG || 'asdfghj12-22'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(envStatus)
        };

    } catch (error) {
        console.error('Environment check error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};