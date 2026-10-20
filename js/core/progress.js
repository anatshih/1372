/* FSIM.core.progress — per-lesson stage state + completion code. Everything stays in the browser (localStorage, try/catch). */
(function () {
  "use strict";
  var FSIM = window.FSIM, store = FSIM.core.storage;
  var STAGES = ["explain", "practice", "interpret"];
  var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 symbols, no 0/O/1/I

  function rec(id) {
    var p = store.get().progress;
    if (!p[id]) p[id] = { explain: false, practice: false, interpret: false, cards: {}, questions: {} };
    return p[id];
  }

  /* a lesson may have fewer stages (the intro has no tool practice): taken from the lesson or the generated index */
  function stagesOf(id) {
    var L = FSIM.lessons && FSIM.lessons[id];
    if (L && L.stages) return L.stages;
    var list = (FSIM.data && FSIM.data.lessonIndex) || [];
    var x = list.filter(function (l) { return l.id === id; })[0];
    return (x && x.stages) || STAGES;
  }

  /* light deterrent only — a static site cannot prevent forgery */
  function fnv(str) {
    var hsh = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { hsh ^= str.charCodeAt(i); hsh = (hsh + ((hsh << 1) + (hsh << 4) + (hsh << 7) + (hsh << 8) + (hsh << 24))) >>> 0; }
    return hsh >>> 0;
  }
  function code(studentId, lessonId, axis) {
    var n = fnv("vlab|" + String(studentId).trim() + "|" + lessonId);
    var s = "";
    for (var i = 0; i < 4; i++) { s += ALPHABET.charAt(n & 31); n = n >>> 5; }
    return "A" + axis + "-" + s;
  }

  FSIM.core.progress = {
    STAGES: STAGES,
    stagesOf: stagesOf,
    get: rec,
    isDone: function (id, stage) { return !!rec(id)[stage]; },
    complete: function (id) { var r = rec(id); return stagesOf(id).every(function (s) { return r[s]; }); },
    mark: function (id, stage, val) { rec(id)[stage] = val !== false; store.save(); },
    recordPractice: function (id, evidence) {
      var r = rec(id);
      r.lastPracticeEvidence = evidence;
      if (r.practiceMethod === "independent") { store.save(); return; }
      r.practiceEvidence = evidence;
      r.practiceMethod = evidence.every(function (x) { return x.method === "independent"; }) ? "independent" : evidence.every(function (x) { return x.method === "observed"; }) ? "observed" : "mixed";
      store.save();
    },
    markCard: function (id, cardId) { rec(id).cards[cardId] = true; store.save(); },
    markQuestion: function (id, qi) { rec(id).questions[qi] = true; store.save(); },
    setLast: function (id, stage) { store.get().ui.last = { lesson: id, stage: stage }; store.save(); },
    getLast: function () { return store.get().ui.last || null; },
    percent: function (lessonIds) {
      var total = 0, done = 0;
      lessonIds.forEach(function (id) { stagesOf(id).forEach(function (s) { total++; if (rec(id)[s]) done++; }); });
      return total ? Math.round((done / total) * 100) : 0;
    },
    reset: function () { store.clear(); },
    getStudent: function () { return store.get().student || ""; },
    setStudent: function (v) { store.get().student = String(v || "").trim(); store.save(); },
    code: code
  };
})();
