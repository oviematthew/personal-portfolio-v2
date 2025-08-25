---
title: "Building Accessible React Components That Everyone Can Use"
date: "2025-04-03"
excerpt: "Learn how to make React components accessible without compromising design or usability."
coverImage: "/media/blog/react.png"
---

### Accessibility ensures apps are usable for everyone, including people with disabilities. Accessible React components improve usability, compliance, and overall UX

## Semantic HTML

### Use proper elements

- `<button>` instead of `<div>` for clicks
- `<label>` + `<input>` for forms

==Example:==

```jsx
<label htmlFor="email">Email</label>
<input type="email" id="email" />
Keyboard Navigation
Support key events:


const handleKeyDown = (e) => {
  if (e.key === 'Enter') openModal();
};
```

## ARIA Roles

- [x] Use when semantic HTML is insufficient:

- [x]aria-label

- [x] aria-expanded

aria-live

==Example:==

```jsx
<button aria-label="Close modal">×</button>
```

## Focus Management

### Trap focus in modals

```jsx
useEffect(() => {
  modalRef.current.focus();
}, []);
```

## Color Contrast

### Ensure sufficient contrast (4.5:1) and avoid relying on color alone to convey information

## Testing

### Use tools like Axe DevTools, Lighthouse, and screen readers (VoiceOver/NVDA)

## Wrap-Up

### Integrating accessibility from the start improves inclusivity and UX. Small tweaks make significant differences without compromising design or usability
