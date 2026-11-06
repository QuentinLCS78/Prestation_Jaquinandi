# Flux Instagram automatique

Le carrousel « Au fil de la saison » affiche les 12 derniers posts de @prestation.jaquinandi.
Une tâche GitHub Actions (`.github/workflows/instagram.yml`) tourne chaque jour : elle récupère les posts
via l'API officielle d'Instagram, télécharge les images dans `img/insta/` et écrit `instagram.json`.
Le site lit ce fichier. S'il est absent, les photos fixes du HTML restent affichées.

Coût : 0 €. Pas de widget tiers, pas de limite de vues, le jeton reste secret (jamais dans le site).

## Mise en place (une seule fois, environ 20 minutes)

1. **Compte Instagram professionnel.** Dans l'app Instagram du client : Paramètres → Type de compte et outils →
   Passer à un compte professionnel (gratuit). L'API ne fonctionne qu'avec un compte professionnel.
2. **App Meta.** Sur developers.facebook.com → Mes apps → Créer une app → cas d'usage Instagram
   (« API Instagram avec connexion Instagram »).
3. **Jeton.** Dans l'app : Configuration de l'API avec connexion Instagram → Générer des jetons d'accès →
   ajouter le compte @prestation.jaquinandi (le client se connecte lui-même) → copier le jeton.
   Il est valable 60 jours ; le script le renouvelle tout seul à chaque passage.
4. **Secrets GitHub** (dépôt du site → Settings → Secrets and variables → Actions → New repository secret) :
   - `IG_TOKEN` : le jeton Instagram de l'étape 3.
   - `GH_PAT` : un jeton GitHub « fine-grained » (Settings du compte → Developer settings → Personal access tokens),
     limité à ce dépôt, avec la permission **Secrets : Read and write**. Il sert à enregistrer le jeton Instagram renouvelé.
5. **Premier lancement.** Onglet Actions → « Flux Instagram » → Run workflow. Au bout d'une minute,
   `instagram.json` et `img/insta/` apparaissent dans le dépôt et le site se met à jour.

## Bon à savoir

- Les vidéos (Reels) s'affichent avec leur miniature et une icône lecture ; un clic ouvre le post sur Instagram.
- Le texte affiché est la première ligne de la légende, sans hashtags (le bloc contact est ignoré).
- Si le jeton expire (tâche arrêtée plus de 60 jours), refaire l'étape 3 et remplacer `IG_TOKEN`.
- Si `GH_PAT` expire, en créer un nouveau : le flux continue de marcher, mais le jeton renouvelé n'est plus sauvegardé.
- Pour changer le nombre de posts : `IG_LIMIT` dans le fichier du workflow.
