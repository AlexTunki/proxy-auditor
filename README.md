# Privacy-First Proxy Auditor

A desktop application built with Electron, React, and TypeScript for local monitoring, testing, and managing proxy servers without compromising them to third-party services.

## Features
- **Local Execution:** All proxy ping checks and API requests are made directly from your machine. Your proxies are never sent to external centralized databases.
- **Real-Time Dashboard:** View total proxies, online/fast instances, dead endpoints, and high-risk IPs at a glance.
- **Activity Logs:** Live event feed showing proxy status changes in real time.
- **Proxy Management:** Easily add multiple proxies at once supporting `IP:PORT` and `IP:PORT:USER:PASS` formats.
- **Background Checking:** Set a custom interval (e.g., every 15 minutes) for the app to test proxy connectivity in the background.
- **Push Notifications:** Native OS notifications alert you instantly when a proxy goes offline or comes back online.
- **Fraud Score Integration:** Connects to IP reputation APIs (like IPQualityScore or Proxycheck.io) to assign a trust score to each IP, helping you identify blacklisted or spam-flagged proxies.
- **Dark UI:** A modern, Tailwind CSS-powered interface designed for developers and network administrators.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Lucide React (Icons), Vite
- **Backend/Desktop:** Electron, Node.js (`https-proxy-agent`, `socks-proxy-agent`)
- **Storage:** `electron-store` for local JSON persistence

## Download

Head to the [**Releases page**](https://github.com/AlexTunki/proxy-auditor/releases) to download the latest installer or portable ZIP for Windows.

## Getting Started (Development)

### Prerequisites
- Node.js installed

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Running Locally
To run the app in development mode with hot-reloading:
```bash
npm run dev
```

### Building for Production
To build the application for Windows:
```bash
npm run build
```
The compiled files will be located in the `release/` folder.

## Configuration
Go to the **Settings** tab within the app to configure:
- **Check Interval:** How often the app should ping your proxies.
- **Notifications:** Toggle system alerts.
- **Fraud Score Provider:** Select your preferred IP reputation service and enter your API key to enable fraud scoring.
