# Cronium — UI/UX Design System & Product Specification

**Platform:** Mobile-First Progressive Web App (with Desktop Simulator & 3-Screen Showcase)  
**Design Aesthetic:** Soft-violet atmospheric light theme with optional dark mode, crisp card elevation, rounded pill controls, and encrypted messaging clarity.  
**Default Theme:** Light Mode (`#F5F8FF` / `#F7F9FC` canvas with `#FFFFFF` cards).

---

## 1. Design Tokens

### 1.1 Color Palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| **Primary Brand** | Cronium Violet | `#5B35F8` | Primary CTAs, active channels, Send/Message actions, brand highlights |
| **Primary Hover / Alt** | Electric Indigo | `#6342F5` / `#4F46E5` | Navigation active states, badges, interactive accents |
| **Primary Soft Fill** | Lavender Tint | `#EEEBFE` / `#F1EEFF` / `#EEF2FF` | Pill tags, soft icon containers, icebreakers |
| **Primary Border** | Periwinkle Outline | `#CFC6FF` / `#E0E7FF` | Selected cards, featured plan borders, focus rings |
| **App Canvas (Light)** | Ice Mist | `#F5F8FF` | Root app viewport background |
| **Home Canvas (Light)** | Cloud White | `#F7F9FC` | Home screen & status bar background |
| **Card Surface** | Pure White | `#FFFFFF` | Feed cards, member rows, modal sheets, bottom navigation |
| **Subtle Surface** | Soft Lilac Gray | `#F4F3FB` / `#F8FAFC` / `#F1F5F9` | Segmented controls, input fields, secondary chips |
| **Dividers & Hairlines** | Cool Lavender Border | `#EAE8F4` / `#E6E3F2` | Card outlines, section separators |
| **Primary Ink** | Deep Obsidian Violet | `#14112C` / `#0F172A` | Titles, display headings, primary body text |
| **Secondary Ink** | Slate Violet | `#524E6B` / `#6F6A89` | Subtitles, metadata, timestamps, muted labels |
| **Action Sky Blue** | Media Composer Blue | `#2B8EF4` / `#0A66C2` | Photo/Video/Story composer controls & primary links |
| **Soft Sky Fill** | Composer Tint | `#D7EFFE` | Media composer icon badges & upload dropzones |
| **Semantic Success** | Emerald Online | `#10B981` / `#059669` | "online" status indicator, E2EE Active badge, Attending state, verified checks |
| **Semantic Alert** | Rose Accent | `#F43F5E` | Destructive actions, live indicators, notifications |
| **Dark Mode Canvas** | Deep Slate | `#020617` (`slate-950`) | Dark mode shell background |
| **Dark Mode Surface** | Elevated Slate | `#0F172A` (`slate-900`) | Dark mode cards, headers, modals |

### 1.2 Typography

- **Hero / Brand Font (`--font-hero`):** `Outfit` (`700`, `800`, `900`) — App lockup, hero headings, pricing figures.
- **Display & UI Body Font (`--font-display`, `--font-sans`):** `Plus Jakarta Sans` (`400`, `500`, `600`, `700`, `800`) — All interface copy, navigation, chat bubbles, cards, and modals.
- **System Fallback Stack:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

| Scale | Size / Weight | Usage |
|---|---|---|
| Hero Heading | `24px–28px`, ExtraBold (`800`), tight tracking | Onboarding & Home hero |
| Screen Title | `18px–20px`, Bold (`700`) | Top headers, modal titles |
| Card Heading | `14px–16px`, Bold (`700`) | Post authors, event titles, server names |
| Body / Message | `13px–14px`, Regular–Medium (`400–500`) | Feed copy, chat bubbles, event overview |
| Metadata / Chip | `11px–12px`, Medium–SemiBold (`500–600`) | Timestamps, hashtags, member roles, online count |
| Nav Label | `10px`, Medium–Bold (`500–700`) | Bottom tab labels |

### 1.3 Geometry, Spacing & Motion

- **Mobile Frame:** `max-w-md` (`448px`), desktop preview frame `sm:h-[820px] sm:rounded-[40px] sm:border-[8px]`.
- **Border Radii:**
  - Modals / Bottom Sheets: `24px–32px` (`rounded-3xl`)
  - Primary Cards: `16px–20px` (`rounded-2xl`)
  - Buttons / Pills / Segmented Switchers: `9999px` (`rounded-full`) or `12px` (`rounded-xl`)
  - Avatars: Circular (`rounded-full`) with status rings
