# 002 — Procespunkter som levende 3D-billeder

**Status:** Idé
**Tilføjet:** 19. august 2026
**Berører produktionen:** Nej

## Oprindelig idé

Hvert punkt i processektionen får et tilhørende billede eller en 3D-visualisering, der giver punktet mere fysisk dybde og karakter. Effekten må gerne hente inspiration fra PatrickOS-hjernen: subtil parallax, lys, lag og levende bevægelse, men visualiseringen skal tage udgangspunkt i produktet eller processen bag det enkelte punkt.

## Mulig retning

- Ét visuelt motiv pr. procespunkt.
- 3D-dybde eller lagdelt billedbehandling frem for dekorative effekter alene.
- Subtil reaktion på cursor, scroll eller hover.
- En visuel kobling mellem procespunktets idé og det produkt, der udvikles.
- Samme overordnede bevægelsessprog som PatrickOS-hjernen.
- Fungerer i light/dark mode, på mobil og med `prefers-reduced-motion`.

## Mulige isolerede forsøg

1. Ét statisk procesbillede med lagdelt parallax.
2. Ét procespunkt med en lille WebGL- eller shaderbaseret visualisering.
3. En genbrugelig visualiseringsmotor med udskiftelige billeder, shaders og konfiguration pr. procespunkt.

## Afgrænsning

Idéen skal først afprøves isoleret i denne forsøgsbank. Ingen 3D- eller WebGL-effekt aktiveres i produktionssiden, før den er vurderet og godkendt.

## Første lokale retning

Den rigtige retning er nu koblet til den eksisterende processektion: hvert punkt beholder sin tekst, og det tilhørende objekt vises først ved hover eller tastaturfokus ude til højre under den eksisterende runde hover-streg. Der er ingen procesbilleder, billedrammer eller ekstra layout.

## Beslutningslog

| Dato | Forsøg | Resultat | Beslutning |
| --- | --- | --- | --- |
| — | Ikke afprøvet endnu | — | — |
