# 📊 POWERPOINT SLIDES OUTLINE

## SLIDE 1: TITLE SLIDE
```
🏨 HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN
Hotel Booking Management System

Sinh viên: [Tên của bạn]
MSSV: [MSSV]
Lớp: [Lớp]
Ngày: [Ngày thuyết trình]

[Logo/Image của một khách sạn đẹp]
```

---

## SLIDE 2: MỤC LỤC
```
📋 NỘI DUNG TRÌNH BÀY

1️⃣ Tổng quan hệ thống
2️⃣ Công nghệ sử dụng
3️⃣ Kiến trúc API Services
4️⃣ Chi tiết chức năng từng API
5️⃣ Deployment lên Vercel
6️⃣ Demo và Kết luận
```

---

## SLIDE 3: TỔNG QUAN HỆ THỐNG
```
🎯 BÀI TOÁN GIẢI QUYẾT

❌ Vấn đề:
• Đặt phòng khách sạn truyền thống chậm
• Khó kiểm tra tình trạng phòng real-time
• Chủ khách sạn khó quản lý booking

✅ Giải pháp:
• Nền tảng đặt phòng trực tuyến
• Tự động check availability
• Dashboard quản lý cho owner

[Icon: 👤 User ↔️ 🏨 Hotel Owner]
```

---

## SLIDE 4: CÔNG NGHỆ SỬ DỤNG
```
💻 TECH STACK

Frontend:
🔵 React.js + Vite
🎨 TailwindCSS
🔐 Clerk Auth

Backend:
🟢 Node.js + Express
🗄️ Supabase (PostgreSQL)
📦 Supabase Storage

Deployment:
☁️ Vercel (Serverless)

[Diagram: Client → API → Database]
         [Browser] → [Express] → [Supabase]
```

---

## SLIDE 5: KIẾN TRÚC TỔNG QUAN
```
🏗️ SYSTEM ARCHITECTURE

┌─────────────┐
│   Client    │ ← React App (Vercel)
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│  API Server │ ← Express.js (Vercel)
│  (Backend)  │
└──────┬──────┘
       │
   ┌───┴────┬─────────┐
   ▼        ▼         ▼
┌──────┐ ┌────┐ ┌─────────┐
│Clerk │ │DB  │ │Storage  │
│Auth  │ │SQL │ │Images   │
└──────┘ └────┘ └─────────┘
         Supabase
```

---

## SLIDE 6: DATABASE SCHEMA
```
🗄️ DATABASE STRUCTURE

┌────────┐         ┌─────────┐
│ USERS  │────────▶│ HOTELS  │
└────────┘         └────┬────┘
    │                   │
    │                   ▼
    │              ┌────────┐
    │              │ ROOMS  │
    │              └────┬───┘
    │                   │
    └────┬──────────────┘
         ▼
    ┌──────────┐
    │ BOOKINGS │
    └──────────┘

Key Relations:
• users.id → hotels.owner_id
• hotels.id → rooms.hotel_id
• rooms.id → bookings.room_id
• users.id → bookings.user_id
```

---

## SLIDE 7: API MODULES
```
📡 API STRUCTURE

/api
├── 👤 /user (4 endpoints)
│   ├── GET  /                    → Get user info
│   ├── POST /create-or-update    → Create/Update user
│   ├── PUT  /update-role         → Change role
│   └── POST /store-recent-search → Save search history
│
├── 🏨 /hotels (1 endpoint)
│   └── POST /                    → Register hotel
│
├── 🛏️ /rooms (4 endpoints)
│   ├── POST /                    → Create room + upload
│   ├── GET  /                    → Get all rooms
│   ├── GET  /owner               → Get owner's rooms
│   └── POST /toggle-availability → Toggle room status
│
└── 📅 /bookings (4 endpoints)
    ├── POST /check-availability  → Check room available
    ├── POST /book                → Create booking
    ├── GET  /user                → Get user bookings
    └── GET  /hotel               → Owner dashboard

TỔNG: 13 APIs
```

---

## SLIDE 8: USER MANAGEMENT APIs
```
👤 USER APIs - /api/user

1️⃣ GET /api/user
   • Lấy thông tin user hiện tại
   • Return: role, recentSearchedCities
   • Auth: Required

2️⃣ POST /api/user/create-or-update
   • Tạo/cập nhật user từ Clerk
   • Trigger: Clerk webhook
   • Auto set role: USER/OWNER

3️⃣ PUT /api/user/update-role
   • Chuyển đổi role
   • USER ↔️ OWNER

4️⃣ POST /api/user/store-recent-search
   • Lưu max 3 cities
   • FIFO queue
```

