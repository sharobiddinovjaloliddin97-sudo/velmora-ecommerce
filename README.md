# Velmora E-Commerce

Velmora is a production-ready bilingual e-commerce application built with React, Django REST Framework, PostgreSQL, and JWT authentication.

## Live URLs

Frontend:
https://velmora-ecommerce-chi.vercel.app

Backend API:
https://velmora-ecommerce-production.up.railway.app/api/v1/

API Documentation:
https://velmora-ecommerce-production.up.railway.app/api/docs/

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Python
- Django
- Django REST Framework
- SimpleJWT
- PostgreSQL
- Gunicorn
- WhiteNoise

### Infrastructure
- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL
- Media Storage: Supabase Storage
- Email: Brevo Transactional Email API
- Source Control: GitHub

## Main Features

- Uzbek and Russian languages
- User registration and login
- JWT authentication
- HttpOnly refresh token
- Password reset via email
- Product catalog
- Search, filtering, sorting and pagination
- Product variants
  - Color
  - Size
  - SKU
  - Price
  - Stock
- Product image gallery
- Favorites
- Shopping cart
- Checkout
- Tashkent delivery
- Cash on delivery
- Order history
- Order status management
- Stock management
- Idempotent checkout
- Django Admin
- Responsive frontend
- Persistent cloud media storage

## Project Structure

```text
velmora-ecommerce/
├── backend/
│   ├── accounts/
│   ├── catalog/
│   ├── orders/
│   ├── core/
│   ├── config/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vercel.json
│   └── package.json
│
├── .env.example
└── README.md