import React, {useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets, cities } from "../assets/assets.js";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { useSupabaseUser } from '../utils/auth-clerk.jsx';
import { canAccessOwnerFeatures, promoteToHotelOwner } from '../utils/roles.js';
import { searchRooms } from '../services/api.js';

const BookIcon = () => (
  <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4" />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experience", path: "/" },
    { name: "About", path: "/" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // States cho Search Modal
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 1
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { openSignIn } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: supabaseUser } = useSupabaseUser();

  const handleBecomeOwner = async () => {
    if (user && supabaseUser) {
      const result = await promoteToHotelOwner(user.id);
      if (result.success) {
        alert('You are now a hotel owner! The page will refresh.');
      } else {
        alert('Failed to become hotel owner: ' + result.error);
      }
    }
  };

  // Xử lý mở Search Modal
  const openSearchModal = () => {
    setShowSearchModal(true);
    setHasSearched(false);
    setSearchResults([]);
  };

  // Xử lý đóng Search Modal
  const closeSearchModal = () => {
    setShowSearchModal(false);
    setHasSearched(false);
    setSearchResults([]);
    setSearchData({
      destination: "",
      checkIn: "",
      checkOut: "",
      guests: 1
    });
  };

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý submit search
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      const result = await searchRooms({
        city: searchData.destination,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests
      });

      if (result.success) {
        setSearchResults(result.data);
        setHasSearched(true);
      } else {
        alert('Search failed: ' + result.error);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('An error occurred while searching');
    } finally {
      setIsSearching(false);
    }
  };

  // Xử lý click vào room
  const handleRoomClick = (roomId) => {
    navigate(`/room/${roomId}`);
    closeSearchModal();
  };

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    } else {
      setIsScrolled(false);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-md text-gray-600 py-3 md:py-4"
            : "bg-gradient-to-b from-black/30 to-transparent text-white py-4 md:py-6"
        }`}
      >
        {/* Logo */}
        <Link to="/">
          <img
            src={assets.logo}
            alt="Logo"
            className={`h-9 transition-all duration-500 ${isScrolled ? "filter invert" : ""}`}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className={`group flex flex-col gap-0.5 ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {link.name}
              <div
                className={`${
                  isScrolled ? "bg-gray-700" : "bg-white"
                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
              />
            </Link>
          ))}
          {user && supabaseUser && (
            <>
              {canAccessOwnerFeatures(supabaseUser.role) ? (
                <button
                  className={`px-6 py-2 text-sm font-medium rounded-full cursor-pointer transition-all ${
                    isScrolled ? "bg-gray-50 text-gray-600 border border-black hover:bg-gray-100" : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                  }`} 
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </button>
              ) : (
                <button
                  className={`px-6 py-2 text-sm font-medium rounded-full cursor-pointer transition-all ${
                    isScrolled ? "bg-blue-50 text-blue-600 border border-blue-500 hover:bg-blue-100" : "bg-blue-500/20 text-blue-100 border border-blue-300/30 hover:bg-blue-500/30"
                  }`} 
                  onClick={handleBecomeOwner}
                >
                  Become Hotel Owner
                </button>
              )}
            </>
          )}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
          {/* SEARCH ICON - Click để mở modal */}
          <button
            onClick={openSearchModal}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <img
              src={assets.searchIcon}
              alt="Search"
              className={`w-5 h-5 transition-all duration-500 ${isScrolled ? "opacity-70" : "opacity-100"}`}
            />
          </button>
          
          {user ? 
          (<UserButton afterSignOutUrl="/">
            <UserButton.MenuItems>
              <UserButton.Action 
                label="My Bookings" 
                labelIcon={<BookIcon />}
                onClick={() => navigate('/my-bookings')}
              />
            </UserButton.MenuItems>
          </UserButton>)
           : 
          (<button onClick={openSignIn}
            className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${
              isScrolled ? "bg-black text-white hover:bg-gray-800" : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Login
          </button>)
        }
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Search Icon */}
          <button onClick={openSearchModal}>
            <img
              src={assets.searchIcon}
              alt="Search"
              className={`w-5 h-5 ${isScrolled && "invert"}`}
            />
          </button>
          
          {user && (
            <UserButton afterSignOutUrl="/">
              <UserButton.MenuItems>
                <UserButton.Action 
                  label="My Bookings" 
                  labelIcon={<BookIcon />}
                  onClick={() => navigate('/my-bookings')}
                />
              </UserButton.MenuItems>
            </UserButton>
          )}
          <img
            src={assets.menuIcon}
            alt=""
            className={`${isScrolled && "invert"} h-4 cursor-pointer`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            className="absolute top-4 right-4"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src={assets.closeIcon}
              alt="Close"
              className="h-6"
            />
          </button>

          {navLinks.map((link, i) => (
            <Link key={i} to={link.path} onClick={() => setIsMenuOpen(false)}>
              {link.name}
            </Link>
          ))}

          {user && supabaseUser && (
            <>
              {canAccessOwnerFeatures(supabaseUser.role) ? (
                <button 
                  className="border border-gray-300 px-6 py-2 text-sm font-medium rounded-full cursor-pointer transition-all hover:bg-gray-100" 
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMenuOpen(false);
                  }}
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  className="border border-blue-500 bg-blue-50 text-blue-600 px-6 py-2 text-sm font-medium rounded-full cursor-pointer transition-all hover:bg-blue-100" 
                  onClick={() => {
                    handleBecomeOwner();
                    setIsMenuOpen(false);
                  }}
                >
                  Become Hotel Owner
                </button>
              )}
            </>
          )}
          {!user && <button onClick={openSignIn} className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500">
            Login
          </button>}
        </div>
      </nav>

      {/* SEARCH MODAL */}
      {showSearchModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={closeSearchModal}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {hasSearched ? `Search Results` : 'Find Your Perfect Room'}
              </h2>
              <button
                onClick={closeSearchModal}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <img src={assets.closeIcon} alt="Close" className="h-6 w-6 invert" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* SEARCH FORM */}
              {!hasSearched && (
                <div className="p-8">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Destination */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📍 Destination
                        </label>
                        <input
                          list="destinations"
                          type="text"
                          value={searchData.destination}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Enter city"
                          required
                        />
                        <datalist id="destinations">
                          {cities.map((city, index) => (
                            <option value={city} key={index} />
                          ))}
                        </datalist>
                      </div>

                      {/* Check In */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📅 Check In
                        </label>
                        <input
                          type="date"
                          value={searchData.checkIn}
                          onChange={(e) => handleInputChange('checkIn', e.target.value)}
                          min={today}
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>

                      {/* Check Out */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📅 Check Out
                        </label>
                        <input
                          type="date"
                          value={searchData.checkOut}
                          onChange={(e) => handleInputChange('checkOut', e.target.value)}
                          min={searchData.checkIn || today}
                          disabled={!searchData.checkIn}
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                        />
                      </div>

                      {/* Guests */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          👥 Guests
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={searchData.guests}
                          onChange={(e) => handleInputChange('guests', e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="mt-8 flex justify-center">
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-12 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
                      >
                        {isSearching ? (
                          <>
                            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching...
                          </>
                        ) : (
                          <>
                            <img src={assets.searchIcon} alt="" className="h-6 invert" />
                            Search Rooms
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/*SEARCH RESULTS */}
              {hasSearched && (
                <div className="p-6">
                  {/* Results Header */}
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {searchResults.length === 0 
                          ? 'No rooms found' 
                          : `Found ${searchResults.length} room${searchResults.length !== 1 ? 's' : ''}`
                        }
                      </h3>
                      {searchResults.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          in {searchData.destination}
                          {searchData.checkIn && ` • ${new Date(searchData.checkIn).toLocaleDateString()} - ${new Date(searchData.checkOut).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setHasSearched(false)}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
                    >
                      ← New Search
                    </button>
                  </div>

                  {/* No Results */}
                  {searchResults.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-7xl mb-4">🔍</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        No Rooms Available
                      </h3>
                      <p className="text-gray-600 mb-6">
                        We couldn't find any rooms in <span className="font-semibold">{searchData.destination}</span>
                      </p>
                    </div>
                  ) : (
                    /* Results Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => handleRoomClick(room.id)}
                          className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-500"
                        >
                          {/* Image */}
                          <div className="relative h-48">
                            <img
                              src={room.images?.[0] || 'https://via.placeholder.com/400x300?text=Room'}
                              alt={room.room_type}
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
                            />
                            <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              Available
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-5">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">
                              {room.room_type}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1 font-semibold">
                              🏨 {room.hotels?.name}
                            </p>
                            <p className="text-sm text-gray-500 mb-3">
                              📍 {room.hotels?.city}
                            </p>

                            {/* Amenities */}
                            {room.amenities?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {room.amenities.slice(0, 3).map((amenity, idx) => (
                                  <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Price */}
                            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-100">
                              <div>
                                <span className="text-2xl font-bold text-blue-600">
                                  ${room.price_per_night}
                                </span>
                                <span className="text-sm text-gray-500">/night</span>
                              </div>
                              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                                View →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;