---

## SLIDE 9: HOTEL & ROOM APIs
```
🏨 HOTEL APIs

POST /api/hotels
├── Input: name, address, contact, city
├── Validate: 1 owner = 1 hotel
├── Auto update role → HOTEL_OWNER
└── Return: success message

🛏️ ROOM APIs

POST /api/rooms (⭐ Featured)
├── Multipart form-data
├── Upload 4 images → Supabase Storage
├── Generate UUID for each image
├── Get public URLs
└── Save room with image URLs

GET /api/rooms
├── Public API
├── Join: rooms + hotels + users
├── Filter: is_available = true
└── Sort: latest first
```

---

## SLIDE 10: BOOKING APIs
```
📅 BOOKING APIs

1️⃣ Check Availability
POST /api/bookings/check-availability
┌─────────────────────────────┐
│ Find conflicts in database: │
│ WHERE check_in <= checkOut  │
│   AND check_out >= checkIn  │
│   AND status != 'CANCELLED' │
└─────────────────────────────┘
Return: isAvailable (true/false)

2️⃣ Create Booking
POST /api/bookings/book
├── Verify auth
├── Check availability
├── Calculate price:
│   nights = (checkOut - checkIn) / 86400000
│   totalPrice = room.price * nights
├── Create booking (status: PENDING)
└── Return: success
```

---

## SLIDE 11: AUTHENTICATION FLOW
```
🔐 AUTHENTICATION WITH CLERK

User Login Flow:
┌────────┐      ┌───────┐      ┌────────┐
│Browser │─────▶│ Clerk │─────▶│Backend │
└────────┘      └───────┘      └────────┘
    ▲               │               │
    └───────────────┴───────────────┘
         JWT Token in Header

Protected Route:
Request
  → clerkMiddleware()
  → Extract userId
  → protect() middleware
  → Query user from DB
  → Attach req.user
  → next()

Code:
export const protect = async (req, res, next) => {
  const { userId } = req.auth;
  const user = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  req.user = user;
  next();
};
```

---

## SLIDE 12: FILE UPLOAD PROCESS
```
📤 IMAGE UPLOAD TO SUPABASE STORAGE

Flow:
┌────────┐   FormData    ┌────────┐
│ Client │──────────────▶│ Server │
└────────┘               └────┬───┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           [File 1]       [File 2]       [File 3]
              │               │               │
              ▼               ▼               ▼
         Generate UUID   Generate UUID   Generate UUID
              │               │               │
              ▼               ▼               ▼
          Upload to Supabase Storage (Parallel)
              │               │               │
              ▼               ▼               ▼
          Get Public URL  Get Public URL  Get Public URL
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                    Save URLs to Database

Bucket: hotel-images/room-images/
File: {uuid}.{ext}
CDN: Auto enabled
```

---

## SLIDE 13: DEPLOYMENT - OVERVIEW
```
☁️ DEPLOYMENT TRÊN VERCEL

Why Vercel?
✅ Serverless → Auto scaling
✅ CDN Global → Fast delivery
✅ Zero config → Easy setup
✅ Environment variables → Secure
✅ Free tier → Cost effective

Architecture:
┌─────────────────────────────────┐
│   Vercel Global CDN Network     │
└────────┬────────────┬───────────┘
         │            │
    ┌────▼───┐   ┌────▼───┐
    │ Client │   │ Server │
    │ (Vite) │   │(Express)│
    └────────┘   └────┬───┘
                      │
                 ┌────▼────┐
                 │Supabase │
                 └─────────┘
```

---

## SLIDE 14: DEPLOYMENT - BACKEND
```
🖥️ DEPLOY BACKEND

Step 1: Install Vercel CLI
npm install -g vercel
vercel login

Step 2: Deploy
cd HotelBooking-server/server
vercel --prod

Step 3: Environment Variables
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
CLERK_SECRET_KEY=sk_test_xxx...
NODE_ENV=production

Result:
✅ https://hotel-booking-server.vercel.app/api

vercel.json:
{
  "rewrites": [
    {"source": "/(.*)", "destination": "/server.js"}
  ],
  "functions": {
    "server.js": {"maxDuration": 30}
  }
}
```

---

## SLIDE 15: DEPLOYMENT - FRONTEND
```
📱 DEPLOY FRONTEND

Step 1: Deploy
cd HotelBooking-main/client
vercel --prod

Step 2: Environment Variables
VITE_API_URL=https://hotel-booking-server.vercel.app/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

Result:
✅ https://hotel-booking-client.vercel.app

vercel.json:
{
  "framework": "vite",
  "rewrites": [
    {"source": "/(.*)", "destination": "/"}
  ]
}
```

