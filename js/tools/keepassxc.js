/* FSIM.tools.keepassxc — KeePassXC on ACC-PC2 (docs/ui-reference.md §13; outputs-spec §ي-4).
   Passwords typed or generated here stay in this page's memory only: never saved, never sent.
   Entropy: passphrase = words × log2(7776); password = length × log2(charset). Quality: <40 Poor, <75 Weak, <100 Good, ≥100 Excellent.
   Bus events: kp:created {entropy, length} • kp:entry {title, entropy} • kp:copy {title} • kp:lock */
(function () {
  "use strict";
  var FSIM = window.FSIM, h = FSIM.core.h, bus = FSIM.core.bus, K = function () { return FSIM.data.case.keepass; };
  var EFF = Math.log2(7776);
  var SETS = { "A-Z": "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "a-z": "abcdefghijklmnopqrstuvwxyz", "0-9": "0123456789", "/*_&...": "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~" };

  function quality(bits) { return bits < 40 ? "Poor" : bits < 75 ? "Weak" : bits < 100 ? "Good" : "Excellent"; }
  /* estimate for a typed password: length × log2(size of the character classes used) */
  function estimate(pw) {
    if (!pw) return 0;
    var n = 0;
    if (/[A-Z]/.test(pw)) n += 26; if (/[a-z]/.test(pw)) n += 26; if (/[0-9]/.test(pw)) n += 10; if (/[^A-Za-z0-9]/.test(pw)) n += 32;
    return pw.length * Math.log2(n || 1);
  }
  function rand(n) { var a = new Uint32Array(1); window.crypto.getRandomValues(a); return a[0] % n; }

  /* generator dialog → resolves { value, entropy } or null */
  function generator(root, apply) {
    return new Promise(function (resolve) {
      var st = { tab: "Passphrase", length: 24, words: 6, sets: { "A-Z": true, "a-z": true, "0-9": true, "/*_&...": true }, value: "", entropy: 0 };
      var back = h("div.dlg-back"), out = h("input.kp-gen-out", { type: "text", readonly: "", dir: "ltr", "aria-label": "Generated password" });
      var info = h("p.kp-gen-info", { "aria-live": "polite" }), body = h("div.wiz-body"), tabs = h("div.ar-tabs", { role: "tablist" });
      function gen() {
        if (st.tab === "Passphrase") {
          var w = []; for (var i = 0; i < st.words; i++) w.push(K().words[rand(K().words.length)]);
          st.value = w.join(" "); st.entropy = st.words * EFF;
        } else {
          var chars = Object.keys(st.sets).filter(function (k) { return st.sets[k]; }).map(function (k) { return SETS[k]; }).join("") || SETS["a-z"];
          var s = ""; for (var j = 0; j < st.length; j++) s += chars.charAt(rand(chars.length));
          st.value = s; st.entropy = st.length * Math.log2(chars.length);
        }
        out.value = st.value;
        info.textContent = "Entropy: " + st.entropy.toFixed(2) + " bit    Password Quality: " + quality(st.entropy);
      }
      function draw() {
        tabs.textContent = ""; body.textContent = "";
        ["Password", "Passphrase"].forEach(function (t) { var b = h("button.ar-tab", { type: "button", role: "tab", "aria-selected": String(st.tab === t), text: t }); b.addEventListener("click", function () { st.tab = t; draw(); gen(); }); tabs.appendChild(b); });
        if (st.tab === "Passphrase") {
          var wc = h("input#kp-words", { type: "number", min: "1", max: "40", "aria-label": "Word Count", value: String(st.words) });
          wc.addEventListener("input", function () { var n = parseInt(wc.value, 10); if (n > 0 && n <= 40) { st.words = n; gen(); } });
          body.appendChild(h("div.fw-add", h("label", { "for": "kp-words", text: "Word Count:" }), wc, h("span", { text: "Word Separator: (space)   Wordlist: EFF English" })));
        } else {
          var len = h("input#kp-len", { type: "range", min: "8", max: "64", "aria-label": "Length", value: String(st.length) });
          var lv = h("span", { text: String(st.length) });
          len.addEventListener("input", function () { st.length = parseInt(len.value, 10); lv.textContent = len.value; gen(); });
          body.appendChild(h("div.fw-add", h("label", { "for": "kp-len", text: "Length:" }), len, lv));
          body.appendChild(h("div.fw-add", Object.keys(SETS).map(function (k) { var b = h("button.kp-set", { type: "button", "aria-pressed": String(st.sets[k]), text: k }); b.addEventListener("click", function () { st.sets[k] = !st.sets[k]; b.setAttribute("aria-pressed", String(st.sets[k])); gen(); }); return b; }), h("button.kp-set", { type: "button", "aria-pressed": "false", "aria-disabled": "true", text: "ExtendedASCII" })));
        }
      }
      var regen = h("button.dlg-btn", { type: "button", text: "Regenerate" }), copy = h("button.dlg-btn", { type: "button", text: "Copy" }), use = h("button.dlg-btn", { type: "button", text: "Apply Password" }), close = h("button.dlg-btn", { type: "button", text: "Close" });
      regen.addEventListener("click", gen);
      copy.addEventListener("click", function () { FSIM.core.toast(back, "Password copied to clipboard (clears in " + K().clearSeconds + " seconds)."); });
      use.addEventListener("click", function () { back.remove(); resolve({ value: st.value, entropy: st.entropy }); });
      close.addEventListener("click", function () { back.remove(); resolve(null); });
      back.appendChild(h("div.dlg.wiz.kp-gen", { role: "dialog", "aria-modal": "true", "aria-label": "Password Generator" }, h("h4", { text: "Password Generator" }), tabs, out, info, body, h("div.dlg-btns", regen, copy, apply ? use : null, close)));
      root.appendChild(back);
      draw(); gen();
    });
  }

  function build(body, win) {
    var bus = FSIM.core.bus.scoped();
    var st = { view: "welcome", db: null, entries: [], sel: null, timer: null };
    var root = h("div.kp"); body.appendChild(root);
    root.appendChild(FSIM.core.menubar(root, { Database: [["New Database...", "new"], ["Open Database..."], ["Save Database"], ["Lock Database", "lock"]], Entries: [["New Entry...", "entry"], ["Copy Password", "copy"]], Groups: [["New Group..."]], Tools: [["Password Generator", "gen"], ["Settings"]], View: [["Theme"]], Help: [["About"]] }, function (m, k) {
      if (k === "new") createDb(); else if (k === "lock") lock(); else if (k === "entry") newEntry(); else if (k === "copy") copySel(); else if (k === "gen") generator(root, false);
    }));
    var tb = h("div.tb");
    [["Open database"], ["Save database"], ["Lock database", lock], ["|"], ["New entry", newEntry], ["Edit entry"], ["Delete entry"], ["|"], ["Copy username"], ["Copy password", copySel], ["Copy URL"], ["|"], ["Password generator", function () { generator(root, false); }], ["Settings"]].forEach(function (b) {
      if (b[0] === "|") { tb.appendChild(h("span.tb-sep")); return; }
      var x = h("button", { type: "button", text: b[0], "data-kp": b[0] }); x.addEventListener("click", b[1] || function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); }); tb.appendChild(x);
    });
    root.appendChild(tb);
    var main = h("div.kp-main"); root.appendChild(main);
    var statusBar = h("div.ar-status", { "aria-live": "polite", text: "" }); root.appendChild(statusBar);

    function render() {
      main.textContent = "";
      if (st.view === "welcome") {
        var b = h("button.st-btn.is-primary", { type: "button", text: "Create new database" }); b.addEventListener("click", createDb);
        main.appendChild(h("div.kp-welcome", h("h2", { text: "Welcome to KeePassXC 2.7.x" }),
          h("div.st-actions", b, ["Open existing database", "Import from KeePass 1", "Import from 1Password", "Import from CSV"].map(function (t) { var x = h("button.st-btn", { type: "button", text: t }); x.addEventListener("click", function () { FSIM.core.toast(root, "غير مفعّل في المحاكاة"); }); return x; })),
          h("p", { text: "Recent databases: (none)" })));
        return;
      }
      if (st.view === "locked") {
        var pw = h("input#kp-unlock", { type: "password", "aria-label": "Enter password to unlock" }), un = h("button.st-btn.is-primary", { type: "button", text: "Unlock" });
        un.addEventListener("click", function () { if (pw.value === st.db.master) { st.view = "db"; render(); } else FSIM.core.toast(root, "Invalid credentials were provided, please try again."); });
        main.appendChild(h("div.kp-welcome", h("h2", { text: st.db.name + " [Locked]" }), h("label", { "for": "kp-unlock", text: "Enter password to unlock " + K().file }), pw, un));
        return;
      }
      var groups = h("div.kp-groups", h("button.kp-group.is-current", { type: "button", text: "📁 Root" }));
      var grid = FSIM.core.grid({ columns: ["Title", "Username", "Password", "URL", "Notes", "Modified"], label: "Entries", rows: st.entries.map(function (e) { return { key: e.title, cells: [e.title, e.user, "******", e.url, "", "10/14/2026 11:40 AM"] }; }), onSelect: function (r) { st.sel = r.key; preview(); } });
      var pv = h("div.kp-preview");
      function preview() { var e = st.entries.filter(function (x) { return x.title === st.sel; })[0]; pv.textContent = e ? "Title: " + e.title + "   Username: " + e.user + "   Password: ******   URL: " + (e.url || "—") : ""; }
      main.appendChild(h("div.kp-split", groups, h("div.kp-right", grid.el, pv)));
      if (st.sel) grid.select(st.sel);
    }

    function createDb() {
      FSIM.core.wizard(root, {
        title: "Create a new KeePassXC database", ariaLabel: "Create a new KeePassXC database",
        state: { name: "", desc: "", pw: "", pw2: "", entropy: 0, generated: false },
        steps: [
          { title: "General Database Information", nextLabel: "Continue", build: function (el, s, refresh) {
              var n = h("input#kp-name", { type: "text", "aria-label": "Database name" }); n.value = s.name; n.addEventListener("input", function () { s.name = n.value; refresh(); });
              var d = h("input#kp-desc", { type: "text", "aria-label": "Description" }); d.value = s.desc; d.addEventListener("input", function () { s.desc = d.value; });
              el.appendChild(h("label", { "for": "kp-name", text: "Database name:" })); el.appendChild(n); el.appendChild(h("label", { "for": "kp-desc", text: "Description:" })); el.appendChild(d);
            }, canNext: function (s) { return s.name.trim().length > 0; } },
          { title: "Encryption Settings", nextLabel: "Continue", build: function (el) { el.appendChild(h("p", { text: "Decryption time: 1.0 s" })); el.appendChild(h("p", { text: "Database format: KDBX 4" })); } },
          { title: "Database Credentials", nextLabel: "Done", build: function (el, s, refresh) {
              var p1 = h("input#kp-pw", { type: "password", "aria-label": "Password", autocomplete: "off" }), p2 = h("input#kp-pw2", { type: "password", "aria-label": "Confirm password", autocomplete: "off" });
              p1.value = s.pw; p2.value = s.pw2;
              var q = h("p.kp-quality", { "aria-live": "polite" });
              function upd() { s.entropy = s.generated && s.pw === s.genValue ? s.entropy : estimate(s.pw); q.textContent = "Password Quality: " + (s.pw ? quality(s.entropy) : "—") + (s.pw ? "  (" + s.entropy.toFixed(2) + " bit)" : ""); refresh(); }
              p1.addEventListener("input", function () { s.pw = p1.value; s.generated = false; upd(); });
              p2.addEventListener("input", function () { s.pw2 = p2.value; refresh(); });
              var show = h("button.dlg-btn", { type: "button", "aria-label": "Show password", text: "👁" }); show.addEventListener("click", function () { var t = p1.type === "password" ? "text" : "password"; p1.type = t; p2.type = t; });
              var gen = h("button.dlg-btn", { type: "button", "aria-label": "Password generator", text: "🎲" });
              gen.addEventListener("click", function () { generator(root, true).then(function (r) { if (!r) return; s.pw = s.pw2 = r.value; s.genValue = r.value; s.generated = true; s.entropy = r.entropy; p1.value = p2.value = r.value; upd(); }); });
              el.appendChild(h("label", { "for": "kp-pw", text: "Password:" })); el.appendChild(h("div.fw-add", p1, show, gen));
              el.appendChild(h("label", { "for": "kp-pw2", text: "Confirm password:" })); el.appendChild(p2); el.appendChild(q);
              el.appendChild(h("button.st-linkbtn", { type: "button", "aria-disabled": "true", text: "Add additional protection..." }));
              upd();
            }, canNext: function (s) { return s.pw.length > 0 && s.pw === s.pw2; } }
        ],
        onFinish: function (s) {
          if (s.entropy < 75 || s.pw.length < 14) {
            FSIM.core.toast(root, "كلمة المرور الرئيسية ضعيفة (" + s.entropy.toFixed(1) + " بت). المطلوب 75 بت و14 حرفاً على الأقل: استخدم المولّد ← Passphrase ← 6 كلمات. أعد إنشاء الخزنة.");
            bus.emit("kp:created", { ok: false, entropy: Math.round(s.entropy * 100) / 100, length: s.pw.length });
            return;
          }
          st.db = { name: s.name.trim(), master: s.pw }; st.view = "db"; st.entries = [];
          statusBar.textContent = "Saved: " + K().file;
          render();
          bus.emit("kp:created", { ok: true, entropy: Math.round(s.entropy * 100) / 100, length: s.pw.length });
        }
      });
    }

    function newEntry() {
      if (st.view !== "db") { FSIM.core.toast(root, "أنشئ الخزنة أولاً."); return; }
      var s = { title: "", user: "", pw: "", url: "", entropy: 0 };
      var back = h("div.dlg-back"), body2 = h("div.wiz-body");
      function field(id, label, key, type) {
        var i = h("input#" + id, { type: type || "text", "aria-label": label, autocomplete: "off", spellcheck: "false" });
        i.addEventListener("input", function () { s[key] = i.value; if (key === "pw") { s.entropy = estimate(i.value); q.textContent = "Password Quality: " + quality(s.entropy) + " (" + s.entropy.toFixed(2) + " bit)"; } });
        body2.appendChild(h("label", { "for": id, text: label })); return i;
      }
      var ti = field("kp-title", "Title", "title"); body2.appendChild(ti);
      var us = field("kp-user", "Username", "user"); body2.appendChild(us);
      var pw = field("kp-epw", "Password", "pw", "password");
      var q = h("p.kp-quality", { "aria-live": "polite" });
      var gen = h("button.dlg-btn", { type: "button", "aria-label": "Password generator", text: "🎲" });
      gen.addEventListener("click", function () { generator(root, true).then(function (r) { if (!r) return; s.pw = r.value; s.entropy = r.entropy; pw.value = r.value; q.textContent = "Password Quality: " + quality(r.entropy) + " (" + r.entropy.toFixed(2) + " bit)"; }); });
      body2.appendChild(h("div.fw-add", pw, gen)); body2.appendChild(q);
      var ur = field("kp-url", "URL", "url"); body2.appendChild(ur);
      var ok = h("button.dlg-btn", { type: "button", text: "OK" }), cancel = h("button.dlg-btn", { type: "button", text: "Cancel" });
      back.appendChild(h("div.dlg.wiz", { role: "dialog", "aria-modal": "true", "aria-label": "Add entry" }, h("h4", { text: "Add entry" }), h("div.ar-tabs", h("button.ar-tab", { type: "button", "aria-selected": "true", text: "Entry" }), ["Advanced", "Icon", "Auto-Type", "Properties", "Browser Integration"].map(function (t) { return h("button.ar-tab.is-off", { type: "button", "aria-selected": "false", text: t }); })), body2, h("div.dlg-btns", ok, cancel)));
      root.appendChild(back); ti.focus();
      ok.addEventListener("click", function () {
        if (!s.title.trim() || !s.pw) { FSIM.core.toast(back, "اكتب العنوان وكلمة المرور (من المولّد)."); return; }
        back.remove(); st.entries.push({ title: s.title.trim(), user: s.user, url: s.url, pw: s.pw }); st.sel = s.title.trim(); render();
        bus.emit("kp:entry", { title: s.title.trim(), entropy: Math.round(s.entropy * 100) / 100 });
      });
      cancel.addEventListener("click", function () { back.remove(); });
    }
    function copySel() {
      var e = st.entries.filter(function (x) { return x.title === st.sel; })[0];
      if (!e) { FSIM.core.toast(root, "اختر مدخلاً أولاً."); return; }
      var n = K().clearSeconds; clearInterval(st.timer);
      statusBar.textContent = "Password copied to clipboard (clears in " + n + " seconds).";
      st.timer = setInterval(function () { n--; statusBar.textContent = n > 0 ? "Password copied to clipboard (clears in " + n + " seconds)." : "Clipboard cleared."; if (n <= 0) clearInterval(st.timer); }, FSIM.core.config.fast ? 5 : 1000);
      bus.emit("kp:copy", { title: e.title });
    }
    function lock() { if (st.view !== "db") return; st.view = "locked"; render(); bus.emit("kp:lock", {}); }

    render();
    body.api = {
      demoCreate: function () {
        var words = []; for (var i = 0; i < 6; i++) words.push(K().words[i * 3]);
        st.db = { name: K().dbName, master: words.join(" ") }; st.view = "db"; st.entries = []; statusBar.textContent = "Saved: " + K().file; render();
        bus.emit("kp:created", { ok: true, entropy: Math.round(6 * EFF * 100) / 100, length: st.db.master.length });
      },
      demoEntry: function () {
        st.entries.push({ title: "Printer admin", user: "admin", url: "https://printer.sanabel.example", pw: "x" }); st.sel = "Printer admin"; render();
        bus.emit("kp:entry", { title: "Printer admin", entropy: Math.round(24 * Math.log2(94) * 100) / 100 });
      },
      copy: copySel, lock: lock
    };
  }

  FSIM.tools.keepassxc = {
    id: "keepassxc", quality: quality, EFF: EFF,
    open: function (stage, o) { o = o || {}; return stage.create({ id: "keepassxc", title: "KeePassXC", icon: "key", skin: "win", width: o.width || 860, height: o.height || 470, x: o.x, y: o.y, build: build }); }
  };
})();
