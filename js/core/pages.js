/* FSIM.core.pages — non-lesson pages: home, mission (security assessment report), about, verify. */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, P = FSIM.core.progress;
  function root() { return document.getElementById("page-root"); }
  function idx() { return FSIM.data.lessonIndex || []; }
  function M() { return FSIM.data.mission; }
  function C() { return FSIM.data.case; }

  function progressBar(pct, label) {
    var inner = h("span"); inner.style.inlineSize = pct + "%";
    return h("div.progress-bar", { role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": label }, inner);
  }

  /* status of one finding in the security assessment report (open until the lesson that treats it is complete) */
  function findingStatus(f) {
    var lessonExists = idx().some(function (l) { return l.id === f.closes; });
    return lessonExists && P.complete(f.closes) ? f.result : "open";
  }

  /* Unit 13 timeline (home page, "learn more") */
  function timeline() {
    var out = h("div.fig-explain", { "aria-live": "polite", text: "اضغط على أي محطة." });
    var list = h("ol.timeline-list", { "aria-label": "خط زمني: تاريخ الهاكرز" }, M().timeline.map(function (x) {
      var b = h("button.btn", { type: "button", "data-year": x[0], text: x[0] });
      b.addEventListener("click", function () { Array.prototype.forEach.call(list.querySelectorAll("button"), function (e) { e.setAttribute("aria-pressed", String(e === b)); }); out.textContent = x[0] + ": " + x[1]; });
      return h("li", b);
    }));
    return h("details.card.learn-more", h("summary", { text: "اعرف أكثر: تاريخ الهاكرز في محطات (الوحدة 13)" }), h("div.tl-grid", list), out);
  }

  function reportTable(withEvidence) {
    var labels = M().report.labels;
    return h("div.table-scroll", h("table.data.report-table",
      h("thead", h("tr", ["#", "المشكلة", "المصدر", "الأجهزة", "الخطورة", "الحالة"].concat(withEvidence ? ["الدليل"] : []).map(function (c) { return h("th", { scope: "col", text: c }); }))),
      h("tbody", C().findings.map(function (f) {
        var st = findingStatus(f);
        var lesson = idx().filter(function (l) { return l.id === f.closes; })[0];
        var stCell = h("td", h("span.status-chip.is-" + st, { "data-finding": f.id, "data-status": st, text: labels[st] }));
        if (st === "residual" && f.note) stCell.appendChild(h("small.muted.report-note", { text: f.note }));
        if (st === "open") stCell.appendChild(h("small.muted.report-note", { text: lesson ? "يُعالج في: " + lesson.title : "يُعالج في درس من مرحلة لاحقة" }));
        return h("tr", h("td", { text: f.id }), h("td", FSIM.core.ltr(f.title)), h("td", FSIM.core.ltr(f.source)), h("td", h("bdi", { dir: "ltr", text: f.hosts })), h("td", FSIM.core.ltr(f.severity)), stCell, withEvidence ? h("td", FSIM.core.ltr(M().report.evidence[f.id] || "")) : null);
      }))));
  }

  /* ---------------- home: what to do, then the lessons in order ---------------- */
  function home() {
    var c = FSIM.data.course, r = root(), m = M(), list = idx(), ids = list.map(function (l) { return l.id; });
    var pct = P.percent(ids);
    var nextL = list.filter(function (l) { return !P.complete(l.id); })[0] || null;
    var startHref = nextL ? "labs/" + nextL.id + ".html" : (list[0] ? "labs/" + list[0].id + ".html" : "#");
    r.appendChild(h("section.hero",
      h("p.chip", { text: c.semester }),
      h("h1", { text: "مختبر إدارة الثغرات الافتراضي" }),
      h("p.lead", { text: "تدرّب على برامج مقرر " + c.name + " (" + c.number + ") داخل المتصفح، بلا تثبيت." }),
      m.intro.map(function (t) { return h("p", { text: t }); }),
      h("div.hint-row", h("a.btn.btn-primary.btn-big", { href: startHref, text: pct ? "تابع: " + (nextL ? nextL.title : "كل الدروس مكتملة") : "ابدأ الدرس 1" }),
        h("a.btn", { href: "mission.html", text: "تقرير تقييم الأمن" }))));

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
        h("div.meta", isNext ? h("span.chip.chip-warn", { text: "★ التالي" }) : null, doneL ? h("span.chip.chip-ok", { text: "✔ مكتمل" }) : null,
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
    r.appendChild(timeline());
    r.appendChild(h("div.note.note-info", h("strong", { text: "تنبيه: " }), document.createTextNode(c.disclaimer.full)));
    r.appendChild(h("p", (function () { var b = h("button.btn.btn-danger", { type: "button", text: "مسح تقدّمي" }); b.addEventListener("click", function () { if (window.confirm("سيُمسح تقدّمك وحالة تقرير تقييم الأمن في هذا المتصفح. هل أنت متأكد؟")) { P.reset(); window.location.reload(); } }); return b; })()));
  }

  /* ---------------- mission: the security assessment report ---------------- */
  function missionPage() {
    var r = root(), m = M();
    r.appendChild(h("h1.page-title#report", { text: "تقرير تقييم الأمن" }));
    r.appendChild(h("p", { text: m.intro.join(" ") }));
    r.appendChild(h("p", { text: m.report.intro }));
    var fs = C().findings, closed = fs.filter(function (f) { return findingStatus(f) === "closed"; }).length, residual = fs.filter(function (f) { return findingStatus(f) === "residual"; }).length;
    r.appendChild(progressBar(Math.round((closed + residual) * 100 / fs.length), "المشكلات المعالجة"));
    r.appendChild(h("p.board-count", { "data-testid": "report-count", text: "مغلقة: " + closed + " • متبقية: " + residual + " • مفتوحة: " + (fs.length - closed - residual) + " (من " + fs.length + ")" }));
    var full = idx().some(function (l) { return l.id === "l10-verify"; }) && P.complete("l10-verify");
    if (!full) {
      r.appendChild(reportTable());
      r.appendChild(h("p.muted", { text: "التقرير الكامل (الملخص التنفيذي والأدلة والتوصيات) يظهر هنا بعد الدرس 10: إعادة الفحص." }));
    } else {
      var rep = m.report;
      r.appendChild(h("section.card.full-report", { "aria-labelledby": "fr-h" },
        h("h2#fr-h", { text: "تقرير تقييم الأمن — مكتب السنابل للمحاسبة" }),
        h("h3", { text: "الملخص التنفيذي" }), h("p", { "data-testid": "exec-summary", text: rep.summary }),
        h("h3", { text: "النطاق والمدة" }),
        h("div.table-scroll", h("table.data", h("tbody", rep.scope.map(function (x) { return h("tr", h("th", { scope: "row", text: x[0] }), h("td", FSIM.core.ltr(x[1]))); })))),
        h("h3", { text: "المشكلات وحالتها والدليل" }), reportTable(true),
        h("h3", { text: "التوصيات" }), h("ol", rep.recommendations.map(function (x) { return h("li", FSIM.core.ltr(x)); })),
        h("p.no-print", (function () { var b = h("button.btn.btn-primary", { type: "button", text: "اطبع التقرير / احفظه PDF" }); b.addEventListener("click", function () { window.print(); }); return b; })()),
        h("p.muted", { text: "في الواقع يُسلَّم التقرير للعميل وحده، مشفّراً (كما في الدرس 9)." })));
    }

    /* completion codes */
    r.appendChild(h("h2", { text: "رموز الإنجاز" }));
    var sid = h("input", { id: "sid", type: "text", inputmode: "numeric", autocomplete: "off" }); sid.value = P.getStudent();
    r.appendChild(h("div.field", h("label", { "for": "sid", text: "رقمك الجامعي (يبقى في متصفحك ولا يُرسل)" }), sid));
    var codes = h("ul");
    r.appendChild(codes);
    function refresh() {
      codes.textContent = "";
      idx().forEach(function (l) {
        var li = h("li", { text: l.title + ": " });
        if (!P.complete(l.id)) li.appendChild(h("span.muted", { text: "أنهِ مراحل الدرس أولاً." }));
        else if (!sid.value.trim()) li.appendChild(h("span.muted", { text: "أدخل رقمك الجامعي." }));
        else li.appendChild(h("span.code-chip", { text: P.code(sid.value, l.id, l.axis) }));
        codes.appendChild(li);
      });
    }
    sid.addEventListener("input", function () { P.setStudent(sid.value); refresh(); });
    refresh();
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
    r.appendChild(h("h2", { text: "وصف المقرر" }));
    r.appendChild(c.description ? h("p", { text: c.description }) : h("p.muted", { text: "يُضاف وصف المقرر الرسمي عند توفيره من الأستاذ." }));
    r.appendChild(h("h2", { text: "وحدات الكتاب" }));
    r.appendChild(h("div.table-scroll", h("table.data", h("thead", h("tr", h("th", { text: "الوحدة" }), h("th", { text: "العنوان" }))),
      h("tbody", c.units.map(function (u) { return h("tr", h("td", { text: String(u.n) }), h("td", { text: u.title })); })))));
    r.appendChild(h("h2", { text: "لماذا هذه البرامج؟" }));
    r.appendChild(h("p", { text: "اختيرت البرامج لأنها الأفضل والمعتمدة مهنياً اليوم، وأغلبها مدمج في Windows أو مجاني، فيستطيع الطالب تجربتها لاحقاً على جهازه. أدوات الكتاب القديمة تظهر في بطاقة «في الكتاب ← اليوم» داخل الدرس المناسب." }));
    r.appendChild(h("div.note.note-info", h("strong", { text: "من جهة الدفاع فقط: " }),
      document.createTextNode("الطالب في كل الدروس مدافع مفوَّض. الثغرات تُعرض كما يعرضها الماسح (اسم وخطورة ووصف وحلّ) بلا أي تفاصيل لطريقة استغلالها، ولا توجد في الموقع أي أداة هجوم.")));
    r.appendChild(h("p.muted", { text: "مصدر عناوين الوحدات: " + c.unitsSource }));
  }

  /* ---------------- verify (instructor page; not linked from menus) ---------------- */
  function verify() {
    var r = root();
    r.appendChild(h("h1.page-title", { text: "التحقق من رمز الإنجاز" }));
    r.appendChild(h("div.note", { text: "رادع خفيف وليس أماناً: الموقع ثابت ولا يمنع التزوير. يُستخدم للمطابقة السريعة فقط." }));
    var sid = h("input", { id: "v-sid", type: "text", inputmode: "numeric", autocomplete: "off" });
    var sel = h("select", { id: "v-lesson" }, idx().map(function (l) { return h("option", { value: l.id, text: l.title }); }));
    var code = h("input", { id: "v-code", type: "text", autocomplete: "off", dir: "ltr", placeholder: "A1-XXXX" });
    var out = h("p", { "aria-live": "polite", role: "status" });
    var go = h("button.btn.btn-primary", { type: "button", text: "تحقّق" });
    go.addEventListener("click", function () {
      var l = idx().filter(function (x) { return x.id === sel.value; })[0];
      if (!sid.value.trim() || !code.value.trim() || !l) { out.textContent = "أكمل الحقول الثلاثة."; return; }
      var ok = P.code(sid.value, l.id, l.axis) === code.value.trim().toUpperCase();
      out.className = "note" + (ok ? " note-info" : " note-danger");
      out.textContent = ok ? "✔ الرمز مطابق لهذا الرقم الجامعي وهذا الدرس." : "✘ الرمز غير مطابق.";
    });
    r.appendChild(h("div.card",
      h("div.field", h("label", { "for": "v-sid", text: "الرقم الجامعي" }), sid),
      h("div.field", h("label", { "for": "v-lesson", text: "الدرس" }), sel),
      h("div.field", h("label", { "for": "v-code", text: "الرمز" }), code), go, out));
  }

  FSIM.core.pages = { findingStatus: findingStatus };
  var pageId = document.body.getAttribute("data-page");
  var map = { home: home, about: about, mission: missionPage, verify: verify };
  if (map[pageId]) map[pageId]();
})();
