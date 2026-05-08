# Boundless Brand Voice Guidelines

**Version:** 2.1
**Last updated:** 2026-04-28
**Status:** Working draft — see "Open Questions" before treating any section as final.
**What changed in v2.1:** Removed _milestone-based_ as the universal platform descriptor. Milestones are one release mechanism (used for grants and crowdfunding campaigns); hackathons release on judging, bounties release on work acceptance. The umbrella feature is **on-chain escrow with a release condition that fits the program type** — not milestones across the board.
**What changed in v2:** Repositioned Boundless as a platform for funding programs (hackathons, grants, bounties, builder crowdfunding) — not crowdfunding alone. Reset the default register to **professional**: calm, specific, evidence-led. The contrarian/punchy register from earlier blog posts is now one _optional_ mode for opinion long-form, not the house voice.

This document is the source of truth for how Boundless sounds in writing. It is read by humans (writers, designers, contractors) and by LLMs (the `/brand-voice:enforce-voice` command auto-loads this file when generating or reviewing content).

> **Plugin note:** the brand-voice plugin expects this file at `.claude/brand-voice-guidelines.md` so it auto-loads on future sessions. If `.claude/` is writable in your local environment, copy or symlink:
> `mkdir -p .claude && ln -s ../docs/brand-voice-guidelines.md .claude/brand-voice-guidelines.md`

---

## 1. What Boundless is (and how to say it)

Boundless is the platform on Stellar for running and participating in **funding programs**. The platform supports four program types, each with a release mechanism that fits the program — not a single universal mechanism.

| Program                    | Who hosts                               | Who participates   | Release condition                                                                         |
| -------------------------- | --------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| **Hackathons**             | Ecosystems, foundations, projects, DAOs | Builders, teams    | Judging panel selects winners; prizes release to selected entries at the end of the event |
| **Grants**                 | Foundations, DAOs, ecosystems           | Builders, projects | Verified milestones for staged grants; single approval for one-shot grants                |
| **Bounties**               | Projects, DAOs, organizers              | Contributors       | Submitted work is reviewed and accepted; bounty releases on acceptance                    |
| **Crowdfunding campaigns** | Builders themselves                     | Backers            | Verified milestones; backers can vote to halt or refund                                   |

The unifying mechanism across all four is **on-chain escrow on Soroban** — funds sit in a smart contract and only move when the program's release condition is met. The condition itself varies by program. Don't claim "milestone-based release" as a universal feature; it isn't.

**One-sentence positioning (use as the home line):**

> Boundless is the platform on Stellar for hackathons, grants, bounties, and crowdfunding campaigns — with on-chain escrow for every program.

**Two-line version:**

> Boundless is where ecosystems, foundations, and projects run hackathons, grants, and bounties — and where builders launch crowdfunding campaigns. Funds sit in Soroban escrow and release on the rule that fits the program: judging for hackathons, milestones for grants and campaigns, work acceptance for bounties.

**Short variants for context-specific copy** (use whichever fits the page):

- _Funding programs on Stellar._ — shortest hero option
- _Run your next hackathon, grant round, or bounty on Boundless._ — organizer-facing
- _Launch a crowdfunding campaign with milestone-based release._ — builder-facing crowdfunding only
- _On-chain escrow for every program — judging, milestones, or work acceptance._ — when the mechanism is the headline

**What we do _not_ call Boundless:**

- Not "the milestone-based funding platform" (only some verticals use milestones)
- Not just "a crowdfunding platform" (too narrow)
- Not "a launchpad" (implies token sales)
- Not "a DAO tool" (too narrow)
- Not "a Web3 Kickstarter" (loses the program breadth)
- Not "the future of [anything]"

---

## 2. Sources used for this draft

| Source                                                             | Confidence boost | Notes                                                                             |
| ------------------------------------------------------------------ | ---------------- | --------------------------------------------------------------------------------- |
| `content/blog/boundless-wins-stellar-community-fund-40.mdx`        | High             | Best signal of measured, professional voice.                                      |
| `content/blog/what-do-you-know-about-boundless-on-x-challenge.mdx` | High             | Best signal of welcoming community-program voice.                                 |
| `content/blog/why-crowdfunding-still-sucks-for-web3-projects.mdx`  | Medium           | Used as a reference for _one_ register (opinion long-form) — not the house voice. |
| `README.md` (positioning + features)                               | High             | Captures the formal-product register.                                             |
| boundlessfi.xyz page metadata (titles, meta descriptions, JSON-LD) | Medium           | Public-facing tagline pattern.                                                    |

**Not yet used (would raise confidence):** sales-call transcripts, foundation/SCF outreach emails, Discord exports, customer-support replies, partnership decks, organizer onboarding scripts. Run `/brand-voice:discover-brand` if any exist on connected platforms.

---

## 3. Brand personality

> Boundless is a **principled operator**: the kind of professional who has shipped real funding infrastructure, knows what goes wrong on a treasury team, and writes plainly. Not loud. Not edgy. Confident because the work is verifiable. Warm with the community when warmth is earned. Doesn't oversell; doesn't undersell; states what the platform does and what it doesn't.

