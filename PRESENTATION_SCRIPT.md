# 🎯 SCRIPT THUYẾT TRÌNH - HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN

## 📋 MỤC LỤC
1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Kiến Trúc API Services](#kiến-trúc-api-services)
3. [Chi Tiết Từng Chức Năng API](#chi-tiết-từng-chức-năng-api)
4. [Deployment Lên Vercel](#deployment-lên-vercel)
5. [Demo Flow](#demo-flow)

---

## 1️⃣ TỔNG QUAN HỆ THỐNG

### Giới thiệu
Xin chào, hôm nay em xin phép trình bày về **Hệ thống Đặt Phòng Khách Sạn** mà em đã phát triển.

### Công nghệ sử dụng
- **Frontend**: React.js + Vite + TailwindCSS
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (thay thế Cloudinary)
- **Authentication**: Clerk Auth
- **Deployment**: Vercel (cả Frontend và Backend)

### Tính năng chính
Hệ thống có 2 vai trò người dùng:
1. **Khách hàng (USER)**: Tìm kiếm, đặt phòng, xem lịch sử đặt phòng
2. **Chủ khách sạn (HOTEL_OWNER)**: Đăng ký khách sạn, quản lý phòng, xem dashboard doanh thu

---

## 2️⃣ KIẾN TRÚC API SERVICES

### Cấu trúc API
Server được tổ chức thành 4 module chính:

```
📦 API Structure
├── /api/user          → Quản lý người dùng
├── /api/hotels        → Quản lý khách sạn
├── /api/rooms         → Quản lý phòng
└── /api/bookings      → Quản lý đặt phòng
```

### Middleware Stack
```javascript
1. CORS → Cho phép Frontend gọi API
2. express.json() → Parse JSON body
3. clerkMiddleware() → Xử lý authentication từ Clerk
4. protect middleware → Bảo vệ các route cần đăng nhập
5. uploadMiddleware → Xử lý upload ảnh (multer)
```

### Database Schema
```
users ──┬── hotels ──── rooms ──── bookings
        │                   │
        └───────────────────┘
```

---

## 3️⃣ CHI TIẾT TỪNG CHỨC NĂNG API

### 🔹 A. USER MANAGEMENT APIs (`/api/user`)

#### **1. GET /api/user** - Lấy thông tin user hiện tại
```javascript
Request:
  Headers: Authorization (Clerk token)
  
Response:
  {
    "success": true,
    "role": "USER",
    "recentSearchedCities": ["Hanoi", "HCMC", "Danang"]
  }
```

**Giải thích**: 
- API này được gọi khi user đăng nhập
- Trả về role để phân quyền UI
- Trả về các thành phố đã tìm kiếm gần đây (tối đa 3)

---

#### **2. POST /api/user/create-or-update** - Tạo hoặc cập nhật user
```javascript
Request Body:
  {
    "clerkUserId": "user_2abc123",
    "email": "john@example.com",
    "username": "John Doe",
    "imageUrl": "https://...",
    "isHotelOwner": false
  }
  
Response:
  {
    "success": true,
    "data": { user object }
  }
```

**Giải thích**:
- Được gọi từ Clerk webhook khi user mới đăng ký
- Sử dụng `upsert` để tự động tạo mới hoặc cập nhật
- Tự động set role: OWNER hoặc USER

---

#### **3. PUT /api/user/update-role** - Cập nhật role của user
```javascript
Request Body:
  {
    "role": "OWNER"  // hoặc "USER"
  }
  
Response:
  {
    "success": true,
    "data": { updated user }
  }
```

**Giải thích**:
- Cho phép user chuyển đổi giữa vai trò USER và OWNER
- Có validation để chỉ chấp nhận 2 role hợp lệ

---

#### **4. POST /api/user/store-recent-search** - Lưu thành phố tìm kiếm
```javascript
Request Body:
  {
    "recentSearchedCity": "Hanoi"
  }
  
Response:
  {
    "success": true,
    "message": "City added"
  }
```

**Giải thích**:
- Lưu tối đa 3 thành phố gần nhất
- Sử dụng cơ chế FIFO: khi đầy, xóa phần tử cũ nhất
- Giúp cải thiện UX với gợi ý tìm kiếm

---

### 🔹 B. HOTEL MANAGEMENT APIs (`/api/hotels`)

#### **POST /api/hotels** - Đăng ký khách sạn mới
```javascript
Request Body:
  {
    "name": "Grand Plaza Hotel",
    "address": "123 Main Street",
    "contact": "+84 123 456 789",
    "city": "Hanoi"
  }
  
Response:
  {
    "success": true,
    "message": "Hotel registered successfully"
  }
```

**Giải thích**:
- Chỉ user có role OWNER mới được đăng ký
- Kiểm tra: 1 owner chỉ được đăng ký 1 khách sạn
- Sau khi đăng ký thành công, tự động update role thành HOTEL_OWNER
- Tạo foreign key liên kết owner_id với users table

---

### 🔹 C. ROOM MANAGEMENT APIs (`/api/rooms`)

#### **1. POST /api/rooms** - Tạo phòng mới (có upload ảnh)
```javascript
Request:
  Headers: Authorization (Clerk token)
  Content-Type: multipart/form-data
  
  Body (FormData):
    - roomType: "Deluxe Suite"
    - pricePerNight: "299.99"
    - amenities: JSON.stringify(["WiFi", "TV", "AC"])
    - images: [File, File, File, File] // Tối đa 4 ảnh

Response:
  {
    "success": true,
    "message": "Room created successfully"
  }
```

**Flow xử lý**:
1. Verify user là HOTEL_OWNER và có khách sạn
2. Upload từng ảnh lên Supabase Storage:
   - Tạo UUID unique cho mỗi ảnh
   - Upload vào bucket `hotel-images/room-images/`
   - Lấy public URL
3. Lưu room vào database với array URLs của ảnh
4. Set is_available = true mặc định

**Code highlights**:
```javascript
// Upload images to Supabase Storage
const uploadImages = req.files.map(async (file) => {
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `room-images/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('hotel-images')
    .upload(filePath, fileBuffer, {
      contentType: file.mimetype
    });
    
  const { data: publicData } = supabase.storage
    .from('hotel-images')
    .getPublicUrl(filePath);
    
  return publicData.publicUrl;
});

const images = await Promise.all(uploadImages);
```

---

#### **2. GET /api/rooms** - Lấy tất cả phòng available
```javascript
Response:
  {
    "success": true,
    "rooms": [
      {
        "id": "room_uuid",
        "room_type": "Deluxe Suite",
        "price_per_night": 299.99,
        "amenities": ["WiFi", "TV", "AC"],
        "images": ["url1", "url2"],
        "is_available": true,
        "hotel": {
          "id": "hotel_uuid",
          "name": "Grand Plaza Hotel",
          "city": "Hanoi",
          "owner": {
            "image": "owner_avatar_url"
          }
        }
      }
    ]
  }
```

**Giải thích**:
- Public API, không cần authentication
- Chỉ trả về phòng đang available (`is_available = true`)
- Join với hotels và users để lấy thông tin chi tiết
- Sắp xếp theo thời gian tạo (mới nhất trước)

---

#### **3. GET /api/rooms/owner** - Lấy phòng của chủ khách sạn
```javascript
Request:
  Headers: Authorization (Clerk token)
  
Response:
  {
    "success": true,
    "rooms": [
      {
        "id": "room_uuid",
        "room_type": "Standard Room",
        "price_per_night": 150.00,
        "is_available": true,
        "hotel": {
          "name": "My Hotel"
        }
      }
    ]
  }
```

**Giải thích**:
- Protected route, chỉ HOTEL_OWNER truy cập được
- Lấy tất cả phòng (kể cả unavailable) của khách sạn thuộc owner
- Dùng cho trang quản lý phòng của owner

---

#### **4. POST /api/rooms/toggle-availability** - Bật/tắt trạng thái phòng
```javascript
Request Body:
  {
    "roomId": "room_uuid"
  }
  
Response:
  {
    "success": true,
    "message": "Room availability updated"
  }
```

**Giải thích**:
- Toggle giữa available ↔ unavailable
- Owner dùng để tạm ngừng cho thuê phòng (bảo trì, sửa chữa...)
- Không xóa phòng khỏi database, chỉ ẩn khỏi danh sách tìm kiếm

---

### 🔹 D. BOOKING MANAGEMENT APIs (`/api/bookings`)

#### **1. POST /api/bookings/check-availability** - Kiểm tra phòng trống
```javascript
Request Body:
  {
    "room": "room_uuid",
    "checkInDate": "2024-12-20",
    "checkOutDate": "2024-12-22"
  }
  
Response:
  {
    "success": true,
    "isAvailable": true
  }
```

**Logic kiểm tra**:
```sql
-- Tìm booking conflict
SELECT * FROM bookings 
WHERE room_id = 'room_uuid'
  AND check_in_date <= '2024-12-22'  -- checkOut của booking mới
  AND check_out_date >= '2024-12-20' -- checkIn của booking mới
  AND status != 'CANCELLED'
```

**Giải thích**:
- Public API để user kiểm tra trước khi đặt
- Nếu có booking nào overlap → isAvailable = false
- Không tính các booking đã cancelled

---

#### **2. POST /api/bookings/book** - Tạo booking mới
```javascript
Request Body:
  {
    "room": "room_uuid",
    "checkInDate": "2024-12-20",
    "checkOutDate": "2024-12-22",
    "guests": 2
  }
  
Response:
  {
    "success": true,
    "message": "Booking created successfully"
  }
```

**Flow xử lý**:
1. **Verify authentication**: Lấy userId từ Clerk token
2. **Check availability**: Gọi hàm `checkAvailability()`
3. **Get room data**: Lấy thông tin phòng và hotel
4. **Calculate price**: 
   ```javascript
   const nights = (checkOut - checkIn) / (1000 * 3600 * 24);
   const totalPrice = room.price_per_night * nights;
   ```
5. **Create booking**: Insert vào database với status = PENDING

**Giải thích**:
- Tự động tính tổng tiền dựa trên số đêm
- Mặc định payment_method = "Pay At Hotel"
- Status ban đầu là PENDING, sau khi thanh toán sẽ chuyển CONFIRMED

---

#### **3. GET /api/bookings/user** - Lấy danh sách booking của user
```javascript
Request:
  Headers: Authorization (Clerk token)
  
Response:
  {
    "success": true,
    "bookings": [
      {
        "id": "booking_uuid",
        "check_in_date": "2024-12-20",
        "check_out_date": "2024-12-22",
        "total_price": 599.98,
        "status": "CONFIRMED",
        "is_paid": true,
        "room": {
          "room_type": "Deluxe Suite",
          "images": ["url1"]
        },
        "hotel": {
          "name": "Grand Plaza Hotel",
          "city": "Hanoi"
        }
      }
    ]
  }
```

**Giải thích**:
- Lấy tất cả booking của user đã login
- Join với rooms và hotels để hiển thị đầy đủ
- Sắp xếp theo thời gian tạo (mới nhất trước)
- Dùng cho trang "My Bookings"

---

#### **4. GET /api/bookings/hotel** - Dashboard dữ liệu cho hotel owner
```javascript
Request:
  Headers: Authorization (Clerk token)
  
Response:
  {
    "success": true,
    "dashboardData": {
      "totalBookings": 25,
      "totalRevenue": 15000.50,
      "bookings": [
        {
          "id": "booking_uuid",
          "user": {
            "username": "John Doe",
            "email": "john@example.com"
          },
          "room": {
            "room_type": "Standard"
          },
          "total_price": 300.00,
          "status": "CONFIRMED"
        }
      ]
    }
  }
```

**Giải thích**:
- Protected route cho HOTEL_OWNER
- Tự động lọc booking thuộc khách sạn của owner
- Tính tổng số booking và tổng doanh thu
- Dùng cho Dashboard page

---

## 4️⃣ DEPLOYMENT LÊN VERCEL

### Chuẩn bị trước khi deploy

#### A. Setup Supabase
```bash
1. Tạo project trên supabase.com
2. Tạo database tables (chạy SQL scripts)
3. Tạo Storage bucket: "hotel-images" (public)
4. Lấy credentials:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
```

#### B. Setup Clerk Authentication
```bash
1. Tạo application trên clerk.com
2. Cấu hình OAuth providers (Google, Email...)
3. Setup webhook cho user creation
4. Lấy credentials:
   - CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
```

---

### BƯỚC 1: Deploy Backend (Server)

#### 1.1. Cài đặt Vercel CLI
```powershell
npm install -g vercel
vercel login
```

#### 1.2. Navigate đến thư mục server
```powershell
cd "d:\DTDM\hotelbooking\HotelBooking-server\server"
```

#### 1.3. Deploy lên Vercel
```powershell
vercel --prod
```

**Process:**
- Vercel sẽ hỏi một số câu hỏi:
  - Link to existing project? → No
  - Project name? → hotel-booking-server
  - Directory? → ./ (current directory)
  
#### 1.4. Set Environment Variables
Trên Vercel Dashboard → Settings → Environment Variables:
```
SUPABASE_URL = https://thlqyxugdykoactsbttt.supabase.co
SUPABASE_ANON_KEY = your_supabase_anon_key
CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
NODE_ENV = production
```

#### 1.5. Verify deployment
```
Server URL: https://hotel-booking-server.vercel.app
Test: https://hotel-booking-server.vercel.app/
Expected: "API is working"
```

---

### BƯỚC 2: Deploy Frontend (Client)

#### 2.1. Navigate đến thư mục client
```powershell
cd "d:\DTDM\hotelbooking\HotelBooking-main\client"
```

#### 2.2. Update API URL trong .env.local
```env
VITE_API_URL=https://hotel-booking-server.vercel.app/api
VITE_SUPABASE_URL=https://thlqyxugdykoactsbttt.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

#### 2.3. Deploy lên Vercel
```powershell
vercel --prod
```

#### 2.4. Set Environment Variables
Trên Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL = https://hotel-booking-server.vercel.app/api
VITE_SUPABASE_URL = https://thlqyxugdykoactsbttt.supabase.co
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY = pk_test_...
```

#### 2.5. Verify deployment
```
Client URL: https://hotel-booking-client.vercel.app
```

---

### BƯỚC 3: Cấu hình CORS

Update server CORS để chấp nhận request từ client:

```javascript
// server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hotel-booking-client.vercel.app'
  ],
  credentials: true
}));
```

Redeploy server:
```powershell
cd "d:\DTDM\hotelbooking\HotelBooking-server\server"
vercel --prod
```

---

### BƯỚC 4: Testing Production

#### Test các API endpoints:
```bash
# Test server health
curl https://hotel-booking-server.vercel.app/

