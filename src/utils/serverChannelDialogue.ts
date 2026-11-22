import { Community, CommunityChannel, Message, ServerMember } from '../types';
import { getDeterministicChatTimestamps } from './chatTimestamps';

interface RawDialogueEntry {
  senderIdx: number;
  text: string;
  minutesAgo: number;
  reactions?: { emoji: string; count: number }[];
}

export type DomainKey =
  | 'deeplearning'
  | 'ml'
  | 'art'
  | 'physics'
  | 'space'
  | 'startup'
  | 'robotics'
  | 'music'
  | 'travel'
  | 'greentech'
  | 'gaming'
  | 'chess'
  | 'culinary';

export function detectDomain(community: Community): DomainKey | 'dynamic' {
  const text = `${community.name} ${community.tags.join(' ')} ${community.description || ''}`.toLowerCase();

  if (text.includes('deep learning') || text.includes('deeplearning') || text.includes('neural compute') || text.includes('ai silicon') || text.includes('supercomputing')) return 'deeplearning';
  if (text.includes('art') || text.includes('design') || text.includes('creatives') || text.includes('sketch') || text.includes('illustration') || text.includes('3d') || text.includes('visual')) return 'art';
  if (text.includes('physics') || text.includes('quantum') || text.includes('theoretical') || text.includes('particle') || text.includes('deep tech')) return 'physics';
  if (text.includes('music') || text.includes('audio') || text.includes('synth') || text.includes('sound') || text.includes('producers') || text.includes('beat')) return 'music';
  if (text.includes('travel') || text.includes('hike') || text.includes('trailblazers') || text.includes('outdoor') || text.includes('expedition') || text.includes('mountain')) return 'travel';
  if (text.includes('green') || text.includes('sustain') || text.includes('climate') || text.includes('solar') || text.includes('energy') || text.includes('changemakers') || text.includes('social impact') || text.includes('world changers')) return 'greentech';
  if (text.includes('gaming') || text.includes('esports') || text.includes('game') || text.includes('gamers') || text.includes('night owl')) return 'gaming';
  if (text.includes('chess') || text.includes('grandmaster') || text.includes('tactics')) return 'chess';
  if (text.includes('cook') || text.includes('culinary') || text.includes('bake') || text.includes('food')) return 'culinary';
  if (text.includes('startup') || text.includes('founder') || text.includes('venture') || text.includes('entrepreneur') || text.includes('saas') || text.includes('builders') || text.includes('hackathon')) return 'startup';
  if (text.includes('robot') || text.includes('autonomous') || text.includes('drone') || text.includes('ros2') || text.includes('mechatronics')) return 'robotics';
  if (text.includes('machine learning') || text.includes('neural') || text.includes('ai') || text.includes('pytorch')) return 'ml';
  if (text.includes('space') || text.includes('astronomy') || text.includes('rocket') || text.includes('telescope') || text.includes('orbital') || text.includes('beyond earth')) return 'space';

  return 'dynamic';
}

export type SectionKey = 'general' | 'showcase' | 'resources' | 'local';

export function detectSection(channel: CommunityChannel): SectionKey {
  const name = channel.name.toLowerCase();
  if (name.includes('local') || name.includes('city') || name.includes('chapter') || name.includes('regional')) return 'local';
  if (
    name.includes('showcase') ||
    name.includes('gallery') ||
    name.includes('model-showcase') ||
    name.includes('pitch') ||
    name.includes('ideas') ||
    name.includes('startup-ideas') ||
    name.includes('track') ||
    name.includes('photo') ||
    name.includes('mountain-photos') ||
    name.includes('hardware') ||
    name.includes('stream') ||
    name.includes('astronomy') ||
    name.includes('astrophotography') ||
    name.includes('simulations') ||
    name.includes('quantum-sims')
  ) {
    return 'showcase';
  }
  if (
    name.includes('resource') ||
    name.includes('paper') ||
    name.includes('code') ||
    name.includes('guide') ||
    name.includes('trail-guides') ||
    name.includes('preprints') ||
    name.includes('arxiv') ||
    name.includes('gear') ||
    name.includes('synth-and-daw') ||
    name.includes('routes') ||
    name.includes('collab') ||
    name.includes('art-collabs') ||
    name.includes('hackathon') ||
    name.includes('hackathon-teams') ||
    name.includes('control') ||
    name.includes('events') ||
    name.includes('global-summits') ||
    name.includes('launch-streams') ||
    name.includes('lfg')
  ) {
    return 'resources';
  }
  return 'general';
}

/**
 * Computes a deterministic target message count between 21 and 28
 * unique for each server community and section channel.
 */
