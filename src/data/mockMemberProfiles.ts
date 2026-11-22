import {
  jenniesPortrait,
  portraitAlexanderPatrick,
  portraitClassieWilley,
  portraitGeorgeAllan,
  portraitHiroshiTanaka,
  portraitElenaRostova,
  portraitMarcusVance,
  portraitPriyaPatel,
  portraitLiamChen,
  portraitAnnaSan,
  portraitMacRoseville,
  portraitKenjiTakahashi,
  portraitCamilleLaurent,
  portraitZoeKim,
  portraitAmaraOkafor,
  portraitTariqAlmansoor,
  resolveGenderMatchedAvatar,
} from './mockData';

export interface MemberProfileDetail {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverUrl: string;
  badge: string;
  title: string;
  bio: string;
  organization: string;
  email: string;
  safetyNumber: string;
  hardwareStatus: string;
  communitiesCount: number;
  connectionsCount: number;
  brandStatus: {
    rankTitle: string;
    level: number;
    points: number;
    nextRank: string;
    progressPercent: number;
  };
  metrics?: {
    honors: string;
    patentsCount: number | string;
    contributorRank: string;
  };
  achievements: Array<{
    icon: string;
    title: string;
    org: string;
    year: string;
  }>;
  recentTopics: string[];
  linkedinUrl?: string;
  githubUrl?: string;
}