The voice is **measured, specific, and confident**. It treats every reader — an organizer evaluating a grants tool, a builder choosing a crowdfunding rail, a foundation deciding where to host a hackathon — as a peer professional.

---

## 4. Voice attributes — the four dials

These are the fixed attributes. Tone (section 6) adapts how loud each one runs.

### 4.1 Clear

- **We are:** Plain-spoken. We use the simplest correct word. We say what something does in one sentence before describing how it works. Sentences are short by default. Paragraphs do one thing.
- **We are not:** Dumbed-down, glib, or jargon-stripped to the point of imprecision. _Clear_ doesn't mean _simple_ — it means _the reader gets it the first time_.
- **Sounds like:** _"Funds sit in Soroban escrow until the program's release rule is met — judging for hackathons, milestones for grants and campaigns, acceptance for bounties."_
- **Does NOT sound like:** _"Boundless leverages cutting-edge blockchain primitives to facilitate seamless coordination of programmatic funding initiatives."_

### 4.2 Specific

- **We are:** Concrete. We use real numbers, real names, real timeframes. _"Funds release in 3–5 seconds on Stellar"_ not _"Funds release quickly."_ When we describe a mechanism, we describe what actually happens — proof submitted, verifier reviews, contract releases.
- **We are not:** Vague, aspirational, or dressed up in superlatives. We do not write _"the most powerful funding tool on Stellar"_ — we describe what it does.
- **Sounds like:** _"In SCF #40, Boundless was funded to ship milestone contracts, a contribution hub, wallet-linked profiles, and KYC integrations."_
- **Does NOT sound like:** _"With SCF support we're building the most comprehensive funding solution in Web3."_

### 4.3 Confident, not loud

- **We are:** Direct about what works and what doesn't. We make claims and back them. We say _"Boundless does X"_ (when it does), not _"Boundless will revolutionize X."_ Tone is calm; the platform's work speaks for itself.
- **We are not:** Hyperbolic, breathless, or hype-shaped. We don't use exclamation points to manufacture energy. We don't lead with "🚀" in formal contexts.
- **Sounds like:** _"Funds sit in escrow. Release is conditional. Verification is on-chain. That's the whole product thesis."_
- **Does NOT sound like:** _"The future of funding is HERE!! 🚀🚀🚀 Get ready to be AMAZED!"_

### 4.4 Generous when warranted

- **We are:** Specific in our gratitude. We name people, ecosystems, and partners by name when they're owed credit. We acknowledge what the community contributed when the community contributed it.
- **We are not:** Performatively warm in every piece of copy. Warmth is _earned context_, not the default coat of paint. A product page should not gush; an SCF win post should.
- **Sounds like:** _"This work was funded by Stellar Community Fund #40. Thanks to the SDF reviewers and the community members who tested the milestone flow before submission."_
- **Does NOT sound like:** _"We're so grateful for our amazing community! 💙 We couldn't do this without YOU!"_

---

## 5. Audience

The voice has to serve two professional audiences and one community audience without changing identity.

### 5.1 Primary professional audiences

- **Program organizers** — ecosystem teams (Stellar, others), foundations (SCF reviewers, grants programs), projects with treasuries, DAOs running hackathons or bounties. Buying decision is _"can we run our next [program] on this and stand behind it?"_
- **Builder principals** — founders or technical leads who would launch a crowdfunding campaign on Boundless instead of going to a centralized rail or rolling their own multisig flow. Buying decision is _"is this safer for our backers and credible to our community?"_

### 5.2 Community audience

- **Participants** — hackers, grant applicants, bounty hunters, contributors, backers. They evaluate Boundless every time they decide to put time or capital into a program hosted on it.

### 5.3 What to assume

- Knows what a multisig, escrow, audit, and on-chain verification are.
- Does _not_ need a "what is blockchain" preamble.
- Reads English at a professional level; tolerates sub-clauses, but appreciates short sentences.
- Is skeptical of hype and rewards specificity. Has likely been burned by a Web3 product that overpromised.

### 5.4 How they expect to be addressed

- **Organizers**: as peers. Second person ("you can host a grants program") is fine; corporate-pleasing language ("our valued partners") is not.
- **Builders**: as peers. Same register, slightly warmer — a builder lead is choosing a tool to put their reputation on.
- **Participants**: warmly but not breezily. Welcome them; respect their time.

---

## 6. Tone matrix — how voice adapts by context

The four voice attributes (Clear, Specific, Confident-not-loud, Generous-when-warranted) are always on. The tone matrix tells you which dial leads, and which optional registers are allowed.

