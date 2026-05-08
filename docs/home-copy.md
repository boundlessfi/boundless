# Home page copy — Boundless

**Version:** 1.1
**Voice:** v2.1 default professional register (see `docs/brand-voice-guidelines.md`)
**Status:** Live product. CTAs route to sign-up / sign-in / contact, not to a waitlist.
**Reading order:** sections 1 → 8, top-to-bottom on the page.

This document is the single source of truth for the home page copy. Engineering implements from this; design lays out from this; legal reviews from this.

---

## Section 0 — Top-of-page navigation

**Logo:** Boundless wordmark, links to `/`.
**Tagline (badge or sub-mark only, not body copy):** _Ideas Made Boundless_ — allowed in the brand mark or a small badge near the logo. Not in section copy.

**Primary nav:**

- Programs
  - Hackathons → `/hackathons`
  - Grants → `/grants`
  - Bounties → `/bounties`
  - Campaigns → `/campaigns`
- How it works → `/how-it-works`
- Blog → `/blog`
- About → `/about`

**Right-side actions:**

- _Sign in_ → `/auth/signin` (link, not button)
- _Get started_ → `/auth/signup` (button, primary)

---

## Section 1 — Hero

**Eyebrow** (small text above the headline)

> Funding programs on Stellar

**Headline** (h1)

> Run hackathons, grants, and bounties — or launch a crowdfunding campaign.

**Subhead** (one or two sentences)

> Boundless is where ecosystems, foundations, and projects run funding programs — and where builders launch crowdfunding campaigns. Funds sit in on-chain escrow until the program's release rule is met.

**Primary CTA:** _Get started_ → `/auth/signup`
**Secondary CTA:** _See how it works_ → `/how-it-works`

**Visual direction:**

- A diagrammatic illustration of four program tiles (hackathon, grant, bounty, campaign) flowing into a single escrow primitive, with four release rules flowing out. Or a real screenshot of the program-creation flow.
- Avoid stock-photo illustrations of teams, abstract globes, or generic "blockchain" visuals.
- Avoid emojis in the hero.

**Voice notes:**

- The eyebrow names the category in three words. The headline names the four programs. The subhead names the audiences and the mechanism. Each line earns its place.
- Do not use _the future of [anything]_, _innovative_, _empower_, _unlock_, _seamless_. If a reviewer suggests one of these, point them to `docs/brand-voice-guidelines.md` §9.4.

---

## Section 2 — Two-audience split

This is the routing block. Two cards side-by-side. Each card states who it is for, the value, and the next step.

**Section header**

> Built for both sides of the funding loop.

**Card A — For organizers**

> _For ecosystems, foundations, projects, and DAOs._
>
> Run your next hackathon, grant round, or bounty program with on-chain escrow and verifiable release. One platform, four program types, every disbursement on Stellar.
>
> **Primary CTA:** _Run your first program_ → `/auth/signup?role=organizer`
> **Secondary link below the CTA:** _Or talk to our team_ → `/contact?topic=organizer`

**Card B — For builders**

> _For builders, teams, and contributors._
>
> Launch a milestone-based crowdfunding campaign, apply for grants, win hackathons, take bounties. Get paid on verified work — without a centralized treasury between you and your backers.
>
> **Primary CTA:** _Get started_ → `/auth/signup?role=builder`
> **Secondary link below the CTA:** _Or browse open programs_ → `/programs`

**Voice notes:**

- Both cards lead with the audience, not with _we_.
- _Get paid on verified work_ is allowed because it accurately describes the mechanism without implying a guarantee.
- Do not write _empower builders_, _unlock funding_, _the future of crowdfunding_.

---

## Section 3 — The four programs

Four cards in a 2 × 2 grid (or stacked on mobile). Each card describes what the program is, who hosts or launches it, and the release rule for that program.

**Section header**

> One platform. Four program types.

**Section subhead**

