Ce fichier explique comment Visual Studio a créé le projet.

Les outils suivants ont été utilisés pour générer ce projet :
- create-vite

Les étapes suivantes ont été utilisées pour générer ce projet :
- Créez un projet React avec create-vite : `npm init --yes vite@latest samaboutique.client -- --template=react-ts  --no-rolldown --no-immediate`.
- Mettez à jour `vite.config.ts` pour configurer le proxy et les certificats.
- Ajoutez `@type/node` pour la saisie `vite.config.js`.
- Mettez à jour le composant `App` pour récupérer et afficher les informations sur la météo.
- Créez le fichier projet (`samaboutique.client.esproj`).
- Créez `launch.json` pour activer le débogage.
- Ajoutez le projet à la solution.
- Mettez à jour le point de terminaison proxy pour qu’il soit le point de terminaison du serveur back-end.
- Ajoutez le projet à la liste des projets de démarrage.
- Écrivez ce fichier.
