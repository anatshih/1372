/* FSIM.core.pages — non-lesson pages: home, mission (security assessment report), about, verify. */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, P = FSIM.core.progress;
  function root() { var r = document.getElementById("page-root"); if (r && !r.dataset.ready) { r.textContent = ""; r.dataset.ready = "1"; } return r; }
  function idx() { return FSIM.data.lessonIndex || []; }
  function M() { return FSIM.data.mission; }
  function C() { return FSIM.data.case; }

  function progressBackup() {
    var out = h("p", { role: "status", "aria-live": "polite" });
    var save = h("button.btn", { type: "button", text: "احفظ نسخة من تقدّمك" });
    var input = h("input#progress-file", { type: "file", accept: ".json,application/json" });
    var box = h("details.card", h("summary", { text: "تقدّمي: الحفظ والنقل إلى جهاز آخر" }),
      h("p", { text: "اختياري: احتفظ بملف التقدم قبل حذف بيانات المتصفح أو الانتقال إلى جهاز آخر. لا يُرسل هذا الملف للأستاذ ولا لأي جهة. استعادته تستبدل تقدم هذا المتصفح." }),
      save, h("div.field", h("label", { "for": "progress-file", text: "استعد نسخة تقدّم سابقة" }), input), out);
    save.addEventListener("click", function () {
      var data = { app: "vlab-training", version: 1, progress: {} };
      idx().forEach(function (l) { data.progress[l.id] = P.get(l.id); });
      var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      var a = h("a", { href: url, download: "1372-training-progress.json" }); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      out.textContent = "حُضّرت نسخة التقدم للتنزيل؛ احتفظ بها في مكان تعرفه.";
    });
    input.addEventListener("change", async function () {
      var f = input.files[0]; if (!f) return;
      try {
        if (f.size > 500000) throw new Error("size");
        var data = JSON.parse(await f.text());
        if (data.app !== "vlab-training" || data.version !== 1 || !data.progress || typeof data.progress !== "object") throw new Error("format");
        var progress = {};
        idx().forEach(function (l) {
          var raw = data.progress[l.id]; if (!raw || typeof raw !== "object") return;
          var rec = { cards: {}, questions: {} };
          P.stagesOf(l.id).forEach(function (s) { rec[s] = raw[s] === true; });
          ["cards", "questions"].forEach(function (k) { Object.keys(raw[k] || {}).filter(function (key) { return /^[a-z0-9_-]{1,80}$/i.test(key); }).forEach(function (key) { if (raw[k][key] === true) rec[k][key] = true; }); });
          if (["independent", "observed", "mixed"].indexOf(raw.practiceMethod) >= 0) rec.practiceMethod = raw.practiceMethod;
          progress[l.id] = rec;
        });
        if (!Object.keys(progress).length) throw new Error("empty");
        if (!window.confirm("استبدال تقدم هذا المتصفح بالنسخة المختارة؟ يمكنك حفظ نسختك الحالية أولاً.")) { input.value = ""; return; }
        FSIM.core.storage.update(function (state) { state.progress = progress; state.ui.last = null; });
        window.location.reload();
      } catch (e) { out.textContent = "تعذرت الاستعادة. اختر ملف 1372-training-progress.json صالحاً من هذا الموقع. لم يتغير تقدمك الحالي."; input.value = ""; }
    });
    return box;
  }

  function progressBar(pct, label) {
    var inner = h("span"); inner.style.inlineSize = pct + "%";
    return h("div.progress-bar", { role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": label }, inner);
  }

  /* status of one finding in the security assessment report (open until the lesson that treats it is complete) */
  function findingStatus(f) {
    var lessonExists = idx().some(function (l) { return l.id === f.closes; });
    if (!lessonExists || !P.complete(f.closes)) return "open";
    if (f.result === "closed" && !P.complete("l10-verify")) return "pending";
    return f.result;
  }

  /* Unit 13 timeline (home page, "learn more") */
  function timeline() {
    var out = h("div.fig-explain", { "aria-live": "polite", text: "اضغط على أي محطة." });
    var list = h("ol.timeline-list", { "aria-label": "خط زمني: تاريخ الهاكرز" }, M().timeline.map(function (x) {
      var b = h("button.btn", { type: "button", "data-year": x[0], text: x[0] });
      b.addEventListener("click", function () { Array.prototype.forEach.call(list.querySelectorAll("button"), function (e) { e.setAttribute("aria-pressed", String(e === b)); }); out.textContent = x[0] + ": " + x[1]; });
      return h("li", b);
    }));
    return h("details.card.learn-more#unit13", h("summary", { text: "اعرف أكثر: تاريخ الهاكرز في محطات (الوحدة 13)" }), h("div.tl-grid", list), out);
  }

  function reportTable(withEvidence) {
    var labels = M().report.labels;
    return h("div.table-scroll", h("table.data.report-table",
      h("thead", h("tr", ["#", "المشكلة", "المصدر", "الأجهزة", "الخطورة", "الحالة"].concat(withEvidence ? ["الدليل"] : []).map(function (c) { return h("th", { scope: "col", text: c }); }))),
      h("tbody", C().findings.map(function (f) {
        var st = findingStatus(f);
        var lesson = idx().filter(function (l) { return l.id === f.closes; })[0];
        var stCell = h("td", h("span.status-chip.is-" + st, { "data-finding": f.id, "data-status": st, text: st === "pending" ? "تمت المعالجة — بانتظار التحقق" : labels[st] }));
        if (st === "residual" && f.note) stCell.appendChild(h("small.muted.report-note", { text: f.note }));
        if (st === "pending") stCell.appendChild(h("a.report-note", { href: "labs/l10-verify.html", text: "الخطوة التالية: إعادة الفحص في الدرس 10" }));
        if (st === "open") stCell.appendChild(h("small.muted.report-note", { text: lesson ? "يُعالج في: " + lesson.title : "يُعالج في درس من مرحلة لاحقة" }));
        return h("tr", h("td", { text: f.id }), h("td", FSIM.core.ltr(f.title)), h("td", FSIM.core.ltr(f.source)), h("td", h("bdi", { dir: "ltr", text: f.hosts })), h("td", FSIM.core.ltr(f.severity)), stCell, withEvidence ? h("td", FSIM.core.ltr(st === "open" ? "لم تُكمل درس المعالجة بعد؛ الدليل أدناه في النموذج التعليمي." : M().report.evidence[f.id] || "")) : null);
      }))));
  }

  /* ---------------- home: what to do, then the lessons in order ---------------- */
  function home() {
    var c = FSIM.data.course, r = root(), m = M(), list = idx(), ids = list.map(function (l) { return l.id; });
    var pct = P.percent(ids);
    var nextL = list.filter(function (l) { return !P.complete(l.id); })[0] || null;
    var startHref = nextL ? "labs/" + nextL.id + ".html" : (list[0] ? "labs/" + list[0].id + ".html" : "#");
    r.appendChild(h("section.hero",
      h("p.chip", { text: "10 دروس • 14 وحدة • تدريب داخل المتصفح" }),
      h("h1", { text: "مختبر إدارة الثغرات الافتراضي" }),
      h("p.lead", { text: "تدرّب على برامج مقرر " + c.name + " (" + c.number + ") داخل المتصفح، بلا تثبيت." }),
      h("p.training-note", { text: "للتدريب الذاتي فقط — لا يوجد تسليم أو رفع ملفات أو مناقشة مطلوبة." }),
      m.intro.map(function (t) { return h("p", { text: t }); }),
      h("div.hint-row", h("a.btn.btn-primary.btn-big", { href: startHref, text: pct ? "تابع: " + (nextL ? nextL.title : "كل الدروس مكتملة") : "ابدأ الدرس 1" }),
        h("a.btn", { href: "mission.html", text: "تقرير تقييم الأمن" }), h("a.btn", { href: "#student-help", text: "تعليمات وأسئلة شائعة" }))));

    r.appendChild(h("section.card.how-to", { "aria-labelledby": "how-h" },
      h("h2#how-h", { text: "كيف تتعلم هنا؟" }),
      h("ol.how-steps",
        h("li", h("strong", { text: "اقرأ" }), " بطاقات قصيرة تشرح الفكرة."),
        h("li", h("strong", { text: "طبّق" }), " في نافذة تشبه البرنامج الحقيقي: الخطوة مكتوبة أمامك، وما تكتبه يظهر بالضبط."),
        h("li", h("strong", { text: "افهم" }), " اضغط القيم الملوّنة في الناتج، وأجب عن أسئلة قصيرة.")),
      progressBar(pct, "نسبة الإنجاز"), h("p.muted", { text: "أنجزت " + pct + "% • التقدم يُحفظ في متصفحك فقط." })));

    function lessonCard(l) {
      var isNext = nextL && nextL.id === l.id, doneL = P.complete(l.id);
      return h("article.card.lesson-card" + (isNext ? ".is-next" : ""),
        h("h3", h("span.num", { text: String(l.seq) }), l.title),
        l.caseBranch ? h("p.case-q", { text: l.caseBranch.question }) : null,
        h("div.meta", isNext ? h("span.chip.chip-warn", { text: "★ التالي" }) : null, doneL ? h("span.chip.chip-ok", { text: P.get(l.id).practiceMethod === "observed" ? "✔ اطّلعت على الدرس" : "✔ مكتمل" }) : null,
          l.tools && l.tools.length ? h("span.chip", { lang: "en", dir: "ltr", text: l.tools.join(" • ") }) : null,
          h("span.chip", { text: "≈ " + l.minutes + " دقيقة" })),
        h("div.actions", h("a.btn" + (isNext ? ".btn-primary" : ""), { href: "labs/" + l.id + ".html", text: doneL ? "راجع الدرس" : P.get(l.id).explain ? "تابع الدرس" : "ابدأ الدرس" })));
    }
    m.axes.forEach(function (ax) {
      var lessons = list.filter(function (l) { return l.axis === ax.n; });
      var cards = h("div.lesson-cards", lessons.map(lessonCard));
      m.upcoming.filter(function (u) { return u.axis === ax.n; }).forEach(function (u) {
        cards.appendChild(h("article.card.lesson-card.soon", h("h3", { text: u.title }), h("p", { lang: "en", dir: "ltr", text: u.tool }), h("p.muted", { text: "قريباً" })));
      });
      r.appendChild(h("section.axis-block", h("h2", { text: "المحور " + ax.title }), h("p.axis-q", { text: ax.question }), cards));
    });
    r.appendChild(h("section.card.student-help#student-help", h("h2", { text: "إجابات قبل أن تبدأ" }),
      [["هل عليّ تسليم شيء؟", "لا. الموقع للتدريب فقط. لا ملفات مطلوبة ولا رسالة تسليم ولا مناقشة عبر Teams لهذا التدريب."],
       ["هل أحتاج إلى تثبيت البرامج؟", "لا. ابدأ بالشرح ثم افتح التطبيق داخل المتصفح. النوافذ محاكاة تعليمية؛ لا تفحص جهازك أو شبكة حقيقية."],
       ["كيف يعمل زر أرني؟", "يعرض تنفيذ الخطوة أمامك ثم يتوقف. اضغط أعد العرض لتكرارها، أو فهمت للانتقال. للتطبيق بنفسك اختر جرّب بتوجيه."],
       ["هل أستطيع الانتقال بين المراحل؟", "نعم. الشرح والتطبيق والتفسير متاحة دائماً. يُنصح بترتيبها، وتبديل وضع التطبيق يبدأ تجربة جديدة."],
       ["أين يُحفظ تقدمي؟", "في هذا المتصفح على هذا الجهاز فقط، دون حساب. حذف بيانات المتصفح يمسحه. تستطيع الرجوع إلى الدروس في أي وقت."],
       ["ما فائدة التقرير؟", "يجمع نتائج الحالة الوهمية ويفرّق بين المعالجة والتحقق. النموذج النهائي مرجع لفهم النتائج وليس واجباً للتسليم."]]
      .map(function (x) { return h("details", h("summary", { text: x[0] }), h("p", { text: x[1] })); })));
    r.appendChild(timeline());
    r.appendChild(progressBackup());
    r.appendChild(h("div.note.note-info", h("strong", { text: "تنبيه: " }), document.createTextNode(c.disclaimer.full)));
    r.appendChild(h("p", (function () { var b = h("button.btn.btn-danger", { type: "button", text: "مسح تقدّمي" }); b.addEventListener("click", function () { if (window.confirm("سيُمسح تقدّمك وحالة تقرير تقييم الأمن في هذا المتصفح. هل أنت متأكد؟")) { P.reset(); window.location.reload(); } }); return b; })()));
  }

  /* ---------------- mission: the security assessment report ---------------- */
  function missionPage() {
    var r = root(), m = M();
    r.appendChild(h("h1.page-title#report", { text: "تقرير تقييم الأمن" }));
    r.appendChild(h("p", { text: m.intro.join(" ") }));
    r.appendChild(h("p", { text: m.report.intro }));
    r.appendChild(h("div.note.note-info", { text: "تقرير تدريبي للحالة الوهمية، وليس واجباً للتسليم. الحالات أدناه تتبع تقدّمك المحلي. الملخص والأدلة النهائية نموذج تعليمي ثابت للمقارنة، وليست نتائج فحص جهازك." }));
    var fs = C().findings, closed = fs.filter(function (f) { return findingStatus(f) === "closed"; }).length, residual = fs.filter(function (f) { return findingStatus(f) === "residual"; }).length;
    r.appendChild(progressBar(Math.round((closed + residual) * 100 / fs.length), "المشكلات المعالجة"));
    r.appendChild(h("p.board-count", { "data-testid": "report-count", text: "بانتظار التحقق: " + fs.filter(function (f) { return findingStatus(f) === "pending"; }).length + " • مغلقة: " + closed + " • متبقية: " + residual + " • مفتوحة: " + (fs.filter(function (f) { return findingStatus(f) === "open"; }).length) + " (من " + fs.length + ")" }));
    var full = idx().some(function (l) { return l.id === "l10-verify"; }) && P.complete("l10-verify");
    if (!full) {
      r.appendChild(reportTable());
      r.appendChild(h("p.muted", { text: "التقرير الكامل (الملخص التنفيذي والأدلة والتوصيات) يظهر هنا بعد الدرس 10: إعادة الفحص." }));
    } else {
      var rep = m.report;
      r.appendChild(h("section.card.full-report", { "aria-labelledby": "fr-h" },
        h("h2#fr-h", { text: "تقرير تقييم الأمن — مكتب السنابل للمحاسبة" }),
        h("h3", { text: "نموذج الملخص التنفيذي — للمقارنة والتعلّم" }), h("p", { "data-testid": "exec-summary", text: rep.summary }),
        h("h3", { text: "النطاق والمدة" }),
        h("div.table-scroll", h("table.data", h("tbody", rep.scope.map(function (x) { return h("tr", h("th", { scope: "row", text: x[0] }), h("td", FSIM.core.ltr(x[1]))); })))),
        h("h3", { text: "المشكلات وحالتها والدليل" }), reportTable(true),
        h("h3", { text: "التوصيات" }), h("ol", rep.recommendations.map(function (x) { return h("li", FSIM.core.ltr(x)); })),
        h("p.no-print", (function () { var b = h("button.btn.btn-primary", { type: "button", text: "اطبع التقرير / احفظه PDF" }); b.addEventListener("click", function () { window.print(); }); return b; })()),
        h("p.muted", { text: "في الواقع يُسلَّم التقرير للعميل وحده، مشفّراً (كما في الدرس 9)." })));
    }

    r.appendChild(h("section.card", h("h2", { text: "راجع فهمك (اختياري)" }), h("p", { text: "أي إجراء عالج المشكلة؟ ما الدليل على نجاحه؟ وما الذي بقي ولماذا؟ حاول الإجابة قبل قراءة النموذج. لا يلزم إرسال إجابتك." }), h("a.btn", { href: "labs/l10-verify.html", text: "تدرّب على إعادة الفحص" })));
  }

  /* ---------------- about ---------------- */
  function about() {
    var c = FSIM.data.course, r = root();
    r.appendChild(h("h1.page-title", { text: "عن المقرر" }));
    r.appendChild(h("div.note", h("strong", { text: "تنبيه: " }), document.createTextNode(c.disclaimer.full)));
    r.appendChild(h("div.card", h("h2", { text: c.name + " (" + c.number + ")" }),
      h("table.data", h("tbody",
        [["الجامعة", c.university], ["الفرع", c.branch], ["إعداد الموقع / المحتوى التطبيقي", c.instructor], ["الفصل الدراسي المعروض", c.semester]]
          .map(function (x) { return h("tr", h("th", { scope: "row", text: x[0] }), h("td", { text: x[1] })); })))));
    if (c.description) { r.appendChild(h("h2", { text: "وصف المقرر" })); r.appendChild(h("p", { text: c.description })); }
    r.appendChild(h("h2", { text: "وحدات الكتاب" }));
    r.appendChild(h("div.table-scroll", h("table.data", h("thead", h("tr", h("th", { text: "الوحدة" }), h("th", { text: "العنوان والتدريب المرتبط" }))),
      h("tbody", c.units.map(function (u) { return h("tr", h("td", { text: String(u.n) }), h("td", h("strong", { text: u.title }), h("div.unit-links", idx().filter(function (l) { return (l.units || []).indexOf(u.n) >= 0; }).map(function (l) { return h("a", { href: "labs/" + l.id + ".html", text: "الدرس " + l.seq + ": " + l.title }); }), u.n === 13 ? h("a", { href: "index.html#unit13", text: "خط زمني: تاريخ الهاكرز" }) : null, u.n === 6 ? h("a", { href: "labs/l9-encryption.html#explain", text: "تمهيد أهمية البيانات قبل الدرس 9" }) : null))); })))));
    r.appendChild(h("h2", { text: "لماذا هذه البرامج؟" }));
    r.appendChild(h("p", { text: "اختيرت البرامج لتوضيح مهارات التقييم والمعالجة والتحقق، ولأنها تتيح أمثلة قريبة من بيئة Windows. توافرها وترخيصها وواجهاتها قد تختلف باختلاف الإصدار؛ المحاكاة تبسّط بعض الإجراءات. أدوات الكتاب القديمة تظهر في بطاقة «في الكتاب ← اليوم» داخل الدرس المناسب." }));
    r.appendChild(h("div.note.note-info", h("strong", { text: "من جهة الدفاع فقط: " }),
      document.createTextNode("الطالب في كل الدروس مدافع مفوَّض. الثغرات تُعرض كما يعرضها الماسح (اسم وخطورة ووصف وحلّ) بلا أي تفاصيل لطريقة استغلالها، ولا توجد في الموقع أي أداة هجوم.")));
    r.appendChild(h("p.muted", { text: "مصدر عناوين الوحدات: " + c.unitsSource }));
  }

  /* ---------------- verify (instructor page; not linked from menus) ---------------- */
  function verify() {
    root().appendChild(h("section.card", h("h1", { text: "التدريب الذاتي" }), h("p", { text: "لا يحتاج هذا الموقع إلى رقم جامعي أو رمز إنجاز. لا يوجد تسليم مطلوب؛ افتح الدروس وتدرّب بالوتيرة التي تناسبك." }), h("a.btn.btn-primary", { href: "index.html", text: "افتح الدروس" })));
  }

  FSIM.core.pages = { findingStatus: findingStatus };
  var pageId = document.body.getAttribute("data-page");
  var map = { home: home, about: about, mission: missionPage, verify: verify };
  if (map[pageId]) map[pageId]();
})();
