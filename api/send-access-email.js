// Vercel Serverless Function — envia o e-mail de boas-vindas com o link do app e a chave de acesso.
// Configuração necessária (Vercel > Settings > Environment Variables):
//   RESEND_API_KEY   -> sua chave da https://resend.com (grátis para começar)
//   FROM_EMAIL       -> remetente, ex: "Pequenos da Fé Kids <contato@seudominio.com>"
//
// Este arquivo deve ficar em /api/send-access-email.js na raiz do seu projeto Vercel.

const APP_URL = "https://pequenos-da-fe-kids.vercel.app/";
const ACCESS_CODE = "654321-3"; // troque pelo código fixo que você está usando nas vendas

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const { email, name } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "E-mail inválido" });
    return;
  }

  const saudacao = name ? `Olá, ${name}! 👋` : "Olá! 👋";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#eaf8ff;padding:24px">
      <div style="background:#fff;border-radius:24px;padding:32px 28px;text-align:center">
        <div style="width:64px;height:64px;margin:0 auto 12px;border-radius:20px;background:#ffb82d;display:flex;align-items:center;justify-content:center;font-size:34px;line-height:64px">🦁</div>
        <h1 style="color:#6737d8;font-size:22px;margin:8px 0">${saudacao}</h1>
        <p style="color:#39266f;font-weight:bold;font-size:15px">Muito obrigado por adquirir o Pequenos da Fé Kids 💜</p>
        <a href="${APP_URL}" style="display:inline-block;margin-top:20px;background:#ffb82d;color:#5a3a00;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:999px">🔗 Acessar o aplicativo</a>
        <div style="margin-top:24px;background:#6737d8;border-radius:16px;padding:18px;color:#fff">
          <div style="font-size:11px;font-weight:bold;letter-spacing:.5px;opacity:.85">🔑 CHAVE DE ACESSO</div>
          <div style="font-size:24px;font-weight:bold;margin-top:6px">${ACCESS_CODE}</div>
        </div>
        <p style="color:#6b6394;font-size:12.5px;margin-top:20px;line-height:1.6">
          Guarde este e-mail — ele é seu comprovante e sua chave de acesso permanente.
          Qualquer dúvida, é só responder este e-mail.
        </p>
      </div>
    </div>
  `;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "Pequenos da Fé Kids <onboarding@resend.dev>",
        to: [email],
        subject: "🦁 Seu acesso ao Pequenos da Fé Kids chegou!",
        html,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      res.status(502).json({ error: "Falha ao enviar e-mail", details: errText });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Erro interno", details: String(err) });
  }
};
