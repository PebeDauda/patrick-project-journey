# Patrick’s Project Journey

Et levende projektkort over Patricks vigtigste spor: hvor de står nu, hvad næste bevægelse er, og hvad de på sigt skal blive til.

**Live hjemmeside:** https://patrick-project-journey.patrickbennett.chatgpt.site

## Projektstatus

**Fase:** Redaktionelt system og samarbejdsflow
**Senest opdateret:** 18. august 2026
**Aktuel retning:** Gør projektdata lette at redigere i VS Code og sikre, at Patrick, Claude og Codex arbejder i samme GitHub-repository.

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

### I gang

- Løsning af ChatGPT Sites-genudgivelsen og verificering af live-domænet. Den offentlige live-side viser stadig 68 %, så produktionen er ikke endeligt bekræftet.
- Indstilling af Front Matter auto-commit (skal være deaktiveret for eksplicit arbejdsgangskontrol).
- **Sanity er live:** Studioet er udgivet på <https://patrick-project-journey.sanity.studio/>, og sitet henter projektdata derfra ved indlæsning. Front Matter og `content/projects.json` fungerer stadig som fallback — beslutningen om, hvilken af de to der skal være den primære redigeringsvej fremover, er ikke truffet.

### Sanity Studio

**Rediger indholdet her:** <https://patrick-project-journey.sanity.studio/>

Studioet er udgivet og virker fra enhver browser og mobil — log ind med din Sanity-konto. Ændringer slår igennem på hjemmesiden inden for få sekunder, uden nyt build og uden en GitHub-commit.

Kildekoden ligger i `studio/`, helt adskilt fra vinext/Cloudflare-appen. Lokal udgave:

```bash
cd studio && npm run dev     # http://localhost:3333
cd studio && npx sanity deploy   # udgiv ændret skema/struktur til det hostede studio
```

- **Projekt:** `Patricks Project Journey` (`niua6aq5`), dataset `production`, organisation `PatrickOS`.
- **Skema:** `studio/schemaTypes/project.ts` modellerer projektkortene 1:1 med `content/projects.json` (`id` → `projectId`, `accent` → `accentColor`, `editorLabel` udgået til fordel for Studios preview).
- **Struktur:** `studio/structure.ts` deler indholdet i "Projekter · Dansk" og "Projekter · English".
- **Indhold:** Alle 8 dokumenter (4 projekter × 2 sprog) er importeret og verificeret via GROQ.
- **Sprogmodel:** Ét dokument pr. sprog, bundet sammen af `projectId` — samme opdeling som Front Matter bruger i dag.

#### Sitet henter live fra Sanity

`app/sanity-projects.ts` henter projektdata fra Sanitys offentlige CDN ved sideindlæsning — uden nye afhængigheder, det er et rent `fetch`. `app/page.tsx` har nu tre datalag, hvor det øverste tilgængelige vinder:

1. **Sanity** (live, ændringer slår igennem på sekunder uden rebuild)
2. `content/projects.json` (indbygget ved build)
3. Hardkodet `fallbackProjectData` i `page.tsx`

Fejler Sanity-kaldet — projekt deaktiveret, netværk nede, ufuldstændige data — falder sitet lydløst tilbage på lag 2. Sitet kan altså ikke gå i sort, fordi Sanity er utilgængelig.

#### Vigtigt: kun ét Sanity-projekt ad gangen

Organisationen `PatrickOS` kan kun have **ét aktivt Sanity-projekt**. Da der kortvarigt lå to, blev begge sat i tilstanden `402 Project Disabled`, indtil det ene blev fjernet. Opret derfor ikke et ekstra projekt uden at rydde det gamle væk først.

Genskabelse er billig, hvis det skulle ske igen: indholdet stammer fra `content/projects.json`, og skemaet ligger i `studio/schemaTypes/project.ts`. Sanity indeholder ingen data, der ikke også findes i repoet — importen er `sanity dataset import` af en NDJSON genereret fra JSON-filen.

#### Hvis projekt-ID'et skifter

`niua6aq5` står tre steder, og alle tre skal opdateres samtidigt:

- `studio/sanity.cli.ts`
- `studio/sanity.config.ts`
- `app/sanity-projects.ts`

### Skal vurderes senere

- Om den neurale animation nederst har det ønskede organiske udtryk.
- Om flere af hjemmesidens tekster end projektoversigten skal gøres redigerbare.
- Om billeder og øvrige designindstillinger skal kunne vælges fra editoren.
- Om GitHub-ændringer senere skal udgives automatisk eller fortsat godkendes manuelt.

## Næste session

**Løs Sites-genudgivelsen før Phase 2**

Arbejdsgangen i GitHub og lokal builds er verificeret. Den tilbageværende blokade er live-produktionens udgivelsesled: den offentlige site viser stadig 68 %, så den nyeste 70 %-status er ikke bekræftet som publiceret.

### Krav
- **Live-verifikation:** Public URL skal vise den korrekte aktive status, før projektet kan siges at være opdateret i produktion.
- **Sites-udgivelse:** Find det manglende led mellem GitHub-commit og ChatGPT Sites-proxy, og få den live-side til at opdatere sig.
- **Front Matter:** Auto-commit skal stadig vurderes separat, men må ikke bruges som erstatning for den endelige live-verifikation.
- **Phase 2:** Først når produktionen er valid, kan detaljesider og udvidet CMS påbegyndes uden at bygge videre på et uverificeret deploy.
- **Sanity-beslutning:** Afgør, om Sanity eller Front Matter skal være den primære redigeringsvej. Begge virker nu; Sanity slår igennem uden build, Front Matter kræver commit og rebuild.

### Arbejdsgang
1. Bekræft, om den live side stadig viser 68 % eller 70 %
2. Reproducer det manglende publish-led i ChatGPT Sites-flowet
3. Få en verificeret live-udgivelse på plads
4. Først derefter fortsætte med datastruktur til detaljesider

### Milepæle
1. Sites-genudgivelsen kortlagt
2. Det manglende publish-led løst
3. Live-siden verificeret på den aktuelle status
4. Datastruktur fastlagt for detaljesider
5. Front Matter-konfiguration udvidet
6. Detail-page-komponenter bygget

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
Læs README.md og docs/REDIGER-SIDEN.md først. Bevar hjemmesidens eksisterende visuelle retning. Projektoversigten styres af content/projects.json og Front Matter-konfigurationen i frontmatter.json. Fortæl mig kort, hvor projektet står, og foreslå kun den næste naturlige bevægelse. Ændr ikke filer, før jeg har godkendt den konkrete ændring. Når sessionen afsluttes, skal README-sektionerne “Projektstatus”, “I gang” og “Næste session” opdateres, så næste agent kan fortsætte uden at rekonstruere forløbet.
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
