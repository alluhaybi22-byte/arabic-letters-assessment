// ============================================
// المرحلة 3: نظام الأمان والتحقق من الصحة
// ============================================

/**
 * فئة ValidationSystem
 * نظام التحقق الشامل من صحة البيانات والإدخالات
 */
class ValidationSystem {
    /**
     * التحقق من صحة اسم الطالب
     * @param {string} name - اسم الطالب
     * @returns {object} {isValid, errors, warnings}
     */
    static validateStudentName(name) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            sanitized: ''
        };

        // التحقق من الوجود
        if (!name || typeof name !== 'string') {
            result.isValid = false;
            result.errors.push('اسم الطالب مطلوب ويجب أن يكون نصياً');
            return result;
        }

        // تنظيف الإدخال
        let sanitized = name.trim();

        // التحقق من الطول
        if (sanitized.length < 2) {
            result.isValid = false;
            result.errors.push('اسم الطالب يجب أن يكون أطول من حرفين');
        }

        if (sanitized.length > 100) {
            result.isValid = false;
            result.errors.push('اسم الطالب يجب ألا يتجاوز 100 حرف');
        }

        // التحقق من الأحرف المسموحة (عربي وإنجليزي والمسافات)
        const validPattern = /^[\u0600-\u06FFa-zA-Z\s\-'.]+$/;
        if (!validPattern.test(sanitized)) {
            result.isValid = false;
            result.errors.push('اسم الطالب يحتوي على أحرف غير مسموحة');
        }

        // تحذير من الأحرف الكثيرة المتكررة
        const repeatedChars = /(.)\1{4,}/;
        if (repeatedChars.test(sanitized)) {
            result.warnings.push('اسم الطالب يحتوي على أحرف متكررة كثيرة');
        }

        result.sanitized = sanitized;
        return result;
    }

    /**
     * التحقق من صحة إجابة الطالب
     * @param {string} answer - الإجابة
     * @returns {object} {isValid, errors, sanitized}
     */
    static validateAnswer(answer) {
        const result = {
            isValid: true,
            errors: [],
            sanitized: ''
        };

        if (!answer || typeof answer !== 'string') {
            result.isValid = false;
            result.errors.push('الإجابة مطلوبة');
            return result;
        }

        let sanitized = answer.trim();

        if (sanitized.length === 0) {
            result.isValid = false;
            result.errors.push('الإجابة لا يمكن أن تكون فارغة');
            return result;
        }

        if (sanitized.length > 50) {
            result.isValid = false;
            result.errors.push('الإجابة طويلة جداً');
        }

        // التحقق من أن الإجابة تحتوي على أحرف عربية أو إنجليزية
        const validPattern = /^[\u0600-\u06FFa-zA-Z\s]+$/;
        if (!validPattern.test(sanitized)) {
            result.isValid = false;
            result.errors.push('الإجابة تحتوي على أحرف غير مسموحة');
        }

        result.sanitized = sanitized;
        return result;
    }

    /**
     * التحقق من صحة البيانات المحفوظة
     * @param {array} data - البيانات المحفوظة
     * @returns {object} {isValid, errors, warnings}
     */
    static validateStoredData(data) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!Array.isArray(data)) {
            result.isValid = false;
            result.errors.push('البيانات يجب أن تكون مصفوفة');
            return result;
        }

        if (data.length === 0) {
            result.warnings.push('لا توجد بيانات محفوظة');
            return result;
        }

        if (data.length > 1000) {
            result.warnings.push('كمية البيانات المحفوظة كبيرة جداً');
        }

        data.forEach((item, index) => {
            if (!item.letter || !('isCorrect' in item)) {
                result.isValid = false;
                result.errors.push(`البيانات رقم ${index} غير صحيحة`);
            }
        });

        return result;
    }

    /**
     * التحقق من صحة JSON
     * @param {string} jsonString - نص JSON
     * @returns {object} {isValid, errors, data}
     */
    static validateJSON(jsonString) {
        const result = {
            isValid: true,
            errors: [],
            data: null
        };

        if (!jsonString || typeof jsonString !== 'string') {
            result.isValid = false;
            result.errors.push('JSON يجب أن يكون نصياً');
            return result;
        }

        try {
            result.data = JSON.parse(jsonString);
        } catch (error) {
            result.isValid = false;
            result.errors.push(`خطأ في صيغة JSON: ${error.message}`);
        }

        return result;
    }
}

/**
 * فئة SecuritySystem
 * نظام الأمان والحماية من الثغرات
 */
class SecuritySystem {
    /**
     * حماية من XSS (Cross-Site Scripting)
     * @param {string} text - النص المراد حمايته
     * @returns {string} النص المحمي
     */
    static sanitizeHTML(text) {
        if (typeof text !== 'string') return '';

        const element = document.createElement('div');
        element.textContent = text;
        return element.innerHTML;
    }

