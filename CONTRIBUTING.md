# Contribuer

Merci de votre intérêt pour BriqueParBrique ! Toute contribution est la bienvenue.

## Proposer une nouvelle brique

1. Forkez le dépôt
2. Ajoutez une entrée dans `_data/briques.yml` :

   ```yaml
   - name: NomDeLaBrique
     color: blue          # blue, teal ou orange
     level: 1
     status: Bientôt disponible
     link: /NomDeLaBrique/
   ```

3. Créez le contenu du mini-onboarding si prêt
4. Ouvrez une Pull Request

## Améliorer une brique existante

- Corrigez le contenu ou améliorez la pédagogie
- Montez le niveau (`level: 2` ou `level: 3`) si vous ajoutez du contenu avancé
- Ajoutez ou mettez à jour le `link` quand le contenu est prêt

## Améliorer le site

- Corrections de bugs, améliorations de style ou d'accessibilité
- Testez localement avec `just serve` avant de soumettre (voir [DEVELOPER.md](DEVELOPER.md))

## Conventions

- Les messages de commit sont en anglais
- Les contenus pédagogiques sont en français
- Gardez les choses simples : une brique = un sujet, un pas à la fois

## Licence

En contribuant, vous acceptez que vos contributions soient publiées sous la [licence MIT](LICENSE).
