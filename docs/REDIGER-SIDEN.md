# Redigér projektoversigten i VS Code

1. Åbn projektmappen i VS Code.
2. Acceptér anbefalingen om at installere **Front Matter CMS**.
3. Klik på Front Matter-ikonet i venstre side.
4. Åbn **Data** og vælg **Projektoversigt · Dansk og engelsk**.
5. Redigér titel, status, procent, beskrivelser eller milepæle og gem.
6. Brug **Preview** for at se ændringen lokalt.

Alle synlige projektdata kommer fra `content/projects.json`. Dansk og engelsk ligger i samme oversigt og adskilles af feltet `locale`.

## Samarbejde med Claude eller Codex

Bed assistenten om at ændre den relevante post i `content/projects.json`. Ændringen bliver derefter vist både i Front Matter og på hjemmesiden.

## Udgivelse

Front Matter kan gemme og lave Git-commits. Selve live-siden opdateres fortsat gennem den eksisterende Sites-udgivelse, indtil en separat automatisk GitHub-udgivelse bliver valgt.
