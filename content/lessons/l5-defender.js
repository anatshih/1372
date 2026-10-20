/* Lesson l5-defender — generated from docs/concepts.md (cards) and docs/outputs-spec.md (values); edit freely after generation. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l5-defender"] = {
  "id": "l5-defender",
  "seq": 5,
  "axis": 2,
  "axisTitle": "المحور ٢: عالج",
  "units": [
    3,
    4,
    12,
    14
  ],
  "tools": [
    "Windows Security"
  ],
  "minutes": 15,
  "title": "الفحص والإزالة: Microsoft Defender",
  "caseBranch": {
    "question": "هل على ACC-PC1 برامج ضارة؟ وكيف نزيلها؟",
    "known": "على ACC-PC1 برنامج دعم منسي rhelper.exe (5900)، والتحديث الأمني ثُبّت.",
    "now": "نحدّث تواقيع Defender ونفحص الجهاز ومجلد rhelper، ونعزل ما نجده.",
    "finding": "Defender عزل حصان طروادة invoice_oct.pdf.exe (Severe) من Downloads، وعزل rhelper.exe وrhupd.exe (PUA). البند F3 مغلق."
  },
  "objectives": [
    "تحديث التواقيع قبل الفحص.",
    "التمييز بين أنواع الفحص واختيار المناسب.",
    "عزل التهديد (Quarantine) وقراءة سجل الحماية."
  ],
  "explain": {
    "intro": "التشبيه الجامع: الشرطة تعرف المطلوبين بصورهم؛ وصور قديمة لا تكشف المطلوب الجديد.",
    "figure": "quarantine",
    "whatNext": "ستفتح Windows Security على ACC-PC1، وتحدّث التواقيع، وتفحص فحصاً سريعاً، وتعزل ما تجده، ثم تفحص مجلد rhelper.",
    "cards": [
      {
        "id": "malware-types",
        "ar": "أنواع البرامج الخبيثة",
        "en": "Malware types",
        "analogy": "أمراض مختلفة لها أعراض مختلفة.",
        "meaning": "فيروس يلتصق بملفات أخرى • دودة تنتشر وحدها عبر الشبكة • حصان طروادة يتنكر ببرنامج مفيد • برنامج فدية يشفّر الملفات ويطلب مالاً • برنامج تجسس يجمع معلومات • PUA برنامج غير مرغوب فيه (ليس خبيثاً تماماً).",
        "inTool": [
          "أول كلمة في اسم الاكتشاف: Trojan:Win32/...",
          "Virus:...",
          "PUA:Win32/...",
          "Ransom:Win32/...",
          "وحقل Category."
        ],
        "forDefender": "النوع يحدد ما يجب فحصه بعد الإزالة (الدودة ← بقية الأجهزة؛ الفدية ← النسخ الاحتياطية).",
        "fromFrame": "invoice_oct.pdf.exe يُصنَّف حصان طروادة.",
        "mistake": "تسمية كل برنامج خبيث «فيروس».",
        "quiz": {
          "q": "برنامج ينتشر وحده بين أجهزة الشبكة دون أن يفتحه أحد؛ ما نوعه؟",
          "type": "reveal",
          "answer": "دودة."
        }
      },
      {
        "id": "signatures-behavior-cloud",
        "ar": "كيف يكتشف مضاد الفيروسات",
        "en": "Signatures / Behavior / Cloud",
        "analogy": "الشرطة تعرف المطلوبين بصورهم (التواقيع)، وتشك في من يتصرف بغرابة (السلوك).",
        "meaning": "التواقيع بصمات برامج خبيثة معروفة، تُحدَّث يومياً • السلوك مراقبة ما يفعله البرنامج • السحابة سؤال خوادم Microsoft عن ملف جديد.",
        "inTool": [
          "Protection updates → Security intelligence version وCheck for updates",
          "مفتاح Cloud-delivered protection."
        ],
        "forDefender": "مضاد فيروسات بتواقيع قديمة لا يعرف الجديد؛ تحديث التواقيع قبل الفحص.",
        "fromFrame": "تحديث التواقيع ثم Quick scan.",
        "mistake": "الظن أن مضاد الفيروسات يكتشف كل شيء.",
        "quiz": {
          "q": "ماذا تفعل قبل الفحص الكامل؟",
          "type": "reveal",
          "answer": "تحديث التواقيع."
        }
      },
      {
        "id": "quarantine-remove-allow",
        "ar": "الحجر والإزالة والسماح",
        "en": "Quarantine / Remove / Allow",
        "analogy": "عزل المريض، أو علاجه نهائياً، أو إخراجه من المستشفى.",
        "meaning": "Quarantine نقل الملف إلى مكان معزول لا يعمل فيه (يمكن استرجاعه إن كان خطأ) • Remove حذفه • Allow on device السماح به وإيقاف التنبيه.",
        "inTool": [
          "Actions ▾ في صف التهديد",
          "Status: Quarantined",
          "سجل Protection history."
        ],
        "forDefender": "الحجر أولاً آمن؛ Allow قرار خطير لا يُتخذ إلا بيقين.",
        "fromFrame": "invoice_oct.pdf.exe ← Quarantine ثم Remove.",
        "mistake": "الضغط على Allow on device لأن التنبيه «مزعج».",
        "quiz": {
          "q": "أي إجراء يسمح باسترجاع الملف إن تبيّن أنه سليم؟",
          "type": "reveal",
          "answer": "Quarantine."
        }
      },
      {
        "id": "double-extension",
        "ar": "التنكّر بالامتداد المزدوج",
        "en": "Double extension",
        "analogy": "لص يرتدي زي ساعي البريد.",
        "meaning": "Windows يخفي الامتداد المعروف افتراضياً، فيظهر invoice_oct.pdf.exe على أنه invoice_oct.pdf. الامتداد الأخير هو الحقيقي.",
        "inTool": [
          "Affected items: file: C:\\Users\\...\\Downloads\\invoice_oct.pdf.exe."
        ],
        "forDefender": "توصية للعميل: إظهار امتدادات الملفات، وتدريب الموظفين.",
        "fromFrame": "الملف وصل في بريد بعنوان «فاتورة أكتوبر».",
        "mistake": "الثقة بأيقونة الملف؛ الأيقونة يمكن تغييرها.",
        "quiz": {
          "q": "ما نوع report.docx.exe الحقيقي؟",
          "type": "reveal",
          "answer": "برنامج تنفيذي (.exe)."
        }
      },
      {
        "id": "quick-full-custom-offline",
        "ar": "أنواع الفحص",
        "en": "Quick / Full / Custom / Offline",
        "analogy": "فحص الأماكن المعتادة للمرض، أو فحص الجسم كله، أو فحص عضو محدد.",
        "meaning": "Quick الأماكن التي تختبئ فيها البرامج عادة (الذاكرة، التشغيل التلقائي) • Full كل الملفات (أبطأ) • Custom مجلد تختاره • Offline يعيد التشغيل ويفحص قبل أن يعمل Windows (للبرامج التي تختبئ أثناء عمله).",
        "inTool": [
          "Scan options ← اختيار ← Scan now."
        ],
        "forDefender": "نبدأ بالسريع؛ وعند الإصابة نُتبعه بالكامل.",
        "fromFrame": "Quick scan يكتشف invoice_oct.pdf.exe؛ ثم Custom scan لمجلد C:\\Users\\Public\\rhelper\\.",
        "mistake": "الاكتفاء بفحص سريع واحد بعد اكتشاف إصابة.",
        "quiz": {
          "q": "أي فحص لبرنامج يخفي نفسه أثناء عمل Windows؟",
          "type": "reveal",
          "answer": "Offline scan."
        },
        "extra": true
      },
      {
        "id": "real-time-protection-tamper-pr",
        "ar": "الحماية الفورية",
        "en": "Real-time protection / Tamper Protection",
        "analogy": "حارس دائم عند الباب مقابل تفتيش أسبوعي.",
        "meaning": "الحماية الفورية تفحص كل ملف لحظة فتحه أو تنزيله. الحماية من العبث تمنع البرامج من إيقاف مضاد الفيروسات.",
        "inTool": [
          "Manage settings → Real-time protection: On وTamper Protection: On."
        ],
        "forDefender": "أول ما يحاول برنامج خبيث فعله غالباً هو إيقاف الحماية.",
        "fromFrame": "الحماية كانت مفعّلة على ACC-PC1 لكن التواقيع قديمة.",
        "mistake": "إيقاف الحماية لتثبيت برنامج «مهم» ثم نسيانها.",
        "quiz": {
          "q": "أي إعداد يمنع برنامجاً خبيثاً من إطفاء Defender؟",
          "type": "reveal",
          "answer": "Tamper Protection."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "defender",
    "state": "before",
    "scenario": "أنت على ACC-PC1. حدّث تواقيع Defender، ثم افحص الجهاز ومجلد rhelper، واعزل كل ما يجده.",
    "launchers": [
      {
        "tool": "defender",
        "label": "Windows Security",
        "auto": true
      }
    ],
    "freeNote": "جرّب دون تلميحات: افحص قبل تحديث التواقيع وبعده، وجرّب Allow on device لترى التحذير.",
    "steps": [
      {
        "id": "s1",
        "title": "افتح الحماية من الفيروسات",
        "instruction": "في الشريط الجانبي اضغط Virus & threat protection.",
        "why": "هنا الفحص والتواقيع والتهديدات.",
        "expect": {
          "type": "event",
          "name": "defender:page",
          "where": {
            "page": "Virus & threat protection"
          }
        },
        "target": "[data-win=\"defender\"] [data-page=\"Virus & threat protection\"]",
        "hints": [
          "الشريط الجانبي.",
          "البند الثاني.",
          "اضغط Virus & threat protection."
        ],
        "demo": {
          "kind": "ui",
          "tool": "defender",
          "action": "show",
          "arg": "Virus & threat protection"
        },
        "result": "صفحة الحماية من الفيروسات: الفحص، والإعدادات، والتحديثات."
      },
      {
        "id": "s2",
        "title": "حدّث التواقيع",
        "instruction": "اضغط Protection updates (أسفل الصفحة)، ثم Check for updates.",
        "why": "التواقيع قديمة (6/30/2026)؛ لا تعرف الملف الذي وصل في أكتوبر.",
        "expect": {
          "type": "event",
          "name": "defender:sigupdate"
        },
        "target": "[data-win=\"defender\"] .st-main",
        "hints": [
          "قسم Virus & threat protection updates.",
          "الرابط Protection updates ثم الزر الأزرق.",
          "Protection updates ← Check for updates."
        ],
        "demo": {
          "kind": "ui",
          "tool": "defender",
          "action": "updateSigs"
        },
        "result": "التواقيع صارت 1.441.202.0: الآن يعرف Defender الملفات الحديثة."
      },
      {
        "id": "s3",
        "title": "فحص سريع",
        "instruction": "ارجع إلى Virus & threat protection واضغط Quick scan.",
        "why": "يفحص الأماكن التي تختبئ فيها البرامج عادة.",
        "expect": {
          "type": "event",
          "name": "defender:scan",
          "where": {
            "type": "quick",
            "found": 1
          }
        },
        "onMismatch": "الفحص لم يجد شيئاً: هل حدّثت التواقيع أولاً؟",
        "target": "[data-win=\"defender\"] .st-main",
        "hints": [
          "الرابط في أعلى الصفحة الفرعية يعيدك.",
          "الزر الأزرق Quick scan.",
          "Virus & threat protection ← Quick scan."
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "defender",
            "action": "scan",
            "arg": "quick"
          },
          {
            "kind": "ui",
            "tool": "defender",
            "action": "waitScan"
          }
        ],
        "result": "وُجد تهديد: Trojan:Win32/FakeInv.A في ملف invoice_oct.pdf.exe (يبدو PDF وهو برنامج)."
      },
      {
        "id": "s4",
        "title": "اعزل الملف",
        "instruction": "من قائمة Actions بجانب Trojan:Win32/FakeInv.A اختر Quarantine.",
        "why": "العزل يوقف الملف ويسمح بالاسترجاع إن كان خطأ.",
        "expect": {
          "type": "event",
          "name": "defender:action",
          "where": {
            "action": "Quarantine",
            "threat": "Trojan:Win32/FakeInv.A"
          }
        },
        "target": "[data-win=\"defender\"] .sec-act",
        "hints": [
          "القائمة المنسدلة بجانب التهديد.",
          "اسمها Actions.",
          "Actions ← Quarantine."
        ],
        "demo": {
          "kind": "ui",
          "tool": "defender",
          "action": "act",
          "arg": [
            "Quarantine",
            "trojan"
          ]
        },
        "result": "الملف معزول (Quarantined): لا يعمل، ويمكن استرجاعه إن كان خطأ."
      },
      {
        "id": "s5",
        "title": "افحص مجلد rhelper",
        "instruction": "Scan options ← Custom scan ← Scan now ← اختر المجلد ← Select Folder.",
        "typeText": "C:\\Users\\Public\\rhelper\\",
        "typeLabel": "المجلد",
        "why": "الفحص المخصص لمجلد البرنامج المنسي الذي رأيناه في الدرس 1.",
        "expect": {
          "type": "event",
          "name": "defender:scan",
          "where": {
            "type": "custom",
            "found": 1
          }
        },
        "onMismatch": "اختر المجلد C:\\Users\\Public\\rhelper\\ تحديداً.",
        "target": "[data-win=\"defender\"] .st-main",
        "hints": [
          "الرابط Scan options تحت Quick scan.",
          "اختر Custom scan ثم Scan now ثم المجلد.",
          "Scan options ← Custom scan ← Scan now ← C:\\Users\\Public\\rhelper\\ ← Select Folder"
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "defender",
            "action": "customScan"
          },
          {
            "kind": "ui",
            "tool": "defender",
            "action": "waitScan"
          }
        ],
        "result": "فحص المجلد وجد PUA:Win32/RHelper في ملفين: rhelper.exe وrhupd.exe."
      },
      {
        "id": "s6",
        "title": "اعزل rhelper",
        "instruction": "من قائمة Actions بجانب PUA:Win32/RHelper اختر Quarantine.",
        "why": "برنامج غير مرغوب فيه يفتح باب تحكم كاملاً بلا كلمة مرور.",
        "expect": {
          "type": "event",
          "name": "defender:action",
          "where": {
            "action": "Quarantine",
            "threat": "PUA:Win32/RHelper"
          }
        },
        "target": "[data-win=\"defender\"] .sec-act",
        "hints": [
          "التهديد الجديد في القائمة.",
          "Actions بجانبه.",
          "Actions ← Quarantine."
        ],
        "demo": {
          "kind": "ui",
          "tool": "defender",
          "action": "act",
          "arg": [
            "Quarantine",
            "pua"
          ]
        },
        "result": "rhelper معزول أيضاً، فتوقف المنفذ 5900."
      },
      {
        "id": "s7",
        "title": "سجل الحماية",
        "instruction": "اضغط Protection history في الشريط الجانبي، وافتح أحد الأحداث.",
        "why": "السجل دليل ما فعلته: ماذا وُجد، ومتى، وأين.",
        "expect": {
          "type": "event",
          "name": "defender:page",
          "where": {
            "page": "Protection history"
          }
        },
        "target": "[data-win=\"defender\"] [data-page=\"Protection history\"]",
        "hints": [
          "آخر بند في الشريط الجانبي.",
          "اسمه Protection history.",
          "اضغطه."
        ],
        "demo": {
          "kind": "ui",
          "tool": "defender",
          "action": "show",
          "arg": "Protection history"
        },
        "result": "السجل يحفظ كل ما وُجد ومتى وأين: افتح أي حدث لترى التفاصيل."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "upd",
        "tool": "defender",
        "cmd": "updates",
        "title": "التواقيع",
        "heading": "Protection updates (قبل وبعد)"
      },
      {
        "id": "tro",
        "tool": "defender",
        "cmd": "trojan",
        "title": "الحدث 1",
        "heading": "Protection history › Threat quarantined (1)"
      },
      {
        "id": "pua",
        "tool": "defender",
        "cmd": "pua",
        "title": "الحدث 2",
        "heading": "Protection history › Threat quarantined (2)"
      }
    ],
    "highlights": [
      {
        "src": "upd",
        "line": "Version created on",
        "match": "6/30/2026",
        "label": "تواقيع قديمة",
        "danger": true,
        "concept": "malware-types",
        "meaning": "التواقيع من 6/30/2026، والملف الخبيث وصل في أكتوبر: الفحص قبل التحديث لا يعرفه.",
        "core": true
      },
      {
        "src": "upd",
        "line": "After:",
        "match": "1.441.202.0",
        "label": "تواقيع حديثة",
        "concept": "malware-types",
        "meaning": "الإصدار نفسه الذي ثبّته Windows Update في الدرس 4 (KB2267602)."
      },
      {
        "src": "tro",
        "line": "Detected",
        "match": "Trojan:Win32/FakeInv.A",
        "label": "اسم الاكتشاف",
        "concept": "malware-types",
        "meaning": "الكلمة الأولى Trojan: حصان طروادة يتنكر بملف مفيد (فاتورة).",
        "core": true
      },
      {
        "src": "tro",
        "line": "Downloads",
        "match": "invoice_oct.pdf.exe",
        "label": "الامتداد المزدوج",
        "danger": true,
        "concept": "double-extension",
        "meaning": "الامتداد الأخير .exe هو الحقيقي: برنامج يتنكر بملف PDF.",
        "core": true
      },
      {
        "src": "tro",
        "line": "Alert level",
        "match": "Severe",
        "label": "Severe",
        "concept": "malware-types",
        "meaning": "أعلى مستوى تنبيه في Defender."
      },
      {
        "src": "pua",
        "line": "Category",
        "match": "Potentially unwanted software",
        "label": "PUA",
        "concept": "malware-types",
        "meaning": "برنامج غير مرغوب فيه، لا حصان طروادة: لكنه يفتح باب تحكم كاملاً بلا كلمة مرور.",
        "core": true
      },
      {
        "src": "pua",
        "line": "rhupd.exe",
        "match": "rhupd.exe",
        "label": "rhupd.exe",
        "concept": "quarantine-remove-allow",
        "meaning": "الملف الثاني في المجلد؛ تشغّله مهمة مجدولة (سنزيلها في الدرس 6)."
      }
    ],
    "table": [
      {
        "see": "Security intelligence قديم",
        "means": "حدّث التواقيع قبل أي فحص."
      },
      {
        "see": "Threats found. Start the recommended actions.",
        "means": "تهديد نشط: اعزله (Quarantine)."
      },
      {
        "see": "Status: Quarantined",
        "means": "الملف معزول لا يعمل، ويمكن استرجاعه إن كان خطأ."
      },
      {
        "see": "Allow on device",
        "means": "يترك التهديد يعمل؛ لا يُستخدم مع تهديد حقيقي."
      },
      {
        "see": "اسم ينتهي بـ .pdf.exe",
        "means": "ملف تنفيذي متنكر."
      }
    ],
    "ioc": [
      "C:\\Users\\accountant\\Downloads\\invoice_oct.pdf.exe — Trojan:Win32/FakeInv.A",
      "C:\\Users\\Public\\rhelper\\rhelper.exe وrhupd.exe — PUA:Win32/RHelper"
    ],
    "questions": [
      {
        "q": "لماذا نحدّث التواقيع قبل الفحص؟",
        "type": "choice",
        "options": [
          "لأن التواقيع كانت من 6/30/2026",
          "لأن الفحص لا يعمل بلا إنترنت",
          "لا داعي لذلك"
        ],
        "answer": "لأن التواقيع كانت من 6/30/2026",
        "why": "الملف أحدث من التواقيع."
      },
      {
        "q": "ما الاسم الحقيقي للملف الذي يبدو PDF؟",
        "type": "choice",
        "answer": "invoice_oct.pdf.exe",
        "why": "برنامج تنفيذي (.exe).",
        "options": [
          "invoice_oct.pdf.exe",
          "invoice_oct.pdf",
          "rhelper.exe"
        ]
      },
      {
        "q": "أي إجراء يتيح الاسترجاع إن كان الاكتشاف خطأ؟",
        "type": "choice",
        "options": [
          "Quarantine",
          "Remove",
          "Allow on device"
        ],
        "answer": "Quarantine",
        "why": "الحجر يعزل ولا يحذف."
      },
      {
        "q": "ما نوع rhelper حسب Defender؟",
        "type": "choice",
        "options": [
          "برنامج غير مرغوب فيه (PUA)",
          "حصان طروادة",
          "فيروس"
        ],
        "answer": "برنامج غير مرغوب فيه (PUA)",
        "why": "Category: Potentially unwanted software.",
        "extra": true
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "في الكتاب ← اليوم: Norton ومضادات الفيروسات التجارية ← Microsoft Defender المدمج في Windows (Windows Security).",
      "أسماء الاكتشافات في المحاكاة تدريبية (FakeInv وRHelper)."
    ],
    "officialSite": "https://support.microsoft.com/windows/stay-protected-with-windows-security-2ae0363d-0ada-c064-8b56-6a39afb6a963"
  },
  "guide": [
    "تحدّث تواقيع Microsoft Defender (القديمة لا تعرف الملفات الجديدة).",
    "تفحص الجهاز وتعزل الملف الخبيث القادم من البريد.",
    "تفحص مجلد rhelper وتعزله، ثم تقرأ سجل الحماية."
  ]
};