> Each program runs on the release rule that fits its shape — judging for hackathons, milestones for grants and crowdfunding campaigns, work acceptance for bounties.

**Card 1 — Hackathons**

> _Hosted by ecosystems, foundations, projects, and DAOs._
>
> Set up the prize pool, deadlines, and judging criteria. Submissions are time-bound. Prizes sit in on-chain escrow and release to selected entries when judging completes.
>
> **CTA:** _Run a hackathon_ → `/hackathons`

**Card 2 — Grants**

> _Hosted by foundations, DAOs, and ecosystems._
>
> Define the program scope, application process, and release schedule. Staged grants release on verified milestones. One-shot grants release on single approval. Every disbursement is on-chain.
>
> **CTA:** _Run a grant program_ → `/grants`

**Card 3 — Bounties**

> _Hosted by projects, DAOs, and organizers._
>
> Post a bounty with the spec and the reward. Contributors submit work; reviewers accept or reject. The bounty releases on acceptance, automatically.
>
> **CTA:** _Post a bounty_ → `/bounties`

**Card 4 — Crowdfunding campaigns**

> _Launched by builders._
>
> Define your campaign milestones. Backers fund the campaign; their contributions sit in escrow. Each milestone releases on verified progress, with backer voting on disputes.
>
> **CTA:** _Launch a campaign_ → `/campaigns`

**Voice notes:**

- Notice that each card uses the _exact_ release rule for that program. Do not paste milestone language onto the hackathon or bounty card.
- The italicized first line on each card is who hosts (or launches) — not who joins. Keep that consistent.
- Each CTA verb matches the program: _run_ a hackathon, _run_ a grant program, _post_ a bounty, _launch_ a campaign.

---

## Section 4 — How it works (compact)

A three-step compact explainer. The full version lives at `/how-it-works`.

**Section header**

> How Boundless works

**Step 1**

> **Set up the program.**
> The organizer (or builder, for campaigns) defines the program type, the participants or backers, and the release condition.

**Step 2**

> **Funds enter on-chain escrow.**
> Funds sit in a Soroban smart contract. They do not move until the program's release condition is met.

**Step 3**

> **Release on verification.**
> Verified outcomes — judged work, completed milestones, accepted submissions — release funds to the recipient on-chain. Disputes route through the platform's resolution flow.

**Link out:** _Read the full mechanism_ → `/how-it-works`

**Visual direction:** A simple 1-2-3 diagram with arrows. No animation that distracts from the copy. No emojis. No "blockchain" iconography clichés (no rotating cubes, no abstract glow).

**Voice notes:**

- _Set up the program_ uses the verb _set up_ (per brand-voice §10.1 — _set up_ is the verb, _setup_ is the noun).
- Do not claim "milestone-based release across every program." That is the failure mode v2.1 corrected.

---

## Section 5 — Why Stellar

A single-paragraph block plus a link out.

**Section header**

> Why we built this on Stellar

**Body**

> Boundless runs on Stellar for four specific reasons. Transactions finalize in 3–5 seconds, so funds release at human speed. Fees are fractions of a cent, so on-chain milestone checks are not economically prohibitive. USDC is native, so funding rounds work without bridging. Soroban supports clawback, which gives every program a working dispute path.

**Link out:** _Read more on Stellar and Soroban_ → `/why-stellar`

**Voice notes:**

- Lead with _Boundless_, not _we_.
- The four reasons are concrete and ordered by audience-relevance. Don't reorder unless you have a specific reason.
- Do not write _Stellar is the perfect blockchain for funding_. State the four mechanics.

---

## Section 6 — Trust and proof

A block built around the SCF #40 win. As more proof points accrue (security audits, programs run, organizations using the platform), expand this section.

**Section header**

> Backed by Stellar Community Fund #40

**Body**

