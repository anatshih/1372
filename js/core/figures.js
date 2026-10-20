/* FSIM.core.figures — the interactive diagrams of the "explain" phase (docs/concepts.md, one per lesson).
   Plain SVG + DOM, no libraries. Clicking / pressing Enter on a node shows its explanation. */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h;
  var NS = "http://www.w3.org/2000/svg";
  function C() { return FSIM.data.case; }

  function s(name, attrs, kids) {
    var n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function t(x, y, text, cls, anchor) {
    var n = s("text", { x: x, y: y, "text-anchor": anchor || "middle" });
    if (cls) n.setAttribute("class", cls);
    n.textContent = text;
    return n;
  }
  /* node = rect + title (Arabic) + sub (LTR value) */
  function node(id, x, y, w, hgt, title, sub, label) {
    return s("g", { "class": "node", tabindex: "0", role: "button", "data-node": id, "aria-label": label || (title + (sub ? " " + sub : "")) }, [
      s("rect", { x: x, y: y, width: w, height: hgt, rx: 10 }),
      t(x + w / 2, y + 24, title),
      sub ? t(x + w / 2, y + 44, sub, "ltr-text") : s("g")
    ]);
  }
  function link(id, x1, y1, x2, y2) { return s("line", { "class": "link", "data-link": id, x1: x1, y1: y1, x2: x2, y2: y2 }); }
  function activate(g, handler) {
    g.addEventListener("click", function () { handler(g.getAttribute("data-node")); });
    g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler(g.getAttribute("data-node")); } });
  }
  function clearActive(root) { Array.prototype.forEach.call(root.querySelectorAll(".is-active"), function (e) { e.classList.remove("is-active"); }); }
  function frame(title, sub, kids) { return h("div.figure", h("h3", { text: "الرسم التفاعلي: " + title }), sub ? h("p.muted", { text: sub }) : null, kids); }
  function stateSwitch(id, onChange) {
    var cb = h("input", { type: "checkbox", id: id });
    cb.addEventListener("change", function () { onChange(cb.checked ? "after" : "before"); });
    return h("label.switch", { "for": id }, cb, "بعد المعالجة");
  }

  /* ---------------- lesson 1: the office building and its numbered doors (ACC-PC1) ---------------- */
  function doors(host) {
    var state = "before";
    var DOORS = [
      ["135", "0.0.0.0", "svchost.exe (RpcSs)", 1012, "خدمة Windows أساسية (RPC). مفتوحة على كل الواجهات، وهي طبيعية في أجهزة Windows."],
      ["139", "192.168.50.21", "System", 4, "مشاركة الملفات القديمة (NetBIOS). طبيعية في شبكة مكتب يتشارك الملفات."],
      ["445", "0.0.0.0", "System", 4, "مشاركة الملفات (SMB). المكتب يستخدمها مع خادم الملفات FILESRV."],
      ["3389", "0.0.0.0", "svchost.exe (TermService)", 1180, "سطح المكتب البعيد. مفتوح لكل الشبكة، والمدير وحده يحتاجه: سنقيّده في الدرس 7."],
      ["5900", "0.0.0.0", "rhelper.exe", 4312, "برنامج دعم عن بُعد قديم منسي في C:\\Users\\Public\\rhelper\\. لا أحد يعرف لماذا يعمل. باب تحكم كامل مفتوح لكل الشبكة."],
      ["5939", "127.0.0.1", "AccountingSync.exe", 3876, "برنامج المحاسبة يستمع على 127.0.0.1 فقط: لا يصل إليه أي جهاز آخر. هذا هو الشكل الآمن لخدمة محلية."]
    ];
    var svg = s("svg", { "class": "fig-svg", viewBox: "0 0 780 300", role: "group", "aria-label": "واجهة مبنى ACC-PC1 وأبوابه المرقّمة" });
    svg.appendChild(s("rect", { "class": "zone", x: 14, y: 30, width: 752, height: 250, rx: 14 }));
    svg.appendChild(t(30, 54, "المبنى = ACC-PC1 (192.168.50.21) • الأبواب = المنافذ", "zone-label", "start"));
    var nodes = {};
    DOORS.forEach(function (d, i) {
      var x = 30 + i * 124;
      var g = node("p" + d[0], x, 90, 108, 150, "الباب " + d[0], d[1] === "127.0.0.1" ? "127.0.0.1" : "0.0.0.0", "المنفذ " + d[0]);
      g.querySelector("rect").setAttribute("class", "door");
      svg.appendChild(g); nodes[d[0]] = g; activate(g, function () { show(d); });
    });
    var explain = h("div.fig-explain", { "aria-live": "polite", text: "اضغط على أي باب لترى البرنامج الذي يقف خلفه، ومن يستطيع الوصول إليه." });
    function paint() {
      DOORS.forEach(function (d) {
        var g = nodes[d[0]], gone = state === "after" && d[0] === "5900";
        g.classList.toggle("is-bad", d[0] === "5900" && !gone);
        g.classList.toggle("is-ok", d[1] === "127.0.0.1");
        g.classList.toggle("is-gone", gone);
      });
    }
    function show(d) {
      clearActive(svg); nodes[d[0]].classList.add("is-active");
      if (state === "after" && d[0] === "5900") { explain.textContent = "الباب 5900 بعد المعالجة: لا برنامج خلفه (أُزيل rhelper.exe في الدرس 6)، والجدار الناري يحجبه (الدرس 7)."; return; }
      explain.textContent = "المنفذ " + d[0] + " — يستمع على " + d[1] + " — البرنامج: " + d[2] + " (PID " + d[3] + "). " + d[4] +
        (d[1] === "127.0.0.1" ? "" : " لأنه على 0.0.0.0 يصل إليه كل جهاز في الشبكة.");
    }
    paint();
    host.appendChild(frame("مبنى المكاتب وأبوابه", "الأحمر باب مفتوح بلا حاجة، والأخضر باب لا يُفتح إلا من داخل الجهاز.", [h("div.fig-controls", stateSwitch("fig-doors-state", function (v) { state = v; paint(); explain.textContent = v === "after" ? "بعد المعالجة: اختفى الباب 5900. بقي 3389 مستمعاً داخل الجهاز، لكن الجدار الناري يقصره على جهاز المدير." : "قبل المعالجة: ستة أبواب، أحدها (5900) لا يعرف أحد لماذا هو مفتوح."; })), svg, explain]));
  }

  /* ---------------- lesson 2: the network map as the scanner sees it ---------------- */
  function netmap(host) {
    var state = "before", discovered = false;
    var svg = s("svg", { "class": "fig-svg", viewBox: "0 0 780 320", role: "group", "aria-label": "خريطة الشبكة 192.168.50.0/24" });
    svg.appendChild(s("rect", { "class": "zone", x: 14, y: 14, width: 752, height: 292, rx: 14 }));
    svg.appendChild(t(30, 38, "شبكة المكتب 192.168.50.0/24", "zone-label", "start"));
    var pos = { consultant: [320, 230], gw: [40, 70], filesrv: [210, 70], acc1: [380, 70], acc2: [550, 70], printer: [620, 230] };
    var nodes = {};
    C().hosts.forEach(function (x) {
      var p = pos[x.id];
      svg.appendChild(link(x.id, 380, 255, p[0] + 70, p[1] + 28));
      var g = node(x.id, p[0], p[1], 140, 56, x.name, x.ip);
      svg.appendChild(g); nodes[x.id] = g; activate(g, show);
    });
    var explain = h("div.fig-explain", { "aria-live": "polite", text: "اضغط «Ping scan» لتكتشف الأجهزة، ثم اضغط على أي جهاز لترى أبوابه كما يراها الماسح من الخارج." });
    var ping = h("button.btn", { type: "button", "data-fig": "ping", text: "Ping scan" });
    ping.addEventListener("click", function () { discovered = true; Object.keys(nodes).forEach(function (k) { nodes[k].classList.add("is-up"); }); explain.textContent = "6 أجهزة تعمل (Host is up)، منها الطابعة 192.168.50.30 التي لم يذكرها المدير، وجهازك أنت 192.168.50.100."; });
    function show(id) {
      clearActive(svg); nodes[id].classList.add("is-active");
      var x = C().hosts.filter(function (y) { return y.id === id; })[0];
      if (!discovered) { explain.textContent = "لم نكتشف الأجهزة بعد: ابدأ بـ Ping scan."; return; }
      var q = C().nmap.quick[x.ip]; if (q.before) q = q[state];
      if (id === "consultant") { explain.textContent = x.name + " — هذا جهازك (جهاز الفحص). لا أبواب مفتوحة عليه."; return; }
      explain.textContent = x.name + " (" + x.ip + ") — " + x.role + ". الأبواب المفتوحة: " + q.ports.map(function (p) { return p[0] + " " + p[1]; }).join("، ") + ". والباقي: " + q.notShown + "." +
        (id === "acc1" && state === "before" ? " لاحظ 5900 (vnc): تحكم عن بعد غير متوقع." : "") + (id === "printer" ? " لاحظ 23 (telnet): إدارة بلا تشفير." : "");
    }
    host.appendChild(frame("خريطة الشبكة كما يراها الماسح", "الماسح يرى الأبواب من الخارج، كما يراها أي جهاز في الشبكة.", [h("div.fig-controls", ping, stateSwitch("fig-net-state", function (v) { state = v; explain.textContent = v === "after" ? "بعد المعالجة: على ACC-PC1 بقيت 135 و139 و445 فقط؛ اختفى 5900، وحُجب 3389 عن غير جهاز المدير." : "قبل المعالجة."; })), svg, explain]));
  }

  /* ---------------- lesson 3: triage room — severity columns and the remediation plan ---------------- */
  function triage(host) {
    var V = C().nessus.vulns.filter(function (v) { return v[2] !== "Info"; }).concat([C().nessus.vulns.filter(function (v) { return v[0] === "I01"; })[0]]);
    var COLS = [["Critical", "9.0–10.0"], ["High", "7.0–8.9"], ["Medium", "4.0–6.9"], ["Low", "0.1–3.9"], ["Info", "0"]];
    var cols = h("div.triage-cols", COLS.map(function (c) { return h("div.triage-col", { "data-sev": c[0] }, h("strong", { text: c[0] }), h("small", { dir: "ltr", text: c[1] })); }));
    var explain = h("div.fig-explain", { "aria-live": "polite", text: "اضغط على أي بطاقة ثغرة لترى عمودها وسبب ترتيبها." });
    var ORDER = ["V01", "V02", "V03", "V04"];
    var cards = h("div.triage-cards", V.map(function (v) {
      var b = h("button.btn.triage-card", { type: "button", "data-vuln": v[0] }, h("bdi", { dir: "ltr", text: v[1] }));
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(cols.children, function (c) { c.classList.toggle("is-active", c.getAttribute("data-sev") === v[2]); });
        var rank = ORDER.indexOf(v[0]);
        explain.textContent = v[1] + " — الخطورة: " + v[2] + (v[3] ? " (CVSS " + v[3] + ")" : " (معلومة لا ثغرة)") + " — الأجهزة: " + v[6].join("، ") + "." +
          (rank >= 0 ? " ترتيبها في خطة المعالجة: " + (rank + 1) + "." : " لا تُعالج بذاتها، لكنها تكشف خدمة VNC غير متوقعة.") +
          (v[0] === "V01" ? " قبل V02 رغم أن درجتها أقل، لأنها تمس جهازين لا جهازاً واحداً." : "");
      });
      return b;
    }));
    var plan = h("button.btn", { type: "button", "data-fig": "plan", text: "اعرض خطة المعالجة" });
    plan.addEventListener("click", function () { explain.textContent = "الخطة: (1) V01 تحديث ناقص، حرج، على جهازين ← (2) V02 VNC بلا مصادقة، حرج، على جهاز واحد ← (3) V03 RDP دون NLA، متوسط ← (4) V04 Telnet على الطابعة، متوسط ويحتاج المورّد. القاعدة: الخطورة أولاً، ثم عدد الأجهزة، ثم أهمية الجهاز."; });
    host.appendChild(frame("غرفة الطوارئ", "خمسة أعمدة حسب درجة CVSS، ثم خطة معالجة مرتّبة.", [h("div.fig-controls", plan), cols, cards, explain]));
  }

  FSIM.core.figures = { doors: doors, netmap: netmap, triage: triage };
})();
