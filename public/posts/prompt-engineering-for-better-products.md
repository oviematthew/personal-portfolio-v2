---
title: "Prompt Engineering: How to Build a Better Product With It"
slug: "prompt-engineering-for-better-products"
excerpt: "Prompt engineering stopped being about clever wording. Here is how I treat prompts as part of the product: clear specs, examples, structured output, evals and version control."
date: "2026-11-14"
---

A year ago, prompt engineering mostly meant finding the magic sentence. Today most of the useful advice sounds a lot more like normal software engineering: write a spec, test it, ship it, and keep it under version control. Here is how I think about it when a prompt is part of a product, not a one-off chat.

## 1. Write the prompt like a spec

Anthropic's guidance says to treat the model like a brilliant new colleague who has none of your context. That framing fixes most weak prompts. Say what the task is, who the output is for, what a good answer looks like and what to avoid.

The most useful habit is defining "done" up front. If you cannot describe what a passing answer looks like, you cannot tell whether a change to the prompt made things better.

## 2. Show, don't only tell

A handful of examples (the docs suggest three to five) steer tone and format better than a paragraph of rules. Make them varied, and include an awkward case, so the model does not copy one pattern.

## 3. Separate the parts

When a prompt mixes instructions, background, examples and the user's input, wrap each in a clear section. Claude handles XML-style tags well for this.

```xml
<instructions>
Summarise the support ticket in two sentences for an engineer.
</instructions>

<examples>
<example>...</example>
</examples>

<ticket>
{{ticket_text}}
</ticket>
```

It also stops user input from being mistaken for instructions, which matters when that input is untrusted.

## 4. Ask for structure, then validate it

If your code consumes the answer, do not parse prose. Major providers now offer schema-enforced JSON output (Claude, OpenAI and Gemini all have a version). Define the shape, validate it in code and handle the failure path. The result behaves like an API, which is what the rest of your app expects.

## 5. Build evals before you tweak

This is the step that changes the product the most. Collect a small set of real inputs with the answers you expect, covering normal cases and the ones that break. A few dozen is enough to start. Run every prompt change against it.

Without that set, editing a prompt is guessing: you fix the case in front of you and quietly break three you cannot see. With it, you know whether a change helped, and you can try a cheaper or newer model with confidence.

## 6. Treat prompts as code

Store prompts in the repository, not inside a dashboard or a string buried in a component. Keep the model, parameters and output schema next to them, review changes in pull requests and be able to roll back. When quality drops, you can answer "what changed?"

## 7. Remember the prompt is not everything

Many production failures are not about wording. They come from what the model was given: stale data, bad retrieval, too many tools, a long history full of noise. This broader work is often called context engineering. Before rewriting a prompt for the fifth time, check what is actually in front of the model.

## What this looks like in a product

- **Fewer surprises.** Clear specs and examples make behaviour consistent, so users stop seeing wildly different answers to the same request.
- **Safer changes.** Evals let you change a prompt or swap a model on a Tuesday without crossing your fingers.
- **Real features.** Structured output turns a chat response into data your interface can render, filter and act on.
- **Lower cost.** A tighter prompt and a measured, smaller model often do the same job for less.

The loop is simple: write the spec, add examples, require structure, test against real cases, version the result. That is most of what separates a demo from a product.

