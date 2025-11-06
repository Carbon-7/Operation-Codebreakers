<?php
// Enable error logging to file
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'codebreaker_game';

// Function to log errors
function logError($message) {
    $logFile = 'db_error.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    error_log($message); // Also log to PHP error log
}

try {
    // First connect without database to ensure it exists
    $conn = new PDO("mysql:host=$db_host", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $conn->exec("CREATE DATABASE IF NOT EXISTS $db_name");
    
    // Connect to the database
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create table if it doesn't exist
    $conn->exec("CREATE TABLE IF NOT EXISTS leaderboard (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_name VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        completion_time VARCHAR(8) NOT NULL,
        levels_completed INT NOT NULL,
        outcome ENUM('victory', 'defeat') DEFAULT 'defeat',
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = isset($_POST['action']) ? $_POST['action'] : '';
        logError("Received action: " . $action); // Log the action

        switch ($action) {
            case 'save':
                $player_name = isset($_POST['player_name']) ? $_POST['player_name'] : '';
                $score = isset($_POST['score']) ? intval($_POST['score']) : 0;
                $completion_time = isset($_POST['completion_time']) ? $_POST['completion_time'] : '00:00';
                $levels_completed = isset($_POST['levels_completed']) ? intval($_POST['levels_completed']) : 0;
                $outcome = isset($_POST['outcome']) ? $_POST['outcome'] : 'defeat';

                if (empty($player_name)) {
                    throw new Exception('Player name is required');
                }

                $stmt = $conn->prepare("INSERT INTO leaderboard (player_name, score, completion_time, levels_completed, outcome) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$player_name, $score, $completion_time, $levels_completed, $outcome]);

                echo json_encode(['success' => true, 'message' => 'Score saved successfully']);
                break;

            case 'get':
                $stmt = $conn->query("
                    SELECT *,
                    TIME_TO_SEC(STR_TO_DATE(completion_time, '%i:%s')) as time_seconds 
                    FROM leaderboard 
                    ORDER BY score DESC, time_seconds ASC 
                    LIMIT 10
                ");
                
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $results]);
                break;

            case 'stats':
                $stats = [];
                
                // Get total players
                $stmt = $conn->query("SELECT COUNT(DISTINCT player_name) as total_players FROM leaderboard");
                $stats['total_players'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_players'];
                
                // Get highest score
                $stmt = $conn->query("SELECT MAX(score) as highest_score FROM leaderboard");
                $stats['highest_score'] = $stmt->fetch(PDO::FETCH_ASSOC)['highest_score'];
                
                // Get average score
                $stmt = $conn->query("SELECT AVG(score) as average_score FROM leaderboard");
                $stats['average_score'] = round($stmt->fetch(PDO::FETCH_ASSOC)['average_score'], 2);
                
                // Get total games played
                $stmt = $conn->query("SELECT COUNT(*) as total_games FROM leaderboard");
                $stats['total_games'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_games'];
                
                // Get victory count
                $stmt = $conn->query("SELECT COUNT(*) as victory_count FROM leaderboard WHERE outcome = 'victory'");
                $stats['victory_count'] = $stmt->fetch(PDO::FETCH_ASSOC)['victory_count'];
                
                // Get defeat count
                $stmt = $conn->query("SELECT COUNT(*) as defeat_count FROM leaderboard WHERE outcome = 'defeat'");
                $stats['defeat_count'] = $stmt->fetch(PDO::FETCH_ASSOC)['defeat_count'];
                
                echo json_encode([
                    'success' => true,
                    'data' => $stats
                ]);
                break;

            default:
                throw new Exception('Invalid action: ' . $action);
        }
    } else {
        throw new Exception('Invalid request method');
    }
} catch (Exception $e) {
    logError($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 