"use client";

import Script from "next/script";

const PIXEL_ID = "6a579a3f20eaa1fb7c33fa58";

export function SegundoCerebroUtmifyPixel() {
  return (
    <>
      <Script id="segundo-cerebro-utmify-pixel" strategy="afterInteractive">
        {`
          window.pixelId = "${PIXEL_ID}";
          var a = document.createElement("script");
          a.setAttribute("async", "");
          a.setAttribute("defer", "");
          a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
          document.head.appendChild(a);
        `}
      </Script>
      <Script
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        data-utmify-prevent-xcod-sck=""
        data-utmify-prevent-subids=""
        strategy="afterInteractive"
      />
    </>
  );
}
