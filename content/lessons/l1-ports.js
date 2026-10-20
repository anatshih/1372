/* Lesson l1-ports — ports and connections on ACC-PC1 (CMD netstat/tasklist + Task Manager).
   Concepts: docs/concepts.md §1.1–1.6. Values: docs/outputs-spec.md §ج. Shapes: docs/ui-reference.md §1–2. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l1-ports"] = {
  "id": "l1-ports",
  "seq": 1,
  "axis": 1,
  "axisTitle": "المحور ١: قيّم",
  "units": [
    1,
    3,
    14
  ],
  "tools": [
    "Command Prompt",
    "Task Manager"
  ],
  "minutes": 15,
  "title": "المنافذ والاتصالات: netstat ومدير المهام",
  "caseBranch": {
    "question": "ما الأبواب المفتوحة على ACC-PC1، ومن يقف خلف كل منها؟",
    "known": "مكتب السنابل طلب منك فحص أجهزته. نبدأ بالجهاز الرئيسي ACC-PC1.",
    "now": "نرى من داخل ACC-PC1 أي الأبواب مفتوحة وأي برنامج يقف خلف كل منها.",
    "finding": "ACC-PC1 يستمع لكل الشبكة على 7 منافذ؛ أغربها 5900 لبرنامج دعم قديم منسي rhelper.exe (PID 4312) في C:\\Users\\Public\\rhelper\\، بلا وصف ولا ناشر، ويبدأ تلقائياً مع الجهاز."
  },
  "objectives": [
    "قراءة ناتج netstat -ano: البروتوكول والعنوان المحلي والبعيد والحالة ورقم العملية.",
    "التمييز بين 0.0.0.0 (كل الواجهات المحلية) و127.0.0.1 (الجهاز نفسه).",
    "الانتقال من منفذ مفتوح إلى البرنامج الذي فتحه ومكان ملفه، بـ tasklist ومدير المهام."
  ],
  "explain": {
    "intro": "التشبيه الجامع: الجهاز مبنى مكاتب، وعنوان IP عنوان المبنى، والمنافذ أبواب مرقّمة، وكل برنامج يعمل موظف يقف عند باب.",
    "figure": "doors",
    "whatNext": "ستفتح Command Prompt على ACC-PC1 وتعرض المنافذ بـ netstat، ثم تتبع الباب 5900 إلى برنامجه بـ tasklist ومدير المهام، وترى أنه يبدأ مع الجهاز.",
    "cards": [
      {
        "id": "port",
        "ar": "المنفذ والبروتوكول",
        "en": "Port / TCP / UDP",
        "analogy": "باب مرقّم في المبنى؛ لكل خدمة بابها.",
        "meaning": "رقم من 0 إلى 65535 يحدد أي برنامج في الجهاز يستقبل الاتصال. TCP اتصال مؤكد بخطوات (مثل مكالمة)، وUDP إرسال بلا تأكيد (مثل رسالة نصية).",
        "inTool": [
          "  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING       1180",
          "                ↑ الرقم بعد النقطتين هو المنفذ"
        ],
        "forDefender": "كل منفذ مفتوح باب يمكن الوصول منه إلى الجهاز؛ عدد الأبواب المفتوحة = «سطح الهجوم».",
        "fromFrame": "ACC-PC1 يفتح 135 و139 و445 و3389 و5900.",
        "mistake": "الظن أن المنفذ شيء مادي في الجهاز؛ هو رقم برمجي.",
        "quiz": {
          "q": "كم منفذاً ممكناً في TCP؟ (اكتب رقماً)",
          "type": "value",
          "answer": "65536",
          "why": "من 0 إلى 65535."
        }
      },
      {
        "id": "states",
        "ar": "حالات الاتصال",
        "en": "LISTENING / ESTABLISHED / TIME_WAIT",
        "analogy": "موظف ينتظر عند الباب (LISTENING)، موظف يتحدث مع زائر (ESTABLISHED)، زائر خرج للتو والباب يُغلق (TIME_WAIT).",
        "meaning": "LISTENING برنامج ينتظر اتصالات واردة • ESTABLISHED اتصال قائم الآن بين طرفين • TIME_WAIT اتصال انتهى للتو.",
        "inTool": [
          "عمود State في netstat -ano"
        ],
        "forDefender": "LISTENING = باب مفتوح ينتظر أي أحد؛ هذه المنافذ هي ما يراه الماسح من الخارج.",
        "fromFrame": "0.0.0.0:5900 ... LISTENING ... 4312",
        "mistake": "الخوف من كل ESTABLISHED؛ أغلبها اتصالات طبيعية لمتصفح أو تحديث.",
        "quiz": {
          "q": "أي حالة تعني أن البرنامج ينتظر اتصالاً جديداً؟",
          "type": "choice",
          "options": [
            "LISTENING",
            "ESTABLISHED",
            "TIME_WAIT"
          ],
          "answer": "LISTENING",
          "why": "الباب مفتوح وينتظر."
        }
      },
      {
        "id": "local-foreign",
        "ar": "العنوان المحلي والبعيد",
        "en": "Local / Foreign Address",
        "analogy": "من أي باب في مبنانا (محلي)، وإلى أي مبنى آخر (بعيد).",
        "meaning": "Local Address عنوان جهازك ومنفذه؛ Foreign Address الطرف الآخر. 0.0.0.0 محلياً = يستمع على كل الواجهات المحلية؛ الوصول من الشبكة يتوقف أيضاً على الجدار الناري والمسار. 127.0.0.1 = من الجهاز نفسه فقط.",
        "inTool": [
          "  TCP    0.0.0.0:5900   …  LISTENING",
          "  TCP    127.0.0.1:5939 …  LISTENING"
        ],
        "forDefender": "منفذ على 127.0.0.1 لا يصل إليه أحد من الشبكة؛ منفذ على 0.0.0.0 يستمع على الواجهات المحلية، لكن الوصول إليه من الشبكة يحتاج التحقق بالمسح وقواعد الجدار الناري.",
        "fromFrame": "rhelper.exe يستمع على 0.0.0.0:5900 ← يستمع محلياً؛ نتحقق من وصول الشبكة في درس المسح.",
        "mistake": "قراءة 0.0.0.0 على أنه «لا عنوان» أو «غير متصل».",
        "quiz": {
          "q": "أي عنوان يدل على الاستماع على جميع الواجهات المحلية؟",
          "type": "choice",
          "options": [
            "0.0.0.0:8080",
            "127.0.0.1:8080",
            "متساويان"
          ],
          "answer": "0.0.0.0:8080",
          "why": "0.0.0.0 يدل على الاستماع على الواجهات المحلية. الوصول الشبكي يحتاج أيضاً إلى تحقق من الجدار الناري والمسار."
        }
      },
      {
        "id": "pid",
        "ar": "العملية ورقمها",
        "en": "Process / PID",
        "analogy": "رقم الموظف في كشف الدوام.",
        "meaning": "كل برنامج يعمل = عملية لها رقم مؤقت PID. الرقم يتغير عند إعادة التشغيل؛ الاسم والمسار لا.",
        "inTool": [
          "آخر عمود في netstat -ano",
          "tasklist /fi \"PID eq 4312\"",
          "Task Manager › Details › PID"
        ],
        "forDefender": "PID هو الجسر من «منفذ مفتوح» إلى «أي برنامج فتحه»، ثم إلى مكان ملفه (Open file location).",
        "fromFrame": "PID 4312 ← rhelper.exe ← C:\\Users\\Public\\rhelper\\",
        "mistake": "تسجيل PID في التقرير كأنه ثابت؛ يُسجَّل اسم البرنامج ومساره.",
        "quiz": {
          "q": "أعدت تشغيل الجهاز؛ هل يبقى PID لـ rhelper.exe نفسه؟",
          "type": "choice",
          "options": [
            "غالباً لا",
            "نعم دائماً",
            "لا يوجد PID بعد التشغيل"
          ],
          "answer": "غالباً لا",
          "why": "الرقم يُعطى عند بدء العملية؛ الثابت هو الاسم والمسار."
        }
      },
      {
        "id": "well-known",
        "ar": "المنافذ المعروفة",
        "en": "Well-known Ports",
        "analogy": "في كل المباني باب الطوارئ بلون واحد معروف.",
        "meaning": "أرقام اتُّفق عليها لخدمات شائعة: 80 HTTP • 443 HTTPS • 22 SSH • 23 Telnet • 445 SMB (مشاركة الملفات) • 3389 RDP (سطح المكتب البعيد) • 5900 VNC (تحكم عن بعد).",
        "inTool": [
          "netstat يعرض الرقم فقط",
          "Zenmap: 3389/tcp open  ms-wbt-server"
        ],
        "forDefender": "رقم المنفذ أول دليل على نوع الخدمة؛ منفذ تحكم عن بعد غير متوقع يستحق السؤال فوراً.",
        "fromFrame": "لا أحد في المكتب يتذكر لماذا 5900 مفتوح.",
        "mistake": "الوثوق بأن الخدمة على منفذها المعتاد دائماً؛ يمكن تشغيل أي خدمة على أي رقم.",
        "quiz": {
          "q": "أي منفذ يخص سطح المكتب البعيد في Windows؟ (اكتب رقماً)",
          "type": "value",
          "answer": "3389",
          "why": "RDP يستمع على 3389."
        },
        "extra": true
      },
      {
        "id": "publisher",
        "ar": "البرنامج الموثوق وغير الموثوق في مدير المهام",
        "en": "Publisher / Description",
        "analogy": "موظف بلا بطاقة شركة يقف عند باب حساس.",
        "meaning": "البرامج السليمة عادةً لها وصف وناشر معروف (Publisher)؛ غيابهما أو مسار غريب (Public، Temp) علامة تستحق الفحص، لا دليل إدانة.",
        "inTool": [
          "Details › Description: (فارغ)",
          "Startup apps › Publisher: (فارغ)"
        ],
        "forDefender": "يساعد على ترتيب الشكوك قبل الفحص بمضاد الفيروسات.",
        "fromFrame": "rhelper.exe: بلا وصف ولا ناشر، في C:\\Users\\Public\\.",
        "mistake": "إنهاء العملية (End task) وعدّ المشكلة محلولة؛ ستعود مع إعادة التشغيل.",
        "quiz": {
          "q": "لماذا لا يكفي End task على rhelper.exe؟",
          "type": "choice",
          "options": [
            "لأنه يبدأ تلقائياً مرة أخرى",
            "لأن End task يحذف الملف",
            "لأن Task Manager لا يستطيع إنهاء العمليات"
          ],
          "answer": "لأنه يبدأ تلقائياً مرة أخرى",
          "why": "له مدخل تشغيل تلقائي؛ نزيله في الدرس 6."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "cmd",
    "state": "before",
    "scenario": "أنت على جهاز ACC-PC1. اعرض المنافذ المفتوحة، ثم تتبّع المنفذ الغريب 5900 حتى تعرف البرنامج الذي فتحه، ومكان ملفه، وهل يبدأ مع الجهاز.",
    "launchers": [
      {
        "tool": "cmd",
        "label": "Command Prompt",
        "auto": true
      },
      {
        "tool": "taskmgr",
        "label": "Task Manager"
      }
    ],
    "freeNote": "جرّب دون تلميحات: netstat -ano وصيغه مع findstr، وtasklist، ومدير المهام.",
    "steps": [
      {
        "id": "s1",
        "title": "اعرض كل المنافذ",
        "instruction": "في نافذة Command Prompt اكتب الأمر واضغط Enter.",
        "why": "-a كل الاتصالات والمنافذ المستمعة، -n أرقام بلا أسماء، -o رقم العملية.",
        "expect": {
          "type": "command",
          "tool": "cmd",
          "match": "^netstat -ano$"
        },
        "solution": "netstat -ano",
        "target": "[data-win=\"cmd\"] .term-input",
        "hints": [
          "الأمر netstat مع ثلاثة حروف.",
          "الحروف: a وn وo بعد شرطة واحدة.",
          "netstat -ano"
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "netstat -ano"
        },
        "result": "ظهر جدول المنافذ. ابحث عن سطر 0.0.0.0:5900: منفذ تحكم عن بعد يستمع على الواجهات المحلية، ورقم عمليته 4312."
      },
      {
        "id": "s2",
        "title": "المنافذ المستمعة فقط",
        "instruction": "اكتب الأمر بالأحرف الكبيرة كما هو، واضغط Enter.",
        "why": "الأنبوب | يرسل الناتج إلى findstr ليُبقي الأسطر التي فيها الكلمة فقط. findstr يميّز الأحرف الكبيرة من الصغيرة.",
        "expect": {
          "type": "command",
          "tool": "cmd",
          "match": "^netstat -ano \\| findstr LISTENING$",
          "flags": ""
        },
        "solution": "netstat -ano | findstr LISTENING",
        "target": "[data-win=\"cmd\"] .term-input",
        "onMismatch": "المطلوب: netstat -ano | findstr LISTENING بالأحرف الكبيرة. لو كتبتها صغيرة لن يجد findstr شيئاً، إلا مع الخيار /i.",
        "hints": [
          "الأمر السابق ثم | ثم أمر التصفية.",
          "أمر التصفية في Windows اسمه findstr، والكلمة كما في عمود State.",
          "netstat -ano | findstr LISTENING"
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "netstat -ano | findstr LISTENING"
        },
        "result": "بقيت الأسطر التي حالتها LISTENING فقط: هذه هي الأبواب المفتوحة التي تنتظر أي أحد."
      },
      {
        "id": "s5",
        "title": "من هو PID 4312؟",
        "instruction": "اكتب الأمر لتعرف اسم البرنامج صاحب الرقم 4312.",
        "why": "يحوّل رقم العملية من netstat إلى اسم البرنامج.",
        "expect": {
          "type": "command",
          "match": "^tasklist /fi \"pid eq 4312\"$"
        },
        "solution": "tasklist /fi \"PID eq 4312\"",
        "target": "[data-win=\"cmd\"] .term-input",
        "hints": [
          "الأمر tasklist مع مرشّح /fi.",
          "المرشّح بين علامتي تنصيص: \"PID eq الرقم\".",
          "tasklist /fi \"PID eq 4312\""
        ],
        "demo": {
          "kind": "command",
          "tool": "cmd",
          "text": "tasklist /fi \"PID eq 4312\""
        },
        "result": "الرقم 4312 يخص البرنامج rhelper.exe. صار لدينا اسم، لا رقماً فقط."
      },
      {
        "id": "s6",
        "title": "افتح مدير المهام واختر العملية",
        "instruction": "اضغط زر «Task Manager» فوق النافذة، ثم اكتب 4312 في مربع البحث، ثم اضغط صف rhelper.exe.",
        "why": "Details يعرض الوصف والمستخدم والمعمارية لكل عملية.",
        "expect": {
          "type": "event",
          "name": "taskmgr:select",
          "where": {
            "name": "rhelper.exe"
          }
        },
        "target": "[data-launch=\"taskmgr\"]",
        "hints": [
          "الزر الثالث في شريط التطبيقات.",
          "مربع البحث أعلى النافذة يقبل الاسم أو PID.",
          "افتح Task Manager، اكتب 4312 في البحث، واضغط صف rhelper.exe."
        ],
        "demo": [
          {
            "kind": "launch",
            "tool": "taskmgr"
          },
          {
            "kind": "ui",
            "tool": "taskmgr",
            "action": "setSearch",
            "arg": "4312"
          },
          {
            "kind": "ui",
            "tool": "taskmgr",
            "action": "select",
            "arg": "rhelper.exe"
          }
        ],
        "result": "في مدير المهام ظهر rhelper.exe: بلا وصف (Description فارغ)، ويعمل بحساب SYSTEM."
      },
      {
        "id": "s7",
        "title": "أين ملفه؟",
        "instruction": "انقر بالزر الأيمن على rhelper.exe واختر Open file location.",
        "why": "المسار جزء من الدليل: البرامج السليمة نادراً ما تعمل من C:\\Users\\Public.",
        "expect": {
          "type": "event",
          "name": "taskmgr:action",
          "where": {
            "action": "Open file location",
            "name": "rhelper.exe"
          }
        },
        "target": "[data-win=\"taskmgr\"] .gr-wrap",
        "hints": [
          "القائمة تظهر بالنقر الأيمن على الصف (أو Shift+F10).",
          "الخيار في النصف الثاني من القائمة.",
          "زر أيمن على rhelper.exe ← Open file location."
        ],
        "demo": {
          "kind": "ui",
          "tool": "taskmgr",
          "action": "action",
          "arg": [
            "Open file location",
            "rhelper.exe"
          ]
        },
        "result": "ظهر مكان الملف: C:\\Users\\Public\\rhelper\\، ومعه ملف ثانٍ rhupd.exe. مكان غريب لبرنامج حقيقي."
      },
      {
        "id": "s8",
        "title": "هل يبدأ مع الجهاز؟",
        "instruction": "افتح صفحة Startup apps من الشريط الجانبي.",
        "why": "برنامج يبدأ وحده سيعود بعد كل إعادة تشغيل حتى لو أنهيناه.",
        "expect": {
          "type": "event",
          "name": "taskmgr:page",
          "where": {
            "page": "Startup apps"
          }
        },
        "target": "[data-win=\"taskmgr\"] [data-page=\"Startup apps\"]",
        "hints": [
          "الصفحات في الشريط الجانبي لمدير المهام.",
          "اسمها Startup apps.",
          "اضغط Startup apps."
        ],
        "demo": {
          "kind": "ui",
          "tool": "taskmgr",
          "action": "show",
          "arg": "Startup apps"
        },
        "result": "RemoteHelper في Startup apps بحالة Enabled: يعود مع كل تشغيل. سنزيله في الدرس 6."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "ns",
        "tool": "cmd",
        "cmd": "netstat -ano",
        "state": "before",
        "title": "netstat -ano (قبل)"
      },
      {
        "id": "ns2",
        "tool": "cmd",
        "cmd": "netstat -ano",
        "state": "after",
        "title": "netstat -ano (بعد)"
      },
      {
        "id": "tl",
        "tool": "cmd",
        "cmd": "tasklist /fi \"PID eq 4312\"",
        "state": "before",
        "title": "tasklist"
      },
      {
        "id": "det",
        "kind": "table",
        "tool": "taskmgr",
        "table": "details",
        "state": "before",
        "title": "Task Manager › Details",
        "heading": "Task Manager › Details   [قبل المعالجة]"
      },
      {
        "id": "su",
        "kind": "table",
        "tool": "taskmgr",
        "table": "startup",
        "state": "before",
        "title": "Task Manager › Startup apps",
        "heading": "Task Manager › Startup apps   [قبل المعالجة]"
      }
    ],
    "highlights": [
      {
        "src": "ns",
        "line": "0.0.0.0:5900",
        "match": "0.0.0.0:5900",
        "label": "0.0.0.0:5900",
        "danger": true,
        "concept": "local-foreign",
        "meaning": "المنفذ 5900 (VNC، تحكم عن بعد) يستمع على كل الواجهات المحلية. هذا لا يثبت وحده وصول الشبكة إليه؛ نتحقق بالمسح والجدار الناري.",
        "core": true
      },
      {
        "src": "ns",
        "line": "0.0.0.0:5900",
        "match": "4312",
        "label": "PID 4312",
        "concept": "pid",
        "meaning": "رقم العملية التي فتحت 5900. نتتبعه بـ tasklist ومدير المهام: rhelper.exe.",
        "core": true
      },
      {
        "src": "ns",
        "line": "0.0.0.0:3389",
        "match": "0.0.0.0:3389",
        "label": "0.0.0.0:3389",
        "concept": "well-known",
        "meaning": "سطح المكتب البعيد (TermService، PID 1180) يستمع على الواجهات المحلية. سنقيّد الوصول الشبكي لجهاز المدير في الدرس 7."
      },
      {
        "src": "ns",
        "line": "127.0.0.1:5939",
        "match": "127.0.0.1:5939",
        "label": "127.0.0.1:5939",
        "concept": "local-foreign",
        "meaning": "برنامج المحاسبة يستمع على الجهاز نفسه فقط: لا يصل إليه أحد من الشبكة. هكذا تبدو الخدمة المحلية الآمنة.",
        "core": true
      },
      {
        "src": "ns",
        "line": "192.168.50.10:445",
        "match": "192.168.50.10:445",
        "label": "اتصال بـ FILESRV",
        "concept": "states",
        "meaning": "ESTABLISHED إلى خادم الملفات على 445 (مجلد مشترك): اتصال طبيعي في المكتب."
      },
      {
        "src": "ns",
        "line": "TIME_WAIT",
        "match": "TIME_WAIT",
        "label": "TIME_WAIT",
        "concept": "states",
        "meaning": "اتصال انتهى للتو (PID 0)، ولا يدل على مشكلة."
      },
      {
        "src": "ns2",
        "line": "0.0.0.0:3389",
        "match": "0.0.0.0:3389",
        "label": "3389 بعد المعالجة",
        "concept": "local-foreign",
        "meaning": "بعد المعالجة اختفى سطر 5900، وبقي 3389 LISTENING: الخدمة ما زالت تعمل داخل الجهاز، والجدار الناري يقصرها على جهاز المدير (الفرق بين الداخل والخارج، الدرس 2)."
      },
      {
        "src": "tl",
        "line": "rhelper.exe",
        "match": "rhelper.exe",
        "label": "rhelper.exe",
        "danger": true,
        "concept": "pid",
        "meaning": "اسم البرنامج صاحب PID 4312: برنامج دعم عن بُعد قديم لا يعرف أحد في المكتب لماذا يعمل."
      },
      {
        "src": "det",
        "row": "rhelper.exe|4312",
        "col": "Description",
        "label": "وصف rhelper.exe",
        "danger": true,
        "concept": "publisher",
        "meaning": "بلا وصف، ويعمل بحساب SYSTEM، ومعماريته x86 بخلاف بقية البرامج: علامات تستحق الفحص بمضاد الفيروسات (الدرس 5)."
      },
      {
        "src": "det",
        "row": "AccountingSync.exe|3876",
        "col": "Description",
        "label": "وصف AccountingSync.exe",
        "concept": "publisher",
        "meaning": "برنامج المحاسبة له وصف واضح ويعمل بحساب المستخدم accountant: برنامج يعرفه المكتب ويحتاجه."
      },
      {
        "src": "su",
        "row": "RemoteHelper",
        "col": "Publisher",
        "label": "ناشر RemoteHelper",
        "danger": true,
        "concept": "publisher",
        "meaning": "RemoteHelper يبدأ مع الجهاز (Enabled) وبلا ناشر: لهذا لا يكفي End task، وسنزيله من جذوره بـ Autoruns في الدرس 6.",
        "core": true
      }
    ],
    "table": [
      {
        "see": "0.0.0.0:رقم … LISTENING",
        "means": "خدمة تستمع على الواجهات المحلية؛ تحقق من قواعد الجدار الناري والوصول من الشبكة، واسأل: هل يحتاجها أحد؟"
      },
      {
        "see": "127.0.0.1:رقم … LISTENING",
        "means": "خدمة للجهاز نفسه فقط؛ لا يصل إليها أحد من الشبكة."
      },
      {
        "see": "ESTABLISHED إلى عنوان معروف",
        "means": "اتصال قائم طبيعي غالباً (مجلد مشترك، متصفح)."
      },
      {
        "see": "INFO: No tasks are running which match…",
        "means": "لا عملية بهذا الرقم الآن (ربما أُنهيت أو أُعيد التشغيل)."
      },
      {
        "see": "عملية بلا وصف ولا ناشر في مسار غريب",
        "means": "علامة تستحق الفحص، لا دليل إدانة بحد ذاتها."
      }
    ],
    "ioc": [
      "0.0.0.0:5900 LISTENING ← rhelper.exe (PID 4312) في C:\\Users\\Public\\rhelper\\، بلا وصف ولا ناشر، ويبدأ مع الجهاز (RemoteHelper)."
    ],
    "questions": [
      {
        "q": "ما اسم البرنامج الذي فتح المنفذ 5900؟",
        "type": "choice",
        "answer": "rhelper.exe",
        "why": "PID 4312 في netstat ← rhelper.exe في tasklist ومدير المهام.",
        "options": [
          "rhelper.exe",
          "AccountingSync.exe",
          "svchost.exe"
        ]
      },
      {
        "q": "أين ملف هذا البرنامج؟",
        "type": "choice",
        "options": [
          "C:\\Users\\Public\\rhelper\\",
          "C:\\Program Files\\ExampleAccounting\\",
          "C:\\WINDOWS\\system32\\"
        ],
        "answer": "C:\\Users\\Public\\rhelper\\",
        "why": "من Open file location؛ وفي المجلد أيضاً rhupd.exe."
      },
      {
        "q": "لماذا لا يكفي End task على rhelper.exe؟",
        "type": "choice",
        "options": [
          "لأن له مدخل تشغيل تلقائي (RemoteHelper)",
          "لأن End task يحذف الملف",
          "لأن العملية محمية من Windows"
        ],
        "answer": "لأن له مدخل تشغيل تلقائي (RemoteHelper)",
        "why": "يظهر في Startup apps بحالة Enabled؛ سيعود مع إعادة التشغيل."
      },
      {
        "q": "كم منفذ TCP في حالة LISTENING على كل الواجهات (0.0.0.0)؟",
        "type": "choice",
        "answer": "7",
        "why": "135 و445 و3389 و5900 و49664 و49665 و49666.",
        "options": [
          "7",
          "5",
          "9"
        ],
        "extra": true
      },
      {
        "q": "أي منفذ يستمع للجهاز نفسه فقط؟",
        "type": "choice",
        "answer": "5939",
        "why": "127.0.0.1:5939 ← AccountingSync.exe.",
        "options": [
          "5939",
          "5900",
          "3389"
        ],
        "extra": true
      },
      {
        "q": "مع أي جهاز في الشبكة اتصال قائم على المنفذ 445؟",
        "type": "choice",
        "answer": "192.168.50.10",
        "why": "خادم الملفات FILESRV: اتصال طبيعي بمجلد مشترك.",
        "options": [
          "192.168.50.10",
          "192.168.50.22",
          "203.0.113.80"
        ],
        "extra": true
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "netstat وtasklist موجودان في كل نسخ Windows؛ مدير المهام: Ctrl+Shift+Esc.",
      "في Windows 11 22H2 صار تبويب Startup اسمه Startup apps، وصار التنقل شريطاً جانبياً.",
      "netstat -b يحتاج دائماً نافذة مسؤول (Run as administrator).",
      "بديل مرئي لـ netstat: TCPView من Microsoft Sysinternals (بطاقة «اعرف أكثر»)."
    ],
    "officialSite": "https://learn.microsoft.com/windows-server/administration/windows-commands/netstat"
  },
  "guide": [
    "تعرض المنافذ المفتوحة على جهاز المحاسب بأمر netstat.",
    "تعرف اسم البرنامج الذي فتح المنفذ الغريب 5900.",
    "تجد مكان ملفه في مدير المهام، وترى أنه يبدأ مع الجهاز."
  ]
};