export const MEMBER_PROFILES: Record<string, MemberProfileDetail> = {
  user_jennies: {
    id: 'user_jennies',
    name: 'Jennies Vance',
    username: '@jennies',
    avatar: jenniesPortrait,
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    badge: 'Founding Member',
    title: 'Head of AI Product & Systems Architecture • Founder',
    bio: 'Product architect & systems researcher specializing in zero-knowledge mesh messaging, autonomous agents, and human-computer symbiosis.',
    organization: 'Cronium Infrastructure Core • Stanford AI Lab Alum',
    email: 'jennies.vance@cronium.network',
    safetyNumber: '0492-8819-2041-9943',
    hardwareStatus: 'Vault Active • 256-bit AES Hardware Enclave',
    communitiesCount: 12,
    connectionsCount: 1480,
    brandStatus: {
      rankTitle: 'Legend II',
      level: 58,
      points: 5850,
      nextRank: 'Mythic II',
      progressPercent: 82,
    },
    metrics: {
      honors: '1st',
      patentsCount: 14,
      contributorRank: 'Top 0.1%',
    },
    achievements: [
      {
        icon: '🏆',
        title: 'Systems Architect of the Year',
        org: 'Autonomous Mesh Computing Initiative & IEEE',
        year: '2025',
      },
      {
        icon: '📜',
        title: '12 Published International Patents',
        org: 'USPTO & WIPO International Registries',
        year: '2021 – 2025',
      },
      {
        icon: '🚀',
        title: '10M+ Daily Active Users Milestone',
        org: 'Cronium Infrastructure Core',
        year: '2025',
      },
      {
        icon: '🎓',
        title: 'NeurIPS Best Paper Contributor',
        org: 'Neural Information Processing Systems',
        year: '2024',
      },
      {
        icon: '🌐',
        title: 'Open Source Ecosystem Champion',
        org: 'Open Cryptography & WebAssembly Foundations',
        year: '2023 – 2025',
      },
    ],
    recentTopics: ['Hackathons', 'Startups', 'ZeroKnowledge', 'AutonomousAgents'],
  },

  user_classie: {
    id: 'user_classie',
    name: 'Classie Willey',
    username: '@classie',
    avatar: portraitClassieWilley,
    coverUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    badge: 'Community Host & Fellow',
    title: 'AI Product Lead • Workplace Culture & Wellness Advocate',
    bio: 'Leading decentralized product teams with deep empathy. Championing outdoor syncs, cognitive wellness, and ethical AI development.',
    organization: 'World Changers Mindset • Tech Wellness Initiative',
    email: 'classie.willey@worldchangers.ai',
    safetyNumber: '7192-3341-9012-4412',
    hardwareStatus: 'Verified Enclave • Hardware Key Paired',
    communitiesCount: 9,
    connectionsCount: 1240,
    brandStatus: {
      rankTitle: 'Legend III',
      level: 42,
      points: 3950,
      nextRank: 'Mythic V',
      progressPercent: 65,
    },
    metrics: {
      honors: 'Gold Medal',
      patentsCount: 8,
      contributorRank: 'Top 3%',
    },
    achievements: [
      {
        icon: '🌿',
        title: 'Workplace Wellness Champion Award',
        org: 'Remote Work Excellence Alliance',
        year: '2025',
      },
      {
        icon: '💡',
        title: 'Top 50 Product Leaders in AI',
        org: 'Product Faculty & IEEE',
        year: '2024',
      },
      {
        icon: '🧘',
        title: 'Mindful Distributed Leadership Fellow',
        org: 'Cognitive Wellness Institute',
        year: '2023',
      },
      {
        icon: '🤝',
        title: 'Global Remote Culture Architect Award',
        org: 'Future of Work Alliance',
        year: '2022',
      },
    ],
    recentTopics: ['Workplace', 'RemoteWork', 'Hiking', 'SlowLiving'],
  },

  user_george: {
    id: 'user_george',
    name: 'George Allan',
    username: '@george',
    avatar: portraitGeorgeAllan,
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    badge: 'Senior Fellow',
    title: 'Senior Infrastructure Engineer @ TensorCloud • Alpine Trekker',
    bio: 'Building ultra-resilient distributed storage clusters by day; summiting high Sierra passes and tracking meteor showers by night.',
    organization: 'TensorCloud Infrastructure • Global Trailblazers Host',
    email: 'george.allan@tensorcloud.io',
    safetyNumber: '5512-8901-2344-1290',
    hardwareStatus: 'Vault Active • FIDO2 Biometric Key',
    communitiesCount: 14,
    connectionsCount: 1890,
    brandStatus: {
      rankTitle: 'Mythic IV',
      level: 45,
      points: 4420,
      nextRank: 'Mythic III',
      progressPercent: 82,
    },
    metrics: {
      honors: 'Top 3',
      patentsCount: 17,
      contributorRank: 'Top 2%',
    },
    achievements: [
      {
        icon: '⛰️',
        title: 'Pacific Crest Trail Thru-Hike Finisher',
        org: 'PCT Association',
        year: '2023',
      },
      {
        icon: '⚡',
        title: 'Zero-Downtime Cluster Migration Award',
        org: 'Cloud Native Computing Foundation',
        year: '2024',
      },
      {
        icon: '🌌',
        title: 'Alpine Astronomy Observation Grant',
        org: 'High-Altitude Stargazing Guild',
        year: '2025',
      },
    ],
    recentTopics: ['Hiking', 'Outdoors', 'Infra', 'Stargazing'],
  },

  user_liam: {
    id: 'user_liam',
    name: 'Liam Chen',
    username: '@liam',
    avatar: portraitLiamChen,
    coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
    badge: 'Core Contributor',
    title: 'Lead Engine Architect • Low-Latency Systems & Specialty Coffee',
    bio: 'Obsessed with mechanical keyboard ergonomics, cache line alignment, and roasting natural processed Ethiopian coffees.',
    organization: 'Low-Latency Engine Labs • Ergonomics Guild',
    email: 'liam.chen@enginelabs.dev',
    safetyNumber: '9921-4412-8871-3310',
    hardwareStatus: 'Hardware Enclave • Secure Element Active',
    communitiesCount: 11,
    connectionsCount: 1620,
    brandStatus: {
      rankTitle: 'Legend I',
      level: 44,
      points: 4210,
      nextRank: 'Mythic V',
      progressPercent: 91,
    },
    metrics: {
      honors: 'Grand Prize',
      patentsCount: 11,
      contributorRank: 'Top 1%',
    },
    achievements: [
      {
        icon: '⌨️',
        title: 'Ergonomic Open-Hardware Innovation Prize',
        org: 'Mechanical Input Guild',
        year: '2025',
      },
      {
        icon: '🏎️',
        title: 'Sub-Microsecond Message Broker Author',
        org: 'High-Frequency OSS Foundation',
        year: '2024',
      },
      {
        icon: '☕',
        title: 'Micro-Roast Coffee Extraction Science Award',
        org: 'Specialty Coffee Masters',
        year: '2023',
      },
    ],
    recentTopics: ['Ergonomics', 'DeskSetup', 'Systems', 'Coffee'],
  },

  user_elena: {
    id: 'user_elena',
    name: 'Elena Rostova',
    username: '@elena',
    avatar: portraitElenaRostova,
    coverUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    badge: 'Research Scientist',
    title: 'Neuromorphic Hardware Researcher • Baker & Urban Gardener',
    bio: 'Designing bio-inspired silicon architectures for brain-computer interfaces. Believer in wild fermentation sourdough and slow living.',
    organization: 'Quantum Neuromorphic Lab • ETH Zurich Alum',
    email: 'elena.rostova@cronium.network',
    safetyNumber: '3129-8472-1092-7714',
    hardwareStatus: 'Vault Active • Quantum-Resistant Handshake',
    communitiesCount: 10,
    connectionsCount: 1540,
    brandStatus: {
      rankTitle: 'Mythic III',
      level: 47,
      points: 4680,
      nextRank: 'Mythic II',
      progressPercent: 74,
    },
    metrics: {
      honors: 'Pioneer',
      patentsCount: 9,
      contributorRank: 'Top 5%',
    },
    achievements: [
      {
        icon: '🔬',
        title: 'European Young Scientist Award in Microelectronics',
        org: 'European Research Council',
        year: '2024',
      },
      {
        icon: '🍞',
        title: 'Artisan Culinary Fermentation Contributor',
        org: 'Gastronomy Science Circle',
        year: '2025',
      },
      {
        icon: '🧬',
        title: 'Synaptic Memristor Circuit Patent',
        org: 'Swiss Federal Patent Office & WIPO',
        year: '2023',
      },
      {
        icon: '🏔️',
        title: 'Alpine Botany Preservation Fellowship',
        org: 'Swiss Alpine Ecology League',
        year: '2022',
      },
    ],
    recentTopics: ['Sourdough', 'Neuromorphic', 'SlowLiving', 'Quantum'],
  },

  user_alexander: {
    id: 'user_alexander',
    name: 'Alexander Patrick',
    username: '@alexander',
    avatar: portraitAlexanderPatrick,
    coverUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80',
    badge: 'Staff Research Fellow',
    title: 'Staff Research Fellow @ Stanford AI & Robotics Lab',
    bio: 'Mentoring the next generation of hardware robotics builders. Exploring human-robot collaboration and multi-modal edge sensor belts.',
    organization: 'Stanford Robotics Lab • Silicon Valley Mentorship Hub',
    email: 'alexander.patrick@stanford-robotics.org',
    safetyNumber: '4481-2290-7711-3829',
    hardwareStatus: 'Verified Enclave • Hardware Key Paired',
    communitiesCount: 16,
    connectionsCount: 2180,
    brandStatus: {
      rankTitle: 'Mythical Glory',
      level: 52,
      points: 5490,
      nextRank: 'Immortal',
      progressPercent: 88,
    },
    metrics: {
      honors: 'Fellow',
      patentsCount: 21,
      contributorRank: 'Top 0.5%',
    },
    achievements: [
      {
        icon: '🤖',
        title: 'Robotics Mentorship Excellence Citation',
        org: 'IEEE Robotics & Automation Society',
        year: '2025',
      },
      {
        icon: '🎓',
        title: 'Best Doctoral Dissertation in Autonomous Systems',
        org: 'Stanford University School of Engineering',
        year: '2023',
      },
    ],
    recentTopics: ['Robotics', 'Mentorship', 'Hackathons', 'Education'],
  },

  user_marcus: {
    id: 'user_marcus',
    name: 'Dr. Marcus Vance',
    username: '@marcus',
    avatar: portraitMarcusVance,
    coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    badge: 'Distinguished Fellow',
    title: 'Distributed Systems Fellow • Compiler Architect',
    bio: 'Pioneering asynchronous zero-copy network compilers and formal protocol verification for decentralized mesh networks.',
    organization: 'Decentralized Protocol Core • MIT CSAIL Alum',
    email: 'marcus.vance@mit-csail.org',
    safetyNumber: '8839-1029-4481-9920',
    hardwareStatus: 'Vault Active • 256-bit AES Hardware Key',
    communitiesCount: 15,
    connectionsCount: 2450,
    brandStatus: {
      rankTitle: 'Mythical Glory',
      level: 54,
      points: 5820,
      nextRank: 'Immortal',
      progressPercent: 94,
    },
    metrics: {
      honors: '1st Prize',
      patentsCount: 16,
      contributorRank: 'Top 1.5%',
    },
    achievements: [
      {
        icon: '📜',
        title: 'ACM SIGPLAN Most Influential Paper Award',
        org: 'ACM SIGPLAN Committee',
        year: '2024',
      },
      {
        icon: '⚡',
        title: 'High-Performance Computing Pioneer Medal',
        org: 'International Supercomputing Conference',
        year: '2023',
      },
      {
        icon: '🛡️',
        title: 'Zero-Copy Asynchronous Rust Kernel Architecture',
        org: 'Open Systems Systems Research Group',
        year: '2022',
      },
      {
        icon: '🌐',
        title: 'OSDI Best Protocol Implementation Award',
        org: 'USENIX Association',
        year: '2021',
      },
    ],
    recentTopics: ['DistributedSystems', 'Compilers', 'Protocols', 'Security'],
  },

  user_priya: {
    id: 'user_priya',
    name: 'Priya Patel',
    username: '@priya',
    avatar: portraitPriyaPatel,
    coverUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&auto=format&fit=crop&q=80',
    badge: 'CleanTech Fellow',
    title: 'CleanTech Microgrid Specialist • Energy Systems Researcher',
    bio: 'Designing decentralized autonomous solar-battery microgrids for resilient community power. Enthusiast of community urban gardens.',
    organization: 'Global CleanTech Microgrid Alliance',
    email: 'priya.patel@cleantech-grid.org',
    safetyNumber: '1192-4820-9938-2211',
    hardwareStatus: 'Vault Active • Secure Element Paired',
    communitiesCount: 13,
    connectionsCount: 1710,
    brandStatus: {
      rankTitle: 'Legend II',
      level: 43,
      points: 4120,
      nextRank: 'Legend I',
      progressPercent: 71,
    },
    metrics: {
      honors: 'Laureate',
      patentsCount: 13,
      contributorRank: 'Top 4%',
    },
    achievements: [
      {
        icon: '🌱',
        title: 'Clean Energy Innovation Grant Laureate',
        org: 'Global Renewable Energy Trust',
        year: '2025',
      },
      {
        icon: '🔋',
        title: 'Autonomous Microgrid Patent Portfolio',
        org: 'USPTO Patent Registry',
        year: '2024',
      },
      {
        icon: '☀️',
        title: 'IEEE Power & Energy Young Professional Award',
        org: 'IEEE Power & Energy Society',
        year: '2023',
      },
      {
        icon: '🏙️',
        title: 'Community Solar Resilience Fellowship',
        org: 'Urban Sustainability Foundation',
        year: '2022',
      },
      {
        icon: '🔌',
        title: 'Solar-Battery Mesh Inverter Design Prize',
        org: 'Clean Energy Breakthrough Summit',
        year: '2021',
      },
      {
        icon: '🌿',
        title: 'Ecological Decentralization Research Fellowship',
        org: 'Global Environmental Institute',
        year: '2020',
      },
    ],
    recentTopics: ['CleanTech', 'Energy', 'Community', 'Sustainability'],
  },

  user_hiroshi: {
    id: 'user_hiroshi',
    name: 'Dr. Hiroshi Tanaka',
    username: '@hiroshi',
    avatar: portraitHiroshiTanaka,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    badge: 'Principal Fellow',
    title: 'Principal Quantum Physicist & JAXA Fellow',
    bio: 'Investigating topological superconducting qubits and cosmic ray noise suppression in deep cryogenic environments.',
    organization: 'JAXA Quantum Aeronautics Lab • Tokyo Tech',
    email: 'hiroshi.tanaka@jaxa.quantum.jp',
    safetyNumber: '7721-9940-1123-5582',
    hardwareStatus: 'Vault Active • Quantum-Resistant Lattice Key',
    communitiesCount: 18,
    connectionsCount: 2940,
    brandStatus: {
      rankTitle: 'Grandmaster Fellow',
      level: 85,
      points: 8520,
      nextRank: 'Immortal',
      progressPercent: 95,
    },
    metrics: {
      honors: 'Medalist',
      patentsCount: 26,
      contributorRank: 'Top 0.01%',
    },
    achievements: [
      {
        icon: '⚛️',
        title: 'Japanese Physical Society Lifetime Fellow',
        org: 'Physical Society of Japan',
        year: '2024',
      },
      {
        icon: '🛰️',
        title: 'Space Cryogenics Payload Mission Lead',
        org: 'JAXA Aeronautics',
        year: '2023',
      },
      {
        icon: '🧊',
        title: 'Topological Qubit Coherence Benchmark Record',
        org: 'International Quantum Horizons',
        year: '2025',
      },
      {
        icon: '📡',
        title: 'Cryogenic Sub-Kelvin Low-Noise Amplifier Patent',
        org: 'Japan Patent Office (JPO)',
        year: '2022',
      },
      {
        icon: '🌌',
        title: 'Cosmic Ray Decoherence Suppression Award',
        org: 'Astrophysical Quantum Consortium',
        year: '2021',
      },
      {
        icon: '🏆',
        title: 'IEEE Quantum Computing Pioneer Award',
        org: 'IEEE Quantum Council',
        year: '2024',
      },
      {
        icon: '📜',
        title: '42 Published Superconducting Qubit Patents',
        org: 'USPTO & WIPO International Registries',
        year: '2018 – 2025',
      },
      {
        icon: '🎓',
        title: '150+ Peer-Reviewed Quantum Physics Publications',
        org: 'Physical Review Letters & Nature Physics',
        year: '2015 – 2025',
      },
    ],
    recentTopics: ['Quantum', 'Physics', 'Space', 'Superconducting'],
  },

  user_anna: {
    id: 'user_anna',
    name: 'Anna San',
    username: '@annasan',
    avatar: portraitAnnaSan,
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    badge: 'Wafer Systems Lead',
    title: 'Lead Architect @ Cerebras Systems • Wafer-Scale AI',
    bio: 'Specializing in Agent Orchestration, Diffusion Models & Edge Inference Optimization. Active contributor in Cronium communities.',
    organization: 'Cerebras Systems Architecture Core • MIT CSAIL Alum',
    email: 'anna.san@cerebras.systems',
    safetyNumber: '3321-9984-7712-4401',
    hardwareStatus: 'Vault Active • FIDO2 Hardware Key',
    communitiesCount: 16,
    connectionsCount: 2860,
    brandStatus: {
      rankTitle: 'Mythical Glory',
      level: 74,
      points: 7420,
      nextRank: 'Grandmaster',
      progressPercent: 88,
    },
    metrics: {
      honors: 'Top 5',
      patentsCount: 28,
      contributorRank: 'Top 0.5%',
    },
    achievements: [
      {
        icon: '💻',
        title: 'Silicon Architecture of the Decade Citation',
        org: 'IEEE Micro Top Picks',
        year: '2024',
      },
      {
        icon: '🚀',
        title: '400,000-Core Wafer Orchestration Architect',
        org: 'Supercomputing AI Hardware Forum',
        year: '2025',
      },
      {
        icon: '❄️',
        title: 'Monolithic Die Microfluidic Cooling Patent',
        org: 'USPTO Silicon Systems Registry',
        year: '2023',
      },
      {
        icon: '⚡',
        title: 'Distributed Diffusion Inference Engine Author',
        org: 'High Performance AI Forum',
        year: '2025',
      },
      {
        icon: '🎓',
        title: 'Stanford HPC Distinguished Engineering Alum',
        org: 'Stanford University School of Engineering',
        year: '2022',
      },
      {
        icon: '🌐',
        title: 'Open Wafer Cluster Telemetry Spec Author',
        org: 'Open AI Hardware Consortium',
        year: '2024',
      },
      {
        icon: '🏆',
        title: 'Wafer-Scale ML Systems Founder Award',
        org: 'ML Architecture Global Alliance',
        year: '2025',
      },
    ],
    recentTopics: ['Hardware', 'AIChips', 'WaferScale', 'Compute'],
  },

  user_kenji: {
    id: 'user_kenji',
    name: 'Kenji Takahashi',
    username: '@kenji',
    avatar: portraitKenjiTakahashi,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    badge: 'Propulsion Fellow',
    title: 'Aerospace Propulsion & Spacecraft Guidance Specialist',
    bio: 'Designing next-generation Xenon Hall-effect plasma thrusters and autonomous deep-space guidance algorithms.',
    organization: 'Spacecraft Dynamics & Deep Space Navigation Core',
    email: 'kenji.takahashi@deepspace.aero',
    safetyNumber: '9912-3012-7721-4450',
    hardwareStatus: 'Vault Active • FIDO2 Biometric Key',
    communitiesCount: 10,
    connectionsCount: 1510,
    brandStatus: {
      rankTitle: 'Legend IV',
      level: 52,
      points: 5240,
      nextRank: 'Legend III',
      progressPercent: 72,
    },
    metrics: {
      honors: '1st Prize',
      patentsCount: 14,
      contributorRank: 'Top 1%',
    },
    achievements: [
      {
        icon: '🚀',
        title: '500-Hour Xenon Thruster Benchmark Milestone',
        org: 'Electric Propulsion Laboratory',
        year: '2025',
      },
      {
        icon: '🛰️',
        title: 'NASA Deep Space Navigation Challenge Winner',
        org: 'NASA Aeronautics Division',
        year: '2024',
      },
      {
        icon: '📜',
        title: '14 Spacecraft Propulsion Patents',
        org: 'USPTO Space Tech Registry',
        year: '2021 – 2025',
      },
      {
        icon: '🌌',
        title: 'AIAA Space Exploration Best Paper Award',
        org: 'American Institute of Aeronautics & Astronautics',
        year: '2023',
      },
      {
        icon: '⚡',
        title: 'Sub-Microsecond Hall Thruster Ionization Patent',
        org: 'WIPO International Registry',
        year: '2022',
      },
    ],
    recentTopics: ['Aerospace', 'Propulsion', 'PlasmaPhysics', 'DeepSpace'],
  },

  user_camille: {
    id: 'user_camille',
    name: 'Camille Laurent',
    username: '@camille',
    avatar: portraitCamilleLaurent,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    badge: 'Acoustics Fellow',
    title: 'Spatial Audio DSP & Procedural Acoustics Researcher',
    bio: 'Pioneering binaural HRTF real-time synthesis and ultra-low-latency spatial acoustic rendering engines.',
    organization: 'Paris Audio Labs • IRCAM Alum',
    email: 'camille.laurent@audiolabs.fr',
    safetyNumber: '4812-9901-2244-8831',
    hardwareStatus: 'Hardware Enclave • Secure Element Active',
    communitiesCount: 7,
    connectionsCount: 1150,
    brandStatus: {
      rankTitle: 'Master IV',
      level: 40,
      points: 4050,
      nextRank: 'Master III',
      progressPercent: 60,
    },
    metrics: {
      honors: 'Top 3%',
      patentsCount: 8,
      contributorRank: 'Top 2.5%',
    },
    achievements: [
      {
        icon: '🎧',
        title: 'Binaural HRTF Real-Time Synthesis Patent',
        org: 'European Patent Office',
        year: '2025',
      },
      {
        icon: '🎹',
        title: 'AES International Convention Keynote Citation',
        org: 'Audio Engineering Society',
        year: '2024',
      },
      {
        icon: '🔊',
        title: 'Dolby Atmos Certified Spatial Designer',
        org: 'Spatial Audio Institute',
        year: '2023',
      },
      {
        icon: '🎼',
        title: 'Open Sound DSP Engine Principal Contributor',
        org: 'Open Audio Standards Guild',
        year: '2022',
      },
    ],
    recentTopics: ['SpatialAudio', 'DSP', 'Acoustics', 'SoundDesign'],
  },

  user_zoe: {
    id: 'user_zoe',
    name: 'Zoe Kim',
    username: '@zoekim',
    avatar: portraitZoeKim,
    coverUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
    badge: 'Interaction Fellow',
    title: 'Design Systems Architect & Human-Computer Interface Lead',
    bio: 'Crafting fluid zero-latency micro-interactions and tactile visual feedback systems for collaborative spatial canvases.',
    organization: 'Interaction Science Institute • Seoul National Alum',
    email: 'zoe.kim@interaction.design',
    safetyNumber: '6612-4412-8819-0012',
    hardwareStatus: 'Hardware Enclave • Secure Element Active',
    communitiesCount: 11,
    connectionsCount: 1420,
    brandStatus: {
      rankTitle: 'Master I',
      level: 47,
      points: 4740,
      nextRank: 'Legend V',
      progressPercent: 70,
    },
    metrics: {
      honors: 'Design Fellow',
      patentsCount: 9,
      contributorRank: 'Top 1.5%',
    },
    achievements: [
      {
        icon: '🎨',
        title: 'International Interaction Design Excellence Award',
        org: 'Global Design Guild',
        year: '2025',
      },
      {
        icon: '✨',
        title: 'Micro-Interaction Tactile Feedback Patent',
        org: 'USPTO Interactive Tech',
        year: '2024',
      },
      {
        icon: '📐',
        title: 'Collaborative Real-Time Canvas Architecture Spec',
        org: 'Web Standards Interactive Group',
        year: '2023',
      },
      {
        icon: '🏆',
        title: 'Apple Design Award Honorable Mention',
        org: 'Global Developer Forum',
        year: '2022',
      },
      {
        icon: '📱',
        title: 'Adaptive Typographic Hierarchy Specification',
        org: 'Digital Typography Alliance',
        year: '2021',
      },
    ],
    recentTopics: ['DesignSystems', 'Typography', 'UIUX', 'HCI'],
  },

  user_amara: {
    id: 'user_amara',
    name: 'Amara Okafor',
    username: '@amara',
    avatar: portraitAmaraOkafor,
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    badge: 'BioSystems Lead',
    title: 'Bio-Computing Systems Researcher & Computational Geneticist',
    bio: 'Merging synthetic biology with distributed edge computing architectures to accelerate personalized genomic medicine.',
    organization: 'Pan-African Genomics Consortium • Oxford Alum',
    email: 'amara.okafor@genomics.org',
    safetyNumber: '7821-3312-9981-4412',
    hardwareStatus: 'Vault Active • Hardware Key Paired',
    communitiesCount: 12,
    connectionsCount: 1720,
    brandStatus: {
      rankTitle: 'Legend II',
      level: 56,
      points: 5640,
      nextRank: 'Legend I',
      progressPercent: 80,
    },
    metrics: {
      honors: 'Genomics Fellow',
      patentsCount: 15,
      contributorRank: 'Top 0.8%',
    },
    achievements: [
      {
        icon: '🧬',
        title: 'CRISPR Sequence Real-Time Search Accelerator',
        org: 'International Genomics Society',
        year: '2025',
      },
      {
        icon: '🧪',
        title: 'Synthetic DNA Storage Compression Patent',
        org: 'WIPO International Registry',
        year: '2024',
      },
      {
        icon: '🌍',
        title: 'African Biomedical Innovation Laureate',
        org: 'Pan-African Health Alliance',
        year: '2023',
      },
      {
        icon: '🎓',
        title: 'Nature Genetics Featured Contributor',
        org: 'Nature Publishing Group',
        year: '2024',
      },
      {
        icon: '💡',
        title: 'Bio-Distributed Compute Open Spec Author',
        org: 'Open Genomics Foundation',
        year: '2022',
      },
    ],
    recentTopics: ['Genomics', 'BioTech', 'ComputationalBiology', 'Medicine'],
  },

  user_tariq: {
    id: 'user_tariq',
    name: 'Tariq Al-Mansoor',
    username: '@tariq',
    avatar: portraitTariqAlmansoor,
    coverUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80',
    badge: 'Smart Infrastructure Fellow',
    title: 'Smart Urban Grids & Autonomous Mobility Architect',
    bio: 'Architecting zero-emission autonomous transit grids and sensor-mesh networks for next-generation sovereign smart cities.',
    organization: 'Future Cities & Autonomous Transit Core',
    email: 'tariq.almansoor@futurecities.ae',
    safetyNumber: '5512-9901-2244-1102',
    hardwareStatus: 'Vault Active • FIDO2 Hardware Key',
    communitiesCount: 10,
    connectionsCount: 1490,
    brandStatus: {
      rankTitle: 'Legend V',
      level: 50,
      points: 5020,
      nextRank: 'Legend IV',
      progressPercent: 68,
    },
    metrics: {
      honors: 'Urban Fellow',
      patentsCount: 12,
      contributorRank: 'Top 1.2%',
    },
    achievements: [
      {
        icon: '🏙️',
        title: 'Smart Mobility Infrastructure Excellence Award',
        org: 'World Urban Transit Forum',
        year: '2025',
      },
      {
        icon: '⚡',
        title: 'Dynamic Electric Fleet Charging Mesh Patent',
        org: 'USPTO Smart Tech Registry',
        year: '2024',
      },
      {
        icon: '🚦',
        title: 'Zero-Congestion V2X Telemetry Specification',
        org: 'Connected Vehicle Standards Guild',
        year: '2023',
      },
      {
        icon: '🛰️',
        title: 'Satellite Urban Sensing Initiative Lead',
        org: 'International Smart Cities Council',
        year: '2022',
      },
      {
        icon: '🌐',
        title: 'Resilient Municipal Sensor Grid Architecture',
        org: 'IEEE Smart Grid Society',
        year: '2021',
      },
    ],
    recentTopics: ['SmartCities', 'AutonomousVehicles', 'Mobility', 'CleanGrid'],
  },
};

