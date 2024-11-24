import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import stripePromise from '../utils/stripe';

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);

  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const appointmentStripe = async (appointmentId) => {
    console.log('Attempting to make payment for appointment ID:', appointmentId);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/payment-stripe`, { appointmentId }, { headers: { token } });
      if (data.success) {
        console.log('PaymentIntent session ID:', data.sessionId);
        const stripe = await stripePromise;
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (result.error) {
          console.error('Stripe redirect error:', result.error.message);
        }
      } else {
        console.error('Payment failed:', data.message);
      }
    } catch (error) {
      console.error('Error during payment:', error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-800 border-b'>My Appointments:</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32 bg-pink-100' src={item.docData.image} alt="" />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-neutral-800 font-medium mt-1'>Address</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-1'><span className='text-sm text-neutral-800 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              <p className='text-xs mt-1'><span className='text-sm text-neutral-800 font-medium'>Type:</span> {item.isVideoConsultation ? 'Video Consultation' : 'Regular Appointment'}</p>
              {item.isVideoConsultation && !item.cancelled && <p className='text-blue-500 mt-1'>This is a Video Consultation.</p>}
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>Paid</button>}
              {!item.cancelled && !item.payment && !item.isCompleted && <button onClick={() => appointmentStripe(item._id)} className='text-sm text-stone-600 text-center sm:min-w-48 py-2 border hover:bg-pink-200 hover:text-white transition-all duration-500'>Pay Online</button>}
              {!item.cancelled && !item.payment && <button onClick={() => cancelAppointment(item._id)} className='text-sm text-stone-600 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-500'>Cancel My Appointment</button>}
              {item.cancelled && !item.payment && <button className='sm:min-w-48 py-3 border border-red-600 rounded text-red-500'>Appointment Cancelled</button>}
              {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-400 rounded text-green-400'>Completed</button>}
              {item.isVideoConsultation && !item.cancelled && !item.isCompleted && (
                <button onClick={() => alert('Initiating video call...')} className='text-sm text-center sm:min-w-48 py-2 border bg-blue-100 hover:bg-blue-500 hover:text-white transition-all duration-500'>
                  Start Video Call
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;