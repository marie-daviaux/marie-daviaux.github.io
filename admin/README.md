# Portfolio Admin

Administration React commune aux portfolios Astro et Next.js. Chaque déploiement utilise une base Supabase indépendante, mais le même schéma et la même interface.

## Installation locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

L’interface est disponible sur `http://localhost:5173/admin/`.

## Préparer une base Supabase

1. Créer un projet Supabase dédié au portfolio.
2. Ouvrir le SQL Editor et exécuter `supabase/schema.sql`.
3. Dans Authentication, désactiver les inscriptions publiques.
4. Créer manuellement le compte administrateur dans Authentication > Users.
5. Copier l’URL du projet et la clé `Publishable` (`sb_publishable_…`) dans `.env.local`.

Ne jamais placer une clé `Secret` ou l’ancienne clé `service_role` dans une variable `VITE_*` : ces variables sont publiques dans le navigateur.

## Compiler pour `/admin`

```bash
npm run build
```

Le résultat statique est généré dans `dist/` avec les chemins d’assets préfixés par `/admin/`. Il peut être copié dans la sortie GitHub Pages du portfolio Astro ou Next.js.

## Modèle de données

- `categories` : classement des projets ;
- `projects` : titre, slug, texte, ordre et statut publié/brouillon ;
- `project_categories` : relation plusieurs-à-plusieurs ;
- `project_images` : images, ordre et texte alternatif ;
- bucket Storage `project-images` : fichiers publics, écriture réservée aux utilisateurs authentifiés.

Les visiteurs anonymes ne peuvent lire que les projets publiés. Les modifications sont réservées aux comptes authentifiés grâce aux règles RLS.

## Publication automatique du portfolio

L’admin appelle la fonction Supabase `deploy-portfolio` après toute modification qui affecte le site public. Cette fonction déclenche le workflow GitHub Pages sans exposer le jeton GitHub au navigateur.

1. Déployer `supabase/functions/deploy-portfolio/index.ts` dans Supabase avec le nom `deploy-portfolio` et la vérification JWT activée.
2. Ajouter les secrets de fonction suivants dans Supabase :
   - `GITHUB_DEPLOY_TOKEN` : jeton GitHub finement restreint au dépôt et à la permission Actions en écriture ;
   - `GITHUB_OWNER` : propriétaire du dépôt ;
   - `GITHUB_REPOSITORY` : nom du dépôt sans `.git` ;
   - `GITHUB_WORKFLOW` : nom du fichier de workflow, par exemple `deploy.yml` ;
   - `GITHUB_REF` : branche à publier, facultative (`main` par défaut).
3. Le workflow ciblé doit accepter l’événement `workflow_dispatch`.

Le jeton GitHub ne doit jamais être ajouté à un fichier `.env` préfixé par `VITE_` ni stocké dans les secrets GitHub utilisés par le build de l’admin.

## Migration initiale de Marie

La migration importe les 9 projets et 54 images déjà présents dans le dépôt. Elle peut être relancée sans créer de doublons.

1. Copier la clé Supabase `Secret` dans `.env.migration.local`.
2. Exécuter `npm run migrate:marie`.
3. Vider puis supprimer `.env.migration.local` après la migration.

Ce fichier est ignoré par Git. Une clé `Secret` ne doit jamais être placée dans `.env.local`, préfixée par `VITE_`, ni envoyée au navigateur.
