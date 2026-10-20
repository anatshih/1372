/* FSIM.core.lesson — renders one lesson page: Explain → Practice → Interpret (CLAUDE.md §4, as in 1462).
   Content comes from FSIM.lessons[id] (content/lessons/<id>.js). All dynamic text uses textContent. */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, P = FSIM.core.progress, sleep = FSIM.core.sleep;
  var STAGE_LABEL = { explain: "الشرح", practice: "التطبيق", interpret: "التفسير" };
  var STATE_LABEL = { before: "قبل المعالجة", after: "بعد المعالجة" };
  var TOTAL_LESSONS = 10; // the ten approved lessons (CLAUDE.md §3); the intro is not counted

  /* ---------- shared helpers ---------- */
  function norm(v) { return String(v == null ? "" : v).toLowerCase().replace(/[\u064B-\u0652]/g, "").replace(/\s+/g, " ").replace(/[.\u061B,،]+$/g, "").trim(); }

  /* quiz: choice or short value, corrected immediately with a reason; after 2 misses the answer is revealed */
  function renderQuiz(host, quiz, onDone, already) {
    var wrong = 0, finished = false;
    var box = h("div.quiz", h("p.q", { text: quiz.q }));
    var fb = h("p.quiz-fb", { role: "status", "aria-live": "polite", hidden: "" });
    function finish(ok, revealed) {
      if (finished) return; finished = true;
      fb.hidden = false; fb.className = "quiz-fb " + (ok ? "ok" : "bad");
      fb.textContent = (ok ? "✔ إجابة صحيحة. " : "الإجابة الصحيحة: " + quiz.answer + ". ") + (quiz.why || "");
      Array.prototype.forEach.call(box.querySelectorAll("button,input"), function (e) { e.disabled = true; });
      if (onDone) onDone(ok, revealed);
    }
    function miss() {
      wrong++;
      if (wrong >= 2) { finish(false, true); return; }
      fb.hidden = false; fb.className = "quiz-fb bad";
      fb.textContent = "ليست الإجابة الصحيحة. فكّر في الشرح أعلاه وحاول مرة أخرى.";
    }
    if (quiz.type === "reveal") {
      /* think first, then reveal: for cards whose answer is a short explanation */
      var rv = h("button.btn", { type: "button", "data-reveal": "", text: "فكّر، ثم اضغط: أظهر الإجابة" });
      rv.addEventListener("click", function () { finish(true); fb.textContent = "الإجابة: " + quiz.answer + (quiz.why ? ". " + quiz.why : ""); });
      box.appendChild(h("div.quiz-value", rv));
    } else if (quiz.type === "value") {
      var inp = h("input", { type: "text", "aria-label": "إجابتك", autocomplete: "off", spellcheck: "false", dir: "ltr" });
      var ok = h("button.btn.btn-primary", { type: "button", text: "تحقّق" });
      var accept = [quiz.answer].concat(quiz.accept || []).map(norm);
      var check = function () { if (!inp.value.trim()) return; if (accept.indexOf(norm(inp.value)) >= 0) finish(true); else miss(); };
      ok.addEventListener("click", check);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); check(); } });
      box.appendChild(h("div.quiz-value", inp, ok));
    } else {
      var opts = h("div.quiz-opts", { role: "group", "aria-label": "الخيارات" });
      quiz.options.forEach(function (o) {
        var b = h("button.quiz-opt", { type: "button", text: o });
        b.addEventListener("click", function () {
          if (finished) return;
          if (o === quiz.answer) { b.classList.add("is-right"); finish(true); }
          else { b.classList.add("is-wrong"); b.disabled = true; miss(); }
        });
        opts.appendChild(b);
      });
      box.appendChild(opts);
    }
    box.appendChild(fb);
    host.appendChild(box);
    if (already) finish(true);
    return box;
  }

  /* concept card body rows (the fixed 7-part order) */
  function cardRows(c, withQuiz, quizDone, alreadyDone, short) {
    var rows = [
      ["① التشبيه", c.analogy], ["② المعنى", c.meaning], ["③ كيف تراه في البرنامج", c.inTool, "tool"],
      ["④ لماذا يهم المدافع", c.forDefender], ["⑤ مثال من المهمة", c.fromFrame], ["⑥ خطأ شائع", c.mistake, "mistake"]
    ];
    var frag = document.createDocumentFragment(), more = null;
    rows.forEach(function (r, i) {
      var val;
      if (r[2] === "tool") val = h("pre.c-tool", { text: Array.isArray(r[1]) ? r[1].join("\n") : r[1], tabindex: "0", lang: "en", dir: "ltr" });
      else val = h("div", { text: r[1] });
      var row = h("div.c-row" + (r[2] === "mistake" ? ".c-mistake" : ""), h("div.c-label", { text: r[0] }), val);
      if (short && i >= 3) {
        if (!more) {
          more = h("div.c-more", { hidden: "" });
          var tg = h("button.btn.c-more-btn", { type: "button", "aria-expanded": "false", text: "اقرأ المزيد: لماذا يهم، ومثال من المهمة، وخطأ شائع ▾" });
          tg.addEventListener("click", function () { var open = more.hidden; more.hidden = !open; tg.setAttribute("aria-expanded", String(open)); tg.textContent = open ? "إخفاء التفاصيل ▴" : "اقرأ المزيد: لماذا يهم، ومثال من المهمة، وخطأ شائع ▾"; });
          frag.appendChild(tg); frag.appendChild(more);
        }
        more.appendChild(row);
      } else frag.appendChild(row);
    });
    if (withQuiz) {
      var q = h("div.c-row", h("div.c-label", { text: "سؤال فهم (اختياري)" }), h("div"));
      renderQuiz(q.lastChild, c.quiz, quizDone, alreadyDone);
      frag.appendChild(q);
    }
    return frag;
  }

  function dialog(title, bodyNode, returnFocus) {
    var closeBtn = h("button.btn.btn-primary", { type: "button", text: "إغلاق" });
    var dlg = h("div.fsim-dialog", { role: "dialog", "aria-modal": "true", "aria-label": title, tabindex: "-1" }, h("h3", { text: title }), bodyNode, h("div.actions", closeBtn));
    var back = h("div.fsim-dialog-backdrop", dlg);
    function close() { back.remove(); document.removeEventListener("keydown", esc); if (returnFocus) returnFocus.focus(); }
    function esc(e) { if (e.key === "Escape") close(); }
    closeBtn.addEventListener("click", close);
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    document.addEventListener("keydown", esc);
    document.body.appendChild(back);
    closeBtn.focus();
    return { close: close };
  }

  /* ================= lesson page ================= */
  function init() {
    var root = document.getElementById("lesson-root");
    var id = document.body.getAttribute("data-lesson");
    var L = FSIM.lessons[id];
    if (!root || !L) { if (root) root.textContent = "تعذّر تحميل محتوى الدرس."; return; }
    root.textContent = "";
    document.title = L.title + " — مختبر إدارة الثغرات الافتراضي";

    var concepts = (L.explain && L.explain.cards) || [];
    var conceptById = {}; concepts.forEach(function (c) { conceptById[c.id] = c; });
    var STAGES = L.stages || P.STAGES;
    var phase = null, mode = "guided", stepper = null, stage = null, watchCancel = null;
    var panels = {}, tabs = {};
    /* position of this lesson in the course (content/lessons-index.js) for previous / next links */
    var pos = (function () { var list = (FSIM.data && FSIM.data.lessonIndex) || []; var i = list.findIndex(function (x) { return x.id === id; }); return { list: list, i: i, prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null }; })();
    function lessonNav() {
      return h("nav.lesson-nav", { "aria-label": "التنقل بين الدروس" },
        pos.prev ? h("a.btn", { href: pos.prev.id + ".html", text: "→ الدرس السابق: " + pos.prev.title }) : h("span"),
        pos.next ? h("a.btn.btn-primary", { href: pos.next.id + ".html", "data-next-lesson": pos.next.id, text: "الدرس التالي: " + pos.next.title + " ←" }) : h("a.btn.btn-primary", { href: "../index.html", text: "العودة إلى الرئيسية" }));
    }

    /* ---- header ---- */
    var meta = h("div.meta",
      h("span.chip", { text: L.axis ? "المحور " + L.axis : "المدخل" }),
      L.units && L.units.length ? h("span.chip", { text: "وحدات الكتاب: " + L.units.join("، ") }) : null,
      L.tools && L.tools.length ? h("span.chip", { lang: "en", dir: "ltr", text: L.tools.join(" • ") }) : null,
      h("span.chip", { text: "≈ " + L.minutes + " دقيقة" }));
    root.appendChild(h("header.lesson-head",
      h("nav.breadcrumb", { "aria-label": "مسار التنقل" }, h("a", { href: "../index.html", text: "الرئيسية" }), " › ", L.axisTitle || ("المحور " + L.axis), L.seq ? " › الدرس " + L.seq + " من " + TOTAL_LESSONS : ""),
      h("h1", { text: L.title }), meta,
      L.guide ? h("aside.guide-box", { "aria-label": "دليل الدرس" }, h("p", h("strong", { text: "في هذا الدرس ستفعل " + L.guide.length + " أشياء (≈ " + L.minutes + " دقيقة):" })),
        h("ol", L.guide.map(function (o) { return h("li", { text: o }); })),
        h("p.muted", { text: "الطريق: ١. اقرأ البطاقات الأساسية ← ٢. طبّق الخطوات (كل خطوة مكتوبة أمامك، وزر «أرني» يعرضها) ← ٣. افهم النتيجة وأجب عن 3 أسئلة." })) : null,
      L.objectives ? h("details.objectives", h("summary", { text: "أهداف الدرس" }), h("ul", L.objectives.map(function (o) { return h("li", { text: o }); }))) : null));

    /* ---- this lesson's place in the consultant's mission (two lines; the full mission is on mission.html) ---- */
    var CB = L.caseBranch;
    if (CB) root.appendChild(h("aside.case-box", { "aria-label": "هذا الدرس في مهمة المستشار" },
      h("p.case-box-title", h("strong", { text: "هذا الدرس في مهمة المستشار: " }), CB.question),
      h("p", h("strong", { text: "ماذا نعرف حتى الآن: " }), CB.known),
      h("p", h("strong", { text: "ماذا نفعل الآن: " }), CB.now),
      h("a", { href: "../mission.html", text: "عرض تقرير تقييم الأمن" })));

    /* ---- phase navigation ---- */
    var nav = h("ol.phases", { "aria-label": "مراحل الدرس" });
    STAGES.forEach(function (st, i) {
      var b = h("button.phase-tab", { type: "button", "data-phase": st }, h("span.num", { text: String(i + 1) }), STAGE_LABEL[st]);
      b.addEventListener("click", function () { go(st); });
      tabs[st] = b; nav.appendChild(h("li", b));
    });
    root.appendChild(nav);
    var live = h("div.sr-only", { "aria-live": "polite" });
    root.appendChild(live);

    STAGES.forEach(function (st) { var p = h("section.phase-panel", { id: "panel-" + st, "aria-labelledby": "h-" + st, hidden: "" }); panels[st] = p; root.appendChild(p); });

    function unlocked(st) {
      return true; // the three stages are always reachable; the order is a recommendation (explain first), never a lock
    }
    function refreshNav() {
      STAGES.forEach(function (st) {
        var b = tabs[st];
        b.classList.toggle("is-current", st === phase);
        b.classList.toggle("is-done", P.isDone(id, st));
        b.setAttribute("aria-disabled", unlocked(st) ? "false" : "true");
        if (st === phase) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
    }
    function go(st) {
      if (!unlocked(st)) { live.textContent = "أنهِ المرحلة السابقة أولاً."; return; }
      if (phase === "practice" && st !== "practice") { setFocus(false); teardownPractice(); }
      phase = st;
      document.body.setAttribute("data-active-phase", st);
      STAGES.forEach(function (s) { panels[s].hidden = s !== st; });
      if (!panels[st].getAttribute("data-built")) { build[st](); panels[st].setAttribute("data-built", "1"); }
      else if (st === "practice") buildPractice();
      P.setLast(id, st);
      refreshNav();
      var hd = panels[st].querySelector("h2"); if (hd) { hd.setAttribute("tabindex", "-1"); hd.focus({ preventScroll: false }); }
    }

    /* ================= EXPLAIN ================= */
    var build = {};
    build.explain = function () {
      var p = panels.explain;
      p.appendChild(h("h2#h-explain", { text: "قبل أن تبدأ: مفاهيم تحتاجها" }));
      if (L.explain.intro) p.appendChild(h("p.lead", { text: L.explain.intro }));
      var core = concepts.filter(function (c) { return !c.extra; }), extras = concepts.filter(function (c) { return c.extra; });
      p.appendChild(h("p.muted", { text: "اقرأ " + core.length + " بطاقات أساسية قصيرة. كل بطاقة: تشبيه، ومعنى، وكيف تراه في البرنامج؛ وزر «اقرأ المزيد» لمن يريد التفصيل." }));
      var list = h("div.concept-list");
      p.appendChild(list);
      var cards = [];
      var seenCount = 0;
      var figHost = null;
      var nextStage = STAGES[STAGES.indexOf("explain") + 1] || null;
      var startBtn = h("button.btn.btn-primary#to-" + (nextStage || "end"), { type: "button", text: nextStage ? "تابع إلى " + STAGE_LABEL[nextStage] + " ←" : "العودة إلى الرئيسية" });
      var progressNote = h("p.muted", { "aria-live": "polite" });
      var next = h("div.phase-next", progressNote, startBtn);

      function updateGate() {
        var allSeen = seenCount >= core.length;
        progressNote.textContent = allSeen ? "" : "اطّلعت على " + seenCount + " من " + core.length + " بطاقات أساسية.";
        if (allSeen && !P.isDone(id, "explain")) { P.mark(id, "explain"); refreshNav(); }
        if (allSeen) whatBox.hidden = false;
      }
      function markSeen(rec, c) {
        if (rec.seen) return;
        rec.seen = true; seenCount++; P.markCard(id, c.id);
        rec.card.classList.add("is-done");
        if (!rec.answered) rec.head.querySelector(".state").textContent = "✔ اطّلعت";
        updateGate();
      }
      core.forEach(function (c, i) {
        var already = !!P.get(id).cards[c.id];
        var head = h("button.concept-head", { type: "button", "aria-expanded": "false", id: "ch-" + c.id },
          h("span.cnum", { text: String(i + 1) }), h("span", { text: c.ar }), h("span.cen", { text: c.en || "" }), h("span.state", { text: "" }));
        var body = h("div.concept-body", { role: "region", "aria-labelledby": "ch-" + c.id, hidden: "" });
        var card = h("article.concept", head, body);
        var built = false;
        var rec = { card: card, head: head, body: body, seen: false, answered: false };
        function ensure() {
          if (built) return; built = true;
          body.appendChild(cardRows(c, true, function (ok) {
            rec.answered = true; rec.head.querySelector(".state").textContent = "✔ أُجيب";
          }, false, true));
          var nxt = i < core.length - 1
            ? h("button.btn.btn-primary", { type: "button", "data-next-card": "", text: "البطاقة التالية: " + core[i + 1].ar + " ←" })
            : h("button.btn.btn-primary", { type: "button", "data-next-card": "", text: L.explain.figure ? "إلى الرسم التفاعلي ↓" : (nextStage ? "تابع إلى " + STAGE_LABEL[nextStage] + " ←" : "إلى الأسفل ↓") });
          nxt.addEventListener("click", function () {
            head.setAttribute("aria-expanded", "false"); body.hidden = true;
            if (i < core.length - 1) { openCard(i + 1); cards[i + 1].head.scrollIntoView({ block: "start", behavior: FSIM.core.config.fast ? "auto" : "smooth" }); cards[i + 1].head.focus({ preventScroll: true }); }
            else if (L.explain.figure) { figHost.scrollIntoView({ block: "start", behavior: FSIM.core.config.fast ? "auto" : "smooth" }); }
            else if (nextStage) go(nextStage);
          });
          body.appendChild(h("div.card-next", h("span.muted", { text: "بطاقة " + (i + 1) + " من " + core.length }), nxt));
        }
        rec.ensure = ensure;
        head.addEventListener("click", function () {
          var open = head.getAttribute("aria-expanded") === "true";
          if (open) { head.setAttribute("aria-expanded", "false"); body.hidden = true; }
          else { ensure(); head.setAttribute("aria-expanded", "true"); body.hidden = false; markSeen(rec, c); }
        });
        if (already) { rec.seen = true; seenCount++; card.classList.add("is-done"); head.querySelector(".state").textContent = "✔ اطّلعت"; }
        cards.push(rec); list.appendChild(card);
      });
      function openCard(i) { var r = cards[i]; r.ensure(); r.head.setAttribute("aria-expanded", "true"); r.body.hidden = false; markSeen(r, core[i]); }
      var firstUnseen = cards.findIndex(function (r) { return !r.seen; });
      if (core.length) openCard(firstUnseen < 0 ? 0 : firstUnseen);
      /* optional cards: full text, never required */
      if (extras.length) p.appendChild(h("details.learn-more-cards", h("summary", { text: "اعرف أكثر (اختياري): " + extras.length + " بطاقات إضافية لمن يريد التوسع" }),
        extras.map(function (c) { return h("details.concept.is-extra", { id: "cx-" + c.id }, h("summary.concept-head", h("span", { text: c.ar }), h("span.cen", { text: c.en || "" })), h("div.concept-body", cardRows(c, true, null, false, false))); })));

      /* interactive diagram */
      figHost = h("div");
      p.appendChild(figHost);
      if (L.explain.figure && FSIM.core.figures[L.explain.figure]) FSIM.core.figures[L.explain.figure](figHost, {});

      var whatBox = h("div.note.note-info", { hidden: "" }, h("strong", { text: nextStage === "practice" ? "ماذا ستفعل في التطبيق؟ " : "ماذا بعد؟ " }), document.createTextNode(L.explain.whatNext || ""));
      p.appendChild(whatBox);
      p.appendChild(next);
      startBtn.addEventListener("click", function () { if (nextStage) go(nextStage); else window.location.href = "../index.html"; });
      updateGate();
    };

    /* ================= PRACTICE ================= */
    var launchers = {}, demoGeneration = 0;
    function teardownPractice() {
      demoGeneration++;
      bus.resetScope();
      if (stage && stage.destroy) stage.destroy();
      stage = null;
      if (watchCancel) { watchCancel(); watchCancel = null; }
      if (stepper) { stepper.destroy(); stepper = null; }
    }

    build.practice = function () {
      var pr = L.practice, p = panels.practice;
      p.appendChild(h("h2#h-practice", { text: "التطبيق — تدريب داخل المتصفح" }));
      p.appendChild(h("div.practice-scenario", h("strong", { text: "السيناريو: " }), document.createTextNode(pr.scenario)));
      var modes = h("div.modes", { role: "group", "aria-label": "وضع التطبيق" }, h("span.label", { text: "الوضع:" }));
      [["guided", "جرّب بتوجيه"], ["watch", "شاهد"], ["free", "جرّب حراً"]].forEach(function (m) {
        var b = h("button.mode-btn", { type: "button", "data-mode": m[0], "aria-pressed": m[0] === mode ? "true" : "false", text: m[1] });
        b.addEventListener("click", function () {
          mode = m[0];
          Array.prototype.forEach.call(modes.querySelectorAll(".mode-btn"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          buildPractice();
        });
        modes.appendChild(b);
      });
      p.appendChild(h("p.muted", { text: "لا يوجد تسليم. تغيير الوضع أو الضغط على «من جديد» يعيد تجربة التطبيق من بدايتها؛ تقدم الدروس المحفوظ يبقى كما هو." }));
      var freeBtn = modes.querySelector('[data-mode="free"]');
      freeBtn.setAttribute("aria-disabled", "false");
      p.appendChild(modes);
      p.appendChild(h("div.note.mobile-hint", { text: "للتطبيق الأفضل استخدم حاسوباً: البرامج الحقيقية برامج حاسوب، ونافذة المحاكاة تُمرَّر أفقياً على الشاشات الصغيرة." }));
      p.appendChild(h("div.practice-grid", h("aside.steps-panel#steps-panel", { "aria-label": "لوحة الخطوات" }), h("div.stage-wrap", h("div.stage-bar#stage-bar"), h("div.stage#stage"))));
      p.appendChild(h("div.phase-next", h("button.btn.btn-primary#to-interpret", { type: "button", hidden: "", text: "تابع إلى التفسير ←" })));
      document.getElementById("to-interpret").addEventListener("click", function () { go("interpret"); });
      buildPractice();
    };

    function buildPractice() {
      teardownPractice();
      var pr = L.practice;
      var stepsPanel = document.getElementById("steps-panel"), bar = document.getElementById("stage-bar"), stEl = document.getElementById("stage");
      stepsPanel.textContent = "";
      function setupStage() {
      bus.resetScope();
      if (stage && stage.destroy) stage.destroy();
      bar.textContent = ""; stEl.textContent = ""; launchers = {};
      FSIM.core.sim.state = pr.state || "before";
      FSIM.core.sim.cwd = pr.cwd || null;
      FSIM.core.sim.preset = pr.preset || {}; /* e.g. scans already saved in earlier lessons (lesson 10) */
      FSIM.core.sim.data = {}; /* shared, per-practice state between windows (files, policy, security log…) */
      refreshModeButtons();
      stage = FSIM.core.windows.Stage(stEl);

      /* launchers + state switch */
      var LABELS = { cmd: "Command Prompt", cmdadmin: "Command Prompt (Administrator)", taskmgr: "Task Manager", zenmap: "Zenmap", nessus: "Nessus Essentials", winupdate: "Settings", defender: "Windows Security", autoruns: "Autoruns", firewall: "Windows Defender Firewall", wireshark: "Wireshark", secpol: "Local Security Policy", eventviewer: "Event Viewer", keepassxc: "KeePassXC", sevenzip: "7-Zip" };
      function launch(tool, auto) {
        var win;
        if (FSIM.tools[tool] && FSIM.tools[tool].open) {
          var n = stage.list().length;
          win = FSIM.tools[tool].open(stage, { x: 14 + 30 * n, y: 14 + 30 * n });
          if (LABELS[tool]) addLauncher({ tool: tool, label: LABELS[tool] });
        }
        if (win) { win.open(); if (!auto) bus.emit("tool:launch", { tool: tool }); }
        return win;
      }
      function addLauncher(l) {
        if (launchers[l.tool]) return;
        var b = h("button", { type: "button", "data-launch": l.tool, text: l.label });
        b.addEventListener("click", function () { launch(l.tool); });
        launchers[l.tool] = b; bar.insertBefore(b, bar.querySelector(".spacer"));
      }
      bar.appendChild(h("span", { text: "التطبيقات:" }));
      bar.appendChild(h("span.spacer"));
      (pr.launchers || []).forEach(addLauncher);
      if (pr.states && pr.states.length > 1) {
        var sel = h("select", { "aria-label": "حالة الجهاز" }, pr.states.map(function (s) { return h("option", { value: s.id, text: s.label }); }));
        sel.value = FSIM.core.sim.state;
        sel.addEventListener("change", function () { FSIM.core.sim.state = sel.value; bus.emit("sim:state", { state: sel.value }); });
        bar.appendChild(h("label.state-toggle", h("span", { text: "حالة الجهاز:" }), sel));
        stage._sel = sel;
      }
      var grid = stEl.closest(".practice-grid");
      var big = h("button", { type: "button", "aria-pressed": String(stEl.classList.contains("is-large")), title: "تكبير الخط داخل النوافذ", text: "A+" });
      big.addEventListener("click", function () { var on = !stEl.classList.contains("is-large"); stEl.classList.toggle("is-large", on); big.setAttribute("aria-pressed", String(on)); FSIM.core.storage.get().ui.largeText = on; FSIM.core.storage.save(); });
      if (FSIM.core.storage.get().ui.largeText) { stEl.classList.add("is-large"); big.setAttribute("aria-pressed", "true"); }
      var again = h("button", { type: "button", title: "إعادة التطبيق من البداية", text: "↺ من جديد" });
      again.addEventListener("click", function () { buildPractice(); });
      var full = h("button", { type: "button", "data-focus-toggle": "", "aria-pressed": String(grid.classList.contains("is-focus")), text: grid.classList.contains("is-focus") ? "✕ إنهاء ملء الشاشة" : "⛶ ملء الشاشة" });
      full.addEventListener("click", function () { setFocus(!grid.classList.contains("is-focus")); });
      bar.appendChild(h("span.stage-tools", big, again, full));
      (pr.launchers || []).forEach(function (l) { if (l.auto) launch(l.tool, true); });
      }
      setupStage();

      var toNext = document.getElementById("to-interpret");
      toNext.hidden = false;

      if (mode === "free") {
        stepsPanel.appendChild(h("h3", { text: "التجربة الحرة" }));
        stepsPanel.appendChild(h("p", { text: pr.freeNote || "لا تلميحات هنا. حاول الوصول إلى الأهداف التالية بنفسك، ثم راجع التفسير." }));
        stepsPanel.appendChild(h("p.muted", { text: "المربعات التالية قائمة تذكير ذاتية؛ لا تُحتسب تحققاً آلياً من التنفيذ." }));
        stepsPanel.appendChild(h("ul", pr.steps.map(function (s) { return h("li", h("label", h("input", { type: "checkbox" }), " " + (s.title || s.instruction))); })));
        return;
      }
      stepsPanel.appendChild(h("h3", { text: mode === "watch" ? "شاهد خطوة بخطوة" : "الخطوات" }));
      if (mode === "guided") stepsPanel.appendChild(h("p.steps-help", { text: "نفّذ داخل النافذة للانتقال تلقائياً. «أرني هذه الخطوة» يعرض التنفيذ ثم يتوقف حتى تضغط «فهمت». المشاهدة تُسجَّل منفصلة عن التطبيق بنفسك." }));
      if (mode === "watch") stepsPanel.appendChild(h("p.steps-help", { text: "اضغط «أرني هذه الخطوة»، شاهد التنفيذ، ثم اضغط «فهمت» عندما تكون مستعداً. يمكنك إعادة العرض قبل الانتقال." }));
      var host = h("div"); stepsPanel.appendChild(host);
      stepper = FSIM.core.stepper.create(host, pr.steps, {
        mode: mode,
        onStep: function (st) {
          var m = /data-win=\\?"([a-z]+)\\?"/.exec(st.target || "");
          var w = m && stage && stage.get(m[1]);
          if (w && w.isOpen) w.focus();
        },
        onShow: async function (st, replay) {
          var generation = demoGeneration;
          function alive() { return phase === "practice" && demoGeneration === generation; }
          if (replay) {
            setupStage();
            var fast = FSIM.core.config.fast;
            FSIM.core.config.fast = true;
            try {
              for (var i = 0; i < pr.steps.indexOf(st); i++) await FSIM.core.demo.run(pr.steps[i], stage, launchers, alive);
            } finally { FSIM.core.config.fast = fast; }
          }
          return FSIM.core.demo.run(st, stage, launchers, alive);
        },
        onFill: function (st) { var w = stage.get(st.expect.tool || "cmd"); var t = w && w.body.api && w.body.api.term; if (t) { w.open(); t.fill(st.solution); } },
        onComplete: function (evidence) {
          var observed = evidence.filter(function (x) { return x.method === "observed"; }).length;
          P.recordPractice(id, evidence);
          if (mode === "guided") {
            P.mark(id, "practice"); refreshNav(); refreshModeButtons(); toNext.hidden = false;
            var goI = h("button.btn.btn-primary", { type: "button", text: "تابع إلى التفسير ←" });
            goI.addEventListener("click", function () { setFocus(false); go("interpret"); });
            host.appendChild(h("div.completion", { role: "status" }, h("strong", { text: "أحسنت! " }), document.createTextNode(observed ? "أنهيت الخطوات: شاهدت " + observed + " ونفّذت بنفسك " + (evidence.length - observed) + ". أعد التجربة دون العرض لترسّخ المهارة، أو تابع إلى التفسير. " : "أكملت التطبيق بنفسك. تابع إلى تفسير النتائج. "), goI));
          } else if (mode === "watch") {
            host.appendChild(h("div.note.note-info", { text: "شاهدت جميع الخطوات. جرّب بنفسك في الوضع الموجَّه؛ المشاهدة وحدها لا تثبت إتقان التنفيذ." }));
          }
        }
      });

    }

    function refreshModeButtons() { /* free mode is always enabled */ }

    /* full-screen work area: steps on one side, the tool on the other; Esc leaves it */
    function onEsc(e) { if (e.key === "Escape") setFocus(false); }
    function setFocus(on) {
      var grid = document.querySelector("#panel-practice .practice-grid"); if (!grid) return;
      grid.classList.toggle("is-focus", on); document.body.classList.toggle("fsim-focus", on);
      var b = grid.querySelector("[data-focus-toggle]"); if (b) { b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "✕ إنهاء ملء الشاشة" : "⛶ ملء الشاشة"; }
      if (on) document.addEventListener("keydown", onEsc); else document.removeEventListener("keydown", onEsc);
    }

    /* ================= INTERPRET ================= */
    build.interpret = function () {
      var I = L.interpret, p = panels.interpret;
      p.appendChild(h("h2#h-interpret", { text: "التفسير: ماذا يعني الناتج؟" }));
      p.appendChild(h("p", { text: "اضغط على أي قيمة مظلّلة بالأصفر لتظهر بطاقة معناها. القيم التي تدل على مشكلة أمنية تُظلَّل باللون الوردي." }));

      /* annotated outputs */
      var tools = h("div.annot-tools", { role: "group", "aria-label": "اختر الناتج" });
      var paneHost = h("div");
      var meaning = h("div.meaning-card", { "aria-live": "polite", hidden: "" });
      /* the core values (hl.core) are the ones to discover; the others are optional extras */
      var coreHl = (I.highlights || []).filter(function (x) { return x.core; });
      if (!coreHl.length) coreHl = I.highlights || [];
      var found = {}, totalHl = coreHl.length;
      var counter = h("p.annot-count", { "aria-live": "polite", text: "اضغط القيم الأساسية (بإطار أزرق سميك). اكتشفت 0 من " + totalHl + "." });
      p.appendChild(tools); p.appendChild(counter); p.appendChild(paneHost); p.appendChild(meaning);
      var activeSrc = null;

      function showMeaning(hl, btn) {
        Array.prototype.forEach.call(p.querySelectorAll(".annot.is-open"), function (e) { e.classList.remove("is-open"); });
        btn.classList.add("is-open");
        meaning.hidden = false; meaning.classList.toggle("is-danger", !!hl.danger); meaning.textContent = "";
        meaning.appendChild(h("p", h("strong", { text: (hl.danger ? "⚠ مؤشر خطر: " : "") + hl.label + " " }), h("span.val", { text: hl.value || "" })));
        meaning.appendChild(h("p", { text: hl.meaning }));
        if (coreHl.indexOf(hl) >= 0 || coreHl.some(function (x) { return x.src === hl.src && x.label === hl.label; })) found[hl.src + "|" + hl.label] = true;
        var nf = Object.keys(found).length;
        counter.textContent = "اكتشفت " + nf + " من " + totalHl + " قيم أساسية" + (nf >= totalHl ? " ✔ ممتاز، انتقل إلى الأسئلة الثلاثة بالأسفل." : ". (القيم الأخرى المظلّلة إضافية لمن يريد.)");
        setTimeout(function () { meaning.scrollIntoView({ block: "nearest", behavior: FSIM.core.config.fast ? "auto" : "smooth" }); }, 0);
        if (hl.concept && conceptById[hl.concept]) {
          var rb = h("button.recall-link", { type: "button", text: "تذكير بالمفهوم: " + conceptById[hl.concept].ar });
          rb.addEventListener("click", function () { dialog(conceptById[hl.concept].ar + " — " + (conceptById[hl.concept].en || ""), (function () { var d = h("div"); d.appendChild(cardRows(conceptById[hl.concept], false)); return d; })(), rb); });
          meaning.appendChild(rb);
        }
      }
      function annot(hl, text, rtl) {
        var b = h("button.annot" + (hl.danger ? ".is-danger" : "") + (hl.core ? ".is-core" : ""), { type: "button", "aria-label": hl.label + ": " + text }, rtl ? FSIM.core.ltr(text) : text);
        b.addEventListener("click", function () { showMeaning(Object.assign({ value: text }, hl), b); });
        return b;
      }
      function renderTerminal(src) {
        var lines = FSIM.tools[src.tool].outputOf(src.cmd, src.state, src.setup);
        var mine = (I.highlights || []).filter(function (x) { return x.src === src.id; });
        var used = {};
        var pre = h("pre", { lang: "en", dir: "ltr", tabindex: "0" });
        lines.forEach(function (ln, li) {
          var found = [];
          mine.forEach(function (hl, hi) {
            if (used[hi] || ln.indexOf(hl.line || hl.match) < 0) return;
            var at = ln.indexOf(hl.match); if (at < 0) return;
            used[hi] = true; found.push({ at: at, hl: hl });
          });
          found.sort(function (a, b) { return a.at - b.at; });
          var pos = 0, line = h("div");
          found.forEach(function (f) {
            if (f.at < pos) return;
            line.appendChild(document.createTextNode(ln.slice(pos, f.at)));
            line.appendChild(annot(f.hl, f.hl.match)); pos = f.at + f.hl.match.length;
          });
          line.appendChild(document.createTextNode(ln.slice(pos) || (pos === 0 ? "\u00a0" : "")));
          pre.appendChild(line);
        });
        return h("div.annot-pane", h("div.annot-title", { text: src.heading || ((FSIM.tools[src.tool].prompt || "") + src.cmd + (src.state ? "   [" + (STATE_LABEL[src.state] || src.state) + "]" : "")) }), pre);
      }
      function renderAutoruns(src) {
        var mine = (I.highlights || []).filter(function (x) { return x.src === src.id; });
        var table = h("table.ar-table", { lang: "en", dir: "ltr" });
        var thead = h("thead", h("tr", ["Autorun Entry", "Description", "Publisher", "Image Path", "Timestamp"].map(function (c) { return h("th", { text: c }); })));
        table.appendChild(thead);
        var tb = h("tbody"); table.appendChild(tb);
        function cellFor(text, key, col) {
          var td = h("td");
          var hl = mine.filter(function (x) { return x.row === key && x.col === col; })[0];
          if (hl) td.appendChild(annot(hl, text)); else td.textContent = text;
          return td;
        }
        FSIM.tools.autoruns.entriesFor(src.tab, src.state).forEach(function (g) {
          var hh = mine.filter(function (x) { return x.row === "header:" + g.header; });
          var hc = h("td", { colspan: "4" }), tc = h("td");
          var hh1 = hh.filter(function (x) { return x.col === "header"; })[0], hh2 = hh.filter(function (x) { return x.col === "time"; })[0];
          if (hh1) hc.appendChild(annot(hh1, g.header)); else hc.textContent = g.header;
          if (hh2) tc.appendChild(annot(hh2, g.time)); else tc.textContent = g.time || "";
          tb.appendChild(h("tr.ar-header", hc, tc));
          g.entries.forEach(function (e) {
            tb.appendChild(h("tr.ar-row" + (e.cls ? ".is-" + e.cls : ""), cellFor(e.name, e.key, "name"), cellFor(e.desc, e.key, "desc"), cellFor(e.publisher, e.key, "publisher"), cellFor(e.path, e.key, "path"), cellFor(e.time, e.key, "time")));
          });
        });
        return h("div.annot-pane.is-light", h("div.annot-title", { text: "Autoruns › " + src.tab + (src.state ? "   [" + src.state + "]" : "") }), h("div.table-scroll", table));
      }
      function renderTable(src) {
        var mine = (I.highlights || []).filter(function (x) { return x.src === src.id; });
        var data = FSIM.tools[src.tool].annotTable(src);
        var table = data.rtl ? h("table.ar-table.is-rtl") : h("table.ar-table", { lang: "en", dir: "ltr" });
        table.appendChild(h("thead", h("tr", data.columns.map(function (c) { return h("th", { text: c }); }))));
        var tb = h("tbody"); table.appendChild(tb);
        data.rows.forEach(function (r) {
          tb.appendChild(h("tr.ar-row" + (r.cls ? ".is-" + r.cls.replace(/^is-/, "") : ""), r.cells.map(function (txt, ci) {
            var td = h("td"), hl = mine.filter(function (x) { return x.row === r.key && x.col === data.columns[ci]; })[0];
            var val = txt === null || txt === undefined ? "" : String(txt);
            if (hl) td.appendChild(annot(hl, val, data.rtl)); else if (data.rtl) td.appendChild(FSIM.core.ltr(val)); else td.textContent = val;
            return td;
          })));
        });
        return h("div.annot-pane.is-light", h("div.annot-title", { text: src.heading || src.title }), h("div.table-scroll", table));
      }
      function showSource(src, btn) {
        activeSrc = src.id;
        Array.prototype.forEach.call(tools.children, function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        paneHost.textContent = ""; meaning.hidden = true;
        paneHost.appendChild(src.kind === "autoruns" ? renderAutoruns(src) : src.kind === "table" ? renderTable(src) : renderTerminal(src));
      }
      (I.sources || []).forEach(function (src, i) {
        var b = h("button", { type: "button", "aria-pressed": "false", text: src.title });
        b.addEventListener("click", function () { showSource(src, b); });
        tools.appendChild(b);
        if (i === 0) showSource(src, b);
      });

      /* if-you-see table */
      p.appendChild(h("h3", { text: "إذا رأيت… فهذا يعني…" }));
      p.appendChild(h("div.table-scroll", h("table.data", h("thead", h("tr", h("th", { text: "إذا رأيت" }), h("th", { text: "فهذا يعني" }))),
        h("tbody", (I.table || []).map(function (r) { return h("tr", h("td", { text: r.see }), h("td", { text: r.means })); })))));

      if (I.ioc && I.ioc.length) {
        p.appendChild(h("h3", { text: "مؤشرات الخطر" }));
        p.appendChild(h("ul.ioc-list", I.ioc.map(function (x) { return h("li", { text: x }); })));
      }

      /* interpretation questions */
      /* only the non-extra questions are required to finish the lesson */
      var pending = I.questions.filter(function (q) { return !q.extra; }).length, qs = h("div"), qx = h("div");
      p.appendChild(h("h3", { text: "أسئلة التفسير (" + pending + ")" }));
      p.appendChild(qs);
      if (I.questions.some(function (q) { return q.extra; })) p.appendChild(h("details.extra-questions", h("summary", { text: "أسئلة إضافية (اختيارية) لمن يريد التدرّب أكثر" }), qx));
      function gate() { if (pending <= 0) completeLesson(); }
      I.questions.forEach(function (q, i) {
        var already = !!P.get(id).questions[i];
        var box = h("div.lab-q" + (q.extra ? ".is-extra" : ""), h("p", h("span.q-num", { text: (q.extra ? "سؤال إضافي" : "سؤال " + (i + 1)) + ": " })));
        (q.extra ? qx : qs).appendChild(box);
        if (already && !q.extra) pending--;
        renderQuiz(box, q, function () { if (!P.get(id).questions[i]) { P.markQuestion(id, i); if (!q.extra) pending--; } gate(); }, already);
      });

      /* completion + real world */
      var done = h("div#completion", { hidden: "" });
      p.appendChild(done);
      function completeLesson() {
        if (!P.isDone(id, "interpret")) { P.mark(id, "interpret"); refreshNav(); }
        showCompletion();
      }
      function showCompletion() {
        done.hidden = false; done.textContent = "";
        done.appendChild(h("div.completion", h("h3", { text: "أنهيت أسئلة التفسير" }),
          h("p", { text: "هذا الموقع للتدريب الذاتي فقط؛ لا يوجد تسليم أو رمز إنجاز مطلوب أو مناقشة مطلوبة." }),
          CB ? h("div.case-found", h("p", { text: CB.finding }), h("a", { href: "../mission.html#report", text: "راجع نتائج الحالة التدريبية" })) : null,
          h("p", { text: "اختبر نفسك: أعد التطبيق في وضع «جرّب حراً» وحاول تنفيذ الخطوات دون العرض أو التلميحات، ثم قارن النتائج في التفسير." }),
          pos.next ? h("p", h("a.btn.btn-primary", { href: pos.next.id + ".html", text: "الدرس التالي: " + pos.next.title + " ←" })) : null));
      }

      /* conclusion */
      var rw = L.realWorld || {};
      p.appendChild(h("h3", { text: "في البرنامج الحقيقي" }));
      p.appendChild(h("div.realworld",
        h("ul", (rw.versionNotes || []).map(function (n) { return h("li", { text: n }); })),
        rw.officialSite ? h("p", h("span", { text: "المصدر الرسمي للتنزيل: " }), h("a", { href: rw.officialSite, target: "_blank", rel: "noopener noreferrer", lang: "en", dir: "ltr", text: rw.officialSite })) : null));
      p.appendChild(lessonNav());
      if (P.isDone(id, "interpret")) showCompletion();
    };

    /* ---- start ---- */
    var start = "explain", hash = (window.location.hash || "").replace("#", "");
    if (hash && STAGES.indexOf(hash) >= 0) start = hash;
    else {
      var last = P.getLast();
      if (last && last.lesson === id && STAGES.indexOf(last.stage) >= 0) start = last.stage;
      else start = STAGES.filter(function (s) { return !P.isDone(id, s); })[0] || STAGES[STAGES.length - 1];
    }
    go(start);
  }

  FSIM.core.lesson = { init: init, renderQuiz: renderQuiz, norm: norm };
})();
