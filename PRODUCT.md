# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters and hiring managers screening candidates for Data Science, ML Engineering and Data Engineering roles. They arrive from a CV, LinkedIn or GitHub link, often on a laptop between other applications, sometimes on a phone. Their job: decide within a minute whether Marc is worth an interview, then find the CV or a way to contact him.

Secondary: peers and curious readers arriving on blog posts or the photo gallery. The site is also Marc's own professional identity online, so it must feel like a person, not a CV.

## Product Purpose

The portfolio and blog of Marc Chen. Its purpose is to get Marc hired. Success: a hiring visitor leaves knowing what Marc does, believing he ships ML in production, and has downloaded the CV, opened LinkedIn, or booked a call.

## Positioning

Production ML in industry, from someone who builds and observes things over time. Marc is a Junior Data Scientist at Veolia headquarters (since Sept 2025) building a full-stack time-series forecasting tool with parallelized jobs and an always-backtest policy, and putting electricity-load forecasting into production. Before that, two years as a Data Engineer apprentice at Veolia (ETL pipelines, cloud connectors, Terraform, monitoring). Backed by Google Cloud Professional Data Engineer and Professional ML Engineer certifications and an ENSTA Paris engineering master in AI. Outside work, the same person shoots timelapses (Mount Fuji, Penang, Kuala Lumpur), street and travel photography (Hong Kong, Norway), rides long-distance by bike (600 km across France, with GPS elevation profiles), and builds hardware side quests (ESP32 bus countdown, electric Peugeot 205 retrofit). The claim a generic portfolio cannot copy: shipped, backtested forecasting in a large industrial company, by someone whose hobbies are also about time, sequence and measurement.

## Operating Context

Static Next.js site exported to GitHub Pages. Three locales: English, French, Simplified Chinese. Content lives in YAML (`src/data/<locale>/`) and Markdown posts (`src/content/posts/`). Photos gallery via PhotoSwipe, giscus comments on posts.

## Capabilities and Constraints

- Keep the existing route structure and sections: Hero, About, Skills, Experiences, Projects, Education, Achievements, Accomplishments, Featured posts, Blog, Photos, in all three locales.
- Skill percentage bars are dropped; replace with plain facts.
- MOOC / online course accomplishments are demoted (merged or reduced in weight).
- The About copy is outdated ("Junior Data Engineer") and will be refreshed; new copy is approved by Marc before publishing.
- Must work at phone width, respect reduced motion, and stay a static export.

## Brand Commitments

Name: Marc Chen. Rejected by Marc: résumé-like layouts (sidebar CV, timeline-as-hero, certification walls) and anything that reads as AI-generated. Minimalism is welcome. No logo or established visual identity worth preserving; the current violet-gradient glassmorphism look is explicitly rejected as AI-generated.

## Evidence on Hand

- Experience: Veolia (Junior Data Scientist, Data Engineer apprentice), Google Gemini API Developer Competition (Vision Vendor, with Fabien Houang).
- Certifications with Credly links: GCP Professional Data Engineer, GCP Professional ML Engineer, GitHub Foundations, Terraform Associate, Vertex AI badge.
- Education: ENSTA Paris (AI specialisation), Prépa PTSI–PT*.
- Projects and posts: Bus countdown timer (ESP32), ENSTRAID electric Peugeot 205, Technimage, Notion2GoogleTask, Spotify, bike trip, photos (`src/content/posts/`, `public/`).
- Personal media: 5 photos in `src/data/photos.json` (Norway swing, HK architecture, HK taxi, yellow Vespa, wedding table; originals on Cloudinary), 3 timelapses in `src/data/timelapses.json` with local posters in `public/videos/`, Loire clip `public/videos/IMG_7610.MOV`, bike trip photos, route map and elevation profile in `public/images/posts/bike-images/`, ESP32 devboard and EV motor photos.
- CV PDF: `files/MarcChen_ENG.pdf`. Contact: email, LinkedIn, GitHub, cal.com booking.
- No forecasting metrics, accuracy numbers or testimonials exist; never invent them. Any demonstration data must be labelled synthetic.

## Product Principles

1. Recruiter first: what he does, proof, and how to contact are reachable in the first viewport.
2. Proof over adjectives: show shipped work and real credentials, never "passionate problem solver" filler.
3. Industry credibility: precise, sober and engineered, not hype.
4. Work and life share the page: photos, timelapses, bike rides and side quests sit beside the professional work as equals in craft, not as a footnote. It must never read like a résumé.
5. Motion is part of the identity (confirmed by Marc): purposeful, authored animation stays, always with a reduced-motion fallback.

## Accessibility & Inclusion

WCAG AA contrast, keyboard navigation, reduced-motion support, readable Chinese typography.
