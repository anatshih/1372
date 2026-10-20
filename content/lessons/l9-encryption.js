/* Lesson l9-encryption — generated from docs/concepts.md (cards) and docs/outputs-spec.md (values); edit freely after generation. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l9-encryption"] = {
  "id": "l9-encryption",
  "seq": 9,
  "axis": 3,
  "axisTitle": "المحور ٣: حصّن",
  "units": [
    5,
    6,
    7,
    8,
    9
  ],
  "tools": [
    "Command Prompt",
    "7-Zip"
  ],
  "minutes": 15,
  "title": "التمويه مقابل التشفير، والمحو الآمن: CMD و7-Zip",
  "caseBranch": {
    "question": "هل ملف الرواتب محمي فعلاً؟",
    "known": "موظف «أخفى» ملف الرواتب باسم صورة holiday.jpg وصفة مخفي.",
    "now": "نكشف التمويه بأوامر CMD، ثم نشفّر الملف بـ 7-Zip، ونحذف الأصل، ونمحو المساحة الحرة.",
    "finding": "التمويه كُشف بأمرين (dir /a:h وattrib)، والملف صار salaries-2026.7z مشفّراً بـ AES-256 مع تشفير الأسماء، وحُذف الأصل ومُحيت المساحة الحرة بـ cipher /w. البند F5 مغلق."
  },
  "objectives": [
    "التمييز بين الإخفاء والتمويه والتشفير.",
    "تشفير ملف بـ AES-256 مع تشفير أسماء الملفات.",
    "فهم أن الحذف ليس محواً، واستخدام cipher /w."
  ],
  "explain": {
    "intro": "التشبيه الجامع: المفتاح تحت ممسحة الباب (تمويه) مقابل خزنة بقفل (تشفير). وتمزيق الفهرس لا يمحو صفحات الكتاب.",
    "figure": "boxes",
    "whatNext": "ستكشف الملف المخفي في CMD، وتعيد اسمه، وتشفّره بـ 7-Zip، ثم تحذف الأصل وتمحو المساحة الحرة.",
    "cards": [
      {
        "id": "hiding-obfuscation",
        "ar": "الإخفاء والتمويه",
        "en": "Hiding / Obfuscation",
        "analogy": "وضع المفتاح تحت ممسحة الباب.",
        "meaning": "تغيير شكل الملف أو مكانه دون حماية محتواه: تغيير الامتداد، أو صفة «مخفي»، أو اسم مضلّل. يكفي أن يعرف أحد الحيلة ليقرأ الملف كاملاً.",
        "inTool": [
          "ren salaries-2026.xlsx holiday.jpg",
          "attrib +h holiday.jpg",
          "attrib holiday.jpg ← A    H        ...\\holiday.jpg."
        ],
        "forDefender": "كثيرون يظنون أن الملف «محمي» لأنه مخفي؛ التقرير يصحّح ذلك.",
        "fromFrame": "موظف «أخفى» ملف الرواتب باسم صورة؛ المستشار يُظهره بأمرين.",
        "mistake": "تسمية التمويه «تشفيراً».",
        "quiz": {
          "q": "إن أعدنا تسمية holiday.jpg إلى .xlsx، هل يُفتح الملف بمحتواه؟",
          "type": "reveal",
          "answer": "نعم، لأنه لم يُحمَ."
        }
      },
      {
        "id": "encryption-key-aes-256",
        "ar": "التشفير والمفتاح",
        "en": "Encryption / Key / AES-256",
        "analogy": "صندوق بقفل لا يفتحه إلا من معه المفتاح، حتى لو حمله أي أحد.",
        "meaning": "تحويل المحتوى إلى بيانات غير مفهومة لا تُرجَع إلا بالمفتاح (هنا مشتق من كلمة المرور). AES-256 خوارزمية تشفير قياسية قوية؛ قوة الحماية الفعلية = قوة كلمة المرور.",
        "inTool": [
          "نافذة Add to Archive → Encryption → Encryption method: AES-256."
        ],
        "forDefender": "التقرير نفسه يحوي ثغرات العميل؛ يُسلَّم مشفّراً.",
        "fromFrame": "تقرير التقييم يُضغط إلى .7z بكلمة مرور تُرسل بقناة أخرى (مكالمة لا بريد).",
        "mistake": "إرسال كلمة المرور في البريد نفسه مع الملف.",
        "quiz": {
          "q": "ما فائدة التشفير إن أُرسلت كلمة المرور مع الملف؟",
          "type": "reveal",
          "answer": "لا فائدة."
        }
      },
      {
        "id": "delete-free-space-overwrite",
        "ar": "الحذف ليس محواً",
        "en": "Delete / Free space / Overwrite",
        "analogy": "حذف عنوان الفصل من فهرس الكتاب، والصفحات باقية حتى يُكتب فوقها.",
        "meaning": "الحذف العادي (حتى بعد تفريغ سلة المحذوفات) يحرّر المكان فقط؛ البيانات تبقى في المساحة الحرة ويمكن استرجاعها بأدوات الاسترجاع حتى يُكتب فوقها.",
        "inTool": [
          "cipher /w:C:\\Users\\Consultant\\Drafts ← Writing 0x00",
          "Writing 0xFF",
          "Writing Random Numbers."
        ],
        "forDefender": "مسودات التقرير على جهاز المستشار يجب ألا تبقى قابلة للاسترجاع بعد التسليم.",
        "fromFrame": "بعد تسليم التقرير المشفّر، تُحذف المسودات ثم تُمحى المساحة الحرة.",
        "mistake": "الظن أن cipher /w يمحو الملفات الموجودة؛ يمحو المساحة الحرة فقط، فيُحذف الملف أولاً.",
        "quiz": {
          "q": "ما ترتيب الخطوتين؟",
          "type": "reveal",
          "answer": "احذف الملف ثم cipher /w."
        }
      },
      {
        "id": "data-classification",
        "ar": "تصنيف البيانات وقيمتها",
        "en": "Data classification",
        "analogy": "في البيت أوراق عادية وأوراق في الخزنة.",
        "meaning": "ليست كل البيانات بالقيمة نفسها: عامة • داخلية • سرّية (رواتب، بيانات عملاء). الحماية تتناسب مع القيمة.",
        "inTool": [
          "ملف الرواتب «سرّي»، ونشرة المكتب «عامة»."
        ],
        "forDefender": "يحدد أين نبدأ وما الذي يُشفَّر ويُنسخ احتياطياً أولاً.",
        "fromFrame": "salaries-2026.xlsx سرّي ← تمويهه في الدرس 9 لم يحمه.",
        "mistake": "حماية كل شيء بالقدر نفسه، فيُهمل الأهم.",
        "quiz": {
          "q": "قائمة أسعار الخدمات المنشورة على موقع المكتب؛ ما تصنيفها؟",
          "type": "reveal",
          "answer": "عامة."
        },
        "extra": true
      },
      {
        "id": "cia-triad",
        "ar": "السرية والسلامة والتوافر",
        "en": "CIA Triad",
        "analogy": "رسالة لا يقرؤها غيرك (سرية)، لم يغيّرها أحد (سلامة)، وتصلك حين تحتاجها (توافر).",
        "meaning": "الأهداف الثلاثة لأمن المعلومات؛ كل ثغرة تهدد واحداً منها أو أكثر.",
        "inTool": [
          "التشفير ← السرية",
          "البصمة الرقمية ← السلامة",
          "النسخ الاحتياطي ← التوافر."
        ],
        "forDefender": "لغة مشتركة لشرح أثر كل ثغرة في التقرير.",
        "fromFrame": "برنامج فدية يهدد التوافر أساساً.",
        "mistake": "اختزال الأمن في السرية وحدها.",
        "quiz": {
          "q": "تعطّل خادم الملفات يوماً كاملاً يمس أي هدف؟",
          "type": "reveal",
          "answer": "التوافر."
        },
        "extra": true
      },
      {
        "id": "backup-3-2-1",
        "ar": "النسخ الاحتياطي",
        "en": "Backup — قاعدة 3-2-1",
        "analogy": "نسخة من مفتاح البيت عند قريب في مدينة أخرى.",
        "meaning": "3 نسخ، على وسيطين مختلفين، واحدة منها خارج المكان (أو غير متصلة).",
        "inTool": [
          "توصية في التقرير",
          "لا أداة في المحاكاة."
        ],
        "forDefender": "آخر خط دفاع ضد الفدية والأعطال.",
        "fromFrame": "المكتب ينسخ على قرص متصل دائماً بـ FILESRV ← غير كافٍ.",
        "mistake": "نسخة احتياطية متصلة دائماً تُشفَّر مع الأصل.",
        "quiz": {
          "q": "لماذا نسخة غير متصلة؟",
          "type": "reveal",
          "answer": "حتى لا يصل إليها برنامج الفدية."
        },
        "extra": true
      },
      {
        "id": "compression-encrypt-file-names",
        "ar": "الضغط ليس تشفيراً، وتشفير الأسماء",
        "en": "Compression / Encrypt file names",
        "analogy": "طيّ الملابس لتصغير الحقيبة لا يقفلها؛ وقفل الحقيبة لا يخفي البطاقة المعلّقة عليها.",
        "meaning": "الضغط يصغّر الحجم فقط. والتشفير في 7-Zip يحمي المحتوى، أما أسماء الملفات فتبقى ظاهرة إلا مع Encrypt file names (صيغة 7z فقط).",
        "inTool": [
          "☐ Encrypt file names",
          "عمود Encrypted (+) يظهر الأسماء بلا كلمة مرور إذا لم يُفعَّل."
        ],
        "forDefender": "اسم مثل ثغرات-مكتب-السنابل.docx يكشف معلومة بحد ذاته.",
        "fromFrame": "نسخة أولى بلا تشفير الأسماء تُظهر قائمة الملفات؛ الثانية لا تُفتح أصلاً قبل كلمة المرور.",
        "mistake": "اختيار صيغة zip بتشفير ZipCrypto الضعيف.",
        "quiz": {
          "q": "أي صيغة تسمح بتشفير أسماء الملفات؟",
          "type": "reveal",
          "answer": "7z."
        },
        "extra": true
      },
      {
        "id": "ssd-trim-bitlocker",
        "ar": "أقراص SSD والتشفير الكامل",
        "en": "SSD / TRIM / BitLocker",
        "analogy": "في SSD لا تعرف بالضبط على أي ورقة كُتب، فقد تبقى نسخة قديمة في مكان آخر.",
        "meaning": "أقراص SSD توزّع الكتابة داخلياً، فالكتابة فوق «المساحة الحرة» لا تضمن محو كل النسخ. الحل الأقوى: تشفير القرص كاملاً (BitLocker) من البداية، فتبقى أي بقايا مشفّرة.",
        "inTool": [
          "خارج المحاكاة (بطاقة «اعرف أكثر»: BitLocker)."
        ],
        "forDefender": "التوصية في التقرير: BitLocker لأجهزة المكتب المحمولة.",
        "fromFrame": "حاسوب المستشار بقرص SSD ← BitLocker مفعّل، وcipher /w طبقة إضافية.",
        "mistake": "الاعتماد على أدوات «التنظيف» القديمة (مثل Windows Washer في الكتاب) كضمان للمحو.",
        "quiz": {
          "q": "لماذا التشفير الكامل أفضل من المحو على SSD؟",
          "type": "reveal",
          "answer": "لأن البقايا تبقى مشفّرة غير مقروءة."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "cmd",
    "state": "before",
    "cwd": "C:\\Users\\accountant\\Documents",
    "scenario": "أنت على ACC-PC1 في مجلد C:\\Users\\accountant\\Documents. قيل لك إن ملف الرواتب «محمي». تحقق، ثم احمه فعلاً.",
    "launchers": [
      {
        "tool": "cmd",
        "label": "Command Prompt",
        "auto": true
      },
      {
        "tool": "sevenzip",
        "label": "7-Zip"
      }
    ],
    "freeNote": "جرّب دون تلميحات: dir بخياراته، وattrib، وأرشيفاً دون تشفير الأسماء ثم معه، وكلمة مرور خاطئة عند الفتح.",
    "steps": [
      {
        "id": "s1",
        "title": "اعرض الملفات",
        "instruction": "اكتب الأمر واضغط Enter. لاحظ: لا أثر لملف الرواتب.",
        "why": "الملفات المخفية لا تظهر في dir العادي.",
        "expect": {
          "type": "command",
          "tool": "cmd",
          "match": "^dir$"
        },
        "solution": "dir",
        "target": "[data-win=\"cmd\"] .term-input",
        "hints": [
          "أمر عرض الملفات في Windows.",
          "ثلاثة حروف.",
          "dir"
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "dir"
        },
        "result": "لا أثر لملف الرواتب: يظهر clients-2026.docx فقط."
      },
      {
        "id": "s2",
        "title": "اعرض المخفي",
        "instruction": "اكتب الأمر ليظهر الملف المخفي.",
        "why": "/a:h تعني: الملفات التي لها صفة Hidden.",
        "expect": {
          "type": "command",
          "tool": "cmd",
          "match": "^dir /a:?h$"
        },
        "solution": "dir /a:h",
        "target": "[data-win=\"cmd\"] .term-input",
        "hints": [
          "dir مع خيار الصفات.",
          "/a ثم حرف المخفي.",
          "dir /a:h"
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "dir /a:h"
        },
        "result": "ظهر holiday.jpg بحجم 48,640 بايت: هو ملف الرواتب نفسه، مخفي وباسم صورة."
      },
      {
        "id": "s3",
        "title": "أزل صفة المخفي",
        "instruction": "اكتب الأمر.",
        "why": "attrib يغيّر صفات الملف؛ -h يزيل صفة المخفي.",
        "expect": {
          "type": "command",
          "tool": "cmd",
          "match": "^attrib -h holiday\\.jpg$"
        },
        "solution": "attrib -h holiday.jpg",
        "target": "[data-win=\"cmd\"] .term-input",
        "hints": [
          "الأمر attrib.",
          "ناقص h ثم اسم الملف.",
          "attrib -h holiday.jpg"
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "attrib -h holiday.jpg"
        },
        "result": "أُزيلت صفة المخفي: سيظهر الملف في dir العادي."
      },
      {
        "id": "s4",
        "title": "أعد اسمه الحقيقي",
        "instruction": "اكتب الأمر.",
        "why": "الملف جدول Excel باسم صورة: التمويه لا يحمي المحتوى.",
        "expect": {
          "type": "command",
          "tool": "cmd",
          "match": "^ren holiday\\.jpg salaries-2026\\.xlsx$"
        },
        "solution": "ren holiday.jpg salaries-2026.xlsx",
        "target": "[data-win=\"cmd\"] .term-input",
        "hints": [
          "الأمر ren.",
          "الاسم القديم ثم الجديد.",
          "ren holiday.jpg salaries-2026.xlsx"
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "ren holiday.jpg salaries-2026.xlsx"
        },
        "result": "عاد الاسم الحقيقي salaries-2026.xlsx. التمويه لم يحمِ شيئاً."
      },
      {
        "id": "s5",
        "title": "شفّره بـ 7-Zip",
        "instruction": "اضغط 7-Zip ← اختر salaries-2026.xlsx ← Add ← Archive format: 7z ← اكتب كلمة مرور (14 حرفاً أو أكثر) مرتين ← ☑ Encrypt file names ← OK.",
        "typeText": "7z  •  AES-256  •  ☑ Encrypt file names",
        "typeLabel": "اختر",
        "why": "AES-256 يحمي المحتوى؛ وتشفير الأسماء يخفي حتى اسم الملف.",
        "expect": {
          "type": "event",
          "name": "sz:archive",
          "where": {
            "format": "7z",
            "method": "AES-256",
            "encryptNames": true,
            "ok": true
          }
        },
        "onMismatch": "المطلوب: صيغة 7z، وكلمة مرور، وEncrypt file names مفعّل.",
        "target": "[data-launch=\"sevenzip\"]",
        "hints": [
          "زر 7-Zip في الشريط.",
          "اختر الملف ثم زر Add.",
          "7z • كلمة مرور ×2 • ☑ Encrypt file names • OK"
        ],
        "demo": [
          {
            "kind": "launch",
            "tool": "sevenzip"
          },
          {
            "kind": "ui",
            "tool": "sevenzip",
            "action": "demoArchive"
          }
        ],
        "result": "صار salaries-2026.7z مشفّراً بـ AES-256، ولا يُفتح ولا يُعرف محتواه بلا كلمة المرور."
      },
      {
        "id": "s6",
        "title": "احذف الأصل",
        "instruction": "ارجع إلى Command Prompt واكتب الأمر.",
        "why": "النسخة غير المشفّرة يجب ألا تبقى.",
        "expect": {
          "type": "command",
          "tool": "cmd",
          "match": "^del salaries-2026\\.xlsx$"
        },
        "solution": "del salaries-2026.xlsx",
        "target": "[data-win=\"cmd\"] .term-input",
        "hints": [
          "أمر الحذف في CMD.",
          "del ثم اسم الملف.",
          "del salaries-2026.xlsx"
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "del salaries-2026.xlsx"
        },
        "result": "حُذف الأصل غير المشفّر، لكن بياناته ما زالت في المساحة الحرة."
      },
      {
        "id": "s7",
        "title": "امحُ المساحة الحرة",
        "instruction": "اكتب الأمر وانتظر المراحل الثلاث.",
        "why": "الحذف يترك البيانات في المساحة الحرة؛ cipher /w يكتب فوقها.",
        "expect": {
          "type": "command",
          "tool": "cmd",
          "match": "^cipher /w:c:\\\\users\\\\accountant\\\\documents\\\\?$"
        },
        "solution": "cipher /w:C:\\Users\\accountant\\Documents",
        "target": "[data-win=\"cmd\"] .term-input",
        "hints": [
          "الأمر cipher مع الخيار w.",
          "بعد النقطتين مسار المجلد.",
          "cipher /w:C:\\Users\\accountant\\Documents"
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "cipher /w:C:\\Users\\accountant\\Documents"
        },
        "result": "cipher كتب فوق المساحة الحرة ثلاث مرات: لم يعد الملف المحذوف قابلاً للاسترجاع."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "d1",
        "tool": "cmd",
        "cmd": "dir",
        "title": "dir",
        "heading": "C:\\Users\\accountant\\Documents>dir"
      },
      {
        "id": "d2",
        "tool": "cmd",
        "cmd": "dir /a:h",
        "title": "dir /a:h",
        "heading": "C:\\Users\\accountant\\Documents>dir /a:h"
      },
      {
        "id": "at",
        "tool": "cmd",
        "cmd": "attrib holiday.jpg",
        "title": "attrib",
        "heading": "C:\\Users\\accountant\\Documents>attrib holiday.jpg"
      },
      {
        "id": "cw",
        "tool": "cmd",
        "cmd": "cipher /w:C:\\Users\\accountant\\Documents",
        "title": "cipher /w",
        "heading": "C:\\Users\\accountant\\Documents>cipher /w:C:\\Users\\accountant\\Documents"
      }
    ],
    "highlights": [
      {
        "src": "d1",
        "line": "File(s)",
        "match": "1 File(s)",
        "label": "ملف واحد",
        "concept": "hiding-obfuscation",
        "meaning": "dir العادي يرى clients-2026.docx فقط: ملف الرواتب مخفي.",
        "core": true
      },
      {
        "src": "d2",
        "line": "holiday.jpg",
        "match": "holiday.jpg",
        "label": "holiday.jpg",
        "danger": true,
        "concept": "hiding-obfuscation",
        "meaning": "اسم صورة لملف حجمه 48,640 بايت: هو ملف الرواتب نفسه.",
        "core": true
      },
      {
        "src": "at",
        "line": "holiday.jpg",
        "match": "A    H",
        "label": "صفة H",
        "concept": "hiding-obfuscation",
        "meaning": "H = Hidden. إزالة الصفة بأمر واحد: الإخفاء ليس حماية.",
        "core": true
      },
      {
        "src": "cw",
        "line": "Random",
        "match": "Writing Random Numbers",
        "label": "المرحلة الثالثة",
        "concept": "delete-free-space-overwrite",
        "meaning": "ثلاث كتابات فوق المساحة الحرة: أصفار، ثم FF، ثم أرقام عشوائية.",
        "core": true
      }
    ],
    "table": [
      {
        "see": "ملف لا يظهر في dir ويظهر في dir /a:h",
        "means": "صفة مخفي فقط؛ المحتوى مكشوف."
      },
      {
        "see": "امتداد لا يناسب الحجم أو المحتوى",
        "means": "تمويه بإعادة التسمية."
      },
      {
        "see": "7-Zip: Cannot open encrypted archive. Wrong password?",
        "means": "الأسماء مشفّرة؛ لا شيء يُعرض قبل كلمة المرور."
      },
      {
        "see": "عمود Encrypted = +",
        "means": "المحتوى مشفّر، والأسماء ظاهرة (بلا Encrypt file names)."
      },
      {
        "see": "cipher /w",
        "means": "يمحو المساحة الحرة؛ احذف الملف أولاً."
      }
    ],
    "questions": [
      {
        "q": "لماذا لم يظهر الملف في dir؟",
        "type": "choice",
        "options": [
          "لأن له صفة H (مخفي)",
          "لأنه محذوف",
          "لأنه مشفّر"
        ],
        "answer": "لأن له صفة H (مخفي)",
        "why": "dir /a:h أظهره."
      },
      {
        "q": "هل كان الملف محمياً قبل التشفير؟",
        "type": "choice",
        "options": [
          "لا؛ أمران كشفاه كاملاً",
          "نعم، لأنه مخفي",
          "نعم، لأن امتداده .jpg"
        ],
        "answer": "لا؛ أمران كشفاه كاملاً",
        "why": "التمويه لا يحمي المحتوى."
      },
      {
        "q": "ما الفرق الذي يصنعه Encrypt file names؟",
        "type": "choice",
        "options": [
          "يخفي أسماء الملفات داخل الأرشيف قبل كلمة المرور",
          "يضغط الملف أكثر",
          "يغيّر الخوارزمية إلى ZipCrypto"
        ],
        "answer": "يخفي أسماء الملفات داخل الأرشيف قبل كلمة المرور",
        "why": "متاح في صيغة 7z فقط."
      },
      {
        "q": "هل يحذف cipher /w الملفات الموجودة؟",
        "type": "choice",
        "options": [
          "لا؛ يمحو المساحة الحرة فقط",
          "نعم، كل الملفات",
          "نعم، الملفات المخفية فقط"
        ],
        "answer": "لا؛ يمحو المساحة الحرة فقط",
        "why": "لذلك حذفنا الأصل أولاً.",
        "extra": true
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "في الكتاب ← اليوم: Windows Washer وأدوات «التنظيف» ← cipher /w المدمج في Windows؛ وعلى أقراص SSD الأفضل تشفير القرص كاملاً بـ BitLocker.",
      "7-Zip مجاني من 7-zip.org؛ صيغة 7z مع AES-256 وتشفير الأسماء أقوى من ZipCrypto في zip."
    ],
    "officialSite": "https://www.7-zip.org/"
  },
  "guide": [
    "تكشف ملف الرواتب «المخفي» بأمرين في CMD.",
    "تشفّره بـ 7-Zip بكلمة مرور وتشفير الأسماء.",
    "تحذف الأصل وتمحو المساحة الحرة بأمر cipher."
  ]
};