# Test get rooms (public)
curl https://hotel-booking-server.vercel.app/api/rooms

# Test protected route (với token)
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  https://hotel-booking-server.vercel.app/api/user
```

---

### Cấu trúc file quan trọng cho Vercel

#### **vercel.json** (Server)
```json
{
  "name": "hotelbooking-server",
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

**Giải thích**:
- `rewrites`: Route tất cả request về server.js
- `maxDuration`: Tăng timeout lên 30s cho upload ảnh

#### **vercel.json** (Client)
```json
{
  "name": "hotelbooking-client",
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**Giải thích**:
- `rewrites`: Cho phép client-side routing (React Router)
- `framework`: Vercel tự động detect Vite config

---

## 5️⃣ DEMO FLOW

### Flow 1: User đăng ký và tìm phòng
```
1. User truy cập → https://hotel-booking-client.vercel.app
2. Click "Sign Up" → Clerk authentication
3. Webhook → POST /api/user/create-or-update
4. User search "Hanoi" → GET /api/rooms?city=Hanoi
5. Click room → GET /api/rooms/:id
6. Select dates → POST /api/bookings/check-availability
7. Confirm booking → POST /api/bookings/book
8. View bookings → GET /api/bookings/user
```

### Flow 2: Hotel Owner quản lý
```
1. Owner login → Switch to "Hotel Owner" role
2. Register hotel → POST /api/hotels
3. Add room với upload ảnh → POST /api/rooms (multipart/form-data)
4. View dashboard → GET /api/bookings/hotel
   → Thấy totalBookings, totalRevenue, danh sách booking
5. Toggle room availability → POST /api/rooms/toggle-availability
```

---

## 📊 KẾT LUẬN

### Điểm mạnh của hệ thống:
✅ **RESTful API** chuẩn với status codes rõ ràng
✅ **Authentication** bảo mật với Clerk
✅ **Database** PostgreSQL trên Supabase (RLS enabled)
✅ **File Upload** hiệu quả với Supabase Storage
✅ **Deployment** dễ dàng với Vercel (serverless)
✅ **Scalability** tốt nhờ kiến trúc serverless

### Các API chính:
- **User**: 4 endpoints
- **Hotel**: 1 endpoint
- **Room**: 4 endpoints
- **Booking**: 4 endpoints

**Tổng cộng: 13 API endpoints**

### Tech Stack Summary:
```
Frontend: React + Vite + TailwindCSS
Backend:  Node.js + Express
Database: Supabase (PostgreSQL)
Storage:  Supabase Storage
Auth:     Clerk
Deploy:   Vercel (Serverless)
```

---

## 🙏 CẢM ƠN ĐÃ LẮNG NGHE!

**Demo URLs:**
- Frontend: https://hotel-booking-client.vercel.app
- Backend API: https://hotel-booking-server.vercel.app/api
- API Health: https://hotel-booking-server.vercel.app/

**Contact:**
- GitHub: [Your GitHub]
- Email: [Your Email]
