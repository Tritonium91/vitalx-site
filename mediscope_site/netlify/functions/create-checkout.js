// create-checkout.js — VitalX
// v3.0 — 13/09/2026
//   • Mode Ultra supprimé (sku_mode_ultra + champ "code d'activation" associé)
//   • Licence VitalX seule / passage POD'S → VitalX : SKU prévus mais pas encore vendus en ligne
//     (aujourd'hui sur devis). Pour les activer : créer les Price dans Stripe, remplacer
//     les placeholders ci-dessous et ajouter un bouton .add-to-cart dans boutique.html.
//   • Le champ "code existant" ne se déclenche que pour le passage POD'S → VitalX.

const PRICE_BY_SKU = {
  // === ECUSSONS (vendus en ligne) ===
  'sku_ecusson_chat_noir':   'price_1TGJiR2MFaCyLMvRNRTfejPp',
  'sku_ecusson_vitalx_2k26': 'price_1TGJmJ2MFaCyLMvRc54chMoQ',
  'sku_ecusson_stop_blood':  'price_1TGJlS2MFaCyLMvRaF0mNB5f',

  // === LICENCES (sur devis pour l'instant — placeholders) ===
  'sku_licence_vitalx':      'price_LICENCE_VITALX_REPLACE',      // Licence VitalX seule
  'sku_licence_pods_upgrade':'price_LICENCE_PODS_UPGRADE_REPLACE',// Passage POD'S → VitalX

  // === PACKS (sur devis — conservés pour compatibilité, non exposés dans la boutique) ===
  'sku_pack':                'price_1TJw0K2MFaCyLMvR1WHyPrUm',
  'sku_pack_basic':          'price_1TJvzU2MFaCyLMvRzJozVeBB',
  'sku_pods_classic':        'price_1TWHMV2MFaCyLMvRYYMmpv0d',
  'sku_pods_premium':        'price_1TWHLu2MFaCyLMvR9hB7ryqT',
};

const PATCH_SKUS = new Set([
  'sku_ecusson_chat_noir',
  'sku_ecusson_vitalx_2k26',
  'sku_ecusson_stop_blood',
]);

// SKU nécessitant un code de licence existant à la commande
const NEEDS_EXISTING_CODE = new Set(['sku_licence_pods_upgrade']);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Méthode non autorisée' });
    }

    const { items, mode = 'payment' } = JSON.parse(event.body || '{}');

    if (!Array.isArray(items) || !items.length) {
      return json(400, { error: 'Panier vide' });
    }

    const hasPatch = items.some(({ sku }) => PATCH_SKUS.has(String(sku || '')));
    const needsCode = items.some(({ sku }) => NEEDS_EXISTING_CODE.has(String(sku || '')));

    const lineItems = [];
    for (const { sku, quantity } of items) {
      const price = PRICE_BY_SKU[sku];
      if (!price || price.endsWith('_REPLACE')) {
        return json(400, { error: `Article non disponible en ligne : ${sku}` });
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

    // Code POD'S existant, requis pour la mise à niveau
    if (needsCode) {
      body.append('custom_fields[0][key]', 'existing_license_code');
      body.append('custom_fields[0][label][type]', 'custom');
      body.append('custom_fields[0][label][custom]', "Code de licence POD'S à mettre à niveau");
      body.append('custom_fields[0][type]', 'text');
      body.append('custom_fields[0][text][minimum_length]', '4');
      body.append('custom_fields[0][text][maximum_length]', '40');
      body.append(
        'custom_text[submit][message]',
        "Indiquez le code de votre licence POD'S : il sera converti en licence VitalX à distance."
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
