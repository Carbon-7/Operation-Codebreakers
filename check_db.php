<?php
// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'codebreaker_game';

try {
    // First connect without database
    $conn = new PDO("mysql:host=$db_host", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $conn->exec("CREATE DATABASE IF NOT EXISTS $db_name");
    echo "Database created or already exists!\n";
    
    // Connect to the database
    $conn->exec("USE $db_name");
    echo "Database connection successful!\n";
    
    // Check if table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'leaderboard'");
    if ($stmt->rowCount() > 0) {
        echo "Leaderboard table exists!\n";
        
        // Check table structure
        $stmt = $conn->query("DESCRIBE leaderboard");
        echo "\nTable structure:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "{$row['Field']}: {$row['Type']}\n";
        }
        
        // Check if there's any data
        $stmt = $conn->query("SELECT COUNT(*) as count FROM leaderboard");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "\nNumber of records: $count\n";
    } else {
        echo "Leaderboard table does not exist!\n";
        // Try to create the table
        echo "Attempting to create the table...\n";
        $conn->exec("CREATE TABLE IF NOT EXISTS leaderboard (
            id INT AUTO_INCREMENT PRIMARY KEY,
            player_name VARCHAR(255) NOT NULL,
            score INT NOT NULL,
            completion_time VARCHAR(8) NOT NULL,
            levels_completed INT NOT NULL,
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        echo "Table created successfully!\n";
    }
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?> 