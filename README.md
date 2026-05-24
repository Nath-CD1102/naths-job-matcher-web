# Nath's Job Matcher

A **PROTOCOL 1A v3** job scoring tool. Paste a job description, get an intelligent match percentage against your background.

## Features

- **PROTOCOL 1A v3 Matching** — 10-requirement framework with explicit/implicit matching
- **Intelligent Detection** — Auto-exclude criteria (gaming, US-only, degree-only)
- **Green Flags** — HubSpot, AI tools, team leadership, target verticals
- **Recommendations** — APPLY / REVIEW / PASS based on match %
- **Tier Assignment** — Tier 0-4 based on 50-100% match range

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Deployment**: Vercel (auto-deployed on GitHub push)

## Getting Started

### Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Usage

1. Paste job title, company, and description
2. Click "Score Job"
3. Get match percentage and recommendation

## API

```bash
POST /api/detect

{
  "title": "Director of Content",
  "company": "TechCorp",
  "description": "Full job description text..."
}

# Returns:
{
  "match_percentage": 78,
  "tier": 2,
  "recommendation": "APPLY",
  "green_flags": ["HubSpot ✓", "AI tools", "Series B"],
  ...
}
```

## Deployment

Deployed on Vercel with auto-updates on every GitHub push.

- **Production**: Main branch auto-deploys
- **Preview**: PR/feature branches get preview URLs
- **Zero Config**: Vercel auto-detects Next.js

## Project Structure

```
app/
├── page.tsx           ← Form UI
└── api/detect/
    └── route.ts       ← Scoring endpoint

lib/
└── protocol.ts        ← PROTOCOL 1A v3 detector logic
```

---

Built for personal use. PROTOCOL 1A v3 methodology from Operation Trojan Horse Job Hunt.
