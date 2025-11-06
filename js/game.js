class Game {
    constructor() {
        console.log('%c🎮 Game Constructor Called', 'color: #00ff00; font-weight: bold;');
        
        // Verify required classes exist
        if (!window.Terminal || !window.Challenges || !window.Timer) {
            throw new Error('Required game components not loaded');
        }
        
        this.currentLevel = 1;
        this.score = 0;
        this.consecutiveWrongAnswers = 0;
        this.isGameActive = false;
        this.attemptsByLevel = {}; // Track attempts for each level
        
        // Clear any existing player name at startup
        localStorage.removeItem('playerName');
        this.playerName = '';
        
        try {
            // Initialize game components immediately
            console.log('Initializing core components...');
            this.timer = new Timer(15 * 60);
            this.challenges = new Challenges();
            this.terminal = new Terminal();
            
            // Initialize immediately if DOM is ready, otherwise wait
            if (document.readyState === 'loading') {
                console.log('DOM still loading, waiting...');
                document.addEventListener('DOMContentLoaded', () => {
                    console.log('DOM Content Loaded event fired');
                    this.initialize();
                });
            } else {
                console.log('DOM already loaded, initializing immediately');
                this.initialize();
            }
        } catch (error) {
            console.error('Failed to initialize game components:', error);
            throw error;
        }
    }

    initialize() {
        console.log('%c🎮 Initializing Game', 'color: #00ff00; font-weight: bold;');
        this.setupSoundEffects();
        this.initializeEventListeners();
        this.initializeParticles();
        
        // Verify DOM elements
        this.verifyDOMElements();
    }

    verifyDOMElements() {
        const elements = {
            'start-button': document.getElementById('start-button'),
            'start-screen': document.getElementById('start-screen'),
            'solution-input': document.getElementById('solution-input'),
            'challenge-description': document.getElementById('challenge-description'),
            'code-editor': document.getElementById('code-editor'),
            'score': document.getElementById('score'),
            'level': document.getElementById('level'),
            'minutes': document.getElementById('minutes'),
            'seconds': document.getElementById('seconds')
        };

        console.log('%c📝 DOM Elements Check:', 'color: #00ff00; font-weight: bold;');
        Object.entries(elements).forEach(([name, element]) => {
            console.log(`${name}: ${element ? '✅ Found' : '❌ Missing'}`);
        });
    }

    setupSoundEffects() {
        try {
            this.soundEffects = {
                start: new Audio('assets/sounds/start.mp3'),
                correct: new Audio('assets/sounds/correct.mp3'),
                wrong: new Audio('assets/sounds/wrong.mp3'),
                gameOver: new Audio('assets/sounds/gameover.mp3'),
                warning: new Audio('assets/sounds/warning.mp3'),
                typing: new Audio('assets/sounds/typing.mp3')
            };
            console.log('🔊 Sound effects initialized');
        } catch (error) {
            console.warn('⚠️ Sound effects initialization error:', error);
        }
    }

    initializeEventListeners() {
        console.log('%c🎮 Setting up event listeners', 'color: #00ff00; font-weight: bold;');
        
        // Start button handling
        const startButton = document.getElementById('start-button');
        console.log('Start button element:', startButton);
        
        if (startButton) {
            const startGameHandler = (e) => {
                e.preventDefault(); // Prevent double-firing on mobile
                console.log(`🎮 Start button ${e.type} event triggered`);
                this.startGame();
            };

            // Add both click and touch events for better mobile support
            startButton.addEventListener('click', startGameHandler);
            startButton.addEventListener('touchstart', startGameHandler);
            
            // Add hover effect for visual feedback
            startButton.addEventListener('mouseover', () => startButton.style.transform = 'scale(1.05)');
            startButton.addEventListener('mouseout', () => startButton.style.transform = 'scale(1)');
            
            console.log('✅ Start button event listeners attached');
        } else {
            console.error('❌ Start button not found in DOM!');
        }

        // Solution input handling
        const solutionInput = document.getElementById('solution-input');
        if (solutionInput) {
            solutionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('⌨️ Solution submitted:', e.target.value);
                    this.checkSolution(e.target.value);
                    e.target.value = '';
                }
            });
            
            solutionInput.addEventListener('keydown', () => {
                this.playSound('typing');
            });
            console.log('✅ Solution input event listeners attached');
        } else {
            console.error('❌ Solution input not found in DOM!');
        }
    }

    playSound(soundName) {
        try {
            const sound = this.soundEffects[soundName];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('Sound play prevented:', e));
            }
        } catch (error) {
            console.log('Sound effect error:', error);
        }
    }

    initializeParticles() {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#00ff00' },
                shape: { type: 'triangle' },
                opacity: {
                    value: 0.5,
                    random: true,
                    animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
                },
                size: {
                    value: 3,
                    random: true,
                    animation: { enable: true, speed: 4, minimumValue: 0.3, sync: false }
                },
                lineLinked: {
                    enable: true,
                    distance: 150,
                    color: '#00ff00',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    outMode: 'bounce'
                }
            },
            interactivity: {
                detectOn: 'canvas',
                events: {
                    onHover: { enable: true, mode: 'repulse' },
                    onClick: { enable: true, mode: 'push' },
                    resize: true
                }
            },
            retina_detect: true
        });
    }

    startGame() {
        // Clear any existing player name at the start
        if (!this.playerName) {
            localStorage.removeItem('playerName');
            this.showPlayerNameInput();
            return;
        }

        console.log('%c🎮 Starting Game', 'color: #00ff00; font-weight: bold;');
        this.isGameActive = true;
        const startScreen = document.getElementById('start-screen');
        
        if (startScreen) {
            startScreen.style.display = 'none';
            this.playSound('start');
            this.loadChallenge();
            this.timer.start(() => this.gameOver("Time's up! The nuclear launch couldn't be stopped."));
            
            // Add matrix rain effect
            this.startMatrixRain();
            console.log('✅ Game started successfully');
        } else {
            console.error('❌ Start screen not found!');
        }
    }

    showPlayerNameInput() {
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay active';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';

        overlay.innerHTML = `
            <div class="overlay-content" style="
                background-color: rgba(0, 20, 0, 0.95);
                padding: 2rem;
                border: 2px solid #0f0;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
                text-align: center;
                min-width: 300px;
                animation: glow 2s infinite alternate;
            ">
                <h2 class="cyber-title" style="
                    color: #0f0;
                    margin-bottom: 1.5rem;
                    font-family: 'Courier New', monospace;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
                ">System Access</h2>
                
                <div style="
                    font-size: 0.9em;
                    color: #0f0;
                    margin-bottom: 1.5rem;
                    opacity: 0.8;
                ">Enter your authorized operative codename to proceed</div>
                
                <input type="text" id="player-name-input" class="cyber-input" maxlength="50" placeholder="ENTER CODENAME" style="
                    width: 100%;
                    padding: 0.75rem;
                    background-color: rgba(0, 0, 0, 0.8);
                    border: 1px solid #0f0;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    text-align: center;
                    margin-bottom: 1rem;
                    outline: none;
                    transition: all 0.3s ease;
                " autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                
                <button id="submit-name" class="cyber-button" style="
                    width: 100%;
                    padding: 0.75rem;
                    background-color: #0f0;
                    color: #000;
                    border: none;
                    font-weight: bold;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                ">Begin Mission</button>
            </div>
        `;

        // Add the glowing animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow {
                0% {
                    box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
                }
                100% {
                    box-shadow: 0 0 30px rgba(0, 255, 0, 0.4);
                }
            }
            
            .cyber-input:focus {
                border-color: #00ff00;
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
            }
            
            .cyber-button:hover {
                background-color: #00ff00;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
                transform: translateY(-2px);
            }
            
            .cyber-button:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);

        const input = overlay.querySelector('#player-name-input');
        const button = overlay.querySelector('#submit-name');

        // Add input animations
        input.addEventListener('focus', () => {
            input.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', () => {
            input.style.transform = 'scale(1)';
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitPlayerName(input.value, overlay);
            }
        });

        button.addEventListener('click', () => {
            this.submitPlayerName(input.value, overlay);
        });

        // Focus input automatically
        input.focus();
    }

    submitPlayerName(name, overlay) {
        if (name.trim()) {
            // Show loading state
            const button = overlay.querySelector('#submit-name');
            const input = overlay.querySelector('#player-name-input');
            button.disabled = true;
            input.disabled = true;
            button.textContent = 'Verifying...';

            const formData = new FormData();
            formData.append('player_name', name.trim());

            fetch('check_player.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
            this.playerName = name.trim();
            localStorage.setItem('playerName', this.playerName);
                    
                    // Add success animation before removing overlay
                    const content = overlay.querySelector('.overlay-content');
                    content.style.border = '2px solid #0f0';
                    content.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
                    
                    setTimeout(() => {
            overlay.remove();
            this.startGame();
                    }, 500);
        } else {
                    // Show error message with animation
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.style.color = '#ff0000';
                    errorMsg.style.marginTop = '10px';
                    errorMsg.style.textAlign = 'center';
                    errorMsg.innerHTML = `
                        <div style="font-size: 1.2em; margin-bottom: 5px;">⚠️ Access Denied</div>
                        <div>${data.message || 'Unauthorized access. Please contact your administrator.'}</div>
                        <div style="font-size: 0.9em; margin-top: 5px; color: #ff6666;">
                            Only authorized operatives may access this system.
                        </div>
                    `;
                    
                    const existingError = overlay.querySelector('.error-message');
                    if (existingError) {
                        existingError.remove();
                    }
                    
                    overlay.querySelector('.overlay-content').appendChild(errorMsg);
                    
                    // Add error animation
                    input.style.borderColor = '#ff0000';
                    input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
                    
                    // Reset input state
                    button.disabled = false;
                    input.disabled = false;
                    button.textContent = 'Begin Mission';
                    
                    // Reset input style after delay
                    setTimeout(() => {
                        input.style.borderColor = '#0f0';
                        input.style.boxShadow = 'none';
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.style.color = '#ff0000';
                errorMsg.style.marginTop = '10px';
                errorMsg.style.textAlign = 'center';
                errorMsg.innerHTML = `
                    <div style="font-size: 1.2em; margin-bottom: 5px;">⚠️ System Error</div>
                    <div>Unable to verify credentials. Please try again.</div>
                `;
                
                const existingError = overlay.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                
                overlay.querySelector('.overlay-content').appendChild(errorMsg);
                
                // Reset button state
                button.disabled = false;
                input.disabled = false;
                button.textContent = 'Begin Mission';
            });
        } else {
            // Show error for empty input
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.color = '#ff0000';
            errorMsg.style.marginTop = '10px';
            errorMsg.style.textAlign = 'center';
            errorMsg.innerHTML = `
                <div>Please enter a valid codename</div>
            `;
            
            const existingError = overlay.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            overlay.querySelector('.overlay-content').appendChild(errorMsg);
        }
    }

    startMatrixRain() {
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-rain';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.1';
        document.body.appendChild(canvas);

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
    }

    loadChallenge() {
        console.log('Loading challenge:', this.currentLevel);
        const challenge = this.challenges.getChallenge(this.currentLevel);
        if (challenge) {
            document.getElementById('challenge-description').innerHTML = challenge.description;
            this.terminal.setCode(challenge.code);
            this.terminal.highlightSyntax();
            
            // Add glitch effect to the challenge description
            this.addGlitchEffect();
        } else {
            console.error('Challenge not found for level:', this.currentLevel);
        }
    }

    addGlitchEffect() {
        const description = document.getElementById('challenge-description');
        description.classList.add('glitch-text');
        setTimeout(() => description.classList.remove('glitch-text'), 1000);
    }

    checkSolution(userSolution) {
        console.log('Checking solution:', userSolution);
        const currentChallenge = this.challenges.getChallenge(this.currentLevel);
        
        if (this.challenges.validateSolution(this.currentLevel, userSolution)) {
            this.handleCorrectSolution();
        } else {
            this.handleWrongSolution();
        }
    }

    updateUI() {
        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }

        // Update level display
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.currentLevel;
        }
    }

    handleCorrectSolution() {
        console.log('Correct solution!');
        
        // Add base score multiplied by current level
        this.score += 100 * this.currentLevel;
        
        // Reset consecutive wrong answers
        this.consecutiveWrongAnswers = 0;
        this.playSound('correct');
        
        // Update score and level display
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        if (scoreElement) scoreElement.textContent = this.score;
        if (levelElement) levelElement.textContent = this.currentLevel;
        
        // Check if all challenges are completed
        if (this.currentLevel >= this.challenges.totalChallenges) {
            console.log('All challenges completed! Stopping timer...');
            this.timer.stop();
            this.isGameActive = false;
            this.handleGameCompletion();
            return;
        }
        
        // For non-final levels, add 20 seconds instead of 30
        this.timer.addTime(20);
        
        // Show success popup
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.style.opacity = '0';
        
        popup.innerHTML = `
            <div class="success-content">
                <h2 class="success-title">Challenge Complete!</h2>
                <div class="success-message">
                    <p>Excellent work, ${this.playerName}!</p>
                    <div class="success-stats">
                        <div>Score: +${100 * this.currentLevel}</div>
                        <div>Time Bonus: +20 seconds</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Increment level and load next challenge
        this.currentLevel++;
        this.loadChallenge();
        
        // Show popup with fade-in
        requestAnimationFrame(() => {
            popup.style.opacity = '1';
        });
        
        // Remove popup after delay
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 1500);
    }

    handleWrongSolution() {
        console.log('Wrong solution!');
        
        // Increment attempts for current level
        this.attemptsByLevel[this.currentLevel] = (this.attemptsByLevel[this.currentLevel] || 0) + 1;
        
        this.consecutiveWrongAnswers++;
        const penalty = Math.pow(2, this.consecutiveWrongAnswers - 1) * 2;
        this.timer.subtractTime(penalty);
        this.playSound('wrong');
        
        // Visual feedback
        this.terminal.shake();
        this.updateUI();

        // Check if this is the final level - make it critical
        if (this.currentLevel === this.challenges.totalChallenges) {
            this.gameOver("Critical system failure! The nuclear launch couldn't be stopped.");
            return;
        }

        if (this.attemptsByLevel[this.currentLevel] >= 3) {
            // Show skip message
            const skipMessage = document.createElement('div');
            skipMessage.className = 'skip-message';
            skipMessage.style.position = 'fixed';
            skipMessage.style.top = '50%';
            skipMessage.style.left = '50%';
            skipMessage.style.transform = 'translate(-50%, -50%)';
            skipMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
            skipMessage.style.padding = '20px';
            skipMessage.style.borderRadius = '8px';
            skipMessage.style.color = '#fff';
            skipMessage.style.textAlign = 'center';
            skipMessage.style.zIndex = '1000';
            skipMessage.style.border = '2px solid #ff0000';
            skipMessage.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
            skipMessage.innerHTML = `
                <h3 style="margin: 0 0 10px 0;">Challenge Failed</h3>
                <p style="margin: 0 0 15px 0;">Moving to next challenge...</p>
                <div style="font-size: 0.9em; opacity: 0.8;">Maximum attempts reached</div>
            `;
            document.body.appendChild(skipMessage);

            // Play warning sound
            this.playSound('warning');

            // Remove the message and advance to next level after delay
            setTimeout(() => {
                skipMessage.remove();
                this.currentLevel++;
                
                // Check if game is complete
                if (this.currentLevel > this.challenges.totalChallenges) {
                    this.handleGameCompletion();
                    return;
                }
                
                // Reset attempts for new level
                this.consecutiveWrongAnswers = 0;
                this.loadChallenge();
            }, 2000);
            
            return;
        }
        
        // Show attempt count message
        const attemptsLeft = 3 - this.attemptsByLevel[this.currentLevel];
        const attemptsMessage = `Attempt ${this.attemptsByLevel[this.currentLevel]} - ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} remaining`;
        this.showMessage(attemptsMessage, 'warning');
        
        if (this.consecutiveWrongAnswers >= 3) {
            this.playSound('warning');
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'game-message ' + type;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.color = type === 'warning' ? '#ff0000' : '#00ff00';
        messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        messageDiv.style.border = `1px solid ${type === 'warning' ? '#ff0000' : '#00ff00'}`;
        messageDiv.style.zIndex = '1000';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.fontFamily = 'Courier New, monospace';
        messageDiv.style.animation = 'fadeInOut 2s forwards';
        messageDiv.textContent = message;

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -20px); }
                10% { opacity: 1; transform: translate(-50%, 0); }
                90% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 2000);
    }

    showSuccessPopup() {
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        
        const challenge = this.challenges.getChallenge(this.currentLevel);
        
        popup.innerHTML = `
            <div class="success-content">
                <h2 class="success-title">Challenge Complete!</h2>
                <div class="success-message">
                    <p>Excellent work, ${this.playerName}!</p>
                    <p class="explanation">${challenge.explanation}</p>
                    <div class="success-stats">
                        <div>Score: +${100 * this.currentLevel}</div>
                        <div>Time Bonus: +20 seconds</div>
                    </div>
                </div>
                ${this.currentLevel < this.challenges.totalChallenges ? 
                    '<p class="next-hint">Next challenge loading...</p>' :
                    '<p class="next-hint">Preparing final results...</p>'}
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add fade-in effect
        requestAnimationFrame(() => {
            popup.style.opacity = '1';
        });
        
        // Remove popup after animation
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 2500);
    }

    handleGameCompletion() {
        console.log('Handling game completion...');
        
        // Double-check timer is stopped
        if (this.timer) {
            this.timer.stop();
        }
        
        // Save score first (for both victory and defeat)
        this.saveScoreAndShowVictory();
    }

    saveScoreAndShowVictory() {
        console.log('Saving score and showing victory screen...');
        
        const formData = new FormData();
        formData.append('action', 'save');
        formData.append('player_name', this.playerName);
        formData.append('score', this.score);
        formData.append('completion_time', this.timer.getTimeString());
        formData.append('levels_completed', this.currentLevel);
        formData.append('outcome', 'victory');

        fetch('leaderboard_handler.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Score saved:', data);
            this.showVictoryPage();
        })
        .catch(error => {
            console.error('Error saving score:', error);
            this.showVictoryPage();
        });
    }

    showVictoryPage() {
        // Remove any existing overlays
        const existingOverlays = document.querySelectorAll('.game-over-overlay, .leaderboard-overlay, .victory-overlay');
        existingOverlays.forEach(overlay => overlay.remove());

        const overlay = document.createElement('div');
        overlay.className = 'victory-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10000';
        
        const timeRemaining = this.timer.getTimeString();
        
        overlay.innerHTML = `
            <div class="victory-content" style="
                background-color: rgba(0, 40, 0, 0.95);
                padding: 2rem;
                border-radius: 8px;
                border: 3px solid #0f0;
                box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
                text-align: center;
                max-width: 800px;
                width: 90%;
                animation: pulse-green 2s infinite alternate;
            ">
                <h1 style="
                    color: #0f0;
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
                ">MISSION ACCOMPLISHED</h1>
                
                <div style="
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(to right, transparent, #0f0, transparent);
                    margin: 1.5rem 0;
                "></div>
                
                <div style="
                    color: #0f0;
                    font-size: 1.2rem;
                    margin-bottom: 2rem;
                ">Nuclear launch sequence successfully terminated</div>
                
                <div style="
                    background-color: rgba(0, 0, 0, 0.5);
                    padding: 1.5rem;
                    border-radius: 5px;
                    border: 1px solid #0f0;
                    margin-bottom: 2rem;
                    text-align: left;
                ">
                    <div style="margin-bottom: 0.5rem; color: #0f0;">
                        <span style="display: inline-block; width: 180px; color: rgba(0, 255, 0, 0.7);">OPERATIVE:</span> 
                        <span style="color: #fff;">${this.playerName}</span>
                    </div>
                    <div style="margin-bottom: 0.5rem; color: #0f0;">
                        <span style="display: inline-block; width: 180px; color: rgba(0, 255, 0, 0.7);">SCORE:</span> 
                        <span style="color: #fff;">${this.score}</span>
                    </div>
                    <div style="margin-bottom: 0.5rem; color: #0f0;">
                        <span style="display: inline-block; width: 180px; color: rgba(0, 255, 0, 0.7);">TIME REMAINING:</span> 
                        <span style="color: #fff;">${timeRemaining}</span>
                    </div>
                    <div style="color: #0f0;">
                        <span style="display: inline-block; width: 180px; color: rgba(0, 255, 0, 0.7);">CHALLENGES COMPLETED:</span> 
                        <span style="color: #fff;">${this.currentLevel}/${this.challenges.totalChallenges}</span>
                    </div>
                </div>
            </div>
        `;

        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse-green {
                0% {
                    box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
                }
                100% {
                    box-shadow: 0 0 40px rgba(0, 255, 0, 0.8);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);
    }

    gameOver(message) {
        console.log('Game Over:', message);
        this.isGameActive = false;
        this.timer.stop();
        
        // Play dramatic sound effects
        this.playSound('gameOver');
        
        // Save score first
        this.saveScoreAndShowDefeatPage(message);
    }

    saveScoreAndShowDefeatPage(message) {
        const formData = new FormData();
        formData.append('action', 'save');
        formData.append('player_name', this.playerName);
        formData.append('score', this.score);
        formData.append('completion_time', this.timer.getTimeString());
        formData.append('levels_completed', this.currentLevel);
        formData.append('outcome', 'defeat');

        fetch('leaderboard_handler.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Score saved:', data);
            this.showDefeatPage(message);
        })
        .catch(error => {
            console.error('Error saving score:', error);
            this.showDefeatPage(message);
        });
    }

    showDefeatPage(message) {
        // Remove any existing overlays
        const existingOverlays = document.querySelectorAll('.game-over-overlay, .leaderboard-overlay, .victory-overlay');
        existingOverlays.forEach(overlay => overlay.remove());

        const overlay = document.createElement('div');
        overlay.className = 'defeat-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10000';

        // Create warning flash animation
        document.body.classList.add('nuclear-warning');

        overlay.innerHTML = `
            <div class="defeat-content" style="
                background-color: rgba(40, 0, 0, 0.95);
                padding: 2rem;
                border-radius: 8px;
                border: 3px solid #f00;
                box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
                text-align: center;
                max-width: 800px;
                width: 90%;
                animation: pulse-red 2s infinite alternate;
            ">
                <h1 style="
                    color: #f00;
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
                ">MISSION FAILED</h1>
                
                <div style="
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(to right, transparent, #f00, transparent);
                    margin: 1.5rem 0;
                "></div>
                
                <div style="
                    color: #f00;
                    font-size: 1.2rem;
                    margin-bottom: 2rem;
                ">${message}</div>
                
                <div style="
                    background-color: rgba(0, 0, 0, 0.5);
                    padding: 1.5rem;
                    border-radius: 5px;
                    border: 1px solid #f00;
                    margin-bottom: 2rem;
                    text-align: left;
                ">
                    <div style="margin-bottom: 0.5rem; color: #f00;">
                        <span style="display: inline-block; width: 180px; color: rgba(255, 0, 0, 0.7);">OPERATIVE:</span> 
                        <span style="color: #fff;">${this.playerName}</span>
                </div>
                    <div style="margin-bottom: 0.5rem; color: #f00;">
                        <span style="display: inline-block; width: 180px; color: rgba(255, 0, 0, 0.7);">SCORE:</span> 
                        <span style="color: #fff;">${this.score}</span>
                    </div>
                    <div style="margin-bottom: 0.5rem; color: #f00;">
                        <span style="display: inline-block; width: 180px; color: rgba(255, 0, 0, 0.7);">TIME REMAINING:</span> 
                        <span style="color: #fff;">${this.timer.getTimeString()}</span>
                    </div>
                    <div style="color: #f00;">
                        <span style="display: inline-block; width: 180px; color: rgba(255, 0, 0, 0.7);">CHALLENGES COMPLETED:</span> 
                        <span style="color: #fff;">${this.currentLevel - 1}/${this.challenges.totalChallenges}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse-red {
                0% {
                    box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
                }
                100% {
                    box-shadow: 0 0 40px rgba(255, 0, 0, 0.8);
                }
            }
            
            @keyframes nuclear-warning-flash {
                0%, 100% {
                    background-color: rgba(0, 0, 0, 0.9);
                }
                50% {
                    background-color: rgba(255, 0, 0, 0.2);
                }
            }
            
            .nuclear-warning {
                animation: nuclear-warning-flash 2s infinite;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);

        // Add warning sound effect
        const warningSound = new Audio('assets/sounds/warning.mp3');
        warningSound.loop = true;
        warningSound.volume = 0.3;
        warningSound.play().catch(e => console.log('Sound play prevented:', e));
        
        // Stop warning sound after 5 seconds
        setTimeout(() => {
            warningSound.pause();
            warningSound.currentTime = 0;
        }, 5000);
    }

    displayLeaderboard() {
        // Disable this function
        return;
    }
}

// Export Game class to window object
try {
    window.Game = Game;
    console.log('✅ Game class exported successfully');
} catch (error) {
    console.error('❌ Failed to export Game class:', error);
    throw error;
}

// Add error handling for script loading
window.addEventListener('error', (event) => {
    console.error('❌ Script Error:', event.message);
    console.error('In file:', event.filename);
    console.error('At line:', event.lineno);
});