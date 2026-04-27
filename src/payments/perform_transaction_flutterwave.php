<?php

$reference = "REF_8889381799177702524681515000289";
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "http://localhost:3000/payments/perform_transaction_flutterwave",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        "reference" => $reference
    ]),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-api-key: whyehyehhrjkk"
    ],
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => false
]);

$response = curl_exec($ch);

if ($response === false) {
    die("Curl error: " . curl_error($ch));
}

$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $header_size);
$body = substr($response, $header_size);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

// Extract Location from redirect responses
if (in_array($http_code, [301, 302, 303, 307, 308])) {
    preg_match('/Location:\s*(.+)/i', $headers, $matches);
    
    if (isset($matches[1])) {
        $redirectUrl = trim($matches[1]);
        // Remove any trailing CR/LF
        $redirectUrl = rtrim($redirectUrl, "\r\n");
        
        error_log("Redirecting to: $redirectUrl");
        header("Location: $redirectUrl", true, 302);
        exit;
    }
}

// If we get here, either no redirect or no Location header - output the response for debugging
die("ERROR: Expected redirect (got HTTP $http_code). Response:\n$body");