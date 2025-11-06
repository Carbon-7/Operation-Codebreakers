<?php
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: admin_login.php');
    exit();
}

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'codebreaker_game';

try {
    // Connect directly to the existing database
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if authorized_players table exists
    $tableExists = false;
    $stmt = $conn->query("SHOW TABLES LIKE 'authorized_players'");
    $tableExists = ($stmt->rowCount() > 0);
    
    // Create authorized_players table if it doesn't exist
    if (!$tableExists) {
        $conn->exec("CREATE TABLE authorized_players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            player_name VARCHAR(255) NOT NULL UNIQUE,
            status ENUM('active', 'inactive') DEFAULT 'active',
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }

    // Initialize players array
    $players = [];
    $leaderboard = [];

    // Handle form submissions
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['action'])) {
            switch ($_POST['action']) {
                case 'add_player':
                    $player_name = trim($_POST['player_name']);
                    if (!empty($player_name)) {
                        try {
                            // First check if player already exists
                            $check_stmt = $conn->prepare("SELECT COUNT(*) FROM authorized_players WHERE player_name = ?");
                            $check_stmt->execute([$player_name]);
                            $exists = $check_stmt->fetchColumn();
                            
                            if ($exists) {
                                $error = "Player name '$player_name' already exists. Please choose a different name.";
                            } else {
                                $stmt = $conn->prepare("INSERT INTO authorized_players (player_name) VALUES (?)");
                                $stmt->execute([$player_name]);
                                $message = "Player '$player_name' added successfully";
                            }
                        } catch (PDOException $e) {
                            $error = "Failed to add player: " . $e->getMessage();
                        }
                    }
                    break;
                    
                case 'delete_player':
                    $player_id = $_POST['player_id'];
                    $stmt = $conn->prepare("DELETE FROM authorized_players WHERE id = ?");
                    $stmt->execute([$player_id]);
                    $message = "Player deleted successfully";
                    break;
                    
                case 'toggle_status':
                    $player_id = $_POST['player_id'];
                    $new_status = $_POST['new_status'];
                    $stmt = $conn->prepare("UPDATE authorized_players SET status = ? WHERE id = ?");
                    $stmt->execute([$new_status, $player_id]);
                    $message = "Player status updated successfully";
                    break;

                case 'delete_score':
                    $score_id = $_POST['score_id'];
                    $stmt = $conn->prepare("DELETE FROM leaderboard WHERE id = ?");
                    $stmt->execute([$score_id]);
                    $message = "Score deleted successfully";
                    break;

                case 'delete_selected_scores':
                    if (isset($_POST['selected_scores']) && is_array($_POST['selected_scores'])) {
                        $selected_scores = $_POST['selected_scores'];
                        $placeholders = str_repeat('?,', count($selected_scores) - 1) . '?';
                        $stmt = $conn->prepare("DELETE FROM leaderboard WHERE id IN ($placeholders)");
                        $stmt->execute($selected_scores);
                        $message = count($selected_scores) . " selected scores deleted successfully";
                    }
                    break;
            }
        }
    }

    // Fetch all players
    $stmt = $conn->query("SELECT * FROM authorized_players ORDER BY date_added DESC");
    $players = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch leaderboard data
    $stmt = $conn->query("SELECT * FROM leaderboard ORDER BY score DESC, completion_time ASC");
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    $error = "Database error: " . $e->getMessage();
    $players = []; // Ensure players is initialized even on error
    $leaderboard = []; // Ensure leaderboard is initialized even on error
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>CodeBreaker Admin Panel</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background-color: #000;
            color: #0f0;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 1rem;
            background-color: rgba(0, 20, 0, 0.9);
            border: 1px solid #0f0;
        }
        .add-player-form {
            background-color: rgba(0, 20, 0, 0.9);
            padding: 1rem;
            margin-bottom: 2rem;
            border: 1px solid #0f0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            background-color: rgba(0, 20, 0, 0.9);
        }
        th, td {
            padding: 0.75rem;
            text-align: left;
            border: 1px solid #0f0;
        }
        th {
            background-color: rgba(0, 255, 0, 0.1);
        }
        tr:hover {
            background-color: rgba(0, 255, 0, 0.05);
        }
        input[type="text"] {
            padding: 0.5rem;
            background-color: #000;
            border: 1px solid #0f0;
            color: #0f0;
            font-family: 'Courier New', monospace;
        }
        button {
            padding: 0.5rem 1rem;
            background-color: #0f0;
            color: #000;
            border: none;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            margin-left: 0.5rem;
        }
        button:hover {
            background-color: #00ff00;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
        }
        .message {
            padding: 1rem;
            margin-bottom: 1rem;
            background-color: rgba(0, 255, 0, 0.1);
            border: 1px solid #0f0;
        }
        .error {
            background-color: rgba(255, 0, 0, 0.1);
            border-color: #f00;
            color: #f00;
        }
        .status-active {
            color: #0f0;
        }
        .status-inactive {
            color: #f00;
        }
        .logout-btn {
            background-color: #f00;
        }
        .logout-btn:hover {
            background-color: #ff0000;
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
        }
        .matrix-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.1;
        }
        .section-header {
            background-color: rgba(0, 20, 0, 0.9);
            padding: 1rem;
            margin: 2rem 0 1rem 0;
            border: 1px solid #0f0;
        }
        .outcome-victory {
            color: #0f0;
        }
        .outcome-defeat {
            color: #f00;
        }
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
        .stat-card {
            background-color: rgba(0, 20, 0, 0.9);
            padding: 1rem;
            border: 1px solid #0f0;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            color: #0f0;
            margin: 0.5rem 0;
        }
        .stat-label {
            color: rgba(0, 255, 0, 0.7);
            font-size: 14px;
        }
        /* Add fade out animation */
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .fade-out {
            animation: fadeOut 1s ease-out forwards;
        }
    </style>
