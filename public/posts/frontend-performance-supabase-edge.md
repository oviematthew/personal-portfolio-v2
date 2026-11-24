---
title: "Optimizing Frontend Performance with Supabase and Edge Functions"
slug: "frontend-performance-supabase-edge"
coverImage: "/media/blog/supabase-edge-performance.png"
excerpt: "Practical ways to keep a Supabase-backed frontend fast: fetch less, subscribe instead of polling, move work to Edge Functions and cache at every layer."
date: "2025-08-20"
---

Supabase gives you a Postgres database, auth, storage and realtime updates in one place, and Edge Functions let you run server code close to your users. That makes it easy to get an app working. Keeping it fast as the data grows takes a bit more thought. These are the techniques I use, roughly in the order I reach for them.

## 1. Fetch only what the page needs

The easiest win is asking for less. Paginate, and select only the columns you actually render:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getPaginatedPosts(page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, excerpt, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return data;
}
```

`select("*")` is fine while prototyping. In production it means sending every column, including big text fields the list view never shows.

## 2. Subscribe instead of polling

If the page needs to stay up to date, don't refetch the whole table on a timer. Supabase can push changes to you as they happen:

```javascript
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function RealtimePosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("id, title")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts(data ?? []));

    const channel = supabase
      .channel("posts-inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => setPosts((prev) => [payload.new, ...prev])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

You load the list once, then only the new rows come over the wire. Always remove the channel in the cleanup, or you'll end up with duplicate subscriptions every time the component remounts.

## 3. Move heavy work to Edge Functions

Some work doesn't belong in the browser: aggregating numbers across many rows, filtering data the user shouldn't see in full, or checking permissions before anything is returned. Supabase Edge Functions run that on the server, close to the user, and send back only the result:

```typescript
// supabase/functions/get-posts/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || 1);
  const limit = 10;
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, excerpt, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ data });
});
```

The browser gets a small, ready-to-use payload instead of raw rows it has to process itself.

## 4. Cache and revalidate

Not every page needs fresh data on every request. With Next.js, you can statically generate a page and refresh it in the background every so often with ISR:

```javascript
export const revalidate = 60; // regenerate at most every 60 seconds
```

I use this for anything public and mostly read-only, like a blog or a product list, and keep Edge Functions for data that's personal or changes constantly.

## 5. Don't let images undo the work

Fast data doesn't help if the page then waits on a 3 MB hero image. Supabase Storage can resize images on the fly through URL transformations, and `next/image` lazy-loads anything below the fold:

```jsx
import Image from "next/image";

<Image src={post.coverImage} alt={post.title} width={800} height={400} />;
```

Images below the fold only load when they come into view, which helps your Largest Contentful Paint (LCP) score.

## 6. Cache on the client too

For data the user comes back to often, a client-side cache like SWR or React Query shows the last result instantly and refreshes it in the background:

```javascript
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

function PostsList() {
  const { data } = useSWR("/api/posts", fetcher, { revalidateOnFocus: false });
  return <ul>{data?.data.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

You can also cache Edge Function responses at the CDN with `Cache-Control` headers, so repeat requests never reach the database at all.

## Summary

- Paginate and select only the columns you use.
- Use realtime subscriptions instead of polling.
- Do heavy or sensitive work in Edge Functions.
- Cache at every layer: ISR for pages, the CDN for API responses and SWR in the browser.
- Resize and lazy-load images.

None of these are big changes on their own, but together they're the difference between an app that feels fast with ten rows and one that still feels fast with ten thousand.
