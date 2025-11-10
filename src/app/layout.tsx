import type { Metadata } from "next";
import './globals.css';
import { cn } from "@/lib/utils";
import { Roboto as FontSans } from "next/font/google";
import Script from "next/script";

// Load Roboto font with multiple weights
const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Awajahi - Moving India One Mile at a Time",
  description: "Awajahi is transforming transportation in India, one mile at a time. Discover our services and how we are moving India efficiently and reliably.",
  keywords: ["Awajahi", "Transport", "Logistics", "India", "Moving Services", "Web Application", "Fleet Management", "awajahi"],
  authors: [{ name: "Awajahi Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Awajahi - Moving India One Mile at a Time",
    description: "Explore Awajahi for reliable and efficient transportation services across India.",
    url: "https://www.awajahi.com",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://www.awajahi.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fawajahi%20logo.e4977a4d.png&w=64&q=75",
        width: 1200,
        height: 630,
        alt: "Awajahi Logo",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add Google Analytics Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-BMXWP592W0`} // Replace with your Measurement ID
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Function to capture UTM parameters
            function getUTMParams() {
              const urlParams = new URLSearchParams(window.location.search);
              return {
                utm_source: urlParams.get('utm_source') || '(direct)',
                utm_medium: urlParams.get('utm_medium') || '(none)',
                utm_campaign: urlParams.get('utm_campaign') || '',
                utm_content: urlParams.get('utm_content') || '',
                utm_term: urlParams.get('utm_term') || '',
              };
            }

            // Set up Google Analytics with UTM parameters
            gtag('js', new Date());

            // Get the UTM parameters and include them in the gtag config
            const utmParams = getUTMParams();
            gtag('config', 'G-BMXWP592W0', {
              page_path: window.location.pathname,
              ...utmParams
            });
          `}
        </Script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-roboto antialiased",
          fontSans.variable
        )}
      >
        {children}
        
      </body>
    </html>
  );
}
