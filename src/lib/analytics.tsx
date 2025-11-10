"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Extend the Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: "config" | "event",
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

const Analytics: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      const utmParams: Record<string, string> = {};

      // Extract UTM parameters from search params
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((param) => {
        const value = searchParams.get(param);
        if (value) {
          utmParams[param] = value;
        }
      });

      // Send page view with UTM parameters
      window.gtag("config", "G-BMXWP592W0", {
        page_path: pathname,
        ...utmParams, // Include UTM parameters if available
      });
    }
  }, [pathname, searchParams]);

  return null;
};

export default Analytics;
