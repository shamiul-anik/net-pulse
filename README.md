# NetPulse Pro 🚀

NetPulse Pro is a state-of-the-art network diagnostics dashboard designed for high-performance telemetry tracking. It provides real-time insights into your connection's speed, latency, and environmental profile with a stunning, premium UI.

![NetPulse Pro Dashboard](https://img.shields.io/badge/UI-Premium-blueviolet?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-Tailwind_CSS_|_Chart.js-blue?style=for-the-badge)

## ✨ Features

- **Real-world Throughput Testing**:
  - **Download**: Measured via high-speed Cloudflare Edge nodes using `ReadableStream` tracking.
  - **Upload**: Secure `POST` telemetry to Vercel Serverless endpoints.
- **Precision Latency Tracking**:
  - High-frequency RTT monitoring to the nearest network edge.
  - Mathematical Jitter derivation based on throughput variance.
- **Deep Connection Profiling**:
  - Public Endpoint (IP) detection.
  - ASN & ISP identification.
  - Geographic coordinates and Timezone data.
- **Premium Design System**:
  - Glassmorphism architecture with 20px blur.
  - Dynamic radial glow overlays.
  - Animated status indicators.
- **Vercel Optimized**: Ready-to-deploy structure with Serverless API support.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript.
- **Backend (Testing Target)**: Vercel Node.js Serverless Functions.
- **Styling**: Tailwind CSS.
- **Data Visualization**: Chart.js 4.x.
- **Telemetry**: `ipapi.co` & Cloudflare Edge.

## 🚀 Deployment to Vercel

1. **Prerequisites**: [Vercel CLI](https://vercel.com/cli) installed.
2. **Launch**:
   ```bash
   vercel deploy
   ```
3. **Local Testing**:
   ```bash
   vercel dev
   ```

## 📊 Real-time Logic

Unlike traditional simulators, NetPulse Pro performs actual data transfers:

- **Ping**: RTT measured by fetching `/favicon.ico` with `cache: 'no-store'`.
- **Download**: Chunked transfer analysis of a 15MB payload from Cloudflare.
- **Upload**: Measuring transfer time of a generated `Uint8Array` to `/api/upload`.

---

_Designed with ❤️ for premium network enthusiasts by Shamiul Islam._
