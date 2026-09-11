// ============================================
// المرحلة 5: نظام التكامل والتطبيق الكامل
// ============================================

/**
 * فئة ApplicationCore
 * قلب التطبيق - تكامل جميع الأنظمة
 */
class ApplicationCore {
    constructor() {
        this.questionsManager = null;
        this.userManager = null;
        this.analyticsSystem = null;
        this.performanceTracker = null;
        this.dataVisualization = null;
        this.securityManager = null;
        this.isInitialized = false;
        this.currentUser = null;
        this.currentSession = null;
    }

    /**
     * تهيئة التطبيق
     * @param {object} config - إعدادات التطبيق
     */
    initialize(config = {}) {
        try {
            // تهيئة مدير الأسئلة
            this.questionsManager = {
                questions: config.questions || this.getDefaultQuestions(),
                getRandomQuestion: function() {
                    return this.questions[Math.floor(Math.random() * this.questions.length)];
                }
            };

            // تهيئة مدير المستخدمين
            this.userManager = {
                users: config.users || [],
                addUser: function(user) {
                    this.users.push(user);
                    localStorage.setItem('users', JSON.stringify(this.users));
                },
                getUser: function(username) {
                    return this.users.find(u => u.username === username);
                }
            };

            // تهيئة أنظمة التحليلات
            this.analyticsSystem = AnalyticsSystem;
            this.performanceTracker = globalPerformanceTracker;
            this.dataVisualization = globalDataVisualization;

            // تهيئة مدير الأمان
            this.securityManager = SecurityManager;

            this.isInitialized = true;
            console.log('✅ تم تهيئة التطبيق بنجاح');

            return {
                success: true,
                message: 'تم تهيئة التطبيق بنجاح'
            };
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
            return {
                success: false,
                message: 'حدث خطأ في تهيئة التطبيق'
            };
        }
    }

    /**
     * الحصول على الأسئلة الافتراضية
     * @returns {array} قائمة الأسئلة
     */
    getDefaultQuestions() {
        return ARABIC_LETTERS.map((letter, index) => ({
            id: index + 1,
            letter: letter,
            sound: `sounds/${letter}.mp3`,
            image: `images/${letter}.png`,
            type: 'letter'
        }));
    }

    /**
     * تسجيل المستخدم
     * @param {string} username - اسم المستخدم
     * @param {string} password - كلمة المرور
     * @returns {object} نتيجة التسجيل
     */
    register(username, password) {
        if (!this.isInitialized) {
            return { success: false, message: 'التطبيق لم يتم تهيئته' };
        }

        if (!username || !password) {
            return { success: false, message: 'اسم المستخدم وكلمة المرور مطلوبة' };
        }

        if (this.userManager.getUser(username)) {
            return { success: false, message: 'اسم المستخدم موجود بالفعل' };
        }

        const user = {
            id: Date.now(),
            username,
            password: this.securityManager.hashPassword(password),
            email: '',
            createdAt: new Date().toISOString(),
            sessions: [],
            preferences: {
                language: 'ar',
                theme: 'light',
                soundEnabled: true
            }
        };

        this.userManager.addUser(user);
        return { success: true, message: 'تم التسجيل بنجاح', userId: user.id };
    }

    /**
     * تسجيل الدخول
     * @param {string} username - اسم المستخدم
     * @param {string} password - كلمة المرور
     * @returns {object} نتيجة التسجيل الدخول
     */
    login(username, password) {
        if (!this.isInitialized) {
            return { success: false, message: 'التطبيق لم يتم تهيئته' };
        }

        const user = this.userManager.getUser(username);
        
        if (!user) {
            return { success: false, message: 'اسم المستخدم غير صحيح' };
        }

        if (!this.securityManager.verifyPassword(password, user.password)) {
            return { success: false, message: 'كلمة المرور غير صحيحة' };
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return { 
            success: true, 
            message: 'تم تسجيل الدخول بنجاح',
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt
            }
        };
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        this.currentUser = null;
        this.currentSession = null;
        localStorage.removeItem('currentUser');
        return { success: true, message: 'تم تسجيل الخروج بنجاح' };
    }

