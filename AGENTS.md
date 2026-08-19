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

## Udgivelse: Cloudflare er primær produktion

`patrick-project-journey.ppbb94.workers.dev` er den ene, normale
produktionsadresse. `patrick-project-journey.patrickbennett.chatgpt.site`
findes stadig som et sekundært/legacy-spejl, men er ikke en del af den
normale arbejdsgang og udgives kun manuelt af Patrick, hvis han selv
beslutter det.

| Adresse | Rolle | Hvordan den udgives | Har SANITY_API_READ_TOKEN |
| --- | --- | --- | --- |
| `patrick-project-journey.ppbb94.workers.dev` | Primær produktion | `npm run deploy` | ja |
| `patrick-project-journey.patrickbennett.chatgpt.site` | Sekundært/legacy-spejl | manuelt i ChatGPT Sites, kun ved behov | nej |

**Efter enhver kodeændring, der skal ud til brugerne, skal du køre:**

```bash
npm run deploy
```

Den bygger og udgiver til Cloudflare i én kommando. Kør den uopfordret som
afslutning på arbejdet — det er ikke en handling, Patrick skal bede om hver
gang. Nævn ikke chatgpt.site og mind ikke om manuel udgivelse dertil,
medmindre Patrick selv spørger — det indgår ikke i den normale
udgivelsesarbejdsgang.

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
brugerne), `Workflow Architect` (relevant når "blokbyggeren" til
projekt-detaljesider — README punkt 3 — skal kortlægges: happy path,
kant-tilfælde, fejltilstande).

**Efterprøvet 2026-08-18 (anden, grundigere gennemgang):**

- `mattpocock-skills:resolving-merge-conflicts` — direkte relevant, fordi
  README/AGENTS.md allerede advarer om, at to systemer (denne Claude-agent
  og et andet værktøj) pusher til samme repo. Brug den, hvis en `git pull`
  eller rebase støder på konflikter.
- `codex:codex-rescue` — testet og bekræftet klar til brug (Codex CLI er
  installeret, logget ind som `m6bc24mncg@privaterelay.appleid.com`). Reel
  fallback til en anden model/agent, hvis en fejl eller et svært bug er
  svær at diagnosticere alene.
- `security-review` — værd at køre én gang, når Sanity-integrationen
  (API-tokens, `SANITY_API_READ_TOKEN`) og det nye designSettings-skema er
  på plads, siden sitet er offentligt tilgængeligt.
- `cloudflare:web-perf` — relevant til en periodisk Core Web
  Vitals-kontrol, givet sitets tunge CSS-animationer (hjerne-gløden,
  gradient-lag).
- `simplify` — værd at køre efter større refaktoreringer som
  designtoken-migreringen, som en ekstra oprydningskontrol.

**Om at spare på usage:** Undersøgt eksplicit — der findes ingen skill,
agent eller integration i det tilgængelige katalog, hvis formål er at
reducere token-forbrug for et projekt som dette. `Workflow`-værktøjet er
tværtimod dyrere (spawner mange agenter) og bruges kun, hvis Patrick
eksplicit beder om det. De reelle håndtag er arbejdsvaner, ikke
værktøjer: uddelegér tung research/udforskning til baggrunds-agenter
frem for at læse store filer direkte i hovedtråden (allerede praktiseret,
fx globals.css- og Sanity-skema-undersøgelserne), og brug et billigere
subagent-effort-niveau til mekanisk arbejde.

**Tilladelser (fewer-permission-prompts, kørt 2026-08-18):** Scannede
transkripter for de seneste 50 sessioner på tværs af projekter. Fandt intet
solidt grundlag for nye allowlist-regler — de hyppigste kommandoer
(`git status`, `find`, `grep`, `cat`) er allerede auto-tilladt af Claude
Code selv, og resten (curl, git add/commit) er enten for sjældne (<3
gange) eller ikke sikre at helliste blindt. Ingen ændringer foretaget i
`.claude/settings.json`.
