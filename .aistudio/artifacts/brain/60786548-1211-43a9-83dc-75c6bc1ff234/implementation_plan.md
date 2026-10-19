# Sports Visuals & Community Campaign Integration Plan

Integrate dynamic, photorealistic sports visuals into the U.S. Bank digital banking platform featuring Justin Jefferson and youth flag football community banking initiatives across responsive hero banners, promotional financial cards, and interactive dashboard experiences.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed during clarification:
> - **Primary Application**: Integrated promotional banking cards, hero banners, and interactive campaign showcases inside the web application.
> - **Featured Athlete & Focus**: Justin Jefferson alongside youth flag football community development programs (Minnesota Community Athletics & Financial Literacy).
> - **Template Format**: Interactive, responsive web promo cards and dashboard banners designed to integrate natively into both public and authenticated banking experiences.

- **Confirmed Decision 1**: Photorealistic visual generation via the `generate_image` batch pipeline matching the user's sports photography prompt specifications (youth flag football action + Justin Jefferson athletic moments).
- **Confirmed Decision 2**: Dual-surface integration: (1) public homepage featured partnership banner and community banking solutions, and (2) personalized customer dashboard sports card incentives.

---

## 1. Overview & Core Concept

- **What It Does**: Enhances the U.S. Bank portal with branded athletic partnership media that combines high-energy sports action with genuine financial products (e.g., U.S. Bank Community Flag Football Grants, Altitude® Rewards Youth Sports Cash Back, and Smartly® Checking youth athletics sponsorships).
- **Target Audience / Persona**: Bank customers, young families, and sports enthusiasts seeking modern banking tools that give back to youth athletics and community sports programs.
- **Key Value**: Replaces generic static banking graphics with dynamic, high-engagement visual storytelling that reinforces U.S. Bank's community presence and Justin Jefferson's partnership.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Public Landing Experience**:
   - The hero section presents an alternating campaign toggle between the core checking offer and the *Justin Jefferson Community Flag Football Initiative*.
   - A dedicated *"Youth Athletics & Community Impact"* showcase section features 16:9 and 4:3 high-action sports visuals with direct application and donation-matching CTAs.

2. **Authenticated Dashboard Experience**:
   - Justin Jefferson's dashboard features a responsive *Community Impact & Sports Rewards Banner* displaying current youth football league sponsorships and card cashback multipliers for athletic equipment.
   - Interactive modal opens when clicking any sports visual card, displaying campaign milestones, grant applications, and partnership video/photography details.

### Visual Identity & Theme

- **Color Palette & Mood**: Official U.S. Bank navy (`#0c2340`), crisp white (`#ffffff`), signature red accent (`#da291c`), and vibrant stadium turf accents (`#10b981`).
- **Typography**: `Plus Jakarta Sans` for clean, modern financial titles and `JetBrains Mono` for grant amounts, account figures, and statistical milestones.
- **Component Styling & Layout**:
  - Asymmetric bento-grid layout pairing high-action sports photography with clean financial metrics.
  - Generous padding, hairline borders (`border border-slate-200/80`), subtle elevations, and dark-scrim gradient overlays for high text contrast over action photography.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Visual Asset Production Pipeline**
  - *Chosen Approach*: Batch generation of 2 targeted high-resolution images using `generate_image` (Youth flag football game action + Justin Jefferson athletic moment) with `16:9` and `4:3` aspect ratios, referenced with zero-broken-image CSS fallback containers.
  - *Why*: Provides exact visual parity with the provided prompt descriptions while ensuring zero dependence on external third-party CDNs that break in hermetic sandbox environments.
  - *Alternatives Considered*: Pure CSS/SVG illustrations (lacks the dramatic emotional impact of NFL and youth sports photography).

- **Decision 2: Component Architecture & Modularity**
  - *Chosen Approach*: Dedicated reusable `SportsPromoBanner.tsx` and `CommunitySportsCard.tsx` components that can be placed both on the public marketing page and the authenticated client dashboard.
  - *Why*: Allows seamless re-use across both authenticated and public states without duplicating UI markup or layout logic.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        US Bank Digital Platform                        │
├───────────────────────────────────┬────────────────────────────────────┤
│         Public Experience         │      Authenticated Portal          │
│   (U.S. Bank Official Homepage)   │    (Justin Jefferson Dashboard)    │
├───────────────────────────────────┼────────────────────────────────────┤
│  • PublicHomePage.tsx             │  • Dashboard.tsx                   │
│    ├── Hero Partnership Banner    │    ├── Community Sports Widget     │
│    └── Youth Athletics Bento Grid │    └── Equipment Rewards Card      │
├───────────────────────────────────┴────────────────────────────────────┤
│                       Shared Sports Components                         │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │    SportsPromoBanner.tsx     │    │    CommunitySportsCard.tsx   │  │
│  │ (16:9 Cinematic Action Hero) │    │ (4:3 Bento Card with Grants) │  │
│  └──────────────┬───────────────┘    └──────────────┬───────────────┘  │
│                 │                                   │                  │
│  ┌──────────────┴───────────────────────────────────┴───────────────┐  │
│  │                   Generated Asset Pipeline                       │  │
│  │  • /src/assets/images/youth_flag_football_<ts>.jpg               │  │
│  │  • /src/assets/images/justin_jefferson_action_<ts>.jpg           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

1. `SportsPromoBanner`:
   - State: `activeTab` ('flag-football' | 'smartly-checking'), modal trigger state.
   - Handlers: `onExploreProgram()`, `onOpenGrantModal()`.
2. `CommunitySportsCard`:
   - Interactive hover elevation with 4.5:1 text scrim.
   - Expandable details drawer showing local Minneapolis youth sports funding metrics.
3. Fallback Mechanism:
   - Every `<img>` tag wrapped in a styled gradient container with `referrerPolicy="no-referrer"` to prevent visual breakage.
