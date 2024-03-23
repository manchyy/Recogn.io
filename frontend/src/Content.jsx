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
import { createEffect, mapArray } from 'solid-js';
import { SolidApexCharts } from 'solid-apexcharts';
import { createSignal, onMount, createResource } from 'solid-js';

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

const DataFetcher = () => {
    const [loading, setLoading] = createSignal(true)
    const [persons, setPersons] = createSignal([]);

    const [GenderCollection, setGenderCollection] = createSignal({Male:0, Female:0})
    const [TimeWatchedCollection, setTimeWatchedCollection] = createSignal([])
    const [totalTimeWatchedPerGender, setTotalTimeWatchedPerGender] = createSignal({Male: 0, Female: 0});

    const AgeCollection = {}
    const totalTimeWatched = {}

    //fetch data from API
    onMount(async () => {
        try {
            const res = await fetch('http://localhost:3001/api/persons');
            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }
            const personData = await res.json();
            setPersons(personData);

            const newGenderCollection = {
                Male: 0,
                Female: 0
            }
            const newTotalTimeWatchedPerGender = {
                Male: 0,
                Female: 0
            };
            
            //record data locally to manipulate later
            personData.forEach(person => {
                //Count genders=
                if(person.gender === 'Male') {
                    newGenderCollection.Male++;
                    newTotalTimeWatchedPerGender.Male += person.timeWatched;
                }
                else {
                    newGenderCollection.Female++;
                    newTotalTimeWatchedPerGender.Female += person.timeWatched;
                }
                //Count ages
                AgeCollection[person.age] = (AgeCollection[person.age] || 0) + 1;
                // Count timeWatched
                totalTimeWatched[person.timeWatched] = (totalTimeWatched[person.timeWatched] || 0) + 1;    
            
                setGenderCollection(newGenderCollection)
                setTimeWatchedCollection(totalTimeWatched)
                setTotalTimeWatchedPerGender(newTotalTimeWatchedPerGender);
            })
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        createEffect(() => {
            console.log('GenderCollection changed', GenderCollection())
        })

        //debug
        // console.log('age', AgeCollection)
        // console.log('gender count: ',GenderCollection)
        // console.log('timewatched',totalTimeWatched)
        // console.log('LOGGING GENDERS ',GenderCollection().Male)
        setLoading(false);
    });

    const [options] = createSignal({
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
        },
      });
      const [series] = createSignal([
        {
          name: 'series-1',
          data: [30, 40, 35, 50, 49, 60, 70, 91],
        },
      ]);
    
    return (
        <div>
            <h1>People List</h1>
            {loading() ? (
                <div>Loading...</div>
            ) : (
                <div>
                    Males: {GenderCollection().Male}
                    <br></br>
                    Females: {GenderCollection().Female}
                    <br></br>
                    Total Time Watched - Males: {Math.round(totalTimeWatchedPerGender().Male)} seconds<br/>
                    Total Time Watched - Females: {Math.round(totalTimeWatchedPerGender().Female)} seconds

                    {/* gender distribution chart */}
                    <Typography>Gender Distribution</Typography>
                    <SolidApexCharts 
                        width="300" 
                        type="pie" 
                        series={[GenderCollection().Male, GenderCollection().Female]}
                        options= { {
                            labels:['Male','Female']
                        }}
                    />

                    {/* gender time watched comparison chart */}
                    <Typography>Time Watched per Gender (seconds)</Typography>
                    <SolidApexCharts 
                        width="300" 
                        type="pie" 
                        series={[totalTimeWatchedPerGender().Male, totalTimeWatchedPerGender().Female]}
                        options= { {
                            labels:['Male','Female']
                        }}
                    />
           
                </div>
            )}
        </div>
    );
    

    // return (
    //     <div>
    //         <h1>People List</h1>
    //         <ul>
    //             {persons().map(person => (
    //                 <li key={person._id}>
    //                     Date: {person.date} <br/>
    //                     Gender: {person.gender}<br/>
    //                     Age: {person.age}<br/>
    //                     Time Watched: {person.timeWatched}<br/>
    //                 </li>
    //             ))}
    //         </ul>
    //     </div>
    // );
};

  
function Content() {
    return (
        <div class={styles.content}>
            <Typography variant='h4'>Backend Relay</Typography>
            <VideoFeed/>
            <Divider sx={{width:'100%', backgroundColor:'white', marginTop:'5px', marginBottom:'5px'}} />

            {/* <SolidApexCharts width="300" type="bar" options={options()} series={series()} /> */}
           
            <DataFetcher />
        </div>
    );
}

export default Content;