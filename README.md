# NetPulse 🚀

NetPulse is a state-of-the-art network diagnostics dashboard built with **Next.js 16**, **Tailwind CSS**, and **Chart.js**. It provides real-time insights into your connection's speed, latency, and environmental profile with a stunning, premium UI.

![NetPulse Dashboard](https://img.shields.io/badge/UI-Premium-blueviolet?style=for-the-badge)
![Framework](https://img.shields.io/badge/Framework-Next.js_15-black?style=for-the-badge)

## ✨ Features

- **Real-world Throughput Testing**:
  - **Download**: Measured via high-speed Cloudflare Edge nodes using `ReadableStream` tracking.
  - **Upload**: Secure `POST` telemetry to Next.js API Routes.
- **Precision Latency Tracking**:
  - High-frequency RTT monitoring via fetch handshake.
  - Mathematical Jitter derivation based on throughput variance.
- **Deep Connection Profiling**:
  - Public Endpoint (IP) detection via `ipapi.co`.
  - ASN & ISP identification.
  - Geographic coordinates and Timezone data.
- **Premium Design System**:
  - Glassmorphism architecture with blurred backdrops.
  - Dynamic radial glow overlays.
  - Animated status indicators and Lucide icons.
- **PWA Ready**: Installable on desktop and mobile with offline asset caching.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19.
- **Styling**: Tailwind CSS 4.
- **Icons**: Lucide React.
- **Data Visualization**: Chart.js 4.x with `react-chartjs-2`.
- **Telemetry**: `ipapi.co` & Cloudflare Edge.

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch development server**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```

## 📊 Real-time Logic

NetPulse performs actual data transfers:

- **Ping**: RTT measured by fetching `/favicon.ico` with `cache: 'no-store'`.
- **Download**: 50MB chunked transfer analysis from Cloudflare.
- **Upload**: 15MB transfer time to `/api/upload` API route.

---

_Designed with ❤️ for premium network enthusiasts by Shamiul Islam._