> Boundless was awarded Stellar Community Fund #40. The grant funded the milestone contracts on Soroban, the Contribution Hub for bounties and open-source work, wallet-linked contributor profiles, and KYC and on-ramp integrations — all of which are live on the platform today.

**Visual:** SCF #40 badge or logo. When available: security audit firm logo + a link to the audit report.

**Link out:** _Read the SCF #40 announcement_ → `/blog/boundless-wins-stellar-community-fund-40`

**Future-state additions to this section** (do not include yet, but plan the layout for them):

- Security audit logo + report link
- Logo strip of organizers running programs on Boundless
- Pull quote from a hackathon winner, grant recipient, or campaign creator

**Voice notes:**

- _Backed by_ is the right verb — accurate without implying endorsement (per §12 compliance).
- Do not write _We're proud to announce_, _We're thrilled_, _honoured_. State the fact.

---

## Section 7 — From the blog

A three-card row showing the latest blog posts.

**Section header**

> From the blog

**Per card:**

- Cover image
- Title
- One-line excerpt (≤ 140 chars)
- Reading time + publish date
- Author byline (per voice spec, move toward named bylines for analysis pieces; use _Boundless Team_ for community/win posts)

**Link out:** _All posts_ → `/blog`

**Voice notes:**

- The cards inherit voice from the post itself. The home page is not the place to rewrite excerpts — fix them on the post.
- If the latest post in the rotation is the existing _"Why Crowdfunding Still Sucks"_ piece, hold the slot until that post is retitled per Open Question Q2 in the voice guide. Pointed-register slang on the home page reads off-tone.

---

## Section 8 — Final CTA

**Section header**

> Start with Boundless

**Body**

> Run a program or launch a campaign in minutes. Funds sit in on-chain escrow on Stellar — no separate treasury setup.

**Primary CTA buttons (two side by side):**

- _Run a program_ → `/auth/signup?role=organizer`
- _Launch a campaign_ → `/auth/signup?role=builder`

**Secondary line below the buttons:**

> Already on Boundless? _Sign in_ → `/auth/signin`. Looking for a partnership? _Talk to our team_ → `/contact`.

**Voice notes:**

- _Start with Boundless_ signals a live product. Do not revert to _Get on the waitlist_ or _Coming soon_ language anywhere on the page.
- _In minutes_ is a fact-claim about the setup flow. Confirm with engineering that the median first-program creation time is under 10 minutes; if it is longer, change to _in a single session_ or remove the time qualifier.
- Do not write _Be among the first to experience the future of project funding_ (an existing site phrase). It is on the v2.1 do-not-use list.

---

## Footer

Five columns plus a bottom row.

**Column 1 — Programs**

- Hackathons → `/hackathons`
- Grants → `/grants`
- Bounties → `/bounties`
- Crowdfunding campaigns → `/campaigns`

**Column 2 — Platform**

- How it works → `/how-it-works`
- Why Stellar → `/why-stellar`
- Security → `/security`

**Column 3 — Resources**

- Blog → `/blog`
- Docs → `https://docs.boundlessfi.xyz`
- FAQ → `/help`

**Column 4 — Company**

- About → `/about`
- Contact → `/contact`
- Careers → `/careers` _(when hiring)_
- Press → `/press` _(when applicable)_

**Column 5 — Legal**

- Privacy → `/privacy`
- Terms → `/terms`
- Disclaimer → `/disclaimer`
- Code of conduct → `/code-of-conduct`

**Bottom row**

- Social icons: X (`@boundless_fi`), Discord, GitHub. _(Confirm canonical X handle per voice guide Open Question Q7 before shipping.)_
- Copyright line: _© [YYYY] Boundless. Built on Stellar._

---

## Page-level metadata

To replace the current `<title>` and `<meta description>`:

**`<title>`**

> Boundless — Funding Programs on Stellar

**`<meta name="description">`**

> Run hackathons, grants, and bounties — or launch a crowdfunding campaign on Boundless. Funds sit in on-chain escrow until the program's release rule is met.

