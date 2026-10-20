/* FSIM.tools.wireshark — Wireshark with the saved capture printer-admin.pcapng (docs/ui-reference.md §11; outputs-spec §ط-5).
   No live capture: the file opens with the window. Display filter (green / red), packet list, details, bytes,
   Analyze › Follow › TCP Stream. Bus events: wireshark:filter {filter, valid, displayed} • wireshark:select {no} • wireshark:follow {stream} */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, W = function () { return FSIM.data.case.capture; };
  var PRN = "192.168.50.30", ME = "192.168.50.100";
  var MAC = { "192.168.50.100": "02:50:00:00:01:00", "192.168.50.30": "02:50:00:00:00:30", "192.168.50.1": "02:50:00:00:00:01", "192.168.50.21": "02:50:00:00:00:21" };

  /* the 112 packets, built deterministically around the key packets (counts match outputs-spec §ط-5) */
  var cache = null;
  function packets() {
    if (cache) return cache;
    var P = [], keys = {}, t = 0;
    W().key.forEach(function (k) { keys[k[0]] = k; });
    function add(no, src, dst, proto, len, info, stream, kind, text) { P.push({ no: no, time: (t += 0.0137).toFixed(6), src: src, dst: dst, proto: proto, len: len, info: info, stream: stream, kind: kind || proto.toLowerCase(), text: text || "" }); }
    /* telnet text chunks in order, for TELNET data packets */
    var chunks = W().telnetStream.slice();
    for (var no = 1; no <= 112; no++) {
      var k = keys[no];
      if (k) { P.push({ no: no, time: k[1], src: k[2], dst: k[3], proto: k[4], len: k[5], info: k[6], stream: k[7], kind: k[4] === "TELNET" ? "telnet" : /^TLS/.test(k[4]) ? "tls" : k[4].toLowerCase(), text: k[4] === "TELNET" ? (chunks.shift() || ["s", ""])[1] : "" }); t = parseFloat(k[1]); continue; }
      if (no <= 48) { /* telnet stream 0: packets 3..48 = 46 (34 TELNET + 12 TCP) */
        var tcpOnly = [4, 5, 7, 9, 11, 13, 44, 45, 46, 47, 48].indexOf(no) >= 0;
        if (tcpOnly) {
          var info = no === 4 ? "23 → 50112 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0" : no === 5 ? "50112 → 23 [ACK] Seq=1 Ack=1 Win=64240 Len=0" : no >= 45 ? (no % 2 ? "50112 → 23 [FIN, ACK] Seq=" + (60 + no) + " Ack=" + (380 + no) : "23 → 50112 [ACK] Seq=" + (380 + no) + " Ack=" + (61 + no)) : "23 → 50112 [ACK] Seq=" + (no * 9) + " Ack=" + no + " Len=0";
          add(no, no === 4 || no % 2 === 0 ? PRN : ME, no === 4 || no % 2 === 0 ? ME : PRN, "TCP", 60, info, 0, "tcp");
        } else {
          var c = chunks.shift() || ["c", ""];
          add(no, c[0] === "c" ? ME : PRN, c[0] === "c" ? PRN : ME, "TELNET", 55 + c[1].length, "Telnet Data ...", 0, "telnet", c[1]);
        }
      } else if (no <= 54) { /* 6 packets not involving the printer */
        add(no, no % 2 ? "192.168.50.21" : ME, "Broadcast", "ARP", 42, no % 2 ? "Who has 192.168.50.1? Tell 192.168.50.21" : "Who has 192.168.50.1? Tell 192.168.50.100", null, "arp");
      } else if (no <= 60) { /* ping to the printer */
        var req = no % 2 === 1;
        add(no, req ? ME : PRN, req ? PRN : ME, "ICMP", 74, "Echo (ping) " + (req ? "request" : "reply") + "  id=0x0001, seq=" + Math.ceil((no - 54) / 2) + "/" + (Math.ceil((no - 54) / 2) * 256) + ", ttl=" + (req ? "128" : "64"), null, "icmp");
      } else { /* TLS stream 1: 61..112 = 52 packets, 18 of them TLS */
        var tlsNos = [64, 66, 67, 68, 70, 72, 74, 76, 78, 80, 84, 88, 92, 96, 100, 104, 108, 110];
        if (tlsNos.indexOf(no) >= 0) add(no, no % 4 === 2 ? PRN : ME, no % 4 === 2 ? ME : PRN, "TLSv1.3", 120 + (no * 7) % 600, "Application Data", 1, "tls");
        else add(no, no === 62 ? PRN : (no % 2 ? PRN : ME), no === 62 ? ME : (no % 2 ? ME : PRN), "TCP", 60, no === 62 ? "443 → 50140 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0" : (no % 2 ? "443" : "50140") + " → " + (no % 2 ? "50140" : "443") + " [ACK] Seq=" + no * 11 + " Ack=" + no * 13 + " Len=0", 1, "tcp");
      }
    }
    cache = P;
    return P;
  }

  /* display filter: a small, honest subset of the real syntax */
  function compile(f) {
    var s = f.trim();
    if (!s) return function () { return true; };
    var m;
    var proto = { telnet: "telnet", tls: "tls", http: "http", dns: "dns", arp: "arp", icmp: "icmp" };
    if (proto[s]) return function (p) { return p.kind === proto[s]; };
    if (s === "tcp") return function (p) { return p.stream !== null && p.stream !== undefined; };
    if (s === "udp") return function (p) { return p.kind === "dns"; };
    if ((m = /^tcp\.port\s*==\s*(\d+)$/.exec(s))) return function (p) { return m[1] === "23" ? p.stream === 0 : m[1] === "443" ? p.stream === 1 : false; };
    if ((m = /^tcp\.stream\s*(?:eq|==)\s*(\d+)$/.exec(s))) return function (p) { return p.stream === +m[1]; };
    if ((m = /^ip\.addr\s*==\s*(\d{1,3}(?:\.\d{1,3}){3})$/.exec(s))) return function (p) { return p.src === m[1] || p.dst === m[1]; };
    return null;
  }
  function hex(text) {
    var bytes = Array.prototype.map.call(text, function (ch) { return ch.charCodeAt(0) & 255; });
    var L = [];
    for (var i = 0; i < bytes.length; i += 16) {
      var row = bytes.slice(i, i + 16);
      L.push(("000" + i.toString(16)).slice(-4) + "  " + row.map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join(" ") + "   " + row.map(function (b) { return b >= 32 && b < 127 ? String.fromCharCode(b) : "."; }).join(""));
    }
    return L.join("\n") || "0000";
  }

  function build(body, win) {
    var bus = FSIM.core.bus.scoped();
    var st = { filter: "", sel: null, rows: packets() };
    var root = h("div.ws-app"); body.appendChild(root);
    var MENUS = { File: [["Open"], ["Save As"]], Edit: [["Find Packet"]], View: [["Zoom In"]], Go: [["Go to Packet"]], Capture: [["Start"]], Analyze: [["Follow ▸ TCP Stream", "follow"], ["Display Filters"]], Statistics: [["Conversations"]], Telephony: [["VoIP Calls"]], Wireless: [["Bluetooth"]], Tools: [["Firewall ACL Rules"]], Help: [["About Wireshark"]] };
    root.appendChild(FSIM.core.menubar(root, MENUS, function (m, k) { if (k === "follow") follow(); }));
    var fi = h("input.ws-filter", { type: "text", "aria-label": "Display filter", placeholder: "Apply a display filter … <Ctrl-/>", spellcheck: "false", dir: "ltr" });
    var applyB = h("button.ws-apply", { type: "button", "aria-label": "Apply display filter", text: "→" });
    var clearB = h("button.ws-apply", { type: "button", "aria-label": "Clear display filter", text: "✕" });
    root.appendChild(h("div.ws-filterbar", h("span.ws-bm", { "aria-hidden": "true", text: "🔖" }), fi, clearB, applyB));
    var list = h("div.gr-wrap.ws-list", { tabindex: "0", role: "region", "aria-label": "Packet list" });
    var details = h("pre.ws-details", { tabindex: "0", "aria-label": "Packet details" });
    var bytes = h("pre.ws-bytes", { tabindex: "0", "aria-label": "Packet bytes" });
    root.appendChild(h("div.ws-panes", list, details, bytes));
    var status = h("div.ws-statusbar", h("span", { text: "● " + W().file }), h("span.ws-count"), h("span", { text: "Profile: Default" }));
    root.appendChild(status);

    fi.addEventListener("input", function () { var ok = compile(fi.value); fi.classList.toggle("is-ok", !!ok && fi.value.trim() !== ""); fi.classList.toggle("is-bad", !ok); });
    fi.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); apply(); } });
    applyB.addEventListener("click", apply); clearB.addEventListener("click", function () { fi.value = ""; fi.dispatchEvent(new Event("input")); apply(); });

    function apply() {
      var f = compile(fi.value);
      if (!f) { bus.emit("wireshark:filter", { filter: fi.value.trim(), valid: false, displayed: 0 }); FSIM.core.toast(root, "«" + fi.value.trim() + "» ليس فلتر عرض صحيحاً (الشريط أحمر). مثال: telnet أو tcp.port == 23."); return; }
      st.filter = fi.value.trim(); st.rows = packets().filter(f); render();
      bus.emit("wireshark:filter", { filter: st.filter, valid: true, displayed: st.rows.length });
    }
    function render() {
      var total = packets().length;
      status.querySelector(".ws-count").textContent = "Packets: " + total + " · Displayed: " + st.rows.length + " (" + (st.rows.length * 100 / total).toFixed(1) + "%)";
      list.textContent = "";
      var tb = h("tbody");
      st.rows.forEach(function (p) {
        var tr = h("tr.gr-row.ws-" + p.kind + (st.sel === p.no ? ".is-selected" : ""), { "data-no": String(p.no) }, [p.no, p.time, p.src, p.dst, p.proto, p.len, p.info].map(function (c) { return h("td", { text: String(c) }); }));
        tr.addEventListener("click", function () { pick(p); });
        tr.addEventListener("contextmenu", function (e) { e.preventDefault(); pick(p); follow(); });
        tb.appendChild(tr);
      });
      list.appendChild(h("table.gr-table", h("thead", h("tr", ["No.", "Time", "Source", "Destination", "Protocol", "Length", "Info"].map(function (c) { return h("th", { text: c }); }))), tb));
    }
    function pick(p) {
      st.sel = p.no;
      Array.prototype.forEach.call(list.querySelectorAll("tr.gr-row"), function (r) { r.classList.toggle("is-selected", r.getAttribute("data-no") === String(p.no)); });
      var D = ["Frame " + p.no + ": " + p.len + " bytes on wire (" + p.len * 8 + " bits)", "Ethernet II, Src: " + (MAC[p.src] || "02:50:00:00:00:00") + ", Dst: " + (MAC[p.dst] || "ff:ff:ff:ff:ff:ff")];
      if (p.kind !== "arp") D.push("Internet Protocol Version 4, Src: " + p.src + ", Dst: " + p.dst);
      if (p.stream === 0) D.push("Transmission Control Protocol, Src Port: " + (p.src === ME ? "50112" : "23") + ", Dst Port: " + (p.src === ME ? "23" : "50112"));
      if (p.stream === 1) D.push("Transmission Control Protocol, Src Port: " + (p.src === ME ? "50140" : "443") + ", Dst Port: " + (p.src === ME ? "443" : "50140"));
      if (p.kind === "telnet") D.push("Telnet", "    Data: " + JSON.stringify(p.text).slice(1, -1));
      if (p.kind === "tls") D.push("Transport Layer Security", p.no === 64 ? "    TLSv1.3 Record Layer: Handshake Protocol: Client Hello" : "    TLSv1.3 Record Layer: Application Data Protocol: http-over-tls", p.no === 64 ? "        Extension: server_name (name=printer.sanabel.example)" : "        Encrypted Application Data: " + W().tlsHex);
      if (p.kind === "dns") D.push("User Datagram Protocol, Src Port: " + (p.no === 1 ? "55012" : "53") + ", Dst Port: " + (p.no === 1 ? "53" : "55012"), "Domain Name System (" + (p.no === 1 ? "query" : "response") + ")");
      details.textContent = D.join("\n");
      bytes.textContent = hex(p.kind === "telnet" ? p.text : p.kind === "tls" ? W().tlsHex.replace(/ /g, "") : p.info);
      bus.emit("wireshark:select", { no: p.no });
    }
    function follow() {
      var p = packets().filter(function (x) { return x.no === st.sel; })[0];
      if (!p || p.stream === null || p.stream === undefined) { FSIM.core.toast(root, "اختر حزمة TCP أولاً (مثل حزمة TELNET)، ثم Analyze › Follow › TCP Stream."); return; }
      var pre = h("pre.ws-stream", { tabindex: "0" });
      if (p.stream === 0) W().telnetStream.forEach(function (c) { pre.appendChild(h("span.ws-" + (c[0] === "c" ? "cli" : "srv"), { text: c[1] })); });
      else pre.appendChild(h("span.ws-srv", { text: "....W.....t.]..q.\\....Y..P..b.....e....I...+...........}.....F..\n" + W().tlsHex + "\n.....5..z...m...A.....j..." }));
      var back = h("div.dlg-back"), close = h("button.dlg-btn", { type: "button", text: "Close" }), backB = h("button.dlg-btn", { type: "button", text: "Back" });
      var out = h("button.dlg-btn", { type: "button", text: "Filter Out This Stream" });
      back.appendChild(h("div.dlg.ws-follow", { role: "dialog", "aria-modal": "true", "aria-label": "Follow TCP Stream (tcp.stream eq " + p.stream + ")" },
        h("h4", { text: "Wireshark · Follow TCP Stream (tcp.stream eq " + p.stream + ") · " + W().file }), pre,
        h("div.ws-follow-bar", h("span", { text: p.stream === 0 ? "Entire conversation (" + W().streamBytes + " bytes)" : "Entire conversation (encrypted)" }), h("span", { text: "Show data as  ASCII ▾" }), h("span", { text: "Stream " + p.stream })),
        h("div.dlg-btns", out, h("button.dlg-btn", { type: "button", "aria-disabled": "true", text: "Print" }), h("button.dlg-btn", { type: "button", "aria-disabled": "true", text: "Save as…" }), backB, close)));
      root.appendChild(back); close.focus();
      function done() { back.remove(); fi.value = "tcp.stream eq " + p.stream; fi.dispatchEvent(new Event("input")); apply(); }
      close.addEventListener("click", done); backB.addEventListener("click", done);
      out.addEventListener("click", function () { back.remove(); fi.value = "!(tcp.stream eq " + p.stream + ")"; FSIM.core.toast(root, "غير مفعّل في المحاكاة"); });
      bus.emit("wireshark:follow", { stream: p.stream });
    }
    render();
    body.api = {
      setFilter: function (f) { fi.value = f; fi.dispatchEvent(new Event("input")); apply(); },
      select: function (no) { var p = packets().filter(function (x) { return x.no === no; })[0]; if (p) pick(p); },
      follow: follow
    };
  }

  FSIM.tools.wireshark = {
    id: "wireshark", prompt: "", packets: packets, compile: compile,
    open: function (stage, o) { o = o || {}; return stage.create({ id: "wireshark", title: W().file, icon: "wireshark", skin: "win", width: o.width || 940, height: o.height || 500, x: o.x, y: o.y, build: build }); },
    /* interpretation: cmd = stream0 | stream1 | filters */
    outputOf: function (cmd) {
      if (cmd === "stream0") return W().telnetStream.map(function (c) { return c[1]; }).join("").split("\n");
      if (cmd === "stream1") return ["Follow TCP Stream (tcp.stream eq 1)", "", "....W.....t.]..q.\\....Y..P..b.....e....I...", W().tlsHex, "", "Transport Layer Security", "  TLSv1.3 Record Layer: Application Data Protocol: http-over-tls", "    Encrypted Application Data: " + W().tlsHex, "", "Client Hello (SNI=printer.sanabel.example)"];
      var total = W().total;
      return ["Display filter                 Displayed"].concat(Object.keys(W().counts).filter(Boolean).map(function (f) { var n = W().counts[f]; return (f + "                                ").slice(0, 31) + n + " (" + (n * 100 / total).toFixed(1) + "%)"; }), ["port 23                        (red: capture-filter syntax)"]);
    }
  };
})();
