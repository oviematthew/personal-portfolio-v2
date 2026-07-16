---
title: "Setting Up Claude Projects the Right Way"
slug: "setting-up-claude-projects"
coverImage: "/media/blog/claude-projects-setup.png"
excerpt: "Projects turn Claude from a blank chat window into a workspace that already knows your style guide, your architecture decisions, and the context you'd otherwise repeat every time."
date: "2026-02-05"
---

Every new chat with Claude starts from zero unless you tell it otherwise. Re-pasting the same style guide, the same "here's how our API is structured" context, the same "don't suggest X, we tried that" note, every single conversation, is the tax you pay for not using a Project. Here's how to actually set one up so that tax stops applying.

## What a Project actually is

A Project is a persistent workspace on claude.ai: a name, a set of custom instructions, and a knowledge base of files, all of which carry forward automatically into every new chat started inside it. You stop re-establishing context and start just asking the question, because the context is already sitting there.

## Setting one up

1. Create a new Project from the sidebar and give it a real name, not "Project 1." If you're organizing by codebase or client, name it that specifically, since you'll be picking it out of a list later.
2. Add a short description. It's mostly for your own future reference when you have a dozen of these.
3. Add project knowledge: the files that should inform every conversation in this Project.
4. Add custom instructions: how Claude should behave specifically within this Project.
5. Start a new chat inside the Project. Claude has the knowledge base and instructions loaded before you type a single word.

## What to actually put in the knowledge base

Project knowledge accepts PDFs, DOCX, CSV, TXT, HTML, and other text-based formats, up to 30MB per file, with no cap on the number of files. That headroom is generous enough to create a bad habit: dumping an entire repo or wiki into it and hoping relevance sorts itself out.

The knowledge base is worth curating instead. For a codebase Project, that's a style guide, the architecture decisions that aren't obvious from the code, and API references, the things that are true regardless of which file you're currently working in. It's not a mirror of the repo. If you need Claude to see current code, paste or reference the actual files in the conversation; the knowledge base is for the standing context that doesn't change chat to chat.

## Custom instructions are not a system prompt you write once and forget

A normal system prompt is per-conversation and easy to lose track of. Project-level custom instructions are different: they're scoped to the Project and apply to every chat inside it, which means they're worth writing like a real onboarding doc rather than a one-line vibe check.

```
This project is for the billing-service codebase.

- We use Postgres with Drizzle ORM, not Prisma. Don't suggest Prisma patterns.
- All money values are stored as integer cents, never floats.
- Idempotency keys are required on every write endpoint. See the
  idempotency doc in project knowledge before proposing a new mutation.
- Prefer small, reviewable diffs over one large rewrite.
```

The difference between this and a vague "be helpful and concise" instruction is that it front-loads exactly the mistakes you'd otherwise catch and correct three messages into every single conversation.

## Where this quietly goes stale

The knowledge base doesn't update itself. If the architecture doc in there describes a decision that got reversed two months ago, Claude will confidently reason from the stale version, since it has no way to know the file is outdated. Whoever owns the Project should treat the knowledge base like documentation that needs occasional pruning, not a write-once archive.

## Sharing across a team

On Team and Enterprise plans, Projects can be shared with tiered permissions, "can use" versus "can edit", so a lead can maintain the knowledge base and instructions while the rest of the team works inside a consistent, already-configured Project instead of everyone building their own slightly different version of the same context.
