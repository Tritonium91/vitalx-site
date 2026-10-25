# VitalX — site vitrine

Site statique de VitalX (simulateur de scopes médicaux sur iPad et iPhone, conçu et assemblé en France), publié par Netlify sur https://vitalx.org.

- `site/` : le site, en quatre langues (FR à la racine, `/en/`, `/de/`, `/es/`). Pages HTML statiques, une feuille de style, un script, des images WebP.
- `netlify.toml` : `publish = "site"`. Pas de commande de build, pas de fonction.
- `site/_redirects` : redirections 301 des anciennes adresses ; `/politique-confidentialite` répond directement (lien de la fiche App Store).
- `site/_headers` : en-têtes de sécurité (CSP : aucune ressource extérieure) et cache.
- `site/revendeurs.json` : liste des revendeurs affichés sur la carte, tenue par VitalX (vide pour l'instant ; le schéma est dans le fichier).
- Le formulaire de contact est un formulaire Netlify (`name="contact"`).
- `site/assets/signature-*.png` : les 4 images de la signature mail de VitalX (adresses `https://vitalx.org/assets/signature-…png` utilisées dans les e-mails) : à garder, ne pas supprimer.

Aucune boutique, aucun prix, aucun paiement en ligne : demande de démo ou de devis uniquement.
