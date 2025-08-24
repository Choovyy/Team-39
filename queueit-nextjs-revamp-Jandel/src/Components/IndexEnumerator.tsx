import { Typography } from '@mui/material'
import React from 'react'

interface IndexEnumeratorProps{
    index:number
}

const IndexEnumerator:React.FC<IndexEnumeratorProps> = ({index}) => {
  return (
    <div className='h-full w-14 rounded-lg border-2 border-black bg-lgreen py-3'>
        <Typography textAlign={"center"} fontWeight={"bold"} variant='h5'>{index}</Typography>
    </div>
  )
}

export default IndexEnumerator