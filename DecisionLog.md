# Skylark Monday BI Agent - Technical & Architectural Decision Log 📋

## Decision 1: Monday GraphQL API Schema Resilience & Graceful Fallback
- **Context:** Monday.com users import custom Excel files into Deals and Work Orders boards where column titles or GraphQL field names can vary.
- **Decision:** Implemented dynamic title mapping in `backend/services/monday_service.py` that inspects column titles case-insensitively (e.g. matching "value", "amount", "price", "revenue" to deal value).
- **Fallback Strategy:** If API keys or Board IDs are unconfigured during local development or staging tests, the service provides an normalized mock dataset reflecting Monday.com imported records. This prevents system crashes and ensures 100% testable uptime out-of-the-box.

## Decision 2: Zero-Crash Data Cleaning Pipeline
- **Context:** Raw board items imported manually from Excel files frequently contain unformatted text like `"$150,000"`, `"150k"`, missing dates, or whitespace anomalies.
- **Decision:** Built a centralized sanitizer suite in `backend/utils/cleaners.py`:
  - `clean_currency()` extracts numeric floating-point values from strings, handling 'k' and 'm' multipliers.
  - `clean_date()` uses multi-format date parsing and normalizes all dates into `YYYY-MM-DD`.
  - `clean_sector()` standardizes sector taxonomy (mapping terms like "Mfg", "Factory" -> "Manufacturing").
  - `deduplicate_records()` removes duplicate rows based on composite keys.

## Decision 3: Gemini AI & Analytical Engine Dual Architecture
- **Context:** Ensuring response generation even if LLM API rate limits occur or keys are temporarily absent.
- **Decision:** Built a dual-mode reasoning architecture in `backend/services/gemini_service.py`:
  - When `GEMINI_API_KEY` is present, executes generative queries against `gemini-1.5-flash` passing exact BI metrics context.
  - When offline or unconfigured, triggers the deterministic Analytical Engine to construct exact structured markdown answers with 0% latency.

## Decision 4: Interactive Clarifying Questions for Vague Queries
- **Context:** Executives often ask broad questions like *"How are we doing?"* or *"Show update"*.
- **Decision:** Added intent classification (`detect_query_intent()`). When broad intent is detected, the agent returns structured `clarifying_options` allowing users to click focused follow-up queries (*"Pipeline Health"*, *"Energy vs Manufacturing"*, *"Delayed Work Orders"*, *"Leadership Update"*).

## Decision 5: Glassmorphism Dark UI & Component Modularization
- **Context:** The prompt requires a modern dark theme, sidebar, KPI cards, typing animations, loading states, and executive reporting UI.
- **Decision:** Designed a custom design system in `frontend/src/index.css` using Tailwind CSS and CSS backdrop filters (`glass-card`, `glass-panel`). Decoupled the UI into focused TypeScript components (`MetricCards`, `ChartsView`, `ChatInterface`, `LeadershipModal`, `MondayConfigModal`).
