// ============================================
// المرحلة 4: نظام التحليلات والإحصائيات المتقدمة
// ============================================

/**
 * فئة AnalyticsSystem
 * نظام تحليل البيانات والإحصائيات المتقدمة
 */
class AnalyticsSystem {
    /**
     * حساب إحصائيات الاختبار
     * @param {array} results - نتائج الاختبار
     * @returns {object} الإحصائيات
     */
    static calculateTestStatistics(results) {
        if (!Array.isArray(results) || results.length === 0) {
            return {
                totalTests: 0,
                correctAnswers: 0,
                wrongAnswers: 0,
                accuracy: 0,
                successRate: '0%'
            };
        }

        const totalTests = results.length;
        const correctAnswers = results.filter(r => r.isCorrect).length;
        const wrongAnswers = totalTests - correctAnswers;
        const accuracy = ((correctAnswers / totalTests) * 100).toFixed(2);

        return {
            totalTests,
            correctAnswers,
            wrongAnswers,
            accuracy: parseFloat(accuracy),
            successRate: accuracy + '%',
            averageScore: (correctAnswers / totalTests * 100).toFixed(1)
        };
    }

    /**
     * حساب الإحصائيات لكل حرف
     * @param {array} results - نتائج الاختبار
     * @returns {object} إحصائيات لكل حرف
     */
    static getLetterStatistics(results) {
        const letterStats = {};

        results.forEach(result => {
            if (!letterStats[result.letter]) {
                letterStats[result.letter] = {
                    letter: result.letter,
                    attempts: 0,
                    correct: 0,
                    wrong: 0,
                    accuracy: 0
                };
            }

            letterStats[result.letter].attempts++;
            if (result.isCorrect) {
                letterStats[result.letter].correct++;
            } else {
                letterStats[result.letter].wrong++;
            }

            letterStats[result.letter].accuracy = 
                (letterStats[result.letter].correct / letterStats[result.letter].attempts * 100).toFixed(1);
        });

        return letterStats;
    }

    /**
     * تحديد الحروف الضعيفة
     * @param {object} letterStats - إحصائيات الحروف
     * @param {number} threshold - حد النسبة المئوية
     * @returns {array} الحروف الضعيفة
     */
    static getWeakLetters(letterStats, threshold = 50) {
        return Object.values(letterStats)
            .filter(stat => parseFloat(stat.accuracy) < threshold)
            .sort((a, b) => parseFloat(a.accuracy) - parseFloat(b.accuracy));
    }

    /**
     * تحديد الحروف القوية
     * @param {object} letterStats - إحصائيات الحروف
     * @param {number} threshold - حد النسبة المئوية
     * @returns {array} الحروف القوية
     */
    static getStrongLetters(letterStats, threshold = 80) {
        return Object.values(letterStats)
            .filter(stat => parseFloat(stat.accuracy) >= threshold)
            .sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
    }

    /**
     * حساب التقدم بمرور الوقت
     * @param {array} allResults - جميع النتائج عبر الجلسات
     * @returns {array} البيانات التاريخية
     */
    static calculateProgressOverTime(allResults) {
        const progressData = [];
        let sessionNum = 0;

        // تجميع النتائج حسب الجلسات
        const sessions = {};
        allResults.forEach((result, index) => {
            const sessionId = result.sessionId || sessionNum;
            if (!sessions[sessionId]) {
                sessions[sessionId] = [];
                if (!result.sessionId) sessionNum++;
            }
            sessions[sessionId].push(result);
        });

        // حساب الدقة لكل جلسة
        Object.values(sessions).forEach((session, index) => {
            const stats = AnalyticsSystem.calculateTestStatistics(session);
            progressData.push({
                session: index + 1,
                date: new Date().toLocaleDateString('ar-SA'),
                accuracy: stats.accuracy,
                total: stats.totalTests,
                correct: stats.correctAnswers
            });
        });

        return progressData;
    }

