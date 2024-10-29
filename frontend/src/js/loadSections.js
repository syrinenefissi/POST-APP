// Fonction pour charger une section dans un conteneur et exécuter un callback
function loadSection(containerId, filePath, callback) {
    fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        document.getElementById(containerId).innerHTML = data; // Injecte le contenu HTML
        if (callback) callback(); // Exécute le callback après le chargement de la section
      })
      .catch((error) =>
        console.error('Erreur de chargement de la section:', error)
      );
  }
  
  // Charger la section hero et attacher les écouteurs pour afficher/masquer le formulaire
  loadSection('heroContainer', '../src/sections/hero.html', () => {
    const addPostButton = document.getElementById('addPostButton');
    const cancelButton = document.querySelector('#postsForm .cancel-button');
  
    // Écouteur pour afficher le formulaire lors du clic sur "Ajouter un post"
    if (addPostButton) {
      addPostButton.addEventListener('click', showForm);
    } else {
      console.error("Le bouton 'Ajouter un post' n'a pas été trouvé.");
    }
  
    // Écouteur pour masquer le formulaire lors du clic sur "Annuler"
    if (cancelButton) {
      cancelButton.addEventListener('click', hideForm);
    } else {
      console.error("Le bouton 'Annuler' n'a pas été trouvé.");
    }
  });
  
  // Charger la section history ou post-card
  loadSection('historyContainer', '../src/sections/post-card.html');