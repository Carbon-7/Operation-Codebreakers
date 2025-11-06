class Terminal {
    constructor() {
        try {
            this.codeEditor = document.getElementById('code-editor');
            if (!this.codeEditor) {
                throw new Error('Code editor element not found');
            }
            console.log('✅ Terminal initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize terminal:', error);
            throw error;
        }
    }

    setCode(code) {
        if (typeof code === 'string') {
            this.codeEditor.textContent = code;
            this.highlightSyntax();
        }
    }

    getCode() {
        return this.codeEditor.textContent;
    }

    highlightSyntax() {
        const code = this.getCode();
        const highlighted = this.applyHighlighting(code);
        this.codeEditor.innerHTML = highlighted;
    }

    applyHighlighting(code) {
        // Escape HTML to prevent XSS
        code = code.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');

        // Define C keywords
        const keywords = ['int', 'void', 'char', 'return', 'if', 'else', 'for', 'while', 
                         'struct', 'unsigned', 'printf', 'sizeof', 'strlen', 'double', 'case',
                         'switch', 'default', 'NULL'];
        
        // Create regex for whole word matches only
        const keywordRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
        
        // Apply syntax highlighting in specific order
        return code
            // Comments
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            // Strings
            .replace(/("(?:\\.|[^"\\])*")/g, '<span class="string">$1</span>')
            // Keywords
            .replace(keywordRegex, '<span class="keyword">$1</span>')
            // Numbers (including hex)
            .replace(/\b(0x[0-9A-Fa-f]+|\d+)\b/g, '<span class="number">$1</span>')
            // Function calls
            .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="function">$1</span>(')
            // Preprocessor directives
            .replace(/(#\w+)\b/g, '<span class="preprocessor">$1</span>');
    }

    shake() {
        this.codeEditor.classList.add('shake');
        setTimeout(() => {
            this.codeEditor.classList.remove('shake');
        }, 500);
    }

    // Add shake animation and syntax highlighting styles
    static injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            .shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                background: rgba(255, 0, 0, 0.1) !important;
            }

            .keyword { color: #569cd6; }
            .string { color: #ce9178; }
            .number { color: #b5cea8; }
            .comment { color: #6a9955; }
            .function { color: #dcdcaa; }
            .preprocessor { color: #c586c0; }
        `;
        document.head.appendChild(style);
    }
}

// Export Terminal class to window object
try {
    window.Terminal = Terminal;
    console.log('✅ Terminal class exported successfully');
} catch (error) {
    console.error('❌ Failed to export Terminal class:', error);
    throw error;
}

// Inject shake animation styles when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        Terminal.injectStyles();
        console.log('✅ Terminal styles injected successfully');
    } catch (error) {
        console.error('❌ Failed to inject terminal styles:', error);
    }
}); 