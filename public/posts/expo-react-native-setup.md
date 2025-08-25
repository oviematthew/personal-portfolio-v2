---
title: "Kickstarting Your Mobile App with Expo & React Native"
slug: "expo-react-native-setup"
coverImage: "/media/blog/expo.png"
excerpt: "A practical guide to setting up your first mobile app using Expo and React Native."
date: "2025-03-06"
---

### Expo is the fastest way to start building React Native apps without installing Xcode or Android Studio. It is ideal for rapid prototyping, testing, and even launching full-scale production apps. With Expo, developers can focus on creating features while the platform handles the native complexity under the hood. Its ecosystem includes built-in APIs such as Camera, push notifications, geolocation, and sensors, providing a robust starting point for any app

## Why Expo?

### Expo brings several advantages

- **Instant setup**: No need to install native build tools like Xcode or Android Studio.
- **Cross-platform**: Supports iOS, Android, and Web out of the box.
- **Built-in APIs**: Access to device hardware features without writing native code.
- **Over-the-air updates**: Push updates to your app without resubmitting to app stores.
- **Rich community and documentation**: Plenty of resources to help you get started quickly.

## Prerequisites

### Before starting, ensure Node.js and npm are installed. Familiarity with JavaScript or TypeScript is recommended

## Setting Up

## Install Expo CLI globally

```bash
npm install -g expo-cli
Create a new project:

expo init my-app
Choose a template: blank, tabs (with navigation), or others. Once created, navigate into the project and start the local server:
```

```bash

cd my-app
npm start
Scan the QR code with Expo Go on iOS or Android to instantly preview your app.
```

## Folder Structure

### A clean project structure helps maintainability and scalability

```perl
my-app/
├── App.js
├── assets/
├── components/
├── screens/
└── navigation/
```

### App.js: Main entry point

### assets/: Images, fonts, and other media

### components/: Reusable UI components

### screens/: Page-level components

### navigation/: Navigation setup (React Navigation or other)

## Using Components

### Create reusable UI components

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

## Deployment

### Build your app for production using Expo Application Services:

```bash
eas build --platform all
```

## Submit apps to stores with

```bash
eas submit --platform ios
```

## Wrap-Up

### Expo accelerates mobile development by handling native complexities. Developers can focus on UX, features, and business logic while Expo manages builds, testing, and deployment, making it perfect for both beginners and seasoned developers
