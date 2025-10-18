import { special_characters } from "./Global_variables"
import Person1 from '../../public/images/Person1.png'
import Person2 from '../../public/images/Person2.png'
import Person3 from '../../public/images/Person3.png'
import Person4 from '../../public/images/person4.png'
import Person5 from '../../public/images/person5.png'
// import Person6 from '../../public/images/pointingUpwardPerson.png'
import Group1 from '../../public/images/group1.png'
import Group2 from '../../public/images/group2.png'
import Group3 from '../../public/images/group3.png'
import Group4 from '../../public/images/group4.png'
import Group5 from '../../public/images/group5.png'
import Avatar1 from '../../public/images/avatar1.png'
import Avatar2 from '../../public/images/avatar2.png'
import Avatar3 from '../../public/images/avatar3.png'
import Avatar4 from '../../public/images/avatar4.png'
import Avatar5 from '../../public/images/avatar5.png'
import Avatar6 from '../../public/images/avatar6.png'
import Avatar7 from '../../public/images/avatar7.png'
import Avatar8 from '../../public/images/avatar8.png'
import Avatar9 from '../../public/images/avatar9.png'
import Avatar10 from '../../public/images/avatar10.png'
import { quotes } from "@/Sample_Data/Quotes"

import winter from '../../public/images/winter-season.png'
import sunny from '../../public/images/sunny-season.png'
import fall from '../../public/images/fall-season.png'
// import rainy from '../../public/images/rainy-season.png'

let PersonArray = [Person1, Person2, Person3, Person4, Person5];
let AvatarArray = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5, Avatar6, Avatar7, Avatar8, Avatar9, Avatar10]
let GroupArray = [Group1, Group2, Group3, Group4, Group5]
let SeasonArray = [winter, sunny, fall]

export function randomSeason(){
  const randomNumber = Math.floor(Math.random() * SeasonArray.length);
  return SeasonArray[randomNumber].src
}

const learning_quotes = quotes

export function randomQuotes(){
  const randomNumber = Math.floor(Math.random() * quotes.length);
  return learning_quotes[randomNumber]
}

export function standardizeTime(time){
  const fooTime = new Date(time).toTimeString().split(' ')[0];
  return fooTime
}

export const convertTo12HourFormat = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export function randomPerson() {
    // Generate a random index between 0 and the length of the array - 1
    const randomNumber = Math.floor(Math.random() * PersonArray.length);
    return PersonArray[randomNumber].src;
}

export function randomAvatar(){
    const randomNumber = Math.floor(Math.random() * AvatarArray.length);
    return AvatarArray[randomNumber].src;
}

export function groupImage(index:number) {
  // Generate a random index between 0 and the length of the array - 1
  const modolus = index%GroupArray.length;
  return GroupArray[modolus].src;
}

export function fixedSeriesAvatar(index:number){
  const modolus = index%AvatarArray.length;
  return AvatarArray[modolus].src;
}

export function randomGroupImage() {
  // Generate a random index between 0 and the length of the array - 1
  const randomNumber = Math.floor(Math.random() * GroupArray.length);
  return GroupArray[randomNumber].src;
}

//used to combat SQL Injection via eliminating entries w/ special characters ensuring regex entries.
export const validateRegex = (string: string) => {
  let chars = string.split('');
  
  // Use some to check if any char matches a special character
  return chars.some(char => special_characters.includes(char));
}

export const extractFirstnameLastnameFromEmail = (email:string)=>{
  let splitted_email = email.split('@')
  let full_name = splitted_email[0]
  let splitted_fullname = full_name.split('.')
  let firstname = splitted_fullname[0]
  let lastname = splitted_fullname[1]
  return [firstname,lastname]
}


//capitalizes the first letter of a given string
export const capitalizeFirstLetter = (text:string|undefined|null) =>{
  return `${text?.charAt(0).toUpperCase()}${text?.slice(1)}`
}

export function setMinTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0'); // Get current hours
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Get current minutes
  const currentTime = `${hours}:${minutes}`; // Format as HH:MM

  return currentTime
}

export function convertToTime(expirationTime){
  if(expirationTime){
      const time = expirationTime.split(':').map(Number);
      const date = new Date();
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      const baseTimestamp = date.getTime();
      const mills = (time[0] * 60 * 60 * 1000) + (time[1] * 60 * 1000) + (time[2] * 1000);
      const expirationTimestamp = baseTimestamp + mills;
      return expirationTimestamp;
  }
}

export function millisecondsToHMS(milliseconds, setDifference) {
  if(milliseconds){
      // Calculate total seconds
      const totalSeconds = Math.floor(milliseconds  - Date.now());
      
      // Calculate hours, minutes, and seconds
      const hours = Math.floor(totalSeconds / 3600000);
      const minutes = Math.floor((totalSeconds % 3600000) / 60000);
      const seconds = Math.floor((totalSeconds % 60000)/1000);

      // Format to HH:MM:SS
      const formattedTime = [
          String(hours).padStart(2, '0'),
          String(minutes).padStart(2, '0'),
          String(seconds).padStart(2, '0')
      ].join(':');
      setDifference(formattedTime);
  }
}

export function isPastTime(time:number){
  const now = new Date().getTime()
  console.log(time)
  return time < now;
}


export function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
  };
}