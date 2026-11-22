import { Community, PromptHistoryItem } from '../types';
import { neuralBrainAvatar, earthSpaceAvatar, travelServerAvatar } from './mockData';

export const DEFAULT_PROMPT_HISTORY: PromptHistoryItem[] = [
  {
    id: 'hist_ml_agents_01',
    createdAt: Date.now() - 1000 * 60 * 15, // 15 mins ago
    timestamp: '15m ago',
    title: 'Machine Learning, Autonomous Agents & Distributed Mesh',
    stage: 'interests',
    interests: ['Machine Learning', 'Autonomous Agents', 'Distributed Systems'],
    hobbies: ['Open-Source', 'Digital Art'],
    goals: ['Build an AI Startup', 'Publish Research'],
    rawInput: 'Machine learning, autonomous agents, zero-knowledge verification, distributed mesh networking',
    matchedServers: [
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
        members: []
      },
      {
        id: 'comm_ml',
        name: 'Machine Learning Enthusiasts',
        description: 'Explore neural network architectures, PyTorch pipelines, autonomous robotics, and conversational AI agents with practitioners worldwide.',
        category: 'Machine Learning',
        topics: ['Machine Learning', 'AI', 'Python', 'Publish Research'],
        tags: ['Machine Learning', 'AI', 'Python', 'Publish Research'],
        avatar: neuralBrainAvatar,
        activeMembers: 143,
        totalMembers: 840,
        membersCount: 840,
        onlineCount: 143,
        matchScore: 92,
        badgeColor: 'indigo',
        joined: false,
        channels: [{ id: 'ch_ml_gen', name: 'general', type: 'text' }],
        members: []
      },
      {
        id: 'robotics-guild',
        name: 'Autonomous Robotics Guild',
        description: 'Hardware firmware, ROS2, computer vision, and dynamic humanoid balance control.',
        category: 'Robotics',
        topics: ['Robotics', 'Learn Robotics', 'Hardware', 'ROS2'],
        tags: ['Robotics', 'Learn Robotics', 'Hardware', 'ROS2'],
        avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&auto=format&fit=crop&q=80',
        activeMembers: 211,
        totalMembers: 742,
        membersCount: 742,
        onlineCount: 211,
        joined: false,
        channels: [{ id: 'ch-rob-1', name: 'hardware-builds', type: 'text' }],
        members: []
      },
      {
        id: 'cronium-core-protocol',
        name: 'Cronium Infrastructure Core',
        description: 'Decentralized peer-to-peer mesh architecture, cryptographic state channels, and hardware enclaves.',
        category: 'Distributed Systems',
        topics: ['Distributed Systems', 'Cryptography', 'P2P', 'Infrastructure'],
        tags: ['ZK-SNARKs', 'Mesh Protocols', 'Distributed Systems'],
        avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        activeMembers: 368,
        totalMembers: 936,
        membersCount: 936,
        onlineCount: 368,
        joined: false,
        channels: [{ id: 'ch-core-1', name: 'protocol-dev', type: 'text' }],
        members: []
      },
      {
        id: 'ai-founders-syndicate',
        name: 'AI Founders & Angel Syndicate',
        description: 'Venture backed startups, YC alumni founders, angel rounds, and distributed compute scaling.',
        category: 'Startups',
        topics: ['AI Startup', 'Venture Capital', 'Startups', 'Founders'],
        tags: ['AI Startup', 'Venture Capital', 'Founders', 'a16z'],
        avatar: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
        activeMembers: 189,
        totalMembers: 675,
        membersCount: 675,
        onlineCount: 189,
        joined: false,
        channels: [{ id: 'ch-found-1', name: 'pitch-deck-reviews', type: 'text' }],
        members: []
      }
    ]
  },
  {
    id: 'hist_space_propulsion_02',
    createdAt: Date.now() - 1000 * 60 * 120, // 2 hours ago
    timestamp: '2h ago',
    title: 'Space, Deep Space Propulsion & Telemetry',
    stage: 'interests',
    interests: ['Space', 'Physics', 'Propulsion'],
    hobbies: ['Astrophotography', 'Chess'],
    goals: ['Launch Spacecraft Hardware', 'Deep Space Comms'],
    rawInput: 'Deep space exploration, plasma thrusters, rocket telemetry, orbital navigation',
    matchedServers: [
      {
        id: 'comm_space',
        name: 'Beyond Earth Explorers',
        description: 'Space exploration, astrophysics, orbital mechanics, planetary science, and rocket telemetry.',
        category: 'Space',
        topics: ['Space', 'Astronomy', 'Physics', 'Propulsion'],
        tags: ['Space', 'Astronomy', 'Physics', 'Telemetry'],
        avatar: earthSpaceAvatar,
        activeMembers: 215,
        totalMembers: 920,
        membersCount: 920,
        onlineCount: 215,
        matchScore: 89,
        badgeColor: 'emerald',
        joined: false,
        channels: [{ id: 'ch_space_gen', name: 'general', type: 'text' }],
        members: []
      },
      {
        id: 'space-telemetry-guild',
        name: 'Deep Space Optical Telemetry',
        description: 'Adaptive optics, gigabit laser downlinks, and deep-space RF transceivers.',
        category: 'Space',
        topics: ['Space', 'Photonics', 'Optical Comms', 'Laser Links'],
        tags: ['Space', 'Photonics', 'Deep Space', 'Comms'],
        avatar: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
        activeMembers: 194,
        totalMembers: 652,
        membersCount: 652,
        onlineCount: 194,
        joined: false,
        channels: [{ id: 'ch-opt-1', name: 'laser-downlink-data', type: 'text' }],
        members: []
      },
      {
        id: 'cryo-propulsion-lab',
        name: 'Cryogenic Propulsion & Spacecraft Guidance',
        description: 'Xenon Hall-effect thrusters, cryogenic boiloff insulation, and autonomous upper-stage attitude control.',
        category: 'Space',
        topics: ['Propulsion', 'Cryogenics', 'Space', 'Aerospace'],
        tags: ['Cryogenics', 'Propulsion', 'Aerospace', 'SpaceFlight'],
        avatar: 'https://images.unsplash.com/photo-1517976487502-5f6974797175?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=800&auto=format&fit=crop&q=80',
        activeMembers: 245,
        totalMembers: 780,
        membersCount: 780,
        onlineCount: 245,
        joined: false,
        channels: [{ id: 'ch-prop-1', name: 'test-stand-telemetry', type: 'text' }],
        members: []
      },
      {
        id: 'astrophotography-circle',
        name: 'Astrophotography & Cosmic Imaging',
        description: 'Narrowband deep-sky imaging, planetary stacking, and remote observatory automation.',
        category: 'Photography',
        topics: ['Astrophotography', 'Photography', 'Space', 'Astronomy'],
        tags: ['Astrophotography', 'Photography', 'Space', 'Telescopes'],
        avatar: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&fit=crop&q=80',
        activeMembers: 318,
        totalMembers: 894,
        membersCount: 894,
        onlineCount: 318,
        joined: false,
        channels: [{ id: 'ch-astro-1', name: 'dark-sky-captures', type: 'text' }],
        members: []
      },
      {
        id: 'orbital-mechanics-society',
        name: 'Orbital Mechanics & SmallSat Constellations',
        description: 'Low Earth Orbit constellations, orbital debris collision avoidance, and trajectory modeling.',
        category: 'Physics',
        topics: ['Physics', 'Space', 'Orbital Dynamics', 'Satellites'],
        tags: ['Orbital Dynamics', 'Satellites', 'Physics', 'Space'],
        avatar: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        activeMembers: 167,
        totalMembers: 615,
        membersCount: 615,
        onlineCount: 167,
        joined: false,
        channels: [{ id: 'ch-orb-1', name: 'orbital-sims', type: 'text' }],
        members: []
      }
    ]
  },
  {
    id: 'hist_outdoors_hiking_03',
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    timestamp: 'Yesterday',
    title: 'Global Trailblazers, Alpine Hiking & Landscape Photography',
    stage: 'hobbies',
    interests: ['Travel', 'Photography', 'Nature'],
    hobbies: ['Hiking', 'Trail Running', 'Alpine Backpacking'],
    goals: ['Explore Pacific Crest Trail', 'Meet Outdoor Founders'],
    rawInput: 'Alpine trails, hiking redwoods, nature photography, ultra marathon runs',
    matchedServers: [
      {
        id: 'comm_outdoors',
        name: 'Global Trailblazers & Hikers',
        description: 'Explore scenic backcountry trails, plan global trekking expeditions, and share wilderness stories.',
        category: 'Outdoors',
        topics: ['Travel', 'Hiking', 'Photography', 'Nature'],
        tags: ['Travel', 'Hiking', 'Photography', 'Outdoors'],
        avatar: travelServerAvatar,
        activeMembers: 228,
        totalMembers: 730,
        membersCount: 730,
        onlineCount: 228,
        matchScore: 84,
        badgeColor: 'amber',
        joined: false,
        channels: [{ id: 'ch_hike_gen', name: 'trail-recommendations', type: 'text' }],
        members: []
      },
      {
        id: 'alpine-high-pass-explorers',
        name: 'Alpine High-Pass Explorers',
        description: 'Technical summits, Sierra Nevada & Pacific Crest expeditions, and mountaineering safety.',
        category: 'Outdoors',
        topics: ['Hiking', 'Backpacking', 'Mountaineering', 'Travel'],
        tags: ['Hiking', 'Mountaineering', 'Backpacking', 'Alpine'],
        avatar: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&auto=format&fit=crop&q=80',
        activeMembers: 276,
        totalMembers: 825,
        membersCount: 825,
        onlineCount: 276,
        joined: false,
        channels: [{ id: 'ch-summit-1', name: 'trailhead-conditions', type: 'text' }],
        members: []
      },
      {
        id: 'landscape-photo-guild',
        name: 'Landscape & Wilderness Photography Guild',
        description: 'Fine-art nature photography, golden hour drone flights, and camera lens setups in the wild.',
        category: 'Photography',
        topics: ['Photography', 'Travel', 'Creative', 'Nature'],
        tags: ['Photography', 'Nature', 'Travel', 'Creative'],
        avatar: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        activeMembers: 329,
        totalMembers: 942,
        membersCount: 942,
        onlineCount: 329,
        joined: false,
        channels: [{ id: 'ch-photo-1', name: 'photo-critiques', type: 'text' }],
        members: []
      },
      {
        id: 'pnw-trail-runners',
        name: 'Pacific Northwest Trail Runners',
        description: 'Endurance trail running, ultramarathon preparation, and weekend dirt sessions in coastal redwoods.',
        category: 'Outdoors',
        topics: ['Trail Running', 'Fitness', 'Outdoors', 'Nature'],
        tags: ['Trail Running', 'Fitness', 'Outdoors', 'Redwoods'],
        avatar: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80',
        activeMembers: 254,
        totalMembers: 712,
        membersCount: 712,
        onlineCount: 254,
        joined: false,
        channels: [{ id: 'ch-run-1', name: 'strava-leaderboards', type: 'text' }],
        members: []
      },
      {
        id: 'wilderness-survival-club',
        name: 'Wilderness Survival & Tech Detox Club',
        description: 'Off-grid bushcraft, emergency satellite comms, and weekend zero-screen wilderness retreats.',
        category: 'Outdoors',
        topics: ['Outdoors', 'Survival', 'Nature', 'Travel'],
        tags: ['Outdoors', 'Survival', 'Wellness', 'Detox'],
        avatar: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=150&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&auto=format&fit=crop&q=80',
        activeMembers: 176,
        totalMembers: 584,
        membersCount: 584,
        onlineCount: 176,
        joined: false,
        channels: [{ id: 'ch-detox-1', name: 'offline-meetups', type: 'text' }],
        members: []
      }
    ]
  }
];

const STORAGE_KEY = 'cronium_prompt_history_v3';

export function loadPromptHistory(): PromptHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROMPT_HISTORY));
      return DEFAULT_PROMPT_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PROMPT_HISTORY;
  } catch {
    return DEFAULT_PROMPT_HISTORY;
  }
}

export function savePromptHistoryItem(item: Omit<PromptHistoryItem, 'id' | 'createdAt' | 'timestamp'> & { timestamp?: string }): PromptHistoryItem {
  const newItem: PromptHistoryItem = {
    ...item,
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
    timestamp: item.timestamp || 'Just now',
  };

  try {
    const current = loadPromptHistory();
    // Prepend to top and limit to 20 entries
    const updated = [newItem, ...current.filter((x) => x.title !== newItem.title)].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return newItem;
}

export function deletePromptHistoryItem(id: string): PromptHistoryItem[] {
  try {
    const current = loadPromptHistory();
    const updated = current.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAllPromptHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
}
