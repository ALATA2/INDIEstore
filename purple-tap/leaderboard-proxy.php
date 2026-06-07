<?php
// Simple HTTPS/CORS proxy for Dreamlo Leaderboard on NEONJA
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$action = isset($_GET['action']) ? $_GET['action'] : 'get';

$dreamloPublicCode = '6a1dfd878f40bb17b0410195';
$dreamloPrivateCode = 'vWN1M2rcEEayTu1HkN2Vzg_TQKy52IVkOBjGmsCsWvRQ';

if ($action === 'get') {
    $url = "http://dreamlo.com/lb/{$dreamloPublicCode}/json";
    
    // Set a timeout of 3 seconds for the HTTP request
    $ctx = stream_context_create([
        'http' => ['timeout' => 3.0]
    ]);
    
    $response = @file_get_contents($url, false, $ctx);
    if ($response === false) {
        http_response_code(502);
        echo json_encode(["error" => "Failed to fetch leaderboard from Dreamlo"]);
    } else {
        echo $response;
    }
} elseif ($action === 'add') {
    $name = isset($_GET['name']) ? preg_replace('/[^a-zA-Z0-9]/', '', $_GET['name']) : '';
    $score = isset($_GET['score']) ? intval($_GET['score']) : 0;
    
    if (empty($name) || $score <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid name or score"]);
        exit;
    }
    
    $url = "http://dreamlo.com/lb/{$dreamloPrivateCode}/add-pipe/{$name}/{$score}";
    
    $ctx = stream_context_create([
        'http' => ['timeout' => 3.0]
    ]);
    
    $response = @file_get_contents($url, false, $ctx);
    if ($response === false) {
        http_response_code(502);
        echo json_encode(["error" => "Failed to submit score to Dreamlo"]);
    } else {
        echo json_encode(["success" => true, "response" => trim($response)]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid action"]);
}
