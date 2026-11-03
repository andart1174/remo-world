// Netlify Serverless Function: send-email-otp
// Dispatches real 6-digit confirmation codes to user emails (Yahoo, Gmail, Outlook, etc.)
// Supports Resend, Brevo (Sendinblue), or direct REST email providers

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, name = 'Citizen', code, lang = 'en' } = body;
  if (!email || !code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or code' }) };
  }

  const subject = lang === 'fr'
    ? `🔐 Code de confirmation REMO : ${code}`
    : `🔐 Your REMO World Confirmation Code: ${code}`;

  const htmlContent = lang === 'fr' ? `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#050816;color:#ffffff;padding:28px;border-radius:18px;border:1px solid #38bdf8;">
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="font-size:24px;color:#fbbf24;margin:0;">REMO World</h1>
        <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">Le Réseau Social 4D des Villes du Monde</p>
      </div>
      <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;">
        <p style="font-size:15px;color:#cbd5e1;margin:0 0 16px;">Bonjour <b>${name}</b>, voici votre code de vérification pour activer votre Passeport Citoyen :</p>
        <div style="display:inline-block;letter-spacing:6px;font-size:32px;font-weight:900;color:#fbbf24;background:#0f172a;padding:12px 28px;border-radius:12px;border:1px solid #fbbf24;">
          ${code}
        </div>
        <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;">Ce code expire dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
      <p style="text-align:center;font-size:11px;color:#64748b;margin-top:20px;">&copy; 2026 REMO World — remoworld.com</p>
    </div>
  ` : `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#050816;color:#ffffff;padding:28px;border-radius:18px;border:1px solid #38bdf8;">
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="font-size:24px;color:#fbbf24;margin:0;">REMO World</h1>
        <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">The 4D World Cities Social Network</p>
      </div>
      <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;">
        <p style="font-size:15px;color:#cbd5e1;margin:0 0 16px;">Hello <b>${name}</b>, here is your 6-digit confirmation code to activate your Citizen Passport:</p>
        <div style="display:inline-block;letter-spacing:6px;font-size:32px;font-weight:900;color:#fbbf24;background:#0f172a;padding:12px 28px;border-radius:12px;border:1px solid #fbbf24;">
          ${code}
        </div>
        <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
      <p style="text-align:center;font-size:11px;color:#64748b;margin-top:20px;">&copy; 2026 REMO World — remoworld.com</p>
    </div>
  `;

  // 1. Resend API support (if RESEND_API_KEY is configured in Netlify environment)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || 'REMO World <verify@remoworld.com>',
          to: [email],
          subject: subject,
          html: htmlContent
        })
      });
      const data = await response.json();
      return { statusCode: 200, body: JSON.stringify({ success: true, provider: 'resend', id: data.id }) };
    } catch (err) {
      console.error('Resend dispatch error:', err);
    }
  }

  // 2. Brevo / Sendinblue API support (if BREVO_API_KEY is configured)
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'REMO World', email: process.env.MAIL_FROM_EMAIL || 'no-reply@remoworld.com' },
          to: [{ email: email, name: name }],
          subject: subject,
          htmlContent: htmlContent
        })
      });
      const data = await response.json();
      return { statusCode: 200, body: JSON.stringify({ success: true, provider: 'brevo', data }) };
    } catch (err) {
      console.error('Brevo dispatch error:', err);
    }
  }

  // No API key configured yet in Netlify
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: false,
      reason: 'no_mail_api_key_configured',
      message: 'Configure RESEND_API_KEY or BREVO_API_KEY in Netlify dashboard to deliver automated OTP emails.'
    })
  };
};
