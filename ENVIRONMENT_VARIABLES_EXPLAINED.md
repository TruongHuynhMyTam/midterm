# 🔐 GIẢI THÍCH CÁC BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

## 📋 MỤC LỤC
1. [Client Environment Variables](#1️⃣-client-environment-variables-frontend)
2. [Server Environment Variables](#2️⃣-server-environment-variables-backend)
3. [Cách hoạt động khi Deploy](#3️⃣-cách-hoạt-động-khi-deploy)
4. [Best Practices](#4️⃣-best-practices-bảo-mật)

---

## 1️⃣ CLIENT ENVIRONMENT VARIABLES (Frontend)

### 📁 File: `client/.env.local`

```bash
# Supabase Configuration
VITE_SUPABASE_URL="https://thlqyxugdykoactsbttt.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY="pk_test_Y2FyZWZ1bC10dW5hLTEzLmNsZXJrLmFjY291bnRzLmRldiQ"

# Backend API URL
VITE_API_URL="http://localhost:3000/api"
```

---

### 🔍 GIẢI THÍCH CHI TIẾT

#### 🟦 **VITE_SUPABASE_URL**
```bash
VITE_SUPABASE_URL="https://thlqyxugdykoactsbttt.supabase.co"
```

**Là gì?**
- URL của Supabase project của bạn
- `thlqyxugdykoactsbttt` là project reference ID

**Dùng để làm gì?**
- Kết nối Frontend với Supabase database
- Truy cập Supabase Storage (lưu ảnh)
- Gọi Supabase APIs

**Code sử dụng:**
```javascript
// File: client/src/services/api.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabase = createClient(supabaseUrl, supabaseKey)

// Ví dụ: Query rooms
const { data: rooms } = await supabase
  .from('rooms')
  .select('*')
```

**Khi deploy:**
- Set trong Vercel Dashboard → Environment Variables
- Giá trị giống với local (không đổi)

---

#### 🟦 **VITE_SUPABASE_ANON_KEY**
```bash
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Là gì?**
- JWT token công khai (public key)
- "anon" = anonymous (người dùng ẩn danh)
- Được tạo tự động bởi Supabase

**Dùng để làm gì?**
- Xác thực khi gọi Supabase APIs từ browser
- Áp dụng Row Level Security (RLS) policies
- KHÔNG bypass security (safe để expose)

**Cấu trúc JWT:**
```json
{
  "iss": "supabase",
  "ref": "thlqyxugdykoactsbttt",
  "role": "anon",          // ← Role anonymous
  "iat": 1761533534,
  "exp": 2077109534        // Hết hạn năm 2077
}
```

**Code sử dụng:**
```javascript
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// RLS sẽ check: user chỉ thấy bookings của mình
const { data } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', currentUserId)  // RLS auto filter
```

**Bảo mật:**
- ✅ SAFE để public (có trong client code)
- ✅ RLS policies bảo vệ data

---

#### 🟦 **VITE_SUPABASE_SERVICE_KEY** ⚠️
```bash
VITE_SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Là gì?**
- JWT token với role "service_role"
- **BYPASS tất cả RLS policies**

**Dùng để làm gì?**
- Admin operations (tạo user, xóa data...)
- Server-side operations only
- Bypass RLS khi cần thiết

*


---

#### 🟦 **VITE_CLERK_PUBLISHABLE_KEY**
```bash
VITE_CLERK_PUBLISHABLE_KEY="pk_test_Y2FyZWZ1bC10dW5hLTEzLmNsZXJrLmFjY291bnRzLmRldiQ"
```

**Là gì?**
- Public key từ Clerk Authentication
- `pk_test_` = publishable key cho testing
- `pk_live_` = publishable key cho production

**Dùng để làm gì?**
- Initialize Clerk provider trong React
- Hiển thị Sign In/Sign Up UI
- Verify user sessions

**Code sử dụng:**
```javascript
// File: client/src/main.jsx
import { ClerkProvider } from '@clerk/clerk-react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

<ClerkProvider publishableKey={clerkPubKey}>
  <App />
</ClerkProvider>
```

**Flow:**
```
User → Click "Sign In"
     → Clerk UI appears
     → User enters email/password
     → Clerk verifies
     → Returns JWT token
     → Store in browser
     → Use token for API calls
```

**Bảo mật:**
- ✅ SAFE để public
- ✅ Chỉ verify sessions, không tạo users
- ❌ KHÔNG thể fake JWT (có signature)

**Khi deploy:**
- Development: `pk_test_...`
- Production: `pk_live_...` (lấy từ Clerk Dashboard)

---

#### 🟦 **VITE_API_URL**
```bash
VITE_API_URL="http://localhost:3000/api"
```

**Là gì?**
- URL của Backend API server
- Local: `http://localhost:3000/api`
- Production: `https://your-server.vercel.app/api`

**Dùng để làm gì?**
- Frontend gọi Backend APIs
- Tất cả API calls đều dùng base URL này

**Code sử dụng:**
```javascript
// File: client/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL

// Create user
const response = await fetch(`${API_URL}/user/create-or-update`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
})

// Get rooms
const response = await fetch(`${API_URL}/rooms`)

// Book room
const response = await fetch(`${API_URL}/bookings/book`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${clerkToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(bookingData)
})
```
]
**Khi deploy:**
1. Deploy server trước → Lấy URL: `https://xyz.vercel.app`
2. Set client env: `VITE_API_URL=https://xyz.vercel.app/api`
3. Deploy client


---

## 2️⃣ SERVER ENVIRONMENT VARIABLES (Backend)

### 📁 File: `server/.env.example`

```bash
# Supabase Configuration
SUPABASE_URL="https://thlqyxugdykoactsbttt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Clerk Authentication
CLERK_PUBLISHABLE_KEY="pk_test_Y2FyZWZ1bC10dW5hLTEzLmNsZXJrLmFjY291bnRzLmRldiQ"
CLERK_SECRET_KEY="sk_test_4ABYfajoPFzF3KV3a2s2R8FCmWz3Vxd9YOGbhKrYOV"
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Server Configuration
PORT=3000
```

---

### 🔍 GIẢI THÍCH CHI TIẾT

#### 🟧 **SUPABASE_URL** & **SUPABASE_ANON_KEY**
```bash
SUPABASE_URL="https://thlqyxugdykoactsbttt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Giống client**, nhưng:
- Không có prefix `VITE_` (vì Node.js, không phải Vite)
- Dùng trong server-side operations

**Code sử dụng:**
```javascript
// File: server/configs/db.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;      // ← Không có VITE_
const supabaseKey = process.env.SUPABASE_ANON_KEY; // ← Không có VITE_

const supabase = createClient(supabaseUrl, supabaseKey);

// Query database
const { data: users } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

---

#### 🟧 **CLERK_PUBLISHABLE_KEY** (Server)
```bash
CLERK_PUBLISHABLE_KEY="pk_test_Y2FyZWZ1bC10dW5hLTEzLmNsZXJrLmFjY291bnRzLmRldiQ"
```

**Dùng để làm gì?**
- Verify JWT tokens từ client
- Public key, safe để expose

**Code sử dụng:**
```javascript
// File: server/server.js
import { clerkMiddleware } from '@clerk/express'

// Clerk tự động dùng CLERK_PUBLISHABLE_KEY để verify tokens
app.use(clerkMiddleware());
```

---

#### 🟧 **CLERK_SECRET_KEY** 🔒
```bash
CLERK_SECRET_KEY="sk_test_4ABYfajoPFzF3KV3a2s2R8FCmWz3Vxd9YOGbhKrYOV"
```

**Là gì?**
- Secret key của Clerk
- `sk_test_` = secret key for testing
- **KHÔNG BAO GIỜ expose ra public**

**Dùng để làm gì?**
- Server-side operations với Clerk API
- Tạo/xóa users
- Update user metadata
- Verify webhooks

**Code sử dụng:**
```javascript
// Clerk middleware tự động dùng secret key
import { clerkClient } from '@clerk/express'

// Get user from Clerk
const user = await clerkClient.users.getUser(userId)

// Update user metadata
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: { role: 'HOTEL_OWNER' }
})
```

**⚠️ BẢO MẬT:**
- ❌ KHÔNG commit vào Git
- ❌ KHÔNG expose ra client
- ✅ CHỈ set trong server environment
- ✅ Dùng `.env` file (ignored by Git)

---

#### 🟧 **CLERK_WEBHOOK_SECRET** 🔐
```bash
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

**Là gì?**
- Secret để verify Clerk webhooks
- Đảm bảo webhook request thật sự từ Clerk

**Dùng để làm gì?**
- Verify signature của webhook
- Tránh fake webhooks

**Code sử dụng:**
```javascript
// File: server/controllers/clerkWebhooks.js
import { Webhook } from 'svix'

const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

// Verify webhook signature
const payload = webhook.verify(body, headers)

if (payload.type === 'user.created') {
  // Tạo user trong database
  await createUserInDatabase(payload.data)
}
```

**Flow:**
```
User signs up on Clerk
     ↓
Clerk sends webhook to your server:
  POST /api/clerk/webhooks
  Headers: {
    svix-signature: "encrypted_signature"
  }
  Body: { type: "user.created", data: {...} }
     ↓
Server verifies signature với CLERK_WEBHOOK_SECRET
     ↓
If valid → Process webhook
If invalid → Reject (fake webhook)
```

**Lấy ở đâu?**
1. Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-server.vercel.app/api/clerk/webhooks`
3. Copy "Signing Secret" → CLERK_WEBHOOK_SECRET

---

#### 🟧 **PORT**
```bash
PORT=3000
```

**Là gì?**
- Port mà server chạy
- Local: 3000
- Production (Vercel): Tự động set

**Code sử dụng:**
```javascript
// File: server/server.js
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Environment-specific:**
| Environment | Value |
|-------------|-------|
| Development | `3000` (bạn set) |
| Production (Vercel) | Auto (Vercel set) |

---

## 3️⃣ CÁCH HOẠT ĐỘNG KHI DEPLOY

### 📦 **LOCAL DEVELOPMENT**

#### Client (Frontend)
```
File: client/.env.local
      ↓
Vite reads variables with VITE_ prefix
      ↓
Build time: Replace import.meta.env.VITE_XXX với values
      ↓
Browser receives built code với hardcoded values
```

**Example:**
```javascript
// Before build (source code):
const apiUrl = import.meta.env.VITE_API_URL;

// After build (dist/assets/index-abc123.js):
const apiUrl = "http://localhost:3000/api";
```

#### Server (Backend)
```
File: server/.env
      ↓
Node.js loads với dotenv package
      ↓
Runtime: process.env.XXX access values
      ↓
Server uses values during execution
```

---

### ☁️ **VERCEL DEPLOYMENT**

#### 🔷 Deploy Client

**Step 1: Set Environment Variables trên Vercel Dashboard**
```
Vercel Dashboard
  → Your Project
  → Settings
  → Environment Variables
  → Add:
```

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://thlqyxugdykoactsbttt.supabase.co` | Production |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` hoặc `pk_live_...` | Production |
| `VITE_API_URL` | `https://hotel-server.vercel.app/api` | Production |

**Step 2: Build Process**
```bash
# Vercel runs:
npm install
npm run build

# Vite build:
1. Read environment variables from Vercel
2. Replace import.meta.env.VITE_XXX
3. Create optimized build in dist/
4. Deploy dist/ to CDN
```

**Step 3: Served to Users**
```
User requests → https://hotel-client.vercel.app
              → Vercel CDN
              → Serve static files (HTML, JS, CSS)
              → JS has hardcoded env values
```

**⚠️ CHÚ Ý:**
- Environment variables được "baked in" during build
- Muốn đổi value → Phải redeploy
- User có thể thấy values trong browser dev tools

---

#### 🔶 Deploy Server

**Step 1: Set Environment Variables trên Vercel**

| Key | Value | Environment |
|-----|-------|-------------|
| `SUPABASE_URL` | `https://thlqyxugdykoactsbttt.supabase.co` | Production |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` | Production |
| `CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Production |
| `CLERK_SECRET_KEY` | `sk_test_...` 🔒 | Production |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` 🔒 | Production |
| `NODE_ENV` | `production` | Production |

**Step 2: Deploy Process**
```bash
# Vercel runs:
npm install
npm start  # or node server.js

# Server:
1. Load env vars từ Vercel
2. Start Express server
3. Listen for requests
```

**Step 3: Runtime Access**
```javascript
// Server code:
const supabaseUrl = process.env.SUPABASE_URL;  // ✅ Loaded at runtime

// On each request:
app.get('/api/user', protect, (req, res) => {
  // process.env values available here
  const clerkSecret = process.env.CLERK_SECRET_KEY;
});
```

**⚠️ CHÚ Ý:**
- Env vars loaded at RUNTIME (không build time)
- Đổi value trên Vercel → Auto reload (không cần redeploy)
- Values KHÔNG exposed ra public

---

### 🔄 **DEPLOYMENT WORKFLOW**

```
┌─────────────────────────────────────────────────────┐
│ 1️⃣ DEPLOY SERVER FIRST                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  a) Set server env vars trên Vercel:               │
│     - SUPABASE_URL                                  │
│     - SUPABASE_ANON_KEY                             │
│     - CLERK_PUBLISHABLE_KEY                         │
│     - CLERK_SECRET_KEY 🔒                           │
│     - CLERK_WEBHOOK_SECRET 🔒                       │
│                                                     │
│  b) Deploy: vercel --prod                          │
│                                                     │
│  c) Get server URL: https://server-abc.vercel.app  │
│                                                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 2️⃣ DEPLOY CLIENT SECOND                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  a) Set client env vars trên Vercel:               │
│     - VITE_SUPABASE_URL                             │
│     - VITE_SUPABASE_ANON_KEY                        │
│     - VITE_CLERK_PUBLISHABLE_KEY                    │
│     - VITE_API_URL = https://server-abc.vercel.app/api │
│          ↑ Use server URL from step 1c             │
│                                                     │
│  b) Deploy: vercel --prod                          │
│                                                     │
│  c) Get client URL: https://client-xyz.vercel.app  │
│                                                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 3️⃣ UPDATE CORS & WEBHOOKS                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  a) Update CORS in server.js:                      │
│     origin: ['https://client-xyz.vercel.app']      │
│     → Redeploy server                              │
│                                                     │
│  b) Update Clerk webhook URL:                      │
│     https://server-abc.vercel.app/api/clerk/webhooks │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 4️⃣ BEST PRACTICES (BẢO MẬT)