/**
 * Global pool of realistic, unique achievements across various engineering & scientific fields.
 * Used to deterministically generate 2 to 7 unique achievements for every author.
 */
export const GLOBAL_ACHIEVEMENTS_CATALOG = [
  {
    icon: '🏆',
    title: 'Open Systems Engineering Innovation Prize',
    org: 'Autonomous Systems Initiative & IEEE',
    year: '2025',
  },
  {
    icon: '📜',
    title: 'Published International Architecture Patents',
    org: 'USPTO & WIPO International Registries',
    year: '2024',
  },
  {
    icon: '⚡',
    title: 'High-Throughput Distributed Protocol Author',
    org: 'High-Frequency OSS Foundation',
    year: '2023',
  },
  {
    icon: '🎓',
    title: 'NeurIPS Distinguished Benchmark Citation',
    org: 'Neural Information Processing Systems',
    year: '2024',
  },
  {
    icon: '🌐',
    title: 'Global Open-Source Maintainer of the Year',
    org: 'Open Source Software Consortium',
    year: '2025',
  },
  {
    icon: '🛡️',
    title: 'Zero-Knowledge Cryptographic Protocol Designer',
    org: 'Decentralized Privacy Alliance',
    year: '2024',
  },
  {
    icon: '🚀',
    title: 'Sub-Millisecond Inference Accelerator Contributor',
    org: 'Edge AI Acceleration Guild',
    year: '2025',
  },
  {
    icon: '💡',
    title: 'Top 30 Innovators Under 35 in Computing',
    org: 'Technology Review Global Awards',
    year: '2023',
  },
  {
    icon: '🤖',
    title: 'Autonomous Robotics Fleet Coordination Medal',
    org: 'International Robotics Consortium',
    year: '2024',
  },
  {
    icon: '🌿',
    title: 'Clean Energy & Green Datacenter Pioneer',
    org: 'Sustainable Cloud Computing Forum',
    year: '2023',
  },
  {
    icon: '🎨',
    title: 'Design Systems & Spatial UI Architect Laureate',
    org: 'International Interaction Guild',
    year: '2025',
  },
  {
    icon: '🏎️',
    title: 'Cache-Oblivious Vector Search Engine Author',
    org: 'High Performance Database Society',
    year: '2024',
  },
  {
    icon: '☕',
    title: 'Specialty Roasting Chemistry Gold Medallion',
    org: 'Artisan Coffee Science Guild',
    year: '2022',
  },
  {
    icon: '⛰️',
    title: 'High-Altitude Endurance Expedition Finisher',
    org: 'Alpine Wilderness Explorers',
    year: '2023',
  },
  {
    icon: '🧬',
    title: 'Protein Structure Folding Pipeline Contributor',
    org: 'Computational Biology Union',
    year: '2024',
  },
  {
    icon: '🛰️',
    title: 'Satellite Constellation Mesh Routing Architect',
    org: 'Aerospace Computing Society',
    year: '2025',
  },
  {
    icon: '🎹',
    title: 'Procedural Audio Synthesis Library Author',
    org: 'Digital Signal Processing Circle',
    year: '2023',
  },
  {
    icon: '♟️',
    title: 'Open Source Neural Chess Engine Contributor',
    org: 'Computer Chess Association',
    year: '2024',
  },
  {
    icon: '🔒',
    title: 'Hardware Secure Element Formal Verification Lead',
    org: 'Cryptographic Hardware Group',
    year: '2025',
  },
  {
    icon: '📊',
    title: 'Petabyte-Scale Real-Time Analytics Architect',
    org: 'Big Data Systems Council',
    year: '2024',
  },
  {
    icon: '🧩',
    title: 'WASM Compiler Optimization Breakthrough Award',
    org: 'WebAssembly Working Group',
    year: '2025',
  },
  {
    icon: '👓',
    title: 'Optical Neural Network Waveguide Patent',
    org: 'Photonic Computing Alliance',
    year: '2023',
  },
  {
    icon: '🌊',
    title: 'Oceanographic Sensor Buoy Mesh Network Lead',
    org: 'Marine Science & Technology League',
    year: '2024',
  },
  {
    icon: '🤝',
    title: 'Excellence in Engineering Mentorship Award',
    org: 'Global Technology Leadership Forum',
    year: '2025',
  },
];

