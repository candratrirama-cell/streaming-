<?php
header('Content-Type: application/json');
session_start();

// --- KONFIGURASI RAHASIA (Tidak Terlihat di Browser) ---
$ADMIN_USER = "admin";
$ADMIN_PASS = "2013GG";
$FIREBASE_URL = "https://miningtransaction-default-rtdb.asia-southeast1.firebasedatabase.app";

$action = $_GET['action'] ?? '';

// 1. LOGIC LOGIN
if ($action == 'login') {
    $user = $_POST['u'] ?? '';
    $pass = $_POST['p'] ?? '';
    
    if ($user === $ADMIN_USER && $pass === $ADMIN_PASS) {
        $_SESSION['bki_auth'] = true;
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(401);
        echo json_encode(['status' => 'fail', 'msg' => 'SALAH, BOSS!']);
    }
    exit;
}

// 2. LOGIC PUBLISH (Hanya jika sudah login)
if ($action == 'publish') {
    if (!isset($_SESSION['bki_auth'])) {
        http_response_code(403);
        exit(json_encode(['msg' => 'Unauthorized']));
    }

    $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($_POST['slug']));
    $content = $_POST['content'];

    $url = $FIREBASE_URL . "/sites/" . $slug . ".json";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'content' => $content,
        'time' => date('Y-m-d H:i:s'),
        'views' => 0
    ]));
    
    $response = curl_exec($ch);
    curl_close($ch);
    echo $response;
    exit;
}

// 3. LOGIC AMBIL DATA (Untuk Master List)
if ($action == 'list') {
    $data = file_get_contents($FIREBASE_URL . "/sites.json");
    echo $data;
    exit;
}
?>
