# Avalon Announcer 🌒

A mobile-first, web-based Game Master/Narrator for **The Resistance: Avalon**. It uses your device's native text-to-speech to orchestrate the night phases, allowing everyone to participate. No apps, no installations required.

**Live Demo:** [https://avalon-announcer.netlify.app/](https://avalon-announcer.netlify.app/)

## ✨ Features

- **Automated Scripting**: Dynamically generates the night script and padding roles (Minions/Loyal Servants) based on your player count.
- **Rules Enforcement**: Prevents invalid character selections mathematically perfectly.
- **Native TTS**: Automatically finds high-quality, moody voices (like UK English) on your device.
- **Verbose Mode**: Optionally announces exact situational verifications (e.g., "You should see 2 players with your eyes open").
- **Premium UX**: Smooth Dark Mode interface with touch-friendly collapsible panels.
- **Custom Pacing**: Exact UI controls for narration pause durations.

## 🚀 Getting Started

Launch locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). It is heavily optimized for mobile displays; shrink your desktop browser window to test.

## 🎲 Supported Roles
- 🧙‍♂️ **Merlin**
- 🛡️ **Percival**
- 🗡️ **Assassin**
- 🔮 **Morgana**
- 👑 **Mordred**
- 🃏 **Oberon**

## 🛠️ Tech Stack
Built with Next.js (App Router), React, TypeScript, native CSS, and the browser `window.speechSynthesis` API.
