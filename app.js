// متغيرات عامة
let currentLetterIndex = 0;
let testResults = [];
let studentName = '';
let speechRecognition = null;
let audioRecorder = null;
let isRecording = false;
let recordingStartTime = 0;
let recordingInterval = null;

// العناصر DOM
const welcomeScreen = document.getElementById('welcomeScreen');
const testScreen = document.getElementById('testScreen');
const resultsScreen = document.getElementById('resultsScreen');

const studentNameInput = document.getElementById('studentName');
const startBtn = document.getElementById('startBtn');

const letterChar = document.getElementById('letterChar');
const letterName = document.getElementById('letterName');
const recordBtn = document.getElementById('recordBtn');
const recordText = document.getElementById('recordText');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTime = document.getElementById('recordingTime');
const resultDisplay = document.getElementById('resultDisplay');
const resultContent = document.getElementById('resultContent');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const progressCounter = document.getElementById('progressCounter');
const progressBar = document.getElementById('progressBar');

const masteredCount = document.getElementById('masteredCount');
const unasteredCount = document.getElementById('unasteredCount');
const percentageScore = document.getElementById('percentageScore');
const detailedLettersList = document.getElementById('detailedLettersList');
const needsTrainingSection = document.getElementById('needsTrainingSection');
const needsTrainingList = document.getElementById('needsTrainingList');
const studentResultName = document.getElementById('studentResultName');
const restartBtn = document.getElementById('restartBtn');
const downloadBtn = document.getElementById('downloadBtn');

// تهيئة التطبيق
function initializeApp() {
    try {
        // تهيئة التعرف الصوتي
        speechRecognition = new SpeechRecognition();
        setupSpeechRecognitionListeners();
        
        // تهيئة مسجل الصوت
        audioRecorder = new AudioRecorder();
        
        // ربط الأحداث
        startBtn.addEventListener('click', handleStartTest);
        recordBtn.addEventListener('click', handleRecordToggle);
        nextBtn.addEventListener('click', handleNextLetter);
        skipBtn.addEventListener('click', handleSkipLetter);
        restartBtn.addEventListener('click', handleRestartTest);
        downloadBtn.addEventListener('click', handleDownloadReport);
        
        // السماح بالبدء عند الضغط على Enter
        studentNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleStartTest();
        });
        
        console.log('✅ تم تهيئة التطبيق بنجاح');
    } catch (error) {
        console.error('❌ خطأ في التهيئة:', error);
        alert('حدث خطأ في تهيئة التطبيق. يرجى تحديث الصفحة.');
    }
}

// معالجات الأحداث
function handleStartTest() {
    studentName = studentNameInput.value.trim();
    
    if (!studentName) {
        alert('يرجى إدخال اسم الطالب');
        return;
    }
    
    // إعادة تعيين البيانات
    currentLetterIndex = 0;
    testResults = [];
    
    // الانتقال إلى شاشة الاختبار
    switchScreen(testScreen);
    displayLetter();
}

function handleRecordToggle() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        const microphonePermission = await audioRecorder.startRecording();
        
        if (!microphonePermission) {
            alert('يرجى السماح بالوصول إلى الميكروفون');
            return;
        }
        
        isRecording = true;
        recordingStartTime = Date.now();
        
        // تحديث واجهة التسجيل
        recordBtn.classList.add('recording');
        recordBtn.textContent = '⏹️ إيقاف التسجيل';
        recordingIndicator.classList.remove('hidden');
        
        // بدء مؤقت التسجيل
        recordingInterval = setInterval(updateRecordingTime, 100);
        
        // ملاحظة: يمكن إضافة timeout للتسجيل التلقائي
        setTimeout(() => {
            if (isRecording) {
                stopRecording();
            }
        }, CONFIG.recordingTimeout);
        
        console.log('🎤 بدأ التسجيل');
    } catch (error) {
        console.error('❌ خطأ في بدء التسجيل:', error);
        alert('حدث خطأ في بدء التسجيل. تأكد من السماح بالوصول للميكروفون.');
    }
}

async function stopRecording() {
    isRecording = false;
    clearInterval(recordingInterval);
    
    // إعادة تعيين الزر
    recordBtn.classList.remove('recording');
    recordBtn.textContent = '🎤 ابدأ التسجيل';
    recordingIndicator.classList.add('hidden');
    
    // الحصول على الصوت المسجل
    const audioUrl = await audioRecorder.stopRecording();
    
    console.log('⏹️ تم إيقاف التسجيل');
    
    // بدء التعرف الصوتي
    startSpeechRecognition();
}

