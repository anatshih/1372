/* FSIM.tools.cmd / FSIM.tools.cmdadmin — Windows Command Prompt on ACC-PC1 (docs/ui-reference.md §1).
   Lesson 1: netstat (-ano, -b, -ab, | findstr), tasklist, hostname, whoami, ver, cls. Values: FSIM.data.case (outputs-spec §ج).
   compute() is pure so the interpretation phase can re-use the same output. State: "before" / "after". */
(function () {
  "use strict";
  var FSIM = window.FSIM, C = function () { return FSIM.data.case; };
  FSIM.core.sim = FSIM.core.sim || { state: "before" };

  var PROMPT = "C:\\Users\\Consultant>", PROMPT_ADMIN = "C:\\WINDOWS\\system32>";
  function banner(state) { return ["Microsoft Windows [Version " + C().windowsBuild[state === "after" ? "after" : "before"] + "]", "(c) Microsoft Corporation. All rights reserved.", ""]; }

  /* real Windows commands that exist but are not part of the current lessons */
  var KNOWN_UNSUPPORTED = ["ipconfig", "ping", "tracert", "nslookup", "arp", "route", "systeminfo", "getmac", "nbtstat", "taskkill", "cd", "type", "echo", "help", "certutil", "sc", "reg", "wmic", "powershell"];

  function padEnd(s, n) { s = String(s); while (s.length < n) s += " "; return s; }
  function padStart(s, n) { s = String(s); while (s.length < n) s = " " + s; return s; }
  function inState(row, state, at) { return !row[at] || row[at] === state; }

  /* "-ano", "-a -n -o", "-aon" … → set of letters */
  function flags(args) {
    var f = {};
    args.forEach(function (a) { if (/^[-\/][a-z]+$/i.test(a)) a.slice(1).toLowerCase().split("").forEach(function (c) { f[c] = true; }); else f["?" + a] = true; });
    return f;
  }
  function only(f, letters) { var k = Object.keys(f); return k.length === letters.length && letters.split("").every(function (c) { return f[c]; }); }

  function netstatRows(state) { return C().netstat.filter(function (r) { return inState(r, state, 5); }); }
  function netstatLine(r, numeric) {
    var foreign = numeric ? r[2] : (C().netstatNames[r[2]] || r[2]);
    return "  " + padEnd(r[0], 7) + padEnd(r[1], 23) + padEnd(foreign, 23) + padEnd(r[3], 16) + (numeric ? r[4] : "");
  }
  var NETSTAT_HEAD = ["", "Active Connections", "", "  Proto  Local Address          Foreign Address        State           PID"];

  function netstat(args, state, admin) {
    var f = flags(args);
    if (only(f, "ano")) return { lines: NETSTAT_HEAD.concat(netstatRows(state).map(function (r) { return netstatLine(r, true); })) };
    if (f.b) {
      if (!admin) return { lines: ["The requested operation requires elevation."] };
      if (only(f, "ab")) {
        var L = ["", "Active Connections", "", "  Proto  Local Address          Foreign Address        State"];
        netstatRows(state).forEach(function (r) { L.push(netstatLine(r, false).replace(/\s+$/, "")); (C().netstatOwners[r[4]] || []).forEach(function (o) { L.push(o); }); });
        return { lines: L, delay: 40 };
      }
    }
    return { lines: [], note: "في هذه المحاكاة يعمل netstat بالصيغ: netstat -ano، وnetstat -b، وnetstat -ab (في نافذة المسؤول)، ومع | findstr." };
  }

  function tasklistLine(p) {
    var session = p[3] === "accountant" || p[0] === "rhelper.exe" ? ["Console", "1"] : ["Services", "0"];
    return padEnd(p[0], 25) + padStart(p[1], 9) + " " + padEnd(session[0], 16) + " " + padStart(session[1], 11) + " " + padStart(p[5], 12);
  }
  var TASK_HEAD = ["", "Image Name                     PID Session Name        Session#    Mem Usage", "========================= ======== ================ =========== ============"];
  function tasklist(args, state) {
    var procs = C().processes.filter(function (p) { return inState(p, state, 9); });
    if (!args.length) return { lines: TASK_HEAD.concat(procs.map(tasklistLine)) };
    var a = args.join(" ");
    var m = /^\/fi "(pid|imagename) eq ([^"]+)"$/i.exec(a);
    if (!m) return { lines: [], note: "في هذه المحاكاة يعمل tasklist بلا خيارات، أو بالصيغة: tasklist /fi \"PID eq 4312\"." };
    var key = m[1].toLowerCase(), val = m[2].trim().toLowerCase();
    var hit = procs.filter(function (p) { return key === "pid" ? String(p[1]) === val : p[0].toLowerCase() === val; });
    if (!hit.length) return { lines: ["INFO: No tasks are running which match the specified criteria."] };
    return { lines: TASK_HEAD.concat(hit.map(tasklistLine)) };
  }

  /* one command (no pipe) → { lines, delay?, note?, clear? } */
  function single(cmdline, state, admin) {
    var parts = cmdline.trim().match(/"[^"]*"|\S+/g) || [""];
    var name = parts[0].toLowerCase().replace(/\.exe$/, "");
    var args = parts.slice(1);
    switch (name) {
      case "netstat": return netstat(args, state, admin);
      case "tasklist": return tasklist(args, state);
      case "hostname": return { lines: [C().mainHost.name] };
      case "whoami": return { lines: [C().mainHost.name.toLowerCase() + "\\consultant"] };
      case "ver": return { lines: [""].concat(banner(state).slice(0, 1)) };
      case "cls": return { lines: [], clear: true };
      case "exit": return { lines: [], note: "في المحاكاة أغلق النافذة بزر ✕ في شريط العنوان." };
      case "findstr": return { lines: ["FINDSTR: Bad command line"] };
      default:
        var ext = FSIM.tools.cmdext && FSIM.tools.cmdext.handle(name, args, parts, admin);
        if (ext) return ext;
        if (KNOWN_UNSUPPORTED.indexOf(name) >= 0) return { lines: [], note: "الأمر «" + name + "» حقيقي في Windows لكنه غير مفعّل في هذا الدرس." };
        return { lines: ["'" + parts[0] + "' is not recognized as an internal or external command,", "operable program or batch file."] };
    }
  }

  /* findstr filter: case-sensitive like the real tool unless /i is given */
  function findstr(lines, arg) {
    var parts = arg.trim().match(/"[^"]*"|\S+/g) || [];
    if (!parts.length || parts[0].toLowerCase() !== "findstr") return null;
    var rest = parts.slice(1), ci = false;
    rest = rest.filter(function (p) { if (/^\/i$/i.test(p)) { ci = true; return false; } return true; });
    if (!rest.length) return ["FINDSTR: Bad command line"];
    var words = rest.join(" ").replace(/^"|"$/g, "").split(/\s+/);
    return lines.filter(function (l) {
      return words.some(function (w) { return ci ? l.toLowerCase().indexOf(w.toLowerCase()) >= 0 : l.indexOf(w) >= 0; });
    });
  }

  function compute(cmdline, state, admin) {
    state = state || "before";
    var pipe = cmdline.split("|");
    var r = single(pipe[0], state, admin);
    if (pipe.length === 2) {
      var filtered = findstr(r.lines, pipe[1]);
      if (filtered === null) return { lines: [], note: "في هذه المحاكاة يعمل الأنبوب | مع findstr فقط." };
      return { lines: filtered, note: r.note };
    }
    if (pipe.length > 2) return { lines: [], note: "في هذه المحاكاة يعمل أنبوب واحد فقط (| findstr)." };
    return r;
  }

  function exec(admin) {
    return function (cmdline, out) {
      var r = compute(cmdline, FSIM.core.sim.state, admin);
      if (r.clear) { out.clear(); return Promise.resolve(); }
      if (r.run) return r.run(out).then(function () { out.line(""); });
      /* like CMD: an empty line separates the output from the next prompt */
      return out.stream(r.lines.length ? r.lines.concat([""]) : r.lines, r.delay || 0).then(function () { if (r.note) out.note(r.note); });
    };
  }

  function make(admin) {
    var id = admin ? "cmdadmin" : "cmd";
    return function open(stage, opts) {
      opts = opts || {};
      var term;
      return stage.create({
        id: id, title: admin ? "Administrator: Command Prompt" : "Command Prompt", icon: "cmd", skin: "cmd",
        width: opts.width || 760, height: opts.height || 430, x: opts.x, y: opts.y,
        build: function (body) {
          term = FSIM.core.terminal.create(body, {
            id: id, skin: "cmd", inputLabel: (admin ? "Administrator: " : "") + "Command Prompt input",
            banner: function () { return banner(FSIM.core.sim.state); },
            prompt: function () { return admin ? PROMPT_ADMIN : (FSIM.core.sim.cwd ? FSIM.core.sim.cwd + ">" : PROMPT); },
            exec: exec(admin),
            getState: function () { return FSIM.core.sim.state; }
          });
          body.api = {
            term: term,
            /* watch-mode helper: run a command that asks for a password, then answer it */
            runWithAnswer: function (cmd, answer) {
              term.input.value = cmd; term.input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
              return new Promise(function (res) { setTimeout(function () { term.input.value = answer; term.input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })); setTimeout(res, 60); }, 60); });
            }
          };
        },
        onFocus: function () { if (term) term.focus(); }
      });
    };
  }

  FSIM.tools.cmd = {
    id: "cmd", prompt: PROMPT + " ", banner: banner, compute: compute, open: make(false),
    /* used by the interpretation phase: full output of one command as plain lines */
    /* interpretation phase: same output on a fresh machine (sim.data swapped out), optionally after setup commands */
    outputOf: function (cmdline, state, setup) {
      var keep = FSIM.core.sim.data; FSIM.core.sim.data = {};
      try { (setup || []).forEach(function (c) { compute(c, state || "before", true); }); return compute(cmdline, state || "before", false).lines.slice(); }
      finally { FSIM.core.sim.data = keep; }
    }
  };
  FSIM.tools.cmdadmin = {
    id: "cmdadmin", prompt: PROMPT_ADMIN + " ", open: make(true),
    outputOf: function (cmdline, state) { return compute(cmdline, state || "before", true).lines.slice(); }
  };
})();
