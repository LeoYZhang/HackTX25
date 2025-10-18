# User API Testing Guide

## Prerequisites
1. Make sure MongoDB is running locally or set up MongoDB Atlas
2. Set your `MONGODB_URI` in a `.env` file
3. Start the server: `npm run dev`

## API Endpoints

### 1. Create a User
```bash
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "points": 100,
  "mindmap": {
    "nodes": [
      {"id": "1", "label": "Main Topic", "x": 100, "y": 100},
      {"id": "2", "label": "Sub Topic", "x": 200, "y": 200}
    ],
    "edges": [
      {"source": "1", "target": "2"}
    ]
  }
}
```

### 2. Get All Users
```bash
GET http://localhost:3000/api/users
```

### 3. Get User by ID
```bash
GET http://localhost:3000/api/users/{USER_ID}
```

### 4. Get User by Username
```bash
GET http://localhost:3000/api/users/username/testuser
```

### 5. Update User
```bash
PUT http://localhost:3000/api/users/{USER_ID}
Content-Type: application/json

{
  "points": 150,
  "mindmap": {
    "nodes": [
      {"id": "1", "label": "Updated Topic", "x": 150, "y": 150}
    ],
    "edges": []
  }
}
```

### 6. Login User
```bash
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### 7. Delete User
```bash
DELETE http://localhost:3000/api/users/{USER_ID}
```

## Example using curl

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "mypassword",
    "points": 50,
    "mindmap": {"nodes": [], "edges": []}
  }'
```

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "mypassword"
  }'
```
