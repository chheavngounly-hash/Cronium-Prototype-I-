import { Community } from '../types';
import { OPEN_SERVERS_CATALOG } from '../data/openServersData';
import {
  neuralBrainAvatar,
  neuralDatacenterAvatar,
  deepChipAvatar,
  earthSpaceAvatar,
  plantSeedlingAvatar,
  gamingControllerAvatar,
  roboticsServerAvatar,
  startupServerAvatar,
  digitalArtServerAvatar,
  musicServerAvatar,
  travelServerAvatar,
  researchServerAvatar,
  aiNexusAvatar,
  cosmicOrbitalAvatar,
  bipedalRoboticsAvatar,
  quantumTopologyAvatar,
  gameEngineAvatar,
  alpineExplorersAvatar,
  analogSynthAvatar,
  creativeCanvasAvatar,
  ventureBuildersAvatar,
} from '../data/mockData';

const UNIQUE_SERVER_AVATAR_FALLBACKS: string[] = [
  neuralBrainAvatar,
  earthSpaceAvatar,
  plantSeedlingAvatar,
  gamingControllerAvatar,
  roboticsServerAvatar,
  startupServerAvatar,
  digitalArtServerAvatar,
  musicServerAvatar,
  travelServerAvatar,
  researchServerAvatar,
  deepChipAvatar,
  neuralDatacenterAvatar,
  aiNexusAvatar,
  cosmicOrbitalAvatar,
  bipedalRoboticsAvatar,
  quantumTopologyAvatar,
  gameEngineAvatar,
  alpineExplorersAvatar,
  analogSynthAvatar,
  creativeCanvasAvatar,
  ventureBuildersAvatar,
];

function normalizeAvatarKey(avatar?: string): string {
  return (avatar || '').split('?')[0].trim().toLowerCase();
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'want', 'looking',
  'like', 'love', 'enjoy', 'about', 'some', 'more', 'very', 'just', 'build', 'building',
  'find', 'people', 'community', 'communities', 'server', 'servers', 'group', 'groups',
  'interested', 'interests', 'hobby', 'hobbies', 'goal', 'goals', 'learning', 'learn',
  'how', 'what', 'when', 'where', 'who', 'can', 'could', 'would', 'should', 'have', 'has',
  'are', 'was', 'were', 'been', 'being', 'will', 'your', 'my', 'our', 'their', 'all', 'also',
]);

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Machine Learning': [
    'machine learning', 'ml', 'ai', 'artificial intelligence', 'neural', 'deep learning',
    'llm', 'llms', 'diffusion', 'agent', 'agents', 'autonomous', 'model', 'models',
    'pytorch', 'tensorflow', 'transformer', 'transformers', 'nlp', 'vision', 'rag',
  ],
  'Physics': [
    'physics', 'quantum', 'relativity', 'mechanics', 'cryogenic', 'cryogenics',
    'thermodynamics', 'particle', 'astrophysics', 'condensed matter', 'photonics',
  ],
  'Space': [
    'space', 'astronomy', 'rocket', 'rockets', 'orbital', 'mars', 'propulsion',
    'satellite', 'telescope', 'jwst', 'aerospace', 'cosmos', 'stargazing', 'planet',
  ],
  'Robotics': [
    'robot', 'robotics', 'ros', 'ros2', 'hardware', 'firmware', 'kinematics',
    'embodied', 'actuator', 'actuators', 'bipedal', 'humanoid', 'drone', 'mechatronics',
    'embedded', 'fpga', 'asic', 'silicon', 'chip', 'semiconductor',
  ],
  'Cybersecurity': [
    'cyber', 'cybersecurity', 'security', 'hack', 'hacking', 'cryptography', 'crypto',
    'zero-knowledge', 'zk', 'protocol', 'exploit', 'audit', 'firewall', 'encryption',
    'infosec', 'privacy', 'pentest', 'reverse engineering',
  ],
  'Gaming': [
    'game', 'games', 'gaming', 'esports', 'unity', 'unreal', 'shader', 'shaders',
    'valorant', 'apex', 'cs2', 'indie game', 'gamedev', 'anime', 'competitive',
  ],
  'Travel': [
    'travel', 'explore', 'adventure', 'hiking', 'hike', 'nature', 'trail', 'trails',
    'mountain', 'mountains', 'backpack', 'backpacking', 'camping', 'outdoors', 'nomad',
  ],
  'Music': [
    'music', 'audio', 'sound', 'production', 'synth', 'synths', 'eurorack', 'dsp',
    'beat', 'beats', 'daw', 'mixing', 'guitar', 'piano', 'producer',
  ],
  'Photography': [
    'photo', 'photography', 'camera', 'lens', 'portrait', 'landscape', 'astrophotography',
  ],
  'Chess': [
    'chess', 'tactics', 'grandmaster', 'board game', 'strategy',
  ],
  'Digital Art': [
    'art', 'design', 'digital art', 'ui', 'ux', 'creative', 'illustration', '3d',
    'webgl', 'threejs', 'three.js', 'figma', 'concept art', 'generative art', 'graphics',
    'design systems', 'typography',
  ],
  'AI Startup': [
    'startup', 'startups', 'founder', 'founders', 'business', 'venture', 'vc', 'mvp',
    'pitch', 'saas', 'entrepreneur', 'entrepreneurship', 'hackathon', 'hackathons',
    'co-founder', 'cofounder', 'product', 'ship', 'networking',
  ],
  'Open-Source': [
    'open source', 'open-source', 'oss', 'github', 'repo', 'rust', 'golang', 'systems',
    'distributed', 'kubernetes', 'linux', 'kernel', 'p2p', 'mesh', 'backend',
    'mechanical keyboards', 'keyboards', 'firmware', 'qmk',
  ],
  'Research': [
    'research', 'paper', 'papers', 'citation', 'lab', 'arxiv', 'academic', 'publish',
    'science', 'scientist', 'preprint', 'study', 'study group', 'biotech', 'biology',
    'genomics', 'crispr', 'longevity',
  ],
  'Social Impact': [
    'impact', 'social impact', 'climate', 'sustainability', 'clean energy', 'mentorship',
    'mentor', 'leadership', 'volunteer', 'nonprofit', 'education', 'healthcare', 'world',
    'coffee', 'reading', 'community',
  ],
};

