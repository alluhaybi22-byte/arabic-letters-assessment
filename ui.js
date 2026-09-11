// ============================================
// المرحلة 6: الواجهة الرسومية المتقدمة
// ============================================

/**
 * فئة UIManager
 * إدارة الواجهة الرسومية بشكل متقدم
 */
class UIManager {
    constructor() {
        this.currentScreen = 'login';
        this.screens = {};
        this.components = {};
        this.animations = new AnimationEngine();
        this.theme = 'light';
        this.isInitialized = false;
    }

    /**
     * تهيئة UIManager
     */
    initialize() {
        this.registerScreens();
        this.registerComponents();
        this.setupEventListeners();
        this.applyTheme(this.theme);
        this.isInitialized = true;
        console.log('✅ تم تهيئة UIManager');
    }

    /**
     * تسجيل الشاشات
     */
    registerScreens() {
        this.screens = {
            login: new LoginScreen(),
            register: new RegisterScreen(),
            dashboard: new DashboardScreen(),
            test: new TestScreen(),
            results: new ResultsScreen(),
            history: new HistoryScreen(),
            profile: new ProfileScreen(),
            settings: new SettingsScreen()
        };
    }

    /**
     * تسجيل المكونات
     */
    registerComponents() {
        this.components = {
            header: new HeaderComponent(),
            navbar: new NavbarComponent(),
            progressBar: new ProgressBarComponent(),
            scoreBoard: new ScoreBoardComponent(),
            notification: new NotificationComponent(),
            modal: new ModalComponent(),
            tooltip: new TooltipComponent(),
            spinner: new SpinnerComponent()
        };
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderScreen(this.currentScreen);
        });

        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * عرض شاشة معينة
     * @param {string} screenName - اسم الشاشة
     */
    renderScreen(screenName) {
        if (!this.screens[screenName]) {
            console.error('❌ الشاشة غير موجودة:', screenName);
            return;
        }

        const newScreen = this.screens[screenName].render();
        document.getElementById('app-container').innerHTML = newScreen;
        this.currentScreen = screenName;
        this.screens[screenName].initialize();
    }

    /**
     * تطبيق المظهر
     * @param {string} theme - اسم المظهر
     */
    applyTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    /**
     * إظهار إشعار
     * @param {object} options - خيارات الإشعار
     */
    showNotification(options = {}) {
        return this.components.notification.show({
            message: options.message || '',
            type: options.type || 'info',
            duration: options.duration || 3000,
            position: options.position || 'top-right'
        });
    }

    /**
     * إظهار مربع حوار
     * @param {object} options - خيارات المربع
     */
    showModal(options = {}) {
        return this.components.modal.show({
            title: options.title || '',
            content: options.content || '',
            buttons: options.buttons || [],
            type: options.type || 'default'
        });
    }

    /**
     * تحديث شريط التقدم
     * @param {number} current - الحالي
     * @param {number} total - الكلي
     */
    updateProgress(current, total) {
        this.components.progressBar.update(current, total);
    }

    /**
     * معالجة تغيير حجم النافذة
     */
    handleWindowResize() {
        const width = window.innerWidth;
        if (width < 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }

    /**
     * معالجة اختصارات لوحة المفاتيح
     * @param {KeyboardEvent} event - حدث لوحة المفاتيح
     */
    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            const newTheme = this.theme === 'light' ? 'dark' : 'light';
            this.applyTheme(newTheme);
        }

        if (event.key === 'Escape') {
            this.components.modal.close();
        }
    }

    /**
     * إظهار Spinner
     */
    showSpinner() {
        this.components.spinner.show();
    }

    /**
     * إخفاء Spinner
     */
    hideSpinner() {
        this.components.spinner.hide();
    }
}

/**
 * فئة Screen الأساسية
 */
class BaseScreen {
    constructor(name) {
        this.name = name;
        this.elements = {};
    }

    render() {
        return '<div></div>';
    }

