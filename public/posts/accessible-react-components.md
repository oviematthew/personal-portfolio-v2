---
title: "Building Accessible React Components That Everyone Can Use"
date: "2025-04-03"
excerpt: "The handful of accessibility habits I lean on most when building React components, with the code for each."
coverImage: "/media/blog/accessible-react.png"
---

Most accessibility problems I find in React code aren't hard to fix. They come from small shortcuts: a `div` with an `onClick`, an icon button with no label, a modal that lets focus wander off behind it. None of them look broken with a mouse, which is why they slip through. These are the habits that catch most of them.

## Start with the right element

If something is clickable, it should almost always be a `<button>`. If it takes you somewhere, it's an `<a>`. Native elements come with keyboard support, focus styles and the right role for screen readers for free. A `div` gives you none of that.

Forms are the same. Every input needs a label tied to it, and a placeholder doesn't count, because it disappears as soon as someone starts typing.

```jsx
<label htmlFor="email">Email</label>
<input type="email" id="email" />
```

## Make sure it works with a keyboard

Try your component without a mouse: Tab to it, press Enter or Space, Escape to close. If you used a real `<button>`, this already works. If you're stuck with a custom element (a design system you can't change, for example), you have to add it yourself.

```jsx
const handleKeyDown = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openModal();
  }
};

<div role="button" tabIndex={0} onClick={openModal} onKeyDown={handleKeyDown}>
  Open
</div>
```

Seeing how much code that takes is usually enough to convince me to just use a button.

## Use ARIA to fill gaps, not to replace HTML

ARIA attributes describe things HTML can't. The three I use the most:

- `aria-label` names an element when there's no visible text, like an icon-only close button.
- `aria-expanded` tells a screen reader whether an accordion or menu is open.
- `aria-live` announces content that changes on its own, like a form error or a toast, without moving the user's focus.

```jsx
<button aria-label="Close modal">×</button>
```

If you find yourself adding `role="button"` to things, go back to the previous section.

## Manage focus in modals

When a modal opens, focus should move into it. While it's open, Tab should stay inside it. When it closes, focus should go back to the button that opened it. Otherwise a keyboard user ends up tabbing through the page behind the overlay.

```jsx
useEffect(() => {
  const opener = document.activeElement;
  modalRef.current.focus();

  return () => opener?.focus();
}, []);
```

That handles moving focus in and back out. Keeping Tab inside the modal takes a bit more work. The native `<dialog>` element with `showModal()` does it for you, and it's what I reach for first now.

## Check contrast, and don't rely on colour alone

Body text needs a contrast ratio of at least 4.5:1 against its background. And colour shouldn't be the only signal: a red border on an invalid field should also come with an error message, because not everyone can see the red.

## Test with real tools

Automated tools like Axe DevTools and Lighthouse catch the obvious issues in seconds. They can't tell you whether the experience actually makes sense, so I also go through key flows with a screen reader (VoiceOver on Mac, NVDA on Windows). Ten minutes of that finds things no scanner will.

## Build it in from the start

Accessibility is much cheaper when it's part of how you build components than when it's a cleanup ticket at the end. Most of the fixes above are a few lines each, and they don't change how anything looks.
