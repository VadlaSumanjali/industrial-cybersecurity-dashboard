

(function () {
  'use strict';

  const PURDUE_ZONES = {
    'L4': { id: 'L4', name: 'Enterprise Network', level: 'Level 4', color: 'var(--zone-l4-enterprise)' },
    'L35': { id: 'L35', name: 'Industrial DMZ', level: 'Level 3.5', color: 'var(--zone-l35-dmz)' },
    'L3': { id: 'L3', name: 'Plant Operations', level: 'Level 3', color: 'var(--zone-l3-operations)' },
    'L2': { id: 'L2', name: 'Supervisory Control', level: 'Level 2', color: 'var(--zone-l2-supervisory)' },
    'L1': { id: 'L1', name: 'Local Process Control', level: 'Level 1', color: 'var(--zone-l1-control)' },
    'L0': { id: 'L0', name: 'Physical Process & SIS', level: 'Level 0', color: 'var(--zone-l0-physical)' }
  };

  const ASSETS_DATA = [
    {
      id: 'ext-gw-01',
      name: 'Internet-Gateway-01',
      type: 'Boundary Gateway',
      zone: 'L4',
      site: 'Plant 1 - Main Refining',
      ip: '198.51.100.1',
      vendor: 'Palo Alto Networks PA-5250',
      criticality: 'Tier 1',
      riskScore: 88,
      status: 'Online',
      confidence: 98,
      role: 'source',
      protocols: ['HTTPS', 'BGP', 'IPsec'],
      description: 'External perimeter boundary router managing corporate and external interconnects.'
    },
    {
      id: 'eng-pc-12',
      name: 'Engineering-PC-12',
      type: 'Workstation',
      zone: 'L4',
      site: 'Plant 1 - Main Refining',
      ip: '10.14.20.112',
      vendor: 'Dell Precision 5820 (Win 11)',
      criticality: 'Tier 2',
      riskScore: 92,
      status: 'Online',
      confidence: 96,
      role: 'pivot',
      protocols: ['RDP', 'SMBv2', 'HTTPS'],
      description: 'Senior Process Engineer laptop with saved VPN profiles and OT jumpbox credentials.'
    },
    {
      id: 'ot-jump-02',
      name: 'OT-Jump-02',
      type: 'Dual-Homed Jump Host',
      zone: 'L35',
      site: 'Plant 1 - Main Refining',
      ip: '10.14.50.15 / 172.16.10.5',
      vendor: 'Red Hat Enterprise Linux 8',
      criticality: 'Tier 1',
      riskScore: 89,
      status: 'Online',
      confidence: 99,
      role: 'pivot',
      protocols: ['SSH', 'RDP-Proxy', 'HTTPS'],
      description: 'Dual-homed bastion host bridging Enterprise L4 and Operations L3 with bastion auditing.'
    },
    {
      id: 'scada-01',
      name: 'SCADA-01',
      type: 'Supervisory Server',
      zone: 'L2',
      site: 'Plant 1 - Main Refining',
      ip: '172.16.20.10',
      vendor: 'Wonderware / AVEVA System Platform',
      criticality: 'Tier 1',
      riskScore: 94,
      status: 'Online',
      confidence: 95,
      role: 'pivot',
      protocols: ['OPC UA', 'Modbus TCP', 'HTTPS'],
      description: 'Central supervisory host orchestrating continuous distillation units and recipe logic.'
    },
    {
      id: 'plc-07',
      name: 'PLC-07',
      type: 'Programmable Logic Controller',
      zone: 'L1',
      site: 'Plant 1 - Main Refining',
      ip: '192.168.1.70',
      vendor: 'Siemens S7-1500 (FW v2.8)',
      criticality: 'Tier 1',
      riskScore: 96,
      status: 'Online',
      confidence: 94,
      role: 'target',
      protocols: ['S7comm-Plus', 'Modbus TCP', 'PROFINET'],
      description: 'Primary turbine speed and inlet valve controller for Turbogenerator Unit 4.'
    },
    {
      id: 'turbogen-04',
      name: 'Turbogenerator-TG-04',
      type: 'Physical Turbine / SIS',
      zone: 'L0',
      site: 'Plant 1 - Main Refining',
      ip: 'Hardwired I/O',
      vendor: 'GE Frame 7 Gas Turbine / SIS',
      criticality: 'Tier 1 (Crown Jewel)',
      riskScore: 98,
      status: 'Online',
      confidence: 99,
      role: 'crown-jewel',
      protocols: ['4-20mA Analog', 'Safety Loop'],
      description: 'Critical physical power generator. Disruption causes immediate refinery power trip.'
    },
    {
      id: 'vpn-conc-01',
      name: 'Vendor-VPN-Gateway',
      type: 'SSL-VPN Concentrator',
      zone: 'L4',
      site: 'Plant 2 - Chemical Synthesis',
      ip: '198.51.100.80',
      vendor: 'Fortinet FortiGate 200F',
      criticality: 'Tier 2',
      riskScore: 78,
      status: 'Online',
      confidence: 92,
      role: 'source',
      protocols: ['HTTPS', 'OpenVPN', 'RADIUS'],
      description: 'Third-party vendor maintenance gateway with MFA enforcement.'
    },
    {
      id: 'contractor-laptop-09',
      name: 'Contractor-Laptop-09',
      type: 'Vendor Remote Endpoint',
      zone: 'L4',
      site: 'Plant 2 - Chemical Synthesis',
      ip: '10.20.10.45',
      vendor: 'Lenovo ThinkPad (Vendor Managed)',
      criticality: 'Tier 3',
      riskScore: 84,
      status: 'Online',
      confidence: 88,
      role: 'pivot',
      protocols: ['RDP', 'HTTPS', 'SMB'],
      description: 'OEM Contractor terminal logged in over remote vendor support session.'
    },
    {
      id: 'dmz-historian-mirror',
      name: 'Historian-Mirror-DMZ',
      type: 'Replicated Historian',
      zone: 'L35',
      site: 'Plant 2 - Chemical Synthesis',
      ip: '10.20.50.22',
      vendor: 'OSIsoft PI Interface Server',
      criticality: 'Tier 2',
      riskScore: 76,
      status: 'Online',
      confidence: 94,
      role: 'pivot',
      protocols: ['PI-API', 'SQL', 'HTTPS'],
      description: 'DMZ read-only operational historian replica aggregating batch telemetry.'
    },
    {
      id: 'historian-01',
      name: 'Historian-Master-01',
      type: 'Enterprise Historian',
      zone: 'L3',
      site: 'Plant 2 - Chemical Synthesis',
      ip: '172.18.10.12',
      vendor: 'OSIsoft PI Server 2022',
      criticality: 'Tier 1',
      riskScore: 81,
      status: 'Online',
      confidence: 96,
      role: 'pivot',
      protocols: ['PI-API', 'SQL Server', 'OPC DA'],
      description: 'Central operational database storing 10+ years of plant telemetry and chemical recipes.'
    },
    {
      id: 'hmi-04',
      name: 'HMI-04',
      type: 'Human Machine Interface',
      zone: 'L2',
      site: 'Plant 2 - Chemical Synthesis',
      ip: '172.18.20.40',
      vendor: 'Schneider Electric Magelis iPC',
      criticality: 'Tier 1',
      riskScore: 85,
      status: 'Online',
      confidence: 91,
      role: 'target',
      protocols: ['Modbus TCP', 'VNC', 'EtherNet/IP'],
      description: 'Operator touchscreen terminal for Reactor Batch Feed 2.'
    },
    {
      id: 'chem-pump-02',
      name: 'Chemical-Feed-Pump-BR02',
      type: 'Dosing Actuator / Pump',
      zone: 'L0',
      site: 'Plant 2 - Chemical Synthesis',
      ip: 'Hardwired Relay',
      vendor: 'Milton Roy Dosing Pump',
      criticality: 'Tier 1 (Crown Jewel)',
      riskScore: 90,
      status: 'Online',
      confidence: 97,
      role: 'crown-jewel',
      protocols: ['Modbus RTU', 'Digital I/O'],
      description: 'Critical sulfuric acid neutralizer feed pump.'
    },
    {
      id: 'rogue-cellular-gw',
      name: 'Unauth-Cellular-Modem',
      type: 'Rogue Gateway (IoT)',
      zone: 'L4',
      site: 'Substation 3 - High Voltage',
      ip: '10.99.4.15',
      vendor: 'Sierra Wireless AirLink (Unknown)',
      criticality: 'Tier 2',
      riskScore: 91,
      status: 'Degraded',
      confidence: 62,
      role: 'source',
      protocols: ['MQTT', 'HTTPS', 'Cellular LTE'],
      description: 'Unmanaged 4G/LTE gateway discovered on Substation auxiliary switch. Incomplete passive telemetry.'
    },
    {
      id: 'maint-tablet-03',
      name: 'Maintenance-Tablet-03',
      type: 'Rugged Tablet',
      zone: 'L3',
      site: 'Substation 3 - High Voltage',
      ip: '10.99.30.22',
      vendor: 'Panasonic Toughbook (Android OT)',
      criticality: 'Tier 3',
      riskScore: 74,
      status: 'Degraded',
      confidence: 65,
      role: 'pivot',
      protocols: ['DNP3', 'SSH', 'HTTPS'],
      description: 'Mobile maintenance tablet with delayed sensor telemetry due to tap degradation.'
    },
    {
      id: 'rtu-14',
      name: 'RTU-14',
      type: 'Remote Terminal Unit',
      zone: 'L1',
      site: 'Substation 3 - High Voltage',
      ip: '192.168.99.14',
      vendor: 'SEL-3530 Real-Time Automation Controller',
      criticality: 'Tier 1',
      riskScore: 88,
      status: 'Degraded',
      confidence: 68,
      role: 'target',
      protocols: ['IEC 61850', 'DNP3', 'Modbus TCP'],
      description: 'Substation protective relay controller. Monitoring telemetry currently delayed.'
    },
    {
      id: 'feeder-breaker-02',
      name: 'Feeder-Breaker-FB02',
      type: '230kV Bus Breaker',
      zone: 'L0',
      site: 'Substation 3 - High Voltage',
      ip: 'GOOSE Bus Interface',
      vendor: 'ABB Pass M0S Switchgear',
      criticality: 'Tier 1 (Crown Jewel)',
      riskScore: 95,
      status: 'Degraded',
      confidence: 64,
      role: 'crown-jewel',
      protocols: ['IEC 61850 GOOSE'],
      description: 'High voltage main substation feeder breaker.'
    }
  ];

  const ATTACK_PATHS_DATA = [
    {
      id: 'path-01',
      name: 'Path 01: IT Phish → L35 Jump → SCADA → Turbine Trip',
      riskScore: 96,
      severity: 'critical',
      confidence: 95,
      target: 'Turbogenerator-TG-04 (L0 Crown Jewel)',
      source: 'Internet-Gateway-01 (L4 Enterprise)',
      crossZoneHops: 5,
      summary: 'Attackers leverage compromised RDP credentials on Engineering-PC-12 to cross the DMZ into SCADA-01, utilizing unauthenticated S7comm to push malicious firmware logic to PLC-07.',
      whyItMatters: 'Could cause emergency shutoff or mechanical overspeed damage to Turbogenerator Unit 4, halting 65% of Plant 1 refining throughput with estimated $1.2M daily downtime.',
      nodeIds: ['ext-gw-01', 'eng-pc-12', 'ot-jump-02', 'scada-01', 'plc-07', 'turbogen-04'],
      edges: [
        { from: 'ext-gw-01', to: 'eng-pc-12', protocol: 'HTTPS / Phishing', status: 'Exploited', confidence: 96, desc: 'Initial spearphishing macro dropped Cobalt Strike beacon on workstation.' },
        { from: 'eng-pc-12', to: 'ot-jump-02', protocol: 'RDP (3389)', status: 'Suspicious Lateral Move', confidence: 98, desc: 'Stolen domain admin credentials used to authenticate to DMZ bastion.' },
        { from: 'ot-jump-02', to: 'scada-01', protocol: 'SSH Tunnel / RDP', status: 'Cross-Zone Pinhole', confidence: 97, desc: 'Firewall-03 allows direct L35-to-L2 supervisory control session.' },
        { from: 'scada-01', to: 'plc-07', protocol: 'OPC UA / S7comm (102)', status: 'Unauthenticated Logic Write', confidence: 94, desc: 'Siemens S7-1500 accepts unauthenticated block download from SCADA IP.' },
        { from: 'plc-07', to: 'turbogen-04', protocol: 'Hardwired I/O Trip', status: 'Physical Actuation', confidence: 99, desc: 'Overriding RPM governor limits triggers immediate mechanical emergency trip.' }
      ]
    },
    {
      id: 'path-02',
      name: 'Path 02: Vendor VPN → DMZ Historian SQLi → HMI-04 Dosing',
      riskScore: 82,
      severity: 'high',
      confidence: 88,
      target: 'Chemical-Feed-Pump-BR02 (L0 Crown Jewel)',
      source: 'Vendor-VPN-Gateway (L4 Enterprise)',
      crossZoneHops: 4,
      summary: 'Compromised vendor credentials exploit an unpatched SQL injection in DMZ Historian Mirror, allowing lateral movement to Plant 2 master SCADA and chemical pump dosing controls.',
      whyItMatters: 'Uncontrolled acid dosing in chemical synthesis batch reactor could cause exothermic runaway or equipment corrosion.',
      nodeIds: ['vpn-conc-01', 'contractor-laptop-09', 'dmz-historian-mirror', 'historian-01', 'hmi-04', 'chem-pump-02'],
      edges: [
        { from: 'vpn-conc-01', to: 'contractor-laptop-09', protocol: 'SSL-VPN Session', status: 'Valid Credential', confidence: 94, desc: 'Legitimate OEM contractor session initiated outside regular change window.' },
        { from: 'contractor-laptop-09', to: 'dmz-historian-mirror', protocol: 'HTTPS (443)', status: 'SQL Injection Exploited', confidence: 91, desc: 'Exploitation of CVE-2023-34362 on DMZ web interface.' },
        { from: 'dmz-historian-mirror', to: 'historian-01', protocol: 'PI-API / SQL Mirror', status: 'Replication Bypass', confidence: 89, desc: 'Database trust relationship allows command execution on internal master historian.' },
        { from: 'historian-01', to: 'hmi-04', protocol: 'OPC DA (135)', status: 'Lateral RPC', confidence: 86, desc: 'DCOM/RPC traversal to supervisory touchscreen operator station.' },
        { from: 'hmi-04', to: 'chem-pump-02', protocol: 'Modbus TCP (502)', status: 'Unauthorized Setpoint', confidence: 95, desc: 'Direct coil writes modifying dosing flow rate bounds.' }
      ]
    },
    {
      id: 'path-03',
      name: 'Path 03: Rogue Modem → Maintenance Tablet → RTU-14 Breaker [DATA DEGRADED]',
      riskScore: 78,
      severity: 'high',
      confidence: 64,
      target: 'Feeder-Breaker-FB02 (L0 Crown Jewel)',
      source: 'Unauth-Cellular-Modem (L4 Shadow IoT)',
      crossZoneHops: 3,
      summary: 'Shadow cellular modem connected to high-voltage substation switch enables remote telemetry injection into unencrypted DNP3 RTU commands.',
      whyItMatters: 'Could trigger an unplanned 230kV bus disconnection, cutting grid power to the southern distribution feeder.',
      nodeIds: ['rogue-cellular-gw', 'maint-tablet-03', 'rtu-14', 'feeder-breaker-02'],
      edges: [
        { from: 'rogue-cellular-gw', to: 'maint-tablet-03', protocol: 'Wi-Fi / MQTT', status: 'Unencrypted Ingress', confidence: 62, desc: 'Passive ARP detection; NetFlow telemetry missing due to degraded sensor.' },
        { from: 'maint-tablet-03', to: 'rtu-14', protocol: 'DNP3 (20000)', status: 'Unauthenticated Command', confidence: 66, desc: 'DNP3 commands sent without Secure Authentication (IEC 62351-5).' },
        { from: 'rtu-14', to: 'feeder-breaker-02', protocol: 'IEC 61850 GOOSE', status: 'Trip Pulse', confidence: 68, desc: 'Trip command broadcast on substation station bus.' }
      ]
    }
  ];

  const FINDINGS_DATA = [
    {
      id: 'FND-1042',
      title: 'Siemens S7-1500 Unauthenticated Program Block Download',
      cve: 'CVE-2022-38465',
      cvss: 9.8,
      severity: 'critical',
      asset: 'PLC-07',
      zone: 'L1',
      mitre: 'T0814 - Denial of Control',
      status: 'Open',
      observedDate: '24 mins ago',
      evidence: 'Captured S7comm packet sequence 0x32 0x01 attempting function 0x28 (Download Block) from non-engineering IP 172.16.20.10.'
    },
    {
      id: 'FND-1039',
      title: 'Cross-Purdue RDP Session from Enterprise Workstation to DMZ',
      cve: 'CWE-284',
      cvss: 8.6,
      severity: 'critical',
      asset: 'OT-Jump-02',
      zone: 'L35',
      mitre: 'T0886 - Remote Services',
      status: 'Open',
      observedDate: '1 hour ago',
      evidence: 'Observed NTLMv2 logon for user "svc_otadmin" originating from untrusted subnet 10.14.20.112 at 03:14 UTC.'
    },
    {
      id: 'FND-1038',
      title: 'MOVEit Transfer SQL Injection Vulnerability in DMZ Mirror',
      cve: 'CVE-2023-34362',
      cvss: 9.8,
      severity: 'critical',
      asset: 'Historian-Mirror-DMZ',
      zone: 'L35',
      mitre: 'T0855 - Unauthorized Command Message',
      status: 'Open',
      observedDate: '3 hours ago',
      evidence: 'HTTP POST /guestaccess.aspx with anomalous payload headers indicative of active exploit attempt.'
    },
    {
      id: 'FND-1035',
      title: 'Cleartext Modbus TCP Read/Write Authorization Missing',
      cve: 'CWE-306',
      cvss: 7.5,
      severity: 'high',
      asset: 'HMI-04',
      zone: 'L2',
      mitre: 'T0855 - Unauthorized Command Message',
      status: 'Open',
      observedDate: '5 hours ago',
      evidence: 'Modbus function code 0x05 (Write Single Coil) sent to port 502 with no application-layer handshake.'
    },
    {
      id: 'FND-1031',
      title: 'Rogue Wireless Access Point Detected on OT Switchport',
      cve: 'CWE-300',
      cvss: 8.2,
      severity: 'high',
      asset: 'Unauth-Cellular-Modem',
      zone: 'L4',
      mitre: 'T0803 - Block Command Message',
      status: 'Investigating',
      observedDate: '7 hours ago',
      evidence: 'DHCP lease requested for unknown OUI Sierra Wireless on Substation 3 switch port 18.'
    },
    {
      id: 'FND-1028',
      title: 'Log4j Remote Code Execution in Legacy SCADA Gateway',
      cve: 'CVE-2021-44228',
      cvss: 9.8,
      severity: 'critical',
      asset: 'SCADA-01',
      zone: 'L2',
      mitre: 'T0866 - Exploitation of Remote Services',
      status: 'Mitigated',
      observedDate: '12 hours ago',
      evidence: 'JNDI lookup strings neutralized by WAF inspection rule.'
    }
  ];

  const SENSORS_DATA = [
    { id: 'sns-01', name: 'Plant 1 Core OT Collector', site: 'Plant 1', status: 'Online', coverage: 100, latency: '4ms', loss: '0.0%', lastPing: '8s ago' },
    { id: 'sns-02', name: 'Plant 1 DMZ Passive Tap', site: 'Plant 1', status: 'Online', coverage: 99, latency: '6ms', loss: '0.01%', lastPing: '12s ago' },
    { id: 'sns-03', name: 'Plant 2 Chemical Area Tap', site: 'Plant 2', status: 'Online', coverage: 98, latency: '9ms', loss: '0.04%', lastPing: '15s ago' },
    { id: 'sns-04', name: 'Plant 2 Historian SPAN Sensor', site: 'Plant 2', status: 'Online', coverage: 97, latency: '11ms', loss: '0.0%', lastPing: '22s ago' },
    { id: 'sns-05', name: 'Substation 3 Protective Tap', site: 'Substation 3', status: 'Degraded', coverage: 62, latency: '340ms', loss: '18.4%', lastPing: '42m ago' },
    { id: 'sns-06', name: 'Corporate Border NetFlow Mirror', site: 'Enterprise', status: 'Online', coverage: 100, latency: '3ms', loss: '0.0%', lastPing: '4s ago' }
  ];

  const EVENTS_TIMELINE = [
    { id: 'ev-1', time: '16:38:12', type: 'High-Risk Traversal', title: 'New hop validated on Attack Path 01', asset: 'PLC-07 (L1)', severity: 'critical', desc: 'S7comm-Plus handshake detected between SCADA-01 and PLC-07.' },
    { id: 'ev-2', time: '16:25:40', type: 'Purdue Pinhole Violation', title: 'Cross-zone RDP session flagged', asset: 'OT-Jump-02 (L35)', severity: 'critical', desc: 'Direct RDP connection from Corporate L4 bypassing MFA enforcement.' },
    { id: 'ev-3', time: '16:10:05', type: 'Telemetry Warning', title: 'Sensor packet drop rate exceeded 15%', asset: 'Substation 3 Protective Tap', severity: 'medium', desc: 'Bandwidth saturation on mirror port. Telemetry reliability degraded to 62%.' },
    { id: 'ev-4', time: '15:48:22', type: 'New Asset Discovered', title: 'Unmanaged device MAC 00:1E:52:8A:4F:91', asset: 'Unauth-Cellular-Modem', severity: 'high', desc: 'Cellular modem detected on Substation auxiliary switch.' },
    { id: 'ev-5', time: '15:12:30', type: 'Operator Action', title: 'Firewall-03 rule proposal generated', asset: 'Firewall-03', severity: 'low', desc: 'Automated ACL proposal to isolate compromised Engineering-PC-12.' },
    { id: 'ev-6', time: '14:30:18', type: 'Vulnerability Match', title: 'CVE-2023-34362 identified in DMZ mirror', asset: 'Historian-Mirror-DMZ', severity: 'critical', desc: 'Deep packet inspection matched exploit payload signature.' }
  ];

  const AppState = {
    activeView: 'dashboard',          // 'dashboard' | 'attack-paths' | 'assets' | 'findings' | 'design-system'
    dashboardState: 'high-risk',       // 'high-risk' | 'healthy' | 'degraded'
    filters: {
      site: 'all',
      zone: 'all',
      severity: 'all',
      criticality: 'all',
      timeRange: '24h',
      searchQuery: ''
    },
    graph: {
      selectedPathId: 'path-01',
      selectedNodeId: null,
      selectedEdgeId: null,
      viewMode: 'single',              // 'single' | 'multi'
      blastRadiusActive: false,
      confidenceThreshold: 0,
      zoom: 1.0,
      pan: { x: 40, y: 30 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      legendOpen: false,
      searchQuery: '',
      layoutMode: 'desktop'
    },
    investigationPanel: {
      isOpen: false,
      type: null,
      data: null,
      activeTab: 'summary'
    },
    toasts: []
  };

  function openMobileDrawer() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    const toggleBtn = document.getElementById('btn-mobile-menu');
    if (drawer && backdrop) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('open');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMobileDrawer() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    const toggleBtn = document.getElementById('btn-mobile-menu');
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('open');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function setDashboardState(state) {
    AppState.dashboardState = state;
    const banner = document.getElementById('degraded-banner');

    if (state === 'degraded') {
      banner.classList.remove('hidden');
      document.getElementById('degraded-text-slot').innerHTML =
        '<strong>CRITICAL TELEMETRY WARNING:</strong> Monitoring coverage reduced to <strong>72.4%</strong>. Sensor <em>Substation 3 Protective Tap</em> is degraded (Packet loss: 18.4%, heartbeat delayed 42m). <strong>18 assets have incomplete telemetry</strong>. Do not interpret absence of alerts as confirmed safety.';
    } else if (state === 'healthy') {
      banner.classList.add('hidden');
    } else {
      banner.classList.add('hidden');
    }

    const desktopSelect = document.getElementById('operational-state-select');
    const mobileSelect = document.getElementById('mobile-operational-state-select');
    if (desktopSelect && desktopSelect.value !== state) desktopSelect.value = state;
    if (mobileSelect && mobileSelect.value !== state) mobileSelect.value = state;

    renderDashboardMetrics();
    renderFindingsTable();
    renderZoneMatrix();
    renderSVGGraph();
    showToast('Platform Operational State Changed', `Switched to ${state.toUpperCase()} demonstration state.`, 'info');
  }

  function setActiveView(viewId) {
    AppState.activeView = viewId;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    closeMobileDrawer();

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active-view');
    });

    const targetSec = document.getElementById(`view-${viewId}`);
    if (targetSec) {
      targetSec.classList.add('active-view');
    }

    if (viewId === 'attack-paths') {
      setTimeout(() => {
        fitGraphToView();
      }, 50);
    } else if (viewId === 'assets') {
      renderAssetsTable();
    } else if (viewId === 'findings') {
      renderFullFindingsTable();
    }
  }

  function renderDashboardMetrics() {
    const isHealthy = AppState.dashboardState === 'healthy';
    const isDegraded = AppState.dashboardState === 'degraded';

    const postureVal = document.getElementById('kpi-posture-val');
    const postureSub = document.getElementById('kpi-posture-sub');
    const critFindingsVal = document.getElementById('kpi-crit-findings-val');
    const highFindingsVal = document.getElementById('kpi-high-findings-val');
    const expAssetsVal = document.getElementById('kpi-exp-assets-val');
    const attackPathsVal = document.getElementById('kpi-attack-paths-val');
    const coverageVal = document.getElementById('kpi-coverage-val');

    if (isHealthy) {
      postureVal.textContent = '96';
      postureVal.style.color = 'var(--color-healthy)';
      postureSub.innerHTML = '<span class="badge badge-healthy">Optimal</span> All Purdue boundaries intact';
      critFindingsVal.textContent = '0';
      highFindingsVal.textContent = '2';
      expAssetsVal.textContent = '0';
      attackPathsVal.textContent = '0';
      coverageVal.textContent = '99.4%';
    } else if (isDegraded) {
      postureVal.textContent = '64';
      postureVal.style.color = 'var(--color-degraded)';
      postureSub.innerHTML = '<span class="badge badge-degraded">Degraded Telemetry</span> Conclusions unconfirmed';
      critFindingsVal.textContent = '4*';
      highFindingsVal.textContent = '18*';
      expAssetsVal.textContent = '3 (+2 unknown)';
      attackPathsVal.textContent = '3 Active';
      coverageVal.textContent = '72.4%';
    } else {
      postureVal.textContent = '82';
      postureVal.style.color = 'var(--color-critical)';
      postureSub.innerHTML = '<span class="badge badge-critical">Immediate Action</span> Crown Jewel exposed';
      critFindingsVal.textContent = '4';
      highFindingsVal.textContent = '18';
      expAssetsVal.textContent = '3';
      attackPathsVal.textContent = '7';
      coverageVal.textContent = '94.0%';
    }

    const filteredAssets = getFilteredAssets();
    document.getElementById('stat-total-assets').textContent = isDegraded ? '2,450' : '2,450';
    document.getElementById('stat-active-assets').textContent = isHealthy ? '2,428' : '2,210';
    document.getElementById('stat-offline-assets').textContent = isHealthy ? '22' : '180';
    document.getElementById('stat-unidentified-assets').textContent = isHealthy ? '0' : (isDegraded ? '84' : '42');
    document.getElementById('stat-incomplete-assets').textContent = isDegraded ? '18 (High Risk)' : (isHealthy ? '0' : '18');

    const barCrit = document.getElementById('sev-bar-crit');
    const barHigh = document.getElementById('sev-bar-high');
    const barMed = document.getElementById('sev-bar-med');
    const barLow = document.getElementById('sev-bar-low');

    if (isHealthy) {
      barCrit.style.width = '0%';
      barHigh.style.width = '10%';
      barMed.style.width = '30%';
      barLow.style.width = '60%';
      document.getElementById('sev-count-crit').textContent = '0';
      document.getElementById('sev-count-high').textContent = '2';
      document.getElementById('sev-count-med').textContent = '6';
      document.getElementById('sev-count-low').textContent = '14';
    } else {
      barCrit.style.width = '25%';
      barHigh.style.width = '40%';
      barMed.style.width = '20%';
      barLow.style.width = '15%';
      document.getElementById('sev-count-crit').textContent = '4';
      document.getElementById('sev-count-high').textContent = '18';
      document.getElementById('sev-count-med').textContent = '29';
      document.getElementById('sev-count-low').textContent = '41';
    }
  }

  function getFilteredAssets() {
    return ASSETS_DATA.filter(asset => {
      if (AppState.filters.site !== 'all' && !asset.site.toLowerCase().includes(AppState.filters.site.toLowerCase())) {
        return false;
      }
      if (AppState.filters.zone !== 'all' && asset.zone !== AppState.filters.zone) {
        return false;
      }
      if (AppState.filters.searchQuery) {
        const q = AppState.filters.searchQuery.toLowerCase();
        return asset.name.toLowerCase().includes(q) || asset.ip.toLowerCase().includes(q) || asset.type.toLowerCase().includes(q);
      }
      return true;
    });
  }

  function renderFindingsTable() {
    const tbody = document.getElementById('dashboard-findings-tbody');
    if (!tbody) return;

    const findings = (AppState.dashboardState === 'healthy') ? [] : FINDINGS_DATA.slice(0, 4);

    if (findings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 24px; color: var(--text-dim);">No active high or critical findings match current baseline.</td></tr>`;
      return;
    }

    tbody.innerHTML = findings.map(f => `
      <tr data-finding-id="${f.id}" class="finding-row">
        <td><span class="badge badge-${f.severity}">${f.severity}</span></td>
        <td>
          <div style="font-weight:600; color:var(--text-primary);">${f.title}</div>
          <div style="font-size:10px; color:var(--text-dim); font-family:var(--font-mono);">${f.cve} • ${f.mitre}</div>
        </td>
        <td><span class="purdue-badge purdue-${f.zone.toLowerCase()}">${f.zone}</span> <span style="font-family:var(--font-mono); font-size:11px;">${f.asset}</span></td>
        <td style="font-size:11px; color:var(--text-dim); font-family:var(--font-mono);">${f.observedDate}</td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.finding-row').forEach(row => {
      row.addEventListener('click', () => {
        const fid = row.dataset.findingId;
        const finding = FINDINGS_DATA.find(f => f.id === fid);
        if (finding) {
          openInvestigationPanel('finding', finding);
        }
      });
    });
  }

  function renderZoneMatrix() {
    const container = document.getElementById('zone-matrix-container');
    if (!container) return;

    const zones = [
      { id: 'L4', name: 'Level 4: Enterprise Network', assets: 1420, exposed: 8, crossHops: '12 active' },
      { id: 'L35', name: 'Level 3.5: Industrial DMZ', assets: 45, exposed: 3, crossHops: '4 verified pinholes' },
      { id: 'L3', name: 'Level 3: Plant Operations', assets: 280, exposed: 2, crossHops: '2 unauth sessions' },
      { id: 'L2', name: 'Level 2: Supervisory Control', assets: 190, exposed: 1, crossHops: '1 OPC UA bypass' },
      { id: 'L1', name: 'Level 1: Process Control (PLCs)', assets: 360, exposed: 1, crossHops: '1 logic write' },
      { id: 'L0', name: 'Level 0: Physical Process & SIS', assets: 155, exposed: 0, crossHops: 'Physical loops' }
    ];

    container.innerHTML = zones.map(z => `
      <div class="zone-matrix-row" style="border-left-color: ${PURDUE_ZONES[z.id].color};">
        <div class="zone-matrix-name">
          <span class="purdue-badge purdue-${z.id.toLowerCase()}">${z.id}</span>
          <span>${z.name}</span>
        </div>
        <div class="zone-matrix-stats">
          <span>Assets: <strong>${z.assets}</strong></span>
          <span style="color: ${z.exposed > 0 ? 'var(--color-critical)' : 'var(--text-muted)'};">Exposures: <strong>${z.exposed}</strong></span>
          <span style="color: var(--text-dim);">${z.crossHops}</span>
        </div>
      </div>
    `).join('');
  }

  function renderTimeline() {
    const feed = document.getElementById('timeline-feed');
    if (!feed) return;

    feed.innerHTML = EVENTS_TIMELINE.map(ev => `
      <div class="timeline-entry">
        <div class="timeline-icon-box" style="border-color: ${ev.severity === 'critical' ? 'var(--color-critical)' : 'var(--border-medium)'};">
          <span style="color: ${ev.severity === 'critical' ? 'var(--color-critical)' : 'var(--color-orange-400)'};">⚡</span>
        </div>
        <div class="timeline-content-group">
          <div class="timeline-title-row">
            <span class="timeline-title">${ev.title}</span>
            <span class="timeline-time">${ev.time}</span>
          </div>
          <div class="timeline-desc">${ev.desc}</div>
          <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">
            Target: <strong style="color:var(--text-secondary); font-family:var(--font-mono);">${ev.asset}</strong>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderSensorsGrid() {
    const grid = document.getElementById('sensors-grid');
    if (!grid) return;

    grid.innerHTML = SENSORS_DATA.map(s => {
      const isDegraded = s.status === 'Degraded' || (AppState.dashboardState === 'degraded' && s.id === 'sns-05');
      const statusClass = isDegraded ? 'sensor-degraded' : 'sensor-online';
      const statusText = isDegraded ? 'Degraded (Loss 18.4%)' : 'Healthy (0% Drop)';

      return `
        <div class="sensor-box" style="${isDegraded ? 'border-color: var(--color-degraded-border);' : ''}">
          <div class="sensor-header">
            <span class="sensor-name">${s.name}</span>
            <span class="sensor-status-dot ${statusClass}" title="${statusText}"></span>
          </div>
          <div class="sensor-metrics-row">
            <span>Coverage: <strong>${isDegraded ? '62%' : s.coverage + '%'}</strong></span>
            <span>Latency: <strong>${isDegraded ? '340ms' : s.latency}</strong></span>
          </div>
          <div class="sensor-metrics-row">
            <span>Site: ${s.site}</span>
            <span>Ping: ${isDegraded ? '42m ago' : s.lastPing}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  const GRAPH_CONFIG = {
    canvasWidth: 1600,
    canvasHeight: 780,
    laneWidth: 240,
    lanePadding: 20,
    nodeWidth: 190,
    nodeHeight: 90
  };

  const ZONE_COLUMNS = {
    'L4': { x: 40, name: 'Level 4: Enterprise IT' },
    'L35': { x: 290, name: 'Level 3.5: Industrial DMZ' },
    'L3': { x: 540, name: 'Level 3: Operations' },
    'L2': { x: 790, name: 'Level 2: Supervisory SCADA' },
    'L1': { x: 1040, name: 'Level 1: Process Control (PLCs)' },
    'L0': { x: 1290, name: 'Level 0: Physical Process & SIS' }
  };

  const TABLET_ZONE_COLUMNS = {
    'L4': { x: 20, name: 'L4 Enterprise' },
    'L35': { x: 195, name: 'L3.5 DMZ' },
    'L3': { x: 370, name: 'L3 Operations' },
    'L2': { x: 545, name: 'L2 SCADA' },
    'L1': { x: 720, name: 'L1 Control' },
    'L0': { x: 895, name: 'L0 Physical' }
  };

  function getGraphLayoutMode() {
    const container = document.getElementById('graph-viewport-container');
    const width = container ? container.clientWidth : window.innerWidth;
    if (width < 768) return 'mobile';
    if (width <= 1100) return 'tablet';
    return 'desktop';
  }

  function calculateNodeCoordinates(path, layoutMode, cWidth) {
    const nodeCoords = {};

    if (layoutMode === 'mobile') {
      const nodeWidth = Math.min(310, Math.max(260, cWidth - 32));
      const nodeHeight = 98;
      const gap = 64;
      const startY = 24;
      const nodeX = Math.round((cWidth - nodeWidth) / 2);

      path.nodeIds.forEach((nodeId, idx) => {
        const asset = ASSETS_DATA.find(a => a.id === nodeId);
        if (!asset) return;
        const y = startY + idx * (nodeHeight + gap);
        nodeCoords[nodeId] = {
          x: nodeX,
          y: y,
          width: nodeWidth,
          height: nodeHeight,
          asset: asset,
          index: idx
        };
      });

    } else if (layoutMode === 'tablet') {
      const zoneUsage = { L4: 0, L35: 0, L3: 0, L2: 0, L1: 0, L0: 0 };
      const nodeWidth = 145;
      const nodeHeight = 84;

      path.nodeIds.forEach((nodeId, idx) => {
        const asset = ASSETS_DATA.find(a => a.id === nodeId);
        if (!asset) return;
        const zone = asset.zone;
        const colX = TABLET_ZONE_COLUMNS[zone] ? TABLET_ZONE_COLUMNS[zone].x : 20;
        const count = zoneUsage[zone] || 0;
        zoneUsage[zone] = count + 1;
        const y = 100 + (count * 125) + (zone === 'L1' || zone === 'L0' ? 35 : 0);
        nodeCoords[nodeId] = {
          x: colX + 8,
          y: y,
          width: nodeWidth,
          height: nodeHeight,
          asset: asset,
          index: idx
        };
      });

    } else {
      const zoneUsage = { L4: 0, L35: 0, L3: 0, L2: 0, L1: 0, L0: 0 };
      const nodeWidth = GRAPH_CONFIG.nodeWidth;
      const nodeHeight = GRAPH_CONFIG.nodeHeight;

      path.nodeIds.forEach((nodeId, idx) => {
        const asset = ASSETS_DATA.find(a => a.id === nodeId);
        if (!asset) return;
        const zone = asset.zone;
        const colX = ZONE_COLUMNS[zone] ? ZONE_COLUMNS[zone].x : 40;
        const count = zoneUsage[zone] || 0;
        zoneUsage[zone] = count + 1;
        const y = 140 + (count * 150) + (zone === 'L1' || zone === 'L0' ? 40 : 0);
        nodeCoords[nodeId] = {
          x: colX + 15,
          y: y,
          width: nodeWidth,
          height: nodeHeight,
          asset: asset,
          index: idx
        };
      });
    }

    return nodeCoords;
  }

  function renderSVGGraph() {
    const svg = document.getElementById('attack-path-svg');
    if (!svg) return;

    const container = document.getElementById('graph-viewport-container');
    const layoutMode = getGraphLayoutMode();
    AppState.graph.layoutMode = layoutMode;

    const currentPath = ATTACK_PATHS_DATA.find(p => p.id === AppState.graph.selectedPathId) || ATTACK_PATHS_DATA[0];

    let canvasWidth, canvasHeight;
    const cWidth = container ? container.clientWidth : window.innerWidth;

    if (layoutMode === 'mobile') {
      canvasWidth = Math.max(320, cWidth);
      const N = currentPath.nodeIds.length;
      canvasHeight = 24 + N * 98 + (N - 1) * 64 + 75; // Full vertical span
      svg.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
      svg.style.height = `${canvasHeight}px`;
      svg.style.minHeight = `${canvasHeight}px`;
      svg.style.width = '100%';
    } else if (layoutMode === 'tablet') {
      canvasWidth = 1100;
      canvasHeight = 650;
      svg.setAttribute('viewBox', '0 0 1100 650');
      svg.style.height = '100%';
      svg.style.minHeight = '100%';
      svg.style.width = '100%';
    } else {
      canvasWidth = 1600;
      canvasHeight = 780;
      svg.setAttribute('viewBox', '0 0 1600 780');
      svg.style.height = '100%';
      svg.style.minHeight = '100%';
      svg.style.width = '100%';
    }

    const nodeCoords = calculateNodeCoordinates(currentPath, layoutMode, canvasWidth);

    const threshold = AppState.graph.confidenceThreshold;

    let svgHtml = `
      <defs>

        <marker id="arrow-critical" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--color-critical)" />
        </marker>
        <marker id="arrow-high" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--color-orange-500)" />
        </marker>
        <marker id="arrow-degraded" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--color-degraded)" />
        </marker>
        <marker id="arrow-dimmed" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--border-prominent)" />
        </marker>
      </defs>
    `;

    const transformAttr = layoutMode === 'mobile'
      ? `transform="scale(1)"`
      : `transform="translate(${AppState.graph.pan.x}, ${AppState.graph.pan.y}) scale(${AppState.graph.zoom})"`;

    svgHtml += `
      <g id="graph-transform-group" ${transformAttr}>

        <g class="purdue-swimlanes">
    `;

    if (layoutMode === 'mobile') {
      const spineX = Math.round(canvasWidth / 2);
      svgHtml += `

        <line x1="${spineX}" y1="20" x2="${spineX}" y2="${canvasHeight - 40}" stroke="var(--border-subtle)" stroke-width="2" stroke-dasharray="4,4" />
      `;
    } else if (layoutMode === 'tablet') {
      Object.keys(TABLET_ZONE_COLUMNS).forEach(zKey => {
        const zone = TABLET_ZONE_COLUMNS[zKey];
        const pZone = PURDUE_ZONES[zKey];
        svgHtml += `
          <g class="swimlane" transform="translate(${zone.x}, 15)">
            <rect width="160" height="610" rx="6" fill="var(--color-surface)" fill-opacity="0.35" stroke="var(--border-subtle)" stroke-width="1" />
            <line x1="0" y1="36" x2="160" y2="36" stroke="var(--border-subtle)" stroke-width="1" />
            <text x="10" y="24" fill="${pZone.color}" font-size="10" font-weight="700" font-family="var(--font-mono)">${pZone.level}</text>
            <text x="58" y="24" fill="var(--text-dim)" font-size="9" font-weight="600">${zone.name}</text>
          </g>
        `;
      });
    } else {
      Object.keys(ZONE_COLUMNS).forEach(zKey => {
        const zone = ZONE_COLUMNS[zKey];
        const pZone = PURDUE_ZONES[zKey];
        svgHtml += `
          <g class="swimlane" transform="translate(${zone.x}, 20)">
            <rect width="220" height="720" rx="8" fill="var(--color-surface)" fill-opacity="0.35" stroke="var(--border-subtle)" stroke-width="1" />
            <line x1="0" y1="40" x2="220" y2="40" stroke="var(--border-subtle)" stroke-width="1" />
            <text x="14" y="26" fill="${pZone.color}" font-size="11" font-weight="700" font-family="var(--font-mono)">${pZone.level}</text>
            <text x="75" y="26" fill="var(--text-dim)" font-size="10" font-weight="600">${pZone.name}</text>
          </g>
        `;
      });
    }

    svgHtml += `</g>`;

    svgHtml += `<g class="graph-edges">`;

    currentPath.edges.forEach((edge, index) => {
      const fromNode = nodeCoords[edge.from];
      const toNode = nodeCoords[edge.to];
      if (!fromNode || !toNode) return;

      const isSelected = AppState.graph.selectedEdgeId === `${edge.from}-${edge.to}`;
      const isPathActive = true;
      const isDimmed = (AppState.graph.selectedNodeId && AppState.graph.selectedNodeId !== edge.from && AppState.graph.selectedNodeId !== edge.to);

      let pathData = '';
      let midX = 0, midY = 0;

      if (layoutMode === 'mobile') {
        const startX = fromNode.x + fromNode.width / 2;
        const startY = fromNode.y + fromNode.height;
        const endX = toNode.x + toNode.width / 2;
        const endY = toNode.y;
        pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
        midX = startX;
        midY = (startY + endY) / 2;
      } else {
        const startX = fromNode.x + fromNode.width;
        const startY = fromNode.y + (fromNode.height / 2);
        const endX = toNode.x;
        const endY = toNode.y + (toNode.height / 2);
        const dx = endX - startX;
        const c1x = startX + (dx * 0.45);
        const c1y = startY;
        const c2x = endX - (dx * 0.45);
        const c2y = endY;
        pathData = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
        midX = (startX + endX) / 2;
        midY = (startY + endY) / 2;
      }

      let strokeColor = (currentPath.severity === 'critical') ? 'var(--color-critical)' : 'var(--color-orange-500)';
      let markerId = (currentPath.severity === 'critical') ? 'url(#arrow-critical)' : 'url(#arrow-high)';

      if (edge.confidence < 70 || currentPath.id === 'path-03') {
        strokeColor = 'var(--color-degraded)';
        markerId = 'url(#arrow-degraded)';
      }
      if (isDimmed) {
        strokeColor = 'var(--border-prominent)';
        markerId = 'url(#arrow-dimmed)';
      }

      const badgeWidth = (layoutMode === 'mobile') ? 115 : (layoutMode === 'tablet' ? 82 : 90);
      const badgeHeight = 22;

      svgHtml += `
        <g class="graph-edge ${isDimmed ? 'dimmed' : ''} ${isPathActive && !isDimmed ? 'active-path' : ''}"
           data-edge-id="${edge.from}-${edge.to}" role="button" tabindex="0"
           aria-label="Attack edge ${edge.protocol}, status ${edge.status}, confidence ${edge.confidence}%">

          ${layoutMode === 'mobile' ? `
            <rect x="${midX - 35}" y="${fromNode.y + fromNode.height}" width="70" height="${Math.max(44, toNode.y - (fromNode.y + fromNode.height))}" fill="transparent" class="edge-hitbox" />
          ` : `
            <path d="${pathData}" fill="none" stroke="transparent" stroke-width="26" class="edge-hitbox" />
          `}

          <path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${isSelected ? 3.5 : 2}" marker-end="${markerId}" />

          <g transform="translate(${midX - badgeWidth / 2}, ${midY - badgeHeight / 2})" class="edge-badge-group">
            <rect width="${badgeWidth}" height="${badgeHeight}" rx="4" fill="var(--color-canvas)" stroke="${strokeColor}" stroke-width="1" />
            <text x="${badgeWidth / 2}" y="15" text-anchor="middle" fill="var(--text-primary)" font-size="${layoutMode === 'tablet' ? 8 : 9}" font-weight="700" font-family="var(--font-mono)">${truncate(edge.protocol, 16)}</text>
          </g>
        </g>
      `;
    });

    svgHtml += `</g>`;

    svgHtml += `<g class="graph-nodes">`;

    Object.keys(nodeCoords).forEach(nodeId => {
      const coord = nodeCoords[nodeId];
      const asset = coord.asset;
      const nWidth = coord.width;
      const nHeight = coord.height;
      const isSelected = AppState.graph.selectedNodeId === nodeId;
      const isDimmed = AppState.graph.selectedNodeId && AppState.graph.selectedNodeId !== nodeId && !isNodeConnected(nodeId, AppState.graph.selectedNodeId, currentPath);
      const isCrownJewel = asset.role === 'crown-jewel';
      const isSource = asset.role === 'source';
      const isTarget = asset.role === 'target';
      const isDegraded = asset.confidence < 70;

      const isSearchMatch = AppState.graph.searchQuery && (
        asset.name.toLowerCase().includes(AppState.graph.searchQuery) ||
        asset.ip.toLowerCase().includes(AppState.graph.searchQuery) ||
        asset.zone.toLowerCase().includes(AppState.graph.searchQuery) ||
        asset.type.toLowerCase().includes(AppState.graph.searchQuery)
      );

      let roleLabel = 'PIVOT';
      let roleIcon = '◆';
      let roleColor = 'var(--text-dim)';
      if (isSource) { roleLabel = 'SOURCE'; roleIcon = '▲'; roleColor = 'var(--color-high)'; }
      if (isTarget) { roleLabel = 'TARGET'; roleIcon = '⌖'; roleColor = 'var(--color-critical)'; }
      if (isCrownJewel) { roleLabel = 'CROWN JEWEL'; roleIcon = '👑'; roleColor = 'var(--color-critical)'; }

      let strokeColor = isSelected ? 'var(--color-orange-500)' : 'var(--border-medium)';
      if (isSearchMatch) strokeColor = 'var(--color-orange-400)';
      if (isCrownJewel) strokeColor = 'var(--color-critical)';
      if (isDegraded) strokeColor = 'var(--color-degraded)';

      const nameMaxLen = layoutMode === 'mobile' ? 22 : (layoutMode === 'tablet' ? 14 : 18);
      const typeMaxLen = layoutMode === 'mobile' ? 26 : (layoutMode === 'tablet' ? 16 : 22);

      svgHtml += `
        <g class="graph-node ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''} ${isSearchMatch ? 'search-highlight' : ''}"
           data-node-id="${asset.id}" transform="translate(${coord.x}, ${coord.y})"
           role="button" tabindex="0"
           aria-label="${asset.name}, ${roleLabel}, Purdue Zone ${asset.zone} (${PURDUE_ZONES[asset.zone].name}), Risk score ${asset.riskScore}, Status ${asset.status}">

          ${AppState.graph.blastRadiusActive && (isSelected || isCrownJewel || isTarget) ? `
            <circle cx="${nWidth / 2}" cy="${nHeight / 2}" r="${Math.max(nWidth, nHeight) / 2 + 10}" fill="none" stroke="var(--color-critical)" stroke-width="2" stroke-dasharray="4,4" class="blast-radius-pulse" />
          ` : ''}

          <rect class="node-card-bg" width="${nWidth}" height="${nHeight}" rx="8"
                fill="var(--color-surface-raised)" stroke="${strokeColor}" stroke-width="${isSelected ? 2.5 : (isCrownJewel ? 2 : 1.5)}"
                filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))" />

          <rect width="${nWidth}" height="24" rx="8" fill="var(--color-surface)" />
          <rect y="16" width="${nWidth}" height="8" fill="var(--color-surface)" />
          <line x1="0" y1="24" x2="${nWidth}" y2="24" stroke="var(--border-subtle)" stroke-width="1" />

          <circle cx="12" cy="12" r="4" fill="${isDegraded ? 'var(--color-degraded)' : (asset.status === 'Online' ? 'var(--color-healthy)' : 'var(--color-critical)')}" />

          <text x="22" y="16" fill="${roleColor}" font-size="9" font-weight="800" font-family="var(--font-mono)" letter-spacing="0.04em">${roleIcon} ${roleLabel}</text>

          <rect x="${nWidth - 78}" y="4" width="28" height="15" rx="3" fill="var(--color-canvas)" stroke="${PURDUE_ZONES[asset.zone].color}" stroke-width="1" />
          <text x="${nWidth - 64}" y="15" text-anchor="middle" fill="${PURDUE_ZONES[asset.zone].color}" font-size="8" font-weight="800" font-family="var(--font-mono)">${asset.zone}</text>

          <text x="${nWidth - 8}" y="15" text-anchor="end" fill="${isDegraded ? 'var(--color-degraded)' : 'var(--text-dim)'}" font-size="8" font-weight="600" font-family="var(--font-mono)">${asset.confidence}%</text>

          <text x="12" y="44" fill="var(--text-primary)" font-size="${layoutMode === 'tablet' ? 11 : 12}" font-weight="700" font-family="var(--font-mono)">${truncate(asset.name, nameMaxLen)}</text>

          <text x="12" y="59" fill="var(--text-muted)" font-size="${layoutMode === 'tablet' ? 9 : 10}">${truncate(asset.type, typeMaxLen)}</text>

          <line x1="8" y1="69" x2="${nWidth - 8}" y2="69" stroke="var(--border-subtle)" stroke-width="1" />
          <text x="12" y="83" fill="var(--text-dim)" font-size="9" font-family="var(--font-mono)">${asset.ip.split('/')[0].trim()}</text>

          <rect x="${nWidth - 46}" y="73" width="36" height="15" rx="3" fill="${asset.riskScore > 90 ? 'var(--color-critical-bg)' : 'var(--color-high-bg)'}" stroke="${asset.riskScore > 90 ? 'var(--color-critical-border)' : 'var(--color-high-border)'}" stroke-width="1" />
          <text x="${nWidth - 28}" y="84" text-anchor="middle" fill="${asset.riskScore > 90 ? 'var(--color-critical)' : 'var(--color-high)'}" font-size="8" font-weight="800" font-family="var(--font-mono)">R:${asset.riskScore}</text>
        </g>
      `;
    });

    svgHtml += `</g></g>`;

    svg.innerHTML = svgHtml;

    attachGraphInteractions();
  }

  function isNodeConnected(nodeA, nodeB, path) {
    return path.edges.some(e => (e.from === nodeA && e.to === nodeB) || (e.from === nodeB && e.to === nodeA));
  }

  function attachGraphInteractions() {
    const svg = document.getElementById('attack-path-svg');
    if (!svg) return;

    svg.querySelectorAll('.graph-node').forEach(nodeElem => {
      nodeElem.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = nodeElem.dataset.nodeId;
        selectGraphNode(nodeId);
      });

      nodeElem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          const nodeId = nodeElem.dataset.nodeId;
          selectGraphNode(nodeId);
        }
      });
    });

    svg.querySelectorAll('.graph-edge').forEach(edgeElem => {
      edgeElem.addEventListener('click', (e) => {
        e.stopPropagation();
        const edgeId = edgeElem.dataset.edgeId;
        selectGraphEdge(edgeId);
      });

      edgeElem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          const edgeId = edgeElem.dataset.edgeId;
          selectGraphEdge(edgeId);
        }
      });
    });

    svg.addEventListener('click', (e) => {
      if (e.target.tagName === 'svg' || e.target.classList.contains('swimlane') || e.target.tagName === 'rect') {
        AppState.graph.selectedNodeId = null;
        AppState.graph.selectedEdgeId = null;
        renderSVGGraph();
      }
    });

    const container = document.getElementById('graph-viewport-container');
    if (container) {
      container.onmousedown = (e) => {
        if (AppState.graph.layoutMode === 'mobile') return; // Mobile uses native vertical scroll
        if (e.target.closest('.graph-node') || e.target.closest('.graph-edge') || e.target.closest('.graph-floating-controls') || e.target.closest('.graph-legend-box') || e.target.closest('.graph-mobile-controls')) {
          return;
        }
        AppState.graph.isDragging = true;
        AppState.graph.dragStart = { x: e.clientX - AppState.graph.pan.x, y: e.clientY - AppState.graph.pan.y };
      };

      window.onmousemove = (e) => {
        if (!AppState.graph.isDragging || AppState.graph.layoutMode === 'mobile') return;
        AppState.graph.pan.x = e.clientX - AppState.graph.dragStart.x;
        AppState.graph.pan.y = e.clientY - AppState.graph.dragStart.y;
        updateGraphTransform();
      };

      window.onmouseup = () => {
        AppState.graph.isDragging = false;
      };

      container.onwheel = (e) => {
        if (AppState.graph.layoutMode === 'mobile') return; // Native vertical scroll on mobile
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
        zoomGraph(zoomDelta);
      };
    }
  }

  function updateGraphTransform() {
    const group = document.getElementById('graph-transform-group');
    if (group && AppState.graph.layoutMode !== 'mobile') {
      group.setAttribute('transform', `translate(${AppState.graph.pan.x}, ${AppState.graph.pan.y}) scale(${AppState.graph.zoom})`);
    }
  }

  function zoomGraph(delta) {
    if (AppState.graph.layoutMode === 'mobile') {
      showToast('Mobile Flow', 'Use vertical scroll to navigate the attack path flow.', 'info');
      return;
    }
    AppState.graph.zoom = Math.min(Math.max(AppState.graph.zoom + delta, 0.35), 2.4);
    updateGraphTransform();
    const zoomText = document.getElementById('zoom-percentage-text');
    if (zoomText) {
      zoomText.textContent = `${Math.round(AppState.graph.zoom * 100)}%`;
    }
  }

  function fitGraphToView() {
    const layoutMode = getGraphLayoutMode();
    const container = document.getElementById('graph-viewport-container');
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight : window.innerHeight;

    if (layoutMode === 'mobile') {
      AppState.graph.zoom = 1.0;
      AppState.graph.pan = { x: 0, y: 0 };
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (layoutMode === 'tablet') {
      const scale = Math.min(width / 1100, height / 650, 0.95);
      AppState.graph.zoom = Math.max(scale, 0.65);
      AppState.graph.pan = { x: Math.max(0, (width - 1100 * AppState.graph.zoom) / 2), y: 15 };
    } else {
      const scale = Math.min(width / 1600, height / 780, 0.95);
      AppState.graph.zoom = Math.max(scale, 0.75);
      AppState.graph.pan = { x: Math.max(0, (width - 1600 * AppState.graph.zoom) / 2), y: 20 };
    }

    updateGraphTransform();
    const zoomText = document.getElementById('zoom-percentage-text');
    if (zoomText) {
      zoomText.textContent = `${Math.round(AppState.graph.zoom * 100)}%`;
    }
    renderSVGGraph();
  }

  function searchGraphNodes(query) {
    const q = (query || '').trim().toLowerCase();
    AppState.graph.searchQuery = q;

    if (!q) {
      renderSVGGraph();
      return;
    }

    const currentPath = ATTACK_PATHS_DATA.find(p => p.id === AppState.graph.selectedPathId) || ATTACK_PATHS_DATA[0];
    const matchId = currentPath.nodeIds.find(id => {
      const a = ASSETS_DATA.find(asset => asset.id === id);
      return a && (
        a.name.toLowerCase().includes(q) ||
        a.ip.toLowerCase().includes(q) ||
        a.zone.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
      );
    });

    if (matchId) {
      selectGraphNode(matchId);
      const container = document.getElementById('graph-viewport-container');
      const nodeElem = document.querySelector(`[data-node-id="${matchId}"]`);
      if (nodeElem && container) {
        nodeElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      renderSVGGraph();
    }
  }

  function toggleLegend() {
    AppState.graph.legendOpen = !AppState.graph.legendOpen;
    const legendBox = document.getElementById('graph-legend-box');
    const toggleBtn = document.getElementById('btn-legend-toggle');
    const mobileBtn = document.getElementById('btn-mobile-legend');
    if (legendBox) legendBox.classList.toggle('open', AppState.graph.legendOpen);
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', AppState.graph.legendOpen ? 'true' : 'false');
    if (mobileBtn) mobileBtn.classList.toggle('active', AppState.graph.legendOpen);
  }

  function closeLegend() {
    AppState.graph.legendOpen = false;
    document.getElementById('graph-legend-box')?.classList.remove('open');
    document.getElementById('btn-legend-toggle')?.setAttribute('aria-expanded', 'false');
    document.getElementById('btn-mobile-legend')?.classList.remove('active');
  }

  function selectGraphNode(nodeId) {
    AppState.graph.selectedNodeId = nodeId;
    AppState.graph.selectedEdgeId = null;

    const asset = ASSETS_DATA.find(a => a.id === nodeId);
    if (asset) {
      openInvestigationPanel('node', asset);
    }
    renderSVGGraph();
  }

  function selectGraphEdge(edgeId) {
    AppState.graph.selectedEdgeId = edgeId;
    AppState.graph.selectedNodeId = null;

    const [fromId, toId] = edgeId.split('-');
    const currentPath = ATTACK_PATHS_DATA.find(p => p.id === AppState.graph.selectedPathId);
    const edge = currentPath ? currentPath.edges.find(e => e.from === fromId && e.to === toId) : null;

    if (edge) {
      const fromAsset = ASSETS_DATA.find(a => a.id === fromId);
      const toAsset = ASSETS_DATA.find(a => a.id === toId);
      openInvestigationPanel('edge', { edge, fromAsset, toAsset });
    }
    renderSVGGraph();
  }

  function openInvestigationPanel(type, data) {
    AppState.investigationPanel.isOpen = true;
    AppState.investigationPanel.type = type;
    AppState.investigationPanel.data = data;

    const panel = document.getElementById('investigation-panel');
    const backdrop = document.getElementById('investigation-panel-backdrop');
    if (panel) panel.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    renderInvestigationPanelContent();
  }

  function closeInvestigationPanel() {
    AppState.investigationPanel.isOpen = false;
    const panel = document.getElementById('investigation-panel');
    const backdrop = document.getElementById('investigation-panel-backdrop');
    if (panel) panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    AppState.graph.selectedNodeId = null;
    AppState.graph.selectedEdgeId = null;
    renderSVGGraph();
  }

  function renderInvestigationPanelContent() {
    const { type, data } = AppState.investigationPanel;
    const typeBadge = document.getElementById('panel-type-badge');
    const assetName = document.getElementById('panel-asset-name');
    const bodyScroll = document.getElementById('panel-body-scroll');

    if (!bodyScroll) return;

    if (type === 'node') {
      const asset = data;
      typeBadge.textContent = `${asset.role.toUpperCase()} • ${asset.zone} (${PURDUE_ZONES[asset.zone].name})`;
      typeBadge.className = `panel-type-badge purdue-${asset.zone.toLowerCase()}`;
      assetName.textContent = asset.name;

      bodyScroll.innerHTML = `

        <div class="panel-section">
          <div class="asset-stats-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="asset-stat-box">
              <span class="asset-stat-label">Risk Rating</span>
              <span class="asset-stat-val" style="color:${asset.riskScore > 90 ? 'var(--color-critical)' : 'var(--color-high)'};">R:${asset.riskScore} / 100</span>
              <span class="asset-stat-sub">EPSS Percentile: 94th</span>
            </div>
            <div class="asset-stat-box">
              <span class="asset-stat-label">Telemetry Confidence</span>
              <span class="asset-stat-val" style="color:${asset.confidence < 70 ? 'var(--color-degraded)' : 'var(--color-healthy)'};">${asset.confidence}%</span>
              <span class="asset-stat-sub">${asset.confidence < 70 ? 'Incomplete Telemetry' : 'Verified Baseline'}</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-section-title">
            <svg class="icon icon-sm"><use href="#icon-alert-triangle"></use></svg>
            Why It Matters
          </div>
          <div class="why-it-matters-box">
            <strong>Operational Significance:</strong> ${asset.description}
            <div style="margin-top: 6px; font-size: 11px; color: var(--text-secondary);">
              Compromise of this node enables cross-zone traversal into <strong>${asset.zone === 'L1' ? 'physical safety actuation loops' : 'supervisory control systems'}</strong>, directly threatening operational continuity.
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-section-title">
            <svg class="icon icon-sm"><use href="#icon-terminal"></use></svg>
            Observed Evidence & Telemetry
          </div>
          <div class="evidence-list">
            <div class="evidence-item">
              <div class="evidence-header">
                <span class="evidence-type">Network Exposure</span>
                <span class="badge badge-high">High Risk</span>
              </div>
              <div class="evidence-detail">IP Address: <code>${asset.ip}</code> | Vendor: ${asset.vendor}</div>
            </div>
            <div class="evidence-item">
              <div class="evidence-header">
                <span class="evidence-type">Active Industrial Protocols</span>
                <span class="badge badge-low">Observed</span>
              </div>
              <div class="evidence-detail">${asset.protocols.map(p => `<span class="badge badge-low" style="margin-right:4px;">${p}</span>`).join('')}</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-section-title">
            <svg class="icon icon-sm"><use href="#icon-shield-alert"></use></svg>
            Known Weaknesses & CVEs
          </div>
          <div class="cve-list">
            <div class="cve-badge-item">
              <div>
                <span class="cve-id">CVE-2022-38465</span>
                <div style="font-size:11px; color:var(--text-muted);">Siemens S7-1500 Missing Cryptographic Verification</div>
              </div>
              <span class="badge badge-critical">CVSS 9.8</span>
            </div>
            <div class="cve-badge-item">
              <div>
                <span class="cve-id">CWE-306</span>
                <div style="font-size:11px; color:var(--text-muted);">Unauthenticated Logic Injection</div>
              </div>
              <span class="badge badge-high">CVSS 8.4</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-section-title">
            <svg class="icon icon-sm"><use href="#icon-crosshair"></use></svg>
            Reachable Assets & Blast Radius
          </div>
          <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;">
            Upstream Entry Points: <strong>1 (External Gateway)</strong><br>
            Downstream Impact: <strong>Turbogenerator TG-04 (Turbine Emergency Trip)</strong>
          </div>
        </div>
      `;

      setupActionButtons(asset.name);

    } else if (type === 'edge') {
      const { edge, fromAsset, toAsset } = data;
      typeBadge.textContent = `RELATIONSHIP • ${edge.protocol}`;
      typeBadge.className = 'panel-type-badge badge-high';
      assetName.textContent = `${fromAsset.name} ➔ ${toAsset.name}`;

      bodyScroll.innerHTML = `
        <div class="panel-section">
          <div class="why-it-matters-box">
            <strong>Traversal Mechanics:</strong> ${edge.desc}
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-section-title">Flow Telemetry</div>
          <div class="evidence-list">
            <div class="evidence-item">
              <div class="evidence-header">
                <span class="evidence-type">Protocol: ${edge.protocol}</span>
                <span class="badge badge-${edge.status === 'Exploited' ? 'critical' : 'high'}">${edge.status}</span>
              </div>
              <div class="evidence-detail">
                Source: <code>${fromAsset.ip}</code> (${fromAsset.zone})<br>
                Destination: <code>${toAsset.ip}</code> (${toAsset.zone})<br>
                Confidence: <strong>${edge.confidence}%</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-section-title">Cross-Zone Boundary Impact</div>
          <div style="font-size:12px; color:var(--text-secondary);">
            This connection crosses the <strong>${fromAsset.zone} to ${toAsset.zone}</strong> boundary. In accordance with ISA/IEC 62443 zone segmentation guidelines, inter-zone communication must terminate on an application-layer proxy.
          </div>
        </div>
      `;

      setupActionButtons(`Edge ${edge.protocol}`);

    } else if (type === 'finding') {
      const finding = data;
      typeBadge.textContent = `FINDING • ${finding.id}`;
      typeBadge.className = `panel-type-badge badge-${finding.severity}`;
      assetName.textContent = finding.title;

      bodyScroll.innerHTML = `
        <div class="panel-section">
          <div class="asset-stats-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="asset-stat-box">
              <span class="asset-stat-label">Severity</span>
              <span class="asset-stat-val" style="color:var(--color-${finding.severity});">${finding.severity.toUpperCase()}</span>
              <span class="asset-stat-sub">CVSS: ${finding.cvss}</span>
            </div>
            <div class="asset-stat-box">
              <span class="asset-stat-label">Affected Asset</span>
              <span class="asset-stat-val" style="font-size:14px;">${finding.asset}</span>
              <span class="asset-stat-sub">Zone: ${finding.zone}</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-section-title">MITRE ATT&CK for ICS</div>
          <div class="why-it-matters-box">
            <strong>Technique:</strong> ${finding.mitre}<br>
            <strong>Evidence Captured:</strong> ${finding.evidence}
          </div>
        </div>
      `;

      setupActionButtons(finding.title);
    }
  }

  function setupActionButtons(targetContext) {
    const btnIsolate = document.getElementById('btn-action-isolate');
    const btnAck = document.getElementById('btn-action-ack');
    const btnAssign = document.getElementById('btn-action-assign');
    const btnFirewall = document.getElementById('btn-action-firewall');

    if (btnIsolate) {
      btnIsolate.onclick = () => {
        showConfirmationModal('Isolate Asset from OT Network',
          `Are you sure you want to trigger emergency logical isolation for <strong>${targetContext}</strong>? This will instruct the upstream Industrial Managed Switch to block all non-safety traffic.`,
          () => {
            showToast('Asset Isolated', `Asset ${targetContext} placed in quarantine VLAN.`, 'danger');
          }
        );
      };
    }

    if (btnAck) {
      btnAck.onclick = () => {
        showToast('Risk Acknowledged', `Risk posture updated for ${targetContext}. Logged to audit log.`, 'warning');
      };
    }

    if (btnAssign) {
      btnAssign.onclick = () => {
        showToast('Assigned to OT SOC', `Ticket #OT-INC-8821 dispatched to Tier 2 Incident Response.`, 'info');
      };
    }

    if (btnFirewall) {
      btnFirewall.onclick = () => {
        showToast('Purdue ACL Generated', `Strict drop rule proposal pushed to Firewall-03 configuration queue.`, 'success');
      };
    }
  }

  function renderAssetsTable() {
    const tbody = document.getElementById('assets-table-tbody');
    if (!tbody) return;

    const filtered = getFilteredAssets();

    tbody.innerHTML = filtered.map(a => `
      <tr data-asset-id="${a.id}" class="asset-table-row">
        <td>
          <div style="font-weight:700; color:var(--text-primary); font-family:var(--font-mono);">${a.name}</div>
          <div style="font-size:11px; color:var(--text-dim);">${a.vendor}</div>
        </td>
        <td><span class="purdue-badge purdue-${a.zone.toLowerCase()}">${a.zone} (${PURDUE_ZONES[a.zone].name})</span></td>
        <td><span style="font-family:var(--font-mono); font-size:12px;">${a.ip}</span></td>
        <td><span class="badge ${a.criticality.includes('Crown Jewel') ? 'badge-critical' : 'badge-high'}">${a.criticality}</span></td>
        <td><strong style="color:${a.riskScore > 90 ? 'var(--color-critical)' : 'var(--color-high)'}; font-family:var(--font-mono);">R:${a.riskScore}</strong></td>
        <td>
          <span class="badge ${a.confidence < 70 ? 'badge-degraded' : 'badge-healthy'}">
            ${a.confidence}% ${a.confidence < 70 ? '• Incomplete' : '• Confirmed'}
          </span>
        </td>
        <td>
          <button class="btn-secondary btn-investigate-asset" data-asset-id="${a.id}" style="padding:4px 8px; font-size:11px;">
            Investigate
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-investigate-asset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const aid = btn.dataset.assetId;
        setActiveView('attack-paths');
        selectGraphNode(aid);
      });
    });
  }

  function renderFullFindingsTable() {
    const tbody = document.getElementById('findings-full-tbody');
    if (!tbody) return;

    tbody.innerHTML = FINDINGS_DATA.map(f => `
      <tr>
        <td><span class="badge badge-${f.severity}">${f.severity}</span></td>
        <td>
          <div style="font-weight:700; color:var(--text-primary);">${f.title}</div>
          <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${f.cve} • CVSS ${f.cvss}</div>
        </td>
        <td><span style="font-family:var(--font-mono);">${f.asset}</span></td>
        <td><span class="purdue-badge purdue-${f.zone.toLowerCase()}">${f.zone}</span></td>
        <td style="font-size:11px; color:var(--text-secondary);">${f.mitre}</td>
        <td><span class="badge badge-high">${f.status}</span></td>
      </tr>
    `).join('');
  }

  function showConfirmationModal(title, messageHtml, onConfirm) {
    const overlay = document.getElementById('confirmation-modal-overlay');
    const modalTitle = document.getElementById('confirm-modal-title');
    const modalBody = document.getElementById('confirm-modal-body');
    const btnConfirm = document.getElementById('confirm-modal-btn-confirm');
    const btnCancel = document.getElementById('confirm-modal-btn-cancel');

    if (!overlay) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = messageHtml;
    overlay.classList.add('open');

    btnConfirm.onclick = () => {
      overlay.classList.remove('open');
      if (typeof onConfirm === 'function') onConfirm();
    };

    btnCancel.onclick = () => {
      overlay.classList.remove('open');
    };
  }

  function showDesignRationaleModal() {
    const overlay = document.getElementById('rationale-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
    }
  }

  function closeDesignRationaleModal() {
    const overlay = document.getElementById('rationale-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
    }
  }

  function showToast(title, description, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type === 'danger' ? 'danger' : (type === 'warning' ? 'warning' : 'success')}`;
    toast.innerHTML = `
      <div class="toast-message-group">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${description}</div>
      </div>
      <button class="btn-icon" style="width:20px; height:20px; border:none; background:transparent;" aria-label="Dismiss">
        <svg class="icon icon-sm"><use href="#icon-close"></use></svg>
      </button>
    `;

    toast.querySelector('button').onclick = () => toast.remove();
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 4500);
  }

  function setupEventListeners() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveView(btn.dataset.view);
      });
    });

    const stateSelect = document.getElementById('operational-state-select');
    if (stateSelect) {
      stateSelect.addEventListener('change', (e) => {
        setDashboardState(e.target.value);
      });
    }

    ['filter-site', 'filter-zone', 'filter-severity', 'filter-criticality', 'filter-time'].forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.addEventListener('change', () => {
          AppState.filters.site = document.getElementById('filter-site').value;
          AppState.filters.zone = document.getElementById('filter-zone').value;
          AppState.filters.severity = document.getElementById('filter-severity').value;
          AppState.filters.criticality = document.getElementById('filter-criticality').value;
          renderDashboardMetrics();
          renderFindingsTable();
          renderAssetsTable();
        });
      }
    });

    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        AppState.filters.searchQuery = e.target.value.trim();
        renderDashboardMetrics();
        renderAssetsTable();
      });
    }

    const btnResetFilters = document.getElementById('btn-reset-filters');
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        document.getElementById('filter-site').value = 'all';
        document.getElementById('filter-zone').value = 'all';
        document.getElementById('filter-severity').value = 'all';
        document.getElementById('filter-criticality').value = 'all';
        document.getElementById('global-search-input').value = '';
        AppState.filters = { site: 'all', zone: 'all', severity: 'all', criticality: 'all', timeRange: '24h', searchQuery: '' };
        renderDashboardMetrics();
        renderFindingsTable();
        renderAssetsTable();
        showToast('Filters Reset', 'All global criteria restored to default.', 'info');
      });
    }

    const btnInvestigatePath = document.getElementById('btn-investigate-path-cta');
    if (btnInvestigatePath) {
      btnInvestigatePath.addEventListener('click', () => {
        setActiveView('attack-paths');
      });
    }

    const pathSelector = document.getElementById('graph-path-selector');
    if (pathSelector) {
      pathSelector.addEventListener('change', (e) => {
        AppState.graph.selectedPathId = e.target.value;
        AppState.graph.selectedNodeId = null;
        AppState.graph.selectedEdgeId = null;
        renderSVGGraph();
      });
    }

    const btnModeSingle = document.getElementById('btn-mode-single');
    const btnModeMulti = document.getElementById('btn-mode-multi');
    if (btnModeSingle && btnModeMulti) {
      btnModeSingle.addEventListener('click', () => {
        btnModeSingle.classList.add('active');
        btnModeMulti.classList.remove('active');
        AppState.graph.viewMode = 'single';
        renderSVGGraph();
      });
    }

    const nodeSearchInput = document.getElementById('graph-node-search-input');
    if (nodeSearchInput) {
      nodeSearchInput.addEventListener('input', (e) => {
        searchGraphNodes(e.target.value);
      });
    }

    document.getElementById('btn-legend-toggle')?.addEventListener('click', toggleLegend);
    document.getElementById('btn-close-legend')?.addEventListener('click', closeLegend);
    document.getElementById('btn-mobile-legend')?.addEventListener('click', toggleLegend);

    document.getElementById('btn-mobile-zoom-in')?.addEventListener('click', () => zoomGraph(0.15));
    document.getElementById('btn-mobile-zoom-out')?.addEventListener('click', () => zoomGraph(-0.15));
    document.getElementById('btn-mobile-fit-view')?.addEventListener('click', fitGraphToView);
    document.getElementById('btn-mobile-blast')?.addEventListener('click', () => {
      document.getElementById('btn-blast-radius-toggle')?.click();
      const isAct = AppState.graph.blastRadiusActive;
      document.getElementById('btn-mobile-blast')?.classList.toggle('active', isAct);
    });

    const btnBlastRadius = document.getElementById('btn-blast-radius-toggle');
    if (btnBlastRadius) {
      btnBlastRadius.addEventListener('click', () => {
        AppState.graph.blastRadiusActive = !AppState.graph.blastRadiusActive;
        btnBlastRadius.classList.toggle('active', AppState.graph.blastRadiusActive);
        document.getElementById('btn-mobile-blast')?.classList.toggle('active', AppState.graph.blastRadiusActive);
        renderSVGGraph();
        showToast(
          AppState.graph.blastRadiusActive ? 'Blast Radius View Active' : 'Blast Radius View Deactivated',
          AppState.graph.blastRadiusActive ? 'Highlighting upstream ingress paths and downstream physical actuators.' : 'Restored standard graph perspective.',
          'info'
        );
      });
    }

    const confidenceSlider = document.getElementById('graph-confidence-slider');
    const confidenceValLabel = document.getElementById('confidence-val-label');
    if (confidenceSlider) {
      confidenceSlider.addEventListener('input', (e) => {
        AppState.graph.confidenceThreshold = parseInt(e.target.value, 10);
        if (confidenceValLabel) {
          confidenceValLabel.textContent = `≥ ${e.target.value}%`;
        }
        renderSVGGraph();
      });
    }

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => zoomGraph(0.15));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => zoomGraph(-0.15));
    document.getElementById('btn-fit-view')?.addEventListener('click', fitGraphToView);
    document.getElementById('btn-reset-graph')?.addEventListener('click', () => {
      fitGraphToView();
      AppState.graph.selectedNodeId = null;
      AppState.graph.selectedEdgeId = null;
      renderSVGGraph();
    });

    document.getElementById('panel-close-btn')?.addEventListener('click', closeInvestigationPanel);
    document.getElementById('panel-return-btn')?.addEventListener('click', closeInvestigationPanel);
    document.getElementById('investigation-panel-backdrop')?.addEventListener('click', closeInvestigationPanel);

    document.getElementById('btn-mobile-menu')?.addEventListener('click', openMobileDrawer);
    document.getElementById('btn-close-mobile-drawer')?.addEventListener('click', closeMobileDrawer);
    document.getElementById('mobile-drawer-backdrop')?.addEventListener('click', closeMobileDrawer);

    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveView(btn.dataset.view);
      });
    });

    const mobileStateSelect = document.getElementById('mobile-operational-state-select');
    if (mobileStateSelect) {
      mobileStateSelect.addEventListener('change', (e) => {
        setDashboardState(e.target.value);
      });
    }

    document.getElementById('btn-mobile-rationale')?.addEventListener('click', () => {
      closeMobileDrawer();
      showDesignRationaleModal();
    });

    document.getElementById('btn-open-rationale')?.addEventListener('click', showDesignRationaleModal);
    document.getElementById('btn-close-rationale')?.addEventListener('click', closeDesignRationaleModal);
    document.getElementById('rationale-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'rationale-modal-overlay') closeDesignRationaleModal();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const currentMode = getGraphLayoutMode();
        if (currentMode !== AppState.graph.layoutMode) {
          fitGraphToView();
        } else if (AppState.activeView === 'attack-paths' && !AppState.investigationPanel.isOpen) {
          renderSVGGraph();
        }
      }, 100);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileDrawer();
        closeInvestigationPanel();
        closeDesignRationaleModal();
        closeLegend();
        document.getElementById('confirmation-modal-overlay')?.classList.remove('open');
      }
    });
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max - 1) + '…' : str;
  }

  function init() {
    renderDashboardMetrics();
    renderFindingsTable();
    renderZoneMatrix();
    renderTimeline();
    renderSensorsGrid();
    setupEventListeners();
    renderSVGGraph();

    setTimeout(() => {
      showToast('AEGIS OT Operational', 'Industrial Attack Path Platform initialized. Live monitoring active.', 'success');
    }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
