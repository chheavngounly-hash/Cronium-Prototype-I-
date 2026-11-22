import { Post, PostComment, PostCommentReply } from '../types/social';
import {
  jenniesPortrait,
  portraitAnnaSan,
  portraitAlexanderPatrick,
  portraitGeorgeAllan,
  portraitClassieWilley,
  portraitLiamChen,
  portraitHiroshiTanaka,
  portraitElenaRostova,
  portraitMarcusVance,
  portraitMacRoseville,
  portraitPriyaPatel,
  portraitZoeKim,
  portraitTariqAlmansoor,
  portraitAmaraOkafor,
  portraitMateoSilva,
  portraitJasonZhao,
  portraitAstridLindholm,
  portraitKenjiTakahashi,
  portraitCamilleLaurent,
  portraitMalikWashington,
  portraitAntonZeilinger,
  portraitMayaLin,
  portraitKaelenMiller,
  portraitEvelynFoster,
} from '../data/mockData';

// High-fidelity pool of realistic peer contributors with valid portraits
export interface CommenterProfile {
  id: string;
  name: string;
  avatar: string;
  headline: string;
}

export const COMMENTER_POOL: CommenterProfile[] = [
  {
    id: 'user_hiroshi',
    name: 'Dr. Hiroshi Tanaka',
    avatar: portraitHiroshiTanaka,
    headline: 'Principal Quantum Physicist & JAXA Fellow',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    avatar: portraitElenaRostova,
    headline: 'Neuromorphic Hardware Researcher • Quantum Lab',
  },
  {
    id: 'user_anna',
    name: 'Anna San',
    avatar: portraitAnnaSan,
    headline: 'Lead Architect @ Cerebras Systems • Wafer-Scale AI',
  },
  {
    id: 'user_alexander',
    name: 'Alexander Patrick',
    avatar: portraitAlexanderPatrick,
    headline: 'Staff Research Fellow @ Stanford Robotics Lab',
  },
  {
    id: 'user_marcus',
    name: 'Dr. Marcus Vance',
    avatar: portraitMarcusVance,
    headline: 'Distributed Systems Fellow • Compiler Architect',
  },
  {
    id: 'user_liam',
    name: 'Liam Chen',
    avatar: portraitLiamChen,
    headline: 'Lead Engine Architect • Low-Latency Systems',
  },
  {
    id: 'user_priya',
    name: 'Priya Patel',
    avatar: portraitPriyaPatel,
    headline: 'CleanTech Microgrid Specialist • Energy Systems',
  },
  {
    id: 'user_george',
    name: 'George Allan',
    avatar: portraitGeorgeAllan,
    headline: 'Senior Infrastructure Engineer @ TensorCloud • Alpine Trekker',
  },
  {
    id: 'user_classie',
    name: 'Classie Willey',
    avatar: portraitClassieWilley,
    headline: 'AI Product Lead • Workplace Culture & Wellness Advocate',
  },
  {
    id: 'user_mac',
    name: 'Mac Roseville',
    avatar: portraitMacRoseville,
    headline: 'Autonomous Robotics Pilot & Core Systems Engineer',
  },
  {
    id: 'user_jennies',
    name: 'Jennies Vance',
    avatar: jenniesPortrait,
    headline: 'Head of AI Product & Systems Architecture',
  },
  {
    id: 'user_zoe',
    name: 'Zoe Kim',
    avatar: portraitZoeKim,
    headline: 'Engineering Director • Async Operations & Systems Scalability',
  },
  {
    id: 'user_tariq',
    name: 'Dr. Tariq Al-Mansoor',
    avatar: portraitTariqAlmansoor,
    headline: 'Microgrid Control & Real-Time Sensor Network Architect',
  },
  {
    id: 'user_amara',
    name: 'Amara Okafor',
    avatar: portraitAmaraOkafor,
    headline: 'Zero-Knowledge Proofs & Distributed Cryptography Lead',
  },
  {
    id: 'user_mateo',
    name: 'Mateo Silva',
    avatar: portraitMateoSilva,
    headline: 'Robotics Sim2Real Specialist & Tactile Sensing Researcher',
  },
  {
    id: 'user_jason',
    name: 'Jason Zhao',
    avatar: portraitJasonZhao,
    headline: 'High-Performance Cluster Networking & InfiniBand Architect',
  },
  {
    id: 'user_astrid',
    name: 'Astrid Lindholm',
    avatar: portraitAstridLindholm,
    headline: 'Autonomous Navigation Lead • Micro-LIDAR Systems',
  },
  {
    id: 'user_kenji',
    name: 'Kenji Takahashi',
    avatar: portraitKenjiTakahashi,
    headline: 'Aerospace Propulsion & Spacecraft Guidance Engineer',
  },
  {
    id: 'user_camille',
    name: 'Camille Laurent',
    avatar: portraitCamilleLaurent,
    headline: 'Computational Neuroscientist & Spike Timing Researcher',
  },
  {
    id: 'user_malik',
    name: 'Malik Washington',
    avatar: portraitMalikWashington,
    headline: 'Principal Cryptographic Protocol Auditor & Mesh Security Lead',
  },
  {
    id: 'user_anton',
    name: 'Anton Zeilinger',
    avatar: portraitAntonZeilinger,
    headline: 'Quantum Entanglement & Metrology Research Fellow',
  },
  {
    id: 'user_maya',
    name: 'Maya Lin',
    avatar: portraitMayaLin,
    headline: 'Creative Technologist & Real-Time GPU Shaders Lead',
  },
  {
    id: 'user_kaelen',
    name: 'Kaelen Miller',
    avatar: portraitKaelenMiller,
    headline: 'Autonomous Maritime Robotics & Sensor Fusion Specialist',
  },
  {
    id: 'user_evelyn',
    name: 'Evelyn Foster',
    avatar: portraitEvelynFoster,
    headline: 'Deep Learning Compiler Optimization & MLIR Contributor',
  },
];

