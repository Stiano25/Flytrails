let cachedToken = null;
let tokenExpiresAt = 0;

function getBaseUrl() {
  const env = (process.env.MPESA_ENV || 'sandbox').trim().toLowerCase();
  return env === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

/**
 * Returns formatted timestamp in East Africa Time (Africa/Nairobi, YYYYMMDDHHmmss)
 */
export function getMpesaTimestamp() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  return `${map.year}${map.month}${map.day}${map.hour}${map.minute}${map.second}`;
}

/**
 * Normalizes Kenyan phone number to 254XXXXXXXXX format
 */
export function normalizePhone(raw) {
  let clean = String(raw || '').replace(/[\s\-\+\(\)]/g, '');
  if (clean.startsWith('0')) {
    clean = '254' + clean.slice(1);
  } else if (clean.startsWith('7') || clean.startsWith('1')) {
    clean = '254' + clean;
  }
  // Validate Kenyan mobile format: 254 + (7 or 1) + 8 digits = 12 digits
  if (!/^254[17]\d{8}$/.test(clean)) {
    throw new Error(`Invalid Kenyan phone number: ${raw}. Expected format: 07XXXXXXXX or 2547XXXXXXXX.`);
  }
  return clean;
}

/**
 * Obtains or reuses OAuth Bearer token from Daraja API
 */
export async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  const consumerKey = (process.env.MPESA_CONSUMER_KEY || '').trim();
  const consumerSecret = (process.env.MPESA_CONSUMER_SECRET || '').trim();

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials not configured: MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET missing.');
  }

  const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const url = `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
  });

  if (!res.ok) {
    const errorText = (await res.text()).trim();
    const detail = errorText || 'Daraja rejected the credentials or the app is not enabled for this environment.';
    console.error('[mpesa] OAuth error:', res.status, detail);
    throw new Error(`Failed to authenticate with M-Pesa (${res.status}): ${detail}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  const expiresIn = Number(data.expires_in) || 3599;
  tokenExpiresAt = now + expiresIn * 1000;

  return cachedToken;
}

/**
 * Initiates an STK Push to the customer's phone
 */
export async function initiateSTKPush({ phone, amount, accountRef, callbackUrl: overrideCallbackUrl }) {
  const token = await getAccessToken();
  const shortcode = (process.env.MPESA_SHORTCODE || '174379').trim();
  const passkey = (process.env.MPESA_PASSKEY || '').trim();
  const callbackUrl = (overrideCallbackUrl || process.env.MPESA_CALLBACK_URL || '').trim();

  if (!passkey) {
    throw new Error('MPESA_PASSKEY is not configured in .env');
  }
  if (!callbackUrl) {
    throw new Error('MPESA_CALLBACK_URL is not configured in .env');
  }

  const validPhone = normalizePhone(phone);
  const timestamp = getMpesaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  // Safaricom accepts integer amounts (KES 1 minimum)
  const finalAmount = Math.max(1, Math.round(Number(amount)));

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: finalAmount,
    PartyA: validPhone,
    PartyB: shortcode,
    PhoneNumber: validPhone,
    CallBackURL: callbackUrl,
    AccountReference: String(accountRef || 'Flytrails').slice(0, 12),
    TransactionDesc: 'Flytrails Trip Booking',
  };

  const url = `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.ResponseCode !== '0') {
    console.error('[mpesa] STK Push failed:', data);
    const msg = data.errorMessage || data.CustomerMessage || data.ResponseDescription || 'STK Push failed';
    throw new Error(msg);
  }

  return {
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    customerMessage: data.CustomerMessage,
  };
}

/**
 * Parses incoming Safaricom Daraja callback payload
 */
export function parseCallbackPayload(body) {
  const callback = body?.Body?.stkCallback;
  if (!callback) {
    return null;
  }

  const resultCode = callback.ResultCode;
  const resultDesc = callback.ResultDesc || '';
  const checkoutRequestId = callback.CheckoutRequestID;
  const merchantRequestId = callback.MerchantRequestID;

  let mpesaReceipt = null;
  let amount = null;
  let transactionDate = null;
  let phoneNumber = null;

  if (resultCode === 0 && callback.CallbackMetadata?.Item) {
    for (const item of callback.CallbackMetadata.Item) {
      if (item.Name === 'MpesaReceiptNumber') mpesaReceipt = String(item.Value);
      if (item.Name === 'Amount') amount = Number(item.Value);
      if (item.Name === 'TransactionDate') transactionDate = String(item.Value);
      if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
    }
  }

  return {
    isSuccess: resultCode === 0,
    resultCode,
    resultDesc,
    checkoutRequestId,
    merchantRequestId,
    mpesaReceipt,
    amount,
    transactionDate,
    phoneNumber,
  };
}
