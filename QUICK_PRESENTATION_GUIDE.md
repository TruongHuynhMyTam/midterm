# 🎤 HƯỚNG DẪN THUYẾT TRÌNH NHANH - 10 PHÚT

## 📌 CẤU TRÚC THUYẾT TRÌNH

### ⏱️ PHẦN 1: GIỚI THIỆU (2 phút)

**"Xin chào các thầy cô và các bạn..."**

> Em xin phép trình bày về **Hệ thống Đặt Phòng Khách Sạn** với các công nghệ hiện đại.

**Tech Stack:**
- Frontend: React + Vite
- Backend: Node.js + Express  
- Database: Supabase (PostgreSQL)
- Auth: Clerk
- Deploy: Vercel

**Tính năng:**
- 👤 User: Tìm kiếm, đặt phòng
- 🏨 Owner: Đăng ký khách sạn, quản lý phòng, xem doanh thu

---

### ⏱️ PHẦN 2: API SERVICES (5 phút)

#### 🔵 1. USER APIS - `/api/user` (30 giây)

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| GET | `/api/user` | Lấy thông tin user |
| POST | `/api/user/create-or-update` | Tạo/cập nhật user |
| PUT | `/api/user/update-role` | Chuyển đổi role |
| POST | `/api/user/store-recent-search` | Lưu lịch sử tìm kiếm |

**Demo**: "Khi user login, API trả về role và recent cities"

---

#### 🔵 2. HOTEL APIS - `/api/hotels` (30 giây)

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| POST | `/api/hotels` | Đăng ký khách sạn |

**Demo**: "Owner đăng ký khách sạn với tên, địa chỉ, thành phố"

---

#### 🔵 3. ROOM APIS - `/api/rooms` (1 phút 30 giây)

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| POST | `/api/rooms` | Tạo phòng + upload ảnh |
| GET | `/api/rooms` | Lấy tất cả phòng available |
| GET | `/api/rooms/owner` | Lấy phòng của owner |
| POST | `/api/rooms/toggle-availability` | Bật/tắt trạng thái |

**Highlight**: Upload ảnh lên Supabase Storage
```javascript
// Upload 4 ảnh cùng lúc
const images = await Promise.all(
  files.map(file => uploadToSupabase(file))
);
```

**Demo**: "Owner tạo phòng với thông tin và 4 ảnh, hệ thống tự động upload và lấy URL"

---

#### 🔵 4. BOOKING APIS - `/api/bookings` (1 phút 30 giây)

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| POST | `/api/bookings/check-availability` | Kiểm tra phòng trống |
| POST | `/api/bookings/book` | Tạo booking |
| GET | `/api/bookings/user` | Lịch sử booking của user |
| GET | `/api/bookings/hotel` | Dashboard owner |

**Logic Check Availability:**
```sql
-- Tìm booking conflict
WHERE check_in_date <= checkOut_mới
  AND check_out_date >= checkIn_mới
  AND status != 'CANCELLED'
```

**Auto Calculate Price:**
```javascript
const nights = (checkOut - checkIn) / (1000*3600*24);
const totalPrice = room.price_per_night * nights;
```

**Demo**: "User chọn ngày, hệ thống check available và tự tính tổng tiền"

---

#### 🔵 5. AUTHENTICATION (30 giây)

**Clerk Middleware Flow:**
```
Request → clerkMiddleware() → protect() → getUserFromDB → next()
```

**Code:**
```javascript
export const protect = async (req, res, next) => {
  const { userId } = req.auth; // Từ Clerk
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

### ⏱️ PHẦN 3: DEPLOYMENT VERCEL (2 phút)

#### 📦 DEPLOY BACKEND

```powershell
# Bước 1: Login Vercel
vercel login

# Bước 2: Deploy server
cd hotelbooking/HotelBooking-server/server
vercel --prod

# Bước 3: Set env variables trên Vercel Dashboard
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
CLERK_SECRET_KEY=...
```

**Kết quả**: `https://hotel-booking-server.vercel.app/api`

---

#### 📦 DEPLOY FRONTEND

```powershell
# Bước 1: Deploy client
cd hotelbooking/HotelBooking-main/client
vercel --prod

# Bước 2: Set env variables
VITE_API_URL=https://hotel-booking-server.vercel.app/api
VITE_CLERK_PUBLISHABLE_KEY=...
```

**Kết quả**: `https://hotel-booking-client.vercel.app`

---

#### 🔧 FILE QUAN TRỌNG

**vercel.json (Server):**
```json
{
  "rewrites": [
    {"source": "/(.*)", "destination": "/server.js"}
  ],
  "functions": {
    "server.js": {"maxDuration": 30}
  }
}
```

**vercel.json (Client):**
```json
{
  "framework": "vite",
  "rewrites": [
    {"source": "/(.*)", "destination": "/"}
  ]
}
```

---

### ⏱️ PHẦN 4: DEMO LIVE (1 phút)

#### 🎬 User Flow:
```
1. Vào trang chủ → Search "Hanoi"
2. Chọn phòng → Chọn ngày check-in/out
3. Hệ thống check available → Show giá
4. Book → Xác nhận → Vào My Bookings xem
```

#### 🎬 Owner Flow:
```
1. Switch sang Hotel Owner role
2. Đăng ký khách sạn
3. Add room với upload 4 ảnh
4. Vào Dashboard → Xem bookings và revenue
```

---

## 🎯 TALKING POINTS CHO TỪNG API

### 📍 POST /api/rooms (Upload ảnh)
**"API này đặc biệt vì xử lý multipart/form-data..."**
- Dùng Multer middleware xử lý file
- Upload song song 4 ảnh lên Supabase Storage
- Tạo UUID unique cho mỗi ảnh
- Trả về public URL lưu vào database

