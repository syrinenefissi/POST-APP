// Fonction pour ajouter un Post 

async function postUser(userData) {
  const response = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    body: userData,
  });

  if (!response.ok) {
    throw new Error("Erreur réseau lors de l'envoi de l'utilisateur");
  }

  return response.json();
}