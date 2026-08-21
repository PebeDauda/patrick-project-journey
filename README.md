# Patrick’s Project Journey

Et levende projektkort over Patricks vigtigste spor: hvor de står nu, hvad næste bevægelse er, og hvad de på sigt skal blive til.

**Live hjemmeside (Cloudflare, primær produktion):** <https://patrick-project-journey.ppbb94.workers.dev>
**ChatGPT Sites (sekundært/legacy spejl, udgives manuelt ved behov):** <https://patrick-project-journey.patrickbennett.chatgpt.site>

## Projektstatus

**Fase:** Indholdsstyring i Sanity med Cloudflare som primær produktion
**Senest opdateret:** 21. august 2026
**Aktuel retning:** Al tekst på forsiden redigeres i Sanity Studio og slår igennem uden build. Sitewide paletvalg (designtokens) er udgivet og virker i lys og mørk tilstand. Sub-faner (Oversigt/Fremdrift) er godkendt og udgivet. Procespunkterne har nu en genbrugelig Three.js/WebGL-motor (`app/process-visual.tsx`) med fem konfigurationer — committet og pushet, men **ikke udgivet til Cloudflare endnu**, se "Næste session". Farvestyring pr. projekt (`projectPalette`) er nedprioriteret.

### Færdigt

- Responsiv projekthjemmeside med fire strategiske projektspor.
- Dansk og engelsk sprogskift.
- Light/dark mode med gemt brugerpræference.
- PatrickOS-hjerne med 3D-dybde og bevægelse i hero-sektionen.
- Neural aktivitet i hjernen ved den langsigtede vision.
- Udvidelige projektkort med status, fremdrift, næste bevægelse og milepæle.
- Front Matter CMS-konfiguration til den redigerbare projektoversigt.
- Projektdata flyttet ud af komponenten og ind i `content/projects.json`.
- VS Code-anbefaling til Front Matter CMS.
- Produktionsbuild verificeret lokalt via `npm test` (build + HTML-smoke test passerer).
- Hele kildekoden spejlet til det private GitHub-repository.
- `AGENTS.md` og `CLAUDE.md` sikrer, at nye Codex- og Claude-sessioner starter med projektets aktuelle README.
- ✓ **Prøveændring gennemkørt:** Portfolio 68 % → 70 % gennem Front Matter → GitHub commit → lokal preview verificeret. Arbejdsgangen fungerer uden screenshots eller lange forklaringer.
- ✓ **Sanity genstartet fra nul (18. august 2026):** Den halvfærdige embedded Sanity-installation fra Phase 2 er slettet fuldstændigt, og et rent, selvstændigt studio er bygget i `studio/` efter Sanitys officielle vejledning til AI-kodeagenter. Studioet er udgivet, indholdet importeret, og sitet henter live fra Sanity med fallback.
- ✓ **Al forsidetekst er redigerbar:** 28 tekstfelter × 2 sprog flyttet fra hardkodet `copy` ind i `pageContent`-dokumentet. Hero, nøgletal, sektionsoverskrifter, procestrin, vision, menu og footer kan nu rettes i Studio — også ved at klikke direkte i siden.
- ✓ **Visuel redigering virker:** next-sanity med server-komponenter, `<SanityLive />`, draft mode og Presentation. Verificeret kompatibel med vinext på Cloudflare Workers.
- ✓ **Sitet udgives til egen Cloudflare-konto:** `npm run deploy` bygger og udgiver i én kommando. `SANITY_API_READ_TOKEN` ligger som Cloudflare-secret, hvilket låser visuel redigering op mod produktionen.
- ✓ **Udgivelsesgåden løst:** Git-commits udgiver ikke — de spejler kun koden. Live-siden opdateres gennem ChatGPT Sites-grænsefladen. Begge adresser viser nu 70 %.
- Oprettet `idebank/` som isoleret forsøgsbank for visuelle retninger. Den oprindelige idé er "PatrickOS som et levende OS"; intet herfra er aktiveret i produktionen.
- ✓ **Designtokens konsolideret (19. august 2026):** `app/globals.css` reduceret fra 76 hardkodede farver til et genbrugeligt tokensystem, pixel-identisk med det oprindelige udseende.
- ✓ **Sitewide paletvalg indført:** Nyt `designSettings`-dokument i Sanity (`palette` + `fontPairing`), hentet i `app/layout.tsx` med fallback til standardværdier. Sand & Syre er den første ekstra palet ved siden af standardpaletten Plum & Blush.
- ✓ **Sand & Syre-farvefejl rettet:** Hardkodede Plum & Blush-farver i `.hero`, `.signal-strip`, `.process`, `.vision` m.fl. var ikke palet-styrede i lys tilstand — udtrykt via `color-mix()` på eksisterende tokens, så nye paletter arver dem automatisk (token-first, ingen selektor-specifikke lapper). Procesektionens tekst var samtidig næsten ulæselig i mørk tilstand, fordi farven fulgte en byttet token; låst til `--ink`, som altid er den lyse værdi i mørk tilstand.
- ✓ **Cloudflare er nu eneste adresse i den normale udgivelsesarbejdsgang:** chatgpt.site er et sekundært/legacy-spejl og indgår ikke længere i den faste rutine efter `npm run deploy` (se afsnittet **Udgivelse: Cloudflare er primær produktion** i `AGENTS.md`).
- ✓ **Sub-faner (Oversigt/Fremdrift) godkendt og udgivet til Cloudflare.**
- ✓ **Ubrugte Sema code-navigation-filer fjernet** fra `.agents/`/`.claude/` (ingen aktive referencer i projektet).

