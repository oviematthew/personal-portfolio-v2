---
title: "Setting Up GEO for AI Search Visibility"
slug: "setting-up-geo-for-ai-search"
coverImage: "/media/blog/geo-ai-search.png"
excerpt: "Generative Engine Optimization is the new SEO. A few concrete things that actually help AI answer engines find, understand, and cite your project."
date: "2026-03-11"
---

A growing share of the traffic that used to come from a Google search now comes from someone asking ChatGPT, Claude, or Perplexity a question and getting a synthesized answer with a few citations. Ranking in that answer is a different problem from ranking in a list of ten blue links, and the practices that get you there, GEO, Generative Engine Optimization, overlap with SEO less than the name suggests.

## Answer engines read pages differently than search engines rank them

Traditional SEO optimizes for a crawler that indexes keywords and a ranking algorithm that weighs backlinks and relevance signals. An LLM-based answer engine reads the actual content of a page, extracts what looks like a direct answer to the user's question, and decides whether to cite it. That means the thing that matters most isn't keyword density, it's whether your page states its answer plainly, early, and in a form that reads cleanly out of context, since it might get pulled as a two-sentence excerpt with no surrounding page for context.

## Let AI crawlers actually reach you

This sounds obvious but it's the most common miss: a `robots.txt` that blocks everything by default, written before AI crawlers existed, quietly blocks `GPTBot`, `ClaudeBot`, and `PerplexityBot` along with everything else it was meant to stop. If you want to be discoverable, they need an explicit allow.

```text
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://example.com/sitemap.xml
```

## Structured data gives the model something unambiguous to extract

JSON-LD and Open Graph metadata were always good practice for SEO, but they matter more here because an LLM extracting facts from a page benefits from structure it doesn't have to infer. Article schema with a clear headline, author, and date; explicit `<title>` and meta description tags that state what the page actually is, not just marketing copy. The less inference the model has to do to understand what a page is about, the more likely it is to represent it accurately.

## An llms.txt file, if you have the surface area for one

The `llms.txt` convention (a plain markdown file at the site root) is an emerging, unofficial standard for giving AI systems a condensed, structured summary of a site: what it is, its key pages, and short descriptions in plain language instead of marketing copy. It's not yet universally honored the way `robots.txt` is, but for a project with enough pages that a model would otherwise have to piece it together from scratch, it's a low-cost way to hand over the summary directly.

## Write the direct answer before the explanation

The content pattern that actually moves the needle: state the conclusion first, then explain it, rather than building up to it. A page that opens with three paragraphs of throat-clearing before it answers "what is X" is much less likely to get quoted than one that answers in the first sentence and elaborates after. This is a genuine departure from a lot of long-form SEO writing, which was optimized to maximize time-on-page, a metric that answer engines don't care about at all.

## Measuring whether any of it is working

Referral traffic from AI answer engines shows up differently than search traffic, often as direct traffic or under a referrer like `chatgpt.com` or `perplexity.ai` rather than a query string full of keywords, so it's easy to undercount if you're only looking at your usual search-console dashboard. Checking server logs for hits from the AI crawler user agents is the more reliable signal that you're actually being read, independent of whether it's converting into visible referral traffic yet.
