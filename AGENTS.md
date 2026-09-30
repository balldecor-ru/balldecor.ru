# BallDecor — приоритетные правила проекта

В этом проекте всё ведём на русском языке. Сам сайт balldecor.ru также русскоязычный. При создании и редактировании материалов используем русский язык: тексты сайта и интерфейса, метаданные, документацию, задачи, комментарии, описания коммитов и релизов, отчёты и общение. Технические имена, обязательные для работы кода, API, команд и внешних интеграций, сохраняем совместимыми с используемыми инструментами.

Это правило имеет приоритет над требованиями английского языка ниже. Нижележащие инструкции унаследованы от HAIH Site; они не меняют язык и назначение BallDecor и не требуют переносить на него страницы и продуктовые цели haih.site.

Проект — поэтапный перенос старого коммерческого сайта с MODX на современные технологии и будущий маркетинговый кейс. Общая задача и дорожная карта: [project/tasks/README.md](project/tasks/README.md). Сначала необходимо локально развернуть старый сайт. Первая версия нового сайта работает с существующей базой MySQL; окончательная миграция данных и отказ от старой системы выполняются позже.

Трудозатраты обязательно фиксируем для будущего кейса, но только по итоговым значениям таймеров, которые сообщает владелец. Самостоятельно таймеры не запускаем, время не рассчитываем и оценки не подставляем вместо фактических данных.

# HAIH Site — Project Instructions

## Purpose

Build haih.site as the public product website and a working demonstration of requirement-driven development with AI.

This repository is the website itself. It is not an engine, framework, starter kit, or package that visitors must download to create their projects. Implement what this website actually needs. Gradually document its constituent solutions and the reasons for choosing them.

The website is its own first demonstration. Its implementation, experiments, checks, commits, and eventually releases provide evidence for the approach it describes. Do not present planned or untested capabilities as proven.

All project content, UI copy, documentation, code identifiers, and commit/release descriptions must be in English. Discussion with the owner may be in Russian.

## Decision model

Start with the need, not with a preferred technology.

For each proposed solution, distinguish:

- Purpose: the need it is intended to satisfy.
- Capabilities: what it provides or is expected to provide.
- Requirements: the environment, inputs, dependencies, resources, and constraints it needs.
- Trade-offs and applicability: where its cost is justified and where it is not.
- Evidence: what has been checked, under which conditions, and what remains unknown.

A solution's requirements become obligations of the system that adopts it. Evaluate compatibility and the total cost of the composition, including agent context, diagnosis, maintenance, and verification. Fewer dependencies alone do not prove a simpler solution.

Use the least costly architecture that fully meets current requirements. Do not remove required capabilities merely to achieve a smaller stack. Do not add infrastructure for hypothetical future needs.

## Solutions as website content

Solution is the common product concept for third-party technologies, our own implementations, and ideas that have not been implemented yet. Different maturity levels do not create separate entity types. Research and practical demonstrations belong to the development and evidence of a Solution.

Solutions may contain and depend on other Solutions. Do not turn this conceptual model into a mandatory runtime framework, graph database, or elaborate content system. Formal composition is itself a Solution with costs; a small website may not need it.

Lead visitor-facing explanations with needs and benefits. Reveal requirements, limitations, implementation details, and evidence progressively. A known need does not imply a known implementation: explicitly preserve open decisions.

## Current scope

Maintain the website's development and production-build workflow. The current site also includes an illustrated homepage, Solutions, and an individually designed blog. Implement the owner's requested page work without introducing a large component library or expanding scope speculatively.

Do not implement all future demonstrations now. The broader Solutions direction includes static delivery, small dynamic features, standalone APIs, persistence, typed applications, authorization, and commerce. These are possible paths, not a mandatory linear stack. Describe unimplemented Solutions honestly as in progress when their pages are introduced.

## Design approach

Use mobile-first responsive design. Start with styles for the smallest supported viewport, then add breakpoints for larger screens. This ensures core content and functionality work on constrained devices before enhancing for desktop.

## Source structure and dependency boundaries

- `app/pages/<Page>/` owns page rendering, child sections, page-specific data and assets. Keep assets beside their owning page or section.
- `app/components/` contains reusable components and shared infrastructure such as Layout and SEO. These modules must not import pages or page-specific assets.
- `app/routes/` contains thin React Router modules: route metadata, integration exports, and the page entry point. Group related routes in directories such as `app/routes/blog/`.
- `docker/` contains Docker Compose files and service configurations. `docker/traefik/` holds Traefik static config, dynamic routing rules, certs and logs. `docker/varnish/` holds Varnish VCL configuration.
- Pass page-specific choices through typed parameters. In particular, SEO images (source, alternative text, width and height) are chosen by the route/page and passed to `createSeoMeta`; the generic SEO implementation must not choose or import a homepage image. If no image is supplied, omit image tags.
- Data-only modules must not load styles as side effects. Import a styled component in the view that renders it.
- Preserve the owner's in-progress moves and deletions. Read the current tree before editing; do not restore an old folder structure or deleted demonstration route. Update imports, prerender lists, sitemap entries and checks together when routes move or disappear.

## Styling

Use Linaria `styled` components from `@linaria/react`, exported from colocated `styles.ts` files. Render those components as the page/component wrappers; see `app/pages/MainPage/styles.ts` and its consuming `index.tsx`.

