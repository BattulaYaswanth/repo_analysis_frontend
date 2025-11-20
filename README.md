## Code Review App — Overview

This repository contains a web-based Code Review App built with Next.js and React. The app accepts source code submissions, runs automated reviews through a backend API, and streams structured review feedback back to the client. It includes user authentication, a modern UI (ShadCN components + Tailwind), and Markdown rendering for readable suggestions.

**Key goals:**
- Provide fast, actionable automated code reviews.
- Stream results to the UI for an interactive experience.
- Support multiple languages and authenticated users.

**Tech stack:** Next.js (App Router), React, Tailwind CSS, NextAuth (auth), TypeScript.

---

## API (example)

1) `POST /api/code_review`
- **Description:** Submit source code to request an automated review.
- **Request Body:** JSON `{ "code": "<string>", "language": "<string>" }`
- **Auth:** Bearer token (`Authorization: Bearer <token>`) — NextAuth protects API routes.
- **Response:** Streamed text/JSON with review feedback, suggestions, and optional diagnostics.

Note: The project is structured so additional endpoints (e.g., for history, user settings) can be added under `app/api/`.

---

## Features
- **Streaming reviews:** Incremental review results appear in the UI as they are produced.
- **Language selection:** Review different languages by specifying `language` in requests.
- **Authentication:** Built-in NextAuth routes for sign-in flows and protected API access.
- **Markdown output:** Reviews are formatted as Markdown for clear rendering.
- **Reusable UI:** ShadCN-style components in `components/ui/` for fast UI composition.

---

## Quick Start

1. Install dependencies:

```bash
pnpm install
# or
npm install
```

2. Run the development server:

```bash
pnpm dev
# or
npm run dev
```

3. Open the app in your browser: `http://localhost:3000`

4. To test the review endpoint manually, POST to `http://localhost:3000/api/code_review` with a Bearer token and JSON body.

---

## Project Layout (high level)
- **`app/`**: Next.js App Router routes, pages, and API handlers.
- **`components/`**: Reusable UI components and `ui/` primitives.
- **`lib/`**: Utility helpers.
- **`context/`**: Global store and context providers.
- **`public/`**: Static assets.

---

## Contributing & Next Steps
- Improve/add API docs and example requests (Postman/cURL).
- Add tests for API routes and key UI components.
- Add CI (lint, typecheck, tests) and deployment steps.

If you'd like, I can:
- Add example Postman collections or cURL snippets.
- Add a `CODE_OF_CONDUCT` / `CONTRIBUTING.md` and basic CI.

---

## References
- Next.js docs: https://nextjs.org/docs
- NextAuth: https://next-auth.js.org

---

Updated README: concise summary, API example, quick start, and next steps.
