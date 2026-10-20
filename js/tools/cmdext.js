/* FSIM.tools.cmdext — CMD commands for lessons 8–9 (ui-reference §1; outputs-spec §ي-3, §ك).
   File commands work on C:\Users\accountant\Documents (dir, attrib, ren, del, cipher /w); account commands on ACC-PC1
   (net user, runas). State lives in FSIM.core.sim.data so other windows (7-Zip, Event Viewer) see the same machine. */
(function () {
  "use strict";
  var FSIM = window.FSIM, bus = FSIM.core.bus, C = function () { return FSIM.data.case; };

  function data() { var s = FSIM.core.sim; if (!s.data) s.data = {}; return s.data; }
  /* the Documents folder: name → { size, date, hidden, archive? } */
  function fs() {
    var d = data();
    if (!d.fs) {
      var F = C().files;
      d.fs = {};
      F.visible.forEach(function (v) { d.fs[v[2].toLowerCase()] = { name: v[2], date: v[0], size: v[1], hidden: false }; });
      d.fs[F.hidden[2]] = { name: F.hidden[2], date: F.hidden[0], size: F.hidden[1], hidden: true, real: F.real };
    }
    return d.fs;
  }
  /* accounts and the lockout policy (secpol writes data().policy) */
  function accounts() { var d = data(); if (!d.accounts) d.accounts = { "lockout-test": { password: "Lab-Only-Pass-2026!", bad: 0, locked: false } }; return d.accounts; }
  function policy() { var d = data(); return d.policy || { threshold: 0 }; }
  function secLog() { var d = data(); if (!d.secLog) d.secLog = []; return d.secLog; }

  function pad(s, n, left) { s = String(s); while (s.length < n) s = left ? " " + s : s + " "; return s; }
  function dirPath() { return C().files.dir; }
  function find(name) { return fs()[String(name || "").toLowerCase()]; }

  function dir(args) {
    var hiddenOnly = args.some(function (a) { return /^\/a:?h$/i.test(a); }), all = args.some(function (a) { return /^\/a$/i.test(a); });
    var F = C().files, list = Object.keys(fs()).map(function (k) { return fs()[k]; }).filter(function (f) { return all || (hiddenOnly ? f.hidden : !f.hidden); });
    list.sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
    var L = [" Volume in drive C has no label.", " Volume Serial Number is " + F.serial, "", " Directory of " + dirPath(), ""];
    var dirs = 0;
    if (!hiddenOnly) { L.push("10/12/2026  09:40 AM    <DIR>          .", "10/11/2026  08:15 AM    <DIR>          .."); dirs = 2; }
    var total = 0;
    list.forEach(function (f) { L.push(f.date + pad(f.size, 18, true) + " " + f.name); total += parseInt(f.size.replace(/,/g, ""), 10); });
    if (!list.length) return { lines: [" Volume in drive C has no label.", " Volume Serial Number is " + F.serial, "", " Directory of " + dirPath(), "", "File Not Found"] };
    L.push(pad(list.length, 16, true) + " File(s)" + pad(total.toLocaleString("en-US"), 15, true) + " bytes");
    L.push(pad(dirs, 16, true) + " Dir(s)  " + F.free + " bytes free");
    return { lines: L };
  }

  function attrib(args) {
    var flags = args.filter(function (a) { return /^[+-][a-z]$/i.test(a); }), names = args.filter(function (a) { return !/^[+-][a-z]$/i.test(a); });
    var f = find(names[0]);
    if (!names.length) return { lines: Object.keys(fs()).map(function (k) { var x = fs()[k]; return "A    " + (x.hidden ? "H" : " ") + "                " + dirPath() + "\\" + x.name; }) };
    if (!f) return { lines: ["File not found - " + dirPath() + "\\" + names[0]] };
    if (!flags.length) return { lines: ["A    " + (f.hidden ? "H" : " ") + "                " + dirPath() + "\\" + f.name] };
    flags.forEach(function (fl) { if (fl.toLowerCase().slice(1) === "h") f.hidden = fl[0] === "+"; });
    bus.emit("files:attrib", { name: f.name, hidden: f.hidden });
    return { lines: [] };
  }

  function ren(args) {
    if (args.length !== 2) return { lines: ["The syntax of the command is incorrect."] };
    var f = find(args[0]);
    if (!f) return { lines: ["The system cannot find the file specified."] };
    if (find(args[1])) return { lines: ["A duplicate file name exists, or the file", "cannot be found."] };
    var fsys = fs(); delete fsys[f.name.toLowerCase()]; f.name = args[1]; fsys[f.name.toLowerCase()] = f;
    bus.emit("files:ren", { from: args[0], to: args[1], name: f.name });
    return { lines: [] };
  }

  function del(args) {
    var names = args.filter(function (a) { return !/^\//.test(a); });
    var out = [];
    names.forEach(function (n) {
      var f = find(n);
      if (!f) { out.push("Could Not Find " + dirPath() + "\\" + n); return; }
      delete fs()[f.name.toLowerCase()];
      data().deleted = (data().deleted || []).concat([f.name]);
      bus.emit("files:del", { name: f.name });
    });
    return { lines: out };
  }

  function cipher(args) {
    var m = /^\/w:(.+)$/i.exec(args.join(" "));
    if (!m) return { lines: [], note: "في هذه المحاكاة يعمل cipher بالصيغة: cipher /w:" + dirPath() };
    var target = m[1].replace(/\\$/, "");
    var dots = "...............................................................";
    return {
      lines: ["To remove as much data as possible, please close all other applications while", "running CIPHER /W.", "Writing 0x00", dots, "Writing 0xFF", dots, "Writing Random Numbers", dots],
      run: function (out) {
        var steps = ["Writing 0x00", "Writing 0xFF", "Writing Random Numbers"];
        out.line("To remove as much data as possible, please close all other applications while");
        out.line("running CIPHER /W.");
        return steps.reduce(function (p, label) {
          return p.then(function () {
            out.line(label);
            var row = out.line(""); row.textContent = "";
            var i = 0;
            return new Promise(function (res) {
              (function tick() {
                if (i < 63) { row.textContent += "."; i++; setTimeout(tick, FSIM.core.config.fast ? 0 : 30); } else res();
              })();
            });
          });
        }, Promise.resolve()).then(function () {
          data().wiped = target;
          bus.emit("files:cipher", { target: target, afterDelete: (data().deleted || []).indexOf(C().files.real) >= 0 });
        });
      }
    };
  }

  function netUser(args, admin) {
    var acc = accounts();
    var name = args[1];
    if (!admin && args.length > 2) return { lines: ["System error 5 has occurred.", "", "Access is denied."] };
    if (args.length === 2 && acc[name]) {
      var a = acc[name];
      return { lines: ["User name                    " + name, "Full Name                    ", "Comment                      ", "Account active               " + (a.locked ? "Locked" : "Yes"), "Account expires              Never", "", "Local Group Memberships      *Users", "The command completed successfully."] };
    }
    if (args.length >= 3 && /^\/add$/i.test(args[args.length - 1])) {
      if (acc[name]) return { lines: ["The account already exists.", "", "More help is available by typing NET HELPMSG 2224."] };
      acc[name] = { password: args[2], bad: 0, locked: false };
      return { lines: ["The command completed successfully."] };
    }
    if (args.length === 3 && /^\/delete$/i.test(args[2]) && acc[name]) { delete acc[name]; bus.emit("account:deleted", { name: name }); return { lines: ["The command completed successfully."] }; }
    if (args.length >= 2 && !acc[name]) return { lines: ["The user name could not be found.", "", "More help is available by typing NET HELPMSG 2221."] };
    return { lines: [], note: "في المحاكاة: net user lockout-test، أو net user <name> <password> /add، أو net user <name> /delete." };
  }

  /* runas: wrong passwords add 4625 events; when the policy threshold is reached the account locks (4740) */
  function runas(args) {
    var m = /^\/user:(\S+)$/i.exec(args[0] || "");
    if (!m || (args[1] || "").toLowerCase() !== "cmd") return { lines: [], note: "في المحاكاة: runas /user:lockout-test cmd" };
    var user = m[1].replace(/^acc-pc1\\/i, "");
    return {
      run: function (out) {
        return out.ask("Enter the password for " + user + ":").then(function (pw) {
          out.line("Attempting to start cmd as user \"ACC-PC1\\" + user + "\" ...");
          var acc = accounts()[user], L = C().lockout, log = secLog(), n = log.filter(function (e) { return e.id === 4625; }).length;
          var time = L.attempts[n] || L.sixth;
          if (n > L.attempts.length) time = "10:06:" + ("0" + (2 + (n - L.attempts.length) * 7) % 60).slice(-2);
          function failed(status, sub, reason) { log.push({ id: 4625, time: time, user: user, status: status, sub: sub, reason: reason }); }
          if (!acc) { failed("0xC000006D", "0xC0000064", "Unknown user name or bad password."); out.line("RUNAS ERROR: Unable to run - cmd"); out.line("1326: The user name or password is incorrect."); bus.emit("runas:result", { ok: false, user: user }); return; }
          if (acc.locked) {
            failed("0xC0000234", "0x0", "Account locked out.");
            out.line("RUNAS ERROR: Unable to run - cmd"); out.line("1909: The referenced account is currently locked out and may not be logged on to.");
            bus.emit("runas:result", { ok: false, user: user, locked: true }); return;
          }
          if (pw === acc.password) { out.line(""); bus.emit("runas:result", { ok: true, user: user }); return; }
          acc.bad++;
          failed("0xC000006D", "0xC000006A", "Unknown user name or bad password.");
          var th = policy().threshold;
          if (th > 0 && acc.bad >= th) { acc.locked = true; log.push({ id: 4740, time: time, user: user }); bus.emit("account:locked", { user: user }); }
          out.line("RUNAS ERROR: Unable to run - cmd"); out.line("1326: The user name or password is incorrect.");
          bus.emit("runas:result", { ok: false, user: user, bad: acc.bad });
        });
      }
    };
  }

  FSIM.tools.cmdext = {
    data: data, fs: fs, secLog: secLog, accounts: accounts,
    handle: function (name, args, parts, admin) {
      switch (name) {
        case "dir": return dir(args);
        case "attrib": return attrib(args);
        case "ren": case "rename": return ren(args);
        case "del": case "erase": return del(args);
        case "cipher": return cipher(args);
        case "net": return (args[0] || "").toLowerCase() === "user" ? netUser(args, admin) : { lines: [], note: "في المحاكاة يعمل net user فقط." };
        case "runas": return runas(args);
        default: return null;
      }
    }
  };
})();
