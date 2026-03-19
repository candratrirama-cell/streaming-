<?php
header('Content-Type: application/json');
session_start();

// --- KONFIGURASI RAHASIA ---
$PASS_BENAR = "190713"; 
$FIREBASE_URL = "https://miningtransaction-default-rtdb.asia-southeast1.firebasedatabase.app";

$action = $_GET['action'] ?? '';

// 1. LOGIN (Hanya Pakai Sandi)
if ($action == 'login') {
    $input = $_POST['sandi'] ?? '';
    if ($input === $PASS_BENAR) {
        $_SESSION['bki_auth'] = true;
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(401);
        echo json_encode(['status' => 'fail', 'msg' => 'SANDI SALAH!']);
    }
    exit;
}

// 2. PROTEKSI (Cek apakah sudah login sebelum akses fungsi lain)
if (!isset($_SESSION['bki_auth']) && ($action == 'publish' || $action == 'list' || $action == 'delete')) {
    http_response_code(403);
    exit(json_encode(['msg' => 'Akses Ditolak']));
}

// 3. PUBLISH PROJECT
if ($action == 'publish') {
    $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($_POST['slug']));
    $content = $_POST['content'];

    $url = $FIREBASE_URL . "/sites/" . $slug . ".json";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'content' => $content,
        'time' => date('d-m-Y H:i:s'),
        'views' => 0
    ]));
    echo curl_exec($ch);
    curl_close($ch);
    exit;
}

// 4. LIST PROJECT
if ($action == 'list') {
    $data = file_get_contents($FIREBASE_URL . "/sites.json");
    echo $data ? $data : json_encode([]);
    exit;
}

// 5. HAPUS PROJECT
if ($action == 'delete') {
    $key = $_GET['key'] ?? '';
    $url = $FIREBASE_URL . "/sites/" . $key . ".json";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    echo curl_exec($ch);
    curl_close($ch);
    exit;
}
?>
