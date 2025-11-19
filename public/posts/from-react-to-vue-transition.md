---
title: "From React to Vue: Culture Shocks as a Frontend Developer (Vue 2 & 3)"
slug: "react-to-vue-transition"
coverImage: "/media/blog/reacttovue.png"
excerpt: "A React developer’s firsthand experience transitioning to Vue 2 and 3—exploring the similarities, surprises, and best practices learned along the way."
date: "2025-11-19"
---

## From React to Vue 2 & 3: Lessons, Wins, and Culture Shocks as a Frontend Developer

### Transitioning from React to Vue has been one of the most rewarding learning experiences of my career. After working extensively with React and Next.js, I joined  [Rentsync](https://rentsync.com/), which maintains high-volume production Vue apps. Experiencing both Vue 2 and Vue 3 has given me a broad perspective on framework evolution, developer ergonomics, and project architecture

## React vs Vue: First Impressions

### Coming from React, the first thing I noticed was Vue’s *template-based* syntax. Instead of writing JSX, Vue uses a declarative template style that feels closer to HTML. At first, it felt restrictive, but Vue directives (`v-if`, `v-for`, `v-bind`, `v-model`) make templates highly readable

```vue
<template>
  <div>
    <h2>{{ listing.name }}</h2>
    <p>{{ listing.description }}</p>
    <button @click="toggleFavorite">Favorite</button>
  </div>
</template>
```

### Vue 3's Composition API was a big shift. If React Hooks taught me to think in functions, the Composition API made me think in *reactivity*. `ref()` and `reactive()` feel like `useState` on steroids — powerful, flexible, and easier to organize when your logic scales

```js
import { ref, computed } from "vue";

const listings = ref([]);
const search = ref("");

const filteredListings = computed(() =>
  listings.value.filter((l) =>
    l.name.toLowerCase().includes(search.value.toLowerCase())
  )
);
```

### Vue 2 uses the Options API. State is declared in `data`, computed properties in `computed`, and side effects in `watch` or lifecycle hooks like `mounted`. It is more declarative but less flexible than the Composition API

```js
export default {
  data() {
    return {
      listings: [],
      search: ""
    };
  },
  computed: {
    filteredListings() {
      return this.listings.filter(l =>
        l.name.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  }
};
```

## Culture Shocks and Paradigm Shifts

### Single File Components (SFCs)

### In React, I split components, CSS, and tests into separate files. In Vue 2 and 3, everything lives inside one `.vue` file — template, script, and style. It felt odd at first, but it reduces context-switching

### Reactivity Without Re-Renders

### In React, state updates trigger component re-renders. Vue’s reactivity system updates only what changes, without redrawing the entire component tree. This is subtle but highly efficient

## DOM Updates and the Next Tick Shocker

### One of the most surprising things in Vue 2 was how DOM updates are applied asynchronously. Vue batches updates and applies them on the next "tick" of its internal queue. React re-renders are synchronous in the same render cycle, but in Vue, the DOM reflects changes only after the next tick

```js
// Vue 2 example
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() {
      this.count++;
      console.log(this.$refs.count.textContent); // Still old value
      this.$nextTick(() => {
        console.log(this.$refs.count.textContent); // Updated value
      });
    }
  }
};
```

```vue
<template>
  <div>
    <span ref="count">{{ count }}</span>
    <button @click="increment">Increment</button>
  </div>
</template>
```

### Vue 3 has `nextTick()` imported from the framework, but the concept is the same — the DOM update happens after the next tick

```js
import { ref, nextTick } from "vue";

const count = ref(0);

function increment() {
  count.value++;
  console.log(document.querySelector("#count").textContent); // Old value
  nextTick(() => {
    console.log(document.querySelector("#count").textContent); // Updated
  });
}
```

## Props and Emits Over Prop Drilling

### Vue 2 and 3 support props and custom events. The pattern reduces deep prop drilling and clarifies data flow

```js
// Vue 3
const props = defineProps(["listing"]);
const emit = defineEmits(["favorite"]);

// Vue 2
props: ["listing"],
methods: {
  favorite() {
    this.$emit("favorite");
  }
}
```

### SCSS and Scoped Styles

### Vue’s scoped styles help avoid collisions while keeping SCSS maintainable

```vue
<style scoped lang="scss">
.card {
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
  }
}
</style>
```

## TypeScript in Vue

### TypeScript is optional in Vue 2 (with class-style components) but native in Vue 3. Typing ensures maintainability across components

```ts
interface Listing {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
}
```

### Vue 3 Composition API makes typing refs, computed values, and props straightforward

```ts
import { ref, computed } from "vue";

const listings = ref<Listing[]>([]);
const averagePrice = computed(() => {
  return listings.value.length
    ? listings.value.reduce((a, c) => a + c.price, 0) / listings.value.length
    : 0;
});
```

## React Hooks vs Vue Reactivity

```jsx
// React
const [count, setCount] = useState(0);
useEffect(() => console.log(count), [count]);
```

```ts
// Vue 3
const count = ref(0);
watch(count, (value) => console.log(value));
```

```js
// Vue 2
data() {
  return { count: 0 };
},
watch: {
  count(newVal) {
    console.log(newVal);
  }
}
```

### Concept comparison

| Concept | React | Vue 2 | Vue 3 |
|---------|-------|-------|-------|
| State | `useState` | `data()` | `ref`, `reactive` |