### ✅ **DO (NÊN LÀM)**

#### 1. Dùng `.env.local` cho development
```bash
# ✅ Create client/.env.local
VITE_API_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

#### 2. Dùng `.env.example` cho template
```bash
# ✅ Create client/.env.example (commit vào Git)
VITE_API_URL=your_api_url_here
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
# Không có values thật
```

#### 3. Add `.env*` vào `.gitignore`
```bash
# ✅ .gitignore
.env
.env.local
.env.production
*.env

# ✅ KHÔNG commit secrets
```

#### 4. Phân biệt Public vs Secret keys

**Public Keys (Safe):**
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_CLERK_PUBLISHABLE_KEY`
- ✅ `VITE_API_URL`

**Secret Keys (DANGER):**
- 🔒 `CLERK_SECRET_KEY`
- 🔒 `CLERK_WEBHOOK_SECRET`
- 🔒 `VITE_SUPABASE_SERVICE_KEY` (nếu có)

#### 5. Set env vars trên Vercel Dashboard
```
✅ Vercel Dashboard → Settings → Environment Variables
❌ KHÔNG hardcode trong code
❌ KHÔNG commit vào Git
```

#### 6. Dùng different keys cho dev/prod
```bash
# Development
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Production
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

---

### ❌ **DON'T (TRÁNH)**

#### 1. KHÔNG commit secrets vào Git
```bash
# ❌ BAD
git add .env
git commit -m "Add env file"
git push
→ SECRET LEAKED! Ai cũng thấy được!
```

#### 2. KHÔNG dùng Service Key ở client
```javascript
// ❌ BAD - Bypass RLS
const supabase = createClient(url, serviceKey)

