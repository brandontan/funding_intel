import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const ALERT_DEFAULT_EMAIL = process.env.ALERT_DEFAULT_EMAIL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_DEFAULT_CHAT_ID = process.env.TELEGRAM_DEFAULT_CHAT_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function formatAlertMessage(alert, opportunity) {
  const rate = (opportunity.current_funding_rate * 100).toFixed(3);
  const net = (opportunity.net_rate_after_fees * 100).toFixed(3);
  const pair = opportunity.pair;
  const exchange = opportunity.exchange;
  return `Funding Alert:
${pair} on ${exchange} is paying ${rate}% (net ${net}%).
Threshold: ${(alert.threshold_rate * 100).toFixed(3)}%
Updated at: ${new Date(opportunity.updated_at).toLocaleString()}`;
}

async function sendEmail(message) {
  if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL || !ALERT_DEFAULT_EMAIL) {
    console.info('Email alert stubbed (missing SendGrid env vars). Message:', message);
    return { status: 'stubbed-email' };
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: ALERT_DEFAULT_EMAIL }] }],
      from: { email: SENDGRID_FROM_EMAIL, name: 'Funding Intelligence' },
      subject: 'Funding alert triggered',
      content: [{ type: 'text/plain', value: message }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid failure: ${response.status} ${body}`);
  }

  return { status: 'sent', provider: 'sendgrid' };
}

async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_DEFAULT_CHAT_ID) {
    console.info('Telegram alert stubbed (missing Telegram env vars). Message:', message);
    return { status: 'stubbed-telegram' };
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_DEFAULT_CHAT_ID,
      text: message,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram failure: ${response.status} ${body}`);
  }

  return { status: 'sent', provider: 'telegram' };
}

async function dispatchAlert(alert, opportunity) {
  const message = formatAlertMessage(alert, opportunity);
  let result;

  if (alert.channel === 'email') {
    result = await sendEmail(message);
  } else if (alert.channel === 'telegram') {
    result = await sendTelegram(message);
  } else {
    console.warn(`Unsupported channel ${alert.channel}, skipping`);
    return null;
  }

  const eventPayload = {
    alert_id: alert.id,
    channel: alert.channel,
    delivery_status: result.status,
    message,
    payload: {
      opportunity_id: opportunity.id,
      provider: result.provider ?? 'stub',
    },
  };

  await supabase.from('alert_events').insert(eventPayload);
  await supabase
    .from('alerts')
    .update({ last_triggered_at: new Date().toISOString() })
    .eq('id', alert.id);

  return eventPayload;
}

async function findOpportunity(alert) {
  let query = supabase.from('opportunities').select('*').order('net_rate_after_fees', { ascending: false });
  if (alert.pair) {
    query = query.eq('pair', alert.pair);
  }
  if (alert.exchange) {
    query = query.eq('exchange', alert.exchange);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    throw error;
  }
  return data ?? null;
}

async function run() {
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active');

  if (error) {
    console.error('Failed to load alerts', error.message);
    process.exit(1);
  }

  if (!alerts?.length) {
    console.info('No active alerts to process');
    return;
  }

  for (const alert of alerts) {
    try {
      const opportunity = await findOpportunity(alert);
      if (!opportunity) {
        console.info(`No opportunity found for alert ${alert.id}`);
        continue;
      }

      if (opportunity.current_funding_rate < alert.threshold_rate) {
        continue;
      }

      await dispatchAlert(alert, opportunity);
      console.info(`Alert ${alert.id} dispatched for ${opportunity.pair}`);
    } catch (err) {
      console.error(`Failed to process alert ${alert.id}:`, err.message);
      await supabase.from('alert_events').insert({
        alert_id: alert.id,
        channel: alert.channel,
        delivery_status: 'error',
        message: err.message,
      });
    }
  }
}

run().then(() => {
  console.info('Alert worker run complete');
  process.exit(0);
});
