/* FSIM.tools.defender — Windows Security / Microsoft Defender Antivirus on ACC-PC1 (docs/ui-reference.md §6; outputs-spec §ز).
   Shown from the victim's side only: detect, quarantine, remove. Old signatures miss the new trojan (update first).
   Bus events: defender:page {page} • defender:sigupdate • defender:scan {type, found} • defender:action {action, threat} */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, D = function () { return FSIM.data.case.defender; };
  var NAV = ["Home", "Virus & threat protection", "Account protection", "Firewall & network protection", "App & browser control", "Device security", "Device performance & health", "Family options", "Protection history"];
  var ACTIVE = { "Home": 1, "Virus & threat protection": 1, "Protection history": 1 };

  function build(body, win) {
    var bus = FSIM.core.bus.scoped();
    var st = { page: "Home", sub: null, sigs: false, scanning: null, found: {}, status: {}, history: [], lastScan: D().lastScan, lastFiles: null, scanType: "Quick scan", folder: null };
    var root = h("div.st.sec"); body.appendChild(root);
    var nav = h("nav.st-nav", { "aria-label": "Windows Security" });
    var main = h("div.st-main", { tabindex: "-1" });
    root.appendChild(h("div.st-split", nav, main));
    var navBtns = {};
    NAV.concat(["Settings"]).forEach(function (n) {
      var b = h("button.st-nav-btn" + (n === "Settings" ? ".st-bottom" : ""), { type: "button", "data-page": n, text: n });
      b.addEventListener("click", function () { if (ACTIVE[n]) show(n); else FSIM.core.toast(root, "غير مفعّل في المحاكاة"); });
      navBtns[n] = b; nav.appendChild(b);
    });
    function off() { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); }
    function btn(label, fn, primary) { var b = h("button.st-btn" + (primary ? ".is-primary" : ""), { type: "button", text: label }); b.addEventListener("click", fn); return b; }
    function link(label, fn) { var b = h("button.st-linkbtn", { type: "button", text: label }); b.addEventListener("click", fn); return b; }
    function show(page, sub) {
      st.page = page; st.sub = sub || null;
      Object.keys(navBtns).forEach(function (k) { navBtns[k].classList.toggle("is-current", k === page); });
      render();
      bus.emit("defender:page", { page: sub || page });
    }
    function threat(id) { return D().threats.filter(function (t) { return t.id === id; })[0]; }
    function active() { return Object.keys(st.found).filter(function (id) { return st.status[id] === "Active"; }); }

    function render() {
      main.textContent = "";
      if (st.page === "Home") {
        main.appendChild(h("h2.st-h", { text: "Security at a glance" }));
        var bad = active().length > 0, sigOld = !st.sigs;
        var cards = [["Virus & threat protection", bad ? "Actions recommended." : sigOld ? "Protection updates recommended." : "No action needed.", bad ? "bad" : sigOld ? "warn" : "ok"],
          ["Account protection", "No action needed.", "ok"], ["Firewall & network protection", "No action needed.", "ok"], ["App & browser control", "No action needed.", "ok"], ["Device security", "View status and manage hardware security features", "ok"], ["Device performance & health", "No action needed.", "ok"]];
        main.appendChild(h("div.st-cards", cards.map(function (c) {
          return h("button.st-card.st-link", { type: "button", onclick: function () { if (ACTIVE[c[0]]) show(c[0]); else off(); } },
            h("span.sec-mark.is-" + c[2], { "aria-hidden": "true", text: c[2] === "ok" ? "✓" : c[2] === "bad" ? "✕" : "!" }), h("strong", { text: c[0] }), h("small", { text: c[1] }));
        })));
        return;
      }
      if (st.page === "Protection history") { renderHistory(); return; }
      if (st.sub === "Scan options") { renderScanOptions(); return; }
      if (st.sub === "Protection updates") { renderUpdates(); return; }
      if (st.sub === "Manage settings") { renderSettings(); return; }
      main.appendChild(h("h2.st-h", { text: "Virus & threat protection" }));
      main.appendChild(h("h3.st-sub", { text: "Current threats" }));
      if (st.scanning) {
        main.appendChild(h("div.sec-scan", { role: "status" }, h("strong", { text: st.scanning + " running…" }), h("small", { text: "Estimated time remaining: " + (FSIM.core.config.fast ? "0" : "3") + " minutes" }), h("div.pbar", h("i.sec-pbar"))));
      } else if (active().length) {
        main.appendChild(h("p.sec-alert", { text: "Threats found. Start the recommended actions." }));
        main.appendChild(threatList(active()));
        main.appendChild(btn("Start actions", function () { active().forEach(function (id) { act("Quarantine", id); }); }, true));
      } else {
        main.appendChild(h("p", { text: "No current threats." }));
        main.appendChild(h("small.st-meta", { text: "Last scan: " + st.lastScan }));
        main.appendChild(h("small.st-meta", { text: (st.lastFound || 0) + " threats found." }));
        if (st.lastFiles) { main.appendChild(h("small.st-meta", { text: "Scan lasted " + st.lastFiles.lasted })); main.appendChild(h("small.st-meta", { text: st.lastFiles.files + " files scanned." })); }
      }
      main.appendChild(h("div.st-actions", btn("Quick scan", function () { scan("quick"); }, true)));
      main.appendChild(h("div.st-list", link("Scan options", function () { show("Virus & threat protection", "Scan options"); }), link("Allowed threats", off), link("Protection history", function () { show("Protection history"); })));
      main.appendChild(h("h3.st-sub", { text: "Virus & threat protection settings" }));
      main.appendChild(h("p.st-meta", { text: "No action needed." }));
      main.appendChild(link("Manage settings", function () { show("Virus & threat protection", "Manage settings"); }));
      main.appendChild(h("h3.st-sub", { text: "Virus & threat protection updates" }));
      main.appendChild(h("p.st-meta", { text: st.sigs ? "Security intelligence is up to date." : "Security intelligence is out of date." }));
      main.appendChild(link("Protection updates", function () { show("Virus & threat protection", "Protection updates"); }));
    }

    function threatList(ids) {
      return h("div.st-list.sec-threats", ids.map(function (id) {
        var t = threat(id);
        var sel = h("select.sec-act", { "aria-label": "Actions for " + t.name, "data-threat": t.id }, ["Actions", "Remove", "Quarantine", "Allow on device"].map(function (o) { return h("option", { value: o, text: o }); }));
        sel.addEventListener("change", function () { var v = sel.value; sel.value = "Actions"; if (v !== "Actions") act(v, id); });
        return h("div.st-row.sec-threat", { "data-threat-row": t.id },
          h("div", h("strong", { lang: "en", text: t.name }), h("small", { text: t.date })),
          h("dl.sec-dl", h("dt", { text: "Alert level" }), h("dd", { text: t.level }), h("dt", { text: "Status" }), h("dd", { text: st.status[id] }), h("dt", { text: "Category" }), h("dd", { text: t.category }),
            h("dt", { text: "Affected items" }), h("dd", t.items.map(function (x) { return h("div", { text: x }); }))),
          sel);
      }));
    }

    function scan(type) {
      if (st.scanning) return;
      st.scanning = type === "quick" ? "Quick scan" : type === "full" ? "Full scan" : "Custom scan";
      show("Virus & threat protection");
      setTimeout(function () {
        var found = [];
        D().threats.forEach(function (t) {
          var hit = st.sigs && ((type === "quick" && t.foundBy === "quick") ||
            (type === "custom" && t.foundBy === "custom" && st.folder === D().custom.folder) ||
            (type === "custom" && t.foundBy === "quick" && st.folder === D().folders[1]));
          if (hit && !st.found[t.id]) { st.found[t.id] = type; st.status[t.id] = "Active"; found.push(t.name); }
        });
        st.lastFound = found.length;
        st.scanning = null; st.lastScanId = type;
        st.lastScan = "Today, 11:2" + (type === "quick" ? "0" : "9") + " AM (" + (type === "quick" ? "quick" : "custom") + " scan)";
        st.lastFiles = type === "quick" ? D().quick : { files: D().custom.files, lasted: "1 seconds" };
        render();
        bus.emit("defender:scan", { type: type, found: found.length, sigs: st.sigs });
      }, FSIM.core.config.fast ? 20 : 2200);
    }

    function act(action, id) {
      var t = threat(id);
      if (action === "Allow on device") { FSIM.core.toast(root, "«السماح» يترك البرنامج يعمل ويوقف التنبيه. لا يُستخدم مع تهديد حقيقي؛ غير منفَّذ في المحاكاة."); bus.emit("defender:action", { action: action, threat: t.name, done: false }); return; }
      var status = action === "Remove" ? "Removed" : "Quarantined";
      st.status[id] = status;
      st.history.unshift({ id: id, title: action === "Remove" ? "Threat removed or restored" : "Threat quarantined", time: "10/13/2026 " + t.quarantinedAt, status: status });
      if (t.id === "pua") FSIM.core.sim.data.quarantined = true;
      render();
      bus.emit("defender:action", { action: action, threat: t.name, done: true });
    }

    function renderScanOptions() {
      main.appendChild(h("p.st-crumb", link("Virus & threat protection", function () { show("Virus & threat protection"); }), " › Scan options"));
      main.appendChild(h("h2.st-h", { text: "Scan options" }));
      var group = h("div.st-list", { role: "radiogroup", "aria-label": "Scan options" });
      [["Quick scan", "Checks folders in your system where threats are commonly found."], ["Full scan", "Checks all files and running programs on your hard disk."], ["Custom scan", "Choose which files and locations you want to check."], ["Microsoft Defender Antivirus (offline scan)", "Some malicious software can be particularly difficult to remove from your device."]].forEach(function (o) {
        var r = h("input", { type: "radio", name: "sec-scan", value: o[0], id: "sec-" + o[0].replace(/\W+/g, "") });
        if (st.scanType === o[0]) r.checked = true;
        r.addEventListener("change", function () { st.scanType = o[0]; });
        group.appendChild(h("label.st-row.sec-radio", { "for": r.id }, r, h("span", h("strong", { text: o[0] }), h("small", { text: o[1] }))));
      });
      main.appendChild(group);
      main.appendChild(btn("Scan now", function () {
        if (st.scanType === "Quick scan") scan("quick");
        else if (st.scanType === "Custom scan") pickFolder();
        else FSIM.core.toast(root, "غير مفعّل في المحاكاة: يستغرق وقتاً طويلاً. استخدم Quick scan أو Custom scan.");
      }, true));
    }
    function pickFolder() {
      var back = h("div.dlg-back"), list = h("div.dlg-list", { role: "listbox", "aria-label": "Folders" }), chosen = null;
      D().folders.forEach(function (f) {
        var b = h("button.dlg-row", { type: "button", role: "option", "aria-selected": "false", "data-folder": f, text: f });
        b.addEventListener("click", function () { chosen = f; Array.prototype.forEach.call(list.children, function (x) { x.setAttribute("aria-selected", String(x === b)); x.classList.toggle("is-selected", x === b); }); });
        list.appendChild(b);
      });
      var ok = h("button.dlg-btn", { type: "button", text: "Select Folder" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" });
      back.appendChild(h("div.dlg", { role: "dialog", "aria-modal": "true", "aria-label": "Select Folder" }, h("h4", { text: "Select Folder" }), list, h("div.dlg-btns", ok, cancel)));
      root.appendChild(back);
      ok.addEventListener("click", function () { if (!chosen) return; back.remove(); st.folder = chosen; scan("custom"); });
      cancel.addEventListener("click", function () { back.remove(); });
    }
    function renderUpdates() {
      var s = st.sigs ? D().sigAfter : D().sigBefore;
      main.appendChild(h("p.st-crumb", link("Virus & threat protection", function () { show("Virus & threat protection"); }), " › Protection updates"));
      main.appendChild(h("h2.st-h", { text: "Protection updates" }));
      main.appendChild(h("h3.st-sub", { text: "Security intelligence" }));
      main.appendChild(h("p.st-meta", { "data-sig": s.version, text: "Security intelligence version: " + s.version }));
      if (!st.sigs) main.appendChild(h("p.st-meta", { text: "Version created on: " + s.created }));
      main.appendChild(h("p.st-meta", { text: "Last update: " + s.lastUpdate }));
      main.appendChild(btn("Check for updates", function () {
        if (st.sigs) { FSIM.core.toast(root, "Security intelligence is up to date."); return; }
        st.sigs = true; render(); bus.emit("defender:sigupdate", { version: D().sigAfter.version });
      }, true));
    }
    function renderSettings() {
      main.appendChild(h("p.st-crumb", link("Virus & threat protection", function () { show("Virus & threat protection"); }), " › Manage settings"));
      main.appendChild(h("h2.st-h", { text: "Virus & threat protection settings" }));
      ["Real-time protection", "Dev Drive protection", "Cloud-delivered protection", "Automatic sample submission", "Tamper Protection"].forEach(function (n) {
        var sw = h("button.st-switch.is-on", { type: "button", role: "switch", "aria-checked": "true", "aria-label": n, text: "On" });
        sw.addEventListener("click", function () { FSIM.core.toast(root, "إطفاء «" + n + "» يترك الجهاز بلا حماية؛ المحاكاة لا تطفئه. أول ما يحاوله برنامج خبيث هو إيقاف الحماية."); });
        main.appendChild(h("div.st-row.st-toggle", h("span", { text: n }), sw));
      });
      main.appendChild(h("h3.st-sub", { text: "Exclusions" }));
      main.appendChild(link("Add or remove exclusions", off));
    }
    function renderHistory() {
      main.appendChild(h("h2.st-h", { text: "Protection history" }));
      main.appendChild(h("div.st-actions", h("select", { "aria-label": "Filters", disabled: "" }, h("option", { text: "Filters" }))));
      if (!st.history.length) { main.appendChild(h("p", { text: "No recent items." })); return; }
      main.appendChild(h("div.st-list", st.history.map(function (e) {
        var t = threat(e.id);
        return h("details.st-group.sec-hist", { "data-hist": e.id }, h("summary", { text: e.title + " — " + e.time }),
          h("dl.sec-dl", h("dt", { text: "Detected:" }), h("dd", { lang: "en", text: t.name }), h("dt", { text: "Status:" }), h("dd", { text: e.status }), h("dt", { text: "Date:" }), h("dd", { text: e.time }),
            h("dt", { text: "Alert level:" }), h("dd", { text: t.level }), h("dt", { text: "Category:" }), h("dd", { text: t.category }), h("dt", { text: "Affected items:" }), h("dd", t.items.map(function (x) { return h("div", { text: x }); }))));
      })));
    }

    show("Home");
    body.api = {
      show: show, scan: scan,
      updateSigs: function () { show("Virus & threat protection", "Protection updates"); st.sigs = true; render(); bus.emit("defender:sigupdate", { version: D().sigAfter.version }); },
      customScan: function (folder) { st.folder = folder || D().custom.folder; scan("custom"); },
      act: function (action, id) { act(action, id); },
      waitScan: function () { return new Promise(function (r) { (function w() { if (!body.isConnected || !st.scanning) r(); else setTimeout(w, 30); })(); }); }
    };
  }

  FSIM.tools.defender = {
    id: "defender", prompt: "",
    open: function (stage, o) { o = o || {}; return stage.create({ id: "defender", title: "Windows Security", icon: "shield", skin: "win", width: o.width || 880, height: o.height || 500, x: o.x, y: o.y, build: build }); },
    /* interpretation: cmd = trojan | pua | updates */
    outputOf: function (cmd) {
      var d = D();
      if (cmd === "updates") return ["Protection updates", "", "Before:  Security intelligence version: " + d.sigBefore.version, "         Version created on: " + d.sigBefore.created, "         Last update: " + d.sigBefore.lastUpdate, "", "After:   Security intelligence version: " + d.sigAfter.version, "         Last update: " + d.sigAfter.lastUpdate];
      var t = d.threats.filter(function (x) { return x.id === cmd; })[0];
      return ["Threat quarantined — 10/13/2026 " + t.quarantinedAt, "", "Detected:       " + t.name, "Status:         Quarantined", "Date:           " + t.date, "Alert level:    " + t.level, "Category:       " + t.category, "Affected items:"].concat(t.items.map(function (x) { return "    " + x; }));
    }
  };
})();
