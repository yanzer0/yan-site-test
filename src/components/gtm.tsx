"use client";

import Script from "next/script";

// Container server-side servido pelo proprio dominio (api.useinfuser.com),
// nao pelo googletagmanager.com. A chave abaixo e o parametro do loader.
// Montado no layout RAIZ: o container decide por trigger em que rota cada tag
// dispara, entao ele precisa carregar no site inteiro pra essa regra existir.
const GTM_LOADER_KEY =
  "7=CgtSLDw5X0EwOTcoUUFEUhVSXUVZUhYaXhocDgEaFAEQCh1FCxsf";

export function Gtm() {
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){
          w[l]=w[l]||[];
          w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
          j.async=true;
          j.src="https://api.useinfuser.com/etrthkooc.js?"+i;
          f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_LOADER_KEY}');
      `}
    </Script>
  );
}