| Context                                       | Lead dial(s)         | Allowed register                          | Example opener                                                                                                                 |
| --------------------------------------------- | -------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Product / landing page copy                   | Clear + Specific     | Default professional                      | _"Run your next hackathon on Boundless. Prizes sit in on-chain escrow until judging completes."_                               |
| How-it-works / docs                           | Clear + Specific     | Default professional                      | _"A program on Boundless has three phases: setup, participation, and milestone release. Each is described below."_             |
| Organizer / partnership outreach              | Specific + Confident | Default professional                      | Lead with what the organizer gets, not what we want.                                                                           |
| Foundation / grant proposal                   | Specific + Confident | Default professional, slightly formal     | Numbers and deliverables in the first paragraph.                                                                               |
| Press release                                 | Specific + Confident | Default professional, formal              | News in the lede. Quote second. No exclamations.                                                                               |
| Community win / SCF announcement              | Generous + Confident | Default professional with measured warmth | _"Boundless is now part of Stellar Community Fund #40. Here's what it funds, and what we're shipping next."_                   |
| Hackathon / community-program invite          | Generous + Clear     | Welcoming community register              | _"This challenge is open to anyone — builders, designers, writers — who wants to share what Boundless is in their own words."_ |
| Onboarding / first-run microcopy              | Clear + Generous     | Welcoming, encouraging                    | _"You're set up. Create your first program in three steps."_                                                                   |
| Error states & empty states                   | Clear + Generous     | Blame-free, action-first                  | _"We couldn't load this milestone. Refresh, or come back in a moment."_                                                        |
| Bad news (delay, deprecation, scope cut)      | Clear + Confident    | Direct, accountable                       | Decision first, reason second, what-the-reader-should-do-next third.                                                           |
| Incident / outage communication               | Clear + Confident    | Direct, accountable                       | What broke, what's affected, what we're doing, when we'll update again.                                                        |
| X / Twitter — product or program updates      | Clear + Specific     | Default professional, concise             | One claim per post. No emoji unless it's a launch moment.                                                                      |
| X / Twitter — opinion / thought leadership    | Confident + Specific | **Pointed register allowed** (see §7.3)   | Reserved for posts that take a position.                                                                                       |
| LinkedIn                                      | Specific + Confident | Default professional                      | Lead with a number or a learning. No emojis.                                                                                   |
| Discord — operator channels                   | Clear + Generous     | Default professional, slightly looser     | Same voice, fewer commas.                                                                                                      |
| Discord — community channels                  | Generous + Clear     | Looser community register                 | Lowercase fine. Emojis fine. Still no profanity.                                                                               |
| Long-form blog — explainer                    | Clear + Specific     | Default professional                      | Open with a question the reader has. Answer it. Then go deep.                                                                  |
| Long-form blog — opinion / thought leadership | Confident + Specific | **Pointed register allowed** (see §7.3)   | Reserved for posts that take a position.                                                                                       |
| Customer / participant support                | Clear + Generous     | Welcoming, action-first                   | Acknowledge, give the answer, link the doc.                                                                                    |

---

## 7. Three registers — and when to use each

Boundless writes in three registers. The voice attributes (§4) stay constant; the register controls _how the words land_.

### 7.1 Default professional (the house voice)

**Use for:** product UI, landing pages, docs, organizer outreach, foundation proposals, press releases, most blog posts, most social, most email.

**Sounds like:** measured, specific, calm. No exclamation points. No emojis. No slang. No hyperbole. Sentences are short by default. Claims are backed by mechanism or numbers.

**Test:** would a Stellar Foundation reviewer or a corporate development lead read this and think _"these are operators"_? If yes, the register is right.

### 7.2 Welcoming community register

**Use for:** community challenge posts, hackathon invites, onboarding moments, Discord general channels, contributor recognition.

**Sounds like:** warmer, second-person, encouraging. Emojis allowed in moderation (max one per piece, almost always 🚀 only). Says "you" a lot. Invites people in by name.

**Test:** would a first-time hackathon participant read this and feel both welcomed and respected? If yes, the register is right.

### 7.3 Pointed register (rationed)

**Use for:** opinion long-form, thought-leadership X threads, conference talks, founder essays.

**Sounds like:** confident, takes a position, names problems precisely, may name competitors on factual grounds. Still no profanity, no slang, no memes. The "Why Crowdfunding Still Sucks" post is _not_ this register — it's overcorrected. The pointed register is _Stripe's writeups about merchant fraud_, not crypto-Twitter.

**Rules:**

- One pointed long-form per quarter, max. Most writing is default professional.
- Always evidence-led. A pointed claim has a number, a study, or a named example behind it.
- Never personal. Critique mechanisms, not people or teams.
- Headlines stay under control. _"Why On-Chain Crowdfunding Underdelivers"_ — not _"Why Crowdfunding Still Sucks."_
- Cannot be used for product or organizer outreach copy. Reserved for editorial.

**Test:** would the post still be a credible argument if a regulator, a foundation reviewer, and a builder all read it? If yes, the register is right.

---

## 8. Messaging pillars

In rough priority order. Every long-form piece should reinforce at least one. Every product-page block should map to one.

1. **One platform for the full funding loop.** All four program types — hackathons, grants, bounties, and crowdfunding campaigns — in one place. Organizers run programs; builders launch campaigns; participants get paid; backers can verify. No fragmented stack.
2. **On-chain escrow with the right release rule for the program.** Funds sit in Soroban escrow until the program's release condition is met. The condition is program-specific: judging for hackathons, milestones for grants and crowdfunding campaigns, acceptance for bounties. _Never_ claim a single mechanism applies to all four.
3. **Built on Stellar / Soroban for specific reasons.** Fast finality, low fees, native USDC, clawback for disputes, mature smart-contract platform. Always say _why_ Stellar, not just _that_ Stellar.
4. **Verifiable outcomes over reputation alone.** Funding decisions are tied to evidence — judged work, shipped milestones, accepted submissions — not track record or social proof alone.
5. **Community-shaped, in public.** SCF #40, hackathons, contributor programs, Discord. The platform is built with the people who use it.

