# Screenshots Directory

## How to Add Screenshots

1. **Take Screenshots** of your application:
   - Admin dashboard
   - Manager dashboard  
   - Employee dashboard
   - Analytics page
   - Project management page
   - Task management page

2. **Save Images** in this folder with these exact names:
   - `admin-dashboard.png`
   - `manager-dashboard.png`
   - `employee-dashboard.png`
   - `analytics.png`
   - `project-management.png`
   - `task-management.png`

3. **Commit and Push** to GitHub:
   ```bash
   git add screenshots/
   git commit -m "Add project screenshots"
   git push origin main
   ```

## Image Guidelines

- **Format**: PNG or JPG
- **Size**: Max 1920x1080 (Full HD)
- **Quality**: High quality, clear text
- **Content**: Show actual project features

## Alternative: Use GitHub Issues for Images

If you want to use external image hosting:

1. Create a GitHub issue in your repo
2. Drag & drop images to the issue
3. Copy the generated image URLs
4. Replace image paths in README.md with URLs

Example:
```markdown
![Login Page](https://user-images.githubusercontent.com/username/image-id.png)
```