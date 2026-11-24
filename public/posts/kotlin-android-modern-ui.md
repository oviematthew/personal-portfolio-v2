---
title: "Building Modern Android UIs with Kotlin"
slug: "kotlin-android-modern-ui"
coverImage: "/media/blog/kotlin-android-ui.png"
excerpt: "The Jetpack Compose basics I'd want someone to show me first: composables, state, layout, theming and navigation."
date: "2025-03-06"
---

Jetpack Compose is now the standard way to build Android UI. Instead of XML layouts wired up to Kotlin, you write the UI in Kotlin directly, as functions. Coming from React, it felt familiar fast. These are the pieces I'd learn first.

## Composables

A composable is a Kotlin function marked with `@Composable` that describes a piece of UI:

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello $name")
}
```

You build screens by combining small ones like this, the same way you'd build React components.

## State

When state changes, Compose redraws the parts of the UI that read it. `remember` keeps a value across redraws, and `mutableStateOf` makes it observable:

```kotlin
var count by remember { mutableStateOf(0) }
Button(onClick = { count++ }) {
    Text("Clicked $count times")
}
```

If you've used `useState`, this is the same idea.

## Layout

Most layouts come down to three building blocks: `Column` stacks things vertically, `Row` lays them out horizontally and `Box` layers them on top of each other. Modifiers handle padding, size and the rest:

```kotlin
Column(modifier = Modifier.padding(16.dp)) {
    Text("Welcome")
    Button(onClick = { /* ... */ }) {
        Text("Continue")
    }
}
```

## Theming

`MaterialTheme` holds your colours, typography and shapes in one place. Material 3 replaced `lightColors` and `darkColors` with colour schemes, so theming now goes through `lightColorScheme` (or `darkColorScheme`):

```kotlin
MaterialTheme(
    colorScheme = lightColorScheme(primary = Color(0xFF1E88E5)),
    typography = Typography(),
    shapes = Shapes()
) {
    // UI content here
}
```

## Navigation

Compose Navigation maps routes to screens. Arguments go in the route, like URL parameters:

```kotlin
NavHost(navController, startDestination = "home") {
    composable("home") { HomeScreen() }
    composable("details/{id}") { backStack ->
        val id = backStack.arguments?.getString("id")
        DetailsScreen(id)
    }
}
```

## Habits worth keeping

- Keep composables small. If one is getting long, split it.
- Keep business logic out of the UI. A ViewModel holds the state, and the composable just shows it.
- Use `remember` for anything that shouldn't reset on every redraw.
- Follow Material guidelines unless you have a reason not to. Users already know how those components behave.

## Wrap-up

Composables, state, layout, theming and navigation cover most of what you need to build a real screen. After that, it's mostly practice.
