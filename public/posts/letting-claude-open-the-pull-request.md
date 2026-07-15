---
title: "Letting Claude Open the Pull Request"
slug: "letting-claude-open-the-pull-request"
coverImage: "/media/blog/ai-pull-requests.png"
excerpt: "Having an AI agent open the pull request changes what code review actually needs to catch. A few things I had to rethink."
date: "2026-06-09"
---

At some point I started letting Claude actually open pull requests instead of just writing code in my editor. It's a small workflow change that ended up shifting how I review my own work more than I expected.

The first thing that changed is what a "confident looking" PR actually signals. A human PR with clean commits and a clear description usually means the author understood the problem well. An AI-authored PR can look exactly as clean and confident while being subtly wrong in a way that has nothing to do with how polished it looks. I had to stop treating tidiness as a proxy for correctness, which is a habit I didn't realize I'd built until it stopped working.

## Reading the diff like it's from someone new to the codebase

I review Claude's PRs the way I'd review a PR from someone who joined last week: technically capable, but without the accumulated context of why certain things are the way they are. That means checking for things a longtime contributor would never get wrong, like whether a change respects a constraint that isn't written down anywhere, because it usually isn't.

## The description is where I check reasoning, not just the diff

I've started paying as much attention to the PR description as to the code itself. If the description explains a decision in a way that doesn't quite hold up, that's usually where the actual problem is hiding, even if the code looks fine at a glance. Asking for the reasoning behind a change surfaces more issues than reading the change alone.

## Small PRs matter even more now

This was already good practice, but it matters more here. A large PR from an agent is much harder to review properly than a large PR from a person, because I can't lean on "I trust this person's judgment" to cover the parts I read less carefully. Keeping changes small enough to actually review in full, every time, is non negotiable now in a way it used to be more of a nice-to-have.

## What hasn't changed

The bar for merging is the same bar it's always been. I still need to understand what a change does and why before I approve it. What's different is where the risk actually lives, and getting a feel for that has made me a much more careful reviewer of my own AI-assisted work, not a more relaxed one.
