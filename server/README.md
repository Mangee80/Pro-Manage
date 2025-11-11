# Pro Manage - Backend API

Backend server for Pro Manage project management application.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt for password hashing

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Cards (Tasks)
- `GET /api/card/getcards` - Get all user cards
- `POST /api/card/createcard` - Create a new card
- `PUT /api/card/updateCard/:id` - Update a card
- `DELETE /api/card/deleteCard/:id` - Delete a card
- `PUT /api/card/updateChecklistItem/:id` - Update checklist item
- `PUT /api/card/updatetag/:id` - Update card tag/status
- `GET /api/card/analytics` - Get analytics data

## Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGODB_URL` - MongoDB connection string
- `JWT_SECRET` - JWT secret key

## Installation
```bash
npm install
npm start
```
