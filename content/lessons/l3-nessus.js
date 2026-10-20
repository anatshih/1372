/* Lesson l3-nessus — vulnerability scan of the five office hosts and reading severity.
   Concepts: docs/concepts.md §3.1–3.6. Values: docs/outputs-spec.md §هـ. Shape: docs/ui-reference.md §4.
   Defensive only: each finding shows name, severity, description and solution — never how it could be exploited. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l3-nessus"] = {
  "id": "l3-nessus",
  "seq": 3,
  "axis": 1,
  "axisTitle": "المحور ١: قيّم",
  "units": [
    10
  ],
  "tools": [
    "Nessus Essentials"
  ],
  "minutes": 15,
  "title": "ماسح الثغرات وقراءة الخطورة: Nessus Essentials",
  "caseBranch": {
    "question": "ما المشكلة في كل باب، وما خطورتها، وبأيها نبدأ؟",
    "known": "نعرف الأجهزة الخمسة وأبوابها: 5900 و3389 على ACC-PC1، و23 (Telnet) على الطابعة.",
    "now": "نشغّل ماسح الثغرات بصلاحيات حساب Consultant لنعرف المشكلات وخطورتها وحلّها، ونرتّب خطة المعالجة.",
    "finding": "Nessus وجد 4 مشكلات: حرجتان (التحديث KB5099901 ناقص على جهازين، وVNC بلا مصادقة على ACC-PC1) ومتوسطتان (RDP دون NLA، وTelnet على الطابعة). الخطة بهذا الترتيب؛ وTelnet الطابعة «متبقية» لأنها تحتاج المورّد."
  },
  "objectives": [
    "إنشاء فحص Basic Network Scan للأهداف المفوَّضة وتشغيله.",
    "قراءة الخطورة ودرجة CVSS، والتمييز بين الثغرة والمعلومة (Info).",
    "قراءة صفحة الثغرة (الوصف والحل) وترتيب أولويات المعالجة."
  ],
  "explain": {
    "intro": "التشبيه الجامع: فرز المرضى في الطوارئ. Zenmap عدّ الأبواب؛ Nessus يفحص كل باب ويقول ما علّته وكم هي خطيرة وما علاجها.",
    "figure": "triage",
    "whatNext": "ستفتح Nessus في المتصفح، وتنشئ فحصاً باسم Sanabel - Baseline للأجهزة الخمسة، وتطّلع على Credentials، وتشغّله، ثم تقرأ النتائج وصفحة الثغرة الأولى.",
    "cards": [
      {
        "id": "port-vs-vuln",
        "ar": "المنفذ المفتوح مقابل الثغرة",
        "en": "Open port vs. vulnerability",
        "analogy": "الباب المفتوح ليس مشكلة بحد ذاته؛ المشكلة أن قفله معطوب.",
        "meaning": "Zenmap يقول ماذا يعمل؛ ماسح الثغرات يقارن ما يعمل بقاعدة معروفة من نقاط الضعف ويقول ما المشكلة وكيف تُحل.",
        "inTool": [
          "Vulnerabilities › كل صف ← Description + Solution"
        ],
        "forDefender": "يحوّل قائمة المنافذ إلى قائمة أعمال مرتّبة.",
        "fromFrame": "445 مفتوح على FILESRV لأنه خادم ملفات (مطلوب)، لكن على ACC-PC1 هناك تحديث أمني ناقص.",
        "mistake": "عدّ كل منفذ مفتوح ثغرة.",
        "quiz": {
          "q": "خادم ويب يفتح 443؛ هل هذا ثغرة؟",
          "type": "choice",
          "options": [
            "لا بالضرورة؛ هو عمله",
            "نعم دائماً",
            "نعم إن كان على 0.0.0.0"
          ],
          "answer": "لا بالضرورة؛ هو عمله",
          "why": "الثغرة ضعف في الخدمة أو إعدادها، لا مجرد كونها تعمل."
        }
      },
      {
        "id": "severity",
        "ar": "درجة الخطورة",
        "en": "Severity / CVSS",
        "analogy": "فرز المرضى في الطوارئ بالألوان: من يُعالج أولاً.",
        "meaning": "CVSS درجة من 0 إلى 10 تقيس شدة الثغرة. التصنيف: Critical 9.0–10 • High 7.0–8.9 • Medium 4.0–6.9 • Low 0.1–3.9 • Info 0 (معلومة لا ثغرة).",
        "inTool": [
          "عمود Sev الملوّن وعمود CVSS",
          "Hosts › الشريط الملوّن لكل جهاز"
        ],
        "forDefender": "الوقت محدود؛ نبدأ بالحرج والعالي.",
        "fromFrame": "التحديث الناقص Critical؛ RDP دون NLA Medium؛ كشف خدمة VNC Info.",
        "mistake": "تجاهل Info كلياً؛ بعضها يكشف شيئاً غير متوقع (مثل خدمة منسية).",
        "quiz": {
          "q": "درجة CVSS 7.5؛ ما التصنيف؟",
          "type": "choice",
          "options": [
            "High",
            "Critical",
            "Medium"
          ],
          "answer": "High",
          "why": "High من 7.0 إلى 8.9."
        }
      },
      {
        "id": "priority",
        "ar": "ترتيب الأولويات",
        "en": "Prioritization",
        "analogy": "تصلح أولاً تسرّب الغاز ثم الصنبور الذي يقطر.",
        "meaning": "الأولوية = الخطورة + عدد الأجهزة المتأثرة + أهمية الجهاز (خادم الملفات أهم من الطابعة). VPR في Nessus مؤشر إضافي يحاول تقدير الإلحاح.",
        "inTool": [
          "الترتيب حسب Sev ثم Count",
          "عمود VPR"
        ],
        "forDefender": "يصنع خطة معالجة واقعية للعميل.",
        "fromFrame": "التحديث الناقص على ACC-PC1 وACC-PC2 (Count = 2) قبل غيره.",
        "mistake": "المعالجة بترتيب ظهور الصفوف.",
        "quiz": {
          "q": "ثغرتان High، الأولى على جهاز واحد والثانية على خمسة؛ أيهما أولاً؟",
          "type": "choice",
          "options": [
            "الثانية",
            "الأولى",
            "لا فرق"
          ],
          "answer": "الثانية",
          "why": "الخطورة نفسها، والأثر أوسع."
        }
      },
      {
        "id": "plugin",
        "ar": "الإضافة ورقمها",
        "en": "Plugin / Plugin ID / Family",
        "analogy": "بند في قائمة فحص الطبيب، لكل بند رقم.",
        "meaning": "Nessus يعمل بآلاف «الإضافات»، كل منها يفحص مشكلة واحدة، ولها رقم وعائلة (Windows : Microsoft Bulletins، Service detection…).",
        "inTool": [
          "Plugin Details › ID • Family • Published"
        ],
        "forDefender": "رقم الإضافة يُذكر في التقرير ليعيد أي أحد الفحص نفسه ويقارن.",
        "fromFrame": "في المحاكاة أرقام الإضافات تدريبية (900101 وما بعدها).",
        "mistake": "الخلط بين رقم الإضافة ورقم الثغرة العالمي (CVE).",
        "quiz": {
          "q": "أين تجد عائلة الإضافة؟",
          "type": "choice",
          "options": [
            "عمود Family أو Plugin Details",
            "شريط عنوان المتصفح",
            "تبويب History"
          ],
          "answer": "عمود Family أو Plugin Details",
          "why": "Family يجمع الإضافات المتشابهة."
        },
        "extra": true
      },
      {
        "id": "cve",
        "ar": "رقم الثغرة العالمي",
        "en": "CVE",
        "analogy": "رقم الملف الطبي الموحّد في كل المستشفيات.",
        "meaning": "معرّف عالمي لكل ثغرة معلنة، بصيغة CVE-السنة-الرقم، تستخدمه كل الأدوات والشركات.",
        "inTool": [
          "Reference Information › CVE"
        ],
        "forDefender": "يربط تقرير Nessus بنشرة المصنّع وبالتحديث الذي يغلق الثغرة.",
        "fromFrame": "أرقام CVE في المحاكاة تدريبية الصيغة (CVE-2026-99101) ولا تشير إلى ثغرات حقيقية.",
        "mistake": "الظن أن كل مشكلة لها CVE؛ أخطاء الإعداد (مثل كلمة مرور ضعيفة) لا رقم لها.",
        "quiz": {
          "q": "هل لـ «حد قفل الحساب = 0» رقم CVE؟",
          "type": "choice",
          "options": [
            "لا، خطأ إعداد",
            "نعم دائماً",
            "فقط في Windows"
          ],
          "answer": "لا، خطأ إعداد",
          "why": "CVE للثغرات المعلنة في البرامج، لا لإعدادات المستخدم."
        },
        "extra": true
      },
      {
        "id": "credentialed",
        "ar": "الإيجابي الكاذب والفحص بصلاحيات",
        "en": "False Positive / Credentialed scan",
        "analogy": "جهاز الإنذار يرنّ لدخان الطبخ؛ وطبيب يفحص من خلف الزجاج مقابل طبيب يفحص عن قرب.",
        "meaning": "الإيجابي الكاذب تقرير عن ثغرة غير موجودة فعلاً. الفحص بلا صلاحيات يرى من الخارج ويخمّن أكثر؛ الفحص بصلاحيات (Credentials) يدخل الجهاز ويقرأ الإصدارات بدقة.",
        "inTool": [
          "تبويب Credentials في إعدادات الفحص",
          "Plugin Details › Type: remote / local"
        ],
        "forDefender": "كل نتيجة تُتحقق قبل أن تُكتب في التقرير.",
        "fromFrame": "نتحقق من التحديث الناقص بفتح Windows Update نفسه (الدرس 4).",
        "mistake": "نسخ كل ما في الماسح إلى التقرير دون تحقق.",
        "quiz": {
          "q": "أي الفحصين أدق في معرفة التحديثات الناقصة؟",
          "type": "choice",
          "options": [
            "الفحص بصلاحيات",
            "الفحص بلا صلاحيات",
            "متساويان"
          ],
          "answer": "الفحص بصلاحيات",
          "why": "يقرأ ما هو مثبّت فعلاً بدل التخمين."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "nessus",
    "state": "before",
    "scenario": "Nessus Essentials مثبّت على جهازك CONSULTANT-LT ويعمل في المتصفح. أنشئ فحصاً للأجهزة الخمسة التي اكتشفتها في الدرس 2، بحساب Consultant الذي أعطاك إياه المكتب، ثم اقرأ النتائج.",
    "launchers": [
      {
        "tool": "nessus",
        "label": "Nessus Essentials"
      }
    ],
    "freeNote": "جرّب دون تلميحات: أنشئ الفحص وشغّله، وتنقّل بين Hosts وVulnerabilities وRemediations وHistory، وافتح صفحات الثغرات.",
    "steps": [
      {
        "id": "s1",
        "title": "افتح Nessus",
        "instruction": "اضغط زر «Nessus Essentials» في شريط التطبيقات.",
        "why": "Nessus واجهة ويب على https://localhost:8834.",
        "expect": {
          "type": "event",
          "name": "tool:launch",
          "where": {
            "tool": "nessus"
          }
        },
        "target": "[data-launch=\"nessus\"]",
        "hints": [
          "الزر فوق مساحة العمل.",
          "اسمه Nessus Essentials.",
          "اضغط الزر."
        ],
        "demo": {
          "kind": "launch",
          "tool": "nessus"
        },
        "result": "فُتح Nessus في المتصفح على https://localhost:8834، وMy Scans فارغة."
      },
      {
        "id": "s3",
        "title": "فحص جديد",
        "instruction": "في My Scans اضغط New Scan.",
        "why": "كل فحص يبدأ باختيار قالب.",
        "expect": {
          "type": "event",
          "name": "nessus:new"
        },
        "target": "[data-win=\"nessus\"] .ns-head",
        "hints": [
          "الزر الأزرق أعلى اليمين.",
          "اسمه New Scan.",
          "اضغط New Scan."
        ],
        "demo": {
          "kind": "ui",
          "tool": "nessus",
          "action": "newScan"
        },
        "result": "ظهرت قوالب الفحص. نحتاج Basic Network Scan."
      },
      {
        "id": "s4",
        "title": "اختر القالب",
        "instruction": "في تبويب Vulnerabilities اختر Basic Network Scan.",
        "why": "قالب شامل مناسب لأجهزة المكتب.",
        "expect": {
          "type": "event",
          "name": "nessus:template",
          "where": {
            "name": "Basic Network Scan"
          }
        },
        "target": "[data-win=\"nessus\"] [data-template=\"Basic Network Scan\"]",
        "hints": [
          "القوالب بطاقات.",
          "أول بطاقة في تبويب Vulnerabilities.",
          "اضغط Basic Network Scan."
        ],
        "demo": {
          "kind": "ui",
          "tool": "nessus",
          "action": "pickTemplate"
        },
        "result": "ظهر نموذج الفحص الجديد: Name وTargets في تبويب Settings."
      },
      {
        "id": "s5",
        "title": "الاسم والأهداف ثم الصلاحيات",
        "instruction": "في حقل Name اكتب: Sanabel - Baseline • في حقل Targets اكتب: 192.168.50.0/24 • ثم اضغط تبويب Credentials.",
        "why": "الأهداف هي شبكة المكتب التي فحصناها في الدرس 2؛ وCredentials يُري حساب Consultant الذي يجعل الفحص يقرأ التحديثات بدقة.",
        "expect": {
          "type": "event",
          "name": "nessus:formtab",
          "where": {
            "tab": "Credentials"
          }
        },
        "target": "[data-win=\"nessus\"] #ns-targets",
        "hints": [
          "حقلا Name وTargets في Settings › General.",
          "الهدف شبكة المكتب كلها، ثم التبويب الثاني.",
          "Name: Sanabel - Baseline • Targets: 192.168.50.0/24 • ثم Credentials"
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "nessus",
            "action": "fill",
            "arg": [
              "Sanabel - Baseline",
              "192.168.50.0/24"
            ]
          },
          {
            "kind": "ui",
            "tool": "nessus",
            "action": "formTab",
            "arg": "Credentials"
          }
        ],
        "result": "تبويب Credentials يُظهر حساب Consultant: الفحص سيقرأ التحديثات المثبتة بدقة."
      },
      {
        "id": "s6",
        "title": "احفظ وشغّل",
        "instruction": "اضغط السهم ▾ بجانب Save ثم Launch، وانتظر حتى تظهر علامة ✓ بجانب الفحص.",
        "why": "Save يحفظ الإعداد؛ Launch يشغّله الآن.",
        "expect": {
          "type": "event",
          "name": "nessus:completed"
        },
        "target": "[data-win=\"nessus\"] .ns-savegroup",
        "onMismatch": "إن ظهرت رسالة، اقرأها: ربما حقل الاسم أو الأهداف فارغ.",
        "hints": [
          "الأزرار أسفل النموذج.",
          "السهم ▾ يفتح قائمة فيها Launch.",
          "▾ ← Launch، ثم انتظر ✓."
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "nessus",
            "action": "saveLaunch"
          },
          {
            "kind": "ui",
            "tool": "nessus",
            "action": "waitDone"
          }
        ],
        "result": "الفحص اكتمل (✓). صار في My Scans ويمكن فتحه."
      },
      {
        "id": "s7",
        "title": "النتائج",
        "instruction": "اضغط اسم الفحص Sanabel - Baseline، ثم تبويب Vulnerabilities.",
        "why": "قائمة الثغرات مرتبة بالخطورة.",
        "expect": {
          "type": "event",
          "name": "nessus:tab",
          "where": {
            "tab": "Vulnerabilities"
          }
        },
        "target": "[data-win=\"nessus\"] [data-scan]",
        "hints": [
          "اسم الفحص رابط في الجدول.",
          "التبويب الثاني في صفحة النتائج.",
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
        "result": "14 صفاً مرتبة بالخطورة: حرجتان في الأعلى، ثم متوسطتان، ثم معلومات Info."
      },
      {
        "id": "s8",
        "title": "صفحة الثغرة",
        "instruction": "افتح الثغرة الأولى: KB5099901: Windows 11 Version 24H2 Security Update (October 2026)، واقرأ Description وSolution.",
        "why": "الحل هنا رقم تحديث بعينه: KB5099901، نطبّقه في الدرس 4.",
        "expect": {
          "type": "event",
          "name": "nessus:vuln",
          "where": {
            "id": "V01"
          }
        },
        "target": "[data-win=\"nessus\"] [data-vuln=\"V01\"]",
        "hints": [
          "أول صف في الجدول (CRITICAL).",
          "اسمه يبدأ بـ KB5099901.",
          "اضغط اسم الثغرة KB5099901…"
        ],
        "demo": {
          "kind": "ui",
          "tool": "nessus",
          "action": "vuln",
          "arg": "V01"
        },
        "result": "الوصف يقول: تحديث أمني ناقص. والحل: Apply Cumulative Update KB5099901. هذا ما نفعله في الدرس 4."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "vulns",
        "kind": "table",
        "tool": "nessus",
        "table": "vulns",
        "state": "before",
        "title": "Vulnerabilities",
        "heading": "Sanabel - Baseline › Vulnerabilities (14)"
      },
      {
        "id": "hosts",
        "kind": "table",
        "tool": "nessus",
        "table": "hosts",
        "state": "before",
        "title": "Hosts",
        "heading": "Sanabel - Baseline › Hosts (5)"
      },
      {
        "id": "v01",
        "tool": "nessus",
        "cmd": "V01",
        "title": "صفحة V01",
        "heading": "Plugin 900101 (تدريبي)"
      },
      {
        "id": "v02",
        "tool": "nessus",
        "cmd": "V02",
        "title": "صفحة V02",
        "heading": "Plugin 900102 (تدريبي)"
      }
    ],
    "highlights": [
      {
        "src": "vulns",
        "row": "V01",
        "col": "Sev",
        "label": "Critical V01",
        "danger": true,
        "concept": "severity",
        "meaning": "CVSS 9.8: حرجة. تحديث أمني ناقص؛ أول ما نعالجه.",
        "core": true
      },
      {
        "src": "vulns",
        "row": "V01",
        "col": "Count",
        "label": "Count V01",
        "concept": "priority",
        "meaning": "على جهازين (ACC-PC1 وACC-PC2): لذلك تتقدم على V02 رغم أن درجة V02 أعلى.",
        "core": true
      },
      {
        "src": "vulns",
        "row": "V02",
        "col": "CVSS",
        "label": "CVSS V02",
        "danger": true,
        "concept": "severity",
        "meaning": "10.0: أعلى درجة. خدمة VNC من rhelper.exe لا تطلب كلمة مرور، على جهاز واحد.",
        "core": true
      },
      {
        "src": "vulns",
        "row": "V04",
        "col": "Name",
        "label": "Telnet",
        "concept": "port-vs-vuln",
        "meaning": "Telnet على الطابعة: إدارة بلا تشفير. علاجها من لوحة الطابعة أو مورّدها، فتُسجَّل «متبقية» في التقرير."
      },
      {
        "src": "vulns",
        "row": "I01",
        "col": "Sev",
        "label": "Info VNC",
        "concept": "severity",
        "meaning": "معلومة لا ثغرة؛ لكنها تكشف خدمة VNC غير متوقعة على ACC-PC1."
      },
      {
        "src": "hosts",
        "row": "192.168.50.21",
        "col": "Critical",
        "label": "Critical على .21",
        "danger": true,
        "concept": "priority",
        "meaning": "ACC-PC1 أكثر الأجهزة حاجة للعلاج: حرجتان ومتوسطة."
      },
      {
        "src": "hosts",
        "row": "192.168.50.10",
        "col": "Info",
        "label": "FILESRV",
        "concept": "port-vs-vuln",
        "meaning": "خادم الملفات بلا ثغرات (Info فقط) رغم أن 445 مفتوح عليه: الباب المفتوح ليس ثغرة بذاته."
      },
      {
        "src": "v01",
        "line": "Apply Cumulative",
        "match": "KB5099901",
        "label": "KB5099901",
        "concept": "cve",
        "meaning": "رقم التحديث الذي يحل المشكلة؛ هو نفسه الذي سنراه في Windows Update في الدرس 4.",
        "core": true
      },
      {
        "src": "v01",
        "line": "Current OS build",
        "match": "26100.6400",
        "label": "إصدار النظام",
        "concept": "credentialed",
        "meaning": "الفحص بصلاحيات قرأ رقم الإصدار المثبّت فعلاً (26100.6400) وقارنه بالمطلوب (26100.6584)."
      },
      {
        "src": "v02",
        "line": "does not require",
        "match": "does not require authentication",
        "label": "بلا مصادقة",
        "danger": true,
        "concept": "port-vs-vuln",
        "meaning": "أي جهاز في الشبكة يتصل بهذه الخدمة دون كلمة مرور. الحل في Solution: تعطيلها إن لم تكن لازمة، وتقييدها بالجدار الناري."
      }
    ],
    "table": [
      {
        "see": "Sev: CRITICAL / HIGH",
        "means": "عالجها أولاً، وابدأ بالأكثر أجهزةً (Count)."
      },
      {
        "see": "Sev: MEDIUM / LOW",
        "means": "تُجدول بعد الحرجة؛ بعضها يحتاج طرفاً آخر (مورّد)."
      },
      {
        "see": "Sev: INFO",
        "means": "معلومة لا ثغرة؛ لكنها قد تكشف خدمة غير متوقعة."
      },
      {
        "see": "Solution: Apply … KB…",
        "means": "الحل تحديث بعينه؛ رقمه يطابق Windows Update."
      },
      {
        "see": "Type: local",
        "means": "الإضافة احتاجت الدخول إلى الجهاز (فحص بصلاحيات)."
      }
    ],
    "ioc": [
      "V01 (Critical، جهازان): تحديث KB5099901 ناقص.",
      "V02 (Critical، ACC-PC1): VNC بلا مصادقة على 5900."
    ],
    "questions": [
      {
        "q": "كم ثغرة Critical؟",
        "type": "choice",
        "answer": "2",
        "why": "V01 وV02.",
        "options": [
          "2",
          "4",
          "14"
        ]
      },
      {
        "q": "ما رقم التحديث الذي يحلّ V01؟",
        "type": "choice",
        "answer": "KB5099901",
        "why": "من Solution: Apply Cumulative Update KB5099901.",
        "options": [
          "KB5099901",
          "KB2267602",
          "900101"
        ]
      },
      {
        "q": "ما ترتيب المعالجة الصحيح؟",
        "type": "choice",
        "options": [
          "V01 ← V02 ← V03 ← V04",
          "V02 ← V01 ← V04 ← V03",
          "V04 ← V03 ← V02 ← V01"
        ],
        "answer": "V01 ← V02 ← V03 ← V04",
        "why": "الخطورة أولاً، ثم عدد الأجهزة: V01 على جهازين قبل V02."
      },
      {
        "q": "أي ثغرة تمس أكبر عدد من الأجهزة؟",
        "type": "choice",
        "options": [
          "V01: التحديث KB5099901 الناقص",
          "V02: VNC بلا مصادقة",
          "V04: Telnet على الطابعة"
        ],
        "answer": "V01: التحديث KB5099901 الناقص",
        "why": "Count = 2.",
        "extra": true
      },
      {
        "q": "أي الأجهزة خالية من أي ثغرة غير Info؟",
        "type": "choice",
        "options": [
          "192.168.50.10 و192.168.50.1",
          "192.168.50.21 و192.168.50.22",
          "192.168.50.30 وحدها"
        ],
        "answer": "192.168.50.10 و192.168.50.1",
        "why": "خادم الملفات والراوتر: Info فقط.",
        "extra": true
      },
      {
        "extra": true,
        "q": "هل VNC Server Detection (Info) ثغرة؟",
        "type": "choice",
        "options": [
          "لا، معلومة؛ لكنها تكشف خدمة غير متوقعة",
          "نعم، حرجة",
          "نعم، متوسطة"
        ],
        "answer": "لا، معلومة؛ لكنها تكشف خدمة غير متوقعة",
        "why": "Info = 0 في CVSS."
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "في الكتاب ← اليوم: ماسحات الثغرات القديمة توقفت؛ Nessus Essentials مجاني للتعلّم ومحدود بـ 16 عنواناً IP، ويحل محل Nessus Home.",
      "Nessus يعمل في المتصفح على https://localhost:8834 بشهادة ذاتية التوقيع؛ يحذّر المتصفح منها أول مرة.",
      "أرقام الإضافات وCVE في المحاكاة تدريبية ولا تشير إلى ثغرات حقيقية.",
      "يعرض Nessus الحقيقي حقولاً عن توفّر أدوات الاستغلال؛ حذفناها عمداً: المدافع يرتّب بالخطورة وعدد الأجهزة."
    ],
    "officialSite": "https://www.tenable.com/products/nessus/nessus-essentials"
  },
  "guide": [
    "تنشئ فحص ثغرات لشبكة المكتب في Nessus.",
    "تشغّله وتقرأ قائمة الثغرات مرتبة بالخطورة.",
    "تفتح أخطر ثغرة وتقرأ وصفها وحلّها."
  ]
};
