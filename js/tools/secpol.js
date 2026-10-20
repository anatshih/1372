/* FSIM.tools.secpol — Local Security Policy (secpol.msc) on ACC-PC1 (docs/ui-reference.md §9; outputs-spec §ي-1, ي-2).
   Values written to FSIM.core.sim.data.policy so runas (CMD) locks the test account at the new threshold.
   Bus events: secpol:node {node} • secpol:set {policy, value} • secpol:passwordDone • secpol:lockoutDone */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, S = function () { return FSIM.data.case.secpol; };
  var TREE = [["Security Settings", 0], ["Account Policies", 1], ["Password Policy", 2], ["Account Lockout Policy", 2], ["Local Policies", 1], ["Audit Policy", 2], ["User Rights Assignment", 2], ["Security Options", 2],
    ["Windows Defender Firewall with Advanced Security", 1], ["Network List Manager Policies", 1], ["Public Key Policies", 1], ["Software Restriction Policies", 1], ["Application Control Policies", 1], ["IP Security Policies on Local Computer", 1], ["Advanced Audit Policy Configuration", 1]];
  var LIMITS = { "Enforce password history": [0, 24], "Maximum password age": [0, 999], "Minimum password age": [0, 998], "Minimum password length": [0, 14], "Account lockout threshold": [0, 999], "Account lockout duration": [0, 99999], "Reset account lockout counter after": [1, 99999] };

  function fmt(row, v) {
    var unit = row[3];
    if (v === null || v === undefined) return "Not Applicable";
    if (unit === "toggle" || unit === "fixed") return v;
    if (row[0] === "Maximum password age" && v === 0) return "Password will not expire.";
    return v + " " + unit;
  }

  function build(body, win) {
    var bus = FSIM.core.bus.scoped();
    var d = FSIM.core.sim.data, st = { node: "Security Settings", vals: {} };
    S().password.concat(S().lockout).forEach(function (r) { st.vals[r[0]] = r[1]; });
    d.policy = { threshold: 0 };
    var root = h("div.mmc"); body.appendChild(root);
    root.appendChild(FSIM.core.menubar(root, { File: [["Exit"]], Action: [["Properties", "props"], ["Refresh", "refresh"]], View: [["Customize..."]], Help: [["Help Topics"]] }, function (m, k) { if (k === "props" && st.sel) open(st.sel); else render(); }));
    var tree = h("nav.mmc-tree", { "aria-label": "Console tree" }), center = h("div.mmc-center");
    root.appendChild(h("div.mmc-split.is-two", tree, center));
    TREE.forEach(function (n) {
      var b = h("button.mmc-node.is-l" + n[1], { type: "button", "data-node": n[0], text: n[0] });
      b.addEventListener("click", function () { if (["Security Settings", "Account Policies", "Password Policy", "Account Lockout Policy"].indexOf(n[0]) < 0) { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); return; } select(n[0]); });
      tree.appendChild(b);
    });
    function rowsOf(node) { return node === "Password Policy" ? S().password : node === "Account Lockout Policy" ? S().lockout : []; }
    function select(node) {
      st.node = node; st.sel = null;
      Array.prototype.forEach.call(tree.children, function (b) { b.classList.toggle("is-current", b.getAttribute("data-node") === node); });
      render(); bus.emit("secpol:node", { node: node });
    }
    function render() {
      center.textContent = "";
      var rows = rowsOf(st.node);
      if (!rows.length) {
        center.appendChild(h("div.gr-wrap", h("table.gr-table", h("thead", h("tr", h("th", { text: "Name" }), h("th", { text: "Description" }))),
          h("tbody", (st.node === "Security Settings" ? [["Account Policies", "Password and account lockout policies"], ["Local Policies", "Auditing, user rights and security options policies"]] : [["Password Policy", "Password Policy"], ["Account Lockout Policy", "Account Lockout Policy"]]).map(function (r) {
            var tr = h("tr.gr-row", h("td", { text: r[0] }), h("td", { text: r[1] })); tr.addEventListener("dblclick", function () { if (r[0] === "Local Policies") return; select(r[0] === "Account Policies" ? "Account Policies" : r[0]); }); return tr;
          })))));
        return;
      }
      var grid = FSIM.core.grid({ columns: ["Policy", "Security Setting"], label: st.node, sortable: false,
        rows: rows.map(function (r) { return { key: r[0], cells: [r[0], fmt(r, st.vals[r[0]])] }; }), onSelect: function (r) { st.sel = r.key; } });
      center.appendChild(grid.el);
      grid.el.addEventListener("dblclick", function () { if (st.sel) open(st.sel); });
      grid.el.addEventListener("keydown", function (e) { if (e.key === "Enter" && st.sel) { e.preventDefault(); open(st.sel); } });
    }
    function rowOf(name) { return S().password.concat(S().lockout).filter(function (r) { return r[0] === name; })[0]; }

    function open(name) {
      var row = rowOf(name);
      if (row[3] === "fixed") { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); return; }
      var back = h("div.dlg-back"), body2 = h("div.wiz-body"), val = st.vals[name];
      var dlg = h("div.dlg.wiz", { role: "dialog", "aria-modal": "true", "aria-label": name + " Properties" }, h("h4", { text: name + " Properties" }),
        h("div.ar-tabs", h("button.ar-tab", { type: "button", "aria-selected": "true", text: "Local Security Setting" }), h("button.ar-tab.is-off", { type: "button", "aria-selected": "false", text: "Explain" })), body2);
      var input;
      if (row[3] === "toggle") {
        ["Enabled", "Disabled"].forEach(function (o) {
          var r = h("input", { type: "radio", name: "sp-t", id: "sp-" + o, value: o }); r.checked = val === o;
          r.addEventListener("change", function () { val = o; });
          body2.appendChild(h("label.wiz-opt", { "for": "sp-" + o }, r, " " + o));
        });
      } else {
        body2.appendChild(h("p", { text: name.replace(/^Account /, "Account ") + ":" }));
        input = h("input#sp-num", { type: "number", min: String(LIMITS[name][0]), max: String(LIMITS[name][1]), "aria-label": name, dir: "ltr" });
        input.value = val === null || val === undefined ? "" : String(val);
        body2.appendChild(h("div.fw-add", input, h("span", { text: row[3] })));
      }
      var ok = h("button.dlg-btn", { type: "button", text: "OK" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" }), apply = h("button.dlg-btn", { type: "button", text: "Apply" });
      function commit() {
        if (input) {
          var n = parseInt(input.value, 10), lim = LIMITS[name];
          if (isNaN(n) || n < lim[0] || n > lim[1]) { FSIM.core.toast(dlg, "Please enter a value between " + lim[0] + " and " + lim[1] + "."); return false; }
          if (name === "Reset account lockout counter after" && st.vals["Account lockout duration"] && n > st.vals["Account lockout duration"]) { FSIM.core.toast(dlg, "The Reset account lockout counter after value must be less than or equal to the Account lockout duration value."); return false; }
          val = n;
        }
        set(name, val);
        return true;
      }
      ok.addEventListener("click", function () { if (commit() !== false) back.remove(); });
      apply.addEventListener("click", commit);
      cancel.addEventListener("click", function () { back.remove(); });
      dlg.appendChild(h("div.dlg-btns", ok, cancel, apply));
      back.appendChild(dlg); root.appendChild(back);
      (input || dlg.querySelector("input")).focus();
    }

    function set(name, v) {
      var before = st.vals[name];
      st.vals[name] = v;
      if (name === "Account lockout threshold") {
        if (v > 0 && (before === 0 || before === null)) {
          st.vals["Account lockout duration"] = S().suggested; st.vals["Reset account lockout counter after"] = S().suggested;
          suggested(v);
        }
        if (v === 0) { st.vals["Account lockout duration"] = null; st.vals["Reset account lockout counter after"] = null; }
      }
      FSIM.core.sim.data.policy = { threshold: st.vals["Account lockout threshold"], duration: st.vals["Account lockout duration"], reset: st.vals["Reset account lockout counter after"], length: st.vals["Minimum password length"] };
      render();
      bus.emit("secpol:set", { policy: name, value: v });
      check();
    }
    function suggested(v) {
      var back = h("div.dlg-back"), ok = h("button.dlg-btn", { type: "button", text: "OK" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" });
      back.appendChild(h("div.dlg", { role: "dialog", "aria-modal": "true", "aria-label": "Suggested Value Changes" }, h("h4", { text: "Suggested Value Changes" }),
        h("p", { text: "Because the value of Account lockout threshold is now " + v + " invalid logon attempts, the settings for the following items will be changed to suggested values." }),
        h("table.gr-table", h("thead", h("tr", h("th", { text: "Policy" }), h("th", { text: "Policy Setting" }), h("th", { text: "Suggested Setting" }))),
          h("tbody", ["Account lockout duration", "Reset account lockout counter after"].map(function (n) { return h("tr", h("td", { text: n }), h("td", { text: "Not Applicable" }), h("td", { text: S().suggested + " minutes" })); }))),
        h("div.dlg-btns", ok, cancel)));
      root.appendChild(back); ok.focus();
      ok.addEventListener("click", function () { back.remove(); });
      cancel.addEventListener("click", function () { back.remove(); });
    }
    function check() {
      var v = st.vals, done = st.done || (st.done = {});
      if (!done.pw && v["Minimum password length"] === 14 && v["Password must meet complexity requirements"] === "Enabled" && v["Enforce password history"] === 24 && v["Minimum password age"] === 1) { done.pw = true; bus.emit("secpol:passwordDone", {}); }
      if (!done.lo && v["Account lockout threshold"] === 5 && v["Account lockout duration"] === 15 && v["Reset account lockout counter after"] === 15) { done.lo = true; bus.emit("secpol:lockoutDone", {}); }
    }

    select("Security Settings");
    body.api = {
      select: select,
      set: function (name, v) { set(name, v); var dl = root.querySelector(".dlg-back"); if (dl) dl.remove(); },
      applyAll: function (which) {
        if (which === "password") { select("Password Policy"); [["Minimum password length", 14], ["Password must meet complexity requirements", "Enabled"], ["Enforce password history", 24], ["Minimum password age", 1]].forEach(function (x) { set(x[0], x[1]); }); }
        else { select("Account Lockout Policy"); set("Account lockout threshold", 5); var dl = root.querySelector(".dlg-back"); if (dl) dl.remove(); set("Account lockout duration", 15); set("Reset account lockout counter after", 15); }
      }
    };
  }

  FSIM.tools.secpol = {
    id: "secpol",
    open: function (stage, o) { o = o || {}; return stage.create({ id: "secpol", title: "Local Security Policy", icon: "shield", skin: "win", width: o.width || 860, height: o.height || 440, x: o.x, y: o.y, build: build }); },
    /* interpretation: src.table = password | lockout, src.state before | after */
    annotTable: function (src) {
      var rows = src.table === "lockout" ? S().lockout : S().password;
      return { columns: ["Policy", "Security Setting"], rows: rows.map(function (r) { var v = src.state === "after" ? r[2] : r[1]; return { key: r[0], cells: [r[0], fmt(r, v)] }; }) };
    }
  };
})();
