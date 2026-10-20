/* FSIM.tools.sevenzip — 7-Zip File Manager on ACC-PC1, folder C:\Users\accountant\Documents (docs/ui-reference.md §10; outputs-spec §ك-2).
   Reads the same folder as CMD (FSIM.tools.cmdext.fs). The archive password stays in memory only.
   Bus events: sz:select {name} • sz:archive {name, format, method, encryptNames, ok} • sz:open {name, ok} */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, F = function () { return FSIM.data.case.files; };

  function build(body, win) {
    var st = { sel: null, inside: null };
    var root = h("div.ar.sz"); body.appendChild(root);
    root.appendChild(FSIM.core.menubar(root, { File: [["Open"], ["Rename"], ["Delete"], ["Properties"]], Edit: [["Select All"]], View: [["Details"]], Favorites: [["Add folder to Favorites as"]], Tools: [["Options..."], ["Benchmark"]], Help: [["Contents..."], ["About 7-Zip..."]] }, function () {}));
    var tb = h("div.tb.sz-tb");
    [["Add", add], ["Extract", extract], ["Test"], ["Copy"], ["Move"], ["Delete"], ["Info"]].forEach(function (b) {
      var x = h("button.sz-btn", { type: "button", "data-sz": b[0] }, h("span.sz-ico", { "aria-hidden": "true", text: { Add: "＋", Extract: "−", Test: "✓", Copy: "⧉", Move: "➜", Delete: "✕", Info: "ⓘ" }[b[0]] }), b[0]);
      x.addEventListener("click", b[1] || function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); });
      tb.appendChild(x);
    });
    root.appendChild(tb);
    var path = h("input.sz-path", { type: "text", readonly: "", dir: "ltr", "aria-label": "Path" });
    root.appendChild(h("div.ar-toolbar", path));
    var listHost = h("div.sz-list"); root.appendChild(listHost);
    var status = h("div.ar-status", { text: "" }); root.appendChild(status);

    function files() { var fs = FSIM.tools.cmdext.fs(); return Object.keys(fs).map(function (k) { return fs[k]; }).sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; }); }
    function render() {
      listHost.textContent = "";
      if (st.inside) {
        var a = st.inside;
        path.value = F().dir + "\\" + a.name + "\\";
        var g = FSIM.core.grid({ columns: ["Name", "Size", "Packed Size", "Modified", "Encrypted", "Method"], label: a.name, rows: [{ key: a.content, cells: [a.content, "48 640", "39 680", "2026-10-05 11:02", "+", "LZMA2:16 7zAES"] }] });
        listHost.appendChild(h("button.ns-link", { type: "button", text: "⬑ ..", onclick: function () { st.inside = null; render(); } }));
        listHost.appendChild(g.el);
        status.textContent = "1 object(s)";
        return;
      }
      path.value = F().dir + "\\";
      var g2 = FSIM.core.grid({ columns: ["Name", "Size", "Modified", "Created", "Attributes"], label: "Documents",
        rows: files().map(function (f) { return { key: f.name, cls: f.hidden ? "is-off" : "", cells: [f.name, f.size.replace(/,/g, " "), f.date.replace(/^(\d+)\/(\d+)\/(\d+)\s+/, "$3-$1-$2 "), f.date.replace(/^(\d+)\/(\d+)\/(\d+)\s+/, "$3-$1-$2 "), "A" + (f.hidden ? "H" : "")] }; }),
        onSelect: function (r) { st.sel = r.key; status.textContent = "1 object(s) selected"; bus.emit("sz:select", { name: r.key }); } });
      g2.el.addEventListener("dblclick", function () { var f = FSIM.tools.cmdext.fs()[String(st.sel || "").toLowerCase()]; if (f && f.archive) openArchive(f); });
      listHost.appendChild(g2.el);
      if (st.sel) g2.select(st.sel);
      status.textContent = files().length + " object(s)";
    }

    function add() {
      var f = FSIM.tools.cmdext.fs()[String(st.sel || "").toLowerCase()];
      if (!f) { FSIM.core.toast(root, "اختر ملفاً أولاً، ثم Add."); return; }
      if (f.archive) { FSIM.core.toast(root, "هذا أرشيف أصلاً."); return; }
      var base = f.name.replace(/\.[^.]+$/, "");
      var s = { name: base + ".7z", format: "7z", level: "Normal", pw: "", pw2: "", show: false, method: "AES-256", names: false };
      var back = h("div.dlg-back"), left = h("div.sz-col"), right = h("div.sz-col");
      function row(label, el) { return h("div.sz-row", h("label", { "for": el.id || "", text: label }), el); }
      var arch = h("input#sz-name", { type: "text", dir: "ltr", "aria-label": "Archive" }); arch.value = s.name;
      arch.addEventListener("input", function () { s.name = arch.value; });
      var fmt = h("select#sz-format", { "aria-label": "Archive format" }, ["7z", "tar", "wim", "zip"].map(function (x) { return h("option", { value: x, text: x }); }));
      var lvl = h("select#sz-level", { "aria-label": "Compression level" }, ["Store", "Fastest", "Fast", "Normal", "Maximum", "Ultra"].map(function (x) { return h("option", { value: x, text: x }); })); lvl.value = "Normal";
      left.appendChild(row("Archive:", arch)); left.appendChild(row("Archive format:", fmt)); left.appendChild(row("Compression level:", lvl));
      ["Compression method:", "Dictionary size:", "Word size:", "Solid Block size:", "Number of CPU threads:"].forEach(function (l) { left.appendChild(h("div.sz-row", h("span", { text: l }), h("select", { disabled: "", "aria-label": l }, h("option", { text: { "Compression method:": "LZMA2", "Dictionary size:": "16 MB", "Word size:": "32", "Solid Block size:": "2 GB", "Number of CPU threads:": "4" }[l] })))); });
      var p1 = h("input#sz-pw", { type: "password", "aria-label": "Enter password", autocomplete: "off" }), p2 = h("input#sz-pw2", { type: "password", "aria-label": "Reenter password", autocomplete: "off" });
      var showCb = h("input#sz-show", { type: "checkbox" }), meth = h("select#sz-method", { "aria-label": "Encryption method" }), names = h("input#sz-names", { type: "checkbox" });
      function methods() { meth.textContent = ""; (s.format === "zip" ? ["ZipCrypto", "AES-256"] : ["AES-256"]).forEach(function (m) { meth.appendChild(h("option", { value: m, text: m })); }); meth.value = s.format === "zip" ? "ZipCrypto" : "AES-256"; s.method = meth.value; names.disabled = s.format !== "7z"; if (names.disabled) { names.checked = false; s.names = false; } }
      fmt.addEventListener("change", function () { s.format = fmt.value; arch.value = s.name = base + "." + (s.format === "7z" ? "7z" : s.format); methods(); });
      meth.addEventListener("change", function () { s.method = meth.value; });
      names.addEventListener("change", function () { s.names = names.checked; });
      showCb.addEventListener("change", function () { p1.type = p2.type = showCb.checked ? "text" : "password"; });
      p1.addEventListener("input", function () { s.pw = p1.value; }); p2.addEventListener("input", function () { s.pw2 = p2.value; });
      right.appendChild(h("div.sz-row", h("span", { text: "Update mode:" }), h("select", { disabled: "", "aria-label": "Update mode" }, h("option", { text: "Add and replace files" }))));
      right.appendChild(h("fieldset.sz-enc", h("legend", { text: "Encryption" }), row("Enter password:", p1), row("Reenter password:", p2), h("label.wiz-opt", { "for": "sz-show" }, showCb, " Show Password"), row("Encryption method:", meth), h("label.wiz-opt", { "for": "sz-names" }, names, " Encrypt file names")));
      methods();
      var ok = h("button.dlg-btn", { type: "button", text: "OK" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" });
      back.appendChild(h("div.dlg.wiz.sz-add", { role: "dialog", "aria-modal": "true", "aria-label": "Add to Archive" }, h("h4", { text: "Add to Archive" }), h("div.sz-cols", left, right), h("div.dlg-btns", ok, cancel, h("button.dlg-btn", { type: "button", "aria-disabled": "true", text: "Help" }))));
      root.appendChild(back); p1.focus();
      ok.addEventListener("click", function () {
        if (s.pw !== s.pw2) { FSIM.core.toast(back, "Passwords do not match"); return; }
        if (s.pw && s.pw.length < 14) { FSIM.core.toast(back, "اختر كلمة مرور من 14 حرفاً على الأقل (كما في سياسة الدرس 8)."); return; }
        back.remove();
        var fs = FSIM.tools.cmdext.fs();
        fs[s.name.toLowerCase()] = { name: s.name, date: "10/13/2026  12:05 PM", size: s.format === "7z" ? F().archive.size : "40,118", hidden: false, archive: true, content: f.name, encrypted: !!s.pw, encryptNames: s.names, password: s.pw, method: s.method };
        st.sel = s.name; render();
        bus.emit("sz:archive", { name: s.name, format: s.format, method: s.pw ? s.method : "none", encryptNames: s.names, ok: !!s.pw });
      });
      cancel.addEventListener("click", function () { back.remove(); });
    }
    function askPassword(cb) {
      var back = h("div.dlg-back"), pw = h("input#sz-ask", { type: "password", "aria-label": "Enter password", autocomplete: "off" }), ok = h("button.dlg-btn", { type: "button", text: "OK" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" });
      back.appendChild(h("div.dlg", { role: "dialog", "aria-modal": "true", "aria-label": "Enter password" }, h("h4", { text: "Enter password" }), pw, h("div.dlg-btns", ok, cancel)));
      root.appendChild(back); pw.focus();
      ok.addEventListener("click", function () { back.remove(); cb(pw.value); });
      pw.addEventListener("keydown", function (e) { if (e.key === "Enter") ok.click(); });
      cancel.addEventListener("click", function () { back.remove(); cb(null); });
    }
    function openArchive(a) {
      if (a.encrypted && a.encryptNames) {
        askPassword(function (pw) {
          if (pw === null) return;
          if (pw !== a.password) { FSIM.core.toast(root, "Cannot open encrypted archive. Wrong password?"); bus.emit("sz:open", { name: a.name, ok: false }); return; }
          st.inside = a; render(); bus.emit("sz:open", { name: a.name, ok: true });
        });
        return;
      }
      st.inside = a; render(); bus.emit("sz:open", { name: a.name, ok: true, namesVisible: true });
    }
    function extract() { FSIM.core.toast(root, st.inside ? "الاستخراج يطلب كلمة المرور؛ غير مفعّل في المحاكاة." : "افتح الأرشيف أولاً (نقر مزدوج)."); }

    var off = bus.on("files:ren", render), off2 = bus.on("files:del", render), off3 = bus.on("files:attrib", render);
    render();
    body.api = {
      select: function (n) { st.sel = n; render(); bus.emit("sz:select", { name: n }); },
      demoArchive: function () {
        var f = FSIM.tools.cmdext.fs()[F().real.toLowerCase()]; if (!f) return;
        var pw = "demo-passphrase-2026";
        FSIM.tools.cmdext.fs()[F().archive.name.toLowerCase()] = { name: F().archive.name, date: "10/13/2026  12:05 PM", size: F().archive.size, hidden: false, archive: true, content: f.name, encrypted: true, encryptNames: true, password: pw, method: "AES-256" };
        st.sel = F().archive.name; render();
        bus.emit("sz:archive", { name: F().archive.name, format: "7z", method: "AES-256", encryptNames: true, ok: true });
      }
    };
  }

  FSIM.tools.sevenzip = {
    id: "sevenzip",
    open: function (stage, o) { o = o || {}; return stage.create({ id: "sevenzip", title: FSIM.data.case.files.dir + "\\", icon: "zip", skin: "win", width: o.width || 820, height: o.height || 440, x: o.x, y: o.y, build: build }); }
  };
})();