### I gang

- **To redigeringsveje til samme data.** Sanity og Front Matter (`content/projects.json`) synkroniserer ikke. Sanity vinder på det kørende site; JSON-filen er fallback og bliver forældet, hvis den ikke vedligeholdes. Beslutningen om, hvilken der skal være den primære, er ikke truffet.
- **Three.js-procesobjekter er kodet og pushet, men ikke udgivet.** Se "Næste session" for detaljer og handoff.
- **`.gitignore`/`AGENTS.md`/`CLAUDE.md` har uncommittede ændringer**, der fjerner tekst-referencer til Sema (efter selve skill-filerne allerede er slettet og committet separat). Afventer Patricks beslutning om, hvorvidt de skal committes.
- **Farvestyring pr. projekt (`projectPalette`) er endnu ikke bygget.** Arkitekturen er besluttet: `accentColor` forbliver fri hex pr. projekt, og et nyt bundet felt `projectPalette` (kurateret valg, ligesom det sitewide paletvalg) tilføjes på projekt-skemaet. Skal kun gælde den udfoldede projektvisning (`.project-detail`), ikke det kollapsede kort i listen.
- Indstilling af Front Matter auto-commit (skal være deaktiveret for eksplicit arbejdsgangskontrol).

### Sanity Studio

**Rediger indholdet her:** <https://patrick-project-journey.sanity.studio/>

Studioet er udgivet og virker fra enhver browser og mobil — log ind med din Sanity-konto. Ændringer slår igennem på hjemmesiden inden for få sekunder, uden nyt build og uden en GitHub-commit.

Kildekoden ligger i `studio/`, helt adskilt fra vinext/Cloudflare-appen. Lokal udgave:

```bash
cd studio && npm run dev     # http://localhost:3333
cd studio && npx sanity deploy   # udgiv ændret skema/struktur til det hostede studio
```