- **Scrolling & Touch Ergonomics:** `-webkit-overflow-scrolling: touch`, `overscroll-behavior-y: contain`, `touch-action: manipulation`, and `content-visibility: auto` on feed cards.
- **Safe Areas:** Bottom navigation respects `env(safe-area-inset-bottom)`.

---

## 2. Shell & Navigation Architecture

### 2.1 Top Utility Header (Desktop/Wrapper Chrome)
- **Left:** Cronium App Icon + Wordmark + `E2EE Active` emerald pill.
- **Center:** Mode Switcher (`Interactive App` vs. `3-Screen Mockup`).
- **Right:** Cross-Platform Sync, Test Push Notification, Biometric Lock (Face ID / Touch ID), Share App Link, Dark/Light Mode toggle.

### 2.2 Primary Bottom Navigation (`NavigationBar`)
Sticky 4-column tab bar (`Home`, `Servers & DMs`, `Feed`, `Profile`):
1. **Home** — AI Interest/Hobby/Goal prompting, onboarding guidance, matched community recommendations, prompt history, and feedback submission.
2. **Servers & DMs** — Joined community servers list, Direct Messages inbox, Community Events launcher, and nested views (`ServerView`, `ChatView`).
3. **Feed** — Community social stream with Photo / Video / Hackathon-Story composers, reaction picker, comments, reposts, and sharing.
4. **Profile** — Executive profile banner & identity, network connections & communities sheet, privacy controls, Earn Servers gamification, Key Achievements, Brand Level, and user posts.

*UX Persistence Rule:* Tabs lazy-mount on first visit and remain mounted afterward to preserve exact scroll positions and in-progress UI state; tapping the currently active tab scrolls smoothly to the top (or exits an open chat/server subview).

---

## 3. Screen-by-Screen UX Specification

### 3.1 Home (`HomeScreen`)
- **Pre-Prompt State:** Branded hero with Cronium mascot, interactive 3-step AI matching prompt flow (**Interests → Hobbies → Goals**), quick-select suggestion chips, and guided onboarding tooltip.
- **Post-Prompt State:** Personalized matched servers ranked by prompt overlap, one-tap **Join / Joined** toggle with tier-limit enforcement, **Prompt History** archive modal, and inline community discovery cards.

### 3.2 Servers & DMs Hub (`ServersScreen`)
- **Top Bar:** Search bar, Quick Events trigger button, and segmented view for **Your Servers** and **Direct Messages**.
- **Events Pre-Join Gate:** Before prompting/joining communities, opening Events displays a dedicated onboarding state prompting the user to discover and join communities first.
- **Direct Messages:** Populated dynamically as users follow or message members; displays encrypted previews and unread counts.

### 3.3 Inside Server (`ServerView`)
- **Header:** Back arrow, oversized circular server avatar (`1.2x` emphasis), server title, green **online** member counter, elevated segmented **Chat / Members** toggle (`1.2x` height), and options menu.
- **Chat Tab:** Horizontal channel pills (e.g., `#architecture-reviews`, `#local-conversation`), message stream with member avatars, timestamps, emoji reaction chips, quick-reply suggestions, and unified composer bar (attachments, emoji, voice capture, send).
- **Members Tab:** Searchable directory with rich member cards, online indicators, verified roles, **Follow / Following** button, and **Message** button that opens the Quick Message bottom sheet (with personalized quick icebreakers + direct message input).

### 3.4 Direct Messaging (`ChatView`)
- End-to-end encrypted 1:1 chat with contact status header, E2EE safety-number verification modal, voice/video call modal, voice note recording & playback (`VoiceNotePlayer`), media viewer, and emoji reactions.

### 3.5 Events & Live Room (`CommunityEventsModal`, `EventDetailsModal`)
- **Event List:** Filterable community events across servers with cover imagery, date/time badges, tags, and attendee stacks.
- **Event Details:** Opens immediately showing the exact event hero image with date badge and Live Session tag, followed by unique event metadata (Overview with Read More, Prerequisites accordion, multi-session Schedule & Speakers, Venue + Calendar export, Host profile link), and sticky bottom **Attend / Attending** + **Join Live Room** CTA bar.
- **Live Room:** Interactive live session stage with speaker roster, live chat/Q&A, audio/stage controls, and participant presence.

### 3.6 Social Feed (`SocialFeedScreen`, `FeedPostCard`, `CreatePostModal`)
- **Composer Strip:** Quick triggers for **Photo**, **Video**, and **Hackathon / Story** (styled consistently with the sky-blue composer accent).
- **Post Card:** Author avatar, name, `+ Follow` button, role/credential line, timestamp + community tag pill, expandable post body, hashtag list, rich media, summary metrics row (emoji stack + count on left; `comments • reposts` on right), and 3-column action bar (`Celebrate/React`, `Comment`, `Share`).