// Topic-specific knowledge banks for authentic comments and replies
// Every comment and reply is strictly 1 to 3 sentences long
interface TopicContentBank {
  comments: string[];
  replies: string[];
}

const TOPIC_BANKS: Record<string, TopicContentBank> = {
  ml: {
    comments: [
      'Sub-microsecond barrier synchronization across wafer-scale dies is pure wizardry. How do you manage clock drift over thermal cycles?',
      'Memory bandwidth saturation reached 94% on our synthetic load test using your zero-copy buffer approach. Game changing breakthrough!',
      'Are you seeing any degradation in distributed all-reduce throughput as batch sizes scale past 16k tokens? Our cluster hit a communication bottleneck there.',
      'The ring buffer topology eliminates so much PCIe bus overhead. Really impressed by the telemetry numbers you shared with the group.',
      'Our team tried implementing dynamic tensor slice allocation last month, but run-time stragglers killed our latency. Did you implement work stealing?',
      'This level of hardware co-design is where the real breakthroughs in AI reasoning will come from. Outstanding work to the entire engineering team.',
      'Did you benchmark FP8 vs BF16 throughput with this interconnect layout? Curious about the numerical stability on deep diffusion passes.',
      'The hardware interconnect numbers prove why on-wafer SRAM beats external HBM3e for auto-regressive decoding loops. Looking forward to your next technical report.',
      'What compiler passes are you running to fuse kernel dispatches across adjacent tile partitions? We would love to test that on our simulator.',
      'Exceptional architectural write-up with crystal clear takeaways. This deserves to be submitted to ISCA or MICRO next season.',
      'Are you publishing the Verilog simulation traces or the low-level communication micro-benchmarks? Our university lab is eager to replicate these findings.',
      'We reproduced a similar ring topology on a multi-node cluster, but intra-chassis jitter was 4x higher than your wafer metrics.',
      'The zero-copy layout is textbook elegance. Minimizing cache line thrashing makes all the difference at 400k cores.',
      'How does the orchestration handle node failover mid-training? Does checkpoint latency impact the barrier timers across the mesh?',
      'This is the definitive answer to the memory wall problem. Incredible leap forward for real-time generative agents.',
    ],
    replies: [
      'Clock drift is mitigated with an asynchronous FIFO handshake layer on die boundaries. Thermal sensors feed directly into PLL tuning in real time.',
      'Zero-copy buffers coupled with huge pages make this possible. Glad to hear your benchmarks confirmed the speedup!',
      'All-reduce throughput remains above 91% even at 32k context lengths thanks to the low-overhead ring routing.',
      'Yes, we use a decentralized work-stealing scheduler with bounded local queues to prevent stragglers. It reduced tail latency dramatically.',
      'FP8 showed zero degradation in perplexity on our benchmark suite while cutting SRAM footprint by 48%. Highly recommend adopting it.',
      'ISCA submission is already drafted! Look forward to sharing the full trace dumps with the community next month.',
      'Checkpoint latency is masked entirely via non-blocking asynchronous DMA transfers straight to remote NVMe fabric.',
    ],
  },
  outdoors: {
    comments: [
      'Nothing clears mental cache like 12,000 feet of crisp alpine air. Mt. Langley via New Army Pass is one of California’s finest routes.',
      'Redundancy in gear and continuous monitoring of weather vectors—sound distributed systems advice for both servers and summits! Stay safe up there.',
      'How was the water situation between Cottonwood Lakes and High Lake? Planning this exact route in two weeks with a small crew.',
      'The cloud inversion photography is breathtaking. Did you camp at Long Lake or push straight through in a single push?',
      'Alpine planning is the ultimate metaphor for resilient architecture. Never panic when the original trail is blocked.',
      'We definitely need to coordinate a Cronium Bay Area community trail hike next month. Who else is ready to lace up their trail runners?',
      'Did you run into any lingering snowpack near the top of the pass? Microspikes needed or clear granite all the way?',
      'Discipline in the backcountry translates directly to calm leadership during production outages. Pure truth spoken here.',
      'What base pack weight did you manage for the summit stretch? Ultralight setups make those 3,000 ft climbs so much sweeter.',
      'That high altitude granite ridge view is magnificent. Disconnecting from screens fuels our best creative breakthroughs.',
      'The air at 12,000 ft resets circadian rhythms better than any supplement. Hope you caught a clear Perseid meteor shower overnight.',
      'New Army Pass is steep, but the switchbacks are so well graded compared to Old Army. Great route choice for high mileage!',
      'Gear redundancy saved us on Whitney last season when a water filter housing cracked. Preparation is everything in the high country.',
      'Always inspired by your trail reports George! The engineering community needs more outdoors integration to prevent burnout.',
      'Stunning panorama that captures the raw majesty of the Sierra Nevada mountains. Inspires me to plan an expedition this weekend.',
    ],
    replies: [
      'Water was abundant at High Lake and Cottonwood! Reliable flow all the way to the 11,200 ft bench.',
      'Camped at Long Lake for night one to acclimatize, then hit the summit ridge right at sunrise. Highly recommended!',
      'Pass was 95% dry granite, just two small snow patches easily skirted without microspikes.',
      'Base pack was right around 11.4 lbs with an ultralight dyneema shelter. Every ounce saved makes the ascent effortless.',
      'Count me in for the Cronium community trail hike! Let’s meet at Rock Spring parking at 6:30 AM sharp.',
      'Totally agreed on production outages—mountain composure teaches you to diagnose methodically before reacting.',
      'The night sky was utterly unreal! Milky Way visible from horizon to horizon with zero light pollution.',
    ],
  },
  robotics: {
    comments: [
      '1.2ms ZMP convergence on loose gravel is astonishing. Are the tactile sole arrays piezoresistive or capacitive matrix?',
      'Dynamic foot placement looks remarkably natural! Pairing this with bio-spike reflex loops could cut actuation power in half.',
      'What torque density are your quasi-direct drive motors outputting during the foot-strike impact phase? The stability is remarkable.',
      'The sim2real transfer gap on gravel is usually brutal. Did you randomize surface restitution coefficients in your simulation physics?',
      'Exceptional mechanical stability Alexander. The closed-loop trajectory correction algorithms are textbook perfection.',
      'Sub-2ms loop time on edge microcontrollers is pure engineering art. Will definitely be at Saturday’s meetup demo!',
      'Are you running the balance controller on a bare-metal microcontroller or an RTOS with PREEMPT_RT Linux kernel? Curious about your kernel latency.',
      'The yaw stabilization when one foot slips on loose stones is super impressive. Is there an active damping loop in the ankles?',
      'Hardware video like this reminds me why robotics is the most rewarding engineering discipline on earth. Outstanding milestone for the lab.',
      'How is the thermal dissipation on the knee actuators after 20 minutes of continuous walking trials? Any heat throttling observed?',
      'Tactile sole sensing combined with IMU velocity estimation is the right paradigm. Vision alone is too slow for slip recovery.',
      'The compliant foot linkage design absorbs impact energy so cleanly. Are those custom carbon composite springs in the heel?',
      'Can you share what reinforcement learning policy architecture was used for the blind terrain adaptation? We are running tests on our quadruped.',
      'Incredible demonstration of dynamic balance. Autonomous humanoid locomotion is advancing faster than anyone predicted.',
      'Looking forward to reading the full motor telemetry breakdown at the Cronium hardware meetup this weekend! Fantastic work.',
    ],
    replies: [
      'Custom piezoresistive silicon matrix polled via SPI at 2kHz. Zero hysteresis under heavy impact loads!',
      'We randomized friction, incline, and restitution by +/- 35% in Isaac Gym. That domain randomization proved essential for gravel.',
      'Peak torque during foot-strike reaches 85 Nm with a 10:1 planetary reduction stage. Thermal rise stays comfortably under 22°C.',
      'Running on dual STM32H7s for motor commutation and a Jetson Orin with PREEMPT_RT for high-level MPC trajectories.',
      'Yes, active impedance control in the roll axis compensates for slip within 8ms of heel strike.',
      'Compliant foot soles are waterjet 7075-T6 aluminum with polyurethane damping pads. Cheap, robust, and easily swappable.',
      'See everyone at Saturday’s meetup! We will have the live robot walking across randomized gravel trays in the demo arena.',
    ],
  },
  culture: {
    comments: [
      'Async voice updates have completely eliminated Zoom fatigue on our microgrid engineering team. Best shift we ever made!',
      'Protecting deep focus time on Thursdays doubled our uninterrupted pull request review velocity. Culture drives code.',
      'Weekly Show & Tell builds real human empathy that Jira tickets could never replicate. Setting a wonderful standard Classie!',
      'The 60-second voice limit is brilliant—forces everyone to synthesize rather than ramble. Rolling this out to our compiler group next sprint.',
      '0% attrition after 6 months is the only metric that matters. Engineers stay when they feel trusted and respected.',
      'We instituted "No-Meeting Wednesdays" and saw immediate drops in context-switching stress across all squads. Focus time is sacred.',
      'Do you transcribe the 60-second voice memos for team members in different time zones or hearing accommodations? That was crucial for our global team.',
      'How did you get leadership to buy into cutting synchronous standups? That’s usually the hardest hurdle in larger organizations.',
      'Show & tell where engineers share bread baking, woodworking, and modular synthesizers is pure gold. Brings warmth back to remote work.',
      'Async standups force people to actually document their blockers clearly rather than mumbling off the cuff. The clarity benefit is immense.',
      'Sprint velocity going up 28% while reducing meetings proves that presence is not performance. Thank you for sharing these numbers.',
      'The psychological safety created by hearing someone’s authentic voice notes is 10x higher than cold Slack messages. Human connection matters.',
      'We did this across our infrastructure team and bug resolution time plummeted because focus blocks were never fragmented.',
      'Such an inspiring playbook for modern engineering organizations. Human-centric culture always wins in the long run.',
      'Thank you for championing this Classie! More tech leaders need to realize that endless meetings are a failure of trust.',
    ],
    replies: [
      'Cronium voice channels auto-transcribe in real time with high accuracy, so everyone can listen or read asynchronously!',
      'We started with a 2-week trial and tracked PR cycle times. The numbers spoke so clearly that leadership immediately made it permanent.',
      'Hearing the tone and warmth in someone’s voice eliminates all the accidental hostility of flat text chats.',
      'Show & Tell has revealed so many hidden talents on our team! From violinists to antique clock restorers.',
      'Uninterrupted focus time is the single highest-leverage gift a manager can give to an engineering team.',
      'Sprint velocity gains were a direct result of engineers completing complex architectural refactors without interruptions.',
      'Trusting adults to do great work on their own schedule is the entire secret to high-performing remote teams.',
    ],
  },
  physics: {
    comments: [
      '420 microseconds coherence time at 14mK is monumental. How did you calibrate out the background thermal photon noise in the microwave lines?',
      'The multi-layer copper radiation shielding with infrared SiC absorption is pure physical craft. Outstanding milestone for quantum hardware!',
      'Are you observing any phase slips from residual cosmic ray ionization events? We saw brief coherence dips on our fluxonium prototype.',
      'Surface code syndrome extraction requires exactly this kind of coherence margin. Congratulations to the research team!',
      'What was the insertion loss across the cryogenic filters at the 14mK mixing plate? Minimizing dissipation there is notoriously difficult.',
    ],
    replies: [
      'We used dual-stage eccosorb infrared attenuators combined with copper powder filters at 14mK. Thermal photon population dropped below 10⁻⁴!',
      'Residual quasiparticle bursts are mitigated by our thick silicon carbide absorption liner. It absorbed 98% of high-energy phonon events.',
      'Phase slip rates remained below 1.2 Hz under continuous microwave drive, giving plenty of room for syndrome extraction loops.',
      'Thank you! Full Hamiltonian parameter matrices and S21 transmission traces are open on our repository.',
    ],
  },
  cleantech: {
    comments: [
      '18ms autonomous islanding without dropping household appliance sync is phenomenal. Clean energy resilience at its finest!',
      'Distributed battery arbitrage via LoRa mesh solves the cellular outage vulnerability during natural disasters. Brilliant architectural choice.',
      'How do the lithium-iron-phosphate battery management systems handle cell degradation over thousands of high-depth discharge cycles?',
      'Decentralized physical infrastructure (DePIN) for local microgrids is the future of sustainable energy. Inspiring operational metrics!',
      'Subsurface acoustic sensing for geothermal reservoirs without downhole electronics is pure genius. What was the laser interrogation frequency?',
    ],
    replies: [
      'The inverters use fast solid-state static transfer switches (STS) that actuate within 4ms of phase divergence detection!',
      'LFP chemistry coupled with mild C-rates has maintained 98.2% state of health after 1,400 accelerated cycle tests.',
      'LoRa mesh gossip delivered 99.94% packet delivery across the neighborhood during the entire 6-hour islanding test.',
      'Thank you! The decentralized energy transition requires resilient localized control networks to replace fragile centralized grids.',
    ],
  },
  crypto: {
    comments: [
      'Recursive SNARK verification in 78ms on mobile devices over Pallas/Vesta curves is mind-blowing. Zero server disclosure is true privacy.',
      'How does the Nova-style folding scheme perform on non-uniform memory architectures? The 38MB RAM footprint is impressively lean.',
      'Are the WebAssembly SIMD intrinsics compatible with older mobile browser runtimes, or is WebGPU required for the MSM pipeline?',
      'Eliminating non-native arithmetic emulation is what makes 2-cycle curve recursion practical at last. Masterful cryptographic craft.',
    ],
    replies: [
      'Nova folding keeps memory footprint strictly constant because the accumulator only maintains running instance digests!',
      'We fall back to pure WASM 64-bit scalar multiplication if SIMD is unavailable, which only adds 22ms to the verification time.',
      'Pallas/Vesta curve cycles completely eliminate the 100x emulation penalty of non-native fields. Excited to see teams build on this!',
    ],
  },
  aerospace: {
    comments: [
      '1,840 seconds of specific impulse on a Xenon Hall thruster with magnetically shielded channels is incredible aerospace engineering.',
      'How did you maintain hollow cathode thermal stability during the 500-hour continuous high-vacuum firing run?',
      'Electric propulsion is the true workhorse of deep space exploration. 24 km/s exhaust velocity rewrites the rocket equation.',
      'Autonomous plume divergence adjustment for center-of-mass shifts solves a major control bottleneck for long-duration orbital maneuvers.',
    ],
    replies: [
      'The LaB6 hollow cathode reached thermal equilibrium after 12 hours and maintained an emission current of 3.2A continuously!',
      'Boron nitride channel erosion was completely negligible thanks to the magnetic shielding contours keeping ions away from the walls.',
      'Thank you! Electric propulsion allows carrying scientific payloads that would be physically impossible with chemical fuels.',
    ],
  },
  general: {
    comments: [
      'Incredible perspective and very well articulated. Bookmarking this to share with our entire department tomorrow morning.',
      'Strongly agree with this direction. The industry has been waiting for someone to demonstrate this in production.',
      'The technical depth in this post is outstanding. Appreciate the transparent breakdown of real-world trade-offs.',
      'Inspiring work! It is rare to see this level of craft and rigor combined with such clear explanations.',
      'Our team encountered identical bottlenecks on our testbed last quarter. Your solution is far more elegant.',
      'What were the biggest unexpected surprises you encountered when rolling this out to real users? Would love to learn from your experience.',
      'This aligns perfectly with modern decentralized systems architecture. High signal, zero noise.',
      'Thank you for publishing these benchmarks openly. The Cronium community is becoming the premier place for deep tech discussions.',
      'A masterclass in engineering execution. Looking forward to your next milestone update!',
      'Such thoughtful execution across the board. The attention to detail in the edge cases is what sets this apart.',
    ],
    replies: [
      'Thank you! Sharing transparently with the community helps all of us raise the technical bar together.',
      'The biggest surprise was how quickly edge cases surfaced once real-world entropy hit the system! Glad the safeguard held up.',
      'Open benchmarks keep us honest. Glad the traces proved useful for your squad as well.',
      'Really appreciate the kind feedback! More telemetry releases coming next week for everyone to test.',
    ],
  },
};