function tokenizePhrase(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

function splitRawPhrases(text: string): string[] {
  return text
    .split(/[,;\n/&]+|\band\b/gi)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

export function extractTopicsFromPrompt(prompt: unknown): string[] {
  if (!prompt) return [];

  let text = '';
  const directPills: string[] = [];

  if (Array.isArray(prompt)) {
    for (const item of prompt) {
      if (typeof item === 'string' && item.trim()) {
        directPills.push(item.trim());
      }
    }
    text = directPills.join(', ');
  } else if (typeof prompt === 'string') {
    text = prompt;
  } else if (typeof prompt === 'object') {
    try {
      text = Object.values(prompt as Record<string, unknown>)
        .filter(Boolean)
        .map(String)
        .join(', ');
    } catch {
      text = String(prompt);
    }
  } else {
    text = String(prompt || '');
  }

  const normalized = text.toLowerCase().trim();
  if (!normalized) return [];

  const detected = new Set<string>();

  // Preserve explicitly clicked pills or comma-separated phrases
  for (const pill of directPills) {
    detected.add(pill);
  }
  for (const phrase of splitRawPhrases(text)) {
    if (phrase.length <= 40) {
      detected.add(phrase);
    }
  }

  // Also detect canonical topics via semantic keyword matching
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (
      keywords.some((kw) => {
        if (kw.length <= 3 && !kw.includes(' ')) {
          return new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalized);
        }
        return normalized.includes(kw);
      })
    ) {
      detected.add(topic);
    }
  }

  return Array.from(detected);
}