    initialize() {
        // يتم تنفيذه في الفئات الوارثة
    }
}

/**
 * شاشة تسجيل الدخول
 */
class LoginScreen extends BaseScreen {
    constructor() {
        super('login');
    }

    render() {
        return `
            <div class="screen login-screen">
                <div class="login-container">
                    <div class="login-card">
                        <h1>🎓 تعلم الحروف العربية</h1>
                        <p>نظام تقييم تفاعلي</p>
                        
                        <form id="loginForm" class="login-form">
                            <div class="form-group">
                                <input type="text" id="username" placeholder="اسم المستخدم" required>
                            </div>
                            <div class="form-group">
                                <input type="password" id="password" placeholder="كلمة المرور" required>
                            </div>
                            <button type="submit" class="btn btn-primary">تسجيل الدخول</button>
                        </form>

                        <p>ليس لديك حساب؟ <a href="#register">إنشاء حساب</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                ui.showSpinner();
                setTimeout(() => {
                    const result = app.login(username, password);
                    ui.hideSpinner();

                    if (result.success) {
                        ui.showNotification({
                            message: 'تم تسجيل الدخول بنجاح',
                            type: 'success'
                        });
                        setTimeout(() => ui.renderScreen('dashboard'), 1000);
                    } else {
                        ui.showNotification({
                            message: result.message,
                            type: 'error'
                        });
                    }
                }, 800);
            });
        }
    }
}

/**
 * شاشة التسجيل
 */
class RegisterScreen extends BaseScreen {
    constructor() {
        super('register');
    }

    render() {
        return `
            <div class="screen register-screen">
                <div class="register-container">
                    <div class="register-card">
                        <h1>إنشاء حساب جديد</h1>
                        
                        <form id="registerForm" class="register-form">
                            <div class="form-group">
                                <input type="text" id="regUsername" placeholder="اسم المستخدم" required>
                            </div>
                            <div class="form-group">
                                <input type="password" id="regPassword" placeholder="كلمة المرور" required>
                            </div>
                            <div class="form-group">
                                <input type="password" id="regConfirmPassword" placeholder="تأكيد كلمة المرور" required>
                            </div>
                            <button type="submit" class="btn btn-primary">إنشاء الحساب</button>
                        </form>

                        <p>لديك حساب؟ <a href="#login">تسجيل الدخول</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('regUsername').value;
                const password = document.getElementById('regPassword').value;
                const confirmPassword = document.getElementById('regConfirmPassword').value;

                if (password !== confirmPassword) {
                    ui.showNotification({
                        message: 'كلمات المرور غير متطابقة',
                        type: 'error'
                    });
                    return;
                }

                ui.showSpinner();
                setTimeout(() => {
                    const result = app.register(username, password);
                    ui.hideSpinner();

                    if (result.success) {
                        ui.showNotification({
                            message: 'تم إنشاء الحساب بنجاح',
                            type: 'success'
                        });
                        setTimeout(() => ui.renderScreen('login'), 1500);
                    } else {
                        ui.showNotification({
                            message: result.message,
                            type: 'error'
                        });
                    }
                }, 800);
            });
        }
    }
}

/**
 * شاشة لوحة التحكم
 */
class DashboardScreen extends BaseScreen {
    constructor() {
        super('dashboard');
    }

