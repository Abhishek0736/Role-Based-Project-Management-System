# MongoDB Atlas Setup Guide

## Step 1: Get Your Atlas Connection String

1. **Go to MongoDB Atlas Dashboard**
   - Visit: https://cloud.mongodb.com/
   - Login to your account

2. **Get Connection String**
   - Click "Connect" button on your cluster
   - Select "Connect your application"
   - Choose "Node.js" driver
   - Copy the connection string

## Step 2: Update Backend .env File

Replace this line in `Backend/.env`:
```
MONGODB_URI=mongodb+srv://replace-with-your-username:replace-with-your-password@replace-with-cluster-name.mongodb.net/pms?retryWrites=true&w=majority
```

**With your actual values:**
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/pms?retryWrites=true&w=majority
```

## Step 3: Example Connection String

If your Atlas details are:
- Username: `pmsuser`
- Password: `mypassword123`
- Cluster: `cluster0.abc123`

Then your connection string should be:
```
MONGODB_URI=mongodb+srv://pmsuser:mypassword123@cluster0.abc123.mongodb.net/pms?retryWrites=true&w=majority
```

## Step 4: Restart Server

```bash
cd Backend
npm start
```

## Step 5: Verify Connection

- Check terminal for "✅ Database connected successfully"
- All new data will now save to Atlas
- View data in Atlas dashboard → "Browse Collections"

## Troubleshooting

**If connection fails:**
1. Check username/password are correct
2. Ensure IP address is whitelisted in Atlas
3. Verify cluster name is correct
4. Check if password contains special characters (URL encode them)

**Special Characters in Password:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

## Security Note

- Never commit your actual connection string to GitHub
- Use environment variables for production
- Keep your Atlas credentials secure