**Approved program-specific lines** (use as variants, not as the lede on a generic page):

- Hackathons: _"Run hackathons where prizes release on judging, on-chain."_
- Grants: _"Grant programs that release on verified milestones — or single approval for one-shot grants."_
- Bounties: _"Bounties that release on accepted work, automatically."_
- Crowdfunding campaigns: _"Backers fund execution, not promises — funds release on verified milestones."_

**Phrases we don't own and won't use:**

- "The future of [funding/crowdfunding/Web3]"
- "The most [adjective] [category] platform"
- "Empowering builders to unlock their potential"
- "Web3 Kickstarter"
- "Disrupt traditional funding"

---

## 9. Style rules

### 9.1 Mechanics

| Rule              | Choice                                                                                     | Example                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Oxford comma      | Yes                                                                                        | _fast, low-cost, and verifiable_                                         |
| Headings          | Sentence case                                                                              | _How it works_ — not _How It Works_                                      |
| Contractions      | Use them in default professional and below; spell out in formal proposals and press        | _we're, don't, won't_                                                    |
| Em dashes         | Use them, no surrounding spaces                                                            | _funded—and verified_                                                    |
| En dashes         | Ranges only                                                                                | _2017–2018, 3–5 seconds_                                                 |
| Numbers           | Numerals for stats and money; spell out 1–9 in flowing prose                               | _5 features_ but _$5.6 billion across 875 ICOs_                          |
| Percent           | `%` symbol, no space                                                                       | _34%_                                                                    |
| Currency          | Use ticker for crypto, $ for USD/USDC                                                      | _500 ETH, 300K USDC, $200K_                                              |
| Date format       | Month DD, YYYY                                                                             | _January 15, 2026_                                                       |
| Apostrophe        | Straight `'`, not curly `'`                                                                | Lock straight `'` everywhere — fix curly characters in MDX before commit |
| Lists             | Periods on full sentences, no periods on fragments                                         | Mixed lists default to no periods                                        |
| Exclamation marks | None in headlines, default copy, or formal contexts. One max in welcoming-register pieces. | Save for genuine wins, never as energy filler                            |
| ALL CAPS          | Don't                                                                                      | Use bold for emphasis                                                    |
| Ellipsis          | Avoid                                                                                      | Use a period or em dash for a pause                                      |

### 9.2 Formatting

- **Bold** for key claims, numbers, or program names. Not for whole paragraphs. Not for decoration.
- _Italics_ for titles of works (whitepapers, books, blog posts when referenced) and rare semantic emphasis.
- ✅ / ❌ are allowed in long-form blog posts as visual rhythm devices. **Not** in product UI, docs, or organizer-facing copy.
- **Emojis are off by default.** They are allowed in:
  - Welcoming-register pieces (max one per piece, almost always 🚀)
  - Discord community channels
  - Internal team channels
    They are **not allowed** in: product UI, docs, organizer outreach, foundation proposals, press releases, LinkedIn, default-register blog posts, or any subject line.
- Headings: don't skip levels. One `<h1>` per page, then `##`, then `###`. The `<h1>` should carry the value prop or topic, not a brand pun.

### 9.3 Links

- Link text describes the destination. Never _click here_, _read more_, or _learn more_.
- External links open in a new tab from blog content; same tab from app navigation.
- The phrase "boundlessfi.xyz" appears as a clickable link, never bare.

### 9.4 Voice gotchas

- **Don't pun on the brand name.** _"Make ideas boundless"_ / _"boundless possibilities"_ reads as filler. Let the value prop carry the message; "Ideas Made Boundless" is reserved for hero/badge use, not body copy.
- **Don't lead with "we."** Lead with the reader, the problem, or the result. _"Run your next hackathon on Boundless"_ not _"We help you run hackathons."_
- **Don't over-explain blockchain.** The audience knows. _"On-chain accountability via Soroban smart contracts"_ is enough; don't define Soroban.
- **Don't use "trustless" loosely.** Use it precisely (no third party required), not as a synonym for "good" or "secure."
- **Don't conflate "campaign" with "program."** A _program_ is the umbrella (hackathon / grant / bounty / crowdfunding campaign). A _campaign_ specifically means a builder-launched crowdfunding effort.
- **Don't lead a product page with the contrarian register.** Save the pointed register for §7.3 contexts.
- **AI-tells to delete on sight:** _unlock, harness, leverage, in today's [X] landscape, comprehensive solution, robust, seamless, cutting-edge, journey, innovative, exciting, the future of, revolutionize, paradigm, ecosystem (when vague), empower, transformative, game-changing, supercharge, unleash, holistic, synergy._ If a draft has one, rewrite the sentence.

---

## 10. Terminology

### 10.1 Platform vocabulary