### 📍 POST /api/bookings/check-availability
**"Đây là logic kiểm tra conflict booking..."**
- Dùng SQL query để tìm overlap date ranges
- Nếu có bất kỳ booking nào conflict → return false
- Đảm bảo không double booking

### 📍 POST /api/bookings/book
**"API này có validation nhiều bước..."**
1. Verify authentication
2. Check availability (gọi hàm check)
3. Get room data để lấy giá
4. Tự động tính tổng tiền theo số đêm
5. Insert booking với status PENDING

### 📍 GET /api/bookings/hotel (Dashboard)
**"API này aggregate data cho owner..."**
- Lấy tất cả bookings của khách sạn
- Tính totalBookings = bookings.length
- Tính totalRevenue = sum(total_price)
- Join với user để hiển thị thông tin khách

---

## 💡 CÂU HỎI THƯỜNG GẶP & TRẢ LỜI

### ❓ "Tại sao dùng Supabase thay vì MongoDB?"
> **Trả lời**: "Em chọn Supabase vì:
> - PostgreSQL có relationship mạnh mẽ (users-hotels-rooms-bookings)
> - RLS (Row Level Security) bảo mật tốt
> - Storage tích hợp sẵn
> - Real-time subscriptions nếu cần mở rộng"

### ❓ "Xử lý conflict khi 2 user book cùng lúc?"
> **Trả lời**: "Em có 2 lớp protection:
> 1. Check availability trước khi book
> 2. Database constraint với unique index trên (room_id, date_range)
> → PostgreSQL sẽ reject transaction sau"

### ❓ "Tại sao dùng Clerk thay vì JWT tự code?"
> **Trả lời**: "Clerk cung cấp:
> - OAuth social login (Google, Facebook...) 
> - Email verification tự động
> - Session management
> - Webhook cho user events
> → Tiết kiệm thời gian development"

### ❓ "Vercel có giới hạn gì?"
> **Trả lời**: "Free tier:
> - Bandwidth: 100GB/tháng
> - Execution time: 10s (em tăng lên 30s cho upload)
> - Đủ cho demo và small projects
> → Upgrade nếu cần scale"

### ❓ "Làm sao đảm bảo ảnh upload nhanh?"
> **Trả lời**: "Em dùng:
> - Promise.all() upload song song 4 ảnh
> - Supabase CDN phân phối nhanh
> - Compress ảnh ở frontend trước khi upload
> - Timeout 30s thay vì 10s default"

---

## 📊 SỐ LIỆU ẤN TƯỢNG ĐỂ NHỚ

- **13 API endpoints** tổng cộng
- **4 main modules**: User, Hotel, Room, Booking
- **2 roles**: USER và HOTEL_OWNER
- **3 deployment steps**: Setup → Deploy → Configure
- **30 seconds** max execution time
- **4 images** upload cùng lúc
- **100% serverless** architecture

---

## 🎓 KẾT THÚC (30 giây)

**"Tóm lại, em đã xây dựng..."**

✅ Hệ thống đặt phòng hoàn chỉnh với 13 API
✅ Authentication bảo mật với Clerk
✅ Upload file hiệu quả với Supabase Storage
✅ Deploy production-ready trên Vercel
✅ Database PostgreSQL với RLS

**"Em xin cảm ơn và sẵn sàng trả lời câu hỏi!"**

---

## 📱 LINKS DEMO

- **Live Site**: https://hotel-booking-client.vercel.app
- **API Docs**: https://hotel-booking-server.vercel.app/api
- **GitHub**: [Your repo link]

---

## 🎬 TIPS THUYẾT TRÌNH

### ✅ NÊN:
- Mở sẵn browser với các tab: Dashboard, Postman, Code
- Prepare sample requests trong Postman
- Có backup slides nếu internet chậm
- Nói chậm rãi, rõ ràng
- Point vào màn hình khi demo

### ❌ TRÁNH:
- Đọc thuộc code (giải thích logic thôi)
- Quá chi tiết vào 1 API (chia đều thời gian)
- Bỏ qua error handling
- Code quá lâu trên sân khấu
- Nói quá nhanh

---

## ⚡ SCRIPT MỞ ĐẦU MẪU

> "Xin chào thầy cô và các bạn. Hôm nay em xin phép được trình bày về Hệ thống Đặt Phòng Khách Sạn mà em đã phát triển.
> 
> Hệ thống này giải quyết bài toán đặt phòng trực tuyến với 2 vai trò chính: Khách hàng có thể tìm kiếm và đặt phòng, còn Chủ khách sạn có thể đăng ký khách sạn, quản lý phòng và xem dashboard doanh thu.
> 
> Em sử dụng React cho Frontend, Node.js Express cho Backend, Supabase làm database và Storage, cùng với Clerk Authentication. Toàn bộ hệ thống được deploy lên Vercel.
> 
> Bây giờ em xin phép đi vào chi tiết các API services..."

---

## ⚡ SCRIPT KẾT THÚC MẪU

> "Vậy là em đã trình bày xong về hệ thống với tổng cộng 13 API endpoints chia thành 4 modules chính.
> 
> Điểm mạnh của hệ thống là kiến trúc RESTful chuẩn, authentication bảo mật, và khả năng scale tốt nhờ serverless trên Vercel.
> 
> Em đã deploy thành công cả Frontend và Backend lên production với các environment variables được cấu hình đầy đủ.
> 
> Em xin cảm ơn thầy cô và các bạn đã lắng nghe. Em sẵn sàng trả lời các câu hỏi!"

---

**🎯 CHÚC BẠN THUYẾT TRÌNH THÀNH CÔNG! 🎯**
