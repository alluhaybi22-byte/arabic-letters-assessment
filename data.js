// بيانات الحروف العربية
const ARABIC_LETTERS = [
    { letter: 'ا', name: 'الألف', alternatives: ['الف', 'ألف'] },
    { letter: 'ب', name: 'الباء', alternatives: ['باء', 'با'] },
    { letter: 'ت', name: 'التاء', alternatives: ['تاء', 'تا'] },
    { letter: 'ث', name: 'الثاء', alternatives: ['ثاء', 'ثا'] },
    { letter: 'ج', name: 'الجيم', alternatives: ['جيم', 'جي'] },
    { letter: 'ح', name: 'الحاء', alternatives: ['حاء', 'حا'] },
    { letter: 'خ', name: 'الخاء', alternatives: ['خاء', 'خا'] },
    { letter: 'د', name: 'الدال', alternatives: ['دال', 'دا'] },
    { letter: 'ذ', name: 'الذال', alternatives: ['ذال', 'ذا'] },
    { letter: 'ر', name: 'الراء', alternatives: ['راء', 'را'] },
    { letter: 'ز', name: 'الزاي', alternatives: ['زاي', 'زا'] },
    { letter: 'س', name: 'السين', alternatives: ['سين', 'سي'] },
    { letter: 'ش', name: 'الشين', alternatives: ['شين', 'شي'] },
    { letter: 'ص', name: 'الصاد', alternatives: ['صاد', 'صا'] },
    { letter: 'ض', name: 'الضاد', alternatives: ['ضاد', 'ضا'] },
    { letter: 'ط', name: 'الطاء', alternatives: ['طاء', 'طا'] },
    { letter: 'ظ', name: 'الظاء', alternatives: ['ظاء', 'ظا'] },
    { letter: 'ع', name: 'العين', alternatives: ['عين', 'عي'] },
    { letter: 'غ', name: 'الغين', alternatives: ['غين', 'غي'] },
    { letter: 'ف', name: 'الفاء', alternatives: ['فاء', 'فا'] },
    { letter: 'ق', name: 'القاف', alternatives: ['قاف', 'قا'] },
    { letter: 'ك', name: 'الكاف', alternatives: ['كاف', 'كا'] },
    { letter: 'ل', name: 'اللام', alternatives: ['لام', 'لا'] },
    { letter: 'م', name: 'الميم', alternatives: ['ميم', 'مي'] },
    { letter: 'ن', name: 'النون', alternatives: ['نون', 'نو'] },
    { letter: 'هـ', name: 'الهاء', alternatives: ['هاء', 'ها', 'ه'] },
    { letter: 'و', name: 'الواو', alternatives: ['واو', 'وا'] },
    { letter: 'ي', name: 'الياء', alternatives: ['ياء', 'يا'] }
];

// الإعدادات
const CONFIG = {
    totalLetters: 28,
    recordingTimeout: 5000, // 5 ثواني
    silenceTimeout: 1500,   // انتظار 1.5 ثانية بعد التوقف
    confidenceThreshold: 0.6, // حد أدنى للثقة في التعرف
    language: 'ar-SA'
};

// مساعد للمعالجة الصوتية
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            return true;
        } catch (error) {
            console.error('خطأ في الوصول للميكروفون:', error);
            return false;
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) {
                resolve(null);
                return;
            }
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                this.isRecording = false;
                resolve(audioUrl);
            };
            
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });
    }
}

// معالج التعرف الصوتي
class SpeechRecognition {
    constructor() {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.lang = CONFIG.language;
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.isListening = false;
        this.transcript = '';
    }

    startListening() {
        this.transcript = '';
        this.isListening = true;
        this.recognition.start();
    }

    stopListening() {
        this.isListening = false;
        this.recognition.stop();
    }

    on(event, callback) {
        this.recognition.addEventListener(event, callback);
    }

    abort() {
        this.recognition.abort();
        this.isListening = false;
    }
}

// معالج النتائج
class ResultAnalyzer {
    static analyzeAnswer(userInput, targetLetter) {
        const input = userInput.trim().toLowerCase();
        const target = targetLetter.name.toLowerCase();
        const alternatives = targetLetter.alternatives.map(alt => alt.toLowerCase());

        // تحقق من التطابق التام
        if (input === target) {
            return {
                isCorrect: true,
                confidence: 1.0,
                matchType: 'exact'
            };
        }

        // تحقق من البدائل
        for (const alt of alternatives) {
            if (input === alt) {
                return {
                    isCorrect: true,
                    confidence: 0.95,
                    matchType: 'alternative'
                };
            }
        }

        // تحقق من التشابه الجزئي (مطابقة ضبابية)
        const similarity = this.calculateSimilarity(input, target);
        if (similarity > CONFIG.confidenceThreshold) {
            return {
                isCorrect: true,
                confidence: similarity,
                matchType: 'partial'
            };
        }

        return {
            isCorrect: false,
            confidence: similarity,
            matchType: 'incorrect'
        };
    }

    static calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    static getEditDistance(s1, s2) {
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }
}

// مدير البيانات المحلية
class DataManager {
    static saveResults(studentName, results) {
        const data = {
            studentName,
            results,
            date: new Date().toISOString(),
            totalScore: results.filter(r => r.isCorrect).length,
            percentage: Math.round((results.filter(r => r.isCorrect).length / results.length) * 100)
        };
        localStorage.setItem('testResults', JSON.stringify(data));
        return data;
    }

    static getResults() {
        const data = localStorage.getItem('testResults');
        return data ? JSON.parse(data) : null;
    }

    static clearResults() {
        localStorage.removeItem('testResults');
    }

    static exportAsJSON(data) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
        element.setAttribute('download', `نتائج-${data.studentName}-${new Date().toISOString().split('T')[0]}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}
