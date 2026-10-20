/* Lesson l10-verify — generated from docs/concepts.md (cards 10.1–10.5) and docs/outputs-spec.md §ل; edit freely. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l10-verify"] = {
  "id": "l10-verify",
  "seq": 10,
  "axis": 4,
  "axisTitle": "المحور ٤: تحقّق",
  "units": [
    10,
    14
  ],
  "tools": [
    "Nessus Essentials",
    "Zenmap"
  ],
  "minutes": 15,
  "title": "إعادة الفحص وتقرير تقييم الأمن: Nessus وZenmap",
  "caseBranch": {
    "question": "هل نجح العلاج فعلاً؟ وماذا نسلّم للمكتب؟",
    "known": "عالجنا وحصّنّا في الدروس 4–9: خمس مشكلات أُغلقت واثنتان متبقيتان.",
    "now": "نعيد فحص Nessus نفسه، ونقارن قبل وبعد في Zenmap، ثم نقرأ تقرير تقييم الأمن الكامل.",
    "finding": "إعادة الفحص: لا ثغرات حرجة، وACC-PC1 بلا ثغرات غير Info؛ وCompare Results يُظهر اختفاء 3389 و5900. بقي Telnet على الطابعة. التقرير الكامل جاهز للتسليم."
  },
  "objectives": [
    "إعادة الفحص نفسه بالإعدادات نفسها بعد المعالجة.",
    "قراءة الفرق بين فحصين (- اختفى، + ظهر).",
    "التمييز بين المغلق والمتبقي، وكتابة تقرير صادق."
  ],
  "explain": {
    "intro": "التشبيه الجامع: تحليل الدم بعد انتهاء العلاج، وصورتا أشعة قبل وبعد جنباً إلى جنب.",
    "figure": "beforeafter",
    "whatNext": "ستعيد تشغيل فحص Sanabel - Baseline في Nessus، وتقرأ History، ثم تقارن فحصين في Zenmap، وتفتح التقرير الكامل.",
    "cards": [
      {
        "id": "rescan-verification",
        "ar": "إعادة الفحص",
        "en": "Rescan / Verification",
        "analogy": "تحليل الدم بعد انتهاء العلاج.",
        "meaning": "تشغيل الفحص نفسه بالإعدادات نفسها بعد المعالجة، لإثبات أن الثغرة أُغلقت فعلاً لا أنها «يُفترض» أنها أُغلقت.",
        "inTool": [
          "Nessus: Launch للفحص نفسه ← تبويب History بتشغيلين."
        ],
        "forDefender": "التقرير يقول «مغلقة» فقط بدليل.",
        "fromFrame": "ثغرة التحديث الناقص تختفي من نتائج الفحص الثاني.",
        "mistake": "إعادة الفحص بإعدادات مختلفة (قالب أو أهداف أخرى) ثم المقارنة.",
        "quiz": {
          "q": "لماذا نعيد الفحص نفسه لا فحصاً جديداً مختلفاً؟",
          "type": "reveal",
          "answer": "لتكون المقارنة عادلة."
        }
      },
      {
        "id": "compare-results-ndiff",
        "ar": "المقارنة قبل وبعد",
        "en": "Compare Results / ndiff",
        "analogy": "صورتا أشعة قبل العلاج وبعده جنباً إلى جنب.",
        "meaning": "أداة تعرض الفرق بين فحصين: ما اختفى (-) وما ظهر جديداً (+).",
        "inTool": [
          "Zenmap: Tools → Compare Results ← A scan قبل وB scan بعد ← -5900/tcp open vnc."
        ],
        "forDefender": "يكشف أيضاً ما ظهر جديداً بالخطأ أثناء المعالجة.",
        "fromFrame": "يختفي 5900 من ACC-PC1، ولا يظهر شيء جديد.",
        "mistake": "النظر إلى ما اختفى فقط.",
        "quiz": {
          "q": "ماذا يعني سطر يبدأ بـ + في المقارنة؟",
          "type": "reveal",
          "answer": "شيء جديد لم يكن في الفحص الأول."
        }
      },
      {
        "id": "residual-accepted-risk",
        "ar": "الخطر المتبقي والخطر المقبول",
        "en": "Residual / Accepted risk",
        "analogy": "بعد العلاج يبقى المريض بحاجة إلى متابعة، وقد يختار تأجيل عملية غير عاجلة.",
        "meaning": "الخطر المتبقي ما يبقى بعد المعالجة. الخطر المقبول ما يقرر العميل (لا المستشار) قبوله بوعي لسبب عملي، ويُكتب في التقرير مع سببه.",
        "inTool": [
          "في تقرير تقييم الأمن: حالة ثالثة «متبقية» بجانب «مفتوحة» و«مغلقة» (معتمد)."
        ],
        "forDefender": "التقرير الصادق لا يدّعي أن الخطر صفر.",
        "fromFrame": "Telnet على الطابعة يحتاج تحديث برنامجها الثابت من الشركة المصنّعة؛ خارج أدواتنا ← «متبقٍ» مع توصية.",
        "mistake": "حذف الثغرات غير المعالجة من التقرير ليبدو أفضل.",
        "quiz": {
          "q": "من يقرر قبول خطر ما: المستشار أم العميل؟",
          "type": "reveal",
          "answer": "العميل."
        }
      },
      {
        "id": "security-assessment-report",
        "ar": "تقرير تقييم الأمن",
        "en": "Security Assessment Report",
        "analogy": "تقرير الطبيب: ملخص للمريض، وتفاصيل للطبيب التالي.",
        "meaning": "وثيقة بأقسام: ملخص تنفيذي بلغة غير تقنية (للمدير) • النطاق والتفويض والتاريخ • جدول الثغرات (الاسم، الجهاز، الخطورة، الحالة) • ما عولج وكيف ودليل التحقق • التوصيات (ترقيع منتظم، كلمات مرور، BitLocker، MFA، تدريب).",
        "inTool": [
          "صفحة «تقرير تقييم الأمن» في الموقع (بدل Report في Nessus)."
        ],
        "forDefender": "هو ما يتسلّمه العميل فعلاً؛ والفحص بلا تقرير مفهوم لا قيمة له عنده.",
        "fromFrame": "التقرير الكامل لمكتب السنابل يُسلَّم مشفّراً (الدرس 9).",
        "mistake": "تسليم مخرجات Nessus الخام للمدير.",
        "quiz": {
          "q": "لمن يُكتب الملخص التنفيذي؟",
          "type": "reveal",
          "answer": "للإدارة غير التقنية."
        },
        "extra": true
      },
      {
        "id": "continuous-assessment",
        "ar": "الاستمرار والدورية",
        "en": "Continuous assessment",
        "analogy": "الفحص الطبي السنوي لا يكفي مرة في العمر.",
        "meaning": "ثغرات جديدة تُعلن كل أسبوع وأجهزة جديدة تُضاف؛ التقييم يُكرَّر دورياً (مثلاً كل ربع سنة) وبعد كل تغيير كبير.",
        "inTool": [
          "Schedule في إعدادات فحص Nessus (يُعرض ولا يُفعَّل)."
        ],
        "forDefender": "يحوّل المهمة من «مشروع» إلى «عادة» عند العميل.",
        "fromFrame": "التوصية الأخيرة: إعادة التقييم بعد 3 أشهر.",
        "mistake": "«فحصنا العام الماضي ولم نجد شيئاً».",
        "quiz": {
          "q": "أضاف المكتب جهازاً جديداً؛ هل يكفي تقرير الشهر الماضي؟",
          "type": "reveal",
          "answer": "لا، يُفحص الجديد."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "nessus",
    "state": "after",
    "preset": {
      "nessusBaseline": true,
      "zenmapSaved": true
    },
    "scenario": "أنهيت العلاج والتحصين. أعد الفحص نفسه الذي شغّلته في الدرس 3، ثم قارن قبل وبعد.",
    "launchers": [
      {
        "tool": "nessus",
        "label": "Nessus Essentials",
        "auto": true
      },
      {
        "tool": "zenmap",
        "label": "Zenmap"
      }
    ],
    "freeNote": "جرّب دون تلميحات: قارن Hosts قبل وبعد في Nessus، وجرّب Compare Results على فحصين من الحالة نفسها.",
    "steps": [
      {
        "id": "s1",
        "title": "أعد الفحص نفسه",
        "instruction": "في My Scans اضغط ▶ (Launch) بجانب Sanabel - Baseline، وانتظر ✓.",
        "why": "الفحص نفسه بالإعدادات نفسها: مقارنة عادلة.",
        "expect": {
          "type": "event",
          "name": "nessus:completed"
        },
        "target": "[data-win=\"nessus\"] [data-launch-scan]",
        "hints": [
          "الفحص محفوظ من الدرس 3.",
          "زر ▶ في صف الفحص.",
          "▶ ثم انتظر ✓."
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "nessus",
            "action": "relaunch"
          },
          {
            "kind": "ui",
            "tool": "nessus",
            "action": "waitDone"
          }
        ],
        "result": "اكتمل الفحص الثاني (✓) بالإعدادات نفسها."
      },
      {
        "id": "s2",
        "title": "الثغرات بعد العلاج",
        "instruction": "افتح الفحص، ثم تبويب Vulnerabilities. لاحظ: لا CRITICAL.",
        "why": "V01 وV02 اختفتا لأنهما عولجتا؛ وV03 لأن 3389 صار مقيّداً.",
        "expect": {
          "type": "event",
          "name": "nessus:tab",
          "where": {
            "tab": "Vulnerabilities"
          }
        },
        "target": "[data-win=\"nessus\"] [data-scan]",
        "hints": [
          "اسم الفحص رابط.",
          "التبويب الثاني.",
          "Sanabel - Baseline ← Vulnerabilities"
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "nessus",
            "action": "openResults"
          },
          {
            "kind": "ui",
            "tool": "nessus",
            "action": "tab",
            "arg": "Vulnerabilities"
          }
        ],
        "result": "9 صفوف فقط ولا CRITICAL: الثغرات الحرجة عولجت."
      },
      {
        "id": "s3",
        "title": "سجل الفحوص",
        "instruction": "افتح تبويب History: تشغيلان للفحص نفسه.",
        "why": "كل تشغيل محفوظ؛ هذا أساس المقارنة.",
        "expect": {
          "type": "event",
          "name": "nessus:tab",
          "where": {
            "tab": "History"
          }
        },
        "target": "[data-win=\"nessus\"] [data-tab=\"History\"]",
        "hints": [
          "آخر تبويب.",
          "اسمه History.",
          "اضغط History."
        ],
        "demo": {
          "kind": "ui",
          "tool": "nessus",
          "action": "tab",
          "arg": "History"
        },
        "result": "History فيه تشغيلان: 10/11 و10/15. هذا أساس المقارنة."
      },
      {
        "id": "s4",
        "title": "افحص ACC-PC1 بـ Zenmap",
        "instruction": "اضغط Zenmap ← Target: 192.168.50.21 ← Profile: Quick scan plus ← Scan.",
        "typeText": "192.168.50.21  •  Quick scan plus",
        "typeLabel": "أدخل",
        "why": "نريد فحصاً حديثاً نقارنه بفحص الدرس 2 المحفوظ.",
        "expect": {
          "type": "event",
          "name": "zenmap:scan",
          "where": {
            "profile": "Quick scan plus",
            "target": "192.168.50.21",
            "ok": true
          }
        },
        "target": "[data-launch=\"zenmap\"]",
        "hints": [
          "زر Zenmap في الشريط.",
          "الهدف والملف الشخصي كما في الدرس 2.",
          "192.168.50.21 • Quick scan plus • Scan"
        ],
        "demo": [
          {
            "kind": "launch",
            "tool": "zenmap"
          },
          {
            "kind": "ui",
            "tool": "zenmap",
            "action": "run",
            "arg": [
              "Quick scan plus",
              "192.168.50.21"
            ]
          }
        ],
        "result": "فحص جديد لـ ACC-PC1: 3 منافذ مفتوحة فقط."
      },
      {
        "id": "s5",
        "title": "قارن قبل وبعد",
        "instruction": "Tools ← Compare Results. A scan = فحص 11 أكتوبر، B scan = فحصك الآن.",
        "why": "الأسطر التي تبدأ بـ - اختفت، والتي تبدأ بـ + ظهرت.",
        "expect": {
          "type": "event",
          "name": "zenmap:compare",
          "where": {
            "a": "before",
            "b": "after"
          }
        },
        "target": "[data-win=\"zenmap\"] .menubar",
        "hints": [
          "قائمة Tools في Zenmap.",
          "Compare Results.",
          "A = Oct 11 • B = فحصك الأخير"
        ],
        "demo": {
          "kind": "ui",
          "tool": "zenmap",
          "action": "compare"
        },
        "result": "الأسطر الحمراء (-) اختفت: 3389 و5900. والخضراء (+) ظهرت: 97 منفذاً محجوباً."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "h1",
        "kind": "table",
        "tool": "nessus",
        "table": "hosts",
        "state": "before",
        "title": "Hosts (قبل)",
        "heading": "Sanabel - Baseline › Hosts — 10/11/2026"
      },
      {
        "id": "h2",
        "kind": "table",
        "tool": "nessus",
        "table": "hosts",
        "state": "after",
        "title": "Hosts (بعد)",
        "heading": "Sanabel - Baseline › Hosts — 10/15/2026"
      },
      {
        "id": "cmp",
        "tool": "zenmap",
        "cmd": "compare",
        "title": "Compare Results",
        "heading": "Zenmap › Compare Results (A = 10/11، B = 10/15)"
      }
    ],
    "highlights": [
      {
        "src": "h1",
        "row": "192.168.50.21",
        "col": "Critical",
        "label": "Critical قبل",
        "danger": true,
        "concept": "rescan-verification",
        "meaning": "قبل العلاج: ثغرتان حرجتان على ACC-PC1.",
        "core": true
      },
      {
        "src": "h2",
        "row": "192.168.50.21",
        "col": "Critical",
        "label": "Critical بعد",
        "concept": "rescan-verification",
        "meaning": "بعد العلاج: صفر. الدليل على إغلاق V01 وV02.",
        "core": true
      },
      {
        "src": "h2",
        "row": "192.168.50.30",
        "col": "Medium",
        "label": "الطابعة",
        "concept": "residual-accepted-risk",
        "meaning": "Telnet ما زال: «متبقية» تحتاج المكتب أو المورّد. التقرير الصادق يذكرها.",
        "core": true
      },
      {
        "src": "cmp",
        "line": "-5900/tcp",
        "match": "-5900/tcp",
        "label": "5900 اختفى",
        "concept": "compare-results-ndiff",
        "meaning": "السطر يبدأ بـ -: المنفذ كان مفتوحاً في 10/11 واختفى في 10/15.",
        "core": true
      },
      {
        "src": "cmp",
        "line": "-3389/tcp",
        "match": "-3389/tcp",
        "label": "3389 اختفى",
        "concept": "compare-results-ndiff",
        "meaning": "اختفى من منظور جهاز المستشار لأنه مقيّد على جهاز المدير؛ الخدمة تعمل، وNLA ما زال توصية (F6)."
      },
      {
        "src": "cmp",
        "line": "+Not shown",
        "match": "+Not shown: 97 filtered tcp ports (no-response)",
        "label": "97 filtered",
        "concept": "compare-results-ndiff",
        "meaning": "منفذان انتقلا إلى filtered: الجدار الناري يعمل."
      }
    ],
    "table": [
      {
        "see": "سطر يبدأ بـ - في Compare Results",
        "means": "كان في الفحص A واختفى في B."
      },
      {
        "see": "سطر يبدأ بـ +",
        "means": "جديد في B: تحقق منه، فقد يكون باباً فُتح بالخطأ."
      },
      {
        "see": "ثغرة اختفت لأن المنفذ صار محجوباً",
        "means": "خُفّفت ولم تُعالَج بالضرورة: «متبقية» مع توصية."
      },
      {
        "see": "History (2)",
        "means": "تشغيلان للفحص نفسه: مقارنة عادلة."
      }
    ],
    "questions": [
      {
        "q": "كم ثغرة حرجة بعد إعادة الفحص؟",
        "type": "choice",
        "answer": "0",
        "why": "Critical = 0 على كل الأجهزة.",
        "options": [
          "0",
          "2",
          "1"
        ]
      },
      {
        "q": "ماذا تعني الأسطر التي تبدأ بـ - في المقارنة؟",
        "type": "choice",
        "options": [
          "منافذ كانت مفتوحة واختفت",
          "منافذ جديدة",
          "أخطاء في الفحص"
        ],
        "answer": "منافذ كانت مفتوحة واختفت",
        "why": "3389 و5900."
      },
      {
        "q": "V03 اختفت من Nessus؛ لماذا بقيت «متبقية»؟",
        "type": "choice",
        "options": [
          "لأن جهاز المستشار لم يعد يصل إلى 3389، لا لأن NLA فُعّل",
          "لأن Nessus أخطأ",
          "لأنها حرجة"
        ],
        "answer": "لأن جهاز المستشار لم يعد يصل إلى 3389، لا لأن NLA فُعّل",
        "why": "التخفيف ليس علاجاً."
      },
      {
        "q": "من يقرر ما يُفعل في F7 (Telnet الطابعة)؟",
        "type": "choice",
        "options": [
          "المكتب (مع مورّد الطابعة)",
          "المستشار وحده",
          "لا أحد"
        ],
        "answer": "المكتب (مع مورّد الطابعة)",
        "why": "قبول الخطر أو علاجه قرار صاحب الأجهزة.",
        "extra": true
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "في Nessus الحقيقي: My Scans ← الفحص ← Launch يعيد التشغيل بالإعدادات نفسها، وكل تشغيل في History.",
      "Zenmap: Tools › Compare Results (Ctrl+D) يقارن فحصين محفوظين (Scan › Save Scan)."
    ],
    "officialSite": "https://nmap.org/book/zenmap-compare.html"
  },
  "guide": [
    "تعيد فحص Nessus نفسه بعد العلاج وترى أن الثغرات الحرجة اختفت.",
    "تقارن فحص Zenmap قبل وبعد.",
    "تقرأ تقرير تقييم الأمن الكامل وتطبعه."
  ]
};
