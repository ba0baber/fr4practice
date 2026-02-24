const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3000;

let products = [
  {
    id: nanoid(6),
    name: "Тишка",
    category: "Футболки",
    description: "Хлопковая футболка прямого кроя. Подходит для повседневной носки.",
    price: 5500,
    stock: 25,
    rating: 4.5,
    image: "/images/tshort.jpeg" 
  },
  {
    id: nanoid(6),
    name: "Джинсы Slim Fit",
    category: "Джинсы",
    description: "Узкие джинсы из качественного денима. Идеально сидят по фигуре.",
    price: 9777,
    stock: 15,
    rating: 4.3,
    image: "/images/jeans.jpeg"
  },
  {
    id: nanoid(6),
    name: "Кожаная куртка",
    category: "Куртки",
    description: "Стильная кожаная куртка из натуральной кожи. С двумя карманами.",
    price: 13000,
    stock: 8,
    rating: 4.8,
    image: "/images/jacket.jpeg"
  },
  {
    id: nanoid(6),
    name: "Спортивные штаны",
    category: "Спортивная одежда",
    description: "Удобные штаны для спорта и активного отдыха. Материал дышит.",
    price: 8700,
    stock: 30,
    rating: 4.2,
    image: "/images/sport.jpeg"
  },
  {
    id: nanoid(6),
    name: "Рубашка в клетку",
    category: "Рубашки",
    description: "Классическая рубашка в красную клетку. Из мягкого хлопка.",
    price: 100000,
    stock: 12,
    rating: 4.4,
    image: "/images/rubashka.jpeg"
  },
  {
    id: nanoid(6),
    name: "Худи суприм",
    category: "Кофты",
    description: "Теплое худи с глубоким капюшоном и передним карманом.",
    price: 9200,
    stock: 18,
    rating: 4.6,
    image: "/images/hoodie.jpg"
  },
  {
    id: nanoid(6),
    name: "Шерстяное пальто",
    category: "Верхняя одежда",
    description: "Элегантное пальто из шерсти. Двубортное, с поясом.",
    price: 125000,
    stock: 5,
    rating: 4.9,
    image: "/images/palto.jpeg"
  },
  {
    id: nanoid(6),
    name: "Летнее платье",
    category: "Платья",
    description: "Легкое платье с цветочным принтом. Идеально для лета.",
    price: 2600,
    stock: 20,
    rating: 4.1,
    image: "/images/dress.jpeg"
  },
  {
    id: nanoid(6),
    name: "Шузы",
    category: "Обувь",
    description: "Прочные ботинки из натуральной кожи. На шнуровке.",
    price: 15800,
    stock: 10,
    rating: 4.7,
    image: "/images/shoes.jpeg"
  },
  {
    id: nanoid(6),
    name: "Кепка",
    category: "Аксессуары",
    description: "Хлопковая бейсболка с регулируемым размером.",
    price: 8888,
    stock: 45,
    rating: 4.0,
    image: "/images/cap.jpeg"
  }
];

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  res.json(product);
});

app.post("/api/products", (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;

  if (!name || !category || !description || !price || !stock) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    rating: rating ? Number(rating) : 0,
    image: image || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500"
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, category, description, price, stock, rating, image } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image;

  res.json(product);
});

app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  
  if (!exists) return res.status(404).json({ error: "Product not found" });
  
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});