# Site Prestation Jaquinandi Père & Fils

Site statique HTML/CSS/JS, sans framework ni build.

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil (saisons, prestations, avant/après, FAQ, Instagram) |
| `contact.html` | Page Contact & devis (formulaire FormSubmit) |
| `style.css` | Styles communs aux deux pages |
| `mentions-legales.html` | Mentions légales (champs `[À COMPLÉTER]`) |
| `img/` | Photos (`avant.jpg` / `apres.jpg` sont provisoires) |
| `scripts/instagram.mjs` + `.github/workflows/instagram.yml` | Flux Instagram automatique, voir `INSTAGRAM.md` |

## Voir le site en local
Dans VS Code, extension **Live Server** → clic droit sur `index.html` → « Open with Live Server ».
(Ouvrir le fichier directement marche aussi, mais le carrousel Instagram a besoin d'un serveur pour lire `instagram.json`.)
