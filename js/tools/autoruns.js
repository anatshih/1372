/* FSIM.tools.autoruns — Sysinternals Autoruns on ACC-PC1 (docs/ui-reference.md §7; outputs-spec §ح).
   Adapted from 1462: here the defender may disable and delete entries. State "before" = pink rhelper entries;
   "quarantined" = after Defender (lesson 5): the files are gone, so the entries are yellow (File not found).
   Bus events: autoruns:option {name, value} • autoruns:tab {tab} • autoruns:select {name} • autoruns:toggle {name, enabled} • autoruns:delete {name} */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, A = function () { return FSIM.data.case.autoruns; };
  var TABS = ["Everything", "Logon", "Explorer", "Internet Explorer", "Scheduled Tasks", "Services", "Drivers", "Codecs", "Boot Execute", "Image Hijacks", "AppInit", "KnownDLLs", "Winlogon", "Winsock Providers", "Print Monitors", "LSA Providers", "Network Providers", "WMI", "Office"];
  var ON = { "Everything": 1, "Logon": 1, "Scheduled Tasks": 1, "Services": 1 };
  var COLS = ["Autorun Entry", "Description", "Publisher", "Image Path", "Timestamp", "VirusTotal"];

  /* groups for a tab and state; removed = set of deleted entry keys */
  function groupsFor(tab, state, removed) {
    removed = removed || {};
    var src = [];
    if (tab === "Everything" || tab === "Logon") src = src.concat(A().logon);
    if (tab === "Everything" || tab === "Scheduled Tasks") src = src.concat(A().tasks);
    if (tab === "Everything" || tab === "Services") src = src.concat(A().services);
    return src.map(function (g) {
      return { header: g.header, time: "", entries: g.entries.filter(function (e) { return !removed[e.key] && !(state === "clean" && e.rhelper); }).map(function (e) {
        var x = Object.assign({}, e);
        if (e.rhelper && state === "quarantined") { x.cls = "yellow"; x.path = e.path + "  File not found"; }
        return x;
      }) };
    });
  }

  function build(body, win) {
    var st = { tab: "Everything", sel: null, filter: "", removed: {}, disabled: {}, opts: { "Hide Empty Locations": true, "Hide Microsoft Entries": false, "Hide Windows Entries": true } };
    var root = h("div.ar"); body.appendChild(root);
    var state = function () { return FSIM.core.sim.state; };
    root.appendChild(FSIM.core.menubar(root, {
      File: [["Open…"], ["Save"], ["Compare…"], ["-"], ["Refresh", "refresh"], ["-"], ["Exit"]],
      Entry: [["Jump to Entry…"], ["Jump to Image…"], ["-"], ["Delete", "delete"], ["Properties", "props"], ["Process Explorer…"], ["Search Online…"]],
      Options: [["Hide Empty Locations", "Hide Empty Locations"], ["Hide Microsoft Entries", "Hide Microsoft Entries"], ["Hide Windows Entries", "Hide Windows Entries"], ["-"], ["Scan Options…", "scan"]],
      Category: [["…"]], Help: [["About Autoruns"]]
    }, function (menu, key) {
      if (st.opts.hasOwnProperty(key)) { st.opts[key] = !st.opts[key]; bus.emit("autoruns:option", { name: key, value: st.opts[key] }); render(); }
      else if (key === "delete") askDelete();
      else if (key === "props") props();
      else if (key === "refresh") render();
      else if (key === "scan") FSIM.core.toast(root, "Verify code signatures وCheck VirusTotal.com مفعّلان مسبقاً في المحاكاة (النتائج جاهزة بلا اتصال).");
    }, function (menu, key) { return st.opts.hasOwnProperty(key) ? st.opts[key] : null; }));
    var qf = h("input", { type: "text", "aria-label": "Quick Filter", placeholder: "Quick Filter", spellcheck: "false" });
    qf.addEventListener("input", function () { st.filter = qf.value; render(); });
    root.appendChild(h("div.ar-toolbar", h("label", { text: "Quick Filter:" }), qf));
    var tabs = h("div.ar-tabs", { role: "tablist", "aria-label": "Autoruns categories" });
    TABS.forEach(function (t) {
      var b = h("button.ar-tab" + (ON[t] ? "" : ".is-off"), { type: "button", role: "tab", "aria-selected": String(t === st.tab), text: t, "data-tab": t });
      b.addEventListener("click", function () { selectTab(t); });
      tabs.appendChild(b);
    });
    root.appendChild(tabs);
    var grid = h("div.ar-grid", { tabindex: "0", role: "region", "aria-label": "Autorun entries" });
    var table = h("table.ar-table", { role: "grid" }, h("thead", h("tr", COLS.map(function (c) { return h("th", { scope: "col", text: c }); }))));
    var tbody = h("tbody"); table.appendChild(tbody); grid.appendChild(table);
    var empty = h("div.ar-empty", { hidden: "" }); grid.appendChild(empty);
    root.appendChild(grid);
    var status = h("div.ar-status", { text: "Ready." }); root.appendChild(status);

    function selectTab(t) {
      st.tab = t; st.sel = null;
      Array.prototype.forEach.call(tabs.children, function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-tab") === t)); });
      bus.emit("autoruns:tab", { tab: t }); render();
    }
    function visible(e) {
      if (st.opts["Hide Microsoft Entries"] && /^\(Verified\) Microsoft/.test(e.publisher)) return false;
      if (st.opts["Hide Windows Entries"] && /^\(Verified\) Microsoft Windows/.test(e.publisher)) return false;
      var q = st.filter.toLowerCase();
      return !q || [e.name, e.desc, e.publisher, e.path].join(" ").toLowerCase().indexOf(q) >= 0;
    }
    function all() { return groupsFor("Everything", state(), st.removed).reduce(function (a, g) { return a.concat(g.entries); }, []); }
    function render() {
      tbody.textContent = "";
      var off = !ON[st.tab];
      empty.hidden = !off; table.hidden = off;
      if (off) { empty.textContent = "لا مدخلات في هذا التبويب على هذا الجهاز (المحاكاة تعرض Everything وLogon وScheduled Tasks وServices)."; return; }
      groupsFor(st.tab, state(), st.removed).forEach(function (g) {
        var es = g.entries.filter(visible);
        if (!es.length && st.opts["Hide Empty Locations"]) return;
        tbody.appendChild(h("tr.ar-header", h("td", { colspan: "6", text: g.header })));
        es.forEach(function (e) {
          var cb = h("input", { type: "checkbox", "aria-label": "Enable " + e.name, "data-toggle": e.name });
          cb.checked = !st.disabled[e.key];
          cb.addEventListener("click", function (ev) { ev.stopPropagation(); toggle(e, cb.checked); });
          var row = h("tr.ar-row" + (e.cls ? ".is-" + e.cls : "") + (st.sel === e.key ? ".is-selected" : ""), { "data-key": e.key, "data-name": e.name, "aria-selected": String(st.sel === e.key) },
            h("td.c-entry", h("div.ar-ent", cb, h("span.ar-name", { text: e.name }))), h("td", { text: e.desc }), h("td", { text: e.publisher }), h("td", { text: e.path }), h("td", { text: e.time }), h("td", { text: e.vt }));
          row.addEventListener("click", function () { pick(e); });
          row.addEventListener("contextmenu", function (ev) { ev.preventDefault(); pick(e); askDelete(); });
          tbody.appendChild(row);
        });
      });
      status.textContent = "Ready." + (st.opts["Hide Microsoft Entries"] ? "  Microsoft entries hidden." : "") + (st.opts["Hide Windows Entries"] ? "  Windows entries hidden." : "");
    }
    function pick(e) { st.sel = e.key; render(); bus.emit("autoruns:select", { name: e.name, key: e.key }); }
    function guardSafe(e) {
      if (!e.rhelper) { FSIM.core.toast(root, "«" + e.name + "» برنامج سليم موقّع يحتاجه المكتب أو Windows: لا نعطّله ولا نحذفه."); return false; }
      return true;
    }
    function toggle(e, enabled) {
      if (!enabled && !guardSafe(e)) { render(); return; }
      if (enabled) delete st.disabled[e.key]; else st.disabled[e.key] = true;
      render(); bus.emit("autoruns:toggle", { name: e.name, enabled: enabled });
    }
    function askDelete() {
      var e = all().filter(function (x) { return x.key === st.sel; })[0];
      if (!e) { FSIM.core.toast(root, "اختر مدخلاً أولاً."); return; }
      if (!guardSafe(e)) return;
      var back = h("div.dlg-back"), ok = h("button.dlg-btn", { type: "button", text: "OK" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" });
      back.appendChild(h("div.dlg", { role: "dialog", "aria-modal": "true", "aria-label": "Autoruns" }, h("h4", { text: "Autoruns" }), h("p", { text: "Delete " + e.name + "?" }), h("div.dlg-btns", ok, cancel)));
      root.appendChild(back); ok.focus();
      ok.addEventListener("click", function () { back.remove(); st.removed[e.key] = true; st.sel = null; render(); bus.emit("autoruns:delete", { name: e.name }); });
      cancel.addEventListener("click", function () { back.remove(); });
    }
    function props() {
      var e = all().filter(function (x) { return x.key === st.sel; })[0];
      if (!e) { FSIM.core.toast(root, "اختر مدخلاً أولاً."); return; }
      FSIM.core.toast(root, e.name + " — " + (e.publisher || "") + " — " + e.path + " — VirusTotal: " + e.vt);
    }
    render();
    body.api = {
      selectTab: selectTab,
      setOption: function (n, v) { st.opts[n] = v; bus.emit("autoruns:option", { name: n, value: v }); render(); },
      toggle: function (name, enabled) { var e = all().filter(function (x) { return x.name === name; })[0]; if (e) toggle(e, enabled); },
      remove: function (name) { var e = all().filter(function (x) { return x.name === name; })[0]; if (!e) return; pick(e); st.removed[e.key] = true; st.sel = null; render(); bus.emit("autoruns:delete", { name: name }); }
    };
  }

  FSIM.tools.autoruns = {
    id: "autoruns",
    open: function (stage, o) { o = o || {}; return stage.create({ id: "autoruns", title: "Autoruns - Sysinternals: www.sysinternals.com [ACC-PC1\\Consultant]", icon: "autoruns", skin: "win", width: o.width || 900, height: o.height || 470, x: o.x, y: o.y, build: build }); },
    /* interpretation (lesson.js renderAutoruns) */
    entriesFor: function (tab, state) { return groupsFor(tab, state); }
  };
})();
