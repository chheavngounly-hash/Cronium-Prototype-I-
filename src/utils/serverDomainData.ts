import { Community, CommunityChannel, Message, ServerMember, User } from '../types';
import {
  CURRENT_USER,
  COMMUNITY_MEMBERS_MAP,
  FEMALE_PORTRAITS,
  MALE_PORTRAITS,
  inferGenderFromName,
  resolveGenderMatchedAvatar,
  portraitAnnaSan,
  portraitAlexanderPatrick,
  portraitClassieWilley,
  portraitGeorgeAllan,
  portraitMacRoseville,
  portraitHiroshiTanaka,
  portraitElenaRostova,
  portraitMarcusVance,
  portraitPriyaPatel,
  portraitLiamChen,
} from '../data/mockData';
import { buildDomainChannelMessages } from './serverChannelDialogue';

// Pick a unique, verified local portrait that strictly matches the member's gender
function getUniqueGenderMatchedPhoto(
  memberName: string,
  serverSeed: string,
  memberIndex: number,
  usedAvatars: Set<string>
): string {
  const gender = inferGenderFromName(memberName);
  const pool = gender === 'female' ? FEMALE_PORTRAITS : MALE_PORTRAITS;
  const canonical = resolveGenderMatchedAvatar(memberName, undefined, gender);

  if (!usedAvatars.has(canonical)) {
    usedAvatars.add(canonical);
    return canonical;
  }

  let hash = 0;
  for (let i = 0; i < serverSeed.length; i++) {
    hash = (hash << 5) - hash + serverSeed.charCodeAt(i);
    hash |= 0;
  }
  const baseOffset = Math.abs(hash + memberIndex * 3) % pool.length;
  for (let step = 0; step < pool.length; step++) {
    const candidate = pool[(baseOffset + step) % pool.length];
    if (!usedAvatars.has(candidate)) {
      usedAvatars.add(candidate);
      return candidate;
    }
  }
  return canonical;
}

interface DomainProfileTemplate {
  name: string;
  role: string;
  company: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
}

/**
 * Generates an exact, consistent roster of 6 verified professional members for ANY community.
 * Every member has a unique photo (different from one another), unique name, authentic role, and is fully connectable.
 */
