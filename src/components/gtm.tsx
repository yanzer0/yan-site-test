"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Container server-side servido pelo proprio dominio (api.useinfuser.com),
// nao pelo googletagmanager.com. A chave abaixo e o parametro do loader.
// Montado no layout RAIZ: o container decide por trigger em que rota cada tag
// dispara, entao ele precisa carregar no site inteiro pra essa regra existir.
const GTM_LOADER_KEY =
  "7=CgtSLDw5X0EwOTcoUUFEUhVSXUVZUhYaXhocDgEaFAEQCh1FCxsf";

export function Gtm() {
  const pathname = usePathname();
  if (pathname === "/kit-vscode") {
    return <Script id="infuser-central-consent" src="/guias/marketing.js?v=20261028-1" strategy="afterInteractive" />;
  }
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){
          if(w.__infuserGtmLoaded || d.getElementById('infuser-gtm')) return;
          w.__infuserGtmLoaded=true;
          w[l]=w[l]||[];
          w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
          j.async=true;
          j.id='infuser-gtm';
          j.src="https://api.useinfuser.com/etrthkooc.js?"+i;
          f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_LOADER_KEY}');
      `}
    </Script>
  );
}
