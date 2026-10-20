/* FSIM.tools.taskmgr — Windows 11 Task Manager on ACC-PC1 (docs/ui-reference.md §2). Values: outputs-spec §ج-7, ج-8.
   Pages used by lesson 1: Details (search, right-click → Open file location), Services, Startup apps. Others are shown but inactive.
   Bus events: taskmgr:page {page} • taskmgr:search {query} • taskmgr:select {name, pid} • taskmgr:action {action, name}. */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, C = function () { return FSIM.data.case; };
  var PAGES = [
    ["Processes", "▦"], ["Performance", "∿"], ["App history", "◷"], ["Startup apps", "⚡"], ["Users", "☺"], ["Details", "☰"], ["Services", "⚙"]
  ];
  var ACTIVE = { "Processes": true, "Details": true, "Services": true, "Startup apps": true };
  var DETAIL_COLS = ["Name", "PID", "Status", "User name", "CPU", "Memory (active private working set)", "Architecture", "Description"];
  var CTX = ["End task", "End process tree", "-", "Efficiency mode", "Set priority", "Set affinity", "Analyze wait chain", "-", "Create memory dump file", "-", "Open file location", "Search online", "Properties", "Go to service(s)"];
  var CTX_ACTIVE = { "End task": true, "Open file location": true, "Properties": true };

  function state() { return FSIM.core.sim.state; }
  function procs(st) { return C().processes.filter(function (p) { return !p[9] || p[9] === st; }); }
  function startup(st) { return C().startupApps.filter(function (s) { return !s[4] || s[4] === st; }); }
  function detailRows(st) { return procs(st).map(function (p) { return { key: p[0] + "|" + p[1], cells: p.slice(0, 8), data: p }; }); }
  function startupRows(st) { return startup(st).map(function (s) { return { key: s[0], cells: s.slice(0, 4) }; }); }
  function serviceRows() { return C().services.map(function (s) { return { key: s[0], cells: s }; }); }

  function build(body, win) {
    var bus = FSIM.core.bus.scoped();
    var page = "Details", query = "";
    var root = h("div.tm"); body.appendChild(root);
    var search = h("input.tm-search", { type: "search", placeholder: "Type a name, publisher, or PID to search", "aria-label": "Search", spellcheck: "false" });
    var titleEl = h("h2.tm-title");
    var actions = h("div.tm-actions");
    var top = h("div.tm-top", h("span.tm-app", { text: "Task Manager" }), search);
    var nav = h("nav.tm-nav", { "aria-label": "Task Manager pages" });
    var main = h("div.tm-main");
    var content = h("div.tm-content");
    main.appendChild(h("div.tm-head", titleEl, actions));
    main.appendChild(content);
    root.appendChild(top);
    root.appendChild(h("div.tm-split", nav, main));

    var navBtns = {};
    PAGES.forEach(function (pg) {
      var b = h("button.tm-nav-btn", { type: "button", "data-page": pg[0], "aria-current": "false" }, h("span.tm-ico", { "aria-hidden": "true", text: pg[1] }), h("span", { text: pg[0] }));
      b.addEventListener("click", function () {
        if (!ACTIVE[pg[0]]) { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); return; }
        show(pg[0]);
      });
      navBtns[pg[0]] = b; nav.appendChild(b);
    });
    var settings = h("button.tm-nav-btn.tm-settings", { type: "button" }, h("span.tm-ico", { "aria-hidden": "true", text: "⚙" }), h("span", { text: "Settings" }));
    settings.addEventListener("click", function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); });
    nav.appendChild(settings);

    function matches(cells) {
      var q = query.toLowerCase().trim();
      return !q || cells.some(function (c) { return String(c).toLowerCase().indexOf(q) >= 0; });
    }
    var grid = null, ctx = null;
    function closeCtx() { if (ctx) { ctx.remove(); ctx = null; } }
    root.addEventListener("click", closeCtx);

    function openCtx(row, x, y) {
      closeCtx();
      ctx = h("div.menu-pop.tm-ctx", { role: "menu" });
      CTX.forEach(function (label) {
        if (label === "-") { ctx.appendChild(h("div.menu-sep")); return; }
        var it = h("button.menu-item", { type: "button", role: "menuitem", "aria-disabled": CTX_ACTIVE[label] ? false : "true", "data-action": label }, h("span.chk", { text: "" }), label);
        it.addEventListener("click", function (e) { e.stopPropagation(); closeCtx(); act(label, row); });
        ctx.appendChild(it);
      });
      var rect = root.getBoundingClientRect();
      ctx.style.insetInlineStart = Math.max(4, Math.min(x - rect.left, rect.width - 230)) + "px";
      ctx.style.insetBlockStart = Math.max(4, Math.min(y - rect.top, rect.height - 330)) + "px";
      root.appendChild(ctx);
      var first = ctx.querySelector('[data-action="End task"]'); if (first) first.focus();
    }
    function act(label, row) {
      var p = row.data, name = p[0];
      if (!CTX_ACTIVE[label]) { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); return; }
      bus.emit("taskmgr:action", { action: label, name: name, pid: p[1] });
      if (label === "Open file location") {
        var files = C().folderOf[name];
        var dir = p[8].replace(/[^\\]+$/, "");
        FSIM.core.toast(root, "يفتح مستكشف الملفات على المجلد: " + dir + (files ? " — وفيه: " + files.join(" و") : ""));
      } else if (label === "End task") {
        FSIM.core.toast(root, name === C().rhelper.file
          ? "في المحاكاة لا تُنهى العملية هنا: إنهاؤها مؤقت، وسيعود البرنامج مع إعادة التشغيل لأن له مدخل تشغيل تلقائي (الدرس 6)."
          : "في المحاكاة لا تُنهى عمليات الجهاز: قد يتعطّل عمل المكتب.");
      } else if (label === "Properties") {
        FSIM.core.toast(root, "خصائص الملف: " + p[8] + (p[7] ? "" : " — بلا وصف ولا ناشر موثّق."));
      }
    }

    function show(pg) {
      page = pg; closeCtx();
      if (query) { query = ""; search.value = ""; }
      Object.keys(navBtns).forEach(function (k) { navBtns[k].classList.toggle("is-current", k === pg); navBtns[k].setAttribute("aria-current", k === pg ? "page" : "false"); });
      titleEl.textContent = pg;
      actions.textContent = ""; content.textContent = "";
      if (pg === "Details") {
        var endBtn = h("button.tm-btn", { type: "button", text: "End task" });
        endBtn.addEventListener("click", function () { var k = grid && grid.selected(); var r = k && detailRows(state()).filter(function (x) { return x.key === k; })[0]; if (r) act("End task", r); else FSIM.core.toast(root, "اختر عملية أولاً."); });
        actions.appendChild(h("button.tm-btn", { type: "button", text: "Run new task", "aria-disabled": "true", onclick: function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); } }));
        actions.appendChild(endBtn);
        grid = FSIM.core.grid({ columns: DETAIL_COLS, rows: [], label: "Details", onSelect: function (r) { bus.emit("taskmgr:select", { name: r.data[0], pid: r.data[1] }); } });
        content.appendChild(grid.el);
        grid.el.addEventListener("contextmenu", function (e) {
          var tr = e.target.closest("tr.gr-row"); if (!tr) return;
          e.preventDefault();
          var key = tr.getAttribute("data-key"); grid.select(key);
          var r = detailRows(state()).filter(function (x) { return x.key === key; })[0];
          if (r) openCtx(r, e.clientX, e.clientY);
        });
        grid.el.addEventListener("keydown", function (e) {
          if (!(e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey))) return;
          var key = grid.selected(); var r = key && detailRows(state()).filter(function (x) { return x.key === key; })[0];
          if (!r) return; e.preventDefault();
          var tr = grid.tbody.querySelector('[data-key="' + key + '"]'), b = tr.getBoundingClientRect();
          openCtx(r, b.left + 40, b.bottom);
        });
      } else if (pg === "Services") {
        actions.appendChild(h("button.tm-btn", { type: "button", text: "Open Services", onclick: function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); } }));
        grid = FSIM.core.grid({ columns: ["Name", "PID", "Description", "Status", "Group"], rows: [], label: "Services" });
        content.appendChild(grid.el);
      } else if (pg === "Startup apps") {
        var dis = h("button.tm-btn", { type: "button", text: "Disable" });
        dis.addEventListener("click", function () {
          var k = grid && grid.selected();
          if (!k) { FSIM.core.toast(root, "اختر برنامجاً أولاً."); return; }
          bus.emit("taskmgr:action", { action: "Disable", name: k });
          FSIM.core.toast(root, k === C().rhelper.run ? "التعطيل من هنا يغطي جزءاً من أماكن التشغيل التلقائي فقط؛ سنزيله كاملاً بـ Autoruns في الدرس 6." : "لا تعطّل برامج يحتاجها المكتب.");
        });
        actions.appendChild(dis);
        actions.appendChild(h("span.tm-bios", { text: "Last BIOS time: " + C().lastBiosTime }));
        grid = FSIM.core.grid({ columns: ["Name", "Publisher", "Status", "Startup impact"], rows: [], label: "Startup apps" });
        content.appendChild(grid.el);
      } else if (pg === "Processes") {
        actions.appendChild(h("button.tm-btn", { type: "button", text: "Run new task", onclick: function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); } }));
        grid = FSIM.core.grid({ columns: ["Name", "Status", "CPU", "Memory", "Disk", "Network"], rows: [], label: "Processes", sortable: false });
        content.appendChild(grid.el);
      }
      refresh();
      bus.emit("taskmgr:page", { page: pg });
    }

    function refresh() {
      if (!grid) return;
      var st = state(), rows;
      if (page === "Details") rows = detailRows(st);
      else if (page === "Services") rows = serviceRows();
      else if (page === "Startup apps") rows = startupRows(st);
      else rows = procs(st).map(function (p) { return { key: p[0] + "|" + p[1], cells: [p[0], "", p[4] + "%", p[5].replace(" K", " K"), "0 MB/s", "0 Mbps"] }; });
      grid.setRows(rows.filter(function (r) { return matches(r.cells); }));
    }
    search.addEventListener("input", function () { query = search.value; refresh(); bus.emit("taskmgr:search", { query: query.trim().toLowerCase() }); });
    var off = bus.on("sim:state", function () { refresh(); });
    win.onDestroy = off;

    show("Details");
    body.api = {
      show: show,
      setSearch: function (t) { search.value = t; search.dispatchEvent(new Event("input")); },
      select: function (name) { var r = detailRows(state()).filter(function (x) { return x.data[0] === name; })[0]; if (r && grid) grid.select(r.key); },
      action: function (label, name) { var r = detailRows(state()).filter(function (x) { return x.data[0] === name; })[0]; if (r) act(label, r); }
    };
  }

  FSIM.tools.taskmgr = {
    id: "taskmgr",
    open: function (stage, o) {
      o = o || {};
      return stage.create({ id: "taskmgr", title: "Task Manager", icon: "taskmgr", skin: "win", width: o.width || 900, height: o.height || 470, x: o.x, y: o.y, build: build });
    },
    /* annotated tables for the interpretation phase: src.table = "details" | "startup" */
    annotTable: function (src) {
      if (src.table === "startup") return { columns: ["Name", "Publisher", "Status", "Startup impact"], rows: startupRows(src.state || "before").map(function (r) { return { key: r.key, cells: r.cells.map(function (c) { return c === "" ? "(فارغ)" : c; }) }; }) };
      return { columns: DETAIL_COLS, rows: detailRows(src.state || "before").map(function (r) { return { key: r.data[0] + "|" + r.data[1], cells: r.cells.map(function (c) { return c === "" ? "(فارغ)" : c; }) }; }) };
    }
  };
})();
