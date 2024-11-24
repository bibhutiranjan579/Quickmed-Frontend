import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability ,deletedoctor} = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  return (
    <div className='m-5 max-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>DOCTORS</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          doctors.map((item, index) => (
            <div className='border border-pink-300 rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={index}>
              <img className='bg-pink-50 group-hover:bg-primary transition-all duration-500' src={item.image} alt="" />
              <div className='p-4'>
                <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
                <p className='text-zinc-600 text-sm'>{item.speciality}</p>
               
                  <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
                  <p>Available</p>

                  <div className='mt-2 flex items-center gap-1 text-sm'>
  <button 
    onClick={() => deletedoctor(item._id)} 
    className='text-red-600 hover:text-red-800 focus:outline-none'
  >
    Delete
  </button>
</div>
              </div>
 

            </div>
          ))
        }
      </div>

    </div>
  )
}

export default DoctorList