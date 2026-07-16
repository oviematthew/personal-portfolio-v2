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

JSON-LD and Open Graph metadata were always good practice for SEO, but they matter more here because an LLM extracting facts from a page benefits from structure it doesn't have to infer. The less inference the model has to do to understand what a page is about, the more likely it is to represent it accurately.

Say you run a neighborhood coffee shop with a small site: a menu page, hours, and a blog where you write about your beans and brew methods. If someone asks an AI assistant "where can I get a good pour-over near me" or "how do I brew pour-over at home," structured data is what lets your page answer both kinds of questions correctly instead of getting misread.

For the shop itself, that's `LocalBusiness` schema on the homepage, with the facts an answer engine actually needs to recommend a real place: name, address, hours, and price range.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "name": "Fernwood Coffee Roasters",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "412 Fernwood Ave",
    "addressLocality": "Portland",
    "addressRegion": "OR",
    "postalCode": "97214"
  },
  "openingHours": "Mo-Fr 07:00-17:00, Sa-Su 08:00-15:00",
  "priceRange": "$$",
  "servesCuisine": "Coffee, Pastries",
  "url": "https://fernwoodcoffee.com"
}
</script>
```

For a blog post, like a brewing guide, that's `Article` schema with a real headline, author, and date:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "A Beginner's Guide to Pour-Over Coffee at Home",
  "description": "The equipment, ratios, and pour technique we use behind the counter, adapted for a home kitchen.",
  "author": {
    "@type": "Organization",
    "name": "Fernwood Coffee Roasters",
    "url": "https://fernwoodcoffee.com"
  },
  "datePublished": "2026-02-02",
  "dateModified": "2026-02-02",
  "mainEntityOfPage": "https://fernwoodcoffee.com/blog/pour-over-at-home",
  "image": "https://fernwoodcoffee.com/media/pour-over-guide.jpg"
}
</script>
```

In a Next.js App Router project, neither of these needs a hand-written script tag, `generateMetadata` (or a plain object export) can render the `Article` block per route so every post gets correct values automatically instead of copy-pasted ones:

```jsx
// app/blog-post/[slug]/page.jsx
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return {
    title: post.title,
    description: post.excerpt,
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        author: { "@type": "Organization", name: "Fernwood Coffee Roasters" },
        datePublished: post.date,
      }),
    },
  };
}
```

The `LocalBusiness` block on the homepage is the highest-leverage piece for a business like this, it's what turns "a good pour-over place" into a specific, citable answer. `Article` per blog post is what gets the how-to content itself surfaced and quoted. `BreadcrumbList` on nested pages is worth adding once those two are in, but it's a refinement, not the thing that gets you cited in the first place.

## An llms.txt file, if you have the surface area for one

The `llms.txt` convention (a plain markdown file at the site root) is an emerging, unofficial standard for giving AI systems a condensed, structured summary of a site: what it is, its key pages, and short descriptions in plain language instead of marketing copy. It's not yet universally honored the way `robots.txt` is, but for a project with enough pages that a model would otherwise have to piece it together from scratch, it's a low-cost way to hand over the summary directly.

The format itself is deliberately plain: an H1 with the site name, a one-line blockquote summary, then H2 sections grouping links with a short description each.

```markdown
# Fernwood Coffee Roasters

> A neighborhood coffee shop and roaster in Portland, OR. Serves
> single-origin pour-over, espresso, and pastries, and roasts its
> own beans on-site.

## Docs

- [Menu](https://fernwoodcoffee.com/menu): Current drink and pastry menu with prices.
- [Hours & Location](https://fernwoodcoffee.com/visit): Address, hours, and parking.
- [Blog](https://fernwoodcoffee.com/blog): Brewing guides and notes on where the beans come from.

## Optional

- [Wholesale](https://fernwoodcoffee.com/wholesale): Bulk bean orders for other cafes.
```

Serve it as a static file at `/llms.txt` (in Next.js, drop it straight into the `public/` directory, no route needed) and keep it short. The point is a compact summary a model can load in one request, not a mirror of the whole sitemap.

## Write the direct answer before the explanation

The content pattern that actually moves the needle: state the conclusion first, then explain it, rather than building up to it. A page that opens with three paragraphs of throat-clearing before it answers "what is X" is much less likely to get quoted than one that answers in the first sentence and elaborates after. This is a genuine departure from a lot of long-form SEO writing, which was optimized to maximize time-on-page, a metric that answer engines don't care about at all.

## Measuring whether any of it is working

Referral traffic from AI answer engines shows up differently than search traffic, often as direct traffic or under a referrer like `chatgpt.com` or `perplexity.ai` rather than a query string full of keywords, so it's easy to undercount if you're only looking at your usual search-console dashboard. Checking server logs for hits from the AI crawler user agents is the more reliable signal that you're actually being read, independent of whether it's converting into visible referral traffic yet.