export function getServerMembers(community: Community): ServerMember[] {
  const commId = community.id;
  const nameLower = community.name.toLowerCase();
  const tagsText = community.tags.join(' ').toLowerCase();
  const combined = `${nameLower} ${tagsText} ${commId}`;

  let templates: DomainProfileTemplate[] = [];

  if (combined.includes('chess') || combined.includes('tactics')) {
    templates = [
      {
        name: 'Magnus Berg',
        role: 'International Grandmaster & Opening Analyst',
        company: 'Nordic Chess Academy',
        headline: 'Dynamic Sicilian Defenses, Deep Engine PGN Analysis & Blitz Coaching',
        bio: 'FIDE 2640 rated grandmaster. Advising national youth teams and researching neural network evaluation engines in endgame studies.',
        location: 'Oslo, Norway',
        skills: ['Sicilian Defense', 'Endgame Calculation', 'Stockfish 16', 'FIDE Prep', 'Blindfold Tactics'],
      },
      {
        name: 'Grandmaster Elena Rostova',
        role: 'Tactical Trainer & FIDE Master',
        company: 'International Chess Institute',
        headline: 'Positional Sacrifices, Pawn Structures & Rapid Tournament Play',
        bio: 'Competitive grandmaster and author of positional strategy masterclasses with over 15 years in tournament circuits.',
        location: 'Zurich, Switzerland',
        skills: ['King’s Indian', 'Calculation Speed', 'Pawn Structures', 'Game Analysis', 'Time Management'],
      },
      {
        name: 'David Sterling',
        role: 'Algorithmic Chess Engine Developer',
        company: 'DeepTactic Research Lab',
        headline: 'Alpha-Beta Pruning, Bitboard Representations & Neural Value Nets',
        bio: 'Building open-source chess engines and neural network move evaluators for competitive computer chess tournaments.',
        location: 'London, UK',
        skills: ['C++', 'Bitboards', 'NNUE', 'Tree Search', 'Evaluation Tuning'],
      },
      {
        name: 'Chloe Dubois',
        role: 'Tournament Director & Strategy Coach',
        company: 'Parisian Chess Circle',
        headline: 'Psychological Resilience in Rapid Chess & Classical Openings',
        bio: 'Organizing international fide-rated opens and coaching elite junior candidates across Western Europe.',
        location: 'Paris, France',
        skills: ['French Defense', 'Rook Endgames', 'Tournament Protocol', 'Psychological Prep', 'Blitz Strategy'],
      },
      {
        name: 'Vikram Anand',
        role: 'FIDE Arbiter & Junior Chess Academy Director',
        company: 'Apex Chess Foundation',
        headline: 'Middlegame Complexities, Tactical Puzzles & Clock Pressure',
        bio: 'FIDE certified senior arbiter training collegiate teams in opening repertoires and time-trouble psychology.',
        location: 'Chennai, India',
        skills: ['Karpov Endgames', 'Tactical Drills', 'Tournament Arbiting', 'Nimzo-Indian Defense'],
      },
      {
        name: 'Astrid Lindholm',
        role: 'Cognitive Science & Chess Researcher',
        company: 'Stockholm Cognition Institute',
        headline: 'Pattern Recognition Eye-Tracking in Grandmaster Evaluation',
        bio: 'Studying neural activation patterns during rapid pattern identification and calculation heuristics.',
        location: 'Stockholm, Sweden',
        skills: ['Pattern Recognition', 'Eye Tracking', 'Cognitive Heuristics', 'Data Analysis'],
      },
    ];
  } else if (combined.includes('cook') || combined.includes('culinary') || combined.includes('bake') || combined.includes('food')) {
    templates = [
      {
        name: 'Chef Sophie Laurent',
        role: 'Executive Chef & Culinary Director',
        company: "L'Atelier Gastronomique",
        headline: 'Modern French Haute Cuisine, Sous-Vide Science & Farm Sourcing',
        bio: 'Michelin-trained chef blending modern culinary techniques with seasonal farm-to-table traditions.',
        location: 'Lyon, France',
        skills: ['Sauces & Reductions', 'Molecular Gastronomy', 'Sous-Vide', 'Seasonal Sourcing', 'Plating Artistry'],
      },
      {
        name: 'Marco Bellini',
        role: 'Master Baker & Fermentation Specialist',
        company: 'Antica Forneria & Bread Lab',
        headline: 'Wild Sourdough Starters, Ancient Grains & Long Fermentation',
        bio: 'Fourth-generation artisan baker researching ancient grain digestibility and natural lactic fermentation dynamics.',
        location: 'Bologna, Italy',
        skills: ['Wild Sourdough', 'Hydration Science', 'Ancient Spelt', 'Laminating Dough', 'Wood-Fired Ovens'],
      },
      {
        name: 'Kenji Takahashi',
        role: 'Kaiseki Specialist & Knife Artisan',
        company: 'Kyoto Culinary Heritage Institute',
        headline: 'Traditional Dashi Stocks, Umami Chemistry & Precision Knife Skills',
        bio: 'Practitioner of multi-course Kaiseki cuisine, knife sharpening mastery, and natural fermentation techniques.',
        location: 'Kyoto, Japan',
        skills: ['Umami Extraction', 'Knife Sharpening', 'Fish Butchery', 'Kaiseki Seasons', 'Fermentation'],
      },
      {
        name: 'Amara Okafor',
        role: 'Global Gastronomy Researcher & Author',
        company: 'Afro-Fusion Kitchen Collective',
        headline: 'West African Spice Blends, Fermented Locust Beans & Heritage Recipes',
        bio: 'Culinary writer and flavor developer documenting indigenous preservation methods and modern restaurant recipes.',
        location: 'London, UK',
        skills: ['Spice Chemistry', 'Fermentation', 'Flavor Pairing', 'Culinary Anthro', 'Menu Development'],
      },
      {
        name: 'Antoine Mercier',
        role: 'Artisan Fromager & Wine Pairing Specialist',
        company: 'Mercier Caves & Terroir',
        headline: 'Raw Milk Affinage, Microflora Development & Sommelier Pairing',
        bio: 'Guiding cheese affinage cellars and consulting Michelin-starred beverage directors on terroir matching.',
        location: 'Bordeaux, France',
        skills: ['Affinage', 'Microbiology', 'Terroir Tasting', 'Wine Pairing', 'Sensory Analysis'],
      },
      {
        name: 'Maya Lin',
        role: 'Pastry Technologist & Confectionery Designer',
        company: 'Pâtisserie Nouvelle',
        headline: 'Cacao Crystallization, Sugar Architecture & Botanical Infusions',
        bio: 'Innovating low-sugar fine confectionery and chocolate tempering using single-origin heirloom cacao beans.',
        location: 'San Francisco, CA',
        skills: ['Tempering Cacao', 'Pâte à Choux', 'Botanical Extraction', 'Sugar Craft'],
      },
    ];
  } else if (combined.includes('photo') || combined.includes('camera') || combined.includes('film') || combined.includes('cinema')) {
    templates = [
      {
        name: 'Julian Vance',
        role: 'Director of Photography & Cinematographer',
        company: 'Vance Cinematics & Filmworks',
        headline: 'Anamorphic Lenses, Naturalistic Lighting Rigs & 35mm Analog Color',
        bio: 'Award-winning cinematographer with work featured at Sundance and Venice Film Festival. Dedicated to analog lens aesthetics.',
        location: 'Los Angeles, CA',
        skills: ['Arri Alexa', 'Anamorphic Glass', 'Color Grading', 'DaVinci Resolve', 'Gaffer Lighting'],
      },
      {
        name: 'Maya Lin',
        role: 'Street & Editorial Documentary Photographer',
        company: 'Urban Monolith Visuals',
        headline: 'High-Contrast Monochrome, Leica Rangefinders & Visual Storytelling',
        bio: 'Documentary photojournalist published in National Geographic and The New Yorker, capturing architectural and street moments.',
        location: 'New York, NY',
        skills: ['Street Photography', 'Leica M', 'Black & White', 'Visual Narrative', 'Darkroom Chemistry'],
      },
      {
        name: 'Mateo Silva',
        role: 'Lead Colorist & Post-Production Supervisor',
        company: 'Prism Color Studios',
        headline: 'ACES Color Pipelines, Film Emulation Profiles & HDR Mastering',
        bio: 'Colorist behind commercial campaigns and feature narratives, specializing in custom film stock emulation and LUT modeling.',
        location: 'Madrid, Spain',
        skills: ['ACES Workflow', 'Color Science', 'HDR10+', 'Film Grain Modeling', 'DaVinci Resolve'],
      },
      {
        name: 'Astrid Lindholm',
        role: 'Nordic Landscape & Astrophotography Specialist',
        company: 'Aurora Borealis Expeditions',
        headline: 'Deep Night Exposures, Narrowband Filters & Cold-Weather Glass',
        bio: 'Capturing polar auroras, midnight sun landscapes, and deep-sky widefields across the Arctic circle.',
        location: 'Tromsø, Norway',
        skills: ['Astrophotography', 'Star Tracker Mounts', 'Lightroom Master', 'Extreme Weather Rigging'],
      },
      {
        name: 'Elias Thorne',
        role: 'Vintage Lens Restorer & Optical Craftsman',
        company: 'Heritage Glass Works',
        headline: 'Helios Anamorphic Mods, Aspherical Polishing & Flange Calibration',
        bio: 'Restoring mid-century Russian and German optical cinema glass with modern cine-mod housings.',
        location: 'Berlin, Germany',
        skills: ['Optical Collimation', 'Cine-Modding', 'Lens Coating', 'Bokeh Profiling'],
      },
      {
        name: 'Chloe Vandeberg',
        role: 'Commercial Fashion & Lighting Designer',
        company: 'Vogue & Studio Lumina',
        headline: 'Studio Strobe Modulation, Parabolic Modifiers & High-Key Editorial',
        bio: 'Lighting director for Paris and Milan fashion weeks with a focus on sculpting form through soft directional light.',
        location: 'Milan, Italy',
        skills: ['Profoto Rigs', 'Light Sculpting', 'Capture One Pro', 'High-End Retouching'],
      },
    ];
  } else if (combined.includes('space') || combined.includes('astronomy') || combined.includes('physics')) {
    templates = [
      {
        name: 'Dr. Hiroshi Tanaka',
        role: 'Principal Cosmologist & Payload Lead',
        company: 'Japan Aerospace Exploration Agency (JAXA)',
        headline: 'Quantum Sensors for Gravitational Waves & Deep Interstellar Space',
        bio: 'Leading spaceborne cryogenic quantum sensor payload design for solar system boundary mapping.',
        location: 'Tokyo, Japan',
        skills: ['Quantum Sensors', 'Cryogenics', 'Interferometry', 'Python', 'Relativity'],
      },
      {
        name: 'Alexander Patrick',
        role: 'Lead Flight Dynamics Specialist',
        company: 'Orbital Sciences Consortium',
        headline: 'Astrodynamics, Deep-Space Navigation & Ion Propulsion',
        bio: 'Specializing in trajectory optimization for interplanetary probes and Mars gravity-assist maneuvers.',
        location: 'Palo Alto, CA',
        skills: ['Orbital Mechanics', 'GMAT', 'SPICE', 'Python', 'C++'],
      },
      {
        name: 'Dr. Evelyn Foster',
        role: 'Exoplanet Atmospheres Researcher',
        company: 'Space Telescope Science Institute (STScI)',
        headline: 'JWST Transmission Spectroscopy & Biosignature Detection',
        bio: 'Analyzing infrared spectroscopic data from TRAPPIST-1 system to identify atmospheric methane and water vapor signatures.',
        location: 'Baltimore, MD',
        skills: ['Spectroscopy', 'JWST Pipelines', 'Radiative Transfer', 'Python', 'Bayesian Models'],
      },
      {
        name: 'Marcus Thorne',
        role: 'Propulsion Systems Architect',
        company: 'Apex Rocketry & Propulsion',
        headline: 'Staged-Combustion Methalox Engines & Aerospike Nozzles',
        bio: 'Hardware engineer with experience hot-firing regeneratively cooled rocket thrust chambers and turbopump manifolds.',
        location: 'Seattle, WA',
        skills: ['Combustion Instability', 'CFD Simulation', 'Additive Inconel', 'Hot-Fire Tests'],
      },
      {
        name: 'Dr. Priya Patel',
        role: 'Astrophysical Data Science Director',
        company: 'European Space Agency (ESA)',
        headline: 'Gaia Telescope Stellar Astrometry & Dark Matter Halos',
        bio: 'Mapping Milky Way dwarf galaxy stellar kinematics to constrain cold dark matter halo density profiles.',
        location: 'Darmstadt, Germany',
        skills: ['Astrometry', 'Dark Matter', 'Big Data Astrophysics', 'Statistical Inference'],
      },
      {
        name: 'Liam Chen',
        role: 'Spacecraft Thermal Control Engineer',
        company: 'Lunar Habitat Architectures',
        headline: 'Cryogenic Radiators, Multilayer Insulation & Regolith Shielding',
        bio: 'Designing passive thermal loops and radiation shields for long-duration lunar south pole surface expeditions.',
        location: 'Vancouver, Canada',
        skills: ['Thermal Modeling', 'MLI Blankets', 'Regolith Sintering', 'Space Environment'],
      },
    ];
  } else if (combined.includes('music') || combined.includes('audio') || combined.includes('sound')) {
    templates = [
      {
        name: 'Kaelen Miller',
        role: 'Audio Engineer & Modular Synth Designer',
        company: 'Frequency Resonance Labs',
        headline: 'Analog Voltage Control, DSP Filters & Granular Synthesis',
        bio: 'Designing eurorack synthesizer modules and custom spatial audio DSP algorithms for film scoring and immersive soundscapes.',
        location: 'Berlin, Germany',
        skills: ['Eurorack', 'DSP Programming', 'Ableton Live', 'Max/MSP', 'Audio Mastering'],
      },
      {
        name: 'Chloe Vandeberg',
        role: 'Multi-Instrumentalist & Orchestral Arranger',
        company: 'Nordic Symphony Collaborations',
        headline: 'Cinematic String Arrangements & Hybrid Acoustic-Electronic Scoring',
        bio: 'Classically trained cellist and composer scoring interactive game soundtracks and contemporary dance pieces.',
        location: 'Stockholm, Sweden',
        skills: ['Cello', 'Orchestration', 'Logic Pro', 'Spitfire Audio', 'Microtonal Composition'],
      },
      {
        name: 'Darius Thorne',
        role: 'Grammy-Nominated Mixing & Mastering Engineer',
        company: 'SubSonic Precision Studios',
        headline: 'Dolby Atmos Spatial Mixes, Tape Saturation & Low-End Control',
        bio: 'Over 12 years mixing electronic, hip-hop, and indie records, specializing in multidimensional Atmos mixes.',
        location: 'Atlanta, GA',
        skills: ['Dolby Atmos', 'Pro Tools HD', 'Analog Outboard', 'Phase Alignment', 'Mastering'],
      },
      {
        name: 'Maya Lin',
        role: 'Generative Audio AI Researcher',
        company: 'Neural Harmonix',
        headline: 'Diffusion Audio Generation & Neural Waveform Synthesizers',
        bio: 'Training generative latent diffusion models on raw audio to enable real-time interactive instrument timbre transfers.',
        location: 'San Francisco, CA',
        skills: ['PyTorch', 'Audio Diffusion', 'Vocoders', 'DSP', 'Python'],
      },
      {
        name: 'Antoine Mercier',
        role: 'Vintage Tube Mic & Preamp Designer',
        company: 'Acoustic Vacuum Systems',
        headline: 'Ribbon Microphone Transformers & Class-A Discrete Circuits',
        bio: 'Handcrafting studio ribbon microphones and discrete transformer-balanced tube preamplifiers.',
        location: 'Montreal, Canada',
        skills: ['Analog Electronics', 'Ribbon Mics', 'PCB Layout', 'Acoustic Chambers'],
      },
      {
        name: 'Amara Okafor',
        role: 'Sound Designer & Foley Artist',
        company: 'Atmospheric CineAudio',
        headline: 'Naturalist Foley Recording, Field Hydrophones & Sound Effects',
        bio: 'Capturing tactile organic textures and designing visceral acoustic layers for cinema and game worlds.',
        location: 'Bristol, UK',
        skills: ['Field Recording', 'Foley Art', 'Soundminer', 'Reaper', 'Surround Design'],
      },
    ];
  } else if (combined.includes('game') || combined.includes('gaming') || combined.includes('esports')) {
    templates = [
      {
        name: 'Liam Chen',
        role: 'Lead Graphics & Shading Engineer',
        company: 'Apex Interactive Games',
        headline: 'Real-Time Raytracing, Nanite Geometry & Vulkan Shaders',
        bio: 'Engine developer optimizing real-time GI and compute shader pipelines for competitive esports titles. Indie game jam winner.',
        location: 'Vancouver, Canada',
        skills: ['HLSL', 'Ray Tracing', 'Vulkan', 'C++', 'Unreal Engine 5'],
      },
      {
        name: 'George Allan',
        role: 'Community Scrim Organizer & Engine Dev',
        company: 'PixelForge Studios',
        headline: 'Vulkan Graphics Pipelines & Procedural Worldgen',
        bio: 'Building open-source rust game engine plugins and competitive esports scrimmage matchmaking.',
        location: 'Austin, TX',
        skills: ['Rust', 'Vulkan', 'Bevy Engine', 'HLSL', 'Networking'],
      },
      {
        name: 'Sora Takahashi',
        role: 'Competitive Esports Strategist & Analyst',
        company: 'Tokyo Vipers Esports',
        headline: 'Tactical Scrim VOD Reviews, Frame Data Analytics & Team Meta',
        bio: 'Coaching top-tier professional squads in tactical shooters and fighting games with probabilistic decision trees.',
        location: 'Tokyo, Japan',
        skills: ['VOD Analysis', 'Frame Data', 'Team Compositions', 'Anti-Stratting', 'Coaching'],
      },
      {
        name: 'Mac Roseville',
        role: 'VR & Spatial Game Designer',
        company: 'Spatial Realities Lab',
        headline: 'Low-Latency Haptic Feedback & XR Interfaces',
        bio: 'Developing spatial user interfaces and WebXR experiences with Three.js and WebGL.',
        location: 'Seattle, WA',
        skills: ['Three.js', 'WebXR', 'GLSL', 'Unity', 'C#'],
      },
      {
        name: 'Kaelen Miller',
        role: 'Procedural Level Architect & Tech Artist',
        company: 'Voxel Horizon Games',
        headline: 'Houdini PCG Pipelines, Biome Clustering & Destructible Meshes',
        bio: 'Generating vast open worlds using procedural rule sets and optimized runtime geometry instancing.',
        location: 'Melbourne, Australia',
        skills: ['Houdini', 'PCG Systems', 'Geometry Nodes', 'Performance Profiling'],
      },
      {
        name: 'Chloe Dubois',
        role: 'Combat Systems & Gameplay Programmer',
        company: 'IronClad Interactive',
        headline: 'Sub-Millisecond Hit Registration, Rollback Netcode & Animation Blending',
        bio: 'Engine programmer writing deterministic rollback netcode for multiplayer melee combat and hitboxes.',
        location: 'Montreal, Canada',
        skills: ['Rollback Netcode', 'Deterministic Physics', 'C++', 'Animation Trees'],
      },
    ];
  } else if (
    combined.includes('deep learning') ||
    combined.includes('deeplearning') ||
    combined.includes('neural compute') ||
    combined.includes('supercomputing')
  ) {
    templates = [
      {
        name: 'Dr. Marcus Vance',
        role: 'Distributed Systems & Cluster Architect',
        company: 'HyperCompute Systems Lab',
        headline: 'NCCL Ring All-Reduce, InfiniBand NDR & 1024-H100 Parallel Cluster Training',
        bio: 'Spearheading large-scale distributed training infrastructure, Triton FlashAttention-3 kernels, and low-latency network topologies.',
        location: 'San Francisco, CA',
        skills: ['PyTorch FSDP', 'Triton Kernels', 'NCCL', 'CUDA 12', 'InfiniBand'],
      },
      {
        name: 'Anna San',
        role: 'Kernel Optimization & Parallelism Fellow',
        company: 'Apex Neural Engine',
        headline: 'Triton Custom Ops, FP8 Mixed Precision & Zero-Bubble Pipeline Scheduling',
        bio: 'Optimizing high-throughput attention kernels and Megatron-LM tensor parallelisms for foundation model training runs.',
        location: 'Seattle, WA',
        skills: ['Triton', 'CUDA C++', 'Megatron-LM', 'FP8 Precision', 'Kernel Profiling'],
      },
      {
        name: 'David Sterling',
        role: 'Lead GPU Infrastructure Engineer',
        company: 'Distributed Supercomputing Core',
        headline: 'Kubernetes Slurm GPU Schedulers, NVLink Fabric & Checkpoint Resiliency',
        bio: 'Managing multi-node GPU clusters, async NVMe checkpoint storage, and automated node fault recovery protocols.',
        location: 'Austin, TX',
        skills: ['Slurm', 'Kubernetes', 'NVLink', 'RoCE v2', 'GPU Telemetry'],
      },
      {
        name: 'Dr. Elena Rostova',
        role: 'High-Throughput Inference Architect',
        company: 'Zurich Neural Accelerator Lab',
        headline: 'vLLM PagedAttention, TensorRT-LLM & Speculative Decoding Rigs',
        bio: 'Researching memory-efficient continuous batching and sub-millisecond time-to-first-token inference runtimes.',
        location: 'Zurich, Switzerland',
        skills: ['vLLM', 'TensorRT-LLM', 'Speculative Decoding', 'PagedAttention', 'C++'],
      },
      {
        name: 'Vikram Anand',
        role: 'Hardware Acceleration & Silicon Systems Lead',
        company: 'NextGen Silicon Foundry',
        headline: 'Custom AI ASIC Interconnects, Optical Switch Fabric & HBM3e Memory',
        bio: 'Designing next-generation scale-up memory architectures and low-power matrix multiplication accelerators.',
        location: 'San Jose, CA',
        skills: ['HBM3e', 'Optical Switching', 'PCIe Gen 6', 'ASIC Emulation', 'SystemVerilog'],
      },
      {
        name: 'Classie Willey',
        role: 'Cluster Reliability & Supercomputing Director',
        company: 'Global Compute Infrastructure',
        headline: '99.98% Multi-Petaflop Uptime, Liquid Immersion Cooling & Power Efficiency',
        bio: 'Directing multi-megawatt AI datacenter deployments, thermal load-balancing, and green compute initiatives.',
        location: 'Boulder, CO',
        skills: ['Liquid Cooling', 'Cluster Reliability', 'Power Allocation', 'Data Center Ops'],
      },
    ];
  } else {
    // Universal High-Impact Professional Template Roster (AI, Engineering, Startups, Science)
    templates = [
      {
        name: 'Anna San',
        role: 'Multimodal AI Research Fellow',
        company: 'Open Earth Foundation & AI Lab',
        headline: 'Agent Orchestration, Diffusion Models & Edge Inference Optimization',
        bio: 'Leading research on foundation model distillation and real-time on-device agent architectures.',
        location: 'San Francisco, CA',
        skills: ['PyTorch', 'Agent Orchestration', 'Model Quantization', 'Multimodal Vision', 'Python'],
      },
      {
        name: 'David Sterling',
        role: 'Principal Systems Architect',
        company: 'Apex Distributed Networks',
        headline: 'High-Concurrency Mesh Topologies, Raft Protocols & Zero-Knowledge Verification',
        bio: 'Architecting ultra-low latency event brokers and fault-tolerant distributed consensus networks.',
        location: 'New York, NY',
        skills: ['Distributed Systems', 'Rust', 'Consensus Protocols', 'Kafka', 'Go'],
      },
      {
        name: 'Dr. Elena Rostova',
        role: 'Neuroinformatics & Machine Learning Lead',
        company: 'Zurich Computational Institute',
        headline: 'Neuromorphic Spiking Architectures & Synaptic Plasticity Simulation',
        bio: 'Deploying biologically inspired low-power spiking neural networks for edge sensory devices.',
        location: 'Zurich, Switzerland',
        skills: ['Spiking Networks', 'Neuroinformatics', 'Python', 'CUDA', 'C++'],
      },
      {
        name: 'Classie Willey',
        role: 'Executive Director & Venture Partner',
        company: 'Global Innovation Initiative',
        headline: 'Climate Resilience Technology & Decentralized Utility Microgrids',
        bio: 'Connecting tech founders with regional infrastructure grants in developing nations.',
        location: 'Boston, MA',
        skills: ['Venture Strategy', 'Community Impact', 'Resource Optimization', 'ESG Audit'],
      },
      {
        name: 'Vikram Anand',
        role: 'Autonomous Systems & Robotics Specialist',
        company: 'Autonomous Motion Labs',
        headline: 'Sensor Fusion, Extended Kalman Filters & Visual SLAM Navigation',
        bio: 'Building real-time perception and path planning algorithms for autonomous micro-drones.',
        location: 'Austin, TX',
        skills: ['ROS 2', 'SLAM', 'Kalman Filters', 'C++', 'Embedded Linux'],
      },
      {
        name: 'Dr. Evelyn Foster',
        role: 'Computational Science Director',
        company: 'Quantum Frontier Research',
        headline: 'Hamiltonian Simulation, Tensor Networks & Variational Quantum Algorithms',
        bio: 'Developing hybrid classical-quantum algorithms to model complex molecular interactions.',
        location: 'Cambridge, MA',
        skills: ['Quantum Algorithms', 'Julia', 'Tensor Networks', 'Molecular Dynamics'],
      },
    ];
  }

  // Additional diverse professional community pool so every server has 18 unique people (+12 more members)
  const EXPANDED_MEMBER_POOL: DomainProfileTemplate[] = [
    {
      name: 'Maya Lin',
      role: 'Staff ML Engineer',
      company: 'Anthropic',
      headline: 'Agent Orchestration, Diffusion Models & Edge Inference optimization for low-latency production clusters',
      bio: 'Designing low-latency multimodal agent pipelines and quantized inference runtimes for edge and datacenter deployments.',
      location: 'San Francisco, CA',
      skills: ['PyTorch', 'Agent Orchestration', 'Model Quantization', 'Triton', 'CUDA'],
    },
    {
      name: 'Marcus Vance',
      role: 'Principal Distributed Systems Eng',
      company: 'Databricks',
      headline: 'High-Concurrency Mesh Topologies, Raft Consensus & Zero-Copy Distributed Storage Engines',
      bio: 'Architecting globally replicated consensus layers, streaming shuffle fabrics, and resilient GPU compute schedulers.',
      location: 'New York, NY',
      skills: ['Distributed Systems', 'Rust', 'Raft Consensus', 'Kubernetes', 'Go'],
    },
    {
      name: 'Zoe Kim',
      role: 'Senior Product Designer',
      company: 'Linear',
      headline: 'Design Systems, Spatial Interfaces & High-Craft Interaction Architecture for Developer Tools',
      bio: 'Crafting tactile, keyboard-first workflows and high-density data interfaces for engineering and research teams.',
      location: 'Seattle, WA',
      skills: ['Design Systems', 'Prototyping', 'Figma', 'WebGL', 'Motion Craft'],
    },
    {
      name: 'Tariq Al-Mansoor',
      role: 'Staff Security Researcher',
      company: 'Cloudflare',
      headline: 'Post-Quantum Cryptography, Zero-Trust Mesh Routing & Hardware Enclave Verification',
      bio: 'Researching lattice-based key exchange protocols and secure multi-party compute for edge networks.',
      location: 'London, UK',
      skills: ['Zero-Trust', 'Cryptography', 'Rust', 'eBPF', 'Security Audits'],
    },
    {
      name: 'Nadia Chernova',
      role: 'Lead Quantitative Researcher',
      company: 'Citadel Labs',
      headline: 'Stochastic Optimization, Low-Latency C++ Execution & Bayesian Time-Series Modeling',
      bio: 'Building real-time statistical inference engines and microsecond-scale market microstructure simulations.',
      location: 'Chicago, IL',
      skills: ['C++20', 'Bayesian Inference', 'Python', 'CUDA', 'Signal Processing'],
    },
    {
      name: 'Malik Washington',
      role: 'Staff Infrastructure Engineer',
      company: 'Stripe',
      headline: 'Multi-Region Fault Tolerance, Event-Driven Ledgers & Sub-10ms API Gateways',
      bio: 'Scaling high-reliability global transaction pipelines and automated chaos testing frameworks.',
      location: 'Atlanta, GA',
      skills: ['Go', 'Distributed Ledgers', 'Kafka', 'PostgreSQL', 'Observability'],
    },
    {
      name: 'Camille Laurent',
      role: 'AI Research Scientist',
      company: 'Mistral AI',
      headline: 'Sparse Mixture-of-Experts, Long-Context Attention & Multilingual Reasoning Benchmarks',
      bio: 'Investigating efficient MoE routing and synthetic curriculum generation for open-weights foundation models.',
      location: 'Paris, France',
      skills: ['Mixture of Experts', 'PyTorch', 'FlashAttention', 'NLP', 'Evaluations'],
    },
    {
      name: 'Jason Zhao',
      role: 'Founding Systems Engineer',
      company: 'Modal Labs',
      headline: 'Serverless GPU Cold-Start Optimization, Container Snapshots & Distributed File Systems',
      bio: 'Shrinking container boot latency to sub-second scales using lazy FUSE mounts and CRIU memory snapshots.',
      location: 'San Francisco, CA',
      skills: ['Linux Kernel', 'Rust', 'Containers', 'FUSE', 'GPU Scheduling'],
    },
    {
      name: 'Priya Patel',
      role: 'Director of Engineering',
      company: 'Scale AI',
      headline: 'Human-in-the-Loop Evaluation Pipelines, RLHF Tooling & Multimodal Data Flywheels',
      bio: 'Leading cross-functional teams building frontier benchmark harnesses and enterprise model evaluation suites.',
      location: 'Toronto, Canada',
      skills: ['RLHF', 'Data Pipelines', 'Engineering Leadership', 'Python', 'Eval Suites'],
    },
    {
      name: 'Anton Zeilinger',
      role: 'Principal Hardware Architect',
      company: 'NVIDIA',
      headline: 'NVLink Interconnect Topologies, Tensor Core Microarchitecture & Silicon Bring-Up',
      bio: 'Working on next-generation scale-up interconnects and memory coherency protocols for exascale AI clusters.',
      location: 'Munich, Germany',
      skills: ['SystemVerilog', 'NVLink', 'HBM3e', 'Computer Architecture', 'PCIe Gen6'],
    },
    {
      name: 'Hannah Park',
      role: 'Staff Frontend Architect',
      company: 'Vercel',
      headline: 'React Compiler Internals, Edge Rendering Streams & Local-First Sync Engines',
      bio: 'Optimizing collaborative web applications with CRDT state engines and sub-frame rendering pipelines.',
      location: 'Los Angeles, CA',
      skills: ['TypeScript', 'React', 'CRDTs', 'WebAssembly', 'Performance'],
    },
    {
      name: 'Mateo Silva',
      role: 'Robotics Perception Lead',
      company: 'Figure AI',
      headline: 'Real-Time 3D Gaussian Splatting, Tactile Grasping & Vision-Language-Action Policies',
      bio: 'Training dexterous manipulation policies that bridge visual foundation models with high-frequency motor control.',
      location: 'Sunnyvale, CA',
      skills: ['ROS 2', 'Computer Vision', 'VLA Models', 'C++', 'Kinematics'],
    },
    {
      name: 'Kenji Takahashi',
      role: 'Senior Compiler Engineer',
      company: 'Modular',
      headline: 'MLIR Graph Lowering, Polyhedral Loop Optimization & Heterogeneous Accelerator Targets',
      bio: 'Building portable compiler passes that automatically fuse attention and matrix ops across diverse silicon.',
      location: 'Tokyo, Japan',
      skills: ['MLIR', 'LLVM', 'C++', 'GPU Kernels', 'Compiler Design'],
    },
    {
      name: 'Amara Okafor',
      role: 'Staff Developer Advocate',
      company: 'Hugging Face',
      headline: 'Open-Source Model Ecosystems, Edge WebGPU Inference & Community Hackathons',
      bio: 'Empowering builders worldwide to fine-tune and run open models right in the browser with WebGPU.',
      location: 'London, UK',
      skills: ['Transformers', 'WebGPU', 'Open Source', 'Technical Writing', 'Python'],
    },
    {
      name: 'Liam Chen',
      role: 'Lead Graphics Engineer',
      company: 'Epic Games',
      headline: 'Real-Time Global Illumination, Vulkan Compute Shaders & Procedural Foliage Systems',
      bio: 'Pushing real-time raytracing and neural supersampling pipelines for interactive 3D worlds.',
      location: 'Vancouver, Canada',
      skills: ['Vulkan', 'HLSL', 'Ray Tracing', 'C++', 'Unreal Engine'],
    },
    {
      name: 'Astrid Lindholm',
      role: 'Principal Climate Tech Scientist',
      company: 'Northvolt Research',
      headline: 'Solid-State Battery Modeling, Grid Telemetry & Physics-Informed Neural Surrogates',
      bio: 'Accelerating electrochemical cell discovery using graph neural networks and high-throughput lab automation.',
      location: 'Stockholm, Sweden',
      skills: ['Physics-Informed ML', 'Graph Nets', 'Python', 'Energy Systems', 'Simulation'],
    },
  ];

  // Combine the 6 domain-specific members with 12 unique non-duplicate members from the expanded pool (18 total per server)
  const existingNames = new Set(templates.map((t) => t.name.toLowerCase().replace(/^dr\.\s+|^chef\s+|^grandmaster\s+/i, '').trim()));
  let seedHash = 0;
  for (let i = 0; i < (commId + community.name).length; i++) {
    seedHash = ((seedHash << 5) - seedHash + (commId + community.name).charCodeAt(i)) | 0;
  }
  const rotatedPool = [
    ...EXPANDED_MEMBER_POOL.slice(Math.abs(seedHash) % EXPANDED_MEMBER_POOL.length),
    ...EXPANDED_MEMBER_POOL.slice(0, Math.abs(seedHash) % EXPANDED_MEMBER_POOL.length),
  ];

  const mergedTemplates: DomainProfileTemplate[] = [...templates];
  for (const candidate of rotatedPool) {
    if (mergedTemplates.length >= 18) break;
    const normCand = candidate.name.toLowerCase().replace(/^dr\.\s+|^chef\s+|^grandmaster\s+/i, '').trim();
    if (!existingNames.has(normCand)) {
      existingNames.add(normCand);
      mergedTemplates.push(candidate);
    }
  }

  // Produce 18 unique members per server with unique gender-matched local portraits and rich directory metadata
  const usedAvatars = new Set<string>();
  const statusPattern = [
    'online', 'online', 'online', 'away', 'online', 'online',
    'online', 'away', 'online', 'offline', 'online', 'online',
    'away', 'online', 'offline', 'online', 'away', 'online',
  ] as const;

  return mergedTemplates.map((tpl, idx) => {
    const uniqueAvatar = getUniqueGenderMatchedPhoto(tpl.name, community.id + community.name, idx, usedAvatars);
    const cleanId = `mem_${community.id.replace(/[^a-z0-9]/gi, '_')}_${idx}_${tpl.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const deterministicSeed = Math.abs(seedHash + idx * 37);

    return {
      id: cleanId,
      name: tpl.name,
      avatar: uniqueAvatar,
      status: statusPattern[idx % statusPattern.length],
      role: tpl.role,
      company: tpl.company,
      headline: tpl.headline,
      bio: tpl.bio,
      location: tpl.location,
      linkedinUrl: `linkedin.com/in/${tpl.name.toLowerCase().replace(/\s+/g, '-')}`,
      githubUrl: `github.com/${tpl.name.toLowerCase().replace(/\s+/g, '')}`,
      skills: tpl.skills,
      contributionsCount: 140 + ((idx * 83 + community.name.length * 19) % 420),
      joinedDate: idx % 3 === 0 ? 'Member since 2023' : 'Member since 2024',
      safetyNumber: `${10000 + (deterministicSeed % 89999)} - ${10000 + ((deterministicSeed * 3) % 89999)} - ${10000 + ((deterministicSeed * 7) % 89999)} - ${10000 + ((deterministicSeed * 11) % 89999)} - ${10000 + ((deterministicSeed * 13) % 89999)}`,
      verified: idx < 12 || idx % 2 === 0,
      openToConnect: idx % 3 !== 2,
      sharedInterestsCount: 2 + ((deterministicSeed + idx) % 4),
    };
  });
}

/**
 * Returns deeply authentic, section-specific initial conversations for ANY channel in a community.
 * Shows unique responses accordingly in different sections (#general, #showcase, #resources, etc.)
 */
export function getChannelInitialMessages(
  community: Community,
  channel: CommunityChannel,
  members: ServerMember[]
): Message[] {
  return buildDomainChannelMessages(community, channel, members);
}

/**
 * Generates unique contextual responses from a server member when a user posts in a channel.
 * Takes into account the server topic, the channel name, and the user's message.
 */
export function getChannelDynamicResponse(
  community: Community,
  channel: CommunityChannel,
  userMessage: string,
  members: ServerMember[]
): { responder: ServerMember; text: string } {
  const responder = members[Math.floor(Math.random() * Math.min(members.length, 6))] || members[0];
  const channelName = channel.name.toLowerCase();
  const commName = community.name;
  const combined = `${commName} ${community.tags.join(' ')}`.toLowerCase();
  const msgLower = userMessage.toLowerCase();
  const firstName = responder.name.split(' ')[0];

  // Specific Domain: DEEP LEARNING SYSTEMS
  if (
    combined.includes('deep learning') ||
    combined.includes('deeplearning') ||
    combined.includes('neural compute') ||
    combined.includes('supercomputing')
  ) {
    if (channelName.includes('showcase')) {
      const dlShowcase = [
        `Incredible benchmarks, Jennies! Achieving 92% MFU on that 1024-H100 run with custom Triton kernels is phenomenal. Did you overlap the NCCL all-gather with forward compute?`,
        `Fascinating system architecture, Jennies! That speculative decoding pipeline cutting latency down to 14ms per token is ready for production.`,
        `Brilliant milestone, Jennies! Zero-bubble pipeline parallelism really proves its worth once you scale past 64 nodes.`,
      ];
      return { responder, text: dlShowcase[Math.floor(Math.random() * dlShowcase.length)] };
    }
    if (channelName.includes('resource')) {
      const dlResources = [
        `Thanks for sharing this benchmark breakdown, Jennies! We're testing these exact Triton FlashAttention-3 kernel configs on our cluster today.`,
        `Spot-on reference for #${channel.name}, Jennies! The section on InfiniBand adaptive routing and async NVMe checkpoints is gold.`,
        `Great paper drop, Jennies! Adding this to our pinned systems engineering reading list.`,
      ];
      return { responder, text: dlResources[Math.floor(Math.random() * dlResources.length)] };
    }
    if (channelName.includes('local')) {
      const dlLocal = [
        `Awesome to see you in the local cluster chapter, Jennies! Are you coming to the Bay Area HPC meetup this Thursday?`,
        `Count me in, Jennies! Several distributed systems engineers from our Austin datacenter group are presenting our Slurm scheduler benchmarks.`,
      ];
      return { responder, text: dlLocal[Math.floor(Math.random() * dlLocal.length)] };
    }
    const dlGeneral = [
      `Welcome to #${channel.name}, Jennies! Are you currently profiling PyTorch FSDP-2 communication overhead or tuning custom CUDA kernels?`,
      `Great insight, Jennies! With HBM3e bandwidth scaling, keeping tensor core utilization above 85% is where all the engineering effort is right now.`,
      `Excited to have you in Deep Learning Systems, Jennies! Feel free to ping me if you ever want to compare cluster telemetry benchmarks!`,
    ];
    return { responder, text: dlGeneral[Math.floor(Math.random() * dlGeneral.length)] };
  }

  // Specific Domain: CHESS
  if (combined.includes('chess')) {
    if (channelName.includes('showcase')) {
      const chessShowcase = [
        `Incredible tactical insight, Jennies! That maneuver completely destabilizes their pawn chain. Did you calculate the knight fork continuation on f7?`,
        `Fascinating game analysis, Jennies! The position after your rook lift on the open c-file is fundamentally winning.`,
        `Super sharp play, Jennies! Reminds me of Tal's classic attacking games. What was the time control on this game?`,
      ];
      return { responder, text: chessShowcase[Math.floor(Math.random() * chessShowcase.length)] };
    }
    if (channelName.includes('resource')) {
      const chessResources = [
        `Thanks for sharing this opening resource, Jennies! I'm bookmarking this for our blitz tournament prep.`,
        `Spot-on reference, Jennies. The section on bishop vs knight endgames with pawns on both wings is essential.`,
        `Great contribution to #${channel.name}, Jennies! I'll add this PGN database to our pinned resources.`,
      ];
      return { responder, text: chessResources[Math.floor(Math.random() * chessResources.length)] };
    }
    const chessGeneral = [
      `Welcome to #${channel.name}, Jennies! Are you currently analyzing opening theory or practicing rapid tactical calculation?`,
      `Great perspective, Jennies! In modern competitive play, prophylaxis and active piece coordination make all the difference.`,
      `Agreed, Jennies! Feel free to shoot me a DM if you'd like to play a friendly 5+3 sparring match anytime!`,
    ];
    return { responder, text: chessGeneral[Math.floor(Math.random() * chessGeneral.length)] };
  }

  // Specific Domain: COOKING / CULINARY
  if (combined.includes('cook') || combined.includes('culinary') || combined.includes('bake')) {
    if (channelName.includes('showcase')) {
      const culinaryShowcase = [
        `Magnifique presentation, Jennies! The color balance and sear on that dish look Michelin-worthy.`,
        `Incredible crust and crumb texture, Jennies! Did you bake with a pre-heated Dutch oven or steam injection?`,
        `That plating is inspiring, Jennies! The contrast between the rich sauce reduction and fresh herbs is perfection.`,
      ];
      return { responder, text: culinaryShowcase[Math.floor(Math.random() * culinaryShowcase.length)] };
    }
    if (channelName.includes('resource')) {
      const culinaryResources = [
        `Superb kitchen reference, Jennies! That hydration chart is going straight into my kitchen notebook.`,
        `Thanks for sharing this in #${channel.name}, Jennies! Sourcing raw heirloom ingredients makes a world of difference.`,
      ];
      return { responder, text: culinaryResources[Math.floor(Math.random() * culinaryResources.length)] };
    }
    const culinaryGeneral = [
      `Hello Jennies! Welcome to #${channel.name}. Seasoning at every stage of cooking is truly the secret to depth of flavor.`,
      `So true, Jennies! The Maillard reaction needs dry surface contact and steady heat control. What are you preparing next?`,
      `Delighted to have you in ${commName}, Jennies! Feel free to DM me if you want to swap heritage sourdough starter tips!`,
    ];
    return { responder, text: culinaryGeneral[Math.floor(Math.random() * culinaryGeneral.length)] };
  }

  // Specific Domain: SPACE / ASTRONOMY
  if (combined.includes('space') || combined.includes('astronomy') || combined.includes('physics')) {
    if (channelName.includes('showcase')) {
      const spaceShowcase = [
        `Breathtaking capture, Jennies! The signal-to-noise ratio in the H-alpha emission nebula is astonishing.`,
        `Sensational astrophotography, Jennies! How many hours of total integration time did you stack?`,
      ];
      return { responder, text: spaceShowcase[Math.floor(Math.random() * spaceShowcase.length)] };
    }
    const spaceGeneral = [
      `Greetings Jennies! Analyzing gravitational telemetry and orbital mechanics with practitioners here is always inspiring.`,
      `Fascinating observation, Jennies! The James Webb spectroscopic data supports that exact hypothesis.`,
    ];
    return { responder, text: spaceGeneral[Math.floor(Math.random() * spaceGeneral.length)] };
  }

  // Specific Domain: DIGITAL ART & VISUAL CREATORS
  if (combined.includes('art') || combined.includes('creative') || combined.includes('design') || combined.includes('visual')) {
    if (channelName.includes('gallery') || channelName.includes('showcase')) {
      const artShowcase = [
        `Incredible aesthetic, Jennies! The lighting falloff and specular highlights in your artwork look stunning. Did you render this with Octane or Cycles?`,
        `Fascinating composition, Jennies! That color palette harmony between the neon accents and deep shadows creates powerful visual rhythm.`,
        `Superb artwork, Jennies! The texture detail in the foreground elements really pulls the viewer in.`,
      ];
      return { responder, text: artShowcase[Math.floor(Math.random() * artShowcase.length)] };
    }
    if (channelName.includes('collab')) {
      const artCollabs = [
        `Count me in, Jennies! I'd love to collaborate on the UI styling and 3D visual assets for that project.`,
        `Great collaboration pitch, Jennies! I have high-resolution procedural textures and sprite sheets ready if you need them.`,
      ];
      return { responder, text: artCollabs[Math.floor(Math.random() * artCollabs.length)] };
    }
    if (channelName.includes('local')) {
      const artLocal = [
        `Awesome to see you in the local creators group, Jennies! Let's definitely do a studio visit or sketch walk soon!`,
        `Hey Jennies! Several local digital artists from our Tokyo/SF chapter are meeting up this weekend. Hope you can join!`,
      ];
      return { responder, text: artLocal[Math.floor(Math.random() * artLocal.length)] };
    }
    const artGeneral = [
      `Welcome to #${channel.name}, Jennies! Are you currently experimenting with generative procedural shaders or digital brush illustration?`,
      `Love your artistic perspective, Jennies! The interplay between organic forms and digital precision is such a rich territory.`,
    ];
    return { responder, text: artGeneral[Math.floor(Math.random() * artGeneral.length)] };
  }

  // Specific Domain: THEORETICAL & APPLIED PHYSICS
  if (combined.includes('physics') || combined.includes('quantum') || combined.includes('particle')) {
    if (channelName.includes('arxiv') || channelName.includes('preprint')) {
      const physPreprints = [
        `Fascinating paper reference, Jennies! The mathematical proof for topological coherence protection in those planar junctions is airtight.`,
        `Great preprint drop, Jennies! We've been analyzing that exact fluctuation theorem in our university study group.`,
      ];
      return { responder, text: physPreprints[Math.floor(Math.random() * physPreprints.length)] };
    }
    if (channelName.includes('sim')) {
      const physSims = [
        `Brilliant numerical simulation, Jennies! Achieving zero numerical drift on a 100-site quantum spin chain is textbook excellence.`,
        `Fascinating Julia solver, Jennies! What step size did you set for the split-step Fourier operator?`,
      ];
      return { responder, text: physSims[Math.floor(Math.random() * physSims.length)] };
    }
    if (channelName.includes('local')) {
      const physLocal = [
        `Greetings Jennies! Are you attending the ETH/MIT quantum colloquium dinner this week? Would be great to connect in person!`,
        `Welcome to the local physics cohort, Jennies! Let's discuss these topological manifold derivations over coffee.`,
      ];
      return { responder, text: physLocal[Math.floor(Math.random() * physLocal.length)] };
    }
  }

  // Specific Domain: MUSIC & SOUND DESIGN
  if (combined.includes('music') || combined.includes('sound') || combined.includes('audio') || combined.includes('synth')) {
    if (channelName.includes('track') || channelName.includes('feedback')) {
      const musicFeedback = [
        `That mix sounds punchy, Jennies! The low-end sub-bass ducking under the kick transient is sitting perfectly in the pocket.`,
        `Awesome stereo width on those synths, Jennies! Did you use mid/side EQ or Haas delay?`,
      ];
      return { responder, text: musicFeedback[Math.floor(Math.random() * musicFeedback.length)] };
    }
    if (channelName.includes('synth') || channelName.includes('daw')) {
      const musicGear = [
        `Spot-on routing, Jennies! Patching that LFO modulation into the wavetable morph parameter produces such organic timbre shifts.`,
        `Great DAW workflow tip, Jennies! Keeping buffer sizes at 64 samples keeps live tracking latency imperceptible.`,
      ];
      return { responder, text: musicGear[Math.floor(Math.random() * musicGear.length)] };
    }
  }

  // Specific Domain: HIKING & GLOBAL TRAILBLAZERS
  if (combined.includes('travel') || combined.includes('hike') || combined.includes('trail') || combined.includes('outdoor')) {
    if (channelName.includes('photo') || channelName.includes('mountain')) {
      const hikePhotos = [
        `Stunning summit capture, Jennies! That morning alpenglow lighting up the ridge is pure wilderness magic.`,
        `Incredible shot, Jennies! The clarity in the alpine glacial reflections is magnificent.`,
      ];
      return { responder, text: hikePhotos[Math.floor(Math.random() * hikePhotos.length)] };
    }
    if (channelName.includes('trail') || channelName.includes('guide')) {
      const hikeGuides = [
        `Essential backcountry advice, Jennies! Keeping that ultralight base weight under 4.5kg makes high-elevation passes so much more enjoyable.`,
        `Thanks for the trail update, Jennies! Good to know the snowmelt streams are still flowing near the ridge.`,
      ];
      return { responder, text: hikeGuides[Math.floor(Math.random() * hikeGuides.length)] };
    }
  }

  // Universal Section-Specific Logic for other servers
  if (channelName.includes('showcase') || channelName.includes('gallery')) {
    const genericShowcase = [
      `Fascinating showcase, Jennies! The execution and attention to detail in ${commName} is really inspiring.`,
      `Incredible work, Jennies! How long did it take you to refine this iteration? The results speak for themselves.`,
      `Love the aesthetic and technical depth here, Jennies! Adding this to my personal inspiration archive.`,
      `Awesome milestone, Jennies! We were discussing this exact approach in our working group yesterday.`,
    ];
    return { responder, text: genericShowcase[Math.floor(Math.random() * genericShowcase.length)] };
  }

  if (channelName.includes('resource') || channelName.includes('paper') || channelName.includes('guide')) {
    const genericResources = [
      `Thanks for sharing this in #${channel.name}, Jennies! I've bookmarked it for our team's upcoming sprint.`,
      `Spot-on reference, Jennies. The foundational principles align perfectly with what we're implementing.`,
      `Great addition to our #${channel.name} channel, Jennies! Really appreciate you contributing to the knowledge base here.`,
    ];
    return { responder, text: genericResources[Math.floor(Math.random() * genericResources.length)] };
  }

  // General Channel Universal Response
  const genericGeneral = [
    `Welcome to #${channel.name}, Jennies! In our ${commName} workflow, we're seeing identical dynamics play out.`,
    `Totally agree, Jennies! Let's keep exploring this thread. Feel free to DM me if you'd like to dive deeper one-on-one.`,
    `Really thoughtful observation, Jennies! Looking forward to collaborating with you here in ${commName}.`,
  ];
  return { responder, text: genericGeneral[Math.floor(Math.random() * genericGeneral.length)] };
}

