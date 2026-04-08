const PRICE_BY_SKU = {
  // === PRODUITS PRINCIPAUX ===
  'sku_pack':           'price_1ScrWQ2MFaCyLMvRSpMRJuf5', // Pack VitalX Premium 3600
  'sku_pack_basic':     'price_1ScrUy2MFaCyLMvR0FMhQ9VO', // Pack VitalX Basique 3300

  // Packs reconditionnés
  'sku_pack_refurb_1':  'price_1SSqRK2MFaCyLMvRPnF7A5Ia', // Pack Reconditionné 1 iPad — 1 489 €
  'sku_pack_refurb_2':  'price_1SSqQC2MFaCyLMvRTh5uoL8T', // Pack Reconditionné 2 iPad — 1 849 €

  // === POD'S ===
  'sku_pods_classic':   'price_1T4lur2MFaCyLMvRIe4ApI19', // POD'S Classic — 1 300 €
  'sku_pods_premium':   'price_1T4lvf2MFaCyLMvRZPaFFxTz', // POD'S Premium — 1 600 €

  // === LICENCES ===
  'sku_lic_annual':     'price_1SSqNq2MFaCyLMvRxOOlrLly', // Licence 1 an — 180 €
  'sku_lic_life':       'price_1Sc9ie2MFaCyLMvR64EP2e2C', // Licence à vie — 500 €

  // === ECUSSONS ===
  'sku_ecusson_chat_noir':   'price_1TGJiR2MFaCyLMvRNRTfejPp',
  'sku_ecusson_vitalx_2k26': 'price_1TGJmJ2MFaCyLMvRc54chMoQ',
  'sku_ecusson_stop_blood':  'price_1TGJlS2MFaCyLMvRaF0mNB5f',

  // === ACCESSOIRES ===
  'sku_acc_dsa_adult':  'price_ACC_DSA_ADULT_REPLACE',
  'sku_acc_dsa_pedia':  'price_ACC_DSA_PEDIA_REPLACE',
  'sku_acc_cable_ecg':  'price_ACC_CABLE_ECG_REPLACE',
  'sku_acc_spo2':       'price_ACC_SPO2_REPLACE',
  'sku_acc_etco2':      'price_ACC_ETCO2_REPLACE',
  'sku_acc_bp_adult':   'price_ACC_BP_ADULT_REPLACE',
  'sku_acc_bp_child':   'price_ACC_BP_CHILD_REPLACE',
  'sku_acc_temp':       'price_ACC_TEMP_REPLACE',
};

const PATCH_SKUS = new Set([
  'sku_ecusson_chat_noir',
  'sku_ecusson_vitalx_2k26',
  'sku_ecusson_stop_blood',
]);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Méthode non autorisée' });
    }

    const { items, mode = 'payment' } = JSON.parse(event.body || '{}');

    if (!Array.isArray(items) || !items.length) {
      return json(400, { error: 'Panier vide' });
    }

    // Détecte les licences
    const hasLicense = items.some(({ sku }) =>
      String(sku || '').startsWith('sku_lic_')
    );

    // Détecte les écussons
    const hasPatch = items.some(({ sku }) => PATCH_SKUS.has(String(sku || '')));

    const lineItems = [];
    for (const { sku, quantity } of items) {
      const price = PRICE_BY_SKU[sku];
      if (!price) {
        return json(400, { error: `Article invalide: ${sku}` });
      }

      lineItems.push({
        price,
        quantity: Math.max(1, Math.min(99, Number(quantity) || 1)),
      });
    }

    const siteUrl = process.env.SITE_URL || 'https://vitalx.org';
    const secret = process.env.STRIPE_SECRET_KEY;

    if (!secret) {
      return json(500, { error: 'Clé Stripe manquante (STRIPE_SECRET_KEY)' });
    }

    const body = new URLSearchParams();
    body.append('mode', mode);
    body.append('success_url', `${siteUrl}/merci-commande.html?session_id={CHECKOUT_SESSION_ID}`);
    body.append('cancel_url', `${siteUrl}/boutique.html`);
    body.append('billing_address_collection', 'auto');
    body.append('allow_promotion_codes', 'true');

    // Champ personnalisé si licence
    if (hasLicense) {
      body.append('custom_fields[0][key]', 'current_license_code');
      body.append('custom_fields[0][label][type]', 'custom');
      body.append('custom_fields[0][label][custom]', 'Code licence actuel (facultatif)');
      body.append('custom_fields[0][type]', 'text');
      body.append('custom_fields[0][text][minimum_length]', '4');
      body.append('custom_fields[0][text][maximum_length]', '40');
      body.append('custom_fields[0][optional]', 'true');

      body.append(
        'custom_text[submit][message]',
        'Vous avez déjà une licence ? Indiquez votre code pour accélérer la prolongation.'
      );
    }

    // Livraison uniquement si écusson présent
    if (hasPatch) {
      ['FR', 'BE', 'CH', 'LU'].forEach((c) => {
        body.append('shipping_address_collection[allowed_countries][]', c);
      });

      body.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
      body.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', '380'); // 3,80 €
      body.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
      body.append('shipping_options[0][shipping_rate_data][display_name]', 'Livraison écussons');
      body.append('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]', 'day');
      body.append('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]', '4');
      body.append('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]', 'day');
      body.append('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]', '8');
    }

    // Lignes articles
    lineItems.forEach((li, i) => {
      body.append(`line_items[${i}][price]`, li.price);
      body.append(`line_items[${i}][quantity]`, String(li.quantity));
    });

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await resp.json();

    if (!resp.ok) {
      return json(400, { error: data.error?.message || 'Erreur Stripe' });
    }

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