- **Projekt:** `Patricks Project Journey` (`niua6aq5`), dataset `production`, organisation `PatrickOS`.
- **Skema:** `studio/schemaTypes/project.ts` modellerer projektkortene 1:1 med `content/projects.json` (`id` → `projectId`, `accent` → `accentColor`, `editorLabel` udgået til fordel for Studios preview). `studio/schemaTypes/pageContent.ts` dækker al øvrig tekst på forsiden — ét fast dokument pr. sprog med faner for Hero, Nøgletal, Projekter, Proces, Vision samt Menu og footer.
- **Struktur:** `studio/structure.ts` deler indholdet i "Projekter · Dansk" og "Projekter · English".
- **Indhold:** Alle 8 projektdokumenter (4 × 2 sprog) plus 2 sideindholdsdokumenter er importeret og verificeret via GROQ.
- **Al forsidetekst er redigerbar.** 28 tekstfelter × 2 sprog — hero, nøgletal, sektionsoverskrifter, procestrin, vision og footer — flyttet fra hardkodet `copy` i `app/project-journey.tsx` ind i Sanity. Den hardkodede udgave er bevaret som `fallbackCopy` og flettes felt for felt, så ét manglende felt i Sanity ikke efterlader et hul på siden.
- **Sprogmodel:** Ét dokument pr. sprog, bundet sammen af `projectId` — samme opdeling som Front Matter bruger i dag.

#### Sitet henter live fra Sanity

Datalaget bygger på **next-sanity**. `app/page.tsx` er en server-komponent, der henter med `sanityFetch`, mens al interaktivitet (sprog, tema, udfoldning) ligger i klient-komponenten `app/project-journey.tsx`.

| Fil | Rolle |
| --- | --- |
| `app/sanity/client.ts` | Sanity-klient med stega, så Presentation kan pege fra element til felt |
| `app/sanity/queries.ts` | GROQ-forespørgslen, oversætter feltnavne til sitets form |
| `app/sanity/live.ts` | `sanityFetch` og `<SanityLive />` via `defineLive` |
| `app/api/draft-mode/*` | Slår kladdevisning til og fra; `enable` afviser kald uden gyldig secret |

Tre datalag, hvor det øverste tilgængelige vinder:

1. **Sanity** (server-renderet, live opdatering uden genindlæsning)
2. `content/projects.json` (indbygget ved build)
3. Hardkodet `fallbackProjectData` i `app/project-journey.tsx`

Fejler Sanity-kaldet, falder sitet lydløst tilbage på lag 2, så det ikke kan gå i sort.

#### Visuel redigering

Åbn **Presentation** i Studio: siden vises side om side med editoren, og du kan klikke direkte på et element for at redigere feltet bag det. Draft mode viser upublicerede kladder.

Forudsætninger lokalt:

