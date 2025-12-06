/**
 * Integrasi Payment Gateway Xendit
 * 
 * Cara setup:
 * 1. Daftar dulu di https://dashboard.xendit.co/register
 * 2. Buat akun (pake sandbox buat testing, production buat live)
 * 3. Ambil Secret Key dari dashboard (Settings → API Keys)
 * 4. Tambahkan ke .env.local:
 *    XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxxx
 *    XENDIT_IS_PRODUCTION=false (true kalau udah production)
 */

/**
 * Buat invoice untuk pembayaran
 * @param {Object} params - Parameter pembayaran
 * @param {string} params.externalId - ID unik eksternal (order ID)
 * @param {number} params.amount - Jumlah dalam rupiah
 * @param {string} params.customerName - Nama customer
 * @param {string} params.customerEmail - Email customer
 * @param {string} params.description - Deskripsi item
 * @param {string} params.successRedirectUrl - URL setelah pembayaran berhasil
 * @returns {Promise<Object>} Data invoice beserta URL pembayaran
 */
export async function createInvoice({
  externalId,
  amount,
  customerName,
  customerEmail,
  description,
  successRedirectUrl
}) {
  try {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('XENDIT_SECRET_KEY is not set in environment variables');
    }

    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: amount,
        description: description,
        invoice_duration: 86400, // 24 jam
        customer: {
          given_names: customerName,
          email: customerEmail,
        },
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: successRedirectUrl.replace('/success', '/error'),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create invoice');
    }

    const invoice = await response.json();
    
    return {
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      externalId: invoice.external_id,
      status: invoice.status,
    };
  } catch (error) {
    console.error('Xendit error:', error);
    throw new Error(`Failed to create invoice: ${error.message}`);
  }
}

/**
 * Cek status invoice
 * @param {string} invoiceId - ID invoice
 * @returns {Promise<Object>} Status invoice
 */
export async function getInvoiceStatus(invoiceId) {
  try {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('XENDIT_SECRET_KEY is not set');
    }

    const response = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to get invoice status';
      
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      console.error('Xendit API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage
      });
      
      throw new Error(errorMessage);
    }

    const invoice = await response.json();
    
    return {
      invoiceId: invoice.id,
      status: invoice.status,
      amount: invoice.amount,
      paidAt: invoice.paid_at,
      externalId: invoice.external_id,
    };
  } catch (error) {
    console.error('Xendit status check error:', error);
    throw new Error(`Failed to get invoice status: ${error.message}`);
  }
}

/**
 * Expire invoice (batalkan invoice)
 * @param {string} invoiceId - ID invoice
 * @returns {Promise<Object>} Hasil expiration
 */
export async function expireInvoice(invoiceId) {
  try {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('XENDIT_SECRET_KEY is not set');
    }

    const response = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}/expire!`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to expire invoice');
    }

    return await response.json();
  } catch (error) {
    console.error('Xendit expire error:', error);
    throw new Error(`Failed to expire invoice: ${error.message}`);
  }
}

