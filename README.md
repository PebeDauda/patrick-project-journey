# Patrick’s Project Journey

Et levende projektkort over Patricks vigtigste spor: hvor de står nu, hvad næste bevægelse er, og hvad de på sigt skal blive til.

**Live hjemmeside (Cloudflare, fuld funktionalitet):** <https://patrick-project-journey.ppbb94.workers.dev>
**ChatGPT Sites (udgives manuelt):** <https://patrick-project-journey.patrickbennett.chatgpt.site>

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

**Udgiv gennem ChatGPT Sites — der er intet manglende led**

Tidligere sessioner ledte efter en fejl i udgivelseskæden. Der er ingen fejl. Undersøgt 18. august 2026:

- Repoet har **ingen** `.github/workflows`, **ingen** `wrangler.toml` og **ingen** deploy-kommando.
- `build/sites-vite-plugin.ts` pakker kun artefaktet; `scripts/validate-artifact.sh` validerer det. Ingen af dem udgiver.
- Codex CLI har ingen publish-kommando.
- `docs/REDIGER-SIDEN.md` siger det allerede direkte: *"Selve live-siden opdateres fortsat gennem den eksisterende Sites-udgivelse."*

**Git-commits udgiver ikke.** De spejler koden til GitHub. Live-siden opdateres kun, når projektet udgives gennem ChatGPT Sites-grænsefladen, hvor sitet blev oprettet (`.openai/hosting.json` → `appgprj_6a83885d21d4819184f107018f46a8b2`).

Det forklarer 68 % mod 70 %: koden har været korrekt hele tiden, men er aldrig blevet udgivet.

### Løst: sitet udgives nu til Cloudflare

Build-outputtet er en helt almindelig Cloudflare Worker, så sitet udgives nu direkte til Patricks egen konto ved siden af ChatGPT Sites. `wrangler.jsonc` styrer det, og de to veje deler kun build-output — `.openai/hosting.json` og Sites-udgivelsen er urørt.

```bash
npm run deploy     # bygger og udgiver til Cloudflare
```

Deploy-konfigurationen hedder bevidst `wrangler.deploy.jsonc` og ikke `wrangler.jsonc`. Cloudflare-plugin'et i `vite.config.ts` finder automatisk en fil med standardnavnet og sætter så `nodejs_compat` to gange, hvilket får dev-serverens runtime til at nægte at starte. `npm run deploy` peger derfor eksplicit på filen med `-c`.

Verificeret på det udgivne site:

- Forsiden serverer **70 %** hentet fra Sanity ✓
- `api/draft-mode/enable` svarer 401 uden gyldig secret ✓
- Statiske assets og billeder svarer 200 ✓
- Svartid ~0,5 s ✓

**`SANITY_API_READ_TOKEN` er sat som Cloudflare-secret**, så visuel redigering nu også virker mod produktionen — det var netop det, ChatGPT Sites ikke tillod. Presentation peger som standard på Cloudflare-sitet; til lokalt arbejde bruges `SANITY_STUDIO_PREVIEW_URL=http://localhost:5173 npx sanity dev`.

### Begge adresser er nu opdateret

`patrick-project-journey.patrickbennett.chatgpt.site` blev udgivet manuelt gennem ChatGPT Sites-grænsefladen og viser nu 70 %. Verificeret: sidestørrelsen voksede fra 15.624 til 24.366 bytes, og teksten hentes fra Sanity.

Bemærk forskellen mellem de to: Cloudflare-sitet har `SANITY_API_READ_TOKEN` som secret, chatgpt.site har ikke. Derfor virker visuel redigering og kladdevisning kun mod Cloudflare-adressen. `api/draft-mode/enable` svarer 401 på Cloudflare og 501 med en forklarende besked på chatgpt.site.

Husk: de to udgives hver for sig. `npm run deploy` rammer kun Cloudflare — chatgpt.site skal udgives manuelt, ellers driver de fra hinanden.

### Derefter — aftalt rækkefølge for redigerbarhed
1. ~~**Al sidetekst ind i Sanity.**~~ ✓ Gennemført. 28 felter × 2 sprog ligger nu i `pageContent`.
2. **Designtokens.** 76 hardkodede hex-farver samles til et system, så palet og skriftpar kan vælges fra Sanity — med bundne valg, så sitet ikke kan ødelægges visuelt.
3. **Projekt-detaljesider med blokbygger.** Hver projektside sammensættes af blokke (hero, galleri, nøgletal, tidslinje, citat), der kan omarrangeres og redigeres live i Presentation. Punkt 2 skal ligge før punkt 3, ellers hardkodes farverne ind i blokkene.

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
