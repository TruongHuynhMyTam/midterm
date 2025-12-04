import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets, cities } from "../assets/assets";

const Hero = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 1
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
  e.preventDefault();
  
  // Kiểm tra destination có giá trị
  if (!formData.destination || formData.destination.trim() === '') {
    alert('Please enter a destination');
    return;
  }
  
  // Tạo query params
  const params = new URLSearchParams();
  params.append('city', formData.destination.trim()); //Trim whitespace
  
  if (formData.checkIn) params.append('checkIn', formData.checkIn);
  if (formData.checkOut) params.append('checkOut', formData.checkOut);
  if (formData.guests) params.append('guests', formData.guests);
  
  // Navigate sang trang rooms với params
  navigate(`/rooms?${params.toString()}`);
};

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className='flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url("/src/assets/heroImage.png")] bg-no-repeat bg-cover bg-center h-screen'>
      <p className="bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20">
        The Ultimate Hotel Experience
      </p>
      <h1 className="font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4">
        Discover Your Perfect Gateway Destination
      </h1>
      <p className="max-w-130 mt-2 text-sm md:text-base">
        Unparalleled luxury and comfort await at the world's most exclusive
        hotels and resorts. Start your journey today.
      </p>

      {/* FORM START HERE */}
      <form 
        onSubmit={handleSearch}
        className="bg-white text-gray-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto"
      >
        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="" className="h-4"/>
            <label htmlFor="destinationInput">Destination</label>
          </div>
          <input
            list="destinations"
            id="destinationInput"
            type="text"
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-blue-500"
            placeholder="Type here"
            required
          />
          <datalist id="destinations">
            {cities.map((city, index) => (
              <option value={city} key={index} />
            ))}
          </datalist>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="" className="h-4"/>
            <label htmlFor="checkIn">Check in</label>
          </div>
          <input
            id="checkIn"
            type="date"
            value={formData.checkIn}
            onChange={(e) => handleInputChange('checkIn', e.target.value)}
            min={today}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="" className="h-4"/>
            <label htmlFor="checkOut">Check out</label>
          </div>
          <input
            id="checkOut"
            type="date"
            value={formData.checkOut}
            onChange={(e) => handleInputChange('checkOut', e.target.value)}
            min={formData.checkIn || today}
            disabled={!formData.checkIn}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="flex md:flex-col max-md:gap-2 max-md:items-center">
          <label htmlFor="guests">Guests</label>
          <input
            min={1}
            max={4}
            id="guests"
            type="number"
            value={formData.guests}
            onChange={(e) => handleInputChange('guests', e.target.value)}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16 focus:border-blue-500"
            placeholder="1"
          />
        </div>

        <button 
          type="submit"
          className="flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1 hover:bg-gray-800 transition-colors"
        >
          <img src={assets.searchIcon} alt="searchIcon" className="h-7"/>
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default Hero;