### 3.7 Profile & Privacy (`ProfileScreen`, `ProfileNetworkSheet`)
- **Identity Card:** Editable cover banner, portrait avatar, verified status, bio, organization, social/work links, and Brand Level badge.
- **Network Sheet (`Communities` & `Connections` tabs):** Member list with status indicators and `Message` buttons, plus **Hide my connections** lock toggle. Tapping **Hide my connections** presents a subscriber upgrade prompt with a **"Try it free for one month"** bar that opens the Membership Tiers modal.
- **Earn Servers:** Expandable gamification card showing bonus server slots claimed (`0 of 6 slots claimed`).
- **Key Achievements:** 3-column metrics strip (`Honors`, `Patents & Papers`, `Contributor` percentile), detailed honors timeline, and expandable list.
- **User Posts:** Recent / Top segmented toggle for Jennies's posts.

### 3.8 Membership Tiers (`PremiumUnlockModal`)
- **Free Tier:** `$0 / Month` — 2 default servers, 20 post views/day, 20 connections/day.
- **Cronium Plus (Popular):** `$0` first month, then `$4.99 / month` — 5 curated servers, 30 posts/day, 50 connections/day, green badge verification, profile view insights, reduced ads.
- **Cronium Pro (Best Value):** `$0` first month, then `$9.99 / month` — 10 curated servers, 40 posts/day, unlimited connections, full privacy controls, and pro networking tools.

---

## 4. Core User Journeys

1. **First-Time Discovery Flow:** Launch → Home Hero → Enter 3 Prompts (Interests, Hobbies, Goals) → Unlock Notification → Browse Matched Servers → Join Server → Explore Channels & Members.
2. **Member-to-DM Flow:** Server → Members Tab → Tap **Message** → Quick Message Sheet with Icebreakers → Send → Opens Encrypted 1:1 `ChatView` & adds thread to DMs inbox.
3. **Event Attendance Flow:** Servers & DMs → Events → Select Event → Inspect Hero Image, Schedule, & Venue → Tap **Attend** → Tap **Join Live Room**.
4. **Privacy & Subscription Flow:** Profile → Connections → Toggle **Hide my connections** → Subscription Intro with **"Try it free for one month"** → Membership Tier Selector (`$0` first month → `$4.99` Plus / `$9.99` Pro).

---

## 5. UI Component Inventory

| Area | Files |
|---|---|
| **App Shell & Chrome** | `src/App.tsx`, `src/index.css`, `src/components/NavigationBar.tsx`, `src/components/IPhoneStatusBar.tsx`, `src/components/CroniumLogo.tsx`, `src/components/TripleScreenPreview.tsx`, `src/components/AppErrorBoundary.tsx` |
| **Home & Discovery** | `src/components/HomeScreen.tsx`, `src/components/CommunitiesScreen.tsx`, `src/components/OnboardingGuidance.tsx`, `src/components/PromptHistoryModal.tsx` |
| **Servers & Chat** | `src/components/ServersScreen.tsx`, `src/components/ServerView.tsx`, `src/components/ServerAvatar.tsx`, `src/components/ChatView.tsx`, `src/components/VoiceNotePlayer.tsx`, `src/components/CallModal.tsx`, `src/components/E2EEVerificationModal.tsx`, `src/components/MemberProfileModal.tsx` |
| **Events** | `src/components/CommunityEventsModal.tsx`, `src/components/EventDetailsModal.tsx` |
| **Social Feed** | `src/components/SocialFeedScreen.tsx`, `src/components/FeedPostCard.tsx`, `src/components/CreatePostModal.tsx`, `src/components/PostCommentsModal.tsx`, `src/components/SharePostModal.tsx`, `src/components/MediaViewerModal.tsx` |
| **Profile & Monetization** | `src/components/ProfileScreen.tsx`, `src/components/ProfileNetworkSheet.tsx`, `src/components/ProfileEditModals.tsx`, `src/components/ProfileModal.tsx`, `src/components/UserProfileModal.tsx`, `src/components/UserPostsScreen.tsx`, `src/components/UserPostsSection.tsx`, `src/components/GamificationDashboard.tsx`, `src/components/BrandLevelModal.tsx`, `src/components/PremiumUnlockModal.tsx` |
| **System Overlays** | `src/components/BiometricModal.tsx`, `src/components/DeviceSyncModal.tsx`, `src/components/NotificationToast.tsx`, `src/components/SocialIcons.tsx` |
