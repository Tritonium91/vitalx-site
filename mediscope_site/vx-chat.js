/*
  vx-chat.js — VitalX
  Description : assistant VitalX, la bulle de tchat en bas à droite de toutes les pages :
                conseil pour choisir un scope, dépannage pas à pas, réponses aux questions fréquentes.
  🆕 v1.0 — 13/10/2026 — Yann USSEGLIO
     • Chargé par site-header.js une fois la page affichée : rien à ajouter dans les fichiers HTML
     • Conseil en 4 questions → VitalX Plus, VitalX Ultra, POD'S, licence seule ou passage POD'S → VitalX
     • Dépannage : liaison formateur ↔ moniteur, code de licence, son, capteur RCP, formateur web, app qui plante,
       matériel abîmé, commande
     • Questions libres : mots-clés FR / EN / DE (prix, livraison, garantie, appareils, licence, iOS, démo…)
     • Langue du site (FR / EN / DE, attribut lang posé par i18n.js) : toute la conversation suit le changement de langue
     • Rien ne quitte le navigateur : aucune requête, aucun cookie ; l'historique dure le temps de l'onglet (sessionStorage)
     • « Préparer mon message » remplit le formulaire de contact de l'accueil : le visiteur complète et envoie lui-même
  ⚠️ Les réponses reprennent la boutique, les fiches techniques, la page Garantie et les CGV : les mettre à jour avec elles.
  ⚠️ Marques : seuls SCHILLER et WEINMANN sont nommés ; les autres constructeurs = « en discussion, sans date ni garantie ».
  ⚠️ Isolé dans un Shadow DOM : i18n.js ne le traduit pas (il porte ses propres textes) et les styles du site ne s'y appliquent pas.
*/
(function () {
  'use strict';
  if (window.__vxChat || !window.Element || !Element.prototype.attachShadow) return;
  window.__vxChat = true;

  var MAIL = 'vitalxscope@gmail.com';
  var WEB = 'https://vitalxtrainer.app';
  var KEY = 'vxchat.v1', PREFILL = 'vxchat.prefill';
  var MAILA = "<a href='mailto:" + MAIL + "'>" + MAIL + "</a>";
  var WEBA = "<a href='" + WEB + "' target='_blank' rel='noopener'>vitalxtrainer.app</a>";

  // ── Langue ───────────────────────────────────────────────────────
  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'fr').slice(0, 2).toLowerCase();
    return l === 'en' || l === 'de' ? l : 'fr';
  }
  function T(fr, en, de) { return { fr: fr, en: en, de: de }; }
  function t(o) { return o == null ? '' : (typeof o === 'string' ? o : (o[lang()] || o.fr)); }
  function fmt(s, d) { return s.replace(/\{(\w+)\}/g, function (_, k) { return d[k] != null ? d[k] : ''; }); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── Textes de l'interface ────────────────────────────────────────
  var U = {
    launch: T("Une question ?", "Questions?", "Fragen?"),
    launchAria: T("Ouvrir l’assistant VitalX", "Open the VitalX assistant", "VitalX-Assistent öffnen"),
    title: T("Assistant VitalX", "VitalX assistant", "VitalX-Assistent"),
    status: T("Conseil et dépannage", "Advice and troubleshooting", "Beratung und Hilfe"),
    restart: T("Recommencer", "Start over", "Neu beginnen"),
    close: T("Fermer", "Close", "Schließen"),
    ph: T("Écrivez votre question…", "Type your question…", "Ihre Frage …"),
    send: T("Envoyer", "Send", "Senden"),
    note: T("Assistant automatique : vos messages restent dans votre navigateur.",
            "Automated assistant: your messages stay in your browser.",
            "Automatischer Assistent: Ihre Nachrichten bleiben in Ihrem Browser."),
    hello: T("Bonjour 👋 Je suis l’assistant VitalX. Je peux vous aider à <b>choisir votre scope</b>, à <b>résoudre un problème</b> ou répondre à vos questions.",
             "Hello 👋 I’m the VitalX assistant. I can help you <b>choose your simulator</b>, <b>fix a problem</b> or answer your questions.",
             "Hallo 👋 Ich bin der VitalX-Assistent. Ich helfe Ihnen, <b>den passenden Simulator zu wählen</b>, <b>ein Problem zu lösen</b> oder Ihre Fragen zu beantworten."),
    menu: T("Que puis-je faire pour vous ?", "What can I do for you?", "Wie kann ich Ihnen helfen?"),
    nf: T("Je n’ai pas bien compris. Essayez avec d’autres mots, ou choisissez un sujet :",
          "I didn’t quite get that. Try other words, or pick a topic:",
          "Das habe ich nicht verstanden. Versuchen Sie es mit anderen Worten oder wählen Sie ein Thema:"),
    trm: T("Quel est le problème ?", "What’s the problem?", "Worum geht es?"),
    step: T("Étape {i} sur {n}", "Step {i} of {n}", "Schritt {i} von {n}"),
    tro: T("Parfait, c’est réglé ! 🎉 Autre chose ?", "Great, that’s fixed! 🎉 Anything else?", "Super, das Problem ist gelöst! 🎉 Noch etwas?"),
    tre: T("Merci d’avoir tout essayé. Le plus rapide maintenant : écrire à l’équipe avec le modèle de l’appareil, la version d’iOS et ce que vous voyez à l’écran. Réponse sous 24 h en semaine, 48 h le week-end.",
           "Thanks for trying everything. The quickest way now: write to the team with the device model, the iOS version and what you see on screen. Answer within 24 h on weekdays, 48 h at weekends.",
           "Danke, dass Sie alles ausprobiert haben. Am schnellsten geht es jetzt per Nachricht an das Team: Gerätemodell, iOS-Version und was auf dem Bildschirm steht. Antwort innerhalb von 24 Std. werktags, 48 Std. am Wochenende."),
    contact: T("Joignez l’équipe VitalX par le <b>formulaire de contact</b> (devis sous 24 h) ou par e-mail : " + MAILA + ". Je peux préparer votre message.",
               "Reach the VitalX team through the <b>contact form</b> (quote within 24 h) or by email: " + MAILA + ". I can draft your message.",
               "Erreichen Sie das VitalX-Team über das <b>Kontaktformular</b> (Angebot innerhalb von 24 Std.) oder per E-Mail: " + MAILA + ". Ich kann Ihre Nachricht vorbereiten."),
    filled: T("J’ai préparé votre message dans le formulaire de contact : complétez vos coordonnées, relisez, puis envoyez.",
              "I’ve drafted your message in the contact form: add your details, check it, then send it.",
              "Ich habe Ihre Nachricht im Kontaktformular vorbereitet: Ergänzen Sie Ihre Angaben, prüfen Sie den Text und senden Sie ihn ab."),
    reco: T("Mon conseil :", "My recommendation:", "Meine Empfehlung:"),
    alt: T("À regarder aussi :", "Also worth a look:", "Ebenfalls interessant:"),
    footPack: T("Licence à vie incluse. Devis sous 24 h, livraison gratuite en 15 à 30 jours ouvrés.",
                "Lifetime licence included. Quote within 24 h, free delivery in 15 to 30 working days.",
                "Lebenslange Lizenz inklusive. Angebot innerhalb von 24 Std., kostenlose Lieferung in 15 bis 30 Werktagen."),
    footSoft: T("Licence à vie, sans abonnement, mises à jour incluses. Devis sous 24 h.",
                "Lifetime licence, no subscription, updates included. Quote within 24 h.",
                "Lebenslange Lizenz, ohne Abo, Updates inklusive. Angebot innerhalb von 24 Std."),
    pfAny: T("un pack VitalX (configuration à définir)", "a VitalX pack (configuration to be defined)", "ein VitalX-Paket (Konfiguration noch offen)"),
    pf: {
      quote: T("Bonjour,\n\nJe souhaite un devis pour : {p}.\n{need}Nombre de postes : \n\nMerci !",
               "Hello,\n\nI would like a quote for: {p}.\n{need}Number of stations: \n\nThank you!",
               "Guten Tag,\n\nich möchte ein Angebot für: {p}.\n{need}Anzahl der Plätze: \n\nVielen Dank!"),
      need: T("Mon besoin : {a}.\n", "My needs: {a}.\n", "Mein Bedarf: {a}.\n"),
      help: T("Bonjour,\n\nJ’ai besoin d’aide : {pb}.\nJ’ai déjà essayé : {tried}.\n\nAppareil(s) et version d’iOS : \nNuméro de commande (si besoin) : \n\nMerci !",
              "Hello,\n\nI need help: {pb}.\nI have already tried: {tried}.\n\nDevice(s) and iOS version: \nOrder number (if relevant): \n\nThank you!",
              "Guten Tag,\n\nich brauche Hilfe: {pb}.\nBereits versucht: {tried}.\n\nGerät(e) und iOS-Version: \nBestellnummer (falls relevant): \n\nVielen Dank!"),
      help0: T("Bonjour,\n\nJ’ai besoin d’aide : {pb}.\n\nNuméro de commande : \nDescription : \n\nMerci !",
               "Hello,\n\nI need help: {pb}.\n\nOrder number: \nDescription: \n\nThank you!",
               "Guten Tag,\n\nich brauche Hilfe: {pb}.\n\nBestellnummer: \nBeschreibung: \n\nVielen Dank!"),
      demo: T("Bonjour,\n\nJe souhaite une démonstration de VitalX en visio.\nStructure : \nNombre de postes envisagés : \n\nMerci !",
              "Hello,\n\nI would like a video demo of VitalX.\nOrganisation: \nNumber of stations planned: \n\nThank you!",
              "Guten Tag,\n\nich hätte gern eine Video-Demo von VitalX.\nOrganisation: \nGeplante Anzahl der Plätze: \n\nVielen Dank!"),
      other: T("Bonjour,\n\nNous utilisons l’appareil suivant : \nMerci de nous tenir informés si son interface arrive dans VitalX.\n\nMerci !",
               "Hello,\n\nWe use the following device: \nPlease keep us posted if its interface comes to VitalX.\n\nThank you!",
               "Guten Tag,\n\nwir nutzen folgendes Gerät: \nBitte informieren Sie uns, falls seine Oberfläche in VitalX kommt.\n\nVielen Dank!"),
      hello: T("Bonjour,\n\n", "Hello,\n\n", "Guten Tag,\n\n")
    }
  };

  // Réponses du conseil, reprises dans le message préparé
  var N = {
    pub: { secour: T("formations de secourisme", "first-aid training", "Erste-Hilfe-Ausbildung"),
           para: T("pompiers, ambulanciers, paramédical", "fire, ambulance and paramedic training", "Feuerwehr und Rettungsdienst"),
           med: T("soins, urgences, médecins", "nursing, emergency care, physicians", "Pflege, Notaufnahme, Ärzte") },
    grp: { s: T("1 à 5 apprenants", "1 to 5 learners", "1 bis 5 Teilnehmende"),
           m: T("6 à 12 apprenants", "6 to 12 learners", "6 bis 12 Teilnehmende"),
           l: T("plus de 12 apprenants", "more than 12 learners", "mehr als 12 Teilnehmende") },
    prio: { real: T("priorité au réalisme", "realism first", "Realismus zuerst"),
            mobile: T("priorité à la mobilité", "mobility first", "Mobilität zuerst"),
            far: T("écran lisible par tout le groupe", "a screen the whole group can read", "für die ganze Gruppe lesbar") },
    own: { ipad: T("nous avons déjà des iPad", "we already own iPads", "wir haben bereits iPads"),
           pods: T("nous avons déjà un POD’S", "we already own a POD’S", "wir haben bereits einen POD’S") }
  };

  // ── Produits (boutique + fiches techniques) ──────────────────────
  var P = {
    plus: {
      name: T("VitalX Plus", "VitalX Plus", "VitalX Plus"),
      badge: T("Best-seller", "Best-seller", "Bestseller"),
      tag: T("2 iPad 11\" : un moniteur + un poste formateur", "2 × 11\" iPad: one monitor + one trainer station", "2 iPads 11\": ein Monitor + ein Trainerplatz"),
      pts: [
        T("Les 9 interfaces SCHILLER et WEINMANN + le moniteur VitalX", "The 9 SCHILLER and WEINMANN interfaces + the VitalX monitor", "Die 9 SCHILLER- und WEINMANN-Oberflächen + der VitalX-Monitor"),
        T("ECG 12 dérivations, DSA, Media Center, scénarios et évaluation", "12-lead ECG, AED, Media Center, scenarios and assessment", "12-Kanal-EKG, AED, Media Center, Szenarien und Bewertung"),
        T("Boîtier VitalX, housse Bagheera et accessoires (PNI, SpO₂, ECG, EtCO₂, température, patchs)", "VitalX housing, Bagheera case and accessories (NIBP, SpO₂, ECG, EtCO₂, temperature, pads)", "VitalX-Gehäuse, Bagheera-Tasche und Zubehör (NIBP, SpO₂, EKG, EtCO₂, Temperatur, Elektroden)")
      ],
      href: '/fiche-technique.html',
      sl: T("Fiche VitalX Plus", "VitalX Plus datasheet", "Datenblatt VitalX Plus")
    },
    ultra: {
      name: T("VitalX Ultra", "VitalX Ultra", "VitalX Ultra"),
      badge: T("Le plus complet", "The most complete", "Das Komplettpaket"),
      tag: T("iPad Air 13\" moniteur + iPad 11\" formateur", "13\" iPad Air monitor + 11\" iPad trainer", "13\"-iPad-Air-Monitor + 11\"-iPad-Trainer"),
      pts: [
        T("Grand écran 13\" : courbes lisibles par tout le groupe", "Large 13\" screen: curves readable by the whole group", "Großer 13\"-Bildschirm: Kurven für die ganze Gruppe lesbar"),
        T("Châssis V2 redessiné, housse Bagheera V2 Premium", "Redesigned V2 chassis, Bagheera V2 Premium case", "Neu gestaltetes V2-Gehäuse, Bagheera-V2-Premium-Tasche"),
        T("Même logiciel complet que le Plus : SCHILLER, WEINMANN, ECG 12 dérivations, Media Center", "Same full software as the Plus: SCHILLER, WEINMANN, 12-lead ECG, Media Center", "Gleiche Software wie beim Plus: SCHILLER, WEINMANN, 12-Kanal-EKG, Media Center")
      ],
      href: '/fiche-technique-ultimate.html',
      sl: T("Fiche VitalX Ultra", "VitalX Ultra datasheet", "Datenblatt VitalX Ultra")
    },
    pods: {
      name: T("POD’S Pro · POD’S Classic", "POD’S Pro · POD’S Classic", "POD’S Pro · POD’S Classic"),
      badge: T("Compact", "Compact", "Kompakt"),
      tag: T("Le scope sur iPhone 12 / 13, dans une pochette", "The simulator on an iPhone 12 / 13, in a pouch", "Der Simulator auf dem iPhone 12 / 13, in einer Tasche"),
      pts: [
        T("PNI, SpO₂, SpCO, bio et DSA simplifié avec métronome RCP", "NIBP, SpO₂, SpCO, lab values and simplified AED with CPR metronome", "NIBP, SpO₂, SpCO, Laborwerte und vereinfachter AED mit HLW-Metronom"),
        T("Pro : iPad 11\" formateur inclus. Classic : vous pilotez depuis votre propre appareil ou le web", "Pro: 11\" trainer iPad included. Classic: control it from your own device or the web", "Pro: 11\"-Trainer-iPad inklusive. Classic: Steuerung über Ihr eigenes Gerät oder das Web"),
        T("Sans écrans constructeurs ni ECG 12 dérivations (licence VitalX, passage possible à tout moment)", "No manufacturer screens or 12-lead ECG (VitalX licence, upgrade any time)", "Ohne Herstellerbildschirme und 12-Kanal-EKG (VitalX-Lizenz, Upgrade jederzeit möglich)")
      ],
      href: '/vitalx-pods.html',
      sl: T("Fiche POD’S", "POD’S datasheet", "Datenblatt POD’S")
    },
    licence: {
      name: T("Licence VitalX", "VitalX licence", "VitalX-Lizenz"),
      badge: T("Logiciel seul", "Software only", "Nur Software"),
      tag: T("Pour les centres déjà équipés en iPad", "For centres that already own iPads", "Für Zentren mit vorhandenen iPads"),
      pts: [
        T("Un code pour 3 appareils, iPad ou iPhone, moniteur ou formateur", "One code for 3 devices, iPad or iPhone, monitor or trainer", "Ein Code für 3 Geräte, iPad oder iPhone, Monitor oder Trainer"),
        T("Interfaces constructeurs, ECG 12 dérivations, DSA, Media Center, scénarios, formateur iPad et web", "Manufacturer interfaces, 12-lead ECG, AED, Media Center, scenarios, iPad and web trainer", "Herstelleroberflächen, 12-Kanal-EKG, AED, Media Center, Szenarien, Trainer auf iPad und im Web"),
        T("À vie, sans abonnement ; châssis VitalX possible dans le même devis", "For life, no subscription; VitalX chassis available in the same quote", "Lebenslang, ohne Abo; VitalX-Gehäuse im selben Angebot möglich"),
        T("Appareils sous iOS / iPadOS 18 ou plus récent", "Devices on iOS / iPadOS 18 or later", "Geräte mit iOS / iPadOS 18 oder neuer")
      ],
      href: '/boutique.html#licence',
      sl: T("Licences en boutique", "Licences in the shop", "Lizenzen im Shop")
    },
    upgrade: {
      name: T("Passage POD’S → VitalX", "POD’S → VitalX upgrade", "Upgrade POD’S → VitalX"),
      badge: T("Code existant", "Existing code", "Vorhandener Code"),
      tag: T("Votre code POD’S devient une licence VitalX complète", "Your POD’S code becomes a full VitalX licence", "Ihr POD’S-Code wird zur vollständigen VitalX-Lizenz"),
      pts: [
        T("Scope sur iPad, interfaces constructeurs, ECG 12 dérivations", "iPad simulator, manufacturer interfaces, 12-lead ECG", "Simulator auf dem iPad, Herstelleroberflächen, 12-Kanal-EKG"),
        T("Même code, mêmes appareils, activation à distance", "Same code, same devices, remote activation", "Gleicher Code, gleiche Geräte, Freischaltung aus der Ferne"),
        T("Rien à renvoyer : indiquez votre code POD’S dans la demande", "Nothing to send back: include your POD’S code in the request", "Nichts zurückzuschicken: Geben Sie Ihren POD’S-Code in der Anfrage an")
      ],
      href: '/boutique.html#licence',
      sl: T("Licences en boutique", "Licences in the shop", "Lizenzen im Shop")
    }
  };

  // Pourquoi ce conseil
  var W = {
    licence: T("Vous avez déjà des appareils : la licence seule suffit, et un châssis VitalX peut s’ajouter au même devis.",
               "You already have devices: the licence alone is enough, and a VitalX chassis can be added to the same quote.",
               "Sie haben bereits Geräte: Die Lizenz allein genügt, ein VitalX-Gehäuse kann im selben Angebot ergänzt werden."),
    upgrade: T("Vous avez déjà un POD’S : gardez votre code et vos appareils, le passage à VitalX se fait à distance.",
               "You already have a POD’S: keep your code and devices, the upgrade to VitalX is done remotely.",
               "Sie haben bereits einen POD’S: Code und Geräte bleiben, das Upgrade auf VitalX erfolgt aus der Ferne."),
    mobile: T("Vous privilégiez la mobilité : le POD’S tient dans une pochette et se prépare en quelques secondes.",
              "Mobility comes first: the POD’S fits in a pouch and is ready in seconds.",
              "Mobilität steht im Vordergrund: Der POD’S passt in eine Tasche und ist in Sekunden bereit."),
    big: T("Avec plus de 12 apprenants, le grand écran 13\" fait la différence.",
           "With more than 12 learners, the large 13\" screen makes the difference.",
           "Bei mehr als 12 Teilnehmenden macht der große 13\"-Bildschirm den Unterschied."),
    far: T("Vous voulez un écran lisible par tout le groupe : c’est le point fort de l’Ultra.",
           "You want a screen the whole group can read: that is the Ultra’s strength.",
           "Sie möchten einen Bildschirm, den die ganze Gruppe lesen kann: genau die Stärke des Ultra."),
    secour: T("Pour le secourisme en petit groupe, le POD’S couvre l’essentiel : PNI, SpO₂ et DSA.",
              "For first-aid training in small groups, the POD’S covers the essentials: NIBP, SpO₂ and AED.",
              "Für Erste-Hilfe-Kurse in kleinen Gruppen deckt der POD’S das Wesentliche ab: NIBP, SpO₂ und AED."),
    real: T("Pour le réalisme, le Plus reproduit les écrans SCHILLER et WEINMANN avec l’ECG 12 dérivations.",
            "For realism, the Plus reproduces the SCHILLER and WEINMANN screens with a 12-lead ECG.",
            "Für Realismus bildet der Plus die SCHILLER- und WEINMANN-Bildschirme mit 12-Kanal-EKG nach."),
    plus: T("Complet et facile à transporter : le pack le plus choisi, idéal jusqu’à une douzaine d’apprenants.",
            "Complete and easy to carry: our most popular pack, ideal for up to about twelve learners.",
            "Komplett und leicht zu transportieren: unser beliebtestes Paket, ideal für bis zu etwa zwölf Teilnehmende.")
  };

  function reco(a) {
    a = a || {};
    if (a.own === 'ipad') return { p: 'licence', why: W.licence };
    if (a.own === 'pods') return { p: 'upgrade', why: W.upgrade };
    if (a.prio === 'mobile') return { p: 'pods', alt: 'plus', why: W.mobile };
    if (a.prio === 'far' || a.grp === 'l') return { p: 'ultra', alt: 'plus', why: a.grp === 'l' ? W.big : W.far };
    if (a.pub === 'secour' && a.grp === 's' && a.prio !== 'real') return { p: 'pods', alt: 'plus', why: W.secour };
    return { p: 'plus', alt: a.pub === 'secour' && a.grp !== 'm' ? 'pods' : 'ultra', why: a.prio === 'real' ? W.real : W.plus };
  }

  // ── Questions du conseil ─────────────────────────────────────────
  var Q = {
    1: { t: T("Pour commencer : qu’avez-vous déjà ?", "First: what do you already have?", "Zuerst: Was haben Sie bereits?"), o: ['own:none', 'own:ipad', 'own:pods'] },
    2: { t: T("Pour quelles formations ?", "For which kind of training?", "Für welche Ausbildungen?"), o: ['pub:secour', 'pub:para', 'pub:med'] },
    3: { t: T("Combien d’apprenants regardent l’écran en même temps ?", "How many learners watch the screen at the same time?", "Wie viele Teilnehmende schauen gleichzeitig auf den Bildschirm?"), o: ['grp:s', 'grp:m', 'grp:l'] },
    4: { t: T("Qu’est-ce qui compte le plus pour vous ?", "What matters most to you?", "Was ist Ihnen am wichtigsten?"), o: ['prio:real', 'prio:mobile', 'prio:far', 'prio:any'] }
  };

  // ── Dépannage pas à pas (s = étapes [titre, texte] ; info = réponse directe) ──
  var TR = {
    link: {
      l: T("Les appareils ne se connectent pas", "Devices won’t connect", "Geräte verbinden sich nicht"),
      s: [
        [T("Même code de séance", "Same session code", "Gleicher Sitzungscode"),
         T("Le poste formateur crée la séance et affiche un code à 4 caractères. Sur le moniteur, saisissez exactement ce code, lettres et chiffres compris.",
           "The trainer station creates the session and shows a 4-character code. On the monitor, enter exactly that code, letters and digits included.",
           "Der Trainerplatz erstellt die Sitzung und zeigt einen 4-stelligen Code. Geben Sie genau diesen Code am Monitor ein, mit Buchstaben und Ziffern.")],
        [T("Wi-Fi et Bluetooth allumés", "Wi-Fi and Bluetooth on", "WLAN und Bluetooth an"),
         T("Sur les deux appareils, ouvrez le Centre de contrôle : Wi-Fi et Bluetooth activés, mode Avion coupé. La liaison locale fonctionne sans Internet, mais elle a besoin des deux.",
           "On both devices, open Control Centre: Wi-Fi and Bluetooth on, Airplane Mode off. The local link works without internet, but it needs both.",
           "Öffnen Sie auf beiden Geräten das Kontrollzentrum: WLAN und Bluetooth an, Flugmodus aus. Die lokale Verbindung braucht kein Internet, aber beide Funkverbindungen.")],
        [T("Autorisation « Réseau local »", "“Local Network” permission", "Freigabe „Lokales Netzwerk“"),
         T("Sur chaque appareil : <b>Réglages › Confidentialité et sécurité › Réseau local › VitalX Scope</b> activé. Si quelqu’un a répondu « Ne pas autoriser » au premier lancement, la liaison locale est bloquée.",
           "On each device: <b>Settings › Privacy &amp; Security › Local Network › VitalX Scope</b> on. If someone tapped “Don’t Allow” at first launch, the local link is blocked.",
           "Auf jedem Gerät: <b>Einstellungen › Datenschutz &amp; Sicherheit › Lokales Netzwerk › VitalX Scope</b> aktivieren. Wurde beim ersten Start „Nicht erlauben“ gewählt, ist die lokale Verbindung gesperrt.")],
        [T("Même version de l’app", "Same app version", "Gleiche App-Version"),
         T("Mettez à jour VitalX Scope sur les deux appareils : App Store › votre photo de profil › mises à jour disponibles.",
           "Update VitalX Scope on both devices: App Store › your profile picture › available updates.",
           "Aktualisieren Sie VitalX Scope auf beiden Geräten: App Store › Ihr Profilbild › verfügbare Updates.")],
        [T("Relancer dans l’ordre", "Restart in order", "In der richtigen Reihenfolge neu starten"),
         T("Rapprochez les appareils (moins de 10 m). Fermez complètement l’app sur les deux (balayez-la vers le haut dans le sélecteur d’apps), rouvrez d’abord le poste formateur, puis le moniteur. Si possible, reliez-les au même Wi-Fi ou au même partage de connexion.",
           "Bring the devices closer (under 10 m). Fully close the app on both (swipe it up in the app switcher), reopen the trainer station first, then the monitor. If possible, put them on the same Wi-Fi or the same hotspot.",
           "Bringen Sie die Geräte näher zusammen (unter 10 m). Schließen Sie die App auf beiden vollständig (im App-Umschalter nach oben wischen), öffnen Sie zuerst den Trainerplatz, dann den Monitor. Wenn möglich, beide im selben WLAN oder Hotspot verbinden.")]
      ]
    },
    lic: {
      l: T("Mon code de licence ne passe pas", "My licence code is refused", "Mein Lizenzcode wird abgelehnt"),
      s: [
        [T("Recopier le code tel quel", "Enter the code exactly", "Code exakt eingeben"),
         T("Saisissez le code exactement comme vous l’avez reçu, sans espace avant ni après. Le plus sûr : le copier-coller depuis l’e-mail.",
           "Enter the code exactly as you received it, with no space before or after. Safest: copy and paste it from the email.",
           "Geben Sie den Code genau so ein, wie Sie ihn erhalten haben, ohne Leerzeichen davor oder danach. Am sichersten: aus der E-Mail kopieren und einfügen.")],
        [T("Connexion Internet", "Internet connection", "Internetverbindung"),
         T("L’activation vérifie le code en ligne : l’appareil doit être connecté à Internet (Wi-Fi ou 4G / 5G) au moment de la saisie.",
           "Activation checks the code online: the device must be connected to the internet (Wi-Fi or 4G / 5G) when you enter it.",
           "Die Aktivierung prüft den Code online: Das Gerät muss bei der Eingabe mit dem Internet verbunden sein (WLAN oder 4G / 5G).")],
        [T("Le message affiché", "The message shown", "Die angezeigte Meldung"),
         T("<b>« Nombre d’appareils atteint »</b> : un code active 3 appareils au total ; écrivez-nous pour libérer un ancien appareil.<br><b>« Licence introuvable »</b> : le code est mal recopié ou inconnu.<br><b>« Licence expirée »</b> : écrivez-nous, nous vérifions votre licence.",
           "<b>“Nombre d’appareils atteint”</b> (device limit reached): one code activates 3 devices in total; write to us to free an old device.<br><b>“Licence introuvable”</b> (licence not found): the code is mistyped or unknown.<br><b>“Licence expirée”</b> (licence expired): write to us and we will check your licence.",
           "<b>„Nombre d’appareils atteint“</b> (Gerätelimit erreicht): Ein Code aktiviert insgesamt 3 Geräte; schreiben Sie uns, um ein altes Gerät freizugeben.<br><b>„Licence introuvable“</b> (Lizenz nicht gefunden): Der Code ist falsch abgetippt oder unbekannt.<br><b>„Licence expirée“</b> (Lizenz abgelaufen): Schreiben Sie uns, wir prüfen Ihre Lizenz.")]
      ]
    },
    sound: {
      l: T("Pas de son ou pas d’alarme", "No sound or no alarm", "Kein Ton oder kein Alarm"),
      s: [
        [T("Volume et mode silencieux", "Volume and silent mode", "Lautstärke und Stummmodus"),
         T("Montez le volume avec les boutons de l’appareil et désactivez le mode silencieux dans le Centre de contrôle (icône cloche).",
           "Turn the volume up with the device buttons and switch off silent mode in Control Centre (bell icon).",
           "Erhöhen Sie die Lautstärke mit den Gerätetasten und schalten Sie den Stummmodus im Kontrollzentrum aus (Glockensymbol).")],
        [T("Sortie audio", "Audio output", "Audioausgabe"),
         T("Des écouteurs ou une enceinte Bluetooth connectés récupèrent le son : déconnectez-les, ou choisissez l’appareil lui-même dans le Centre de contrôle (bloc audio, icône AirPlay).",
           "Connected headphones or a Bluetooth speaker take the sound: disconnect them, or pick the device itself in Control Centre (audio panel, AirPlay icon).",
           "Verbundene Kopfhörer oder Bluetooth-Lautsprecher übernehmen den Ton: Trennen Sie sie oder wählen Sie im Kontrollzentrum das Gerät selbst (Audiobereich, AirPlay-Symbol).")],
        [T("Alarme en pause sur l’écran simulé", "Alarm paused on the simulated screen", "Alarm am simulierten Gerät pausiert"),
         T("Comme sur le vrai matériel, l’alarme peut être en pause ou coupée (cloche barrée) : réactivez-la avec la touche d’alarme de l’appareil simulé.",
           "Just like on the real device, the alarm can be paused or silenced (crossed-out bell): turn it back on with the simulated device’s alarm key.",
           "Wie am echten Gerät kann der Alarm pausiert oder stummgeschaltet sein (durchgestrichene Glocke): Mit der Alarmtaste des simulierten Geräts wieder einschalten.")]
      ]
    },
    rcp: {
      l: T("Le capteur RCP ne se connecte pas", "The CPR sensor won’t connect", "Der HLW-Sensor verbindet sich nicht"),
      s: [
        [T("Bluetooth autorisé", "Bluetooth allowed", "Bluetooth erlaubt"),
         T("Bluetooth activé dans le Centre de contrôle et autorisé pour l’app : <b>Réglages › VitalX Scope › Bluetooth</b>.",
           "Bluetooth on in Control Centre and allowed for the app: <b>Settings › VitalX Scope › Bluetooth</b>.",
           "Bluetooth im Kontrollzentrum an und für die App erlaubt: <b>Einstellungen › VitalX Scope › Bluetooth</b>.")],
        [T("Capteur prêt", "Sensor ready", "Sensor bereit"),
         T("Capteur chargé et allumé, à quelques mètres au plus de l’appareil.",
           "Sensor charged and switched on, within a few metres of the device.",
           "Sensor geladen und eingeschaltet, höchstens wenige Meter vom Gerät entfernt.")],
        [T("Un seul appareil à la fois", "One device at a time", "Nur ein Gerät gleichzeitig"),
         T("Le capteur ne se relie qu’à un seul appareil : fermez l’app sur les autres iPad, puis relancez-la sur celui qui doit l’utiliser.",
           "The sensor pairs with one device only: close the app on the other iPads, then restart it on the one that should use the sensor.",
           "Der Sensor verbindet sich nur mit einem Gerät: Schließen Sie die App auf den anderen iPads und starten Sie sie auf dem gewünschten Gerät neu.")]
      ]
    },
    web: {
      l: T("Le mode formateur web", "The web trainer mode", "Der Web-Trainermodus"),
      s: [
        [T("Le bon site", "The right website", "Die richtige Adresse"),
         T("Ouvrez " + WEBA + " dans un navigateur à jour (Safari, Chrome, Edge ou Firefox), sur ordinateur ou tablette.",
           "Open " + WEBA + " in an up-to-date browser (Safari, Chrome, Edge or Firefox), on a computer or tablet.",
           "Öffnen Sie " + WEBA + " in einem aktuellen Browser (Safari, Chrome, Edge oder Firefox), am Computer oder Tablet.")],
        [T("Internet des deux côtés", "Internet on both sides", "Internet auf beiden Seiten"),
         T("Le formateur web passe par Internet : l’ordinateur <b>et</b> l’appareil moniteur doivent être connectés (Wi-Fi ou 4G / 5G).",
           "The web trainer goes through the internet: the computer <b>and</b> the monitor device must both be online (Wi-Fi or 4G / 5G).",
           "Der Web-Trainer läuft über das Internet: Computer <b>und</b> Monitorgerät müssen beide online sein (WLAN oder 4G / 5G).")],
        [T("Licence, puis séance", "Licence, then session", "Erst Lizenz, dann Sitzung"),
         T("Saisissez votre code de licence, puis le code de séance à 4 caractères, le même que sur le moniteur. Si la page reste bloquée, rechargez-la.",
           "Enter your licence code, then the 4-character session code, the same as on the monitor. If the page hangs, reload it.",
           "Geben Sie Ihren Lizenzcode und dann den 4-stelligen Sitzungscode ein, denselben wie am Monitor. Hängt die Seite, laden Sie sie neu.")]
      ]
    },
    crash: {
      l: T("L’app plante ou se fige", "The app crashes or freezes", "Die App stürzt ab oder hängt"),
      s: [
        [T("Mettre à jour", "Update", "Aktualisieren"),
         T("Installez la dernière version de VitalX Scope (App Store) et d’iOS / iPadOS (Réglages › Général › Mise à jour logicielle). L’app demande iOS / iPadOS 18 ou plus récent.",
           "Install the latest VitalX Scope (App Store) and iOS / iPadOS (Settings › General › Software Update). The app needs iOS / iPadOS 18 or later.",
           "Installieren Sie die neueste Version von VitalX Scope (App Store) und iOS / iPadOS (Einstellungen › Allgemein › Softwareupdate). Die App braucht iOS / iPadOS 18 oder neuer.")],
        [T("Relancer", "Restart", "Neu starten"),
         T("Fermez complètement l’app (balayez-la vers le haut dans le sélecteur d’apps) puis rouvrez-la. Si le souci revient, redémarrez l’appareil et vérifiez qu’il reste de l’espace (Réglages › Général › Stockage).",
           "Fully close the app (swipe it up in the app switcher) and reopen it. If the issue comes back, restart the device and check there is free space (Settings › General › Storage).",
           "Schließen Sie die App vollständig (im App-Umschalter nach oben wischen) und öffnen Sie sie erneut. Tritt das Problem wieder auf, starten Sie das Gerät neu und prüfen Sie den freien Speicher (Einstellungen › Allgemein › Speicher).")],
        [T("Signaler le bug", "Report the bug", "Fehler melden"),
         T("Sur l’écran d’accueil de l’app, touchez <b>Feedback</b> (en haut à droite) : décrivez les étapes, ce que vous attendiez, et joignez une capture d’écran. Vos retours servent aux corrections des prochaines mises à jour.",
           "On the app’s home screen, tap <b>Feedback</b> (top right): describe the steps, what you expected, and attach a screenshot. Your reports feed the fixes in the next updates.",
           "Tippen Sie auf dem Startbildschirm der App auf <b>Feedback</b> (oben rechts): Beschreiben Sie die Schritte und was Sie erwartet haben, und fügen Sie einen Screenshot bei. Ihre Meldungen fließen in die nächsten Updates ein.")]
      ]
    },
    hw: {
      l: T("Matériel abîmé", "Damaged hardware", "Beschädigte Hardware"),
      info: T("Châssis, housse, câble ou accessoire abîmé : écrivez-nous avec votre <b>numéro de commande</b>, une description et des <b>photos</b> (réponse sous 24 à 48 h ouvrées). Attendez notre numéro de dossier avant tout renvoi. Les iPad et iPhone relèvent de la garantie Apple.",
              "Damaged chassis, case, cable or accessory: email us your <b>order number</b>, a description and <b>photos</b> (answer within 24 to 48 working hours). Wait for our return number before sending anything back. iPads and iPhones are covered by Apple’s warranty.",
              "Gehäuse, Tasche, Kabel oder Zubehör beschädigt: Schreiben Sie uns mit <b>Bestellnummer</b>, Beschreibung und <b>Fotos</b> (Antwort innerhalb von 24 bis 48 Arbeitsstunden). Bitte vor jeder Rücksendung unsere Vorgangsnummer abwarten. iPads und iPhones fallen unter die Apple-Garantie."),
      c: ['msg', 'warranty', 'menu']
    },
    order: {
      l: T("Ma commande", "My order", "Meine Bestellung"),
      info: T("Les packs sont livrés en <b>15 à 30 jours ouvrés</b> après confirmation de la commande ; le numéro de suivi vous est envoyé dès qu’il est disponible. Pour une commande en cours, écrivez-nous avec votre numéro de commande.",
              "Packs are delivered within <b>15 to 30 working days</b> of order confirmation; you get the tracking number as soon as it is available. For an order in progress, email us your order number.",
              "Pakete werden innerhalb von <b>15 bis 30 Werktagen</b> nach Bestellbestätigung geliefert; die Sendungsnummer erhalten Sie, sobald sie vorliegt. Für eine laufende Bestellung schreiben Sie uns mit Ihrer Bestellnummer."),
      c: ['msg', 'mail', 'menu']
    }
  };
  var TRK = ['tr:link', 'tr:lic', 'tr:sound', 'tr:rcp', 'tr:web', 'tr:crash', 'tr:hw', 'tr:order'];

  // ── Questions fréquentes (a = réponse, c = boutons) ──────────────
  var F = {
    greet: { a: T("Bonjour ! Que puis-je faire pour vous ?", "Hello! What can I do for you?", "Hallo! Wie kann ich Ihnen helfen?") },
    thanks: { a: T("Avec plaisir ! Autre chose ?", "You’re welcome! Anything else?", "Gern geschehen! Noch etwas?") },
    price: {
      a: T("Les packs et la licence sont <b>sur devis</b> : le prix dépend de la configuration et du nombre de postes. Réponse <b>sous 24 h</b>, avec un devis adapté aux achats des SDIS, associations et centres de formation. Seuls les écussons se paient en ligne (7,90 €).",
           "Packs and licences are <b>priced on request</b>: the price depends on the configuration and the number of stations. You get an answer <b>within 24 hours</b>, with a quote suited to the purchasing rules of fire services, associations and training centres. Only the patches are sold online (€7.90).",
           "Pakete und Lizenzen gibt es <b>auf Anfrage</b>: Der Preis hängt von der Konfiguration und der Anzahl der Plätze ab. Sie erhalten <b>innerhalb von 24 Stunden</b> ein Angebot, passend zu den Einkaufsregeln von Feuerwehren, Vereinen und Ausbildungszentren. Nur die Aufnäher werden online verkauft (7,90 €)."),
      c: ['quote', 'adv', 'menu']
    },
    dw: {
      a: T("<b>Livraison</b> : packs livrés gratuitement en 15 à 30 jours ouvrés, en France et en Europe, avec numéro de suivi.<br><b>Garantie</b> : housse Bagheera et châssis VitalX 10 ans, accessoires 1 an, iPad et iPhone sous garantie Apple. La licence est à vie.",
           "<b>Delivery</b>: packs ship free within 15 to 30 working days, in France and Europe, with tracking.<br><b>Warranty</b>: Bagheera case and VitalX chassis 10 years, accessories 1 year, iPads and iPhones under Apple’s warranty. The licence is for life.",
           "<b>Lieferung</b>: Pakete kostenlos in 15 bis 30 Werktagen, in Frankreich und Europa, mit Sendungsverfolgung.<br><b>Garantie</b>: Bagheera-Tasche und VitalX-Gehäuse 10 Jahre, Zubehör 1 Jahr, iPads und iPhones über die Apple-Garantie. Die Lizenz gilt lebenslang."),
      c: ['warranty', 'cgv', 'menu']
    },
    delivery: {
      a: T("Les packs sont livrés <b>gratuitement</b> en <b>15 à 30 jours ouvrés</b> après confirmation de la commande, en France et en Europe ; le numéro de suivi suit dès qu’il est disponible. Les iPad arrivent non configurés : installez VitalX Scope depuis l’App Store et saisissez votre code. Écussons : livraison 3,80 € (France, Belgique, Suisse, Luxembourg).",
           "Packs ship <b>free of charge</b> within <b>15 to 30 working days</b> of order confirmation, in France and Europe; the tracking number follows as soon as it is available. iPads arrive unconfigured: install VitalX Scope from the App Store and enter your code. Patches: €3.80 shipping (France, Belgium, Switzerland, Luxembourg).",
           "Pakete werden <b>kostenlos</b> innerhalb von <b>15 bis 30 Werktagen</b> nach Bestellbestätigung geliefert, in Frankreich und Europa; die Sendungsnummer folgt, sobald sie vorliegt. Die iPads kommen unkonfiguriert: VitalX Scope aus dem App Store installieren und den Code eingeben. Aufnäher: Versand 3,80 € (Frankreich, Belgien, Schweiz, Luxemburg)."),
      c: ['quote', 'tr:order', 'menu']
    },
    payment: {
      a: T("Packs et licences : paiement à la commande, par carte via Stripe ou par <b>virement sur facture</b> ; les clients publics peuvent envoyer un <b>bon de commande</b>. Écussons : paiement en ligne sécurisé (Visa, Mastercard, Apple Pay, PayPal). TVA non applicable, art. 293 B du CGI.",
           "Packs and licences: payment with the order, by card via Stripe or by <b>bank transfer on invoice</b>; public buyers can send a <b>purchase order</b>. Patches: secure online payment (Visa, Mastercard, Apple Pay, PayPal). No VAT charged (French tax code, art. 293 B).",
           "Pakete und Lizenzen: Zahlung bei Bestellung, per Karte über Stripe oder per <b>Überweisung auf Rechnung</b>; öffentliche Auftraggeber können eine <b>Bestellung</b> schicken. Aufnäher: sichere Online-Zahlung (Visa, Mastercard, Apple Pay, PayPal). Keine Mehrwertsteuer (Art. 293 B des frz. Steuergesetzbuchs)."),
      c: ['quote', 'menu']
    },
    public: {
      a: T("Oui : nos devis suivent les procédures d’achat des <b>SDIS, associations et centres de formation</b>. Pour un client public, la commande est ferme à réception du <b>bon de commande</b>, et le paiement se fait par virement sur facture. Un devis est valable 30 jours.",
           "Yes: our quotes follow the purchasing procedures of <b>fire services, associations and training centres</b>. For public buyers, the order is confirmed when we receive the <b>purchase order</b>, and payment is made by bank transfer on invoice. A quote is valid for 30 days.",
           "Ja: Unsere Angebote folgen den Beschaffungsverfahren von <b>Feuerwehren, Vereinen und Ausbildungszentren</b>. Bei öffentlichen Auftraggebern gilt die Bestellung mit Eingang des <b>Bestellscheins</b>, die Zahlung erfolgt per Überweisung auf Rechnung. Ein Angebot gilt 30 Tage."),
      c: ['quote', 'menu']
    },
    vat: {
      a: T("VitalX est une micro-entreprise : <b>TVA non applicable</b> (art. 293 B du CGI). Le montant du devis est donc le montant à payer, et une facture est établie pour chaque commande.",
           "VitalX is a French micro-enterprise: <b>no VAT is charged</b> (French tax code, art. 293 B). The amount on the quote is the amount you pay, and an invoice is issued for every order.",
           "VitalX ist ein französisches Kleinunternehmen: <b>keine Mehrwertsteuer</b> (Art. 293 B des frz. Steuergesetzbuchs). Der Angebotsbetrag ist der Endbetrag, und für jede Bestellung wird eine Rechnung ausgestellt."),
      c: ['quote', 'menu']
    },
    warranty: {
      a: T("<b>Housse Bagheera</b> et <b>châssis VitalX</b> : 10 ans · <b>accessoires</b> (brassard, câbles, capteurs) : 1 an, hors usure · <b>iPad neufs</b> : garantie Apple 1 an (reconditionnés : 1 an) · <b>licence</b> : à vie.<br>En cas de souci, écrivez-nous avec votre numéro de commande, une description et des photos : réponse sous 24 à 48 h ouvrées.",
           "<b>Bagheera case</b> and <b>VitalX chassis</b>: 10 years · <b>accessories</b> (cuff, cables, sensors): 1 year, excluding wear · <b>new iPads</b>: 1-year Apple warranty (refurbished: 1 year) · <b>licence</b>: for life.<br>If something goes wrong, email us your order number, a description and photos: answer within 24 to 48 working hours.",
           "<b>Bagheera-Tasche</b> und <b>VitalX-Gehäuse</b>: 10 Jahre · <b>Zubehör</b> (Manschette, Kabel, Sensoren): 1 Jahr, ohne Verschleiß · <b>neue iPads</b>: 1 Jahr Apple-Garantie (generalüberholt: 1 Jahr) · <b>Lizenz</b>: lebenslang.<br>Im Problemfall schreiben Sie uns mit Bestellnummer, Beschreibung und Fotos: Antwort innerhalb von 24 bis 48 Arbeitsstunden."),
      c: ['warranty', 'tr:hw', 'menu']
    },
    refund: {
      a: T("Particuliers : <b>14 jours</b> après réception pour vous rétracter. Le matériel revient complet et en parfait état, les iPad non déballés et non activés dans leur emballage scellé ; remboursement sous 14 jours. Une licence déjà activée ne peut plus être rétractée. Avant tout retour, demandez-nous un numéro de dossier.",
           "Consumers have <b>14 days</b> after delivery to withdraw. Items must come back complete and in perfect condition, iPads unopened and not activated in their sealed packaging; refund within 14 days. A licence that has been activated can no longer be withdrawn. Before any return, ask us for a return number.",
           "Verbraucher haben nach Erhalt <b>14 Tage</b> Widerrufsrecht. Die Ware muss vollständig und einwandfrei zurückkommen, iPads ungeöffnet und nicht aktiviert in der versiegelten Verpackung; Erstattung innerhalb von 14 Tagen. Eine bereits aktivierte Lizenz kann nicht widerrufen werden. Vor jeder Rücksendung bitte eine Vorgangsnummer anfordern."),
      c: ['cgv', 'retract', 'menu']
    },
    licence: {
      a: T("La licence VitalX est <b>à vie</b>, sans abonnement : mises à jour et nouvelles interfaces incluses. Un code active <b>3 appareils</b> au total (iPad ou iPhone, moniteur ou formateur). Installation : VitalX Scope sur l’App Store, saisie du code, prêt en 30 secondes. La licence POD’S couvre le scope iPhone et le mode formateur ; la licence VitalX ajoute les scopes iPad et les interfaces constructeurs.",
           "The VitalX licence is <b>for life</b>, with no subscription: updates and new interfaces included. One code activates <b>3 devices</b> in total (iPad or iPhone, monitor or trainer). Setup: VitalX Scope from the App Store, enter the code, ready in 30 seconds. The POD’S licence covers the iPhone simulator and the trainer mode; the VitalX licence adds the iPad simulators and the manufacturer interfaces.",
           "Die VitalX-Lizenz gilt <b>lebenslang</b>, ohne Abo: Updates und neue Oberflächen inklusive. Ein Code aktiviert insgesamt <b>3 Geräte</b> (iPad oder iPhone, Monitor oder Trainer). Einrichtung: VitalX Scope aus dem App Store, Code eingeben, in 30 Sekunden startklar. Die POD’S-Lizenz umfasst den iPhone-Simulator und den Trainermodus; die VitalX-Lizenz ergänzt die iPad-Simulatoren und die Herstelleroberflächen."),
      c: ['sheet:licence', 'tr:lic', 'menu']
    },
    devices: {
      a: T("Les appareils reproduits écran par écran :<ul><li><b>SCHILLER</b> : DEFIGARD Touch 7, PHYSIOGARD Touch 7, ARGUS PRO LifeCare 3, DEFIGARD HD-7, MAGLIFE RT-1, MAGSCREEN RT-1</li><li><b>WEINMANN</b> : MEDUCORE Standard², MEDUMAT Standard², MEDUVENT Standard</li><li>le <b>moniteur VitalX</b></li></ul>Interfaces reproduites avec l’autorisation de leurs fabricants, incluses dans la licence VitalX.",
           "Devices reproduced screen by screen:<ul><li><b>SCHILLER</b>: DEFIGARD Touch 7, PHYSIOGARD Touch 7, ARGUS PRO LifeCare 3, DEFIGARD HD-7, MAGLIFE RT-1, MAGSCREEN RT-1</li><li><b>WEINMANN</b>: MEDUCORE Standard², MEDUMAT Standard², MEDUVENT Standard</li><li>the <b>VitalX monitor</b></li></ul>Interfaces reproduced with their manufacturers’ permission, included in the VitalX licence.",
           "Bildschirm für Bildschirm nachgebildete Geräte:<ul><li><b>SCHILLER</b>: DEFIGARD Touch 7, PHYSIOGARD Touch 7, ARGUS PRO LifeCare 3, DEFIGARD HD-7, MAGLIFE RT-1, MAGSCREEN RT-1</li><li><b>WEINMANN</b>: MEDUCORE Standard², MEDUMAT Standard², MEDUVENT Standard</li><li>der <b>VitalX-Monitor</b></li></ul>Oberflächen mit Genehmigung der Hersteller nachgebildet, in der VitalX-Lizenz enthalten."),
      c: ['devices', 'adv', 'menu']
    },
    otherbrands: {
      a: T("Aujourd’hui, VitalX reproduit les appareils <b>SCHILLER</b> et <b>WEINMANN</b>, ainsi que son propre moniteur. D’autres constructeurs sont en discussion, <b>sans date ni garantie</b>. Dites-nous quel appareil vous utilisez : cela nous aide à choisir les prochains.",
           "Today VitalX reproduces <b>SCHILLER</b> and <b>WEINMANN</b> devices, plus its own monitor. Talks with other manufacturers are under way, <b>with no date and no guarantee</b>. Tell us which device you use: it helps us choose the next ones.",
           "Derzeit bildet VitalX Geräte von <b>SCHILLER</b> und <b>WEINMANN</b> sowie den eigenen Monitor nach. Gespräche mit weiteren Herstellern laufen, <b>ohne Termin und ohne Garantie</b>. Sagen Sie uns, welches Gerät Sie nutzen: Das hilft uns bei der Auswahl."),
      c: ['other', 'devices', 'menu']
    },
    compat: {
      a: T("VitalX Scope fonctionne sur <b>iPad et iPhone</b> sous <b>iOS / iPadOS 18</b> ou plus récent (App Store). Il n’existe pas de version Android. Le poste formateur s’ouvre aussi dans un navigateur, sur ordinateur : " + WEBA + ".",
           "VitalX Scope runs on <b>iPad and iPhone</b> with <b>iOS / iPadOS 18</b> or later (App Store). There is no Android version. The trainer station also opens in a web browser on a computer: " + WEBA + ".",
           "VitalX Scope läuft auf <b>iPad und iPhone</b> mit <b>iOS / iPadOS 18</b> oder neuer (App Store). Eine Android-Version gibt es nicht. Der Trainerplatz lässt sich auch im Browser am Computer öffnen: " + WEBA + "."),
      c: ['adv', 'menu']
    },
    offline: {
      a: T("Pas besoin d’Internet pendant la séance : le formateur et les moniteurs se relient <b>en local</b>, en Wi-Fi ou Bluetooth, avec un code à 4 caractères. Internet sert à activer la licence, à mettre l’app à jour et au formateur web.",
           "No internet needed during a session: the trainer and the monitors connect <b>locally</b>, over Wi-Fi or Bluetooth, with a 4-character code. Internet is used to activate the licence, to update the app and for the web trainer.",
           "Während der Übung braucht es kein Internet: Trainer und Monitore verbinden sich <b>lokal</b> über WLAN oder Bluetooth, mit einem 4-stelligen Code. Internet wird für die Lizenzaktivierung, App-Updates und den Web-Trainer gebraucht."),
      c: ['tr:link', 'menu']
    },
    web: {
      a: T("Le formateur peut piloter la séance depuis un navigateur, sans installation : " + WEBA + ". Saisissez votre code de licence, puis le code de séance. Ce mode passe par Internet : l’ordinateur et l’appareil moniteur doivent être connectés.",
           "The trainer can run the session from a web browser, with nothing to install: " + WEBA + ". Enter your licence code, then the session code. This mode goes through the internet: the computer and the monitor device must both be online.",
           "Der Trainer kann die Übung ohne Installation im Browser steuern: " + WEBA + ". Lizenzcode eingeben, dann den Sitzungscode. Dieser Modus läuft über das Internet: Computer und Monitorgerät müssen beide online sein."),
      c: ['webapp', 'tr:web', 'menu']
    },
    academy: {
      a: T("<b>ACADEMY</b> apprend la RCP en jouant, avec quatre modes : Course RCP, Mission solo, Fusée RCP et Corps & RCP. Avec un <b>capteur Bluetooth</b> posé sur le mannequin, le tableau de bord RCP mesure fréquence, profondeur et relâchement, avec un score sur 100 et une épreuve de 2 minutes. Parlez du capteur dans votre demande de devis.",
           "<b>ACADEMY</b> teaches CPR through play, with four modes: CPR Race, Solo Mission, CPR Rocket and Body &amp; CPR. With a <b>Bluetooth sensor</b> on the manikin, the CPR dashboard measures rate, depth and recoil, with a score out of 100 and a 2-minute challenge. Mention the sensor in your quote request.",
           "<b>ACADEMY</b> vermittelt HLW spielerisch, mit vier Modi: HLW-Rennen, Solo-Mission, HLW-Rakete und Körper &amp; HLW. Mit einem <b>Bluetooth-Sensor</b> auf der Puppe misst das HLW-Dashboard Frequenz, Tiefe und Entlastung, mit Punktzahl von 100 und einem 2-Minuten-Test. Erwähnen Sie den Sensor in Ihrer Angebotsanfrage."),
      c: ['academyLink', 'quote', 'menu']
    },
    media: {
      a: T("Le <b>Media Center</b> complète le scope : dossier patient (DLU) et compte rendu d’analyses, gaz du sang analysés par l’apprenant, lecteurs de glycémie, lactates, HémoCue et CO, 37 clichés de radiographie, bandelette urinaire à 10 tests, archive ECG et journal de séance pour le débriefing.",
           "The <b>Media Center</b> completes the simulator: patient record and lab report, blood gases analysed by the learner, glucose, lactate, HemoCue and CO meters, 37 X-ray images, a 10-test urine dipstick, an ECG archive and a session log for the debriefing.",
           "Das <b>Media Center</b> ergänzt den Simulator: Patientenakte und Laborbefund, Blutgase, die der Lernende selbst analysiert, Messgeräte für Glukose, Laktat, HemoCue und CO, 37 Röntgenbilder, ein Urinteststreifen mit 10 Feldern, ein EKG-Archiv und ein Sitzungsprotokoll für das Debriefing."),
      c: ['mediaLink', 'menu']
    },
    ecg: {
      a: T("Le formateur envoie <b>plus de 20 rythmes</b> en un toucher (sinusal, STEMI, FA, FV, BAV, torsades, pacemaker…), avec leurs variantes, sur <b>12 dérivations</b>. Un éditeur retouche ondes, ST et intervalles, et chaque électrode peut être débranchée : les dérivations concernées disparaissent.",
           "The trainer sends <b>more than 20 rhythms</b> in one tap (sinus, STEMI, AF, VF, AV block, torsades, pacemaker…), with their variants, on <b>12 leads</b>. An editor adjusts waves, ST and intervals, and each electrode can be disconnected: the affected leads disappear.",
           "Der Trainer sendet <b>über 20 Rhythmen</b> mit einem Tipp (Sinus, STEMI, VHF, Kammerflimmern, AV-Block, Torsades, Schrittmacher …), mit Varianten, auf <b>12 Ableitungen</b>. Ein Editor passt Wellen, ST und Intervalle an, und jede Elektrode lässt sich abziehen: Die betroffenen Ableitungen verschwinden."),
      c: ['trainerLink', 'menu']
    },
    scenarios: {
      a: T("Patients prêts en un toucher ou <b>scénarios minutés</b> qui font évoluer constantes, rythme et capteurs à T+mm:ss, avec une bibliothèque par public (PSE 1, PSE 2, paramédical, médecin) et un éditeur pour créer les vôtres. Le tiroir <b>ÉVAL</b> propose des grilles (PSE 1, PSE 2, Bilan Flash ou la vôtre), calcule le score et exporte la fiche en PDF.",
           "Patients ready in one tap, or <b>timed scenarios</b> that change vital signs, rhythm and sensors at T+mm:ss, with a library by audience (first aid, paramedic, physician) and an editor to build your own. The <b>EVAL</b> drawer offers assessment grids (or your own), calculates the score and exports the sheet as a PDF.",
           "Patienten mit einem Tipp oder <b>zeitgesteuerte Szenarien</b>, die Vitalwerte, Rhythmus und Sensoren bei T+mm:ss ändern, mit einer Bibliothek nach Zielgruppe (Erste Hilfe, Rettungsdienst, Ärzte) und einem Editor für eigene Fälle. Die Schublade <b>ÉVAL</b> bietet Bewertungsbögen (auch eigene), berechnet die Punktzahl und exportiert den Bogen als PDF."),
      c: ['trainerLink', 'menu']
    },
    ultramode: {
      a: T("Les respirateurs <b>WEINMANN MEDUMAT Standard²</b> et <b>MEDUVENT Standard</b> font partie des interfaces. Le <b>Mode Ultra</b> est une extension en option, en achat unique : GUARDIAN, NEXUS (scope IAO), CTG et VENT. Demandez-le dans votre devis.",
           "The <b>WEINMANN MEDUMAT Standard²</b> and <b>MEDUVENT Standard</b> ventilators are part of the interfaces. <b>Ultra Mode</b> is an optional one-time-purchase extension: GUARDIAN, NEXUS (triage monitor), CTG and VENT. Ask for it in your quote.",
           "Die Beatmungsgeräte <b>WEINMANN MEDUMAT Standard²</b> und <b>MEDUVENT Standard</b> gehören zu den Oberflächen. Der <b>Ultra-Modus</b> ist eine optionale Erweiterung zum Einmalpreis: GUARDIAN, NEXUS (Triage-Monitor), CTG und VENT. Fragen Sie im Angebot danach."),
      c: ['quote', 'menu']
    },
    demo: {
      a: T("Avec plaisir ! Demandez une <b>démonstration en visio</b> : je prépare le message, vous ajoutez votre structure et le nombre de postes envisagés.",
           "With pleasure! Request a <b>video demo</b>: I’ll draft the message, you add your organisation and the number of stations you have in mind.",
           "Gern! Fordern Sie eine <b>Video-Demo</b> an: Ich bereite die Nachricht vor, Sie ergänzen Ihre Organisation und die geplante Anzahl der Plätze."),
      c: ['demo', 'menu']
    },
    trainer: {
      a: T("Le formateur pilote tout depuis <b>un seul iPad</b> (ou un iPhone, ou un navigateur sur " + WEBA + ") : constantes en direct et tendances, rythmes ECG, arrêt cardiaque et choc, capteurs débranchés, scénarios, Media Center et évaluation.",
           "The trainer controls everything from <b>a single iPad</b> (or an iPhone, or a browser at " + WEBA + "): live vital signs and trends, ECG rhythms, cardiac arrest and shocks, disconnected sensors, scenarios, Media Center and assessment.",
           "Der Trainer steuert alles von <b>einem einzigen iPad</b> aus (oder einem iPhone oder im Browser unter " + WEBA + "): Vitalwerte live und Trends, EKG-Rhythmen, Herzstillstand und Schock, abgezogene Sensoren, Szenarien, Media Center und Bewertung."),
      c: ['trainerLink', 'adv', 'menu']
    },
    included: {
      a: T("<b>VitalX Plus</b> : 2 iPad 11\", boîtier VitalX, housse Bagheera, brassard PNI adulte et enfant, capteur SpO₂, câble ECG 12 dérivations, capteur EtCO₂, sonde de température, 30 patchs ECG, patchs DSA adulte et enfant, 2 verres trempés.<br><b>VitalX Ultra</b> : iPad Air 13\" + iPad 11\", châssis V2, housse Bagheera V2 Premium, connectique complète, verres trempés, coque iPad 11\".<br>La licence à vie est incluse dans chaque pack.",
           "<b>VitalX Plus</b>: 2 × 11\" iPads, VitalX housing, Bagheera case, adult and child NIBP cuffs, SpO₂ sensor, 12-lead ECG cable, EtCO₂ sensor, temperature probe, 30 ECG electrodes, adult and child AED pads, 2 tempered-glass screen protectors.<br><b>VitalX Ultra</b>: 13\" iPad Air + 11\" iPad, V2 chassis, Bagheera V2 Premium case, full set of connectors, tempered glass, 11\" iPad case.<br>The lifetime licence is included in every pack.",
           "<b>VitalX Plus</b>: 2 iPads 11\", VitalX-Gehäuse, Bagheera-Tasche, NIBP-Manschette für Erwachsene und Kinder, SpO₂-Sensor, 12-Kanal-EKG-Kabel, EtCO₂-Sensor, Temperatursonde, 30 EKG-Elektroden, AED-Pads für Erwachsene und Kinder, 2 Panzergläser.<br><b>VitalX Ultra</b>: 13\"-iPad-Air + 11\"-iPad, V2-Gehäuse, Bagheera-V2-Premium-Tasche, komplette Anschlüsse, Panzerglas, Hülle für das 11\"-iPad.<br>Die lebenslange Lizenz ist in jedem Paket enthalten."),
      c: ['sheet:plus', 'sheet:ultra', 'menu']
    },
    multi: {
      a: T("Un code de licence active <b>3 appareils</b> au total, par exemple 1 formateur et 2 moniteurs, et plusieurs moniteurs peuvent suivre la même séance. Pour équiper un groupe plus large, demandez un devis avec le nombre de postes.",
           "One licence code activates <b>3 devices</b> in total, for example 1 trainer and 2 monitors, and several monitors can follow the same session. To equip a larger group, ask for a quote with the number of stations.",
           "Ein Lizenzcode aktiviert insgesamt <b>3 Geräte</b>, zum Beispiel 1 Trainer und 2 Monitore, und mehrere Monitore können derselben Sitzung folgen. Für größere Gruppen fragen Sie ein Angebot mit der Anzahl der Plätze an."),
      c: ['quote', 'menu']
    },
    onboarding: {
      a: T("Chaque pack inclut une <b>prise en main de 30 minutes en visio</b> : réservez votre créneau après réception de la commande à " + MAILA + ". Le support répond 7 j/7, sous 24 à 48 h.",
           "Every pack includes a <b>30-minute onboarding session by video</b>: book your slot after delivery at " + MAILA + ". Support answers 7 days a week, within 24 to 48 h.",
           "Jedes Paket enthält eine <b>30-minütige Einweisung per Video</b>: Buchen Sie Ihren Termin nach Erhalt der Bestellung unter " + MAILA + ". Der Support antwortet 7 Tage die Woche, innerhalb von 24 bis 48 Std."),
      c: ['mail', 'menu']
    },
    support: {
      a: T("Le support répond <b>7 j/7</b> : sous 24 h en semaine, 48 h le week-end, et sous 12 h pour une urgence SAV justifiée. E-mail : " + MAILA + ".",
           "Support answers <b>7 days a week</b>: within 24 h on weekdays, 48 h at weekends, and within 12 h for a justified after-sales emergency. Email: " + MAILA + ".",
           "Der Support antwortet <b>7 Tage die Woche</b>: innerhalb von 24 Std. werktags, 48 Std. am Wochenende und innerhalb von 12 Std. bei einem begründeten Notfall. E-Mail: " + MAILA + "."),
      c: ['contact', 'menu']
    },
    affiliation: {
      a: T("Programme <b>apporteurs d’affaires</b> : vous recommandez VitalX (caserne, association, IFSI…), nous concluons la vente et vous touchez une <b>commission</b> sur chaque vente, sans plafond. Déclarez le contact avant notre premier échange avec lui ; la commission est versée par virement après encaissement et délai de rétractation.",
           "<b>Referral programme</b>: you recommend VitalX (fire station, association, nursing school…), we close the sale and you earn a <b>commission</b> on every sale, with no cap. Declare the contact before our first exchange with them; the commission is paid by bank transfer once the payment is received and the withdrawal period has passed.",
           "<b>Empfehlungsprogramm</b>: Sie empfehlen VitalX (Feuerwache, Verein, Pflegeschule …), wir schließen den Verkauf ab und Sie erhalten für jeden Verkauf eine <b>Provision</b>, ohne Obergrenze. Melden Sie den Kontakt vor unserem ersten Gespräch mit ihm; die Provision wird nach Zahlungseingang und Ablauf der Widerrufsfrist überwiesen."),
      c: ['affLink', 'menu']
    },
    about: {
      a: T("VitalX est une entreprise française fondée par <b>Yann Usseglio</b>, ambulancier en lien avec le SAMU et formateur de secourisme. Les scopes sont <b>conçus et assemblés en France</b>, pour rendre la simulation accessible sans rogner sur le réalisme.",
           "VitalX is a French company founded by <b>Yann Usseglio</b>, an ambulance professional working with the SAMU emergency service and a first-aid instructor. The simulators are <b>designed and assembled in France</b>, to make simulation affordable without cutting corners on realism.",
           "VitalX ist ein französisches Unternehmen, gegründet von <b>Yann Usseglio</b>, Rettungssanitäter in Zusammenarbeit mit dem SAMU und Erste-Hilfe-Ausbilder. Die Simulatoren werden <b>in Frankreich entwickelt und montiert</b>, damit Simulation bezahlbar wird, ohne beim Realismus zu sparen."),
      c: ['aboutLink', 'menu']
    },
    patches: {
      a: T("Trois écussons en PVC 3D souple, thermocollants, à <b>7,90 €</b> : Chat Noir, VitalX 2K26 et Stop Blood. Paiement en ligne, livraison 3,80 € (France, Belgique, Suisse, Luxembourg).",
           "Three soft 3D PVC iron-on patches at <b>€7.90</b>: Chat Noir, VitalX 2K26 and Stop Blood. Online payment, €3.80 shipping (France, Belgium, Switzerland, Luxembourg).",
           "Drei Aufnäher aus weichem 3D-PVC zum Aufbügeln für <b>7,90 €</b>: Chat Noir, VitalX 2K26 und Stop Blood. Online-Zahlung, Versand 3,80 € (Frankreich, Belgien, Schweiz, Luxemburg)."),
      c: ['patchLink', 'menu']
    },
    medical: {
      a: T("VitalX est un <b>outil de formation</b>, pas un dispositif médical : rien n’est mesuré sur une vraie personne, tout est simulé. Ne l’utilisez jamais pour un diagnostic ou une décision médicale réelle.",
           "VitalX is a <b>training tool</b>, not a medical device: nothing is measured on a real person, everything is simulated. Never use it for a real diagnosis or medical decision.",
           "VitalX ist ein <b>Ausbildungswerkzeug</b>, kein Medizinprodukt: Es wird nichts an echten Personen gemessen, alles ist simuliert. Nie für echte Diagnosen oder medizinische Entscheidungen verwenden."),
      c: ['menu']
    },
    privacy: {
      a: T("Cet assistant fonctionne entièrement dans votre navigateur : vos messages ne sont <b>ni envoyés ni stockés</b> sur un serveur et disparaissent à la fermeture de l’onglet. Pour le reste du site, voir la politique de confidentialité.",
           "This assistant runs entirely in your browser: your messages are <b>neither sent nor stored</b> on a server and disappear when you close the tab. For the rest of the site, see the privacy policy.",
           "Dieser Assistent läuft vollständig in Ihrem Browser: Ihre Nachrichten werden <b>weder gesendet noch auf einem Server gespeichert</b> und verschwinden beim Schließen des Tabs. Für die übrige Website siehe die Datenschutzerklärung."),
      c: ['privLink', 'menu']
    },
    languages: {
      a: T("Le site existe en français, anglais et allemand. L’application VitalX Scope est conçue en français ; pour un usage dans une autre langue, écrivez-nous.",
           "The website is available in French, English and German. The VitalX Scope app is designed in French; for use in another language, write to us.",
           "Die Website gibt es auf Französisch, Englisch und Deutsch. Die App VitalX Scope ist auf Französisch ausgelegt; für eine andere Sprache schreiben Sie uns."),
      c: ['contact', 'menu']
    },
    compare: {
      a: T("<b>VitalX Plus</b> : 2 iPad 11\", le best-seller, complet et facile à transporter.<br><b>VitalX Ultra</b> : moniteur iPad Air 13\" lisible de loin, châssis V2 et housse premium.<br><b>POD’S Classic / Pro</b> : le scope sur iPhone, très compact ; sans écrans constructeurs ni ECG 12 dérivations.<br><b>Licence seule</b> : si vous avez déjà vos iPad.<br>Plus, Ultra et licence seule ont le même logiciel et la même licence à vie.",
           "<b>VitalX Plus</b>: 2 × 11\" iPads, the best-seller, complete and easy to carry.<br><b>VitalX Ultra</b>: 13\" iPad Air monitor readable from afar, V2 chassis and premium case.<br><b>POD’S Classic / Pro</b>: the simulator on an iPhone, very compact; no manufacturer screens or 12-lead ECG.<br><b>Licence only</b>: if you already own iPads.<br>Plus, Ultra and licence only share the same software and the same lifetime licence.",
           "<b>VitalX Plus</b>: 2 iPads 11\", der Bestseller, komplett und leicht zu transportieren.<br><b>VitalX Ultra</b>: 13\"-iPad-Air-Monitor, auch aus der Ferne lesbar, V2-Gehäuse und Premium-Tasche.<br><b>POD’S Classic / Pro</b>: der Simulator auf dem iPhone, sehr kompakt; ohne Herstellerbildschirme und 12-Kanal-EKG.<br><b>Nur Lizenz</b>: wenn Sie bereits iPads haben.<br>Plus, Ultra und Lizenz haben dieselbe Software und dieselbe lebenslange Lizenz."),
      c: ['adv', 'sheet:plus', 'sheet:ultra', 'sheet:pods']
    }
  };

  // ── Boutons (l = libellé, href = lien, pri = bouton principal) ──
  var C = {
    menu: { l: T("Menu", "Menu", "Menü") },
    adv: { l: T("🧭 Choisir mon scope", "🧭 Choose my simulator", "🧭 Simulator auswählen") },
    again: { l: T("Refaire le conseil", "Start the advice again", "Beratung neu starten") },
    tr: { l: T("🛠 Résoudre un problème", "🛠 Fix a problem", "🛠 Problem lösen") },
    price: { l: T("💶 Prix et devis", "💶 Prices and quotes", "💶 Preise und Angebot") },
    dw: { l: T("🚚 Livraison et garantie", "🚚 Delivery and warranty", "🚚 Lieferung und Garantie") },
    contact: { l: T("✉️ Parler à l’équipe", "✉️ Talk to the team", "✉️ Team kontaktieren") },
    compare: { l: T("Comparer les packs", "Compare the packs", "Pakete vergleichen") },
    quote: { l: T("Préparer ma demande de devis", "Prepare my quote request", "Angebotsanfrage vorbereiten"), pri: true },
    msg: { l: T("Préparer mon message", "Prepare my message", "Nachricht vorbereiten"), pri: true },
    demo: { l: T("Demander une démo", "Request a demo", "Demo anfragen"), pri: true },
    other: { l: T("Indiquer mon appareil", "Tell you my device", "Mein Gerät nennen"), pri: true },
    mail: { l: T("Écrire un e-mail", "Send an email", "E-Mail schreiben"), href: 'mailto:' + MAIL },
    ok: { l: T("✓ C’est réglé", "✓ Fixed", "✓ Gelöst"), pri: true },
    next: { l: T("Toujours bloqué", "Still stuck", "Geht noch nicht") },
    'own:none': { l: T("Rien, je pars de zéro", "Nothing yet", "Noch nichts") },
    'own:ipad': { l: T("Des iPad ou iPhone", "iPads or iPhones", "iPads oder iPhones") },
    'own:pods': { l: T("Un POD’S VitalX", "A VitalX POD’S", "Einen VitalX POD’S") },
    'pub:secour': { l: T("Secourisme (PSC, SST, PSE…)", "First aid (PSC, SST, PSE…)", "Erste Hilfe (PSC, SST, PSE …)") },
    'pub:para': { l: T("Pompiers, ambulanciers, paramédical", "Firefighters, ambulance, paramedics", "Feuerwehr, Rettungsdienst") },
    'pub:med': { l: T("Soins, IFSI, urgences, médecins", "Nursing, ER, physicians", "Pflege, Notaufnahme, Ärzte") },
    'grp:s': { l: T("1 à 5", "1 to 5", "1 bis 5") },
    'grp:m': { l: T("6 à 12", "6 to 12", "6 bis 12") },
    'grp:l': { l: T("Plus de 12", "More than 12", "Mehr als 12") },
    'prio:real': { l: T("Le réalisme (écrans constructeurs, ECG 12 dérivations)", "Realism (manufacturer screens, 12-lead ECG)", "Realismus (Herstellerbildschirme, 12-Kanal-EKG)") },
    'prio:mobile': { l: T("Compact et facile à transporter", "Compact and easy to carry", "Kompakt und leicht zu transportieren") },
    'prio:far': { l: T("Lisible par tout le groupe", "Readable by the whole group", "Für die ganze Gruppe lesbar") },
    'prio:any': { l: T("Je ne sais pas encore", "Not sure yet", "Weiß ich noch nicht") },
    devices: { l: T("Voir les appareils", "See the devices", "Geräte ansehen"), href: '/#interfaces' },
    warranty: { l: T("Garantie détaillée", "Full warranty", "Garantie im Detail"), href: '/garantie.html' },
    cgv: { l: T("CGV", "Terms of sale", "AGB"), href: '/cgv.html' },
    retract: { l: T("Formulaire de rétractation", "Withdrawal form", "Widerrufsformular"), href: '/formulaire_retractation.pdf' },
    webapp: { l: T("Ouvrir vitalxtrainer.app", "Open vitalxtrainer.app", "vitalxtrainer.app öffnen"), href: WEB, ext: true },
    academyLink: { l: T("Voir ACADEMY", "See ACADEMY", "ACADEMY ansehen"), href: '/#academy' },
    mediaLink: { l: T("Voir le Media Center", "See the Media Center", "Media Center ansehen"), href: '/#mediacenter' },
    trainerLink: { l: T("Voir le mode formateur", "See the trainer mode", "Trainermodus ansehen"), href: '/#formateur' },
    affLink: { l: T("Devenir apporteur", "Become a referrer", "Empfehlungsgeber werden"), href: '/affiliation.html' },
    aboutLink: { l: T("Qui sommes-nous", "About us", "Über uns"), href: '/qui-sommes-nous.html' },
    patchLink: { l: T("Voir les écussons", "See the patches", "Aufnäher ansehen"), href: '/boutique.html#ecussons' },
    privLink: { l: T("Politique de confidentialité", "Privacy policy", "Datenschutzerklärung"), href: '/politique-confidentialite.html' }
  };
  var MAIN = ['adv', 'tr', 'price', 'dw', 'contact'];

  // ── Compréhension des questions libres ───────────────────────────
  // kw : mots-clés sans accents (« * » = début de mot) ; pb : seulement si la phrase décrit un problème ; g : intention générique
  var I = [
    { go: 'tr:link', kw: ['connect*', 'connexion', 'liaison', 'se voient pas', 'se voit pas', 'se trouvent pas', 'trouve pas', 'introuvable', 'appair*', 'synchro*', 'code de seance', 'code seance', 'rejoindre', 'rejoint pas', 'recherche du formateur', 'pairing', 'verbind*', 'sitzung', 'kopplung'] },
    { go: 'tr:lic', pb: true, kw: ['licence', 'license', 'lizenz', 'code', 'activation', 'activer', 'aktivier*', 'freischalt*'] },
    { go: 'tr:lic', kw: ['code invalide', 'code refuse', 'licence refusee', 'licence introuvable', 'licence expiree', 'nombre d appareils atteint', 'appareils atteint', 'invalid code', 'code rejected', 'licence not found', 'code ungultig'] },
    { go: 'tr:sound', kw: ['pas de son', 'aucun son', 'sans son', 'le son', 'du son', 'les sons', 'son coupe', 'audio', 'volume', 'alarme muette', 'alarmes muettes', 'entend rien', 'n entend pas', 'no sound', 'sound', 'kein ton', 'keinen ton', 'lautstarke'] },
    { go: 'tr:rcp', pb: true, kw: ['capteur rcp', 'capteur de compression', 'capteur bluetooth', 'bluetooth', 'capteur', 'cpr sensor', 'hlw sensor', 'sensor'] },
    { go: 'tr:web', pb: true, kw: ['formateur web', 'mode web', 'version web', 'vitalxtrainer*', 'navigateur', 'ordinateur', 'web', 'browser', 'computer'] },
    { go: 'tr:crash', kw: ['plante', 'plant*', 'crash*', 'fige', 'freeze', 'gele', 'ecran noir', 'ecran blanc', 'se ferme', 'ferme tout seul', 'ferme toute seule', 'rame', 'absturz', 'sturzt ab', 'hangt', 'frozen'] },
    { go: 'tr:hw', kw: ['casse', 'cassee', 'abime', 'abimee', 'fissure', 'endommage', 'defectueux', 'broken', 'damaged', 'cracked', 'kaputt', 'beschadigt', 'defekt'] },
    { go: 'tr:order', kw: ['ma commande', 'ma livraison', 'numero de suivi', 'suivi de commande', 'colis', 'pas recu', 'pas encore recu', 'toujours pas recu', 'my order', 'tracking', 'parcel', 'not received', 'meine bestellung', 'sendungsverfolgung', 'paket', 'nicht erhalten'] },
    { go: 'faq:otherbrands', kw: ['zoll', 'lifepak', 'stryker', 'physio control', 'philips', 'corpuls', 'mindray', 'hamilton', 'draeger', 'drager', 'nihon kohden', 'ge healthcare', 'autre marque', 'autres marques', 'autre constructeur', 'autres constructeurs', 'other brand', 'other brands', 'other manufacturer*', 'andere marke*', 'andere hersteller'] },
    { go: 'faq:devices', kw: ['appareil', 'appareils', 'interface', 'interfaces', 'ecrans constructeurs', 'constructeur*', 'schiller', 'weinmann', 'defigard', 'physiogard', 'meducore', 'medumat', 'meduvent', 'argus', 'maglife', 'magscreen', 'hd 7', 'touch 7', 'quels scopes', 'quels moniteurs', 'quels defibrillateurs', 'devices', 'manufacturer*', 'brands', 'gerat', 'gerate', 'hersteller*', 'marque', 'marques', 'marke', 'marken'] },
    { go: 'faq:compare', kw: ['difference', 'differences', 'compar*', 'versus', 'vs', 'plus ou ultra', 'ultra ou plus', 'quelle difference', 'unterschied*', 'vergleich*'] },
    { go: 'faq:ultramode', kw: ['mode ultra', 'ultra mode', 'ultra modus', 'extension', 'extensions', 'option', 'options', 'guardian', 'nexus', 'ctg', 'cardiotocographie', 'vent', 'ventilation', 'respirateur', 'respirateurs', 'ventilateur', 'ventilator', 'ventilators', 'beatmung*'] },
    { go: 'faq:price', kw: ['prix', 'tarif', 'tarifs', 'combien', 'cout', 'coute', 'budget', 'cher', 'devis', 'price', 'prices', 'cost', 'how much', 'quote', 'pricing', 'preis', 'preise', 'kosten', 'kostet', 'wie viel', 'angebot'] },
    { go: 'prod:ultra', kw: ['ultra', 'ipad air', '13 pouces', '13 inch', '13 zoll', 'grand ecran', 'grand format'] },
    { go: 'prod:plus', kw: ['vitalx plus', 'pack plus', 'le plus vendu', 'best seller', 'bestseller'] },
    { go: 'prod:upgrade', kw: ['passage', 'passage pod*', 'passer de pod*', 'vers vitalx', 'mettre a niveau', 'mise a niveau', 'upgrade', 'client pods', 'deja un pods', 'passer a vitalx', 'migrer', 'umstieg'] },
    { go: 'prod:pods', kw: ['pods', 'pod s', 'pod', 'iphone 12', 'iphone 13', 'scope iphone', 'sur iphone', 'compact'] },
    { go: 'prod:licence', kw: ['logiciel seul', 'licence seule', 'juste la licence', 'deja des ipad', 'deja nos ipad', 'nos propres ipad', 'propres ipad', 'software only', 'own ipads', 'our ipads', 'eigene ipads', 'nur software', 'nur die lizenz'] },
    { go: 'faq:multi', kw: ['plusieurs', 'combien d appareils', 'nombre d appareils', 'nombre de postes', 'eleves', 'stagiaires', 'apprenants', 'groupe', 'classe', 'several', 'how many devices', 'students', 'learners', 'mehrere', 'teilnehmer', 'gruppe'] },
    { go: 'faq:licence', kw: ['licence', 'licences', 'license', 'licenses', 'abonnement', 'a vie', 'lifetime', 'subscription', 'lizenz', 'abo', 'mise a jour', 'mises a jour', 'update', 'updates', 'aktualisierung', 'activation', 'activer', 'code', 'aktivier*'] },
    { go: 'faq:delivery', kw: ['livr*', 'delai', 'delais', 'expedi*', 'envoi', 'recevoir', 'delivery', 'deliver', 'shipping', 'ship', 'liefer*', 'versand'] },
    { go: 'faq:public', kw: ['sdis', 'marche public', 'marches publics', 'bon de commande', 'mandat administratif', 'chorus', 'collectivite', 'administration', 'purchase order', 'public tender', 'tender', 'bestellschein', 'ausschreibung', 'offentlich*'] },
    { go: 'faq:payment', kw: ['paiement', 'payer', 'carte bancaire', 'carte', 'cb', 'virement', 'stripe', 'paypal', 'apple pay', 'payment', 'pay', 'card', 'transfer', 'zahlung', 'bezahl*', 'uberweisung', 'kreditkarte'] },
    { go: 'faq:vat', kw: ['tva', 'facture', 'factures', 'hors taxe', 'ttc', 'ht', 'vat', 'invoice', 'tax', 'rechnung', 'mwst', 'mehrwertsteuer', 'umsatzsteuer'] },
    { go: 'faq:warranty', kw: ['garantie', 'garanti', 'sav', 'apres vente', 'reparation', 'reparer', 'warranty', 'guarantee', 'repair', 'gewahrleistung', 'reparatur'] },
    { go: 'faq:refund', kw: ['retract*', 'retour', 'retourner', 'rembours*', 'annuler', 'annulation', 'refund', 'return', 'cancel*', 'widerruf*', 'ruckgabe', 'erstattung'] },
    { go: 'faq:compat', kw: ['ipad', 'iphone', 'ios', 'ipados', 'compatib*', 'quel ipad', 'quels ipad', 'modele', 'android', 'samsung', 'tablette', 'tablet', 'kompatibel'] },
    { go: 'faq:offline', kw: ['internet', 'sans internet', 'hors ligne', 'hors connexion', 'connexion internet', 'wifi', 'wi fi', '4g', '5g', 'reseau', 'offline', 'network', 'netz', 'netzwerk', 'ohne internet'] },
    { go: 'faq:web', kw: ['formateur web', 'mode web', 'version web', 'vitalxtrainer*', 'navigateur', 'ordinateur', 'pc', 'mac', 'windows', 'chrome', 'safari', 'firefox', 'web', 'browser', 'computer', 'laptop', 'rechner'] },
    { go: 'faq:academy', kw: ['capteur rcp', 'cpr sensor', 'hlw sensor', 'academy', 'jeu', 'jeux', 'ludique', 'rcp', 'massage', 'massage cardiaque', 'compression', 'compressions', 'mannequin', 'cpr', 'game', 'games', 'manikin', 'spiel', 'spiele', 'hlw', 'herzdruckmassage', 'reanimation'] },
    { go: 'faq:media', kw: ['media center', 'radio', 'radios', 'radiographie', 'gaz du sang', 'gds', 'bandelette', 'dossier patient', 'dlu', 'biologie', 'glycemie', 'lactate*', 'hemocue', 'blood gas', 'x ray', 'xray', 'urine', 'rontgen', 'blutgas'] },
    { go: 'faq:ecg', kw: ['ecg', 'ekg', 'rythme', 'rythmes', '12 derivations', 'derivation*', 'stemi', 'arythmie*', 'fibrillation', 'trace', 'traces', 'rhythm*', 'lead', 'leads', 'ableitung*'] },
    { go: 'faq:scenarios', kw: ['scenario', 'scenarios', 'evaluation', 'grille', 'grilles', 'debriefing', 'debrief', 'pse', 'pse1', 'pse2', 'cas concret', 'cas concrets', 'timeline', 'assessment', 'szenario', 'szenarien', 'bewertung'] },
    { go: 'faq:demo', kw: ['demo', 'demonstration', 'essai', 'essayer', 'tester', 'presentation', 'visio', 'voir en action', 'trial', 'try', 'vorfuhrung', 'testen'] },
    { go: 'faq:trainer', kw: ['formateur', 'piloter', 'pilote', 'pilotage', 'controle', 'telecommande', 'trainer', 'instructor', 'ausbilder', 'steuer*'] },
    { go: 'faq:included', kw: ['contenu', 'contient', 'inclus', 'compris', 'dans la boite', 'dans le pack', 'accessoire', 'accessoires', 'brassard', 'cable', 'capteurs', 'housse', 'chassis', 'boitier', 'included', 'contents', 'accessories', 'inhalt', 'lieferumfang', 'zubehor'] },
    { go: 'faq:onboarding', kw: ['prise en main', 'tutoriel', 'tuto', 'tutoriels', 'notice', 'mode d emploi', 'documentation', 'apprendre a utiliser', 'comment utiliser', 'comment ca marche', 'onboarding', 'tutorial', 'manual', 'how to use', 'anleitung', 'einweisung', 'handbuch'] },
    { go: 'faq:support', kw: ['support', 'horaire', 'horaires', 'delai de reponse', 'temps de reponse', 'hotline', 'opening hours', 'response time', 'erreichbar', 'antwortzeit'] },
    { go: 'faq:affiliation', kw: ['affiliation', 'affilie', 'apporteur', 'apporteurs', 'commission', 'parrainage', 'parrain', 'recommander vitalx', 'referral', 'affiliate', 'provision', 'empfehlungsprogramm'] },
    { go: 'faq:about', kw: ['qui etes vous', 'qui est derriere', 'fondateur', 'societe', 'entreprise', 'made in france', 'francais', 'francaise', 'france', 'fabrique', 'fabrication', 'histoire', 'who are you', 'company', 'founder', 'wer seid', 'firma', 'grunder', 'unternehmen'] },
    { go: 'faq:patches', kw: ['ecusson', 'ecussons', 'thermocollant', 'chat noir', 'stop blood', '2k26', 'badge', 'badges', 'aufnaher'] },
    { go: 'faq:medical', kw: ['dispositif medical', 'vrai patient', 'vrais patients', 'diagnostic', 'certifie', 'certification', 'marquage ce', 'medical device', 'real patient', 'medizinprodukt', 'zertifiziert'] },
    { go: 'faq:privacy', kw: ['donnees', 'rgpd', 'confidentialite', 'vie privee', 'cookie', 'cookies', 'privacy', 'gdpr', 'datenschutz', 'dsgvo'] },
    { go: 'faq:languages', kw: ['langue', 'langues', 'anglais', 'allemand', 'espagnol', 'english', 'german', 'language', 'languages', 'sprache', 'sprachen', 'englisch'] },
    { go: 'contact', kw: ['contact', 'contacter', 'joindre', 'humain', 'quelqu un', 'conseiller', 'commercial', 'telephone', 'appeler', 'email', 'e mail', 'mail', 'ecrire', 'revendeur', 'distributeur', 'call', 'phone', 'human', 'someone', 'reseller', 'distributor', 'kontakt', 'anrufen', 'mensch', 'telefon', 'handler'] },
    { go: 'adv', kw: ['choisir', 'choix', 'conseil', 'conseillez', 'recommand*', 'quel scope', 'quel pack', 'quelle offre', 'lequel', 'laquelle', 'adapte', 'choose', 'which pack', 'which one', 'recommend*', 'advice', 'auswahl', 'empfehl*', 'welches', 'beratung'] },
    { go: 'tr', g: true, kw: ['probleme', 'bug', 'bugs', 'marche pas', 'fonctionne pas', 'marche plus', 'fonctionne plus', 'panne', 'souci', 'soucis', 'erreur', 'depannage', 'aide', 'aidez', 'help', 'issue', 'problem', 'not working', 'doesn t work', 'error', 'fehler', 'hilfe', 'funktioniert nicht', 'geht nicht'] },
    { go: 'faq:greet', g: true, kw: ['bonjour', 'salut', 'hello', 'hi', 'hey', 'coucou', 'bonsoir', 'hallo', 'guten tag', 'servus', 'moin', 'good morning'] },
    { go: 'faq:thanks', g: true, kw: ['merci', 'thanks', 'thank you', 'danke', 'parfait', 'super', 'genial', 'top'] }
  ];
  var PB = ['connecte pas', 'connectent pas', 'detecte pas', 'reconnait pas', 'trouve pas', 'allume pas', 'ouvre pas', 'charge pas', 'marche pas', 'fonctionne pas', 'marche plus', 'fonctionne plus', 'bug', 'probleme', 'souci', 'erreur', 'impossible', 'arrive pas', 'bloque', 'refuse', 'invalide', 'ne passe pas', 'not working', 'doesn t work', 'won t', 'can t', 'cannot', 'error', 'problem', 'issue', 'geht nicht', 'funktioniert nicht', 'fehler', 'ungultig'];

  function norm(s) {
    return ' ' + String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  }
  function nk(k) {
    var pre = k.charAt(k.length - 1) === '*', s = norm(pre ? k.slice(0, -1) : k).trim();
    return { s: s, pre: pre, w: s.split(' ').length };
  }
  function has(ns, k) { return ns.indexOf(' ' + k.s + (k.pre ? '' : ' ')) >= 0; }
  var IX = I.map(function (it) { return { go: it.go, g: !!it.g, pb: !!it.pb, k: it.kw.map(nk) }; });
  var PBX = PB.map(nk);

  function match(txt) {
    var ns = norm(txt), pb = PBX.some(function (k) { return has(ns, k); });
    var best = null, bs = 0, gen = null, gs = 0;
    IX.forEach(function (it) {
      var s = 0;
      it.k.forEach(function (k) { if (has(ns, k)) s += k.w; });
      if (!s) return;
      if (it.pb) { if (!pb) return; s += 1; }
      if (it.g) { if (s > gs) { gs = s; gen = it.go; } }
      else if (s > bs) { bs = s; best = it.go; }
    });
    return best || gen;
  }

  // ── État de la conversation ──────────────────────────────────────
  var S = { open: false, log: [], adv: {}, ctx: null }, busy = false, cur = lang(), gen = 0, refocus = false;
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var host, R, E = {};

  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify({ open: S.open, log: S.log, adv: S.adv, ctx: S.ctx })); } catch (e) {}
  }
  function restore() {
    try {
      var j = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (j && Array.isArray(j.log)) {
        S.log = j.log.filter(function (e) { return e && (typeof e.u === 'string' || typeof e.uc === 'string' || BOT[e.b]); }).slice(-80);
        S.adv = j.adv || {}; S.ctx = j.ctx || null; S.open = !!j.open;
      }
    } catch (e) {}
  }
  function trim() { if (S.log.length > 80) S.log = S.log.slice(-80); }

  // Chaque message du bot est rangé par clé, puis rendu dans la langue du moment
  var BOT = {
    hello: function () { return { h: t(U.hello), c: MAIN }; },
    menu: function () { return { h: t(U.menu), c: MAIN }; },
    nf: function () { return { h: t(U.nf), c: MAIN }; },
    faq: function (e) { var f = F[e.id]; return { h: t(f.a), c: f.c || MAIN }; },
    q: function (e) { var q = Q[e.s]; return { h: t(q.t), c: q.o }; },
    res: function (e) { var r = reco(e.a); return { h: resHTML(r), c: ['quote', 'sheet:' + r.p, 'compare', 'again'] }; },
    prod: function (e) { return { h: card(e.id), c: ['quote', 'sheet:' + e.id, 'adv', 'menu'] }; },
    trm: function () { return { h: t(U.trm), c: TRK.concat(['menu']) }; },
    trs: function (e) {
      var tr = TR[e.id], st = tr.s[e.i];
      return { h: "<span class='k'>" + fmt(t(U.step), { i: e.i + 1, n: tr.s.length }) + "</span><b>" + t(st[0]) + "</b><br>" + t(st[1]), c: ['ok', 'next'] };
    },
    tri: function (e) { var tr = TR[e.id]; return { h: t(tr.info), c: tr.c }; },
    tro: function () { return { h: t(U.tro), c: MAIN }; },
    tre: function () { return { h: t(U.tre), c: ['msg', 'mail', 'menu'] }; },
    contact: function () { return { h: t(U.contact), c: ['msg', 'mail', 'menu'] }; },
    filled: function () { return { h: t(U.filled), c: ['menu'] }; }
  };

  function card(id, why) {
    var p = P[id];
    return "<div class='card'><span class='bd'>" + t(p.badge) + "</span><div class='pn'>" + t(p.name) + "</div><div class='pt'>" + t(p.tag) + "</div>" +
      (why ? "<p class='why'>" + why + "</p>" : '') +
      "<ul>" + p.pts.map(function (x) { return '<li>' + t(x) + '</li>'; }).join('') + "</ul></div>";
  }
  function resHTML(r) {
    var h = "<b>" + t(U.reco) + "</b>" + card(r.p, t(r.why));
    if (r.alt) h += "<p class='alt'>" + t(U.alt) + " <a href='#' data-k='prod:" + r.alt + "'>" + t(P[r.alt].name) + "</a> · " + t(P[r.alt].tag) + "</p>";
    return h + "<p class='fine'>" + t(r.p === 'licence' || r.p === 'upgrade' ? U.footSoft : U.footPack) + "</p>";
  }

  function chipDef(k) {
    if (C[k]) return C[k];
    var p = k.split(':');
    if (p[0] === 'sheet' && P[p[1]]) return { l: P[p[1]].sl, href: P[p[1]].href };
    if (p[0] === 'prod' && P[p[1]]) return { l: P[p[1]].name };
    if (p[0] === 'tr' && TR[p[1]]) return { l: TR[p[1]].l };
    return null;
  }
  function chipHTML(k) {
    var d = chipDef(k);
    if (!d) return '';
    var cls = 'chip' + (d.pri ? ' pri' : '');
    if (d.href) return "<a class='" + cls + "' href='" + d.href + "'" + (d.ext ? " target='_blank' rel='noopener'" : '') + ">" + esc(t(d.l)) + "</a>";
    return "<button type='button' class='" + cls + "' data-k='" + esc(k) + "'>" + esc(t(d.l)) + "</button>";
  }

  function render(typing) {
    var h = '', n = S.log.length, chips = null;
    S.log.forEach(function (e, i) {
      try {
        if (e.b) {
          var r = BOT[e.b](e);
          h += "<div class='m b'>" + r.h + "</div>";
          if (i === n - 1 && !typing) chips = r.c;
        } else if (e.uc) {
          var d = chipDef(e.uc);
          if (d) h += "<div class='m u'>" + esc(t(d.l)) + "</div>";
        } else if (e.u) {
          h += "<div class='m u'>" + esc(e.u) + "</div>";
        }
      } catch (x) { /* message d'une ancienne version : ignoré */ }
    });
    if (typing) h += "<div class='m b typing' aria-hidden='true'><i></i><i></i><i></i></div>";
    if (chips) h += "<div class='chips'>" + chips.map(chipHTML).join('') + "</div>";
    E.log.innerHTML = h;
    scrollEnd();
  }
  function scrollEnd() {
    var log = E.log, ms = log.querySelectorAll('.m'), last = ms[ms.length - 1];
    if (!last) return;
    var top = log.scrollHeight;
    if (last.classList.contains('b') && !last.classList.contains('typing') && last.offsetHeight > log.clientHeight * 0.55) top = last.offsetTop - 10;
    log.scrollTop = top;
  }

  // ── Actions ──────────────────────────────────────────────────────
  function say(e) {
    var g = gen;
    busy = true; render(true);
    setTimeout(function () {
      if (g !== gen) return;                       // « Recommencer » entre-temps
      busy = false; S.log.push(e); trim(); render(); save(); announce();
      if (refocus) {                               // clavier : le focus passe au premier bouton de la réponse
        refocus = false;
        var c = E.log.querySelector('.chips .chip');
        if (c) c.focus({ preventScroll: true }); else if (fine()) E.input.focus({ preventScroll: true });
      }
    }, reduce ? 120 : 420);
  }
  function fine() { return !!(window.matchMedia && matchMedia('(pointer: fine)').matches); }
  // Lecteurs d'écran : seul le dernier message de l'assistant est annoncé
  function announce() {
    var ms = E.log.querySelectorAll('.m.b'), last = ms[ms.length - 1];
    E.live.textContent = last ? last.textContent : '';
  }
  function act(k) {
    var p = k.split(':');
    switch (p[0]) {
      case 'menu': return say({ b: 'menu' });
      case 'adv': case 'again': S.adv = {}; return say({ b: 'q', s: 1 });
      case 'own': S.adv = { own: p[1] }; return p[1] === 'none' ? say({ b: 'q', s: 2 }) : result();
      case 'pub': S.adv.pub = p[1]; return say({ b: 'q', s: 3 });
      case 'grp': S.adv.grp = p[1]; return say({ b: 'q', s: 4 });
      case 'prio': S.adv.prio = p[1]; return result();
      case 'tr': return p[1] ? trouble(p[1]) : say({ b: 'trm' });
      case 'ok': S.ctx = null; return say({ b: 'tro' });
      case 'next': return next();
      case 'faq': return faq(p[1]);
      case 'prod': S.ctx = { k: 'quote', p: p[1] }; return say({ b: 'prod', id: p[1] });
      case 'compare': return faq('compare');
      case 'contact': return say({ b: 'contact' });
      case 'quote': return prefill('quote');
      case 'msg': return prefill('msg');
      case 'demo': S.ctx = { k: 'demo' }; return prefill('msg');
      case 'other': S.ctx = { k: 'other' }; return prefill('msg');
      default: return F[p[0]] ? faq(p[0]) : say({ b: 'nf' });
    }
  }
  function result() {
    var a = JSON.parse(JSON.stringify(S.adv));
    S.ctx = { k: 'quote', p: reco(a).p, a: a };
    say({ b: 'res', a: a });
  }
  function trouble(id) {
    if (!TR[id]) return say({ b: 'trm' });
    S.ctx = { k: 'help', id: id, i: 0 };
    say(TR[id].s ? { b: 'trs', id: id, i: 0 } : { b: 'tri', id: id });
  }
  function next() {
    var c = S.ctx;
    if (!c || c.k !== 'help' || !TR[c.id] || !TR[c.id].s) return say({ b: 'trm' });
    if (c.i + 1 < TR[c.id].s.length) { c.i++; say({ b: 'trs', id: c.id, i: c.i }); }
    else { c.done = true; say({ b: 'tre', id: c.id }); }
  }
  function faq(id) {
    if (!F[id]) return say({ b: 'nf' });
    if (id === 'demo') S.ctx = { k: 'demo' };
    else if (id === 'otherbrands') S.ctx = { k: 'other' };
    say({ b: 'faq', id: id });
  }
  function chip(k) {
    if (busy || !chipDef(k)) return;
    refocus = !!(E.log.contains(document.activeElement) || R.activeElement && E.log.contains(R.activeElement));
    S.log.push({ uc: k });
    act(k);
  }
  function send(txt) {
    txt = String(txt || '').trim().slice(0, 300);
    if (busy || !txt) return;
    S.log.push({ u: txt });
    var go = match(txt);
    if (go) act(go); else say({ b: 'nf' });
  }

  // ── Message préparé pour le formulaire de contact (accueil) ──────
  function draft(kind) {
    var c = S.ctx || {}, L = U.pf;
    if (kind === 'quote' || c.k === 'quote') {
      var p = c.k === 'quote' && P[c.p] ? t(P[c.p].name) : t(U.pfAny);
      return fmt(t(L.quote), { p: p, need: c.k === 'quote' ? need(c.a) : '' });
    }
    if (c.k === 'help' && TR[c.id]) {
      var tr = TR[c.id], tried = tr.s ? tr.s.slice(0, c.done ? tr.s.length : c.i + 1).map(function (s) { return t(s[0]); }).join(', ') : '';
      return fmt(t(tried ? L.help : L.help0), { pb: t(tr.l), tried: tried });
    }
    if (c.k === 'demo') return t(L.demo);
    if (c.k === 'other') return t(L.other);
    return t(L.hello);
  }
  function need(a) {
    if (!a) return '';
    var parts = [];
    if (a.own === 'ipad' || a.own === 'pods') parts.push(t(N.own[a.own]));
    if (a.pub) parts.push(t(N.pub[a.pub]));
    if (a.grp) parts.push(t(N.grp[a.grp]));
    if (a.prio && a.prio !== 'any') parts.push(t(N.prio[a.prio]));
    return parts.length ? fmt(t(U.pf.need), { a: parts.join(', ') }) : '';
  }
  // Le formulaire « contact » de l'accueil (affiliation.html a aussi un champ #message : jamais celui-là)
  function contactBox() { return document.querySelector('form[name="contact"] textarea[name="message"]'); }
  function prefill(kind) {
    var txt = draft(kind), ta = contactBox();
    S.log.push({ b: 'filled' }); trim();
    if (ta && ta.tagName === 'TEXTAREA') {
      render(); save();
      setTimeout(function () { close(true); fillForm(ta, txt); }, 350);
    } else {
      S.open = false; save();
      try { sessionStorage.setItem(PREFILL, txt); } catch (e) {}
      location.href = '/#contact';
    }
  }
  function fillForm(ta, txt) {
    var v = ta.value.replace(/\s+$/, '');
    if (!v) ta.value = txt;
    else if (v.indexOf(txt.trim()) < 0) ta.value = v + '\n\n' + txt;
    try { ta.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    var form = ta.form;
    if (S.ctx && S.ctx.k === 'other' && form && form.elements.interface) {
      var sel = form.elements.interface;
      if (sel.options && sel.options.length) sel.selectedIndex = sel.options.length - 1;   // « Un autre appareil (précisez…) »
    }
    (document.getElementById('contact') || ta).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    var first = ['prenom', 'nom', 'entreprise', 'email'].map(function (n) { return form && form.elements[n]; })
      .filter(function (x) { return x && !x.value; })[0] || ta;
    setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }, reduce ? 50 : 700);
  }
  function pendingPrefill() {
    var txt = null;
    try { txt = sessionStorage.getItem(PREFILL); } catch (e) {}
    var ta = contactBox();
    if (!txt || !ta) return;
    try { sessionStorage.removeItem(PREFILL); } catch (e) {}
    setTimeout(function () { fillForm(ta, txt); }, 450);
  }

  // ── Ouverture, fermeture, langue ─────────────────────────────────
  function open() {
    S.open = true;
    E.panel.classList.add('open'); E.launch.classList.add('hide');
    E.launch.setAttribute('aria-expanded', 'true');
    if (!S.log.length) S.log.push({ b: 'hello' });
    render(); fitViewport(); save();
    if (fine()) setTimeout(function () { E.input.focus(); }, 80);
  }
  function close(silent) {
    S.open = false;
    E.panel.classList.remove('open'); E.launch.classList.remove('hide');
    E.launch.setAttribute('aria-expanded', 'false');
    fitViewport(); save();
    if (!silent) E.launch.focus();
  }
  function restart() { gen++; S.log = [{ b: 'hello' }]; S.adv = {}; S.ctx = null; busy = false; render(); save(); announce(); }
  // Téléphone : le panneau suit la zone visible (clavier ouvert)
  function fitViewport() {
    var vv = window.visualViewport, p = E.panel;
    if (S.open && vv && window.innerWidth <= 600) { p.style.top = vv.offsetTop + 'px'; p.style.height = vv.height + 'px'; p.style.bottom = 'auto'; }
    else { p.style.top = ''; p.style.height = ''; p.style.bottom = ''; }
  }
  function paint() {
    E.lbl.textContent = t(U.launch);
    E.launch.setAttribute('aria-label', t(U.launchAria));
    E.title.textContent = t(U.title);
    E.status.textContent = t(U.status);
    E.rs.setAttribute('aria-label', t(U.restart)); E.rs.title = t(U.restart);
    E.cl.setAttribute('aria-label', t(U.close)); E.cl.title = t(U.close);
    E.input.placeholder = t(U.ph); E.input.setAttribute('aria-label', t(U.ph));
    E.send.setAttribute('aria-label', t(U.send));
    E.note.textContent = t(U.note);
  }

  // ── Construction ─────────────────────────────────────────────────
  var SVG = {
    chat: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z'/></svg>",
    pulse: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M2 12h4l2.5-6 4 12 2.5-6H22'/></svg>",
    restart: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M3 12a9 9 0 1 0 3-6.7'/><path d='M3 4v5h5'/></svg>",
    close: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' aria-hidden='true'><path d='M6 6l12 12M18 6L6 18'/></svg>",
    send: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 19V5M5 12l7-7 7 7'/></svg>"
  };

  var CSS = [
    ":host{all:initial}",
    "*,*::before,*::after{box-sizing:border-box}",
    ".w{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.45;color:#18181b;letter-spacing:-.01em;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}",
    "button,input{font-family:inherit;letter-spacing:inherit}",
    ".launch{position:fixed;right:18px;bottom:18px;z-index:97;display:inline-flex;align-items:center;gap:8px;height:50px;padding:0 20px 0 16px;border:0;border-radius:999px;background:#E3121B;color:#fff;font-size:15px;font-weight:600;line-height:1;cursor:pointer;box-shadow:0 8px 24px rgba(227,18,27,.28),0 2px 6px rgba(0,0,0,.12);transition:transform .2s ease,box-shadow .2s ease,opacity .2s ease}",
    ".launch:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(227,18,27,.34),0 3px 8px rgba(0,0,0,.14)}",
    ".launch svg{width:22px;height:22px;flex:0 0 auto}",
    ".launch.hide{opacity:0;pointer-events:none;transform:scale(.9)}",
    "@media (max-width:600px){.launch{width:56px;height:56px;padding:0;justify-content:center}.launch .lbl{display:none}}",
    "@media (max-width:833px){:host(.lift) .launch{bottom:82px}}",
    ".panel{position:fixed;right:18px;bottom:18px;z-index:125;width:390px;max-width:calc(100vw - 36px);height:640px;max-height:calc(100vh - 110px);display:flex;flex-direction:column;background:#fff;border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,.24),0 0 0 1px rgba(0,0,0,.06);overflow:hidden;opacity:0;visibility:hidden;transform:translateY(14px) scale(.98);transform-origin:100% 100%;transition:opacity .22s ease,transform .22s ease,visibility 0s linear .22s}",
    ".panel.open{opacity:1;visibility:visible;transform:none;transition:opacity .22s ease,transform .22s ease,visibility 0s}",
    "@media (max-width:600px){.panel{top:0;right:0;bottom:0;left:0;width:auto;max-width:none;height:auto;max-height:none;border-radius:0;z-index:310;transform:translateY(24px)}}",
    ".hd{display:flex;align-items:center;gap:10px;padding:12px 10px 12px 14px;border-bottom:1px solid #e4e4e8;background:#fff}",
    "@media (max-width:600px){.hd{padding-top:max(12px,env(safe-area-inset-top))}}",
    ".av{width:36px;height:36px;border-radius:50%;background:#E3121B;color:#fff;display:flex;align-items:center;justify-content:center;flex:0 0 auto}",
    ".av svg{width:20px;height:20px}",
    ".tt{flex:1;min-width:0}",
    ".ti{font-size:16px;font-weight:600;line-height:1.2}",
    ".st{font-size:12.5px;color:#55555c;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".st::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#30d158;margin-right:6px;vertical-align:1px}",
    ".ib{width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:#55555c;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto}",
    ".ib:hover{background:#f5f5f7;color:#18181b}",
    ".ib svg{width:18px;height:18px}",
    ".log{position:relative;flex:1;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:16px 14px 10px;display:flex;flex-direction:column;gap:10px;background:#fff}",
    ".m{max-width:90%;padding:10px 13px;border-radius:16px;font-size:15px;line-height:1.45;overflow-wrap:anywhere}",
    ".b{align-self:flex-start;background:#f5f5f7;color:#18181b;border-bottom-left-radius:5px}",
    ".u{align-self:flex-end;background:#18181b;color:#fff;border-bottom-right-radius:5px}",
    ".m b{font-weight:600}",
    ".m a{color:#C8102E;font-weight:600;text-decoration:none}",
    ".m a:hover{text-decoration:underline}",
    ".m ul{margin:6px 0 2px;padding-left:18px}",
    ".m li{margin:3px 0}",
    ".m p{margin:8px 0 0}",
    ".k{display:block;font-size:11.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#C8102E;margin-bottom:3px}",
    ".card{margin-top:8px;background:#fff;border:1px solid #e4e4e8;border-radius:12px;padding:12px 13px}",
    ".bd{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:#fff;background:#E3121B;border-radius:999px;padding:3px 9px;margin-bottom:6px}",
    ".pn{font-size:18px;font-weight:700;letter-spacing:-.02em;line-height:1.2}",
    ".pt{font-size:13.5px;color:#55555c;margin-top:2px}",
    ".why{font-size:14px}",
    ".card ul{margin:8px 0 0;font-size:14px}",
    ".alt{font-size:14px}",
    ".fine{font-size:12.5px;color:#55555c}",
    ".chips{display:flex;flex-wrap:wrap;gap:7px;margin:2px 0 4px}",
    ".chip{display:inline-flex;align-items:center;min-height:36px;padding:7px 13px;border:1px solid #d2d2d7;border-radius:999px;background:#fff;color:#18181b;font-size:14px;font-weight:500;line-height:1.2;text-align:left;text-decoration:none;cursor:pointer;transition:border-color .15s,color .15s,background .15s}",
    ".chip:hover{border-color:#E3121B;color:#C8102E}",
    ".chip.pri{background:#E3121B;border-color:#E3121B;color:#fff}",
    ".chip.pri:hover{background:#C8102E;border-color:#C8102E;color:#fff}",
    ".typing{display:flex;gap:4px;padding:13px 14px}",
    ".typing i{width:7px;height:7px;border-radius:50%;background:#86868b;animation:vxb 1s infinite ease-in-out}",
    ".typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}",
    "@keyframes vxb{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}",
    ".ft{border-top:1px solid #e4e4e8;padding:10px 12px 8px;background:#fff}",
    "@media (max-width:600px){.ft{padding-bottom:max(10px,env(safe-area-inset-bottom))}}",
    ".fm{display:flex;gap:8px;align-items:center;margin:0}",
    ".in{flex:1;min-width:0;height:42px;border:1px solid #d2d2d7;border-radius:999px;padding:0 16px;font-size:16px;color:#18181b;background:#fff;outline:none;-webkit-appearance:none;appearance:none}",
    ".in:focus{border-color:#18181b;box-shadow:0 0 0 3px rgba(24,24,27,.08)}",
    ".in::placeholder{color:#86868b}",
    ".send{width:42px;height:42px;border:0;border-radius:50%;background:#E3121B;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto}",
    ".send:hover{background:#C8102E}",
    ".send svg{width:18px;height:18px}",
    ".note{margin:7px 0 0;font-size:11.5px;color:#86868b;text-align:center;line-height:1.3}",
    "button:focus-visible,a:focus-visible{outline:3px solid rgba(227,18,27,.45);outline-offset:2px}",
    ".sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
    "@media (prefers-reduced-motion:reduce){.launch,.panel,.chip{transition:none}.typing i{animation:none}}",
    "@media print{.launch,.panel{display:none}}"
  ].join('');

  function build() {
    host = document.createElement('div');
    host.id = 'vxchat';
    if (document.getElementById('cartFab')) host.className = 'lift';   // boutique sur téléphone : au-dessus du bouton Panier
    document.body.appendChild(host);
    R = host.attachShadow({ mode: 'open' });
    R.innerHTML = '<style>' + CSS + '</style>' +
      "<div class='w'>" +
        "<button class='launch' type='button' aria-expanded='false' aria-controls='vxc-panel'>" + SVG.chat + "<span class='lbl'></span></button>" +
        "<section class='panel' id='vxc-panel' role='dialog' aria-modal='false' aria-labelledby='vxc-title'>" +
          "<header class='hd'><span class='av' aria-hidden='true'>" + SVG.pulse + "</span>" +
            "<div class='tt'><div class='ti' id='vxc-title'></div><div class='st'></div></div>" +
            "<button class='ib rs' type='button'>" + SVG.restart + "</button>" +
            "<button class='ib cl' type='button'>" + SVG.close + "</button></header>" +
          "<div class='log'></div><div class='sr' aria-live='polite'></div>" +
          "<footer class='ft'><form class='fm' novalidate><input class='in' type='text' autocomplete='off' maxlength='300' enterkeyhint='send'>" +
            "<button class='send' type='submit'>" + SVG.send + "</button></form><p class='note'></p></footer>" +
        "</section>" +
      "</div>";
    E.launch = R.querySelector('.launch'); E.lbl = R.querySelector('.lbl');
    E.panel = R.querySelector('.panel'); E.title = R.querySelector('.ti'); E.status = R.querySelector('.st');
    E.rs = R.querySelector('.rs'); E.cl = R.querySelector('.cl'); E.log = R.querySelector('.log');
    E.live = R.querySelector('.sr'); E.form = R.querySelector('.fm'); E.input = R.querySelector('.in'); E.send = R.querySelector('.send'); E.note = R.querySelector('.note');
    paint();

    E.launch.addEventListener('click', open);
    E.cl.addEventListener('click', function () { close(); });
    E.rs.addEventListener('click', restart);
    E.form.addEventListener('submit', function (ev) { ev.preventDefault(); if (busy) return; var v = E.input.value; E.input.value = ''; send(v); });
    E.log.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-k]');
      if (b) { ev.preventDefault(); chip(b.getAttribute('data-k')); return; }
      var a = ev.target.closest('a[href]');
      if (a && window.innerWidth <= 600 && a.getAttribute('href').charAt(0) === '/') { S.open = false; save(); }   // lien du site : la page s'affiche sans l'assistant par-dessus
    });
    R.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && S.open) { ev.stopPropagation(); close(); } });
    new MutationObserver(function () {
      if (lang() === cur) return;
      cur = lang(); paint();
      if (S.open && !busy) render();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitViewport);
      window.visualViewport.addEventListener('scroll', fitViewport);
    }
  }

  function init() {
    if (!document.body || document.getElementById('vxchat')) return;
    restore();
    build();
    if (S.open && S.log.length && window.innerWidth > 600) open();
    else { S.open = false; if (S.log.length) render(); }
    pendingPrefill();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