    /**
     * تحليل أنماط الأخطاء
     * @param {array} results - النتائج
     * @returns {object} تحليل الأخطاء
     */
    static analyzeErrorPatterns(results) {
        const errors = results.filter(r => !r.isCorrect);
        
        return {
            totalErrors: errors.length,
            errorRate: ((errors.length / results.length) * 100).toFixed(2) + '%',
            commonErrors: AnalyticsSystem.getCommonErrors(errors),
            errorsByLetter: AnalyticsSystem.groupErrorsByLetter(errors)
        };
    }

    /**
     * الحصول على الأخطاء الشائعة
     * @param {array} errors - الأخطاء
     * @returns {array} الأخطاء الشائعة
     */
    static getCommonErrors(errors) {
        const errorMap = {};

        errors.forEach(error => {
            const key = `${error.letter}-${error.userAnswer}`;
            errorMap[key] = (errorMap[key] || 0) + 1;
        });

        return Object.entries(errorMap)
            .map(([key, count]) => {
                const [letter, userAnswer] = key.split('-');
                return {
                    letter,
                    userAnswer,
                    frequency: count,
                    percentage: ((count / errors.length) * 100).toFixed(1) + '%'
                };
            })
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10); // أكثر 10 أخطاء شيوعاً
    }

    /**
     * تجميع الأخطاء حسب الحرف
     * @param {array} errors - الأخطاء
     * @returns {object} الأخطاء مجمعة
     */
    static groupErrorsByLetter(errors) {
        const grouped = {};

        errors.forEach(error => {
            if (!grouped[error.letter]) {
                grouped[error.letter] = [];
            }
            grouped[error.letter].push(error.userAnswer);
        });

        return grouped;
    }

    /**
     * توليد تقرير شامل
     * @param {array} results - النتائج
     * @param {string} studentName - اسم الطالب
     * @returns {object} التقرير الشامل
     */
    static generateReport(results, studentName = 'الطالب') {
        const stats = AnalyticsSystem.calculateTestStatistics(results);
        const letterStats = AnalyticsSystem.getLetterStatistics(results);
        const weakLetters = AnalyticsSystem.getWeakLetters(letterStats);
        const strongLetters = AnalyticsSystem.getStrongLetters(letterStats);
        const errorAnalysis = AnalyticsSystem.analyzeErrorPatterns(results);

        return {
            studentName,
            generatedAt: new Date().toLocaleString('ar-SA'),
            summary: {
                totalTests: stats.totalTests,
                correctAnswers: stats.correctAnswers,
                wrongAnswers: stats.wrongAnswers,
                accuracy: stats.accuracy + '%',
                successRate: stats.successRate
            },
            strongLetters: strongLetters.slice(0, 5),
            weakLetters: weakLetters.slice(0, 5),
            errorAnalysis: {
                totalErrors: errorAnalysis.totalErrors,
                errorRate: errorAnalysis.errorRate,
                topErrors: errorAnalysis.commonErrors.slice(0, 5)
            },
            recommendations: AnalyticsSystem.generateRecommendations(weakLetters, strongLetters)
        };
    }

    /**
     * توليد التوصيات
     * @param {array} weakLetters - الحروف الضعيفة
     * @param {array} strongLetters - الحروف القوية
     * @returns {array} التوصيات
     */
    static generateRecommendations(weakLetters, strongLetters) {
        const recommendations = [];

        if (weakLetters.length > 0) {
            recommendations.push({
                type: 'improvement',
                text: `ركز على تحسين الحروف التالية: ${weakLetters.slice(0, 3).map(w => w.letter).join('، ')}`,
                priority: 'high'
            });
        }

        if (strongLetters.length > 0) {
            recommendations.push({
                type: 'strength',
                text: `أنت متقن في الحروف: ${strongLetters.slice(0, 3).map(w => w.letter).join('، ')}`,
                priority: 'normal'
            });
        }

        if (weakLetters.length === 0 && strongLetters.length === ARABIC_LETTERS.length) {
            recommendations.push({
                type: 'excellence',
                text: 'ممتاز! أنت متقن في جميع الحروف العربية',
                priority: 'normal'
            });
        }

        return recommendations;
    }
}

