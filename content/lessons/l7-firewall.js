/* Lesson l7-firewall — generated from docs/concepts.md (cards) and docs/outputs-spec.md (values); edit freely after generation. */
window.FSIM = window.FSIM || {}; window.FSIM.lessons = window.FSIM.lessons || {};
window.FSIM.lessons["l7-firewall"] = {
  "id": "l7-firewall",
  "seq": 7,
  "axis": 3,
  "axisTitle": "المحور ٣: حصّن",
  "units": [
    11,
    12,
    14
  ],
  "tools": [
    "Windows Defender Firewall",
    "Wireshark"
  ],
  "minutes": 20,
  "title": "الجدار الناري، ولماذا Telnet خطر: Firewall وWireshark",
  "caseBranch": {
    "question": "كيف نمنع الوصول إلى الأبواب التي لا يحتاجها أحد؟",
    "known": "أُزيل rhelper، لكن قاعدة الجدار التي تسمح بـ 5900 باقية، وRDP مفتوح لكل الشبكة، والطابعة تُدار عبر Telnet.",
    "now": "نضيف قاعدة حظر لـ 5900، ونعطّل القاعدة القديمة، ونقصر RDP على جهاز المدير؛ ثم نرى في Wireshark لماذا Telnet خطر.",
    "finding": "قاعدة Block VNC 5900 مضافة، وRemote Helper معطّلة، وRDP مقصور على 192.168.50.22 (F6 «متبقية»: يلزم تفعيل NLA). وWireshark أظهر كلمة مرور Telnet مقروءة، فـ F7 يحتاج تعطيل Telnet في الطابعة."
  },
  "objectives": [
    "إنشاء قاعدة حظر واردة لمنفذ.",
    "تعطيل قاعدة قديمة وتقييد نطاق قاعدة مطلوبة.",
    "رؤية الفرق بين النص المكشوف (Telnet) والمشفّر (HTTPS)."
  ],
  "explain": {
    "intro": "التشبيه الجامع: حارس أمن عند مدخل المبنى معه قائمة: من يدخل ومن يُمنع.",
    "figure": "gate",
    "whatNext": "ستفتح الجدار الناري على ACC-PC1، وتضيف قاعدة حظر، وتعطّل قاعدة قديمة، وتقيّد قاعدتي RDP؛ ثم تفتح التقاط Wireshark لجلسة Telnet مع الطابعة.",
    "cards": [
      {
        "id": "firewall",
        "ar": "الجدار الناري",
        "en": "Firewall",
        "analogy": "حارس أمن عند مدخل المبنى معه قائمة: من يدخل ومن يُمنع.",
        "meaning": "برنامج يقرر لكل اتصال: يُسمح أم يُحظر، حسب قواعد (منفذ، برنامج، عنوان، اتجاه).",
        "inTool": [
          "Windows Defender Firewall is on."
        ],
        "forDefender": "حتى لو بقيت خدمة تعمل، يمكن منع الوصول إليها من غير المسموح لهم.",
        "fromFrame": "الجدار مفعّل على ACC-PC1 لكن فيه قاعدة سماح قديمة لـ 5900.",
        "mistake": "الظن أن الجدار الناري يغني عن الترقيع ومضاد الفيروسات؛ هو طبقة واحدة.",
        "quiz": {
          "q": "هل الجدار الناري يزيل برنامجاً خبيثاً؟",
          "type": "reveal",
          "answer": "لا، يتحكم في الاتصالات فقط."
        }
      },
      {
        "id": "inbound-outbound",
        "ar": "الوارد والصادر",
        "en": "Inbound / Outbound",
        "analogy": "من يدخل المبنى ومن يخرج منه.",
        "meaning": "وارد = اتصالات تبدأ من الخارج نحو الجهاز • صادر = اتصالات يبدؤها الجهاز. الإعداد الافتراضي: الوارد غير المطابق لقاعدة يُحظر، والصادر يُسمح.",
        "inTool": [
          "Inbound Rules وOutbound Rules",
          "وInbound connections that do not match a rule are blocked."
        ],
        "forDefender": "المنفذ المفتوح يحتاج قاعدة سماح واردة؛ إزالتها أو تعطيلها يغلقه من الخارج.",
        "fromFrame": "قاعدة واردة Remote Helper تسمح بـ TCP 5900 من Any.",
        "mistake": "إضافة القاعدة في Outbound بدل Inbound.",
        "quiz": {
          "q": "لمنع الأجهزة الأخرى من الوصول إلى منفذ على جهازك، أي نوع قواعد؟",
          "type": "reveal",
          "answer": "وارد."
        }
      },
      {
        "id": "scope-least-privilege",
        "ar": "تقييد النطاق وأقل صلاحية",
        "en": "Scope / Least privilege",
        "analogy": "باب الخزنة يُفتح لأمين الصندوق فقط، لا لكل الموظفين.",
        "meaning": "بدل الحظر الكامل لخدمة مطلوبة، نسمح بها لعناوين محددة فقط. هذا مبدأ أقل صلاحية: كل جهة تحصل على أقل ما تحتاجه.",
        "inTool": [
          "Properties ← Scope ← Remote IP address ← These IP addresses: ← Add...."
        ],
        "forDefender": "يحافظ على العمل ويقلّل سطح الهجوم.",
        "fromFrame": "RDP 3389 مطلوب لمدير المكتب فقط ← يُقيَّد على جهازه (القيمة في outputs-spec).",
        "mistake": "حظر خدمة يحتاجها العمل ثم يعيد العميل فتحها للجميع.",
        "quiz": {
          "q": "خدمة يحتاجها جهاز واحد فقط؛ ما الأفضل: حظرها أم تقييد نطاقها؟",
          "type": "reveal",
          "answer": "تقييد النطاق."
        }
      },
      {
        "id": "cleartext-encrypted-telnet-htt",
        "ar": "النص المكشوف مقابل المشفّر",
        "en": "Cleartext / Encrypted — Telnet / HTTPS",
        "analogy": "بطاقة بريدية يقرؤها كل من يمسكها في الطريق، مقابل رسالة في ظرف مختوم.",
        "meaning": "بعض البروتوكولات ترسل البيانات كما هي (Telnet وHTTP)، فيقرؤها أي جهاز على مسارها. وبعضها يشفّرها قبل الإرسال (SSH وHTTPS)، فلا يرى من يلتقطها إلا بايتات بلا معنى.",
        "inTool": [
          "في Wireshark حزمة Telnet تُظهر طبقة Telnet وData: … بنص مقروء. أما حزمة HTTPS فتُظهر Transport Layer Security وEncrypted Application Data."
        ],
        "forDefender": "هذا هو الدليل الذي يُقنع العميل بتعطيل Telnet، لا مجرد سطر Medium في Nessus.",
        "fromFrame": "في printer-admin.pcapng يظهر اسم حساب الاختبار audit-test وكلمة مروره مقروءين في جلسة Telnet، ولا يظهر منهما شيء في جلسة HTTPS إلى الطابعة نفسها.",
        "mistake": "الظن أن كلمة المرور «محمية» لأنها لا تظهر على الشاشة أثناء الكتابة.",
        "quiz": {
          "q": "أي البروتوكولين يجب أن تُدار به الطابعة: Telnet أم HTTPS؟",
          "type": "reveal",
          "answer": "HTTPS."
        }
      },
      {
        "id": "rule-program-port-action-profi",
        "ar": "القاعدة وأجزاؤها",
        "en": "Rule: Program / Port / Action / Profile",
        "analogy": "سطر في قائمة الحارس: «من ـ إلى أي باب ـ يُسمح/يُمنع ـ في أي وقت».",
        "meaning": "القاعدة تحدد ماذا (برنامج أو منفذ وبروتوكول) والإجراء (Allow/Block) والملف الشخصي (Domain/Private/Public) والنطاق (أي العناوين).",
        "inTool": [
          "معالج New Inbound Rule Wizard: Rule Type ← Protocol and Ports ← Action ← Profile ← Name."
        ],
        "forDefender": "القاعدة الدقيقة تغلق ما يجب دون تعطيل العمل.",
        "fromFrame": "قاعدة Block VNC 5900 (Port، TCP، 5900، Block the connection، الملفات الثلاثة).",
        "mistake": "قاعدة واسعة جداً (All local ports) تقطع خدمات مطلوبة.",
        "quiz": {
          "q": "في أي خطوة من المعالج تختار Block the connection؟",
          "type": "reveal",
          "answer": "Action."
        },
        "extra": true
      },
      {
        "id": "domain-private-public",
        "ar": "الملفات الشخصية للشبكة",
        "en": "Domain / Private / Public",
        "analogy": "قواعد البيت تختلف عن قواعد المقهى.",
        "meaning": "Windows يطبّق مجموعة قواعد حسب نوع الشبكة: Domain شبكة مؤسسة بنطاق، Private شبكة موثوقة (البيت/المكتب)، Public شبكة عامة (الأشد).",
        "inTool": [
          "Private Profile / Public Profile is Active",
          "عمود Profile في القواعد."
        ],
        "forDefender": "قاعدة تسمح على Public تعرّض الجهاز في أي مقهى.",
        "fromFrame": "حاسوب المستشار المحمول يعمل بملف Public عند العمل خارج المكتب.",
        "mistake": "إنشاء قاعدة على ملف واحد والظن أنها تعمل دائماً.",
        "quiz": {
          "q": "أي ملف يجب أن يكون الأشد؟",
          "type": "reveal",
          "answer": "Public."
        },
        "extra": true
      },
      {
        "id": "block-wins",
        "ar": "أسبقية القواعد",
        "en": "Block wins",
        "analogy": "إذا قال المدير «ممنوع» وقال المشرف «مسموح»، يُطبَّق المنع.",
        "meaning": "إذا تطابقت قاعدة سماح وقاعدة حظر مع الاتصال نفسه، يغلب الحظر (إلا إذا فُعّل Override في حالات خاصة).",
        "inTool": [
          "دائرة حمراء ⊘ للحظر مقابل خضراء ✓ للسماح."
        ],
        "forDefender": "قاعدة حظر واحدة دقيقة تكفي حتى لو بقيت قاعدة سماح قديمة؛ لكن الأنظف تعطيل القديمة أيضاً.",
        "fromFrame": "بعد إضافة Block VNC 5900 يصبح المنفذ filtered في Zenmap رغم بقاء Remote Helper.",
        "mistake": "حذف كل القواعد والبدء من الصفر.",
        "quiz": {
          "q": "قاعدة تسمح بـ 5900 وأخرى تحظره؛ ما النتيجة؟",
          "type": "reveal",
          "answer": "محظور."
        },
        "extra": true
      },
      {
        "id": "display-filter-follow-tcp-stre",
        "ar": "فلتر العرض ومتابعة المحادثة",
        "en": "Display Filter / Follow TCP Stream",
        "analogy": "تبحث في سجل المكالمات عن رقم واحد، ثم تستمع إلى تلك المكالمة كاملة.",
        "meaning": "فلتر العرض يُخفي كل الحزم إلا ما يطابق شرطاً، مثل telnet، ولا يحذف شيئاً. أما متابعة المحادثة فتجمع حزم اتصال واحد وتعرضها نصاً متصلاً: ما أرسله العميل بالأحمر، وما أرسله الخادم بالأزرق.",
        "inTool": [
          "شريط الفلتر يصير أخضر للفلتر الصحيح وأحمر للخاطئ. ثم Analyze → Follow → TCP Stream."
        ],
        "forDefender": "في ملف فيه مئات الحزم، الفلتر يوصلك إلى الدليل في ثوانٍ.",
        "fromFrame": "tcp.port == 23 يُظهر جلسة Telnet وحدها، وFollow TCP Stream يعرضها نصاً كاملاً.",
        "mistake": "كتابة port 23 (صيغة فلتر الالتقاط) في شريط فلتر العرض، فيتحول الشريط إلى الأحمر.",
        "quiz": {
          "q": "هل يحذف فلتر العرض الحزم المخفية من الملف؟",
          "type": "reveal",
          "answer": "لا، يخفيها فقط."
        },
        "extra": true
      },
      {
        "id": "nla",
        "ar": "مصادقة مستوى الشبكة",
        "en": "NLA",
        "analogy": "الحارس يطلب البطاقة قبل أن يفتح باب المبنى، لا بعد أن تصل إلى مكتب المدير.",
        "meaning": "NLA تُلزم من يتصل بسطح المكتب البعيد بإثبات هويته قبل أن يفتح له Windows جلسة كاملة. هذا يقلّل ما يتعرض له الجهاز من الشبكة.",
        "inTool": [
          "خارج أدوات الموقع. المسار في Windows: Settings → System → Remote Desktop، ثم الخيار Require devices to use Network Level Authentication to connect. ⚠️ (الصياغة الحرفية تُتحقق.)"
        ],
        "forDefender": "تقييد النطاق في الجدار الناري يخفّف الخطر، لكن NLA يعالجه.",
        "fromFrame": "البند F6 في التقرير يبقى «متبقياً» مع توصية بتفعيل NLA.",
        "mistake": "إغلاق البند لأن Nessus لم يعد يراه بعد تقييد النطاق.",
        "quiz": {
          "q": "بعد تقييد 3389 على جهاز المدير، هل اختفت حاجة NLA؟",
          "type": "reveal",
          "answer": "لا. الخطر خُفّف ولم يُعالج."
        },
        "extra": true
      }
    ]
  },
  "practice": {
    "tool": "firewall",
    "state": "before",
    "scenario": "أنت على ACC-PC1. أغلق 5900 بقاعدة حظر، وعطّل القاعدة القديمة، واقصر RDP على جهاز المدير 192.168.50.22. ثم افتح التقاط جلستك مع الطابعة في Wireshark.",
    "launchers": [
      {
        "tool": "firewall",
        "label": "Windows Defender Firewall",
        "auto": true
      },
      {
        "tool": "wireshark",
        "label": "Wireshark"
      }
    ],
    "freeNote": "جرّب دون تلميحات: قواعد الوارد والصادر، وفلاتر Wireshark (جرّب port 23 لترى الشريط الأحمر).",
    "steps": [
      {
        "id": "s1",
        "title": "قواعد الوارد",
        "instruction": "اضغط Inbound Rules في الشجرة اليسرى.",
        "why": "الأبواب التي يدخل منها الآخرون إلى هذا الجهاز.",
        "expect": {
          "type": "event",
          "name": "fw:node",
          "where": {
            "node": "Inbound Rules"
          }
        },
        "target": "[data-win=\"firewall\"] [data-node=\"Inbound Rules\"]",
        "hints": [
          "الشجرة على اليسار.",
          "أول بند تحت الجذر.",
          "اضغط Inbound Rules."
        ],
        "demo": {
          "kind": "ui",
          "tool": "firewall",
          "action": "select",
          "arg": "Inbound Rules"
        },
        "result": "قائمة قواعد الوارد: كل قاعدة تسمح (✓) أو تحظر (⊘) نوعاً من الاتصالات."
      },
      {
        "id": "s2",
        "title": "قاعدة حظر 5900",
        "instruction": "New Rule... (في لوحة Actions)، ثم: Port ← TCP ← Specific local ports: 5900 ← Block the connection ← الملفات الثلاثة ← Name: Block VNC 5900 ← Finish.",
        "typeText": "5900  •  Block the connection  •  Block VNC 5900",
        "typeLabel": "أدخل",
        "why": "طبقة ثانية: لو عاد أي برنامج على 5900 لا يصل إليه أحد.",
        "expect": {
          "type": "event",
          "name": "fw:rule",
          "where": {
            "proto": "TCP",
            "port": "5900",
            "action": "Block",
            "profiles": "All"
          }
        },
        "onMismatch": "القاعدة المطلوبة: TCP، المنفذ 5900 فقط، Block، والملفات الثلاثة.",
        "target": "[data-win=\"firewall\"] .mmc-actions",
        "hints": [
          "لوحة Actions على اليمين.",
          "New Rule... ثم اتبع المعالج.",
          "Port • TCP • 5900 • Block the connection • Domain/Private/Public • Block VNC 5900"
        ],
        "demo": {
          "kind": "ui",
          "tool": "firewall",
          "action": "blockRule"
        },
        "result": "قاعدة Block VNC 5900 في أعلى القائمة بدائرة حمراء: لا أحد يصل إلى 5900."
      },
      {
        "id": "s3",
        "title": "عطّل القاعدة القديمة",
        "instruction": "اختر قاعدة Remote Helper، ثم Disable Rule في لوحة Actions.",
        "why": "قاعدة سماح لبرنامج أُزيل؛ نعطّلها بدل حذفها.",
        "expect": {
          "type": "event",
          "name": "fw:toggle",
          "where": {
            "name": "Remote Helper",
            "enabled": false
          }
        },
        "target": "[data-win=\"firewall\"] .mmc-center",
        "hints": [
          "قاعدة Remote Helper في الجدول.",
          "اخترها، ثم انظر إلى لوحة Actions.",
          "Remote Helper ← Disable Rule."
        ],
        "demo": {
          "kind": "ui",
          "tool": "firewall",
          "action": "disable",
          "arg": "Remote Helper"
        },
        "result": "Remote Helper معطّلة (Enabled = No): قاعدة السماح القديمة لا تعمل."
      },
      {
        "id": "s4",
        "title": "قيّد RDP (TCP)",
        "instruction": "افتح Properties لقاعدة Remote Desktop - User Mode (TCP-In) ← تبويب Scope ← Remote IP address: These IP addresses ← اكتب العنوان ← Add... ← OK.",
        "typeText": "192.168.50.22",
        "typeLabel": "العنوان",
        "why": "المدير وحده يحتاج سطح المكتب البعيد.",
        "expect": {
          "type": "event",
          "name": "fw:scope",
          "where": {
            "name": "Remote Desktop - User Mode (TCP-In)",
            "remote": "192.168.50.22"
          }
        },
        "target": "[data-win=\"firewall\"] .mmc-center",
        "hints": [
          "نقر مزدوج على القاعدة يفتح Properties.",
          "تبويب Scope ثم These IP addresses.",
          "192.168.50.22 ← Add... ← OK"
        ],
        "demo": {
          "kind": "ui",
          "tool": "firewall",
          "action": "scope",
          "arg": [
            "Remote Desktop - User Mode (TCP-In)",
            "192.168.50.22"
          ]
        },
        "result": "Remote Address صار 192.168.50.22: جهاز المدير وحده يصل إلى سطح المكتب البعيد."
      },
      {
        "id": "s5",
        "title": "قيّد RDP (UDP)",
        "instruction": "كرر الخطوة نفسها لقاعدة Remote Desktop - User Mode (UDP-In).",
        "typeText": "192.168.50.22",
        "typeLabel": "العنوان",
        "why": "RDP يستخدم TCP وUDP على 3389.",
        "expect": {
          "type": "event",
          "name": "fw:scope",
          "where": {
            "name": "Remote Desktop - User Mode (UDP-In)",
            "remote": "192.168.50.22"
          }
        },
        "target": "[data-win=\"firewall\"] .mmc-center",
        "hints": [
          "القاعدة التي تحت TCP-In.",
          "Properties ← Scope.",
          "192.168.50.22 ← Add... ← OK"
        ],
        "demo": {
          "kind": "ui",
          "tool": "firewall",
          "action": "scope",
          "arg": [
            "Remote Desktop - User Mode (UDP-In)",
            "192.168.50.22"
          ]
        },
        "result": "قاعدة UDP مقيّدة أيضاً: RDP كله مقصور على جهاز المدير."
      },
      {
        "id": "s6",
        "title": "Wireshark: حزم Telnet",
        "instruction": "اضغط زر Wireshark فوق النافذة، ثم اكتب في شريط الفلتر الأمر واضغط Enter.",
        "typeText": "telnet",
        "why": "يُظهر جلسة Telnet وحدها من بين 112 حزمة.",
        "expect": {
          "type": "event",
          "name": "wireshark:filter",
          "where": {
            "filter": "telnet",
            "valid": true
          }
        },
        "target": "[data-launch=\"wireshark\"]",
        "hints": [
          "زر Wireshark في شريط التطبيقات.",
          "شريط الفلتر أعلى قائمة الحزم.",
          "telnet ثم Enter"
        ],
        "demo": [
          {
            "kind": "launch",
            "tool": "wireshark"
          },
          {
            "kind": "ui",
            "tool": "wireshark",
            "action": "setFilter",
            "arg": "telnet"
          }
        ],
        "result": "الشريط أخضر، وبقيت 34 حزمة Telnet من 112."
      },
      {
        "id": "s7",
        "title": "تابع المحادثة",
        "instruction": "اختر أي حزمة TELNET، ثم Analyze ← Follow ▸ TCP Stream (أو زر الفأرة الأيمن على الحزمة).",
        "why": "يعرض الجلسة نصاً متصلاً: ما أرسلتَه بالأحمر، وما أرسلته الطابعة بالأزرق.",
        "expect": {
          "type": "event",
          "name": "wireshark:follow",
          "where": {
            "stream": 0
          }
        },
        "target": "[data-win=\"wireshark\"] .menubar",
        "hints": [
          "اضغط صف حزمة TELNET أولاً.",
          "قائمة Analyze.",
          "Analyze ← Follow ▸ TCP Stream."
        ],
        "demo": [
          {
            "kind": "ui",
            "tool": "wireshark",
            "action": "select",
            "arg": 6
          },
          {
            "kind": "ui",
            "tool": "wireshark",
            "action": "follow"
          }
        ],
        "result": "الجلسة نص متصل: اسم المستخدم وكلمة المرور Test-Only-2026 مقروءان. لهذا نعطّل Telnet."
      }
    ]
  },
  "interpret": {
    "sources": [
      {
        "id": "fw1",
        "kind": "table",
        "tool": "firewall",
        "state": "before",
        "title": "القواعد (قبل)",
        "heading": "Inbound Rules [قبل]"
      },
      {
        "id": "fw2",
        "kind": "table",
        "tool": "firewall",
        "state": "after",
        "title": "القواعد (بعد)",
        "heading": "Inbound Rules [بعد]"
      },
      {
        "id": "s0",
        "tool": "wireshark",
        "cmd": "stream0",
        "title": "جلسة Telnet",
        "heading": "Follow TCP Stream (tcp.stream eq 0) — Telnet"
      },
      {
        "id": "s1",
        "tool": "wireshark",
        "cmd": "stream1",
        "title": "جلسة HTTPS",
        "heading": "Follow TCP Stream (tcp.stream eq 1) — HTTPS"
      },
      {
        "id": "flt",
        "tool": "wireshark",
        "cmd": "filters",
        "title": "الفلاتر",
        "heading": "printer-admin.pcapng — Packets: 112"
      }
    ],
    "highlights": [
      {
        "src": "fw1",
        "row": "Remote Helper",
        "col": "Remote Address",
        "label": "Any قبل",
        "danger": true,
        "concept": "inbound-outbound",
        "meaning": "قاعدة سماح لـ 5900 من أي عنوان: باب مفتوح لكل الشبكة.",
        "core": true
      },
      {
        "src": "fw1",
        "row": "Remote Desktop - User Mode (TCP-In)",
        "col": "Remote Address",
        "label": "RDP Any",
        "concept": "scope-least-privilege",
        "meaning": "سطح المكتب البعيد مفتوح لكل جهاز، والمدير وحده يحتاجه."
      },
      {
        "src": "fw2",
        "row": "Block VNC 5900",
        "col": "Action",
        "label": "Block",
        "concept": "block-wins",
        "meaning": "قاعدة الحظر تغلب قاعدة السماح القديمة إن اجتمعتا."
      },
      {
        "src": "fw2",
        "row": "Remote Desktop - User Mode (TCP-In)",
        "col": "Remote Address",
        "label": "RDP مقيّد",
        "concept": "scope-least-privilege",
        "meaning": "192.168.50.22 فقط: أقل صلاحية تكفي العمل. يبقى تفعيل NLA (F6 «متبقية»).",
        "core": true
      },
      {
        "src": "s0",
        "line": "login",
        "match": "aauuddiitt--tteesstt",
        "label": "اسم المستخدم",
        "concept": "display-filter-follow-tcp-stre",
        "meaning": "كل حرف مرتين: أرسلتَه (أحمر) ثم أعادته الطابعة صدىً (أزرق). اسم الحساب audit-test مقروء."
      },
      {
        "src": "s0",
        "line": "Password",
        "match": "Test-Only-2026",
        "label": "كلمة المرور مكشوفة",
        "danger": true,
        "concept": "cleartext-encrypted-telnet-htt",
        "meaning": "كلمة مرور حساب الاختبار مقروءة كاملة: أي جهاز في الطريق يراها. لذلك يُعطَّل Telnet.",
        "core": true
      },
      {
        "src": "s1",
        "line": "Encrypted Application Data",
        "match": "Encrypted Application Data",
        "label": "مشفّر",
        "concept": "cleartext-encrypted-telnet-htt",
        "meaning": "الجلسة نفسها عبر HTTPS: بايتات بلا معنى.",
        "core": true
      },
      {
        "src": "s1",
        "line": "SNI",
        "match": "SNI=printer.sanabel.example",
        "label": "SNI",
        "concept": "cleartext-encrypted-telnet-htt",
        "meaning": "اسم الوجهة يبقى مقروءاً حتى مع HTTPS: التشفير يحمي المحتوى لا الوجهة."
      },
      {
        "src": "flt",
        "line": "http ",
        "match": "0 (0.0%)",
        "label": "http = 0",
        "concept": "display-filter-follow-tcp-stre",
        "meaning": "لا HTTP مقروءاً: HTTP داخل TLS مشفّر فلا يتعرف عليه Wireshark."
      }
    ],
    "table": [
      {
        "see": "⊘ قاعدة Block مفعّلة",
        "means": "الاتصال المطابق يُمنع، ولو وُجدت قاعدة سماح."
      },
      {
        "see": "Remote Address: Any",
        "means": "القاعدة تقبل أي جهاز؛ قيّدها إن أمكن."
      },
      {
        "see": "شريط فلتر أخضر / أحمر",
        "means": "فلتر صحيح / خاطئ (مثل port 23 وهو صيغة فلتر التقاط)."
      },
      {
        "see": "نص مقروء في Follow TCP Stream",
        "means": "البروتوكول بلا تشفير (Telnet أو HTTP)."
      },
      {
        "see": "Encrypted Application Data",
        "means": "المحتوى مشفّر (TLS/HTTPS)."
      }
    ],
    "ioc": [
      "Telnet على الطابعة 192.168.50.30: كلمة المرور تمر نصاً مكشوفاً."
    ],
    "questions": [
      {
        "q": "بقيت Remote Helper (Allow) مع Block VNC 5900؛ أيهما يُطبَّق؟",
        "type": "choice",
        "options": [
          "الحظر",
          "السماح",
          "الأحدث"
        ],
        "answer": "الحظر",
        "why": "الحظر الصريح يغلب السماح."
      },
      {
        "q": "لماذا لا نحظر 3389 كلياً؟",
        "type": "choice",
        "options": [
          "المدير يحتاجه، فنقيّده على 192.168.50.22",
          "لأن Windows لا يسمح",
          "لأنه آمن دائماً"
        ],
        "answer": "المدير يحتاجه، فنقيّده على 192.168.50.22",
        "why": "أقل صلاحية: بدل الحظر الكامل."
      },
      {
        "q": "ما الذي بقي مكشوفاً في جلسة HTTPS؟",
        "type": "choice",
        "options": [
          "اسم الوجهة printer.sanabel.example",
          "كلمة المرور",
          "اسم المستخدم"
        ],
        "answer": "اسم الوجهة printer.sanabel.example",
        "why": "في Client Hello (SNI)."
      },
      {
        "q": "ما الملف الشخصي النشط للشبكة؟",
        "type": "choice",
        "options": [
          "Private",
          "Public",
          "Domain"
        ],
        "answer": "Private",
        "why": "Private Profile is Active.",
        "extra": true
      },
      {
        "q": "كم حزمة Telnet في الملف؟",
        "type": "choice",
        "answer": "34",
        "why": "بالفلتر telnet.",
        "options": [
          "34",
          "46",
          "112"
        ],
        "extra": true
      }
    ]
  },
  "realWorld": {
    "versionNotes": [
      "في الكتاب ← اليوم: جدران الحماية الشخصية القديمة (مثل ZoneAlarm) ← Windows Defender Firewall with Advanced Security (wf.msc).",
      "Wireshark مجاني من wireshark.org؛ في المحاكاة يُفتح ملف التقاط جاهز بدل الالتقاط الحي."
    ],
    "officialSite": "https://learn.microsoft.com/windows/security/operating-system-security/network-security/windows-firewall/"
  },
  "guide": [
    "تضيف قاعدة جدار ناري تحظر المنفذ 5900.",
    "تقصر سطح المكتب البعيد على جهاز المدير وحده.",
    "ترى في Wireshark لماذا Telnet خطر: كلمة المرور مقروءة."
  ]
};
