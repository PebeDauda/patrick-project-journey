# Project Journey preview

## Indhold og kilder

Projektstatus bygger på gennemgåede projektnoter fra NEURO, WOBS/Career-Agent, Portfolio og PatrickOS. NEURO er en prototype, WOBS en motor plus syntetisk demo, Portfolio er udgivet, og PatrickOS er et arbejdsrum med roller/workflows. Screenshots viser de faktiske designudkast/prototyper; PatrickOS-visninger er markerede illustrationer. Portfolioens eksisterende portræt er valgt af Patrick. Ingen kildeprojekter er ændret.

Den aktive side er `app/journey-v4.tsx`. V3/Brain Boot-filer bevares som historik og er ikke den aktive intro. `app/playful-type.tsx` tegner hele ord samlet, så binærtal og bogstaver beholder naturlig kerning.

## Inspirationskilder

Original implementering inspireret af offentlige previews fra Sterling Gate på21st.dev og Aceternity UI (3D Card, Spotlight, Magnetic Button, Encrypted Text, Logo Cloud Multiple Rows og Background Gradient). Ingen betalt komponentkode kopieret. Brandikonernes licens ligger i `public/assets/tools/`; fonte har deres OFL-filer i `public/assets/fonts/`.

## Lokal kontrol

`npm install` og `JOURNEY_REVIEW=1 npm test`. Med review-flaget bruges det gennemgåede JSON-snapshot. Normalt bruges komplette Sanity-data, ellers hele JSON-fallbacken. Opdatér og kontroller begge CMS-sprog før en egentlig produktionsfrigivelse.

Build og HTML-smoke er verificeret. Browserkontroller omfatter desktop/mobile bredder, dansk/engelsk, menu, projektvisninger, zoom, pause og reduceret bevægelse. Fysisk iPhone/VoiceOver-performance er ikke verificeret. Eksisterende miljø-/typefejl ved Sanity/Cloudflare/studio er fortsat kendte.

## Offentligt hostet link

https://patrick-project-journey.patrickbennett.chatgpt.site

Sites version15 blev udgivet30. oktober2026 fra source8ee27cecc703b1db38b71b04fd4b6077e42b0370. Den kræver ikke lokal server, tunnel eller en tændt Mac. Modtagere bruger en normal internetforbindelse. Den tidligere trycloudflare-tunnel er stoppet.

Efter stop af både lokal server og tunnel returnerede en frisk browser200 ved1440/390px, med fungerende menu, fire projekter og12 værktøjer. Ingen browserfejl. Se HOSTED-QA-2026-10-30.json. Den separate Workers-side og GitHub main er uændrede.

## Verificeret før GitHub-gemning

30. oktober2026: den præcise GitHub-kopi bestod `JOURNEY_REVIEW=1 npm test` (build, hosting-artifact og HTML-smoke). Det offentlige tunnel-preview returnerede200 og bestod browserkontrol ved1440/390/320px: samlet ordtegning, binær-animation, normal kerning, fast ordplads, menu, dansk/engelsk og intet vandret overløb eller browserfejl. Se QA-2026-10-30.json.

## Portfolio-pin

Portfolio-forhåndsvisningen er et direkte link med tilt, lysende pin, ringe og en vedvarende åbne-label, inspireret af https://ui.aceternity.com/components/3d-pin . Original implementering i den eksisterende palette; ingen nye afhængigheder. Linket har ingen indlejrede knapper. Forstørrelse forbliver udenfor linket. Mobil åbner med ét tryk; tastatur bruger det normale link. Pause/reduceret bevægelse deaktiverer tilt/ringe. Den sorte portfolios egen kode er uændret.

Build/HTML-smoke og browserkontroller ved1440/390/320 samt reduceret bevægelse bestået: hover, første mobiltryk, tastatur, korrekt eksternt link, zoom, pause, engelsk og intet overløb.

## Dagens afslutning

MacBook-inspireret intro (fire projekter, terminalglimt, automatisk afslutning, genafspilning; ingen spring-over-knap) og ny elektrisk/fragmenteret hjerne. Tidsstyret præsentation, ikke en falsk netværks-progressbar. Reduceret bevægelse har en rolig indgang. Hele dokumentationspakken ligger under design-history/2026-10-30 med Markdown, galleri, manifest og QA.
