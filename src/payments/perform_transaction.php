<?php

$url = "http://localhost:3000/payments/perform_transaction";

$fields = [
    'reference' => 'REF_8889381799177643321522256000568',
];

$apiKey = 'whyehyehhrjkk';

// Initialize cURL
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($fields),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/x-www-form-urlencoded",
        "x-api-key: $apiKey" 
    ]
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    die("cURL Error: " . curl_error($ch));
}

//curl_close($ch);

$data = json_decode($response, true);

// ✅ Redirect using JavaScript (safe for all environments)
if (!empty($data['checkout_url'])) {
    echo "<script>
        window.location.href = '{$data['checkout_url']}';
    </script>";
    exit;
}

// ❌ fallback if something fails
echo "<pre>";
print_r($data);
echo "</pre>";