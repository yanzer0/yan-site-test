"use client";

import Script from "next/script";

const PIXEL_ID = "6a036970f37fd8abe31a65ab";

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
