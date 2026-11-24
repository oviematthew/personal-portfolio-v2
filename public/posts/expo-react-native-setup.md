---
title: "Kickstarting Your Mobile App with Expo & React Native"
slug: "expo-react-native-setup"
coverImage: "/media/blog/expo-react-native.png"
excerpt: "How I set up a new React Native app with Expo, from the first command to a production build."
date: "2025-03-06"
---

Expo is how I start every React Native app now. You don't need Xcode or Android Studio to get going, and things like the camera, push notifications and location are already wrapped in packages that work the same on iOS and Android. This is the setup I use, from the first command to a store build.

## Why Expo

- **No native setup to start.** You can run your app on a real phone within a few minutes, without installing Xcode or Android Studio.
- **One codebase for iOS, Android and web.**
- **Device APIs without native code.** Camera, notifications, location and sensors all come as Expo packages.
- **Over-the-air updates.** You can ship JavaScript fixes without going through app review again.
- **Good docs.** When I get stuck, the answer is usually in the Expo docs.

## What you need

Node.js installed, and some JavaScript or TypeScript. That's it.

## Create the project

Expo dropped the old global `expo-cli` in favour of `create-expo-app`, so there's nothing to install first. `npx` pulls the latest version each time:

```bash
npx create-expo-app my-app
```

It asks you to pick a template: a blank TypeScript app, or one with tab navigation already wired up.

## Run it

```bash
cd my-app
npx expo start
```

Scan the QR code with the Expo Go app on your phone to open it there, or press `i` or `a` in the terminal to launch the iOS Simulator or Android Emulator.

## Folder structure

New Expo templates use Expo Router, which puts screens in an `app/` folder. For a simple app I keep it close to this:

```text
my-app/
├── app/          # screens and navigation
├── assets/       # images and fonts
└── components/   # shared UI pieces
```

If a component is only used by one screen, I keep it next to that screen until something else needs it.

## A first component

React Native components look like React, with native building blocks instead of HTML. `Pressable` is the one to use for anything tappable:

```jsx
import { Pressable, Text } from "react-native";

export default function Button({ label, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Text>{label}</Text>
    </Pressable>
  );
}
```

## Building for the stores

When you're ready to ship, Expo Application Services (EAS) builds the app in the cloud:

```bash
eas build --platform all
```

And submits it to the App Store or Play Store:

```bash
eas submit --platform ios
```

You'll need Apple and Google developer accounts for this part, and the first submission takes some setup. After that it's mostly two commands.

## Wrap-up

Expo takes care of the native parts that used to make mobile development slow to start, so you can spend your time on the app itself. It's a good place to start whether it's your first app or your tenth.
