# Security Guidelines

## Environment Variables

### Required Backend Variables
```bash
MONGODB_URI=mongodb://localhost:27017/pms
JWT_SECRET=your_super_strong_jwt_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_super_strong_refresh_secret_key_here_min_32_chars
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Required Frontend Variables
```bash
VITE_API_URL=https://your-backend-domain.com
```

## Security Features Implemented

### 1. Environment Variable Protection
- All sensitive data moved to environment variables
- No hardcoded secrets in codebase
- Mandatory environment variable validation

### 2. JWT Security
- Strong secret keys required (minimum 32 characters)
- Separate secrets for access and refresh tokens
- Token expiration: Access (15min), Refresh (7 days)

### 3. Database Security
- MongoDB URI required from environment
- No default database connections
- Connection validation

### 4. CORS Protection
- Configurable allowed origins
- Environment-based origin control
- Credentials support for authenticated requests

### 5. Rate Limiting
- API rate limiting: 100 requests per 15 minutes
- Auth rate limiting: 5 attempts per 15 minutes
- Configurable through environment variables

### 6. Input Sanitization
- XSS protection middleware
- Script tag removal
- Request body/query/params sanitization

### 7. Security Headers
- Helmet.js integration
- Content Security Policy
- HSTS headers
- XSS protection

## Production Deployment Checklist

### Backend Security
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Use HTTPS in production
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Use secure database connection (MongoDB Atlas)
- [ ] Enable rate limiting
- [ ] Set up proper logging
- [ ] Use environment variables for all secrets

### Frontend Security
- [ ] Use HTTPS for API calls
- [ ] Set proper VITE_API_URL
- [ ] Remove console.logs in production
- [ ] Enable CSP headers
- [ ] Use secure cookie settings

### Database Security
- [ ] Use MongoDB Atlas or secure self-hosted instance
- [ ] Enable authentication
- [ ] Use SSL/TLS connections
- [ ] Regular backups
- [ ] Network access restrictions

## Strong Password Generation

Generate strong JWT secrets:
```bash
# Generate 32-character random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Environment Setup Commands

```bash
# Backend
cd Backend
cp .env.example .env
# Edit .env with your secure values

# Frontend  
cd Frontend
cp .env.example .env
# Edit .env with your API URL
```

## Security Best Practices

1. **Never commit .env files**
2. **Use different secrets for development/production**
3. **Rotate JWT secrets regularly**
4. **Monitor for suspicious activity**
5. **Keep dependencies updated**
6. **Use HTTPS in production**
7. **Implement proper logging**
8. **Regular security audits**