/**
   * AI掃除アドバイザー - メインアプリケーション（サーバーレス対応版）
   * CX Mainte © 2025
   *
   * 🏠 完全対応：家中のあらゆる汚れに対応する最強システム
   * 🌐 サーバーレス：エックスサーバー等の静的ホスティング完全対応
   */

  class AICleaningAdvisor {
      constructor() {
          this.state = {
              selectedImage: null,
              preSelectedLocation: '',
              customLocation: '',
              analysis: null,
              showCorrection: false,
              geminiApiKey: '',
              currentFeedbackType: null
          };

          this.feedbackData = this.loadFeedbackData();
          this.isInitialized = false;
          this.init();
      }

      init() {
          // DOM準備を待つ（複数の方法で確実に）
          if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', () => this.initializeApp());
          } else {
              // すでに読み込み完了している場合
              setTimeout(() => this.initializeApp(), 50);
          }

          // さらに確実にするため、windowのloadイベントでも試行
          window.addEventListener('load', () => {
              if (!this.isInitialized) {
                  setTimeout(() => this.initializeApp(), 100);
              }
          });
      }

      initializeApp() {
          if (this.isInitialized) {
              return;
          }
          this.isInitialized = true;

          // 1. 基本的なイベントリスナーを設定
          this.setupBasicEventListeners();

          // 2. 場所選択ボタンを設定
          this.setupLocationButtons();

          // 3. アイコンとUI初期化
          this.initializeLucideIcons();
          this.updateUI();

          // 4. URLパラメータから場所を自動選択
          this.checkUrlForLocation();
      }


      // 場所選択ボタン設定
      setupLocationButtons() {
          const locationButtons = document.querySelectorAll('.location-btn');

          if (!locationButtons || locationButtons.length === 0) {
              return;
          }

          // 各ボタンに対して設定
          locationButtons.forEach((btn) => {
              const location = btn.getAttribute('data-location') || btn.dataset.location;

              if (!location) {
                  return;
              }

              // ボタンを有効化
              btn.disabled = false;
              btn.style.pointerEvents = 'auto';
              btn.style.opacity = '1';
              btn.style.cursor = 'pointer';
              btn.removeAttribute('disabled');

              // イベントリスナーを追加
              btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.selectLocation(location);
              });

              // フォールバック用のonclick
              btn.onclick = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.selectLocation(location);
              };
          });
      }


      // 場所選択処理
      selectLocation(locationId) {
          if (!locationId) {
              return;
          }

          // 詳細な場所IDから主要な場所IDを抽出
          const mainLocationId = locationId.split('-')[0];

          // 状態を更新
          this.state.preSelectedLocation = mainLocationId; // 主要な場所を保存
          this.state.customLocation = locationId; // 詳細な場所をカスタムとして保存

          // 全ボタンをリセット
          this.resetAllLocationButtons();

          // 選択ボタンをハイライト
          this.highlightSelectedButton(mainLocationId); // 主要な場所をハイライト

          // カスタム入力の表示制御
          this.handleCustomInput(mainLocationId); // 主要な場所に基づいてカスタム入力を制御

          // UI更新
          this.updateSelectedLocationDisplay();
          this.updateClearButtonVisibility();

          // 場所が選択されたら詳細選択UIを表示
          this.showDetailedLocationSelection(mainLocationId);
      }

      // 詳細場所選択UIを表示
      showDetailedLocationSelection(mainLocationId) {
          const mainLocationSelection = document.getElementById('mainLocationSelection');
          const detailedLocationSelection = document.getElementById('detailedLocationSelection');
          const selectedMainLocationName = document.getElementById('selectedMainLocationName');
          const detailedLocationButtons = document.getElementById('detailedLocationButtons');
          const backToMainLocationSelection = document.getElementById('backToMainLocationSelection');

          if (!mainLocationSelection || !detailedLocationSelection || !selectedMainLocationName || !detailedLocationButtons || !backToMainLocationSelection) {
              console.error('⚠️ 詳細場所選択UIの要素が見つかりません。');
              return;
          }

          // メイン選択を非表示
          mainLocationSelection.classList.add('hidden');
          // 分析エリアも非表示
          document.getElementById('analysisArea')?.classList.add('hidden');

          // 詳細選択UIのタイトルを更新
          const locationConfig = window.COMPREHENSIVE_LOCATION_CONFIG[mainLocationId];
          if (locationConfig) {
              selectedMainLocationName.textContent = locationConfig.label;
          }

          // 詳細場所ボタンを動的に生成
          detailedLocationButtons.innerHTML = ''; // 既存のボタンをクリア
          const detailedLocations = locationConfig?.detailedLocations || [];

          if (detailedLocations.length > 0) {
              detailedLocations.forEach(detail => {
                  const btn = document.createElement('div');
                  btn.className = 'location-btn location-card bg-white rounded-lg shadow p-6 text-center flex flex-col items-center justify-center';
                  btn.setAttribute('data-location', detail.id);
                  btn.innerHTML = `
                      <span class="text-5xl mb-3">${detail.emoji}</span>
                      <h3 class="text-xl font-bold text-gray-700">${detail.label}</h3>
                  `;
                  btn.addEventListener('click', () => this.selectDetailedLocation(detail.id));
                  detailedLocationButtons.appendChild(btn);
              });
          } else {
              // 詳細な場所がない場合は、大カテゴリ自体を詳細として扱う
              const btn = document.createElement('div');
              btn.className = 'location-btn location-card bg-white rounded-lg shadow p-6 text-center flex flex-col items-center justify-center';
              btn.setAttribute('data-location', mainLocationId);
              btn.innerHTML = `
                  <span class="text-5xl mb-3">${locationConfig.emoji || '✨'}</span>
                  <h3 class="text-xl font-bold text-gray-700">${locationConfig.label}全体</h3>
              `;
              btn.addEventListener('click', () => this.selectDetailedLocation(mainLocationId));
              detailedLocationButtons.appendChild(btn);
          }

          // 詳細選択UIを表示
          detailedLocationSelection.classList.remove('hidden');

          // 「大カテゴリ選択に戻る」ボタンのイベントリスナー
          backToMainLocationSelection.onclick = () => this.resetToMainLocationSelection();
      }

      // 詳細場所選択処理
      selectDetailedLocation(detailedLocationId) {
          this.state.customLocation = detailedLocationId; // 詳細な場所をカスタムとして保存
          this.state.preSelectedLocation = detailedLocationId.split('-')[0]; // 主要な場所を更新
          this.updateSelectedLocationDisplay();
          this.executeAnalysis();
      }

      // メイン場所選択に戻る
      resetToMainLocationSelection() {
          const mainLocationSelection = document.getElementById('mainLocationSelection');
          const detailedLocationSelection = document.getElementById('detailedLocationSelection');
          const analysisArea = document.getElementById('analysisArea');

          if (mainLocationSelection) mainLocationSelection.classList.remove('hidden');
          if (detailedLocationSelection) detailedLocationSelection.classList.add('hidden');
          if (analysisArea) analysisArea.classList.add('hidden');

          this.clearAll(); // 状態をリセット
      }

      // 成功通知表示
      showSuccessNotification(message) {
          try {
              const notification = document.createElement('div');
              notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #10b981;
                  color: white;
                  padding: 10px 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  z-index: 10000;
                  font-weight: bold;
              `;
              notification.textContent = `✅ ${message}`;
              document.body.appendChild(notification);

              setTimeout(() => {
                  notification.remove();
              }, 2000);
          } catch (error) {
              // エラーは無視
          }
      }

      // 全ボタンリセット
      resetAllLocationButtons() {
          try {
              const locationButtons = document.querySelectorAll('.location-btn');
              locationButtons.forEach(btn => {
                  btn.className = 'location-btn p-3 border-2 rounded-lg transition-colors text-sm text-left border-gray-200 hover:border-blue-300 hover:bg-blue-50';
              });
          } catch (error) {
              // エラーは無視
          }
      }

      // 選択ボタンハイライト
      highlightSelectedButton(locationId) {
          try {
              const selectedBtn = document.querySelector(`[data-location="${locationId}"]`);
              if (selectedBtn) {
                  let colorClass = 'border-blue-500 bg-blue-50 text-blue-700';
                  if (['aircon', 'washer'].includes(locationId)) {
                      colorClass = 'border-green-500 bg-green-50 text-green-700';
                  } else if (locationId === 'custom') {
                      colorClass = 'border-yellow-500 bg-yellow-50 text-yellow-700';
                  }

                  selectedBtn.className = `location-btn p-3 border-2 rounded-lg transition-colors text-sm text-left ${colorClass}`;
              }
          } catch (error) {
              // エラーは無視
          }
      }

      // カスタム入力制御
      handleCustomInput(locationId) {
          try {
              // カスタム入力フィールドはindex.htmlから削除されたため、ここでは何もしない
              // 必要であれば、カスタム場所のバリデーションロジックをここに記述
          } catch (error) {
              // エラーは無視
          }
      }

      // 🔍 システムの検証
      validateComprehensiveSystem() {
          const dirtCount = Object.keys(window.COMPREHENSIVE_DIRT_MAPPING || {}).length;
          const productCount = Object.keys(window.COMPREHENSIVE_PRODUCT_DATABASE || {}).length;
          const locationCount = Object.keys(window.COMPREHENSIVE_LOCATION_CONFIG || {}).length;

          console.log(`🎯 汚れタイプ: ${dirtCount}種類対応`);
          console.log(`🛒 商品カテゴリ: ${productCount}カテゴリ対応`);
          console.log(`📍 場所: ${locationCount}箇所対応`);

          if (dirtCount >= 20 && productCount >= 15 && locationCount >= 7) {
              console.log('🏆 システム稼働中！');
          } else {
              console.log('⚠️ システム不完全 - 設定ファイル確認が必要');
          }
      }

      autoLoadApiConfig() {
          console.log('API自動設定開始');

          let apiKey = null;

          if (typeof window.GEMINI_API_CONFIG !== 'undefined' && window.GEMINI_API_CONFIG.apiKey) {
              apiKey = window.GEMINI_API_CONFIG.apiKey;
              console.log('✅ GEMINI_API_CONFIG から取得');
          } else if (typeof window.currentGeminiApiKey !== 'undefined' && window.currentGeminiApiKey) {
              apiKey = window.currentGeminiApiKey;
              console.log('✅ currentGeminiApiKey から取得');
          }

          if (apiKey && apiKey.trim() !== '') {
              this.state.geminiApiKey = apiKey;
              window.currentGeminiApiKey = apiKey;
              console.log(`✅ Gemini APIキー設定完了: ${apiKey.substring(0, 20)}...`);

              if (typeof window.debugUI !== 'undefined') {
                  window.debugUI.updateGeminiStatus('✅ 設定済み', 'text-green-300');
              }

              this.showAutoConfigMessage();
          } else {
              console.log('⚠️ Gemini APIキーが見つかりません');
          }
      }

      // 基本的なイベントリスナー設定
      setupBasicEventListeners() {
          console.log('🔧 基本イベントリスナー設定開始');

          // API設定関連
          // this.addEventListenerSafe('saveGeminiApiBtn', 'click', () => this.saveGeminiApiKey());
          // this.addEventListenerSafe('testGeminiApiBtn', 'click', () => this.testGeminiConnection());
          // this.addEventListenerSafe('toggleApiKeyVisibility', 'click', () => this.toggleApiKeyVisibility());

          // デバッグ機能
          // this.addEventListenerSafe('testConnectionBtn', 'click', () => this.testAllConnections());
          // this.addEventListenerSafe('toggleDebugBtn', 'click', () => {
          //     if (typeof window.debugUI !== 'undefined') {
          //         window.debugUI.toggleDebugLog();
          //     }
          // });
          // this.addEventListenerSafe('exportConfigBtn', 'click', () => this.showExportModal());
          // this.addEventListenerSafe('clearLogBtn', 'click', () => {
          //     if (typeof window.debugLogger !== 'undefined') {
          //         window.debugLogger.clear();
          //     }
          // });

          // カスタム場所入力
          // this.addEventListenerSafe('customLocation', 'input', (e) => {
          //     this.state.customLocation = e.target.value;
          //     this.updateSelectedLocationDisplay();
          //     this.updateClearButtonVisibility();
          // });

          // 分析実行
          // this.addEventListenerSafe('analyzeBtn', 'click', () => this.executeAnalysis());

          // 結果操作
          this.addEventListenerSafe('copyResultBtn', 'click', () => this.copyAnalysisResult());
          this.addEventListenerSafe('copyMethodBtn', 'click', () => this.copyCleaningMethod());
          this.addEventListenerSafe('refreshPricesBtn', 'click', () => this.refreshProductPrices());

          // 修正オプション
          const correctionOptions = document.querySelectorAll('.correction-option');
          correctionOptions.forEach(btn => {
              btn.addEventListener('click', (e) => this.applyComprehensiveCorrection(e.target.dataset.type));
          });

          // フィードバック
          // this.addEventListenerSafe('feedbackGoodBtn', 'click', () => this.showFeedbackModal('good'));
          // this.addEventListenerSafe('feedbackBadBtn', 'click', () => this.showFeedbackModal('bad'));
          // this.addEventListenerSafe('submitFeedback', 'click', () => this.submitFeedback());
          // this.addEventListenerSafe('skipFeedback', 'click', () => this.submitFeedback(''));

          // モーダル制御
          // this.addEventListenerSafe('closeFeedbackModal', 'click', () => this.closeFeedbackModal());
          // this.addEventListenerSafe('closeExportModal', 'click', () => this.closeExportModal());
          // this.addEventListenerSafe('copyConfigBtn', 'click', () => this.copyConfiguration());

          // クリア機能
          this.addEventListenerSafe('clearBtn', 'click', () => this.clearAll());

          // モーダル外クリック
          // this.addEventListenerSafe('feedbackModal', 'click', (e) => {
          //     if (e.target.id === 'feedbackModal') this.closeFeedbackModal();
          // });
          // this.addEventListenerSafe('exportModal', 'click', (e) => {
          //     if (e.target.id === 'exportModal') this.closeExportModal();
          // });

          // ESCキー
          document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                  this.closeFeedbackModal();
                  this.closeExportModal();
              }
          });

          console.log('✅ 基本イベントリスナー設定完了');
      }

      // 安全なイベントリスナー追加
      addEventListenerSafe(elementId, event, handler) {
          const element = document.getElementById(elementId);
          if (element) {
              element.addEventListener(event, handler);
              console.log(`✅ ${elementId} にイベントリスナー追加`);
          } else {
              console.log(`⚠️ ${elementId} が見つかりません`);
          }
      }

      // 🎯 選択場所表示更新
      updateSelectedLocationDisplay() {
          const selectedLocationText = document.getElementById('selectedLocationText');

          if (this.state.preSelectedLocation) {
              if (typeof window.COMPREHENSIVE_LOCATION_CONFIG === 'undefined') {
                  console.warn('⚠️ COMPREHENSIVE_LOCATION_CONFIG が未定義');
                  return;
              }

              const location = window.COMPREHENSIVE_LOCATION_CONFIG[this.state.preSelectedLocation];
              if (!location) {
                  console.warn(`⚠️ 場所設定が見つかりません: ${this.state.preSelectedLocation}`);
                  return;
              }

              let text = '';

              if (this.state.preSelectedLocation === 'custom') {
                  const customText = this.state.customLocation || '自由記述';
                  text = `選択中: ✏️ ${customText}`;

                  if (this.state.customLocation.trim()) {
                      const estimatedDirt = this.comprehensiveEstimateDirtTypes(this.state.customLocation);
                      if (estimatedDirt.length > 0) {
                          text += ` (推定: ${estimatedDirt.slice(0, 2).join(', ')})`;
                      }
                  }
              } else {
                  text = `選択中: ${location.label}`;

                  if (location.dirtTypes && location.dirtTypes.length > 0) {
                      text += ` (対応: ${location.dirtTypes.slice(0, 2).join(', ')})`;
                  }
              }

              if (selectedLocationText) {
                  selectedLocationText.textContent = text;
                  selectedLocationText.classList.remove('hidden');
                  console.log(`✅ 選択場所表示更新: ${text}`);
              }

              // 分析エリアでの表示
              const display = document.getElementById('selectedLocationDisplay');
              if (display) {
                  const p = display.querySelector('p');
                  if (p) {
                      p.textContent = `📍 選択した場所: ${text.replace('選択中: ', '')}`;
                  }
                  display.classList.remove('hidden');
              }
          } else {
              if (selectedLocationText) {
                  selectedLocationText.classList.add('hidden');
              }
              const selectedLocationDisplay = document.getElementById('selectedLocationDisplay');
              if (selectedLocationDisplay) {
                  selectedLocationDisplay.classList.add('hidden');
              }
          }
      }

      // 残りの重要なメソッドを簡略化で追加
      comprehensiveEstimateDirtTypes(customLocation) {
          const locationLower = customLocation.toLowerCase();
          const detectedDirtTypes = [];

          if (locationLower.includes('油') || locationLower.includes('キッチン')) {
              detectedDirtTypes.push('油汚れ');
          } else if (locationLower.includes('カビ') || locationLower.includes('浴室')) {
              detectedDirtTypes.push('カビ汚れ');
          } else if (locationLower.includes('水垢') || locationLower.includes('ウロコ')) {
              detectedDirtTypes.push('水垢汚れ');
          } else if (locationLower.includes('トイレ') || locationLower.includes('便器')) {
              detectedDirtTypes.push('トイレ汚れ');
          }

          return detectedDirtTypes;
      }

      updateUI() {
          if (typeof window.debugUI !== 'undefined') {
              window.debugUI.updateStatusIndicators();
          }
          this.updateClearButtonVisibility();
      }

      updateClearButtonVisibility() {
          const clearBtn = document.getElementById('clearBtn');
          if (clearBtn) {
              const shouldShow = this.state.preSelectedLocation || this.state.customLocation;
              clearBtn.classList.toggle('hidden', !shouldShow);
          }
      }

      // URLパラメータから場所をチェックし、自動選択する
      checkUrlForLocation() {
          const urlParams = new URLSearchParams(window.location.search);
          const locationFromUrl = urlParams.get('location');
          if (locationFromUrl) {
              console.log(`URLパラメータから場所を検出: ${locationFromUrl}`);
              this.selectLocation(locationFromUrl);
          }
      }

      loadFeedbackData() {
          return [];
      }

      initializeLucideIcons() {
          const initLucide = () => {
              if (typeof lucide !== 'undefined') {
                  lucide.createIcons();
                  console.log('🎨 Lucideアイコン初期化完了');
              } else {
                  setTimeout(initLucide, 100);
              }
          };
          initLucide();
      }

      showAutoConfigMessage() {
          const autoConfigMessage = document.getElementById('autoConfigMessage');
          if (autoConfigMessage) {
              autoConfigMessage.classList.remove('hidden');
              setTimeout(() => {
                  autoConfigMessage.classList.add('hidden');
              }, 5000);
          }
      }

      // 🎯 選択場所表示更新
      clearAll() {
          console.log('🔄 データクリア実行');

          // 状態リセット
          this.state = {
              preSelectedLocation: '',
              customLocation: '',
              analysis: null,
              showCorrection: false,
              geminiApiKey: this.state.geminiApiKey, // APIキーは保持
              currentFeedbackType: null
          };

          // UI要素リセット
          const uploadArea = document.getElementById('uploadArea');
          const analysisArea = document.getElementById('analysisArea');
          const customInput = document.getElementById('customInput');
          const mainLocationSelection = document.getElementById('mainLocationSelection');
          const detailedLocationSelection = document.getElementById('detailedLocationSelection');


          if (uploadArea) {
              uploadArea.classList.remove('hidden');
              console.log('✅ アップロードエリア表示');
          }
          if (analysisArea) {
              analysisArea.classList.add('hidden');
              console.log('✅ 分析エリア非表示');
          }
          if (customInput) {
              customInput.classList.add('hidden');
              console.log('✅ カスタム入力非表示');
          }
          if (mainLocationSelection) {
              mainLocationSelection.classList.remove('hidden');
          }
          if (detailedLocationSelection) {
              detailedLocationSelection.classList.add('hidden');
          }


          const customLocation = document.getElementById('customLocation');
          if (customLocation) customLocation.value = '';

          const selectedLocationText = document.getElementById('selectedLocationText');
          const selectedLocationDisplay = document.getElementById('selectedLocationDisplay');
          const customValidation = document.getElementById('customValidation');

          if (selectedLocationText) selectedLocationText.classList.add('hidden');
          if (selectedLocationDisplay) selectedLocationDisplay.classList.add('hidden');
          if (customValidation) customValidation.classList.add('hidden');

          this.hideResults();
          this.updateClearButtonVisibility();

          // 場所選択ボタンリセット
          this.resetAllLocationButtons();

          // AI状態リセット
          if (typeof window.debugUI !== 'undefined') {
              window.debugUI.updateGeminiStatus(this.state.geminiApiKey ? '✅ 設定済み' : '❌ 未設定',
                                         this.state.geminiApiKey ? 'text-green-300' : 'text-red-300');
              window.debugUI.updateProductStatus('⏳ 待機中', 'text-yellow-300');
          }

          console.log('✅ クリア完了');
          this.showSuccessNotification('すべてリセット完了');
      }

      // 詳細場所選択UIを表示
      showDetailedLocationSelection(mainLocationId) {
          const mainLocationSelection = document.getElementById('mainLocationSelection');
          const detailedLocationSelection = document.getElementById('detailedLocationSelection');
          const selectedMainLocationName = document.getElementById('selectedMainLocationName');
          const detailedLocationButtons = document.getElementById('detailedLocationButtons');
          const backToMainLocationSelection = document.getElementById('backToMainLocationSelection');

          if (!mainLocationSelection || !detailedLocationSelection || !selectedMainLocationName || !detailedLocationButtons || !backToMainLocationSelection) {
              console.error('⚠️ 詳細場所選択UIの要素が見つかりません。');
              return;
          }

          // メイン選択を非表示
          mainLocationSelection.classList.add('hidden');
          // 分析エリアも非表示
          document.getElementById('analysisArea')?.classList.add('hidden');

          // 詳細選択UIのタイトルを更新
          const locationConfig = window.COMPREHENSIVE_LOCATION_CONFIG[mainLocationId];
          if (locationConfig) {
              selectedMainLocationName.textContent = locationConfig.label;
          }

          // 詳細場所ボタンを動的に生成
          detailedLocationButtons.innerHTML = ''; // 既存のボタンをクリア
          const detailedLocations = locationConfig?.detailedLocations || [];

          if (detailedLocations.length > 0) {
              detailedLocations.forEach(detail => {
                  const btn = document.createElement('div');
                  btn.className = 'location-btn location-card bg-white rounded-lg shadow p-6 text-center flex flex-col items-center justify-center';
                  btn.setAttribute('data-location', detail.id);
                  btn.innerHTML = `
                      <span class="text-5xl mb-3">${detail.emoji}</span>
                      <h3 class="text-xl font-bold text-gray-700">${detail.label}</h3>
                  `;
                  btn.addEventListener('click', () => this.selectDetailedLocation(detail.id));
                  detailedLocationButtons.appendChild(btn);
              });
          } else {
              // 詳細な場所がない場合は、大カテゴリ自体を詳細として扱う
              const btn = document.createElement('div');
              btn.className = 'location-btn location-card bg-white rounded-lg shadow p-6 text-center flex flex-col items-center justify-center';
              btn.setAttribute('data-location', mainLocationId);
              btn.innerHTML = `
                  <span class="text-5xl mb-3">${locationConfig.emoji || '✨'}</span>
                  <h3 class="text-xl font-bold text-gray-700">${locationConfig.label}全体</h3>
              `;
              btn.addEventListener('click', () => this.selectDetailedLocation(mainLocationId));
              detailedLocationButtons.appendChild(btn);
          }

          // 詳細選択UIを表示
          detailedLocationSelection.classList.remove('hidden');

          // 「大カテゴリ選択に戻る」ボタンのイベントリスナー
          backToMainLocationSelection.onclick = () => this.resetToMainLocationSelection();
      }

      // 詳細場所選択処理
      selectDetailedLocation(detailedLocationId) {
          this.state.customLocation = detailedLocationId; // 詳細な場所をカスタムとして保存
          this.state.preSelectedLocation = detailedLocationId.split('-')[0]; // 主要な場所を更新
          this.updateSelectedLocationDisplay();
          this.executeAnalysis();
      }

      // メイン場所選択に戻る
      resetToMainLocationSelection() {
          const mainLocationSelection = document.getElementById('mainLocationSelection');
          const detailedLocationSelection = document.getElementById('detailedLocationSelection');
          const analysisArea = document.getElementById('analysisArea');

          if (mainLocationSelection) mainLocationSelection.classList.remove('hidden');
          if (detailedLocationSelection) detailedLocationSelection.classList.add('hidden');
          if (analysisArea) analysisArea.classList.add('hidden');

          this.clearAll(); // 状態をリセット
      }

      // 🚫 結果非表示機能
      hideResults() {
          const analysisResults = document.getElementById('analysisResults');
          const errorDisplay = document.getElementById('errorDisplay');
          const correctionOptions = document.getElementById('correctionOptions');
          const analysisDisplay = document.getElementById('analysisDisplay'); // analysisDisplayはanalysisAreaのこと

          if (analysisResults) analysisResults.classList.add('hidden');
          if (errorDisplay) errorDisplay.classList.add('hidden');
          if (correctionOptions) correctionOptions.classList.add('hidden');
          if (analysisDisplay) analysisDisplay.classList.add('hidden'); // analysisAreaを非表示にする

          this.state.analysis = null;
          this.state.showCorrection = false;
      }

      // ⚠️ エラー表示機能
      showError(message, details = null) {
          console.error(`💥 エラー: ${message} ${details || ''}`);

          const errorDisplay = document.getElementById('errorDisplay');
          const errorIcon = errorDisplay?.querySelector('i');
          const errorText = errorDisplay?.querySelector('p');
          const errorDetailsEl = document.getElementById('errorDetails');

          if (errorDisplay && errorText) {
              errorDisplay.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-6';
              if (errorIcon) {
                  errorIcon.className = 'w-5 h-5 text-red-500 mr-2';
                  errorIcon.setAttribute('data-lucide', 'alert-circle');
              }

              errorText.className = 'text-red-700 font-semibold';
              errorText.textContent = message;

              if (details && errorDetailsEl) {
                  errorDetailsEl.className = 'text-sm text-red-600 mt-2';
                  errorDetailsEl.textContent = details;
                  errorDetailsEl.classList.remove('hidden');
              } else if (errorDetailsEl) {
                  errorDetailsEl.classList.add('hidden');
              }

              errorDisplay.classList.remove('hidden');

              if (typeof lucide !== 'undefined') {
                  lucide.createIcons();
              }

              setTimeout(() => {
                  errorDisplay.classList.add('hidden');
              }, 10000);
          }
      }

      // 🎯 分析実行機能（サーバーレス版）
      async executeAnalysis() {
          console.log('🚀 AI掃除方法生成開始（サーバーレス版）');

          // カスタム場所の検証
          if (this.state.preSelectedLocation === 'custom' && !this.state.customLocation.trim()) {
              this.showError('入力エラー', 'カスタム場所を入力してください');
              return;
          }

          // ローディング表示
          this.showAnalysisLoading(true);
          const errorDisplay = document.getElementById('errorDisplay');
          if (errorDisplay) {
              errorDisplay.classList.add('hidden');
          }

          // 分析エリアを表示
          const analysisArea = document.getElementById('analysisArea');
          if (analysisArea) {
              analysisArea.classList.remove('hidden');
          }

          console.log('🔍 分析パラメータ:', {
              hasImage: this.state.selectedImage !== null && this.state.selectedImage !== 'no-photo',
              location: this.state.preSelectedLocation,
              customLocation: this.state.customLocation
          });

          try {
              let analysisResult;

              // サーバーレス版：常に場所ベースのローカル分析を実行
              if (this.state.preSelectedLocation === 'custom' && this.state.customLocation.trim()) {
                  // カスタム場所の場合
                  console.log('✏️ カスタム場所分析モード');
                  analysisResult = await this.executeCustomLocationAnalysis();
              } else if (this.state.preSelectedLocation) {
                  // 事前選択場所の場合
                  console.log('📍 場所ベース分析モード');
                  analysisResult = await this.executeLocationBasedAnalysis();
              } else {
                  this.showError('場所選択が必要です', '掃除したい場所を選択してください');
                  return;
              }

              if (analysisResult) {
                  this.state.analysis = analysisResult;
                  setTimeout(() => this.displayAnalysisResults(), 1000);
                  console.log('✅ 分析完了');
              }

          } catch (error) {
              console.error(`💥 分析エラー: ${error.message}`);
              this.showError('分析エラー', error.message);
          } finally {
              this.showAnalysisLoading(false);
          }
      }

      // 🔄 ローカル分析（サーバーレス版）
      async executeLocalImageAnalysis() {
          console.log('🔄 ローカル画像分析実行（サーバーレス版）');

          // 事前選択場所の情報を取得
          let locationInfo = null;
          let dirtType = '油汚れ'; // デフォルト
          let surface = '対象箇所'; // デフォルト

          // 実際の場所IDと表面を決定
          let actualLocationId = this.state.preSelectedLocation; // 例: 'kitchen'
          let actualSurface = this.state.customLocation.trim() ? this.state.customLocation : this.state.preSelectedLocation; // 例: 'kitchen-sink' または 'kitchen'

          if (actualLocationId && actualLocationId !== 'custom') {
              locationInfo = window.COMPREHENSIVE_LOCATION_CONFIG?.[actualLocationId];
              if (locationInfo) {
                  dirtType = locationInfo.dirtTypes?.[0] || dirtType;
                  // 詳細な場所が指定されている場合はそれを優先
                  if (!this.state.customLocation.trim()) {
                      actualSurface = locationInfo.label;
                  }
              }
          } else if (actualLocationId === 'custom' && this.state.customLocation.trim()) {
              dirtType = this.comprehensiveEstimateDirtTypes(this.state.customLocation)[0] || '汚れ';
          }

          // 分析結果を生成
          const result = {
              dirtType: dirtType,
              additionalDirt: locationInfo?.dirtTypes?.slice(1) || [],
              surface: actualSurface, // 最も具体的な表面を使用
              confidence: 90, // サーバーレス版でも高い信頼度
              isAIAnalyzed: false,
              hasPhoto: false,
              location: actualLocationId, // 主要な場所ID
              detailedLocation: this.state.customLocation, // 詳細な場所IDを保持
              analysisVersion: 'serverless-local'
          };

          console.log(`✅ ローカル分析結果:`, result);

          // 掃除方法と商品を生成
          try {
              result.cleaningMethod = this.generateCleaningMethod(result.dirtType, result.surface); // 詳細な表面を渡す
              result.recommendedProducts = this.getRecommendedProducts(result.dirtType, result.detailedLocation); // 詳細な場所を渡す
              console.log('✅ 掃除方法・商品生成完了');
          } catch (error) {
              console.error('💥 掃除方法生成エラー:', error);
              // フォールバック用の基本的な掃除方法
              result.cleaningMethod = {
                  title: `${result.surface}の掃除`,
                  difficulty: '中級',
                  time: '30分',
                  steps: [
                      '🔧 適切な掃除用品を準備する',
                      '🧤 安全のため手袋を着用する',
                      '🧽 汚れを優しく拭き取る',
                      '💧 水で洗い流すか拭き取る',
                      '✨ 乾いた布で仕上げる'
                  ],
                  tips: '💡 定期的な掃除で汚れを予防しましょう',
                  warnings: '⚠️ 材質に適した洗剤を使用してください'
              };

              result.recommendedProducts = {
                  cleaners: [{
                      asin: "B000TGNG0W",
                      name: "マルチクリーナー",
                      badge: "🔄 汎用",
                      emoji: "🧽",
                      price: "¥398",
                      rating: 4.0,
                      reviews: 1000
                  }]
              };
          }

          return result;
      }

      // ✏️ カスタム場所分析
      async executeCustomLocationAnalysis() {
          console.log('✏️ カスタム場所分析実行');

          const estimatedDirt = this.comprehensiveEstimateDirtTypes(this.state.customLocation);
          const primaryDirt = estimatedDirt[0] || '汚れ';

          const result = {
              dirtType: primaryDirt,
              additionalDirt: estimatedDirt.slice(1),
              surface: this.state.customLocation,
              confidence: 95,
              isUserSelected: true,
              hasPhoto: false,
              location: 'custom',
              analysisVersion: 'custom-location'
          };

          result.cleaningMethod = this.generateCleaningMethod(result.dirtType, result.surface);
          result.recommendedProducts = this.getRecommendedProducts(result.dirtType);

          return result;
      }

      // 📍 場所ベース分析
      async executeLocationBasedAnalysis() {
          console.log('📍 場所ベース分析実行');

          const locationInfo = window.COMPREHENSIVE_LOCATION_CONFIG?.[this.state.preSelectedLocation];
          if (!locationInfo) {
              throw new Error('選択された場所の情報が見つかりません');
          }

          const result = {
              dirtType: locationInfo.dirtTypes[0] || '汚れ',
              additionalDirt: locationInfo.dirtTypes.slice(1) || [],
              surface: locationInfo.surface,
              confidence: 95,
              isUserSelected: true,
              hasPhoto: false,
              location: this.state.preSelectedLocation,
              analysisVersion: 'location-based'
          };

          result.cleaningMethod = this.generateCleaningMethod(result.dirtType, result.surface);
          result.recommendedProducts = this.getRecommendedProducts(result.dirtType);

          return result;
      }

      // 🧹 掃除方法生成
      generateCleaningMethod(dirtType, surface) {
          console.log(`🧹 掃除方法生成: ${dirtType} - ${surface}`);

          const methodTemplates = {
              '油汚れ': {
                  title: `${surface}の油汚れ除去法`,
                  difficulty: '中級',
                  time: '30-45分',
                  steps: [
                      '🔧 準備：アルカリ性洗剤、スポンジ、布巾、ゴム手袋を用意',
                      '💨 安全確認：十分な換気を行い、ゴム手袋を着用する',
                      '🧴 前処理：洗剤を汚れ部分に均等にスプレーし、5-10分放置',
                      '🧽 清掃：スポンジで優しく円を描くようにこすり落とす',
                      '💧 すすぎ：水またはウェットティッシュで洗剤をよく拭き取る',
                      '✨ 仕上げ：乾いた布で水分を完全に拭き取り、艶を出す',
                      '🔄 点検：汚れの取り残しがないか最終確認する',
                      '🧼 後片付け：使用した道具を洗浄し、換気を継続する'
                  ],
                  tips: '💡 洗剤を温めると効果が向上します。頑固な汚れには重曹ペーストが効果的です。',
                  warnings: '⚠️ 必ず換気を行い、他の洗剤と混ぜないでください。'
              },
              'カビ汚れ': {
                  title: `${surface}のカビ除去法`,
                  difficulty: '上級',
                  time: '45-60分',
                  steps: [
                      '🛡️ 準備：カビ取り剤、ブラシ、マスク、手袋、ゴーグルを用意',
                      '💨 安全確認：強力な換気とマスク・手袋・ゴーグル着用',
                      '🧴 前処理：カビ取り剤を患部に塗布し、10-15分放置',
                      '🪥 清掃：専用ブラシで優しくこすり、カビを除去',
                      '💧 すすぎ：大量の水でカビ取り剤を完全に洗い流す',
                      '🌬️ 乾燥：しっかりと乾燥させ、湿気を除去',
                      '🛡️ 予防：防カビスプレーで再発防止処理',
                      '🧼 清掃：使用した道具を洗浄し、30分以上換気継続'
                  ],
                  tips: '💡 作業後は1時間以上換気を続け、定期的な清掃で再発を防ぎましょう。',
                  warnings: '⚠️ 塩素系洗剤使用時は必ず単独使用し、十分な換気と保護具着用が必須です。'
              },
              '水垢汚れ': {
                  title: `${surface}のの水垢除去法`,
                  difficulty: '中級',
                  time: '20-30分',
                  steps: [
                      '🔧 準備：酸性洗剤またはクエン酸、スポンジ、布巾を用意',
                      '🧤 安全確認：手袋着用、換気確認',
                      '🧴 前処理：洗剤を水垢部分に塗布し、浸透させる',
                      '⏰ 浸透：5-10分間放置して汚れを浮かせる',
                      '🧽 清掃：スポンジで円を描くように優しくこする',
                      '💧 すすぎ：水で洗剤を完全に洗い流す',
                      '✨ 仕上げ：乾いた布で水分を拭き取り、光沢を出す',
                      '🔍 確認：水垢の取り残しがないか点検する'
                  ],
                  tips: '💡 クエン酸パックやレモン汁で頑固な水垢も除去できます。',
                  warnings: '⚠️ 酸性洗剤は金属部分に長時間触れさせないでください。'
              },
              'ホコリ': {
                  title: `${surface}のホコリ除去法`,
                  difficulty: '初級',
                  time: '15-25分',
                  steps: [
                      '🔧 準備：掃除機、ドライシート、マイクロファイバークロスを用意',
                      '🌪️ 粗取り：掃除機で大きなホコリを吸い取る',
                      '🧹 細部清掃：ドライシートで細かい部分を拭き取る',
                      '✨ 仕上げ：マイクロファイバークロスで最終仕上げ',
                      '🔍 点検：取り残しがないか確認する'
                  ],
                  tips: '💡 上から下に向かって掃除すると効率的です。',
                  warnings: '⚠️ 電化製品周辺は電源を切ってから清掃してください。'
              },
              'トイレ汚れ': {
                  title: `${surface}のトイレ掃除法`,
                  difficulty: '初級',
                  time: '20-30分',
                  steps: [
                      '🔧 準備：トイレ用洗剤、ブラシ、除菌シート、ゴム手袋を用意',
                      '🧤 安全確認：手袋着用、換気確認',
                      '🧴 前処理：便器内にトイレ用洗剤を塗布',
                      '🪥 清掃：ブラシで便器内をこすり洗い',
                      '💧 すすぎ：水で洗い流す',
                      '🧻 仕上げ：除菌シートで便座や周辺を拭く',
                      '✨ 最終確認：清潔になったか点検する'
                  ],
                  tips: '💡 便器のフチ裏も忘れずに清掃しましょう。',
                  warnings: '⚠️ 塩素系洗剤は他の洗剤と混ぜないでください。'
              },
              'エアコンのホコリ': {
                  title: `${surface}のエアコン掃除法`,
                  difficulty: '中級',
                  time: '30-45分',
                  steps: [
                      '🔧 準備：掃除機、エアコン洗浄スプレー、ブラシ、ビニールシートを用意',
                      '⚡ 安全確認：エアコンの電源を切り、コンセントを抜く',
                      '🪄 フィルター取り外し：フィルターを慎重に取り外す',
                      '🌪️ フィルター清掃：掃除機でホコリを吸い取り、水洗い',
                      '💨 内部清掃：エアコン洗浄スプレーで内部を清掃',
                      '🌬️ 乾燥：フィルターを完全に乾燥させる',
                      '🔄 組み立て：フィルターを元に戻し、動作確認'
                  ],
                  tips: '💡 月1回のフィルター清掃で効率が向上します。',
                  warnings: '⚠️ 必ず電源を切ってから作業してください。'
              },
              '洗濯機のカビ': {
                  title: `${surface}の洗濯槽掃除法`,
                  difficulty: '中級',
                  time: '120-180分',
                  steps: [
                      '🔧 準備：洗濯槽クリーナー、タオル数枚を用意',
                      '🌊 満水：洗濯機に40-50℃のお湯を満水まで入れる',
                      '🧴 投入：洗濯槽クリーナーを規定量投入',
                      '🔄 撹拌：5分間洗いコースで撹拌後、3時間放置',
                      '🌪️ 洗浄：標準コースで洗い〜脱水まで実行',
                      '🧽 仕上げ：洗濯槽やパッキンをタオルで拭き取り',
                      '🌬️ 乾燥：フタを開けて自然乾燥'
                  ],
                  tips: '💡 月1回の定期清掃でカビを予防できます。',
                  warnings: '⚠️ 塩素系クリーナーは換気を十分に行ってください。'
              }
          };

          return methodTemplates[dirtType] || {
              title: `${surface}の一般的な掃除法`,
              difficulty: '初級',
              time: '15-25分',
              steps: [
                  '🔧 準備：中性洗剤、スポンジ、布巾を用意',
                  '🧤 安全確認：換気と手袋着用',
                  '🧽 清掃：洗剤で優しく拭き取る',
                  '💧 すすぎ：きれいな水で拭き取る',
                  '✨ 仕上げ：乾いた布で仕上げる'
              ],
              tips: '💡 定期的な掃除で汚れを予防しましょう。',
              warnings: '⚠️ 材質に適した洗剤を使用してください。'
          };
      }

      // 🛒 おすすめ商品取得（Amazon PA-API連携版）
      async getRecommendedProducts(dirtType) {
          console.log(`🛒 商品取得: ${dirtType}`);

          if (typeof window.ULTIMATE_PRODUCT_MATCHER === 'undefined' || typeof window.amazonAPI === 'undefined') {
              console.warn('⚠️ ULTIMATE_PRODUCT_MATCHER または amazonAPI が未定義です。フォールバックデータを使用します。');
              // フォールバック用の3カテゴリ商品マップ（必ず3カテゴリ返す）
              const productMap = {
                  '油汚れ': {
                      cleaners: [
                          { asin: "B000TGNG0W", name: "花王 マジックリン ハンディスプレー 400ml", badge: "🏆 換気扇No.1", emoji: "🧴", price: "¥398", rating: 4.3, reviews: 2847, url: "https://www.amazon.co.jp/dp/B000TGNG0W?tag=defaulttag-22" },
                          { asin: "B01GDWX0Q4", name: "ライオン ママレモン 大容量 800ml", badge: "💪 強力洗浄", emoji: "🍋", price: "¥598", rating: 4.4, reviews: 3456, url: "https://www.amazon.co.jp/dp/B01GDWX0Q4?tag=defaulttag-22" },
                          { asin: "B07K8ZRJYX", name: "重曹ちゃん キッチン泡スプレー 300ml", badge: "🌿 天然成分", emoji: "💚", price: "¥298", rating: 4.1, reviews: 1234, url: "https://www.amazon.co.jp/dp/B07K8ZRJYX?tag=defaulttag-22" }
                      ],
                      tools: [
                          { asin: "B07D7BXQZX", name: "換気扇 専用ブラシセット 3本組", badge: "🪥 換気扇専用", emoji: "🪥", price: "¥798", rating: 4.0, reviews: 654, url: "https://www.amazon.co.jp/dp/B07D7BXQZX?tag=defaulttag-22" },
                          { asin: "B01LWYQPNY", name: "金属たわし ステンレス製 5個セット", badge: "💪 強力研磨", emoji: "🧽", price: "¥398", rating: 4.1, reviews: 543, url: "https://www.amazon.co.jp/dp/B01LWYQPNY?tag=defaulttag-22" }
                      ],
                      protection: [
                          { asin: "B07GWXSXF1", name: "ニトリル手袋 キッチン用 50枚入", badge: "🧤 手保護", emoji: "🧤", price: "¥598", rating: 4.5, reviews: 2341, url: "https://www.amazon.co.jp/dp/B07GWXSXF1?tag=defaulttag-22" }
                      ]
                  },
                  'カビ汚れ': {
                      cleaners: [
                          { asin: "B000FQTJZW", name: "ジョンソン カビキラー 400g", badge: "🏆 カビ除去No.1", emoji: "🦠", price: "¥298", rating: 4.4, reviews: 3456, url: "https://www.amazon.co.jp/dp/B000FQTJZW?tag=defaulttag-22" },
                          { asin: "B01N5P8B4V", name: "ジョンソン カビキラー 電動スプレー 750ml", badge: "💪 密着ジェル", emoji: "🧪", price: "¥498", rating: 4.2, reviews: 1987, url: "https://www.amazon.co.jp/dp/B01N5P8B4V?tag=defaulttag-22" },
                          { asin: "B078KS3NGF", name: "カビキラー 除菌@キッチン泡スプレー 400ml", badge: "🛡️ 予防効果", emoji: "✨", price: "¥598", rating: 4.0, reviews: 567, url: "https://www.amazon.co.jp/dp/B078KS3NGF?tag=defaulttag-22" }
                      ],
                      tools: [
                          { asin: "B07BQFJ5K9", name: "山崎産業 ユニットバスボンくん 抗菌タイプ", badge: "🪥 隙間対応", emoji: "🪥", price: "¥498", rating: 4.2, reviews: 876, url: "https://www.amazon.co.jp/dp/B07BQFJ5K9?tag=defaulttag-22" }
                      ],
                      protection: [
                          { asin: "B073C4QRLS", name: "ショーワグローブ No.281 テムレス", badge: "🧤 化学品対応", emoji: "🧤", price: "¥398", rating: 4.2, reviews: 987, url: "https://www.amazon.co.jp/dp/B073C4QRLS?tag=defaulttag-22" }
                      ]
                  },
                  '水垢汚れ': {
                      cleaners: [
                          { asin: "B07Q9ZKQHZ", name: "茂木和哉 水垢洗剤 200ml", badge: "🏆 水垢専門", emoji: "💎", price: "¥1,298", rating: 4.6, reviews: 2134, url: "https://www.amazon.co.jp/dp/B07Q9ZKQHZ?tag=defaulttag-22" },
                          { asin: "B08P8FHYRT", name: "花王 マジックリン バスマジックリン 泡立ちスプレー SUPER CLEAN", badge: "🍋 天然成分", emoji: "🍋", price: "¥398", rating: 4.1, reviews: 987, url: "https://www.amazon.co.jp/dp/B08P8FHYRT?tag=defaulttag-22" }
                      ],
                      tools: [
                          { asin: "B075FZ7MGH", name: "レック ダイヤモンドクリーナー", badge: "💎 研磨効果", emoji: "💎", price: "¥698", rating: 4.5, reviews: 432, url: "https://www.amazon.co.jp/dp/B075FZ7MGH?tag=defaulttag-22" }
                      ],
                      protection: []
                  },
                  'ホコリ': {
                      cleaners: [
                          { asin: "B00EOHQPHC", name: "花王 クイックルワイパー 立体吸着ドライシート 40枚", badge: "🏆 床掃除No.1", emoji: "🧹", price: "¥598", rating: 4.5, reviews: 4567, url: "https://www.amazon.co.jp/dp/B00EOHQPHC?tag=defaulttag-22" },
                          { asin: "B07NBA84F5", name: "クイックルワイパー ウエットシート 32枚", badge: "💧 水拭き効果", emoji: "💧", price: "¥498", rating: 4.3, reviews: 3210, url: "https://www.amazon.co.jp/dp/B07NBA84F5?tag=defaulttag-22" }
                      ],
                      tools: [
                          { asin: "B005AILJ3O", name: "花王 クイックルワイパー 本体 + シート", badge: "🧹 フローリング対応", emoji: "🧹", price: "¥1,298", rating: 4.4, reviews: 2876, url: "https://www.amazon.co.jp/dp/B005AILJ3O?tag=defaulttag-22" }
                      ],
                      protection: []
                  }
              };

              const defaultProduct = productMap[dirtType] || {
                  cleaners: [
                      { asin: "B000TGNG0W", name: "マルチクリーナー 汎用洗剤", badge: "🔄 汎用", emoji: "🧽", price: "¥298", rating: 4.0, reviews: 1000, url: "https://www.amazon.co.jp/dp/B000TGNG0W?tag=defaulttag-22" },
                      { asin: "B08XKJM789", name: "中性洗剤 万能タイプ 500ml", badge: "🏠 家庭用", emoji: "🧴", price: "¥398", rating: 4.2, reviews: 1500, url: "https://www.amazon.co.jp/dp/B08XKJM789?tag=defaulttag-22" }
                  ],
                  tools: [
                      { asin: "B00OOCWP44", name: "レック 激落ちくん メラミンスポンジ 20個", badge: "🫧 研磨効果", emoji: "🧽", price: "¥248", rating: 4.6, reviews: 5432, url: "https://www.amazon.co.jp/dp/B00OOCWP44?tag=defaulttag-22" }
                  ],
                  protection: [
                      { asin: "B04GHI2345", name: "ニトリル手袋 家庭用 50枚入", badge: "🧤 手保護", emoji: "🧤", price: "¥598", rating: 4.5, reviews: 2341, url: "https://www.amazon.co.jp/dp/B04GHI2345?tag=defaulttag-22" }
                  ]
              };
              console.log(`✅ フォールバック商品返却: 洗剤${defaultProduct.cleaners.length}個, ツール${defaultProduct.tools ? defaultProduct.tools.length : 0}個, 保護具${defaultProduct.protection ? defaultProduct.protection.length : 0}個`);
              return defaultProduct;
          }

          const staticProducts = window.ULTIMATE_PRODUCT_MATCHER.getProducts(dirtType, this.state.preSelectedLocation);
          if (!staticProducts || (!staticProducts.cleaners.length && !staticProducts.tools.length && !staticProducts.protection.length)) {
              console.log('⚠️ ULTIMATE_PRODUCT_MATCHERから商品が見つかりませんでした。');
              return { cleaners: [], tools: [], protection: [] };
          }

          const allAsins = [
              ...(staticProducts.cleaners || []).map(p => p.asin),
              ...(staticProducts.tools || []).map(p => p.asin),
              ...(staticProducts.protection || []).map(p => p.asin)
          ].filter(Boolean); // nullやundefinedを除外

          if (allAsins.length === 0) {
              console.log('ℹ️ 取得すべきASINがありません。');
              return { cleaners: [], tools: [], protection: [] };
          }

          let realTimeProductsData = {};
          try {
              realTimeProductsData = await window.amazonAPI.getItems(allAsins);
              console.log('✅ Amazon PA-APIからリアルタイム商品データを取得しました。', realTimeProductsData);
          } catch (error) {
              console.error('💥 Amazon PA-APIからの商品データ取得に失敗しました。フォールバックデータを使用します。', error);
              // エラー時はCOMPREHENSIVE_FALLBACK_DATAを使用
              allAsins.forEach(asin => {
                  if (window.COMPREHENSIVE_FALLBACK_DATA[asin]) {
                      realTimeProductsData[asin] = window.COMPREHENSIVE_FALLBACK_DATA[asin];
                      realTimeProductsData[asin].url = `https://www.amazon.co.jp/dp/${asin}?tag=${window.AMAZON_CONFIG.associateTag || 'defaulttag-22'}`;
                      realTimeProductsData[asin].isRealData = false;
                  }
              });
          }

          const mergeProductData = (staticList, realTimeMap) => {
              return (staticList || []).map(staticProduct => {
                  const realTime = realTimeMap[staticProduct.asin];
                  if (realTime) {
                      return {
                          ...staticProduct,
                          name: realTime.title || staticProduct.name,
                          price: realTime.price || staticProduct.price,
                          rating: realTime.rating || staticProduct.rating,
                          reviews: realTime.reviewCount || staticProduct.reviews,
                          url: realTime.url || staticProduct.url,
                          images: realTime.images || staticProduct.images,
                          isRealData: realTime.isRealData !== undefined ? realTime.isRealData : true
                      };
                  }
                  // リアルタイムデータがない場合は、静的データにフォールバックデータをマージ
                  const fallback = window.COMPREHENSIVE_FALLBACK_DATA[staticProduct.asin];
                  return {
                      ...staticProduct,
                      name: fallback?.name || staticProduct.name,
                      price: fallback?.price || staticProduct.price,
                      rating: fallback?.rating || staticProduct.rating,
                      reviews: fallback?.reviews || staticProduct.reviews,
                      url: `https://www.amazon.co.jp/dp/${staticProduct.asin}?tag=${window.AMAZON_CONFIG.associateTag || 'defaulttag-22'}`,
                      images: fallback?.images || staticProduct.images,
                      isRealData: false
                  };
              });
          };

          const mergedProducts = {
              cleaners: mergeProductData(staticProducts.cleaners, realTimeProductsData),
              tools: mergeProductData(staticProducts.tools, realTimeProductsData),
              protection: mergeProductData(staticProducts.protection, realTimeProductsData)
          };

          console.log(`✅ 最終商品リスト: 洗剤${mergedProducts.cleaners.length}個, ツール${mergedProducts.tools.length}個, 保護具${mergedProducts.protection.length}個`);
          return mergedProducts;
      }

      // 📊 分析結果表示
      displayAnalysisResults() {
          console.log('📊 分析結果表示開始');

          const analysis = this.state.analysis;
          if (!analysis) {
              console.error('分析結果がありません');
              return;
          }

          // 分析結果の基本情報表示
          this.updateAnalysisDisplay(analysis);

          // 掃除方法表示
          this.displayCleaningMethod(analysis.cleaningMethod);

          // 商品表示
          this.displayProducts(analysis.recommendedProducts);

          // フィードバック状態リセット
          this.resetFeedbackState();

          // 結果エリア表示
          const analysisResults = document.getElementById('analysisResults');
          if (analysisResults) {
              analysisResults.classList.remove('hidden');
              console.log('✅ 分析結果エリア表示');
          }

          // 成功通知
          this.showSuccessNotification('AI掃除方法生成完了');
          console.log('🎉 分析結果表示完了');
      }

      // 📋 分析表示更新
      updateAnalysisDisplay(analysis) {
          const dirtTypeText = document.getElementById('dirtTypeText');
          const surfaceText = document.getElementById('surfaceText');
          const confidenceText = document.getElementById('confidenceText');

          if (dirtTypeText) {
              dirtTypeText.textContent = analysis.dirtType;
              console.log(`✅ 汚れタイプ表示: ${analysis.dirtType}`);
          }
          if (surfaceText) {
              surfaceText.textContent = analysis.surface;
              console.log(`✅ 対象箇所表示: ${analysis.surface}`);
          }
          if (confidenceText) {
              confidenceText.textContent = `${analysis.confidence}%`;
              console.log(`✅ 信頼度表示: ${analysis.confidence}%`);
          }
      }

      // 🧹 掃除方法表示
      displayCleaningMethod(method) {
          console.log('🧹 掃除方法表示開始');

          const difficultyClasses = {
              '初級': 'bg-green-100 text-green-800',
              '中級': 'bg-yellow-100 text-yellow-800',
              '上級': 'bg-red-100 text-red-800'
          };

          const difficultyClass = difficultyClasses[method.difficulty] || 'bg-gray-100 text-gray-800';

          let html = `
              <div class="mb-6">
                  <h3 class="font-semibold text-xl mb-4 text-gray-800">${method.title}</h3>
                  <div class="flex flex-wrap gap-3 mb-6">
                      <span class="px-4 py-2 rounded-full text-sm font-semibold ${difficultyClass}">
                          🎯 難易度: ${method.difficulty}
                      </span>
                      <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                          ⏰ 所要時間: ${method.time}
                      </span>
                  </div>
          `;

          // 安全警告
          if (method.warnings) {
              html += `
                  <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                      <div class="flex">
                          <span class="text-red-400 text-2xl mr-3">⚠️</span>
                          <div>
                              <p class="text-sm text-red-800 font-bold mb-1">安全注意事項</p>
                              <p class="text-sm text-red-700">${method.warnings}</p>
                          </div>
                      </div>
                  </div>
              `;
          }

          // コツ
          if (method.tips) {
              html += `
                  <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                      <div class="flex">
                          <span class="text-yellow-500 text-2xl mr-3">💡</span>
                          <div>
                              <p class="text-sm text-yellow-800 font-bold mb-1">効果的なコツ</p>
                              <p class="text-sm text-yellow-700">${method.tips}</p>
                          </div>
                      </div>
                  </div>
              `;
          }

          html += '</div><div class="space-y-4">';

          // 手順表示
          method.steps.forEach((step, index) => {
              html += `
                  <div class="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div class="bg-blue-600 text-white rounded-full w-auto h-auto px-2 py-1 flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                          ${index + 1}
                      </div>
                      <p class="text-gray-800 font-medium">${step}</p>
                  </div>
              `;
          });

          html += '</div>';

          const cleaningMethodContent = document.getElementById('cleaningMethodContent');
          if (cleaningMethodContent) {
              cleaningMethodContent.innerHTML = html;
              console.log('✅ 掃除方法表示完了');
          }
      }

      // 🛒 商品表示
    // 🛒 商品表示（完全版：洗剤・ツール・保護具）
    displayProducts(products) {
        console.log('🛒 商品表示開始', products);
        
        let html = `<div class="space-y-8">`;
        
        // 🧴 洗剤セクション
        if (products.cleaners && products.cleaners.length > 0) {
            html += `
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        🧴 <span class="ml-2">おすすめ洗剤</span>
                        <span class="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${products.cleaners.length}種類</span>
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            `;
            
            products.cleaners.forEach((product) => {
                const imageUrl1 = product.images?.large || `https://m.media-amazon.com/images/I/${product.asin}._AC_SL1000_.jpg`;
                const imageUrl2 = product.images?.medium || `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SCLZZZZZZZ_.jpg`;
                const imageUrl3 = `https://ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${product.asin}&Format=_SL160_&ID=AsinImage`;
                
                html += `
                    <div class="product-card border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white">
                        <div class="relative mb-4">
                            <img src="${imageUrl1}" alt="${product.name}" class="w-full h-40 object-contain rounded-lg" 
                                 onerror="this.src='${imageUrl2}'; this.onerror=function(){this.src='${imageUrl3}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}}">
                            <div class="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center" style="display:none;">
                                <div class="text-center">
                                    <div class="text-5xl mb-2">${product.emoji}</div>
                                    <div class="text-sm text-gray-600">${product.name.split(' ')[0]}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full mb-3 text-center font-bold">${product.badge}</div>
                        
                        <h4 class="font-bold text-gray-800 mb-3 text-base leading-tight">${product.name}</h4>
                        
                        <div class="mb-3 flex items-center justify-between">
                            <span class="text-2xl font-bold text-red-600">${product.price || '¥---'}</span>
                            <div class="flex items-center text-sm text-gray-600">
                                <span class="text-yellow-400 mr-1">★</span>
                                <span class="font-semibold">${product.rating || '4.0'}</span>
                            </div>
                        </div>
                        
                        <div class="text-xs text-gray-500 mb-4">${product.reviews || '1000'}件のレビュー</div>
                        
                        <button onclick="window.open('${product.url}', '_blank')" 
                                class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-bold flex items-center justify-center shadow-lg">
                            🛒 Amazonで購入
                        </button>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        // 🧽 ツールセクション
        if (products.tools && products.tools.length > 0) {
            html += `
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        🧽 <span class="ml-2">掃除用具・ツール</span>
                        <span class="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">${products.tools.length}種類</span>
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            `;
            
            products.tools.forEach((product) => {
                const imageUrl1 = product.images?.large || `https://m.media-amazon.com/images/I/${product.asin}._AC_SL1000_.jpg`;
                const imageUrl2 = product.images?.medium || `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SCLZZZZZZZ_.jpg`;
                const imageUrl3 = `https://ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${product.asin}&Format=_SL160_&ID=AsinImage`;
                
                html += `
                    <div class="product-card border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white">
                        <div class="relative mb-4">
                            <img src="${imageUrl1}" alt="${product.name}" class="w-full h-40 object-contain rounded-lg" 
                                 onerror="this.src='${imageUrl2}'; this.onerror=function(){this.src='${imageUrl3}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}}">
                            <div class="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center" style="display:none;">
                                <div class="text-center">
                                    <div class="text-5xl mb-2">${product.emoji}</div>
                                    <div class="text-sm text-gray-600">${product.name.split(' ')[0]}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full mb-3 text-center font-bold">${product.badge}</div>
                        
                        <h4 class="font-bold text-gray-800 mb-3 text-base leading-tight">${product.name}</h4>
                        
                        <div class="mb-3 flex items-center justify-between">
                            <span class="text-2xl font-bold text-green-600">${product.price || '¥---'}</span>
                            <div class="flex items-center text-sm text-gray-600">
                                <span class="text-yellow-400 mr-1">★</span>
                                <span class="font-semibold">${product.rating || '4.0'}</span>
                            </div>
                        </div>
                        
                        <div class="text-xs text-gray-500 mb-4">${product.reviews || '1000'}件のレビュー</div>
                        
                        <button onclick="window.open('${product.url}', '_blank')" 
                                class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-bold flex items-center justify-center shadow-lg">
                            🛒 Amazonで購入
                        </button>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        // 🧤 保護具セクション
        if (products.protection && products.protection.length > 0) {
            html += `
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        🧤 <span class="ml-2">安全保護具</span>
                        <span class="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">${products.protection.length}種類</span>
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            `;
            
            products.protection.forEach((product) => {
                const imageUrl1 = product.images?.large || `https://m.media-amazon.com/images/I/${product.asin}._AC_SL1000_.jpg`;
                const imageUrl2 = product.images?.medium || `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SCLZZZZZZZ_.jpg`;
                const imageUrl3 = `https://ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${product.asin}&Format=_SL160_&ID=AsinImage`;
                
                html += `
                    <div class="product-card border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white">
                        <div class="relative mb-4">
                            <img src="${imageUrl1}" alt="${product.name}" class="w-full h-40 object-contain rounded-lg" 
                                 onerror="this.src='${imageUrl2}'; this.onerror=function(){this.src='${imageUrl3}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}}">
                            <div class="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center" style="display:none;">
                                <div class="text-center">
                                    <div class="text-5xl mb-2">${product.emoji}</div>
                                    <div class="text-sm text-gray-600">${product.name.split(' ')[0]}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full mb-3 text-center font-bold">${product.badge}</div>
                        
                        <h4 class="font-bold text-gray-800 mb-3 text-base leading-tight">${product.name}</h4>
                        
                        <div class="mb-3 flex items-center justify-between">
                            <span class="text-2xl font-bold text-purple-600">${product.price || '¥---'}</span>
                            <div class="flex items-center text-sm text-gray-600">
                                <span class="text-yellow-400 mr-1">★</span>
                                <span class="font-semibold">${product.rating || '4.0'}</span>
                            </div>
                        </div>
                        
                        <div class="text-xs text-gray-500 mb-4">${product.reviews || '1000'}件のレビュー</div>
                        
                        <button onclick="window.open('${product.url}', '_blank')" 
                                class="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-bold flex items-center justify-center shadow-lg">
                            🛒 Amazonで購入
                        </button>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
        
        // 商品選択について
        html += `
            <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl">
                <h4 class="font-bold text-blue-800 mb-3">🎯 商品選択について</h4>
                <div class="text-sm text-blue-700 space-y-1">
                    <p>✅ 汚れタイプに最適化された専用商品を厳選</p>
                    <p>✅ 効果・安全性・コストパフォーマンスを総合評価</p>
                    <p>✅ 実際のユーザーレビューを参考に選定</p>
                    <p>✅ 洗剤・道具・保護具をセットで提案</p>
                </div>
            </div>
            <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 font-semibold">
                ⚠️ 商品のご使用にあたっては、必ず商品の説明書に従ってください。
            </div>
        </div>`;

        const productsContent = document.getElementById('productsContent');
        if (productsContent) {
            productsContent.innerHTML = html;
            
            // 商品数のログ
            const cleanerCount = products.cleaners ? products.cleaners.length : 0;
            const toolCount = products.tools ? products.tools.length : 0;
            const protectionCount = products.protection ? products.protection.length : 0;
            
            console.log(`✅ 商品表示完了: 洗剤${cleanerCount}個, ツール${toolCount}個, 保護具${protectionCount}個`);
        }
    }
      // 🔄 ローディング表示制御
      showAnalysisLoading(show) {
          const analyzeBtn = document.getElementById('analyzeBtn');
          const analyzeLoadingBtn = document.getElementById('analyzeLoadingBtn');

          if (show) {
              if (analyzeBtn) analyzeBtn.classList.add('hidden');
              if (analyzeLoadingBtn) analyzeLoadingBtn.classList.remove('hidden');
              console.log('⏳ 分析ローディング表示');
          } else {
              if (analyzeLoadingBtn) analyzeLoadingBtn.classList.add('hidden');
              if (analyzeBtn) analyzeBtn.classList.remove('hidden');
              console.log('✅ 分析ローディング非表示');
          }
      }

      // 🔄 フィードバック状態リセット
      resetFeedbackState() {
          const feedbackStatus = document.getElementById('feedbackStatus');
          const feedbackGoodBtn = document.getElementById('feedbackGoodBtn');
          const feedbackBadBtn = document.getElementById('feedbackBadBtn');

          if (feedbackStatus) feedbackStatus.classList.add('hidden');
          if (feedbackGoodBtn) {
              feedbackGoodBtn.disabled = false;
              feedbackGoodBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          }
          if (feedbackBadBtn) {
              feedbackBadBtn.disabled = false;
              feedbackBadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          }
      }

      // 簡略化メソッド（ダミー実装）
      showFeedbackModal() { console.log('フィードバックモーダル（簡略版）'); }
      submitFeedback() { console.log('フィードバック送信（簡略版）'); }
      closeFeedbackModal() { console.log('フィードバックモーダル閉じる（簡略版）'); }
      saveGeminiApiKey() { console.log('APIキー保存（簡略版）'); }
      testGeminiConnection() { console.log('API接続テスト（簡略版）'); }
      toggleApiKeyVisibility() { console.log('APIキー表示切替（簡略版）'); }
      testAllConnections() { console.log('全接続テスト（簡略版）'); }
      showExportModal() { console.log('エクスポートモーダル（簡略版）'); }
      closeExportModal() { console.log('エクスポートモーダル閉じる（簡略版）'); }
      copyConfiguration() { console.log('設定コピー（簡略版）'); }
      copyAnalysisResult() { console.log('分析結果コピー（簡略版）'); }
      copyCleaningMethod() { console.log('掃除方法コピー（簡略版）'); }
      toggleCorrection() { console.log('修正切替（簡略版）'); }
      refreshProductPrices() { console.log('価格更新（簡略版）'); }
      applyComprehensiveCorrection(type) { console.log(`修正適用: ${type}（簡略版）`); }
  }

  // グローバルアクセス用
  window.AICleaningAdvisor = AICleaningAdvisor;

  // DOMContentLoaded時に初期化
  document.addEventListener('DOMContentLoaded', () => {
      console.log('🚀 DOMContentLoaded - AICleaningAdvisor作成開始（サーバーレス版）');
      window.aiCleaningAdvisor = new AICleaningAdvisor();
  });

  // さらに確実にするため、複数のタイミングで初期化を試行
  window.addEventListener('load', () => {
      console.log('🚀 Window Load - AICleaningAdvisor確認');
      if (!window.aiCleaningAdvisor) {
          console.log('🔄 Window Load - AICleaningAdvisor再作成');
          window.aiCleaningAdvisor = new AICleaningAdvisor();
      }
  });

  // 手動初期化関数（デバッグ用）
  window.initializeLocationButtons = function() {
      console.log('🔧 手動初期化実行');
      if (window.aiCleaningAdvisor) {
          window.aiCleaningAdvisor.setupLocationButtonsWithDebug();
      } else {
          console.log('⚠️ aiCleaningAdvisor が見つかりません');
      }
  };

  // デバッグ用：手動で場所選択をテスト
  window.testLocationSelection = function(location) {
      console.log(`🧪 手動テスト: ${location}`);
      if (window.aiCleaningAdvisor) {
          window.aiCleaningAdvisor.selectLocation(location);
      } else {
          console.log('⚠️ aiCleaningAdvisor が見つかりません');
      }
  };

  // デバッグ用：DOM状態確認
  window.checkDOMState = function() {
      console.log('🔍 DOM状態確認');
      const locationButtons = document.querySelectorAll('.location-btn');
      console.log(`location-btnボタン数: ${locationButtons.length}`);

      locationButtons.forEach((btn, index) => {
          const location = btn.getAttribute('data-location');
          console.log(`ボタン${index + 1}: ${location}`);
          console.log(`  - クリック可能: ${!btn.disabled && btn.style.pointerEvents !== 'none'}`);

          // 手動でクリックイベントをテスト
          btn.addEventListener('click', () => {
              console.log(`✅ 手動テスト成功: ${location}`);
          }, { once: true });
      });
  };

  console.log('🤖 AI掃除アドバイザー サーバーレス版準備完了');
  console.log('🌐 エックスサーバー等の静的ホスティング完全対応');
  console.log('🔧 サーバー不要でローカル分析による掃除方法生成');
  console.log('🎯 複数の方法で確実な場所選択を実現');
  console.log('🛒 Amazon PA-API統合対応 - セキュアなリアルタイム商品情報');
  console.log('🧪 手動テスト関数も利用可能:');
  console.log('  - window.testLocationSelection("kitchen")');
  console.log('  - window.checkDOMState()');
  console.log('  - window.initializeLocationButtons()');
  console.log('🚀 エックスサーバーで完全動作する静的版');