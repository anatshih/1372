/* The consultant's mission as told to the student (home page, mission.html, lesson boxes). Light frame
   (CLAUDE.md §2): two sentences, no characters or events. Facts only from docs/outputs-spec.md §ب and §ل.
   Text edited by the instructor without touching code. */
window.FSIM = window.FSIM || {}; window.FSIM.data = window.FSIM.data || {};
window.FSIM.data.mission = {
  title: "مهمتك",
  intro: [
    "مكتب صغير وهمي اسمه «مكتب السنابل للمحاسبة» فيه أربعة أجهزة وطابعة. طلب منك أن تكتشف مشكلات الأمان في شبكته وتصلحها، ثم تقرأ نموذج تقرير يفسّر النتائج. هذه حالة تدريبية وليست مهمة للتسليم."
  ],
  promise: "كل درس خطوة واحدة من هذه المهمة، ببرنامج حقيقي يستخدمه المدافعون اليوم.",
  axes: [
    { n: 1, key: "assess", title: "١. قيّم", question: "ما الأجهزة، وما الأبواب المفتوحة، وما خطورة كل مشكلة؟" },
    { n: 2, key: "remediate", title: "٢. عالج", question: "نزيل سبب كل مشكلة." },
    { n: 3, key: "harden", title: "٣. حصّن", question: "نمنع عودة المشكلات." },
    { n: 4, key: "verify", title: "٤. تحقّق", question: "نثبت أن العلاج نجح، ونكتب التقرير." }
  ],
  /* lessons of the later phases, listed on the home page as "coming" (titles from CLAUDE.md §3) */
  upcoming: [],
  report: {
    summary: "قيّمنا خمسة أجهزة في شبكة المكتب بين 11 و15 أكتوبر 2026. وجدنا 7 مشكلات، منها 3 حرجة. عولجت 5 وأُثبت إغلاقها بإعادة الفحص، وبقيت مشكلتان خُفّف أثر إحداهما وتحتاجان إجراءً من المكتب أو مورّد الطابعة. نوصي بإعادة التقييم بعد 3 أشهر.",
    scope: [["الجهة", "مكتب السنابل للمحاسبة (وهمي) — sanabel.example"], ["الشبكة", "192.168.50.0/24 (خمسة أجهزة: GW، FILESRV، ACC-PC1، ACC-PC2، PRINTER)"], ["المدة", "2026-10-11 إلى 2026-10-15"], ["الأدوات", "netstat، Task Manager، Zenmap، Nessus Essentials، Windows Update، Microsoft Defender، Autoruns، Windows Defender Firewall، Wireshark، Local Security Policy، Event Viewer، KeePassXC، 7-Zip، cipher"]],
    evidence: { F1: "Update history: KB5099901 Successfully installed on 10/13/2026؛ إعادة الفحص: لا V01.", F2: "Autoruns: حُذف RemoteHelper و\RemoteHelperUpdate؛ Zenmap: اختفى 5900.", F3: "Protection history: Threat quarantined (Trojan:Win32/FakeInv.A).", F4: "secpol: الطول 14، القفل بعد 5؛ Event Viewer: 4740؛ خزنة KeePassXC.", F5: "salaries-2026.7z (AES-256 مع تشفير الأسماء)، والأصل محذوف، وcipher /w.", F6: "RDP مقيّد على 192.168.50.22؛ يبقى تفعيل NLA.", F7: "Wireshark: كلمة مرور Telnet مقروءة؛ يحتاج تعطيل Telnet في الطابعة." },
    recommendations: ["تفعيل التحديث التلقائي وتحديد Active hours.", "إظهار امتدادات الملفات وتدريب الموظفين على مرفقات البريد.", "تفعيل NLA لسطح المكتب البعيد.", "تعطيل Telnet في الطابعة (أو تحديث برنامجها الثابت عبر المورّد).", "تشفير أقراص الأجهزة بـ BitLocker.", "التحقق متعدد العوامل (MFA) للبريد.", "نسخ احتياطي 3-2-1 بنسخة غير متصلة.", "إعادة التقييم بعد 3 أشهر (يناير 2027)."],
    intro: "تبدأ المشكلة «مفتوحة». بعد درس المعالجة تصبح «تمت المعالجة — بانتظار التحقق»، ولا تصبح «مغلقة» إلا بعد إعادة الفحص في الدرس 10. «متبقية» تعني أن إجراءً إضافياً ما زال مطلوباً.",
    labels: { open: "مفتوحة", closed: "مغلقة", residual: "متبقية" }
  },
  /* Unit 13 timeline (from the instructor's Unit 13 slides), shown on the home page under "اعرف أكثر" */
  timeline: [
    ["1878", "شباب يعملون في شركة هاتف أمريكية يبدّلون الخطوط تسلية، فتستبدلهم الشركة: العبث بالنظم أقدم من الحاسوب نفسه."],
    ["1969", "في عصر الحاسوب المركزي يولد نظام يونكس، وهو أصل كثير من أنظمة اليوم."],
    ["1981", "الحاسوب الشخصي يصل إلى الجميع، وتظهر مجموعات تتبادل الأدوات والمعرفة."],
    ["1986", "أول قانون أمريكي للاحتيال الحاسوبي (CFAA): الاختراق صار جريمة يعاقب عليها القانون."],
    ["1988", "دودة موريس تبطئ آلاف الأجهزة، فتتأسس أولى فرق الاستجابة للحوادث (CERT)."],
    ["1999–2000", "دودتا ميليسا وILOVEYOU تنتشران عبر البريد، وهجمات حجب الخدمة تضرب مواقع كبرى."],
    ["2010", "ستكسنت: برمجية خبيثة تستهدف أنظمة تحكم صناعية."],
    ["2017", "WannaCry: برنامج فدية انتشر عبر ثغرة في مشاركة الملفات (المنفذ 445) كان لها تحديث منشور قبل الهجوم؛ أصاب الأجهزة التي لم تُحدَّث."],
    ["اليوم", "الأمن مهنة: اختبار الاختراق، وبرامج مكافآت الثغرات، ومراكز عمليات الأمن (SOC)، وفرق الاستجابة للحوادث."]
  ]
};