| Use                                                  | Not                                              | Why                                                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **program** (umbrella term)                          | initiative, offering                             | Boundless's umbrella for hackathon / grant / bounty / campaign                                                                              |
| **campaign**                                         | crowdfund (noun), fundraise (noun), raise (noun) | Specifically a builder-launched crowdfunding effort                                                                                         |
| **organizer**                                        | host, sponsor, admin, owner                      | Generic term for whoever runs a program                                                                                                     |
| **participant**                                      | applicant, entrant, user                         | Generic term for whoever joins a program                                                                                                    |
| **builder**                                          | founder, entrepreneur, project owner             | The person launching a crowdfunding campaign or applying to a program                                                                       |
| **backer**                                           | investor, donor, supporter                       | Backs a campaign — never _invests_ (regulatory)                                                                                             |
| **contributor**                                      | freelancer, gig worker                           | Specifically a bounty-taker or OSS contributor                                                                                              |
| **milestone-based** _(grants and crowdfunding only)_ | progress-based, stage-based, phased              | The release mechanism for staged grants and crowdfunding campaigns. Do **not** apply to hackathons (judged) or bounties (acceptance-based). |
| **on-chain escrow**                                  | smart-contract custody, locked funds             | The platform-wide feature. Use this when describing what's universal across all four program types.                                         |
| **release condition** _(or release rule)_            | trigger, unlock                                  | Generic term for whatever moves funds out of escrow — judging, milestone, acceptance, etc.                                                  |
| **escrow**                                           | smart-contract vault, holding pool               | Plain word the audience already knows                                                                                                       |
| **on-chain accountability**                          | transparency (alone)                             | Transparency is the input; accountability is the output                                                                                     |
| **funds release**                                    | payouts, fund release                            | Verb-noun pattern, lowercase                                                                                                                |
| **ship**                                             | release, deploy (in marketing copy)              | _Ship_ is the right verb                                                                                                                    |
| **Stellar / Soroban**                                | the Stellar blockchain / the Soroban platform    | The audience knows                                                                                                                          |
| **Boundless**                                        | Boundless platform, the Boundless platform       | Just _Boundless_ — no article, no "platform" suffix                                                                                         |
| **`#BoundlessBuild`**                                | `#Boundless`, `#boundlessfi`                     | Official campaign hashtag                                                                                                                   |
| **sign up** _(verb)_                                 | signup, sign-up                                  | _signup_ is the noun                                                                                                                        |
| **log in** _(verb)_                                  | login                                            | _login_ is the noun                                                                                                                         |
| **set up** _(verb)_                                  | setup                                            | _setup_ is the noun                                                                                                                         |
| **email**                                            | e-mail                                           | One word, no hyphen                                                                                                                         |
| **website**                                          | web site                                         | One word                                                                                                                                    |

### 10.2 Slang to use carefully

| Term              | Status                               | Notes                                                                                                                    |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| rug pull / rugged | **Allowed in pointed register only** | Audience-native term but reads slangy in default register. Use _abandoned project, undelivered project_ in default copy. |
| vaporware         | **Allowed in pointed register only** | Same. In default register: _projects that didn't ship._                                                                  |
| trust me bro      | **Pointed register only**            | Quoting the antagonist position, never our own.                                                                          |
| gm / wagmi / ngmi | **Discord community channel only**   | Off-limits in product copy, blog posts, and X.                                                                           |
| sucks             | **Avoid in titles and headlines**    | Use in body copy of pointed register only, sparingly. Default: _underdelivers, falls short._                             |
| ape, degen, alpha | **Avoid**                            | Reads as crypto-Twitter; off-tone for organizer audience.                                                                |

### 10.3 Capitalization for product surfaces

| Term                                                           | Treatment                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| Boundless                                                      | Capitalized                                                          |
| Stellar Community Fund (SCF)                                   | Capitalized; _SCF #40_ on second mention                             |
| Soroban                                                        | Capitalized                                                          |
| program, campaign, hackathon, grant, bounty, milestone, escrow | Lowercase (these are mechanisms or program types, not product names) |
| Contribution Hub                                               | Capitalized (named product surface)                                  |
| Wallet-linked profile                                          | Sentence case                                                        |

### 10.4 Inclusive language

- Use _they/them_ for unknown individuals.
- Avoid ableist shorthand: _crazy, blind spot, lame, dumb, sanity check._
- Avoid _easy, simple_ as adjectives applied to user actions — they imply blame if the user struggles. Prefer _short, fast, in [N] minutes._
- Avoid culturally specific idioms in product UI. Idioms are fine in long-form when they earn their place.

### 10.5 Acronym policy

- Spell out on first use, parenthesize the acronym, use the acronym thereafter.
- Exceptions (assume the audience knows): ETH, BTC, USDC, NFT, DAO, KYC, MVP, OSS, RFP, TVL, DeFi, SDK, API.

---

## 11. Channel-specific cheat sheet

### 11.1 X / Twitter

- One claim per post. Land the claim in the first 12 words.
- **Default register** is the baseline, not the pointed register. Most posts are: a fact, a number, an update, or a credit to a partner.
- Pointed register threads are reserved for thought-leadership moments — see §7.3.
- Tag `@BuildOnStellar` and `@StellarOrg` when relevant.
- Threads: 3–6 posts max. Open with the claim, close with what to do next or where to read more.

