---
title: "From Vue 2 to Vue 3: What Actually Changed"
slug: "from-vue-2-to-vue-3"
excerpt: "The Composition API, script setup and the new lifecycle hooks. The parts of the Vue 2 to Vue 3 move that changed how I write components."
date: "2026-08-28"
---

Moving from Vue 2 to Vue 3 is less about new syntax and more about a new way of organising a component. Here are the changes that made the biggest difference for me.

## Options API to Composition API

In Vue 2, a component was split by type: `data` in one place, `methods` in another, `computed` and `watch` somewhere else. One feature ended up scattered across the whole file.

```js
// Vue 2
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    double() {
      return this.count * 2;
    },
  },
  methods: {
    increment() {
      this.count++;
    },
  },
};
```

The Composition API lets you group code by what it does instead.

```vue
<!-- Vue 3 -->
<script setup>
import { computed, ref } from "vue";

const count = ref(0);
const double = computed(() => count.value * 2);
const increment = () => count.value++;
</script>
```

No `this`, no `export default`, and everything declared in `<script setup>` is available in the template.

## The lifecycle hooks changed

The hooks are now functions you import, and a few were renamed.

- `beforeCreate` and `created` become the `setup` code itself
- `mounted` becomes `onMounted`
- `beforeUpdate` and `updated` become `onBeforeUpdate` and `onUpdated`
- `beforeDestroy` becomes `onBeforeUnmount`
- `destroyed` becomes `onUnmounted`

```js
import { onBeforeUnmount, onMounted } from "vue";

onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
```

The setup and the cleanup now sit next to each other, which makes leaks much harder to miss.

## Composables replace mixins

Mixins were Vue 2's way to share logic, but you could never tell where a property came from. In Vue 3, shared logic is just a function.

```js
// useCounter.js
import { ref } from "vue";

export function useCounter() {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
}
```

```js
const { count, increment } = useCounter();
```

Every value has a visible source, and the logic is easy to test on its own.

## Smaller changes worth knowing

- **Reactivity just works.** Vue 3 uses proxies, so adding a new property to an object or setting an array index is reactive. No more `Vue.set`.
- **`v-model` on components** uses `modelValue` and `update:modelValue` instead of `value` and `input`, and a component can now have more than one `v-model`.
- **Multiple root elements** are allowed, so no more wrapper `div` just to keep the template valid.

## Worth it

The move takes some getting used to, but components end up shorter, logic is easier to share, and features read top to bottom instead of being scattered. I would not go back.
