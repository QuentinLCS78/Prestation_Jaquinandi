# Flux Instagram (Behold)

La section « Au fil de la saison » de la page d'accueil peut afficher les derniers posts de
@prestation.jaquinandi grâce au widget **Behold** ([behold.so](https://behold.so)), plan gratuit.
Il n'y a ni API, ni jeton, ni tâche automatique à gérer : Behold s'occupe de tout.

Le lien entre le site et Behold tient dans un seul attribut, dans `index.html` :

```html
<section class="insta" id="insta" data-behold="" …>
```

- `data-behold` **vide** : le carrousel de photos fixes du HTML s'affiche (situation actuelle).
- `data-behold` **rempli** avec l'ID du flux : le carrousel est remplacé par le widget Behold.
  Le script Behold n'est chargé que lorsque le visiteur approche de la section, pour économiser le quota de vues.

## Limites du plan gratuit

| | Plan gratuit |
|---|---|
| Nombre de posts | **6 maximum** |
| Mise à jour | **1 fois par jour** |
| Vues | **1 200 par mois**. Au-delà, le flux est mis en pause jusqu'au mois suivant : le site réaffiche alors automatiquement les photos fixes (voir plus bas) |
| Mises en page | Grille ou « gallery wall ». Le carrousel est réservé aux plans payants |
| Marque | Logo Behold visible au survol |
| Compte Instagram | Compte **professionnel** obligatoire (Business ou Créateur) |

## Mise en place (une seule fois)

1. **Passer le compte Instagram en professionnel.** Dans l'app Instagram du client : Paramètres →
   Type de compte et outils → Passer à un compte professionnel (Business ou Créateur, gratuit).
2. **Créer le compte Behold** sur [behold.so](https://behold.so), avec l'adresse e-mail du client,
   pour qu'il en reste propriétaire.
3. **Connecter Instagram** : dans Behold, ajouter une source et se connecter avec @prestation.jaquinandi.
4. **Créer un flux de type « Widget »** et le personnaliser avec la charte du site :
   - anthracite `#1E1E1E` (texte),
   - rose `#FE9DD9` (accents),
   - blanc cassé `#F5F5F5` (fond).
5. **Copier le feed-id** du flux : c'est l'identifiant affiché dans le code d'intégration,
   `<behold-widget feed-id="XXXXXXXX">`.
6. **Le coller dans `data-behold`** dans `index.html`, puis commit et push :
   ```html
   <section class="insta" id="insta" data-behold="XXXXXXXX" …>
   ```
   Le site GitHub Pages se met à jour en 1 à 2 minutes.

## Repli automatique sur les photos fixes

Le site n'affiche le flux Behold que lorsqu'il a vraiment chargé des photos Instagram.
Pendant le chargement (en général moins d'une seconde, et il démarre avant que le visiteur arrive à la section),
des cases grises occupent la place : si Behold marche, le visiteur ne voit jamais les photos fixes.
Dans tous les cas d'échec, ce sont les **photos fixes du carrousel** qui s'affichent à la place des cases grises :

- quota de vues épuisé, compte Behold en pause ;
- flux supprimé ou feed-id erroné ;
- panne de Behold, ou script bloqué par un bloqueur de publicité ;
- aucune photo reçue 8 secondes après l'arrivée de la section Instagram à l'écran.

Le visiteur ne voit jamais de section vide ni de message d'erreur de Behold.
Dès que le flux remarche (par exemple le 1er du mois suivant), le flux Instagram revient tout seul.

Behold ne fournit pas d'événement d'erreur et son widget est fermé (on ne peut pas lire son contenu).
Le site surveille donc les fichiers téléchargés : une photo venant de `behold.pictures` signifie que le flux marche,
une erreur sur `feeds.behold.so` ou l'affichage du message d'erreur de Behold signifie qu'il ne marche pas.
Si Behold change un jour son fonctionnement, le pire cas est le repli sur les photos fixes, jamais une section cassée.

## Revenir définitivement aux photos fixes

Vider l'attribut (`data-behold=""`), puis commit et push. Le script Behold n'est alors plus chargé du tout.