### 11.2 LinkedIn

- Default register only.
- Lead with a number, a learning, or a mechanism. _"In SCF #40, we proposed milestone contracts as the primitive. Here's what we shipped first."_
- No emojis. No exclamation points. No `gm`.
- One paragraph break between every 1–2 sentences for mobile reading.

### 11.3 Discord — operator and announcement channels

- Default register, slightly looser. Same voice; fewer commas.
- For announcements: _"Heads up — milestone v2 contracts are live. Notes below."_
- No memes in `#announcements`. Memes belong in `#general` only.

### 11.4 Discord — community / general channels

- Welcoming register. Lowercase is fine. Emojis are fine. Memes are fine. Profanity is still off.
- Default to first-name energy — answer like a teammate, not like a brand.

### 11.5 Blog (long-form)

- Default register unless the piece is explicitly opinion (§7.3).
- Open with a question the reader has, or with a fact that orients them. Don't open with a hot take unless this is a §7.3 piece.
- One strong rhetorical device per section (analogy, callout, chart). Don't stack them.
- End with what the reader can do next. Never end with "Conclusion."
- Use the post's own description in `excerpt`; keep it under 160 chars.

### 11.6 Product UI / microcopy

- Default register, tightened.
- Buttons: verb-first, ≤ 3 words. _Create program, Launch campaign, Submit milestone, Back this campaign._
- Empty states: state what's missing, then what to do. _"No programs yet. Create your first one."_
- Errors: blame the system, name the action. _"We couldn't load your milestones. Try refreshing."_
- Toasts: under 60 characters when possible. Past tense for completion, present tense for in-progress.

### 11.7 Email — transactional

- Subject: an outcome, not a topic. _"Your milestone submission is approved"_ — not _"Milestone update."_
- One CTA per email. Buttons before the fold.
- Sign off: _— The Boundless team._ No "no-reply" signatures.

### 11.8 Email — outreach (organizer / partnership)

- Default register, slightly more formal.
- Lead with what the recipient gets, not what we want.
- Length: under 150 words for a cold outreach. Specific ask in the last sentence.
- No automation tells (_"I noticed you're the [title] at [company]"_ — delete on sight).

### 11.9 Foundation / grant proposal

- Default register, formal.
- Numbers in the first paragraph. Deliverables as a list. Milestones with dates.
- Spell out acronyms even if the reviewer knows them.
- No contractions in the proposal body; contractions in any cover letter or accompanying email are fine.

### 11.10 Press release

- Default register, formal.
- News in the lede. Quote in the second paragraph. Boilerplate at the end.
- No exclamation points. No emojis. No first-person plural in the body — refer to _Boundless_, not _we_.

---

## 12. Compliance / legal posture

Boundless sits adjacent to financial services. Public copy should:

- **Avoid securities-style language unless it's the right language.** Don't say _invest, investment, investor, returns, ROI_ casually. Use _back, support, fund._ Backers back campaigns; they do not invest.
- **Avoid implied guarantees.** Don't say _funds are safe, your money is protected, guaranteed payout._ Say _funds release when the program's release condition is met_ (milestone verification, judging, work acceptance — name the specific one) and link to the mechanism.
- **Avoid superlatives without evidence.** _"The safest crowdfunding platform"_ and _"the future of project funding"_ are off-limits. _"On-chain escrow on Stellar"_ is fine.
- **Don't apply one program's mechanism to another.** Hackathon prizes don't release on milestones; bounties don't run on milestones; one-shot grants don't either. Match the mechanism to the program.
- **Don't overstate third-party endorsement.** SCF #40 is _backing_, not _endorsement_. Stellar Development Foundation does not _endorse_ Boundless.
- **Always link to /terms and /disclaimer** from any program-creation, campaign-launch, or backing flow.

When in doubt about a claim, escalate to legal review _before_ publish, not after.

---

## 13. Open questions (please review)

These are the places the source material was ambiguous or where v2 made a directional call that should be confirmed.

