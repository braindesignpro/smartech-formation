# Vérification P0 / P1 — Smartech Formations

Date : 2026-10-08  
Serveur local de test : `npx serve -l 4173 .` (non publié)

## Constat initial

| Point | État avant |
|-------|------------|
| Stack | HTML/CSS/JS + `send-inscription.php` (OK) |
| Nav | 7+ variantes, trop dense |
| Accueil | Carrousel 7 slides, sections redondantes, avis non sourcés |
| Catalogue | Filtres OK, **pas de recherche** |
| Prefill | Liens `index.html#inscription?formation=` **cassés** |
| Tokens | Palette dans `:root` mais non centralisée |
| CDC | `Cahier_des_charges_Cursor_Smartech.md` **absent** |

## Perf (repères)

| Mesure | Prod (avant session SEO) | Local après P0/P1 |
|--------|--------------------------|-------------------|
| TTFB | ~1,9 s | ~10 ms (local) |
| FCP | ~2,7 s | dépend Unsplash |
| Hero slides | 7 | **5** |
| Nav liens | 7 | **4** |
| Portraits équipe | PNG 6–8 Mo | WebP ~10–35 Ko (session SEO) |

## Checks fonctionnels (local)

| Check | Résultat |
|-------|----------|
| Nav unifiée Formations / Équipe / FAQ / Inscription | OK |
| Recherche catalogue `ielts` → Anglais + Préparation IELTS | OK |
| Filtres catégories + URL `?categorie=` / `?q=` | OK |
| Prefill `/?formation=Anglais#inscription` | OK (hint + select) |
| Formulaire sans PHP : pas de succès simulé | OK (erreur réseau attendue) |
| Contacts tel / WhatsApp / mailto | OK |
| Témoignages / populaires / badges « Très demandé » | Masqués |
| Menu Escape + aria-label | OK |
| Mobile 390 : hero + barre contact | OK |
| Overlay float vs barre contact | Corrigé (bottom offset) |

## Viewports

Validés via DevTools / navigation locale : **390** (mobile + menu + contact-bar), **desktop ~1440** (accueil + formulaire prérempli).  
À revalider manuellement après déploiement : **360, 768, 1024**.

## Captures

- Local desktop hero : session browser (nav 4 liens, 5 slides)
- Local mobile 390 : hero + stats + contact-bar
- Prod (référence « avant déploiement ») : encore l’ancienne nav / contenu live

## Non déployé

Aucun changement d’hébergement. Publier manuellement après revue.
