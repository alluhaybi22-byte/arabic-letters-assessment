# 🎨 دليل الواجهة الرسومية المتقدمة

## نظرة عامة
دليل شامل لنظام الواجهة الرسومية (UI) المتقدم الذي يوفر تجربة مستخدم سلسة وجميلة.

---

## 📋 محتويات الدليل

1. [مدير الواجهة الرسومية](#مدير-الواجهة-الرسومية)
2. [نظام الشاشات](#نظام-الشاشات)
3. [المكونات الأساسية](#المكونات-الأساسية)
4. [نظام الرسوميات](#نظام-الرسوميات)
5. [أمثلة عملية](#أمثلة-عملية)

---

## مدير الواجهة الرسومية

### UIManager Class

```javascript
class UIManager {
    constructor() {
        this.currentScreen = 'login';
        this.screens = {};           // الشاشات المسجلة
        this.components = {};        // المكونات المسجلة
        this.animations = new AnimationEngine();
        this.theme = 'light';        // المظهر الحالي
        this.isInitialized = false;
    }
}
```

### الوظائف الرئيسية

#### 1. تهيئة المدير

```javascript
ui.initialize();

// يقوم بـ:
// ✅ تسجيل جميع الشاشات
// ✅ تسجيل جميع المكونات
// ✅ إعداد مستمعي الأحداث
// ✅ تطبيق المظهر الافتراضي
```

#### 2. عرض شاشة

```javascript
ui.renderScreen('dashboard');

// الشاشات المتاحة:
// - login: شاشة تسجيل الدخول
// - register: شاشة التسجيل
// - dashboard: لوحة التحكم
// - test: شاشة الاختبار
// - results: شاشة النتائج
// - history: السجل التاريخي
// - settings: الإعدادات
```

#### 3. تطبيق المظهر

```javascript
ui.applyTheme('dark');  // تبديل إلى المظهر الداكن
ui.applyTheme('light'); // تبديل إلى المظهر الفاتح

// يتم حفظ المظهر في localStorage
// المظهر يتم تطبيقه على جميع الشاشات
```

#### 4. إظهار إشعار

```javascript
ui.showNotification({
    message: 'تم تسجيل الدخول بنجاح',
    type: 'success',      // 'success', 'error', 'info'
    duration: 3000        // المدة بالميلي ثانية
});

// أمثلة على الأنواع:
// ✅ success - لون أخضر
// ❌ error - لون أحمر
// ℹ️ info - لون أزرق
```

#### 5. إظهار مربع حوار

```javascript
ui.showModal({
    title: 'تأكيد الحذف',
    content: 'هل أنت متأكد من الحذف؟',
    buttons: [
        {
            text: 'نعم',
            action: () => { /* ... */ }
        },
        {
            text: 'لا',
            action: () => { /* ... */ }
        }
    ]
});
```

#### 6. إدارة الـ Spinner

```javascript
ui.showSpinner();    // إظهار مؤشر التحميل
ui.hideSpinner();    // إخفاء مؤشر التحميل

// مثال:
ui.showSpinner();
setTimeout(() => {
    // عملية ما
    ui.hideSpinner();
}, 2000);
```

---

## نظام الشاشات

### BaseScreen Class

جميع الشاشات ترث من هذه الفئة الأساسية:

```javascript
class BaseScreen {
    constructor(name) {
        this.name = name;
        this.elements = {};
    }

    render() {
        // يجب أن تُرجع HTML
        return '<div>...</div>';
    }

    initialize() {
        // يتم استدعاؤها بعد render()
        // لربط مستمعي الأحداث
    }
}
```

### 1. شاشة تسجيل الدخول (LoginScreen)

```javascript
// الميزات:
✅ نموذج تسجيل دخول
✅ التحقق من البيانات
✅ رابط لإنشاء حساب جديد
✅ الإشعارات عند النجاح/الفشل

// الاستخدام:
ui.renderScreen('login');
```

**تدفق العمل:**
```
المستخدم → إدخال البيانات → التحقق → تسجيل الدخول → الانتقال للـ Dashboard
```

### 2. شاشة التسجيل (RegisterScreen)

```javascript
// الميزات:
✅ نموذج إنشاء حساب
✅ التحقق من تطابق كلمات المرور
✅ رابط لتسجيل الدخول
✅ الإشعارات عند النجاح/الفشل

// الاستخدام:
ui.renderScreen('register');
```

### 3. لوحة التحكم (DashboardScreen)

```javascript
// الميزات:
✅ ترحيب شخصي
✅ عرض الإحصائيات
✅ أزرار سريعة للإجراءات
✅ عرض النتائج الأخيرة

// الإحصائيات المعروضة:
- عدد الجلسات المكتملة
- متوسط الدقة
- السلسلة الحالية

// الاستخدام:
ui.renderScreen('dashboard');
```

### 4. شاشة الاختبار (TestScreen)

```javascript
// الميزات:
✅ عرض الحرف الحالي
✅ شريط تقدم
✅ خيارات متعددة
✅ إحصائيات فورية
✅ إمكانية الخروج

// التحكم:
- اختر الإجابة الصحيحة
- اضغط "التالي" للسؤال التالي
- اضغط "✕" للخروج

// الاستخدام:
ui.renderScreen('test');
```

**تدفق الاختبار:**
```
بدء الجلسة → عرض السؤال → اختيار الإجابة → التالي → النتيجة
```

### 5. شاشة النتائج (ResultsScreen)

```javascript
// الميزات:
✅ عرض النسبة المئوية
✅ عرض الإجابات الصحيحة/الخاطئة
✅ تقرير تفصيلي
✅ زر للعودة للـ Dashboard

// البيانات المعروضة:
- الدقة الكلية (%)
- عدد الإجابات الصحيحة
- عدد الإجابات الخاطئة
- الوقت المستغرق

// الاستخدام:
ui.renderScreen('results');
```

### 6. شاشة السجل التاريخي (HistoryScreen)

```javascript
// الميزات:
✅ قائمة الجلسات السابقة
✅ تفاصيل كل جلسة
✅ إمكانية المقارنة

// البيانات المعروضة:
- تاريخ الجلسة
- الدقة الكلية
- عدد الأسئلة

// الاستخدام:
ui.renderScreen('history');
```

### 7. شاشة الإعدادات (SettingsScreen)

```javascript
// الميزات:
✅ تبديل المظهر
✅ تسجيل الخروج
✅ خيارات أخرى

// الاستخدام:
ui.renderScreen('settings');
```

---

## المكونات الأساسية

### 1. NotificationComponent

```javascript
ui.showNotification({
    message: 'الرسالة',
    type: 'success',      // success, error, info
    duration: 3000,       // المدة بالميلي ثانية
    position: 'top-right' // موضع الإشعار
});
```

**الأنواع:**
- `success` ✅ - أخضر (#27ae60)
- `error` ❌ - أحمر (#e74c3c)
- `info` ℹ️ - أزرق (#3498db)

### 2. ModalComponent

```javascript
ui.showModal({
    title: 'العنوان',
    content: 'محتوى المربع',
    buttons: [
        { text: 'نعم', action: () => {} },
        { text: 'لا', action: () => {} }
    ]
});

// إغلاق المربع:
ui.components.modal.close();
```

### 3. ProgressBarComponent

```javascript
ui.updateProgress(5, 28);  // 5 من 28

// يتم تحديث شريط التقدم تلقائياً
// النسبة: (5/28) * 100 = 17.86%
```

### 4. SpinnerComponent

```javascript
// إظهار مؤشر التحميل
ui.showSpinner();

// إخفاء مؤشر التحميل
ui.hideSpinner();
```

### 5. TooltipComponent

```javascript
ui.showTooltip('نص التلميح', element);

// يظهر فوق العنصر المحدد
```

---

## نظام الرسوميات

### AnimationEngine Class

```javascript
class AnimationEngine {
    fadeOut(element, duration = 300)      // تلاشي للخارج
    fadeIn(element, duration = 300)       // تلاشي للداخل
    slideIn(element, direction, duration) // انزلاق
    scaleIn(element, duration)            // تكبير
}
```

### أمثلة على الرسوميات

```javascript
// تلاشي للخارج
ui.animations.fadeOut(element, 300);

// تلاشي للداخل
ui.animations.fadeIn(element, 300);

// انزلاق من اليسار
ui.animations.slideIn(element, 'left', 300);

// انزلاق من اليمين
ui.animations.slideIn(element, 'right', 300);

// تكبير مع تلاشي
ui.animations.scaleIn(element, 300);
```

---

## اختصارات لوحة المفاتيح

| الاختصار | الفعل |
|---------|-------|
| `Ctrl/Cmd + D` | تبديل المظهر الداكن/الفاتح |
| `Escape` | إغلاق مربع الحوار |

---

## أمثلة عملية

### مثال 1: جلسة اختبار كاملة

```javascript
// 1. تهيئة الواجهة
ui.initialize();

// 2. عرض شاشة تسجيل الدخول
ui.renderScreen('login');

// بعد تسجيل الدخول الناجح:
// 3. عرض لوحة التحكم
ui.renderScreen('dashboard');

// عند الضغط على "اختبار جديد":
// 4. عرض شاشة الاختبار
ui.renderScreen('test');

// بعد إنهاء الاختبار:
// 5. عرض النتائج
ui.renderScreen('results');
```

### مثال 2: التعامل مع الأخطاء

```javascript
// عند فشل تسجيل الدخول:
ui.showNotification({
    message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    type: 'error',
    duration: 4000
});

// عند نجاح العملية:
ui.showNotification({
    message: 'تم تسجيل الدخول بنجاح',
    type: 'success',
    duration: 2000
});
```

### مثال 3: تطبيق المظهر الداكن

```javascript
// الحصول على المظهر الحالي
console.log(ui.theme); // 'light' أو 'dark'

// تبديل المظهر
if (ui.theme === 'light') {
    ui.applyTheme('dark');
} else {
    ui.applyTheme('light');
}

// تطبيق المظهر المحفوظ عند تحميل الصفحة
const savedTheme = localStorage.getItem('theme') || 'light';
ui.applyTheme(savedTheme);
```

### مثال 4: إظهار مربع تأكيد

```javascript
ui.showModal({
    title: 'تأكيد إنهاء الاختبار',
    content: 'هل تريد بالفعل إنهاء الاختبار؟ سيتم فقدان التقدم الحالي.',
    buttons: [
        {
            text: 'نعم، انهِ الاختبار',
            action: () => {
                ui.renderScreen('dashboard');
                ui.components.modal.close();
            }
        },
        {
            text: 'لا، استمر في الاختبار',
            action: () => {
                ui.components.modal.close();
            }
        }
    ]
});
```

### مثال 5: عملية تحميل مع Spinner

```javascript
// إظهار مؤشر التحميل
ui.showSpinner();

// محاكاة عملية ما
setTimeout(() => {
    // إخفاء مؤشر التحميل
    ui.hideSpinner();
    
    // عرض النتيجة
    ui.showNotification({
        message: 'تمت العملية بنجاح',
        type: 'success'
    });
}, 2000);
```

---

## دورة حياة الشاشة

```
┌─────────────────────────────────────┐
│ استدعاء ui.renderScreen('name')    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ البحث عن الشاشة في المسجلة          │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ استدعاء الدالة render()            │
│ → إرجاع HTML                        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ وضع HTML في #app-container        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ استدعاء الدالة initialize()        │
│ → ربط مستمعي الأحداث              │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ الشاشة جاهزة للاستخدام            │
└─────────────────────────────────────┘
```

---

## اعتبارات الأداء

✅ **استخدام Event Delegation** - ربط الأحداث على الآباء بدلاً من الأطفال
✅ **تنظيف المستمعين** - إزالة المستمعين عند الانتقال من شاشة
✅ **التخزين المؤقت** - حفظ البيانات في المتغيرات بدلاً من الاستعلام المتكرر
✅ **الرسوميات البسيطة** - استخدام CSS بدلاً من JavaScript حيث أمكن

---

## نصائح للتطوير

1. **استخدام الـ Console** - تفقد سجل الواجهة:
   ```javascript
   console.log('✅ الواجهة الرسومية تم تحميلها بنجاح');
   ```

2. **اختبار الشاشات** - جرّب كل شاشة بشكل منفصل:
   ```javascript
   ui.renderScreen('test');
   ```

3. **مراقبة الأخطاء** - استخدم الـ DevTools:
   ```javascript
   // افتح F12 واختبر الأوامر
   ui.renderScreen('login');
   ui.showNotification({message: 'اختبار', type: 'success'});
   ```

---

## الملفات ذات الصلة

- `index.html` - الصفحة الرئيسية
- `style.css` - أنماط الواجهة
- `ui.js` - كود الواجهة الرسومية
- `integration.js` - التكامل مع الأنظمة الأخرى

---

## آخر تحديث
التاريخ: 11 سبتمبر 2026
الإصدار: 1.0
