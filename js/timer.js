class Timer {
    constructor(totalSeconds) {
        try {
            this.totalSeconds = totalSeconds;
            this.currentSeconds = totalSeconds;
            this.timerId = null;
            this.onTimeUpCallback = null;
            this.isStopped = false;
            
            this.minutesElement = document.getElementById('minutes');
            this.secondsElement = document.getElementById('seconds');
            
            if (!this.minutesElement || !this.secondsElement) {
                throw new Error('Timer display elements not found');
            }
            
            console.log('✅ Timer initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize timer:', error);
            throw error;
        }
    }

    start(onTimeUpCallback) {
        this.isStopped = false;
        this.onTimeUpCallback = onTimeUpCallback;
        this.timerId = setInterval(() => this.tick(), 1000);
        this.updateDisplay();
    }

    stop() {
        console.log('Stopping timer...');
        this.isStopped = true;
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.updateDisplay();
    }

    tick() {
        if (this.isStopped) return;
        
        this.currentSeconds--;
        this.updateDisplay();

        // Check if timer reached zero
        if (this.currentSeconds <= 0) {
            this.currentSeconds = 0;
            this.stop();
            if (this.onTimeUpCallback) {
                this.onTimeUpCallback();
            }
        }
    }

    addTime(seconds) {
        this.currentSeconds = Math.min(this.totalSeconds, this.currentSeconds + seconds);
        this.updateDisplay();
    }

    subtractTime(seconds) {
        this.currentSeconds = Math.max(0, this.currentSeconds - seconds);
        this.updateDisplay();
        
        // Check if timer reached zero after subtraction
        if (this.currentSeconds <= 0) {
            this.currentSeconds = 0; // Ensure we don't go below zero
            this.updateDisplay(); // Update to show 00:00
            this.stop();
            if (this.onTimeUpCallback) {
                this.onTimeUpCallback();
            }
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentSeconds / 60);
        const seconds = this.currentSeconds % 60;
        
        // Always show two digits with leading zeros
        this.minutesElement.textContent = String(minutes).padStart(2, '0');
        this.secondsElement.textContent = String(seconds).padStart(2, '0');
        
        // Visual feedback for low time
        if (this.currentSeconds <= 30) {
            document.querySelector('.timer').classList.add('critical');
            // Add blinking effect for last 10 seconds
            if (this.currentSeconds <= 10) {
                document.querySelector('.timer').classList.add('blink');
            }
        } else {
            document.querySelector('.timer').classList.remove('critical', 'blink');
        }
    }

    getTimeString() {
        const minutes = Math.floor(this.currentSeconds / 60);
        const seconds = this.currentSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Export Timer class to window object
try {
    window.Timer = Timer;
    console.log('✅ Timer class exported successfully');
} catch (error) {
    console.error('❌ Failed to export Timer class:', error);
    throw error;
} 