---
title: "Getting Started with Layout in SwiftUI"
slug: "swiftui-layout-basics"
coverImage: "/media/blog/swiftui.png"
excerpt: "Discover how to build beautiful layouts using SwiftUI’s powerful and declarative approach."
date: "2025-04-05"
---

## SwiftUI is Apple’s declarative UI framework for iOS, macOS, watchOS, and tvOS. It simplifies layout creation by using stacks, modifiers, and reusable views

## Stack Basics

- `VStack`: vertical arrangement
- `HStack`: horizontal arrangement
- `ZStack`: overlapping layers

## Example

```swift
VStack(alignment: .leading) {
    Text("Welcome")
    Text("To SwiftUI")
}
```

## Modifiers

### Modifiers change view appearance

```swift
Text("Styled Text")
    .font(.headline)
    .padding()
    .background(Color.yellow)
    .cornerRadius(10)
```

### Responsive Layouts

## Use GeometryReader for dynamic sizing

```swift
GeometryReader { geometry in
    Text("Width: \(geometry.size.width)")
}
```

## Building Reusable Views

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

## Additional Tips

- [x]Combine stacks to create complex layouts.

- [x]Use Spacer() for flexible spacing.

- [x]Leverage .frame, .padding, .background for styling.

- [x]Preview views in Xcode for instant feedback.
