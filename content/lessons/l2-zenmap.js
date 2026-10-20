/* Lesson l2-zenmap — host discovery and port scanning of the office network from CONSULTANT-LT.
   Concepts: docs/concepts.md §2.1–2.5. Values: docs/outputs-spec.md §د. Shape: docs/ui-reference.md §3. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l2-zenmap"] = {
  "id": "l2-zenmap",
  "seq": 2,
  "axis": 1,
  "axisTitle": "المحور ١: قيّم",
  "units": [
    10
  ],
  "tools": [
    "Zenmap"
  ],
  "minutes": 15,
  "title": "مسح الأجهزة والمنافذ: Zenmap",
  "caseBranch": {
    "question": "ما الأجهزة في الشبكة، وما الأبواب التي يراها أي جهاز فيها؟",
    "known": "من داخل ACC-PC1 رأينا 7 منافذ مفتوحة لكل الشبكة، منها 5900 لبرنامج منسي.",
    "now": "نفحص شبكة المكتب كلها من جهازنا لنرى الأجهزة وأبوابها من الخارج، كما يراها أي جهاز في الشبكة.",
    "finding": "6 أجهزة تعمل، منها طابعة لم يذكرها المدير (192.168.50.30) تفتح Telnet على 23؛ وACC-PC1 وحده يكشف vnc على 5900 وRDP على 3389، ونظامه Windows (دقة التخمين 96%)."
  },
  "objectives": [
    "اكتشاف الأجهزة العاملة في النطاق (Ping scan) قبل فحص منافذها.",
    "قراءة حالات المنفذ: open وclosed وfiltered.",
    "قراءة الخدمة والإصدار وتخمين نظام التشغيل، والتمييز بين منظور الداخل (netstat) والخارج (Zenmap)."
  ],
  "explain": {
    "intro": "التشبيه الجامع: حارس يتجول حول المبنى ويعدّ الأبواب المفتوحة، بعد أن رأى الموظف قائمتها من الداخل.",
    "figure": "netmap",
    "whatNext": "ستفتح Zenmap، ثم: Ping scan للشبكة، وQuick scan للشبكة، وQuick scan plus لـ ACC-PC1، وتقرأ Host Details وعرض Services.",
    "cards": [
      {
        "id": "outside",
        "ar": "الفحص من الخارج مقابل النظر من الداخل",
        "en": "External scan vs. internal view",
        "analogy": "حارس يتجول حول المبنى ويعدّ الأبواب المفتوحة، مقابل موظف داخل المبنى يقرأ كشف الأبواب.",
        "meaning": "netstat يرى ما يحدث داخل جهاز واحد؛ Zenmap يرى ما يظهر من الشبكة لعدة أجهزة. قد يختلفان: منفذ يستمع في الداخل قد يحجبه الجدار الناري عن الخارج.",
        "inTool": [
          "netstat ← على الجهاز نفسه",
          "Zenmap ← من جهاز المستشار 192.168.50.100"
        ],
        "forDefender": "أي جهاز في الشبكة يرى الصورة الخارجية فقط؛ وهي الصورة التي يجب أن تكون نظيفة.",
        "fromFrame": "5900 يظهر في netstat على ACC-PC1 ويظهر أيضاً في Zenmap ← لا شيء يحجبه.",
        "mistake": "الاكتفاء بأحد المنظورين.",
        "quiz": {
          "q": "منفذ LISTENING في netstat ولا يظهر في Zenmap؛ ما التفسير المحتمل؟",
          "type": "choice",
          "options": [
            "جدار ناري يحجبه",
            "netstat مخطئ",
            "المنفذ مغلق"
          ],
          "answer": "جدار ناري يحجبه",
          "why": "الخدمة تعمل داخل الجهاز، لكن الجدار يمنع الوصول من الخارج."
        }
      },
      {
        "id": "discovery",
        "ar": "اكتشاف الأجهزة",
        "en": "Host Discovery / Ping scan",
        "analogy": "المرور على الشقق ومعرفة أيها مسكون قبل طرق أبوابها.",
        "meaning": "الخطوة الأولى: معرفة أي العناوين في النطاق فيها أجهزة تعمل (Host is up)، دون فحص منافذها.",
        "inTool": [
          "Profile: Ping scan  ←  nmap -sn 192.168.50.0/24",
          "Nmap done: 256 IP addresses (6 hosts up)"
        ],
        "forDefender": "جرد الأجهزة: لا تحمي ما لا تعرف بوجوده.",
        "fromFrame": "ستة أجهزة تعمل، منها الطابعة .30 التي لم يذكرها المدير.",
        "mistake": "اعتبار الجهاز الذي لم يرد «غير موجود»؛ قد يكون جداره يحجب الرد.",
        "quiz": {
          "q": "كم عنواناً في النطاق /24؟ (اكتب رقماً)",
          "type": "value",
          "answer": "256",
          "why": "من .0 إلى .255."
        }
      },
      {
        "id": "port-states",
        "ar": "حالات المنفذ في الماسح",
        "en": "open / closed / filtered",
        "analogy": "طرقت الباب: فُتح (open)، أُجبت بـ «لا أحد هنا» (closed)، لم يرد أحد إطلاقاً (filtered).",
        "meaning": "open برنامج يقبل الاتصال • closed الجهاز رد بأن لا برنامج هنا • filtered لا رد، غالباً جدار ناري يحجب.",
        "inTool": [
          "عمود State في Ports / Hosts",
          "Not shown: 95 filtered tcp ports (no-response)"
        ],
        "forDefender": "الهدف بعد المعالجة: ما لا حاجة له closed أو filtered، والمطلوب فقط open.",
        "fromFrame": "قبل: 5900/tcp open vnc؛ بعد الدرسين 6 و7 يختفي من القائمة.",
        "mistake": "الظن أن closed خطر؛ هو آمن (لا شيء يستمع).",
        "quiz": {
          "q": "أي حالة تدل غالباً على جدار ناري؟",
          "type": "choice",
          "options": [
            "filtered",
            "closed",
            "open"
          ],
          "answer": "filtered",
          "why": "لا رد أصلاً: شيء في الطريق يحجب."
        }
      },
      {
        "id": "versions",
        "ar": "الخدمة والإصدار ونظام التشغيل",
        "en": "Service / Version / OS detection",
        "analogy": "لا يكفي أن تعرف أن الباب مفتوح؛ تريد أن تعرف من خلفه وكم عمر قفله.",
        "meaning": "الماسح يخمّن اسم الخدمة وإصدارها ونظام التشغيل من طريقة الرد. التخمين له نسبة دقة.",
        "inTool": [
          "Ports / Hosts › Version",
          "Host Details › Operating System › Accuracy: 96%"
        ],
        "forDefender": "الإصدار القديم هو ما يبحث عنه ماسح الثغرات في الدرس 3.",
        "fromFrame": "5900/tcp open vnc VNC (protocol 3.8): برنامج الدعم القديم.",
        "mistake": "أخذ تخمين النظام كحقيقة مؤكدة.",
        "quiz": {
          "q": "ماذا يعني Accuracy: 90%؟",
          "type": "choice",
          "options": [
            "تخمين مرجّح لا مؤكد",
            "النظام مؤكد 100%",
            "90% من المنافذ مفتوحة"
          ],
          "answer": "تخمين مرجّح لا مؤكد",
          "why": "nmap يقارن الردود بقاعدة بصمات ويعطي أقرب تطابق."
        },
        "extra": true
      },
      {
        "id": "profiles",
        "ar": "شدة الفحص والملفات الشخصية",
        "en": "Scan Profiles",
        "analogy": "نظرة سريعة على الأبواب الأمامية، أو جولة كاملة على كل نوافذ المبنى.",
        "meaning": "Quick scan يفحص أشهر 100 منفذ بسرعة • Regular scan أشهر 1000 • Quick scan plus يضيف الإصدار والنظام. الفحص الأشمل أبطأ وأكثر ضجيجاً على الشبكة.",
        "inTool": [
          "Profile: Quick scan  ←  Command: nmap -T4 -F 192.168.50.0/24"
        ],
        "forDefender": "يُختار الفحص المناسب لشبكة العميل حتى لا يُبطئ أعماله.",
        "fromFrame": "لا نريد إبطاء عمل المكتب ← نبدأ بـ Ping scan ثم Quick scan، ثم Quick scan plus لجهاز واحد.",
        "mistake": "تشغيل أشد فحص على الشبكة كلها دون حاجة.",
        "quiz": {
          "q": "أي ملف شخصي يكتشف الأجهزة دون فحص منافذها؟",
          "type": "choice",
          "options": [
            "Ping scan",
            "Quick scan",
            "Intense scan"
          ],
          "answer": "Ping scan",
          "why": "nmap -sn: اكتشاف فقط."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "zenmap",
    "state": "before",
    "scenario": "أنت على جهازك CONSULTANT-LT (192.168.50.100) داخل شبكة المكتب. افحص الشبكة كلها لتعرف الأجهزة وأبوابها، ثم افحص ACC-PC1 بتفصيل أكبر.",
    "launchers": [
      {
        "tool": "zenmap",
        "label": "Zenmap"
      }
    ],
    "freeNote": "جرّب دون تلميحات: الملفات الشخصية الأربعة المفعّلة، وعرض Services، وHost Details لكل جهاز.",
    "steps": [
      {
        "id": "s1",
        "title": "افتح Zenmap",
        "instruction": "اضغط زر «Zenmap» في شريط التطبيقات.",
        "why": "Zenmap الواجهة الرسومية لـ Nmap.",
        "expect": {
          "type": "event",
          "name": "tool:launch",
          "where": {
            "tool": "zenmap"
          }
        },
        "target": "[data-launch=\"zenmap\"]",
        "hints": [
          "الزر فوق مساحة العمل.",
          "اسمه Zenmap.",
          "اضغط زر Zenmap."
        ],
        "demo": {
          "kind": "launch",
          "tool": "zenmap"
        },
        "result": "فُتح Zenmap. أعلى النافذة: Target (الهدف) وProfile (نوع الفحص) وزر Scan."
      },
      {
        "id": "s3",
        "title": "اكتشف الأجهزة",
        "instruction": "في حقل Target اكتب 192.168.50.0/24 • من قائمة Profile اختر Ping scan • اضغط Scan.",
        "why": "نعرف أولاً أي العناوين فيها أجهزة تعمل.",
        "expect": {
          "type": "event",
          "name": "zenmap:scan",
          "where": {
            "profile": "Ping scan",
            "target": "192.168.50.0/24",
            "ok": true
          }
        },
        "target": "[data-win=\"zenmap\"] .zm-target",
        "onMismatch": "المطلوب: Target = 192.168.50.0/24 وProfile = Ping scan ثم Scan.",
        "hints": [
          "الهدف هو شبكة المكتب كلها.",
          "الملف الشخصي الذي يكتشف بلا فحص منافذ.",
          "Target: 192.168.50.0/24 • Profile: Ping scan • Scan"
        ],
        "demo": {
          "kind": "ui",
          "tool": "zenmap",
          "action": "run",
          "arg": [
            "Ping scan",
            "192.168.50.0/24"
          ]
        },
        "result": "ظهرت 6 أجهزة تعمل في اللوحة اليسرى، منها الطابعة 192.168.50.30."
      },
      {
        "id": "s4",
        "title": "افحص أشهر المنافذ",
        "instruction": "اترك Target كما هو • غيّر Profile إلى Quick scan • اضغط Scan.",
        "why": "أشهر 100 منفذ لكل جهاز، بسرعة ودون إثقال الشبكة.",
        "expect": {
          "type": "event",
          "name": "zenmap:scan",
          "where": {
            "profile": "Quick scan",
            "target": "192.168.50.0/24",
            "ok": true
          }
        },
        "target": "[data-win=\"zenmap\"] .zm-profile",
        "hints": [
          "الهدف نفسه، والملف الشخصي مختلف.",
          "Quick scan = nmap -T4 -F.",
          "Profile: Quick scan • Scan"
        ],
        "demo": {
          "kind": "ui",
          "tool": "zenmap",
          "action": "run",
          "arg": [
            "Quick scan",
            "192.168.50.0/24"
          ]
        },
        "result": "لكل جهاز أبوابه المفتوحة. لاحظ 5900 vnc على ACC-PC1، و23 telnet على الطابعة."
      },
      {
        "id": "s5",
        "title": "تفصيل ACC-PC1",
        "instruction": "في Target اكتب 192.168.50.21 • اختر Profile: Quick scan plus • اضغط Scan.",
        "why": "يضيف إصدار كل خدمة وتخمين نظام التشغيل للجهاز الذي فيه الباب الغريب.",
        "expect": {
          "type": "event",
          "name": "zenmap:scan",
          "where": {
            "profile": "Quick scan plus",
            "target": "192.168.50.21",
            "ok": true
          }
        },
        "target": "[data-win=\"zenmap\"] .zm-target",
        "hints": [
          "الهدف جهاز واحد هذه المرة.",
          "ACC-PC1 = 192.168.50.21، والملف الشخصي فيه plus.",
          "Target: 192.168.50.21 • Profile: Quick scan plus • Scan"
        ],
        "demo": {
          "kind": "ui",
          "tool": "zenmap",
          "action": "run",
          "arg": [
            "Quick scan plus",
            "192.168.50.21"
          ]
        },
        "result": "ظهر إصدار كل خدمة (مثل VNC (protocol 3.8)) وتخمين نظام التشغيل: Windows."
      },
      {
        "id": "s6",
        "title": "تفاصيل الجهاز",
        "instruction": "افتح تبويب Host Details واقرأ Open ports ونظام التشغيل ودقته.",
        "why": "ملخص الجهاز في مكان واحد.",
        "expect": {
          "type": "event",
          "name": "zenmap:tab",
          "where": {
            "tab": "Host Details"
          }
        },
        "target": "[data-win=\"zenmap\"] [data-tab=\"Host Details\"]",
        "hints": [
          "التبويبات فوق الناتج.",
          "التبويب الرابع.",
          "اضغط Host Details."
        ],
        "demo": {
          "kind": "ui",
          "tool": "zenmap",
          "action": "showTab",
          "arg": "Host Details"
        },
        "result": "Host Details يلخّص الجهاز: 5 منافذ مفتوحة، و95 محجوبة (filtered)، ودقة تخمين النظام 96%."
      },
      {
        "id": "s7",
        "title": "من يقدّم VNC؟",
        "instruction": "اضغط زر Services في اللوحة اليسرى، ثم اختر الخدمة vnc.",
        "why": "عرض Services يجيب: أي الأجهزة تقدّم هذه الخدمة؟",
        "expect": {
          "type": "event",
          "name": "zenmap:service",
          "where": {
            "service": "vnc"
          }
        },
        "target": "[data-win=\"zenmap\"] .zm-toggles",
        "hints": [
          "أعلى اللوحة اليسرى زرّان.",
          "Services ثم اسم الخدمة.",
          "Services ← vnc"
        ],
        "demo": {
          "kind": "ui",
          "tool": "zenmap",
          "action": "selectService",
          "arg": "vnc"
        },
        "result": "عرض Services يجيب: خدمة vnc يقدمها جهاز واحد فقط هو 192.168.50.21."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "ping",
        "tool": "zenmap",
        "cmd": "Ping scan|192.168.50.0/24",
        "title": "Ping scan",
        "heading": "nmap -sn 192.168.50.0/24"
      },
      {
        "id": "quick",
        "tool": "zenmap",
        "cmd": "Quick scan|192.168.50.0/24",
        "title": "Quick scan",
        "heading": "nmap -T4 -F 192.168.50.0/24"
      },
      {
        "id": "plus",
        "tool": "zenmap",
        "cmd": "Quick scan plus|192.168.50.21",
        "state": "before",
        "title": "Quick scan plus (قبل)",
        "heading": "nmap -sV -T4 -O -F --version-light 192.168.50.21   [قبل المعالجة]"
      },
      {
        "id": "plus2",
        "tool": "zenmap",
        "cmd": "Quick scan plus|192.168.50.21",
        "state": "after",
        "title": "Quick scan plus (بعد)",
        "heading": "nmap -sV -T4 -O -F --version-light 192.168.50.21   [بعد المعالجة]"
      }
    ],
    "highlights": [
      {
        "src": "ping",
        "line": "Nmap done",
        "match": "(6 hosts up)",
        "label": "6 hosts up",
        "concept": "discovery",
        "meaning": "ستة أجهزة تعمل في النطاق: الراوتر، وخادم الملفات، وجهازا المكتب، والطابعة، وجهازك.",
        "core": true
      },
      {
        "src": "ping",
        "line": "printer.sanabel.example",
        "match": "printer.sanabel.example (192.168.50.30)",
        "label": "الطابعة",
        "concept": "discovery",
        "meaning": "جهاز لم يذكره المدير في قائمته. الجرد يكشف ما لا يعرفه صاحب الشبكة نفسه.",
        "core": true
      },
      {
        "src": "quick",
        "line": "23/tcp",
        "match": "23/tcp   open  telnet",
        "label": "23 telnet",
        "danger": true,
        "concept": "port-states",
        "meaning": "الطابعة تُدار عبر Telnet: إدارة بلا تشفير. سيصنّفها Nessus في الدرس 3.",
        "core": true
      },
      {
        "src": "quick",
        "line": "5900/tcp",
        "match": "5900/tcp open  vnc",
        "label": "5900 vnc",
        "danger": true,
        "concept": "outside",
        "meaning": "الباب نفسه الذي رأيناه في netstat من الداخل، يراه الآن أي جهاز في الشبكة.",
        "core": true
      },
      {
        "src": "quick",
        "line": "97 closed",
        "match": "97 closed tcp ports (reset)",
        "label": "closed",
        "concept": "port-states",
        "meaning": "الراوتر يرد برفض على المنافذ الأخرى: closed (لا خدمة)، وهذا آمن."
      },
      {
        "src": "plus",
        "line": "Not shown: 95",
        "match": "95 filtered tcp ports (no-response)",
        "label": "filtered قبل",
        "concept": "port-states",
        "meaning": "الجدار الناري في ACC-PC1 يحجب 95 منفذاً (لا رد)، ويترك 5 مفتوحة."
      },
      {
        "src": "plus",
        "line": "5900/tcp",
        "match": "VNC (protocol 3.8)",
        "label": "إصدار VNC",
        "concept": "versions",
        "meaning": "إصدار الخدمة على 5900: برنامج تحكم عن بعد قديم. هذا ما سيفحصه Nessus."
      },
      {
        "src": "plus",
        "line": "OS details",
        "match": "Microsoft Windows 10 1607 - 11 23H2",
        "label": "OS details",
        "concept": "versions",
        "meaning": "تخمين لا يقين (دقته 96% في Host Details): الجهاز فعلاً Windows 11 24H2، والتخمين أعطى مدى."
      },
      {
        "src": "plus2",
        "line": "Not shown: 97",
        "match": "97 filtered tcp ports (no-response)",
        "label": "filtered بعد",
        "concept": "outside",
        "meaning": "بعد المعالجة: 3 منافذ مفتوحة فقط. اختفى 5900، وحُجب 3389 عن غير جهاز المدير."
      }
    ],
    "table": [
      {
        "see": "Host is up",
        "means": "الجهاز يعمل ويرد."
      },
      {
        "see": "PORT … open",
        "means": "خدمة تستقبل اتصالات على هذا المنفذ."
      },
      {
        "see": "Not shown: N closed tcp ports (reset)",
        "means": "الجهاز يرد برفض على بقية المنافذ: لا خدمات."
      },
      {
        "see": "Not shown: N filtered tcp ports (no-response)",
        "means": "جدار ناري يحجب بقية المنافذ: لا رد."
      },
      {
        "see": "VERSION / OS details",
        "means": "تخمين من طريقة الرد؛ له نسبة دقة."
      },
      {
        "see": "Note: Host seems down",
        "means": "لا جهاز يرد على هذا العنوان (أو جداره يحجب الرد)."
      }
    ],
    "ioc": [
      "5900/tcp open vnc على 192.168.50.21 (تحكم عن بعد).",
      "23/tcp open telnet على الطابعة 192.168.50.30 (إدارة بلا تشفير)."
    ],
    "questions": [
      {
        "q": "كم جهازاً يعمل في النطاق؟",
        "type": "choice",
        "answer": "6",
        "why": "Nmap done: 256 IP addresses (6 hosts up)، ومنها جهاز المستشار نفسه.",
        "options": [
          "6",
          "5",
          "256"
        ]
      },
      {
        "q": "أي جهاز لم يذكره المدير في قائمته؟",
        "type": "choice",
        "answer": "192.168.50.30",
        "why": "الطابعة: ظهرت في Ping scan.",
        "options": [
          "192.168.50.30",
          "192.168.50.1",
          "192.168.50.22"
        ]
      },
      {
        "q": "أي جهاز وحده يقدّم خدمة vnc؟",
        "type": "choice",
        "answer": "192.168.50.21",
        "why": "عرض Services ← vnc ← 192.168.50.21.",
        "options": [
          "192.168.50.21",
          "192.168.50.10",
          "192.168.50.30"
        ]
      },
      {
        "q": "أي جهاز يقدّم telnet؟",
        "type": "choice",
        "answer": "192.168.50.30",
        "why": "الطابعة، على المنفذ 23.",
        "options": [
          "192.168.50.30",
          "192.168.50.1",
          "192.168.50.22"
        ],
        "extra": true
      },
      {
        "q": "ما حالة أغلب المنافذ في ACC-PC1، وماذا تعني؟",
        "type": "choice",
        "options": [
          "filtered: الجدار الناري يحجبها",
          "closed: لا خدمات عليها",
          "open: كلها مفتوحة"
        ],
        "answer": "filtered: الجدار الناري يحجبها",
        "why": "Not shown: 95 filtered tcp ports (no-response).",
        "extra": true
      },
      {
        "extra": true,
        "q": "ما دقة تخمين نظام التشغيل في Host Details؟",
        "type": "choice",
        "options": [
          "96%",
          "100%",
          "50%"
        ],
        "answer": "96%",
        "why": "تخمين مرجّح لا مؤكد."
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "في الكتاب ← اليوم: أدوات المسح القديمة مثل SuperScan توقفت، ويصنّفها مضاد الفيروسات غالباً أداة قرصنة. البديل المعتمد مهنياً اليوم Nmap وواجهته Zenmap.",
      "Zenmap يُثبَّت مع حزمة Nmap لـ Windows من الموقع الرسمي (الإصدار 7.9x).",
      "الملفات الشخصية القوية (Intense) تشغّل نصوصاً إضافية وتثقل الشبكة؛ غير مفعّلة في المحاكاة.",
      "Tools › Compare Results يقارن فحصين؛ نستخدمه في الدرس 10."
    ],
    "officialSite": "https://nmap.org/zenmap/"
  },
  "guide": [
    "تكتشف الأجهزة العاملة في شبكة المكتب (Ping scan).",
    "تفحص أبوابها من الخارج (Quick scan).",
    "تقرأ تفاصيل جهاز المحاسب، وتعرف من يقدّم خدمة VNC."
  ]
};
