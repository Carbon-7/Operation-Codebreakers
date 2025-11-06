<?php
session_start();

// Check if already logged in
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: admin_panel.php');
    exit();
}

// Simple admin credentials (in production, use proper password hashing and database storage)
$admin_username = 'admin';
$admin_password = 'admin123'; // In production, use hashed passwords

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === $admin_username && $password === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: admin_panel.php');
        exit();
    } else {
        $error = 'Invalid credentials';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Login - CodeBreaker</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background-color: #000;
            color: #0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .login-container {
            background-color: rgba(0, 20, 0, 0.9);
            padding: 2rem;
            border: 2px solid #0f0;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
            width: 100%;
            max-width: 400px;
        }
        h1 {
            text-align: center;
            margin-bottom: 2rem;
            text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
        .form-group {
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
        }
        input {
            width: 100%;
            padding: 0.5rem;
            background-color: #000;
            border: 1px solid #0f0;
            color: #0f0;
            font-family: 'Courier New', monospace;
        }
        input:focus {
            outline: none;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }
        button {
            width: 100%;
            padding: 0.75rem;
            background-color: #0f0;
            color: #000;
            border: none;
            cursor: pointer;
            font-weight: bold;
            margin-top: 1rem;
            font-family: 'Courier New', monospace;
        }
        button:hover {
            background-color: #00ff00;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
        }
        .error {
            color: #ff0000;
            text-align: center;
            margin-bottom: 1rem;
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
    </style>
</head>
<body>
    <canvas id="matrix-bg" class="matrix-bg"></canvas>
    <div class="login-container">
        <h1>CodeBreaker Admin</h1>
        <?php if (isset($error)): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        <form method="POST">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
    </div>

    <script>
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
    </script>
</body>
</html> 