ary/Prisma, Added Supabase Client

### Key Changes Made:

1. **Schema Definition**: 
   - Created `prisma/schema.prisma` with PostgreSQL schema
   - Converted Mongoose schemas to Prisma models

2. **Database Connection**:
   - Updated `configs/db.js` to use Prisma Client
   - Replaced MongoDB connection with PostgreSQL

3. **Controllers Updated**:
   - `userController.js` - Converted to Prisma queries
   - `hotelController.js` - Converted to Prisma queries  
   - `roomController.js` - Converted to Prisma queries
   - `bookingController.js` - Converted to Prisma queries
   - `clerkWebhooks.js` - Updated for Prisma user operations

4. **Middleware Updated**:
   - `authMiddleware.js` - Updated to use Prisma for user lookup

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Supabase Database & Storage
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your PostgreSQL connection string from Supabase dashboard
3. Create a storage bucket named `hotel-images` in Supabase Storage
4. Set the bucket to public access for image serving
5. Copy `.env.example` to `.env` and update with your credentials:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
   ```

### 3. Setup Database Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_schema.sql`
4. Execute the SQL to create all tables and policies

### 5. Start the Server
```bash
npm run server
```

## Environment Variables Required

Create a `.env` file with:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key (no IPv4 charges)
- `CLERK_WEBHOOK_SECRET` - Your Clerk webhook secret

## Database Schema

The PostgreSQL schema includes:
- **Users** - User accounts (from Clerk)
- **Hotels** - Hotel information
- **Rooms** - Room details with amenities and images
- **Bookings** - Booking records with relations

## Prisma Commands

- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes to database
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Create and apply migrations

## Data Migration (if needed)

If you have existing MongoDB data, you'll need to:
1. Export data from MongoDB
2. Transform the data format (ObjectIds → UUIDs)
3. Import into PostgreSQL using Prisma

## Benefits of PostgreSQL + Prisma

- **Type Safety**: Better TypeScript integration
- **Performance**: PostgreSQL is faster for complex queries
- **ACID Compliance**: Better data consistency
- **Scalability**: Better scaling options with Supabase
- **Developer Experience**: Prisma Studio for database management
