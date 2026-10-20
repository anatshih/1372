/* FSIM.tools.firewall — Windows Defender Firewall with Advanced Security (wf.msc) on ACC-PC1 (docs/ui-reference.md §8; outputs-spec §ط).
   Bus events: fw:node {node} • fw:rule {name, proto, port, action, profiles} • fw:toggle {name, enabled} • fw:scope {name, remote} */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, F = function () { return FSIM.data.case.firewall; };
  var COLS = ["Name", "Group", "Profile", "Enabled", "Action", "Override", "Program", "Local Address", "Remote Address", "Protocol", "Local Port"];
  var ROOT = "Windows Defender Firewall with Advanced Security on Local Computer";

  function toRule(r) { return { name: r[0], group: r[1], profile: r[2], enabled: r[3], action: r[4], program: r[5], remote: r[6], proto: r[7], port: r[8] }; }
  function cells(r) { return [(r.enabled === "Yes" ? (r.action === "Block" ? "⊘ " : "✓ ") : "○ ") + r.name, r.group, r.profile, r.enabled, r.action, "No", r.program || "Any", "Any", r.remote, r.proto, r.port]; }

  function build(body, win) {
    var st = { node: ROOT, sel: null, inbound: F().inbound.map(toRule), outbound: F().outbound.map(toRule) };
    var root = h("div.mmc"); body.appendChild(root);
    root.appendChild(FSIM.core.menubar(root, { File: [["Exit"]], Action: [["New Rule...", "new"], ["Refresh", "refresh"]], View: [["Customize..."]], Help: [["Help Topics"]] }, function (m, k) { if (k === "new") newRule(); else render(); }));
    var tree = h("nav.mmc-tree", { "aria-label": "Console tree" });
    var center = h("div.mmc-center");
    var actions = h("aside.mmc-actions", { "aria-label": "Actions" });
    root.appendChild(h("div.mmc-split", tree, center, actions));
    [[ROOT, 0], ["Inbound Rules", 1], ["Outbound Rules", 1], ["Connection Security Rules", 1], ["Monitoring", 1]].forEach(function (n) {
      var b = h("button.mmc-node" + (n[1] ? ".is-child" : ""), { type: "button", "data-node": n[0], text: n[0] });
      b.addEventListener("click", function () { if (n[0] === "Connection Security Rules" || n[0] === "Monitoring") { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); return; } select(n[0]); });
      tree.appendChild(b);
    });
    function select(node) {
      st.node = node; st.sel = null;
      Array.prototype.forEach.call(tree.children, function (b) { b.classList.toggle("is-current", b.getAttribute("data-node") === node); });
      render(); bus.emit("fw:node", { node: node });
    }
    function rules() { return st.node === "Outbound Rules" ? st.outbound : st.inbound; }
    function find(name) { return st.inbound.concat(st.outbound).filter(function (r) { return r.name === name; })[0]; }
    function act(label, fn) { var b = h("button.mmc-act", { type: "button", text: label }); b.addEventListener("click", fn || function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); }); return b; }

    function render() {
      center.textContent = ""; actions.textContent = "";
      if (st.node === ROOT) {
        center.appendChild(h("h3.mmc-h", { text: "Windows Defender Firewall with Advanced Security on Local Computer" }));
        F().profiles.forEach(function (p) {
          center.appendChild(h("div.mmc-profile", h("strong", { text: p }),
            h("p", { text: "✓ Windows Defender Firewall is on." }), h("p", { text: "⊘ Inbound connections that do not match a rule are blocked." }), h("p", { text: "✓ Outbound connections that do not match a rule are allowed." })));
        });
        actions.appendChild(h("h4", { text: "Windows Defender Firewall with…" }));
        actions.appendChild(act("Import Policy...")); actions.appendChild(act("Export Policy...")); actions.appendChild(act("Properties"));
        return;
      }
      center.appendChild(h("h3.mmc-h", { text: st.node }));
      var grid = FSIM.core.grid({
        columns: COLS, label: st.node, sortable: true,
        rows: rules().map(function (r) { return { key: r.name, cls: r.enabled === "No" ? "is-off" : "", cells: cells(r) }; }),
        onSelect: function (row) { st.sel = row.key; renderActions(); }
      });
      center.appendChild(grid.el);
      grid.el.addEventListener("dblclick", function () { if (st.sel) properties(find(st.sel)); });
      if (st.sel) grid.select(st.sel);
      renderActions();
    }
    function renderActions() {
      actions.textContent = "";
      actions.appendChild(h("h4", { text: st.node }));
      actions.appendChild(act("New Rule...", newRule));
      ["Filter by Profile", "Filter by State", "Filter by Group"].forEach(function (x) { actions.appendChild(act(x)); });
      actions.appendChild(act("Refresh", render)); actions.appendChild(act("Export List...")); actions.appendChild(act("Help"));
      var r = st.sel && find(st.sel);
      if (!r) return;
      actions.appendChild(h("h4", { text: r.name }));
      actions.appendChild(act(r.enabled === "Yes" ? "Disable Rule" : "Enable Rule", function () { setEnabled(r, r.enabled !== "Yes"); }));
      ["Cut", "Copy", "Delete"].forEach(function (x) { actions.appendChild(act(x, function () { FSIM.core.toast(root, x === "Delete" ? "نعطّل القواعد القديمة بدل حذفها، حتى يمكن التراجع." : "غير مفعّل في المحاكاة"); })); });
      actions.appendChild(act("Properties", function () { properties(r); }));
    }
    function setEnabled(r, on) {
      r.enabled = on ? "Yes" : "No"; render();
      bus.emit("fw:toggle", { name: r.name, enabled: on });
    }

    /* New Inbound Rule Wizard (Port rules only in the simulation) */
    function newRule() {
      if (st.node !== "Inbound Rules") select("Inbound Rules");
      function radios(el, name, opts, val, onChange, disabled) {
        opts.forEach(function (o) {
          var id = "fw-" + name + "-" + o.replace(/\W+/g, "");
          var r = h("input", { type: "radio", name: "fw-" + name, id: id, value: o, disabled: disabled && disabled.indexOf(o) >= 0 ? "" : false });
          if (o === val) r.checked = true;
          r.addEventListener("change", function () { onChange(o); });
          el.appendChild(h("label.wiz-opt", { "for": id }, r, " " + o));
        });
      }
      FSIM.core.wizard(root, {
        title: "New Inbound Rule Wizard", ariaLabel: "New Inbound Rule Wizard",
        state: { type: "Port", proto: "TCP", ports: "specific", port: "", action: "Block the connection", profiles: { Domain: true, Private: true, Public: true }, name: "", desc: "" },
        steps: [
          { title: "Rule Type", build: function (el, s) { el.appendChild(h("p", { text: "What type of rule would you like to create?" })); radios(el, "type", ["Program", "Port", "Predefined", "Custom"], s.type, function (v) { s.type = v; }, ["Program", "Predefined", "Custom"]); } },
          { title: "Protocol and Ports", build: function (el, s, refresh) {
              el.appendChild(h("p", { text: "Does this rule apply to TCP or UDP?" }));
              radios(el, "proto", ["TCP", "UDP"], s.proto, function (v) { s.proto = v; });
              el.appendChild(h("p", { text: "Does this rule apply to all local ports or specific local ports?" }));
              radios(el, "ports", ["All local ports", "Specific local ports:"], s.ports === "all" ? "All local ports" : "Specific local ports:", function (v) { s.ports = v === "All local ports" ? "all" : "specific"; refresh(); });
              var inp = h("input#fw-port", { type: "text", "aria-label": "Specific local ports", dir: "ltr", spellcheck: "false" }); inp.value = s.port;
              inp.addEventListener("input", function () { s.port = inp.value.trim(); refresh(); });
              el.appendChild(inp); el.appendChild(h("small", { text: "Example: 80, 443, 5000-5010" }));
            }, canNext: function (s) { return s.ports === "all" || /^\d+(\s*[-,]\s*\d+)*$/.test(s.port); } },
          { title: "Action", build: function (el, s) { el.appendChild(h("p", { text: "What action should be taken when a connection matches the specified conditions?" })); radios(el, "action", ["Allow the connection", "Allow the connection if it is secure", "Block the connection"], s.action, function (v) { s.action = v; }); } },
          { title: "Profile", build: function (el, s, refresh) {
              el.appendChild(h("p", { text: "When does this rule apply?" }));
              ["Domain", "Private", "Public"].forEach(function (p) {
                var cb = h("input", { type: "checkbox", id: "fw-pr-" + p }); cb.checked = s.profiles[p];
                cb.addEventListener("change", function () { s.profiles[p] = cb.checked; refresh(); });
                el.appendChild(h("label.wiz-opt", { "for": "fw-pr-" + p }, cb, " " + p));
              });
            }, canNext: function (s) { return s.profiles.Domain || s.profiles.Private || s.profiles.Public; } },
          { title: "Name", build: function (el, s, refresh) {
              var n = h("input#fw-name", { type: "text", "aria-label": "Name", spellcheck: "false" }); n.value = s.name;
              var d = h("input#fw-desc", { type: "text", "aria-label": "Description (optional)", spellcheck: "false" }); d.value = s.desc;
              n.addEventListener("input", function () { s.name = n.value; refresh(); }); d.addEventListener("input", function () { s.desc = d.value; });
              el.appendChild(h("label", { "for": "fw-name", text: "Name:" })); el.appendChild(n);
              el.appendChild(h("label", { "for": "fw-desc", text: "Description (optional):" })); el.appendChild(d);
            }, canNext: function (s) { return s.name.trim().length > 0; } }
        ],
        onFinish: function (s) {
          var prof = ["Domain", "Private", "Public"].filter(function (p) { return s.profiles[p]; });
          var r = { name: s.name.trim(), group: "", profile: prof.length === 3 ? "All" : prof.join(", "), enabled: "Yes", action: s.action === "Block the connection" ? "Block" : "Allow", program: "Any", remote: "Any", proto: s.proto, port: s.ports === "all" ? "Any" : s.port.replace(/\s+/g, "") };
          st.inbound.unshift(r); st.sel = r.name; render();
          bus.emit("fw:rule", { name: r.name, proto: r.proto, port: r.port, action: r.action, profiles: r.profile });
        }
      });
    }

    /* rule properties: General + Scope are active */
    function properties(r) {
      if (!r) return;
      var tab = "General", remote = r.remote === "Any" || r.remote === "Local subnet" ? [] : r.remote.split(", "), mode = remote.length ? "these" : "any", enabled = r.enabled === "Yes";
      var back = h("div.dlg-back"), body2 = h("div.wiz-body"), tabs = h("div.ar-tabs", { role: "tablist" });
      var dlg = h("div.dlg.wiz", { role: "dialog", "aria-modal": "true", "aria-label": r.name + " Properties" }, h("h4", { text: r.name + " Properties" }), tabs, body2);
      ["General", "Programs and Services", "Remote Computers", "Protocols and Ports", "Scope", "Advanced", "Local Principals", "Remote Users"].forEach(function (t) {
        var b = h("button.ar-tab" + (t === "General" || t === "Scope" ? "" : ".is-off"), { type: "button", role: "tab", "aria-selected": String(t === tab), text: t, "data-ptab": t });
        b.addEventListener("click", function () { if (t !== "General" && t !== "Scope") { FSIM.core.toast(dlg, "غير مفعّل في المحاكاة"); return; } tab = t; draw(); });
        tabs.appendChild(b);
      });
      function draw() {
        Array.prototype.forEach.call(tabs.children, function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-ptab") === tab)); });
        body2.textContent = "";
        if (tab === "General") {
          var cb = h("input", { type: "checkbox", id: "fw-en" }); cb.checked = enabled; cb.addEventListener("change", function () { enabled = cb.checked; });
          body2.appendChild(h("p", h("strong", { text: "Name: " }), r.name));
          body2.appendChild(h("label.wiz-opt", { "for": "fw-en" }, cb, " Enabled"));
          body2.appendChild(h("p", h("strong", { text: "Action: " }), r.action === "Block" ? "Block the connection" : "Allow the connection"));
        } else {
          body2.appendChild(h("p", h("strong", { text: "Local IP address: " }), "Any IP address"));
          body2.appendChild(h("p", h("strong", { text: "Remote IP address" })));
          [["any", "Any IP address"], ["these", "These IP addresses:"]].forEach(function (o) {
            var rb = h("input", { type: "radio", name: "fw-scope", id: "fw-sc-" + o[0] }); rb.checked = mode === o[0];
            rb.addEventListener("change", function () { mode = o[0]; draw(); });
            body2.appendChild(h("label.wiz-opt", { "for": "fw-sc-" + o[0] }, rb, " " + o[1]));
          });
          var list = h("ul.fw-iplist", remote.map(function (ip) { return h("li", { text: ip }); }));
          var add = h("input#fw-ip", { type: "text", "aria-label": "IP address", dir: "ltr", spellcheck: "false", placeholder: "192.168.50.22" });
          var addBtn = h("button.dlg-btn", { type: "button", text: "Add..." });
          addBtn.addEventListener("click", function () { var v = add.value.trim(); if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) { FSIM.core.toast(dlg, "اكتب عنوان IP صحيحاً."); return; } if (remote.indexOf(v) < 0) remote.push(v); mode = "these"; draw(); });
          var rm = h("button.dlg-btn", { type: "button", text: "Remove" }); rm.addEventListener("click", function () { remote.pop(); draw(); });
          if (mode === "these") { body2.appendChild(list); body2.appendChild(h("div.fw-add", add, addBtn, rm)); }
        }
      }
      var ok = h("button.dlg-btn", { type: "button", text: "OK" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" }), apply = h("button.dlg-btn", { type: "button", text: "Apply" });
      function commit() {
        var newRemote = mode === "these" && remote.length ? remote.join(", ") : (r.remote === "Local subnet" && mode === "any" && !remote.length ? r.remote : "Any");
        var changedScope = newRemote !== r.remote;
        r.remote = newRemote;
        if ((r.enabled === "Yes") !== enabled) setEnabled(r, enabled); else render();
        if (changedScope) bus.emit("fw:scope", { name: r.name, remote: r.remote });
      }
      ok.addEventListener("click", function () { commit(); back.remove(); });
      apply.addEventListener("click", commit);
      cancel.addEventListener("click", function () { back.remove(); });
      dlg.appendChild(h("div.dlg-btns", ok, cancel, apply));
      back.appendChild(dlg); root.appendChild(back);
      draw();
    }

    select(ROOT);
    body.api = {
      select: select,
      blockRule: function () {
        var r = { name: F().target.name, group: "", profile: "All", enabled: "Yes", action: "Block", program: "Any", remote: "Any", proto: "TCP", port: F().target.port };
        if (st.node !== "Inbound Rules") select("Inbound Rules");
        st.inbound.unshift(r); render(); bus.emit("fw:rule", { name: r.name, proto: "TCP", port: r.port, action: "Block", profiles: "All" });
      },
      disable: function (name) { var r = find(name); if (r) setEnabled(r, false); },
      scope: function (name, ip) { var r = find(name); if (!r) return; r.remote = ip; render(); bus.emit("fw:scope", { name: name, remote: ip }); }
    };
  }

  FSIM.tools.firewall = {
    id: "firewall",
    open: function (stage, o) { o = o || {}; return stage.create({ id: "firewall", title: "Windows Defender Firewall with Advanced Security", icon: "shield", skin: "win", width: o.width || 960, height: o.height || 480, x: o.x, y: o.y, build: build }); },
    /* interpretation tables: src.state before | after */
    annotTable: function (src) {
      var rows = F().inbound.slice(0, 5).map(toRule);
      if (src.state === "after") {
        rows = rows.map(function (r) { var x = Object.assign({}, r); if (x.name === "Remote Helper") x.enabled = "No"; if (/^Remote Desktop/.test(x.name)) x.remote = F().target.managerIp; return x; });
        rows.unshift({ name: F().target.name, group: "", profile: "All", enabled: "Yes", action: "Block", program: "Any", remote: "Any", proto: "TCP", port: "5900" });
      }
      return { columns: ["Name", "Profile", "Enabled", "Action", "Remote Address", "Protocol", "Local Port"], rows: rows.map(function (r) { return { key: r.name, cls: r.action === "Block" ? "is-pink" : "", cells: [r.name, r.profile, r.enabled, r.action, r.remote, r.proto, r.port] }; }) };
    }
  };
})();