    /**
     * بدء جلسة اختبار جديدة
     * @param {number} questionCount - عدد الأسئلة
     * @returns {object} معلومات الجلسة
     */
    startTestSession(questionCount = 28) {
        if (!this.currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        this.performanceTracker.startSession(this.currentUser.username);
        
        this.currentSession = {
            id: this.performanceTracker.currentSession.id,
            userId: this.currentUser.id,
            startTime: new Date(),
            questionCount,
            questions: this.generateSessionQuestions(questionCount),
            currentQuestionIndex: 0,
            results: [],
            status: 'active'
        };

        return {
            success: true,
            message: 'تم بدء الجلسة بنجاح',
            session: {
                id: this.currentSession.id,
                totalQuestions: questionCount,
                currentQuestion: this.currentSession.questions[0]
            }
        };
    }

    /**
     * توليد أسئلة الجلسة
     * @param {number} count - عدد الأسئلة
     * @returns {array} الأسئلة
     */
    generateSessionQuestions(count) {
        const questions = [];
        const availableLetters = [...ARABIC_LETTERS];

        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * availableLetters.length);
            const letter = availableLetters[randomIndex];
            
            questions.push({
                id: i + 1,
                letter,
                options: this.generateOptions(letter),
                answered: false,
                isCorrect: null
            });
        }