// ✅ GOOD - Respect RLS
const supabase = createClient(url, anonKey)
```

#### 3. KHÔNG hardcode values
```javascript
// ❌ BAD
const apiUrl = "https://myserver.vercel.app/api"

// ✅ GOOD
const apiUrl = import.meta.env.VITE_API_URL
```

#### 4. KHÔNG để secret keys trong client code
```bash
# ❌ BAD
VITE_CLERK_SECRET_KEY=sk_test_xxx  # Có VITE_ prefix → exposed!

# ✅ GOOD (server only)
CLERK_SECRET_KEY=sk_test_xxx  # Không có VITE_ → safe
```

---

### 🔍 **KIỂM TRA BẢO MẬT**

#### Check 1: Secrets không commit?
```bash
git log --all --full-history -- "*.env*"
# Không thấy .env file → ✅ Good
```

#### Check 2: Browser không thấy secrets?
```javascript
// Open browser console:
console.log(import.meta.env)

// Should see:
{
  VITE_API_URL: "...",
  VITE_CLERK_PUBLISHABLE_KEY: "pk_test_...",
  VITE_SUPABASE_URL: "..."
}

// Should NOT see:
// CLERK_SECRET_KEY ← ❌ Nếu thấy = BUG!
```

#### Check 3: Vercel env vars set đúng?
```
Vercel Dashboard → Settings → Environment Variables
→ Check tất cả required vars có đủ không
```

---

## 📊 TÓM TẮT

### Client (.env.local)
| Variable | Type | Purpose | Deploy |
|----------|------|---------|--------|
| `VITE_SUPABASE_URL` | Public | Database URL | Set on Vercel |
| `VITE_SUPABASE_ANON_KEY` | Public | DB access (với RLS) | Set on Vercel |
| `VITE_CLERK_PUBLISHABLE_KEY` | Public | Auth UI | Set on Vercel |
| `VITE_API_URL` | Public | Backend URL | Set on Vercel |

### Server (.env)
| Variable | Type | Purpose | Deploy |
|----------|------|---------|--------|
| `SUPABASE_URL` | Public | Database URL | Set on Vercel |
| `SUPABASE_ANON_KEY` | Public | DB access | Set on Vercel |
| `CLERK_PUBLISHABLE_KEY` | Public | Verify tokens | Set on Vercel |
| `CLERK_SECRET_KEY` | 🔒 Secret | Clerk API | Set on Vercel |
| `CLERK_WEBHOOK_SECRET` | 🔒 Secret | Verify webhooks | Set on Vercel |
| `PORT` | Config | Server port | Auto on Vercel |

---

## 🎯 KẾT LUẬN

**Environment Variables là:**
- 🔧 Configuration cho app
- 🔐 Bảo mật secrets (không commit)
- 🌍 Khác nhau giữa dev/prod
- ☁️ Set trên Vercel khi deploy

**Khi deploy lên Vercel:**
1. Set tất cả env vars trên Dashboard
2. Build process inject values vào code
3. App chạy với production values
4. Secrets không bao giờ expose ra public

**Best Practice:**
- ✅ Dùng `.env.local` local
- ✅ Set env vars on Vercel
- ✅ Phân biệt public/secret keys
- ❌ KHÔNG commit secrets
- ❌ KHÔNG hardcode values
