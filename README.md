# NetPulse Pro | Premium Network Intelligence

NetPulse Pro is a professional-grade, real-time network diagnostics and speed intelligence platform built with Next.js 16. It leverages advanced caching strategies and high-fidelity testing infrastructure to provide accurate network audits.

## 🚀 Experience the Precision

- **100MB High-Fidelity Tests**: Extended download benchmarks for accurate fiber-grade results.
- **30MB Sustained Uploads**: Rigorous upstream testing to verify connection stability.
- **Real-time Latency Analytics**: Live Chart.js visualization of ping and jitter fluctuations.
- **Next.js 16 `"use cache"`**: Near-instant retrieval of network intelligence (IP, ISP, ASN).
- **PWA Ready**: Fully installable as a standalone application on mobile and desktop.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI Primitives)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Visuals**: [Chart.js 4](https://www.chartjs.org/) + [Lucide React](https://lucide.dev/)
- **PWA**: Custom Service Worker + Dynamic Manifest API
- **Telemetry**: Server-side cached API integration (ipapi.co)

## 📂 Project Structure

```text
net-pulse/
├── app/                    # Next.js App Router
│   ├── api/                # API Route Handlers
│   ├── components/         # Shared React Components
│   ├── ui/                 # Shadcn UI (Radix) Primitives
│   ├── actions.ts          # Cached Server Actions
│   ├── layout.tsx          # Root Layout & Metadata
│   ├── manifest.ts         # Dynamic PWA Manifest
│   └── page.tsx            # Main Diagnostics Engine
├── lib/                    # Shared Utilities (cn, etc.)
├── public/                 # Static Assets & Service Worker
├── components.json         # Shadcn UI Registry
├── next.config.ts          # Stable Platform Configuration
├── tsconfig.json           # TypeScript Configuration
└── README.md               # Documentation
```

## 📦 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run development server**:
    ```bash
    npm run dev
    ```
4.  **Build for production**:
    ```bash
    npm run build
    ```

## 🛡️ Privacy & Security

NetPulse Pro performs diagnostic calculations locally. No personal identification data or history is stored on our servers. Telemetry is used only for real-time testing and is destroyed upon session termination.

---

_Engineered by Shamiul Islam. &copy; 2026 NetPulse Diagnostics Pro._
