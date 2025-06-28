/**
 * 環境変数ローダー
 * Netlify環境変数とGitHub Secretsを統合管理
 */

class EnvLoader {
    constructor() {
        this.env = {};
        this.loaded = false;
    }

    /**
     * 環境変数を読み込む
     */
    async loadEnvironmentVariables() {
        try {
            // Netlify環境変数（ランタイム）
            if (window.process && window.process.env) {
                this.env = {
                    AMAZON_ACCESS_KEY: window.process.env.AMAZON_ACCESS_KEY || '',
                    AMAZON_SECRET_KEY: window.process.env.AMAZON_SECRET_KEY || '',
                    AMAZON_ASSOCIATE_TAG: window.process.env.AMAZON_ASSOCIATE_TAG || '',
                    GEMINI_API_KEY: window.process.env.GEMINI_API_KEY || ''
                };
            } 
            // Netlify Functions経由で環境変数を取得
            else if (window.location.hostname !== 'localhost') {
                const response = await fetch('/.netlify/functions/get-env');
                if (response.ok) {
                    this.env = await response.json();
                }
            }

            // ローカル開発用のフォールバック
            if (!this.env.AMAZON_ACCESS_KEY) {
                console.warn('⚠️ 環境変数が設定されていません。Netlifyの環境変数設定を確認してください。');
                this.loadFromLocalStorage();
            }

            this.loaded = true;
            this.applyEnvironmentVariables();
            
        } catch (error) {
            console.error('環境変数の読み込みエラー:', error);
            this.loadFromLocalStorage();
        }
    }

    /**
     * ローカルストレージから読み込む（開発用）
     */
    loadFromLocalStorage() {
        this.env = {
            AMAZON_ACCESS_KEY: localStorage.getItem('AMAZON_ACCESS_KEY') || '',
            AMAZON_SECRET_KEY: localStorage.getItem('AMAZON_SECRET_KEY') || '',
            AMAZON_ASSOCIATE_TAG: localStorage.getItem('AMAZON_ASSOCIATE_TAG') || 'asdfghj12-22',
            GEMINI_API_KEY: localStorage.getItem('GEMINI_API_KEY') || ''
        };
    }

    /**
     * 環境変数を各設定に適用
     */
    applyEnvironmentVariables() {
        // Amazon設定を更新
        if (window.AMAZON_CONFIG) {
            window.AMAZON_CONFIG.accessKey = this.env.AMAZON_ACCESS_KEY;
            window.AMAZON_CONFIG.secretKey = this.env.AMAZON_SECRET_KEY;
            window.AMAZON_CONFIG.associateTag = this.env.AMAZON_ASSOCIATE_TAG || 'asdfghj12-22';
            
            console.log('✅ Amazon設定を環境変数から更新しました');
        }

        // Gemini APIキーを設定
        if (window.geminiAPI && this.env.GEMINI_API_KEY) {
            window.geminiAPI.setApiKey(this.env.GEMINI_API_KEY);
            console.log('✅ Gemini APIキーを環境変数から設定しました');
        }

        // config.jsの設定も更新
        if (window.GEMINI_API_CONFIG) {
            window.GEMINI_API_CONFIG.apiKey = this.env.GEMINI_API_KEY;
        }
        if (window.AMAZON_PA_API_CONFIG) {
            window.AMAZON_PA_API_CONFIG.accessKey = this.env.AMAZON_ACCESS_KEY;
            window.AMAZON_PA_API_CONFIG.secretKey = this.env.AMAZON_SECRET_KEY;
            window.AMAZON_PA_API_CONFIG.associateTag = this.env.AMAZON_ASSOCIATE_TAG || 'asdfghj12-22';
        }
    }

    /**
     * 環境変数を取得
     */
    get(key) {
        return this.env[key] || '';
    }

    /**
     * すべての環境変数を取得
     */
    getAll() {
        return { ...this.env };
    }

    /**
     * 設定状態を確認
     */
    checkStatus() {
        const status = {
            amazon: {
                accessKey: !!this.env.AMAZON_ACCESS_KEY,
                secretKey: !!this.env.AMAZON_SECRET_KEY,
                associateTag: !!this.env.AMAZON_ASSOCIATE_TAG
            },
            gemini: {
                apiKey: !!this.env.GEMINI_API_KEY
            }
        };

        console.log('🔍 環境変数ステータス:', status);
        return status;
    }
}

// グローバルインスタンス
window.envLoader = new EnvLoader();

// ページ読み込み時に環境変数を読み込む
document.addEventListener('DOMContentLoaded', async () => {
    await window.envLoader.loadEnvironmentVariables();
    window.envLoader.checkStatus();
});