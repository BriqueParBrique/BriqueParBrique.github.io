# Développement

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [Just](https://github.com/casey/just)

## Démarrage rapide

```sh
just serve
```

Cela construit l'image Docker (Ruby 3.3 + Jekyll 4) puis lance le serveur local avec livereload.

Le site est accessible sur [http://localhost:4000](http://localhost:4000).

## Commandes disponibles

| Commande     | Description                           |
| ------------ | ------------------------------------- |
| `just serve` | Lance Jekyll en local avec livereload |
| `just build` | Génère le site dans `_site/`          |
| `just clean` | Supprime les fichiers générés         |

## Structure du projet

```text
.
├── _config.yml          # Configuration Jekyll
├── _data/
│   └── briques.yml      # Liste des briques (données)
├── index.html           # Page principale (template Liquid)
├── Dockerfile           # Image Docker pour le dev local
├── Gemfile              # Dépendances Ruby
├── justfile             # Commandes de développement
├── BriqueParBrique-logo.png
└── BriqueParBrique-visuel.png
```

## Ajouter ou modifier une brique

Les briques sont définies dans `_data/briques.yml`. Chaque entrée possède les champs suivants :

```yaml
- name: Python           # Nom affiché
  color: teal            # Couleur : blue, teal ou orange
  level: 1               # Niveau du mini-onboarding : 1, 2 ou 3
  status: Disponible     # Texte de statut affiché
  link: /python/         # Lien vers le mini-onboarding (optionnel)
```

- **`name`** : le nom du sujet. Plusieurs entrées peuvent avoir le même nom mais des niveaux différents (ex: "SAS niveau 1", "SAS niveau 2", "SAS niveau 3")
- **`color`** : correspond aux couleurs du branding (`blue`, `teal`, `orange`)
- **`level`** : le niveau du mini-onboarding (1, 2 ou 3). Contrôle le nombre de briques allumées dans la pyramide visuelle (1 = base, 2 = base + milieu, 3 = complète)
- **`link`** : quand il est défini, la carte devient cliquable. Commenter ou supprimer le champ pour une carte statique.

## Hébergement

Le site est déployé automatiquement via GitHub Pages depuis la branche `main`.
