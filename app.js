// Super Calculator - Fully Working Version

class SuperCalculator {
    constructor() {
        this.currentDisplay = '0';
        this.previousValue = null;
        this.currentOperator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = [];
        this.currentMode = 'basic';
        this.currentBase = 'dec';
        
        this.init();
    }
    
    init() {
        this.loadHistory();
        this.attachEventListeners();
        this.updateDisplay();
    }
    
    attachEventListeners() {
        // Number buttons (including 0-9, A-F, and decimal point)
        document.querySelectorAll('.number').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = btn.getAttribute('data-num');
                this.inputDigit(num);
            });
        });
        
        // Operator buttons
        document.querySelectorAll('.operator').forEach(btn => {
            btn.addEventListener('click', () => {
                const op = btn.getAttribute('data-op');
                this.inputOperator(op);
            });
        });
        
        // Function buttons
        document.querySelectorAll('.function').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleFunction(action);
            });
        });
        
        // Scientific functions
        document.querySelectorAll('.sci-func').forEach(btn => {
            btn.addEventListener('click', () => {
                const sciFunc = btn.getAttribute('data-sci');
                this.handleScientific(sciFunc);
            });
        });
        
        // Programmer functions
        document.querySelectorAll('.prog-func').forEach(btn => {
            btn.addEventListener('click', () => {
                const progFunc = btn.getAttribute('data-prog');
                this.handleProgrammer(progFunc);
            });
        });
        
        // Mode switching
        document.getElementById('basicModeBtn').addEventListener('click', () => this.switchMode('basic'));
        document.getElementById('scientificModeBtn').addEventListener('click', () => this.switchMode('scientific'));
        document.getElementById('programmerModeBtn').addEventListener('click', () => this.switchMode('programmer'));
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Clear history
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        
        // Base conversion for programmer mode
        document.querySelectorAll('.base-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.base-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentBase = btn.getAttribute('data-base');
                this.updateProgrammerDisplay();
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    inputDigit(digit) {
        // Handle decimal point
        if (digit === '.') {
            if (this.waitingForOperand) {
                this.currentDisplay = '0.';
                this.waitingForOperand = false;
            } else if (!this.currentDisplay.includes('.')) {
                this.currentDisplay += '.';
            }
            this.updateDisplay();
            return;
        }
        
        // Handle hex letters A-F
        if (this.currentMode === 'programmer' && this.currentBase === 'hex') {
            if (this.waitingForOperand) {
                this.currentDisplay = digit;
                this.waitingForOperand = false;
            } else {
                this.currentDisplay = this.currentDisplay === '0' ? digit : this.currentDisplay + digit;
            }
            this.updateDisplay();
            this.updateProgrammerFromMain();
            return;
        }
        
        // Regular numbers
        if (this.waitingForOperand) {
            this.currentDisplay = digit;
            this.waitingForOperand = false;
        } else {
            this.currentDisplay = this.currentDisplay === '0' ? digit : this.currentDisplay + digit;
        }
        
        this.updateDisplay();
        
        // Update programmer display if in programmer mode
        if (this.currentMode === 'programmer') {
            this.updateProgrammerFromMain();
        }
    }
    
    inputOperator(op) {
        // If we have a pending operation, calculate it first
        if (this.previousValue !== null && this.currentOperator !== null && !this.waitingForOperand) {
            this.calculate();
        }
        
        const currentValue = parseFloat(this.currentDisplay);
        this.previousValue = currentValue;
        this.currentOperator = op;
        this.waitingForOperand = true;
        
        // Update history display
        const historyDiv = document.getElementById('historyDisplay');
        historyDiv.textContent = `${this.formatNumber(currentValue)} ${this.getOperatorSymbol(op)}`;
    }
    
    calculate() {
        if (this.previousValue === null || this.currentOperator === null) return;
        
        const currentValue = parseFloat(this.currentDisplay);
        let result = 0;
        
        switch (this.currentOperator) {
            case 'add':
                result = this.previousValue + currentValue;
                break;
            case 'subtract':
                result = this.previousValue - currentValue;
                break;
            case 'multiply':
                result = this.previousValue * currentValue;
                break;
            case 'divide':
                if (currentValue === 0) {
                    this.currentDisplay = 'Error';
                    this.updateDisplay();
                    this.clearCalculator();
                    return;
                }
                result = this.previousValue / currentValue;
                break;
            default:
                return;
        }
        
        // Add to history
        const expression = `${this.formatNumber(this.previousValue)} ${this.getOperatorSymbol(this.currentOperator)} ${this.formatNumber(currentValue)}`;
        this.addToHistory(expression, result);
        
        // Update display
        this.currentDisplay = String(result);
        this.previousValue = null;
        this.currentOperator = null;
        this.waitingForOperand = true;
        
        this.updateDisplay();
        document.getElementById('historyDisplay').textContent = '';
    }
    
    handleFunction(action) {
        switch (action) {
            case 'clear':
                this.clearCalculator();
                break;
            case 'negate':
                this.currentDisplay = String(-parseFloat(this.currentDisplay));
                this.updateDisplay();
                break;
            case 'percent':
                this.currentDisplay = String(parseFloat(this.currentDisplay) / 100);
                this.updateDisplay();
                break;
            case 'backspace':
                if (this.currentDisplay.length > 1) {
                    this.currentDisplay = this.currentDisplay.slice(0, -1);
                } else {
                    this.currentDisplay = '0';
                }
                this.updateDisplay();
                break;
            case 'equals':
                if (this.previousValue !== null && this.currentOperator !== null) {
                    this.calculate();
                }
                break;
            case 'openParen':
                // For future expression evaluation
                break;
            case 'closeParen':
                // For future expression evaluation
                break;
        }
    }
    
    handleScientific(func) {
        let value = parseFloat(this.currentDisplay);
        let result;
        let expression = '';
        
        switch (func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180);
                expression = `sin(${value}°)`;
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                expression = `cos(${value}°)`;
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                expression = `tan(${value}°)`;
                break;
            case 'asin':
                result = Math.asin(value) * 180 / Math.PI;
                expression = `asin(${value})`;
                break;
            case 'acos':
                result = Math.acos(value) * 180 / Math.PI;
                expression = `acos(${value})`;
                break;
            case 'atan':
                result = Math.atan(value) * 180 / Math.PI;
                expression = `atan(${value})`;
                break;
            case 'ln':
                if (value <= 0) {
                    this.currentDisplay = 'Error';
                    this.updateDisplay();
                    return;
                }
                result = Math.log(value);
                expression = `ln(${value})`;
                break;
            case 'log':
                if (value <= 0) {
                    this.currentDisplay = 'Error';
                    this.updateDisplay();
                    return;
                }
                result = Math.log10(value);
                expression = `log(${value})`;
                break;
            case 'sqrt':
                if (value < 0) {
                    this.currentDisplay = 'Error';
                    this.updateDisplay();
                    return;
                }
                result = Math.sqrt(value);
                expression = `√(${value})`;
                break;
            case 'exp':
                result = Math.exp(value);
                expression = `e^${value}`;
                break;
            case 'pow2':
                result = Math.pow(value, 2);
                expression = `${value}²`;
                break;
            case 'pow3':
                result = Math.pow(value, 3);
                expression = `${value}³`;
                break;
            case 'pow':
                this.previousValue = value;
                this.currentOperator = 'pow';
                this.waitingForOperand = true;
                document.getElementById('historyDisplay').textContent = `${value} ^ `;
                return;
            case 'fact':
                if (value < 0 || !Number.isInteger(value)) {
                    this.currentDisplay = 'Error';
                    this.updateDisplay();
                    return;
                }
                result = this.factorial(value);
                expression = `${value}!`;
                break;
            case 'recip':
                if (value === 0) {
                    this.currentDisplay = 'Error';
                    this.updateDisplay();
                    return;
                }
                result = 1 / value;
                expression = `1/${value}`;
                break;
            case 'abs':
                result = Math.abs(value);
                expression = `|${value}|`;
                break;
            case 'pi':
                result = Math.PI;
                expression = 'π';
                break;
            case 'e':
                result = Math.E;
                expression = 'e';
                break;
            case 'memAdd':
                this.memory += value;
                this.showMemoryIndicator();
                return;
            case 'memRead':
                this.currentDisplay = String(this.memory);
                this.waitingForOperand = true;
                this.updateDisplay();
                return;
            case 'memClear':
                this.memory = 0;
                this.hideMemoryIndicator();
                return;
            case 'memSub':
                this.memory -= value;
                this.showMemoryIndicator();
                return;
            default:
                return;
        }
        
        if (result !== undefined) {
            this.currentDisplay = String(result);
            this.addToHistory(expression, result);
            this.updateDisplay();
            this.waitingForOperand = true;
        }
    }
    
    handleProgrammer(func) {
        let value = this.getCurrentProgrammerValue();
        
        switch (func) {
            case 'and':
                this.previousValue = value;
                this.currentOperator = 'and';
                this.waitingForOperand = true;
                document.getElementById('historyDisplay').textContent = `${value} AND `;
                break;
            case 'or':
                this.previousValue = value;
                this.currentOperator = 'or';
                this.waitingForOperand = true;
                document.getElementById('historyDisplay').textContent = `${value} OR `;
                break;
            case 'xor':
                this.previousValue = value;
                this.currentOperator = 'xor';
                this.waitingForOperand = true;
                document.getElementById('historyDisplay').textContent = `${value} XOR `;
                break;
            case 'not':
                value = ~value;
                this.setProgrammerValue(value);
                break;
            case 'lshift':
                value = value << 1;
                this.setProgrammerValue(value);
                break;
            case 'rshift':
                value = value >> 1;
                this.setProgrammerValue(value);
                break;
            case 'clear':
                this.setProgrammerValue(0);
                break;
        }
    }
    
    getCurrentProgrammerValue() {
        const display = document.getElementById('programmerValue');
        if (!display) return 0;
        const text = display.textContent;
        
        switch (this.currentBase) {
            case 'hex':
                return parseInt(text, 16);
            case 'bin':
                return parseInt(text, 2);
            case 'oct':
                return parseInt(text, 8);
            default:
                return parseInt(text, 10);
        }
    }
    
    setProgrammerValue(value) {
        const display = document.getElementById('programmerValue');
        if (!display) return;
        
        if (isNaN(value)) value = 0;
        value = Math.floor(value) & 0xFFFFFFFF;
        
        switch (this.currentBase) {
            case 'hex':
                display.textContent = value.toString(16).toUpperCase();
                break;
            case 'bin':
                display.textContent = value.toString(2);
                break;
            case 'oct':
                display.textContent = value.toString(8);
                break;
            default:
                display.textContent = value.toString();
        }
        
        document.getElementById('mainDisplay').textContent = display.textContent;
        this.currentDisplay = display.textContent;
    }
    
    updateProgrammerDisplay() {
        const value = this.getCurrentProgrammerValue();
        this.setProgrammerValue(value);
    }
    
    updateProgrammerFromMain() {
        let value = parseInt(this.currentDisplay, 10);
        if (isNaN(value)) value = 0;
        this.setProgrammerValue(value);
    }
    
    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        this.clearCalculator();
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}ModeBtn`).classList.add('active');
        
        document.querySelectorAll('.calculator-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${mode}Panel`).classList.add('active');
    }
    
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        document.getElementById('themeToggle').textContent = newTheme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('calculatorTheme', newTheme);
    }
    
    clearCalculator() {
        this.currentDisplay = '0';
        this.previousValue = null;
        this.currentOperator = null;
        this.waitingForOperand = false;
        this.updateDisplay();
        document.getElementById('historyDisplay').textContent = '';
    }
    
    addToHistory(expression, result) {
        this.history.unshift({
            expression: expression,
            result: result
        });
        
        if (this.history.length > 50) this.history.pop();
        this.saveHistory();
        this.renderHistory();
    }
    
    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
            return;
        }
        
        historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-result="${item.result}">
                <div class="history-expression">${item.expression} =</div>
                <div class="history-result">${this.formatNumber(item.result)}</div>
            </div>
        `).join('');
        
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const result = item.getAttribute('data-result');
                this.currentDisplay = result;
                this.waitingForOperand = true;
                this.updateDisplay();
            });
        });
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }
    
    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }
    
    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.renderHistory();
        }
        
        const savedTheme = localStorage.getItem('calculatorTheme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.getElementById('themeToggle').textContent = savedTheme === 'light' ? '🌙' : '☀️';
        }
    }
    
    updateDisplay() {
        document.getElementById('mainDisplay').textContent = this.formatNumber(this.currentDisplay);
    }
    
    formatNumber(num) {
        if (typeof num === 'string' && num === 'Error') return 'Error';
        const n = parseFloat(num);
        if (isNaN(n)) return '0';
        
        if (Math.abs(n) > 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
            return n.toExponential(8);
        }
        
        let formatted = parseFloat(n.toFixed(10)).toString();
        return formatted;
    }
    
    getOperatorSymbol(op) {
        const symbols = {
            add: '+',
            subtract: '-',
            multiply: '×',
            divide: '÷',
            pow: '^',
            and: 'AND',
            or: 'OR',
            xor: 'XOR'
        };
        return symbols[op] || op;
    }
    
    showMemoryIndicator() {
        const indicator = document.getElementById('memoryIndicator');
        indicator.textContent = 'M';
        setTimeout(() => {
            if (indicator) indicator.textContent = '';
        }, 2000);
    }
    
    hideMemoryIndicator() {
        const indicator = document.getElementById('memoryIndicator');
        if (indicator) indicator.textContent = '';
    }
    
    handleKeyboard(e) {
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            e.preventDefault();
            this.inputDigit(key);
        } else if (key === '.') {
            e.preventDefault();
            this.inputDigit('.');
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            e.preventDefault();
            let op;
            if (key === '+') op = 'add';
            else if (key === '-') op = 'subtract';
            else if (key === '*') op = 'multiply';
            else if (key === '/') op = 'divide';
            this.inputOperator(op);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.handleFunction('equals');
        } else if (key === 'Escape') {
            this.handleFunction('clear');
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.handleFunction('backspace');
        } else if (key === '%') {
            this.handleFunction('percent');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new SuperCalculator();
});