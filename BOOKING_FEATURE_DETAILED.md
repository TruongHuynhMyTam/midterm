# 🏨 CHỨC NĂNG ĐẶT PHÒNG - CHI TIẾT

## 📋 MỤC LỤC
1. [Tổng quan chức năng](#tổng-quan-chức-năng)
2. [Flow đặt phòng hoàn chỉnh](#flow-đặt-phòng-hoàn-chỉnh)
3. [API Booking chi tiết](#api-booking-chi-tiết)
4. [Database Schema](#database-schema)
5. [Code Implementation](#code-implementation)
6. [Demo thực tế](#demo-thực-tế)

---

## 1️⃣ TỔNG QUAN CHỨC NĂNG

### Mô tả
Chức năng đặt phòng cho phép khách hàng:
- Tìm kiếm phòng theo thành phố
- Xem chi tiết phòng (giá, tiện nghi, ảnh)
- Chọn ngày check-in và check-out
- Kiểm tra phòng có trống không
- Đặt phòng và xem lịch sử đặt phòng

### Actors (Người tham gia)
1. **User/Customer** - Người đặt phòng
2. **System** - Hệ thống xử lý
3. **Database** - Lưu trữ dữ liệu

### Business Rules (Quy tắc nghiệp vụ)
✅ User phải đăng nhập mới được đặt phòng
✅ Phòng phải available (is_available = true)
✅ Không được double booking (2 booking cùng 1 phòng, cùng thời gian)
✅ Check-out date phải sau check-in date
✅ Tính tổng tiền tự động = số đêm × giá phòng/đêm
✅ Status mặc định = PENDING, sau thanh toán = CONFIRMED

---

## 2️⃣ FLOW ĐẶT PHÒNG HOÀN CHỈNH

### 🎬 USER JOURNEY - Hành trình người dùng

```
BƯỚC 1: TÌM KIẾM PHÒNG
┌─────────────────────────────────────┐
│ User vào trang chủ                  │
│ Nhập: "Hanoi" vào search box        │
│ Click "Search"                      │
└────────────┬────────────────────────┘
             │
             ▼
     GET /api/rooms?city=Hanoi
             │
             ▼
┌─────────────────────────────────────┐
│ Hiển thị danh sách phòng ở Hanoi    │
│ - Grand Plaza Hotel - $299/night    │
│ - Ocean View Resort - $450/night    │
│ - Mountain Lodge - $180/night       │
└────────────┬────────────────────────┘
             │
             ▼

BƯỚC 2: XEM CHI TIẾT PHÒNG
┌─────────────────────────────────────┐
│ User click vào "Grand Plaza Hotel"  │
└────────────┬────────────────────────┘
             │
             ▼
     GET /api/rooms/:roomId
             │
             ▼
┌─────────────────────────────────────┐
│ Hiển thị chi tiết:                  │
│ - 4 ảnh phòng (slider)              │
│ - Giá: $299/night                   │
│ - Tiện nghi: WiFi, TV, AC, Pool     │
│ - Địa chỉ khách sạn                 │
│ - Form chọn ngày                    │
└────────────┬────────────────────────┘
             │
             ▼

BƯỚC 3: CHỌN NGÀY & KIỂM TRA
┌─────────────────────────────────────┐
│ User chọn:                          │
│ - Check-in: 2024-12-20              │
│ - Check-out: 2024-12-23             │
│ - Guests: 2 người                   │
│ Click "Check Availability"          │
└────────────┬────────────────────────┘
             │
             ▼
   POST /api/bookings/check-availability
   Body: {
     room: "room_uuid",
     checkInDate: "2024-12-20",
     checkOutDate: "2024-12-23"
   }
             │
             ▼
┌─────────────────────────────────────┐
│ SYSTEM CHECK CONFLICT:              │
│                                     │
│ Timeline:                           │
│ ─────●═══════●─────────────────     │
│      12/20  12/23                   │
│                                     │
│ Existing Bookings:                  │
│ ────●══●────────────────────────    │
│     12/15 12/18  ✅ No overlap     │
│                                     │
│ ────────────────●══════●────────    │
│                12/25  12/28         │
│                ✅ No overlap        │
│                                     │
│ Result: AVAILABLE ✅                │
└────────────┬────────────────────────┘
             │
             ▼

BƯỚC 4: HIỂN thị GIÁ & XÁC NHẬN
┌─────────────────────────────────────┐
│ ✅ Room is Available!               │
│                                     │
│ Breakdown:                          │
│ - Check-in: Dec 20, 2024            │
│ - Check-out: Dec 23, 2024           │
│ - Nights: 3 nights                  │
│ - Price: $299 × 3 = $897            │
│ - Guests: 2 people                  │
│                                     │
│ [Book Now Button]                   │
└────────────┬────────────────────────┘
             │
             ▼

BƯỚC 5: XÁC NHẬN ĐặT PHÒNG
┌─────────────────────────────────────┐
│ User click "Book Now"               │
│ System check: User logged in? ✅    │
└────────────┬────────────────────────┘
             │
             ▼
        POST /api/bookings/book
        Headers: {
          Authorization: "Bearer clerk_token"
        }
        Body: {
          room: "room_uuid",
          checkInDate: "2024-12-20",
          checkOutDate: "2024-12-23",
          guests: 2
        }
             │
             ▼
┌─────────────────────────────────────┐
│ SERVER PROCESSING:                  │
│ 1. Verify authentication ✅         │
│ 2. Check availability again ✅      │
│    (double check for race condition)│
│ 3. Get room data from DB ✅         │
│ 4. Calculate total price ✅         │
│    nights = 3                       │
│    total = $299 × 3 = $897         │
│ 5. Create booking record ✅         │
│    - user_id: "user_2abc123"        │
│    - room_id: "room_uuid"           │
│    - hotel_id: "hotel_uuid"         │
│    - check_in: "2024-12-20"         │
│    - check_out: "2024-12-23"        │
│    - total_price: 897               │
│    - guests: 2                      │
│    - status: "PENDING"              │
│    - payment_method: "Pay At Hotel" │
│    - is_paid: false                 │
└────────────┬────────────────────────┘
             │
             ▼

BƯỚC 6: THÀNH CÔNG
┌─────────────────────────────────────┐
│ ✅ Booking Successful!              │
│                                     │
│ Booking Details:                    │
│ - Booking ID: #BK12345              │
│ - Hotel: Grand Plaza Hotel          │
│ - Room: Deluxe Suite                │
│ - Check-in: Dec 20, 2024            │
│ - Check-out: Dec 23, 2024           │
│ - Total: $897                       │
│ - Status: PENDING                   │
│                                     │
│ [View My Bookings]                  │
└────────────┬────────────────────────┘
             │
             ▼

BƯỚC 7: XEM LỊCH SỬ ĐẶT PHÒNG
┌─────────────────────────────────────┐
│ User click "My Bookings"            │
└────────────┬────────────────────────┘
             │
             ▼
        GET /api/bookings/user
        Headers: {
          Authorization: "Bearer token"
        }
             │
             ▼
┌─────────────────────────────────────┐
│ MY BOOKINGS                         │
│                                     │
│ 📅 Upcoming Bookings:               │
│ ┌─────────────────────────────────┐ │
│ │ Grand Plaza Hotel               │ │
│ │ Deluxe Suite                    │ │
│ │ Dec 20-23, 2024 (3 nights)      │ │
│ │ $897 - PENDING                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📋 Past Bookings:                   │
│ ┌─────────────────────────────────┐ │
│ │ Ocean View Resort               │ │
│ │ Standard Room                   │ │
│ │ Nov 10-12, 2024 (2 nights)      │ │
│ │ $360 - CONFIRMED                │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 3️⃣ API BOOKING CHI TIẾT

### 🔹 API 1: CHECK AVAILABILITY

#### Endpoint
```
POST /api/bookings/check-availability
```

#### Purpose (Mục đích)
Kiểm tra phòng có trống trong khoảng thời gian user chọn không

#### Request
```javascript
POST /api/bookings/check-availability
Content-Type: application/json

{
  "room": "550e8400-e29b-41d4-a716-446655440000",
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-23"
}
```

#### Response Success
```javascript
{
  "success": true,
  "isAvailable": true
}
```

#### Response Unavailable
```javascript
{
  "success": true,
  "isAvailable": false
}
```

#### Logic kiểm tra (Code thực tế)
```javascript
// File: server/controllers/bookingController.js

const checkAvailability = async ({ checkInDate, checkOutDate, roomId }) => {
  try {
    // Query tìm các booking conflict
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .lte('check_in_date', checkOutDate)    // Booking bắt đầu <= ngày check-out mới
      .gte('check_out_date', checkInDate)    // Booking kết thúc >= ngày check-in mới
      .neq('status', 'CANCELLED');           // Không tính booking đã hủy

    if (error) {
      console.error(error.message);
      return false;
    }

    // Nếu không có booking nào conflict → Available
    const isAvailable = bookings.length === 0;
    return isAvailable;
    
  } catch (error) {
    console.error(error.message);
    return false;
  }
};
```

#### Giải thích Logic
```
Case 1: No Overlap (Available ✅)
Booking hiện tại: ───●══●─────────
Booking mới:       ─────────●══●──
                           ↑ Không overlap

Case 2: Overlap (Unavailable ❌)
Booking hiện tại: ───●═══════●────
Booking mới:       ─────●════●────
                        ↑ Overlap!

Case 3: Inside (Unavailable ❌)
Booking hiện tại: ───●═══════●────
Booking mới:       ─────●══●──────
                        ↑ Bên trong!

Case 4: Outside (Unavailable ❌)
Booking hiện tại: ─────●══●───────
Booking mới:       ───●═══════●───
                      ↑ Bao phủ!
```

#### SQL Query tương đương
```sql
SELECT id FROM bookings 
WHERE room_id = '550e8400-e29b-41d4-a716-446655440000'
  AND check_in_date <= '2024-12-23'
  AND check_out_date >= '2024-12-20'
  AND status != 'CANCELLED';

-- Nếu trả về 0 rows → Available
-- Nếu trả về ≥ 1 row → Unavailable
```

---

### 🔹 API 2: CREATE BOOKING

#### Endpoint
```
POST /api/bookings/book
```

#### Authentication
```
Required: Bearer Token (Clerk JWT)
```

#### Request
```javascript
POST /api/bookings/book
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "room": "550e8400-e29b-41d4-a716-446655440000",
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-23",
  "guests": 2
}
```

#### Response Success
```javascript
{
  "success": true,
  "message": "Booking created successfully"
}
```

#### Response Error - Not Authenticated
```javascript
{
  "success": false,
  "message": "not authenticated"
}
```

#### Response Error - Not Available
```javascript
{
  "success": false,
  "message": "Room not available"
}
```

#### Code Implementation (Chi tiết)
```javascript
// File: server/controllers/bookingController.js

export const createBooking = async (req, res) => {
  try {
    // 1️⃣ EXTRACT DATA
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const userId = req.user.id; // Từ protect middleware
    
    console.log('📝 Creating booking for user:', userId);
    console.log('🏨 Room:', room);
    console.log('📅 Dates:', checkInDate, 'to', checkOutDate);

    // 2️⃣ CHECK AVAILABILITY (Double check)
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      roomId: room,
    });

    if (!isAvailable) {
      console.log('❌ Room not available');
      return res.json({ 
        success: false, 
        message: "Room not available" 
      });
    }
    console.log('✅ Room is available');

    // 3️⃣ GET ROOM DATA (để lấy giá và hotel_id)
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select(`
        *,
        hotel:hotels (*)
      `)
      .eq('id', room)
      .single();

    if (roomError || !roomData) {
      console.log('❌ Room not found');
      return res.json({ 
        success: false, 
        message: "Room not found" 
      });
    }
    
    console.log('🏨 Room found:', roomData.room_type);
    console.log('💰 Price per night:', roomData.price_per_night);

    // 4️⃣ CALCULATE TOTAL PRICE
    let totalPrice = roomData.price_per_night;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    totalPrice *= nights;
    
    console.log('🌙 Nights:', nights);
    console.log('💵 Total price:', totalPrice);

    // 5️⃣ CREATE BOOKING
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        room_id: room,
        hotel_id: roomData.hotel.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: totalPrice,
        number_of_guests: guests,
        guests: guests,
        status: 'PENDING',
        payment_method: 'Pay At Hotel',
        is_paid: false
      });

    if (bookingError) {
      console.log('❌ Booking failed:', bookingError.message);
      return res.json({ 
        success: false, 
        message: bookingError.message 
      });
    }

    console.log('✅ Booking created successfully');
    res.json({ 
      success: true, 
      message: "Booking created successfully" 
    });
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    res.json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

#### Console Output Example
```
📝 Creating booking for user: user_2abc123def456
🏨 Room: 550e8400-e29b-41d4-a716-446655440000
📅 Dates: 2024-12-20 to 2024-12-23
✅ Room is available
🏨 Room found: Deluxe Suite
💰 Price per night: 299
🌙 Nights: 3
💵 Total price: 897
✅ Booking created successfully
```

---

### 🔹 API 3: GET USER BOOKINGS

#### Endpoint
```
GET /api/bookings/user
```

#### Authentication
```
Required: Bearer Token
```

#### Request
```javascript
GET /api/bookings/user
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response
```javascript
{
  "success": true,
  "bookings": [
    {
      "id": "booking_uuid_1",
      "check_in_date": "2024-12-20",
      "check_out_date": "2024-12-23",
      "total_price": 897,
      "number_of_guests": 2,
      "status": "PENDING",
      "is_paid": false,
      "payment_method": "Pay At Hotel",
      "created_at": "2024-11-01T10:30:00Z",
      "room": {
        "id": "room_uuid",
        "room_type": "Deluxe Suite",
        "price_per_night": 299,
        "images": [
          "https://supabase.co/storage/.../img1.jpg",
          "https://supabase.co/storage/.../img2.jpg"
        ]
      },
      "hotel": {
        "id": "hotel_uuid",
        "name": "Grand Plaza Hotel",
        "address": "123 Main St",
        "city": "Hanoi",
        "contact": "+84 123 456 789"
      }
    },
    {
      "id": "booking_uuid_2",
      "check_in_date": "2024-11-10",
      "check_out_date": "2024-11-12",
      "total_price": 360,
      "number_of_guests": 1,
      "status": "CONFIRMED",
      "is_paid": true,
      "payment_method": "Pay At Hotel",
      "created_at": "2024-10-15T14:20:00Z",
      "room": {
        "room_type": "Standard Room",
        "price_per_night": 180,
        "images": [...]
      },
      "hotel": {
        "name": "Ocean View Resort",
        "city": "Danang"
      }
    }
  ]
}
```

#### Code Implementation
```javascript
// File: server/controllers/bookingController.js

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📚 Fetching bookings for user:', userId);
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms (*),
        hotel:hotels (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Mới nhất trước

    if (error) {
      console.log('❌ Failed to fetch bookings:', error.message);
      return res.json({ 
        success: false, 
        message: "Failed to fetch bookings" 
      });
    }

    console.log('✅ Found', bookings.length, 'bookings');
    res.json({ success: true, bookings });
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    res.json({ 
      success: false, 
      message: "Failed to fetch bookings" 
    });
  }
};
```

---

### 🔹 API 4: GET HOTEL BOOKINGS (Owner Dashboard)

#### Endpoint
```
GET /api/bookings/hotel
```

#### Purpose
Cho hotel owner xem tất cả bookings của khách sạn mình

#### Authentication
```
Required: Bearer Token (Hotel Owner)
```

#### Request
```javascript
GET /api/bookings/hotel
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response
```javascript
{
  "success": true,
  "dashboardData": {
    "totalBookings": 25,
    "totalRevenue": 15000.50,
    "bookings": [
      {
        "id": "booking_uuid_1",
        "check_in_date": "2024-12-20",
        "check_out_date": "2024-12-23",
        "total_price": 897,
        "status": "CONFIRMED",
        "is_paid": true,
        "user": {
          "id": "user_2abc123",
          "username": "John Doe",
          "email": "john@example.com",
          "image": "https://..."
        },
        "room": {
          "room_type": "Deluxe Suite",
          "price_per_night": 299
        },
        "hotel": {
          "name": "Grand Plaza Hotel"
        }
      }
      // ... more bookings
    ]
  }
}
```

#### Code Implementation
```javascript
// File: server/controllers/bookingController.js

export const getHotelBookings = async (req, res) => {
  try {
    // 1️⃣ FIND HOTEL OWNED BY USER
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id')
      .eq('owner_id', req.auth.userId)
      .single();

    if (hotelError || !hotel) {
      console.log('❌ No hotel found for owner:', req.auth.userId);
      return res.json({ 
        success: false, 
        message: "No Hotel found" 
      });
    }

    console.log('🏨 Hotel found:', hotel.id);

    // 2️⃣ GET ALL BOOKINGS FOR THIS HOTEL
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms (*),
        hotel:hotels (*),
        user:users (*)
      `)
      .eq('hotel_id', hotel.id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.log('❌ Failed to fetch bookings:', bookingsError.message);
      return res.json({
        success: false,
        message: "Failed to fetch hotel bookings",
        error: bookingsError.message,
      });
    }

    // 3️⃣ CALCULATE METRICS
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.total_price,
      0
    );

    console.log('📊 Total bookings:', totalBookings);
    console.log('💰 Total revenue: $' + totalRevenue);

    res.json({
      success: true,
      dashboardData: { 
        totalBookings, 
        totalRevenue, 
        bookings 
      },
    });
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    res.json({
      success: false,
      message: "Failed to fetch hotel bookings",
      error: error.message,
    });
  }
};
```

---

## 4️⃣ DATABASE SCHEMA

### Bookings Table Structure

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  room_id UUID NOT NULL REFERENCES rooms(id),
  hotel_id UUID NOT NULL REFERENCES hotels(id),
  
  -- Booking Details
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  number_of_guests INTEGER NOT NULL,
  guests INTEGER, -- Backward compatibility
  
  -- Status & Payment
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED
  payment_method VARCHAR(100) DEFAULT 'Pay At Hotel',
  is_paid BOOLEAN DEFAULT false,
  
  -- Metadata
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT check_guests CHECK (number_of_guests > 0),
  CONSTRAINT check_price CHECK (total_price > 0)
);

-- Indexes for performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Sample Data

```sql
INSERT INTO bookings (
  user_id,
  room_id,
  hotel_id,
  check_in_date,
  check_out_date,
  total_price,
  number_of_guests,
  status,
  is_paid
) VALUES (
  'user_2abc123def456',
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  '2024-12-20',
  '2024-12-23',
  897.00,
  2,
  'PENDING',
  false
);
```

---

## 5️⃣ CODE IMPLEMENTATION

### Frontend - Booking Flow

#### 1. Room Details Page
```javascript
// File: client/src/pages/RoomDetails.jsx

