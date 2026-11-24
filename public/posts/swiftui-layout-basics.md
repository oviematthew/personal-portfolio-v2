---
title: "Getting Started with Layout in SwiftUI"
slug: "swiftui-layout-basics"
coverImage: "/media/blog/swiftui-layout.png"
excerpt: "Stacks, modifiers and reusable views: the SwiftUI layout basics, with examples."
date: "2025-04-05"
---

SwiftUI is Apple's declarative UI framework for iOS, macOS, watchOS and tvOS. You describe what a screen should look like, and SwiftUI works out how to draw it. Most layouts come down to three things: stacks, modifiers and small reusable views.

## Stacks

- `VStack` lays views out vertically.
- `HStack` lays them out horizontally.
- `ZStack` layers them on top of each other.

```swift
VStack(alignment: .leading) {
    Text("Welcome")
    Text("To SwiftUI")
}
```

You can nest stacks inside each other to build almost any layout, and `Spacer()` pushes things apart when you need flexible space.

## Modifiers

Modifiers change how a view looks or sits on the screen. They're applied in order, so the order matters: padding before a background gives you a padded coloured box, padding after it gives you a box with space around it.

```swift
Text("Styled Text")
    .font(.headline)
    .padding()
    .background(Color.yellow)
    .cornerRadius(10)
```

## Sizing to the available space

When a view needs to know how much room it has, `GeometryReader` gives you its size:

```swift
GeometryReader { geometry in
    Text("Width: \(geometry.size.width)")
}
```

I use it sparingly. It takes up all the space it's offered, which can surprise you, and stacks with `.frame` usually do the job.

## Reusable views

Once a piece of UI shows up twice, I pull it into its own view:

```swift
struct CustomCard: View {
    var title: String

    var body: some View {
        VStack {
            Text(title)
                .font(.title)
                .padding()
        }
        .background(Color.gray.opacity(0.2))
        .cornerRadius(8)
    }
}
```

## Tips

- Combine stacks for complex layouts instead of reaching for anything fancier first.
- Use `.frame`, `.padding` and `.background` for most styling.
- Keep the Xcode preview open. Seeing changes as you type is the fastest way to learn how layout behaves.