---

## SLIDE 16: DEMO FLOWS
```
🎬 USER FLOW

1. Visit homepage
   └─▶ Search "Hanoi"
        └─▶ GET /api/rooms

2. Select room
   └─▶ Choose dates
        └─▶ POST /api/bookings/check-availability

3. Confirm booking
   └─▶ POST /api/bookings/book
        └─▶ Auto calculate price

4. View bookings
   └─▶ GET /api/bookings/user

🏨 OWNER FLOW

1. Switch to Owner role
   └─▶ PUT /api/user/update-role

2. Register hotel
   └─▶ POST /api/hotels

3. Add room
   └─▶ POST /api/rooms
        └─▶ Upload 4 images

4. View dashboard
   └─▶ GET /api/bookings/hotel
        └─▶ See revenue & bookings
```

---

## SLIDE 17: KEY FEATURES
```
⭐ TÍNH NĂNG NỔI BẬT

1. 🔐 Authentication
   • Clerk OAuth (Google, Email...)
   • JWT Token based
   • Auto user sync via webhook

2. 📤 File Upload
   • Parallel upload 4 images
   • Supabase Storage + CDN
   • Auto generate public URLs

3. ✅ Availability Check
   • Real-time conflict detection
   • Prevent double booking
   • Date range overlap logic

4. 💰 Auto Pricing
   • Calculate nights automatically
   • totalPrice = nights × pricePerNight
   • No manual input needed

5. 📊 Owner Dashboard
   • Total bookings count
   • Total revenue calculation
   • Recent bookings list
```

---

## SLIDE 18: TECHNICAL HIGHLIGHTS
```
🔧 KỸ THUẬT NỔI BẬT

1️⃣ Database
• PostgreSQL on Supabase
• Row Level Security (RLS)
• Foreign keys & indexes
• Optimized queries with joins

2️⃣ API Design
• RESTful conventions
• Consistent response format
• Error handling middleware
• Protected routes

3️⃣ Performance
• Promise.all() parallel uploads
• CDN for images
• Database indexing
• Serverless auto-scaling

4️⃣ Security
• Clerk authentication
• RLS policies
• Environment variables
• CORS configuration
```

---

## SLIDE 19: STATISTICS
```
📊 THỐNG KÊ DỰ ÁN

📦 API Endpoints: 13
   ├─ User APIs: 4
   ├─ Hotel APIs: 1
   ├─ Room APIs: 4
   └─ Booking APIs: 4

👥 User Roles: 2
   ├─ USER (Customer)
   └─ HOTEL_OWNER (Manager)

🗄️ Database Tables: 4
   ├─ users
   ├─ hotels
   ├─ rooms
   └─ bookings

📸 Max Images: 4 per room

⏱️ Max Execution: 30 seconds

☁️ Deployment: 100% Serverless
```

---

## SLIDE 20: CHALLENGES & SOLUTIONS
```
💡 THÁCH THỨC & GIẢI PHÁP

❌ Challenge: Double Booking
✅ Solution: 
   • Check availability before booking
   • Database unique constraint
   • Transaction isolation

❌ Challenge: Large Image Upload
✅ Solution:
   • Increase timeout to 30s
   • Compress images on frontend
   • Parallel upload with Promise.all()

❌ Challenge: Authentication
✅ Solution:
   • Clerk handles OAuth
   • Webhook sync users
   • JWT in every request

❌ Challenge: CORS on Vercel
✅ Solution:
   • Configure allowed origins
   • Include credentials
   • Proper headers
```

---

## SLIDE 21: FUTURE ENHANCEMENTS
```
🚀 TÍNH NĂNG TƯƠNG LAI

1. 💳 Payment Integration
   • Stripe / PayPal
   • Online payment
   • Invoice generation

2. ⭐ Review System
   • User ratings
   • Written reviews
   • Average score display

3. 📧 Email Notifications
   • Booking confirmation
   • Reminder before check-in
   • Cancellation notice

4. 📱 Mobile App
   • React Native
   • Push notifications
   • Offline mode

5. 🤖 Chatbot Support
   • AI-powered FAQ
   • Booking assistance
   • 24/7 availability
```

---

## SLIDE 22: DEMO SCREENSHOTS
```
📸 GIAO DIỆN ỨNG DỤNG

[Insert 4-6 screenshots:]

1. Homepage with search
2. Room listing page
3. Room details with booking
4. My Bookings page
5. Owner Dashboard
6. Add Room form
```

