#Project Structure


focupet-backend/
│── src/
│   ├── config/          # Database and config
│   │   └── db.js
│   ├── models/          # Database models
│   │   └── userModel.js
│   ├── controllers/     # Business logic
│   │   └── authController.js
│   ├── routes/          # API routes
│   │   └── authRoutes.js
│   ├── middleware/      # Middleware (JWT etc.)
│   │   └── authMiddleware.js
│   └── app.js           # Express entry point
│
├── .env                 # Environment variables
├── .gitignore
├── package.json
