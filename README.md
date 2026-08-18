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
- Produktionsbuild og live-udgivelse verificeret.
- Hele kildekoden spejlet til det private GitHub-repository.
- `AGENTS.md` og `CLAUDE.md` sikrer, at nye Codex- og Claude-sessioner starter med projektets aktuelle README.
- ✓ **Prøveændring gennemkørt:** Portfolio 68 % → 70 % gennem Front Matter → GitHub commit → lokal preview verificeret. Arbejdsgangen fungerer uden screenshots eller lange forklaringer.

### I gang

- Ekstern udgivelse til live-sitet (ChatGPT Sites proxy) — verificering ventende.
- Indstilling af Front Matter auto-commit (skal være deaktiveret for eksplicit arbejdsgangskontrol).

### Skal vurderes senere

- Om den neurale animation nederst har det ønskede organiske udtryk.
- Om flere af hjemmesidens tekster end projektoversigten skal gøres redigerbare.
- Om billeder og øvrige designindstillinger skal kunne vælges fra editoren.
- Om GitHub-ændringer senere skal udgives automatisk eller fortsat godkendes manuelt.

## Næste session

Arbejdsgangen virker. Næste fokus:

1. **Verificer ekstern udgivelse:** Bekræft at `patrick-project-journey.patrickbennett.chatgpt.site` også viser 70 % (kan tage tid på proxy).
2. **Juster Front Matter auto-commit:** Sikr at Git-synkronisering er deaktiveret, så du altid committer manuelt ved godkendelse.
3. **Test en ny redigering:** Lav en anden lille ændring (f.eks. et nyt milepæl eller status-ord) for at bekræfte mønsteret virker konsistent.
4. **Dokumenter arbejdsgangen:** Evt. tilføj en kort vejledning i `docs/REDIGER-SIDEN.md` om hvornår man committer og pusher.

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