        return questions;
    }

    /**
     * توليد الخيارات للسؤال
     * @param {string} correctLetter - الحرف الصحيح
     * @returns {array} الخيارات
     */
    generateOptions(correctLetter) {
        const options = [correctLetter];
        const availableLetters = ARABIC_LETTERS.filter(l => l !== correctLetter);

        while (options.length < 4) {
            const randomLetter = availableLetters[
                Math.floor(Math.random() * availableLetters.length)
            ];
            if (!options.includes(randomLetter)) {
                options.push(randomLetter);
            }
        }

        // خلط الخيارات
        return options.sort(() => Math.random() - 0.5);
    }

    /**
     * الإجابة على سؤال
     * @param {number} questionIndex - رقم السؤال
     * @param {string} answer - الإجابة
     * @returns {object} نتيجة الإجابة
     */
    answerQuestion(questionIndex, answer) {
        if (!this.currentSession) {
            return { success: false, message: 'لا توجد جلسة نشطة' };
        }

        const question = this.currentSession.questions[questionIndex];
        if (!question) {
            return { success: false, message: 'السؤال غير موجود' };
        }

        const isCorrect = answer === question.letter;
        
        question.answered = true;
        question.isCorrect = isCorrect;
        question.userAnswer = answer;

        const result = {
            questionId: question.id,
            letter: question.letter,
            userAnswer: answer,
            isCorrect,
            timestamp: new Date().toISOString()
        };

        this.currentSession.results.push(result);
        this.performanceTracker.recordAnswer(result);

        return {
            success: true,
            isCorrect,
            message: isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة',
            result
        };
    }

    /**
     * الانتقال للسؤال التالي
     * @returns {object} السؤال التالي
     */
    nextQuestion() {
        if (!this.currentSession) {
            return { success: false, message: 'لا توجد جلسة نشطة' };
        }

        this.currentSession.currentQuestionIndex++;

        if (this.currentSession.currentQuestionIndex >= this.currentSession.questions.length) {
            return { success: false, message: 'انتهت جميع الأسئلة' };
        }

        return {
            success: true,
            currentQuestion: this.currentSession.questions[this.currentSession.currentQuestionIndex],
            progress: {
                current: this.currentSession.currentQuestionIndex + 1,
                total: this.currentSession.questions.length
            }
        };
    }

    /**
     * إنهاء الجلسة والحصول على النتائج
     * @returns {object} النتائج والتقرير
     */
    endTestSession() {
        if (!this.currentSession) {
            return { success: false, message: 'لا توجد جلسة نشطة' };
        }

        this.performanceTracker.endSession();

        const stats = AnalyticsSystem.calculateTestStatistics(this.currentSession.results);
        const letterStats = AnalyticsSystem.getLetterStatistics(this.currentSession.results);
        const report = AnalyticsSystem.generateReport(
            this.currentSession.results,
            this.currentUser.username
        );

        // حفظ الجلسة
        if (!this.currentUser.sessions) {
            this.currentUser.sessions = [];
        }

        this.currentUser.sessions.push({
            id: this.currentSession.id,
            date: new Date().toISOString(),
            stats,
            report
        });

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        this.currentSession.status = 'completed';

        return {
            success: true,
            message: 'تم إنهاء الجلسة بنجاح',
            statistics: stats,
            report: report,
            performance: this.performanceTracker.getPerformanceStats()
        };
    }

    /**
     * الحصول على السجل التاريخي للمستخدم
     * @returns {array} السجل التاريخي
     */
    getUserHistory() {
        if (!this.currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        return {
            success: true,
            sessions: this.currentUser.sessions || [],
            overallStats: this.performanceTracker.getOverallStatistics()
        };
    }

    /**
     * الحصول على توصيات شخصية
     * @returns {array} التوصيات
     */
    getPersonalRecommendations() {
        if (!this.currentUser || !this.currentUser.sessions || this.currentUser.sessions.length === 0) {
            return {
                success: false,
                message: 'لا توجد بيانات كافية للتوصيات'
            };
        }

        const allResults = [];
        this.currentUser.sessions.forEach(session => {
            // جمع النتائج من السجل (في التطبيق الحقيقي)
        });

        return {
            success: true,
            recommendations: [
                {
                    type: 'practice',
                    text: 'استمر في الممارسة المنتظمة لتحسين المهارات',
                    priority: 'high'
                },
                {
                    type: 'focus',
                    text: 'ركز على الحروف التي تحتاج تحسين',
                    priority: 'high'
                }
            ]
        };
    }

    /**
     * تحديث تفضيلات المستخدم
     * @param {object} preferences - التفضيلات الجديدة
     */
    updateUserPreferences(preferences) {
        if (!this.currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        this.currentUser.preferences = {
            ...this.currentUser.preferences,
            ...preferences
        };

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        return {
            success: true,
            message: 'تم تحديث التفضيلات بنجاح',
            preferences: this.currentUser.preferences
        };
    }

    /**
     * حفظ البيانات إلى localStorage
     */
    saveData() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        localStorage.setItem('users', JSON.stringify(this.userManager.users));
    }

    /**
     * تحميل البيانات من localStorage
     */
    loadData() {
        const users = localStorage.getItem('users');
        const currentUser = localStorage.getItem('currentUser');

        if (users) {
            this.userManager.users = JSON.parse(users);
        }

        if (currentUser) {
            this.currentUser = JSON.parse(currentUser);
        }
    }

    /**
     * الحصول على معلومات التطبيق
     * @returns {object} معلومات التطبيق
     */
    getAppInfo() {
        return {
            appName: 'نظام تقييم حروف اللغة العربية',
            version: '1.0.0',
            buildDate: '2026-09-11',
            author: 'فريق التطوير',
            description: 'تطبيق تفاعلي لتقييم ممارسة حروف اللغة العربية',
            features: [
                'اختبارات تفاعلية',
                'تتبع الأداء',
                'تحليلات متقدمة',
                'توصيات شخصية',
                'أمان محسّن'
            ],
            isInitialized: this.isInitialized,
            currentUser: this.currentUser ? {
                username: this.currentUser.username,
                sessions: (this.currentUser.sessions || []).length
            } : null
        };
    }
}

/**
 * فئة EventBus
 * نظام الأحداث المركزي
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * الاشتراك في حدث
     * @param {string} eventName - اسم الحدث
     * @param {function} callback - دالة رد الفعل
     */
    subscribe(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * إلغاء الاشتراك
     * @param {string} eventName - اسم الحدث
     * @param {function} callback - دالة رد الفعل
     */
    unsubscribe(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    /**
     * نشر حدث
     * @param {string} eventName - اسم الحدث
     * @param {any} data - البيانات
     */
    publish(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}

/**
 * إنشاء نسخة عامة من النظام
 */
const app = new ApplicationCore();
const eventBus = new EventBus();

console.log('✅ نظام التكامل تم تحميله بنجاح');

// أمثلة على الاستخدام:
// app.initialize();
// app.register('ahmed', 'password123');
// app.login('ahmed', 'password123');
// const session = app.startTestSession(28);
// app.answerQuestion(0, 'ا');
// const results = app.endTestSession();
