import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — Infuser",
  description:
    "Termos de Uso dos serviços de automação e atendimento da Infuser via WhatsApp e Instagram (APIs oficiais da Meta).",
};

const STYLE = `
.legal-doc{ --bg:#121210; --surface:#171717; --text:#F0F0E4; --muted:#9A9C90; --line:#2A2A26; --accent:#C6FF34;
  background:var(--bg); color:var(--text); min-height:100vh;
  font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  line-height:1.65; font-size:16px; }
.legal-doc *{ box-sizing:border-box; }
.legal-doc .wrap{ max-width:820px; margin:0 auto; padding:56px 24px 96px; }
.legal-doc header{ border-bottom:1px solid var(--line); padding-bottom:24px; margin-bottom:40px; }
.legal-doc .brand{ font-weight:700; letter-spacing:-0.01em; font-size:15px; color:var(--accent); }
.legal-doc h1{ font-size:30px; line-height:1.2; letter-spacing:-0.02em; margin:14px 0 6px; }
.legal-doc .meta{ color:var(--muted); font-size:14px; }
.legal-doc h2{ font-size:20px; letter-spacing:-0.01em; margin:44px 0 12px; }
.legal-doc p, .legal-doc li{ color:var(--text); }
.legal-doc a{ color:var(--accent); }
.legal-doc ul{ padding-left:22px; }
.legal-doc li{ margin:6px 0; }
.legal-doc .box{ background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:18px 22px; margin:24px 0; }
.legal-doc strong{ color:#fff; }
.legal-doc footer{ border-top:1px solid var(--line); margin-top:56px; padding-top:24px; color:var(--muted); font-size:13px; }
@media (prefers-color-scheme: light){
  .legal-doc{ --bg:#FBFBF9; --surface:#F2F3EE; --text:#1A1B17; --muted:#5C5F55; --line:#E2E3DC; --accent:#5B7A1E; }
  .legal-doc strong{ color:#000; }
}`;

const BODY = `
<div class="wrap">
  <header>
    <div class="brand">Infuser</div>
    <h1>Termos de Uso</h1>
    <div class="meta">Última atualização: 22 de julho de 2026</div>
  </header>

  <p>Estes Termos de Uso ("Termos") regem o acesso e a utilização dos serviços prestados pela <strong>Infuser Tecnologia e Serviços Digitais Ltda.</strong>, inscrita no CNPJ sob o nº 66.396.412/0001-09, com sede na Av. Raimundo Pereira de Magalhães, 1720, APT 14, Jardim Íris, São Paulo/SP, CEP 05145-901 ("Infuser", "nós"). Ao contratar ou utilizar nossos serviços, você ("Cliente") declara ter lido, compreendido e aceitado estes Termos.</p>

  <h2>1. Objeto</h2>
  <p>A Infuser oferece serviços de automação, integração e atendimento por meio de canais de mensagem, incluindo WhatsApp e Instagram, utilizando as APIs oficiais da Meta Platforms, Inc., bem como serviços correlatos de tecnologia e inteligência artificial.</p>

  <h2>2. Definições</h2>
  <ul>
    <li><strong>Serviço:</strong> as funcionalidades de automação, integração e atendimento disponibilizadas pela Infuser.</li>
    <li><strong>Cliente:</strong> a empresa ou profissional que contrata o Serviço.</li>
    <li><strong>Usuário final:</strong> a pessoa que interage com o Cliente pelos canais operados com apoio da Infuser.</li>
  </ul>

  <h2>3. Aceitação e alterações</h2>
  <p>O uso do Serviço implica a aceitação integral destes Termos. Podemos atualizá-los periodicamente; a versão vigente será sempre identificada pela data no topo. O uso continuado após alterações representa concordância com a versão atualizada.</p>

  <h2>4. Cadastro e conta</h2>
  <p>O Cliente é responsável pela veracidade das informações fornecidas e pela guarda de suas credenciais de acesso. É vedado o compartilhamento de credenciais com terceiros não autorizados.</p>

  <h2>5. Uso aceitável</h2>
  <p>O Cliente compromete-se a utilizar o Serviço de forma lícita e a não:</p>
  <ul>
    <li>Enviar mensagens não solicitadas em massa (spam), conteúdo enganoso, ofensivo, discriminatório ou ilícito;</li>
    <li>Violar direitos de terceiros, incluindo privacidade e propriedade intelectual;</li>
    <li>Utilizar o Serviço para finalidades que descumpram a legislação aplicável ou as políticas da Meta;</li>
    <li>Tentar burlar limites técnicos, de segurança ou de uso da plataforma.</li>
  </ul>

  <h2>6. Conformidade com as políticas da Meta</h2>
  <p>O Serviço opera sobre a WhatsApp Business Platform e a Instagram Platform. O Cliente reconhece e concorda em cumprir integralmente as políticas, termos e diretrizes da Meta aplicáveis a esses canais, incluindo regras de mensagens comerciais e de conteúdo. O descumprimento dessas políticas pode resultar em restrições impostas pela Meta, alheias ao controle da Infuser.</p>

  <h2>7. Responsabilidades sobre dados</h2>
  <p>No tratamento dos dados dos Usuários finais, o Cliente atua como Controlador e a Infuser como Operadora, nos termos da nossa <a href="https://useinfuser.com/privacidade">Política de Privacidade</a> e da Lei nº 13.709/2018 (LGPD). O Cliente é responsável por possuir base legal adequada para as comunicações que realiza com seus Usuários finais.</p>

  <h2>8. Propriedade intelectual</h2>
  <p>Todo o software, marca, layout, documentação e demais elementos do Serviço são de titularidade da Infuser ou de seus licenciadores, sendo vedada a reprodução ou uso não autorizado. O Cliente mantém a titularidade sobre os seus próprios conteúdos e dados.</p>

  <h2>9. Pagamentos</h2>
  <p>As condições comerciais, valores e formas de pagamento são definidos em proposta ou contrato específico celebrado entre as partes. Custos cobrados por terceiros (por exemplo, tarifas de mensagem da Meta) podem ser repassados conforme acordado.</p>

  <h2>10. Isenções e limitação de responsabilidade</h2>
  <p>O Serviço é fornecido "no estado em que se encontra". A Infuser empenha-se em manter a disponibilidade e a segurança, mas não garante funcionamento ininterrupto, especialmente quanto a fatores fora de seu controle, incluindo indisponibilidades, mudanças de política ou restrições impostas pela Meta. Na máxima extensão permitida pela lei, a responsabilidade da Infuser limita-se aos danos diretos comprovados.</p>

  <h2>11. Suspensão e rescisão</h2>
  <p>Podemos suspender ou encerrar o acesso ao Serviço em caso de violação destes Termos, das políticas da Meta ou da legislação aplicável. Qualquer das partes pode encerrar a relação conforme previsto no contrato específico.</p>

  <h2>12. Lei aplicável e foro</h2>
  <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.</p>

  <h2>13. Contato</h2>
  <div class="box">
    <p style="margin:0">Dúvidas sobre estes Termos:<br>
    <strong>contato@useinfuser.com</strong></p>
  </div>

  <footer>
    Infuser Tecnologia e Serviços Digitais Ltda. — CNPJ 66.396.412/0001-09 — São Paulo/SP.
  </footer>
</div>`;

export default function Page() {
  return (
    <div
      className="legal-doc"
      dangerouslySetInnerHTML={{ __html: `<style>${STYLE}</style>${BODY}` }}
    />
  );
}
