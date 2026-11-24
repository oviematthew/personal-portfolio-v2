---
title: "Mastering Next.js App Router: Best Practices for Modern Web Apps"
slug: "nextjs-app-router-best-practices"
coverImage: "/media/blog/nextjs-app-router.png"
excerpt: "The App Router patterns I use on every Next.js project: routing, layouts, loading and error states, metadata and server versus client components."
date: "2025-05-01"
---

The App Router, added in Next.js 13, changed how Next.js apps are put together. Routes are folders, layouts nest, and components run on the server unless you say otherwise. This site is built on it, and these are the patterns I use on every project.

## Routes are folders

Every folder inside `app/` is a route segment, and a `page.js` inside it makes that route public:

```text
app/
  page.js            # /
  about/
    page.js          # /about
  blog/
    page.js          # /blog
    [slug]/
      page.js        # /blog/:slug
```

A segment can also have special files next to its page: `layout.js`, `loading.js` and `error.js`. Each one controls a different part of how that route behaves.

## Layouts

A layout wraps every page below it and stays mounted when you navigate between them. That's where the nav, footer and sidebars go:

```jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

I try to keep layouts small. A short root layout plus a separate layout for, say, the blog section is easier to work with than one big layout full of conditions.

## Loading and error states

Drop a `loading.js` into a segment and Next.js shows it while the page's data loads. An `error.js` catches errors in that segment, so the rest of the app keeps working:

```jsx
// loading.js
export default function Loading() {
  return <div className="loader">Loading…</div>;
}

// error.js
"use client";

export default function Error({ error, reset }) {
  return (
    <div className="error">
      <p>Something went wrong.</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

Error boundaries have to be Client Components, which is why `error.js` starts with `"use client"`. I also avoid showing `error.message` to users, since it can leak details that should stay on the server.

## Metadata

Export a `metadata` object, or a `generateMetadata` function for dynamic routes, to set the title, description and Open Graph tags per route:

```js
export const metadata = {
  title: "Home | MySite",
  description: "Welcome to my site",
};
```

No more managing `<head>` by hand, and each page gets its own SEO tags.

## Server and client components

Components in the App Router are Server Components by default. They render on the server and send HTML, not JavaScript. When something needs state, effects or browser APIs, add `"use client"` at the top of the file:

```jsx
// ToggleButton.jsx
"use client";
import { useState } from "react";

export default function ToggleButton() {
  const [on, setOn] = useState(false);
  return <button onClick={() => setOn((s) => !s)}>{on ? "On" : "Off"}</button>;
}
```

My rule of thumb: fetch data in Server Components, and push `"use client"` as far down the tree as you can. A page can stay on the server and only the toggle button inside it ships JavaScript.

## What I stick to

- Small layouts, composed together.
- Data fetching on the server, interactivity in small client components.
- A `loading.js` and an `error.js` for any route that fetches data.
- Metadata set per route, not once globally.
- Components and styles that only one route uses live next to that route.

## Wrap-up

Most of getting the App Router right is putting things where the framework expects them. Once you do, you get fast pages, good SEO and a codebase that's easy to find your way around.
