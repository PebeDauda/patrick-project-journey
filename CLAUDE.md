# Claude project instructions

Read `README.md` and `docs/REDIGER-SIDEN.md` completely before planning or changing anything.

The README is the project handoff and current source of truth. Begin each new session with a short Danish summary of:

1. where the project currently stands;
2. what remains unresolved;
3. the one next movement you recommend.

Ask Patrick for approval before editing files.

Keep the current visual identity and interaction model intact unless Patrick explicitly requests a redesign. Preserve responsive behavior, accessibility, Danish/English content, dark mode, and the existing Sites hosting structure.

Editable project content lives in `content/projects.json`. The VS Code editor is configured through `frontmatter.json`.

Before ending a working session, update the relevant status in `README.md`, especially **Færdigt**, **I gang**, and **Næste session**, so another assistant can continue without reconstructing the conversation.

## Udgivelse

Cloudflare er den primære produktionsadresse — se afsnittet **Udgivelse: Cloudflare er primær produktion** i `AGENTS.md` for detaljerne.

Efter enhver kodeændring, der skal ud til brugerne, køres `npm run deploy` uopfordret. Den bygger og udgiver til Cloudflare. chatgpt.site er et sekundært/legacy-spejl uden for den normale arbejdsgang — nævn det ikke og mind ikke om manuel udgivelse dertil, medmindre Patrick selv spørger.

Never report that production is updated until the deployment has been verified.

## Codebase discovery

Use Sema's `search_code`, `repo_map`, `get_code`, `find_usages`, and `impact_analysis` MCP tools for codebase discovery before falling back to broad grep/file reads.
