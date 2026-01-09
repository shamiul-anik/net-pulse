"use server";
import { cacheLife } from "next/dist/server/use-cache/cache-life";

export async function getNetworkIntelligence() {
  "use cache";
  cacheLife("minutes");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch("https://ipapi.co/json/", {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("API Limit/Error");

    const data = await res.json();
    return {
      ip: data.ip,
      asn: data.asn || "AS8075",
      city: `${data.city}, ${data.country_code}`,
      isp: data.org,
      tz: data.timezone,
      coords: `${data.latitude}, ${data.longitude}`,
    };
  } catch (error) {
    console.error("Intelligence Fetch Error:", error);
    return {
      ip: "192.168.1.1",
      asn: "--",
      city: "Unknown",
      isp: "Local Gateway",
      tz: "--",
      coords: "--",
    };
  }
}
