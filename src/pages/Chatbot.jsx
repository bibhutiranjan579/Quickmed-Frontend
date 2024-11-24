import React, { useState, useEffect, useRef } from 'react';
// Assuming you have already configured the GoogleGenerativeAI instance
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBv_BDmcCDZiPZH25Y6bkSOxDxds2I9j14';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const chatBoxRef = useRef(null);
  const initialMessageSent = useRef(false);

  useEffect(() => {
         // Send initial message only if it hasn't been sent before
         if (!initialMessageSent.current) {
          sendInitialMessage();
          initialMessageSent.current = true;
        }
  }, []);
  
  useEffect(() => {
    if (chatBoxRef.current) {
      // Ensures smooth scrolling to the bottom of the chat
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory]);

  const appendMessage = (sender, message) => {
    setChatHistory((prev) => [...prev, { sender, text: message }]);
  };

  const formatText = (text) => {
    return text
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>') // Bold for headings
      .replace(/_(.*?)_/g, '<em>$1</em>') // Italics for subheadings
      .replace(/•/g, '<li>') // Bullet points
      .replace(/\n/g, '<br>'); // Line breaks
  };

  const getBotResponse = async (userMessage) => {
    const updatedHistory = [
      ...chatHistory,
      { sender: 'user', text: userMessage },
    ];
    const conversationHistory = updatedHistory
      .map((entry) => `${entry.sender}: ${entry.text}`)
      .join('\n');

    try {
      const result = await model.generateContent(conversationHistory);
      const response = await result.response;
      const text = await response.text();
      appendMessage('bot', formatText(text));
      
    } catch (error) {
      console.error('Error:', error);
      appendMessage('bot', 'Sorry, something went wrong.');
    }
  };

  const sendInitialMessage = async () => {
    const initialMessage = "Hello! Please start the conversation directly by greeting and saying Hello! Welcome to MedAi. and I'm here to assist you with your healthcare-related queries. You can ask me about symptoms, medications, general health advice, or connect with our healthcare professionals. Please let me know how I can assist you today!";
    try {
      const result = await model.generateContent(initialMessage);
      const response = await result.response;
      const text = await response.text();
      appendMessage('bot', formatText(text));
      window.scrollTo(0, document.body.scrollHeight);
    } catch (error) {
      console.error('Error:', error);
      appendMessage('bot', 'Sorry, something went wrong.');
    }
  };

  const handleSend = () => {
    if (userMessage.trim()) {
      const additionalText = ".Give me best answer for this question if it healthcare-related queries,about symptoms, medications, general health advice and provide to use QuickMed appointment booking website to coonect with best doctor and healthcare professionals.";
      const messageToSend = userMessage + additionalText;
      appendMessage('user', userMessage);
      setUserMessage('');
      getBotResponse(messageToSend);
      window.scrollTo(0, document.body.scrollHeight);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex items-start justify-center h-screen bg-pink-100 pt-5 pb-1">
      <div className="chatbot-container flex flex-col w-full max-w-3xl min-h-[100%] max-h-[100%] bg-white rounded-lg shadow-md border border-gray-300 mx-1 sm:mx-4 md:mx-8 lg:mx-16">
        <header className="chatbox-header bg-pink-200 p-6 rounded-t-lg border-b border-gray-200 sticky top-0">
          <h1 className="text-3xl font-semibold text-gray-800">
            MedAi
          </h1>
        </header>
  
        <div
          className="chatbox flex-1 p-6 bg-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-pink-100"
          ref={chatBoxRef}
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'} my-2`}>
              <div
                className={`chat-message ${msg.sender} p-4 rounded-lg max-w-[90%] sm:max-w-[80%] break-words shadow-sm ${
                  msg.sender === 'bot' ? 'bg-pink-50 text-gray-700' : 'bg-pink-300 text-gray-800'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}
        </div>
  
        <div className="chat-input-container bg-white p-4 flex items-center border-t border-gray-200 sticky bottom-0">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="chat-input flex-1 p-3 rounded-lg bg-gray-100 text-gray-700 outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Type a message..."
          />
          <button
            className="chat-send bg-pink-400 text-white p-3 rounded-lg ml-3 hover:bg-pink-500 transition-all"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );     
};  

export default Chatbot;