Do not import standalone `.css` files or replace this convention with CSS Modules. Named TypeScript imports make missing style exports and module paths visible to tooling; this does not mean TypeScript validates all CSS declarations or nested class selectors. Keep selectors scoped beneath the owning styled wrapper. Preserve semantic elements when wrapping content, including `article`, `main` and the document shell. Reuse exported styled components as selectors where component relationships require it.

Keep mobile-first rules and verify that the production build extracts the styles and links the resulting CSS. Do not claim HMR, dynamic-style or hydration behavior has been verified merely because type checking passes.

## Coding conventions

- Do not use `export default`. Use named exports only.
- Do not use barrel exports in `index.ts`/`index.tsx` files. Each module exports its own declarations directly.
- Declare React components using `React.FC`, not plain function declarations.
- Ensure maximum type coverage. Explicitly type exported constants, function parameters, return values, and data structures. Avoid `any` and untyped object literals.

## Agreed technology choices

- Node.js: JavaScript execution environment for development/build tooling and the production HTTP service. Do not introduce Bun or a second runtime.
- React: reusable components, typed props, and interactive UI.
- TypeScript: check component and integration contracts.
- Vite: development server, HMR, asset builds, code splitting, and lazy-loaded modules. Vite alone is not a router or an HTML prerendering system.
- React Router: current routing, prerendering and head integration.
- Linaria: current component styling and build-time CSS extraction.
- Traefik: the external entry point for TLS and routing in development and production.
- Varnish: production HTTP caching.
- Docker Compose: reproducible service environments.
- No Nginx.

Do not introduce a backend framework or router such as Hono merely to serve files. Choose a small maintained Node.js serving solution when needed, based on required HTTP behavior. Avoid hand-writing a general-purpose file server.

## Required website behavior

The website must support React components and SPA navigation without full-document reloads for normal internal page transitions.

Plan for build-time rendering of public pages followed by React hydration. Some parts should be eligible to remain static; others require hydration and later updates. Determine how the chosen integration supports this. Do not assume prerendered React components are automatically excluded from client JavaScript.

Initial client rendering must agree with generated HTML. Browser-only updates happen at an appropriate later phase.

Required integration capabilities:

- Direct opening and refreshing of public URLs.
- SPA navigation with working browser history, scroll behavior, and focus handling.
- Initial HTML and page metadata suitable for search engines.
- Head/metadata updates during client navigation.
- Route-level code splitting and lazy loading of optional/heavy features.
- Error boundaries and handling of route/chunk loading failures.
- Correct handling of unknown URLs and missing assets; no blanket successful HTML response for every path.

Request-time SSR is not currently required. Build-time server rendering does not imply a permanent rendering service.

## Open decisions

Continue verifying the existing React Router integration for navigation, prerendering, hydration and Head management. Do not replace it or introduce a custom framework without a concrete need.

Choose the production Node.js file-serving implementation and its routing/error behavior.

Linaria is the selected styling convention. Focused verification of cross-file references, dynamic values, hydration, HMR and lazy CSS delivery remains necessary as those capabilities are used.

## Environments

Development request path:

    Browser -> Traefik -> Vite development server -> source files

Direct development access bypasses Varnish. Development may also intentionally run through Varnish to investigate caching; do not diagnose that arrangement as a configuration error by itself. Choose the appropriate endpoint for each check. Ensure the HMR connection works through Traefik. Use hot updates where supported and automatic reloads where necessary.

Production request path:

    Browser -> Traefik -> Varnish -> Node.js HTTP service -> build artifacts

Provide a production-preview workflow using the real built artifacts and production request path. Vite's development server is not the production server.

Separate environment-specific configuration while sharing source code and build logic. Pin the chosen supported runtime/tool versions and use a lockfile. Do not assume port availability or change unrelated services.

The production artifact should contain the files and server dependencies actually needed to run it, not the development environment.

## Cache and HTTP contract

Make caching explicit and verifiable:

- HTML must become fresh after publication according to a defined deployment/cache policy.
- Content-hashed assets may have long-lived immutable caching.
- Development updates must never be hidden by production caching.
- Missing assets must return appropriate failure statuses, not an SPA HTML fallback.
- Unknown public URLs must have an intentional 404 policy, verified against the chosen routing integration.

Document cache refresh/invalidation as part of publication before declaring production readiness. Do not expose cache administration publicly.

## Verification for this phase

Create a small representative site that can demonstrate:

1. Reproducible installation, development startup, and production build.
2. React edits reflected through the Traefik development URL.
3. A public page opened directly, then internal SPA navigation and back/forward navigation.
4. Build-generated HTML and initial Head content, with successful hydration.
5. At least one lazy route or feature whose JS is absent from the initial load and fetched when needed.
6. Correct route and asset error behavior and a controlled rendering-error fallback.
7. Serving the build through Node.js and the production proxy/cache path, with checked headers and cache behavior.

Use type checking and focused automated checks. Vitest is a candidate test runner separate from Vite; browser tests can use Playwright. Add tests for meaningful behavior and integration risks, not to mirror trivial implementation.

Inspect actual build output and browser behavior. Do not claim performance, absence of runtime CSS, partial hydration, cache correctness, or successful code splitting without evidence.

## History and documentation

Record implemented decisions, their motivating needs, known limitations, and reproducible commands. Preserve the distinction between intended and observed behavior.

Use focused commits for coherent changes and versioned releases for reproducible milestones when requested as part of the workflow. Do not publish, deploy, or create remote releases merely because a local build succeeds.

Gradually turn verified implementation knowledge into English Solution pages. Keep documentation proportional to the project's current complexity.
