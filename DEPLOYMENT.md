# Deployment Guide

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/pms-system.git
cd pms-system
```

### 2. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
```

**Edit Backend/.env with your values:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pms
JWT_SECRET=your_32_char_secret_here
JWT_REFRESH_SECRET=your_32_char_refresh_secret_here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
cp .env.example .env
```

**Edit Frontend/.env:**
```bash
VITE_API_URL=http://localhost:3000
```

### 4. Start Development Servers
```bash
# Backend (Terminal 1)
cd Backend
npm start

# Frontend (Terminal 2)
cd Frontend
npm run dev
```

## Production Deployment

### Backend (Railway/Heroku)
1. Set environment variables in platform dashboard
2. Deploy from GitHub
3. Ensure MongoDB Atlas is accessible

### Frontend (Vercel/Netlify)
1. Set `VITE_API_URL` to production backend URL
2. Deploy from GitHub
3. Configure build settings

## Default Login Credentials
- **Admin**: admin@pms.com / admin12345
- **Manager**: manager@pms.com / manager123  
- **Employee**: employee@pms.com / employee123

## Security Checklist
- [ ] Environment variables set
- [ ] MongoDB Atlas configured
- [ ] Strong JWT secrets generated
- [ ] HTTPS enabled in production
- [ ] CORS properly configured