/* Lesson l6-autoruns — generated from docs/concepts.md (cards) and docs/outputs-spec.md (values); edit freely after generation. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l6-autoruns"] = {
  "id": "l6-autoruns",
  "seq": 6,
  "axis": 2,
  "axisTitle": "المحور ٢: عالج",
  "units": [
    2,
    14
  ],
  "tools": [
    "Autoruns"
  ],
  "minutes": 10,
  "title": "إزالة التشغيل التلقائي: Autoruns",
  "caseBranch": {
    "question": "كيف نمنع rhelper من العودة مع كل تشغيل؟",
    "known": "Defender عزل rhelper.exe وrhupd.exe، لكن مدخلات تشغيلهما التلقائي باقية.",
    "now": "نعرض أماكن التشغيل التلقائي بـ Autoruns، ونعطّل مدخلي rhelper ثم نحذفهما.",
    "finding": "حُذف مدخل RemoteHelper من HKLM\\…\\Run والمهمة \\RemoteHelperUpdate؛ كانا أصفرين بعد العزل (File not found). البند F2 مغلق."
  },
  "objectives": [
    "قراءة أماكن التشغيل التلقائي في Autoruns.",
    "إخفاء مدخلات Microsoft للتركيز على المشبوه.",
    "التعطيل قبل الحذف، وتنظيف المدخلات اليتيمة."
  ],
  "explain": {
    "intro": "التشبيه الجامع: موظف أُخرج من المبنى، لكن اسمه ما زال في كشف الدوام.",
    "figure": "bootpath",
    "whatNext": "ستفتح Autoruns على ACC-PC1 بعد العزل، وتخفي مدخلات Microsoft، وتعطّل مدخل RemoteHelper ثم تحذفه، وتحذف المهمة المجدولة.",
    "cards": [
      {
        "id": "autostart-persistence",
        "ar": "التشغيل التلقائي والاستمرار",
        "en": "Autostart / Persistence",
        "analogy": "موظف أُخرج من المبنى لكن اسمه ما زال في كشف الدوام، فيُسمح له بالدخول كل صباح.",
        "meaning": "أماكن في Windows تجعل برنامجاً يبدأ وحده مع التشغيل أو الدخول. البرامج غير المرغوبة تسجّل نفسها فيها لتبقى بعد إعادة التشغيل (الاستمرار).",
        "inTool": [
          "تبويب Logon وScheduled Tasks وServices في Autoruns."
        ],
        "forDefender": "حذف الملف أو إنهاء العملية بلا إزالة مدخل التشغيل = عودة المشكلة أو خطأ عند الإقلاع.",
        "fromFrame": "rhelper.exe يعود بعد كل إعادة تشغيل.",
        "mistake": "الاعتماد على Startup apps في مدير المهام وحده؛ يعرض جزءاً صغيراً من الأماكن.",
        "quiz": {
          "q": "لماذا يعود برنامج أنهيته بـ End task بعد إعادة التشغيل؟",
          "type": "reveal",
          "answer": "لأن له مدخل تشغيل تلقائي."
        }
      },
      {
        "id": "registry-run-keys",
        "ar": "مفاتيح Run في السجل",
        "en": "Registry Run keys",
        "analogy": "قائمة «ابدأ يومك بـ…» مكتوبة في دفتر النظام.",
        "meaning": "السجل قاعدة إعدادات Windows. المفتاح ...\\CurrentVersion\\Run يذكر برامج تبدأ عند الدخول: HKLM لكل المستخدمين وHKCU للمستخدم الحالي فقط.",
        "inTool": [
          "صف الترويسة البنفسجي HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run وتحته المدخلات."
        ],
        "forDefender": "أشهر مكان للاستمرار؛ أول ما يُفحص.",
        "fromFrame": "مدخل RemoteHelper تحت HKLM\\...\\Run يشير إلى C:\\Users\\Public\\rhelper\\rhelper.exe.",
        "mistake": "تعديل السجل يدوياً بـ regedit دون نسخة احتياطية (اعرف أكثر).",
        "quiz": {
          "q": "مدخل تحت HKCU\\...\\Run؛ هل يعمل لكل المستخدمين؟",
          "type": "reveal",
          "answer": "لا، للمستخدم الحالي فقط."
        }
      },
      {
        "id": "scheduled-tasks-services",
        "ar": "المهام المجدولة والخدمات",
        "en": "Scheduled Tasks / Services",
        "analogy": "منبّه يعمل في وقت محدد، وموظف دائم يعمل قبل وصول أحد.",
        "meaning": "المهمة المجدولة تشغّل برنامجاً في وقت أو حدث محدد. الخدمة برنامج يعمل في الخلفية مع إقلاع النظام، حتى قبل دخول أي مستخدم.",
        "inTool": [
          "تبويبا Scheduled Tasks وServices."
        ],
        "forDefender": "برنامج أُزيل من Run قد يبقى في مهمة مجدولة؛ يُفحص Everything.",
        "fromFrame": "مهمة مجدولة RemoteHelperUpdate تعيد مدخل rhelper (قيمة مقترحة).",
        "mistake": "إغلاق Logon وحده.",
        "quiz": {
          "q": "أي التبويبات يعرض كل الأماكن معاً؟",
          "type": "reveal",
          "answer": "Everything."
        }
      },
      {
        "id": "disable-vs-delete",
        "ar": "التعطيل قبل الحذف والمدخل اليتيم",
        "en": "Disable vs Delete",
        "analogy": "إيقاف موظف عن العمل مؤقتاً حتى ينتهي التحقيق، بدل فصله فوراً.",
        "meaning": "إلغاء مربع الاختيار يعطّل المدخل ويمكن التراجع؛ Delete يحذفه نهائياً. الصف الأصفر = مدخل يشير إلى ملف غير موجود (يتيم).",
        "inTool": [
          "مربع الاختيار",
          "Entry → Delete",
          "الصف الأصفر File not found."
        ],
        "forDefender": "التعطيل آمن إن أخطأت؛ والمدخلات اليتيمة تُنظَّف بعد إزالة الملف.",
        "fromFrame": "بعد أن يحجر Defender ملف rhelper.exe يصبح مدخله أصفر ← يُحذف.",
        "mistake": "حذف مدخلات Microsoft أو التعريفات (Drivers) دون معرفة.",
        "quiz": {
          "q": "أي الإجراءين يمكن التراجع عنه بسهولة؟",
          "type": "reveal",
          "answer": "التعطيل (إلغاء المربع)."
        }
      },
      {
        "id": "digital-signature-publisher",
        "ar": "التوقيع الرقمي والناشر",
        "en": "Digital Signature / Publisher",
        "analogy": "ختم الشركة على الطرد.",
        "meaning": "الشركات توقّع برامجها رقمياً؛ Autoruns يتحقق من التوقيع ويكتب الناشر، أو (Not Verified) إن فشل.",
        "inTool": [
          "عمود Publisher",
          "تفعيل Verify code signatures من Scan Options…",
          "الصف الوردي."
        ],
        "forDefender": "Hide Microsoft Entries يخفي مئات المدخلات الموقّعة فيبقى المشبوه ظاهراً.",
        "fromFrame": "rhelper.exe بلا ناشر موثّق ← وردي.",
        "mistake": "الظن أن كل برنامج موقّع آمن، أو كل غير موقّع خبيث؛ التوقيع قرينة لا حكم.",
        "quiz": {
          "q": "ماذا يفعل Hide Microsoft Entries؟",
          "type": "reveal",
          "answer": "يخفي مدخلات Microsoft الموقّعة لتسهيل البحث."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "autoruns",
    "state": "quarantined",
    "scenario": "أنت على ACC-PC1 بعد الدرس 5 (الملفات معزولة). نظّف مدخلات التشغيل التلقائي التي تشير إليها.",
    "launchers": [
      {
        "tool": "autoruns",
        "label": "Autoruns",
        "auto": true
      }
    ],
    "freeNote": "جرّب دون تلميحات: الخيارات الثلاثة في Options، والتبويبات، وحاول حذف مدخل سليم لترى التحذير.",
    "steps": [
      {
        "id": "s1",
        "title": "أخفِ مدخلات Microsoft",
        "instruction": "من قائمة Options فعّل Hide Microsoft Entries.",
        "why": "يبقى ظاهراً ما ليس من Microsoft فقط.",
        "expect": {
          "type": "event",
          "name": "autoruns:option",
          "where": {
            "name": "Hide Microsoft Entries",
            "value": true
          }
        },
        "target": "[data-win=\"autoruns\"] .menubar",
        "hints": [
          "القوائم أعلى النافذة.",
          "قائمة Options.",
          "Options ← Hide Microsoft Entries."
        ],
        "demo": {
          "kind": "ui",
          "tool": "autoruns",
          "action": "setOption",
          "arg": [
            "Hide Microsoft Entries",
            true
          ]
        },
        "result": "اختفت مدخلات Microsoft الموقّعة، وبقي ما يستحق النظر."
      },
      {
        "id": "s2",
        "title": "تبويب Logon",
        "instruction": "اضغط تبويب Logon.",
        "why": "مفاتيح Run: أشهر مكان للتشغيل التلقائي.",
        "expect": {
          "type": "event",
          "name": "autoruns:tab",
          "where": {
            "tab": "Logon"
          }
        },
        "target": "[data-win=\"autoruns\"] [data-tab=\"Logon\"]",
        "hints": [
          "التبويبات تحت حقل Quick Filter.",
          "الثاني من اليسار.",
          "اضغط Logon."
        ],
        "demo": {
          "kind": "ui",
          "tool": "autoruns",
          "action": "selectTab",
          "arg": "Logon"
        },
        "result": "تبويب Logon: مفاتيح Run. الصف الأصفر RemoteHelper يشير إلى ملف لم يعد موجوداً (File not found)."
      },
      {
        "id": "s3",
        "title": "عطّل RemoteHelper",
        "instruction": "ألغِ علامة الصح بجانب RemoteHelper (الصف الأصفر).",
        "why": "التعطيل أولاً: يمكن التراجع عنه إن أخطأت.",
        "expect": {
          "type": "event",
          "name": "autoruns:toggle",
          "where": {
            "name": "RemoteHelper",
            "enabled": false
          }
        },
        "target": "[data-win=\"autoruns\"] [data-toggle=\"RemoteHelper\"]",
        "hints": [
          "الصف الأصفر.",
          "مربع الاختيار في أول الصف.",
          "ألغِ علامة الصح."
        ],
        "demo": {
          "kind": "ui",
          "tool": "autoruns",
          "action": "toggle",
          "arg": [
            "RemoteHelper",
            false
          ]
        },
        "result": "المدخل معطّل (بلا علامة صح): لن يبدأ، ويمكن إعادته إن أخطأت."
      },
      {
        "id": "s4",
        "title": "احذف RemoteHelper",
        "instruction": "اختر الصف، ثم Entry ← Delete (أو زر الفأرة الأيمن)، ثم OK.",
        "why": "الملف لم يعد موجوداً (File not found): المدخل يتيم، فنحذفه.",
        "expect": {
          "type": "event",
          "name": "autoruns:delete",
          "where": {
            "name": "RemoteHelper"
          }
        },
        "target": "[data-win=\"autoruns\"] [data-name=\"RemoteHelper\"]",
        "hints": [
          "اضغط الصف أولاً.",
          "قائمة Entry فيها Delete.",
          "Entry ← Delete ← OK."
        ],
        "demo": {
          "kind": "ui",
          "tool": "autoruns",
          "action": "remove",
          "arg": "RemoteHelper"
        },
        "result": "حُذف RemoteHelper من مفتاح Run."
      },
      {
        "id": "s5",
        "title": "احذف المهمة المجدولة",
        "instruction": "افتح تبويب Scheduled Tasks، واحذف \\RemoteHelperUpdate بالطريقة نفسها.",
        "why": "المهمة كانت ستعيد البرنامج؛ لا تكفي إزالة Run وحده.",
        "expect": {
          "type": "event",
          "name": "autoruns:delete",
          "where": {
            "name": "\\RemoteHelperUpdate"
          }
        },
        "target": "[data-win=\"autoruns\"] [data-tab=\"Scheduled Tasks\"]",
        "hints": [
          "تبويب Scheduled Tasks.",
          "الصف الأصفر فيه.",
          "اختره ← Entry ← Delete ← OK."
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "autoruns",
            "action": "selectTab",
            "arg": "Scheduled Tasks"
          },
          {
            "kind": "ui",
            "tool": "autoruns",
            "action": "remove",
            "arg": "\\RemoteHelperUpdate"
          }
        ],
        "result": "حُذفت المهمة \\RemoteHelperUpdate: لم يبقَ طريق لعودة البرنامج."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "logon",
        "kind": "autoruns",
        "tab": "Logon",
        "state": "before",
        "title": "Logon (قبل العزل)"
      },
      {
        "id": "logon2",
        "kind": "autoruns",
        "tab": "Logon",
        "state": "quarantined",
        "title": "Logon (بعد العزل)"
      },
      {
        "id": "tasks",
        "kind": "autoruns",
        "tab": "Scheduled Tasks",
        "state": "quarantined",
        "title": "Scheduled Tasks (بعد العزل)"
      }
    ],
    "highlights": [
      {
        "src": "logon",
        "row": "rh",
        "col": "publisher",
        "label": "ناشر RemoteHelper",
        "danger": true,
        "concept": "digital-signature-publisher",
        "meaning": "(Not Verified): لا ناشر موثّق، فالصف وردي. قرينة تستحق الفحص.",
        "core": true
      },
      {
        "src": "logon",
        "row": "acc",
        "col": "publisher",
        "label": "ناشر AccountingSync",
        "concept": "digital-signature-publisher",
        "meaning": "(Verified) Example Accounting Ltd.: برنامج المحاسبة موقّع ويحتاجه المكتب؛ لا نلمسه.",
        "core": true
      },
      {
        "src": "logon",
        "row": "header:HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
        "col": "header",
        "label": "مفتاح Run",
        "concept": "registry-run-keys",
        "meaning": "HKLM: يعمل لكل المستخدمين عند الدخول."
      },
      {
        "src": "logon2",
        "row": "rh",
        "col": "path",
        "label": "File not found",
        "danger": true,
        "concept": "disable-vs-delete",
        "meaning": "بعد العزل لا ملف خلف المدخل (أصفر): مدخل يتيم يُحذف.",
        "core": true
      },
      {
        "src": "tasks",
        "row": "rht",
        "col": "path",
        "label": "rhupd.exe",
        "concept": "scheduled-tasks-services",
        "meaning": "المهمة المجدولة تشغّل rhupd.exe: طريق ثانٍ للعودة.",
        "core": true
      }
    ],
    "table": [
      {
        "see": "صف وردي",
        "means": "لا ناشر موثّق أو فشل التحقق من التوقيع."
      },
      {
        "see": "صف أصفر • File not found",
        "means": "الملف غير موجود: مدخل يتيم."
      },
      {
        "see": "مربع الاختيار بلا علامة",
        "means": "المدخل معطّل ويمكن إعادته."
      },
      {
        "see": "Entry › Delete",
        "means": "حذف نهائي للمدخل (لا يحذف الملف)."
      }
    ],
    "questions": [
      {
        "q": "كم مدخلاً يخص rhelper؟",
        "type": "choice",
        "answer": "2",
        "why": "RemoteHelper في HKLM\\…\\Run، و\\RemoteHelperUpdate في Task Scheduler.",
        "options": [
          "2",
          "1",
          "4"
        ]
      },
      {
        "q": "لماذا صار المدخلان أصفرين؟",
        "type": "choice",
        "options": [
          "لأن Defender عزل الملفات (File not found)",
          "لأنهما معطّلان",
          "لأنهما من Microsoft"
        ],
        "answer": "لأن Defender عزل الملفات (File not found)",
        "why": "المدخل يشير إلى ملف لم يعد موجوداً."
      },
      {
        "q": "لماذا لا نحذف AccountingSync رغم أنه ليس من Microsoft؟",
        "type": "choice",
        "options": [
          "موقّع وموثّق (Verified) ويحتاجه المكتب",
          "لأنه أصفر",
          "لأن Autoruns لا يسمح"
        ],
        "answer": "موقّع وموثّق (Verified) ويحتاجه المكتب",
        "why": "التوقيع قرينة، ومعرفة المكتب بالبرنامج تحسم."
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "في الكتاب ← اليوم: تبويب Startup في msconfig ← Task Manager › Startup apps (جزء من الأماكن) وAutoruns من Microsoft Sysinternals (كل الأماكن).",
      "Autoruns مجاني، ويُشغَّل كمسؤول ليرى كل المدخلات."
    ],
    "officialSite": "https://learn.microsoft.com/sysinternals/downloads/autoruns"
  },
  "guide": [
    "تعرض في Autoruns كل ما يبدأ وحده مع الجهاز.",
    "تعطّل مدخل RemoteHelper ثم تحذفه.",
    "تحذف المهمة المجدولة التي كانت ستعيده."
  ]
};
