import React from 'react';
import Header from '../components/Header';
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import { useNavigate } from 'react-router-dom';


  
const Home = () => {

  const navigate = useNavigate(); // Initialize the navigate function

  const handleChatBotClick = () => {
    navigate('/chatbot'); // Navigate to /chatbot route
  };

  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
      
      {/* Floating Chatbot Button */}
      <button 
        onClick={handleChatBotClick} 
        className='fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105'>
        MedAi
      </button>
    </div>
  );
}

export default Home;