    /**
     * حماية من Injection Attacks
     * @param {string} input - الإدخال
     * @returns {string} الإدخال المحمي
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') return '';

        return input
            .replace(/[<>\"'&]/g, (char) => {
                const map = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;'
                };
                return map[char];
            });
    }

    /**
     * التحقق من سلامة URL
     * @param {string} url - الـ URL
     * @returns {boolean} هل الـ URL آمن
     */
    static isSafeURL(url) {
        if (typeof url !== 'string') return false;

        try {
            const urlObj = new URL(url, window.location.href);
            // السماح فقط بـ http و https
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * تشفير البيانات الحساسة (بسيط - استخدم مكتبة متقدمة في الإنتاج)
     * @param {string} data - البيانات
     * @param {string} key - المفتاح
     * @returns {string} البيانات المشفرة
     */
    static encryptData(data, key) {
        if (typeof data !== 'string' || typeof key !== 'string') return '';

        // استخدم Base64 كطريقة بسيطة للتشفير
        // في الإنتاج، استخدم مكتبة تشفير متقدمة مثل crypto-js
        try {
            return btoa(data + '||' + key);
        } catch {
            return '';
        }
    }

    /**
     * فك تشفير البيانات
     * @param {string} encrypted - البيانات المشفرة
     * @param {string} key - المفتاح
     * @returns {string} البيانات الأصلية
     */
    static decryptData(encrypted, key) {
        if (typeof encrypted !== 'string' || typeof key !== 'string') return '';

        try {
            const decrypted = atob(encrypted);
            const [data, originalKey] = decrypted.split('||');
            
            if (originalKey === key) {
                return data;
            }
            return ''; // مفتاح خاطئ
        } catch {
            return '';
        }
    }

    /**
     * توليد token عشوائي آمن
     * @param {number} length - طول الـ token
     * @returns {string} الـ token
     */
    static generateSecureToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';

        // استخدم crypto API إذا كانت متاحة
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(length);
            window.crypto.getRandomValues(array);
            return Array.from(array, byte => chars[byte % chars.length]).join('');
        }

        // fallback للطريقة التقليدية
        for (let i = 0; i < length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    /**
     * التحقق من CSRF Token
     * @param {string} token - الـ token
     * @returns {boolean} هل الـ token صحيح
     */
    static verifyCsrfToken(token) {
        if (typeof token !== 'string' || token.length !== 32) {
            return false;
        }

        // تحقق من أن الـ token يطابق ما يتم تخزينه في الجلسة
        const storedToken = sessionStorage.getItem('csrf_token');
        return storedToken === token;
    }

    /**
     * حماية من Timing Attacks
     * @param {string} a - القيمة الأولى
     * @param {string} b - القيمة الثانية
     * @returns {boolean} هل القيم متساوية
     */
    static secureCompare(a, b) {
        if (typeof a !== 'string' || typeof b !== 'string') return false;

        if (a.length !== b.length) return false;

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        return result === 0;
    }
}

/**
 * فئة RateLimiter
 * نظام تحديد معدل الطلبات (تجنب الإساءة)
 */
class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    /**
     * التحقق من السماح بالطلب
     * @param {string} identifier - معرّف المستخدم أو IP
     * @returns {boolean} هل يسمح بالطلب
     */
    isAllowed(identifier) {
        const now = Date.now();
        const userRequests = this.requests.get(identifier) || [];

        // إزالة الطلبات القديمة
        const recentRequests = userRequests.filter(time => now - time < this.windowMs);

        if (recentRequests.length >= this.maxRequests) {
            return false;
        }

        recentRequests.push(now);
        this.requests.set(identifier, recentRequests);

        return true;
    }

    /**
     * الحصول على عدد الطلبات المتبقية
     * @param {string} identifier - معرّف المستخدم
     * @returns {number} عدد الطلبات المتبقية
     */
    getRemaining(identifier) {
        const now = Date.now();
        const userRequests = this.requests.get(identifier) || [];
        const recentRequests = userRequests.filter(time => now - time < this.windowMs);

        return Math.max(0, this.maxRequests - recentRequests.length);
    }

    /**
     * تنظيف الطلبات القديمة
     */
    cleanup() {
        const now = Date.now();
        for (const [identifier, requests] of this.requests) {
            const recentRequests = requests.filter(time => now - time < this.windowMs);
            if (recentRequests.length === 0) {
                this.requests.delete(identifier);
            } else {
                this.requests.set(identifier, recentRequests);
            }
        }
    }
}

/**
 * فئة InputSanitizer
 * نظام تنظيف وتطهير الإدخالات
 */
class InputSanitizer {
    /**
     * تنظيف الإدخالات العربية
     * @param {string} text - النص
     * @returns {string} النص المنظف
     */
    static sanitizeArabic(text) {
        if (typeof text !== 'string') return '';

        let sanitized = text.trim();

        // إزالة الفراغات الزائدة
        sanitized = sanitized.replace(/\s+/g, ' ');

        // إزالة الحروف الخاصة غير المرغوبة
        sanitized = sanitized.replace(/[^\u0600-\u06FF\s\-'.]/g, '');

        // تطبيع النقاط والفواصل
        sanitized = sanitized.replace(/[\u060B\u066B\u066C]/g, ',');

        return sanitized;
    }

    /**
     * تنظيف الإدخالات الإنجليزية
     * @param {string} text - النص
     * @returns {string} النص المنظف
     */
    static sanitizeEnglish(text) {
        if (typeof text !== 'string') return '';

        let sanitized = text.trim();

        // إزالة الفراغات الزائدة
        sanitized = sanitized.replace(/\s+/g, ' ');

        // السماح فقط بالأحرف الإنجليزية والأرقام والمسافات
        sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'.]/g, '');

        return sanitized;
    }

    /**
     * تنظيف الأرقام
     * @param {string} number - الرقم
     * @returns {string} الرقم المنظف
     */
    static sanitizeNumber(number) {
        if (typeof number !== 'string') return '';

        // إزالة جميع الأحرف غير الرقمية
        return number.replace(/[^\d]/g, '');
    }

    /**
     * تنظيف البريد الإلكتروني
     * @param {string} email - البريد الإلكتروني
     * @returns {string} البريد المنظف
     */
    static sanitizeEmail(email) {
        if (typeof email !== 'string') return '';

        return email
            .trim()
            .toLowerCase()
            .replace(/[^\w\-_.+@]/g, '');
    }

    /**
     * التحقق من صحة البريد الإلكتروني
     * @param {string} email - البريد الإلكتروني
     * @returns {boolean} هل البريد صحيح
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

/**
 * فئة AuditLogger
 * نظام تسجيل الأنشطة للأمان والمراقبة
 */
class AuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
    }

    /**
     * تسجيل حدث أمني
     * @param {string} action - الإجراء
     * @param {string} details - التفاصيل
     * @param {string} level - مستوى الخطورة (info, warning, error)
     */
    log(action, details = '', level = 'info') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action,
            details,
            level,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.logs.push(logEntry);

        // حفظ في localStorage للحفظ الدائم
        this.saveToStorage();

        // تنبيه على الأخطاء الخطيرة
        if (level === 'error') {
            console.error(`[SECURITY ALERT] ${action}: ${details}`);
        } else if (level === 'warning') {
            console.warn(`[SECURITY WARNING] ${action}: ${details}`);
        }

        // تحديد حد أقصى للسجلات
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    /**
     * حفظ السجلات في localStorage
     */
    saveToStorage() {
        try {
            const storageKey = 'security_audit_logs';
            localStorage.setItem(storageKey, JSON.stringify(this.logs.slice(-100))); // احفظ آخر 100 سجل
        } catch (e) {
            console.error('فشل حفظ السجلات:', e);
        }
    }

    /**
     * استرجاع السجلات
     * @param {number} limit - عدد السجلات المسترجعة
     * @returns {array} السجلات
     */
    getLogs(limit = 50) {
        return this.logs.slice(-limit);
    }

    /**
     * البحث عن السجلات
     * @param {string} action - الإجراء
     * @returns {array} السجلات المطابقة
     */
    searchLogs(action) {
        return this.logs.filter(log => log.action.includes(action));
    }

    /**
     * مسح السجلات
     */
    clearLogs() {
        this.logs = [];
        try {
            localStorage.removeItem('security_audit_logs');
        } catch (e) {
            console.error('فشل مسح السجلات:', e);
        }
    }
}

/**
 * إنشاء نوى عامة من الأنظمة
 */
const globalValidation = new ValidationSystem();
const globalSecurity = new SecuritySystem();
const globalRateLimiter = new RateLimiter(100, 60000); // 100 طلب في الدقيقة
const globalAuditLogger = new AuditLogger();

// ============================================
// اختبارات أمان المرحلة 3
// ============================================

console.log('✅ نظام الأمان والتحقق من الصحة تم تحميله بنجاح');

// أمثلة على الاستخدام:
// ValidationSystem.validateStudentName('أحمد محمد');
// SecuritySystem.sanitizeHTML('<script>alert("XSS")</script>');
// globalRateLimiter.isAllowed('user123');
// globalAuditLogger.log('login', 'المستخدم قام بالدخول', 'info');