**`<meta property="og:title">`**

> Boundless — Funding Programs on Stellar

**`<meta property="og:description">`**

> The platform on Stellar for hackathons, grants, bounties, and crowdfunding campaigns. On-chain escrow for every program.

**OG image alt:** _Boundless — funding programs on Stellar._

**Canonical:** `https://www.boundlessfi.xyz` (no trailing slash)

---

## Implementation notes for engineering

1. **Server-render this page.** The home page must ship rendered HTML (Next.js Server Components or `generateMetadata` + SSR). Per the SEO audit, the current page renders only `Initializing…` to crawlers; this copy will not work without SSR.
2. **One `<h1>` only.** The hero headline is the page's `<h1>`. Section headers (sections 2–8) are `<h2>`. Step headers (section 4) are `<h3>`.
3. **CTA tracking.** Every CTA in this document should fire a tracked event. Use the existing analytics wrapper if present; otherwise set up a `homeCtaClicked` event with `location` (hero / audience-split / program-card / final-cta / footer) and `target` (signup-organizer / signup-builder / signin / contact / how-it-works / programs / hackathon / grant / bounty / campaign).
4. **Image alts.** Hero diagram: _Diagram of four Boundless program types flowing into on-chain escrow._ Program-card icons: descriptive alt per program. SCF #40 badge: _Stellar Community Fund #40 badge._
5. **Mobile.** The 2-card audience split (section 2) and the 2×2 program grid (section 3) stack to a single column under 768 px. Don't condense copy on mobile — the entire content above is mobile-readable.
6. **Existing `/waitlist` route.** Boundless is live, so the standalone waitlist page is no longer the conversion path. Recommended: 301 `/waitlist` to `/auth/signup`, or repurpose `/waitlist` into a "notify me when [specific upcoming feature] launches" page if there is a feature flag worth gating.
7. **Auth-flow consistency.** Section 2's organizer card sends users to `/auth/signup?role=organizer` and the builder card sends them to `/auth/signup?role=builder`. Confirm with engineering that the signup flow uses the `role` query parameter to pre-select the right post-signup destination (organizer dashboard vs. builder dashboard). If it does not, the `role` parameter must be added before this copy ships.
8. **Accessibility.** All CTAs are real `<a>` or `<button>` elements with descriptive labels. Cards in sections 2 and 3 are clickable as a whole and contain a focus-visible state.

---

## Voice review checklist

Before shipping this page, confirm:

- [ ] No instance of _unlock, leverage, harness, empower, seamless, robust, cutting-edge, the future of, innovative, exciting, journey, revolutionize, transformative, game-changing, holistic, paradigm._
- [ ] No exclamation points anywhere on the page.
- [ ] No emojis anywhere on the page.
- [ ] Every section header is sentence case.
- [ ] All apostrophes are straight (`'`), not curly.
- [ ] Em dashes have no surrounding spaces.
- [ ] _Campaign_ is used only for crowdfunding contexts; _program_ is the umbrella for the four types.
- [ ] No claim that _milestones_ apply to all four programs.
- [ ] Hero `<h1>` is in the rendered HTML, not behind JS.
- [ ] One CTA per logical section (the audience split has two — by design, one per card).

---

## Changelog

| Version | Date       | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-04-28 | Initial copy in v2.1 voice. Pre-launch state with waitlist as primary CTA.                                                                                                                                                                                                                                                                                                                                                                                                   |
| 1.1     | 2026-04-28 | Boundless is live. Removed all waitlist CTAs. Hero primary CTA → _Get started_. Audience split CTAs → _Run your first program_ (organizer) and _Get started_ (builder). Final CTA section reworked into a two-button _Run a program / Launch a campaign_ block. Section 6 SCF #40 copy updated to past-tense for the funded work and clarified that the funded capabilities are live. Added implementation note about repurposing or 301-ing the existing `/waitlist` route. |
