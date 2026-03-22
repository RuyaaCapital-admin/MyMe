# MyMe Assistant

A premium, production-grade personal AI assistant mobile app built with React Native and Expo. Seamlessly integrates with third-party tools (via Composio architecture) while providing a high-end, responsive dark-mode user experience.

## Features Built

- **Premium Chat UI**: Responsive message bubbles, typing input, and inline interactive action cards (Tool Cards).
- **Authentication**: Onboarding and Sign In screens with mock local persistence (via Expo Secure Store).
- **Integrations**: A sleek Connections tab to view, search, connect, and disconnect third-party services.
- **Settings & Profile**: Managing preferences, theme toggling, and app info.
- **State Management**: Optimized data fetching and caching via `@tanstack/react-query`, and lightweight global UI state via `zustand`.
- **Styling**: `nativewind` (Tailwind CSS) powered premium dark aesthetic.

## Architecture & Layering

We enforce strict separation of concerns:

- **`app/`**: Expo Router topology defining navigation.
- **`components/ui/`**: Pure UI elements (Shell, Buttons, Badges, Search).
- **`components/chat/`**: Feature-specific components (Messages, Compose bar).
- **`services/api.ts`**: The mocked API communication layer.
- **`store/`**: Zustand singletons.

## How to replace Mocks with Real Backend

The app relies on `services/api.ts`. Currently, this file returns static mocked promises with simulated network latency.
To integrate the real backend (including Composio OAuth endpoints and ChatGPT API interactions):

1. Open `services/api.ts`.
2. Replace the simulated `delay()` mock responses with real `fetch` or `axios` calls pointing to your API.
3. Ensure the return types align with `types/index.ts`. No UI component refactoring is necessary as long as the types match.

## Local Setup

1. `npm install`
2. `npx expo start`
3. Scan the QR code with your Expo Go app, or press `a`/`i` to launch an emulator.
