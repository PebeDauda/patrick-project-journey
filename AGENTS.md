# Session instructions

Start every new session by reading `README.md` and `docs/REDIGER-SIDEN.md` completely.

Use the README as the authoritative source for:

- the purpose and current state of the project;
- completed work and unresolved decisions;
- the next natural session focus;
- the Front Matter and publishing workflow.

Before changing files:

1. Summarize the current project state in Danish.
2. State the single next movement you recommend.
3. Ask Patrick for approval before making file changes.

Preserve the existing visual direction, accessibility, responsive behavior, DK/EN support, dark mode, and Sites hosting structure.

Project content is edited in `content/projects.json`. Front Matter is configured in `frontmatter.json`.

At the end of every working session, update these README sections:

- **Projektstatus**
- **Færdigt**
- **I gang**
- **Næste session**

## Udgivelse: sitet har TO adresser

De udgives hver for sig og driver fra hinanden, hvis kun den ene opdateres.

| Adresse | Hvordan den udgives | Har SANITY_API_READ_TOKEN |
| --- | --- | --- |
| `patrick-project-journey.ppbb94.workers.dev` | `npm run deploy` | ja |
| `patrick-project-journey.patrickbennett.chatgpt.site` | manuelt i ChatGPT Sites | nej |

**Efter enhver kodeændring, der skal ud til brugerne, skal du køre:**

```bash
npm run deploy
```

Den bygger og udgiver til Cloudflare i én kommando. Kør den uopfordret som
afslutning på arbejdet — det er ikke en handling, Patrick skal bede om hver
gang. Mind derefter Patrick om, at chatgpt.site skal udgives manuelt, hvis den
også skal opdateres.

Kun kodeændringer kræver udgivelse. Indholdsændringer i Sanity slår igennem på
begge sites med det samme uden build.

Verificér altid efter udgivelse ved at hente siden og bekræfte, at ændringen er
der. Do not claim the live site is updated until the production deployment has
been verified.

## Anbefalede Claude-værktøjer til dette projekt

Gennemgået 2026-08-18. Reglen er: brug kun værktøjer der matcher projektets
faktiske stak (Next.js/vinext, Sanity, Cloudflare Workers) — ikke det fulde
katalog af tilgængelige skills/agenter, som primært dækker helt andre
arbejdsområder (kreative værktøjer, andre produktivitetsapps, generiske
webdesign-trends).

**Skills, der reelt gavner arbejdet her:**

- `sanity-best-practices` — indlæs før skema-, GROQ- eller Studio
  structure-ændringer. Bekræfter bl.a. singleton-mønsteret (fast
  dokument-id, ekskluderet fra generiske lister) som `pageContent.ts` og
  `designSettings.ts` allerede følger.
- `cloudflare:wrangler` — indlæs før ændringer i `wrangler.deploy.jsonc`
  eller `npm run deploy`-flowet.
- `cloudflare:workers-best-practices` — relevant hvis Worker-koden selv
  (uden for vinext/wrangler-standardflowet) skal røres.
- `artifact-design` (+ evt. `artifact-diagramming`) — til at vise Patrick et
  visuelt forslag (fx paletsammenligning) i browseren, før det bygges ind i
  koden.
- `run` — til at starte dev-serveren og faktisk se en UI-ændring virke, jf.
  kravet om at teste i browser før en frontend-ændring meldes færdig.
- `code-review` — kør før en større ændring afsluttes, som en ekstra
  kontrol ud over `npm run build`/`npm run test`.

**Bevidst fravalgt:** `meta-skills:modern-web-design` og
`web3d-integration-patterns` (skubber 2024-2025-designtrends som
glassmorphism, GSAP-scrollytelling, 3D-hero-sektioner — kolliderer direkte
med kravet om at bevare den nuværende visuelle identitet, medmindre Patrick
eksplicit beder om et redesign). Alle Adobe/Canva/Spotify/Todoist/Gmail/
Notion/Dropbox-værktøjer er uden relevans for denne kodebase.

**Agent-typer værd at kende:** `Explore` (bred kodebase-research), `Plan`
(design af implementeringsplaner), `Reality Checker` (skeptisk
efterprøvning af påstande som "pixel-identisk" før noget skal ud til
brugerne).