function getTargetMessageCount(commId: string, channelId: string): number {
  let hash = 0;
  const seed = `${commId}_${channelId}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  // Varies between 22 and 28
  return 22 + (Math.abs(hash) % 7);
}

export function buildDomainChannelMessages(
  community: Community,
  channel: CommunityChannel,
  members: ServerMember[]
): Message[] {
  const commName = community.name;
  const domain = detectDomain(community);
  const section = detectSection(channel);
  const now = Date.now();

  const getMember = (idx: number): ServerMember => {
    return members[idx % members.length] || members[0];
  };

  const targetCount = getTargetMessageCount(community.id, channel.id);
  let entries = getDomainSectionDialogue(domain, section, commName, getMember, community.tags);

  if (entries.length < targetCount) {
    entries = ensureTargetDialogue(entries, targetCount, section, commName, community.tags[0] || commName, domain);
  } else if (entries.length > targetCount) {
    entries = entries.slice(0, targetCount);
  }

  return formatEntriesToMessages(entries, community.id, channel, getMember, now);
}

function getDomainSectionDialogue(
  domain: DomainKey | 'dynamic',
  section: SectionKey,
  commName: string,
  getMember: (idx: number) => ServerMember,
  tags: string[]
): RawDialogueEntry[] {
  // 1. DEEP LEARNING SYSTEMS
  if (domain === 'deeplearning') {
    if (section === 'general') {
      return [
        { senderIdx: 0, text: `Welcome to Deep Learning Systems! This server is dedicated to multi-node training clusters, custom CUDA/Triton kernels, distributed parallelism, and inference engine scaling.`, minutesAgo: 1440, reactions: [{ emoji: '⚡', count: 14 }, { emoji: '🖥️', count: 9 }] },
        { senderIdx: 1, text: `Just finished scaling our PyTorch 2.5 FSDP (Fully Sharded Data Parallel) training run to 512 H100 SXM5 GPUs. We achieved 91.4% MFU (Model Flops Utilization)!`, minutesAgo: 1380, reactions: [{ emoji: '🔥', count: 12 }, { emoji: '🚀', count: 8 }] },
        { senderIdx: 2, text: `91.4% MFU is remarkable! Did you overlap all-gather collective communications with GEMM forward computations?`, minutesAgo: 1320 },
        { senderIdx: 1, text: `Yes, we enabled torch.compile with custom stream assignment so backward reduce-scatter overlaps seamlessly with the gradient calculation.`, minutesAgo: 1260, reactions: [{ emoji: '💡', count: 8 }] },
        { senderIdx: 3, text: `What InfiniBand topology are you running? NDR 400Gbps with fat-tree rail-optimized switches?`, minutesAgo: 1190 },
        { senderIdx: 4, text: `We are running 8x NDR NICs per server node with dual-rail fat-tree routing. Eliminating leaf switch oversubscription was essential for NCCL ring all-reduce.`, minutesAgo: 1110, reactions: [{ emoji: '🌐', count: 6 }] },
        { senderIdx: 5, text: `Has anyone benchmarked the FP8 GEMM kernels on Blackwell B200 compared to Hopper? The tensor core throughput is supposed to double.`, minutesAgo: 1030, reactions: [{ emoji: '📈', count: 7 }] },
        { senderIdx: 0, text: `Early lab runs show Blackwell FP8 matrix engines sustained 1.95x speedups on 4096-dimension feedforward projections with dynamic per-tensor scaling!`, minutesAgo: 950, reactions: [{ emoji: '🤯', count: 10 }] },
        { senderIdx: 2, text: `How are teams handling asynchronous checkpoint saving for trillion-token training runs without stalling compute cycles?`, minutesAgo: 870 },
        { senderIdx: 3, text: `We implemented async non-blocking checkpoint offloading to node-local NVMe-oF arrays: checkpointing a 70B model takes only 380ms of GPU lock time.`, minutesAgo: 790, reactions: [{ emoji: '💾', count: 7 }] },
        { senderIdx: 4, text: `Are people standardizing on Megatron-LM or DeepSpeed for pipeline parallelism when sequence lengths exceed 64k?`, minutesAgo: 710 },
        { senderIdx: 1, text: `Megatron-Core 3D parallelism (Tensor + Sequence + Pipeline parallel) provides cleaner bubble scheduling with 1F1B (One Forward, One Backward).`, minutesAgo: 630, reactions: [{ emoji: '📐', count: 6 }] },
        { senderIdx: 5, text: `We just rewrote our cross-entropy loss in Triton: saved 4.2GB of VRAM per GPU by avoiding the full logits materialization in HBM.`, minutesAgo: 550, reactions: [{ emoji: '⚡', count: 9 }] },
        { senderIdx: 0, text: `Avoiding logits materialization in high-vocab tokenizers is huge. Did you use online softmax normalization?`, minutesAgo: 470 },
        { senderIdx: 5, text: `Exactly! Online softmax accumulation in SRAM registers before writing the single scalar loss back to global memory.`, minutesAgo: 390, reactions: [{ emoji: '🎯', count: 8 }] },
        { senderIdx: 2, text: `Anyone profiling RoCE v2 vs InfiniBand for multi-node clusters in AWS/Azure?`, minutesAgo: 310 },
        { senderIdx: 3, text: `RoCE v2 is workable if you strictly tune PFC (Priority Flow Control) and ECN thresholds on your Arista/Cisco spine switches. Otherwise packet drops cause head-of-line blocking.`, minutesAgo: 240, reactions: [{ emoji: '🛡️', count: 5 }] },
        { senderIdx: 4, text: `For inference: we benchmarked TensorRT-LLM against vLLM on 8x L40S GPUs. Chunked prefill reduced our P99 time-to-first-token by 60%.`, minutesAgo: 170, reactions: [{ emoji: '🏎️', count: 7 }] },
        { senderIdx: 1, text: `Chunked prefill is essential when serving concurrent conversational streams alongside long-context document ingestion.`, minutesAgo: 110, reactions: [{ emoji: '🤝', count: 6 }] },
        { senderIdx: 2, text: `What thermal throttling levels are you observing under continuous 700W TDP on SXM5 sockets?`, minutesAgo: 70 },
        { senderIdx: 0, text: `With closed-loop liquid cooling manifolds, our GPU hotspot temperatures remain locked under 68°C even during sustained 48-hour continuous matrix GEMM burns.`, minutesAgo: 40, reactions: [{ emoji: '❄️', count: 9 }] },
        { senderIdx: 3, text: `Welcome to all distributed systems engineers, HPC architects, and kernel developers joining Deep Learning Systems!`, minutesAgo: 15, reactions: [{ emoji: '🎉', count: 8 }] },
        { senderIdx: 4, text: `Excited to collaborate with everyone. Dropping our latest cluster performance graphs in the showcase channel now!`, minutesAgo: 5, reactions: [{ emoji: '🚀', count: 6 }] },
      ];
    }
    if (section === 'showcase') {
      return [
        { senderIdx: 0, text: `Welcome to #showcase in Deep Learning Systems! Drop your cluster benchmarks, custom Triton/CUDA kernels, and infrastructure architectures here.`, minutesAgo: 1440, reactions: [{ emoji: '🚀', count: 12 }] },
        { senderIdx: 1, text: `Showcasing our 1,024-H100 cluster benchmark: trained a 40B dense transformer with Megatron-Core across 128 nodes with 92.1% weak scaling efficiency!`, minutesAgo: 1370, reactions: [{ emoji: '🏆', count: 15 }, { emoji: '🔥', count: 9 }] },
        { senderIdx: 2, text: `Incredible weak scaling! Did you encounter any silent data corruption (SDC) or single-bit ECC faults during the multi-day run?`, minutesAgo: 1290 },
        { senderIdx: 1, text: `We had our health-check daemon catch 2 transient memory ECC flips on node 47; automatic checkpoint rollback resumed training within 90 seconds.`, minutesAgo: 1210, reactions: [{ emoji: '🛡️', count: 7 }] },
        { senderIdx: 3, text: `Showcasing our open-source Triton FlashAttention-3 implementation with FP8 accumulation: achieves 1,180 TFLOPs per H100!`, minutesAgo: 1120, reactions: [{ emoji: '⚡', count: 11 }, { emoji: '⭐', count: 8 }] },
        { senderIdx: 4, text: `Just cloned your repo and ran the pytest kernel test suite on our DGX node—numerically exact against PyTorch reference with 2.1x speedup!`, minutesAgo: 1040, reactions: [{ emoji: '👏', count: 6 }] },
        { senderIdx: 5, text: `Demoing our automated GPU cluster scheduler: dynamically balances batch sizes across heterogeneous A100 and H100 pools to maximize collective utilization.`, minutesAgo: 960, reactions: [{ emoji: '📊', count: 7 }] },
        { senderIdx: 0, text: `The real-time Grafana dashboard visualizer tracking NCCL bus bandwidth per switch port is spectacular. Pinned!`, minutesAgo: 880, reactions: [{ emoji: '📌', count: 5 }] },
        { senderIdx: 2, text: `Released our distributed checkpoint sharding toolkit: splits massive model tensors into zero-overhead zarr/safetensors chunks.`, minutesAgo: 790, reactions: [{ emoji: '💾', count: 8 }] },
        { senderIdx: 3, text: `Benchmarking vLLM with speculative decoding on 2x H100: achieved 2,800 tokens/sec throughput for our production API gateway.`, minutesAgo: 700, reactions: [{ emoji: '🏎️', count: 9 }] },
        { senderIdx: 4, text: `Showcasing our CUDA kernel for block-sparse rotary positional embeddings: cuts kernel launch latency down from 42µs to 8µs.`, minutesAgo: 610, reactions: [{ emoji: '⚙️', count: 8 }] },
        { senderIdx: 5, text: `What shared memory footprint did your block-sparse kernel require per streaming multiprocessor?`, minutesAgo: 520 },
        { senderIdx: 4, text: `Only 48KB per SM, leaving plenty of occupancy for concurrent warp scheduling across Hopper's 132 SMs!`, minutesAgo: 430, reactions: [{ emoji: '📐', count: 6 }] },
        { senderIdx: 1, text: `We just open-sourced our Slurm multi-node health-check script that tests all InfiniBand links before allocating any GPU job.`, minutesAgo: 340, reactions: [{ emoji: '🛡️', count: 9 }] },
        { senderIdx: 0, text: `This health-check script has saved our lab hundreds of hours of stranded compute. Pinned to channel resources!`, minutesAgo: 250, reactions: [{ emoji: '🙌', count: 7 }] },
        { senderIdx: 2, text: `Benchmark comparison between NVLink 4 (900 GB/s) and PCIe Gen 5 (128 GB/s) for tensor parallelism posted above.`, minutesAgo: 160, reactions: [{ emoji: '📈', count: 8 }] },
        { senderIdx: 3, text: `Noticeable cliff once tensor parallel size exceeds 8 nodes without NVLink switches—fat-tree network becomes the strict ceiling.`, minutesAgo: 90, reactions: [{ emoji: '💡', count: 6 }] },
        { senderIdx: 5, text: `Uploaded our FP8 dynamic quantization calibration configs for Llama-3-70B: zero perplexity loss measured on WikiText-2!`, minutesAgo: 30, reactions: [{ emoji: '✨', count: 8 }] },
      ];
    }
    if (section === 'resources') {
      return [
        { senderIdx: 0, text: `Deep Learning Systems Resource Vault: Pinned kernel repositories, NCCL tuning flags, cluster orchestration configs, and hardware whitepapers.`, minutesAgo: 1440, reactions: [{ emoji: '📚', count: 12 }] },
        { senderIdx: 1, text: `Cheat sheet: Essential NCCL environment variables for InfiniBand clusters (NCCL_IB_HCA, NCCL_IB_TC, NCCL_NET_GDR_LEVEL=5).`, minutesAgo: 1370, reactions: [{ emoji: '🛠️', count: 10 }] },
        { senderIdx: 2, text: `Paper reference: 'Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism'—the foundational guide for 3D parallelism.`, minutesAgo: 1290, reactions: [{ emoji: '📄', count: 8 }] },
        { senderIdx: 3, text: `Link to our open GitHub template for multi-node Slurm job submission with automated PyTorch Elastic rendezvous.`, minutesAgo: 1200, reactions: [{ emoji: '💻', count: 9 }] },
        { senderIdx: 4, text: `Hardware spec matrix: H100 vs H200 vs B200 SXM memory bandwidth, TDP, FP8 TFLOPs, and NVLink generation comparison table.`, minutesAgo: 1110, reactions: [{ emoji: '📊', count: 11 }] },
        { senderIdx: 5, text: `Deep dive blog post: 'Understanding Hopper TMA (Tensor Memory Accelerator) and Asynchronous Data Copies in CUDA C++.'`, minutesAgo: 1010, reactions: [{ emoji: '📖', count: 8 }] },
        { senderIdx: 0, text: `Guide to setting up RoCE v2 with DSCP-to-COS priority mapping and PFC watchdog on Mellanox ConnectX-6/ConnectX-7 NICs.`, minutesAgo: 910, reactions: [{ emoji: '🌐', count: 7 }] },
        { senderIdx: 1, text: `Repository: PyTorch FSDP-2 mixed-precision training recipes with activation checkpointing and CPU offloading options.`, minutesAgo: 820, reactions: [{ emoji: '⚡', count: 9 }] },
        { senderIdx: 2, text: `Reference documentation on FlashAttention-3: warp-specialized ping-pong GEMM kernels and FP8 tensor core accumulation.`, minutesAgo: 710, reactions: [{ emoji: '📐', count: 8 }] },
        { senderIdx: 3, text: `Pinned repository: Production Docker images with pre-built CUDA 12.4, FlashAttention-3, vLLM, and PyTorch 2.5 with multi-architecture wheels.`, minutesAgo: 120, reactions: [{ emoji: '🐳', count: 9 }] },
        { senderIdx: 4, text: `Thank you for maintaining this resource hub! The signal-to-noise ratio in Deep Learning Systems is unparalleled.`, minutesAgo: 50, reactions: [{ emoji: '🤝', count: 8 }] },
        { senderIdx: 5, text: `If anyone has benchmarks comparing CXL memory pooling for KV cache expansion, please share below!`, minutesAgo: 12, reactions: [{ emoji: '💬', count: 4 }] },
      ];
    }
    // local
    return [
      { senderIdx: 0, text: `Welcome to #local-conversation for Deep Learning Systems! Connect with systems engineers, datacenter architects, and HPC researchers in your local city chapter.`, minutesAgo: 1440, reactions: [{ emoji: '📍', count: 12 }] },
      { senderIdx: 1, text: `Bay Area Systems Cohort: hosting an informal GPU cluster infrastructure & Triton kernel night at South Park in San Francisco this Thursday at 6:30 PM!`, minutesAgo: 1370, reactions: [{ emoji: '🌉', count: 11 }, { emoji: '☕', count: 8 }] },
      { senderIdx: 2, text: `I'll be there! Can bring our team's thermal imaging graphs from our 256-node liquid-cooled cluster.`, minutesAgo: 1290, reactions: [{ emoji: '🙌', count: 7 }] },
      { senderIdx: 3, text: `Seattle HPC Chapter: meeting at South Lake Union for coffee and a walkthrough of distributed checkpoint recovery protocols. Who's in?`, minutesAgo: 1200, reactions: [{ emoji: '🌲', count: 8 }] },
      { senderIdx: 4, text: `Count me in for Seattle! Would love to compare Slurm multi-node job scripts.`, minutesAgo: 1110, reactions: [{ emoji: '👍', count: 6 }] },
      { senderIdx: 5, text: `Austin AI Silicon & Hardware meet: organizing a co-working hack session on custom FPGA and accelerator emulation at Capital Factory next Tuesday.`, minutesAgo: 1020, reactions: [{ emoji: '🤠', count: 9 }] },
      { senderIdx: 0, text: `Zurich / Swiss Systems Circle: organizing an ETH High-Performance Computing datacenter tour and dinner on the 18th. DM to RSVP!`, minutesAgo: 930, reactions: [{ emoji: '🇨🇭', count: 10 }] },
      { senderIdx: 1, text: `Tokyo AI Systems group: anyone attending the HPC Asia conference in Akihabara next month? Let's do a community dinner meetup!`, minutesAgo: 840, reactions: [{ emoji: '🗼', count: 7 }] },
      { senderIdx: 2, text: `I will be presenting our paper on low-latency tensor parallelism at the conference. Looking forward to meeting Tokyo members!`, minutesAgo: 750, reactions: [{ emoji: '🎤', count: 6 }] },
      { senderIdx: 3, text: `London Systems Engineers: pints and distributed systems discussions in Shoreditch this Friday evening. All HPC and GPU practitioners welcome.`, minutesAgo: 660, reactions: [{ emoji: '🇬🇧', count: 8 }] },
      { senderIdx: 4, text: `Boston / Cambridge group: hosting an ArXiv reading circle on distributed inference optimization at MIT Stata Center on Saturday afternoon.`, minutesAgo: 570, reactions: [{ emoji: '🏛️', count: 7 }] },
      { senderIdx: 5, text: `Toronto Vector Institute builders: organizing a local study group on hardware-aware model quantization at Mars Discovery District.`, minutesAgo: 480, reactions: [{ emoji: '🍁', count: 6 }] },
    ];
  }

  // 2. DIGITAL ARTISTS & VISUAL CREATORS (#gallery-showcase, #art-collabs, #local-conversation)
  if (domain === 'art') {
    if (section === 'showcase') {
      // #gallery-showcase
      return [
        { senderIdx: 0, text: `Welcome to #gallery-showcase! Share your 3D procedural sculpts, digital illustrations, concept art, and shader experiments.`, minutesAgo: 1440, reactions: [{ emoji: '🎨', count: 15 }, { emoji: '✨', count: 11 }] },
        { senderIdx: 1, text: `Finished my procedural crystal cavern environment in Blender 4.2 using geometry nodes! 4K render took 18 minutes on an RTX 4090.`, minutesAgo: 1380, reactions: [{ emoji: '💎', count: 14 }, { emoji: '🔥', count: 9 }] },
        { senderIdx: 2, text: `The subsurface scattering on the quartz facets looks completely photorealistic! Did you use custom microfacet roughness maps?`, minutesAgo: 1310 },
        { senderIdx: 1, text: `Yes! Multi-layered anisotropic roughness with slight chromatic dispersion in the glass BSDF shader.`, minutesAgo: 1250, reactions: [{ emoji: '💡', count: 8 }] },
        { senderIdx: 3, text: `Sharing my cyberpunk street market concept piece: painted in Procreate with over 40 distinct neon sign lighting layers.`, minutesAgo: 1180, reactions: [{ emoji: '🌃', count: 12 }, { emoji: '🚀', count: 7 }] },
        { senderIdx: 4, text: `The atmospheric volumetric rain fog reflections on the wet asphalt are jaw-dropping. Beautiful composition!`, minutesAgo: 1100, reactions: [{ emoji: '👏', count: 8 }] },
        { senderIdx: 5, text: `Testing real-time volumetric raymarching in WebGPU: rendering a morphing 4D quaternion fractal at 60 FPS in browser!`, minutesAgo: 1020, reactions: [{ emoji: '🌀', count: 10 }] },
        { senderIdx: 0, text: `The WebGPU demo runs buttery smooth on Safari M3. The SDF (Signed Distance Field) lighting falloff is so clean.`, minutesAgo: 940, reactions: [{ emoji: '⚡', count: 6 }] },
        { senderIdx: 2, text: `Completed character design sheets for our dark fantasy comic: high-resolution orthographic views and armor detail closeups.`, minutesAgo: 860, reactions: [{ emoji: '⚔️', count: 9 }] },
        { senderIdx: 3, text: `Love the silhouette contrast between the heavy plate cuirass and the fluid silk mantle. Great anatomy proportions.`, minutesAgo: 780, reactions: [{ emoji: '❤️', count: 7 }] },
        { senderIdx: 4, text: `Color grading study: 35mm Kodak Portra 400 film grain emulation applied to digital mirrorless RAW shots.`, minutesAgo: 700, reactions: [{ emoji: '📷', count: 8 }] },
        { senderIdx: 5, text: `The warmth in the skin midtones and soft halation around street lamps nails that authentic analog emulsion feel!`, minutesAgo: 620, reactions: [{ emoji: '🎞️', count: 9 }] },
        { senderIdx: 1, text: `Rigged a fully dynamic wind-driven cloth sim in Houdini for our indie game trailer. 120,000 polygon mesh with zero self-intersection.`, minutesAgo: 540, reactions: [{ emoji: '🌪️', count: 7 }] },
        { senderIdx: 0, text: `Vellum solver in Houdini is magic. Did you cache the bgeo sequences directly to SSD?`, minutesAgo: 460 },
        { senderIdx: 1, text: `Cached to NVMe array with point velocity vectors for native motion blur in Octane render!`, minutesAgo: 380, reactions: [{ emoji: '🎬', count: 6 }] },
        { senderIdx: 2, text: `New animated vector icon set designed in Illustrator & Lottie: sub-10KB file size with silky smooth hover states.`, minutesAgo: 290, reactions: [{ emoji: '📐', count: 8 }] },
        { senderIdx: 3, text: `Drop the Figma community link when you publish! Our product UI team would love to test these icons.`, minutesAgo: 210, reactions: [{ emoji: '⭐', count: 7 }] },
        { senderIdx: 4, text: `Sculpted an organic alien bio-luminescent creature in ZBrush: 38 million polys with dynamesh pores and vascular ridges.`, minutesAgo: 140, reactions: [{ emoji: '👾', count: 11 }] },
        { senderIdx: 5, text: `The translucent skin shader over the internal glowing organ nodes is terrifyingly beautiful. Spectacular sculpt!`, minutesAgo: 80, reactions: [{ emoji: '🙌', count: 8 }] },
        { senderIdx: 0, text: `Incredible showcase week across 3D, vector, and concept art! Pinned the top three community artworks to the header.`, minutesAgo: 20, reactions: [{ emoji: '🏆', count: 12 }] },
      ];
    }
    if (section === 'resources') {
      // #art-collabs
      return [
        { senderIdx: 0, text: `Welcome to #art-collabs! Form squads with game developers, find 3D modelers, UI designers, and technical shader artists.`, minutesAgo: 1440, reactions: [{ emoji: '🤝', count: 14 }, { emoji: '🎮', count: 9 }] },
        { senderIdx: 1, text: `Looking for a 2D pixel artist or concept illustrator to collaborate on a rogue-lite sci-fi dungeon crawler built in Bevy Rust!`, minutesAgo: 1370, reactions: [{ emoji: '👾', count: 8 }] },
        { senderIdx: 2, text: `I specialize in 32x32 character sprite sheets, attack animations, and tilesets! Sending you my ArtStation portfolio in DMs.`, minutesAgo: 1290, reactions: [{ emoji: '🎨', count: 9 }] },
        { senderIdx: 1, text: `Your sprite animation timing is incredible! Let's sync up on the character movement state machine tonight.`, minutesAgo: 1210, reactions: [{ emoji: '🚀', count: 6 }] },
        { senderIdx: 3, text: `UI/UX designer looking for an engineer with Three.js / WebGL experience to build an interactive 3D portfolio showcase.`, minutesAgo: 1120, reactions: [{ emoji: '💻', count: 7 }] },
        { senderIdx: 4, text: `I've built several Three.js shader experiences with React-Three-Fiber. Would love to bring your Figma design prototypes to life!`, minutesAgo: 1040, reactions: [{ emoji: '✨', count: 8 }] },
        { senderIdx: 5, text: `Sound designer offering custom synthesized ambient audio and UI feedback chimes for any game or app projects in development.`, minutesAgo: 950, reactions: [{ emoji: '🎧', count: 10 }] },
        { senderIdx: 0, text: `Check the channel pins: Pinned our open collaboration agreement and CC0 game asset repository directory!`, minutesAgo: 860, reactions: [{ emoji: '📌', count: 6 }] },
        { senderIdx: 2, text: `Forming a team for next month's 72-Hour Ludum Dare Game Jam! We need 1 environment artist and 1 level designer.`, minutesAgo: 770, reactions: [{ emoji: '🏆', count: 9 }] },
        { senderIdx: 3, text: `Count me in for environment art! I have a full library of low-poly modular dungeon props ready to texture.`, minutesAgo: 680, reactions: [{ emoji: '🏰', count: 7 }] },
        { senderIdx: 4, text: `Any 3D modelers available to UV unwrap and bake normal maps for 8 weapon models? Budget available for freelance sprint.`, minutesAgo: 590 },
        { senderIdx: 5, text: `I can handle the UV packing and Substance Painter bakes! Sending you my previous weapon modeling examples.`, minutesAgo: 500, reactions: [{ emoji: '⚔️', count: 6 }] },
        { senderIdx: 1, text: `Our game demo just got greenlit for Steam Next Fest thanks to the character art collaboration from this channel!`, minutesAgo: 410, reactions: [{ emoji: '🎉', count: 16 }, { emoji: '🍾', count: 11 }] },
        { senderIdx: 0, text: `Huge congratulations! Proof that pairing great artists with talented developers creates magic.`, minutesAgo: 320, reactions: [{ emoji: '❤️', count: 10 }] },
        { senderIdx: 2, text: `Reminder: When sharing WIP assets in collabs, export in glTF 2.0 or FBX with embedded textures for easiest engine import!`, minutesAgo: 230, reactions: [{ emoji: '📦', count: 7 }] },
        { senderIdx: 3, text: `Looking for constructive critique on our game UI HUD layout before finalizing vector sprites. Uploaded mockups above!`, minutesAgo: 150, reactions: [{ emoji: '👀', count: 5 }] },
        { senderIdx: 4, text: `The health bar contrast is good, but consider scaling up the ammo counter by 15% for mobile/handheld legibility.`, minutesAgo: 90, reactions: [{ emoji: '💡', count: 6 }] },
        { senderIdx: 5, text: `Excited for everyone teaming up! Let's keep building unforgettable creative interactive worlds together.`, minutesAgo: 25, reactions: [{ emoji: '🌟', count: 8 }] },
      ];
    }
    // local
    return [
      { senderIdx: 0, text: `Welcome to #local-conversation for Digital Artists & Visual Creators! Connect with local illustrators, 3D artists, and creative technologists in your area.`, minutesAgo: 1440, reactions: [{ emoji: '📍', count: 12 }] },
      { senderIdx: 1, text: `Tokyo Creative Cohort: Sketch walk and digital art meetup through Akihabara & Ueno Park this Saturday morning at 10 AM!`, minutesAgo: 1370, reactions: [{ emoji: '🗼', count: 12 }, { emoji: '🎨', count: 9 }] },
      { senderIdx: 2, text: `I'll be there with my iPad Pro! Can share my favorite Procreate natural charcoal and watercolor brush sets.`, minutesAgo: 1290, reactions: [{ emoji: '☕', count: 8 }] },
      { senderIdx: 3, text: `London Digital Artists: Meeting at the Tate Modern cafe for a gallery tour and afternoon coffee sketching session next Sunday.`, minutesAgo: 1200, reactions: [{ emoji: '🇬🇧', count: 9 }] },
      { senderIdx: 4, text: `San Francisco Design District: Co-working sprint at Sightglass Coffee this Thursday at 2 PM. Laptop/tablet battery packs provided!`, minutesAgo: 1110, reactions: [{ emoji: '🌉', count: 7 }] },
      { senderIdx: 5, text: `New York City artists: DUMBO Brooklyn waterfront golden hour photo walk and plein air digital painting meet this Friday.`, minutesAgo: 1020, reactions: [{ emoji: '🗽', count: 10 }] },
      { senderIdx: 0, text: `Paris Visual Arts group: Meeting at Palais de Tokyo for the digital media installation exhibit next Wednesday evening!`, minutesAgo: 930, reactions: [{ emoji: '🇫🇷', count: 8 }] },
      { senderIdx: 1, text: `Berlin digital creatives: Co-working day and Blender geometry nodes walkthrough at Betahaus Kreuzberg this Tuesday.`, minutesAgo: 840, reactions: [{ emoji: '🇩🇪', count: 7 }] },
      { senderIdx: 2, text: `Seattle Creators: Coffee and concept art portfolio review circle at Capitol Hill this Saturday morning!`, minutesAgo: 730, reactions: [{ emoji: '🌲', count: 6 }] },
      { senderIdx: 3, text: `Los Angeles Cinema & VFX circle: Gathering in Burbank to talk Unreal Engine 5 virtual production stages and LED volumes.`, minutesAgo: 610, reactions: [{ emoji: '🎬', count: 8 }] },
      { senderIdx: 4, text: `Melbourne & Sydney creators: Weekend digital art jam and print swap meetup scheduled for next month! RSVP in DMs.`, minutesAgo: 480, reactions: [{ emoji: '🇦🇺', count: 7 }] },
      { senderIdx: 5, text: `Reach out via Direct Messages to any member in your city to set up local studio visits or coffee portfolio sparring!`, minutesAgo: 290, reactions: [{ emoji: '💬', count: 8 }] },
      { senderIdx: 0, text: `What city or creative studio are you creating from today? Say hi to your fellow local visual creators!`, minutesAgo: 60, reactions: [{ emoji: '👋', count: 11 }] },
    ];
  }

  // 3. THEORETICAL PHYSICS & APPLIED PHYSICS SOCIETY (#arxiv-physics, #quantum-sims, #local-conversation)
  if (domain === 'physics') {
    if (section === 'resources') {
      // #arxiv-physics (papers, preprints, math breakdown)
      return [
        { senderIdx: 0, text: `Welcome to #arxiv-physics! Weekly preprint reviews, mathematical formulations, quantum hardware papers, and field theory derivations.`, minutesAgo: 1440, reactions: [{ emoji: '⚛️', count: 16 }, { emoji: '📄', count: 10 }] },
        { senderIdx: 1, text: `Reviewing preprint arXiv:2410.18921 on topological Majorana bound states in planar Josephson junctions: 4x coherence protection observed!`, minutesAgo: 1380, reactions: [{ emoji: '🔬', count: 12 }, { emoji: '💡', count: 8 }] },
        { senderIdx: 2, text: `The magnetic field alignment in their epitaxial Al-InAs heterostructures suppressed quasiparticle poisoning dramatically.`, minutesAgo: 1310 },
        { senderIdx: 3, text: `Did they measure fractional Josephson effect with 4π-periodic current-phase relations under microwave irradiation?`, minutesAgo: 1240 },
        { senderIdx: 1, text: `Yes, missing Shapiro steps at odd integers confirmed the topological 4π periodicity at 15 millikelvin!`, minutesAgo: 1170, reactions: [{ emoji: '📈', count: 9 }] },
        { senderIdx: 4, text: `Paper alert: Non-equilibrium thermodynamics of active matter under chiral boundary conditions published in Physical Review Letters.`, minutesAgo: 1090, reactions: [{ emoji: '📚', count: 7 }] },
        { senderIdx: 5, text: `The generalized fluctuation-dissipation theorem they derived for breaking time-reversal symmetry is mathematically elegant.`, minutesAgo: 1010, reactions: [{ emoji: '📐', count: 6 }] },
        { senderIdx: 0, text: `Anyone analyzing the transmon superconducting qubit pulse calibration benchmarks from IBM Quantum's Heron processor?`, minutesAgo: 930 },
        { senderIdx: 2, text: `Two-qubit gate error rates dropped below 0.18% using dynamic DRAG (Derivative Removal by Adiabatic Gate) pulse shaping.`, minutesAgo: 850, reactions: [{ emoji: '🎯', count: 8 }] },
        { senderIdx: 3, text: `Suppressing leakage into the non-computational |2⟩ state with DRAG is critical for fault-tolerant surface code syndroming.`, minutesAgo: 770, reactions: [{ emoji: '🛡️', count: 7 }] },
        { senderIdx: 4, text: `Derivation question: In AdS/CFT holographic entanglement entropy, how do you handle extremal surface Ryu-Takayanagi divergences?`, minutesAgo: 690 },
        { senderIdx: 5, text: `You introduce a Fefferman-Graham coordinate UV cutoff at the conformal boundary; the leading pole matches the boundary CFT area law!`, minutesAgo: 610, reactions: [{ emoji: '🧠', count: 10 }] },
        { senderIdx: 0, text: `Pinned the step-by-step LaTeX derivation of the boundary counter-term subtraction in the channel header!`, minutesAgo: 520, reactions: [{ emoji: '📌', count: 7 }] },
        { senderIdx: 1, text: `Neutrino physics update: Katrin experiment constrained electron neutrino effective mass upper bound to < 0.45 eV at 90% CL.`, minutesAgo: 430, reactions: [{ emoji: '🌌', count: 8 }] },
        { senderIdx: 2, text: `Direct kinematic tritium beta-decay spectroscopy remains the most model-independent measurement we have.`, minutesAgo: 350, reactions: [{ emoji: '🧪', count: 6 }] },
        { senderIdx: 3, text: `Check out this breakdown of quantum error mitigation via Zero-Noise Extrapolation (ZNE) with Richardson polynomials.`, minutesAgo: 260, reactions: [{ emoji: '📊', count: 7 }] },
        { senderIdx: 4, text: `Tested ZNE on our 20-qubit circuit: restored expectation value fidelity from 68% back to 91.2%!`, minutesAgo: 170, reactions: [{ emoji: '⚡', count: 8 }] },
        { senderIdx: 5, text: `Excellent preprints and discussion this week everyone. High-caliber theoretical physics exchange at its best!`, minutesAgo: 60, reactions: [{ emoji: '👏', count: 9 }] },
      ];
    }
    if (section === 'showcase') {
      // #quantum-sims
      return [
        { senderIdx: 0, text: `Welcome to #quantum-sims! Showcase your numerical Hamiltonian solvers, DMRG tensor networks, and quantum algorithm code.`, minutesAgo: 1440, reactions: [{ emoji: '💻', count: 14 }, { emoji: '⚛️', count: 10 }] },
        { senderIdx: 1, text: `Simulated a 100-site 1D Heisenberg spin chain using Matrix Product States (MPS) in Julia! Ground state energy converged to 10^-12 precision.`, minutesAgo: 1370, reactions: [{ emoji: '🏆', count: 12 }, { emoji: '🔥', count: 8 }] },
        { senderIdx: 2, text: `What maximum bond dimension χ did you need to avoid entanglement truncation errors at critical point coupling?`, minutesAgo: 1300 },
        { senderIdx: 1, text: `Bond dimension χ = 512 was sufficient using SVD truncation with discarded singular value sum < 10^-14.`, minutesAgo: 1220, reactions: [{ emoji: '📐', count: 7 }] },
        { senderIdx: 3, text: `Showcasing our Variational Quantum Eigensolver (VQE) implementation for the H2O water molecule ground state on Qiskit Aer.`, minutesAgo: 1130, reactions: [{ emoji: '💧', count: 9 }] },
        { senderIdx: 4, text: `UCCSD (Unitary Coupled Cluster) ansatz converged within chemical accuracy (1.6 millihartree) in 45 SPSA optimizer iterations!`, minutesAgo: 1040, reactions: [{ emoji: '🎯', count: 8 }] },
        { senderIdx: 5, text: `Benchmarking GPU-accelerated statevector simulation: cuQuantum vs QuTiP on Apple Silicon M3 Max and NVIDIA A100.`, minutesAgo: 950, reactions: [{ emoji: '⚡', count: 10 }] },
        { senderIdx: 0, text: `cuQuantum sustained 32-qubit statevector evolution in 420ms by utilizing FP16 tensor core matrix-vector multiplications.`, minutesAgo: 860, reactions: [{ emoji: '🏎️', count: 9 }] },
        { senderIdx: 2, text: `Implemented an interactive Bloch Sphere trajectory visualizer in WebGL: demonstrates Rabi oscillations under resonant microwave drive!`, minutesAgo: 770, reactions: [{ emoji: '🌐', count: 8 }] },
        { senderIdx: 3, text: `The visualization of Ramsey fringe dephasing as a function of T2* relaxation time is intuitive for teaching quantum optics.`, minutesAgo: 680, reactions: [{ emoji: '✨', count: 7 }] },
        { senderIdx: 4, text: `Uploaded our open-source Julia package for non-linear Schrödinger equation split-step Fourier beam propagation.`, minutesAgo: 590, reactions: [{ emoji: '📦', count: 6 }] },
        { senderIdx: 5, text: `Tested your solver on optical solitons in Kerr media—energy conservation held to machine epsilon over 10,000 propagation steps.`, minutesAgo: 490, reactions: [{ emoji: '⭐', count: 7 }] },
        { senderIdx: 1, text: `Simulation of quantum walk on an adjacency graph: demonstrates quadratic speedup over classical random walk search!`, minutesAgo: 390, reactions: [{ emoji: '🎲', count: 8 }] },
        { senderIdx: 2, text: `Open-sourced all Jupyter and Pluto notebooks in our GitHub organization repo. Link pinned above!`, minutesAgo: 280, reactions: [{ emoji: '📌', count: 5 }] },
        { senderIdx: 0, text: `Great numerical work. These open simulations make advanced theoretical concepts tangible and reproducible.`, minutesAgo: 140, reactions: [{ emoji: '🙌', count: 8 }] },
        { senderIdx: 3, text: `Next week: benchmarking Quantum Approximate Optimization Algorithm (QAOA) on Max-Cut graph problems!`, minutesAgo: 25, reactions: [{ emoji: '🚀', count: 7 }] },
      ];
    }
    // local
    return [
      { senderIdx: 0, text: `Welcome to #local-conversation for Applied Physics & Deep Tech! Connect with physicists, lab researchers, and quantum engineers locally.`, minutesAgo: 1440, reactions: [{ emoji: '📍', count: 12 }] },
      { senderIdx: 1, text: `Zurich / ETH Physics Chapter: Cryogenic quantum laboratory open tour and dinner at Zurich West this Thursday at 6:30 PM!`, minutesAgo: 1370, reactions: [{ emoji: '🇨🇭', count: 11 }, { emoji: '🔬', count: 8 }] },
      { senderIdx: 2, text: `I'll be there! Can give a walkthrough of our dilution refrigerator wiring and microwave shielding setups.`, minutesAgo: 1290, reactions: [{ emoji: '☕', count: 7 }] },
      { senderIdx: 3, text: `Tokyo & RIKEN researchers: Quantum optics journal club meeting at Wako campus this Friday afternoon. Coffee and papers!`, minutesAgo: 1200, reactions: [{ emoji: '🗼', count: 9 }] },
      { senderIdx: 4, text: `Geneva / CERN cohort: Informal dinner gathering near Meyrin this Saturday evening. Particle physics and accelerator discussions!`, minutesAgo: 1110, reactions: [{ emoji: '⚛️', count: 10 }] },
      { senderIdx: 5, text: `Boston / Cambridge group: MIT Center for Theoretical Physics colloquium hangout on Friday at 4 PM in building 6C.`, minutesAgo: 1020, reactions: [{ emoji: '🏛️', count: 8 }] },
      { senderIdx: 0, text: `Oxford / UK Physics Circle: Pints and quantum information debate at The Eagle and Child pub next Tuesday. All physicists welcome!`, minutesAgo: 920, reactions: [{ emoji: '🇬🇧', count: 7 }] },
      { senderIdx: 1, text: `San Francisco & Berkeley: Quantum hardware meetup at Lawrence Berkeley National Lab cafe next Wednesday at 3 PM.`, minutesAgo: 820, reactions: [{ emoji: '🌉', count: 9 }] },
      { senderIdx: 2, text: `Munich / Max Planck Institute cohort: Bi-weekly theoretical seminar and pretzel social in Garching this Thursday!`, minutesAgo: 710, reactions: [{ emoji: '🇩🇪', count: 8 }] },
      { senderIdx: 3, text: `Connect via Direct Messages with physicists in your metropolitan region to share lab instrumentation and coordinate journal clubs!`, minutesAgo: 450, reactions: [{ emoji: '💬', count: 8 }] },
      { senderIdx: 4, text: `What research institute or city are you working from today? Give a warm hello to your fellow local physicists!`, minutesAgo: 70, reactions: [{ emoji: '👋', count: 10 }] },
    ];
  }

  // 4. SOUND DESIGN & MUSIC PRODUCERS (#track-feedback, #synth-and-daw, #local-conversation)
  if (domain === 'music') {
    if (section === 'showcase') {
      // #track-feedback
      return [
        { senderIdx: 0, text: `Welcome to #track-feedback! Upload your work-in-progress audio clips, mix stems, and master bounces for technical critique.`, minutesAgo: 1440, reactions: [{ emoji: '🎧', count: 14 }, { emoji: '🎵', count: 10 }] },
        { senderIdx: 1, text: `Uploading a preview of my upcoming melodic techno track: focusing on dynamic sub-bass separation under a rolling 126 BPM kick.`, minutesAgo: 1370, reactions: [{ emoji: '🔊', count: 11 }] },
        { senderIdx: 2, text: `The low-end transient punch is super clean! What sidechain ducking curve did you set on the 808 sub?`, minutesAgo: 1300 },
        { senderIdx: 1, text: `Fast 4ms lookahead sidechain with Trackspacer cutting only the 45-80 Hz pocket when the kick transient fires!`, minutesAgo: 1220, reactions: [{ emoji: '💡', count: 8 }] },
        { senderIdx: 3, text: `Ambient modular synth piece recorded in one take: Moog Mother-32 patched through Chase Bliss stereo reverb pedals.`, minutesAgo: 1130, reactions: [{ emoji: '✨', count: 12 }, { emoji: '🎹', count: 9 }] },
        { senderIdx: 4, text: `The harmonic overtones in the decay tail create incredible physical depth. Almost binaural immersion on headphones.`, minutesAgo: 1040, reactions: [{ emoji: '👏', count: 7 }] },
        { senderIdx: 5, text: `Mastering check: Integrated LUFS is sitting at -8.5 LUFS with 0.8 dB true peak headroom. Is the high-end air too aggressive?`, minutesAgo: 950 },
        { senderIdx: 0, text: `Highs around 12kHz have crisp sparkle without any harsh sibilance. Dynamic EQ tame on 4.5kHz kept it smooth!`, minutesAgo: 860, reactions: [{ emoji: '🎯', count: 8 }] },
        { senderIdx: 2, text: `Experimental breakcore beat: 174 BPM chopped amen breaks processed with bitcrushers and granular pitch delay.`, minutesAgo: 770, reactions: [{ emoji: '🔥', count: 10 }] },
        { senderIdx: 3, text: `The micro-edits at the bar turnarounds are delightfully erratic! Slicing individual transient slices paid off.`, minutesAgo: 680, reactions: [{ emoji: '⚡', count: 6 }] },
        { senderIdx: 4, text: `Vocal chain test: Shure SM7B into 1073 preamp emulation with optical 2A leveling followed by subtle tape saturation.`, minutesAgo: 590, reactions: [{ emoji: '🎙️', count: 8 }] },
        { senderIdx: 5, text: `Warm, intimate, and sits right in the front pocket of the mix without masking the acoustic guitar strumming.`, minutesAgo: 500, reactions: [{ emoji: '🎸', count: 7 }] },
        { senderIdx: 1, text: `Check the pins for uncompressed 24-bit/48kHz WAV downloads of the community sample pack we recorded!`, minutesAgo: 380, reactions: [{ emoji: '📦', count: 9 }] },
        { senderIdx: 0, text: `Fantastic audio production across all genres today. The sound engineering standard here is world-class!`, minutesAgo: 160, reactions: [{ emoji: '🏆', count: 10 }] },
      ];
    }
    if (section === 'resources') {
      // #synth-and-daw
      return [
        { senderIdx: 0, text: `Welcome to #synth-and-daw! Discuss synthesizer patch architecture, DAW workflows, VST plugins, and analog hardware.`, minutesAgo: 1440, reactions: [{ emoji: '🎹', count: 12 }, { emoji: '🎛️', count: 9 }] },
        { senderIdx: 1, text: `Ableton Live 12 modulation matrix tip: Mapping the new continuous envelope follower to wavetable morphing parameters!`, minutesAgo: 1370, reactions: [{ emoji: '💡', count: 8 }] },
        { senderIdx: 2, text: `Bitwig Studio's grid environment offers unmatched generative modular patching. Anyone building custom sequencers?`, minutesAgo: 1290 },
        { senderIdx: 3, text: `Built a Euclidean polyrhythm sequencer patch in The Grid that outputs MIDI clock and CV gates simultaneously!`, minutesAgo: 1210, reactions: [{ emoji: '⚡', count: 9 }] },
        { senderIdx: 4, text: `Hardware synth comparison: Moog Grandmother ladder filter vs Sequential Prophet-6 discrete Curtis filters on bass patches.`, minutesAgo: 1110, reactions: [{ emoji: '🎚️', count: 7 }] },
        { senderIdx: 5, text: `Moog gives that thick low-end saturation that holds together in mono; Prophet has that lush brassy stereo chorus.`, minutesAgo: 1010, reactions: [{ emoji: '💯', count: 8 }] },
        { senderIdx: 0, text: `Pinned our curated list of free high-fidelity open-source VSTs: Vital synth, Surge XT, Tokyo Dawn EQ, and ChowDSP tape!`, minutesAgo: 910, reactions: [{ emoji: '🎁', count: 15 }] },
        { senderIdx: 1, text: `Vital's spectral wavetable warp modes rival Serum while having near zero CPU footprint on Apple Silicon.`, minutesAgo: 810, reactions: [{ emoji: '💻', count: 6 }] },
        { senderIdx: 2, text: `How are folks configuring buffer sizes for low-latency live tracking? 64 samples at 48kHz gives 2.8ms round-trip.`, minutesAgo: 710 },
        { senderIdx: 3, text: `With Thunderbolt interfaces and dedicated audio drivers, 64 samples stays rock stable without crackles or dropouts.`, minutesAgo: 600, reactions: [{ emoji: '🛡️', count: 6 }] },
        { senderIdx: 4, text: `Guide to mid/side stereo processing: keeping frequencies below 120Hz strictly mono avoids vinyl and club phase cancellation.`, minutesAgo: 480, reactions: [{ emoji: '📐', count: 8 }] },
        { senderIdx: 5, text: `Essential club mixing rule. Phase cancellation on club subwoofers will literally erase your bassline.`, minutesAgo: 350, reactions: [{ emoji: '🔊', count: 7 }] },
        { senderIdx: 0, text: `Keep experimenting and patching! Great tips and signal routing knowledge in this channel.`, minutesAgo: 90, reactions: [{ emoji: '✨', count: 7 }] },
      ];
    }
    // local
    return [
      { senderIdx: 0, text: `Welcome to #local-conversation for Music Producers & Sound Designers! Connect with beatmakers, studio engineers, and audio artists in your city.`, minutesAgo: 1440, reactions: [{ emoji: '📍', count: 10 }] },
      { senderIdx: 1, text: `Berlin Audio Circle: Synth jam and live electronic performance meetup at Kreuzberg modular cafe this Saturday at 5 PM!`, minutesAgo: 1370, reactions: [{ emoji: '🇩🇪', count: 11 }, { emoji: '🎹', count: 8 }] },
      { senderIdx: 2, text: `London Sound Designers: Informal pub catch-up near Shoreditch recording studios this Friday evening. All producers welcome!`, minutesAgo: 1280, reactions: [{ emoji: '🇬🇧', count: 9 }] },
      { senderIdx: 3, text: `Los Angeles Beatmakers: Beat cipher and listening session in Silver Lake next Tuesday at 7 PM. Bring your SP-404s!`, minutesAgo: 1190, reactions: [{ emoji: '🌴', count: 10 }] },
      { senderIdx: 4, text: `Tokyo Modular Synth group: Meeting near Akihabara electronic shops to source Eurorack faceplates and patch cables.`, minutesAgo: 1070, reactions: [{ emoji: '🗼', count: 8 }] },
      { senderIdx: 5, text: `New York City cohort: Studio listening room session at Bushwick creative loft this Sunday. Testing mixes on midfield monitors!`, minutesAgo: 940, reactions: [{ emoji: '🗽', count: 9 }] },
      { senderIdx: 0, text: `Bristol UK Bass producers: Listening party and dubplate exchange next Thursday near Stokes Croft!`, minutesAgo: 790, reactions: [{ emoji: '🔊', count: 8 }] },
      { senderIdx: 1, text: `Paris Electronic Music meetup: Sound design workshop near Canal Saint-Martin next weekend! RSVP in DMs.`, minutesAgo: 630, reactions: [{ emoji: '🇫🇷', count: 7 }] },
      { senderIdx: 2, text: `Reach out via Direct Messages to local producers in your area to share studio gear or co-write tracks!`, minutesAgo: 380, reactions: [{ emoji: '💬', count: 6 }] },
      { senderIdx: 3, text: `What city or studio setup are you producing from today? Say hello to your regional sound peers!`, minutesAgo: 45, reactions: [{ emoji: '👋', count: 9 }] },
    ];
  }

  // 5. GLOBAL TRAILBLAZERS & HIKERS (#trail-guides, #mountain-photos, #local-conversation)
  if (domain === 'travel') {
    if (section === 'showcase') {
      // #mountain-photos
      return [
        { senderIdx: 0, text: `Welcome to #mountain-photos! Share your alpine summits, wilderness sunsets, backcountry ridge captures, and trail snapshots.`, minutesAgo: 1440, reactions: [{ emoji: '🏔️', count: 16 }, { emoji: '📸', count: 12 }] },
        { senderIdx: 1, text: `Sunrise alpenglow over the Matterhorn at 3,800m! Temperature was -6°C, but the crimson morning light on the north face was worth every shiver.`, minutesAgo: 1370, reactions: [{ emoji: '🌄', count: 18 }, { emoji: '❄️', count: 11 }] },
        { senderIdx: 2, text: `The sharpness in the ice crevasses is breathtaking! What lens and aperture did you capture this with?`, minutesAgo: 1300 },
        { senderIdx: 1, text: `Sony A7CR with 24-70mm f/2.8 GM II at f/8, 1/250s, ISO 100 with a circular polarizer to cut glacial glare.`, minutesAgo: 1220, reactions: [{ emoji: '📷', count: 9 }] },
        { senderIdx: 3, text: `Backpacking through the North Cascades: camped beside an emerald glacial tarn with the Milky Way arching over Eldorado Peak.`, minutesAgo: 1130, reactions: [{ emoji: '🌌', count: 15 }] },
        { senderIdx: 4, text: `The reflection of the stars on the still alpine water makes the entire frame look like a surreal portal. Unbelievable shot!`, minutesAgo: 1040, reactions: [{ emoji: '✨', count: 8 }] },
        { senderIdx: 5, text: `Autumn ridge walk in the Dolomites: jagged limestone spires rising through a blanket of low valley stratus clouds.`, minutesAgo: 950, reactions: [{ emoji: '☁️', count: 10 }] },
        { senderIdx: 0, text: `That cloud inversion layer is peak Dolomite magic. Tre Cime or Seceda ridge?`, minutesAgo: 860 },
        { senderIdx: 5, text: `Seceda ridgeline early morning right before the cable cars opened. Had the entire summit crest to myself for 45 minutes!`, minutesAgo: 770, reactions: [{ emoji: '🙌', count: 9 }] },
        { senderIdx: 2, text: `High-altitude wild mountain goat family captured with a 100-400mm telephoto on the Pacific Crest Trail in Washington!`, minutesAgo: 680, reactions: [{ emoji: '🐐', count: 11 }] },
        { senderIdx: 3, text: `Look at the kid balanced on that sheer rock ledge. Mountain goats defy physics!`, minutesAgo: 590, reactions: [{ emoji: '🧗', count: 7 }] },
        { senderIdx: 4, text: `Golden hour sunset illuminating the granite walls of Patagonia's Torres del Paine: wind gusts were clocking 70 km/h!`, minutesAgo: 480, reactions: [{ emoji: '💨', count: 9 }] },
        { senderIdx: 1, text: `Holding a camera steady in Patagonian winds is an Olympic sport. Incredible color saturation on the towers!`, minutesAgo: 360, reactions: [{ emoji: '👏', count: 8 }] },
        { senderIdx: 0, text: `Keep sharing these inspiring wilderness captures. Makes everyone want to lace up hiking boots and head outdoors!`, minutesAgo: 120, reactions: [{ emoji: '🥾', count: 12 }] },
      ];
    }
    if (section === 'resources') {
      // #trail-guides
      return [
        { senderIdx: 0, text: `Welcome to #trail-guides! Verified GPX coordinates, wilderness permit schedules, water source status, and gear pack breakdowns.`, minutesAgo: 1440, reactions: [{ emoji: '🗺️', count: 14 }, { emoji: '🎒', count: 10 }] },
        { senderIdx: 1, text: `Comprehensive guide for the Tour du Mont Blanc (TMB): 170 km, 10,000m elevation gain, hut reservation timeline, and resupply towns.`, minutesAgo: 1370, reactions: [{ emoji: '🏔️', count: 12 }] },
        { senderIdx: 2, text: `Pinned! Which direction do you recommend? Counter-clockwise via Les Contamines has gentler knee descent profiles.`, minutesAgo: 1290 },
        { senderIdx: 1, text: `Agreed! Counter-clockwise gives dramatic reveals as you cross Grand Col Ferret into the Italian Val Ferret!`, minutesAgo: 1210, reactions: [{ emoji: '🇮🇹', count: 8 }] },
        { senderIdx: 3, text: `Ultralight gear list: sub-4.2kg base weight breakdown for 5-day Sierra Nevada backcountry traverses in summer.`, minutesAgo: 1110, reactions: [{ emoji: '⚖️', count: 9 }] },
        { senderIdx: 4, text: `Dyneema composite fiber shelter paired with a 900-fill down quilt cuts nearly 1.5kg compared to traditional double-wall tents!`, minutesAgo: 1010, reactions: [{ emoji: '⛺', count: 8 }] },
        { senderIdx: 5, text: `Water filtration warning: High-elevation streams along section 4 of the Colorado Trail are running turbid from snowmelt. Bring pre-filters!`, minutesAgo: 910, reactions: [{ emoji: '💧', count: 11 }] },
        { senderIdx: 0, text: `Essential safety advisory: Squeeze filters can freeze and crack microscopic hollow fibers in sub-zero temps. Sleep with your filter in your quilt!`, minutesAgo: 810, reactions: [{ emoji: '🛡️', count: 14 }] },
        { senderIdx: 2, text: `John Muir Trail (JMT) permit lottery opens next Tuesday at 7 AM PT on Recreation.gov. Coordinate your entry trailheads!`, minutesAgo: 690, reactions: [{ emoji: '⏰', count: 9 }] },
        { senderIdx: 3, text: `Offline navigation checklist: Download CalTopo 1:24k USGS topo maps and save emergency Garmin inReach satellite SOS contacts.`, minutesAgo: 570, reactions: [{ emoji: '🛰️', count: 8 }] },
        { senderIdx: 4, text: `Leave No Trace (LNT) principles: packing out all waste, camping 200 feet from alpine lakes, and keeping trails pristine for generations.`, minutesAgo: 430, reactions: [{ emoji: '🌲', count: 13 }, { emoji: '❤️', count: 10 }] },
        { senderIdx: 0, text: `Happy and safe trekking to everyone heading into the mountains this weekend!`, minutesAgo: 110, reactions: [{ emoji: '🚀', count: 8 }] },
      ];
    }
    // local
    return [
      { senderIdx: 0, text: `Welcome to #local-conversation for Global Trailblazers & Hikers! Find local hiking partners, weekend carpools, and regional trail scouts.`, minutesAgo: 1440, reactions: [{ emoji: '📍', count: 12 }] },
      { senderIdx: 1, text: `Pacific Northwest / Seattle hikers: Mount Rainier Skyline Trail day hike this Saturday morning! Meeting at Paradise parking at 6:30 AM.`, minutesAgo: 1370, reactions: [{ emoji: '🌲', count: 11 }, { emoji: '🏔️', count: 9 }] },
      { senderIdx: 2, text: `I'll be there! Bringing trekking poles and extra trail mix. Who else is in?`, minutesAgo: 1290, reactions: [{ emoji: '🥾', count: 8 }] },
      { senderIdx: 3, text: `Colorado / Boulder cohort: Chautauqua to Green Mountain summit sunrise scramble this Thursday. 6 AM sharp at trailhead!`, minutesAgo: 1200, reactions: [{ emoji: '🌄', count: 9 }] },
      { senderIdx: 4, text: `Munich & Bavarian Alps group: Zugspitze via Reintal hut trek weekend planning meeting at Garmisch cafe this Friday.`, minutesAgo: 1110, reactions: [{ emoji: '🇩🇪', count: 8 }] },
      { senderIdx: 5, text: `Bay Area hikers: Marin Headlands coastal loop hike (14 km) this Sunday morning followed by fish tacos in Sausalito!`, minutesAgo: 1010, reactions: [{ emoji: '🌉', count: 10 }] },
      { senderIdx: 0, text: `Swiss Alps / Geneva group: Lac Blanc trail day trip in Chamonix scheduled for next weekend. Clear blue skies forecast!`, minutesAgo: 890, reactions: [{ emoji: '🇨🇭', count: 9 }] },
      { senderIdx: 1, text: `Sydney & Blue Mountains Australia: Grand Canyon track and Wentworth Falls circuit meetup this Saturday!`, minutesAgo: 750, reactions: [{ emoji: '🇦🇺', count: 8 }] },
      { senderIdx: 2, text: `Edinburgh / Scottish Highlands: Ben Nevis mountain ascent weekend carpool forming. 3 spots left in the van!`, minutesAgo: 590, reactions: [{ emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', count: 8 }] },
      { senderIdx: 3, text: `Reach out via Direct Messages to any member in your region to share rides or organize alpine expeditions!`, minutesAgo: 310, reactions: [{ emoji: '💬', count: 7 }] },
      { senderIdx: 4, text: `What mountain ranges or backcountry trails are you exploring this season? Share your coordinates!`, minutesAgo: 60, reactions: [{ emoji: '👋', count: 11 }] },
    ];
  }

  // 6. DEFAULT DYNAMIC (Fallback with Domain Awareness)
  return getDynamicSectionDialogue(domain, section, commName, getMember, tags);
}

function getDynamicSectionDialogue(
  domain: DomainKey | 'dynamic',
  section: SectionKey,
  commName: string,
  getMember: (idx: number) => ServerMember,
  tags: string[]
): RawDialogueEntry[] {
  const primaryTopic = tags[0] || commName;
  const secondaryTopic = tags[1] || 'Innovation';

  if (section === 'general') {
    return [
      { senderIdx: 0, text: `Welcome everyone to #${commName} General! This is our main room for discussing ${primaryTopic}, architecture, and emerging trends.`, minutesAgo: 1440, reactions: [{ emoji: '👋', count: 12 }, { emoji: '🌟', count: 8 }] },
      { senderIdx: 1, text: `Thrilled to join this community on Cronium! Looking forward to diving deep into ${primaryTopic} with fellow practitioners.`, minutesAgo: 1390, reactions: [{ emoji: '✨', count: 6 }] },
      { senderIdx: 2, text: `Welcome @${getMember(1).name.split(' ')[0]}! What specific projects or research questions in ${commName} are you working on?`, minutesAgo: 1320, reactions: [{ emoji: '🤝', count: 4 }] },
      { senderIdx: 3, text: `Good morning! Has anyone reviewed the new operational standards and toolchains released for ${primaryTopic} this quarter?`, minutesAgo: 1240 },
      { senderIdx: 4, text: `Yes! The shift toward modular, open-standard workflows in ${commName} has eliminated so much legacy friction.`, minutesAgo: 1160, reactions: [{ emoji: '💡', count: 7 }] },
      { senderIdx: 5, text: `In our daily work, prioritizing clean fundamentals and reproducible pipelines has made execution 3x more reliable.`, minutesAgo: 1080, reactions: [{ emoji: '💯', count: 9 }] },
      { senderIdx: 0, text: `Totally agree. Being connected with like-minded peers here keeps our thinking sharp and avoids common pitfalls.`, minutesAgo: 990, reactions: [{ emoji: '❤️', count: 8 }] },
      { senderIdx: 1, text: `Quick question: How are teams balancing rapid prototyping with strict quality verification in ${primaryTopic}?`, minutesAgo: 900, reactions: [{ emoji: '❓', count: 3 }] },
      { senderIdx: 2, text: `We set up automated CI smoke tests and parameter sanity sweeps. Catches 90% of regressions before full runs.`, minutesAgo: 820, reactions: [{ emoji: '⚡', count: 6 }] },
      { senderIdx: 3, text: `Cronium's zero-knowledge encrypted messaging has been amazing for sharing confidential test findings with collaborators.`, minutesAgo: 730, reactions: [{ emoji: '🔒', count: 10 }, { emoji: '🛡️', count: 7 }] },
      { senderIdx: 4, text: `No telemetry bloat, authentic peer conversations, and respect for user sovereignty. That's why I'm here.`, minutesAgo: 640, reactions: [{ emoji: '🙌', count: 8 }] },
      { senderIdx: 5, text: `Taking a quick coffee break before our afternoon review session. What music or podcasts keeps everyone focused?`, minutesAgo: 550, reactions: [{ emoji: '☕', count: 5 }] },
      { senderIdx: 0, text: `Ambient instrumental soundtracks and low-frequency modular soundscapes! Keeps focus unbroken for hours.`, minutesAgo: 460, reactions: [{ emoji: '🎧', count: 6 }] },
      { senderIdx: 1, text: `Reminder that our weekly virtual roundtable is this Friday! We'll have two lightning presentations on ${secondaryTopic}.`, minutesAgo: 380, reactions: [{ emoji: '🗓️', count: 7 }] },
      { senderIdx: 2, text: `I'd love to share our team's latest benchmarking results if there's a 10-minute open slot!`, minutesAgo: 300, reactions: [{ emoji: '📊', count: 5 }] },
      { senderIdx: 3, text: `You're on the schedule @${getMember(2).name.split(' ')[0]}! Really looking forward to the breakdown.`, minutesAgo: 220, reactions: [{ emoji: '📝', count: 4 }] },
      { senderIdx: 4, text: `Had a great 1-on-1 direct message exchange with @${getMember(5).name.split(' ')[0]} earlier. The member roster is full of genuine talent.`, minutesAgo: 150, reactions: [{ emoji: '💬', count: 6 }] },
      { senderIdx: 5, text: `Likewise! Connecting directly with peers across time zones is the absolute highlight of Cronium.`, minutesAgo: 90, reactions: [{ emoji: '🤝', count: 7 }] },
      { senderIdx: 0, text: `Welcome once again to all newcomers joining ${commName}! Feel free to chime in and share your journey anytime.`, minutesAgo: 35, reactions: [{ emoji: '🎉', count: 8 }] },
      { senderIdx: 1, text: `Let's keep this momentum going! What challenges is everyone tackling this week?`, minutesAgo: 5, reactions: [{ emoji: '🚀', count: 6 }] },
    ];
  }

  if (section === 'showcase') {
    return [
      { senderIdx: 0, text: `Welcome to the official showcase channel for ${commName}! Share your breakthroughs, prototypes, and completed milestones here.`, minutesAgo: 1440, reactions: [{ emoji: '🚀', count: 12 }, { emoji: '🏆', count: 8 }] },
      { senderIdx: 1, text: `Showcasing our latest milestone in ${primaryTopic}: completed our pilot phase with 98.4% positive verification metrics!`, minutesAgo: 1370, reactions: [{ emoji: '🔥', count: 11 }] },
      { senderIdx: 2, text: `Incredible achievement @${getMember(1).name.split(' ')[0]}! The attention to detail in your execution really shines through.`, minutesAgo: 1290, reactions: [{ emoji: '👏', count: 6 }] },
      { senderIdx: 3, text: `Demonstrating our workflow prototype: reduced manual configuration steps by 3.5x using automated scripts and clean abstractions.`, minutesAgo: 1210, reactions: [{ emoji: '⚙️', count: 7 }] },
      { senderIdx: 4, text: `Tested your shared demo link—the responsive interaction and clean output formatting are superb. Starred the project!`, minutesAgo: 1120, reactions: [{ emoji: '⭐', count: 8 }] },
      { senderIdx: 5, text: `Just finalized our open-source release for ${commName} practitioners. Documentation and test suites are live in pins!`, minutesAgo: 1030, reactions: [{ emoji: '📦', count: 9 }] },
      { senderIdx: 0, text: `The architecture diagrams in your documentation are crystal clear. Makes onboarding new contributors so straightforward.`, minutesAgo: 940, reactions: [{ emoji: '📖', count: 5 }] },
      { senderIdx: 1, text: `Hardware iteration update: CNC-milled structural frame arrived today. Assembly tolerance is within 15 microns.`, minutesAgo: 850, reactions: [{ emoji: '🛠️', count: 8 }] },
      { senderIdx: 2, text: `Thermal dissipation testing results: under sustained peak load, temperatures leveled off safely with zero throttling.`, minutesAgo: 760, reactions: [{ emoji: '🌡️', count: 6 }] },
      { senderIdx: 3, text: `Completed our user validation cohort with 140 participants: 95% task completion rate on the first trial run!`, minutesAgo: 670, reactions: [{ emoji: '📈', count: 9 }] },
      { senderIdx: 4, text: `Showcasing our interactive visualizer: rendering complex state trees with custom shaders at a locked 60 FPS.`, minutesAgo: 560, reactions: [{ emoji: '✨', count: 7 }] },
      { senderIdx: 5, text: `Closed our pilot enterprise collaboration agreement this morning! Validates our approach for ${primaryTopic}.`, minutesAgo: 450, reactions: [{ emoji: '🥂', count: 12 }, { emoji: '🎉', count: 8 }] },
      { senderIdx: 0, text: `Huge milestone for the entire community! Proof that focused, community-led engineering delivers world-class results.`, minutesAgo: 340, reactions: [{ emoji: '💪', count: 7 }] },
      { senderIdx: 1, text: `Automated test coverage crossed 98.6% across our core codebase! 1,200 unit and integration tests passing in CI.`, minutesAgo: 240, reactions: [{ emoji: '✅', count: 6 }] },
      { senderIdx: 2, text: `Recorded a 3-minute video walkthrough explaining our architecture for new contributors. Dropped in the resources channel.`, minutesAgo: 150, reactions: [{ emoji: '🎥', count: 5 }] },
      { senderIdx: 3, text: `Excited for what everyone is building this sprint! Don't hesitate to tag members here if you need feedback or review.`, minutesAgo: 70, reactions: [{ emoji: '🤝', count: 6 }] },
      { senderIdx: 4, text: `Welcome to everyone exploring ${commName}'s showcase! What projects are you hacking on this week?`, minutesAgo: 12, reactions: [{ emoji: '👋', count: 8 }] },
    ];
  }

  if (section === 'resources') {
    return [
      { senderIdx: 0, text: `Resource and knowledge archive for ${commName}: starter templates, documentation, research references, and guides.`, minutesAgo: 1440, reactions: [{ emoji: '📚', count: 11 }] },
      { senderIdx: 1, text: `Pinned our comprehensive starter toolkit for ${primaryTopic}—includes recommended configurations and best practices.`, minutesAgo: 1360, reactions: [{ emoji: '📌', count: 9 }] },
      { senderIdx: 2, text: `Sharing this essential reference guide on foundational ${primaryTopic} principles. Sections 2 & 3 are masterfully written.`, minutesAgo: 1280, reactions: [{ emoji: '📄', count: 7 }] },
      { senderIdx: 3, text: `Bookmarked! This clarifies several edge cases our team was analyzing earlier this week.`, minutesAgo: 1200, reactions: [{ emoji: '💡', count: 5 }] },
      { senderIdx: 4, text: `Here is a curated directory of free tools, datasets, and verified suppliers tailored for ${commName} practitioners.`, minutesAgo: 1100, reactions: [{ emoji: '🛠️', count: 8 }] },
      { senderIdx: 5, text: `For anyone configuring local environments: our verified setup script automates dependency management with zero errors.`, minutesAgo: 1000, reactions: [{ emoji: '🚀', count: 6 }] },
      { senderIdx: 0, text: `Ran the script on macOS and Linux—both environments completed initialization in under 60 seconds!`, minutesAgo: 910, reactions: [{ emoji: '⏱️', count: 5 }] },
      { senderIdx: 1, text: `Recommended reading: 'Principles of Modern Architecture' and 'Foundations of ${primaryTopic}'. Essential reads.`, minutesAgo: 820, reactions: [{ emoji: '📖', count: 8 }] },
      { senderIdx: 2, text: `Both references permanently refined how we structure modular boundaries and error handling.`, minutesAgo: 720, reactions: [{ emoji: '💯', count: 6 }] },
      { senderIdx: 3, text: `Cheat sheet: common operational formulas, system scaling rules, and diagnostic lookup tables for quick reference.`, minutesAgo: 620, reactions: [{ emoji: '📐', count: 7 }] },
      { senderIdx: 4, text: `Printed this out and pinned it beside my monitors. Saves so much time during deep debugging sessions!`, minutesAgo: 510, reactions: [{ emoji: '👍', count: 4 }] },
      { senderIdx: 5, text: `Link to the recording from our community knowledge-sharing session: covers performance profiling and design choices.`, minutesAgo: 400, reactions: [{ emoji: '🎙️', count: 6 }] },
      { senderIdx: 0, text: `The live demonstration starting at minute 14:20 answers all questions about asynchronous pipelines and state sync!`, minutesAgo: 300, reactions: [{ emoji: '✨', count: 5 }] },
      { senderIdx: 1, text: `Check the channel pins to access all historical resources and cheat sheets sorted by topic and community rating.`, minutesAgo: 190, reactions: [{ emoji: '🔍', count: 7 }] },
      { senderIdx: 2, text: `What other specialized documentation or starter kits would be helpful for members this month? Drop your requests!`, minutesAgo: 95, reactions: [{ emoji: '💬', count: 4 }] },
      { senderIdx: 3, text: `Always here to help curate and verify tools for ${commName}. Happy learning everyone!`, minutesAgo: 15, reactions: [{ emoji: '🤝', count: 7 }] },
    ];
  }

  // local
  return [
    { senderIdx: 0, text: `Welcome to #local-conversation for ${commName}! Connect with like-minded members in your local city or region.`, minutesAgo: 1440, reactions: [{ emoji: '📍', count: 10 }] },
    { senderIdx: 1, text: `San Francisco Bay Area chapter: We're hosting a casual coffee & collaboration sprint this Saturday at SOMA! Who's in?`, minutesAgo: 1370, reactions: [{ emoji: '🌉', count: 8 }] },
    { senderIdx: 2, text: `I'll be there! Bringing my setup so we can do some live testing and brainstorm together.`, minutesAgo: 1290, reactions: [{ emoji: '🙌', count: 6 }] },
    { senderIdx: 3, text: `London & UK chapter: planning an informal meetup near King's Cross next Thursday evening. Great food and conversation!`, minutesAgo: 1200, reactions: [{ emoji: '🇬🇧', count: 7 }] },
    { senderIdx: 4, text: `Tokyo members meetup was fantastic last night! 14 members gathered in Shibuya to exchange ideas around ${primaryTopic}.`, minutesAgo: 1100, reactions: [{ emoji: '🗼', count: 9 }] },
    { senderIdx: 5, text: `New York City cohort: meeting up in Brooklyn for a co-working session this Friday. Great coffee and fast Wi-Fi!`, minutesAgo: 1000, reactions: [{ emoji: '🗽', count: 8 }] },
    { senderIdx: 0, text: `Toronto & Waterloo chapter: co-working day scheduled for next Wednesday. RSVP link in channel pins!`, minutesAgo: 890, reactions: [{ emoji: '🇨🇦', count: 5 }] },
    { senderIdx: 1, text: `Berlin chapter check-in: weekend hack session at Betahaus Kreuzberg. Pizza, coffee, and architecture talks!`, minutesAgo: 780, reactions: [{ emoji: '🇩🇪', count: 7 }] },
    { senderIdx: 2, text: `Seattle chapter: 7 of us meeting at Capitol Hill for our regular Saturday morning roundtable. Rain or shine!`, minutesAgo: 670, reactions: [{ emoji: '☕', count: 6 }] },
    { senderIdx: 3, text: `Paris meetup is happening next Tuesday near Bastille! PM me if you'd like to join our coordination group.`, minutesAgo: 550, reactions: [{ emoji: '🥐', count: 5 }] },
    { senderIdx: 4, text: `Austin, Texas: meet us at South Congress this Friday evening for an informal social and project showcase!`, minutesAgo: 430, reactions: [{ emoji: '🌮', count: 6 }] },
    { senderIdx: 5, text: `Singapore & Southeast Asia cohort: organizing a demo sprint next month near Marina Bay Sands.`, minutesAgo: 320, reactions: [{ emoji: '🇸🇬', count: 6 }] },
    { senderIdx: 0, text: `Sydney & Melbourne builders: organizing a weekend workshop. Reach out if you're interested in presenting!`, minutesAgo: 210, reactions: [{ emoji: '🇦🇺', count: 5 }] },
    { senderIdx: 1, text: `Remember you can connect directly with members in your city via Direct Messages to arrange local meetups!`, minutesAgo: 120, reactions: [{ emoji: '💬', count: 7 }] },
    { senderIdx: 2, text: `What city are you joining from today? Give a quick shout-out to your regional chapter peers!`, minutesAgo: 30, reactions: [{ emoji: '👋', count: 9 }] },
    { senderIdx: 3, text: `Excited to see local communities growing everywhere. Have a wonderful week of collaboration!`, minutesAgo: 5, reactions: [{ emoji: '✨', count: 6 }] },
  ];
}

/**
 * Ensures dialogue strictly reaches the targetCount (which varies between 21 and 29)
 * using domain-authentic section dialogue variations.
 */
function ensureTargetDialogue(
  current: RawDialogueEntry[],
  targetCount: number,
  section: SectionKey,
  commName: string,
  topic: string,
  domain: DomainKey | 'dynamic'
): RawDialogueEntry[] {
  const result = [...current];
  const needed = targetCount - result.length;
  if (needed <= 0) return result;

  const domainAugmentations: Record<SectionKey, string[]> = {
    general: [
      `Quick question for everyone working on ${topic}: how are you handling edge validation and boundary conditions in production?`,
      `For anyone seeking peer review on architecture diagrams, feel free to send a DM! Always happy to trade technical sparring notes.`,
      `Really appreciate the depth of knowledge in ${commName}. The discussions here consistently elevate our daily engineering execution.`,
      `Don't forget to review the newly pinned documentation links in the header for our latest release benchmarks.`,
      `Taking an evening break before the next release cycle. Great collaborative energy in this channel today!`,
      `Welcome to all recent members joining ${commName}! Feel free to share your current focus and connect with fellow practitioners.`,
      `Just finished testing the updated calibration parameters—observing a noticeable gain in stability across test runs.`,
      `Have a productive and focused rest of the week everyone! Looking forward to reviewing tomorrow's test results.`,
      `The documentation clarity in our shared repository has made onboarding new collaborators delightfully fast.`,
      `Closing out tonight's sprint tasks. Excellent progress across the board!`,
    ],
    showcase: [
      `Our team just deployed an interactive live sandbox for community testing! Pinned the verification URL in the channel header.`,
      `Stress-tested the latest prototype under sustained load for 24 hours: zero memory leaks or unexpected drift detected!`,
      `Huge milestone! Thanks to everyone who provided feedback on the early draft iterations during last week's review.`,
      `The telemetry graphs show a clean 40% reduction in latency compared to our baseline implementation.`,
      `Open-sourced all configuration files and automated reproduction scripts in our community GitHub repo!`,
      `Check out the comparative performance chart uploaded above: clearly highlights the efficiency tradeoff curve.`,
      `Next milestone on our roadmap: optimizing the automated pipeline for on-device deployment! Stay tuned.`,
      `Incredible craftsmanship from everyone showcasing projects this week. Raising the bar for technical depth!`,
    ],
    resources: [
      `Uploaded our updated benchmarking matrix to the shared knowledge base: covers throughput, cost, and latency comparisons.`,
      `Step-by-step technical guide added to channel pins: explains reproducible environment configuration with zero headaches.`,
      `Download link for the printable reference cheat sheet: includes all essential commands, formulas, and diagnostic checklists.`,
      `Curated list of verified papers, whitepapers, and open-source repos tailored specifically for practitioners in ${commName}.`,
      `All historical design decks and architecture slides have been indexed with searchable tags in the channel pins.`,
      `If you have high-quality guides, papers, or tools to suggest for ${commName}, drop them here for review!`,
      `Updated the troubleshooting FAQ with common environment edge cases and verified workarounds.`,
      `Continuous learning and technical rigor is what makes this community shine. Keep sharing great resources!`,
    ],
    local: [
      `Reminder: When attending your upcoming regional city chapter meetups, bring your notebook and favorite project demos!`,
      `Photographs and key takeaways from last week's local chapter dinner have been archived in the channel pins!`,
      `Planning our next regional weekend hack session and coffee meetup. Drop your neighborhood preferences below!`,
      `Feel free to reach out via Direct Messages to any member in your city to co-work at local cafes or shared spaces.`,
      `Great to see genuine friendships and technical partnerships forming from these regional conversations.`,
      `Introduce yourself anytime if you're new to your metropolitan area—our local chapter leads are always ready to welcome you!`,
      `Next month's local lightning talk schedule has been published in the event pins. Two speaker slots still open!`,
      `Looking forward to meeting many of you in person at our upcoming chapter gathering. Safe travels!`,
    ],
  };

  const pool = domainAugmentations[section];
  for (let i = 0; i < needed; i++) {
    const textItem = pool[i % pool.length];
    const minsAgo = Math.max(10, 85 - i * 7);
    result.push({
      senderIdx: (result.length + i) % 6,
      text: textItem,
      minutesAgo: minsAgo,
      reactions: [{ emoji: ['👍', '🔥', '💡', '🚀', '🙌', '✨'][i % 6], count: 3 + (i % 7) }],
    });
  }

  return result.sort((a, b) => b.minutesAgo - a.minutesAgo);
}

function formatEntriesToMessages(
  entries: RawDialogueEntry[],
  communityId: string,
  channel: CommunityChannel,
  getMember: (idx: number) => ServerMember,
  now: number
): Message[] {
  const slotTimes = getDeterministicChatTimestamps(
    `${communityId}::${channel.id}`,
    entries.length,
    now
  );

  return entries.map((entry, i) => {
    const member = getMember(entry.senderIdx);
    const slot = slotTimes[i];
    return {
      id: `msg_${channel.id}_var_${i + 1}`,
      chatId: channel.id,
      senderId: member.id,
      senderName: member.name,
      senderAvatar: member.avatar,
      text: entry.text,
      timestamp: slot.timestamp,
      createdAt: slot.createdAt,
      status: 'read',
      reactions: entry.reactions
        ? entry.reactions.map((r, rIdx) => ({
            emoji: r.emoji,
            count: r.count,
            users: [getMember((entry.senderIdx + rIdx + 1) % 6).id],
          }))
        : [],
    };
  });
}