1. Kopiér `.env.example` til `.env.local` og indsæt et Sanity-token med rollen **viewer** (kan læse kladder, kan ikke skrive). Opret det på [projektets API-side](https://www.sanity.io/manage/project/niua6aq5/api).
2. Kør `npm run dev`, og åbn Presentation i Studio.

Det hostede Studio peger på `http://localhost:5173`. Det er ikke en fejl: draft mode-ruterne findes kun i den kode, der kører lokalt, og browseren opløser `localhost` på din egen maskine. Opsætningen virker derfor i dag — men kun mod dit lokale site.

⚠ **Visuel redigering virker ikke mod produktionen endnu**, og det er blokeret af to ting, som ingen af dem kan løses herfra:

- **Produktionen kører ældre kode.** `app/api/draft-mode/*` er aldrig blevet udgivet, fordi Sites-udgivelsen er uafklaret. Presentation ville ramme ruter, der ikke findes.
- **`SANITY_API_READ_TOKEN` kan ikke sættes i produktion herfra.** Sitet hostes af ChatGPT Sites (`.openai/hosting.json`), ikke af en worker i dette repo — der er ingen `wrangler.toml` og ingen secret-mekanisme i kildekoden. Tokenet skal lægges ind gennem Sites' eget udgivelsesflow.

Når Sites-udgivelsen er verificeret, skiftes Presentation til produktionen med:

```bash
cd studio
SANITY_STUDIO_PREVIEW_URL=https://patrick-project-journey.patrickbennett.chatgpt.site npx sanity deploy
```

#### Vigtigt: kun ét Sanity-projekt ad gangen

Organisationen `PatrickOS` kan kun have **ét aktivt Sanity-projekt**. Da der kortvarigt lå to, blev begge sat i tilstanden `402 Project Disabled`, indtil det ene blev fjernet. Opret derfor ikke et ekstra projekt uden at rydde det gamle væk først.

Genskabelse er billig, hvis det skulle ske igen: indholdet stammer fra `content/projects.json`, og skemaet ligger i `studio/schemaTypes/project.ts`. Sanity indeholder ingen data, der ikke også findes i repoet — importen er `sanity dataset import` af en NDJSON genereret fra JSON-filen.

#### Hvis projekt-ID'et skifter

`niua6aq5` står tre steder, og alle tre skal opdateres samtidigt:

- `studio/sanity.cli.ts`
- `studio/sanity.config.ts`
- `app/sanity/client.ts`

### Skal vurderes senere

- Om den neurale animation nederst har det ønskede organiske udtryk.
- Om flere af hjemmesidens tekster end projektoversigten skal gøres redigerbare.
- Om billeder og øvrige designindstillinger skal kunne vælges fra editoren.
- Om GitHub-ændringer senere skal udgives automatisk eller fortsat godkendes manuelt.

## Næste session

**Handoff (21. august 2026): Three.js-procesobjekter er committet og pushet, men IKKE deployet**

### Status på 3D-procesobjekterne — klar til visuel godkendelse, ikke udgivet

Sub-fanerne (Oversigt/Fremdrift) er godkendt og udgivet til Cloudflare siden sidst. 3D-/animationssporet er nu i gang:

- Procespunkternes hover-visualisering er bygget om fra flade WebP-billeder til rigtig **Three.js/WebGL-geometri**.
- Én genbrugelig motor: **`app/process-visual.tsx`** — én komponent, fem konfigurationer (`opdag`/`form`/`byg`/`bevis`/`skaler`), ikke fem kopierede React-komponenter. Dette mønster skal fortsætte fremover.
- Hvert objekt har ægte 3D-geometri (icosahedron-kerne, torus-orbitter, noder/forbindelser, partikler, lys) i sitets egen plum/pink/acid-farvepalet.
- Vises fortsat kun ved hover eller tastaturfokus, i den eksisterende `.process-step`/`.process-visual`-struktur i `app/globals.css`. Orbit-ringen er justeret til at være centreret om objektet og gjort smallere efter Patricks tilbagemelding undervejs.
- `prefers-reduced-motion` er bevaret. `three` + `@types/three` tilføjet som dependencies.
- `npm run build` + `npm run test` er grønne. Committet (`f28f60a`) og pushet til `main` — **ikke kørt gennem `npm run deploy` endnu**. Skal godkendes visuelt i dev-serveren først.
- Fem tidligere genererede WebP-billeder (`public/assets/idebank-pf-*.webp`) er nu ubrugte og ligger stadig kun untracked lokalt — ikke committet. Spørg Patrick, om de skal gemmes i idébanken eller ryddes væk.

### Herfra: flere 3D-forsøg, samme motor-mønster

Patrick vil fortsætte med flere 3D-/animationsforsøg oven på dette fundament:

- Forbedre de fem WebGL-objekters individuelle karakter/personlighed yderligere.
- Flere selektive 3D- og animationsforsøg.
- Implementere udvalgte WebGL-, shader-, image-hover- og interaktionseffekter fra idébankens inspirationsmateriale — særligt fra den eksterne inspirationskilde i `idebank/kilde-noyzzi.md`.
- **Fasthold arkitekturen:** ént genbrugelig WebGL-motor med udskiftelige geometriske former/shaders/konfigurationer (som `process-visual.tsx` allerede gør) — byg ikke separate, duplikerede komponenter pr. effekt.
- Ingen af de nye idébank-effekter må aktiveres i produktionen uden Patricks visuelle godkendelse (fast projektregel).

### Derefter — punkt 3: projekt-detaljesider med blokbygger

Hver projektside sammensættes af blokke (hero, tekst, galleri, nøgletal, tidslinje, citat), der kan omarrangeres og redigeres live i Presentation. Hver blok styles i Patricks eksisterende udtryk, så siderne kan komponeres frit uden at kunne blive grimme.

### Nedprioriteret — farvestyring pr. projekt (`projectPalette`)

Arkitekturen er stadig besluttet, men rykket ned i rækken:

- **`accentColor` forbliver fri hex** — uændret, individuel projekt-accent, som i dag.
- **Nyt felt `projectPalette`** på projekt-skemaet: et bundet/kurateret valg (radio-liste, ligesom det sitewide paletvalg), fx "Arv sitets palet" (standard) / "Palet A" / "B" / "C".
- **Scoping:** Pr.-projekt-mini-paletten må kun gælde den udfoldede projektvisning (`.project-detail`), ikke hele `.project`-elementet. Det kollapsede kort i listen bruger fortsat kun sitewide-paletten + det eksisterende frie `accentColor`.
- **Token-first** hvis/når den bygges — genbrug eksisterende tokens og `color-mix()`, som ved Sand & Syre-rettelserne.

### Vigtigt at vide, før der bygges

- **To systemer pusher til samme repo.** ChatGPT/Codex pusher direkte til GitHub. Kør altid `git fetch` og `git pull --rebase` før arbejdet, ellers afvises dit push.
- **`idebank/` er en forsøgsbank.** Intet derfra må aktiveres i produktionen uden Patricks godkendelse.
- **Organisationen tåler kun ét Sanity-projekt.** Opret aldrig et ekstra; begge bliver deaktiveret med `402 Project Disabled`.
- **`wrangler.deploy.jsonc` må ikke omdøbes til `wrangler.jsonc`.** Cloudflare-plugin'et i `vite.config.ts` finder standardnavnet automatisk og sætter `nodejs_compat` to gange, hvorefter dev-serveren nægter at starte.

## Redigér projektoversigten

De synlige projektdata findes i:

```text
content/projects.json
```

Hver post indeholder:

- `locale`: `da` eller `en`
- `id` og `index`
- `title`, `category` og `status`
- `progress` fra 0–100
- `accent` som hex-farve
- `summary`, `now`, `next` og `destination`
- `milestones`

Front Matter læser felterne gennem `frontmatter.json`. En mere detaljeret vejledning findes i `docs/REDIGER-SIDEN.md`.

## Handoff til Claude eller Codex

Brug denne korte starttekst i en ny session:

```text
Læs README.md og docs/REDIGER-SIDEN.md helt igennem først, og kør git fetch + git pull --rebase, før du rører noget — ChatGPT/Codex pusher også til dette repo.

Indholdet styres nu af Sanity (studio/), ikke længere kun af content/projects.json. Bevar hjemmesidens eksisterende visuelle retning, dansk/engelsk, dark mode, tilgængelighed og de tre datalag med fallback.

Fortæl mig kort på dansk, hvor projektet står, hvad der er uafklaret, og foreslå kun den næste naturlige bevægelse. Ændr ikke filer, før jeg har godkendt den konkrete ændring.

Efter kodeændringer: kør npm run deploy og verificér, at ændringen er ude på Cloudflare (primær produktion). chatgpt.site er et sekundært spejl og indgår ikke i den normale arbejdsgang — nævn det ikke medmindre Patrick selv spørger.

Når sessionen afsluttes, opdateres README-sektionerne "Projektstatus", "Færdigt", "I gang" og "Næste session".
```

## Arbejdsregel

README viser altid den aktuelle sandhed om projektet. Efter en arbejdssession opdateres:

1. Hvad blev færdigt?
2. Hvad er stadig i gang?
3. Hvad er den naturlige start på næste session?

Historiske ændringer kan senere flyttes til en separat `CHANGELOG.md`, når projektet har nok iterationer til, at historikken giver reel værdi.

## Lokal udvikling

Krav: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Kontrol af produktionsbuild:

```bash
npm run build
```

Teknologien er Next.js/React bygget med Vinext til Cloudflare/Sites. Bevar `.openai/hosting.json`, build-scripts og eksisterende hostingstruktur ved ændringer.