/**
 * Generates between 2 and 7 unique achievements for any given author
 */
export function generateUniqueAchievementsForAuthor(
  authorName: string,
  authorHeadline: string,
  absHash: number
) {
  // Count must vary between 2 and 7 (strictly 2, 3, 4, 5, 6, or 7)
  const targetCount = 2 + (absHash % 6);
  const totalInCatalog = GLOBAL_ACHIEVEMENTS_CATALOG.length;
  const startIndex = (absHash * 7 + (authorHeadline?.length || 3)) % totalInCatalog;

  const result: Array<{ icon: string; title: string; org: string; year: string }> = [];
  const usedTitles = new Set<string>();

  for (let step = 0; step < totalInCatalog && result.length < targetCount; step++) {
    const candidate = GLOBAL_ACHIEVEMENTS_CATALOG[(startIndex + step * 3) % totalInCatalog];
    if (!usedTitles.has(candidate.title)) {
      usedTitles.add(candidate.title);
      result.push({
        ...candidate,
        // Slightly vary the year deterministically if desired
        year: candidate.year,
      });
    }
  }

  return result;
}

/**
 * Returns member profile or generates a realistic, complete profile matching Jennies Vance's structure.
 * Strictly guarantees authorAvatar and authorName match so clicking on any post card shows the EXACT SAME PICTURE and name!
 */
