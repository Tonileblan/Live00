// Vercel Serverless Function: Acumbamail Subscription & Welcome Email
export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, alias, list_id } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Email válido requerido' });
  }

  const token = process.env.ACUMBAMAIL_TOKEN || '5102f52223ac45918c8959d4c2921038';
  const targetListId = String(list_id || process.env.ACUMBAMAIL_LIST_ID || '1127337');
  const subscriberName = typeof alias === 'string' && alias.trim() ? alias.trim() : 'Usuario Sobrio';

  try {
    const postParams = new URLSearchParams({
      auth_token: token,
      list_id: targetListId,
      'merge_fields[email]': email.trim().toLowerCase(),
      'merge_fields[nombre]': subscriberName,
      welcome_email: '1',
      update_subscriber: '1',
      double_optin: '0',
    });

    const response = await fetch('https://acumbamail.com/api/1/addSubscriber/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postParams.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Acumbamail API Error:', data);
      return res.status(response.status).json({
        error: 'Error al contactar Acumbamail',
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario suscrito y email de bienvenida/confirmación disparado vía Acumbamail',
      data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno al procesar suscripción';
    console.error('Error en handler de Acumbamail:', msg);
    return res.status(500).json({ error: msg });
  }
}
