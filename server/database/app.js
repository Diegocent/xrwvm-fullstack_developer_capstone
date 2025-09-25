const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3030;

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Leer datos JSON
const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

// Conexión a MongoDB
mongoose.connect("mongodb://mongo_db:27017/", { dbName: 'dealershipsDB' });

// Modelos
const Reviews = require('./review');
const Dealerships = require('./dealership');

// Inicializar la base de datos
(async () => {
    try {
      await Reviews.deleteMany({});
      await Reviews.insertMany(reviews_data.reviews); // <- cambio de ['reviews'] a .reviews
  
      await Dealerships.deleteMany({});
      await Dealerships.insertMany(dealerships_data.dealerships); // <- cambio de ['dealerships'] a .dealerships
  
      console.log("Base de datos inicializada correctamente");
    } catch (error) {
      console.error("Error inicializando la base de datos:", error);
    }
  })();

// Rutas

// Ruta de inicio
app.get('/', async (req, res) => {
  res.send("Welcome to the Mongoose API");
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const dealers = await Dealerships.find();
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

// Fetch dealerships by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state; // normalizar estado
    const dealers = await Dealerships.find({ state: state });
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships by state' });
  }
});

// Fetch dealership by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealer = await Dealerships.findOne({ id: parseInt(req.params.id) });
    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found' });
    }
    res.json(dealer);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealership by ID' });
  }
});

// Insert review
app.post('/insert_review', async (req, res) => {
    try {
      const data = req.body;
  
      const lastReview = await Reviews.findOne().sort({ id: -1 });
      const new_id = lastReview ? lastReview.id + 1 : 1;
  
      const review = new Reviews({
        id: new_id,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year,
      });
  
      const savedReview = await review.save();
      res.json(savedReview);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error inserting review' });
    }
  });
  

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