    render() {
        return `
            <div class="screen dashboard-screen">
                <div class="dashboard-container">
                    <div class="dashboard-header">
                        <h1>مرحباً بك! 👋</h1>
                        <p id="userName">أحمد محمد</p>
                    </div>

                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <span class="stat-icon">📝</span>
                            <span class="stat-label">جلسات مكتملة</span>
                            <span class="stat-value" id="completedSessions">0</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-icon">✅</span>
                            <span class="stat-label">متوسط الدقة</span>
                            <span class="stat-value" id="averageAccuracy">0%</span>
                        </div>
                    </div>

                    <div class="action-cards">
                        <button class="action-card" id="startTestBtn">🎯 اختبار جديد</button>
                        <button class="action-card" id="viewHistoryBtn">📊 السجل</button>
                        <button class="action-card" id="settingsBtn">⚙️ الإعدادات</button>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        document.getElementById('startTestBtn')?.addEventListener('click', () => {
            ui.renderScreen('test');
        });

        document.getElementById('viewHistoryBtn')?.addEventListener('click', () => {
            ui.renderScreen('history');
        });

        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            ui.renderScreen('settings');
        });

        if (app.currentUser) {
            document.getElementById('userName').textContent = app.currentUser.username;
        }
    }
}

/**
 * شاشة الاختبار
 */
class TestScreen extends BaseScreen {
    constructor() {
        super('test');
    }

    render() {
        return `
            <div class="screen test-screen">
                <div class="test-container">
                    <div class="test-header">
                        <div class="progress-info">
                            <span id="progressText">السؤال 1 من 28</span>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                        </div>
                        <button class="btn-exit" id="exitTestBtn">✕</button>
                    </div>

                    <div class="test-content">
                        <h2 id="currentLetter" class="current-letter">ا</h2>
                        <div class="options-grid" id="optionsGrid"></div>
                        <div class="test-actions">
                            <button class="btn btn-primary" id="nextQuestionBtn">التالي</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        const session = app.startTestSession(28);
        if (session.success) {
            this.currentQuestion = 0;
            this.displayQuestion();

            document.getElementById('nextQuestionBtn')?.addEventListener('click', () => {
                this.nextQuestion();
            });

            document.getElementById('exitTestBtn')?.addEventListener('click', () => {
                if (confirm('هل تريد إنهاء الاختبار؟')) {
                    ui.renderScreen('dashboard');
                }
            });
        }
    }

    displayQuestion() {
        const question = app.currentSession.questions[this.currentQuestion];
        if (!question) return;

        document.getElementById('currentLetter').textContent = question.letter;

        const progress = ((this.currentQuestion + 1) / app.currentSession.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = 
            `السؤال ${this.currentQuestion + 1} من ${app.currentSession.questions.length}`;

        const optionsGrid = document.getElementById('optionsGrid');
        optionsGrid.innerHTML = question.options.map(option => `
            <button class="option-button" data-answer="${option}">${option}</button>
        `).join('');

        optionsGrid.querySelectorAll('.option-button').forEach(btn => {
            btn.addEventListener('click', () => this.selectAnswer(btn.dataset.answer, btn));
        });
    }

    selectAnswer(answer, button) {
        const result = app.answerQuestion(this.currentQuestion, answer);
        
        button.parentElement.querySelectorAll('.option-button').forEach(btn => {
            btn.disabled = true;
        });

        if (result.isCorrect) {
            button.classList.add('correct');
        } else {
            button.classList.add('wrong');
        }

        document.getElementById('nextQuestionBtn').disabled = false;
    }

    nextQuestion() {
        if (this.currentQuestion < app.currentSession.questions.length - 1) {
            this.currentQuestion++;
            this.displayQuestion();
        } else {
            const results = app.endTestSession();
            if (results.success) {
                window.lastTestResults = results;
                ui.renderScreen('results');
            }
        }
    }
}

/**
 * شاشة النتائج
 */
class ResultsScreen extends BaseScreen {
    constructor() {
        super('results');
    }

    render() {
        return `
            <div class="screen results-screen">
                <div class="results-container">
                    <h1>🎉 النتائج</h1>
                    <div id="resultsContent"></div>
                    <button class="btn btn-primary" id="backToDashboard">العودة للرئيسية</button>
                </div>
            </div>
        `;
    }

