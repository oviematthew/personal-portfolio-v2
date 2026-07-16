---
title: "What I Learned Fixing a React Server Components CVE"
slug: "fixing-a-react-server-components-cve"
coverImage: "/media/blog/rsc-cve-fix.png"
excerpt: "A dependency alert on this site turned into a real lesson in how Server Components handle data across the client/server boundary."
date: "2026-06-09"
---

A dependency alert showed up flagging a React Server Components vulnerability in the version this site was running. Bumping a version number is usually the easy part. Understanding what the vulnerability actually was, and confirming the fix didn't just paper over it, took a lot more attention than I expected going in.

## The version bump is the trivial part

Upgrading React and Next.js to the patched versions took a few minutes. The part that actually mattered was going through the release notes and the advisory closely enough to understand what class of bug had been fixed, instead of just trusting that a higher version number meant "safe now." Patch notes for security fixes are often vague by design, so a good chunk of the work was reasoning about what kind of RSC behavior could plausibly be affected, not just reading a changelog.

## Server Components blur a boundary that used to be explicit

With a traditional client-rendered app, the line between "server data" and "client data" is enforced by an API boundary you write yourself. It is a serialization step you control. Server Components move a lot of that boundary into the framework, which is exactly what makes them productive, but it also means a mistake in what the framework decides is safe to serialize down to the client isn't something your own code would ever catch. This class of vulnerability lives in a place most application code has no visibility into.

## Auditing what data crosses the boundary in this project

Since the framework-level bug wasn't fully in my control, the part that was: going through every Server Component in the app and checking exactly what data it was passing to Client Components, and why. It's easy to pass a whole object down because it's convenient, and end up shipping fields to the client that were never meant to leave the server, regardless of whether the framework itself has a bug. Tightening that, only passing the specific fields a client component actually needs, turned out to be worth doing independent of the CVE, since it's the kind of thing that's easy to get sloppy about over time.

## Re-testing after a security patch isn't optional

It's tempting to treat a dependency bump as done once the build passes and the pages render. That's necessary but not sufficient here, since a fix for a data-exposure bug doesn't change what a page looks like, only what's present in the payload the client shouldn't have. I went back through the pages that render any kind of dynamic or user-relevant data and manually checked network payloads, not just visual output, before calling it done.

## The actual takeaway

The framework will keep taking on more of this boundary-management work over time, and that's a net good thing. But it means the failure mode shifts from "I wrote a bug" to "a boundary I trusted had a bug," which changes what auditing a fix actually requires. Bumping the version number is necessary. Confirming what was actually exposed, and cleaning up the parts of my own code that were sloppy about that same boundary, is the part that actually closes the loop.
