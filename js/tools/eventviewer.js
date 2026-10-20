/* FSIM.tools.eventviewer — Event Viewer › Windows Logs › Security on ACC-PC1 (docs/ui-reference.md §12; outputs-spec §ي-3).
   The 4625 / 4740 events are the ones the student's own runas attempts produced (FSIM.core.sim.data.secLog), plus a few
   ordinary background events. Bus events: ev:node {node} • ev:filter {ids} • ev:select {id} */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, L = function () { return FSIM.data.case.lockout; };
  var TREE = [["Event Viewer (Local)", 0], ["Custom Views", 1], ["Windows Logs", 1], ["Application", 2], ["Security", 2], ["Setup", 2], ["System", 2], ["Forwarded Events", 2], ["Applications and Services Logs", 1], ["Subscriptions", 1]];
  var BACKGROUND = [
    { id: 4624, time: "09:58:20", task: "Logon", kw: "Audit Success" },
    { id: 4672, time: "09:58:20", task: "Special Logon", kw: "Audit Success" },
    { id: 4720, time: "10:04:52", task: "User Account Management", kw: "Audit Success" }
  ];

  function fixed(log) {
    if (log) return log;
    /* interpretation: the approved sequence (outputs-spec §ي-3) */
    var out = [], a = L().attempts;
    a.forEach(function (t, i) { out.push({ id: 4625, time: t, user: "lockout-test", status: "0xC000006D", sub: "0xC000006A", reason: "Unknown user name or bad password." }); if (i === a.length - 1) out.push({ id: 4740, time: t, user: "lockout-test" }); });
    out.push({ id: 4625, time: L().sixth, user: "lockout-test", status: "0xC0000234", sub: "0x0", reason: "Account locked out." });
    return out;
  }
  function rows(log) {
    var all = BACKGROUND.concat(fixed(log).map(function (e) { return Object.assign({ kw: e.id === 4625 ? "Audit Failure" : "Audit Success", task: e.id === 4625 ? "Logon" : "User Account Management" }, e); }));
    return all.map(function (e, i) { return Object.assign({ n: i }, e); }).sort(function (x, y) { return x.time < y.time ? 1 : x.time > y.time ? -1 : y.n - x.n; });
  }
  function message(e) {
    var date = L().date + " " + e.time;
    if (e.id === 4740) return ["A user account was locked out.", "", "Subject:", "\tSecurity ID:\t\tSYSTEM", "\tAccount Name:\t\tACC-PC1$", "\tAccount Domain:\t\tWORKGROUP", "\tLogon ID:\t\t0x3E7", "", "Account That Was Locked Out:", "\tSecurity ID:\t\tACC-PC1\\" + e.user, "\tAccount Name:\t\t" + e.user, "", "Additional Information:", "\tCaller Computer Name:\tACC-PC1", "", "Log Name: Security   Source: Microsoft-Windows-Security-Auditing   Event ID: 4740   Logged: " + date];
    if (e.id === 4625) return ["An account failed to log on.", "", "Subject:", "\tSecurity ID:\t\tACC-PC1\\Consultant", "\tAccount Name:\t\tConsultant", "\tAccount Domain:\t\tACC-PC1", "", "Logon Type:\t\t\t2", "", "Account For Which Logon Failed:", "\tSecurity ID:\t\tNULL SID", "\tAccount Name:\t\t" + e.user, "\tAccount Domain:\t\tACC-PC1", "", "Failure Information:", "\tFailure Reason:\t\t" + e.reason, "\tStatus:\t\t\t" + e.status, "\tSub Status:\t\t" + e.sub, "", "Process Information:", "\tCaller Process Name:\tC:\\Windows\\System32\\svchost.exe", "", "Network Information:", "\tWorkstation Name:\tACC-PC1", "\tSource Network Address:\t-", "", "Log Name: Security   Source: Microsoft-Windows-Security-Auditing   Event ID: 4625   Logged: " + date];
    var t = { 4624: "An account was successfully logged on.", 4672: "Special privileges assigned to new logon.", 4720: "A user account was created." }[e.id];
    return [t, "", "(Consultant's own session on ACC-PC1.)", "", "Log Name: Security   Source: Microsoft-Windows-Security-Auditing   Event ID: " + e.id + "   Logged: " + date];
  }

  function build(body, win) {
    var st = { node: "Event Viewer (Local)", ids: null, sel: null };
    var root = h("div.mmc"); body.appendChild(root);
    root.appendChild(FSIM.core.menubar(root, { File: [["Open Saved Log..."], ["Exit"]], Action: [["Filter Current Log...", "filter"], ["Refresh", "refresh"]], View: [["Customize..."]], Help: [["Help Topics"]] }, function (m, k) { if (k === "filter") filterDlg(); else render(); }));
    var tree = h("nav.mmc-tree", { "aria-label": "Console tree" }), center = h("div.mmc-center"), actions = h("aside.mmc-actions", { "aria-label": "Actions" });
    root.appendChild(h("div.mmc-split", tree, center, actions));
    TREE.forEach(function (n) {
      var b = h("button.mmc-node.is-l" + n[1], { type: "button", "data-node": n[0], text: n[0] });
      b.addEventListener("click", function () { if (["Event Viewer (Local)", "Windows Logs", "Security"].indexOf(n[0]) < 0) { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); return; } select(n[0]); });
      tree.appendChild(b);
    });
    function select(node) { st.node = node; st.sel = null; Array.prototype.forEach.call(tree.children, function (b) { b.classList.toggle("is-current", b.getAttribute("data-node") === node); }); render(); bus.emit("ev:node", { node: node }); }
    function act(label, fn) { var b = h("button.mmc-act", { type: "button", text: label }); b.addEventListener("click", fn || function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); }); return b; }
    function list() { var r = rows(FSIM.core.sim.data.secLog || []); return st.ids ? r.filter(function (e) { return st.ids.indexOf(e.id) >= 0; }) : r; }
    function render() {
      center.textContent = ""; actions.textContent = "";
      if (st.node !== "Security") {
        center.appendChild(h("h3.mmc-h", { text: st.node }));
        center.appendChild(h("p", { text: "Windows Logs: Application • Security • Setup • System • Forwarded Events" }));
        actions.appendChild(h("h4", { text: st.node })); actions.appendChild(act("Open Saved Log...")); actions.appendChild(act("Create Custom View..."));
        return;
      }
      var es = list();
      center.appendChild(h("h3.mmc-h", { text: "Security    Number of events: " + es.length + (st.ids ? "    (Filtered: Event IDs " + st.ids.join(",") + ")" : "") }));
      var grid = FSIM.core.grid({ columns: ["Keywords", "Date and Time", "Source", "Event ID", "Task Category"], label: "Security events", sortable: false,
        rows: es.map(function (e) { return { key: String(e.n), cls: e.kw === "Audit Failure" ? "is-fail" : "", cells: [(e.kw === "Audit Failure" ? "🔒 " : "🔑 ") + e.kw, L().date + " " + e.time + " AM", "Microsoft-Windows-Security-Auditing", e.id, e.task], data: e }; }),
        onSelect: function (r) { st.sel = r.data; preview(); bus.emit("ev:select", { id: r.data.id, n: r.data.n }); } });
      var pv = h("pre.ev-msg", { tabindex: "0", "aria-label": "Event details" });
      center.appendChild(h("div.ev-split", grid.el, h("div.ev-preview", h("div.ar-tabs", h("button.ar-tab", { type: "button", "aria-selected": "true", text: "General" }), h("button.ar-tab.is-off", { type: "button", "aria-selected": "false", text: "Details" })), pv)));
      function preview() { pv.textContent = st.sel ? message(st.sel).join("\n") : ""; }
      actions.appendChild(h("h4", { text: "Security" }));
      actions.appendChild(act("Filter Current Log...", filterDlg)); actions.appendChild(act("Clear Filter", function () { st.ids = null; render(); }));
      actions.appendChild(act("Find...")); actions.appendChild(act("Save All Events As...")); actions.appendChild(act("Clear Log...", function () { FSIM.core.toast(root, "لا نمسح سجل الأمان: هو الدليل."); })); actions.appendChild(act("Properties"));
    }
    function filterDlg() {
      if (st.node !== "Security") select("Security");
      var back = h("div.dlg-back"), inp = h("input#ev-ids", { type: "text", dir: "ltr", "aria-label": "Event IDs", placeholder: "<All Event IDs>", spellcheck: "false" });
      var ok = h("button.dlg-btn", { type: "button", text: "OK" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" }), clear = h("button.dlg-btn", { type: "button", text: "Clear" });
      back.appendChild(h("div.dlg.wiz", { role: "dialog", "aria-modal": "true", "aria-label": "Filter Current Log" }, h("h4", { text: "Filter Current Log" }),
        h("div.wiz-body", h("p", { text: "Logged:  Any time" }), h("p", { text: "Event level:  ☐ Critical ☐ Warning ☐ Verbose ☐ Error ☐ Information" }), h("p", { text: "By log:  Security" }), h("label", { "for": "ev-ids", text: "Includes/Excludes Event IDs:" }), inp),
        h("div.dlg-btns", ok, cancel, clear)));
      root.appendChild(back); inp.focus();
      ok.addEventListener("click", function () {
        var ids = inp.value.split(/[,\s]+/).filter(Boolean).map(Number).filter(function (n) { return !isNaN(n); });
        back.remove(); st.ids = ids.length ? ids : null; render(); bus.emit("ev:filter", { ids: ids.join(",") });
      });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") ok.click(); });
      clear.addEventListener("click", function () { inp.value = ""; });
      cancel.addEventListener("click", function () { back.remove(); });
    }
    select("Event Viewer (Local)");
    body.api = {
      select: select,
      filter: function (ids) { select("Security"); st.ids = ids; render(); bus.emit("ev:filter", { ids: ids.join(",") }); },
      pick: function (id) { var row = center.querySelector("tr.gr-row"); var e = list().filter(function (x) { return x.id === id; })[0]; if (!e) return; var tr = center.querySelector('tr[data-key="' + e.n + '"]'); if (tr) tr.click(); }
    };
  }

  FSIM.tools.eventviewer = {
    id: "eventviewer", prompt: "", message: message,
    open: function (stage, o) { o = o || {}; return stage.create({ id: "eventviewer", title: "Event Viewer", icon: "shield", skin: "win", width: o.width || 960, height: o.height || 500, x: o.x, y: o.y, build: build }); },
    /* interpretation: cmd = list | 4740 | 4625-1 | 4625-6 */
    outputOf: function (cmd) {
      var r = rows(null);
      if (cmd === "list") return ["Keywords        Date and Time            Event ID  Task Category"].concat(r.filter(function (e) { return e.id === 4625 || e.id === 4740; }).map(function (e) { return (e.kw + "        ").slice(0, 16) + L().date + " " + e.time + " AM   " + e.id + "      " + e.task; }));
      var f = fixed(null);
      if (cmd === "4740") return message(f.filter(function (e) { return e.id === 4740; })[0]);
      if (cmd === "4625-6") return message(f[f.length - 1]);
      return message(f[0]);
    }
  };
})();
