# 🌟 Wishly — Version 2.0 & Future Roadmap

This document outlines the planned enhancements, architectural vision, and feature roadmap for future iterations of **Wishly**.

---

## 🧭 Product Vision
Wishly began as a warm, private sanctuary to capture life dreams and celebrate memories. With the introduction of public sharing and Telegram connections, Wishly is evolving into a **social dream sanctuary** — a community where people not only articulate their deepest aspirations, but also discover others who share them and receive genuine support to turn them into reality.

---

## 🗺️ Roadmap Pillars

```
                     ┌─────────────────────────────────────────┐
                     │           WISHLY PLATFORM               │
                     └────────────────────┬────────────────────┘
                                          │
         ┌───────────────────┬────────────┴───────┬────────────────────┐
         │                   │                    │                    │
┌────────┴────────┐ ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐
│ 1. Community    │ │ 2. Action &     │  │ 3. Sanctuary    │  │ 4. Discovery &  │
│    Collaboration│ │    Progress     │  │    Aesthetics   │  │    Inspiration  │
└─────────────────┘ └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 1. Community & Dream Collaboration

### 1.1 "I Can Help" & "Cheer" Micro-Reactions
* **Concept:** Lower the barrier to reach out. Before taking the leap to message someone on Telegram, allow community members to leave lightweight, meaningful reactions on public dreams.
* **Reaction Types:**
  * 💛 **"Believing in you"** — Emotional support and cheerleading.
  * 🤝 **"I've done this"** — Signals experience and willingness to offer advice.
  * 🛠️ **"I can help with this"** — Concrete offer of assistance or resources.
* **Notification:** The dream owner receives an in-app encouragement badge and optional notification.

### 1.2 Dream Matchmaker ("You’re Not Dreaming Alone")
* **Concept:** Connect people sharing identical or related goals (e.g., both aspiring to hike Mount Kilimanjaro, launch an indie podcast, or study in Japan).
* **Features:**
  * AI-powered semantic matching of public dreams across different wordings.
  * Suggestion badge: *"3 other dreamers in the community share this dream."*
  * Option to connect as mutual accountability partners.

### 1.3 "Lived It" Community Hall of Fame
* **Concept:** A dedicated feed in **Discover** highlighting completed dreams and their memory capsules.
* **Features:**
  * Celebration of real dreams turned into reality.
  * Before-and-after memory photos and reflections.
  * Shows newly joined dreamers that dreams documented on Wishly actually come true.

### 1.4 Collaborative / Shared Wishes
* **Concept:** Dreams meant to be shared with a partner, family member, or close friend (e.g., *"Visit the Amalfi Coast with Maya"*).
* **Features:**
  * Invite a co-dreamer via a magic link.
  * Shared status, joint memory capsule uploads, and combined celebrations.

---

## 2. Action & Progress ("From Wish to Reality")

### 2.1 Dream Milestones (Stepping Stones)
* **Concept:** Large life dreams can feel intimidating without intermediate steps.
* **Features:**
  * Break down any wish into 2–5 bite-sized checkpoints (e.g., *"Run a Marathon"* → *1. Get fitted running shoes*, *2. Complete a 5k*, *3. Run half-marathon*).
  * Subtle progress indicator bar on the dream card.
  * Auto-progress status from `DREAM` to `IN_PROGRESS` upon completing the first milestone.

### 2.2 Sanctuary Reflections ("Gentle Whispers")
* **Concept:** Compassionate, low-pressure check-ins rather than nagging productivity alerts.
* **Features:**
  * Periodic thoughtful prompts: *"6 months ago you wished to learn ceramic pottery. How does that dream feel today?"*
  * Options to adjust priorities, refresh the "why", or archive without guilt.

---

## 3. Sanctuary Aesthetics & Emotional Moments

### 3.1 "Release a Wish" Interactive Moment
* **Concept:** An emotional, sensory micro-interaction when creating a new dream.
* **Features:**
  * When submitting a wish, a dandelion seed detaches from the plant, catches the breeze, and floats upward into the 3D sky.
  * Haptic feedback on mobile devices for a tactile, grounding sensation.

### 3.2 Annual Dream Capsule ("Wishly Wrapped")
* **Concept:** An end-of-year or anniversary reflection package summarizing the user's emotional journey.
* **Features:**
  * Auto-generated aesthetic story cards formatted for Instagram Stories, Telegram, or camera roll saving.
  * Highlights: *dreams born, milestones conquered, memories sealed, and dominant aspiration themes.*

### 3.3 Sanctuary Soundscapes (Ambient Audio)
* **Concept:** Reinforce the calm, reflective space with optional auditory immersion.
* **Features:**
  * Discreet sound toggle in the navigation header.
  * Looping calming audio stems: warm vinyl crackle, gentle summer wind, soft distant chimes, or gentle rainfall.

---

## 4. Discovery & Inspiration

### 4.1 Thought-Starter Dream Prompts
* **Concept:** Guidance for users staring at an empty feed or suffering from dreamer's block.
* **Features:**
  * Carousel of reflective questions:
    * *"What is something you loved doing when you were 10 years old?"*
    * *"If money and time were taken care of for one year, what would you do?"*
    * *"What is a small, quiet wish you rarely tell anyone?"*
  * Clicking any prompt pre-fills the wish creation modal.

### 4.2 Dynamic Social Preview Cards (OpenGraph)
* **Concept:** When sharing a public dream or collection link, generate beautiful branded preview images on Twitter/X, Telegram, WhatsApp, and iMessage showing the cover photo, dream title, and Wishly dandelion motif.

---

## 5. Technical & Architecture Plan

| Area | Planned Technology | Purpose |
|------|-------------------|---------|
| **Semantic Matching** | pgvector / OpenAI text-embedding-3-small | Dream matchmaker & similarity search |
| **Realtime Interactions** | Server-Sent Events (SSE) or WebSockets | Instant cheers and reaction updates |
| **OG Image Generation** | `@vercel/og` or Satori (SVG to PNG) | Dynamic social sharing preview cards |
| **Audio Synthesis** | Web Audio API + compressed Opus/AAC assets | Lightweight, zero-latency ambient soundscapes |
| **Milestone Data Model** | Nested `WishMilestone` Prisma relation | Step-by-step progress tracking |

---

*Document created for Wishly community planning and future release scoping.*