// Built-in catalog of rich communities to complement INITIAL_COMMUNITIES & OPEN_SERVERS_CATALOG
const DISCOVERY_CATALOG: Community[] = [
  {
    id: 'ai-vision-lab',
    name: 'Neural Vision & Generative AI',
    description: 'Diffusion transformers, 3D Gaussian splatting, and neural radiance field architectures.',
    category: 'Machine Learning',
    topics: ['Machine Learning', 'Digital Art', 'Research', 'AI Startup'],
    tags: ['Machine Learning', 'Digital Art', 'Research', 'AI Startup'],
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    activeMembers: 342,
    totalMembers: 918,
    membersCount: 918,
    onlineCount: 342,
    isJoined: false,
    joined: false,
    isVerified: true,
    channels: [{ id: 'ch-vision-1', name: 'research-showcase', type: 'text' }],
    members: [],
  },
  {
    id: 'robotics-guild',
    name: 'Autonomous Robotics Guild',
    description: 'Hardware firmware, ROS2, computer vision, and dynamic humanoid balance control.',
    category: 'Robotics',
    topics: ['Robotics', 'Learn Robotics', 'Hardware', 'ROS2', 'Autonomous Systems'],
    tags: ['Robotics', 'Hardware', 'ROS2', 'Autonomous Systems'],
    avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&auto=format&fit=crop&q=80',
    activeMembers: 211,
    totalMembers: 742,
    membersCount: 742,
    onlineCount: 211,
    isJoined: false,
    joined: false,
    isVerified: true,
    channels: [{ id: 'ch-rob-1', name: 'hardware-builds', type: 'text' }],
    members: [],
  },
  {
    id: 'cybersec-network',
    name: 'Zero-Trust Cyber Defense',
    description: 'Reverse engineering, formal verification, cryptographic primitives and protocol auditing.',
    category: 'Cybersecurity',
    topics: ['Cybersecurity', 'Open-Source Projects', 'Encryption', 'Protocol', 'Zero-Knowledge'],
    tags: ['Cybersecurity', 'Encryption', 'Zero-Knowledge'],
    avatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    activeMembers: 289,
    totalMembers: 874,
    membersCount: 874,
    onlineCount: 289,
    isJoined: false,
    joined: false,
    isVerified: true,
    channels: [{ id: 'ch-sec-1', name: 'vulnerability-lab', type: 'text' }],
    members: [],
  },
  {
    id: 'deep-space-propulsion',
    name: 'Astro-Propulsion & Mars Base',
    description: 'Aerospace structural design, orbital telemetry, and next-gen satellite propulsion.',
    category: 'Space',
    topics: ['Space', 'Physics', 'Astrophysics', 'Orbital Mechanics'],
    tags: ['Space', 'Physics', 'Astrophysics'],
    avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
    activeMembers: 356,
    totalMembers: 954,
    membersCount: 954,
    onlineCount: 356,
    isJoined: false,
    joined: false,
    isVerified: true,
    channels: [{ id: 'ch-space-1', name: 'mission-telemetry', type: 'text' }],
    members: [],
  },
  {
    id: 'quantum-frontiers',
    name: 'Cryogenic Quantum Computing',
    description: 'Superconducting qubits, quantum compiler optimization, and topological error codes.',
    category: 'Physics',
    topics: ['Physics', 'Quantum Error Correction', 'Research', 'Frontier Tech'],
    tags: ['Physics', 'Quantum', 'Research'],
    avatar: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
    activeMembers: 192,
    totalMembers: 685,
    membersCount: 685,
    onlineCount: 192,
    isJoined: false,
    joined: false,
    isVerified: true,
    channels: [{ id: 'ch-quant-1', name: 'quantum-hardware', type: 'text' }],
    members: [],
  },
  {
    id: 'oss-systems',
    name: 'High-Throughput OSS Systems',
    description: 'Rust, Go, and C++ distributed infrastructure, high-frequency caching, and kernel bypass.',
    category: 'Open-Source',
    topics: ['Open-Source Projects', 'Build an AI Startup', 'Career Mentorship', 'Rust'],
    tags: ['Open-Source', 'AI Startup', 'Systems'],
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    activeMembers: 374,
    totalMembers: 968,
    membersCount: 968,
    onlineCount: 374,
    isJoined: false,
    joined: false,
    isVerified: true,
    channels: [{ id: 'ch-oss-1', name: 'architecture-reviews', type: 'text' }],
    members: [],
  },
];

interface WeightedSignal {
  phrase: string;
  tokens: string[];
  canonicalTopics: string[];
  weight: number;
  stage: 'interests' | 'hobbies' | 'goals';
}

function buildWeightedSignals(
  input: unknown,
  stage: 'interests' | 'hobbies' | 'goals',
  weight: number
): WeightedSignal[] {
  if (!input) return [];

  const rawList: string[] = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string' && item.trim()) {
        rawList.push(item.trim());
      }
    }
  } else if (typeof input === 'string' && input.trim()) {
    rawList.push(...splitRawPhrases(input));
  }

  return rawList.map((raw) => {
    const phrase = raw.toLowerCase().trim();
    const tokens = tokenizePhrase(phrase);
    const canonicalTopics: string[] = [];

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (
        topic.toLowerCase() === phrase ||
        keywords.some((kw) => {
          if (kw.length <= 3 && !kw.includes(' ')) {
            return new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(phrase);
          }
          return phrase.includes(kw);
        })
      ) {
        canonicalTopics.push(topic.toLowerCase());
      }
    }

    return { phrase, tokens, canonicalTopics, weight, stage };
  });
}

