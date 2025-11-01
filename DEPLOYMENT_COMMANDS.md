# 🚀 LỆNH DEPLOY - COPY & PASTE

## 📋 CHUẨN BỊ

### 1. Install Vercel CLI (Chạy 1 lần)
```powershell
npm install -g vercel
vercel login
```

---

## 🖥️ DEPLOY BACKEND

### Bước 1: Di chuyển vào thư mục server
```powershell
cd "d:\DTDM\hotelbooking\HotelBooking-server\server"
```

### Bước 2: Deploy lên Vercel
```powershell
vercel --prod
```

### Bước 3: Kiểm tra
Mở browser: `https://[your-server-name].vercel.app/`
Kết quả mong đợi: "API is working"

### Bước 4: Set Environment Variables trên Vercel Dashboard
Vào: https://vercel.com/dashboard → Chọn project → Settings → Environment Variables

```
SUPABASE_URL=https://thlqyxugdykoactsbttt.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NODE_ENV=production
```

### Bước 5: Redeploy sau khi set env
```powershell
vercel --prod
```

---

## 📱 DEPLOY FRONTEND

### Bước 1: Di chuyển vào thư mục client
```powershell
cd "d:\DTDM\hotelbooking\HotelBooking-main\client"
```

### Bước 2: Cập nhật file .env.local
```env
VITE_API_URL=https://[your-server-name].vercel.app/api
VITE_SUPABASE_URL=https://thlqyxugdykoactsbttt.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Bước 3: Deploy lên Vercel
```powershell
vercel --prod
```

### Bước 4: Set Environment Variables trên Vercel Dashboard
```
VITE_API_URL=https://[your-server-name].vercel.app/api
VITE_SUPABASE_URL=https://thlqyxugdykoactsbttt.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Bước 5: Redeploy
```powershell
vercel --prod
```

---

## ✅ KIỂM TRA SAU KHI DEPLOY

### Test Backend API
```powershell
# Test health endpoint
curl https://[your-server-name].vercel.app/

# Test get rooms (public API)
curl https://[your-server-name].vercel.app/api/rooms
```

### Test Frontend
Mở browser: `https://[your-client-name].vercel.app/`

---

## 🔄 UPDATE CODE VÀ REDEPLOY

### Khi có thay đổi code Backend:
```powershell
cd "d:\DTDM\hotelbooking\HotelBooking-server\server"
vercel --prod
```

### Khi có thay đổi code Frontend:
```powershell
cd "d:\DTDM\hotelbooking\HotelBooking-main\client"
vercel --prod
```

---

## 🐛 TROUBLESHOOTING

### Lỗi "No such file or directory"
```powershell
# Kiểm tra đường dẫn
pwd
# Đảm bảo bạn đang ở đúng thư mục có file package.json
```

### Lỗi "Build failed"
```powershell
# Chạy build local để test
npm run build

# Kiểm tra logs trên Vercel Dashboard
```

### Lỗi CORS
```javascript
// Cập nhật server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://[your-client-name].vercel.app'
  ],
  credentials: true
}));
```

### Lỗi Environment Variables
```powershell
# Kiểm tra trên Vercel Dashboard
# Settings → Environment Variables
# Đảm bảo tất cả các biến đã được set
```

---

## 📝 CHECKLIST DEPLOY

### Backend:
- [ ] Install Vercel CLI
- [ ] Login Vercel
- [ ] Deploy server
- [ ] Set environment variables
- [ ] Redeploy
- [ ] Test API endpoints

### Frontend:
- [ ] Update .env.local với server URL
- [ ] Deploy client
- [ ] Set environment variables
- [ ] Redeploy
- [ ] Test trên browser

### Database:
- [ ] Tạo Supabase project
- [ ] Chạy SQL scripts
- [ ] Tạo Storage bucket "hotel-images"
- [ ] Set bucket public
- [ ] Copy credentials

### Authentication:
- [ ] Tạo Clerk application
- [ ] Cấu hình OAuth providers
- [ ] Setup webhook URL: https://[server].vercel.app/api/clerk
- [ ] Copy credentials

---

## 🎯 LỆNH NHANH

### Deploy tất cả (chạy lần lượt):
```powershell
# Backend
cd "d:\DTDM\hotelbooking\HotelBooking-server\server"; vercel --prod

# Frontend
cd "d:\DTDM\hotelbooking\HotelBooking-main\client"; vercel --prod
```

### Xem logs:
```powershell
vercel logs [deployment-url]
```

### Remove project:
```powershell
vercel remove [project-name]
```

---

## 📊 THÔNG TIN QUAN TRỌNG

### URLs cần lưu:
```
Backend:  https://[your-server].vercel.app/api
Frontend: https://[your-client].vercel.app
Supabase: https://thlqyxugdykoactsbttt.supabase.co
```

### Environment Variables cần thiết:

**Backend (5 biến):**
1. SUPABASE_URL
2. SUPABASE_ANON_KEY
3. CLERK_PUBLISHABLE_KEY
4. CLERK_SECRET_KEY
5. NODE_ENV

**Frontend (4 biến):**
1. VITE_API_URL
2. VITE_SUPABASE_URL
3. VITE_SUPABASE_ANON_KEY
4. VITE_CLERK_PUBLISHABLE_KEY

---

## 💡 TIPS

### Tip 1: Kiểm tra trước khi deploy
```powershell
# Test local trước
npm install
npm run dev    # hoặc npm start cho server
```

### Tip 2: Git commit trước khi deploy
```powershell
git add .
git commit -m "Ready for deployment"
git push
```

### Tip 3: Sử dụng .vercelignore
```
node_modules
.env
.env.local
.DS_Store
```

### Tip 4: Monitor performance
- Vào Vercel Dashboard → Analytics
- Xem response time, bandwidth usage
- Check error logs

---

## 🆘 EMERGENCY COMMANDS

### Rollback về version trước:
```powershell
vercel rollback
```

### Deploy version cụ thể:
```powershell
vercel --prod --force
```

### Clear cache:
```powershell
vercel build --force
```

---

**✅ ĐÃ SẴN SÀNG DEPLOY!**
