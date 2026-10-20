/* FSIM.tools.nessus — Nessus Essentials in a simplified browser window (docs/ui-reference.md §4; decision: browser window
   on https://localhost:8834). Values: outputs-spec §هـ and §ل. Vulnerability pages show name, severity, description and
   solution only: every field about exploit availability is deliberately left out (CLAUDE.md §0 rule 1).
   Bus events: nessus:new • nessus:template {name} • nessus:formtab {tab} • nessus:save {ok, name, targets} • nessus:launch
   • nessus:completed • nessus:open • nessus:tab {tab} • nessus:vuln {id} • nessus:host {ip} */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, C = function () { return FSIM.data.case; }, N = function () { return FSIM.data.case.nessus; };
  var SEVS = ["Critical", "High", "Medium", "Low", "Info"];

  function vulnsFor(state) {
    var gone = state === "after" ? N().goneAfter : [];
    return N().vulns.filter(function (v) { return gone.indexOf(v[0]) < 0; }).map(function (v) {
      return { id: v[0], name: v[1], sev: v[2], cvss: v[3], vpr: v[4], family: v[5], hosts: v[6], port: v[7], plugin: v[8], published: v[9], count: v[6].length };
    });
  }
  function sevClass(s) { return "sev-" + s.toLowerCase(); }
  function targetsOk(text) {
    var all = C().hosts.filter(function (x) { return x.id !== "consultant"; }).map(function (x) { return x.ip; });
    var list = text.split(/[\s,]+/).filter(Boolean);
    if (!list.length) return { ok: false, msg: "اكتب الأهداف في حقل Targets." };
    var out = list.filter(function (t) { return t !== C().network.cidr && !/^192\.168\.50\.\d{1,3}$/.test(t); });
    if (out.length) return { ok: false, msg: "في المحاكاة توجد شبكة المكتب فقط (192.168.50.x)؛ الهدف «" + out[0] + "» غير موجود فيها." };
    if (list.indexOf(C().network.cidr) >= 0) return { ok: true };
    var missing = all.filter(function (ip) { return list.indexOf(ip) < 0; });
    if (missing.length) return { ok: false, msg: "اكتب الأجهزة الخمسة التي اكتشفتها في الدرس 2 (أو النطاق 192.168.50.0/24). ينقص: " + missing.join("، ") };
    return { ok: true };
  }

  function build(body, win) {
    var st = { view: "scans", scan: null, tab: "Hosts", tmplTab: "Vulnerabilities", formTab: "Settings", vuln: null, host: null, running: false, query: "" };
    /* lesson 10: the baseline scan saved in lesson 3 is already in My Scans */
    if ((FSIM.core.sim.preset || {}).nessusBaseline) st.scan = { name: N().scanName, status: "completed", state: "before", targets: C().network.cidr };
    var root = h("div.ns"); body.appendChild(root);
    var url = h("input.ns-url", { type: "text", readonly: "", "aria-label": "Address", value: N().url + "/#/scans/folders/my-scans" });
    root.appendChild(h("div.ns-browser", h("span.ns-lock", { "aria-hidden": "true", text: "🔒" }), url));
    var top = h("div.ns-top", h("span.ns-brand", { text: "Nessus Essentials" }),
      h("button.ns-topnav.is-current", { type: "button", text: "Scans", onclick: function () { go("scans"); } }),
      h("button.ns-topnav", { type: "button", text: "Settings", onclick: function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); } }),
      h("span.ns-spacer"), h("span.ns-user", { text: "🔔  consultant ▾" }));
    root.appendChild(top);
    var side = h("nav.ns-side", { "aria-label": "Folders" },
      h("p.ns-sidehead", { text: "FOLDERS" }),
      sideBtn("My Scans", function () { go("scans"); }, true), sideBtn("All Scans", null), sideBtn("Trash", null),
      h("p.ns-sidehead", { text: "RESOURCES" }), sideBtn("Policies", null), sideBtn("Plugin Rules", null), sideBtn("Terrascan", null));
    var main = h("div.ns-main", { tabindex: "-1" });
    root.appendChild(h("div.ns-split", side, main));

    function sideBtn(label, fn, current) {
      var b = h("button.ns-sidebtn" + (current ? ".is-current" : ""), { type: "button", text: label });
      b.addEventListener("click", function () { if (fn) fn(); else FSIM.core.toast(root, "غير مفعّل في المحاكاة"); });
      return b;
    }
    function setUrl(path) { url.value = N().url + "/#/" + path; }
    function btn(label, fn, cls) { var b = h("button.ns-btn" + (cls ? "." + cls : ""), { type: "button", text: label }); b.addEventListener("click", fn); return b; }
    function off() { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); }

    function go(view) { st.view = view; render(); main.scrollTop = 0; }

    function render() {
      main.textContent = "";
      ({ scans: viewScans, templates: viewTemplates, form: viewForm, results: viewResults, vuln: viewVuln })[st.view]();
    }

    /* ---- My Scans ---- */
    function viewScans() {
      setUrl("scans/folders/my-scans");
      main.appendChild(h("div.ns-head", h("h2", { text: "My Scans" }), h("span.ns-spacer"), btn("Import", off), btn("New Folder", off),
        btn("New Scan", function () { bus.emit("nessus:new", {}); go("templates"); }, "is-primary")));
      if (!st.scan) { main.appendChild(h("div.ns-empty", { text: "This folder is empty. Create a new scan." })); return; }
      var s = st.scan;
      var icon = s.status === "running" ? "⟳" : s.status === "completed" ? "✓" : "—";
      var nameBtn = h("button.ns-link", { type: "button", text: s.name, "data-scan": "1" });
      nameBtn.addEventListener("click", function () { if (s.status === "completed") { st.tab = "Hosts"; bus.emit("nessus:open", {}); go("results"); } else if (s.status === "running") FSIM.core.toast(root, "الفحص يعمل الآن؛ انتظر حتى يكتمل."); else FSIM.core.toast(root, "لم يُشغَّل الفحص بعد: اضغط ▶ Launch."); });
      var launch = h("button.ns-icon", { type: "button", "aria-label": "Launch", title: "Launch", text: "▶", "data-launch-scan": "1" });
      launch.addEventListener("click", startScan);
      main.appendChild(h("table.ns-table", h("thead", h("tr", h("th", { text: "Name" }), h("th", { text: "Schedule" }), h("th", { text: "Last Modified" }), h("th", { text: "" }))),
        h("tbody", h("tr", h("td", h("span.ns-status.is-" + s.status, { "aria-label": s.status, text: icon }), " ", nameBtn), h("td", { text: "On Demand" }),
          h("td", { text: s.status === "completed" ? "Today at 9:52 AM" : s.status === "running" ? "Running" : "Today at 9:29 AM" }), h("td", launch, h("button.ns-icon", { type: "button", "aria-label": "Delete", text: "✕", onclick: off }))))));
    }

    function startScan() {
      var s = st.scan; if (!s || s.status === "running") return;
      s.status = "running"; render(); bus.emit("nessus:launch", {});
      setTimeout(function () { s.status = "completed"; s.state = FSIM.core.sim.state || "before"; s.runs = (s.runs || (s.state === "after" ? 1 : 0)) + 1; if (st.view === "scans") render(); bus.emit("nessus:completed", {}); }, FSIM.core.config.fast ? 30 : 2600);
    }

    /* ---- Scan Templates ---- */
    var TEMPLATES = {
      Discovery: [["Host Discovery", "A simple scan to discover live hosts and open ports.", "host"]],
      Vulnerabilities: [["Basic Network Scan", "A full system scan suitable for any host.", "basic"], ["Advanced Scan", "Configure a scan without using any recommendations."], ["Credentialed Patch Audit", "Authenticate to hosts and enumerate missing updates."], ["Malware Scan", "Scan for malware on Windows and Unix systems."], ["Web Application Tests", "Scan for published and unknown web vulnerabilities."], ["Mobile Device Scan", "Assess mobile devices via Microsoft Exchange or an MDM.", "upgrade"]],
      Compliance: [["Audit Cloud Infrastructure", "Audit the configuration of third-party cloud services.", "upgrade"], ["Policy Compliance Auditing", "Audit system configurations against a known baseline.", "upgrade"]]
    };
    function viewTemplates() {
      setUrl("scans/reports/new");
      main.appendChild(h("div.ns-head", h("h2", { text: "Scan Templates" }), h("span.ns-spacer"), btn("< Back to My Scans", function () { go("scans"); })));
      var tabs = h("div.ns-tabs", { role: "tablist" });
      Object.keys(TEMPLATES).forEach(function (t) {
        var b = h("button.ns-tab", { type: "button", role: "tab", "aria-selected": String(st.tmplTab === t), text: t });
        b.addEventListener("click", function () { st.tmplTab = t; render(); });
        tabs.appendChild(b);
      });
      main.appendChild(tabs);
      var grid = h("div.ns-cards");
      TEMPLATES[st.tmplTab].forEach(function (tp) {
        var card = h("button.ns-card" + (tp[2] === "basic" ? ".is-active" : ""), { type: "button", "data-template": tp[0] },
          h("strong", { text: tp[0] }), h("small", { text: tp[1] }), tp[2] === "upgrade" ? h("span.ns-upgrade", { text: "UPGRADE" }) : null);
        card.addEventListener("click", function () {
          if (tp[2] === "basic") { st.formTab = "Settings"; bus.emit("nessus:template", { name: tp[0] }); go("form"); }
          else if (tp[2] === "host") FSIM.core.toast(root, "اكتشفنا الأجهزة بـ Zenmap في الدرس 2؛ هنا نستخدم Basic Network Scan.");
          else FSIM.core.toast(root, tp[2] === "upgrade" ? "يحتاج ترخيصاً مدفوعاً (UPGRADE)؛ غير مفعّل في المحاكاة." : "غير مفعّل في المحاكاة");
        });
        grid.appendChild(card);
      });
      main.appendChild(grid);
    }

    /* ---- New Scan / Basic Network Scan ---- */
    var form = { name: "", description: "", targets: "" };
    function viewForm() {
      setUrl("scans/reports/new/basic");
      main.appendChild(h("div.ns-head", h("h2", { text: "New Scan / Basic Network Scan" }), h("span.ns-spacer"), btn("< Back to Scan Templates", function () { go("templates"); })));
      var tabs = h("div.ns-tabs", { role: "tablist" });
      ["Settings", "Credentials", "Plugins"].forEach(function (t) {
        var b = h("button.ns-tab", { type: "button", role: "tab", "aria-selected": String(st.formTab === t), text: t + (t === "Plugins" ? " 🔒" : "") });
        b.addEventListener("click", function () {
          if (t === "Plugins") { FSIM.core.toast(root, "الإضافات مقفلة في قالب Basic Network Scan."); return; }
          st.formTab = t; render(); bus.emit("nessus:formtab", { tab: t });
        });
        tabs.appendChild(b);
      });
      main.appendChild(tabs);
      var left = h("div.ns-formnav");
      var body2 = h("div.ns-formbody");
      if (st.formTab === "Settings") {
        [["BASIC", 0], ["General", 1, true], ["Schedule", 1], ["Notifications", 1], ["DISCOVERY", 0], ["ASSESSMENT", 0], ["REPORT", 0], ["ADVANCED", 0]].forEach(function (x) {
          var b = h("button.ns-formnav-item" + (x[1] ? ".is-sub" : "") + (x[2] ? ".is-current" : ""), { type: "button", text: x[0] });
          b.addEventListener("click", function () { if (!x[2]) off(); });
          left.appendChild(b);
        });
        var name = h("input#ns-name", { type: "text", spellcheck: "false", autocomplete: "off" }); name.value = form.name;
        var desc = h("textarea#ns-desc", { rows: "2" }); desc.value = form.description;
        var folder = h("select#ns-folder", h("option", { text: "My Scans" }));
        var targets = h("textarea#ns-targets", { rows: "3", spellcheck: "false", dir: "ltr" }); targets.value = form.targets;
        name.addEventListener("input", function () { form.name = name.value; });
        desc.addEventListener("input", function () { form.description = desc.value; });
        targets.addEventListener("input", function () { form.targets = targets.value; });
        body2.appendChild(h("div.ns-field", h("label", { "for": "ns-name", text: "Name" }), name));
        body2.appendChild(h("div.ns-field", h("label", { "for": "ns-desc", text: "Description" }), desc));
        body2.appendChild(h("div.ns-field", h("label", { "for": "ns-folder", text: "Folder" }), folder));
        body2.appendChild(h("div.ns-field", h("label", { "for": "ns-targets", text: "Targets" }), targets, h("small", { text: "Example: 192.168.1.1-192.168.1.5, 192.168.2.0/24, test.com" })));
        body2.appendChild(h("div.ns-field", h("label", { text: "Upload Targets" }), btn("Add File", off)));
      } else {
        ["Host", "Database", "Miscellaneous", "Plaintext Authentication", "Cloud Services"].forEach(function (x, i) {
          left.appendChild(h("button.ns-formnav-item" + (i === 0 ? ".is-current" : ""), { type: "button", text: x, onclick: i ? off : null }));
        });
        body2.appendChild(h("h3", { text: "Windows" }));
        body2.appendChild(h("div.ns-field", h("label", { text: "Authentication method" }), h("select", { disabled: "" }, h("option", { text: "Password" }))));
        body2.appendChild(h("div.ns-field", h("label", { "for": "ns-cuser", text: "Username" }), h("input#ns-cuser", { type: "text", readonly: "", value: N().credentialsUser })));
        body2.appendChild(h("div.ns-field", h("label", { "for": "ns-cpass", text: "Password" }), h("input#ns-cpass", { type: "password", readonly: "", value: "••••••••••••" })));
        body2.appendChild(h("div.ns-field", h("label", { "for": "ns-cdom", text: "Domain" }), h("input#ns-cdom", { type: "text", readonly: "" })));
        body2.appendChild(h("p.ns-hint", { dir: "rtl", lang: "ar", text: "حساب Consultant أعطاه المكتب للمستشار. كلمة المرور معبأة مسبقاً ولا تُكتب في المحاكاة. الفحص بصلاحيات يقرأ التحديثات المثبتة بدقة." }));
      }
      main.appendChild(h("div.ns-form", left, body2));
      var save = btn("Save", function () { doSave(false); }, "is-primary");
      var drop = h("button.ns-btn.is-primary", { type: "button", "aria-label": "Save options", "aria-haspopup": "true", text: "▾" });
      var pop = h("div.ns-pop", { hidden: "" }, btn("Launch", function () { pop.hidden = true; doSave(true); }));
      drop.addEventListener("click", function (e) { e.stopPropagation(); pop.hidden = !pop.hidden; });
      main.appendChild(h("div.ns-actions", h("span.ns-savegroup", save, drop, pop), btn("Cancel", function () { go("scans"); })));
    }
    function doSave(launch) {
      var name = form.name.trim();
      var t = targetsOk(form.targets.trim());
      var ok = !!name && t.ok;
      bus.emit("nessus:save", { ok: ok, name: name, targets: form.targets.trim() });
      if (!name) { FSIM.core.toast(root, "اكتب اسماً للفحص في حقل Name (المطلوب: " + N().scanName + ")."); return; }
      if (!t.ok) { FSIM.core.toast(root, t.msg); return; }
      st.scan = { name: name, status: "saved", targets: form.targets.trim() };
      go("scans");
      if (launch) startScan();
    }

    /* ---- results ---- */
    function counts(state) { return N().hostCounts[state]; }
    function bar(c) {
      var total = c.reduce(function (a, b) { return a + b; }, 0) || 1, el = h("div.ns-bar", { role: "img", "aria-label": SEVS.map(function (s, i) { return s + " " + c[i]; }).join(", ") });
      c.forEach(function (n, i) { if (!n) return; var seg = h("span." + sevClass(SEVS[i]), { text: String(n) }); seg.style.flexGrow = String(Math.max(n / total * 100, 4)); el.appendChild(seg); });
      return el;
    }
    function donut(state) {
      var vs = vulnsFor(state).filter(function (v) { return v.sev !== "Info"; });
      var by = SEVS.slice(0, 4).map(function (s) { return vs.filter(function (v) { return v.sev === s; }).length; });
      var total = by.reduce(function (a, b) { return a + b; }, 0);
      var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 42 42"); svg.setAttribute("class", "ns-donut"); svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Vulnerabilities: " + SEVS.slice(0, 4).map(function (s, i) { return s + " " + by[i]; }).join(", "));
      var offset = 25;
      by.forEach(function (n, i) {
        if (!n) return;
        var c = document.createElementNS(NS, "circle");
        var pct = n / total * 100;
        c.setAttribute("cx", "21"); c.setAttribute("cy", "21"); c.setAttribute("r", "15.915"); c.setAttribute("fill", "transparent");
        c.setAttribute("class", sevClass(SEVS[i])); c.setAttribute("stroke-width", "6");
        c.setAttribute("stroke-dasharray", pct + " " + (100 - pct)); c.setAttribute("stroke-dashoffset", String(offset));
        offset -= pct; svg.appendChild(c);
      });
      return h("div.ns-donut-wrap", svg, h("ul.ns-legend", SEVS.slice(0, 4).map(function (s, i) { return h("li", h("span.ns-dot." + sevClass(s)), s + " " + by[i]); })));
    }
    function viewResults() {
      var s = st.scan, state = s.state || "before";
      setUrl("scans/reports/5/" + (st.tab === "Vulnerabilities" ? "vulnerabilities" : st.tab.toLowerCase()));
      main.appendChild(h("div.ns-head", h("h2", { text: s.name }), h("span.ns-spacer"),
        btn("Configure", off), btn("Audit Trail", off), btn("Launch ▾", off), btn("Report", function () { FSIM.core.toast(root, "التقرير في الموقع: «تقرير تقييم الأمن» في صفحة المهمة."); }), btn("Export ▾", off)));
      main.appendChild(h("button.ns-link.ns-back", { type: "button", text: "< Back to My Scans", onclick: function () { go("scans"); } }));
      var vs = vulnsFor(state);
      var tabNames = [["Hosts", 5], ["Vulnerabilities", vs.length], ["Remediations", state === "after" ? 0 : N().remediations.length], ["History", state === "after" ? 2 : 1]];
      var tabs = h("div.ns-tabs", { role: "tablist" });
      tabNames.forEach(function (t) {
        var b = h("button.ns-tab", { type: "button", role: "tab", "aria-selected": String(st.tab === t[0]), "data-tab": t[0], text: t[0] + " (" + t[1] + ")" });
        b.addEventListener("click", function () { st.tab = t[0]; st.host = null; render(); bus.emit("nessus:tab", { tab: t[0] }); });
        tabs.appendChild(b);
      });
      var search = h("input.ns-search", { type: "search", placeholder: "Search", "aria-label": "Search", value: st.query });
      search.addEventListener("input", function () { st.query = search.value; var keep = search.selectionStart; render(); var n = main.querySelector(".ns-search"); if (n) { n.focus(); n.setSelectionRange(keep, keep); } });
      main.appendChild(h("div.ns-tabrow", tabs, h("span.ns-spacer"), btn("Filter ▾", off), search));
      var left = h("div.ns-resmain"), right = h("aside.ns-details");
      main.appendChild(h("div.ns-results", left, right));
      var q = st.query.toLowerCase().trim();
      var hostsList = Object.keys(counts(state));
      if (st.tab === "Hosts" && !st.host) {
        left.appendChild(h("table.ns-table", h("thead", h("tr", h("th", { text: "Host" }), h("th", { text: "Vulnerabilities" }))),
          h("tbody", hostsList.filter(function (ip) { return !q || ip.indexOf(q) >= 0; }).map(function (ip) {
            var b = h("button.ns-link", { type: "button", text: ip, "data-host": ip });
            b.addEventListener("click", function () { st.host = ip; render(); bus.emit("nessus:host", { ip: ip }); });
            return h("tr", h("td", b), h("td", bar(counts(state)[ip])));
          }))));
      } else if (st.tab === "Vulnerabilities" || (st.tab === "Hosts" && st.host)) {
        if (st.host) left.appendChild(h("p.ns-crumb", h("button.ns-link", { type: "button", text: "Hosts", onclick: function () { st.host = null; render(); } }), " › " + st.host));
        var rows = vs.filter(function (v) { return (!st.host || v.hosts.indexOf(st.host) >= 0) && (!q || (v.name + " " + v.family).toLowerCase().indexOf(q) >= 0); });
        rows.sort(function (a, b) { return SEVS.indexOf(a.sev) - SEVS.indexOf(b.sev) || b.count - a.count; });
        left.appendChild(h("table.ns-table.ns-vulns", h("thead", h("tr", ["Sev", "CVSS", "VPR", "Name", "Family", "Count"].map(function (c) { return h("th", { text: c }); }))),
          h("tbody", rows.map(function (v) {
            var nb = h("button.ns-link", { type: "button", text: v.name, "data-vuln": v.id });
            nb.addEventListener("click", function () { st.vuln = v.id; bus.emit("nessus:vuln", { id: v.id }); go("vuln"); });
            return h("tr", h("td", h("span.ns-sev." + sevClass(v.sev), { text: v.sev.toUpperCase() })), h("td", { text: v.cvss }), h("td", { text: v.vpr }), h("td", nb), h("td", { text: v.family }), h("td", { text: String(st.host ? 1 : v.count) }));
          }))));
      } else if (st.tab === "Remediations") {
        left.appendChild(h("table.ns-table", h("thead", h("tr", h("th", { text: "Action" }), h("th", { text: "Vulns" }), h("th", { text: "Hosts" }))),
          h("tbody", (state === "after" ? [] : N().remediations).map(function (r) { return h("tr", h("td", { text: r[0] }), h("td", { text: r[1] }), h("td", { text: r[2] })); }))));
      } else if (st.tab === "History") {
        left.appendChild(h("table.ns-table", h("thead", h("tr", h("th", { text: "Start Time" }), h("th", { text: "End Time" }), h("th", { text: "Status" }))),
          h("tbody", N().history.slice(0, state === "after" ? 2 : 1).map(function (r) { return h("tr", r.map(function (c) { return h("td", { text: c }); })); }))));
      }
      right.appendChild(h("h3", { text: "Scan Details" }));
      var d = N().details;
      right.appendChild(h("dl.ns-dl", Object.keys(d).map(function (k) { return [h("dt", { text: k + ":" }), h("dd", { text: state === "after" && k === "Start" ? "10/15/2026 1:10 PM" : state === "after" && k === "End" ? "10/15/2026 1:29 PM" : state === "after" && k === "Elapsed" ? "19 minutes" : d[k] })]; })));
      right.appendChild(h("h3", { text: "Vulnerabilities" }));
      right.appendChild(donut(state));
    }

    /* ---- one vulnerability ---- */
    function viewVuln() {
      var v = vulnsFor((st.scan && st.scan.state) || "before").filter(function (x) { return x.id === st.vuln; })[0];
      var t = N().texts[v.id];
      setUrl("scans/reports/5/vulnerabilities/" + v.plugin);
      main.appendChild(h("button.ns-link.ns-back", { type: "button", text: "< Back to Vulnerabilities", onclick: function () { st.tab = "Vulnerabilities"; go("results"); } }));
      main.appendChild(h("div.ns-vhead", h("span.ns-sev." + sevClass(v.sev), { text: v.sev.toUpperCase() }), h("h2", { text: v.name })));
      var left = h("div.ns-resmain.ns-vbody"), right = h("aside.ns-details");
      left.appendChild(h("h3", { text: "Description" })); left.appendChild(h("p", { text: t.description }));
      left.appendChild(h("h3", { text: "Solution" })); left.appendChild(h("p", { text: t.solution }));
      left.appendChild(h("h3", { text: "See Also" })); left.appendChild(h("p.ns-muted", { text: "—" }));
      left.appendChild(h("h3", { text: "Output" }));
      left.appendChild(h("pre.ns-out", { tabindex: "0", text: t.output.join("\n") }));
      left.appendChild(h("table.ns-table", h("thead", h("tr", h("th", { text: "Port ▲" }), h("th", { text: "Hosts" }))),
        h("tbody", h("tr", h("td", { text: v.port.split("/").slice(1).join(" / ") || v.port }), h("td", { text: v.hosts.join(", ") })))));
      var pd = [["Severity", v.sev], ["ID", v.plugin + "  (رقم تدريبي)"], ["Version", "1.1"], ["Type", v.id === "V01" ? "local" : "remote"], ["Family", v.family]];
      if (v.published) pd.push(["Published", v.published], ["Modified", "2026/10/13"]);
      right.appendChild(h("h3", { text: "Plugin Details" })); right.appendChild(h("dl.ns-dl", pd.map(function (p) { return [h("dt", { text: p[0] + ":" }), h("dd", { text: p[1] })]; })));
      if (v.cvss) {
        right.appendChild(h("h3", { text: "Risk Information" }));
        right.appendChild(h("dl.ns-dl", [["Risk Factor", v.sev], ["CVSS v3.0 Base Score", v.cvss]].map(function (p) { return [h("dt", { text: p[0] + ":" }), h("dd", { text: p[1] })]; })));
      }
      if (t.cve && t.cve.length) {
        right.appendChild(h("h3", { text: "Reference Information" }));
        right.appendChild(h("dl.ns-dl", h("dt", { text: "CVE:" }), h("dd", { text: t.cve.join(", ") + "  (أرقام تدريبية)" })));
      }
      main.appendChild(h("div.ns-results", left, right));
    }

    render();
    body.api = {
      go: go,
      relaunch: function () { go("scans"); startScan(); },
      newScan: function () { bus.emit("nessus:new", {}); go("templates"); },
      pickTemplate: function () { st.formTab = "Settings"; bus.emit("nessus:template", { name: "Basic Network Scan" }); go("form"); },
      fill: function (name, targets) { form.name = name; form.targets = targets; if (st.view === "form") render(); },
      formTab: function (t) { st.formTab = t; render(); bus.emit("nessus:formtab", { tab: t }); },
      saveLaunch: function () { doSave(true); },
      openResults: function () { if (st.scan && st.scan.status === "completed") { st.tab = "Hosts"; bus.emit("nessus:open", {}); go("results"); } },
      tab: function (t) { st.tab = t; st.host = null; render(); bus.emit("nessus:tab", { tab: t }); },
      vuln: function (id) { st.vuln = id; bus.emit("nessus:vuln", { id: id }); go("vuln"); },
      host: function (ip) { st.tab = "Hosts"; st.host = ip; render(); bus.emit("nessus:host", { ip: ip }); },
      waitDone: function () { return new Promise(function (res) { (function w() { if (st.scan && st.scan.status === "completed") res(); else setTimeout(w, 30); })(); }); }
    };
  }

  FSIM.tools.nessus = {
    id: "nessus", vulnsFor: vulnsFor, targetsOk: targetsOk,
    open: function (stage, o) {
      o = o || {};
      return stage.create({ id: "nessus", title: "Nessus Essentials — localhost:8834", icon: "nessus", skin: "win", width: o.width || 960, height: o.height || 540, x: o.x, y: o.y, build: build });
    },
    /* interpretation phase tables: src.table = "vulns" | "hosts" */
    annotTable: function (src) {
      var state = src.state || "before";
      if (src.table === "hosts") {
        var c = N().hostCounts[state];
        return { columns: ["Host", "Critical", "High", "Medium", "Low", "Info"], rows: Object.keys(c).map(function (ip) { return { key: ip, cells: [ip].concat(c[ip]) }; }) };
      }
      return { columns: ["Sev", "CVSS", "VPR", "Name", "Family", "Count"], rows: vulnsFor(state).map(function (v) { return { key: v.id, cls: v.sev === "Critical" ? "is-pink" : "", cells: [v.sev, v.cvss, v.vpr, v.name, v.family, v.count] }; }) };
    },
    /* plain text of one vulnerability page (interpretation phase): cmd = vuln id */
    outputOf: function (id) {
      var v = vulnsFor("before").filter(function (x) { return x.id === id; })[0], t = N().texts[id];
      return [v.sev.toUpperCase() + "  " + v.name, "", "Description", t.description, "", "Solution", t.solution, "", "Output"].concat(t.output, ["", "Plugin ID: " + v.plugin + "   Family: " + v.family + (v.cvss ? "   CVSS v3.0 Base Score: " + v.cvss : "")], t.cve.length ? ["CVE: " + t.cve.join(", ")] : []);
    }
  };
})();
