/*
  i18n.js — VitalX
  Description : Bascule FR ⇄ EN sur index.html et boutique.html
  🆕 v1.0 — 19/08/2026 — Yann USSEGLIO

  Principe : aucune duplication de page. Le script mémorise chaque nœud de texte
  français au chargement, puis le remplace par sa traduction quand la langue passe
  en EN. Un MutationObserver traduit aussi le contenu injecté dynamiquement
  (lignes du panier, toast…).

  ⚠️ 1. Les clés du dictionnaire doivent correspondre EXACTEMENT au texte affiché
        (entités HTML décodées, apostrophes typographiques ’ incluses).
  ⚠️ 2. Une clé absente = texte laissé en français (dégradation propre, jamais de bug).
  ⚠️ 3. Pour ajouter une page : il suffit d'inclure ce fichier + le bloc #langSwitch.
*/

(function () {
  'use strict';

  // 🗂️ Dictionnaire FR → EN
  var DICT = {
    /* ── Bandeau haut / navigation ─────────────────────────────── */
    'Conçu & assemblé en France 🇫🇷': 'Designed & assembled in France 🇫🇷',
    'Conçu & assemblé en France': 'Designed & assembled in France',
    'Mode Formateur (web) ›': 'Trainer Mode (web) ›',
    'Mode Formateur (web)': 'Trainer Mode (web)',
    'Mode Formateur': 'Trainer Mode',
    'Accueil': 'Home',
    'Boutique': 'Shop',
    '🛍️ Boutique': '🛍️ Shop',
    'Packs': 'Packs',
    'Fonctions': 'Features',
    'Devis': 'Quote',
    'Affiliation': 'Affiliate',
    'Société': 'Company',
    'Panier': 'Cart',
    'Voir les packs': 'See the packs',
    'Demander un devis': 'Request a quote',
    '📝 Demander un devis': '📝 Request a quote',
    'Voir la boutique': 'Visit the shop',
    'Menu': 'Menu',

    /* ── Hero ──────────────────────────────────────────────────── */
    'Simulation médicale française': 'French medical simulation',
    'Formez comme': 'Train like',
    'sur le terrain.': "you're on scene.",
    'Scopes de simulation réalistes, mobiles et économiques. Conçus et assemblés en France pour les': 'Realistic, portable and affordable simulation monitors. Designed and assembled in France for',
    'pompiers': 'firefighters',
    'paramédicaux': 'paramedics',
    'secouristes': 'first responders',
    'et': 'and',
    'VitalX sur iPad': 'VitalX on iPad',
    'VitalX variante': 'VitalX variant',

    /* ── Bandeau confiance ─────────────────────────────────────── */
    'Entreprise française': 'French company',
    'Paiement sécurisé': 'Secure payment',
    '100% sécurisé via Stripe': '100% secure via Stripe',
    'Rétractation': 'Withdrawal',
    'Jusqu’à 14 jours': 'Up to 14 days',
    'Licence à vie': 'Lifetime licence',
    'Sans abonnement': 'No subscription',

    /* ── Catégories ────────────────────────────────────────────── */
    'Pour qui': 'Who it’s for',
    'Pensé pour ceux qui sauvent.': 'Built for the people who save lives.',
    'Secours': 'Emergency',
    'Pompiers': 'Firefighters',
    'Préhospitalier': 'Prehospital',
    'Paramédicaux': 'Paramedics',
    'Associatif': 'Volunteer',
    'Secouristes': 'First responders',

    /* ── VitalX V2 ─────────────────────────────────────────────── */
    'Nouvelle génération': 'New generation',
    'Disponible.': 'Available now.',
    'Disponible': 'Available',
    'Le pack le plus complet jamais assemblé par VitalX : grand écran moniteur, châssis redessiné et housse premium.': 'The most complete pack VitalX has ever assembled: a large monitor screen, a redesigned chassis and a premium case.',
    'iPad Air 13" — Moniteur': 'iPad Air 13" — Monitor',
    'iPad 11" — Formateur': 'iPad 11" — Trainer',
    'Châssis VitalX V2': 'VitalX V2 chassis',
    'Housse Bagheera V2 Premium': 'Bagheera V2 Premium case',
    'Connectique complète (PNI, SpO₂, ECG 12D, DSA, T°, EtCO₂)': 'Full connector set (NIBP, SpO₂, 12-lead ECG, AED, temp., EtCO₂)',
    'Connectique complète — PNI, SpO₂, ECG 12D, DSA, T°, EtCO₂': 'Full connector set — NIBP, SpO₂, 12-lead ECG, AED, temp., EtCO₂',
    'Voir le pack': 'See the pack',
    'La nouvelle génération du scope de simulation VitalX.': 'The new generation of the VitalX simulation monitor.',
    'Plus tard': 'Later',

    /* ── MED'X / POD'S ─────────────────────────────────────────── */
    'Le pack référence': 'The reference pack',
    'Tout-en-un.': 'All-in-one.',
    '2 iPad 11", boîtier renforcé, connectiques complètes — PNI, SpO₂, ECG 12 dérivations, DSA, température, EtCO₂ — et licence à vie incluse.': 'Two 11" iPads, reinforced housing, a full connector set — NIBP, SpO₂, 12-lead ECG, AED, temperature, EtCO₂ — and a lifetime licence included.',
    'Fonctionnalités': 'Features',
    'Version compacte': 'Compact version',
    'Mobile & prêt.': 'Mobile & ready.',
    "POD'S transforme un iPhone en moniteur patient. Idéal pour les formations mobiles, les démonstrations rapides et les interventions sur le terrain.": "POD'S turns an iPhone into a patient monitor. Ideal for mobile training, quick demos and field exercises.",
    'Demander une démo': 'Book a demo',

    /* ── Mode Ultra ────────────────────────────────────────────── */
    'Extension': 'Add-on',
    'Extension scope': 'Monitor add-on',
    'Mode Ultra': 'Ultra Mode',
    'Mode Ultra · 4 modules': 'Ultra Mode · 4 modules',
    'GUARDIAN · NEXUS (Scope IAO) · CTG (Cardiotocographe) · VENT (Respirateur)': 'GUARDIAN · NEXUS (triage monitor) · CTG (cardiotocograph) · VENT (ventilator)',
    'Découvrir le Mode Ultra ›': 'Discover Ultra Mode ›',
    'Scope': 'Monitor',
    'Scope IAO': 'Triage monitor',
    'Cardiotocographe': 'Cardiotocograph',
    'Respirateur': 'Ventilator',
    'Débloquez les modules avancés sur votre scope VitalX.': 'Unlock the advanced modules on your VitalX monitor.',
    'Débloquez les modules avancés sur votre scope VitalX : 4 modes professionnels pour aller plus loin dans vos formations.': 'Unlock the advanced modules on your VitalX monitor: 4 professional modes to take your training further.',
    'TTC — paiement unique': 'incl. VAT — one-off payment',
    '🛒 Ajouter le Mode Ultra — 400 €': '🛒 Add Ultra Mode — €400',

    /* ── Fonctionnalités ───────────────────────────────────────── */
    'Capacités': 'Capabilities',
    'Tout pour former.': 'Everything you need to train.',
    'Scénarios dynamiques': 'Dynamic scenarios',
    'Cas concrets — AVC, douleur thoracique, polytrauma — avec étapes guidées et transitions automatiques.': 'Real cases — stroke, chest pain, polytrauma — with guided steps and automatic transitions.',
    'Moniteur réaliste': 'Realistic monitor',
    'Constantes temps réel, PNI auto/manuel, alertes, tendances, courbes ECG et SpO₂. Profils adulte et enfant.': 'Real-time vitals, auto/manual NIBP, alarms, trends, ECG and SpO₂ waveforms. Adult and paediatric profiles.',
    'Pilotage formateur': 'Trainer control',
    'Contrôle à distance des constantes, scénarios, ECG 12D et DSA — depuis l’iPad ou le web.': 'Remote control of vitals, scenarios, 12-lead ECG and AED — from the iPad or the web.',
    'ECG 12 dérivations': '12-lead ECG',
    'Plus de 20 tracés — sinus, STEMI, FA, TV, FV, torsades, WPW — avec interprétation et impression simulée.': 'Over 20 tracings — sinus, STEMI, AF, VT, VF, torsades, WPW — with interpretation and a simulated printout.',
    'Historique complet': 'Full history',
    'Snapshots automatiques, PNI horodatées, sparklines et statistiques min / moyenne / max.': 'Automatic snapshots, timestamped NIBP readings, sparklines and min / mean / max statistics.',
    'DLU & Radio': 'Patient file & X-ray',
    'Fiches patient et imagerie radiologique intégrées pour des scénarios contextualisés.': 'Built-in patient records and radiology imaging for context-rich scenarios.',
    'Sync instantanée': 'Instant sync',
    'Un code session. Plusieurs moniteurs. Synchronisation cloud immédiate, partout.': 'One session code. Several monitors. Immediate cloud sync, anywhere.',
    'Prêt en 30 secondes': 'Ready in 30 seconds',
    'Aucune configuration complexe. Ouvrez l’app, entrez le code, formez.': 'No complex setup. Open the app, enter the code, start training.',
    'Sécurisé': 'Secure',
    'Sessions protégées par code. Aucune donnée patient réelle stockée.': 'Code-protected sessions. No real patient data stored.',

    /* ── Galerie app ───────────────────────────────────────────── */
    'L’application': 'The app',
    'L’app VitalX.': 'The VitalX app.',
    'Le formateur pilote. Le moniteur affiche.': 'The trainer drives. The monitor displays.',
    'Scope Monitoring': 'Monitoring view',
    'ECG, SpO₂, EtCO₂ en temps réel': 'ECG, SpO₂, EtCO₂ in real time',
    'Vue Multiparamétrique': 'Multiparameter view',
    'HR, SpO₂, Temp, FR, PNI': 'HR, SpO₂, temp., RR, NIBP',
    'Vue Anatomique': 'Anatomical view',
    'Cœur et poumons animés': 'Animated heart and lungs',
    'ECG 12D — Électrodes': '12-lead ECG — Electrodes',
    'Positionnement guidé 3D': 'Guided 3D placement',
    'ECG 12 Dérivations': '12-Lead ECG',
    'Tracé complet + interprétation': 'Full tracing + interpretation',
    'Mode DSA': 'AED mode',
    'Chocs simulés + métronome RCP': 'Simulated shocks + CPR metronome',
    'Radiologie': 'Radiology',
    'Imagerie intégrée aux scénarios': 'Imaging built into scenarios',
    'Bandelette Urinaire': 'Urine dipstick',
    '10 paramètres analysés': '10 parameters analysed',
    'Vue Formateur': 'Trainer view',
    'Pilotage complet de la session': 'Full session control',

    /* ── Bannière formateur web ────────────────────────────────── */
    'Nouveau': 'New',
    'Mode Formateur. Sur le web.': 'Trainer Mode. On the web.',
    'Pilotez vos sessions depuis n’importe quel ordinateur ou smartphone. Aucune installation.': 'Run your sessions from any computer or smartphone. No installation.',
    'Ouvrir vitalxtrainer.app': 'Open vitalxtrainer.app',

    /* ── Dans le pack ──────────────────────────────────────────── */
    'Contenu': 'What’s included',
    'Dans le pack.': 'In the box.',
    'iPad formateur + moniteur': 'Trainer + monitor iPads',
    'Jusqu’à un iPad Air 13" en V2': 'Up to a 13" iPad Air with V2',
    'Châssis VitalX': 'VitalX chassis',
    '+ housse Bagheera': '+ Bagheera case',
    'Connectiques': 'Connectors',
    'PNI, SpO₂, ECG 12D, DSA, T°, EtCO₂': 'NIBP, SpO₂, 12-lead ECG, AED, temp., EtCO₂',
    'Mises à jour incluses': 'Updates included',

    /* ── Section devis ─────────────────────────────────────────── */
    'Un devis sous 24 h.': 'A quote within 24 hours.',
    'Chaque structure a ses contraintes. On construit votre configuration avec vous.': 'Every organisation has its own constraints. We build your configuration with you.',
    'Ce que comprend votre pack': 'What your pack includes',
    'iPad + châssis VitalX + housse de transport': 'iPad + VitalX chassis + carry case',
    'Connectiques complètes incluses': 'Full connector set included',
    'Licence à vie, sans abonnement': 'Lifetime licence, no subscription',
    'Mises à jour incluses à vie': 'Lifetime updates included',
    'Support 7j/7 — Made in France 🇫🇷': '7-day support — Made in France 🇫🇷',
    'TVA non applicable (art. 293B CGI) · Livraison 15–30 jours': 'VAT not applicable (art. 293B French tax code) · Delivery 15–30 days',
    'Pourquoi un devis': 'Why a quote',
    'Sur mesure': 'Tailored',
    'Configuration adaptée': 'Right-sized configuration',
    'Nombre de scopes, taille d’écran, modules Mode Ultra : on ajuste au besoin réel de votre centre.': 'Number of monitors, screen size, Ultra Mode modules: we match what your centre actually needs.',
    'Bons de commande & marchés publics': 'Purchase orders & public tenders',
    'SDIS, associations agréées, centres de formation : devis conforme à vos procédures d’achat.': 'Fire services, accredited associations, training centres: a quote that fits your procurement process.',
    'Tarif dégressif multi-postes': 'Volume pricing',
    'Plusieurs casernes ou plusieurs salles ? Le devis en tient compte.': 'Several stations or several rooms? The quote takes it into account.',
    'Démo avant décision': 'Demo before you decide',
    'Visio de 30 minutes avec un formateur, scope en main.': 'A 30-minute video call with a trainer, monitor in hand.',
    'Parler à un formateur': 'Talk to a trainer',

    /* ── Témoignages ───────────────────────────────────────────── */
    'Références': 'References',
    'Ils forment avec VitalX.': 'They train with VitalX.',
    '"Le réalisme est bluffant. On gagne un temps fou pour préparer des cas concrets."': '"The realism is striking. It saves us a huge amount of time preparing cases."',
    '"Pilotage à distance ultra simple, nos élèves sont à fond. Excellente lisibilité."': '"Remote control is dead simple and our students are hooked. Excellent readability."',
    '"Le meilleur rapport qualité/prix pour nos ateliers simulation. Je recommande."': '"The best value for money for our simulation workshops. Highly recommended."',
    'Claire M. — Instructrice PSE': 'Claire M. — PSE instructor',
    'Julien R. — Formateur SST': 'Julien R. — Workplace first-aid trainer',
    '"Outil indispensable pour nos formations PSE. Le mode DSA est d’un réalisme impressionnant."': '"An essential tool for our first-aid courses. The AED mode is impressively realistic."',
    '"Adopté par notre centre de formation. Fiable, rapide à déployer, nos stagiaires adorent."': '"Adopted by our training centre. Reliable, quick to deploy, our trainees love it."',
    '"Parfait pour nos exercices SST en site industriel. Le scope est lisible même en plein soleil."': '"Perfect for our industrial-site first-aid drills. The monitor stays readable in full sunlight."',
    '"L’ECG 12 dérivations et la radiologie intégrée ont transformé nos TP de simulation."': '"The 12-lead ECG and built-in radiology transformed our simulation labs."',
    '"On équipe 6 casernes avec VitalX. Le rapport qualité/prix est imbattable."': '"We are equipping 6 fire stations with VitalX. Unbeatable value for money."',
    '"Simple à prendre en main, même pour les formateurs les moins techniques. Bravo."': '"Easy to pick up, even for our least technical trainers. Well done."',
    '"Le pilotage à distance permet au formateur de rester avec le groupe. Un vrai game changer."': '"Remote control lets the trainer stay with the group. A real game changer."',
    '"Nos médecins urgentistes l’utilisent en formation continue. La PNI et le capno sont top."': '"Our emergency physicians use it for continuing education. NIBP and capnography are excellent."',
    'Croix-Rouge française': 'French Red Cross',
    'Marine Nationale': 'French Navy',
    'Protection Civile': 'Civil Protection',

    /* ── Affiliation ───────────────────────────────────────────── */
    'Apporteurs d’affaires': 'Referral partners',
    '🤝 Apporteurs d’affaires': '🤝 Referral partners',
    'Recommandez VitalX. Soyez récompensé.': 'Refer VitalX. Get rewarded.',
    'Une vente conclue grâce à votre mise en relation = une commission versée par virement. Sans engagement.': 'A sale closed thanks to your introduction = a commission paid by bank transfer. No commitment.',
    '🤝 Découvrir le programme': '🤝 Discover the programme',
    'Découvrir le programme ›': 'Discover the programme ›',

    /* ── Formulaire de contact ─────────────────────────────────── */
    'Vous avez des questions ou des suggestions concernant nos produits ? N’hésitez pas à nous écrire.': 'Do you have questions or suggestions about our products? Feel free to write to us.',
    'Prénom': 'First name',
    'Nom de famille': 'Last name',
    'Nom de l’entreprise': 'Company name',
    'E-mail': 'Email',
    'Numéro de téléphone': 'Phone number',
    'Pays': 'Country',
    'Veuillez sélectionner': 'Please select',
    'Message': 'Message',
    'Belgique': 'Belgium',
    'Suisse': 'Switzerland',
    'Allemagne': 'Germany',
    'Espagne': 'Spain',
    'Italie': 'Italy',
    'Pays-Bas': 'Netherlands',
    'Royaume-Uni': 'United Kingdom',
    'Autre pays': 'Other country',
    'VitalX s’engage à protéger et à respecter votre vie privée. Nous utiliserons vos informations personnelles uniquement pour gérer votre compte et vous fournir les produits et services que vous nous avez demandés. Nous aimerions vous contacter ponctuellement au sujet de nos produits et services, ainsi que d’autres contenus susceptibles de vous intéresser. Si vous acceptez d’être contacté(e) à cette fin, veuillez cocher la case ci-dessous et indiquer votre mode de communication préféré :': 'VitalX is committed to protecting and respecting your privacy. We will use your personal information only to manage your account and provide the products and services you have requested. We would like to contact you occasionally about our products and services, as well as other content that may interest you. If you agree to be contacted for this purpose, please tick the box below and indicate your preferred means of communication:',
    'J’accepte de recevoir d’autres communications de VitalX.': 'I agree to receive other communications from VitalX.',
    'Vous pouvez vous désabonner de ces communications à tout moment. Pour plus d’informations sur la procédure de désabonnement, nos pratiques en matière de confidentialité et notre engagement à protéger et respecter votre vie privée, veuillez consulter notre': 'You may unsubscribe from these communications at any time. For more information on how to unsubscribe, on our privacy practices and on our commitment to protecting and respecting your privacy, please see our',
    'Politique de confidentialité': 'Privacy Policy',
    'En cliquant sur « Envoyer » ci-dessous, vous consentez à ce que VitalX stocke et traite les informations personnelles soumises ci-dessus afin de vous fournir le contenu demandé.': 'By clicking "Send" below, you consent to VitalX storing and processing the personal information submitted above in order to provide you with the requested content.',
    'Envoyer': 'Send',

    /* ── Footer ────────────────────────────────────────────────── */
    'Scopes de simulation médicale conçus et assemblés en France pour les professionnels du secours.': 'Medical simulation monitors designed and assembled in France for emergency professionals.',
    'Produits': 'Products',
    'Informations': 'Information',
    'Qui sommes-nous': 'About us',
    'Mentions légales': 'Legal notice',
    'CGV': 'Terms of sale',
    'Confidentialité': 'Privacy',
    'Garantie': 'Warranty',
    'VitalX — Tous droits réservés. Conçu & assemblé en France 🇫🇷': 'VitalX — All rights reserved. Designed & assembled in France 🇫🇷',
    'VitalX — Tous droits réservés.': 'VitalX — All rights reserved.',

    /* ── Boutique ──────────────────────────────────────────────── */
    'Écussons': 'Patches',
    'Simulateurs de monitorage réalistes et accessoires pour la formation médicale et paramédicale.': 'Realistic monitoring simulators and accessories for medical and paramedical training.',
    '🔒 Paiement sécurisé': '🔒 Secure payment',
    '🚚 Expédition rapide': '🚚 Fast shipping',
    '🇫🇷 Support FR': '🇫🇷 French support',
    '♾️ Mises à jour incluses': '♾️ Updates included',
    'Choisissez votre Pack': 'Choose your pack',
    'Trois configurations, une seule promesse : un simulateur fiable et complet. Tarif communiqué sur devis.': 'Three configurations, one promise: a reliable, complete simulator. Pricing on request.',
    'Reconditionné': 'Refurbished',
    '1 iPad': '1 iPad',
    '2 iPad': '2 iPads',
    'Pack Reconditionné': 'Refurbished Pack',
    'Choisissez la configuration': 'Choose the configuration',
    '2 iPad 10ᵉ gén. (reconditionnés)': '2 × 10th-gen iPads (refurbished)',
    '1 iPad 10ᵉ gén. (reconditionné)': '1 × 10th-gen iPad (refurbished)',
    'Boîtier VitalX + housse': 'VitalX housing + case',
    'Connectiques complètes': 'Full connector set',
    '🛑 Rupture de stock': '🛑 Out of stock',
    '⭐ Pack Classic — Le plus accessible': '⭐ Classic Pack — The most affordable',
    'Pack Classic': 'Classic Pack',
    'Pack VitalX Basique — 1 iPad': 'VitalX Basic pack — 1 iPad',
    'Idéal solo': 'Great solo',
    '1 iPad 11"': '1 × 11" iPad',
    'Boîtier VitalX + housse de transport': 'VitalX housing + carry case',
    'Connectiques complètes (PNI, SpO₂, ECG 12D, DSA, T°, EtCO₂)': 'Full connector set (NIBP, SpO₂, 12-lead ECG, AED, temp., EtCO₂)',
    'Licence à vie, mises à jour incluses': 'Lifetime licence, updates included',
    '📄 Voir la fiche technique': '📄 View the spec sheet',
    '📄 Fiche technique': '📄 Spec sheet',
    '🔥 Pack Premium — Le plus complet': '🔥 Premium Pack — The most complete',
    'Pack Premium': 'Premium Pack',
    'Pack VitalX Complet — 2 iPad': 'Complete VitalX pack — 2 iPads',
    '2 iPad 11"': '2 × 11" iPads',
    '— formateur + élève': '— trainer + trainee',
    '👑 Pack Ultimate — VitalX V2': '👑 Ultimate Pack — VitalX V2',
    'Pack Ultimate': 'Ultimate Pack',
    'Le pack VitalX le plus complet': 'The most complete VitalX pack',
    '1 iPad Air 13"': '1 × 13" iPad Air',
    '— moniteur grand format': '— large-format monitor',
    '— formateur': '— trainer',
    'Châssis': 'Chassis',
    'Housse': 'Case',
    'La version compacte VitalX, propulsée par iPhone.': 'The compact VitalX, powered by iPhone.',
    "Pack VitalX POD'S Classic": "VitalX POD'S Classic pack",
    "Pack VitalX POD'S Premium": "VitalX POD'S Premium pack",
    '1 iPhone 11 ou 12 (reconditionné)': '1 × iPhone 11 or 12 (refurbished)',
    'Brassard tension adulte / enfant': 'Adult / child BP cuff',
    'Capteur SpO₂ / SpCO': 'SpO₂ / SpCO sensor',
    'Patch DSA adulte / pédia': 'Adult / paediatric AED pads',
    "Boîtier VitalX POD'S": "VitalX POD'S housing",
    '+ 1 iPad 11"': '+ 1 × 11" iPad',
    'Personnalisez votre tenue avec nos écussons brodés.': 'Add our embroidered patches to your uniform.',
    'Écusson Chat Noir': 'Black Cat patch',
    'Écusson VitalX 2K26': 'VitalX 2K26 patch',
    'Écusson Stop Blood': 'Stop Blood patch',
    'Brodé · thermocollant': 'Embroidered · iron-on',
    'TTC': 'incl. VAT',
    '🛒 Ajouter au panier': '🛒 Add to cart',

    /* ── Panier ────────────────────────────────────────────────── */
    '🛒 Votre panier': '🛒 Your cart',
    'Fermer ✕': 'Close ✕',
    'Sous-total': 'Subtotal',
    'Frais de livraison calculés à l’étape suivante.': 'Shipping calculated at the next step.',
    '🔒 Payer maintenant': '🔒 Pay now',
    '🔒 Sécurisé': '🔒 Secure',
    'Votre panier est vide': 'Your cart is empty',
    'Ajoutez un produit pour commencer.': 'Add a product to get started.',
    'Supprimer': 'Remove',
    'Ajouté au panier ✓': 'Added to cart ✓',
    'Votre panier est vide.': 'Your cart is empty.',
    'Vous souhaitez voir VitalX en action ?': 'Want to see VitalX in action?',
    'Contactez-nous pour organiser une démonstration en visio.': 'Get in touch to arrange a video demo.',
    '📞 Demander une démo': '📞 Book a demo'
  };

  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1 };
  var TITLES = {
    'VitalX — Simulation médicale française': 'VitalX — French medical simulation',
    'VitalX — Boutique': 'VitalX — Shop'
  };

  var store = { text: [], attr: [] };
  var observer = null;
  var current = 'fr';

  // 🔍 Un nœud de texte est-il traduisible ?
  function usable(node) {
    var p = node.parentNode;
    if (!p || p.nodeType !== 1) return false;
    if (SKIP[p.nodeName]) return false;
    if (p.closest && p.closest('svg')) return false;
    return !!node.nodeValue.trim();
  }

  // 📥 Collecte les nœuds de texte et attributs d'une racine donnée
  function collect(root) {
    var out = { text: [], attr: [] };
    if (root.nodeType === 3) {
      if (usable(root)) out.text.push({ node: root, fr: root.nodeValue });
      return out;
    }
    if (root.nodeType !== 1) return out;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) { if (usable(n)) out.text.push({ node: n, fr: n.nodeValue }); }

    var els = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
    els.forEach(function (el) {
      if (el.nodeName === 'svg' || (el.closest && el.closest('svg'))) return;
      ATTRS.forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && v.trim()) out.attr.push({ el: el, attr: a, fr: v });
      });
    });
    return out;
  }

  // 🔤 Normalisation : apostrophes ’/‘ → ' et espaces multiples → un seul
  //    ⚠️ Évite qu'une clé du dictionnaire rate le texte de la page à cause
  //       d'une apostrophe droite au lieu d'une typographique.
  function norm(s) {
    return s.replace(/[\u2018\u2019\u02BC]/g, "'").replace(/\s+/g, ' ').trim();
  }

  var NDICT = {};
  Object.keys(DICT).forEach(function (k) { NDICT[norm(k)] = DICT[k]; });

  // 🔤 Traduit une chaîne en conservant les espaces autour
  function tr(raw) {
    var key = raw.trim();
    var hit = NDICT[norm(key)];
    return hit ? raw.replace(key, hit) : null;
  }

  function applyTo(list, lang) {
    list.text.forEach(function (o) {
      if (lang === 'en') { var v = tr(o.fr); o.node.nodeValue = v !== null ? v : o.fr; }
      else { o.node.nodeValue = o.fr; }
    });
    list.attr.forEach(function (o) {
      if (lang === 'en') { var v = tr(o.fr); o.el.setAttribute(o.attr, v !== null ? v : o.fr); }
      else { o.el.setAttribute(o.attr, o.fr); }
    });
  }

  // 👀 Traduit aussi ce qui est injecté après coup (panier, toast…)
  function startObserver() {
    if (!window.MutationObserver) return;
    observer = new MutationObserver(function (muts) {
      if (current !== 'en') return;
      observer.disconnect();
      muts.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) { applyTo(collect(n), 'en'); });
        if (m.type === 'characterData' && usable(m.target)) {
          var v = tr(m.target.nodeValue);
          if (v !== null) m.target.nodeValue = v;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function paintButtons() {
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-lang') === current);
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === current ? 'true' : 'false');
    });
  }

  function setLang(lang, persist) {
    current = lang === 'en' ? 'en' : 'fr';
    applyTo(store, current);
    document.documentElement.lang = current;
    var t = TITLES[document.title];
    if (current === 'en' && t) document.title = t;
    paintButtons();
    if (persist !== false) { try { localStorage.setItem('vitalx_lang', current); } catch (e) {} }
  }

  function init() {
    store = collect(document.body);

    // Priorité : ?lang= › choix mémorisé › langue du navigateur › français
    var saved = null;
    try { saved = localStorage.getItem('vitalx_lang'); } catch (e) {}
    var param = new URLSearchParams(location.search).get('lang');
    var start = 'fr';
    if (param === 'en' || param === 'fr') start = param;
    else if (saved === 'en' || saved === 'fr') start = saved;
    else if ((navigator.language || 'fr').toLowerCase().indexOf('fr') !== 0) start = 'en';

    setLang(start, param === 'en' || param === 'fr');
    startObserver();

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-lang]');
      if (!btn) return;
      e.preventDefault();
      setLang(btn.getAttribute('data-lang'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.VitalXI18n = { set: setLang, get: function () { return current; } };
})();
