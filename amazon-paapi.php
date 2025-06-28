<?php
// Amazon PA API v5 実装

class AmazonProductAPI {
    private $accessKey;
    private $secretKey;
    private $partnerTag;
    private $host;
    private $region;
    
    public function __construct($config) {
        $this->accessKey = $config['paapi_access_key'];
        $this->secretKey = $config['paapi_secret_key'];
        $this->partnerTag = $config['paapi_partner_tag'];
        $this->host = $config['paapi_host'];
        $this->region = $config['paapi_region'];
    }
    
    public function searchItems($keywords, $limit = 4) {
        $timestamp = gmdate('Ymd\THis\Z');
        $date = gmdate('Ymd');
        
        $payload = [
            'PartnerTag' => $this->partnerTag,
            'PartnerType' => 'Associates',
            'Keywords' => $keywords,
            'SearchIndex' => 'All',
            'ItemCount' => $limit,
            'Resources' => [
                'Images.Primary.Large',
                'ItemInfo.Title',
                'ItemInfo.ByLineInfo',
                'ItemInfo.ContentInfo',
                'ItemInfo.Features',
                'Offers.Listings.Price'
            ],
            'Marketplace' => 'www.amazon.co.jp'
        ];
        
        $payloadJson = json_encode($payload);
        $target = '/paapi5/searchitems';
        
        // 正規化されたリクエストを作成
        $canonicalRequest = $this->createCanonicalRequest('POST', $target, '', $payloadJson, $timestamp);
        
        // 署名を作成
        $signature = $this->createSignature($canonicalRequest, $date, $timestamp);
        
        // Authorizationヘッダーを作成
        $authHeader = $this->createAuthorizationHeader($date, $signature);
        
        // APIリクエストを実行
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://' . $this->host . $target);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payloadJson);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-Amz-Date: ' . $timestamp,
            'X-Amz-Target: com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
            'Authorization: ' . $authHeader,
            'Host: ' . $this->host
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($response === false) {
            error_log('cURL error: ' . $error);
            return false;
        }
        
        if ($httpCode !== 200) {
            error_log('Amazon PA API HTTP error: ' . $httpCode);
            error_log('Response: ' . $response);
            
            // エラーの詳細を解析
            $errorData = json_decode($response, true);
            if (isset($errorData['Errors'])) {
                foreach ($errorData['Errors'] as $error) {
                    error_log('API Error: ' . $error['Code'] . ' - ' . $error['Message']);
                }
            }
            
            return false;
        }
        
        $data = json_decode($response, true);
        return $this->formatProducts($data);
    }
    
    private function createCanonicalRequest($method, $uri, $queryString, $payload, $timestamp) {
        $canonicalHeaders = 'content-type:application/json' . "\n" .
                          'host:' . $this->host . "\n" .
                          'x-amz-date:' . $timestamp . "\n" .
                          'x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems' . "\n";
        
        $signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
        
        $canonicalRequest = $method . "\n" .
                          $uri . "\n" .
                          $queryString . "\n" .
                          $canonicalHeaders . "\n" .
                          $signedHeaders . "\n" .
                          hash('sha256', $payload);
        
        return $canonicalRequest;
    }
    
    private function createSignature($canonicalRequest, $date, $timestamp) {
        $algorithm = 'AWS4-HMAC-SHA256';
        $scope = $date . '/' . $this->region . '/ProductAdvertisingAPI/aws4_request';
        
        $stringToSign = $algorithm . "\n" .
                       $timestamp . "\n" .
                       $scope . "\n" .
                       hash('sha256', $canonicalRequest);
        
        $signingKey = $this->getSignatureKey($date);
        $signature = hash_hmac('sha256', $stringToSign, $signingKey);
        
        return $signature;
    }
    
    private function createAuthorizationHeader($date, $signature) {
        $algorithm = 'AWS4-HMAC-SHA256';
        $scope = $date . '/' . $this->region . '/ProductAdvertisingAPI/aws4_request';
        $signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
        
        return $algorithm . ' ' .
               'Credential=' . $this->accessKey . '/' . $scope . ', ' .
               'SignedHeaders=' . $signedHeaders . ', ' .
               'Signature=' . $signature;
    }
    
    private function getSignatureKey($date) {
        $kDate = hash_hmac('sha256', $date, 'AWS4' . $this->secretKey, true);
        $kRegion = hash_hmac('sha256', $this->region, $kDate, true);
        $kService = hash_hmac('sha256', 'ProductAdvertisingAPI', $kRegion, true);
        $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
        return $kSigning;
    }
    
    private function formatProducts($data) {
        $products = [];
        
        if (!isset($data['SearchResult']['Items'])) {
            return $products;
        }
        
        foreach ($data['SearchResult']['Items'] as $item) {
            $asin = $item['ASIN'] ?? '';
            $title = $item['ItemInfo']['Title']['DisplayValue'] ?? '商品名なし';
            $image = $item['Images']['Primary']['Large']['URL'] ?? '';
            
            // 画像がない場合はスキップ
            if (empty($image)) {
                continue;
            }
            
            $products[] = [
                'asin' => $asin,
                'title' => $title,
                'image' => $image,
                'url' => 'https://www.amazon.co.jp/dp/' . $asin . '/?tag=' . $this->partnerTag
            ];
            
            // 4個まで
            if (count($products) >= 4) {
                break;
            }
        }
        
        return $products;
    }
}