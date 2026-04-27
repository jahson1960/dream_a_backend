<?php

// =========================
// DB CONNECTION
// =========================
$pdo = new PDO(
    "mysql:host=localhost;dbname=dream_virtual_account;charset=utf8mb4",
    "root",
    "",
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
);

// =========================
// KEYS (MUST MATCH NESTJS)
// =========================
$encKey = hex2bin("c1e5f7a2b9d8e6f3c4a1b2d3e4f56789aabbccddeeff00112233445566778899");
$hmacKey = hex2bin("8899aabbccddeeff0011223344556677c1e5f7a2b9d8e6f3c4a1b2d3e4f56789");

// =========================
// HELPERS (same logic as NestJS)
// =========================

function normalize($value) {
    return strtolower(trim($value));
}

function hashValue($value, $hmacKey) {
    return hash_hmac('sha256', normalize($value), $hmacKey);
}

function encryptValue($value, $encKey, $hmacKey) {
    $iv = random_bytes(16);

    $ciphertext = openssl_encrypt(
        $value,
        'aes-256-cbc',
        $encKey,
        OPENSSL_RAW_DATA,
        $iv
    );

    $hmac = hash_hmac('sha256', $iv . $ciphertext, $hmacKey, true);

    return base64_encode($iv . $hmac . $ciphertext);
}

// =========================
// OLD DATA
// =========================
$clients = [
    ["8827212338", "info3dff5d", "Refuge Bank", "info@refugebank.com.ng", "2026-03-10 14:35:18"],
    ["8871435807", "elvisebomaa03ed8", "E E", "elviseboma@gmail.com", "2026-03-10 11:35:35"],
    ["8899993975", "buyer6f80cc", "Test Afra", "buyer@gmail.com", "2026-03-09 18:50:59"],
    ["8895025041", "elvisebomabc69d1", "E E", "elviseboma@outlook.com", "2026-03-09 14:01:07"],
    ["8805476599", "worftcobbs4293c7", "worft cobbs", "worft.cobbs@gmail.com", "2026-03-09 13:43:30"],
    ["8829262136", "soniarains4293d8", "sonia rains", "sonia.rains@gmail.com", "2026-03-09 12:59:58"],
    ["8896408541", "vincentsusan6587774", "susan vincent", "vincentsusan6@gmail.com", "2026-03-09 12:14:46"],
    ["8860091895", "sellerd9dd04", "test seller", "seller@gmail.com", "2026-03-09 12:00:25"],
    ["8833066539", "anayo89", "Anayo Okorie Matthew", "anayochukwu@example.com", "2026-02-27 12:19:28"],
];

// =========================
// MIGRATION
// =========================
foreach ($clients as $c) {

    $account_number = $c[0];
    $username = $c[1];
    $full_name = trim($c[2]);
    $email = $c[3];
    $created_at = $c[4];

    // =========================
    // SPLIT NAME LOGIC
    // =========================
    $nameParts = preg_split('/\s+/', $full_name);

    $first_name = $nameParts[0] ?? null;
    $middle_name = null;
    $last_name = null;

    if (count($nameParts) === 1) {
        $last_name = $nameParts[0];
    } elseif (count($nameParts) === 2) {
        $first_name = $nameParts[0];
        $last_name = $nameParts[1];
    } elseif (count($nameParts) >= 3) {
        $first_name = $nameParts[0];
        $middle_name = $nameParts[1];
        $last_name = $nameParts[count($nameParts) - 1];
    }

    // =========================
    // ENCRYPT FIELDS
    // =========================
    $username_enc = encryptValue($username, $encKey, $hmacKey);
    $email_enc = encryptValue($email, $encKey, $hmacKey);

    $first_name_enc = encryptValue($first_name, $encKey, $hmacKey);
    $middle_name_enc = $middle_name ? encryptValue($middle_name, $encKey, $hmacKey) : null;
    $last_name_enc = $last_name ? encryptValue($last_name, $encKey, $hmacKey) : null;

    $account_number_enc = encryptValue($account_number, $encKey, $hmacKey);

    // =========================
    // HASHES
    // =========================
    $username_hash = hashValue($username, $hmacKey);
    $email_hash = hashValue($email, $hmacKey);
    $account_number_hash = hashValue($account_number, $hmacKey);

    // =========================
    // INSERT
    // =========================
    $stmt = $pdo->prepare("
        INSERT INTO clients (
            api_client_id,
            username_enc,
            username_hash,
            email_enc,
            email_hash,
            first_name_enc,
            middle_name_enc,
            last_name_enc,
            account_number,
            account_number_enc,
            account_number_hash,
            created_at
        ) VALUES (
            1,
            :username_enc,
            :username_hash,
            :email_enc,
            :email_hash,
            :first_name_enc,
            :middle_name_enc,
            :last_name_enc,
            :account_number,
            :account_number_enc,
            :account_number_hash,
            :created_at
        )
    ");

    $stmt->execute([
        ':username_enc' => $username_enc,
        ':username_hash' => $username_hash,
        ':email_enc' => $email_enc,
        ':email_hash' => $email_hash,
        ':first_name_enc' => $first_name_enc,
        ':middle_name_enc' => $middle_name_enc,
        ':last_name_enc' => $last_name_enc,
        ':account_number' => $account_number,
        ':account_number_enc' => $account_number_enc,
        ':account_number_hash' => $account_number_hash,
        ':created_at' => $created_at,
    ]);

    echo "Migrated: $account_number\n";
}

echo "\nMigration completed successfully!\n";