---

## SLIDE 23: CODE SNIPPETS
```
💻 MỘT SỐ CODE NỔI BẬT

1. Check Availability Logic:
const checkAvailability = async ({ checkInDate, checkOutDate, roomId }) => {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', roomId)
    .lte('check_in_date', checkOutDate)
    .gte('check_out_date', checkInDate)
    .neq('status', 'CANCELLED');
  
  return bookings.length === 0;
};

2. Auto Calculate Price:
const checkIn = new Date(checkInDate);
const checkOut = new Date(checkOutDate);
const nights = Math.ceil((checkOut - checkIn) / (1000*3600*24));
const totalPrice = room.price_per_night * nights;

3. Protected Middleware:
export const protect = async (req, res, next) => {
  const { userId } = req.auth;
  const user = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  req.user = user;
  next();
};
```

---

## SLIDE 24: TESTING
```
🧪 TESTING & QUALITY

Manual Testing:
✅ User registration & login
✅ Hotel registration
✅ Room creation with images
✅ Booking flow
✅ Availability checking
✅ Dashboard data

API Testing (Postman):
✅ All 13 endpoints
✅ Authentication headers
✅ Request/Response validation
✅ Error scenarios

Production Testing:
✅ Vercel deployment
✅ Environment variables
✅ CORS configuration
✅ File upload limits
```

---

## SLIDE 25: LESSONS LEARNED
```
📚 BÀI HỌC RÚT RA

✅ Supabase Storage tốt hơn Cloudinary
   → Tích hợp sẵn, CDN miễn phí

✅ Clerk Auth tiết kiệm thời gian
   → OAuth, webhooks, UI components

✅ Vercel serverless rất tiện
   → Zero config, auto scale

✅ Database schema design quan trọng
   → Foreign keys, indexes, RLS

✅ Error handling cần đầy đủ
   → Try-catch, validation, logging
```

---

## SLIDE 26: REFERENCES
```
📖 TÀI LIỆU THAM KHẢO

Documentation:
• Express.js: https://expressjs.com
• Supabase: https://supabase.com/docs
• Clerk Auth: https://clerk.com/docs
• Vercel: https://vercel.com/docs

Libraries Used:
• @clerk/express
• @supabase/supabase-js
• express
• multer
• uuid
• cors
```

---

## SLIDE 27: LINKS
```
🔗 DEMO & SOURCE CODE

🌐 Live Demo:
Frontend: https://hotel-booking-client.vercel.app
Backend API: https://hotel-booking-server.vercel.app/api

📂 GitHub Repository:
[Your GitHub Repo URL]

📧 Contact:
Email: [Your Email]
LinkedIn: [Your LinkedIn]
```

---

## SLIDE 28: CONCLUSION
```
🎯 KẾT LUẬN

✅ Đã hoàn thành:
• 13 API endpoints đầy đủ chức năng
• Authentication bảo mật với Clerk
• Upload & storage với Supabase
• Deploy production trên Vercel
• UI responsive với React + Tailwind

💡 Kỹ năng đạt được:
• RESTful API design
• Database modeling
• Cloud deployment
• Authentication implementation
• File handling

🚀 Hệ thống sẵn sàng mở rộng và phát triển!
```

---

## SLIDE 29: Q&A
```
❓ HỎI & ĐÁP

Sẵn sàng trả lời các câu hỏi từ
thầy cô và các bạn!

[Image: Q&A icon]

📧 Liên hệ sau buổi thuyết trình:
Email: [Your Email]
```

---

## SLIDE 30: THANK YOU
```
🙏 CẢM ƠN

Cảm ơn thầy cô và các bạn
đã lắng nghe!

[Your Name]
[Your Class]
[Date]

[Logo/Image]
```

---

## 🎨 DESIGN TIPS

### Color Scheme:
- Primary: #2563EB (Blue)
- Secondary: #10B981 (Green)
- Accent: #F59E0B (Orange)
- Background: #F9FAFB (Light Gray)
- Text: #1F2937 (Dark Gray)

### Fonts:
- Headings: Montserrat Bold
- Body: Inter Regular
- Code: Fira Code

### Icons:
- Use emoji cho visual appeal
- Font Awesome icons
- Lucide icons

### Layout:
- Consistent margins
- Use grids for alignment
- White space for readability
- Highlight key points

---

**📝 NOTE**: Customize nội dung cho phù hợp với thời gian thuyết trình của bạn (5-10-15 phút)