    initialize() {
        if (window.lastTestResults) {
            const results = window.lastTestResults;
            const content = document.getElementById('resultsContent');
            content.innerHTML = `
                <div class="result-summary">
                    <p>الدقة: ${results.statistics.accuracy}%</p>
                    <p>الإجابات الصحيحة: ${results.statistics.correctAnswers}/${results.statistics.totalTests}</p>
                </div>
            `;
        }

        document.getElementById('backToDashboard')?.addEventListener('click', () => {
            ui.renderScreen('dashboard');
        });
    }
}

/**
 * شاشة السجل التاريخي
 */
class HistoryScreen extends BaseScreen {
    constructor() {
        super('history');
    }

    render() {
        return `
            <div class="screen history-screen">
                <div class="history-container">
                    <h1>📊 السجل التاريخي</h1>
                    <div id="historyContent"></div>
                    <button class="btn btn-primary" id="backToDashboard">العودة</button>
                </div>
            </div>
        `;
    }

    initialize() {
        const history = app.getUserHistory();
        const content = document.getElementById('historyContent');

        if (history.success && history.sessions.length > 0) {
            content.innerHTML = history.sessions.map(session => `
                <div class="history-item">
                    <p>التاريخ: ${new Date(session.date).toLocaleDateString('ar')}</p>
                    <p>الدقة: ${Math.round(session.stats.accuracy)}%</p>
                </div>
            `).join('');
        } else {
            content.innerHTML = '<p>لا توجد جلسات سابقة</p>';
        }

        document.getElementById('backToDashboard')?.addEventListener('click', () => {
            ui.renderScreen('dashboard');
        });
    }
}

/**
 * شاشة الإعدادات
 */
class SettingsScreen extends BaseScreen {
    constructor() {
        super('settings');
    }

    render() {
        return `
            <div class="screen settings-screen">
                <div class="settings-container">
                    <h1>⚙️ الإعدادات</h1>
                    <div class="settings-content">
                        <button class="btn btn-danger" id="logoutBtn">تسجيل الخروج</button>
                    </div>
                    <button class="btn btn-primary" id="backToDashboard">العودة</button>
                </div>
            </div>
        `;
    }

    initialize() {
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            app.logout();
            ui.renderScreen('login');
        });

        document.getElementById('backToDashboard')?.addEventListener('click', () => {
            ui.renderScreen('dashboard');
        });
    }
}

/**
 * فئة محرك الرسوميات
 */
class AnimationEngine {
    fadeOut(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '0';
    }

    fadeIn(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease-in`;
        element.style.opacity = '1';
    }
}

/**
 * المكونات
 */

class HeaderComponent {
    render() {
        return '<header class="app-header"></header>';
    }
}

class NavbarComponent {
    render() {
        return '<nav class="app-navbar"></nav>';
    }
}

class ProgressBarComponent {
    update(current, total) {
        const percentage = (current / total) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
    }
}

class ScoreBoardComponent {
    update(scores) {
        const board = document.querySelector('.score-board');
        if (board) {
            board.innerHTML = JSON.stringify(scores);
        }
    }
}

class NotificationComponent {
    show(options) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${options.type}`;
        notification.textContent = options.message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '10000';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '4px';
        notification.style.color = 'white';
        
        const bgColor = options.type === 'success' ? '#27ae60' : 
                        options.type === 'error' ? '#e74c3c' : '#3498db';
        notification.style.backgroundColor = bgColor;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, options.duration);

        return notification;
    }
}

class ModalComponent {
    show(options) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${options.title}</h2>
                <p>${options.content}</p>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    close() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }
}

class TooltipComponent {
    show(text, element) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
    }
}

class SpinnerComponent {
    show() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);
    }

    hide() {
        const spinner = document.querySelector('.spinner-overlay');
        if (spinner) {
            spinner.remove();
        }
    }
}

class ProfileScreen extends BaseScreen {
    constructor() {
        super('profile');
    }

    render() {
        return `<div class="screen profile-screen">الملف الشخصي</div>`;
    }
}

// إنشاء نسخة عامة
const ui = new UIManager();

console.log('✅ الواجهة الرسومية تم تحميلها بنجاح');
