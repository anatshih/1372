/* FSIM.tools.zenmap — Zenmap (Nmap GUI) on CONSULTANT-LT (docs/ui-reference.md §3). Values: outputs-spec §د.
   The simulated network is the office (192.168.50.0/24): any other address answers like a host that is down.
   Bus events: zenmap:scan {profile, target, ok, reason?, state} • zenmap:tab {tab} • zenmap:host {ip} • zenmap:view {view} • zenmap:service {service} */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, C = function () { return FSIM.data.case; };

  var PROFILES = [
    ["Intense scan", "nmap -T4 -A -v", false],
    ["Intense scan plus UDP", "nmap -sS -sU -T4 -A -v", false],
    ["Intense scan, all TCP ports", "nmap -p 1-65535 -T4 -A -v", false],
    ["Intense scan, no ping", "nmap -T4 -A -v -Pn", false],
    ["Ping scan", "nmap -sn", true],
    ["Quick scan", "nmap -T4 -F", true],
    ["Quick scan plus", "nmap -sV -T4 -O -F --version-light", true],
    ["Quick traceroute", "nmap -sn --traceroute", false],
    ["Regular scan", "nmap", true],
    ["Slow comprehensive scan", "nmap -sS -sU -T4 -A -v -PE -PP -PS80,443 -PA3389 -PU40125 -PY -g 53 --script \"default or (discovery and safe)\"", false]
  ];
  var TABS = ["Nmap Output", "Ports / Hosts", "Topology", "Host Details", "Scans"];
  var MENUS = {
    Scan: [["New Window"], ["Open Scan"], ["Open Scan in This Window"], ["Recent Scans"], ["-"], ["Save Scan"], ["Save All Scans to Directory"], ["-"], ["Close Window"], ["Quit"]],
    Tools: [["Compare Results", "compare"], ["Search Scan Results"], ["Filter Hosts"]],
    Profile: [["New Profile or Command"], ["Edit Selected Profile"]],
    Help: [["Help"], ["Report a bug"], ["About"]]
  };

  function pad(s, n) { s = String(s); while (s.length < n) s += " "; return s; }
  function hostByIp(ip) { return C().hosts.filter(function (x) { return x.ip === ip; })[0] || null; }
  function hostBy(target) { var t = target.toLowerCase(); return C().hosts.filter(function (x) { return x.ip === t || x.fqdn === t || x.name.toLowerCase() === t; })[0] || null; }
  function cmdFor(profile, target) { var p = PROFILES.filter(function (x) { return x[0] === profile; })[0]; return (p ? p[1] : "nmap") + " " + target; }

  /* ports of one host for a profile and state → { ports:[[port, service, version]], notShown, total } */
  function portsOf(ip, profile, state) {
    var q = C().nmap.quick[ip]; if (!q) return null;
    if (q.before) q = q[state === "after" ? "after" : "before"];
    var total = profile === "Regular scan" ? 1000 : 100;
    var m = /^(\d+) (\w+) (.*)$/.exec(q.notShown);
    var notShown = (total - q.ports.length) + " " + m[2] + " " + m[3];
    var withVer = profile === "Quick scan plus";
    return {
      total: total, notShownKind: m[2], notShownCount: total - q.ports.length, notShown: notShown,
      ports: q.ports.map(function (p) {
        return [p[0], withVer ? (C().nmap.serviceNames[p[0]] || p[1]) : p[1], withVer ? (C().nmap.versions[p[0]] || "") : null];
      })
    };
  }

  function stamp(state, profile) {
    var n = C().nmap;
    if (state === "after") return "2026-10-15 13:32";
    return profile === "Ping scan" ? n.pingTime : profile === "Quick scan plus" ? "2026-10-11 09:12" : "2026-10-11 09:08";
  }
  function head(state, profile) { return "Starting Nmap " + C().nmap.version + " ( https://nmap.org ) at " + stamp(state, profile) + " " + C().nmap.tz; }
  function reportLine(x) { return "Nmap scan report for " + x.fqdn + " (" + x.ip + ")"; }

  function hostBlock(x, profile, state) {
    var L = [reportLine(x)];
    if (x.id === "consultant") {
      L.push("Host is up.");
      if (profile !== "Ping scan") { var r0 = portsOf(x.ip, profile, state); L.push("All " + r0.total + " scanned ports on " + x.fqdn + " (" + x.ip + ") are in ignored states.", "Not shown: " + r0.notShown); }
      return L;
    }
    L.push("Host is up (" + C().nmap.latency[x.ip] + " latency).");
    if (profile !== "Ping scan") {
      var r = portsOf(x.ip, profile, state);
      L.push("Not shown: " + r.notShown);
      var pw = Math.max(9, r.ports.reduce(function (a, p) { return Math.max(a, p[0].length); }, 0) + 1);
      var sw = Math.max(8, r.ports.reduce(function (a, p) { return Math.max(a, p[1].length); }, 0) + 1);
      var withVer = profile === "Quick scan plus";
      L.push(pad("PORT", pw) + "STATE " + (withVer ? pad("SERVICE", sw) + "VERSION" : "SERVICE"));
      r.ports.forEach(function (p) { L.push(pad(p[0], pw) + "open  " + (withVer ? pad(p[1], sw) + p[2] : p[1]).replace(/\s+$/, "")); });
    }
    if (x.mac) L.push("MAC Address: " + x.mac + " (Unknown)");
    if (profile === "Quick scan plus" && x.id === "acc1") {
      var os = C().nmap.os;
      L.push("Device type: " + os.type, "Running: " + os.running, "OS details: " + os.details, "Service Info: OS: Windows; CPE: " + os.cpe);
    }
    return L;
  }

  /* full Nmap output text for one scan (pure; also used by the interpretation phase) */
  function output(profile, target, state) {
    state = state || "before";
    var n = C().nmap, L = [head(state, profile)];
    if (target === C().network.cidr) {
      C().hosts.forEach(function (x) { L = L.concat(hostBlock(x, profile, state)); });
      var el = profile === "Ping scan" ? n.pingElapsed : n.quickElapsed.range;
      L.push("Nmap done: 256 IP addresses (" + C().hosts.length + " hosts up) scanned in " + el + " seconds");
      return L;
    }
    var x = hostBy(target);
    if (!x) {
      L.push("Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn");
      L.push("Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds");
      return L;
    }
    L = L.concat(hostBlock(x, profile, state));
    var elapsed = profile === "Quick scan plus" ? n.plusElapsed[x.id === "acc1" && state === "after" ? "after" : "before"] : profile === "Ping scan" ? "0.21" : n.quickElapsed.single;
    if (profile === "Quick scan plus") L.push("");
    L.push("Nmap done: 1 IP address (1 host up) scanned in " + elapsed + " seconds");
    return L;
  }

  function build(body, win) {
    var bus = FSIM.core.bus.scoped();
    var st = { running: false, scans: [], hosts: {}, view: "Hosts", sel: null, svc: null, tab: "Nmap Output" };
    var root = h("div.zm"); body.appendChild(root);
    root.appendChild(FSIM.core.menubar(root, MENUS, function (menu, key) {
      if (key === "compare") compare();
    }));
    var target = h("input.zm-target", { type: "text", "aria-label": "Target", spellcheck: "false", autocomplete: "off" });
    var profile = h("select.zm-profile", { "aria-label": "Profile" }, PROFILES.map(function (p) {
      return h("option", { value: p[0], text: p[0] + (p[2] ? "" : "  (غير مفعّل في المحاكاة)"), disabled: p[2] ? false : true });
    }));
    profile.value = "Ping scan";
    var scanBtn = h("button.zm-btn", { type: "button", text: "Scan" });
    var cancelBtn = h("button.zm-btn", { type: "button", text: "Cancel" });
    var command = h("input.zm-command", { type: "text", "aria-label": "Command", spellcheck: "false", readonly: "" });
    root.appendChild(h("div.zm-bar", h("label", { text: "Target:" }), target, h("label", { text: "Profile:" }), profile, scanBtn, cancelBtn));
    root.appendChild(h("div.zm-bar", h("label", { text: "Command:" }), command));

    var hostsBtn = h("button.zm-toggle", { type: "button", "aria-pressed": "true", text: "Hosts" });
    var svcBtn = h("button.zm-toggle", { type: "button", "aria-pressed": "false", text: "Services" });
    var listHead = h("div.zm-listhead");
    var list = h("div.zm-list", { role: "listbox", "aria-label": "Hosts", tabindex: "0" });
    var left = h("div.zm-left", h("div.zm-toggles", hostsBtn, svcBtn), listHead, list);
    var tabBar = h("div.ar-tabs", { role: "tablist" });
    var pane = h("div.zm-pane", { role: "tabpanel" });
    var right = h("div.zm-right", tabBar, pane);
    root.appendChild(h("div.zm-split", left, right));
    var status = h("div.ar-status", { text: "" });
    root.appendChild(status);

    var tabBtns = {};
    TABS.forEach(function (t) {
      var b = h("button.ar-tab", { type: "button", role: "tab", "aria-selected": "false", text: t, "data-tab": t });
      b.addEventListener("click", function () { showTab(t); });
      tabBtns[t] = b; tabBar.appendChild(b);
    });

    function syncCommand() { command.value = cmdFor(profile.value, target.value.trim()); }
    target.addEventListener("input", syncCommand);
    target.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); scan(); } });
    profile.addEventListener("change", syncCommand);
    syncCommand();
    scanBtn.addEventListener("click", scan);
    cancelBtn.addEventListener("click", function () { if (!st.running) FSIM.core.toast(root, "لا يوجد فحص يعمل الآن."); });

    var outText = [];
    function scan() {
      if (st.running) return;
      var t = target.value.trim(), prof = profile.value, sim = FSIM.core.sim;
      var refuse = null;
      if (!t) refuse = "اكتب الهدف في حقل Target أولاً.";
      else if (prof === "Quick scan plus" && (hostBy(t) || {}).id !== "acc1") refuse = "في المحاكاة يعمل Quick scan plus على 192.168.50.21 فقط.";
      if (refuse) { FSIM.core.toast(root, refuse); bus.emit("zenmap:scan", { profile: prof, target: t, ok: false, reason: refuse }); return; }
      var state = sim.state || "before";
      var lines = output(prof, t, state);
      st.running = true; scanBtn.disabled = true;
      var scanRec = { status: "Running", command: cmdFor(prof, t), lines: lines, profile: prof, target: t, state: state };
      st.scans.push(scanRec);
      outText = [];
      win.el.querySelector(".fw-name").textContent = t + " - Zenmap";
      showTab("Nmap Output");
      status.textContent = "Scanning " + t + "…";
      var i = 0;
      (function tick() {
        if (i < lines.length) { outText.push(lines[i++]); if (st.tab === "Nmap Output") renderTab(); setTimeout(tick, FSIM.core.config.fast ? 0 : 35); return; }
        st.running = false; scanBtn.disabled = false; scanRec.status = "Saved";
        merge(prof, t, state);
        status.textContent = "";
        renderList(); renderTab();
        bus.emit("zenmap:scan", { profile: prof, target: t, ok: true, state: state });
      })();
    }

    /* aggregate results per host like Zenmap does across scans in one window */
    function merge(prof, t, state) {
      var targets = t === C().network.cidr ? C().hosts : [hostBy(t)].filter(Boolean);
      targets.forEach(function (x) {
        var rec = st.hosts[x.ip] || (st.hosts[x.ip] = { x: x, ports: null, os: null, scanInfo: null });
        if (prof !== "Ping scan") {
          var r = portsOf(x.ip, prof, state);
          rec.ports = r.ports; rec.scanInfo = r;
          if (prof === "Quick scan plus" && x.id === "acc1") rec.os = C().nmap.os;
        }
      });
      if (!st.sel && targets[0]) st.sel = targets[0].ip;
      if (targets.length === 1) st.sel = targets[0].ip;
    }

    function ipKey(ip) { return ip.split(".").map(function (n) { return ("00" + n).slice(-3); }).join("."); }
    function hostList() { return Object.keys(st.hosts).sort(function (a, b) { return ipKey(a) < ipKey(b) ? -1 : 1; }).map(function (k) { return st.hosts[k]; }); }
    function services() {
      var map = {};
      hostList().forEach(function (rec) { (rec.ports || []).forEach(function (p) { var s = p[1].replace(/\?$/, ""); (map[s] = map[s] || []).push({ rec: rec, port: p }); }); });
      return map;
    }

    function renderList() {
      list.textContent = ""; listHead.textContent = "";
      if (st.view === "Hosts") {
        listHead.appendChild(h("span", { text: "OS" })); listHead.appendChild(h("span", { text: "Host" }));
        hostList().forEach(function (rec) {
          var it = h("div.zm-item" + (st.sel === rec.x.ip ? ".is-selected" : ""), { role: "option", "aria-selected": st.sel === rec.x.ip ? "true" : "false", tabindex: "-1", "data-ip": rec.x.ip },
            h("span.zm-os", { "aria-hidden": "true", text: rec.os ? "⊞" : "?" }), h("span", { text: rec.x.fqdn + " (" + rec.x.ip + ")" }));
          it.addEventListener("click", function () { st.sel = rec.x.ip; st.svc = null; renderList(); renderTab(); bus.emit("zenmap:host", { ip: rec.x.ip }); });
          list.appendChild(it);
        });
      } else {
        listHead.appendChild(h("span", { text: "Service" }));
        var map = services();
        Object.keys(map).sort().forEach(function (s) {
          var it = h("div.zm-item" + (st.svc === s ? ".is-selected" : ""), { role: "option", "aria-selected": st.svc === s ? "true" : "false", tabindex: "-1", "data-service": s }, h("span", { text: s }));
          it.addEventListener("click", function () { st.svc = s; renderList(); showTab("Ports / Hosts"); bus.emit("zenmap:service", { service: s }); });
          list.appendChild(it);
        });
      }
      if (!list.children.length) list.appendChild(h("div.zm-empty", { text: "—" }));
    }
    function setView(v) {
      st.view = v; hostsBtn.setAttribute("aria-pressed", String(v === "Hosts")); svcBtn.setAttribute("aria-pressed", String(v === "Services"));
      list.setAttribute("aria-label", v); renderList(); renderTab(); bus.emit("zenmap:view", { view: v });
    }
    hostsBtn.addEventListener("click", function () { setView("Hosts"); });
    svcBtn.addEventListener("click", function () { setView("Services"); });
    list.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      var items = Array.prototype.slice.call(list.querySelectorAll(".zm-item")); if (!items.length) return;
      var i = items.findIndex(function (x) { return x.classList.contains("is-selected"); });
      i = e.key === "ArrowDown" ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
      e.preventDefault(); items[i].click(); var n = list.querySelectorAll(".zm-item")[i]; if (n) n.focus();
    });

    function table(cols, rows) {
      return h("div.gr-wrap", h("table.gr-table", h("thead", h("tr", cols.map(function (c) { return h("th", { text: c }); }))),
        h("tbody", rows.map(function (r) { return h("tr.gr-row", r.map(function (c) { return h("td", { text: c }); })); }))));
    }
    function renderTab() {
      pane.textContent = "";
      var t = st.tab;
      if (t === "Nmap Output") {
        pane.appendChild(h("pre.zm-out", { tabindex: "0", text: outText.join("\n") }));
        var pre = pane.firstChild;
        pre.scrollTop = pre.scrollHeight;
      } else if (t === "Ports / Hosts") {
        if (st.view === "Services" && st.svc) {
          var entries = services()[st.svc] || [];
          pane.appendChild(table(["", "Hostname", "Port", "Protocol", "State", "Version"], entries.map(function (e) {
            var pp = e.port[0].split("/"); return ["●", e.rec.x.fqdn + " (" + e.rec.x.ip + ")", pp[0], pp[1], "open", e.port[2] || ""];
          })));
        } else {
          var rec = st.sel && st.hosts[st.sel];
          var rows = rec && rec.ports ? rec.ports.map(function (p) { var pp = p[0].split("/"); return ["●", pp[0], pp[1], "open", p[1], p[2] || ""]; }) : [];
          pane.appendChild(table(["", "Port", "Protocol", "State", "Service", "Version"], rows));
        }
      } else if (t === "Topology") {
        pane.appendChild(h("div.ar-empty", { text: "عرض Topology غير مفعّل في المحاكاة. في البرنامج الحقيقي يرسم الأجهزة في حلقات حول جهاز الفاحص، ويعمل أفضل مع --traceroute." }));
      } else if (t === "Host Details") {
        var r2 = st.sel && st.hosts[st.sel];
        if (!r2) { pane.appendChild(h("div.ar-empty", { text: "—" })); }
        else {
          var x = r2.x, si = r2.scanInfo;
          var open = r2.ports ? r2.ports.length : 0;
          var sec = function (title, pairs) { return h("details.zm-sec", { open: "" }, h("summary", { text: title }), h("dl.zm-dl", pairs.map(function (p) { return [h("dt", { text: p[0] + ":" }), h("dd", { text: p[1] })]; }))); };
          pane.appendChild(h("div.zm-details", { tabindex: "0" },
            h("h3.zm-hostname", { text: x.fqdn + " (" + x.ip + ")" }),
            sec("Host Status", [["State", "up"], ["Open ports", String(open)], ["Filtered ports", si && si.notShownKind === "filtered" ? String(si.notShownCount) : "0"], ["Closed ports", si && si.notShownKind === "closed" ? String(si.notShownCount) : "0"], ["Scanned ports", si ? String(si.total) : "0"], ["Up time", "Not available"], ["Last boot", "Not available"]]),
            sec("Addresses", [["IPv4", x.ip], ["IPv6", "Not available"], ["MAC", x.mac || "Not available"]]),
            sec("Hostnames", [["Name - Type", x.fqdn + " - PTR"]]),
            sec("Operating System", r2.os ? [["Name", r2.os.details], ["Accuracy", r2.os.accuracy]] : [["Name", "Not available"]]),
            h("details.zm-sec", h("summary", { text: "Comments" }), h("textarea", { "aria-label": "Comments", rows: "2" }))));
        }
      } else if (t === "Scans") {
        var tb = h("div.tb", ["Append Scan", "Remove Scan", "Cancel Scan"].map(function (n) { var b = h("button", { type: "button", text: n }); b.addEventListener("click", function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); }); return b; }));
        pane.appendChild(tb);
        pane.appendChild(table(["Status", "Command"], st.scans.map(function (s) { return [s.status === "Running" ? "Running" : "Saved", s.command]; })));
      }
    }
    function showTab(t) {
      st.tab = t;
      Object.keys(tabBtns).forEach(function (k) { tabBtns[k].setAttribute("aria-selected", String(k === t)); });
      renderTab();
      bus.emit("zenmap:tab", { tab: t });
    }

    /* Tools › Compare Results (Ctrl+D): "A scan" and "B scan", ndiff-style lines (- red, + green) */
    function saved() {
      var list = ((FSIM.core.sim.preset || {}).zenmapSaved ? [{ label: "acc-pc1.sanabel.example — Sun Oct 11 09:12:04 2026 — Quick scan plus", profile: "Quick scan plus", target: "192.168.50.21", state: "before" }] : []);
      st.scans.forEach(function (s, i) { if (s.status !== "Running") list.push({ label: s.command + "  (scan " + (i + 1) + ")", profile: s.profile, target: s.target, state: s.state }); });
      return list;
    }
    function compare() {
      var list = saved();
      if (list.length < 2) { FSIM.core.toast(root, "تحتاج فحصين للمقارنة: افحص 192.168.50.21 بـ Quick scan plus أولاً."); return; }
      var back = h("div.dlg-back"), out = h("pre.zm-out.zm-diff", { tabindex: "0", "aria-label": "Comparison" });
      function sel(id, label, def) {
        var s = h("select#" + id, { "aria-label": label }, list.map(function (x, i) { return h("option", { value: String(i), text: x.label }); }));
        s.value = String(def); s.addEventListener("change", draw);
        var open = h("button.dlg-btn", { type: "button", text: "Open" }); open.addEventListener("click", function () { FSIM.core.toast(back, "غير مفعّل في المحاكاة"); });
        return h("div.zm-cmp", h("label", { "for": id, text: label }), s, open);
      }
      var A = sel("zm-a", "A scan", 0), B = sel("zm-b", "B scan", list.length - 1);
      function draw() {
        var a = list[+A.querySelector("select").value], b = list[+B.querySelector("select").value];
        out.textContent = "";
        diff(a, b).forEach(function (l) { out.appendChild(h("span" + (l[0] === "-" ? ".zm-del" : l[0] === "+" ? ".zm-add" : ""), { text: l + "\n" })); });
        if (a.state !== b.state && a.profile === b.profile && a.target === b.target) bus.emit("zenmap:compare", { a: a.state, b: b.state, target: a.target });
      }
      var close = h("button.dlg-btn", { type: "button", text: "Close" }); close.addEventListener("click", function () { back.remove(); });
      back.appendChild(h("div.dlg.wiz.zm-compare", { role: "dialog", "aria-modal": "true", "aria-label": "Compare Results" }, h("h4", { text: "Compare Results" }), A, B, out, h("div.dlg-btns", close)));
      root.appendChild(back); draw();
    }
    renderList(); showTab("Nmap Output");
    body.api = {
      setTarget: function (v) { target.value = v; syncCommand(); },
      setProfile: function (v) { profile.value = v; syncCommand(); },
      scan: scan,
      run: function (prof, t) { profile.value = prof; target.value = t; syncCommand(); scan(); return new Promise(function (res) { (function wait() { if (body.isConnected && st.running) setTimeout(wait, 30); else res(); })(); }); },
      showTab: showTab, setView: setView, compare: compare,
      selectHost: function (ip) { var n = list.querySelector('[data-ip="' + ip + '"]'); if (n) n.click(); },
      selectService: function (s) { setView("Services"); var n = list.querySelector('[data-service="' + s + '"]'); if (n) n.click(); }
    };
  }

  var WHEN = { before: "Sun Oct 11 09:12:04 2026", after: "Thu Oct 15 13:32:40 2026" };
  function diff(a, b) {
    if (a.profile !== b.profile || a.target !== b.target) return ["(قارن فحصين بالملف الشخصي نفسه للجهاز نفسه)"];
    var cmd = cmdFor(a.profile, a.target), L = [];
    var x = hostBy(a.target);
    if (a.state === b.state) return [" Nmap " + C().nmap.version + " scan initiated " + WHEN[a.state] + " as: " + cmd, "", " (no differences)"];
    L.push("-Nmap " + C().nmap.version + " scan initiated " + WHEN[a.state] + " as: " + cmd, "+Nmap " + C().nmap.version + " scan initiated " + WHEN[b.state] + " as: " + cmd, "");
    L.push(" " + x.fqdn + " (" + x.ip + (x.mac ? ", " + x.mac : "") + "):");
    var pa = output(a.profile, a.target, a.state), pb = output(b.profile, b.target, b.state);
    var ns = function (o) { return o.filter(function (l) { return /^Not shown:/.test(l); })[0]; };
    if (ns(pa) !== ns(pb)) L.push("-" + ns(pa), "+" + ns(pb));
    var ports = function (o) { return o.filter(function (l) { return /^\d+\/tcp/.test(l); }); };
    var head = pa.filter(function (l) { return /^PORT/.test(l); })[0];
    if (head) L.push(" " + head);
    var A2 = ports(pa), B2 = ports(pb);
    A2.forEach(function (l) { if (B2.indexOf(l) < 0) L.push("-" + l); });
    B2.forEach(function (l) { if (A2.indexOf(l) < 0) L.push("+" + l); });
    return L;
  }

  FSIM.tools.zenmap = {
    diff: diff,
    id: "zenmap", prompt: "",
    output: output,
    open: function (stage, o) {
      o = o || {};
      return stage.create({ id: "zenmap", title: "Zenmap", icon: "zenmap", skin: "win", width: o.width || 900, height: o.height || 500, x: o.x, y: o.y, build: build });
    },
    /* interpretation phase: src.cmd = "<profile>|<target>" */
    outputOf: function (cmd, state) {
      if (cmd === "compare") return diff({ profile: "Quick scan plus", target: "192.168.50.21", state: "before" }, { profile: "Quick scan plus", target: "192.168.50.21", state: "after" });
      var p = cmd.split("|"); return output(p[0], p[1], state || "before");
    }
  };
})();
