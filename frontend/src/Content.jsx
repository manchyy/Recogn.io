import styles from './App.module.css';
import { Divider, Typography } from '@suid/material';
import { 
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
  } from "@suid/material"
import { mapArray } from 'solid-js';
import { SolidApexCharts } from 'solid-apexcharts';
import { createSignal, onMount } from 'solid-js';

let videoFeedLink = "http://127.0.0.1:5000/video_feed"
function VideoFeed() {
  return(
  <img 
  src={videoFeedLink}
  style={{ width: '400px', height: '300px'}} 
  class={styles.img} 
  alt="video feed">
  </img>
  )
}

// function createData(
//     name,
//     calories,
//     fat,
//     carbs,
//     protein
//     ){
//     return { name, calories, fat, carbs, protein };
// }

// const rows = [
//     createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
//     createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
//     createData("Eclair", 262, 16.0, 24, 6.0),
//     createData("Cupcake", 305, 3.7, 67, 4.3),
//     createData("Gingerbread", 356, 16.0, 49, 3.9),
// ];  

// const [options] = createSignal({
//     xaxis: {
//       categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
//     },
//   });
//   const [series] = createSignal([
//     {
//       name: 'series-1',
//       data: [30, 40, 35, 50, 49, 60, 70, 91],
//     },
//   ]);

// Define your dataFetcher component
const DataFetcher = () => {
    const [persons, setPersons] = createSignal([]);

    console.log('im executed')

    // Fetch data from API endpoint on component mount
    onMount(async () => {
        try {
            const res = await fetch('http://localhost:3001/api/persons');
            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }
            const personData = await res.json();
            setPersons(personData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });

    return (
        <div>
            <h1>People List</h1>
            <ul>
                {persons().map(person => (
                    <li key={person._id}>
                        Date: {person.date}, Gender: {person.gender}, Age: {person.age}, Time Watched: {person.timeWatched}
                    </li>
                ))}
            </ul>
        </div>
    );
};

  
function Content() {
    return (
        <div class={styles.content}>
            <Typography variant='h4'>Backend Relay</Typography>
            <VideoFeed/>
            <Divider sx={{width:'100%', backgroundColor:'white', marginTop:'5px', marginBottom:'5px'}} />

            <SolidApexCharts width="300" type="bar" options={options()} series={series()} />
           
            <DataFetcher />
        </div>
    );
}

export default Content;