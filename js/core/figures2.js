/* FSIM.core.figures (lessons 4–9) — interactive diagrams described in docs/concepts.md. Plain DOM, no libraries. */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, F = FSIM.core.figures;
  function frame(title, sub, kids) { return h("div.figure", h("h3", { text: "الرسم التفاعلي: " + title }), sub ? h("p.muted", { text: sub }) : null, kids); }
  function choices(list, onPick) {
    var row = h("div.fig-controls");
    list.forEach(function (c) { var b = h("button.btn", { type: "button", "data-fig": c[0], text: c[1] }); b.addEventListener("click", function () { Array.prototype.forEach.call(row.children, function (x) { x.setAttribute("aria-pressed", String(x === b)); }); onPick(c[0]); }); row.appendChild(b); });
    return row;
  }

  /* lesson 4: the exposure window between the patch and its installation */
  F.exposure = function (host) {
    var out = h("div.fig-explain", { "aria-live": "polite" });
    var bar = h("div.fig-timeline"), gap = h("span.fig-gap");
    bar.appendChild(h("span.fig-point", { text: "إعلان الثغرة وصدور الترقيعة: 10/13" })); bar.appendChild(gap); bar.appendChild(h("span.fig-point.is-end", { text: "التثبيت" }));
    var range = h("input#fig-days", { type: "range", min: "0", max: "120", value: "95", "aria-label": "أيام قبل التثبيت" });
    function upd() {
      var d = +range.value; gap.style.inlineSize = Math.max(4, d / 120 * 70) + "%";
      out.textContent = d === 0 ? "ثبّتّ التحديث يوم صدوره: لا نافذة تعرّض تقريباً." : "نافذة التعرّض: " + d + " يوماً يبقى فيها الجهاز مكشوفاً لثغرة لها حل جاهز. (ACC-PC1 لم يتحقق من التحديثات منذ 7/2/2026.)";
    }
    range.addEventListener("input", upd); upd();
    host.appendChild(frame("نافذة التعرّض", "اسحب المؤشر: كلما تأخر التثبيت طالت المدة الحمراء.", [h("label", { "for": "fig-days", text: "أيام قبل التثبيت:" }), range, bar, out]));
  };

  /* lesson 5: quarantine / remove / allow and their consequences */
  F.quarantine = function (host) {
    var out = h("div.fig-explain", { "aria-live": "polite", text: "ملف مشتبه به عند الحارس (الحماية الفورية). ماذا تفعل به؟" });
    var info = { Quarantine: "الحجر: يُنقل الملف إلى مكان معزول لا يعمل فيه، ويمكن استرجاعه إن تبيّن أنه سليم. الخيار الآمن أولاً.", Remove: "الإزالة: يُحذف الملف. نهائي، فاستخدمه حين تتأكد.", Allow: "السماح: يبقى الملف يعمل ويتوقف التنبيه. خطر: لا يُستخدم مع تهديد حقيقي مثل invoice_oct.pdf.exe." };
    host.appendChild(frame("غرفة الحجر", "invoice_oct.pdf.exe وصل في بريد بعنوان «فاتورة أكتوبر».", [choices([["Quarantine", "حجر"], ["Remove", "إزالة"], ["Allow", "سماح"]], function (k) { out.textContent = info[k]; }), out]));
  };

  /* lesson 6: where programs start from, in boot order */
  F.bootpath = function (host) {
    var out = h("div.fig-explain", { "aria-live": "polite", text: "اضغط على أي مرحلة من مراحل الإقلاع." });
    var stages = [["services", "تشغيل الجهاز ← الخدمات", "Services: تبدأ قبل دخول أي مستخدم. على ACC-PC1: AccountingSyncSvc (سليم)."], ["logon", "دخول المستخدم ← مفاتيح Run", "HKLM\\…\\Run لكل المستخدمين وHKCU\\…\\Run للمستخدم الحالي. هنا كان RemoteHelper."], ["tasks", "في وقت أو حدث ← المهام المجدولة", "Task Scheduler: هنا كانت \\RemoteHelperUpdate تعيد rhelper ولو أُزيل من Run."]];
    host.appendChild(frame("أبواب الإقلاع", "ثلاثة طرق ليبدأ برنامج وحده؛ إن أغلقت واحداً بقي الآخران.", [choices(stages.map(function (s) { return [s[0], s[1]]; }), function (k) { out.textContent = stages.filter(function (s) { return s[0] === k; })[0][2]; }), out]));
  };

  /* lesson 7: the gate guard + Telnet vs HTTPS */
  F.gate = function (host) {
    var out = h("div.fig-explain", { "aria-live": "polite", text: "اختر اتصالاً قادماً إلى ACC-PC1 بعد قواعد الدرس." });
    var cases = [["c1", "ACC-PC2 ← 3389", "يمر ✓: القاعدة تسمح من 192.168.50.22 فقط، وهذا جهاز المدير."], ["c2", "FILESRV ← 3389", "يُمنع ⊘: ليس في نطاق القاعدة (Scope)."], ["c3", "أي جهاز ← 5900", "يُمنع ⊘: قاعدة Block VNC 5900 تغلب Remote Helper (المعطّلة أصلاً)."], ["c4", "ACC-PC2 ← 445", "يمر ✓: مشاركة الملفات في شبكة Private."]];
    var wire = h("div.fig-explain", { "aria-live": "polite", text: "اختر البروتوكول لترى ما يراه أي جهاز في الطريق." });
    host.appendChild(frame("حارس البوابة", "القواعد تقرر لكل اتصال: يمر أم يُمنع.", [choices(cases.map(function (c) { return [c[0], c[1]]; }), function (k) { out.textContent = cases.filter(function (c) { return c[0] === k; })[0][2]; }), out]));
    host.appendChild(frame("البطاقة والظرف", "جلسة المستشار مع لوحة إدارة الطابعة.", [choices([["telnet", "Telnet"], ["https", "HTTPS"]], function (k) { wire.textContent = k === "telnet" ? "login: audit-test • Password: Test-Only-2026 ← نص مقروء كبطاقة بريدية." : "8f3a 1c9e 77d0 a4b2 … ← بايتات بلا معنى كرسالة في ظرف مختوم (ويبقى اسم الوجهة مقروءاً)."; }), wire]));
  };

  /* lesson 8: possibilities counter + lockout slider */
  F.counter = function (host) {
    var inp = h("input#fig-pw", { type: "text", autocomplete: "off", spellcheck: "false", dir: "ltr", "aria-label": "كلمة مرور وهمية للتجربة" });
    var out = h("div.fig-explain", { "aria-live": "polite", text: "اكتب كلمة مرور وهمية (لا تكتب كلمة مرورك الحقيقية). الحساب في متصفحك فقط." });
    inp.addEventListener("input", function () {
      var v = inp.value, n = 0;
      if (/[a-z]/.test(v)) n += 26; if (/[A-Z]/.test(v)) n += 26; if (/[0-9]/.test(v)) n += 10; if (/[^A-Za-z0-9]/.test(v)) n += 32;
      var bits = v.length * Math.log2(n || 1);
      out.textContent = v ? "الطول " + v.length + " • أنواع الأحرف " + n + " • نحو " + bits.toFixed(1) + " بت (" + FSIM.tools.keepassxc.quality(bits) + "). كل حرف إضافي يضاعف الاحتمالات." : "اكتب كلمة مرور وهمية.";
    });
    var th = h("input#fig-th", { type: "range", min: "0", max: "10", value: "0", "aria-label": "حد القفل" }), out2 = h("div.fig-explain", { "aria-live": "polite" });
    function upd() { var t = +th.value; out2.textContent = t === 0 ? "الحد 0: لا قفل؛ يستطيع برنامج التخمين أن يجرّب بلا نهاية." : "الحد " + t + ": بعد " + t + " محاولات خاطئة يُقفل الحساب (الحدث 4740)، فتتوقف المحاولة " + (t + 1) + " وما بعدها."; }
    th.addEventListener("input", upd); upd();
    host.appendChild(frame("عدّاد الاحتمالات", null, [h("label", { "for": "fig-pw", text: "كلمة مرور وهمية:" }), inp, out, h("label", { "for": "fig-th", text: "حد القفل (Account lockout threshold):" }), th, out2]));
  };

  /* lesson 10: the report rows flip from open to closed / residual */
  F.beforeafter = function (host) {
    var M = FSIM.data.mission, fs = FSIM.data.case.findings, after = false;
    var tbody = h("tbody"), out = h("div.fig-explain", { "aria-live": "polite", text: "اضغط «بعد» لترى ما تغيّر بعد الدروس 4–9، ثم اضغط أي صف." });
    function draw() {
      tbody.textContent = "";
      fs.forEach(function (f) {
        var st = after ? f.result : "open";
        var tr = h("tr", { tabindex: "0", "data-row": f.id }, h("td", { text: f.id }), h("td", FSIM.core.ltr(f.title)), h("td", h("span.status-chip.is-" + st, { text: M.report.labels[st] })));
        function show() { out.textContent = f.id + ": " + (after ? (st === "closed" ? "مغلقة. الدليل: " : "متبقية: ") + (M.report.evidence ? M.report.evidence[f.id] : "") : "مفتوحة قبل المعالجة."); }
        tr.addEventListener("click", show); tr.addEventListener("keydown", function (e) { if (e.key === "Enter") show(); });
        tbody.appendChild(tr);
      });
    }
    draw();
    host.appendChild(frame("لوحة قبل/بعد", "سبع مشكلات وجدناها في الدرس 3 وما بعده.", [choices([["b", "قبل"], ["a", "بعد"]], function (k) { after = k === "a"; draw(); }), h("div.table-scroll", h("table.data", tbody)), out]));
  };

  /* lesson 9: three boxes + the disk strip */
  F.boxes = function (host) {
    var out = h("div.fig-explain", { "aria-live": "polite", text: "شخص فضولي يحاول فتح كل صندوق. اختر الصندوق." });
    var info = { hidden: "مخفي ومعاد تسميته (holiday.jpg): dir /a:h يكشفه، وren يعيد اسمه، فيُقرأ كاملاً. لا حماية.", zip: "مضغوط بلا كلمة مرور: يُفتح بنقرة. الضغط يصغّر الحجم ولا يقفل.", enc: "مشفّر بـ AES-256 مع تشفير الأسماء: Cannot open encrypted archive. Wrong password? لا يُرى حتى اسم الملف." };
    var disk = h("div.fig-disk"), out2 = h("div.fig-explain", { "aria-live": "polite" });
    function drawDisk(stage) { disk.textContent = ""; for (var i = 0; i < 12; i++) disk.appendChild(h("span.fig-block" + (i === 4 || i === 5 ? (stage === 0 ? ".is-file" : stage === 1 ? ".is-ghost" : ".is-wiped") : ""))); out2.textContent = ["الملف في مكانه على القرص.", "بعد del: الفهرس نسي الملف، لكن الكتل الرمادية ما زالت تحمل بياناته (قابلة للاسترجاع).", "بعد cipher /w: كُتب فوق المساحة الحرة ثلاث مرات (0x00 ثم 0xFF ثم عشوائي)."][stage]; }
    drawDisk(0);
    host.appendChild(frame("ثلاثة صناديق", null, [choices([["hidden", "مخفي"], ["zip", "مضغوط"], ["enc", "مشفّر"]], function (k) { out.textContent = info[k]; }), out]));
    host.appendChild(frame("الحذف مقابل المحو", null, [choices([["d0", "قبل"], ["d1", "del"], ["d2", "cipher /w"]], function (k) { drawDisk(+k.slice(1)); }), disk, out2]));
  };
})();
