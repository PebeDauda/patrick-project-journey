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

Sites version12 blev udgivet30. oktober2026 fra source6f374812b40ae9a7c733d5a13d7cb373c59e2ddc. Den kræver ikke lokal server, tunnel eller en tændt Mac. Modtagere bruger en normal internetforbindelse. Den tidligere trycloudflare-tunnel er stoppet.

Efter stop af både lokal server og tunnel returnerede en frisk browser200 ved1440/390px, med fungerende menu, fire projekter og12 værktøjer. Ingen browserfejl. Se HOSTED-QA-2026-10-30.json. Den separate Workers-side og GitHub main er uændrede.

## Verificeret før GitHub-gemning

30. oktober2026: den præcise GitHub-kopi bestod `JOURNEY_REVIEW=1 npm test` (build, hosting-artifact og HTML-smoke). Det offentlige tunnel-preview returnerede200 og bestod browserkontrol ved1440/390/320px: samlet ordtegning, binær-animation, normal kerning, fast ordplads, menu, dansk/engelsk og intet vandret overløb eller browserfejl. Se QA-2026-10-30.json.
