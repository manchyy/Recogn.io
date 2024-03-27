import styles from './App.module.css';
import './ChartStyles.css'
import { ListItemText, Typography } from '@suid/material';
import { 
    List,
    ListItem,
    ListItemIcon,
    CircularProgress
  } from "@suid/material"
import { SolidApexCharts } from 'solid-apexcharts';
import { createSignal, onMount } from 'solid-js';
import ManIcon from '@suid/icons-material/Man';
import AccessTimeIcon from '@suid/icons-material/AccessTime';
import WomanIcon from '@suid/icons-material/Woman';

let videoFeedLink = "http://127.0.0.1:5000/video_feed"
function VideoFeed() {
  return(
  <img 
  src={videoFeedLink}
  style={{ width: '600px', height: '280px'}} 
  class={styles.img} 
  alt="video feed">
  </img>
  )
}

const DataFetcher = () => {
    const [loading, setLoading] = createSignal(true)
    const [persons, setPersons] = createSignal([]);

    const [GenderCollection, setGenderCollection] = createSignal({Male:0, Female:0})
    const [totalTimeWatchedPerGender, setTotalTimeWatchedPerGender] = createSignal({Male: 0, Female: 0});
    const [ageGroupCollection, setAgeGroupCollection] = createSignal({
        "18-29":0,
        "30-39":0,
        "40-49":0,
        "50-59":0,
        "60-69":0,
        "70-79":0,
        "80+":0,
    })
    const [monthActivityCollection, setMonthActivityCollection] = createSignal({
        "January":0,
        "February":0,
        "March":0,
        "April":0,
        "May":0,
        "June":0,
        "July":0,
        "August":0,
        "September":0,
        "October":0,
        "November":0,
        "December":0,
    })

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

            const newAgeGroupCollection = {
                "18-29":0,
                "30-39":0,
                "40-49":0,
                "50-59":0,
                "60-69":0,
                "70-79":0,
                "80+":0,
            }

            const newMonthActivityCollection = {
                "January":0,
                "February":0,
                "March":0,
                "April":0,
                "May":0,
                "June":0,
                "July":0,
                "August":0,
                "September":0,
                "October":0,
                "November":0,
                "December":0
            }
            
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
                if (person.age <= 29) {
                    newAgeGroupCollection['18-29']++;
                } else if (person.age <= 39) {
                    newAgeGroupCollection['30-39']++;
                } else if (person.age <= 49) {
                    newAgeGroupCollection['40-49']++;
                } else if (person.age <= 59) {
                    newAgeGroupCollection['50-59']++;
                } else if (person.age <= 69) {
                    newAgeGroupCollection['60-69']++;
                } else if (person.age <= 79) {
                    newAgeGroupCollection['70-79']++;
                } else {
                    newAgeGroupCollection['80+']++;
                }

                const month = new Date(person.date).getMonth();
                const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
                newMonthActivityCollection[monthName]++;

                setGenderCollection(newGenderCollection)
                setTotalTimeWatchedPerGender(newTotalTimeWatchedPerGender);
                setAgeGroupCollection(newAgeGroupCollection);
                setMonthActivityCollection(newMonthActivityCollection);
            })
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        
        setLoading(false);
    });

    const chartTheme = {
        mode: 'dark',
        palette: 'palette3',
        monochrome: {
            enabled: true,
            color: '#49CAE4',
            shadeTo: 'light',
            shadeIntensity: 1
        },
    }
    const chartTooltip = {
        enabled: true,
        theme: 'dark',
    }
    
    return (
        <div>
            {loading() ? (
                <div>
                    <CircularProgress />
                </div>
            ) : (
                <div class={styles.bybys}>
                    <Typography variant='h3' sx={{my:5}}>Backend Relay</Typography>
                    <div class={styles.cameradata}>
                        <VideoFeed/>
                        <div class={styles.rawdata}>

                        <Typography variant="h4">Statistics</Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon sx={{color:"white"}}>
                                    <ManIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={'Male Count: '+GenderCollection().Male}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon sx={{color:"white"}}>
                                    <AccessTimeIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={'Male Time Watched: '+totalTimeWatchedPerGender().Male  + ' seconds'
                                }
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon sx={{color:"white"}}>
                                    <WomanIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={'Female Count: '+GenderCollection().Female}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon sx={{color:"white"}}>
                                    <AccessTimeIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={'Female Time Watched: '+
                                    totalTimeWatchedPerGender().Female + ' seconds'
                                    }
                                />
                            </ListItem>
                        </List>
                        </div>
                    </div>

                    <Typography variant='h3'  sx={{my:5}}>Data Visualization</Typography>
                    {/* gender distribution chart */}
                    <div class='apexcharts-canvas'>
                        <SolidApexCharts 
                            width="600" 
                            height="300"
                            type="pie" 
                            series={[GenderCollection().Male, GenderCollection().Female]}
                            options= { {
                                title: {
                                    text: 'Gender Distribution',
                                    align: 'center'
                                },
                                labels:['Male','Female'],
                                theme: chartTheme,
                                tooltip: chartTooltip,
                            }}
                        />

                        {/* gender time watched comparison chart */}
                        <SolidApexCharts 
                            width="600" 
                            type="bar" 
                            series={[{
                                name: 'Total Time Watched',
                                data: [totalTimeWatchedPerGender().Male, totalTimeWatchedPerGender().Female]
                            }]}
                            options= { {
                                title: {
                                    text: 'Time Watched (seconds)',
                                    align: 'center',
                                    style: {
                                        color: '#FFFFFF'
                                    }
                                },
                                xaxis: {
                                    categories: ['Male','Female']
                                },
                                // colors: ['#', '#49CAE4'],
                                theme: chartTheme,
                                tooltip: chartTooltip,
                            }}
                        />
                        {/* age demographic chart */}
                        <SolidApexCharts 
                            width="600" 
                            type="bar" 
                            series={[{
                                name: 'People recorded',
                                data: [
                                    { x: '18-29', y: ageGroupCollection()['18-29'] || 0 },
                                    { x: '30-39', y: ageGroupCollection()['30-39'] || 0 },
                                    { x: '40-49', y: ageGroupCollection()['40-49'] || 0 },
                                    { x: '50-59', y: ageGroupCollection()['50-59'] || 0 },
                                    { x: '60-69', y: ageGroupCollection()['60-69'] || 0 },
                                    { x: '70-79', y: ageGroupCollection()['70-79'] || 0 },
                                    { x: '80+', y: ageGroupCollection()['80+'] || 0 },
                                ]
                            }]}
                            options= {{
                                theme: chartTheme,
                                tooltip: chartTooltip,
                                xaxis: {
                                    categories: ['18-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'],
                                },
                                title: {
                                    text: 'Age Group Distribution',
                                    align: 'center'
                                },
                                yaxis: {
                                    title: {
                                        text: 'Count'
                                    }
                                }
                            }}
                        />
                        
                        {/* activity per month chart */}
                        <SolidApexCharts 
                            width="600" 
                            type="line" 
                            series={[{
                                name: 'Activity',
                                data: [
                                    { x: '2023-01', y: monthActivityCollection().January || 0 },
                                    { x: '2023-02', y: monthActivityCollection().February || 0 },
                                    { x: '2023-03', y: monthActivityCollection().March || 0 },
                                    { x: '2023-04', y: monthActivityCollection().April || 0 },
                                    { x: '2023-05', y: monthActivityCollection().May || 0 },
                                    { x: '2023-06', y: monthActivityCollection().June || 0 },
                                    { x: '2023-07', y: monthActivityCollection().July || 0 },
                                    { x: '2023-08', y: monthActivityCollection().August || 0 },
                                    { x: '2023-09', y: monthActivityCollection().September || 0 },
                                    { x: '2023-10', y: monthActivityCollection().October || 0 },
                                    { x: '2023-11', y: monthActivityCollection().November || 0 },
                                    { x: '2023-12', y: monthActivityCollection().December || 0 },
                                ]
                            }]}
                            options= {{
                                theme: chartTheme,
                                tooltip: chartTooltip,
                                xaxis: {
                                    type: 'datetime',
                                    categories: [
                                        '2023-01',
                                        '2023-02',
                                        '2023-03',
                                        '2023-04',
                                        '2023-05',
                                        '2023-06',
                                        '2023-07',
                                        '2023-08',
                                        '2023-09',
                                        '2023-10',
                                        '2023-11',
                                        '2023-12',
                                    ],
                                },
                                title: {
                                    text: 'Activity per Month',
                                    align: 'center'
                                },
                                yaxis: {
                                    title: {
                                        text: 'Activity Count'
                                    }
                                }
                            }}
                        />
                    </div>

           
                </div>
            )}
        </div>
    );
};

  
function Content() {
    return (
        <div class={styles.content}>
         <DataFetcher />
        </div>
    );
}

export default Content;