function updateRecordingTime() {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    recordingTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startSpeechRecognition() {
    recordBtn.disabled = true;
    recordBtn.textContent = '⏳ جاري التحليل...';
    
    speechRecognition.startListening();
}

function setupSpeechRecognitionListeners() {
    speechRecognition.on('result', (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        if (finalTranscript) {
            console.log('📝 النتيجة النهائية:', finalTranscript);
            analyzeAnswer(finalTranscript);
        }
    });
    
    speechRecognition.on('error', (event) => {
        console.error('❌ خطأ في التعرف الصوتي:', event.error);
        recordBtn.disabled = false;
        recordBtn.textContent = '🎤 ابدأ التسجيل';
        
        let errorMessage = 'حدث خطأ في التعرف الصوتي. ';
        switch(event.error) {
            case 'no-speech':
                errorMessage += 'لم يتم اكتشاف كلام. حاول مرة أخرى.';
                break;
            case 'network':
                errorMessage += 'تحقق من اتصالك بالإنترنت.';
                break;
            default:
                errorMessage += 'حاول مرة أخرى.';
        }
        
        showResult(false, errorMessage);
    });
    
    speechRecognition.on('end', () => {
        recordBtn.disabled = false;
        recordBtn.textContent = '🎤 ابدأ التسجيل';
    });
}

function analyzeAnswer(userInput) {
    const currentLetter = ARABIC_LETTERS[currentLetterIndex];
    const analysis = ResultAnalyzer.analyzeAnswer(userInput, currentLetter);
    
    // حفظ النتيجة
    testResults.push({
        index: currentLetterIndex,
        letter: currentLetter.letter,
        letterName: currentLetter.name,
        userInput: userInput,
        isCorrect: analysis.isCorrect,
        confidence: analysis.confidence,
        matchType: analysis.matchType
    });
    
    console.log('✅ تحليل الإجابة:', {
        letter: currentLetter.letter,
        name: currentLetter.name,
        userInput,
        correct: analysis.isCorrect,
        confidence: (analysis.confidence * 100).toFixed(1) + '%'
    });
    
    // عرض النتيجة
    if (analysis.isCorrect) {
        showResult(true, `✅ صحيح! ${currentLetter.name}`);
    } else {
        showResult(false, `❌ غير صحيح. الحرف الصحيح: ${currentLetter.name}`);
    }
}

function showResult(isCorrect, message) {
    resultDisplay.classList.remove('hidden');
    resultDisplay.classList.toggle('correct', isCorrect);
    resultDisplay.classList.toggle('incorrect', !isCorrect);
    
    resultContent.innerHTML = `<span class="${isCorrect ? 'correct-text' : 'incorrect-text'}">${message}</span>`;
    
    // إظهار زر التالي
    nextBtn.style.display = 'block';
}

function handleNextLetter() {
    currentLetterIndex++;
    resultDisplay.classList.add('hidden');
    
    if (currentLetterIndex >= ARABIC_LETTERS.length) {
        showResults();
    } else {
        displayLetter();
    }
}

function handleSkipLetter() {
    // حفظ كحرف غير متقن (تخطي)
    const currentLetter = ARABIC_LETTERS[currentLetterIndex];
    testResults.push({
        index: currentLetterIndex,
        letter: currentLetter.letter,
        letterName: currentLetter.name,
        userInput: 'تخطي',
        isCorrect: false,
        confidence: 0,
        matchType: 'skipped'
    });
    
    currentLetterIndex++;
    resultDisplay.classList.add('hidden');
    
    if (currentLetterIndex >= ARABIC_LETTERS.length) {
        showResults();
    } else {
        displayLetter();
    }
}

function displayLetter() {
    const currentLetter = ARABIC_LETTERS[currentLetterIndex];
    
    letterChar.textContent = currentLetter.letter;
    letterName.textContent = currentLetter.name;
    
    // تحديث شريط التقدم
    const progress = ((currentLetterIndex + 1) / CONFIG.totalLetters) * 100;
    progressBar.style.width = progress + '%';
    progressCounter.textContent = `${currentLetterIndex + 1} / ${CONFIG.totalLetters}`;
    
    // إعادة تعيين واجهة التسجيل
    recordBtn.disabled = false;
    recordBtn.textContent = '🎤 ابدأ التسجيل';
    recordBtn.classList.remove('recording');
    resultDisplay.classList.add('hidden');
    recordingIndicator.classList.add('hidden');
}

function showResults() {
    // حساب الإحصائيات
    const correctAnswers = testResults.filter(r => r.isCorrect).length;
    const incorrectAnswers = testResults.filter(r => !r.isCorrect).length;
    const percentage = Math.round((correctAnswers / testResults.length) * 100);
    
    // تحديث البيانات
    masteredCount.textContent = correctAnswers;
    unasteredCount.textContent = incorrectAnswers;
    percentageScore.textContent = `${percentage}%`;
    studentResultName.textContent = `نتائج الطالب: ${studentName}`;
    
    // عرض نتائج الحروف التفصيلية
    displayDetailedResults();
    
    // عرض الحروف التي تحتاج تدريب
    displayNeedsTrainingSection();
    
    // حفظ النتائج
    DataManager.saveResults(studentName, testResults);
    
    // الانتقال إلى شاشة النتائج
    switchScreen(resultsScreen);
}

function displayDetailedResults() {
    detailedLettersList.innerHTML = '';
    
    testResults.forEach(result => {
        const letterElement = document.createElement('div');
        letterElement.className = `letter-result ${result.isCorrect ? 'correct' : 'incorrect'}`;
        
        const statusIcon = result.isCorrect ? '✓' : '✗';
        const statusText = result.isCorrect ? 'متقن' : 'غير متقن';
        
        letterElement.innerHTML = `
            <div class="letter-result-char">${result.letter}</div>
            <div class="letter-result-status">${statusIcon} ${statusText}</div>
        `;
        
        // إضافة tooltip عند التمرير
        letterElement.title = `${result.letterName}\nالإجابة: ${result.userInput}\nالنوع: ${result.matchType}`;
        
        detailedLettersList.appendChild(letterElement);
    });
}

function displayNeedsTrainingSection() {
    const incorrectLetters = testResults.filter(r => !r.isCorrect);
    
    if (incorrectLetters.length === 0) {
        needsTrainingSection.classList.add('hidden');
        return;
    }
    
    needsTrainingSection.classList.remove('hidden');
    needsTrainingList.innerHTML = '';
    
    incorrectLetters.forEach(result => {
        const letterTag = document.createElement('span');
        letterTag.className = 'training-letter';
        letterTag.textContent = result.letter;
        needsTrainingList.appendChild(letterTag);
    });
}

function handleRestartTest() {
    // إعادة تعيين جميع البيانات
    studentNameInput.value = '';
    currentLetterIndex = 0;
    testResults = [];
    studentName = '';
    isRecording = false;
    
    // العودة إلى شاشة الترحيب
    switchScreen(welcomeScreen);
    studentNameInput.focus();
}

function handleDownloadReport() {
    if (!testResults.length) {
        alert('لا توجد نتائج للتحميل');
        return;
    }
    
    const correctAnswers = testResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctAnswers / testResults.length) * 100);
    
    const report = {
        studentName,
        testDate: new Date().toISOString(),
        totalLetters: testResults.length,
        masteredLetters: correctAnswers,
        unMasteredLetters: testResults.length - correctAnswers,
        percentage,
        masteredLettersList: testResults.filter(r => r.isCorrect).map(r => r.letter).join(', '),
        unMasteredLettersList: testResults.filter(r => !r.isCorrect).map(r => r.letter).join(', '),
        detailedResults: testResults.map(r => ({
            letter: r.letter,
            name: r.letterName,
            status: r.isCorrect ? 'متقن' : 'غير متقن',
            userInput: r.userInput,
            matchType: r.matchType
        }))
    };
    
    DataManager.exportAsJSON(report);
}

function switchScreen(targetScreen) {
    // إخفاء جميع الشاشات
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // إظهار الشاشة المستهدفة
    targetScreen.classList.add('active');
}

// بدء التطبيق عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// معالجة أخطاء عدم اكتشاف Web Speech API
window.addEventListener('load', () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        console.warn('⚠️ Web Speech API غير مدعوم في هذا المتصفح');
        alert('هذا المتصفح لا يدعم التعرف الصوتي. يرجى استخدام Chrome أو Edge أو Safari.');
    }
});
