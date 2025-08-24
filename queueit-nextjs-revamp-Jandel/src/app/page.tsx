import logo from '../../public/images/logo.png'
import star from '../../public/images/star.png'
import squiggly from '../../public/images/squiggly.png'
import meeting from '../../public/images/meeting.png'
import { Typography } from '@mui/material';


export default function Home() {
  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <div className="z-0 absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem]">
        <img style={{position:'absolute', height:'8dvw', transform:'translate(-50%,-50%)', top:'20%', left:'50%'}} src={star.src} alt="star" />
        <img style={{position:'absolute', height:'24dvw', transform:'translate(0%,-50%)', top:'88%', left:'0%'}} src={squiggly.src} alt="star" />
        <img style={{position:'absolute', height:'50dvw', transform:'translate(-50%,20%)', bottom:'10%', left:'70%'}} src={meeting.src} alt="star" />
      </div>
      <div className="p-10 flex justify-between items-center relative" style={{zIndex:1}}>
        <img src={logo.src} alt="logo" style={{height:'8dvh'}} />
        <span className='flex-grow flex flex-col md:flex-row lg:flex-row xl:flex-row items-center gap-2 justify-end font-bold' style={{fontSize:'clamp(0.8em, 0.5dvw + 0.8em, 1em)'}}>Don't have an account? <a href='/' style={{color:'#7D57FC', textDecoration:'underline'}}>Register Now!</a></span>
      </div>
      <div className='relative w-screen md:w-1/2 lg:w-1/2 xl:w-1/2 p-5'>
        <Typography sx={{fontSize:'clamp(2em, 7dvw + 2em, 5.5em)'}} fontWeight='bold'>Organize Your Workflow</Typography>
        <Typography sx={{fontSize:'clamp(1em, 0.3dvw + 1em, 1.5em)', width:'70%'}}>Simplify project progress tracking with streamlined and easified queueing management.</Typography>
        <div style={{marginTop:'40px'}}><a href='/login' style={{backgroundColor:'#CCFC57', border:'solid 1px black', color:'black', borderRadius:'15px', padding:'0.5em 3em'}}>Login</a></div>
      </div>
    </div>
  );
}
