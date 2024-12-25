import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export const ResponceLoading = () => {
  return (
    <div className='bg-neutral-900 text-white p-4 rounded-3xl text-xl mr-20 mt-4'>
        <Skeleton count={5} />
    </div> 
  )
}
