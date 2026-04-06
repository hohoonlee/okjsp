# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OKKY Filter is a Chrome extension (Manifest v3) for blocking/filtering users and companies on the okky.kr community platform. Built with vanilla JavaScript and jQuery (bundled). No build step, no bundler, no framework.

## Development

- **No build system** — load as unpacked extension via `chrome://extensions/`
- **No test runner** — `test/test-index.js` is legacy Mozilla SDK format, not runnable
- **No linter or formatter configured**
- Version is tracked manually in `manifest.json` (`version` field) and `package.json`

## Architecture

Three-layer Chrome extension architecture:

**Service Worker** (`background.js`): Core logic — context menu registration, `chrome.storage.sync` persistence, message passing, and notification polling via alarms API. Block list is distributed across 6 storage keys (`list`, `list0`–`list4`) to work within sync storage quota limits. Each blocked entry is `{name, id, type: "u"|"c", memo?}`.

**Content Script** (`content-script.js`): Runs on `https://*.okky.kr/*`. Hides or italicizes blocked users/companies in the DOM. Uses `MutationObserver` to handle the React SPA's dynamic page transitions and re-applies blocking rules on navigation.

**Popup** (`data/popup.html` + `data/popup.js`): Lists blocked entries, supports deletion and toggling between "hidden" and "italics" display modes. Uses jQuery for DOM manipulation.

## Key Files

- `manifest.json` — extension permissions, content script injection rules, service worker registration
- `background.js` — all storage, context menu, and notification badge logic
- `content-script.js` — DOM hiding/styling logic with MutationObserver
- `data/popup.js` — popup UI behavior
- `index.js`, `bg.js` — legacy Firefox SDK files, not used in current Manifest v3 build

## External Dependencies

- jQuery bundled at `lib/jquery/jquery.js`
- OKKY API: `https://okky.kr/api/okky-web/notifications/count` (polled every 5 minutes for badge count)
