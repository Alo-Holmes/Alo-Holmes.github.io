# CLI Mission Brief: Portfolio Redesign (Phase 1)

## Role & Context
You are an expert front-end engineering agent executing a UI/UX layout transformation. The user is a senior-leaning Software/Hardware Engineer specializing in QA Automation and DevOps. The underlying portfolio content is functional and proven in recruitment pipelines, but the visual aesthetic requires an immediate upgrade to a premium, modern Bento Grid design.

## Objective
Migrate the raw content from `legacy-source.md` into a structured, highly aesthetic Astro + Tailwind CSS portfolio. Treat design fluidity and layout polish as equal in priority to technical execution.

## Core Rules & Execution Constraints
1. **Scope Gating:** This is Phase 1 (Visual Transformation Only). Do NOT add new copy, invent features, or create dynamic API/repository integration widgets. 
2. **Data Parity:** You must pull all text, company timelines, skills matrices, and testimonials directly from `legacy-source.md` with zero omissions.
3. **Link Parity:** Ensure the existing repository links and section fragments (`#key-projects` and `#demos`) are preserved as simple, working anchor routes targeting his external GitHub profiles for now.
4. **Technology Stack:**
   - Framework: Astro (Static output mode)
   - Styling: Tailwind CSS
   - Typing: TypeScript (Strict mode)

## Targeted Directory Architecture
You will build out and populate the following folder layout:
- `src/layouts/Layout.astro` -> Global HTML head, viewport metadata, Tailwind configuration imports.
- `src/components/BentoGrid.astro` -> The core responsive CSS Grid wrapper.
- `src/components/BentoCard.astro` -> Reusable card component handling hover states, borders, and shadows.
- `src/pages/index.astro` -> The main assembly page pulling data into the grid blocks.

## Verification Checklist (Definition of Done)
- `npm run dev` starts the server without errors.
- The UI perfectly scales across Mobile, Tablet, and Desktop break-points.
- `npm run build` successfully compiles to 100% static HTML assets in the `dist/` directory with zero TypeScript compiler flags tripped.

## Next Action
Read `legacy-source.md` and generate the layout scaffold configuration inside `src/layouts/Layout.astro` and `tailwind.config.mjs`. Stop and verify with the user once the configuration files are created.