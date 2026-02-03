# CollabDocs

Hey! So this is a project I built for a hackathon - it's basically like a Google Docs clone where people can edit documents together in real-time.

## What it does

- Sign up/login system
- Create documents and edit them
- Multiple people can type in the same doc at the same time and see each other's changes instantly
- Auto-saves your work so you don't lose anything
- Keeps track of old versions if you mess something up
- Works on mobile too

## Built with

**Backend:** Node.js, Express, MongoDB, Socket.io, JWT

**Frontend:** React, Socket.io-client, React Router, Axios

## How to run it

You'll need Node.js and MongoDB installed.

### Setup

```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

Create `.env` in backend folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collaboration-platform
JWT_SECRET=your_secret_here
```

Create `.env` in frontend folder:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Run it

Start MongoDB first, then:

```bash
# Terminal 1 - backend
cd backend
npm start

# Terminal 2 - frontend
cd frontend
npm start
```

Go to `http://localhost:3000` and you're good to go!

## How to use

1. Create an account
2. Make a new document
3. Start typing - any other logged in user can see your document and edit it too
4. Everything syncs in real-time

## Team - Group 3

| Name             | Enrollment No.|
|------------------|---------------|
Dhruv Sharma      - A023166922027 
Aaditya Prakash   - A2305222779 
Aakash Khandelwal - A2305222292 
Mayank            - A2345922060 
Naman Singhal     - A2305222237 

**Course:** B.Tech CSE | **College:** Amity University, Noida

---

# Thank you 