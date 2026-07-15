---
title: "Pair Programming With Claude: What's Actually Different"
slug: "pair-programming-with-claude"
coverImage: "/media/blog/pair-programming-with-claude.png"
excerpt: "It's not like pairing with a person, and it's not like using a code generator either. A few honest notes on what the difference actually feels like."
date: "2026-04-22"
---

People describe working with an AI coding assistant as "pair programming," and it's close enough to be useful shorthand, but it's not quite the same thing. A few honest differences, from actually doing it for a while now.

With a human pair, a lot of the value comes from disagreement. Someone questions an approach, the other person defends it or changes their mind, and the final decision is usually better for having been argued about. Claude will push back if you ask it to, but it won't naturally disagree with you the way a person with their own opinions and their own bad day might. If I want that friction, I have to ask for it directly, something like "what's the strongest argument against this approach," rather than expecting it to show up unprompted.

## It doesn't get tired, which cuts both ways

A human pair gets fatigued, and that fatigue is actually useful information: if my pair is struggling to follow what I'm doing, it's often a sign the code itself is too complicated. Claude doesn't get tired, so I don't get that signal for free anymore. I've had to build a habit of explicitly asking "is this getting too complicated" instead of relying on a human's confusion to tell me.

## It remembers differently

A human pair carries context across weeks without being told, they remember why a decision was made three sprints ago because they were there. Claude only knows what's in the current conversation or what I explicitly point it to. This isn't worse, it's just a different kind of context I have to manage myself, by keeping the important reasoning written down somewhere instead of trusting it to live in someone's memory.

## Where it's genuinely better

It's endlessly patient with the boring parts. Reformatting, boilerplate, working through fifteen slightly different variations of the same function until one feels right, none of that wears it down the way it wears a person down. That patience is real and it's useful, especially for the parts of a task that are tedious rather than hard.

## The actual takeaway

Pairing with Claude isn't a replacement for pairing with a person, and it's not really trying to be. It's a different tool that's genuinely good at some of what a human pair is good at, and genuinely missing some of what makes human pairing valuable in the first place. Knowing which is which has made me a lot more deliberate about when I reach for it.
