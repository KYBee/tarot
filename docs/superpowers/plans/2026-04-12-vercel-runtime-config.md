# Vercel Runtime Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the static tarot app read Kakao/share runtime config from a generated `config.js` file so Vercel environment variables can drive deployment behavior.

**Architecture:** Keep the existing static `index.html / script.js / style.css` structure. Add a small Node script that writes `window.APP_CONFIG` from environment variables during the Vercel build, load that file before the app scripts, and document the expected variables.

**Tech Stack:** Static HTML/CSS/JS, Node.js, Vercel project build command

---

### Task 1: Add runtime-config generation test

**Files:**
- Create: `tests/generate-config.test.js`

- [x] Write a failing test for `scripts/generate-config.js`
- [x] Run `node --test tests/generate-config.test.js` and confirm it fails before implementation

### Task 2: Implement runtime-config generation

**Files:**
- Create: `scripts/generate-config.js`
- Create: `config.example.js`
- Modify: `.gitignore`
- Modify: `index.html`
- Create: `vercel.json`

- [x] Implement a build-time generator that writes `config.js`
- [x] Load `config.js` before `script.js`
- [x] Ignore generated local config in git
- [x] Add Vercel build configuration

### Task 3: Document setup and verify

**Files:**
- Modify: `README.md`
- Modify: `docs/kakao-share-integration.md`

- [x] Document required Vercel environment variables
- [x] Re-run targeted and full verification commands
