<?php
header('Content-Type: application/json');

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'codebreaker_game';

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $player_name = $_POST['player_name'] ?? '';

    if (empty($player_name)) {
        throw new Exception('Player name is required');
    }

    // Check if player exists and is active
    $stmt = $conn->prepare("SELECT * FROM authorized_players WHERE player_name = ? AND status = 'active'");
    $stmt->execute([$player_name]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Player authorized'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized player or inactive account'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 