/**
 * فئة PerformanceTracker
 * تتبع الأداء والإحصائيات الزمنية
 */
class PerformanceTracker {
    constructor() {
        this.sessions = [];
        this.currentSession = null;
    }

    /**
     * بدء جلسة جديدة
     * @param {string} studentName - اسم الطالب
     */
    startSession(studentName) {
        this.currentSession = {
            id: this.generateSessionId(),
            studentName,
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            results: [],
            questionStartTime: null
        };
    }

    /**
     * تسجيل إجابة
     * @param {object} result - النتيجة
     */
    recordAnswer(result) {
        if (!this.currentSession) return;

        const answerTime = Date.now() - (this.currentSession.questionStartTime || this.currentSession.startTime);
        
        this.currentSession.results.push({
            ...result,
            answerTime: Math.round(answerTime / 1000) // بالثواني
        });

        this.currentSession.questionStartTime = Date.now();
    }

    /**
     * إنهاء الجلسة
     */
    endSession() {
        if (!this.currentSession) return;

        this.currentSession.endTime = Date.now();
        this.currentSession.duration = 
            Math.round((this.currentSession.endTime - this.currentSession.startTime) / 1000); // بالثواني

        this.sessions.push(this.currentSession);
        return this.currentSession;
    }

    /**
     * حساب متوسط الوقت لكل سؤال
     * @returns {number} متوسط الوقت بالثواني
     */
    getAverageTimePerQuestion() {
        if (!this.currentSession || this.currentSession.results.length === 0) return 0;

        const totalTime = this.currentSession.results.reduce((sum, r) => sum + r.answerTime, 0);
        return (totalTime / this.currentSession.results.length).toFixed(2);
    }

    /**
     * حساب أسرع إجابة
     * @returns {number} الوقت بالثواني
     */
    getFastestAnswer() {
        if (!this.currentSession || this.currentSession.results.length === 0) return 0;
        return Math.min(...this.currentSession.results.map(r => r.answerTime));
    }

    /**
     * حساب أبطأ إجابة
     * @returns {number} الوقت بالثواني
     */
    getSlowestAnswer() {
        if (!this.currentSession || this.currentSession.results.length === 0) return 0;
        return Math.max(...this.currentSession.results.map(r => r.answerTime));
    }

    /**
     * الحصول على إحصائيات الأداء
     * @returns {object} الإحصائيات
     */
    getPerformanceStats() {
        if (!this.currentSession) return null;

        return {
            sessionId: this.currentSession.id,
            studentName: this.currentSession.studentName,
            totalDuration: this.currentSession.duration + ' ثانية',
            totalQuestions: this.currentSession.results.length,
            averageTimePerQuestion: this.getAverageTimePerQuestion() + ' ثانية',
            fastestAnswer: this.getFastestAnswer() + ' ثانية',
            slowestAnswer: this.getSlowestAnswer() + ' ثانية',
            accuracy: this.calculateAccuracy() + '%'
        };
    }

    /**
     * حساب الدقة
     * @returns {number} نسبة الدقة
     */
    calculateAccuracy() {
        if (!this.currentSession || this.currentSession.results.length === 0) return 0;

        const correct = this.currentSession.results.filter(r => r.isCorrect).length;
        return ((correct / this.currentSession.results.length) * 100).toFixed(1);
    }

    /**
     * توليد معرّف الجلسة
     * @returns {string} معرّف فريد
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * الحصول على جميع الجلسات
     * @returns {array} الجلسات
     */
    getAllSessions() {
        return this.sessions;
    }

