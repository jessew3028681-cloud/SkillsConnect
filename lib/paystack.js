/**
 * Retrieve and validate Paystack Secret Key from environment
 * @returns {string}
 */
function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY environment variable is required to process payments.');
  }
  return key;
}

/**
 * Initialize a transaction via Paystack Ghana
 * Supports Mobile Money (MTN, Telecel, AT) and Cards in GHS
 * 
 * @param {Object} params
 * @param {string} params.email - Customer email address
 * @param {number} params.amount_ghs - Amount in Ghana Cedis (GHS)
 * @param {string} [params.reference] - Unique transaction reference
 * @param {string} [params.callback_url] - Redirect URL after payment completion
 * @returns {Promise<{authorization_url: string, access_code: string, reference: string}>}
 */
export async function initializeTransaction({ email, amount_ghs, reference, callback_url }) {
  const secretKey = getPaystackSecretKey();
  
  if (!email) {
    throw new Error('Email address is required to initialize a transaction.');
  }
  if (!amount_ghs || isNaN(amount_ghs) || amount_ghs <= 0) {
    throw new Error('A valid positive amount in GHS is required.');
  }

  // Convert amount to pesewas (equivalent to kobo/cents) - Paystack expects the smallest currency unit
  const amountInPesewas = Math.round(Number(amount_ghs) * 100);

  const payload = {
    email,
    amount: amountInPesewas,
    currency: 'GHS',
    channels: ['mobile_money', 'card'],
  };

  if (reference) payload.reference = reference;
  if (callback_url) payload.callback_url = callback_url;

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      throw new Error(result.message || 'Paystack initialisation failed');
    }

    return {
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      reference: result.data.reference,
    };
  } catch (error) {
    console.error('Paystack Initialization Error:', error.message);
    throw error;
  }
}

/**
 * Verify a transaction using its reference
 * 
 * @param {string} reference - Unique Paystack transaction reference
 * @returns {Promise<Object>} - Decoded transaction data from Paystack
 */
export async function verifyTransaction(reference) {
  const secretKey = getPaystackSecretKey();

  if (!reference) {
    throw new Error('Transaction reference is required for verification.');
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      throw new Error(result.message || 'Paystack verification failed');
    }

    return result.data;
  } catch (error) {
    console.error('Paystack Verification Error:', error.message);
    throw error;
  }
}
