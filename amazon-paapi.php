<?php
// Amazon PA API v5 実装
// このファイルは実際のAmazon商品を取得する場合に使用します

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
    
    public function searchItems($keywords, $limit = 10) {
        $serviceName = 'ProductAdvertisingAPI';
        $target = '/paapi5/searchitems';
        $httpMethod = 'POST';
        
        $payload = json_encode([
            'Keywords' => $keywords,
            'SearchIndex' => 'All',
            'PartnerTag' => $this->partnerTag,
            'PartnerType' => 'Associates',
            'ItemCount' => $limit,
            'Resources' => [
                'Images.Primary.Large',
                'ItemInfo.Title',
                'Offers.Listings.Price',
                'CustomerReviews.StarRating',
                'BrowseNodeInfo.WebsiteSalesRank'
            ],
            'Marketplace' => 'www.amazon.co.jp'
        ]);
        
        $headers = $this->createHeaders($payload, $target, $httpMethod);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://' . $this->host . $target);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            return false;
        }
        
        $data = json_decode($response, true);
        return $this->formatProducts($data);
    }
    
    private function createHeaders($payload, $target, $httpMethod) {
        $datetime = gmdate('Ymd\THis\Z');
        $date = gmdate('Ymd');
        
        $headers = [
            'content-encoding' => 'amz-1.0',
            'content-type' => 'application/json; charset=utf-8',
            'host' => $this->host,
            'x-amz-date' => $datetime,
            'x-amz-target' => 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
        ];
        
        // 署名の作成
        $canonicalHeaders = '';
        $signedHeaders = '';
        
        ksort($headers);
        foreach ($headers as $key => $value) {
            $canonicalHeaders .= $key . ':' . $value . "\n";
            $signedHeaders .= $key . ';';
        }
        $signedHeaders = rtrim($signedHeaders, ';');
        
        $canonicalRequest = $httpMethod . "\n" .
                          $target . "\n" .
                          "\n" .
                          $canonicalHeaders . "\n" .
                          $signedHeaders . "\n" .
                          hash('sha256', $payload);
        
        $algorithm = 'AWS4-HMAC-SHA256';
        $scope = $date . '/' . $this->region . '/ProductAdvertisingAPI/aws4_request';
        
        $stringToSign = $algorithm . "\n" .
                       $datetime . "\n" .
                       $scope . "\n" .
                       hash('sha256', $canonicalRequest);
        
        $signingKey = $this->getSignatureKey($date);
        $signature = hash_hmac('sha256', $stringToSign, $signingKey);
        
        $authorizationHeader = $algorithm . ' ' .
                             'Credential=' . $this->accessKey . '/' . $scope . ', ' .
                             'SignedHeaders=' . $signedHeaders . ', ' .
                             'Signature=' . $signature;
        
        return [
            'Content-Type: application/json; charset=utf-8',
            'Content-Encoding: amz-1.0',
            'Host: ' . $this->host,
            'X-Amz-Date: ' . $datetime,
            'X-Amz-Target: com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
            'Authorization: ' . $authorizationHeader
        ];
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
            $product = [
                'title' => $item['ItemInfo']['Title']['DisplayValue'] ?? '',
                'price' => $this->extractPrice($item),
                'rating' => $this->extractRating($item),
                'image' => $item['Images']['Primary']['Large']['URL'] ?? 'https://via.placeholder.com/150',
                'url' => $item['DetailPageURL'] ?? '',
                'salesRank' => $this->extractSalesRank($item)
            ];
            
            $products[] = $product;
        }
        
        // 売れ筋順にソート
        usort($products, function($a, $b) {
            return ($a['salesRank'] ?? PHP_INT_MAX) - ($b['salesRank'] ?? PHP_INT_MAX);
        });
        
        return $products;
    }
    
    private function extractPrice($item) {
        if (isset($item['Offers']['Listings'][0]['Price']['DisplayAmount'])) {
            return $item['Offers']['Listings'][0]['Price']['DisplayAmount'];
        }
        return '価格情報なし';
    }
    
    private function extractRating($item) {
        if (isset($item['CustomerReviews']['StarRating']['Value'])) {
            return $item['CustomerReviews']['StarRating']['Value'];
        }
        return '0';
    }
    
    private function extractSalesRank($item) {
        if (isset($item['BrowseNodeInfo']['WebsiteSalesRank']['SalesRank'])) {
            return $item['BrowseNodeInfo']['WebsiteSalesRank']['SalesRank'];
        }
        return PHP_INT_MAX;
    }
}