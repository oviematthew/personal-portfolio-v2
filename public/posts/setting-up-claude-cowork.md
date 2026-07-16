---
title: "Setting Up Claude Cowork for Multi-Step Work"
slug: "setting-up-claude-cowork"
coverImage: "/media/blog/claude-cowork-setup.png"
excerpt: "Cowork isn't Claude Code. It's Claude Desktop handling an entire multi-step project on your computer, in the background, while you do something else."
date: "2026-02-19"
---

The name overlap trips people up: Cowork is not Claude Code. Claude Code is the coding-focused agent that lives in your terminal. Cowork is a separate feature in the Claude Desktop app, built for multi-step knowledge work, organizing files, synthesizing research, generating documents, that runs on your actual computer instead of in a chat window.

## What Cowork actually does

You describe an outcome instead of a single instruction. Claude breaks it into subtasks, works through them (often in parallel), and hands back finished output: organized files, a written document, a completed piece of research. The part that makes it different from a normal chat is that a session keeps running in the background, even after you close your laptop, instead of waiting on you to keep the conversation open.

## Before you start

Cowork requires the Claude Desktop app specifically, it's what gives Claude local file access, browser use, and control of other apps on your machine, so it isn't available through the web chat interface. It's also gated to paid plans: Pro, Max, Team, or Enterprise, not the Free tier.

## Running your first task

1. Open Claude Desktop and select **Cowork** from the message box, rather than starting a normal chat.
2. Describe the outcome you want, specifically enough that Claude can plan around it. "Organize my downloads folder into project subfolders based on file type and rough date" works. "Clean up my computer" doesn't give it enough to plan against.
3. Review the plan Claude proposes before it starts. This is the actual checkpoint, not the final output. If the plan is solving the wrong problem, this is where that becomes obvious.
4. Let it execute. Your desktop needs to stay on and connected for the duration, since Cowork is genuinely running on your machine, not on a remote sandbox.
5. Preview and download the results once it reports back.

## Screen access and permissions

Cowork interacts with your desktop directly, clicking, typing, taking screenshots, the same way a person would, since there's no sandboxed environment behind it. That means permissions matter more here than in a normal chat: Claude asks before accessing each new app for the first time, sensitive categories like trading or crypto apps are blocked by default, and you can blocklist specific apps yourself if there's anything you don't want it touching regardless of what a task seems to need.

## Where this actually earns its keep versus Claude Code

Claude Code is what I reach for inside a codebase: reading source, running tests, opening a PR. Cowork is for the multi-step knowledge work sitting around that, organizing a folder of research into a doc, going through a batch of files and renaming or sorting them, pulling together a summary from several sources. The overlap is small enough that the two aren't competing for the same task, they're just pointed at different kinds of work.
