/* A visible, cancellable demonstration of one step. Native program controls stay native. */
(function () {
  "use strict";
  var F = window.FSIM, h = F.core.h;
  async function run(st, stage, launchers, alive) {
    var area = document.getElementById("stage"), caption = document.querySelector(".demo-caption");
    if (!caption) { caption = h("div.demo-caption", { role: "status", "aria-live": "polite" }); area.parentNode.insertBefore(caption, area); }
    caption.hidden = false; caption.textContent = "شاهد: " + (st.title || st.instruction);
    area.classList.add("is-demonstrating");
    function check() { if (!alive()) throw new Error("cancelled"); }
    async function pause(ms) { check(); await new Promise(function (r) { setTimeout(r, F.core.config.fast ? 0 : (ms || 650)); }); check(); }
    function clear() { area.querySelectorAll(".fsim-hl").forEach(function (e) { e.classList.remove("fsim-hl"); }); }
    async function point(el, text) {
      check(); clear();
      if (text) caption.textContent = text;
      if (el) { el.classList.add("fsim-hl"); el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" }); }
      await pause();
    }
    function required(el) { if (!el) throw new Error("Demo control missing"); return el; }
    function byText(w, text, selector) {
      return Array.from(w.body.querySelectorAll(selector || "button")).find(function (b) { return b.textContent.trim() === text || b.getAttribute("aria-label") === text || b.getAttribute("data-sz") === text; });
    }
    async function click(el, text, twice) { required(el); await point(el, text); check(); el.click(); if (twice) el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })); await pause(450); }
    async function type(el, text, label) {
      required(el); await point(el, label || "اكتب في الحقل المحدد");
      el.focus({ preventScroll: true }); el.value = "";
      for (var i = 0; i < String(text).length; i++) { check(); el.value += String(text).charAt(i); el.dispatchEvent(new Event("input", { bubbles: true })); await pause(35); }
      await pause(300);
    }
    function row(w, name) { return Array.from(w.body.querySelectorAll("tr[data-key]")).find(function (r) { return r.getAttribute("data-key") === name; }); }
    async function button(w, text, label) { await click(byText(w, text), label || "اضغط: " + text); }
    async function select(w, query, value, label) { var el = required(w.body.querySelector(query)); await point(el, label); el.value = value; el.dispatchEvent(new Event("change", { bubbles: true })); await pause(350); }
    async function tick(w, query, label) { await click(w.body.querySelector(query), label); }
    async function menu(w, group, item) { await button(w, group, "افتح قائمة " + group); await button(w, item, "اختر " + item); }
    async function ui(d, w) {
      var a = d.action, arg = [].concat(d.arg == null ? [] : d.arg), api = w.body.api, c = F.data.case;
      if (/^wait/.test(a)) {
        // A cancelled practice must never leave a polling promise holding the player open.
        await Promise.race([Promise.resolve(api[a].apply(null, arg)), new Promise(function (_, reject) { setTimeout(function () { reject(new Error("Demo timed out")); }, F.core.config.fast ? 10000 : 60000); })]); check(); return;
      }
      if (d.tool === "zenmap" && a === "run") {
        await type(w.body.querySelector(".zm-target"), arg[1], "اكتب عنوان الجهاز أو الشبكة في Target");
        await select(w, ".zm-profile", arg[0], "اختر نوع الفحص من Profile: " + arg[0]);
        await point(byText(w, "Scan"), "اضغط Scan ثم راقب تقدم الفحص");
        await api.run.apply(null, arg); check(); return;
      }
      if (d.tool === "nessus" && a === "fill") { await type(w.body.querySelector("#ns-name"), arg[0], "اكتب اسم الفحص"); await type(w.body.querySelector("#ns-targets"), arg[1], "اكتب نطاق الحالة الوهمية"); return; }
      if (d.tool === "taskmgr" && a === "setSearch") { await type(w.body.querySelector('input[type="search"], .tm-search input, input'), arg[0], "اكتب رقم العملية في البحث"); return; }
      if (d.tool === "cmdadmin" && a === "runWithAnswer") {
        var input = api.term.input;
        await type(input, arg[0], "اكتب أمر اختبار الحساب داخل المحاكاة");
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); await pause();
        await type(input, arg[1], "أدخل كلمة مرور خاطئة تدريبية؛ ستظهر مخفية");
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); await pause(); return;
      }
      if (d.tool === "autoruns") {
        if (a === "setOption") { await menu(w, "Options", arg[0]); return; }
        if (a === "remove") {
          await click(w.body.querySelector('[data-name="' + CSS.escape(arg[0]) + '"]'), "اختر المدخل المراد حذفه");
          await menu(w, "Entry", "Delete"); await button(w, "OK", "أكّد حذف المدخل من التشغيل التلقائي في المحاكاة"); return;
        }
        if (a === "toggle") { await tick(w, '[data-toggle="' + CSS.escape(arg[0]) + '"]', "أزل علامة التفعيل لتعطيل المدخل"); return; }
      }
      if (d.tool === "nessus" && a === "saveLaunch") { await click(w.body.querySelector('[aria-label="Save options"]'), "افتح خيارات حفظ الفحص"); await button(w, "Launch", "احفظ وشغّل الفحص ثم انتظر النتائج"); return; }
      if (d.tool === "eventviewer" && a === "filter") {
        await button(w, "Security", "افتح سجل Security"); await button(w, "Filter Current Log...");
        await type(w.body.querySelector("#ev-ids"), arg[0].join(","), "اعرض أحداث فشل تسجيل الدخول وقفل الحساب فقط"); await button(w, "OK"); return;
      }
      if (d.tool === "wireshark" && a === "setFilter") {
        var fi = w.body.querySelector('.ws-filter input');
        if (fi) { await type(fi, arg[0], "اكتب مرشح العرض ثم طبّقه"); }
        await point(fi || w.body, "طبّق مرشح العرض: " + arg[0]); api.setFilter(arg[0]); await pause(); return;
      }
      if (d.tool === "firewall") {
        if (a === "blockRule") {
          await button(w, "New Rule...", "افتح معالج إنشاء قاعدة جديدة");
          await point(w.body.querySelector('[value="Port"]'), "نوع القاعدة Port — منفذ"); await button(w, "Next >");
          await type(w.body.querySelector("#fw-port"), c.firewall.target.port, "TCP: اكتب المنفذ المراد حجبه"); await button(w, "Next >");
          await point(w.body.querySelector('[value="Block the connection"]'), "احجب الاتصال: Block the connection"); await button(w, "Next >");
          await point(w.body.querySelector("#fw-pr-Domain"), "طبّق القاعدة على ملفات الشبكة الثلاثة"); await button(w, "Next >");
          await type(w.body.querySelector("#fw-name"), c.firewall.target.name, "اكتب اسماً واضحاً لقاعدة الحجب"); await button(w, "Finish", "احفظ القاعدة ثم راجعها في الجدول"); return;
        }
        if (a === "disable" || a === "scope") {
          await click(row(w, arg[0]), "اختر القاعدة: " + arg[0]);
          if (a === "disable") { await button(w, "Disable Rule", "عطّل قاعدة السماح القديمة"); return; }
          await button(w, "Properties"); await button(w, "Scope", "افتح نطاق العناوين المسموح لها");
          await tick(w, "#fw-sc-these", "اختر These IP addresses");
          await type(w.body.querySelector("#fw-ip"), arg[1], "اسمح بعنوان جهاز المدير فقط"); await button(w, "Add..."); await button(w, "OK"); return;
        }
      }
      if (d.tool === "secpol" && a === "applyAll") {
        var group = arg[0] === "password" ? "Password Policy" : "Account Lockout Policy";
        var values = c.secpol; // Values below are the approved lesson's demo values.
        await point(w.body.querySelector('[data-node="' + group + '"]'), "افتح " + group); api.select(group); await pause();
        var settings = arg[0] === "password" ? [["Minimum password length", 14], ["Password must meet complexity requirements", "Enabled"], ["Enforce password history", 24], ["Minimum password age", 1]] : [["Account lockout threshold", 5], ["Account lockout duration", 15], ["Reset account lockout counter after", 15]];
        for (var setting of settings) {
          await click(row(w, setting[0]), "افتح خصائص: " + setting[0], true);
          if (typeof setting[1] === "number") await type(w.body.querySelector("#sp-num"), setting[1], "اضبط القيمة: " + setting[1]);
          else await tick(w, "#sp-Enabled", "فعّل شرط التعقيد");
          await button(w, "OK");
          var suggested = w.body.querySelector('[aria-label="Suggested Value Changes"]');
          if (suggested) { await point(suggested, "يقترح Windows مدة أولية؛ سنغيّرها إلى القيمة المطلوبة في الدرس"); await click(Array.from(suggested.querySelectorAll("button")).find(function (b) { return b.textContent === "OK"; })); }
        } return;
      }
      if (d.tool === "sevenzip" && a === "demoArchive") {
        await click(row(w, c.files.real), "اختر ملف الرواتب الأصلي"); await button(w, "Add");
        await point(w.body.querySelector("#sz-format"), "الصيغة 7z تتيح تشفير أسماء الملفات");
        await type(w.body.querySelector("#sz-name"), c.files.archive.name, "اسم الأرشيف المشفّر");
        await type(w.body.querySelector("#sz-pw"), "demo-passphrase-2026", "كلمة مرور تدريبية — لا تستخدمها خارج المحاكاة");
        await type(w.body.querySelector("#sz-pw2"), "demo-passphrase-2026", "أعد كتابة كلمة المرور نفسها");
        await point(w.body.querySelector("#sz-method"), "طريقة التشفير AES-256");
        await tick(w, "#sz-names", "فعّل Encrypt file names لإخفاء أسماء المحتويات"); await button(w, "OK"); return;
      }
      if (d.tool === "keepassxc" && (a === "demoCreate" || a === "demoEntry")) {
        if (a === "demoCreate") {
          await button(w, "Create new database"); await type(w.body.querySelector("#kp-name"), c.keepass.dbName, "سمّ خزنة كلمات المرور");
          await button(w, "Continue"); await point(w.body.querySelector(".wiz-body"), "راجع إعدادات تشفير الخزنة"); await button(w, "Continue");
          await click(w.body.querySelector('[aria-label="Password generator"]'), "افتح مولّد عبارة المرور");
          await point(w.body.querySelector("#kp-words"), "Passphrase: ست كلمات عشوائية للعبارة الرئيسية");
          await button(w, "Apply Password"); await button(w, "Done", "احفظ الخزنة بعد التأكد من قوة العبارة"); return;
        }
        await click(w.body.querySelector('[data-kp="New entry"]'), "أضف مدخلاً لحساب الطابعة");
        await type(w.body.querySelector("#kp-title"), "Printer admin", "عنوان الحساب"); await type(w.body.querySelector("#kp-user"), "admin", "اسم المستخدم");
        await click(w.body.querySelector('[aria-label="Password generator"]'), "ولّد كلمة مرور مختلفة لهذا الحساب");
        await button(w, "Password"); await point(w.body.querySelector("#kp-len"), "الطول 24 حرفاً مع تنوع المحارف"); await button(w, "Apply Password");
        await type(w.body.querySelector("#kp-url"), "https://printer.sanabel.example", "عنوان الطابعة الوهمية"); await button(w, "OK"); return;
      }
      // Single native actions retain their established API, with a visible target and reading pause.
      var el = typeof arg[0] === "string" ? byText(w, arg[0]) || row(w, arg[0]) : null;
      if (!el && st.target) el = document.querySelector(st.target);
      await point(el || w.body, "شاهد الإجراء داخل " + d.tool + ": " + (st.instruction || st.title));
      if (typeof api[a] !== "function") throw new Error("Unknown demo action: " + a);
      await Promise.resolve(api[a].apply(null, arg)); check(); await pause();
    }
    async function one(d) {
      check();
      if (Array.isArray(d)) { for (var part of d) { await one(part); await pause(450); } return; }
      if (d.kind === "launch") { await click(launchers[d.tool], "افتح البرنامج من شريط التطبيقات"); return; }
      if (d.kind === "state") { var s = stage._sel; await point(s, "غيّر حالة الجهاز للمقارنة"); s.value = d.value; s.dispatchEvent(new Event("change")); return; }
      var win = stage.get(d.tool) || F.tools[d.tool].open(stage, {}); win.open();
      if (d.kind === "command") {
        var input = win.body.api.term.input;
        await type(input, d.text, "شاهد كتابة الأمر ثم تنفيذه داخل المحاكاة");
        await point(input, "اضغط Enter ثم اقرأ الناتج");
        await win.body.api.term.submit(input.value); check(); await pause();
      } else if (d.kind === "ui") await ui(d, win);
    }
    try { await one(st.demo || st); caption.textContent = "انتهى تنفيذ هذه الخطوة. اقرأ النتيجة ثم اضغط «فهمت» أو «أعد العرض»."; }
    finally { clear(); area.classList.remove("is-demonstrating"); if (!alive()) caption.hidden = true; }
  }
  F.core.demo = { run: run };
})();
