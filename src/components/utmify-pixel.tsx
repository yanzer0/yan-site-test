"use client";

import Script from "next/script";

// Trocado em 11/08/2026. Anterior: 6a036970f37fd8abe31a65ab.
// Um pixel por vez — dois setam window.pixelId em corrida e duplicam evento.
const PIXEL_ID = "6a7b5b1fa84af65f86f23fc3";

export function UtmifyPixel() {
  return (
    <>
      <Script id="utmify-pixel" strategy="afterInteractive">
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
