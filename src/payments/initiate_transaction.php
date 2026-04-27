<?php

$url_dev = "http://localhost:3000/payments/initiate_transaction";
$url = "https://dreamaccount.refugebank.com.ng/payments/initiate_transaction";

$fields = [
    'username' => 'seinde',
    'account_number' => '8889381799',
    'email' => 'boseinde@gail.com',
    'amount' => 15000,
    'currency_code' => 'NGN',
    'country_code' => 'NG',
    'client_callback_url' => 'https://thehouse48.com/call_back',
];

$api_key = 'whyehyehhrjkk';

$fields_string = http_build_query($fields);

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $fields_string,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/x-www-form-urlencoded",
        "x-api-key: $api_key" // THIS IS REQUIRED
    ]
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    die("Error: " . curl_error($ch));
}

echo $response;