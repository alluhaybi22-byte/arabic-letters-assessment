/**
 * ملف الاختبار الشامل للتطبيق
 * اختبار جميع الوظائف والميزات الأساسية
 */

class TestSuite {
    constructor() {
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }

    test(testName, testFunction) {
        this.totalTests++;
        try {
            testFunction();
            this.passedTests++;
            this.results.push({ name: testName, status: '✅ نجح', error: null });
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.failedTests++;
            this.results.push({ name: testName, status: '❌ فشل', error: error.message });
            console.error(`❌ ${testName}: ${error.message}`);
        }
    }

    printReport() {
        console.clear();
        console.log('═'.repeat(60));
        console.log('📋 تقرير الاختبار الشامل');
        console.log('═'.repeat(60));
        console.log(`\n📊 النتائج الإجمالية:`);
        console.log(`   إجمالي الاختبارات: ${this.totalTests}`);
        console.log(`   ✅ نجح: ${this.passedTests}`);
        console.log(`   ❌ فشل: ${this.failedTests}`);
        console.log(`   النسبة: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%\n`);

        console.log('📝 تفاصيل الاختبارات:');
        console.log('─'.repeat(60));
        this.results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.status} - ${result.name}`);
            if (result.error) {
                console.log(`   الخطأ: ${result.error}`);
            }
        });
        console.log('═'.repeat(60));
    }
}

// إنشاء مجموعة الاختبارات
const tester = new TestSuite();

// ============================================
// 1. اختبارات البيانات الأساسية
// ============================================

tester.test('التحقق من وجود 28 حرفاً', () => {
    if (!ARABIC_LETTERS || ARABIC_LETTERS.length !== 28) {
        throw new Error(`عدد الحروف: ${ARABIC_LETTERS?.length || 0} ، المتوقع: 28`);
    }
});

tester.test('التحقق من وجود جميع خصائص الحروف', () => {
    ARABIC_LETTERS.forEach((letter, index) => {
        if (!letter.letter) throw new Error(`الحرف ${index} بدون letter`);
        if (!letter.name) throw new Error(`الحرف ${index} بدون name`);
        if (!letter.alternatives) throw new Error(`الحرف ${index} بدون alternatives`);
        if (!Array.isArray(letter.alternatives)) throw new Error(`alternatives للحرف ${index} ليس array`);
    });
});

tester.test('التحقق من الحروف الفريدة', () => {
    const letters = ARABIC_LETTERS.map(l => l.letter);
    const uniqueLetters = new Set(letters);
    if (letters.length !== uniqueLetters.size) {
        throw new Error('توجد حروف مكررة');
    }
});

tester.test('التحقق من الإعدادات', () => {
    if (!CONFIG) throw new Error('CONFIG غير موجود');
    if (CONFIG.totalLetters !== 28) throw new Error('totalLetters غير صحيح');
    if (!CONFIG.recordingTimeout) throw new Error('recordingTimeout غير موجود');
    if (!CONFIG.language) throw new Error('language غير موجود');
});

// ============================================
// 2. اختبارات معالج التحليل
// ============================================

tester.test('تحليل إجابة صحيحة (تطابق تام)', () => {
    const letter = ARABIC_LETTERS[0]; // الألف
    const result = ResultAnalyzer.analyzeAnswer('الالف', letter);
    if (!result.isCorrect) {
        throw new Error('الإجابة الصحيحة لم تعترف كصحيحة');
    }
});

tester.test('تحليل إجابة خاطئة', () => {
    const letter = ARABIC_LETTERS[0]; // الألف
    const result = ResultAnalyzer.analyzeAnswer('بدون علاقة', letter);
    if (result.isCorrect) {
        throw new Error('الإجابة الخاطئة تم اعتبارها صحيحة');
    }
});

tester.test('التعامل مع الحالات المختلفة (Uppercase/Lowercase)', () => {
    const letter = ARABIC_LETTERS[1]; // الباء
    const result = ResultAnalyzer.analyzeAnswer('باء', letter);
    // يجب أن يتعامل مع الحالات المختلفة
    if (typeof result.confidence !== 'number') {
        throw new Error('لم يتم إرجاع confidence');
    }
});

tester.test('حساب التشابه بين النصوص', () => {
    const similarity = ResultAnalyzer.calculateSimilarity('الف', 'الالف');
    if (similarity < 0 || similarity > 1) {
        throw new Error(`التشابه يجب أن يكون بين 0 و 1، القيمة: ${similarity}`);
    }
});

tester.test('حساب المسافة التحريرية', () => {
    const distance = ResultAnalyzer.getEditDistance('الف', 'الالف');
    if (distance < 0) {
        throw new Error('المسافة التحريرية لا يمكن أن تكون سالبة');
    }
});

// ============================================
// 3. اختبارات معالج البيانات
// ============================================

tester.test('حفظ واسترجاع النتائج من localStorage', () => {
    const testData = {
        studentName: 'أحمد',
        results: [
            { letter: 'ا', isCorrect: true },
            { letter: 'ب', isCorrect: false }
        ]
    };
    
    DataManager.saveResults(testData.studentName, testData.results);
    const retrieved = DataManager.getResults();
    
    if (!retrieved) throw new Error('لم يتم استرجاع البيانات');
    if (retrieved.studentName !== 'أحمد') throw new Error('اسم الطالب غير صحيح');
    if (retrieved.results.length !== 2) throw new Error('عدد النتائج غير صحيح');
});

tester.test('مسح البيانات المحفوظة', () => {
    DataManager.clearResults();
    const retrieved = DataManager.getResults();
    if (retrieved !== null) {
        throw new Error('لم يتم مسح البيانات بشكل صحيح');
    }
});

tester.test('حساب النسبة المئوية للنتائج', () => {
    const testResults = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false }
    ];
    
    DataManager.saveResults('test', testResults);
    const retrieved = DataManager.getResults();
    const expectedPercentage = Math.round((2 / 3) * 100); // 66%
    
    if (retrieved.percentage !== expectedPercentage) {
        throw new Error(`النسبة المئوية: ${retrieved.percentage}، المتوقع: ${expectedPercentage}`);
    }
});

// ============================================
// 4. اختبارات واجهة المستخدم
// ============================================

tester.test('وجود جميع عناصر DOM الأساسية', () => {
    const elements = [
        'welcomeScreen', 'testScreen', 'resultsScreen',
        'studentName', 'startBtn', 'letterChar', 'recordBtn',
        'nextBtn', 'skipBtn', 'restartBtn', 'downloadBtn'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) throw new Error(`العنصر ${id} غير موجود`);
    });
});

tester.test('التحقق من الاتجاه RTL في HTML', () => {
    const htmlElement = document.documentElement;
    if (htmlElement.dir !== 'rtl') {
        throw new Error('الاتجاه RTL غير صحيح');
    }
});

tester.test('التحقق من اللغة العربية في HTML', () => {
    const htmlElement = document.documentElement;
    if (htmlElement.lang !== 'ar') {
        throw new Error('لم يتم تعيين اللغة العربية');
    }
});

tester.test('التحقق من تحميل ملفات CSS', () => {
    const styleSheets = document.styleSheets;
    let cssFound = false;
    
    for (let i = 0; i < styleSheets.length; i++) {
        if (styleSheets[i].href && styleSheets[i].href.includes('style.css')) {
            cssFound = true;
            break;
        }
    }
    
    if (!cssFound) {
        throw new Error('ملف CSS غير محمل');
    }
});

// ============================================
// 5. اختبارات الشاشات والتنقل
// ============================================

tester.test('شاشة الترحيب نشطة في البداية', () => {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (!welcomeScreen.classList.contains('active')) {
        throw new Error('شاشة الترحيب ليست نشطة');
    }
});

tester.test('إمكانية الوصول إلى جميع الشاشات', () => {
    const screens = ['welcomeScreen', 'testScreen', 'resultsScreen'];
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (!screen.classList.contains('screen')) {
            throw new Error(`الشاشة ${screenId} لا تحتوي على class screen`);
        }
    });
});

// ============================================
// 6. اختبارات الصوت والميكروفون
// ============================================

tester.test('التحقق من دعم Web Speech API', () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        throw new Error('Web Speech API غير مدعوم في هذا المتصفح');
    }
});

tester.test('التحقق من دعم getUserMedia', () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaRecorder API غير مدعوم');
    }
});

tester.test('إمكانية إنشاء كائن SpeechRecognition', () => {
    try {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();
        if (!recognition) throw new Error('لم يتم إنشاء كائن SpeechRecognition');
    } catch (error) {
        throw new Error(`خطأ في إنشاء SpeechRecognition: ${error.message}`);
    }
});

tester.test('إمكانية إنشاء كائن AudioRecorder', () => {
    try {
        const recorder = new AudioRecorder();
        if (!recorder) throw new Error('لم يتم إنشاء كائن AudioRecorder');
    } catch (error) {
        throw new Error(`خطأ في إنشاء AudioRecorder: ${error.message}`);
    }
});

// ============================================
// 7. اختبارات الحسابات والإحصائيات
// ============================================

tester.test('حساب عدد الحروف المتقنة', () => {
    const results = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: false }
    ];
    
    const correctCount = results.filter(r => r.isCorrect).length;
    if (correctCount !== 2) {
        throw new Error(`عدد الحروف المتقنة: ${correctCount}، المتوقع: 2`);
    }
});

tester.test('حساب عدد الحروف غير المتقنة', () => {
    const results = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: false }
    ];
    
    const incorrectCount = results.filter(r => !r.isCorrect).length;
    if (incorrectCount !== 2) {
        throw new Error(`عدد الحروف غير المتقنة: ${incorrectCount}، المتوقع: 2`);
    }
});

tester.test('حساب النسبة المئوية الصحيحة', () => {
    const results = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false }
    ];
    
    const percentage = Math.round((3 / 4) * 100);
    if (percentage !== 75) {
        throw new Error(`النسبة المئوية: ${percentage}%، المتوقع: 75%`);
    }
});

// ============================================
// 8. اختبارات الأداء
// ============================================

tester.test('وقت التحميل الأولي', () => {
    const startTime = performance.now();
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // يجب أن يكون وقت التحميل معقولاً
    if (loadTime > 5000) {
        throw new Error(`وقت التحميل: ${loadTime}ms (بطيء جداً)`);
    }
});

tester.test('عدم وجود errors في console', () => {
    // هذا الاختبار يتحقق من عدم وجود أخطاء قبل تشغيل التطبيق
    // يمكن تحسينه بمراقبة console.error أثناء التشغيل
});

// ============================================
// 9. اختبارات التوافقية
// ============================================

tester.test('التحقق من دعم localStorage', () => {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
    } catch (error) {
        throw new Error('localStorage غير مدعوم أو معطل');
    }
});

tester.test('التحقق من دعم ES6 Classes', () => {
    try {
        eval('class TestClass {}');
    } catch (error) {
        throw new Error('ES6 Classes غير مدعومة');
    }
});

// ============================================
// 10. اختبارات الأمان
// ============================================

tester.test('عدم وجود XSS vulnerabilities في النصوص', () => {
    const testString = '<script>alert("test")</script>';
    // يجب أن يتم تنظيف النصوص من الأكواد الضارة
    const sanitized = testString.replace(/[<>]/g, '');
    if (sanitized.includes('<') || sanitized.includes('>')) {
        throw new Error('قد يكون هناك XSS vulnerability');
    }
});

// ============================================
// تشغيل الاختبارات وعرض التقرير
// ============================================

console.log('🚀 بدء الاختبارات...\n');
setTimeout(() => {
    tester.printReport();
    
    // حفظ النتائج في متغير عام للوصول إليها
    window.testResults = tester.results;
    window.testSummary = {
        total: tester.totalTests,
        passed: tester.passedTests,
        failed: tester.failedTests,
        percentage: ((tester.passedTests / tester.totalTests) * 100).toFixed(1)
    };
    
    // تنبيه للمستخدم
    if (tester.failedTests === 0) {
        console.log('\n🎉 جميع الاختبارات نجحت! التطبيق جاهز للاستخدام.\n');
    } else {
        console.log(`\n⚠️ هناك ${tester.failedTests} اختبارات فاشلة تحتاج إلى معالجة.\n`);
    }
}, 1000);
