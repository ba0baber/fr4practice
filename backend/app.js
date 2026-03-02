const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors'); 
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const JWT_ACCESS_SECRET = 'your_access_secret_key';
const JWT_REFRESH_SECRET = 'your_refresh_secret_key';
const ACCESS_EXPIRES_IN = '15m'; 
const REFRESH_EXPIRES_IN = '7d'; 

let refreshTokens = [];

async function hashPassword(password) {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const [scheme, token] = authHeader.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = payload; 
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

let users = []; 
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

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clothing Store API',
      version: '1.0.0',
      description: 'API для управления товарами интернет-магазина одежды',
      contact: {
        name: 'ba0baber',
        url: 'https://github.com/ba0baber'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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


/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена товара в рублях
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *         rating:
 *           type: number
 *           description: Рейтинг товара (0-5)
 *         image:
 *           type: string
 *           description: URL изображения товара
 *       example:
 *         id: "abc123"
 *         name: "Тишка"
 *         category: "Футболки"
 *         description: "Хлопковая футболка прямого кроя"
 *         price: 5500
 *         stock: 25
 *         rating: 4.5
 *         image: "/images/tshort.jpeg"
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Управление товарами
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создает новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  
  if (!exists) return res.status(404).json({ error: "Product not found" });
  
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Регистрация и вход
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации
 */
app.post("/api/auth/register", async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hashedPassword = await hashPassword(password);
  
  const newUser = {
    id: nanoid(6),
    email,
    first_name,
    last_name,
    hashedPassword
  };

  users.push(newUser);
  
  res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    first_name: newUser.first_name,
    last_name: newUser.last_name
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему (возвращает JWT токены)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Неверные данные
 */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await verifyPassword(password, user.hashedPassword);
  
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );

  refreshTokens.push({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    }
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление access токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новые токены
 *       401:
 *         description: Невалидный refresh token
 */
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  const storedToken = refreshTokens.find(t => t.token === refreshToken);
  if (!storedToken) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    const user = users.find(u => u.id === payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    );

    refreshTokens = refreshTokens.filter(t => t.token !== refreshToken);
    refreshTokens.push({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (err) {
    refreshTokens = refreshTokens.filter(t => t.token !== refreshToken);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Не авторизован
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    id: req.user.userId,
    email: req.user.email,
    first_name: req.user.first_name,
    last_name: req.user.last_name
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный выход
 */
app.post("/api/auth/logout", (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    refreshTokens = refreshTokens.filter(t => t.token !== refreshToken);
  }
  
  res.json({ success: true });
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
  console.log(`Swagger документация: http://localhost:${port}/api-docs`);
});