| #   | Question                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Recommended default                                                                                                                                                                                                                                                                       | Confidence              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Q1  | Is _program_ the right umbrella term across hackathons/grants/bounties/campaigns? Or do we want a brandier term?                                                                                                                                                                                                                                                                                                                                                  | _Program_ is plain, accurate, and unowned. Recommend keeping.                                                                                                                                                                                                                             | High                    |
| Q2  | Is the existing _"Why Crowdfunding Still Sucks"_ blog post staying as-is, or do we want to retitle / re-edit it under the v2 register?                                                                                                                                                                                                                                                                                                                            | Retitle to something like _"Why On-Chain Crowdfunding Underdelivers — and How Milestones Fix It."_ Keep the body but soften the punchier moments (_"rugged in 4K," "trust me bro"_).                                                                                                      | High — recommend action |
| Q3  | Homepage `<title>`. v1 suggested `Boundless — Milestone-Based Crowdfunding on Stellar`; v2 generalized that to milestone-based funding; v2.1 corrects again because milestones aren't universal.                                                                                                                                                                                                                                                                  | Recommended: `Boundless — Funding Programs on Stellar` (54 chars, accurate, program-agnostic). Alternative: `Boundless — Hackathons, Grants, Bounties & Crowdfunding on Stellar` (66 chars, more concrete but borderline-long). Keep _Ideas Made Boundless_ as a hero/badge tagline only. | High                    |
| Q4  | Profanity policy. Default register has none. Pointed register: _sucks_ allowed in body, never in title? Anything stronger ever?                                                                                                                                                                                                                                                                                                                                   | Confirmed: no profanity in titles or default register. _Sucks/damn_ allowed in pointed-register body sparingly. Stronger is off.                                                                                                                                                          | Medium                  |
| Q5  | AI-content policy. The X-challenge post says _"use AI sparingly or not at all."_ Is that a participant guideline, a brand position, or both?                                                                                                                                                                                                                                                                                                                      | Both: brand position is human-authored final copy, AI allowed for drafting. State it on a public page (e.g., About, or a Newsroom standards doc).                                                                                                                                         | Medium                  |
| Q6  | Naming competitors. Does the brand name Mirror / Juicebox / Gitcoin in pointed pieces?                                                                                                                                                                                                                                                                                                                                                                            | Yes, on factual mechanism grounds only (_"Mirror disburses funds at raise close"_), never on competence or character.                                                                                                                                                                     | Medium                  |
| Q7  | Official X handle. Site uses `@boundlessfi` in `twitter:site`; blog posts use `@boundless_fi`. Which is canonical?                                                                                                                                                                                                                                                                                                                                                | Treat **`@boundless_fi`** as canonical until you confirm otherwise — that's the handle in your live posts. Fix the metadata if so.                                                                                                                                                        | High — please confirm   |
| Q8  | Author bylines. Posts are signed _Boundless Team_. Move toward named bylines?                                                                                                                                                                                                                                                                                                                                                                                     | Yes. Use _Boundless Team_ for SCF/community-win posts. Use named author + Person schema for analysis pieces.                                                                                                                                                                              | Medium                  |
| Q9  | ~~"We're building" vs. "Boundless does X." When does the shift happen?~~ **Closed 2026-04-28** — Boundless is live. Use _Boundless does X_ (present tense) by default. _We're building [specific upcoming capability]_ is allowed only in changelog or roadmap copy, never as a brand-level framing. Audit existing copy for _we're building_, _in development_, _coming soon_, _targeting Q1_, _be among the first_ and replace with present-tense product copy. | Resolved                                                                                                                                                                                                                                                                                  |
| Q10 | Apostrophe lint. MDX posts mix curly `'` and straight `'`.                                                                                                                                                                                                                                                                                                                                                                                                        | Lock straight `'`. Add a Markdownlint or Prettier rule.                                                                                                                                                                                                                                   | High                    |
| Q11 | Welcoming register — how often to use it. Risk: if every community post is warm and fuzzy, the operator audience reads us as casual.                                                                                                                                                                                                                                                                                                                              | Use welcoming register only for explicitly community moments (challenges, contributor recognition, hackathon invites). All other community-facing copy is default register.                                                                                                               | Medium                  |
| Q12 | Multilingual (Spanish, Portuguese, French) — Stellar's audience is global.                                                                                                                                                                                                                                                                                                                                                                                        | Defer until US English voice is locked. Then translate, don't transcreate, until volume warrants a localization pass.                                                                                                                                                                     | Low — placeholder       |
| Q13 | Customer-support / participant-support voice — not represented in source material.                                                                                                                                                                                                                                                                                                                                                                                | Extend this guide with a _Support_ row in the tone matrix once 20+ resolved tickets are sampled.                                                                                                                                                                                          | Medium                  |

---

## 14. Worked examples

### Example A — Homepage hero (default register)

**On-voice:**

> Funding programs on Stellar.
> Run hackathons, grants, and bounties — or launch a crowdfunding campaign. Funds sit in on-chain escrow and release on the rule that fits the program.

**Why this works:** specific without overclaiming, names all four program types, describes the unifying mechanism (escrow) without claiming a universal release rule.

**Off-voice:**

- _Milestone-based funding on Stellar. Funds release on verified milestones across every program._
  - Why off: hackathons don't run on milestones; this overclaims the mechanism.
- _Ideas Made Boundless. The future of decentralized funding is here._
  - Why off: brand pun lead, "future of," no mechanism, no audience.

### Example B — Organizer outreach email (default register)

**On-voice:**

> **Subject:** Hosting your next grants round on Boundless
>
> Hi [Name],
>
> Saw the announcement of [Program]. Boundless might fit your next round — funds sit in Soroban-based escrow and release as recipients hit verified milestones, so you don't run a second treasury process for follow-on tranches.
>
> Two-line summary: organizers define milestones, recipients submit proof, funds release on verification. Live on Stellar mainnet.
>
> If it's worth a 20-minute conversation, I'm at [email] or [calendar link].
>
> — [Name], Boundless

**Off-voice:**