export function getTopFiveRelevantServers(
  communities: Community[],
  interests?: unknown,
  hobbies?: unknown,
  goals?: unknown,
  _userPlan?: unknown,
  loopStage?: string,
  joinedNamesSet?: Set<string>,
  joinedIdsSet?: Set<string>
): Community[] {
  // Build stage-weighted user signals (active stage weighted slightly higher, all 3 contribute strongly)
  const signals: WeightedSignal[] = [
    ...buildWeightedSignals(interests, 'interests', loopStage === 'interests' ? 1.3 : 1.15),
    ...buildWeightedSignals(hobbies, 'hobbies', loopStage === 'hobbies' ? 1.3 : 1.05),
    ...buildWeightedSignals(goals, 'goals', loopStage === 'goals' ? 1.35 : 1.25),
  ];

  // Combine provided communities, Open Servers catalog, and discovery catalog without duplicates
  const poolById = new Map<string, Community>();
  const seenNames = new Set<string>();

  const addCandidate = (c: Community) => {
    if (!c?.id || !c?.name) return;
    const normId = c.id.trim().toLowerCase();
    const normName = c.name.trim().toLowerCase();
    if (!poolById.has(normId) && !seenNames.has(normName)) {
      poolById.set(normId, c);
      seenNames.add(normName);
    }
  };

  for (const c of communities || []) addCandidate(c);
  for (const c of OPEN_SERVERS_CATALOG) addCandidate(c);
  for (const c of DISCOVERY_CATALOG) addCandidate(c);

  // Filter out any joined servers
  const eligible = Array.from(poolById.values()).filter((c) => {
    const isJoined = Boolean(c.isJoined || c.joined);
    const inIdSet = Boolean(joinedIdsSet && (joinedIdsSet.has(c.id) || joinedIdsSet.has(c.id.toLowerCase())));
    const inNameSet = Boolean(joinedNamesSet && joinedNamesSet.has(c.name.trim().toLowerCase()));
    return !isJoined && !inIdSet && !inNameSet;
  });

  const scored = eligible.map((community) => {
    let score = 0;
    const matchedSignalLabels = new Set<string>();
    const matchedStages = new Set<'interests' | 'hobbies' | 'goals'>();

    const commName = (community.name || '').toLowerCase();
    const commCategory = (community.category || '').toLowerCase();
    const commTags = (community.tags || []).map((t) => t.toLowerCase()).filter(Boolean);
    const commTopics = (community.topics || []).map((t) => t.toLowerCase()).filter(Boolean);
    const commLabels = Array.from(new Set([...commTags, ...commTopics]));
    const commDesc = (community.description || '').toLowerCase();
    const commChannelsText = (community.channels || [])
      .map((ch) => `${ch.name || ''} ${ch.topic || ''}`.toLowerCase())
      .join(' ');

    // Canonical topics inferred for this server
    const serverCanonicalTopics = new Set<string>();
    const serverFullText = `${commName} ${commCategory} ${commLabels.join(' ')} ${commDesc}`;
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (
        commLabels.some((l) => l === topic.toLowerCase()) ||
        keywords.some((kw) => {
          if (kw.length <= 3 && !kw.includes(' ')) {
            return new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(serverFullText);
          }
          return serverFullText.includes(kw);
        })
      ) {
        serverCanonicalTopics.add(topic.toLowerCase());
      }
    }

    for (const sig of signals) {
      let signalScore = 0;
      const { phrase, tokens, canonicalTopics, weight, stage } = sig;
      if (!phrase) continue;

      // 1. Direct name match (strongest signal)
      if (commName.includes(phrase)) {
        signalScore += 18;
      }

      // 2. Category match (strictly non-empty guard!)
      if (commCategory && (commCategory === phrase || commCategory.includes(phrase) || (phrase.length >= 3 && phrase.includes(commCategory)))) {
        signalScore += 14;
      }

      // 3. Exact or substring tag/topic match
      let tagPoints = 0;
      for (const label of commLabels) {
        if (label === phrase) {
          tagPoints = Math.max(tagPoints, 16);
        } else if (label.includes(phrase) || (phrase.length >= 3 && label.length >= 3 && phrase.includes(label))) {
          tagPoints = Math.max(tagPoints, 11);
        }
      }
      signalScore += tagPoints;

      // 4. Semantic canonical topic alignment (connects synonyms like "pytorch" -> "Machine Learning", "mvp" -> "AI Startup")
      for (const canon of canonicalTopics) {
        if (serverCanonicalTopics.has(canon)) {
          signalScore += 10;
        }
        if (commLabels.some((l) => l === canon || l.includes(canon))) {
          signalScore += 6;
        }
      }

      // 5. Individual word token hits in name, tags, description, and channels
      let tokenHits = 0;
      for (const tok of tokens) {
        if (commName.includes(tok)) {
          tokenHits += 6;
        } else if (commLabels.some((l) => l.includes(tok))) {
          tokenHits += 5;
        } else if (commDesc.includes(tok)) {
          tokenHits += 3;
        } else if (commChannelsText.includes(tok)) {
          tokenHits += 2;
        }
      }
      signalScore += Math.min(18, tokenHits);

      if (signalScore > 0) {
        score += signalScore * weight;
        matchedStages.add(stage);
        matchedSignalLabels.add(
          phrase
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        );
      }
    }

    // Cross-dimension synergy bonus: rewards communities that bridge interests + hobbies + goals
    if (matchedStages.size === 2) score += 12;
    if (matchedStages.size >= 3) score += 24;

    // Gentle tiebreakers (never outweigh real personalization)
    const tieBreaker =
      (community.isVerified ? 0.5 : 0) +
      Math.min(1.0, (community.activeMembers || 0) / 500);

    const finalScore = score + tieBreaker;
    const matchedList = Array.from(matchedSignalLabels).slice(0, 3);
    const computedMatchPct =
      signals.length === 0
        ? community.matchScore || 88
        : Math.min(99, Math.max(72, Math.round(74 + Math.min(25, score * 0.45))));

    const enriched: Community = {
      ...community,
      matchScore: computedMatchPct,
      matchedSignals: matchedList,
      matchJustification:
        matchedList.length > 0
          ? `Matches your ${matchedList.join(', ')} prompt${matchedStages.size > 1 ? ' across multiple stages' : ''}.`
          : community.matchJustification,
    };

    return { community: enriched, score: finalScore, rawRelevance: score };
  });

  scored.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
    return (b.community.activeMembers || 0) - (a.community.activeMembers || 0);
  });

  return ensureUniqueServers(scored.slice(0, 5).map((s) => s.community));
}

