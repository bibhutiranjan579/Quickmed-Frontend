import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns'; 

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [isVideoConsultation, setIsVideoConsultation] = useState(false); // Renamed state
  const [isAppointment, setIsAppointment] = useState(false); // Renamed state

  const clearForm = () => {
    setSlotTime('');
    setSlotIndex(0);
    setIsVideoConsultation(false);
    setIsAppointment(false);
  };

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId);
    setDocInfo(docInfo);
    console.log(docInfo);
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(17, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const isSlotAvailable = !(docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(formattedTime));

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          });
        }
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      setDocSlots(prev => ([...prev, timeSlots]));
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to request appointment!');
      return navigate('/login');
    }
    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;
      const formattedDate = format(date, 'EEEE, MMMM do, yyyy');

      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime, isVideoConsultation, isAppointment },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(`Appointment booked for ${formattedDate} at ${slotTime}`);
        getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  return docInfo && (
    <div>
      {/* ---Doctor Details--- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-500'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-500'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-500 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-700'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* ---Booking Slots--- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-500'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-400'} `} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='mt-4'>
          <select
            onChange={(e) => setSlotTime(e.target.value)}
            value={slotTime}
            className={`text-medium font-medium rounded-full px-4 py-2 ${slotTime ? 'bg-primary text-white border-transparent' : 'bg-white text-gray-500'}`}>
            <option value="" disabled>Select a time</option>
            {docSlots.length > 0 && docSlots[slotIndex].map((item, index) => (
              <option key={index} value={item.time}>
                {item.time.toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* ---New Booking Options--- */}
        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isVideoConsultation}
              onChange={() => {
                setIsVideoConsultation(prev => !prev);
                if (!prev) setIsAppointment(false); // Ensure only one is selected
              }}
            />
            Video Consultation
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAppointment}
              onChange={() => {
                setIsAppointment(prev => !prev);
                if (!prev) setIsVideoConsultation(false); // Ensure only one is selected
              }}
            />
            Appointment
          </label>
        </div>

        <button onClick={bookAppointment} className='bg-white text-gray-500 border border-gray-400 px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Request an appointment</button>
        <button onClick={clearForm} className='bg-white text-gray-500 border border-gray-400 px-8 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all my-6 ml-8'> Clear </button>
      </div>

      {/* ---Related Doctors--- */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;