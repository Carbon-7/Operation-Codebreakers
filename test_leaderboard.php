<?php
// Test file for leaderboard functionality
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Leaderboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            margin: 10px 0;
        }
        .stat-label {
            color: #6c757d;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
        }
        th, td {
            padding: 12px;
            border: 1px solid #dee2e6;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        tr:hover {
            background-color: #f2f2f2;
        }
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
        }
        .pagination button {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            background-color: white;
            cursor: pointer;
            border-radius: 4px;
        }
        .pagination button:hover {
            background-color: #e9ecef;
        }
        .pagination button.active {
            background-color: #007bff;
            color: white;
            border-color: #007bff;
        }
        .pagination button:disabled {
            background-color: #e9ecef;
            cursor: not-allowed;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #495057;
        }
        input {
            padding: 8px;
            width: 100%;
            max-width: 300px;
            border: 1px solid #ced4da;
            border-radius: 4px;
        }
        button {
            padding: 10px 20px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #218838;
        }
        #message {
            margin: 20px 0;
            padding: 12px;
            border-radius: 4px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .page-info {
            text-align: center;
            color: #6c757d;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Operation Codebreaker Leaderboard</h1>
        
        <div id="message"></div>

        <div id="stats" class="stats-container">
            <!-- Statistics will be inserted here -->
        </div>

        <h2>Add New Score</h2>
        <form id="scoreForm">
            <div class="form-group">
                <label for="player_name">Player Name:</label>
                <input type="text" id="player_name" name="player_name" required>
            </div>
            <div class="form-group">
                <label for="score">Score:</label>
                <input type="number" id="score" name="score" required>
            </div>
            <div class="form-group">
                <label for="completion_time">Completion Time (MM:SS):</label>
                <input type="text" id="completion_time" name="completion_time" pattern="\d{2}:\d{2}" placeholder="00:00" required>
            </div>
            <div class="form-group">
                <label for="levels_completed">Levels Completed:</label>
                <input type="number" id="levels_completed" name="levels_completed" required>
            </div>
            <button type="submit">Add Score</button>
        </form>

        <h2>All Scores</h2>
        <div class="page-info"></div>
        <table id="leaderboard">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Time</th>
                    <th>Levels</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                <!-- Leaderboard data will be inserted here -->
            </tbody>
        </table>
        <div class="pagination" id="pagination">
            <!-- Pagination buttons will be inserted here -->
        </div>
    </div>

    <script>
        let currentPage = 1;
        const perPage = 25;

        // Function to show message
        function showMessage(text, isError = false) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = text;
            messageDiv.className = isError ? 'error' : 'success';
        }

        // Function to load statistics
        function loadStats() {
            const formData = new FormData();
            formData.append('action', 'stats');

            fetch('leaderboard_handler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const statsContainer = document.getElementById('stats');
                    const stats = data.data;
                    
                    statsContainer.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-value">${stats.total_players}</div>
                            <div class="stat-label">Total Players</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.total_games}</div>
                            <div class="stat-label">Games Played</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.highest_score}</div>
                            <div class="stat-label">Highest Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.average_score}</div>
                            <div class="stat-label">Average Score</div>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading stats:', error);
            });
        }

        // Function to create pagination buttons
        function createPagination(currentPage, totalPages) {
            const pagination = document.getElementById('pagination');
            const pageInfo = document.querySelector('.page-info');
            
            // Update page info
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            
            // Create pagination buttons
            let buttons = '';
            
            // Previous button
            buttons += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
            
            // Page buttons
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    buttons += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                    buttons += '<button disabled>...</button>';
                }
            }
            
            // Next button
            buttons += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
            
            pagination.innerHTML = buttons;
        }

        // Function to change page
        function changePage(page) {
            currentPage = page;
            loadLeaderboard();
        }

        // Function to load leaderboard
        function loadLeaderboard() {
            const formData = new FormData();
            formData.append('action', 'get');
            formData.append('page', currentPage);
            formData.append('per_page', perPage);

            fetch('leaderboard_handler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tbody = document.querySelector('#leaderboard tbody');
                    tbody.innerHTML = '';
                    
                    const startRank = (data.pagination.current_page - 1) * data.pagination.per_page + 1;
                    
                    data.data.forEach((entry, index) => {
                        const rank = startRank + index;
                        const row = tbody.insertRow();
                        row.innerHTML = `
                            <td>${rank}</td>
                            <td>${entry.player_name}</td>
                            <td>${entry.score}</td>
                            <td>${entry.completion_time}</td>
                            <td>${entry.levels_completed}</td>
                            <td>${new Date(entry.date_created).toLocaleString()}</td>
                        `;
                    });
                    
                    createPagination(data.pagination.current_page, data.pagination.total_pages);
                } else {
                    showMessage('Error loading leaderboard: ' + data.message, true);
                }
            })
            .catch(error => {
                showMessage('Error loading leaderboard: ' + error, true);
            });
        }

        // Handle form submission
        document.getElementById('scoreForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('action', 'save');
            formData.append('player_name', document.getElementById('player_name').value);
            formData.append('score', document.getElementById('score').value);
            formData.append('completion_time', document.getElementById('completion_time').value);
            formData.append('levels_completed', document.getElementById('levels_completed').value);

            fetch('leaderboard_handler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Score added successfully!');
                    this.reset();
                    loadLeaderboard();
                    loadStats();
                } else {
                    showMessage('Error adding score: ' + data.message, true);
                }
            })
            .catch(error => {
                showMessage('Error adding score: ' + error, true);
            });
        });

        // Load initial data
        loadLeaderboard();
        loadStats();
    </script>
</body>
</html> 