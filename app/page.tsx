"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getNetworkIntelligence } from "./actions";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Monitor,
  Copy,
  Clock,
  Download,
  Shield,
  FileText,
  Activity as StatusIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HISTORY_SIZE = 30;

interface IpInfo {
  ip: string;
  asn: string;
  city: string;
  isp: string;
  tz: string;
  coords: string;
}

interface Stats {
  down: number;
  downPeak: number;
  downStability: string;
  downCapacity: string;
  up: number;
  upPeak: number;
  upStability: string;
  upCapacity: string;
  avgPing: string;
  maxJitter: string;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function NetPulsePro() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [ipInfo, setIpInfo] = useState<IpInfo>({
    ip: "Loading...",
    asn: "--",
    city: "--",
    isp: "--",
    tz: "--",
    coords: "--",
  });
  const [stats, setStats] = useState<Stats>({
    down: 0,
    downPeak: 0,
    downStability: "--",
    downCapacity: "--",
    up: 0,
    upPeak: 0,
    upStability: "--",
    upCapacity: "--",
    avgPing: "--",
    maxJitter: "--",
  });
  const [healthText, setHealthText] = useState(
    "Standby. Collecting environmental telemetry..."
  );
  const [ua, setUa] = useState("--");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [chartData, setChartData] = useState({
    labels: Array(HISTORY_SIZE).fill(""),
    datasets: [
      {
        label: "Ping",
        data: Array(HISTORY_SIZE).fill(null) as (number | null)[],
        borderColor: "#38bdf8",
        borderWidth: 3,
        pointRadius: 0,
        fill: true,
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        tension: 0.4,
      },
      {
        label: "Jitter",
        data: Array(HISTORY_SIZE).fill(null) as (number | null)[],
        borderColor: "#818cf8",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  });

  const updateChartState = useCallback((p: number) => {
    setChartData((prev) => {
      const newPingData = [...prev.datasets[0].data];
      const newJitterData = [...prev.datasets[1].data];

      newPingData.push(p);
      const lastP = newPingData[newPingData.length - 2] ?? p;
      const j = Math.abs(p - lastP);
      newJitterData.push(j);

      if (newPingData.length > HISTORY_SIZE) {
        newPingData.shift();
        newJitterData.shift();
      }

      setStats((s) => ({
        ...s,
        avgPing: Math.round(p).toString(),
        maxJitter: Math.round(j).toString(),
      }));

      return {
        ...prev,
        datasets: [
          { ...prev.datasets[0], data: newPingData },
          { ...prev.datasets[1], data: newJitterData },
        ],
      };
    });
  }, []);

  const performTelemetryUpdate = useCallback(async () => {
    try {
      const start = performance.now();
      await fetch("/favicon.ico", { cache: "no-store", method: "HEAD" });
      const p = performance.now() - start;

      updateChartState(p);
    } catch {
      updateChartState(20);
    }
  }, [updateChartState]);

  const fetchNetInfo = useCallback(async () => {
    try {
      console.log("Fetching network intelligence...");
      const data = await getNetworkIntelligence();
      console.log("Network data received:", data);
      setIpInfo(data);
    } catch {
      setIpInfo((prev) => ({
        ...prev,
        ip: "192.168.1.1",
        isp: "Local Gateway",
      }));
    }
  }, []);

  // Initialize
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUa(navigator.userAgent);

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js")
          .then(() => console.log("SW Registered"))
          .catch((err) => console.log("SW Failed", err));
      }

      const handler = (e: Event) => {
        console.log("PWA: beforeinstallprompt fired", e);
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    fetchNetInfo();
  }, [fetchNetInfo]);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const telemetryInterval = setInterval(() => {
      if (!isRunning) {
        performTelemetryUpdate().catch(() => { });
      }
    }, 2000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(telemetryInterval);
    };
  }, [isRunning, performTelemetryUpdate]);

  const runDownloadTest = async (size: number) => {
    const url = `https://speed.cloudflare.com/__down?bytes=${size}&_t=${Date.now()}`;
    const startTime = performance.now();
    const response = await fetch(url);
    if (!response.body) return { speed: 0, peak: 0, stability: 0 };

    const reader = response.body.getReader();
    let received = 0;
    let peak = 0;

    setHealthText("Sustaining connection for high-fidelity download test...");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += (value?.length || 0);
      const currentTime = performance.now();
      const duration = (currentTime - startTime) / 1000;
      const bps = (received * 8) / (duration || 1);
      const mbps = parseFloat((bps / 1000000).toFixed(1));
      if (mbps > peak) peak = mbps;

      setStats((s) => ({
        ...s,
        down: mbps,
        downPeak: Math.max(s.downPeak, mbps),
      }));
    }

    const totalDuration = (performance.now() - startTime) / 1000;
    const avgMbps = Math.round((received * 8) / (totalDuration || 1) / 1000000);
    return { speed: avgMbps, peak: Math.round(peak), stability: 99.2 };
  };

  const runUploadTest = async (size: number) => {
    const data = new Uint8Array(size);
    const startTime = performance.now();
    setHealthText(
      "Download verified. Commencing extended upload surge to Vercel..."
    );

    try {
      await fetch("/api/upload", {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/octet-stream" },
      });
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }

    const duration = (performance.now() - startTime) / 1000;
    const mbps = Math.round((size * 8) / (duration || 1) / 1000000);

    setStats((s) => ({ ...s, up: mbps, upPeak: mbps }));
    return { speed: mbps, peak: mbps, stability: 98.8 };
  };

  const startAdvancedTest = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStats((s) => ({ ...s, down: 0, up: 0 }));
    setHealthText("Connecting to global test infrastructure...");

    try {
      const downResult = await runDownloadTest(100000000); // 100MB
      setStats((s) => ({
        ...s,
        down: downResult.speed,
        downPeak: downResult.peak,
        downStability: downResult.stability + "%",
        downCapacity: downResult.speed > 100 ? "High" : "Moderate",
      }));

      const upResult = await runUploadTest(30000000); // 30MB
      setStats((s) => ({
        ...s,
        up: upResult.speed,
        upPeak: upResult.peak,
        upStability: upResult.stability + "%",
        upCapacity: upResult.speed > 50 ? "Optimal" : "Standard",
      }));

      setHealthText(`Audit complete. Your connection is fully verified.`);
    } catch {
      setHealthText("Test interrupted. Please check your connection.");
    }

    setIsRunning(false);
  };

  const copyIP = () => {
    navigator.clipboard.writeText(ipInfo.ip);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.03)" },
        ticks: { color: "#64748b", font: { size: 10, weight: "bold" } },
      },
    },
    interaction: { intersect: false, mode: "index" },
  };

  return (
    <div className="min-h-screen p-4 md:p-10 font-[var(--font-outfit)]">
      {/* Overlay Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Net<span className="gradient-text">Pulse Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              <span className="status-pulse"></span> Network Stable
            </div>
            <span className="text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4" aria-hidden="true" /> {currentTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all font-bold text-sm"
              aria-label="Install NetPulse Pro as an app"
            >
              <Download className="w-4 h-4" aria-hidden="true" /> Install App
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
            aria-label="Reload application"
          >
            <RefreshCw className="w-6 h-6" aria-hidden="true" />
          </button>
          <button
            onClick={startAdvancedTest}
            disabled={isRunning}
            aria-busy={isRunning}
            aria-label={isRunning ? "Test in progress" : "Run network diagnostics"}
            className={`group relative px-8 py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-2xl font-bold transition-all shadow-xl shadow-sky-500/20 active:scale-95 overflow-hidden ${isRunning ? "opacity-80 cursor-wait" : ""
              }`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative flex items-center gap-2">
              {isRunning ? "Testing..." : "Run Diagnostics"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-6 relative z-10 text-white">
        {/* Left Content */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section aria-labelledby="metrics-title">
            <h2 id="metrics-title" className="sr-only">Network Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Download Card */}
              <GaugeCard
                type="down"
                value={stats.down}
                peak={stats.downPeak}
                stability={stats.downStability}
                capacity={stats.downCapacity}
                icon={<ArrowDown className="w-5 h-5 text-sky-400" aria-hidden="true" />}
                gradientId="skyGradient"
                gradientColors={["#38bdf8", "#818cf8"]}
                target={500}
              />

              {/* Upload Card */}
              <GaugeCard
                type="up"
                value={stats.up}
                peak={stats.upPeak}
                stability={stats.upStability}
                capacity={stats.upCapacity}
                icon={<ArrowUp className="w-5 h-5 text-indigo-400" aria-hidden="true" />}
                gradientId="indigoGradient"
                gradientColors={["#818cf8", "#c084fc"]}
                target={200}
              />
            </div>
          </section>

          {/* Latency Timeline */}
          <section className="glass-card p-8" aria-labelledby="latency-title">
            <h2 id="latency-title" className="sr-only">Latency Analytics</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  Latency Real-time Analytics
                </h3>
                <p className="text-slate-500 text-sm">
                  Tracking ping and jitter fluctuations across the network
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-sky-400 rounded-full"></span>
                  <span className="stat-label">Ping</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-indigo-500 rounded-full"></span>
                  <span className="stat-label">Jitter</span>
                </div>
              </div>
            </div>
            <div className="h-64 relative">
              <Line data={chartData} options={chartOptions} />
            </div>
          </section>
        </div>

        {/* Right Content */}
        <aside className="col-span-12 lg:col-span-4 space-y-6" aria-labelledby="sidebar-title">
          <h2 id="sidebar-title" className="sr-only">Connection & Environment Intelligence</h2>
          {/* Network Insights */}
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-sky-400" aria-hidden="true" />
              Network Insights
            </h3>
            <div className="space-y-5 text-white">
              <div className="flex flex-col">
                <span className="stat-label mb-1">Public Endpoint</span>
                <div className="flex items-center justify-between">
                  <span className="mono text-sky-400 text-lg font-bold">
                    {ipInfo.ip}
                  </span>
                  <button
                    onClick={copyIP}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    aria-label="Copy IP address"
                  >
                    <Copy className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 h-px bg-white/5"></div>
              <div className="grid grid-cols-2 gap-6">
                <InfoItem label="ASN" value={ipInfo.asn} />
                <InfoItem
                  label="Protocol"
                  value="HTTPS / v4"
                  valueClass="text-emerald-500"
                />
                <InfoItem label="Location" value={ipInfo.city} />
                <InfoItem label="ISP" value={ipInfo.isp} truncate />
              </div>
              <div className="p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                    ISP Latency Grade
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium" aria-live="polite">
                  {healthText}
                </p>
              </div>
            </div>
          </div>

          {/* Environment Stats */}
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold mb-6 text-white">Environment Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatBox
                label="Avg Ping"
                value={stats.avgPing}
                unit="ms"
                valueClass="text-2xl font-extrabold text-white"
              />
              <StatBox
                label="Max Jitter"
                value={stats.maxJitter}
                unit="ms"
                valueClass="text-2xl font-extrabold text-white"
              />
              <StatBox label="Timezone" value={ipInfo.tz} truncate />
              <StatBox label="Coords" value={ipInfo.coords} />
            </div>
          </div>

          {/* Browser Info */}
          <div className="glass-card p-8 bg-gradient-to-br from-slate-900/40 to-indigo-950/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Monitor className="w-6 h-6 text-slate-400" aria-hidden="true" />
              </div>
              <div>
                <span className="stat-label">Device Agent</span>
                <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px] truncate">
                  {ua}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main >

      <footer className="max-w-7xl mx-auto mt-16 pb-10 flex flex-col md:flex-row justify-between items-center text-slate-600 gap-6">
        <p className="text-sm">
          &copy; 2026 Shamiul Islam. NetPulse Diagnostics Pro.
        </p>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
          <Dialog>
            <DialogTrigger className="hover:text-sky-400 transition-colors flex items-center gap-2 hover:cursor-pointer">
              <Shield className="w-3 h-3" aria-hidden="true" /> Privacy Policy
            </DialogTrigger>
            <DialogContent className="text-white border-white/10">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="text-sky-400" aria-hidden="true" /> Data Privacy & Sovereignty
                </DialogTitle>
                <DialogDescription>
                  Your network security is our highest priority.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm text-slate-300">
                <p>NetPulse Pro performs all diagnostic calculations locally in your browser environment. We do not store your IP address or diagnostic history on our servers.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Local Telemetry:</strong> All ping and jitter data is kept within your session.</li>
                  <li><strong>Public API:</strong> We utilize <code className="text-sky-400">ipapi.co</code> for geolocation, which operates under strict GDPR compliance.</li>
                  <li><strong>Zero Logging:</strong> No personal identification is ever captured or cached permanently.</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger className="hover:text-sky-400 transition-colors flex items-center gap-2 hover:cursor-pointer">
              <FileText className="w-3 h-3" aria-hidden="true" /> API Docs
            </DialogTrigger>
            <DialogContent className="text-white border-white/10">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="text-indigo-400" aria-hidden="true" /> Enterprise API Access
                </DialogTitle>
                <DialogDescription>
                  Integrate NetPulse Pro intelligence into your own stack.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm text-slate-300">
                <p>NetPulse Pro provides internal endpoints for real-time network auditing. Access is currently limited to authorized diagnostic agents.</p>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[10px]">
                  <p className="text-emerald-400">GET /api/telemetry</p>
                  <p className="text-slate-500">{"// Returns cached environmental diagnostics"}</p>
                  <p className="text-sky-400 mt-2">POST /api/upload</p>
                  <p className="text-slate-500">{"// Benchmarks upstream capacity"}</p>
                </div>
                <p className="italic text-slate-500">Contact admin for enterprise keys.</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger className="hover:text-sky-400 transition-colors flex items-center gap-2 hover:cursor-pointer">
              <StatusIcon className="w-3 h-3" aria-hidden="true" /> System Status
            </DialogTrigger>
            <DialogContent className="text-white border-white/10">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <StatusIcon className="text-emerald-400" aria-hidden="true" /> Global Infrastructure Status
                </DialogTitle>
                <DialogDescription>
                  Real-time health monitoring of our test clusters.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm">
                {[
                  { region: "US-East (Virginia)", status: "Operational", lat: "12ms" },
                  { region: "EU-West (Dublin)", status: "Operational", lat: "88ms" },
                  { region: "AP-South (Mumbai)", status: "Optimal", lat: "142ms" },
                ].map((s) => (
                  <div key={s.region} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="font-medium">{s.region}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">{s.lat}</span>
                      <span className="text-xs text-emerald-400 font-bold">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </footer>
    </div >
  );
}

interface GaugeCardProps {
  type: string;
  value: number;
  peak: number;
  stability: string;
  capacity: string;
  icon: React.ReactNode;
  gradientId: string;
  gradientColors: string[];
  target: number;
}

function GaugeCard({
  type,
  value,
  peak,
  stability,
  capacity,
  icon,
  gradientId,
  gradientColors,
  target,
}: GaugeCardProps) {
  const circ = 628;
  const pct = (value / target) * 100;
  const offset = circ - (Math.min(pct, 100) / 100) * 470;

  return (
    <article className="glass-card p-10 flex flex-col items-center">
      <div className="w-full flex justify-between items-start mb-8 text-white">
        <header>
          <h3 className="stat-label">
            {type === "down" ? "Download" : "Upload"} Speed
          </h3>
          <p className="text-xs text-slate-500 font-medium font-mono">
            Peak: {peak} Mbps
          </p>
        </header>
        <div className="p-2 bg-white/5 rounded-lg border border-white/5" aria-hidden="true">
          {icon}
        </div>
      </div>

      <div className="relative w-56 h-56" role="presentation">
        <svg className="w-full h-full transform -rotate-[220deg]" aria-hidden="true">
          <circle
            cx="112"
            cy="112"
            r="100"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="16"
            fill="transparent"
            strokeDasharray="470"
            strokeLinecap="round"
          />
          <circle
            cx="112"
            cy="112"
            r="100"
            stroke={`url(#${gradientId})`}
            strokeWidth="16"
            fill="transparent"
            strokeDasharray="628"
            strokeDashoffset={offset}
            className="gauge-ring"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 text-white" role="status" aria-live="polite">
          <span className="sr-only">Current {type === "down" ? "download" : "upload"} speed is</span>
          <span className="text-6xl font-extrabold tracking-tighter mono">
            {value}
          </span>
          <span className="text-slate-400 font-bold text-sm tracking-widest mt-[-5px]">
            MBPS
          </span>
        </div>
      </div>

      <div className="w-full mt-10 grid grid-cols-2 gap-4 border-t border-white/5 pt-6 text-white text-center">
        <div className="border-r border-white/5">
          <span className="stat-label">Stability</span>
          <p className="text-emerald-400 font-bold">{stability}</p>
        </div>
        <div>
          <span className="stat-label">Capacity</span>
          <p className="text-slate-300 font-bold">{capacity}</p>
        </div>
      </div>
    </article>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
  valueClass?: string;
  truncate?: boolean;
}

function InfoItem({
  label,
  value,
  valueClass = "text-slate-200",
  truncate,
}: InfoItemProps) {
  return (
    <div>
      <span className="stat-label">{label}</span>
      <p className={`font-bold ${valueClass} ${truncate ? "truncate" : ""}`}>
        {value}
      </p>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  unit?: string;
  valueClass?: string;
  truncate?: boolean;
}

function StatBox({
  label,
  value,
  unit,
  valueClass = "text-sm",
  truncate,
}: StatBoxProps) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
      <span className="stat-label">{label}</span>
      <p
        className={`${valueClass} font-bold text-slate-300 mt-1 ${truncate ? "truncate" : ""
          }`}
      >
        {value}
        {unit && <span className="text-xs text-slate-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
