/* FSIM.tools.winupdate — Windows 11 Settings › Windows Update on ACC-PC1 (docs/ui-reference.md §5; outputs-spec §و).
   Successful path only (instructor's decision). Bus events: winupdate:page {page} • winupdate:install • winupdate:installed
   • winupdate:restart • winupdate:history */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, U = function () { return FSIM.data.case.update; };
  var NAV = ["Home", "System", "Bluetooth & devices", "Network & internet", "Personalization", "Apps", "Accounts", "Time & language", "Gaming", "Accessibility", "Privacy & security", "Windows Update"];

  /* phase: available → installing → restart → uptodate */
  function lines(phase) {
    var u = U(), L = [];
    if (phase === "history") {
      L.push("Update history", "", "Quality Updates", "  " + u.items[0].name, "  Successfully installed on " + u.installedOn, "", "Driver Updates", "", "Definition Updates", "  " + u.items[1].name, "  Successfully installed on " + u.installedOn, "", "Other Updates", "", "Related settings: Uninstall updates • Recovery");
      return L;
    }
    if (phase === "available") L.push("Updates available", "Last checked: " + u.lastChecked, "[ Download & install all ]", "");
    if (phase === "restart") L.push("Restart required", "[ Restart now ]  [ Schedule the restart ]", "");
    if (phase === "uptodate") L.push("You're up to date", "Last checked: " + u.lastCheckedAfter, "[ Check for updates ]", "");
    if (phase !== "uptodate") u.items.forEach(function (it, i) {
      L.push(it.name);
      L.push("    " + (phase === "available" ? "Pending download" : i === 0 ? "Pending restart" : "Successfully installed"));
    });
    L.push("", "Get the latest updates as soon as they're available   Off", "", "More options", "  Pause updates          Pause for 1 week ▾", "  Update history", "  Advanced options", "  Windows Insider Program");
    return L;
  }

  function build(body, win) {
    var st = { page: "Home", phase: "available", busy: false, prog: [0, 0] };
    var root = h("div.st"); body.appendChild(root);
    var nav = h("nav.st-nav", { "aria-label": "Settings" });
    var main = h("div.st-main", { tabindex: "-1" });
    root.appendChild(h("div.st-user", h("span.st-avatar", { "aria-hidden": "true", text: "C" }), h("span", h("strong", { text: "Consultant" }), h("br"), h("small", { text: "Local Account" }))));
    root.appendChild(h("div.st-split", nav, main));
    var navBtns = {};
    NAV.forEach(function (n) {
      var b = h("button.st-nav-btn", { type: "button", "data-page": n, text: n });
      b.addEventListener("click", function () { if (n === "Home" || n === "Windows Update") show(n); else FSIM.core.toast(root, "غير مفعّل في المحاكاة"); });
      navBtns[n] = b; nav.appendChild(b);
    });

    function show(page) {
      st.page = page;
      Object.keys(navBtns).forEach(function (k) { navBtns[k].classList.toggle("is-current", k === (page === "Update history" ? "Windows Update" : page)); });
      render();
      bus.emit("winupdate:page", { page: page });
    }
    function btn(label, fn, primary) { var b = h("button.st-btn" + (primary ? ".is-primary" : ""), { type: "button", text: label }); b.addEventListener("click", fn); return b; }
    function off() { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); }

    function render() {
      main.textContent = "";
      var u = U();
      if (st.page === "Home") {
        main.appendChild(h("h2.st-h", { text: "Home" }));
        main.appendChild(h("div.st-cards",
          h("div.st-card", h("strong", { text: "Recommended settings" }), h("small", { text: "Recent and commonly used settings" })),
          h("button.st-card.st-link", { type: "button", onclick: function () { show("Windows Update"); } }, h("strong", { text: "Windows Update" }), h("small", { text: st.phase === "uptodate" ? "You're up to date" : "Updates available" }))));
        return;
      }
      if (st.page === "Update history") {
        main.appendChild(h("p.st-crumb", h("button.st-linkbtn", { type: "button", text: "Windows Update", onclick: function () { show("Windows Update"); } }), " › Update history"));
        var installed = st.phase === "uptodate" || st.phase === "restart";
        [["Quality Updates", 0], ["Driver Updates", -1], ["Definition Updates", 1], ["Other Updates", -1]].forEach(function (g) {
          var it = g[1] >= 0 ? u.items[g[1]] : null;
          var ok = it && (installed || (g[1] === 1 && st.phase !== "available"));
          main.appendChild(h("details.st-group", { open: "" }, h("summary", { text: g[0] + (ok ? " (1)" : " (0)") }),
            ok ? h("div.st-row", h("span", { text: it.name }), h("small", { text: "Successfully installed on " + u.installedOn })) : h("div.st-row.is-empty", { text: "No updates" })));
        });
        main.appendChild(h("h3.st-sub", { text: "Related settings" }));
        main.appendChild(h("div.st-list", btn("Uninstall updates", off), btn("Recovery", off)));
        return;
      }
      /* Windows Update */
      var head = { available: ["Updates available", "Last checked: " + u.lastChecked], installing: ["Updates available", "Installing updates…"], restart: ["Restart required", "Your device needs to restart to finish installing updates."], uptodate: ["You're up to date", "Last checked: " + u.lastCheckedAfter] }[st.phase];
      var action = st.phase === "available" ? btn("Download & install all", install, true)
        : st.phase === "restart" ? h("span.st-actions", btn("Restart now", restart, true), btn("Schedule the restart", off))
        : st.phase === "uptodate" ? btn("Check for updates", function () { FSIM.core.toast(root, "Checking for updates… You're up to date."); }, true) : h("span");
      main.appendChild(h("div.st-wuhead", h("span.st-wuicon" + (st.phase === "uptodate" ? ".is-ok" : st.phase === "restart" ? ".is-warn" : ""), { "aria-hidden": "true", text: st.phase === "uptodate" ? "✓" : "⟳" }),
        h("div", h("h2.st-h", { text: head[0] }), h("small", { text: head[1] })), h("span.st-spacer"), action));
      if (st.phase !== "uptodate") {
        var list = h("div.st-list.st-updates");
        u.items.forEach(function (it, i) {
          var status = st.phase === "available" ? "Pending download"
            : st.phase === "installing" ? (st.prog[i] < 50 ? "Downloading - " + Math.min(100, st.prog[i] * 2) + "%" : "Installing - " + Math.min(100, (st.prog[i] - 50) * 2) + "%")
            : i === 0 ? "Pending restart" : "Successfully installed";
          list.appendChild(h("div.st-row", { "data-kb": it.kb }, h("span", { text: it.name }), h("small.st-status", { text: status })));
        });
        main.appendChild(list);
      }
      main.appendChild(h("div.st-row.st-toggle", h("span", { text: "Get the latest updates as soon as they're available" }), h("span.st-switch", { role: "switch", "aria-checked": "false", text: "Off" })));
      main.appendChild(h("h3.st-sub", { text: "More options" }));
      main.appendChild(h("div.st-list",
        h("div.st-row", h("span", { text: "Pause updates" }), h("select", { disabled: "", "aria-label": "Pause updates" }, h("option", { text: "Pause for 1 week" }))),
        btn("Update history", function () { show("Update history"); bus.emit("winupdate:history", {}); }),
        btn("Advanced options", off), btn("Windows Insider Program", off)));
    }

    function install() {
      if (st.busy) return;
      st.busy = true; st.phase = "installing"; st.prog = [0, 0]; render(); bus.emit("winupdate:install", {});
      var t = setInterval(function () {
        st.prog = st.prog.map(function (p, i) { return Math.min(100, p + (i ? 12 : 8)); });
        if (st.page === "Windows Update") render();
        if (st.prog.every(function (p) { return p >= 100; })) { clearInterval(t); st.busy = false; st.phase = "restart"; render(); bus.emit("winupdate:installed", {}); }
      }, FSIM.core.config.fast ? 1 : 200);
    }
    function restart() {
      var cover = h("div.st-restart", { role: "status", text: "Restarting…" });
      root.appendChild(cover);
      setTimeout(function () { cover.remove(); st.phase = "uptodate"; FSIM.core.sim.data.patched = true; render(); bus.emit("winupdate:restart", {}); }, FSIM.core.config.fast ? 10 : 1500);
    }

    show("Home");
    body.api = {
      show: show, install: install, restart: restart,
      waitInstalled: function () { return new Promise(function (r) { (function w() { if (st.phase === "restart" || st.phase === "uptodate") r(); else setTimeout(w, 30); })(); }); },
      waitRestarted: function () { return new Promise(function (r) { (function w() { if (st.phase === "uptodate") r(); else setTimeout(w, 30); })(); }); },
      history: function () { show("Update history"); bus.emit("winupdate:history", {}); }
    };
  }

  FSIM.tools.winupdate = {
    id: "winupdate", prompt: "", lines: lines,
    open: function (stage, o) { o = o || {}; return stage.create({ id: "winupdate", title: "Settings", icon: "settings", skin: "win", width: o.width || 860, height: o.height || 480, x: o.x, y: o.y, build: build }); },
    /* interpretation: cmd = available | restart | uptodate | history */
    outputOf: function (cmd) { return lines(cmd); }
  };
})();
