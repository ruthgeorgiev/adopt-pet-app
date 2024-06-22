const express = require('express');
const app = express();
const port = 8000;
const pets = require('./petList');

// Middleware to parse JSON bodies
app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>Adopt a Pet!</h1>
    <p>Browse through the links below to find your new furry friend:</p>
    <ul>
      <li><a href="/animals/dogs">Dogs</a></li>
      <li><a href="/animals/cats">Cats</a></li>
      <li><a href="/animals/rabbits">Rabbits</a></li>
    </ul>
  `);
});

// JSON route for all animal types
app.get('/animals', (req, res) => {
  const animalTypes = Object.keys(pets).map(type => ({
    type: type,
    animals: pets[type]
  }));
  res.json({ animalTypes });
});

// Route for list of pets by type
app.get('/animals/:pet_type', (req, res) => {
  const petType = req.params.pet_type;
  const petList = pets[petType];

  if (!petList) {
    return res.status(404).send('Pet type not found');
  }

  const petItems = petList.map((pet, index) => {
    return `<li><a href="/animals/${petType}/${index}">${pet.name}</a></li>`;
  }).join('');

  res.send(`
    <h1>List of ${petType.charAt(0).toUpperCase() + petType.slice(1)}</h1>
    <ul>${petItems}</ul>
  `);
});

// Route for individual pet profile
app.get('/animals/:pet_type/:pet_id', (req, res) => {
  const petType = req.params.pet_type;
  const petId = parseInt(req.params.pet_id);
  const petList = pets[petType];

  if (!petList || petId < 0 || petId >= petList.length) {
    return res.status(404).send('Pet not found');
  }

  const pet = petList[petId];

  res.send(`
    <h1>${pet.name}</h1>
    <img src="${pet.url}" alt="${pet.name}" width="500">
    <p>${pet.description}</p>
    <ul>
      <li>Breed: ${pet.breed}</li>
      <li>Age: ${pet.age}</li>
    </ul>
    <a href="/animals/${petType}">Back to ${petType}</a>
  `);
});

// Add a new pet
app.post('/animals/:pet_type', (req, res) => {
  const petType = req.params.pet_type;
  const newPet = req.body;

  if (!pets[petType]) {
    return res.status(404).send('Pet type not found');
  }

  pets[petType].push(newPet);
  res.status(201).send('New pet added');
});

// Update an existing pet
app.put('/animals/:pet_type/:pet_id', (req, res) => {
  const petType = req.params.pet_type;
  const petId = parseInt(req.params.pet_id);
  const updatedPet = req.body;

  if (!pets[petType] || petId < 0 || petId >= pets[petType].length) {
    return res.status(404).send('Pet not found');
  }

  pets[petType][petId] = { ...pets[petType][petId], ...updatedPet };
  res.send('Pet updated');
});

// Delete a pet
app.delete('/animals/:pet_type/:pet_id', (req, res) => {
  const petType = req.params.pet_type;
  const petId = parseInt(req.params.pet_id);

  if (!pets[petType] || petId < 0 || petId >= pets[petType].length) {
    return res.status(404).send('Pet not found');
  }

  pets[petType].splice(petId, 1);
  res.send('Pet deleted');
});
