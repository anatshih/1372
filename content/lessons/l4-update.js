/* Lesson l4-update — generated from docs/concepts.md (cards) and docs/outputs-spec.md (values); edit freely after generation. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l4-update"] = {
  "id": "l4-update",
  "seq": 4,
  "axis": 2,
  "axisTitle": "المحور ٢: عالج",
  "units": [
    10
  ],
  "tools": [
    "Windows Update"
  ],
  "minutes": 10,
  "title": "الترقيع: Windows Update",
  "caseBranch": {
    "question": "كيف نغلق الثغرة الحرجة V01؟",
    "known": "Nessus وجد التحديث KB5099901 ناقصاً على ACC-PC1 وACC-PC2، وخطورته Critical.",
    "now": "نثبّت التحديث من Windows Update، ونعيد التشغيل، ونتأكد أنه اكتمل.",
    "finding": "ثُبّت KB5099901 على ACC-PC1 وأُعيد التشغيل؛ Update history يقول Successfully installed on 10/13/2026 (وACC-PC2 بالخطوات نفسها). البند F1 مغلق."
  },
  "objectives": [
    "تثبيت تحديث أمني ناقص حتى يكتمل.",
    "فهم أن التحديث لا يكتمل قبل إعادة التشغيل.",
    "التحقق من التثبيت في Update history ومطابقة رقم KB مع Nessus."
  ],
  "explain": {
    "intro": "التشبيه الجامع: المصنّع يستدعي السيارة لتبديل قطعة معيبة؛ والقطعة الجديدة لا تعمل حتى تُركَّب فعلاً.",
    "figure": "exposure",
    "whatNext": "ستفتح Settings على ACC-PC1، وتثبّت التحديثين، وتعيد التشغيل، وتتأكد من Update history.",
    "cards": [
      {
        "id": "patch-update",
        "ar": "الترقيع والتحديث",
        "en": "Patch / Update",
        "analogy": "المصنّع يستدعي السيارة لتبديل قطعة معيبة.",
        "meaning": "الترقيعة تعديل من المصنّع يغلق ثغرة أو يصلح خطأ. أغلب الثغرات المعروفة لها ترقيعة جاهزة، والمشكلة أنها لم تُثبَّت.",
        "inTool": [
          "Updates available ← Download & install all."
        ],
        "forDefender": "الترقيع أرخص علاج وأكثره فعالية.",
        "fromFrame": "حقل Solution في Nessus: «Apply security update KB50xxxxx».",
        "mistake": "تأجيل التحديثات أشهراً «حتى لا يتعطل العمل».",
        "quiz": {
          "q": "ما أبسط علاج لثغرة معلنة لها تحديث؟",
          "type": "reveal",
          "answer": "تثبيت التحديث."
        }
      },
      {
        "id": "kb-cumulative-update",
        "ar": "رقم التحديث والتحديث التراكمي",
        "en": "KB / Cumulative Update",
        "analogy": "رقم الإصدار على علبة الدواء.",
        "meaning": "كل تحديث له رقم KB. التحديث التراكمي يجمع كل الإصلاحات السابقة، فتثبيت أحدثه يكفي.",
        "inTool": [
          "2026-10 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB50xxxxx)",
          "وفي Update history."
        ],
        "forDefender": "رقم KB في Nessus = رقم KB في Windows Update ← دليل على أن المشكلة نفسها عولجت.",
        "fromFrame": "الرقم نفسه يظهر في الأداتين (يُثبَّت في outputs-spec).",
        "mistake": "البحث عن كل تحديث قديم على حدة بدل أحدث تراكمي.",
        "quiz": {
          "q": "أين تتأكد أن التحديث ثُبّت فعلاً؟",
          "type": "reveal",
          "answer": "Update history (Successfully installed)."
        }
      },
      {
        "id": "pending-restart",
        "ar": "إعادة التشغيل المعلّقة",
        "en": "Pending restart",
        "analogy": "تبديل القطعة لا يتم والسيارة تسير.",
        "meaning": "كثير من التحديثات لا تكتمل حتى يُعاد تشغيل الجهاز؛ قبل ذلك تبقى الثغرة مفتوحة.",
        "inTool": [
          "Pending restart وRestart now."
        ],
        "forDefender": "إعادة الفحص قبل إعادة التشغيل ستُظهر الثغرة كأنها لم تُعالج.",
        "fromFrame": "الدرس لا يُغلق الثغرة في التقرير إلا بعد Restart now.",
        "mistake": "إغلاق النافذة بعد التنزيل والظن أن العمل انتهى.",
        "quiz": {
          "q": "ظهر Pending restart؛ هل أُغلقت الثغرة؟",
          "type": "reveal",
          "answer": "ليس بعد."
        }
      },
      {
        "id": "known-zero-day",
        "ar": "الثغرة المعروفة واليوم الصفري",
        "en": "Known / Zero-day",
        "analogy": "عيب أعلن عنه المصنّع وأرسل قطعته، مقابل عيب لم يكتشفه المصنّع بعد.",
        "meaning": "اليوم الصفري ثغرة لا ترقيعة لها بعد. الأكثرية الساحقة من الحوادث تأتي من ثغرات معروفة ولها ترقيعة لم تُثبَّت.",
        "inTool": [
          "تاريخ Published في Nessus مقابل تاريخ آخر تحديث مثبّت."
        ],
        "forDefender": "التحديث المنتظم يغلق أغلب الأبواب؛ وللصفرية نعتمد الطبقات الأخرى (جدار ناري، أقل صلاحيات).",
        "fromFrame": "ثغرة ACC-PC1 معلنة منذ أسابيع ولها تحديث.",
        "mistake": "«لا فائدة من التحديث لأن هناك ثغرات لا نعرفها».",
        "quiz": {
          "q": "ثغرة لها ترقيعة منذ شهرين؛ هل هي يوم صفري؟",
          "type": "reveal",
          "answer": "لا."
        },
        "extra": true
      },
      {
        "id": "patch-management",
        "ar": "إدارة الترقيع",
        "en": "Patch Management",
        "analogy": "جدول صيانة دوري لأسطول سيارات.",
        "meaning": "دورة: جرد ← تقييم الأولوية ← اختبار على جهاز ← نشر ← تحقق. في المكاتب الصغيرة: تفعيل التحديث التلقائي وتحديد ساعات العمل (Active hours).",
        "inTool": [
          "Advanced options → Active hours",
          "Pause updates للاستثناء المؤقت فقط."
        ],
        "forDefender": "التوصية في التقرير ليست «ثبّت هذا التحديث» فقط، بل «نظّم الترقيع».",
        "fromFrame": "التحديث التلقائي على ACC-PC1 كان موقوفاً منذ أشهر.",
        "mistake": "إيقاف التحديثات دائماً لتجنّب إعادة التشغيل.",
        "quiz": {
          "q": "ما آخر خطوة في دورة الترقيع؟",
          "type": "reveal",
          "answer": "التحقق (إعادة الفحص)."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "winupdate",
    "state": "before",
    "scenario": "أنت على ACC-PC1. Nessus قال إن التحديث KB5099901 ناقص. ثبّته من Windows Update حتى النهاية.",
    "launchers": [
      {
        "tool": "winupdate",
        "label": "Settings",
        "auto": true
      }
    ],
    "freeNote": "جرّب دون تلميحات: ثبّت التحديثات، وأعد التشغيل، وافتح Update history.",
    "steps": [
      {
        "id": "s1",
        "title": "افتح Windows Update",
        "instruction": "في نافذة Settings اضغط Windows Update في القائمة الجانبية.",
        "why": "هنا تظهر التحديثات الناقصة وآخر تحقق.",
        "expect": {
          "type": "event",
          "name": "winupdate:page",
          "where": {
            "page": "Windows Update"
          }
        },
        "target": "[data-win=\"winupdate\"] [data-page=\"Windows Update\"]",
        "hints": [
          "القائمة الجانبية في Settings.",
          "آخر بند في القائمة.",
          "اضغط Windows Update."
        ],
        "demo": {
          "kind": "ui",
          "tool": "winupdate",
          "action": "show",
          "arg": "Windows Update"
        },
        "result": "الحالة Updates available، وآخر تحقق 7/2/2026: أكثر من ثلاثة أشهر بلا تحديث."
      },
      {
        "id": "s2",
        "title": "ثبّت التحديثات",
        "instruction": "اضغط Download & install all، وانتظر حتى يظهر Restart required.",
        "why": "التحديث التراكمي يغلق V01؛ وتحديث التواقيع يفيد في الدرس 5.",
        "expect": {
          "type": "event",
          "name": "winupdate:installed"
        },
        "target": "[data-win=\"winupdate\"] .st-wuhead",
        "hints": [
          "الزر الأزرق أعلى الصفحة.",
          "اسمه Download & install all.",
          "اضغطه وانتظر."
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "winupdate",
            "action": "install"
          },
          {
            "kind": "ui",
            "tool": "winupdate",
            "action": "waitInstalled"
          }
        ],
        "result": "التحديثات نُزّلت وثُبّتت، والحالة الآن Restart required: لم تكتمل بعد."
      },
      {
        "id": "s3",
        "title": "أعد التشغيل",
        "instruction": "اضغط Restart now.",
        "why": "التحديث لا يكتمل قبل إعادة التشغيل؛ والثغرة مفتوحة حتى ذلك الحين.",
        "expect": {
          "type": "event",
          "name": "winupdate:restart"
        },
        "target": "[data-win=\"winupdate\"] .st-wuhead",
        "hints": [
          "الحالة الآن Restart required.",
          "الزر الأزرق بجانبها.",
          "اضغط Restart now."
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "winupdate",
            "action": "restart"
          },
          {
            "kind": "ui",
            "tool": "winupdate",
            "action": "waitRestarted"
          }
        ],
        "result": "بعد إعادة التشغيل: You're up to date. الآن فقط أُغلقت الثغرة."
      },
      {
        "id": "s4",
        "title": "تأكد من السجل",
        "instruction": "تحت More options اضغط Update history، واقرأ Successfully installed.",
        "why": "السجل هو الدليل على أن التحديث ثُبّت فعلاً.",
        "expect": {
          "type": "event",
          "name": "winupdate:history"
        },
        "target": "[data-win=\"winupdate\"] .st-main",
        "hints": [
          "أسفل الصفحة قسم More options.",
          "البند الثاني فيه.",
          "اضغط Update history."
        ],
        "demo": {
          "kind": "ui",
          "tool": "winupdate",
          "action": "history"
        },
        "result": "السجل يقول Successfully installed on 10/13/2026: هذا دليلك في التقرير."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "before",
        "tool": "winupdate",
        "cmd": "available",
        "title": "قبل التثبيت",
        "heading": "Settings › Windows Update (قبل)"
      },
      {
        "id": "restart",
        "tool": "winupdate",
        "cmd": "restart",
        "title": "بعد التثبيت",
        "heading": "Settings › Windows Update (بعد التثبيت، قبل إعادة التشغيل)"
      },
      {
        "id": "done",
        "tool": "winupdate",
        "cmd": "uptodate",
        "title": "بعد إعادة التشغيل",
        "heading": "Settings › Windows Update (بعد إعادة التشغيل)"
      },
      {
        "id": "hist",
        "tool": "winupdate",
        "cmd": "history",
        "title": "Update history",
        "heading": "Settings › Windows Update › Update history"
      }
    ],
    "highlights": [
      {
        "src": "before",
        "line": "Last checked",
        "match": "7/2/2026, 9:14 AM",
        "label": "آخر تحقق",
        "danger": true,
        "concept": "patch-management",
        "meaning": "آخر تحقق من التحديثات قبل أكثر من ثلاثة أشهر: الترقيع على هذا الجهاز متوقف.",
        "core": true
      },
      {
        "src": "before",
        "line": "(KB5099901)",
        "match": "KB5099901",
        "label": "KB5099901",
        "concept": "kb-cumulative-update",
        "meaning": "الرقم نفسه في حقل Solution في Nessus (V01): الدليل على أننا نعالج المشكلة نفسها.",
        "core": true
      },
      {
        "src": "restart",
        "line": "Pending restart",
        "match": "Pending restart",
        "label": "Pending restart",
        "danger": true,
        "concept": "pending-restart",
        "meaning": "التحديث نُزّل وثُبّت لكنه لا يكتمل قبل إعادة التشغيل: الثغرة ما زالت مفتوحة.",
        "core": true
      },
      {
        "src": "done",
        "line": "You're up to date",
        "match": "You're up to date",
        "label": "up to date",
        "concept": "patch-update",
        "meaning": "بعد إعادة التشغيل لا تحديثات ناقصة. نُثبت ذلك في الدرس 10 بإعادة فحص Nessus."
      },
      {
        "src": "hist",
        "line": "Successfully installed",
        "match": "Successfully installed on 10/13/2026",
        "label": "مثبّت",
        "concept": "kb-cumulative-update",
        "meaning": "السجل يثبت التثبيت وتاريخه: هذا ما يُكتب في تقرير تقييم الأمن.",
        "core": true
      }
    ],
    "table": [
      {
        "see": "Updates available • Last checked قديم",
        "means": "الترقيع متوقف؛ الجهاز معرّض لثغرات لها حلول جاهزة."
      },
      {
        "see": "Pending restart",
        "means": "التحديث لم يكتمل؛ أعد التشغيل قبل أن تعيد الفحص."
      },
      {
        "see": "Successfully installed on …",
        "means": "ثُبّت فعلاً؛ وهو دليلك في التقرير."
      },
      {
        "see": "رقم KB في Nessus = رقم KB هنا",
        "means": "عالجت المشكلة نفسها التي وجدها الماسح."
      }
    ],
    "questions": [
      {
        "q": "متى آخر تحقق من التحديثات قبل تدخلك؟",
        "type": "choice",
        "options": [
          "7/2/2026",
          "10/13/2026",
          "اليوم"
        ],
        "answer": "7/2/2026",
        "why": "أكثر من ثلاثة أشهر بلا تحديث."
      },
      {
        "q": "ما حالة التحديث التراكمي بعد التثبيت مباشرة؟",
        "type": "choice",
        "options": [
          "Pending restart",
          "Successfully installed",
          "Pending download"
        ],
        "answer": "Pending restart",
        "why": "يحتاج إعادة تشغيل ليكتمل."
      },
      {
        "q": "أين تثبت أن التحديث اكتمل؟",
        "type": "choice",
        "options": [
          "Update history",
          "Advanced options",
          "Windows Insider Program"
        ],
        "answer": "Update history",
        "why": "Successfully installed on 10/13/2026."
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "في الكتاب ← اليوم: Windows Update مدمج في Windows 11 (Settings › Windows Update)، والتحديث التراكمي الشهري يُصدر عادةً في الثلاثاء الثاني من كل شهر.",
      "Active hours تمنع إعادة التشغيل أثناء الدوام بدل إيقاف التحديثات."
    ],
    "officialSite": "https://support.microsoft.com/windows/windows-update-faq-8a903416-6f45-0718-f5c7-375e92dddeb2"
  },
  "guide": [
    "تفتح Windows Update وترى أن التحديثات متوقفة منذ أشهر.",
    "تثبّت التحديث الناقص KB5099901 وتعيد التشغيل.",
    "تتأكد من التثبيت في Update history."
  ]
};
