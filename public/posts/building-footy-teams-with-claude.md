---
title: "Building Footy Teams in About Five Hours With Claude"
slug: "building-footy-teams-with-claude"
coverImage: "/media/blog/claude-project-build.png"
excerpt: "I built Footy Teams in about five hours using Claude. Here's what actually made that possible without ending up with code I couldn't stand behind."
date: "2025-12-08"
---

I built [Footy Teams](/project/footy-teams) in about five hours using Claude. It's a small app that takes a pasted list of players and splits them into randomized, position-balanced teams. Most of the code came out of a single evening working with Claude. This post is about how that session actually went, not the app itself.

The first thing I did wasn't open an editor. It was writing out, in plain English, exactly how the team balancing should work. How many strikers and defenders each team starts with, what happens with leftover players, that kind of thing. That took about fifteen minutes and ended up being the most useful fifteen minutes of the whole build, because it gave me something solid to check Claude's output against instead of just eyeballing it.

From there I worked in small pieces instead of asking for the whole app at once. Balancing logic first, parsing second, the UI last. Each piece was small enough that I could actually read through what came back instead of skimming it, which mattered more than I expected.

## The bug I almost missed

About an hour in, an early version of the balancing logic assigned leftover players in the wrong order under certain conditions. Nothing crashed. Nothing looked obviously wrong. It would have just quietly produced uneven teams sometimes. I only caught it because I asked Claude to walk me through why it wrote the logic that way, and the explanation didn't quite match what the code actually did. That mismatch was the tell.

That's become my go-to move now. When something looks slightly off, I ask for the reasoning behind it instead of just asking for another attempt. Nine times out of ten the explanation either confirms the code is fine, or it surfaces exactly where the disconnect is.

## Keeping the important part isolated

I kept the balancing logic in its own small piece of the codebase with no dependency on the UI at all. Just player data going in, teams coming out. That made it easy to double check on its own, and later when I added reshuffling and image export, none of that touched the part I trusted most.

## What actually made five hours possible

It wasn't that Claude typed faster than I could. It was that it handled the parts I find tedious, messy input parsing, form wiring, styling decisions, while I stayed focused on the one thing that actually mattered: whether the balancing logic did what it was supposed to do.

If you're trying something similar, write down what you actually want before you ask for it, work in pieces small enough to actually review, and ask why before you ask again.
