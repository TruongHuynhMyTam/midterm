import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { assets, facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";
import { getAllRooms, searchRooms } from "../services/api";

const CheckBox = ({label, selected = false, onChange = () => {}}) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input 
        type="checkbox" 
        checked={selected} 
        onChange={(e) => onChange(e.target.checked, label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  )
}

export const AllRooms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");
  
  // API state
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search params state
  const [searchInfo, setSearchInfo] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: 1
  });
  
  // Filter states
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

  const roomTypes = [
    "Single Bed",
    "Double Bed",
    "Luxury Room",
    "Family Suite",
  ];
  
  const priceRanges = [
    { label: "0-500", min: 0, max: 500 },
    { label: "500-1000", min: 500, max: 1000 },
    { label: "1000-2000", min: 1000, max: 2000 },
    { label: "2000-3000", min: 2000, max: 3000 },
  ];

  const sortOptions = [
    "Price: Low to High",
    "Price: High to Low",
    "Newest First",
  ];

  // Lấy search params từ URL
  useEffect(() => {
    const city = searchParams.get('city') || "";
    const checkIn = searchParams.get('checkIn') || "";
    const checkOut = searchParams.get('checkOut') || "";
    const guests = searchParams.get('guests') || 1;

    setSearchInfo({ city, checkIn, checkOut, guests });
  }, [searchParams]);

  useEffect(() => {
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      // Nếu có city trong search params, dùng searchRooms
      if (searchInfo.city) {
        result = await searchRooms({
          city: searchInfo.city,
          checkIn: searchInfo.checkIn,
          checkOut: searchInfo.checkOut,
          guests: searchInfo.guests
        });
        
        console.log('Search result:', result); // Debug
      } 
      // Nếu không có search params, lấy tất cả rooms
      else {
        result = await getAllRooms({ isAvailable: true });
      }
      
      if (result.success) {
        setRooms(result.data);
        setFilteredRooms(result.data);
      } else {
        setError(result.error);
        setRooms([]);
        setFilteredRooms([]);
      }
    } catch (err) {
      console.error('Fetch error:', err); // Debug
      setError(err.message);
      setRooms([]);
      setFilteredRooms([]);
    } finally {
      setLoading(false);
    }
  };

  fetchRooms();
}, [searchInfo.city, searchInfo.checkIn, searchInfo.checkOut, searchInfo.guests]);

  // Apply filters
  const applyFilters = React.useCallback(() => {
    let filtered = [...rooms];

    // Filter by room type
    if (selectedRoomTypes.length > 0) {
      filtered = filtered.filter(room => 
        selectedRoomTypes.includes(room.room_type)
      );
    }

    // Filter by price range
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(room => {
        return selectedPriceRanges.some(range => 
          room.price_per_night >= range.min && room.price_per_night <= range.max
        );
      });
    }

    // Sort rooms
    if (selectedSort === "Price: Low to High") {
      filtered.sort((a, b) => a.price_per_night - b.price_per_night);
    } else if (selectedSort === "Price: High to Low") {
      filtered.sort((a, b) => b.price_per_night - a.price_per_night);
    } else if (selectedSort === "Newest First") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredRooms(filtered);
  }, [rooms, selectedRoomTypes, selectedPriceRanges, selectedSort]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleRoomTypeChange = (checked, roomType) => {
    if (checked) {
      setSelectedRoomTypes([...selectedRoomTypes, roomType]);
    } else {
      setSelectedRoomTypes(selectedRoomTypes.filter(type => type !== roomType));
    }
  };

  const handlePriceRangeChange = (checked, range) => {
    if (checked) {
      setSelectedPriceRanges([...selectedPriceRanges, range]);
    } else {
      setSelectedPriceRanges(selectedPriceRanges.filter(r => r.label !== range.label));
    }
  };

  const clearFilters = () => {
    setSelectedRoomTypes([]);
    setSelectedPriceRanges([]);
    setSelectedSort("");
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="flex-1 w-full">
        <div className="flex flex-col items-start text-left">
          <h1 className="font-playfair text-4xl md:text-[40px]">
            {searchInfo.city ? `Rooms in ${searchInfo.city}` : 'Hotel Rooms'}
          </h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
            {searchInfo.city 
              ? `Showing available rooms in ${searchInfo.city}` 
              : 'Take advantage of our limited-time offers and special packages to enhance your stay'
            }
          </p>
          
          {/* Hiển thị search criteria */}
          {(searchInfo.checkIn || searchInfo.checkOut || searchInfo.guests > 1) && (
            <div className="flex flex-wrap gap-3 mt-4 text-sm">
              {searchInfo.checkIn && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  📅 Check-in: {new Date(searchInfo.checkIn).toLocaleDateString()}
                </span>
              )}
              {searchInfo.checkOut && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  📅 Check-out: {new Date(searchInfo.checkOut).toLocaleDateString()}
                </span>
              )}
              {searchInfo.guests > 1 && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  👥 {searchInfo.guests} guests
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {searchInfo.city ? `Searching rooms in ${searchInfo.city}...` : 'Loading rooms...'}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Rooms Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchInfo.city 
                ? `No available rooms in ${searchInfo.city} matching your criteria.` 
                : 'No rooms found matching your criteria.'
              }
            </p>
            <button 
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mr-2"
            >
              Clear Filters
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              New Search
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 mt-6 text-gray-700">
              <p className="font-semibold">
                Found {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
              </p>
            </div>
            {filteredRooms.map((room) => (
              <div key={room.id} className="flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0">
                <img
                  onClick={() => {navigate(`/room/${room.id}`); window.scrollTo(0, 0);}}
                  src={room.images && room.images.length > 0 ? room.images[0] : assets.roomImg1}
                  alt="hotel-img"
                  title="View Room Details"
                  className="max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
                <div className="md:w-1/2 flex flex-col gap-2">
                  <p className="text-gray-500">{room.hotels?.city || 'City'}</p>
                  <p onClick={() => {navigate(`/room/${room.id}`); window.scrollTo(0, 0);}} 
                  className="text-gray-800 text-3xl font-playfair cursor-pointer hover:text-blue-600 transition-colors">
                    {room.hotels?.name || 'Hotel Name'}
                  </p>            
                  <div className="flex items-center">
                    <StarRating />
                    <p className="ml-2">200+ reviews</p>
                  </div>
                  <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'> 
                    <img src={assets.locationIcon} alt="location-icon" />
                    <span>{room.hotels?.address || 'Address'}</span>
                  </div>
                  {/* Room Amenities */}
                  <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
                    {(room.amenities || []).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50">
                        <img src={facilityIcons[item] || assets.freeWifiIcon} alt={item} className="w-5 h-5" />
                        <p className="text-xs">{item}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xl font-medium text-gray-700">${room.price_per_night} / night</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Sidebar - Filters */}
      <div className="bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16 lg:ml-6 flex-shrink-0">
        <div className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${openFilter && "border-b"}`}>
          <p className="text-base font-medium text-gray-800">FILTERS</p>
          <div className="text-xs cursor-pointer">
            <span onClick={() => setOpenFilter(!openFilter)} className="lg:hidden">
              {openFilter ? 'HIDE' : 'SHOW'}
            </span>
            <span onClick={clearFilters} className="hidden lg:block hover:text-blue-600">CLEAR</span>
          </div>
        </div>
        
        <div className={`${openFilter ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-300`}>
          
          {/* Popular Filters */}
          <div className="px-5 pt-5 pb-4">
            <p className="font-medium text-gray-800 pb-3">Room Types</p>
            {roomTypes.map((roomType, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id={`room-${index}`} 
                  className="w-4 h-4 accent-blue-600"
                  checked={selectedRoomTypes.includes(roomType)}
                  onChange={(e) => handleRoomTypeChange(e.target.checked, roomType)}
                />
                <label htmlFor={`room-${index}`} className="text-sm text-gray-600 cursor-pointer">
                  {roomType}
                </label>
              </div>
            ))}
          </div>
          
          {/* Price Range */}
          <div className="px-5 py-4 border-t border-gray-200">
            <p className="font-medium text-gray-800 pb-3">Price Range</p>
            {priceRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id={`price-${index}`} 
                  className="w-4 h-4 accent-blue-600"
                  checked={selectedPriceRanges.some(r => r.label === range.label)}
                  onChange={(e) => handlePriceRangeChange(e.target.checked, range)}
                />
                <label htmlFor={`price-${index}`} className="text-sm text-gray-600 cursor-pointer">
                  $ {range.label}
                </label>
              </div>
            ))}
          </div>
          
          {/* Sort By */}
          <div className="px-5 py-4 border-t border-gray-200">
            <p className="font-medium text-gray-800 pb-3">Sort By</p>
            {sortOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input 
                  type="radio" 
                  id={`sort-${index}`} 
                  name="sort" 
                  value={option}
                  checked={selectedSort === option}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-4 h-4 accent-blue-600" 
                />
                <label htmlFor={`sort-${index}`} className="text-sm text-gray-600 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};