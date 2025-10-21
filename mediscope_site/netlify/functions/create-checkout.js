// mediscop_site/netlify/functions/create-checkout.js

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

    // Au moins une licence dans le panier ?
    const hasLicense = items.some(({ sku }) => String(sku || '').startsWith('sku_lic_'));

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

    // FACTURATION / LIVRAISON
    body.append('billing_address_collection', 'required'); // adresse de facturation distincte
    body.append('allow_promotion_codes', 'true');
    body.append('phone_number_collection[enabled]', 'true'); // téléphone utile transporteurs

    // === Champs personnalisés Stripe Checkout ===
    let cfIndex = 0;

    // (1) Code licence actuel (si licence dans le panier)
    if (hasLicense) {
      body.append(`custom_fields[${cfIndex}][key]`, 'current_license_code');
      body.append(`custom_fields[${cfIndex}][label][type]`, 'custom');
      body.append(`custom_fields[${cfIndex}][label][custom]`, 'Code licence actuel (facultatif)');
      body.append(`custom_fields[${cfIndex}][type]`, 'text');
      body.append(`custom_fields[${cfIndex}][text][minimum_length]`, '4');
      body.append(`custom_fields[${cfIndex}][text][maximum_length]`, '40');
      body.append(`custom_fields[${cfIndex}][optional]`, 'true');
      cfIndex++;

      // Message sous le bouton Payer (facultatif)
      body.append('custom_text[submit][message]', 'Vous avez déjà une licence ? Indiquez votre code pour accélérer la prolongation.');
    }

    // (2) Point relais (champ facultatif, affiché pour tous)
    body.append(`custom_fields[${cfIndex}][key]`, 'pickup_point');
    body.append(`custom_fields[${cfIndex}][label][type]`, 'custom');
    body.append(`custom_fields[${cfIndex}][label][custom]`, 'Point relais (nom ou ID) — si vous choisissez l’option Point relais');
    body.append(`custom_fields[${cfIndex}][type]`, 'text');
    body.append(`custom_fields[${cfIndex}][text][minimum_length]`, '2');
    body.append(`custom_fields[${cfIndex}][text][maximum_length]`, '64');
    body.append(`custom_fields[${cfIndex}][optional]`, 'true');
    // === Fin champs personnalisés ===

    // Adresse & options de livraison (affichées dans Checkout)
    ['FR', 'BE', 'CH', 'LU'].forEach(c => body.append('shipping_address_collection[allowed_countries][]', c));

    // Option 1 : Livraison économique (gratuite, 15–30 jours calendaires)
    body.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
    body.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', '0');
    body.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
    body.append('shipping_options[0][shipping_rate_data][display_name]', 'Livraison économique (15–30 jours)');
    body.append('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]', 'day');
    body.append('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]', '15');
    body.append('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]', 'day');
    body.append('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]', '30');

    // Option 2 : Point relais (FR)
    body.append('shipping_options[1][shipping_rate_data][type]', 'fixed_amount');
    body.append('shipping_options[1][shipping_rate_data][fixed_amount][amount]', '0');
    body.append('shipping_options[1][shipping_rate_data][fixed_amount][currency]', 'eur');
    body.append('shipping_options[1][shipping_rate_data][display_name]', 'Point relais (France)');
    body.append('shipping_options[1][shipping_rate_data][delivery_estimate][minimum][unit]', 'business_day');
    body.append('shipping_options[1][shipping_rate_data][delivery_estimate][minimum][value]', '15');
    body.append('shipping_options[1][shipping_rate_data][delivery_estimate][maximum][unit]', 'business_day');
    body.append('shipping_options[1][shipping_rate_data][delivery_estimate][maximum][value]', '30');

    // Lignes articles
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
