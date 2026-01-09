"use cache";

import { cacheLife } from "next/dist/server/use-cache/cache-life";

export async function getNetworkIntelligence() {
  cacheLife("minutes");

  try {
    const res = await fetch("https://ipapi.co/json/", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return {
      ip: data.ip,
      asn: data.asn || "AS8075",
      city: `${data.city}, ${data.country_code}`,
      isp: data.org,
      tz: data.timezone,
      coords: `${data.latitude}, ${data.longitude}`,
    };
  } catch {
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
