const PRICE_BY_SKU = {
  // === PRODUITS PRINCIPAUX ===
  'sku_pack': 'price_1SKdaZ2MFaCyLMvRkHyTb6I7',       // Pack VitalX
  'sku_lic_3': 'price_1SJPj52MFaCyLMvRBbYPwyy3',       // Licence 3 mois
  'sku_lic_6': 'price_1SKdbq2MFaCyLMvRLCndPBiG',       // Licence 6 mois
  'sku_lic_12': 'price_1SKdbT2MFaCyLMvR1LNROlFy',      // Licence 12 mois
  'sku_lic_24': 'price_1SKdb62MFaCyLMvRjncRyuM3',      // Licence 24 mois

  // === ACCESSOIRES (à compléter plus tard) ===
  'sku_acc_dsa_adult': 'price_ACC_DSA_ADULT_REPLACE',
  'sku_acc_dsa_pedia': 'price_ACC_DSA_PEDIA_REPLACE',
  'sku_acc_cable_ecg': 'price_ACC_CABLE_ECG_REPLACE',
  'sku_acc_spo2': 'price_ACC_SPO2_REPLACE',
  'sku_acc_etco2': 'price_ACC_ETCO2_REPLACE',
  'sku_acc_bp_adult': 'price_ACC_BP_ADULT_REPLACE',
  'sku_acc_bp_child': 'price_ACC_BP_CHILD_REPLACE',
  'sku_acc_temp': 'price_ACC_TEMP_REPLACE',
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Méthode non autorisée' });

    const { items, mode = 'payment' } = JSON.parse(event.body || '{}');
    if (!Array.isArray(items) || !items.length) return json(400, { error: 'Panier vide' });

    const lineItems = [];
    for (const { sku, quantity } of items) {
      const price = PRICE_BY_SKU[sku];
      if (!price) return json(400, { error: `Article invalide: ${sku}` });
      lineItems.push({ price, quantity: Math.max(1, Math.min(99, Number(quantity) || 1)) });
    }

    const siteUrl = process.env.SITE_URL || 'https://vitalx.org';
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return json(500, { error: 'Clé Stripe manquante (STRIPE_SECRET_KEY)' });

    const body = new URLSearchParams();
    body.append('mode', mode);
    body.append('success_url', `${siteUrl}/merci-commande.html?session_id={CHECKOUT_SESSION_ID}`);
    body.append('cancel_url', `${siteUrl}/boutique.html`);
    body.append('billing_address_collection', 'auto');
    body.append('allow_promotion_codes', 'true');
    ['FR', 'BE', 'CH', 'LU'].forEach(c => body.append('shipping_address_collection[allowed_countries][]', c));
    body.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
    body.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', '0');
    body.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
    body.append('shipping_options[0][shipping_rate_data][display_name]', 'Livraison gratuite (15–40 jours)');

    lineItems.forEach((li, i) => {
      body.append(`line_items[${i}][price]`, li.price);
      body.append(`line_items[${i}][quantity]`, String(li.quantity));
    });

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await resp.json();
    if (!resp.ok) return json(400, { error: data.error?.message || 'Erreur Stripe' });

    return json(200, { url: data.url });
  } catch (e) {
    console.error(e);
    return json(400, { error: e.message || 'Erreur interne' });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
