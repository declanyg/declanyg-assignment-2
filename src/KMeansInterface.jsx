import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import RestartIcon from '@mui/icons-material/RestartAlt';
import PlayArrow from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import SparkleIcon from '@mui/icons-material/AutoAwesome';

import KMeans from './KMeansDisplay';


const Interface = () => {
    
    const [clusterNum, setClusterNum] = React.useState(0)
    const [initMethod, setInitMethod] = React.useState('');

    const handleMenuChange = (event) => {
        setInitMethod(event.target.value);
    };

    return (
        <div className='space-y-6 justify-center flex flex-col items-center'>
            <div className='mt-8 flex flex-row space-x-6'>
                {/* <p className='text-white text-2xl mb-2'>Number of Clusters (k):</p> */}
                <TextField
                    id="outlined-number"
                    label="Number of Clusters (k)"
                    type="number"
                    variant="outlined"
                    onChange={(val) => setClusterNum(val)}
                />
                <Box sx={{ minWidth: 200 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Initialization Method</InputLabel>
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={initMethod}
                        label="Initialization Method"
                        defaultValue='Random'
                        onChange={handleMenuChange}
                        >
                        <MenuItem value={"Random"}>Random</MenuItem>
                        <MenuItem value={"Farthest First"}>Farthest First</MenuItem>
                        <MenuItem value={"KMeans++"}>KMeans++</MenuItem>
                        <MenuItem value={"Manual"}>Manual</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Button variant="outlined" endIcon={<PlayArrow/>}>Step Through KMeans</Button>
                <Button variant="outlined" endIcon={<FastForwardIcon/>}>Run to Convergence</Button>
                <Button variant="outlined" endIcon={<SparkleIcon/>}>Generate New Dataset</Button>
                <Button variant="outlined" endIcon={<RestartIcon/>}>Reset Algorithm</Button>
            </div>
            <KMeans/>
        </div>
        
    )
}


export default Interface