    /**
     * حساب الإحصائيات العامة
     * @returns {object} الإحصائيات
     */
    getOverallStatistics() {
        if (this.sessions.length === 0) {
            return { totalSessions: 0, averageAccuracy: 0, totalTimeSpent: 0 };
        }

        const totalSessions = this.sessions.length;
        const totalResults = this.sessions.flatMap(s => s.results);
        const correctAnswers = totalResults.filter(r => r.isCorrect).length;
        const averageAccuracy = ((correctAnswers / totalResults.length) * 100).toFixed(1);
        const totalTimeSpent = this.sessions.reduce((sum, s) => sum + s.duration, 0);

        return {
            totalSessions,
            totalQuestions: totalResults.length,
            averageAccuracy: averageAccuracy + '%',
            totalTimeSpent: Math.round(totalTimeSpent) + ' ثانية',
            sessionsData: this.sessions.map(s => ({
                id: s.id,
                studentName: s.studentName,
                duration: s.duration + ' ثانية',
                questions: s.results.length,
                accuracy: ((s.results.filter(r => r.isCorrect).length / s.results.length) * 100).toFixed(1) + '%'
            }))
        };
    }
}

/**
 * فئة DataVisualization
 * إنشاء البيانات المرئية والرسوم البيانية
 */
class DataVisualization {
    /**
     * تحضير بيانات الرسم البياني العمودي
     * @param {object} letterStats - إحصائيات الحروف
     * @returns {object} بيانات الرسم البياني
     */
    static prepareBarChartData(letterStats) {
        const labels = [];
        const data = [];
        const colors = [];

        Object.values(letterStats).forEach(stat => {
            labels.push(stat.letter);
            data.push(stat.accuracy);
            colors.push(this.getColorByAccuracy(stat.accuracy));
        });

        return {
            labels,
            data,
            colors,
            title: 'دقة الإجابات لكل حرف'
        };
    }

    /**
     * تحضير بيانات الرسم البياني الدائري
     * @param {array} results - النتائج
     * @returns {object} بيانات الرسم البياني
     */
    static preparePieChartData(results) {
        const stats = AnalyticsSystem.calculateTestStatistics(results);

        return {
            labels: ['إجابات صحيحة', 'إجابات خاطئة'],
            data: [stats.correctAnswers, stats.wrongAnswers],
            colors: ['#10b981', '#ef4444'],
            title: 'توزيع الإجابات'
        };
    }

    /**
     * تحضير بيانات الرسم البياني الخطي
     * @param {array} progressData - بيانات التقدم
     * @returns {object} بيانات الرسم البياني
     */
    static prepareLineChartData(progressData) {
        return {
            labels: progressData.map(p => `الجلسة ${p.session}`),
            data: progressData.map(p => p.accuracy),
            title: 'التقدم عبر الجلسات'
        };
    }

    /**
     * الحصول على اللون حسب الدقة
     * @param {number} accuracy - نسبة الدقة
     * @returns {string} اللون
     */
    static getColorByAccuracy(accuracy) {
        accuracy = parseFloat(accuracy);
        if (accuracy >= 80) return '#10b981'; // أخضر
        if (accuracy >= 60) return '#f59e0b'; // برتقالي
        return '#ef4444'; // أحمر
    }

    /**
     * توليد HTML للرسم البياني
     * @param {object} chartData - بيانات الرسم البياني
     * @returns {string} HTML
     */
    static generateChartHTML(chartData) {
        let html = `<div class="chart-container">
                        <h3>${chartData.title}</h3>
                        <canvas id="chart"></canvas>
                    </div>`;
        return html;
    }
}

/**
 * إنشاء نوى عامة من الأنظمة
 */
const globalAnalytics = new AnalyticsSystem();
const globalPerformanceTracker = new PerformanceTracker();
const globalDataVisualization = new DataVisualization();

console.log('✅ نظام التحليلات والإحصائيات تم تحميله بنجاح');

// أمثلة على الاستخدام:
// const stats = AnalyticsSystem.calculateTestStatistics(results);
// const report = AnalyticsSystem.generateReport(results, 'أحمد محمد');
// globalPerformanceTracker.startSession('أحمد محمد');
// globalPerformanceTracker.recordAnswer({letter: 'ا', isCorrect: true});
// globalPerformanceTracker.endSession();
// const performance = globalPerformanceTracker.getPerformanceStats();
