// Fonction pour afficher le formulaire de création de post
function showForm() {
  const addPostButton = document.getElementById('addPostButton');
  const postForm = document.getElementById('postsForm');

  if (addPostButton && postForm) {
    addPostButton.style.display = 'none';
    postForm.style.display = 'block';
  } else {
    console.error("Le bouton ou le formulaire n'a pas été trouvé.");
  }
}

// Fonction pour masquer le formulaire et réafficher le bouton "Ajouter un post"
function hideForm() {
  const addPostButton = document.getElementById('addPostButton');
  const postForm = document.getElementById('postsForm');

  if (addPostButton && postForm) {
    addPostButton.style.display = 'block';
    postForm.style.display = 'none';
  } else {
    console.error("Le bouton ou le formulaire n'a pas été trouvé.");
  }
}

// Fonction pour envoyer le formulaire de création d'utilisateur et de post
async function submitUserForm() {
  const pseudo = document.getElementById('pseudo').value;
  const photo = document.getElementById('photo').files[0];
  const content = document.getElementById('content').value;

  const formData = new FormData();
  formData.append('pseudo', pseudo);
  formData.append('content', content);
  if (photo) {
    formData.append('photo', photo);
  }

  try {
    const response = await postUser(formData);
    if (response && response.userId) {
      alert('Utilisateur et post ajoutés avec succès !');
      hideForm();
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur et du post:", error);
  }
}
// Fonction pour afficher les posts dans la section historique
async function displayPosts() {
  try {
    const posts = await getPosts();
    const commentsSection = document.getElementById('commentsSection');
    commentsSection.innerHTML = ''; // Vider la section avant d'ajouter les posts

    posts.forEach((post) => {
      const postCard = document.createElement('div');
      postCard.classList.add('post-card');
      postCard.setAttribute('data-id', post.id);

      // Échappe les guillemets pour éviter les erreurs de syntaxe
      const safeContent = post.content.replace(/"/g, '&quot;');

      postCard.innerHTML = `
        <div class="post-content" id="postText${post.id}">
          <span class="mention">@${post.pseudo}</span>
          <p>${post.content}</p>
          <button onclick="editPost(${post.id})">Modifier</button>
          <button onclick="deletePost(${post.id})">Supprimer</button>
        </div>
        ${
          post.photo
            ? `<img src="http://localhost:3000/uploads/${post.photo}" alt="Photo de ${post.pseudo}" class="user-photo" style="width: 60px; height: 60px;"/>`
            : ''
        }
        <div class="actions">
          <button class="like-button" onclick="toggleLike(${post.id}, ${
        post.like
      })">
            ${post.like ? '❤️' : '♡'}
          </button>
          <span class="timestamp">${new Date(
            post.timestamp
          ).toLocaleString()}</span>
        </div>
      `;

      commentsSection.appendChild(postCard);
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage des posts:", error);
  }
}

// Fonction pour passer en mode édition
function editPost(postId) {
  const postContent = document.getElementById(`postText${postId}`);
  const originalContent = postContent.querySelector('p').innerText; // Récupérer le texte du paragraphe

  // Remplacer le contenu par un champ de saisie avec les boutons "Enregistrer" et "Annuler"
  postContent.innerHTML = `
    <input type="text" id="editContent${postId}" value="${originalContent.replace(
    /"/g,
    '&quot;'
  )}" />
    <button onclick="savePost(${postId})">Enregistrer</button>
    <button onclick="cancelEdit(${postId}, '${originalContent.replace(
    /'/g,
    "\\'"
  )}')">Annuler</button>
  `;
}

// Fonction pour enregistrer la modification
async function savePost(postId) {
  const newContent = document.getElementById(`editContent${postId}`).value;

  try {
    const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newContent }),
    });

    if (response.ok) {
      alert('Post mis à jour avec succès');
      displayPosts(); // Recharge la liste des posts pour montrer la modification
    } else {
      console.error('Erreur lors de la mise à jour du post');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post:', error);
  }
}

// Fonction pour annuler l'édition et restaurer le contenu original
function cancelEdit(postId, originalContent) {
  const postContent = document.getElementById(`postText${postId}`);

  // Restaurer l'affichage original
  postContent.innerHTML = `
    <span class="mention">@${postContent.getAttribute('data-pseudo')}</span>
    <p>${originalContent}</p>
    <button onclick="editPost(${postId})">Modifier</button>
    <button onclick="deletePost(${postId})">Supprimer</button>
  `;
}

// Fonction pour supprimer le post
async function deletePost(postId) {
  const confirmation = confirm('Êtes-vous sûr de vouloir supprimer ce post ?');

  if (confirmation) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/posts/${postId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        alert('Post supprimé avec succès');
        displayPosts(); // Recharge les posts pour mettre à jour la liste
      } else {
        console.error('Erreur lors de la suppression du post');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error);
    }
  }
}

// Fonction pour liker et annuler le like
async function toggleLike(postId, currentLikeStatus) {
  const newLikeStatus = !currentLikeStatus; // Inverse le statut du like
  console.log('Nouveau statut du like:', newLikeStatus); // Debug

  try {
    const response = await fetch(
      `http://localhost:3000/api/posts/${postId}/like`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ like: newLikeStatus }),
      }
    );

    if (response.ok) {
      displayPosts(); // Recharge les posts pour montrer le nouveau statut du like
    } else {
      console.error('Erreur lors de la mise à jour du like');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du like:', error);
  }
}

// Charger les posts dès le chargement de la page
document.addEventListener('DOMContentLoaded', displayPosts);