export function getMemberProfile(
  authorId: string,
  authorName: string,
  authorAvatar: string,
  authorHeadline: string
): MemberProfileDetail {
  // Generate deterministic hash from authorName
  let hash = 0;
  for (let i = 0; i < authorName.length; i++) {
    hash = (hash << 5) - hash + authorName.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const cleanUsername = `@${authorName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const cleanSlug = authorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanOrgSlug = (authorHeadline || 'Cronium Network')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .split('-')[0] || 'cronium';

  // Distinct company domain per author based on their headline
  const orgDomains = ['network', 'io', 'ai', 'org', 'dev', 'systems', 'tech', 'research'];
  const domainExt = orgDomains[absHash % orgDomains.length];
  const uniqueEmail = `${authorName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@${cleanOrgSlug}.${domainExt}`;

  // Curated diverse prestigious institutions and labs - every member gets their own distinct organization!
  const DIVERSE_ORGANIZATIONS = [
    'DeepMind Systems & Intelligence Lab',
    'Stanford Artificial Intelligence Laboratory (SAIL)',
    'MIT Computer Science & Artificial Intelligence Lab (CSAIL)',
    'Berkeley AI Research (BAIR) Lab',
    'Anthropic Frontier Alignment & Safety Core',
    'OpenAI Supercomputing Architecture Group',
    'Carnegie Mellon Robotics & Vision Institute',
    'NVIDIA Applied Deep Learning Research',
    'Apple Machine Learning & Neural Systems',
    'CERN Advanced Computing Laboratory',
    'Harvard Biodesign & Neural Systems Lab',
    'Oxford Quantum & Information Institute',
    'ETH Zürich Distributed Systems Core',
    'Max Planck Institute for Intelligent Systems',
    'Princeton Computational Neuroscience Group',
    'Caltech Space Structures & Autonomous Systems',
    'Cornell Tech Urban Systems Initiative',
    'Cambridge Computer Laboratory & Systems Research',
    'Meta Fundamental AI Research (FAIR)',
    'Google DeepMind Autonomous Agents Core',
    'Jane Street High-Performance Systems Core',
    'Palantir Foundry Systems Architecture',
    'JAXA Space Robotics & Quantum Aeronautics',
    'Microsoft Research Quantum Systems Lab',
    'Bell Labs Advanced Communications Institute',
  ];

  let defaultOrg = '';
  if (authorHeadline && (authorHeadline.includes('@') || authorHeadline.includes(' at '))) {
    const orgPart = authorHeadline.includes('@')
      ? authorHeadline.split('@')[1].split('•')[0].trim()
      : authorHeadline.split(' at ')[1].split('•')[0].trim();
    defaultOrg = `${orgPart} • Technical Fellow`;
  } else {
    defaultOrg = DIVERSE_ORGANIZATIONS[absHash % DIVERSE_ORGANIZATIONS.length];
  }

  const defaultSafety = `${1000 + (absHash % 8999)}-${2000 + ((absHash * 3) % 7999)}-${3000 + ((absHash * 7) % 6999)}-${4000 + ((absHash * 11) % 5999)}`;

  const commsCount = 8 + (absHash % 8);
  const connCount = 1200 + (absHash % 900);

  // Distinct honors, patents, and contributor rank metrics that vary for every individual
  const honorsPool = [
    '1st', 'Top 3', 'Gold Medal', 'Grand Prize', 'Fellow', 'Pioneer',
    'Laureate', '1st Prize', 'Medalist', 'Top 5', 'Honoree', 'Distinguished', 'Top 2%'
  ];
  const rankPool = [
    'Top 0.1%', 'Top 0.5%', 'Top 1%', 'Top 1.5%', 'Top 2%',
    'Top 2.5%', 'Top 3%', 'Top 4%', 'Top 5%', 'Top 0.3%'
  ];
  const dynamicHonors = honorsPool[absHash % honorsPool.length];
  const dynamicContributor = rankPool[(absHash * 7) % rankPool.length];
  const dynamicPatents = 6 + (absHash % 25);

  const dynamicMetrics = {
    honors: dynamicHonors,
    patentsCount: dynamicPatents,
    contributorRank: dynamicContributor,
  };

  // Check matching by ID or by normalized authorName (e.g. "Anna San" matches "user_anna")
  const normName = authorName.trim().toLowerCase();
  const existing =
    MEMBER_PROFILES[authorId] ||
    Object.values(MEMBER_PROFILES).find(
      (p) =>
        p.name.trim().toLowerCase() === normName ||
        p.username.replace('@', '').toLowerCase() === normName.replace(/[^a-z0-9]/g, '') ||
        (normName.includes('anna') && p.id === 'user_anna') ||
        (normName.includes('alexander') && p.id === 'user_alexander') ||
        (normName.includes('george') && p.id === 'user_george') ||
        (normName.includes('classie') && p.id === 'user_classie') ||
        (normName.includes('liam') && p.id === 'user_liam') ||
        (normName.includes('elena') && p.id === 'user_elena') ||
        (normName.includes('hiroshi') && p.id === 'user_hiroshi') ||
        (normName.includes('kenji') && p.id === 'user_kenji') ||
        (normName.includes('camille') && p.id === 'user_camille') ||
        (normName.includes('zoe') && p.id === 'user_zoe') ||
        (normName.includes('amara') && p.id === 'user_amara') ||
        (normName.includes('tariq') && p.id === 'user_tariq')
    );

  if (existing) {
    const resolvedAvatar = resolveGenderMatchedAvatar(authorName || existing.name, authorAvatar || existing.avatar);
    return {
      ...existing,
      // Guarantee visible, gender-matched portrait across Feed, Server, and DM views
      avatar: resolvedAvatar,
      name: authorName || existing.name,
      title: authorHeadline || existing.title,
      linkedinUrl: existing.linkedinUrl || `linkedin.com/in/${cleanSlug}`,
      githubUrl: existing.githubUrl || `github.com/${cleanUsername.slice(1)}`,
      email: existing.email || uniqueEmail,
      organization: existing.organization || defaultOrg,
      safetyNumber: existing.safetyNumber || defaultSafety,
      hardwareStatus: existing.hardwareStatus || 'Hardware Enclave • Secure Element Active',
      metrics: existing.metrics || dynamicMetrics,
    };
  }

  // Generate 2 to 7 unique achievements for this author
  const generatedAchievements = generateUniqueAchievementsForAuthor(
    authorName,
    authorHeadline,
    absHash
  );

  // Level is strictly proportionate to total achievements:
  const achCount = generatedAchievements.length;
  const levelNum =
    achCount === 7
      ? 72 + (absHash % 4)
      : achCount === 6
      ? 64 + (absHash % 4)
      : achCount === 5
      ? 54 + (absHash % 4)
      : achCount === 4
      ? 44 + (absHash % 4)
      : achCount === 3
      ? 36 + (absHash % 4)
      : 26 + (absHash % 4);

  const calculatedRank =
    levelNum >= 80
      ? 'Grandmaster Fellow'
      : levelNum >= 70
      ? 'Mythical Glory'
      : levelNum >= 60
      ? 'Mythic II'
      : levelNum >= 50
      ? 'Legend II'
      : levelNum >= 40
      ? 'Master III'
      : 'Adept I';

  return {
    id: authorId,
    name: authorName,
    username: cleanUsername,
    avatar: resolveGenderMatchedAvatar(authorName, authorAvatar),
    coverUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    badge: 'Verified Senior Member',
    title: authorHeadline || 'Distributed Systems & AI Architecture Researcher',
    bio: `Specializing in ${authorHeadline || 'systems research, zero-knowledge computing, and sovereign agent networks'}. Active contributor in Cronium communities.`,
    organization: defaultOrg,
    email: uniqueEmail,
    linkedinUrl: `linkedin.com/in/${cleanSlug}`,
    githubUrl: `github.com/${cleanUsername.slice(1)}`,
    safetyNumber: defaultSafety,
    hardwareStatus: 'Hardware Enclave • Secure Element Active',
    communitiesCount: commsCount,
    connectionsCount: connCount,
    brandStatus: {
      rankTitle: calculatedRank,
      level: levelNum,
      points: levelNum * 100 + 40,
      nextRank: 'Next Tier',
      progressPercent: 72 + (absHash % 24),
    },
    metrics: dynamicMetrics,
    achievements: generatedAchievements,
    recentTopics: ['Systems', 'Engineering', 'Architecture', 'AI'],
  };
}