export function getAllCandidateServers(
  communities: Community[],
  interests?: unknown,
  hobbies?: unknown,
  goals?: unknown,
  userPlan?: unknown
): Community[] {
  const topFive = getTopFiveRelevantServers(communities, interests, hobbies, goals, userPlan);
  const combined = [...topFive, ...(communities || []), ...OPEN_SERVERS_CATALOG, ...DISCOVERY_CATALOG];
  return ensureUniqueServers(combined);
}

export function ensureUniqueServers(servers: Community[]): Community[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const seenAvatars = new Set<string>();
  const result: Community[] = [];
  for (const s of servers || []) {
    if (!s) continue;
    const idKey = (s.id || '').trim().toLowerCase();
    const nameKey = (s.name || '').trim().toLowerCase();
    if ((idKey && seenIds.has(idKey)) || (nameKey && seenNames.has(nameKey))) {
      continue;
    }
    if (idKey) seenIds.add(idKey);
    if (nameKey) seenNames.add(nameKey);

    let assignedAvatar = s.avatar;
    const avatarKey = normalizeAvatarKey(assignedAvatar);
    if (!avatarKey || seenAvatars.has(avatarKey)) {
      const unused = UNIQUE_SERVER_AVATAR_FALLBACKS.find(
        (candidate) => !seenAvatars.has(normalizeAvatarKey(candidate))
      );
      if (unused) {
        assignedAvatar = unused;
      }
    }
    const finalAvatarKey = normalizeAvatarKey(assignedAvatar);
    if (finalAvatarKey) {
      seenAvatars.add(finalAvatarKey);
    }

    result.push(assignedAvatar !== s.avatar ? { ...s, avatar: assignedAvatar } : s);
  }
  return result;
}
