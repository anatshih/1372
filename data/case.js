/* The consultant's mission: every value shown by any simulated tool (docs/outputs-spec.md, approved 2026-10-16).
   All names, addresses and numbers are fictional (private ranges, 203.0.113.0/24, .example, MAC 02:…).
   States: "before" = the office as found; "after" = after the remediation lessons. */
window.FSIM = window.FSIM || {}; window.FSIM.data = window.FSIM.data || {};
window.FSIM.data.case = {
  id: "VLAB-1372-01",
  client: { name: "مكتب السنابل للمحاسبة (وهمي)", domain: "sanabel.example" },

  /* outputs-spec §ب */
  network: { cidr: "192.168.50.0/24", prefix: "192.168.50.", mask: "255.255.255.0", gateway: "192.168.50.1" },
  hosts: [
    { id: "gw", name: "GW", ip: "192.168.50.1", mac: "02:50:00:00:00:01", fqdn: "gw.sanabel.example", role: "الراوتر (البوابة)" },
    { id: "filesrv", name: "FILESRV", ip: "192.168.50.10", mac: "02:50:00:00:00:10", fqdn: "filesrv.sanabel.example", os: "Windows Server 2022", role: "خادم الملفات" },
    { id: "acc1", name: "ACC-PC1", ip: "192.168.50.21", mac: "02:50:00:00:00:21", fqdn: "acc-pc1.sanabel.example", os: "Windows 11 Pro 24H2", role: "جهاز المحاسب (الجهاز الرئيسي في الدروس)" },
    { id: "acc2", name: "ACC-PC2", ip: "192.168.50.22", mac: "02:50:00:00:00:22", fqdn: "acc-pc2.sanabel.example", os: "Windows 11 Pro 24H2", role: "جهاز مدير المكتب" },
    { id: "printer", name: "PRINTER", ip: "192.168.50.30", mac: "02:50:00:00:00:30", fqdn: "printer.sanabel.example", role: "الطابعة" },
    { id: "consultant", name: "CONSULTANT-LT", ip: "192.168.50.100", mac: null, fqdn: "consultant-lt.sanabel.example", role: "جهاز المستشار (جهاز الفحص)" }
  ],
  mainHost: { name: "ACC-PC1", ip: "192.168.50.21", user: "accountant" },
  consultant: { name: "CONSULTANT-LT", ip: "192.168.50.100", account: "Consultant" },
  windowsBuild: { before: "10.0.26100.6400", after: "10.0.26100.6584" },

  rhelper: { file: "rhelper.exe", dir: "C:\\Users\\Public\\rhelper\\", path: "C:\\Users\\Public\\rhelper\\rhelper.exe", pid: 4312, port: 5900, task: "\\RemoteHelperUpdate", taskFile: "rhupd.exe", run: "RemoteHelper" },

  /* outputs-spec §ج-1 / ج-2: [proto, local, foreign, state, pid, onlyIn?] */
  netstat: [
    ["TCP", "0.0.0.0:135", "0.0.0.0:0", "LISTENING", 1012],
    ["TCP", "0.0.0.0:445", "0.0.0.0:0", "LISTENING", 4],
    ["TCP", "0.0.0.0:3389", "0.0.0.0:0", "LISTENING", 1180],
    ["TCP", "0.0.0.0:5900", "0.0.0.0:0", "LISTENING", 4312, "before"],
    ["TCP", "0.0.0.0:49664", "0.0.0.0:0", "LISTENING", 768],
    ["TCP", "0.0.0.0:49665", "0.0.0.0:0", "LISTENING", 640],
    ["TCP", "0.0.0.0:49666", "0.0.0.0:0", "LISTENING", 1408],
    ["TCP", "127.0.0.1:5939", "0.0.0.0:0", "LISTENING", 3876],
    ["TCP", "192.168.50.21:139", "0.0.0.0:0", "LISTENING", 4],
    ["TCP", "192.168.50.21:49702", "203.0.113.80:443", "ESTABLISHED", 5520],
    ["TCP", "192.168.50.21:49710", "192.168.50.10:445", "ESTABLISHED", 4],
    ["TCP", "192.168.50.21:49688", "203.0.113.80:443", "TIME_WAIT", 0],
    ["UDP", "0.0.0.0:5353", "*:*", "", 2216],
    ["UDP", "0.0.0.0:5355", "*:*", "", 2216]
  ],
  /* name lines printed by netstat -ab (admin) under each row, by PID */
  netstatOwners: {
    4: ["Can not obtain ownership information"], 640: [" [wininit.exe]"], 768: [" [lsass.exe]"],
    1012: [" RpcSs", " [svchost.exe]"], 1180: [" TermService", " [svchost.exe]"], 1408: [" EventLog", " [svchost.exe]"],
    2216: [" Dnscache", " [svchost.exe]"], 3876: [" [AccountingSync.exe]"], 4312: [" [rhelper.exe]"], 5520: [" [msedge.exe]"], 0: []
  },
  /* foreign address as printed without -n */
  netstatNames: { "0.0.0.0:0": "ACC-PC1:0", "192.168.50.10:445": "FILESRV:microsoft-ds", "203.0.113.80:443": "203.0.113.80:https", "*:*": "*:*" },

  /* outputs-spec §ج-7: Details rows [name, pid, status, user, cpu, mem, arch, description, path, onlyIn?] */
  processes: [
    ["System", 4, "Running", "SYSTEM", "00", "24 K", "x64", "NT Kernel & System", "C:\\WINDOWS\\system32\\ntoskrnl.exe"],
    ["wininit.exe", 640, "Running", "SYSTEM", "00", "1,120 K", "x64", "Windows Start-Up Application", "C:\\WINDOWS\\system32\\wininit.exe"],
    ["lsass.exe", 768, "Running", "SYSTEM", "00", "6,240 K", "x64", "Local Security Authority Process", "C:\\WINDOWS\\system32\\lsass.exe"],
    ["svchost.exe", 1012, "Running", "NETWORK SERVICE", "00", "8,904 K", "x64", "Host Process for Windows Services", "C:\\WINDOWS\\system32\\svchost.exe"],
    ["svchost.exe", 1180, "Running", "NETWORK SERVICE", "00", "4,316 K", "x64", "Host Process for Windows Services", "C:\\WINDOWS\\system32\\svchost.exe"],
    ["svchost.exe", 1408, "Running", "LOCAL SERVICE", "00", "3,880 K", "x64", "Host Process for Windows Services", "C:\\WINDOWS\\system32\\svchost.exe"],
    ["svchost.exe", 2216, "Running", "NETWORK SERVICE", "00", "2,912 K", "x64", "Host Process for Windows Services", "C:\\WINDOWS\\system32\\svchost.exe"],
    ["AccountingSync.exe", 3876, "Running", "accountant", "00", "22,560 K", "x64", "Accounting Sync Agent", "C:\\Program Files\\ExampleAccounting\\AccountingSync.exe"],
    ["rhelper.exe", 4312, "Running", "SYSTEM", "00", "18,432 K", "x86", "", "C:\\Users\\Public\\rhelper\\rhelper.exe", "before"],
    ["msedge.exe", 5520, "Running", "accountant", "01", "96,300 K", "x64", "Microsoft Edge", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"]
  ],
  folderOf: { "rhelper.exe": ["rhelper.exe", "rhupd.exe"] },
  /* [name, pid, description, status, group] */
  services: [
    ["Dnscache", 2216, "DNS Client", "Running", "NetworkService"],
    ["EventLog", 1408, "Windows Event Log", "Running", "LocalServiceNetworkRestricted"],
    ["RpcSs", 1012, "Remote Procedure Call (RPC)", "Running", "RPCSS"],
    ["TermService", 1180, "Remote Desktop Services", "Running", "NetworkService"]
  ],
  /* outputs-spec §ج-8: [name, publisher, status, impact, onlyIn?] */
  startupApps: [
    ["AccountingSync", "Example Accounting Ltd.", "Enabled", "Low"],
    ["Microsoft OneDrive", "Microsoft Corporation", "Enabled", "High"],
    ["RemoteHelper", "", "Enabled", "Not measured", "before"],
    ["Windows Security notification icon", "Microsoft Corporation", "Enabled", "Low"]
  ],
  lastBiosTime: "4.2 seconds",

  /* outputs-spec §د */
  nmap: {
    version: "7.95",
    tz: "Arab Standard Time",
    pingTime: "2026-10-11 09:05", pingElapsed: "2.48",
    latency: { "192.168.50.1": "0.0011s", "192.168.50.10": "0.00062s", "192.168.50.21": "0.00071s", "192.168.50.22": "0.00069s", "192.168.50.30": "0.0024s" },
    /* Quick scan (-T4 -F): open ports [port, service] and the "Not shown" line, per host and state */
    quick: {
      "192.168.50.1": { ports: [["53/tcp", "domain"], ["80/tcp", "http"], ["443/tcp", "https"]], notShown: "97 closed tcp ports (reset)" },
      "192.168.50.10": { ports: [["135/tcp", "msrpc"], ["139/tcp", "netbios-ssn"], ["445/tcp", "microsoft-ds"]], notShown: "97 filtered tcp ports (no-response)" },
      "192.168.50.21": {
        before: { ports: [["135/tcp", "msrpc"], ["139/tcp", "netbios-ssn"], ["445/tcp", "microsoft-ds"], ["3389/tcp", "ms-wbt-server"], ["5900/tcp", "vnc"]], notShown: "95 filtered tcp ports (no-response)" },
        after: { ports: [["135/tcp", "msrpc"], ["139/tcp", "netbios-ssn"], ["445/tcp", "microsoft-ds"]], notShown: "97 filtered tcp ports (no-response)" }
      },
      "192.168.50.22": { ports: [["135/tcp", "msrpc"], ["139/tcp", "netbios-ssn"], ["445/tcp", "microsoft-ds"]], notShown: "97 filtered tcp ports (no-response)" },
      "192.168.50.30": { ports: [["23/tcp", "telnet"], ["80/tcp", "http"], ["443/tcp", "https"], ["515/tcp", "printer"], ["631/tcp", "ipp"], ["9100/tcp", "jetdirect"]], notShown: "94 closed tcp ports (reset)" },
      "192.168.50.100": { ports: [], notShown: "100 closed tcp ports (reset)" }
    },
    /* Quick scan plus on ACC-PC1 (outputs-spec §د-3/د-4) */
    versions: {
      "135/tcp": "Microsoft Windows RPC", "139/tcp": "Microsoft Windows netbios-ssn", "445/tcp": "", "3389/tcp": "Microsoft Terminal Services", "5900/tcp": "VNC (protocol 3.8)"
    },
    serviceNames: { "445/tcp": "microsoft-ds?" },
    os: { type: "general purpose", running: "Microsoft Windows 10|11", details: "Microsoft Windows 10 1607 - 11 23H2", accuracy: "96%", cpe: "cpe:/o:microsoft:windows" },
    plusElapsed: { before: "14.36", after: "16.02" },
    quickElapsed: { single: "1.92", range: "6.85" }
  },

  /* outputs-spec §هـ */
  nessus: {
    url: "https://localhost:8834",
    scanName: "Sanabel - Baseline",
    description: "Office security assessment, Oct 2026",
    targets: "192.168.50.1, 192.168.50.10, 192.168.50.21, 192.168.50.22, 192.168.50.30",
    credentialsUser: "Consultant",
    details: { Policy: "Basic Network Scan", Status: "Completed", "Severity Base": "CVSS v3.0", Scanner: "Local Scanner", Start: "Today at 9:30 AM", End: "Today at 9:52 AM", Elapsed: "22 minutes" },
    /* [id, name, sev, cvss, vpr, family, hosts(ip list), port, pluginId, published] */
    vulns: [
      ["V01", "KB5099901: Windows 11 Version 24H2 Security Update (October 2026)", "Critical", "9.8", "8.9", "Windows : Microsoft Bulletins", ["192.168.50.21", "192.168.50.22"], "tcp/445/cifs", "900101", "2026/10/13"],
      ["V02", "VNC Server Unauthenticated Access", "Critical", "10.0", "7.4", "Service detection", ["192.168.50.21"], "tcp/5900/vnc", "900102", "2019/08/12"],
      ["V03", "Terminal Services Doesn't Use Network Level Authentication (NLA) Only", "Medium", "4.0", "", "Misc.", ["192.168.50.21"], "tcp/3389/msrdp", "900103", "2019/08/12"],
      ["V04", "Unencrypted Telnet Server", "Medium", "6.5", "", "Misc.", ["192.168.50.30"], "tcp/23/telnet", "900104", "2019/08/12"],
      ["I01", "VNC Server Detection", "Info", "", "", "Service detection", ["192.168.50.21"], "tcp/5900/vnc", "900201", ""],
      ["I02", "Remote Desktop Protocol Service Detection", "Info", "", "", "Service detection", ["192.168.50.21"], "tcp/3389/msrdp", "900202", ""],
      ["I03", "Microsoft Windows SMB Service Detection", "Info", "", "", "Windows", ["192.168.50.10", "192.168.50.21", "192.168.50.22"], "tcp/445/cifs", "900203", ""],
      ["I04", "OS Identification", "Info", "", "", "General", ["192.168.50.1", "192.168.50.10", "192.168.50.21", "192.168.50.22", "192.168.50.30"], "tcp/0", "900204", ""],
      ["I05", "Nessus Scan Information", "Info", "", "", "Settings", ["192.168.50.1", "192.168.50.10", "192.168.50.21", "192.168.50.22", "192.168.50.30"], "tcp/0", "900205", ""],
      ["I06", "Telnet Server Detection", "Info", "", "", "Service detection", ["192.168.50.30"], "tcp/23/telnet", "900206", ""],
      ["I07", "HyperText Transfer Protocol (HTTP) Information", "Info", "", "", "Web Servers", ["192.168.50.1", "192.168.50.30"], "tcp/80/www", "900207", ""],
      /* phase-1 detail values (outputs-spec §ن): three general Info plugins so the tab shows its approved count (14) */
      ["I08", "Nessus SYN scanner", "Info", "", "", "Port scanners", ["192.168.50.1", "192.168.50.10", "192.168.50.21", "192.168.50.22", "192.168.50.30"], "tcp/0", "900208", ""],
      ["I09", "Common Platform Enumeration (CPE)", "Info", "", "", "General", ["192.168.50.1", "192.168.50.10", "192.168.50.21", "192.168.50.22", "192.168.50.30"], "tcp/0/cpe", "900209", ""],
      ["I10", "Traceroute Information", "Info", "", "", "General", ["192.168.50.1", "192.168.50.10", "192.168.50.21", "192.168.50.22", "192.168.50.30"], "udp/0", "900210", ""]
    ],
    /* plugins that disappear in the rescan (outputs-spec §ل-1) */
    goneAfter: ["V01", "V02", "V03", "I01", "I02"],
    remediations: [["KB5099901: Windows 11 Version 24H2 Security Update (October 2026): Apply Cumulative Update KB5099901.", "1", "2"]],
    texts: {
      V01: { description: "The remote Windows host is missing security update KB5099901. It is therefore affected by multiple vulnerabilities fixed in the October 2026 cumulative update.", solution: "Apply Cumulative Update KB5099901.", output: ["The remote host is missing one of the following rollup KBs :", "  - 5099901", "", "  Current OS build : 26100.6400", "  Should be        : 26100.6584"], cve: ["CVE-2026-99101", "CVE-2026-99102"] },
      V02: { description: "The VNC server running on the remote host does not require authentication.", solution: "Disable the VNC server if it is not needed, or configure it to require strong authentication, and restrict access with a firewall.", output: ["The VNC server on port 5900 does not require a password."], cve: [] },
      V03: { description: "The remote Terminal Services is not configured to use Network Level Authentication (NLA) only.", solution: "Enable Network Level Authentication (NLA) on the remote RDP server, and limit access to authorized hosts.", output: ["Network Level Authentication is not enforced on port 3389."], cve: [] },
      V04: { description: "The remote host is running a Telnet server over an unencrypted channel.", solution: "Disable the Telnet service and use SSH or the device's HTTPS management interface instead.", output: ["A Telnet server is listening on port 23."], cve: [] },
      I01: { description: "A VNC server is listening on the remote port.", solution: "n/a", output: ["The remote VNC server chose security type #1 (None)."], cve: [] },
      I02: { description: "The remote host is running the Remote Desktop Protocol (RDP) service.", solution: "Disable the service if you do not use it, or limit access to authorized hosts.", output: ["RDP is listening on port 3389."], cve: [] },
      I03: { description: "The remote service understands the CIFS (Common Internet File System) or Server Message Block (SMB) protocol.", solution: "n/a", output: ["An SMB server is running on this port."], cve: [] },
      I04: { description: "Using a combination of remote probes, it is possible to guess the name of the remote operating system.", solution: "n/a", output: ["Remote operating system : (see Host Details)"], cve: [] },
      I05: { description: "This plugin displays information about the Nessus scan.", solution: "n/a", output: ["Scan name : Sanabel - Baseline", "Scan policy used : Basic Network Scan", "Credentialed checks : yes (Windows)"], cve: [] },
      I06: { description: "A Telnet server is listening on the remote port.", solution: "Disable this service and use SSH instead.", output: ["A Telnet server is running on port 23."], cve: [] },
      I07: { description: "This test gives some information about the remote HTTP protocol.", solution: "n/a", output: ["Protocol version : HTTP/1.1"], cve: [] },
      I08: { description: "This plugin is a SYN 'half-open' port scanner. It shall be reasonably quick even against a firewalled target.", solution: "Protect your target with an IP filter.", output: ["Port is open"], cve: [] },
      I09: { description: "By using information obtained from a Nessus scan, this plugin reports CPE (Common Platform Enumeration) matches for various hardware and software products found on a host.", solution: "n/a", output: ["The remote operating system matched the following CPE : cpe:/o:microsoft:windows"], cve: [] },
      I10: { description: "Makes a traceroute to the remote host.", solution: "n/a", output: ["For your information, here is the traceroute from 192.168.50.100 to the host :", "(one hop: same local network)"], cve: [] }
    },
    history: [["10/11/2026 9:30 AM", "10/11/2026 9:52 AM", "Completed"], ["10/15/2026 1:10 PM", "10/15/2026 1:29 PM", "Completed"]],
    /* per-host counts outputs-spec §هـ-4 (before) and §ل-1 (after): [critical, high, medium, low, info] */
    hostCounts: {
      before: { "192.168.50.21": [2, 0, 1, 0, 24], "192.168.50.22": [1, 0, 0, 0, 18], "192.168.50.30": [0, 0, 1, 0, 12], "192.168.50.10": [0, 0, 0, 0, 22], "192.168.50.1": [0, 0, 0, 0, 9] },
      after: { "192.168.50.21": [0, 0, 0, 0, 19], "192.168.50.22": [0, 0, 0, 0, 18], "192.168.50.30": [0, 0, 1, 0, 12], "192.168.50.10": [0, 0, 0, 0, 22], "192.168.50.1": [0, 0, 0, 0, 9] }
    },
    vulnCount: 14
  },

  /* outputs-spec §ل-3: the security assessment report. Status changes when the named lesson is complete. */
  findings: [
    { id: "F1", title: "تحديث أمني ناقص KB5099901 (V01)", source: "Nessus", hosts: ".21، .22", severity: "Critical", closes: "l4-update", result: "closed" },
    { id: "F2", title: "خدمة VNC بلا مصادقة من rhelper.exe (V02)", source: "Nessus", hosts: ".21", severity: "Critical", closes: "l6-autoruns", result: "closed" },
    { id: "F3", title: "حصان طروادة invoice_oct.pdf.exe في Downloads (M1)", source: "Defender", hosts: ".21", severity: "Severe", closes: "l5-defender", result: "closed" },
    { id: "F4", title: "سياسة كلمات مرور وقفل ضعيفة، وكلمات مرور الأجهزة على ورقة (M2)", source: "فحص المستشار", hosts: ".21، .22", severity: "High (تقدير المستشار)", closes: "l8-passwords", result: "closed" },
    { id: "F5", title: "ملف رواتب مموَّه غير مشفّر (M3)", source: "فحص المستشار", hosts: ".21", severity: "Medium (تقدير المستشار)", closes: "l9-encryption", result: "closed" },
    { id: "F6", title: "RDP دون NLA (V03)", source: "Nessus", hosts: ".21", severity: "Medium", closes: "l7-firewall", result: "residual", note: "الوصول مقيّد على 192.168.50.22؛ التوصية تفعيل NLA." },
    { id: "F7", title: "Telnet غير مشفّر على الطابعة (V04)", source: "Nessus", hosts: ".30", severity: "Medium", closes: "l3-nessus", result: "residual", note: "تعطيل Telnet من لوحة إدارة الطابعة أو تحديث برنامجها الثابت عبر المورّد." }
  ]
};

/* ---------------- phase 2: lessons 4–9 (outputs-spec §و–ك) ---------------- */
(function (K) {
  /* §و Windows Update on ACC-PC1 */
  K.update = {
    lastChecked: "7/2/2026, 9:14 AM",
    lastCheckedAfter: "Today, 11:02 AM",
    items: [
      { name: "2026-10 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5099901)", kb: "KB5099901", restart: true, group: "Quality Updates" },
      { name: "Security Intelligence Update for Microsoft Defender Antivirus - KB2267602 (Version 1.441.202.0)", kb: "KB2267602", restart: false, group: "Definition Updates" }
    ],
    installedOn: "10/13/2026"
  };

  /* §ز Windows Security / Defender on ACC-PC1 */
  K.defender = {
    sigBefore: { version: "1.437.880.0", created: "6/30/2026", lastUpdate: "7/2/2026" },
    sigAfter: { version: "1.441.202.0", lastUpdate: "Today" },
    lastScan: "7/2/2026 (quick scan)",
    quick: { files: "48,213", lasted: "3 minutes 41 seconds" },
    custom: { folder: "C:\\Users\\Public\\rhelper\\", files: "2" },
    threats: [
      { id: "trojan", name: "Trojan:Win32/FakeInv.A", level: "Severe", category: "Trojan", date: "10/13/2026 11:20 AM", items: ["file: C:\\Users\\accountant\\Downloads\\invoice_oct.pdf.exe"], foundBy: "quick", quarantinedAt: "11:24 AM" },
      { id: "pua", name: "PUA:Win32/RHelper", level: "Medium", category: "Potentially unwanted software", date: "10/13/2026 11:30 AM", items: ["file: C:\\Users\\Public\\rhelper\\rhelper.exe", "file: C:\\Users\\Public\\rhelper\\rhupd.exe"], foundBy: "custom", quarantinedAt: "11:31 AM" }
    ],
    folders: ["C:\\Users\\accountant\\Documents\\", "C:\\Users\\accountant\\Downloads\\", "C:\\Users\\Public\\rhelper\\", "C:\\Program Files\\ExampleAccounting\\"]
  };

  /* §ح Autoruns on ACC-PC1: groups → entries; cls pink/yellow; quarantine turns rhelper entries yellow */
  K.autoruns = {
    logon: [
      { header: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", entries: [
        { key: "acc", name: "AccountingSync", desc: "Accounting Sync Agent", publisher: "(Verified) Example Accounting Ltd.", path: "C:\\Program Files\\ExampleAccounting\\AccountingSync.exe", time: "3/4/2026", vt: "0/75" },
        { key: "rh", name: "RemoteHelper", desc: "", publisher: "(Not Verified)", path: "C:\\Users\\Public\\rhelper\\rhelper.exe", time: "5/21/2019", vt: "4/75", cls: "pink", rhelper: true },
        { key: "sec", name: "SecurityHealth", desc: "Windows Security notification icon", publisher: "(Verified) Microsoft Windows", path: "C:\\Windows\\system32\\SecurityHealthSystray.exe", time: "9/14/2026", vt: "0/75" }
      ] },
      { header: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", entries: [
        { key: "od", name: "OneDrive", desc: "Microsoft OneDrive", publisher: "(Verified) Microsoft Corporation", path: "C:\\Users\\accountant\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe", time: "9/14/2026", vt: "0/75" }
      ] }
    ],
    tasks: [
      { header: "Task Scheduler", entries: [
        { key: "rht", name: "\\RemoteHelperUpdate", desc: "", publisher: "(Not Verified)", path: "C:\\Users\\Public\\rhelper\\rhupd.exe", time: "5/21/2019", vt: "3/75", cls: "pink", rhelper: true },
        { key: "edge", name: "\\MicrosoftEdgeUpdateTaskMachineCore", desc: "Microsoft Edge Update", publisher: "(Verified) Microsoft Corporation", path: "C:\\Program Files (x86)\\Microsoft\\EdgeUpdate\\MicrosoftEdgeUpdate.exe", time: "8/20/2026", vt: "0/75" }
      ] }
    ],
    services: [
      { header: "HKLM\\System\\CurrentControlSet\\Services", entries: [
        { key: "accsvc", name: "AccountingSyncSvc", desc: "Accounting Sync Service", publisher: "(Verified) Example Accounting Ltd.", path: "C:\\Program Files\\ExampleAccounting\\AccountingSyncSvc.exe", time: "3/4/2026", vt: "0/75" }
      ] }
    ]
  };

  /* §ط Windows Defender Firewall with Advanced Security on ACC-PC1 */
  K.firewall = {
    profiles: ["Domain Profile", "Private Profile is Active", "Public Profile"],
    /* [name, group, profile, enabled, action, program, remote, protocol, localPort] */
    inbound: [
      ["Remote Helper", "", "All", "Yes", "Allow", "C:\\Users\\Public\\rhelper\\rhelper.exe", "Any", "TCP", "5900"],
      ["Remote Desktop - User Mode (TCP-In)", "Remote Desktop", "All", "Yes", "Allow", "%SystemRoot%\\system32\\svchost.exe", "Any", "TCP", "3389"],
      ["Remote Desktop - User Mode (UDP-In)", "Remote Desktop", "All", "Yes", "Allow", "%SystemRoot%\\system32\\svchost.exe", "Any", "UDP", "3389"],
      ["File and Printer Sharing (SMB-In)", "File and Printer Sharing", "Private", "Yes", "Allow", "System", "Local subnet", "TCP", "445"],
      ["AccountingSync", "", "Private", "Yes", "Allow", "C:\\Program Files\\ExampleAccounting\\AccountingSync.exe", "Local subnet", "TCP", "Any"],
      ["Core Networking - Dynamic Host Configuration Protocol (DHCP-In)", "Core Networking", "All", "Yes", "Allow", "%SystemRoot%\\system32\\svchost.exe", "Any", "UDP", "68"],
      ["Core Networking - Internet Group Management Protocol (IGMP-In)", "Core Networking", "All", "Yes", "Allow", "System", "Any", "IGMP", "Any"]
    ],
    outbound: [
      ["Core Networking - DNS (UDP-Out)", "Core Networking", "All", "Yes", "Allow", "%SystemRoot%\\system32\\svchost.exe", "Any", "UDP", "Any"],
      ["Core Networking - Dynamic Host Configuration Protocol (DHCP-Out)", "Core Networking", "All", "Yes", "Allow", "%SystemRoot%\\system32\\svchost.exe", "Any", "UDP", "68"]
    ],
    target: { name: "Block VNC 5900", description: "Sanabel assessment - V02", port: "5900", managerIp: "192.168.50.22" }
  };

  /* §ط-5 Wireshark capture printer-admin.pcapng */
  K.capture = {
    file: "printer-admin.pcapng", total: 112,
    /* [no, time, src, dst, proto, len, info, stream] */
    key: [
      [1, "0.000000", "192.168.50.100", "192.168.50.1", "DNS", 83, "Standard query 0x1a2b A printer.sanabel.example", null],
      [2, "0.001812", "192.168.50.1", "192.168.50.100", "DNS", 99, "Standard query response 0x1a2b A printer.sanabel.example A 192.168.50.30", null],
      [3, "0.002410", "192.168.50.100", "192.168.50.30", "TCP", 66, "50112 → 23 [SYN] Seq=0 Win=64240 Len=0 MSS=1460", 0],
      [6, "0.015220", "192.168.50.30", "192.168.50.100", "TELNET", 98, "Telnet Data ...", 0],
      [61, "48.320114", "192.168.50.100", "192.168.50.30", "TCP", 66, "50140 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460", 1],
      [64, "48.322980", "192.168.50.100", "192.168.50.30", "TLSv1.3", 571, "Client Hello (SNI=printer.sanabel.example)", 1],
      [66, "48.341502", "192.168.50.30", "192.168.50.100", "TLSv1.3", 1414, "Server Hello, Change Cipher Spec, Application Data", 1],
      [72, "49.102731", "192.168.50.100", "192.168.50.30", "TLSv1.3", 612, "Application Data", 1]
    ],
    counts: { "": 112, "telnet": 34, "tcp.port == 23": 46, "tls": 18, "http": 0, "ip.addr == 192.168.50.30": 104 },
    /* [direction c=client(red) s=server(blue), text] */
    telnetStream: [["s", "Welcome to PRN-OFFICE Telnet Service\n"], ["s", "login: "], ["c", "a"], ["s", "a"], ["c", "u"], ["s", "u"], ["c", "d"], ["s", "d"], ["c", "i"], ["s", "i"], ["c", "t"], ["s", "t"], ["c", "-"], ["s", "-"], ["c", "t"], ["s", "t"], ["c", "e"], ["s", "e"], ["c", "s"], ["s", "s"], ["c", "t"], ["s", "t"], ["c", "\n"], ["s", "Password: "], ["c", "Test-Only-2026\n"], ["s", "Login OK.\nPRN> "], ["c", "s"], ["s", "s"], ["c", "h"], ["s", "h"], ["c", "o"], ["s", "o"], ["c", "w"], ["s", "w"], ["c", " "], ["s", " "], ["c", "v"], ["s", "v"], ["c", "e"], ["s", "e"], ["c", "r"], ["s", "r"], ["c", "s"], ["s", "s"], ["c", "i"], ["s", "i"], ["c", "o"], ["s", "o"], ["c", "n"], ["s", "n"], ["c", "\n"], ["s", "Firmware: 2.1.4 (2019-06-03)\nPRN> "], ["c", "e"], ["s", "e"], ["c", "x"], ["s", "x"], ["c", "i"], ["s", "i"], ["c", "t"], ["s", "t"], ["c", "\n"]],
    streamBytes: 412,
    tlsHex: "8f3a 1c9e 77d0 a4b2 05e1 39cc 6b7f 2a90 e4d8 13f6 9c21 b047 5ae3 0d8c 71b9 e2f4"
  };

  /* §ي secpol on ACC-PC1: [policy, before, required(after), kind] kind: num|enabled|text */
  K.secpol = {
    password: [
      ["Enforce password history", 0, 24, "passwords remembered"],
      ["Maximum password age", 42, 42, "days"],
      ["Minimum password age", 0, 1, "days"],
      ["Minimum password length", 0, 14, "characters"],
      ["Minimum password length audit", "Not Defined", "Not Defined", "fixed"],
      ["Password must meet complexity requirements", "Disabled", "Enabled", "toggle"],
      ["Relax minimum password length limits", "Not Defined", "Not Defined", "fixed"],
      ["Store passwords using reversible encryption", "Disabled", "Disabled", "toggle"]
    ],
    lockout: [
      ["Account lockout duration", null, 15, "minutes"],
      ["Account lockout threshold", 0, 5, "invalid logon attempts"],
      ["Allow Administrator account lockout", "Enabled", "Enabled", "toggle"],
      ["Reset account lockout counter after", null, 15, "minutes"]
    ],
    suggested: 30
  };

  /* §ي-3 lockout test + Security log */
  K.lockout = {
    account: "lockout-test",
    attempts: ["10:05:11", "10:05:18", "10:05:26", "10:05:33", "10:05:41"],
    sixth: "10:06:02",
    date: "10/14/2026"
  };

  /* §ي-4 KeePassXC on ACC-PC2 */
  K.keepass = {
    dbName: "Sanabel Office", description: "Office device admin passwords", file: "C:\\Users\\manager\\Documents\\Sanabel-Office.kdbx",
    /* EFF large wordlist subset (real list has 7776 words; the simulation draws from these and computes entropy for 7776) */
    words: ["anchor", "basket", "cactus", "dolphin", "elbow", "falcon", "garnet", "harbor", "igloo", "jasmine", "kettle", "lantern", "magnet", "napkin", "orchid", "pebble", "quilt", "ribbon", "saddle", "tunnel", "umpire", "velvet", "walnut", "yogurt", "zipper", "bramble", "cobalt", "drizzle", "ember", "fossil", "glacier", "hammock"],
    entries: [["Router admin", "admin", "https://gw.sanabel.example"], ["Printer admin", "admin", "https://printer.sanabel.example"], ["FILESRV backup", "svc-backup", ""]],
    clearSeconds: 10
  };

  /* §ك lesson 9: files in C:\Users\accountant\Documents on ACC-PC1 */
  K.files = {
    dir: "C:\\Users\\accountant\\Documents",
    serial: "5A1C-0E21",
    free: "118,402,560,000",
    visible: [["10/08/2026  02:10 PM", "31,744", "clients-2026.docx"]],
    hidden: ["10/05/2026  11:02 AM", "48,640", "holiday.jpg"],
    real: "salaries-2026.xlsx",
    archive: { name: "salaries-2026.7z", size: "39,872" },
    salaryRows: [["Office manager", "1,800"], ["Senior accountant", "1,350"], ["Accountant", "1,100"], ["Receptionist", "750"], ["Office assistant", "650"]]
  };
})(window.FSIM.data.case);