/**
 * Intelligent persona response for ANY member in direct messages.
 */
export function getMemberDirectMessageResponse(
  member: User | ServerMember,
  userMessage: string
): string {
  const name = member.name.toLowerCase();
  const msg = userMessage.toLowerCase();

  // Specific custom handles if recognized
  if (name.includes('magnus') || name.includes('berg')) {
    if (msg.includes('hello') || msg.includes('hi')) {
      return "Greetings Jennies! Delighted to connect. Are you studying classical tournament openings or working on computer chess evaluations?";
    }
    return "Fascinating analysis, Jennies! In modern grandmaster preparation, calculating concrete tactical variations before evaluating candidate moves is essential.";
  }

  if (name.includes('sophie') || name.includes('laurent')) {
    if (msg.includes('hello') || msg.includes('hi')) {
      return "Bonjour Jennies! Wonderful to connect with you. Have you been experimenting with any new ingredients or techniques in the kitchen recently?";
    }
    return "Magnifique observation, Jennies! Temperature control and respecting the natural essence of seasonal ingredients always make the definitive difference.";
  }

  if (name.includes('julian') || name.includes('vance')) {
    if (msg.includes('hello') || msg.includes('hi')) {
      return "Hey Jennies! Great hearing from you. What cameras or focal lengths are you shooting with these days?";
    }
    return "Love that perspective, Jennies! Natural lighting combined with wide-aperture vintage lenses creates an unmatched organic texture.";
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello Jennies! Wonderful to connect with you directly. Delighted to be in the same network on Cronium!`;
  }

  if (msg.includes('project') || msg.includes('work') || msg.includes('collab')) {
    return `That sounds like a great initiative, Jennies! I'd love to share notes and explore how our backgrounds complement each other.`;
  }

  const roleText = 'role' in member ? member.role : member.customStatus || 'our shared interests';
  const replies = [
    `Thanks for the message, Jennies! I'm actively focusing on ${roleText} today. What are your latest thoughts on the implementation?`,
    `Great hearing from you, Jennies! Your perspective is super sharp. Let's definitely keep this conversation going.`,
    `Understood, Jennies! I'll take a look at the details and circle back with my thoughts shortly.`,
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}
