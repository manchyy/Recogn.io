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
import { createSignal } from 'solid-js';

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

function createData(
    name,
    calories,
    fat,
    carbs,
    protein
    ){
    return { name, calories, fat, carbs, protein };
}

const rows = [
    createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
    createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
    createData("Eclair", 262, 16.0, 24, 6.0),
    createData("Cupcake", 305, 3.7, 67, 4.3),
    createData("Gingerbread", 356, 16.0, 49, 3.9),
];  

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


function Content() {
    return (
        <div class={styles.content}>
            <Typography variant='h4'>Backend Relay</Typography>
            <VideoFeed/>
            <Divider sx={{width:'100%', backgroundColor:'white', marginTop:'5px', marginBottom:'5px'}} />

            <SolidApexCharts width="300" type="bar" options={options()} series={series()} />

            {/* <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mapArray(
            () => rows,
            (row) => (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer> */}
        </div>
    )
}

export default Content;