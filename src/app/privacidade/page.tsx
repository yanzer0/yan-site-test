import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Infuser",
  description:
    "Como a Infuser coleta, usa e protege dados pessoais nos serviços de automação e atendimento via WhatsApp e Instagram, em conformidade com a LGPD.",
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
.legal-doc h3{ font-size:16px; margin:24px 0 8px; }
.legal-doc p, .legal-doc li{ color:var(--text); }
.legal-doc a{ color:var(--accent); }
.legal-doc ul{ padding-left:22px; }
.legal-doc li{ margin:6px 0; }
.legal-doc .box{ background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:18px 22px; margin:24px 0; }
.legal-doc .muted{ color:var(--muted); }
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
    <h1>Política de Privacidade</h1>
    <div class="meta">Última atualização: 28 de outubro de 2026</div>
  </header>

  <p>Esta Política de Privacidade descreve como a <strong>Infuser Tecnologia e Serviços Digitais Ltda.</strong>, inscrita no CNPJ sob o nº 66.396.412/0001-09, com sede na Av. Raimundo Pereira de Magalhães, 1720, APT 14, Jardim Íris, São Paulo/SP, CEP 05145-901 ("Infuser", "nós"), coleta, utiliza, armazena e protege dados pessoais no âmbito dos seus serviços de automação e atendimento por meio de canais de mensagem, incluindo WhatsApp e Instagram.</p>

  <p>Tratamos dados em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — "LGPD"). Ao utilizar nossos serviços ou nos contratar, você declara estar ciente desta Política.</p>

  <h2>1. Definições</h2>
  <ul>
    <li><strong>Cliente:</strong> a empresa ou profissional que contrata os serviços da Infuser.</li>
    <li><strong>Usuário final:</strong> a pessoa que interage com o Cliente por meio dos canais de mensagem operados com o apoio da Infuser (por exemplo, um lead ou consumidor que envia mensagem no WhatsApp do Cliente).</li>
    <li><strong>Dados pessoais:</strong> qualquer informação relacionada a pessoa natural identificada ou identificável.</li>
    <li><strong>Controlador / Operador:</strong> conforme definidos na LGPD.</li>
  </ul>

  <h2>2. Papéis no tratamento de dados</h2>
  <p>Em relação aos dados dos <strong>Usuários finais</strong> que trafegam pelos canais de mensagem do Cliente, o <strong>Cliente atua como Controlador</strong> e a <strong>Infuser atua como Operadora</strong>, tratando esses dados exclusivamente para prestar o serviço contratado, seguindo as instruções do Cliente.</p>
  <p>Em relação aos dados dos próprios <strong>Clientes</strong> (cadastro, contato, faturamento) e dos visitantes do site <a href="https://useinfuser.com">useinfuser.com</a>, a <strong>Infuser atua como Controladora</strong>.</p>

  <h2>3. Dados que coletamos</h2>
  <h3>3.1. Dados de Clientes</h3>
  <ul>
    <li>Dados de identificação e contato: nome, e-mail, telefone, empresa, CNPJ.</li>
    <li>Dados de autenticação e integração necessários para conectar os canais de mensagem (por exemplo, identificadores de conta comercial fornecidos pelo próprio Cliente durante a conexão).</li>
    <li>Dados de uso do serviço e de faturamento.</li>
  </ul>
  <h3>3.2. Dados de Usuários finais</h3>
  <ul>
    <li>Nome de exibição e número/identificador de contato do canal utilizado.</li>
    <li>Conteúdo das mensagens trocadas com o Cliente e respectivos metadados (data, hora, status de entrega).</li>
  </ul>
  <h3>3.3. Dados de navegação</h3>
  <ul>
    <li>Informações técnicas de acesso ao site (endereço IP, navegador, páginas visitadas), quando aplicável.</li>
  </ul>

  <h3>3.4. Cadastro e preferências dos guias gratuitos</h3>
  <p>Para liberar os guias, coletamos nome, e-mail, WhatsApp, nicho de atuação, interesse em IA e o impedimento relatado, além do material de entrada, origem e horário do cadastro. Essas respostas ficam disponíveis à equipe autorizada da Infuser.</p>
  <p>Você pode, separadamente e de forma opcional, autorizar contato comercial por e-mail/WhatsApp e autorizar publicidade, medição e públicos personalizados ou semelhantes na Meta. As duas opções aparecem selecionadas no cadastro, mas os usos opcionais de marketing só são autorizados após você confirmar os valores exibidos em <strong>Confirmar escolhas e acessar</strong>. Você pode desmarcar qualquer opção ou escolher <strong>Continuar sem marketing</strong> e ainda acessar os guias. Na página de preferências, mostramos as escolhas efetivamente salvas.</p>
  <p>Com autorização para publicidade, podemos registrar campanhas (UTM e identificadores de cliques), cookies específicos, navegador/dispositivo, idioma, fuso horário, tela/janela e IP público. Enviamos o IP à GeoJS (<a href="https://www.geojs.io/privacy/">política do provedor</a>) para estimar país, região e cidade. A localização é aproximada e pode estar indisponível ou incorreta; não solicitamos GPS nem criamos impressão digital do dispositivo.</p>
  <p>O Google Tag Manager organiza as tags autorizadas, incluindo serviços da Meta, Google Analytics, Microsoft Clarity e UTMify. Nos guias, essas tags só são carregadas com publicidade autorizada. Os provedores podem processar dados fora do Brasil conforme suas políticas. Identificadores de contato e localização disponíveis podem compor públicos da Meta; as respostas sobre nicho, interesse e impedimento não entram nessa exportação.</p>
  <p>Guardamos escolhas, versão do aviso, origem e horários do servidor. Altere ou revogue em <a href="/guias/preferencias">Preferências dos guias</a>. Revogar impede futuras cargas de publicidade nos guias e novas exportações da finalidade desmarcada, e remove enriquecimentos de publicidade da base corrente. Isso não desfaz tratamentos já realizados por terceiros. Para exclusão ou outros direitos: contato@useinfuser.com.</p>

  <h2>4. Finalidades e bases legais</h2>
  <p>Tratamos dados pessoais para as seguintes finalidades, amparadas nas bases legais da LGPD:</p>
  <ul>
    <li><strong>Prestação do serviço contratado</strong> (execução de contrato, art. 7º, V) — operar o atendimento e a automação de mensagens em nome do Cliente.</li>
    <li><strong>Comunicação com o Cliente e suporte</strong> (execução de contrato / legítimo interesse, art. 7º, V e IX).</li>
    <li><strong>Cumprimento de obrigações legais e regulatórias</strong> (art. 7º, II).</li>
    <li><strong>Segurança, prevenção a fraudes e melhoria dos serviços</strong> (legítimo interesse, art. 7º, IX).</li>
  </ul>
  <p>Não utilizamos o conteúdo das mensagens dos Usuários finais para finalidades próprias de marketing da Infuser, nem os vendemos a terceiros.</p>

  <h2>5. Integração com a Meta (WhatsApp e Instagram)</h2>
  <p>Nossos serviços utilizam as APIs oficiais da Meta Platforms, Inc. (WhatsApp Business Platform e Instagram Platform). O tráfego das mensagens é processado pela infraestrutura da Meta, sujeita às políticas de privacidade da própria Meta. Utilizamos essas integrações estritamente para viabilizar a comunicação entre o Cliente e seus Usuários finais e respeitamos as políticas de plataforma aplicáveis.</p>

  <h2>6. Compartilhamento de dados</h2>
  <p>Podemos compartilhar dados pessoais apenas quando necessário e nos limites da finalidade, com:</p>
  <ul>
    <li>A Meta e provedores de infraestrutura de mensagem e nuvem, para operar o serviço;</li>
    <li>O próprio Cliente, que é o Controlador dos dados dos seus Usuários finais;</li>
    <li>Autoridades públicas, quando exigido por lei ou ordem judicial.</li>
  </ul>
  <p>Não comercializamos dados pessoais.</p>

  <h2>7. Transferência internacional</h2>
  <p>Parte da infraestrutura utilizada (incluindo serviços da Meta) pode processar dados fora do Brasil. Nesses casos, adotamos as salvaguardas exigidas pela LGPD para transferência internacional.</p>

  <h2>8. Retenção e eliminação</h2>
  <p>Mantemos os dados pessoais apenas pelo tempo necessário às finalidades descritas ou conforme exigido por lei. Encerrada a relação com o Cliente, os dados são eliminados ou anonimizados, salvo hipóteses de guarda obrigatória.</p>

  <h2>9. Segurança</h2>
  <p>Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra acessos não autorizados, perda, alteração ou divulgação indevida, incluindo controle de acesso, criptografia de credenciais sensíveis e registro de operações.</p>

  <h2>10. Direitos do titular</h2>
  <p>Nos termos do art. 18 da LGPD, o titular pode solicitar: confirmação da existência de tratamento; acesso aos dados; correção; anonimização, bloqueio ou eliminação; portabilidade; informação sobre compartilhamento; e revogação do consentimento. Solicitações relativas a dados de Usuários finais devem ser dirigidas primeiro ao Cliente (Controlador); a Infuser prestará apoio quando cabível.</p>

  <h2>11. Cookies</h2>
  <p>O site <a href="https://useinfuser.com">useinfuser.com</a> pode utilizar cookies estritamente necessários e de análise. Você pode gerenciar cookies nas configurações do seu navegador.</p>

  <h2>12. Crianças e adolescentes</h2>
  <p>Nossos serviços são destinados a empresas e profissionais. Não coletamos intencionalmente dados de crianças e adolescentes sem o devido amparo legal.</p>

  <h2>13. Alterações desta Política</h2>
  <p>Podemos atualizar esta Política periodicamente. A data da última atualização é indicada no topo. Recomendamos a revisão regular deste documento.</p>

  <h2>14. Encarregado e contato</h2>
  <div class="box">
    <p style="margin:0">Para exercer seus direitos ou tirar dúvidas sobre esta Política, entre em contato pelo e-mail:<br>
    <strong>contato@useinfuser.com</strong></p>
  </div>

  <footer>
    Infuser Tecnologia e Serviços Digitais Ltda. — CNPJ 66.396.412/0001-09 — São Paulo/SP.<br>
    Informações sobre o tratamento de dados pessoais pela Infuser.
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
