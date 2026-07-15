---
title: "How I Actually Use Claude for Day to Day Coding"
slug: "how-i-actually-use-claude"
coverImage: "/media/blog/claude-daily-workflow.png"
excerpt: "Not the highlight reel version. The actual habits that make Claude useful for real work instead of just impressive in a demo."
date: "2026-01-19"
---

There's a version of "using AI to code" that shows up in demos: one prompt, a working app, done. That's not really how it goes day to day. Here's what my actual workflow looks like, habits included.

I almost never ask for something big in one shot. A prompt like "build the feature" tends to come back looking plausible and being subtly wrong in a way that's hard to spot. I get much better results asking for one piece at a time: the data shape first, then the logic, then the UI. Each piece is small enough that I can actually read it properly before moving on.

## Giving it the boring context upfront

Claude doesn't know the weird history behind why a piece of code looks the way it does unless I tell it. If there's a reason something is written a certain way, a previous bug it's working around, a constraint that isn't obvious from the code alone, I say so up front. Skipping that step is usually how you end up with a "cleaner" version that quietly reintroduces a bug that was already fixed once.

## Asking why, not just asking again

When something Claude writes doesn't quite sit right with me, my first move used to be asking for another version. Now I ask it to explain the reasoning first. The explanation usually tells me more than the code does. Either it confirms the logic is sound and I was wrong to be suspicious, or the explanation itself doesn't hold up, which is the actual signal that something's off.

## Reading everything, not skimming

This is the habit that took the most discipline to build. Code that comes from Claude tends to look clean and confident whether or not it's actually correct, so skimming familiar-looking sections isn't really safe. I read every suggestion in full before accepting it now, even the parts that look totally normal.

## Checking things I don't personally know cold

If Claude references a method, an API, or a config option I don't have memorized, I check it against the actual docs before trusting it, especially for anything that changes often. This has saved me more than once from shipping something that sounded completely plausible and just wasn't real.

## What it actually gets me

None of this makes Claude write code I couldn't have written myself eventually. What it does is take the parts I find tedious, boilerplate, repetitive parsing logic, hunting for the right method name, off my plate, so the time I do spend goes into the parts that actually require judgment: what to build, how to structure it, and whether the result is actually right.