- _Hi [Name]! 🚀 We're SO excited to introduce Boundless, the future of grant funding! Our cutting-edge platform empowers organizers to seamlessly unlock the full potential of their programs! Would love to hop on a quick call!_

### Example C — SCF announcement (default register with measured warmth)

**On-voice:**

> Boundless is now part of Stellar Community Fund #40.
>
> What it funds: milestone contracts on Soroban, the contribution hub for bounties and OSS work, wallet-linked contributor profiles, and KYC integrations for real-world payouts.
>
> Thanks to the SDF reviewers and the community members who tested the milestone flow before submission. The platform ships better because of you.
>
> What's next: contracts on testnet by [date], mainnet by [date]. Updates in #announcements.

### Example D — Empty state (default register)

**On-voice:**

- _No programs yet. Create your first one — hackathon, grant, bounty, or campaign._

**Off-voice:**

- _You haven't launched any programs! 🚀 Click here to begin your journey._

### Example E — X post (default register, product update)

**On-voice:**

> Milestone v2 contracts are live on Stellar testnet.
>
> What's new: programmable verifiers, multi-signer release, partial refunds on dispute.
>
> Docs: [link]. Mainnet target: [date].

**Off-voice:**

- _🚀🚀 Milestone v2 is HERE! 🚀🚀 Get ready to be AMAZED by the next-gen verifiable funding experience. The future is now! 💎 #BuildingTheFuture_

### Example F — X thread (pointed register, opinion)

**On-voice:**

> 1/ Most Web3 funding programs disburse capital in one tranche, on the day the grant or campaign closes.
>
> 2/ The 2023 study of 200 DAO grants found 34% delivered what was promised. The single biggest predictor of non-delivery: lump-sum disbursement at award.
>
> 3/ Boundless puts every program in on-chain escrow and ties release to a verifiable rule — milestones for grants and campaigns, judging for hackathons, work acceptance for bounties.
>
> 4/ Read more: [link]

This is allowed because it's evidence-led, names a mechanism, doesn't insult anyone, and stays under control.

### Example G — Bad news email (default register, accountable)

**On-voice:**

> **Subject:** Mainnet launch moving from April 28 to May 12
>
> Two issues turned up in the security audit that need fixing before launch. We're moving the mainnet date from April 28 to May 12.
>
> What this means for you: campaigns and programs already drafted will roll over. No data loss. No re-auth.
>
> What we're doing: posting daily progress in Discord (#mainnet-launch). Next written update on May 5.
>
> — The Boundless team

---

## 15. How to use this document

- **Writing new content?** Read §3 (personality), §4 (voice attributes), §6 (tone matrix for your channel), §7 (which register), §9 (style rules), §10 (terminology). In that order.
- **Reviewing someone else's content?** Run `/brand-voice:enforce-voice` and pass the draft. The tool reads this file automatically.
- **Found a place this document is silent or wrong?** Edit it. Bump the version. Open a PR. Tag the brand owner.
- **Want to source more material?** Run `/brand-voice:discover-brand` to scan connected platforms and feed material back into a future version.

---

## 16. Confidence and changelog

**Per-section confidence:**

- §1 What Boundless is — High (corrected twice with explicit user input; v2.1 reflects current understanding)
- §3 Personality — Medium-high
- §4 Voice attributes — High (consistent across SCF post, README, and metadata)
- §5 Audience — High (two-sided audience now explicit)
- §6 Tone matrix — Medium (some channels not in source; inferred best-practice)
- §7 Three registers — Medium-high (the register split is the biggest v2 directional call)
- §8 Messaging pillars — High (v2.1 makes them mechanism-accurate per program type)
- §9 Style rules — Medium-high (some inferred from inconsistencies)
- §10 Terminology — High (v2.1 added on-chain escrow and release condition; clarified milestone-based as program-specific)
- §11 Channel cheat sheet — Medium
- §12 Compliance — Medium (needs counsel sign-off)
- §13 Open questions — N/A

**Changelog**

| Version | Date       | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-04-28 | Initial draft. Crowdfunding-anchored positioning, builder/community register as default.                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.0     | 2026-04-28 | Repositioned: Boundless = milestone-based funding platform across hackathons, grants, bounties, and crowdfunding campaigns. Reset default register to professional. Added three-register model (default professional / welcoming community / pointed editorial). Expanded audience to include organizers as a peer professional audience. Added program-vs-campaign terminology distinction.                                                                                              |
| 2.1     | 2026-04-28 | Removed _milestone-based_ as the universal platform descriptor. Hackathons run on judging, bounties on work acceptance, grants and campaigns on milestones (or single approval for one-shot grants). Updated §1 positioning, §4.1 example, §8 pillar #1 and #2, §10 terminology, §12 compliance phrasing, §13 Q3, §14 Examples A and F. Added two new terms to §10: _on-chain escrow_ (the platform-wide feature) and _release condition / release rule_ (the program-specific umbrella). |
| 2.1a    | 2026-04-28 | Closed Q9: Boundless is live. Switch from _we're building_ / _coming soon_ / _targeting Q1_ phrasing to present-tense product copy. Affects existing site copy on `/waitlist`, blog post excerpts, and the README.                                                                                                                                                                                                                                                                        |