/**
 * Ensures a post's reactions count is strictly less than its comments count.
 * "If the number of likes or other emojis in the post surpasses the number of comments, make it less"
 */
export function sanitizePostReactionsAndComments(post: Post): Post {
  let totalComments = post.totalCommentsCount || (post.comments ? post.comments.length : 160);
  if (totalComments < 100) totalComments = 135;
  if (totalComments > 300) totalComments = 285;

  const reactions = { ...(post.reactions || {}) };
  const currentTotalReactions = Object.values(reactions).reduce((sum, val) => sum + (val || 0), 0);

  if (currentTotalReactions >= totalComments) {
    const targetTotal = Math.max(10, Math.floor(totalComments * 0.65));
    const factor = targetTotal / (currentTotalReactions || 1);
    const adjustedReactions: Record<string, number> = {};
    for (const [key, count] of Object.entries(reactions)) {
      adjustedReactions[key] = Math.max(1, Math.floor(count * factor));
    }
    return {
      ...post,
      totalCommentsCount: totalComments,
      reactions: adjustedReactions,
    };
  }

  return {
    ...post,
    totalCommentsCount: totalComments,
  };
}

/**
 * Generates or retrieves the complete, exact list of comments and replies
 * such that (top-level comments + all nested replies) === post.totalCommentsCount.
 * 
 * Rules:
 * - Number of replies per comment with replies ranges strictly from 2 to 6.
 * - The first two comments with replies are intended to be visible by default.
 * - Every comment and reply is 1 to 3 sentences long.
 * - Creators actively engage in people's comments.
 * - Includes various emojis in reactions instead of only "Like".
 */
