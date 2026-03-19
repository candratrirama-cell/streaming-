<?php
// 1. Pengaturan Header & Session
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Mengizinkan akses dari berbagai sumber
session_start();

// 2. Aktifkan Error Reporting (Hapus/Komentar jika sudah masuk tahap Produksi)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 3. KONFIGURASI RAHASIA
$ADMIN_USER = "admin";
$ADMIN_PASS = "2013GG";
$FIREBASE_URL = "https://miningtransaction-default-rtdb.asia-southeast1.firebasedatabase.app";

// Ambil parameter aksi dari URL
$action = $_GET['action'] ?? '';

// --- LOGIC 1: LOGIN ---
if ($action == 'login') {
    $user = $_POST['u'] ?? '';
    $pass = $_POST['p'] ?? '';
    
    // Debugging sederhana: Cek apakah input kosong
    if (empty($user) || empty($pass)) {
        http_response_code(400);
        echo json_encode(['status' => 'fail', 'msg' => 'Username/Password Kosong!']);
        exit;
    }

    if ($user === $ADMIN_USER && $pass === $ADMIN_PASS) {
        $_SESSION['bki_auth'] = true;
        echo json_encode(['status' => 'success', 'msg' => 'Selamat Datang, Boss!']);
    } else {
        http_response_code(401);
        echo json_encode([
            'status' => 'fail', 
            'msg' => 'SALAH, BOSS!',
            'debug_received_user' => $user // Menampilkan apa yang diterima server
        ]);
    }
    exit;
}

// --- LOGIC 2: PUBLISH (Hanya jika sudah login) ---
if ($action == 'publish') {
    if (!isset($_SESSION['bki_auth']) || $_SESSION['bki_auth'] !== true) {
        http_response_code(403);
        echo json_encode(['status' => 'fail', 'msg' => 'Sesi Berakhir, Silakan Login Lagi']);
        exit;
    }

    $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($_POST['slug'] ?? ''));
    $content = $_POST['content'] ?? '';

    if (empty($slug) || empty($content)) {
        echo json_encode(['status' => 'fail', 'msg' => 'Data tidak lengkap']);
        exit;
    }

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
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode == 200) {
        echo json_encode(['status' => 'success', 'msg' => 'Berhasil Deploy!']);
    } else {
        echo json_encode(['status' => 'fail', 'msg' => 'Gagal ke Firebase', 'raw' => $response]);
    }
    exit;
}

// --- LOGIC 3: LIST DATA ---
if ($action == 'list') {
    // Mengambil data menggunakan file_get_contents (Simple)
    $context = stream_context_create([
        "http" => ["method" => "GET", "header" => "Content-Type: application/json\r\n"]
    ]);
    $data = file_get_contents($FIREBASE_URL . "/sites.json", false, $context);
    
    if ($data === false) {
        echo json_encode([]);
    } else {
        echo $data;
    }
    exit;
}

// Jika action tidak ditemukan
echo json_encode(['status' => 'error', 'msg' => 'Aksi tidak dikenali']);
