import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
// const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Regular client for authenticated operations
export const supabase = createClient(supabaseUrl, supabaseKey)

// Service client for user management operations (bypasses RLS)
// const supabaseService = supabaseServiceKey 
//   ? createClient(supabaseUrl, supabaseServiceKey, {
//       auth: {
//         autoRefreshToken: false,
//         persistSession: false
//       }
//     })
//   : null

// ============ USER FUNCTIONS ============
export const getUserProfile = async (clerkUserId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', clerkUserId)
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { success: false, error: error.message }
  }
}

export const createOrUpdateUser = async (userData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/create-or-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return { success: false, error: error.message };
  }
}

export const updateUserRole = async (clerkUserId, newRole) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clerkUserId}` // You'll need to get the actual token
      },
      body: JSON.stringify({ role: newRole })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }
}

// ============ HOTEL FUNCTIONS ============
export const getAllHotels = async () => {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .select(`
        *,
        users!hotels_owner_id_fkey(username, email)
      `)
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return { success: false, error: error.message }
  }
}

export const getHotelById = async (hotelId) => {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .select(`
        *,
        users!hotels_owner_id_fkey(username, email),
        rooms(*)
      `)
      .eq('id', hotelId)
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return { success: false, error: error.message }
  }
}

export const getHotelsByOwner = async (ownerId) => {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('owner_id', ownerId)
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching owner hotels:', error)
    return { success: false, error: error.message }
  }
}

// ============ ROOM FUNCTIONS ============
export const getAllRooms = async (filters = {}) => {
  try {
    let query = supabase
      .from('rooms')
      .select(`
        *,
        hotels(id, name, address, city)
      `)
    
    // Apply filters
    if (filters.isAvailable !== undefined) {
      query = query.eq('is_available', filters.isAvailable)
    }
    
    if (filters.minPrice) {
      query = query.gte('price_per_night', filters.minPrice)
    }
    
    if (filters.maxPrice) {
      query = query.lte('price_per_night', filters.maxPrice)
    }
    
    if (filters.roomType) {
      query = query.eq('room_type', filters.roomType)
    }
    
    if (filters.city) {
      query = query.eq('hotels.city', filters.city)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return { success: false, error: error.message }
  }
}

export const getRoomById = async (roomId) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        hotels(name, address, city)
      `)
      .eq('id', roomId)
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching room:', error)
    return { success: false, error: error.message }
  }
}

export const getRoomsByHotel = async (hotelId) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId)
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching hotel rooms:', error)
    return { success: false, error: error.message }
  }
}

export const addRoom = async (roomData) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        hotel_id: roomData.hotelId,
        room_type: roomData.roomType,
        price_per_night: roomData.pricePerNight,
        amenities: roomData.amenities,
        images: roomData.images || [],
        is_available: true
      })
      .select()
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error adding room:', error)
    return { success: false, error: error.message }
  }
}

export const updateRoomAvailability = async (roomId, isAvailable) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update({ is_available: isAvailable })
      .eq('id', roomId)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating room availability:', error)
    return { success: false, error: error.message }
  }
}

// ============ BOOKING FUNCTIONS ============
export const createBooking = async (bookingData) => {
  try {
    // First, get the room data to find the hotel_id
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('hotel_id')
      .eq('id', bookingData.roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found');
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: bookingData.userId,
        room_id: bookingData.roomId,
        hotel_id: roomData.hotel_id, // Add the hotel_id from room data
        check_in_date: bookingData.checkInDate,
        check_out_date: bookingData.checkOutDate,
        total_price: bookingData.totalPrice,
        number_of_guests: bookingData.numberOfGuests,
        guests: bookingData.numberOfGuests, // Add guests field for backward compatibility
        special_requests: bookingData.specialRequests || '',
        status: 'PENDING',
        payment_method: 'Pay At Hotel',
        is_paid: bookingData.isPaid || false
      })
      .select(`
        *,
        rooms(*,
          hotels(name, address, city)
        )
      `)
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { success: false, error: error.message }
  }
}

export const getUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms(room_type, price_per_night, images,
          hotels(name, address, city)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return { success: false, error: error.message }
  }
}