export function getPostFullComments(post: Post): PostComment[] {
  const sanitizedPost = sanitizePostReactionsAndComments(post);
  const targetTotal = sanitizedPost.totalCommentsCount || 160;

  // Determine topic bank
  const contentLower = (sanitizedPost.content + ' ' + (sanitizedPost.tags || []).join(' ')).toLowerCase();
  let bank = TOPIC_BANKS.general;
  if (contentLower.includes('wafer') || contentLower.includes('diffusion') || contentLower.includes('core') || contentLower.includes('compiler') || contentLower.includes('formal')) {
    bank = TOPIC_BANKS.ml;
  } else if (contentLower.includes('qubit') || contentLower.includes('quantum') || contentLower.includes('coherence') || contentLower.includes('dilution') || contentLower.includes('millikelvin')) {
    bank = TOPIC_BANKS.physics;
  } else if (contentLower.includes('microgrid') || contentLower.includes('geothermal') || contentLower.includes('energy') || contentLower.includes('cleantech') || contentLower.includes('solar')) {
    bank = TOPIC_BANKS.cleantech;
  } else if (contentLower.includes('snark') || contentLower.includes('cryptography') || contentLower.includes('zero-knowledge') || contentLower.includes('zkproof')) {
    bank = TOPIC_BANKS.crypto;
  } else if (contentLower.includes('plasma') || contentLower.includes('thruster') || contentLower.includes('propulsion') || contentLower.includes('spacecraft')) {
    bank = TOPIC_BANKS.aerospace;
  } else if (contentLower.includes('mountain') || contentLower.includes('hike') || contentLower.includes('trail') || contentLower.includes('sierra')) {
    bank = TOPIC_BANKS.outdoors;
  } else if (contentLower.includes('robot') || contentLower.includes('balance') || contentLower.includes('actuator') || contentLower.includes('drone') || contentLower.includes('neuropixels') || contentLower.includes('neuromorphic')) {
    bank = TOPIC_BANKS.robotics;
  } else if (contentLower.includes('remote') || contentLower.includes('wellness') || contentLower.includes('standup') || contentLower.includes('culture') || contentLower.includes('migration')) {
    bank = TOPIC_BANKS.culture;
  }

  const resultComments: PostComment[] = [];
  let currentCount = 0;
  let commentIndex = 0;
  const timeOffsets = ['12m ago', '25m ago', '48m ago', '1h ago', '2h ago', '3h ago', '5h ago', '7h ago', '10h ago', '14h ago', '1d ago', '2d ago'];

  // Creator profile for active engagement
  const creatorProfile: CommenterProfile = {
    id: sanitizedPost.authorId,
    name: sanitizedPost.authorName,
    avatar: sanitizedPost.authorAvatar,
    headline: sanitizedPost.authorHeadline,
  };

  while (currentCount < targetTotal) {
    const remaining = targetTotal - currentCount;
    // Don't make the top-level commenter the creator (creators engage in replies)
    const commenter = COMMENTER_POOL[commentIndex % COMMENTER_POOL.length];
    const commentText = bank.comments[commentIndex % bank.comments.length];
    const timestamp = timeOffsets[commentIndex % timeOffsets.length];
    const commentId = `comm_${sanitizedPost.id}_${commentIndex + 1}`;

    // Decide whether this comment has replies
    // "The number of Replies to a comment should range from 2 to 6"
    let replyCount = 0;
    if (remaining > 2) {
      // Must range from 2 to 6
      const maxPossible = Math.min(6, remaining - 1);
      // Give the first two comments replies so they can be visible by default
      const shouldHaveReplies = commentIndex < 2 || commentIndex % 3 !== 0;
      if (shouldHaveReplies && maxPossible >= 2) {
        replyCount = Math.min(maxPossible, (commentIndex % 5) + 2); // strictly 2, 3, 4, 5, or 6
      }
    }

    const replies: PostCommentReply[] = [];
    for (let r = 0; r < replyCount; r++) {
      // "creators should engage with people's comments"
      // Make creator reply on the 1st reply of every other comment with replies, including the first comment!
      const isCreatorReplying = (r === 0 && commentIndex % 2 === 0);
      const replier = isCreatorReplying
        ? creatorProfile
        : COMMENTER_POOL[(commentIndex * 3 + r + 1) % COMMENTER_POOL.length];

      const replyText = bank.replies[(commentIndex + r) % bank.replies.length];
      const replyId = `rep_${commentId}_${r + 1}`;

      // Various emoji reactions instead of only "Like"
      const replyReactions: Record<string, number> = {
        '👍': (r + 1) * 3 + (commentIndex % 4),
        '❤️': ((r + commentIndex) % 3) + 1,
      };
      if ((r + commentIndex) % 2 === 0) {
        replyReactions['💡'] = (commentIndex % 3) + 1;
      }
      if (isCreatorReplying) {
        replyReactions['🔥'] = 4;
      }

      replies.push({
        id: replyId,
        commentId,
        authorId: replier.id,
        authorName: replier.name,
        authorAvatar: replier.avatar,
        authorHeadline: replier.headline,
        text: replyText,
        timestamp: `${(r + 1) * 7}m ago`,
        likes: (r + 1) * 4 + (commentIndex % 5),
        hasLiked: false,
        replyToAuthorName: commenter.name,
        reactions: replyReactions,
      });
    }

    // Diverse emoji reactions on top-level comment
    const commentReactions: Record<string, number> = {
      '👍': (commentIndex % 5) * 3 + 8,
      '💡': (commentIndex % 4) * 2 + 3,
      '❤️': (commentIndex % 3) * 2 + 2,
    };
    if (commentIndex % 2 === 0) commentReactions['🔥'] = (commentIndex % 4) + 3;
    if (commentIndex % 3 === 0) commentReactions['👏'] = (commentIndex % 3) + 4;
    if (commentIndex % 4 === 0) commentReactions['🚀'] = 5;

    const newComment: PostComment = {
      id: commentId,
      authorId: commenter.id,
      authorName: commenter.name,
      authorAvatar: commenter.avatar,
      authorHeadline: commenter.headline,
      text: commentText,
      timestamp,
      likes: Object.values(commentReactions).reduce((a, b) => a + b, 0),
      hasLiked: false,
      reactions: commentReactions,
      replies,
    };

    resultComments.push(newComment);
    currentCount += 1 + replyCount;
    commentIndex++;
  }

  return resultComments;
}