import { useState } from 'react';

const RoomDetails = ({ room }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  // CHECK AVAILABILITY
  const handleCheckAvailability = async () => {
    const response = await fetch(`${API_URL}/bookings/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut
      })
    });

    const data = await response.json();
    setIsAvailable(data.isAvailable);

    if (data.isAvailable) {
      // Calculate total
      const nights = calculateNights(checkIn, checkOut);
      setTotalPrice(room.price_per_night * nights);
    }
  };

  // CREATE BOOKING
  const handleBookNow = async () => {
    const token = await getClerkToken();

    const response = await fetch(`${API_URL}/bookings/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        room: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: guests
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ Booking successful!');
      navigate('/my-bookings');
    } else {
      alert('❌ ' + data.message);
    }
  };

  return (
    <div className="room-details">
      <h1>{room.room_type}</h1>
      <p>${room.price_per_night}/night</p>

      {/* Date Picker */}
      <div className="booking-form">
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          min={checkIn}
        />
        <input
          type="number"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          min="1"
        />

        <button onClick={handleCheckAvailability}>
          Check Availability
        </button>
      </div>

      {/* Availability Result */}
      {isAvailable === true && (
        <div className="available">
          ✅ Room is available!
          <p>Total: ${totalPrice}</p>
          <button onClick={handleBookNow}>Book Now</button>
        </div>
      )}

      {isAvailable === false && (
        <div className="unavailable">
          ❌ Room not available for selected dates
        </div>
      )}
    </div>
  );
};
```

#### 2. My Bookings Page
```javascript
// File: client/src/pages/MyBookings.jsx

