// Super Calculator - Complete Scientific Calculator

class SuperCalculator {
    constructor() {
        this.currentDisplay = '0';
        this.previousValue = null;
        currentOperator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = [];
        this.currentMode = 'basic';
        this.currentBase = 'dec';
        this.expression = '';
        
        this.init();
    }
    
    init() {
        this.loadHistory();
        this.attachEventListeners();
        this.updateDisplay();
        this.setupServiceWorker();
    }
    
    attachEventListeners() {
        // Number buttons
        document.querySelectorAll('.number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = btn.dataset.num;
                this.inputDigit(num);
            });
        });
        
        // Operator buttons
        document.querySelectorAll('.operator').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const op = btn.dataset.op;
                this.inputOperator(op);
            });
        });
        
        // Function buttons
        document.querySelectorAll('.function').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleFunction(action);
            });
        });
        
        // Scientific functions
        document.querySelectorAll('.sci-func').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sciFunc = btn.dataset.sci;
                this.handleScientific(sciFunc);
            });
        });
        
        // Programmer functions
        document.querySelectorAll('.prog-func').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const progFunc = btn.dataset.prog;
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
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.base-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentBase = btn.dataset.base;
                this.updateProgrammerDisplay();
            });
        });
        
        // Bit buttons
        document.querySelectorAll('.bit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bit = parseInt(btn.dataset.bit);
                this.toggleBit(bit);
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentDisplay = digit;
            this.waitingForOperand = false;
        } else {
            this.currentDisplay = this.currentDisplay === '0' ? digit : this.currentDisplay + digit;
        }
        this.updateDisplay();
    }
    
    inputOperator(op) {
        const currentValue = parseFloat(this.currentDisplay);
        
        if (this.previousValue !== null && !this.waitingForOperand) {
            this.calculate();
        }
        
        this.previousValue = currentValue;
        this.currentOperator = op;
        this.waitingForOperand = true;
        this.updateHistoryDisplay();
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
                result = currentValue !== 0 ? this.previousValue / currentValue : 'Error';
                break;
            default:
                return;
        }
        
        if (result === 'Error') {
            this.currentDisplay = 'Error';
            this.clearCalculator();
        } else {
            const expression = `${this.formatNumber(this.previousValue)} ${this.getOperatorSymbol(this.currentOperator)} ${this.formatNumber(currentValue)}`;
            this.currentDisplay = String(result);
            this.addToHistory(expression, result);
            this.previousValue = null;
            this.currentOperator = null;
            this.waitingForOperand = true;
        }
        
        this.updateDisplay();
    }
    
    handleFunction(action) {
        switch (action) {
            case 'clear':
                this.clearCalculator();
                break;
            case 'negate':
                this.currentDisplay = String(-parseFloat(this.currentDisplay));
                break;
            case 'percent':
                this.currentDisplay = String(parseFloat(this.currentDisplay) / 100);
                break;
            case 'backspace':
                this.currentDisplay = this.currentDisplay.length > 1 ? 
                    this.currentDisplay.slice(0, -1) : '0';
                break;
            case 'equals':
                if (this.previousValue !== null && this.currentOperator !== null) {
                    this.calculate();
                }
                break;
            case 'openParen':
                this.expression += '(';
                this.updateHistoryDisplay();
                break;
            case 'closeParen':
                this.expression += ')';
                this.updateHistoryDisplay();
                break;
        }
        this.updateDisplay();
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
                result = Math.log(value);
                expression = `ln(${value})`;
                break;
            case 'log':
                result = Math.log10(value);
                expression = `log(${value})`;
                break;
            case 'sqrt':
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
                this.waitingForOperand = true;
                this.previousValue = value;
                this.currentOperator = 'pow';
                return;
            case 'fact':
                result = this.factorial(value);
                expression = `${value}!`;
                break;
            case 'recip':
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
        }
    }
    
    handleProgrammer(func) {
        let value = this.getCurrentProgrammerValue();
        
        switch (func) {
            case 'and':
                this.waitingForOperand = true;
                this.previousValue = value;
                this.currentOperator = 'and';
                break;
            case 'or':
                this.waitingForOperand = true;
                this.previousValue = value;
                this.currentOperator = 'or';
                break;
            case 'xor':
                this.waitingForOperand = true;
                this.previousValue = value;
                this.currentOperator = 'xor';
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
        
        this.updateProgrammerDisplay();
    }
    
    getCurrentProgrammerValue() {
        const display = document.getElementById('programmerValue');
        const text = display.textContent;
        
        switch (this.currentBase) {
            case 'hex':
                return parseInt(text, 16);
            case 'bin':
                return parseInt(text, 2);
            case 'oct':
                return parseInt(text, 8);
            default:
                return parseFloat(text);
        }
    }
    
    setProgrammerValue(value) {
        const display = document.getElementById('programmerValue');
        value = Math.floor(value) & 0xFFFFFFFF; // 32-bit unsigned
        
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
    }
    
    updateProgrammerDisplay() {
        const value = this.getCurrentProgrammerValue();
        this.setProgrammerValue(value);
    }
    
    toggleBit(bit) {
        let value = this.getCurrentProgrammerValue();
        value ^= (1 << bit);
        this.setProgrammerValue(value);
        this.updateProgrammerDisplay();
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
    }
    
    clearCalculator() {
        this.currentDisplay = '0';
        this.previousValue = null;
        this.currentOperator = null;
        this.waitingForOperand = false;
        this.expression = '';
        this.updateDisplay();
        this.updateHistoryDisplay();
    }
    
    addToHistory(expression, result) {
        this.history.unshift({
            expression,
            result,
            timestamp: new Date()
        });
        
        // Keep only last 50 items
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
            <div class="history-item" data-expression="${item.expression}" data-result="${item.result}">
                <div class="history-expression">${item.expression} =</div>
                <div class="history-result">${this.formatNumber(item.result)}</div>
            </div>
        `).join('');
        
        // Add click handlers to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const result = item.dataset.result;
                this.currentDisplay = result;
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
    }
    
    updateDisplay() {
        document.getElementById('mainDisplay').textContent = this.formatNumber(this.currentDisplay);
    }
    
    updateHistoryDisplay() {
        const historyDiv = document.getElementById('historyDisplay');
        if (this.previousValue !== null && this.currentOperator) {
            historyDiv.textContent = `${this.formatNumber(this.previousValue)} ${this.getOperatorSymbol(this.currentOperator)}`;
        } else {
            historyDiv.textContent = this.expression;
        }
    }
    
    formatNumber(num) {
        if (typeof num === 'string' && num === 'Error') return 'Error';
        const n = parseFloat(num);
        if (isNaN(n)) return '0';
        
        // Format to avoid scientific notation for most numbers
        if (Math.abs(n) > 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
            return n.toExponential(8);
        }
        
        // Round to reasonable decimal places
        return parseFloat(n.toFixed(10)).toString();
    }
    
    getOperatorSymbol(op) {
        const symbols = {
            add: '+',
            subtract: '-',
            multiply: '×',
            divide: '÷',
            pow: '^'
        };
        return symbols[op] || op;
    }
    
    showMemoryIndicator() {
        const indicator = document.getElementById('memoryIndicator');
        indicator.textContent = 'M';
        setTimeout(() => {
            indicator.textContent = '';
        }, 2000);
    }
    
    hideMemoryIndicator() {
        document.getElementById('memoryIndicator').textContent = '';
    }
    
    handleKeyboard(e) {
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            this.inputDigit(key);
        } else if (key === '.') {
            this.inputDigit('.');
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            let op;
            if (key === '+') op = 'add';
            else if (key === '-') op = 'subtract';
            else if (key === '*') op = 'multiply';
            else if (key === '/') op = 'divide';
            this.inputOperator(op);
        } else if (key === 'Enter' || key === '=') {
            this.handleFunction('equals');
        } else if (key === 'Escape') {
            this.handleFunction('clear');
        } else if (key === 'Backspace') {
            this.handleFunction('backspace');
        } else if (key === '%') {
            this.handleFunction('percent');
        }
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
        }
    }
}

// Initialize the calculator
const calculator = new SuperCalculator();