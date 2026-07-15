---
title: "What Makes a Good AI Agent Session"
slug: "what-makes-a-good-agent-session"
coverImage: "/media/blog/claude-agent-workflow.png"
excerpt: "The difference between a session that ships something solid and one that ships something that just looks solid usually comes down to a few small habits."
date: "2026-03-11"
---

I've had sessions with an AI coding agent that produced something I was genuinely proud of, and sessions that produced something that looked fine and fell apart the moment I actually used it. The difference almost never comes down to the tool. It comes down to a handful of habits on my end.

## Start with a spec, even a rough one

The single biggest factor is whether I wrote down what I actually wanted before asking for it. Not a full technical spec, just a plain description of the behavior: what should happen, what the edge cases are, what "done" looks like. Sessions where I skipped this step and just described the goal loosely are the ones where I ended up with something that technically worked but wasn't quite what I needed, and I usually didn't notice until much later.

## Small steps beat one big ask

Asking an agent to build an entire feature in one prompt tends to produce something that looks complete and hides its problems well. Breaking the same request into smaller pieces, and actually reviewing each one before moving to the next, takes longer up front and saves a lot of time later. I've stopped seeing this as slower. It's just where the time actually goes.

## Treat the first answer as a draft

The first thing an agent gives you is rarely the final version, even when it looks finished. Some of my best results have come from pushing back on a first draft, asking what tradeoffs it made, and asking if there's a simpler way. That back and forth is where most of the actual thinking happens, not in the first response.

## Know when to stop asking and start reading

There's a point in every session where more prompting stops helping and I just need to read the code myself, line by line. Recognizing that moment is a skill of its own. If I've asked for three variations of the same thing and I'm still not confident it's right, the answer usually isn't a fourth prompt. It's opening the file and actually working through it.

## The sessions that go well

Looking back, the sessions I'm happiest with all share the same shape: a clear starting point, small steps, questions instead of blind retries, and a point where I stopped prompting and started reading. None of that is really about the tool. It's just good habits that happen to matter more now than they used to.