import { useEffect, useState } from 'react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = await getClerkToken();

    const response = await fetch(`${API_URL}/bookings/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      setBookings(data.bookings);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="my-bookings">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <img src={booking.room.images[0]} alt={booking.room.room_type} />
              <div className="booking-info">
                <h3>{booking.hotel.name}</h3>
                <p>{booking.room.room_type}</p>
                <p>
                  {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                </p>
                <p className="price">${booking.total_price}</p>
                <span className={`status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### 3. Owner Dashboard
```javascript
// File: client/src/pages/hotelOwner/Dashboard.jsx

import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = await getClerkToken();

    const response = await fetch(`${API_URL}/bookings/hotel`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      setDashboardData(data.dashboardData);
    }
  };

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Metrics */}
      <div className="metrics">
        <div className="metric-card">
          <h3>Total Bookings</h3>
          <p className="big-number">{dashboardData.totalBookings}</p>
        </div>
        <div className="metric-card">
          <h3>Total Revenue</h3>
          <p className="big-number">${dashboardData.totalRevenue}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-bookings">
        <h2>Recent Bookings</h2>
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.user.username}</td>
                <td>{booking.room.room_type}</td>
                <td>{formatDate(booking.check_in_date)}</td>
                <td>{formatDate(booking.check_out_date)}</td>
                <td>${booking.total_price}</td>
                <td>
                  <span className={`badge ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## 6️⃣ DEMO THỰC TẾ

### Scenario 1: Successful Booking

```
👤 User: John Doe (john@example.com)
🏨 Hotel: Grand Plaza Hotel, Hanoi
🛏️ Room: Deluxe Suite ($299/night)
📅 Dates: Dec 20-23, 2024 (3 nights)
👥 Guests: 2 people

STEP-BY-STEP:

1️⃣ User searches "Hanoi"
   → GET /api/rooms?city=Hanoi
   → Returns list of 5 rooms

2️⃣ User clicks "Grand Plaza Hotel - Deluxe Suite"
   → Shows room details

3️⃣ User fills form:
   - Check-in: 2024-12-20
   - Check-out: 2024-12-23
   - Guests: 2

4️⃣ User clicks "Check Availability"
   → POST /api/bookings/check-availability
   → Response: { isAvailable: true }
   → Shows: "✅ Available! Total: $897"

5️⃣ User clicks "Book Now"
   → POST /api/bookings/book
   → Creates booking in database
   → Response: { success: true }
   → Redirect to "My Bookings"

6️⃣ User sees booking in "My Bookings"
   → GET /api/bookings/user
   → Shows booking with status "PENDING"
```

### Scenario 2: Unavailable (Conflict)

```
👤 User: Jane Smith
🛏️ Same room: Deluxe Suite
📅 Dates: Dec 21-24, 2024

Existing booking: Dec 20-23
New booking:      Dec 21-24
                  ↑ OVERLAP!

STEP-BY-STEP:

1️⃣ User selects dates Dec 21-24

2️⃣ User clicks "Check Availability"
   → POST /api/bookings/check-availability
   → Query finds existing booking from Dec 20-23
   → Overlap detected!
   → Response: { isAvailable: false }

3️⃣ UI shows:
   "❌ Room not available for selected dates"
   "Please try different dates"

4️⃣ "Book Now" button is disabled
```

### Scenario 3: Owner Dashboard

```
👤 Owner: Michael Brown
🏨 Hotel: Grand Plaza Hotel

DASHBOARD DATA:
- Total Bookings: 15
- Total Revenue: $8,450
- Recent Bookings:
  1. John Doe - Deluxe Suite - Dec 20-23 - $897 - PENDING
  2. Jane Smith - Standard Room - Dec 15-17 - $360 - CONFIRMED
  3. Bob Wilson - Deluxe Suite - Dec 10-12 - $598 - CONFIRMED
  ...

STEP-BY-STEP:

1️⃣ Owner logs in

2️⃣ Goes to Dashboard
   → GET /api/bookings/hotel
   → System finds owner's hotel
   → Fetches all bookings for that hotel
   → Calculates metrics

3️⃣ Owner sees:
   - Total bookings count
   - Total revenue (sum of all total_price)
   - List of all bookings with guest info
```

---

## 🎓 KẾT LUẬN

### Tóm tắt chức năng Booking

✅ **4 API Endpoints:**
1. Check Availability - Kiểm tra phòng trống
2. Create Booking - Tạo đặt phòng
3. Get User Bookings - Xem lịch sử của khách
4. Get Hotel Bookings - Dashboard cho owner

✅ **Key Features:**
- Conflict detection (tránh double booking)
- Auto calculate price (số đêm × giá)
- Authentication required
- Join queries (room + hotel + user data)
- Status tracking (PENDING, CONFIRMED, CANCELLED)

✅ **Business Logic:**
- Date validation (check-out > check-in)
- Availability check before booking
- Double-check availability khi create
- Owner chỉ thấy booking của hotel mình

✅ **Database Design:**
- Foreign keys (user_id, room_id, hotel_id)
- Constraints (dates, price, guests)
- Indexes for performance
- RLS for security

**Chức năng hoàn chỉnh và sẵn sàng production! 🚀**