export const getBookingById = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms(*,
          hotels(name, address, city)
        ),
        users(username, email)
      `)
      .eq('id', bookingId)
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching booking:', error)
    return { success: false, error: error.message }
  }
}

export const updateBookingPaymentStatus = async (bookingId, isPaid) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ is_paid: isPaid })
      .eq('id', bookingId)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating booking payment:', error)
    return { success: false, error: error.message }
  }
}

// ============ DASHBOARD FUNCTIONS ============
export const getOwnerDashboardData = async (ownerId) => {
  try {
    // Get owner's hotels
    const hotelsResult = await getHotelsByOwner(ownerId)
    if (!hotelsResult.success) throw new Error(hotelsResult.error)
    
    const hotelIds = hotelsResult.data.map(hotel => hotel.id)
    
    if (hotelIds.length === 0) {
      return {
        success: true,
        data: {
          totalBookings: 0,
          totalRevenue: 0,
          bookings: []
        }
      }
    }
    
    // Get bookings for owner's hotels
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms(room_type, hotel_id,
          hotels!inner(id, name)
        ),
        users(username, email)
      `)
      .in('rooms.hotel_id', hotelIds)
      .order('created_at', { ascending: false })
    
    if (bookingsError) throw bookingsError
    
    // Calculate dashboard metrics
    const totalBookings = bookings.length
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_price, 0)
    
    return {
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        bookings: bookings.slice(0, 10) // Latest 10 bookings
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return { success: false, error: error.message }
  }
}

// ============ STORAGE FUNCTIONS ============
export const uploadImage = async (file, bucket = 'room-images') => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)
    
    if (error) throw error
    
    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return { success: true, data: { path: fileName, url: publicData.publicUrl } }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false, error: error.message }
  }
}

export const uploadMultipleImages = async (files, bucket = 'room-images') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, bucket))
    const results = await Promise.all(uploadPromises)
    
    const failedUploads = results.filter(result => !result.success)
    if (failedUploads.length > 0) {
      throw new Error(`Failed to upload ${failedUploads.length} images`)
    }
    
    return {
      success: true,
      data: results.map(result => result.data)
    }
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    return { success: false, error: error.message }
  }
}

// ============ SEARCH FUNCTIONS ============
export const searchRooms = async (searchParams = {}) => {
  try {
    let query = supabase
      .from('rooms')
      .select(`
        *,
        hotels!inner(id, name, address, city)
      `)
      .eq('is_available', true);
    
    // BẮT BUỘC phải có city để search
    if (!searchParams.city && !searchParams.searchTerm) {
      // Nếu không có gì để search, trả về empty array
      return { 
        success: true, 
        data: [], 
        count: 0 
      };
    }
    
    // Tìm kiếm theo city (ƯU TIÊN)
    if (searchParams.city) {
      // Dùng ilike để search không phân biệt hoa thường
      query = query.ilike('hotels.city', `%${searchParams.city}%`);
    }
    
    // Tìm kiếm theo keyword chung (nếu không có city)
    else if (searchParams.searchTerm) {
      const term = searchParams.searchTerm.toLowerCase();
      query = query.or(
        `room_type.ilike.%${term}%,hotels.name.ilike.%${term}%,hotels.city.ilike.%${term}%,hotels.address.ilike.%${term}%`
      );
    }
    
    // Apply additional filters
    if (searchParams.minPrice) {
      query = query.gte('price_per_night', parseFloat(searchParams.minPrice));
    }
    
    if (searchParams.maxPrice) {
      query = query.lte('price_per_night', parseFloat(searchParams.maxPrice));
    }
    
    if (searchParams.roomType) {
      query = query.eq('room_type', searchParams.roomType);
    }
    
    // Sort
    query = query.order('price_per_night', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log('Search results:', data); // Debug log
    
    return { 
      success: true, 
      data: data || [], 
      count: data ? data.length : 0 
    };
  } catch (error) {
    console.error('Error searching rooms:', error);
    return { 
      success: false, 
      error: error.message, 
      data: [],
      count: 0
    };
  }
};