</head>
<body>
    <canvas id="matrix-bg" class="matrix-bg"></canvas>
    <div class="container">
        <div class="header">
            <h1>CodeBreaker Admin Panel</h1>
            <form method="POST" action="admin_logout.php" style="margin: 0;">
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        </div>

        <?php if (isset($message)): ?>
            <div class="message" id="success-message"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>

        <?php if (isset($error)): ?>
            <div class="message error" id="error-message"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <div class="add-player-form">
            <h2>Add New Player</h2>
            <form method="POST">
                <input type="hidden" name="action" value="add_player">
                <input type="text" name="player_name" placeholder="Enter player name" required>
                <button type="submit">Add Player</button>
            </form>
        </div>

        <h2>Authorized Players</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Player Name</th>
                    <th>Status</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($players as $player): ?>
                <tr>
                    <td><?php echo htmlspecialchars($player['id']); ?></td>
                    <td><?php echo htmlspecialchars($player['player_name']); ?></td>
                    <td class="status-<?php echo $player['status']; ?>">
                        <?php echo ucfirst(htmlspecialchars($player['status'])); ?>
                    </td>
                    <td><?php echo htmlspecialchars($player['date_added']); ?></td>
                    <td>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="action" value="toggle_status">
                            <input type="hidden" name="player_id" value="<?php echo $player['id']; ?>">
                            <input type="hidden" name="new_status" 
                                value="<?php echo $player['status'] === 'active' ? 'inactive' : 'active'; ?>">
                            <button type="submit">
                                <?php echo $player['status'] === 'active' ? 'Deactivate' : 'Activate'; ?>
                            </button>
                        </form>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="action" value="delete_player">
                            <input type="hidden" name="player_id" value="<?php echo $player['id']; ?>">
                            <button type="submit" onclick="return confirm('Are you sure you want to delete this player?')">
                                Delete
                            </button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <div class="section-header">
            <h2>Leaderboard Statistics</h2>
        </div>
        <div class="stats-container">
            <?php
            // Calculate statistics
            $total_games = count($leaderboard);
            $total_players = count(array_unique(array_column($leaderboard, 'player_name')));
            $victories = count(array_filter($leaderboard, function($entry) { return $entry['outcome'] === 'victory'; }));
            $defeats = count(array_filter($leaderboard, function($entry) { return $entry['outcome'] === 'defeat'; }));
            $highest_score = !empty($leaderboard) ? max(array_column($leaderboard, 'score')) : 0;
            $avg_score = !empty($leaderboard) ? round(array_sum(array_column($leaderboard, 'score')) / count($leaderboard)) : 0;
            ?>
            <div class="stat-card">
                <div class="stat-label">Total Games</div>
                <div class="stat-value"><?php echo $total_games; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Players</div>
                <div class="stat-value"><?php echo $total_players; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Victories</div>
                <div class="stat-value outcome-victory"><?php echo $victories; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Defeats</div>
                <div class="stat-value outcome-defeat"><?php echo $defeats; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Highest Score</div>
                <div class="stat-value"><?php echo $highest_score; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average Score</div>
                <div class="stat-value"><?php echo $avg_score; ?></div>
            </div>
        </div>

        <div class="section-header">
            <h2>Leaderboard</h2>
            <form method="post" id="leaderboard-form">
                <input type="hidden" name="action" value="delete_selected_scores">
                <button type="submit" class="delete-selected-btn" style="background-color: #f00; display: none;">Delete Selected</button>
            </form>
        </div>
        <table>
            <thead>
                <tr>
                    <th><input type="checkbox" id="select-all-scores"></th>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Time Left</th>
                    <th>Levels</th>
                    <th>Outcome</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php $rank = 1; foreach ($leaderboard as $entry): ?>
                <tr>
                    <td><input type="checkbox" name="selected_scores[]" value="<?php echo $entry['id']; ?>" form="leaderboard-form" class="score-checkbox"></td>
                    <td><?php echo $rank++; ?></td>
                    <td><?php echo htmlspecialchars($entry['player_name']); ?></td>
                    <td><?php echo $entry['score']; ?></td>
                    <td><?php echo $entry['completion_time']; ?></td>
                    <td><?php echo $entry['levels_completed']; ?></td>
                    <td class="outcome-<?php echo strtolower($entry['outcome']); ?>"><?php echo ucfirst($entry['outcome']); ?></td>
                    <td><?php echo date('Y-m-d H:i:s', strtotime($entry['date_created'])); ?></td>
                    <td>
                        <form method="post" style="display: inline;">
                            <input type="hidden" name="action" value="delete_score">
                            <input type="hidden" name="score_id" value="<?php echo $entry['id']; ?>">
                            <button type="submit" onclick="return confirm('Are you sure you want to delete this score?')">Delete</button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <script>
            // Message auto-hide functionality
            function hideMessages() {
                const successMsg = document.getElementById('success-message');
                const errorMsg = document.getElementById('error-message');
                
                if (successMsg) {
                    setTimeout(() => {
                        successMsg.classList.add('fade-out');
                        setTimeout(() => {
                            successMsg.style.display = 'none';
                        }, 1000);
                    }, 3000);
                }
                
                if (errorMsg) {
                    setTimeout(() => {
                        errorMsg.classList.add('fade-out');
                        setTimeout(() => {
                            errorMsg.style.display = 'none';
                        }, 1000);
                    }, 3000);
                }
            }

            // Call hideMessages when the page loads
            document.addEventListener('DOMContentLoaded', hideMessages);

            // Matrix rain effect
            const canvas = document.getElementById('matrix-bg');
            const ctx = canvas.getContext('2d');

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
            const drops = [];
            const fontSize = 10;
            const columns = canvas.width/fontSize;

            for(let x = 0; x < columns; x++) {
                drops[x] = 1;
            }

            function draw() {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0F0';
                ctx.font = fontSize + 'px monospace';

                for(let i = 0; i < drops.length; i++) {
                    const text = matrix[Math.floor(Math.random()*matrix.length)];
                    ctx.fillText(text, i*fontSize, drops[i]*fontSize);
                    if(drops[i]*fontSize > canvas.height && Math.random() > 0.975)
                        drops[i] = 0;
                    drops[i]++;
                }
            }

            setInterval(draw, 33);

            // Add JavaScript for checkbox functionality
            document.addEventListener('DOMContentLoaded', function() {
                const selectAllScores = document.getElementById('select-all-scores');
                const scoreCheckboxes = document.querySelectorAll('.score-checkbox');
                const deleteSelectedBtn = document.querySelector('.delete-selected-btn');
                
                // Function to update delete button visibility
                function updateDeleteButtonVisibility() {
                    const checkedBoxes = document.querySelectorAll('.score-checkbox:checked');
                    deleteSelectedBtn.style.display = checkedBoxes.length > 0 ? 'inline-block' : 'none';
                }
                
                // Select all functionality
                selectAllScores.addEventListener('change', function() {
                    scoreCheckboxes.forEach(checkbox => {
                        checkbox.checked = this.checked;
                    });
                    updateDeleteButtonVisibility();
                });
                
                // Individual checkbox functionality
                scoreCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        const allChecked = Array.from(scoreCheckboxes).every(cb => cb.checked);
                        selectAllScores.checked = allChecked;
                        updateDeleteButtonVisibility();
                    });
                });
                
                // Confirm deletion
                document.getElementById('leaderboard-form').addEventListener('submit', function(e) {
                    const checkedBoxes = document.querySelectorAll('.score-checkbox:checked');
                    if (checkedBoxes.length === 0) {
                        e.preventDefault();
                        alert('Please select at least one score to delete.');
                        return false;
                    }
                    
                    if (!confirm('Are you sure you want to delete ' + checkedBoxes.length + ' selected scores?')) {
                        e.preventDefault();
                        return false;
                    }
                });
            });
        </script>
    </div>
</body>
</html> 