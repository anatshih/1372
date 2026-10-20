/* Lesson l8-passwords — generated from docs/concepts.md (cards) and docs/outputs-spec.md (values); edit freely after generation. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l8-passwords"] = {
  "id": "l8-passwords",
  "seq": 8,
  "axis": 3,
  "axisTitle": "المحور ٣: حصّن",
  "units": [
    7,
    11
  ],
  "tools": [
    "Local Security Policy",
    "Event Viewer",
    "KeePassXC"
  ],
  "minutes": 20,
  "title": "كلمات المرور وقفل الحساب: secpol وEvent Viewer وKeePassXC",
  "caseBranch": {
    "question": "كيف نقوّي «المفتاح» نفسه: كلمات المرور؟",
    "known": "الأبواب أُغلقت أو قُيّدت، لكن سياسة كلمات المرور تقبل كلمة فارغة، ولا قفل بعد المحاولات الخاطئة، وكلمات مرور الأجهزة على ورقة.",
    "now": "نضبط سياسة كلمات المرور والقفل، ونتحقق أن القفل يعمل في Event Viewer، وننقل كلمات مرور الأجهزة إلى خزنة KeePassXC.",
    "finding": "الطول الأدنى 14 والتعقيد مفعّل والتاريخ 24؛ القفل بعد 5 محاولات لمدة 15 دقيقة، وقد ثبت بالحدث 4740 على حساب الاختبار. وكلمات مرور الأجهزة في خزنة Sanabel-Office.kdbx. البند F4 مغلق."
  },
  "objectives": [
    "ضبط سياسة كلمات المرور وقفل الحساب.",
    "إثبات أن القفل يعمل بأحداث 4625 و4740.",
    "استخدام مدير كلمات مرور وجملة مرور عشوائية."
  ],
  "explain": {
    "intro": "التشبيه الجامع: قفل بأربعة أرقام مقابل قفل باثني عشر رقماً، وصراف آلي يحجز البطاقة بعد محاولات خاطئة.",
    "figure": "counter",
    "whatNext": "ستضبط السياسة على ACC-PC1، وتجرّب الدخول بحساب الاختبار حتى يُقفل، وتقرأ الحدث 4740، ثم تنشئ خزنة KeePassXC على جهاز المدير.",
    "cards": [
      {
        "id": "c81",
        "ar": "قوة كلمة المرور: الطول قبل التعقيد",
        "en": "",
        "analogy": "قفل بأربعة أرقام مقابل قفل باثني عشر رقماً.",
        "meaning": "كل حرف إضافي يضاعف عدد الاحتمالات أضعافاً كبيرة. الطول أهم عامل؛ جملة مرور طويلة سهلة الحفظ أقوى من كلمة قصيرة معقدة.",
        "inTool": [
          "Minimum password length وPassword must meet complexity requirements."
        ],
        "forDefender": "كلمات المرور القصيرة تُخمَّن آلياً بسرعة.",
        "fromFrame": "الطول الأدنى في ACC-PC1 = 0 characters (أي يُقبل الفراغ).",
        "mistake": "P@ssw0rd تبدو معقدة لكنها من أشهر الكلمات.",
        "quiz": {
          "q": "أيهما أقوى: Tr0y! أم blue-olive-train-river؟",
          "type": "reveal",
          "answer": "الثانية (أطول)."
        }
      },
      {
        "id": "threshold-duration-reset-count",
        "ar": "إعدادات القفل الثلاثة",
        "en": "Threshold / Duration / Reset counter",
        "analogy": "الصراف الآلي يحجز البطاقة بعد ثلاث محاولات خاطئة لمدة محددة.",
        "meaning": "Account lockout threshold عدد المحاولات الفاشلة قبل القفل • Account lockout duration مدة القفل • Reset account lockout counter after متى يعود العدّاد للصفر.",
        "inTool": [
          "نافذة Suggested Value Changes تظهر عند تغيير الحد وتقترح الإعدادين الآخرين معاً."
        ],
        "forDefender": "الحد المنخفض جداً يقفل الموظفين لأخطاء بسيطة؛ المرتفع جداً لا يحمي. الحل الوسط (مثل 5–10).",
        "fromFrame": "القيمة المعتمدة للدرس تُثبَّت في outputs-spec.",
        "mistake": "وضع الحد 1 فيُقفل الحساب عند أول خطأ إملائي.",
        "quiz": {
          "q": "الحد 5 والمدة 15 دقيقة؛ ماذا يحدث بعد المحاولة الخامسة الخاطئة؟",
          "type": "reveal",
          "answer": "يُقفل الحساب 15 دقيقة."
        }
      },
      {
        "id": "security-log-4625-4740",
        "ar": "سجل الأمان وأحداث الدخول والقفل",
        "en": "Security log / 4625 / 4740",
        "analogy": "دفتر الحارس يسجّل كل من حاول الدخول وفشل، ومتى أُغلق الباب في وجهه.",
        "meaning": "Windows يسجّل في سجل Security كل محاولة دخول فاشلة بالحدث 4625، وكل قفل حساب بالحدث 4740 (A user account was locked out.).",
        "inTool": [
          "Windows Logs → Security، ثم Filter Current Log…، ثم 4625,4740."
        ],
        "forDefender": "ضبط السياسة لا يكفي؛ السجل يثبت أنها تعمل. وكثرة أحداث 4625 على حساب واحد علامة على تخمين يستحق التحقيق.",
        "fromFrame": "على حساب الاختبار lockout-test: خمسة أحداث 4625، ثم حدث 4740 واحد.",
        "mistake": "البحث في سجل System أو Application بدل Security.",
        "quiz": {
          "q": "ما رقم الحدث الذي يثبت أن حساباً قُفل؟",
          "type": "reveal",
          "answer": "4740."
        }
      },
      {
        "id": "password-manager-master-passwo",
        "ar": "مدير كلمات المرور وكلمة المرور الرئيسية",
        "en": "Password Manager / Master Password",
        "analogy": "خزنة صغيرة تحفظ فيها كل مفاتيح البيت، ولا تحمل إلا مفتاح الخزنة.",
        "meaning": "برنامج يحفظ كلمات المرور كلها في ملف مشفّر (.kdbx) يُفتح بكلمة مرور رئيسية واحدة قوية. لذلك تستطيع أن تكون لكل خدمة كلمة مرور طويلة مختلفة دون أن تحفظها.",
        "inTool": [
          "Create new database، ثم Database Credentials (Password: وConfirm password:)، ثم الحفظ باسم Sanabel-Office.kdbx."
        ],
        "forDefender": "إعادة استخدام كلمة مرور واحدة في كل مكان تعني أن تسريبها من موقع واحد يفتح كل الأبواب.",
        "fromFrame": "مدير المكتب يحفظ كلمات مرور الراوتر والطابعة وخادم الملفات في ملف واحد مشفّر، بدل ورقة ملصقة على الشاشة.",
        "mistake": "جعل كلمة المرور الرئيسية قصيرة أو مستخدمة في مكان آخر؛ هي مفتاح كل شيء.",
        "quiz": {
          "q": "نسي المدير كلمة المرور الرئيسية؛ هل يستطيع البرنامج استرجاعها؟",
          "type": "reveal",
          "answer": "لا. التشفير بلا باب خلفي، لذلك تُحفظ نسخة منها في مكان آمن."
        }
      },
      {
        "id": "password-guessing",
        "ar": "التخمين الآلي",
        "en": "Password guessing",
        "analogy": "لص يجرّب مفاتيح كثيرة على القفل بسرعة.",
        "meaning": "برامج تجرّب كلمات مرور كثيرة على حساب حتى تصيب؛ الدفاع ضدها: كلمة طويلة + قفل الحساب بعد عدد من المحاولات الفاشلة.",
        "inTool": [
          "Account lockout threshold."
        ],
        "forDefender": "حد القفل 0 يعني محاولات بلا نهاية.",
        "fromFrame": "حد القفل في ACC-PC1 = 0 (عُدّل عن الافتراضي الحديث 10).",
        "mistake": "الظن أن «لن يخمّن أحد كلمة مروري» لأنها شخصية.",
        "quiz": {
          "q": "ما الإعداد الذي يوقف التخمين بعد عدد محاولات؟",
          "type": "reveal",
          "answer": "Account lockout threshold."
        },
        "extra": true
      },
      {
        "id": "history-maximum-minimum-age",
        "ar": "تاريخ كلمات المرور وعمرها",
        "en": "History / Maximum & Minimum age",
        "analogy": "منع إعادة استخدام المفتاح القديم نفسه.",
        "meaning": "Enforce password history يمنع إعادة الكلمات السابقة • Maximum password age يُلزم بالتغيير بعد مدة • Minimum password age يمنع التغيير المتكرر للعودة إلى القديمة. التوجّه الحديث: لا إجبار على التغيير الدوري إلا عند الاشتباه بتسريب، مع كلمة طويلة.",
        "inTool": [
          "الأسطر الثلاثة في Password Policy."
        ],
        "forDefender": "التغيير الإجباري المتكرر يدفع الناس إلى كلمات ضعيفة متسلسلة (Sanabel1، Sanabel2…).",
        "fromFrame": "التوصية في التقرير: طول ≥ 14 مع تاريخ ≥ 24، دون إجبار شهري (قيم مقترحة).",
        "mistake": "وضع Maximum password age على 30 يوماً ظناً أنه أقوى دائماً.",
        "quiz": {
          "q": "لماذا نضع Minimum password age = 1 يوم مع التاريخ؟",
          "type": "reveal",
          "answer": "حتى لا يدور المستخدم سريعاً ليعود إلى كلمته القديمة."
        },
        "extra": true
      },
      {
        "id": "mfa",
        "ar": "التحقق متعدد العوامل",
        "en": "MFA",
        "analogy": "المفتاح وحده لا يفتح الخزنة؛ يلزم أيضاً رمز يصل إلى هاتفك.",
        "meaning": "الدخول بشيئين: ما تعرفه (كلمة المرور) + ما تملكه (هاتف/مفتاح) أو ما أنت (بصمة).",
        "inTool": [
          "خارج secpol.msc",
          "يُذكر في التقرير توصيةً للبريد والخدمات السحابية."
        ],
        "forDefender": "كلمة المرور المسرّبة وحدها لا تكفي للدخول.",
        "fromFrame": "توصية بتفعيل MFA على بريد المكتب.",
        "mistake": "الظن أن MFA يغني عن كلمة مرور جيدة.",
        "quiz": {
          "q": "البصمة من أي فئة؟",
          "type": "reveal",
          "answer": "ما أنت."
        },
        "extra": true
      },
      {
        "id": "failure-reason-status-sub-stat",
        "ar": "سبب فشل الدخول",
        "en": "Failure Reason / Status / Sub Status",
        "analogy": "الحارس لا يكتب «رُفض» فقط، بل يكتب السبب: البطاقة خاطئة، أو الاسم غير موجود، أو الباب مقفل أصلاً.",
        "meaning": "في الحدث 4625 يكتب قسم Failure Information: سبب الفشل نصاً (Failure Reason) ورمزاً في حقلي Status وSub Status:",
        "inTool": [
          "قسم Failure Information: في تفاصيل الحدث 4625."
        ],
        "forDefender": "تغيّر السبب من Unknown user name or bad password. (Sub Status: 0xC000006A) إلى Account locked out. (Status: 0xC0000234) هو الدليل على أن القفل بدأ يعمل.",
        "fromFrame": "المحاولات الخمس الأولى على lockout-test تحمل Sub Status: 0xC000006A، والسادسة تحمل Status: 0xC0000234.",
        "mistake": "قراءة حقل واحد فقط؛ اقرأ Failure Reason وStatus وSub Status معاً.",
        "quiz": {
          "q": "حدث 4625 فيه Status: 0xC0000234؛ ماذا يعني؟",
          "type": "reveal",
          "answer": "الحساب مقفل."
        },
        "extra": true
      },
      {
        "id": "passphrase-entropy",
        "ar": "جملة المرور والإنتروبيا",
        "en": "Passphrase / Entropy",
        "analogy": "سحب أربع كلمات عشوائية من قاموس ضخم، مقابل اختيار كلمة واحدة تحبها.",
        "meaning": "الإنتروبيا مقياس بالبِت لعدد الاحتمالات التي يجب تجربتها؛ كل بِت إضافي يضاعفها. جملة المرور كلمات عشوائية متتالية، طويلة وسهلة الحفظ معاً. العشوائية الحقيقية تأتي من المولّد لا من ذهن الإنسان.",
        "inTool": [
          "Password generator، ثم تبويب Passphrase (Word Count:)، فيظهر Entropy: NN.NN bit وPassword Quality: Excellent."
        ],
        "forDefender": "الإنسان يختار أنماطاً متوقعة، مثل اسم وسنة؛ المولّد لا يفعل.",
        "fromFrame": "تُنشأ كلمة المرور الرئيسية لملف المكتب جملةَ مرور من 6 كلمات (77.55 بت؛ outputs-spec ي-4)، وتحقق طول 14 حرفاً المطلوب في الدرس نفسه.",
        "mistake": "اختيار جملة مرور من عبارة مشهورة أو مثل شعبي؛ هذه ليست عشوائية.",
        "quiz": {
          "q": "أيهما أعلى إنتروبيا عادةً: Sanabel2026! أم 5 كلمات من المولّد؟",
          "type": "reveal",
          "answer": "الكلمات الخمس."
        },
        "extra": true
      },
      {
        "id": "clipboard-clear-lock-database",
        "ar": "الحافظة والقفل التلقائي",
        "en": "Clipboard clear / Lock database",
        "analogy": "تعطي المفتاح لحظة فتح الباب ثم تستعيده، ولا تترك الخزنة مفتوحة حين تغادر المكتب.",
        "meaning": "Copy password ينسخ كلمة المرور إلى الحافظة، ويمسحها البرنامج تلقائياً بعد 10 ثوانٍ. أما Lock database فيُغلق الملف حتى تُدخل كلمة المرور الرئيسية من جديد.",
        "inTool": [
          "رسالة شريط الحالة بعد النسخ، وزر Lock database (Ctrl+L)."
        ],
        "forDefender": "كلمة مرور منسية في الحافظة يمكن أن تُلصق بالخطأ في رسالة، أو يقرأها برنامج آخر.",
        "fromFrame": "ينسخ المدير كلمة مرور Printer admin، ويلصقها في لوحة الإدارة، ثم يقفل الملف قبل أن يغادر.",
        "mistake": "كتابة كلمة المرور يدوياً في ملف نصي «للسرعة».",
        "quiz": {
          "q": "نسختَ كلمة مرور ولم تلصقها؛ ماذا يحدث بعد 10 ثوانٍ؟",
          "type": "reveal",
          "answer": "تُمسح من الحافظة."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "secpol",
    "state": "before",
    "scenario": "أنت على ACC-PC1 بحساب Consultant. أنشأنا لك حساب الاختبار lockout-test (لا تُجرَّب حسابات الموظفين). اضبط السياسة، ثم اقفل حساب الاختبار عمداً، ثم افتح KeePassXC.",
    "launchers": [
      {
        "tool": "secpol",
        "label": "Local Security Policy",
        "auto": true
      },
      {
        "tool": "cmdadmin",
        "label": "Command Prompt (Administrator)"
      },
      {
        "tool": "eventviewer",
        "label": "Event Viewer"
      },
      {
        "tool": "keepassxc",
        "label": "KeePassXC"
      }
    ],
    "freeNote": "جرّب دون تلميحات: جرّب runas قبل ضبط القفل (لن يُقفل الحساب)، ثم بعده، وقارن في Event Viewer.",
    "steps": [
      {
        "id": "s1",
        "title": "سياسة كلمات المرور",
        "instruction": "في الشجرة: Security Settings ← Account Policies ← Password Policy.",
        "why": "هنا قواعد طول كلمة المرور وتعقيدها وتاريخها.",
        "expect": {
          "type": "event",
          "name": "secpol:node",
          "where": {
            "node": "Password Policy"
          }
        },
        "target": "[data-win=\"secpol\"] [data-node=\"Password Policy\"]",
        "hints": [
          "الشجرة على اليسار.",
          "تحت Account Policies.",
          "اضغط Password Policy."
        ],
        "demo": {
          "kind": "ui",
          "tool": "secpol",
          "action": "select",
          "arg": "Password Policy"
        },
        "result": "سياسات كلمات المرور: الطول الأدنى 0 (يقبل كلمة فارغة) والتعقيد معطّل."
      },
      {
        "id": "s2",
        "title": "اضبط القيم الأربع",
        "instruction": "نقر مزدوج على كل سياسة، وغيّر القيمة، ثم OK.",
        "typeText": "length 14 • complexity Enabled • history 24 • min age 1",
        "typeLabel": "القيم",
        "why": "الطول أهم عامل؛ والتاريخ والعمر الأدنى يمنعان العودة إلى الكلمة القديمة.",
        "expect": {
          "type": "event",
          "name": "secpol:passwordDone"
        },
        "target": "[data-win=\"secpol\"] .mmc-center",
        "hints": [
          "كل سياسة تُفتح بنقر مزدوج.",
          "Minimum password length و complexity و Enforce password history و Minimum password age.",
          "14 • Enabled • 24 • 1"
        ],
        "demo": {
          "kind": "ui",
          "tool": "secpol",
          "action": "applyAll",
          "arg": "password"
        },
        "result": "الطول الأدنى 14، والتعقيد مفعّل، ولا تُعاد آخر 24 كلمة."
      },
      {
        "id": "s3",
        "title": "اضبط قفل الحساب",
        "instruction": "Account Lockout Policy ← threshold = 5 (ستقترح Windows 30 دقيقة: OK) ← ثم duration = 15 وreset = 15.",
        "typeText": "threshold 5 • duration 15 • reset 15",
        "typeLabel": "القيم",
        "why": "القفل يوقف التخمين بعد عدد محاولات.",
        "expect": {
          "type": "event",
          "name": "secpol:lockoutDone"
        },
        "target": "[data-win=\"secpol\"] [data-node=\"Account Lockout Policy\"]",
        "hints": [
          "تحت Account Policies.",
          "ابدأ بـ Account lockout threshold.",
          "5 ← OK ← duration 15 ← reset 15"
        ],
        "demo": {
          "kind": "ui",
          "tool": "secpol",
          "action": "applyAll",
          "arg": "lockout"
        },
        "result": "بعد 5 محاولات خاطئة يُقفل الحساب 15 دقيقة."
      },
      {
        "id": "s4",
        "title": "اقفل حساب الاختبار",
        "instruction": "اضغط Command Prompt (Administrator)، واكتب الأمر، ثم أي كلمة مرور خاطئة. كرر 5 مرات (السهم ↑ يعيد الأمر).",
        "typeText": "runas /user:lockout-test cmd",
        "why": "نثبت أن السياسة تعمل فعلاً، على حساب اختبار لا حساب موظف.",
        "expect": {
          "type": "event",
          "name": "account:locked",
          "where": {
            "user": "lockout-test"
          }
        },
        "target": "[data-launch=\"cmdadmin\"]",
        "hints": [
          "الزر الثاني في شريط التطبيقات.",
          "الأمر يطلب كلمة مرور؛ اكتب أي شيء خاطئ.",
          "runas /user:lockout-test cmd ← خطأ ← 5 مرات"
        ],
        "demo": [
          {
            "kind": "launch",
            "tool": "cmdadmin"
          },
          {
            "kind": "ui",
            "tool": "cmdadmin",
            "action": "runWithAnswer",
            "arg": [
              "runas /user:lockout-test cmd",
              "wrong-1"
            ]
          },
          {
            "kind": "ui",
            "tool": "cmdadmin",
            "action": "runWithAnswer",
            "arg": [
              "runas /user:lockout-test cmd",
              "wrong-2"
            ]
          },
          {
            "kind": "ui",
            "tool": "cmdadmin",
            "action": "runWithAnswer",
            "arg": [
              "runas /user:lockout-test cmd",
              "wrong-3"
            ]
          },
          {
            "kind": "ui",
            "tool": "cmdadmin",
            "action": "runWithAnswer",
            "arg": [
              "runas /user:lockout-test cmd",
              "wrong-4"
            ]
          },
          {
            "kind": "ui",
            "tool": "cmdadmin",
            "action": "runWithAnswer",
            "arg": [
              "runas /user:lockout-test cmd",
              "wrong-5"
            ]
          }
        ],
        "result": "بعد المحاولة الخامسة قُفل lockout-test. أي محاولة بعدها ترفض: 1909 … locked out."
      },
      {
        "id": "s5",
        "title": "الدليل في Event Viewer",
        "instruction": "اضغط Event Viewer ← Windows Logs ← Security ← Filter Current Log... ← اكتب المعرّفين ← OK ← اختر الحدث 4740.",
        "typeText": "4625,4740",
        "typeLabel": "Event IDs",
        "why": "السجل يثبت أن القفل حدث، ومتى.",
        "expect": {
          "type": "event",
          "name": "ev:select",
          "where": {
            "id": 4740
          }
        },
        "target": "[data-launch=\"eventviewer\"]",
        "hints": [
          "زر Event Viewer في الشريط.",
          "Security تحت Windows Logs، ثم Filter Current Log... في Actions.",
          "4625,4740 ← OK ← اضغط صف 4740"
        ],
        "demo": [
          {
            "kind": "launch",
            "tool": "eventviewer"
          },
          {
            "kind": "ui",
            "tool": "eventviewer",
            "action": "filter",
            "arg": [
              [
                4625,
                4740
              ]
            ]
          },
          {
            "kind": "ui",
            "tool": "eventviewer",
            "action": "pick",
            "arg": 4740
          }
        ],
        "result": "الحدث 4740 (A user account was locked out) هو الدليل على أن القفل يعمل."
      },
      {
        "id": "s6",
        "title": "خزنة KeePassXC",
        "instruction": "اضغط KeePassXC ← Create new database ← Database name: Sanabel Office ← Continue ← Continue ← 🎲 ← Passphrase ← Word Count: 6 ← Apply Password ← Done.",
        "typeText": "Sanabel Office  •  Passphrase  •  6",
        "typeLabel": "أدخل",
        "why": "جملة مرور من 6 كلمات عشوائية = 77.55 بت (Good)، وسهلة الحفظ.",
        "expect": {
          "type": "event",
          "name": "kp:created",
          "where": {
            "ok": true
          }
        },
        "onMismatch": "الكلمة الرئيسية ضعيفة: استخدم المولّد ← Passphrase ← 6 كلمات.",
        "target": "[data-launch=\"keepassxc\"]",
        "hints": [
          "زر KeePassXC في الشريط.",
          "المولّد هو زر 🎲 بجانب حقل كلمة المرور.",
          "Passphrase ← 6 ← Apply Password ← Done"
        ],
        "demo": [
          {
            "kind": "launch",
            "tool": "keepassxc"
          },
          {
            "kind": "ui",
            "tool": "keepassxc",
            "action": "demoCreate"
          }
        ],
        "result": "الخزنة Sanabel-Office.kdbx أُنشئت بجملة مرور من 6 كلمات عشوائية (77.55 بت، Good)."
      },
      {
        "id": "s7",
        "title": "مدخل الطابعة",
        "instruction": "New entry ← Title: Printer admin ← Username: admin ← 🎲 (Password، الطول 24) ← Apply Password ← OK.",
        "typeText": "Printer admin",
        "typeLabel": "Title",
        "why": "كلمة مرور عشوائية طويلة لكل جهاز، محفوظة في الخزنة لا على ورقة.",
        "expect": {
          "type": "event",
          "name": "kp:entry",
          "where": {
            "title": "Printer admin"
          }
        },
        "target": "[data-win=\"keepassxc\"] [data-kp=\"New entry\"]",
        "hints": [
          "زر New entry في شريط الأدوات.",
          "المولّد بجانب حقل Password.",
          "Printer admin • admin • 🎲 • OK"
        ],
        "demo": {
          "kind": "ui",
          "tool": "keepassxc",
          "action": "demoEntry"
        },
        "result": "مدخل Printer admin بكلمة مرور عشوائية من 24 حرفاً: لا ورقة على الشاشة بعد اليوم."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "pw1",
        "kind": "table",
        "tool": "secpol",
        "table": "password",
        "state": "before",
        "title": "Password Policy (قبل)",
        "heading": "Password Policy [قبل]"
      },
      {
        "id": "pw2",
        "kind": "table",
        "tool": "secpol",
        "table": "password",
        "state": "after",
        "title": "Password Policy (بعد)",
        "heading": "Password Policy [بعد]"
      },
      {
        "id": "lo2",
        "kind": "table",
        "tool": "secpol",
        "table": "lockout",
        "state": "after",
        "title": "Account Lockout (بعد)",
        "heading": "Account Lockout Policy [بعد]"
      },
      {
        "id": "evl",
        "tool": "eventviewer",
        "cmd": "list",
        "title": "Security (4625,4740)",
        "heading": "Event Viewer › Security — Filter: 4625,4740"
      },
      {
        "id": "e6",
        "tool": "eventviewer",
        "cmd": "4625-6",
        "title": "4625 السادس",
        "heading": "Event 4625 (المحاولة السادسة)"
      },
      {
        "id": "e7",
        "tool": "eventviewer",
        "cmd": "4740",
        "title": "4740",
        "heading": "Event 4740"
      }
    ],
    "highlights": [
      {
        "src": "pw1",
        "row": "Minimum password length",
        "col": "Security Setting",
        "label": "طول 0",
        "danger": true,
        "concept": "c81",
        "meaning": "0 characters: يُقبل حساب بلا كلمة مرور.",
        "core": true
      },
      {
        "src": "pw2",
        "row": "Minimum password length",
        "col": "Security Setting",
        "label": "طول 14",
        "concept": "c81",
        "meaning": "14 حرفاً على الأقل: الطول أهم عامل في القوة."
      },
      {
        "src": "pw2",
        "row": "Enforce password history",
        "col": "Security Setting",
        "label": "التاريخ 24",
        "concept": "history-maximum-minimum-age",
        "meaning": "لا يعيد المستخدم أي كلمة من آخر 24."
      },
      {
        "src": "lo2",
        "row": "Account lockout threshold",
        "col": "Security Setting",
        "label": "الحد 5",
        "concept": "threshold-duration-reset-count",
        "meaning": "بعد 5 محاولات خاطئة يُقفل الحساب 15 دقيقة.",
        "core": true
      },
      {
        "src": "evl",
        "line": "4740",
        "match": "4740",
        "label": "4740 في القائمة",
        "concept": "security-log-4625-4740",
        "meaning": "حدث القفل جاء مع المحاولة الخامسة (10:05:41).",
        "core": true
      },
      {
        "src": "e6",
        "line": "Status:",
        "match": "0xC0000234",
        "label": "Status مقفل",
        "danger": true,
        "concept": "failure-reason-status-sub-stat",
        "meaning": "المحاولة السادسة: Account locked out، والرمز في حقل Status (وSub Status = 0x0).",
        "core": true
      },
      {
        "src": "e7",
        "line": "Account That Was Locked Out",
        "match": "Account That Was Locked Out:",
        "label": "الحساب المقفل",
        "concept": "security-log-4625-4740",
        "meaning": "lockout-test: حساب الاختبار الذي أنشأناه، لا حساب موظف."
      }
    ],
    "table": [
      {
        "see": "Minimum password length = 0",
        "means": "كلمة مرور فارغة مقبولة."
      },
      {
        "see": "Account lockout threshold = 0",
        "means": "محاولات بلا نهاية؛ لا قفل."
      },
      {
        "see": "4625 بـ Sub Status 0xC000006A",
        "means": "كلمة مرور خاطئة."
      },
      {
        "see": "4740",
        "means": "قُفل حساب."
      },
      {
        "see": "4625 بـ Status 0xC0000234",
        "means": "محاولة على حساب مقفل."
      },
      {
        "see": "Password Quality: Good / Excellent",
        "means": "75 بت فأكثر / 100 بت فأكثر."
      }
    ],
    "questions": [
      {
        "q": "ماذا تعني Minimum password length = 0؟",
        "type": "choice",
        "options": [
          "يُقبل حساب بلا كلمة مرور",
          "لا حد أعلى للطول",
          "القفل معطّل"
        ],
        "answer": "يُقبل حساب بلا كلمة مرور",
        "why": "الطول الأدنى صفر."
      },
      {
        "q": "ما رقم الحدث الذي يثبت أن حساباً قُفل؟",
        "type": "choice",
        "answer": "4740",
        "why": "A user account was locked out.",
        "options": [
          "4740",
          "4625",
          "4624"
        ]
      },
      {
        "q": "كم محاولة فاشلة سبقت القفل؟",
        "type": "choice",
        "answer": "5",
        "why": "الحد الذي ضبطته.",
        "options": [
          "5",
          "10",
          "0"
        ]
      },
      {
        "q": "كم بِت إنتروبيا لجملة مرور من 6 كلمات؟",
        "type": "choice",
        "answer": "77.55",
        "why": "6 × 12.92 بت (قائمة EFF ذات 7776 كلمة).",
        "options": [
          "77.55",
          "64.62",
          "157"
        ],
        "extra": true
      },
      {
        "q": "لماذا استخدمنا حساباً مؤقتاً لا حساب accountant؟",
        "type": "choice",
        "options": [
          "لكي لا يتعطّل عمل أحد، ولا نجرّب حسابات الموظفين",
          "لأن accountant لا يمكن قفله",
          "لا فرق"
        ],
        "answer": "لكي لا يتعطّل عمل أحد، ولا نجرّب حسابات الموظفين",
        "why": "الاختبار على حساب لا يملكه أحد.",
        "extra": true
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "secpol.msc متوفر في Windows 11 Pro/Enterprise/Education فقط.",
      "Windows 11 الحديث يفعّل افتراضياً قفلاً بعد 10 محاولات لمدة 10 دقائق؛ المكتب كان قد عطّله.",
      "KeePassXC مجاني ومفتوح المصدر ويعمل دون اتصال؛ Bitwarden بديل سحابي."
    ],
    "officialSite": "https://keepassxc.org/"
  },
  "guide": [
    "تقوّي سياسة كلمات المرور وتفعّل قفل الحساب بعد 5 محاولات.",
    "تجرّب الدخول بحساب اختبار حتى يُقفل، وترى الدليل في Event Viewer.",
    "تنقل كلمات مرور الأجهزة إلى خزنة KeePassXC."
  ]
};
