import { getAllDecks, getMeta, newCard, newId, saveCards, saveDeck, setMeta } from "./db";
import type { Deck, DeckColorId } from "./types";

const SEED_VERSION = "2";

type SeedDeck = {
  title: string;
  description: string;
  color: DeckColorId;
  cards: [string, string][];
};

const SEED: SeedDeck[] = [
  {
    title: "Networking Fundamentals",
    description:
      "OSI, TCP/IP, and common devices — the foundation for Nitec / Higher Nitec Infocomm and Cisco labs at ITE.",
    color: "terracotta",
    cards: [
      [
        "What does OSI stand for, and how many layers does it have?",
        "Open Systems Interconnection. It has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
      ],
      [
        "Which OSI layer does a typical Ethernet switch operate at?",
        "Layer 2 (Data Link). It forwards frames using MAC addresses. Layer 3 switches can also route at the Network layer.",
      ],
      [
        "What is the main difference between a hub, a switch, and a router?",
        "A hub repeats bits to all ports (Layer 1). A switch forwards frames to the correct MAC (Layer 2). A router forwards packets between networks using IP (Layer 3).",
      ],
      [
        "TCP vs UDP — when would you use each?",
        "TCP is connection-oriented and reliable (web, email, file transfer). UDP is connectionless and faster with no delivery guarantee (DNS queries, VoIP, video streams).",
      ],
      [
        "What is a MAC address?",
        "A 48-bit hardware address burned into a NIC, shown as 12 hex digits (e.g. 00:1A:2B:3C:4D:5E). Switches use MAC tables to forward frames.",
      ],
      [
        "What is a default gateway?",
        "The router IP on your local subnet that devices use to reach other networks — for example the lab router at 192.168.10.1.",
      ],
      [
        "What does the ping command test?",
        "Layer 3 reachability using ICMP Echo Request/Reply. A successful ping means the destination is up and a path exists (unless ICMP is blocked).",
      ],
      [
        "Cat5e vs Cat6 — which should you use in an ITE lab patch panel?",
        "Both support Gigabit Ethernet. Cat6 has tighter twists and better crosstalk performance, so it is preferred for new 1 Gbps / 10 Gbps (short) runs. Keep pairs untwisted as little as possible at the punch-down.",
      ],
      [
        "Give a Singapore example of LAN vs WAN.",
        "LAN: PCs and APs inside one ITE campus building. WAN: the link from campus to the polytechnic / HQ or to an ISP (Singtel, StarHub, M1) across the island.",
      ],
      [
        "What is DHCP used for?",
        "Automatically assigns IP address, subnet mask, default gateway, and DNS servers so lab PCs do not need manual IP configuration.",
      ],
      [
        "What is DNS used for?",
        "Resolves hostnames (e.g. cisco.com) to IP addresses so users do not have to remember numbers.",
      ],
      [
        "What is a PDU at Layer 2 vs Layer 3?",
        "Layer 2 PDU is a frame (header includes MAC addresses). Layer 3 PDU is a packet (header includes IP addresses).",
      ],
    ],
  },
  {
    title: "IPv4 Addressing & Subnetting",
    description:
      "Private ranges, CIDR, and host counts you will calculate in Packet Tracer and Cisco exam-style questions.",
    color: "sage",
    cards: [
      [
        "List the three IPv4 private address ranges (RFC 1918).",
        "10.0.0.0/8, 172.16.0.0/12 (172.16.0.0–172.31.255.255), and 192.168.0.0/16. These are not routed on the public Internet.",
      ],
      [
        "What does a /24 subnet mask look like in dotted decimal, and how many usable hosts does it have?",
        "255.255.255.0. Usable hosts = 2^8 − 2 = 254 (exclude network and broadcast).",
      ],
      [
        "How many usable hosts are in a /26 network?",
        "2^6 − 2 = 62 usable hosts. Subnet mask is 255.255.255.192.",
      ],
      [
        "What is an APIPA address and when do you see it?",
        "169.254.0.0/16. Windows assigns it when DHCP fails. In an ITE lab this usually means the DHCP server, cable, or port is down.",
      ],
      [
        "What is the directed broadcast address of 192.168.10.0/24?",
        "192.168.10.255. The network address is 192.168.10.0.",
      ],
      [
        "What is 127.0.0.1 used for?",
        "IPv4 loopback — tests the local TCP/IP stack without using the NIC. ping 127.0.0.1 should always work if TCP/IP is healthy.",
      ],
      [
        "A lab PC is 192.168.20.45/24. Can it talk directly to 192.168.21.10 without a router?",
        "No. Different /24 networks. Traffic must go via a default gateway (Layer 3 device).",
      ],
      [
        "What is CIDR?",
        "Classless Inter-Domain Routing. Prefix length (e.g. /27) replaces old Class A/B/C boundaries so you can subnet efficiently.",
      ],
      [
        "Identify network, host, and broadcast for 10.12.4.70/28.",
        "Block size 16. Network 10.12.4.64, usable 10.12.4.65–78, broadcast 10.12.4.79.",
      ],
      [
        "Why do ITE labs often use 192.168.x.0/24?",
        "It is a familiar private range, easy to subnet, and matches home ONTs (Singtel/StarHub/M1) so students can relate lab addressing to HDB fibre routers.",
      ],
      [
        "What is a wildcard mask for 255.255.255.0?",
        "0.0.0.255. Wildcard = inverse of the subnet mask; used in Cisco ACLs and some OSPF network statements.",
      ],
      [
        "Class A, B, and C default masks?",
        "Class A: 255.0.0.0 (/8). Class B: 255.255.0.0 (/16). Class C: 255.255.255.0 (/24). Modern designs use CIDR, not classes.",
      ],
    ],
  },
  {
    title: "Cisco IOS Command Basics",
    description:
      "User EXEC, privileged EXEC, and common show/config commands used on ITE Cisco 2960/1941-style labs and Packet Tracer.",
    color: "clay",
    cards: [
      [
        "What is the difference between user EXEC and privileged EXEC?",
        "User EXEC (Router>) has limited show/ping. Privileged EXEC (Router#) after enable has full show, debug, and access to configure terminal.",
      ],
      [
        "Command to enter global configuration mode?",
        "configure terminal (or conf t) from privileged EXEC. Prompt becomes Router(config)#.",
      ],
      [
        "What does show ip interface brief display?",
        "Each interface, its IP, OK/YES status, method, and up/down (Status and Protocol). Fastest way to check IPs and down ports in a lab.",
      ],
      [
        "How do you save the running configuration so it survives a reload?",
        "copy running-config startup-config (or write memory). Running-config is in RAM; startup-config is in NVRAM.",
      ],
      [
        "How do you set a device hostname to ITE-SW1?",
        "From global config: hostname ITE-SW1",
      ],
      [
        "Commands to assign 192.168.1.1/24 to GigabitEthernet 0/1 and bring it up?",
        "interface GigabitEthernet0/1 → ip address 192.168.1.1 255.255.255.0 → no shutdown",
      ],
      [
        "Why is no shutdown required on many Cisco interfaces?",
        "Interfaces are often administratively down by default. no shutdown enables the interface (admin up).",
      ],
      [
        "How do you secure VTY lines for remote access?",
        "line vty 0 4 → login local (or password) → transport input ssh (prefer SSH over Telnet) → exit. Also create a username/secret.",
      ],
      [
        "enable password vs enable secret?",
        "enable secret is stored as a hash (MD5/SHA depending on IOS) and is preferred. enable password is weaker/plain in older configs.",
      ],
      [
        "What does show version tell you?",
        "IOS image, uptime, configuration register, memory, and hardware model — useful when documenting ITE rack gear.",
      ],
      [
        "How does context-sensitive help work in IOS?",
        "Type ? for options. Tab completes unique keywords. Use this constantly in labs instead of memorising every argument.",
      ],
      [
        "Command to reboot a router or switch?",
        "reload from privileged EXEC. Save config first if you want changes to persist.",
      ],
    ],
  },
  {
    title: "Switching, VLANs & STP",
    description:
      "Access/trunk ports, 802.1Q, and spanning tree — typical Higher Nitec switching practicals.",
    color: "olive",
    cards: [
      [
        "Why do we use VLANs?",
        "To split one physical switch into multiple broadcast domains (e.g. Staff, Students, Servers) for security and smaller broadcasts.",
      ],
      [
        "Access port vs trunk port?",
        "Access: one VLAN, used for PCs/APs/phones (untagged). Trunk: carries many VLANs between switches/routers using 802.1Q tags.",
      ],
      [
        "What is IEEE 802.1Q?",
        "The standard VLAN tagging method. A 4-byte tag is inserted in the Ethernet frame so the trunk knows which VLAN a frame belongs to.",
      ],
      [
        "What is the native VLAN?",
        "Untagged traffic on a trunk. Default is VLAN 1. Best practice: set a unused native VLAN and never use VLAN 1 for user data.",
      ],
      [
        "Commands to put FastEthernet 0/5 into VLAN 20 as an access port?",
        "interface fa0/5 → switchport mode access → switchport access vlan 20",
      ],
      [
        "What does show vlan brief display?",
        "VLAN IDs, names, status, and which access ports belong to each VLAN.",
      ],
      [
        "Collision domain vs broadcast domain on a switch?",
        "Each switch port is its own collision domain. A VLAN (or hub) is a broadcast domain. Routers separate broadcast domains.",
      ],
      [
        "What problem does STP (Spanning Tree Protocol) solve?",
        "Layer 2 loops from redundant links. STP blocks some ports so there is one active path; if a link fails, a blocked port can become forwarding.",
      ],
      [
        "What is the STP root bridge?",
        "The switch with the lowest Bridge ID (priority + MAC). All path costs are calculated toward the root. Lower priority wins.",
      ],
      [
        "What is PortFast and when is it safe?",
        "Skips listening/learning on access ports so PCs get DHCP faster. Use only on end-host ports, never on links to other switches (risk of loops).",
      ],
      [
        "What is a MAC address table?",
        "Switch CAM table mapping MAC → port. Built by inspecting source MACs. Unknown unicasts are flooded.",
      ],
      [
        "Router-on-a-stick in an ITE lab — what is it?",
        "One router physical interface with subinterfaces (e.g. G0/0.10, G0/0.20), each with 802.1Q encapsulation, to route between VLANs over a trunk.",
      ],
    ],
  },
  {
    title: "Routing & WAN Basics",
    description:
      "Static routes, default routes, and intro to dynamic routing for campus-to-ISP style topologies.",
    color: "dusk",
    cards: [
      [
        "What is routing?",
        "Forwarding packets between networks by choosing a next hop from the routing table (connected, static, or dynamic routes).",
      ],
      [
        "What does ip route 0.0.0.0 0.0.0.0 192.168.1.1 do?",
        "Installs a default route: send unknown destinations to next hop 192.168.1.1 (typical path to the ISP or core router).",
      ],
      [
        "Static routing vs dynamic routing?",
        "Static: admin types routes; simple, no CPU overhead, does not auto-adapt. Dynamic (RIP/OSPF/EIGRP): routers share updates and reconverge after a link failure.",
      ],
      [
        "What is administrative distance (AD)?",
        "Trust ranking of route sources. Connected = 0, static = 1, EIGRP = 90, OSPF = 110, RIP = 120. Lower AD wins when prefixes match.",
      ],
      [
        "Command to add a static route to 10.2.0.0/16 via 192.168.10.2?",
        "ip route 10.2.0.0 255.255.0.0 192.168.10.2",
      ],
      [
        "What does show ip route display?",
        "The routing table: codes (C, S, R, O), prefixes, AD/metric, next hop, and outgoing interface.",
      ],
      [
        "RIP vs OSPF in one sentence each?",
        "RIP is a simple distance-vector protocol using hop count (max 15). OSPF is a link-state IGP using cost (bandwidth) and scales better for campus networks.",
      ],
      [
        "What is a metric?",
        "The cost used by a protocol to prefer one path: RIP uses hops, OSPF uses cost derived from bandwidth.",
      ],
      [
        "What is a next hop?",
        "The IP of the neighbouring router that should receive the packet next. Must be reachable (usually a connected network).",
      ],
      [
        "Serial vs Ethernet WAN in Packet Tracer labs?",
        "Older labs use Serial (HDLC/PPP, clock rate on DCE). Modern Singapore access is Ethernet/fibre. Know both: exams still mention encapsulation and DCE clocking.",
      ],
      [
        "What is NAT / PAT and why do home fibre routers use it?",
        "Network Address Translation maps private IPs to a public IP. PAT (overload) uses ports so many HDB devices share one public address from the ISP.",
      ],
      [
        "Longest prefix match — who wins: 10.1.1.0/24 vs 10.1.0.0/16 for 10.1.1.50?",
        "10.1.1.0/24. Routers choose the most specific matching prefix.",
      ],
    ],
  },
  {
    title: "Security, ACLs & Singapore Context",
    description:
      "ACLs, SSH, and workplace habits for ITE students — including IMDA, PDPA, and local ISP/fibre notes.",
    color: "sand",
    cards: [
      [
        "What is an ACL?",
        "Access Control List: ordered permit/deny statements that filter traffic on an interface (in or out) based on IP, protocol, and ports.",
      ],
      [
        "Standard vs extended IPv4 ACL?",
        "Standard (1–99, 1300–1999): source IP only. Extended (100–199, 2000–2699): source, destination, protocol, and ports. Extended is used for real application filtering.",
      ],
      [
        "Where should you place a standard ACL vs an extended ACL?",
        "Standard: as close to the destination as possible (it cannot match destination). Extended: as close to the source as possible to drop unwanted traffic early.",
      ],
      [
        "Why prefer SSH over Telnet for Cisco management?",
        "Telnet sends usernames and passwords in clear text. SSH encrypts the session. Use transport input ssh on VTY lines.",
      ],
      [
        "What is switch port security?",
        "Limits how many MAC addresses a port learns (e.g. maximum 1–2). Violation modes: protect, restrict, shutdown. Stops casual unauthorised PCs on a lab port.",
      ],
      [
        "Name Singapore’s telecom regulator and one relevance to networking students.",
        "IMDA (Infocomm Media Development Authority). Spectrum, ISP licensing, and cybersecurity guidelines affect how fibre, 5G, and enterprise links are operated.",
      ],
      [
        "How does PDPA affect a student handling packet captures?",
        "The Personal Data Protection Act covers personal data. Do not capture or store classmate IDs, emails, or NRICs from lab PCs or Wi-Fi; anonymise and delete captures after the practical.",
      ],
      [
        "Physical security of MDF/IDF — what should you remember on attachment?",
        "Lock comms rooms, label patching, do not leave console cables attached, and follow the company’s change process before unplugging production links.",
      ],
      [
        "Why is Singapore fibre-to-the-home (NetLink Trust / GPON) relevant in class?",
        "Most HDB flats use an ONT. The LAN side is typically a private 192.168.x.0/24 with NAT. Understand ONT vs router vs switch when troubleshooting home labs.",
      ],
      [
        "Give three common ISPs students will see in Singapore.",
        "Singtel, StarHub, and M1 (plus others such as ViewQwest and MyRepublic). WAN troubleshooting still starts with physical fibre, ONT lights, then DHCP/NAT.",
      ],
      [
        "What Cisco tools are common in ITE Cisco modules?",
        "Cisco Packet Tracer for simulation, physical 2960/ISR-style racks where available, and Cisco Networking Academy (NetAcad) curriculum aligned to CCNA topics.",
      ],
      [
        "List three hardening steps before you leave a lab router.",
        "Set enable secret, disable unused interfaces (shutdown), use SSH not Telnet, banner motd, and copy run start. Do not leave default passwords.",
      ],
    ],
  },
  {
    title: "Wireless Network Fundamentals",
    description:
      "WLAN standards, RF, security, and campus Wi-Fi — aligned to Cisco CCNA wireless topics and ITE lab / Singapore site practice.",
    color: "amber",
    cards: [
      [
        "What is a WLAN, and how does it differ from a wired LAN?",
        "A Wireless LAN uses radio (IEEE 802.11) instead of copper/fibre for the access layer. Frames still look like Ethernet after the AP, but the air uses CSMA/CA, SSIDs, and RF planning.",
      ],
      [
        "Define SSID, BSSID, and ESS.",
        "SSID is the network name users see. BSSID is the AP radio’s MAC for that SSID. An ESS is multiple APs sharing the same SSID so clients can roam across a campus.",
      ],
      [
        "Infrastructure mode vs ad-hoc (IBSS)?",
        "Infrastructure: clients associate to an access point (typical ITE lab and office). Ad-hoc: devices talk peer-to-peer without an AP. Campus designs almost always use infrastructure (or mesh APs that still form an ESS).",
      ],
      [
        "Compare 2.4 GHz and 5 GHz for a Singapore campus AP.",
        "2.4 GHz travels farther and penetrates walls better but is crowded (Bluetooth, microwaves, neighbours in HDB/hostels) and has only three non-overlapping 20 MHz channels (1, 6, 11). 5 GHz has more channels and higher throughput but shorter range.",
      ],
      [
        "Why do we usually use channels 1, 6, and 11 on 2.4 GHz?",
        "802.11b/g/n 20 MHz channels overlap. 1, 6, and 11 are the three that do not overlap, so neighbouring APs should use these to cut co-channel interference.",
      ],
      [
        "Name common 802.11 amendments students meet in CCNA / NetAcad.",
        "802.11a (5 GHz), b/g (2.4 GHz), n (Wi-Fi 4, MIMO), ac (Wi-Fi 5, 5 GHz), ax (Wi-Fi 6). Know that newer clients are dual-band; labs may still show mixed SSIDs.",
      ],
      [
        "Why does Wi-Fi use CSMA/CA instead of CSMA/CD?",
        "Stations cannot reliably detect collisions in the air the way Ethernet NICs detect voltage on a wire. They avoid collisions: listen before talk, random backoff, and optional RTS/CTS.",
      ],
      [
        "What is the difference between a wireless router, an autonomous AP, and a lightweight AP + WLC?",
        "Home/HDB gear is often a router+AP+switch+NAT in one box. An autonomous AP is configured by itself. Lightweight APs join a Wireless LAN Controller (CAPWAP); policy is central — typical enterprise / polytechnic / ITE campus design.",
      ],
      [
        "What does CAPWAP do?",
        "Control and Provisioning of Wireless Access Points: encrypted tunnels from lightweight APs to a WLC for config, firmware, and often client data (depending on mode).",
      ],
      [
        "Association vs authentication on a WLAN?",
        "Authentication proves identity (open, PSK, or 802.1X). Association binds the client to a specific AP/BSSID so it can send data. Both must succeed before DHCP in a typical lab.",
      ],
      [
        "WEP, WPA2-PSK, WPA3, and 802.1X — which should an ITE student recommend?",
        "Never WEP. Home/lab SSIDs: WPA2-PSK (AES) or WPA3-Personal. Enterprise (staff, students): WPA2/WPA3-Enterprise with 802.1X/EAP and a RADIUS server. TKIP is legacy — use AES-CCMP.",
      ],
      [
        "Does hiding the SSID secure the network?",
        "No. The SSID still appears in other frames and is easy to discover. Use strong encryption and, for school networks, 802.1X — not obscurity.",
      ],
      [
        "RSSI vs SNR — which matters more when a laptop ‘has bars’ but apps fail?",
        "SNR (signal-to-noise). High RSSI with high noise (neighbouring APs, Bluetooth, crowded 2.4 GHz) still means poor data rates. Check channel utilisation, not only signal bars.",
      ],
      [
        "What is a wireless site survey?",
        "Measuring coverage, interference, and capacity before/after installing APs. In Singapore campuses and hostels, walls, lifts, and dense client counts matter as much as range.",
      ],
      [
        "How should guest Wi-Fi be designed in a school or company?",
        "Separate SSID mapped to a guest VLAN, internet-only ACLs, no access to staff/server VLANs, captive portal if required, and isolation so guests cannot scan each other.",
      ],
      [
        "Why do many APs use PoE?",
        "Power over Ethernet (802.3af/at/bt) feeds the AP from the switch so you do not run a 13 A socket in the ceiling. Check switch PoE budget when adding APs in an ITE rack or IDF.",
      ],
      [
        "What is Wireless@SG in one sentence for a networking student?",
        "A nationwide public Wi-Fi programme in Singapore (malls, transport hubs). It is a reminder that public SSIDs are untrusted — use VPN/HTTPS and do not manage lab gear over open Wi-Fi.",
      ],
      [
        "Give two IMDA-related points for Wi-Fi in Singapore.",
        "Use approved indoor/outdoor power and bands; 5 GHz may include DFS channels that APs must vacate if radar is detected. Do not operate high-power outdoor APs without checking IMDA rules.",
      ],
      [
        "What is MIMO / a spatial stream, simply?",
        "Multiple Input Multiple Output: several antennas send/receive independent streams to raise throughput. An AP advertised as 2x2:2 supports two spatial streams — client radios must match to get the full rate.",
      ],
      [
        "List a basic WLAN troubleshooting order for an ITE practical.",
        "Client Wi-Fi on → correct SSID → PSK/802.1X success → IP via DHCP → ping gateway → ping beyond. Then RF: band, channel, RSSI/SNR, AP up, and that the switch port/VLAN/PoE for the AP is good.",
      ],
    ],
  },
];

async function insertDeck(source: SeedDeck): Promise<void> {
  const deck: Deck = {
    id: newId(),
    title: source.title,
    description: source.description,
    color: source.color,
    createdAt: Date.now(),
    lastStudiedAt: null,
    streak: 0,
    lastStreakDate: null,
  };
  await saveDeck(deck);
  await saveCards(source.cards.map(([front, back]) => newCard(deck.id, front, back)));
}

export async function seedIfNeeded(): Promise<void> {
  const version = await getMeta("seedVersion");
  const existing = await getAllDecks();
  const titles = new Set(existing.map((d) => d.title));

  for (const source of SEED) {
    if (!titles.has(source.title)) {
      await insertDeck(source);
    }
  }

  if (version !== SEED_VERSION) {
    await setMeta("seedVersion", SEED_VERSION);
  }
}
