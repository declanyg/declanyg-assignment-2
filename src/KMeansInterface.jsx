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
import Plotly from 'plotly.js';


const Interface = () => {

    const [data, setData] = React.useState({x: Array.from({length: 150}, () => Math.random() * 10), y: Array.from({length: 150}, () => Math.random() * 10)})

    const uniform = (min, max) => {
        return min.map((minVal, i) => Math.random() * (max[i] - minVal) + minVal);
    };
    const [min, setMin] = React.useState([Math.min(...(data.x)), Math.min(...(data.y))]);
    const [max, setMax] = React.useState([Math.max(...(data.x)), Math.max(...(data.y))]);
    
    const [clusterNum, setClusterNum] = React.useState(1)
    const [initMethod, setInitMethod] = React.useState('Random');
    const [centroids, setCentroids] = React.useState(Array.from({ length: clusterNum }, () => uniform(min, max)))
    
    const [prevCentroids, setPrevCentroids] = React.useState([])

    const [plotlyInstance, setPlotlyInstance] = React.useState(null);
    const [iterations, setIterations] = React.useState([{x: centroids.map(centroid => centroid[0]), y: centroids.map(centroid => centroid[1])}])
    const [pointClassifications, setPointClassifications] = React.useState(Array.from({ length: iterations.length }, () => Array.from({ length: data.length }, () => 'grey')))
    const [curIteration, setCurIteration] = React.useState(0)


    const [runAnimations, setRunAnimations] = React.useState(false);
    
    React.useEffect(() => {
        setMin([Math.min(...(data.x)), Math.min(...(data.y))]);
        setMax([Math.max(...(data.x)), Math.max(...(data.y))]);
    }, [data]);
    
    const handleMenuChange = (event) => {
        setInitMethod(event.target.value);
    };

    const handleStepThrough = (e) => {
        if (curIteration > iterations.length && centroids.length > 0) {
            alert("Converged")
        } else {
            // kMeansIteration()
            // console.log("step")
            // setRunAnimations(!runAnimations)
            if (plotlyInstance) {
                Plotly.animate(
                  plotlyInstance,
                  [`Iteration ${curIteration+1}`],
                  {
                    frame: { redraw: false },
                    transition: { duration: 500 },
                    fromcurrent: true,
                  }
                );
              }   
            setCurIteration(curIteration+1)
        }
    }

    const handleGenerate = (e) => {
        var localData = {x: Array.from({length: 150}, () => Math.random() * 10), y: Array.from({length: 150}, () => Math.random() * 10)}
        setData(localData)
        setMin([Math.min(...(data.x)), Math.min(...(data.y))])
        setMax([Math.max(...(data.x)), Math.max(...(data.y))])
        var localCentroids = Array.from({ length: clusterNum }, () => uniform(min, max))
        setCentroids(localCentroids);
        setPrevCentroids([])
        var localIterations = [{x: localCentroids.map(centroid => centroid[0]), y: localCentroids.map(centroid => centroid[1])}]
        setIterations(localIterations)
        setCurIteration(0)
        runKMeans(localData, localCentroids, localIterations, clusterNum)
        // console.log(data)
    }

    const handleConvergence = (e) => {
        console.log("converge")
        console.log(iterations.map( (iteration, idx) => `Iteration ${idx + 1}`).slice(curIteration),)
        if (plotlyInstance) {
            Plotly.animate(
              plotlyInstance,
              iterations.map( (iteration, idx) => `Iteration ${idx + 1}`).slice(curIteration),
              {
                frame: { redraw: false },
                transition: { duration: 500 },
                fromcurrent: true,
              }
            );
          }
        setCurIteration(iterations.length - 1)

       
    }

    function runKMeans(data, centroids, iterations, clusterNum) {
        var count = 0
        var localPrevCentroids = prevCentroids
        var localCentroids = centroids
        var localIterations = iterations
        var allIterationPointClassifications = []
        while (!arraysEqual(localPrevCentroids, localCentroids) && count < 300) {
            var pointClassifications = Array.from({ length: clusterNum }, () => [])
            var colourPointClassification = []
            for (let i=0; i < data['x'].length; i++) {
                var distances = euclidean([data.x[i], data.y[i]], localCentroids)
                var centroidIndex = distances.indexOf(Math.min(...distances))
                pointClassifications[centroidIndex].push([data.x[i], data.y[i]])
                colourPointClassification.push(centroidIndex)
            }
            allIterationPointClassifications.push(colourPointClassification)
            localPrevCentroids = localCentroids
            localCentroids = pointClassifications.map(cluster => calculateMean(cluster))
            localCentroids.forEach((centroid, i) => {
                // Check if any value in the centroid array is NaN
                if (centroid.some(value => isNaN(value))) {
                // If there's a NaN, replace the centroid with the corresponding previous centroid
                setCentroids(centroids.map((centroid, i) => {
                    if (centroid.some(value => isNaN(value))) {
                        // Return the previous centroid if NaN is found
                        return prevCentroids[i];
                    } else {
                        // Otherwise, return the centroid unchanged
                        return centroid;
                    }
                }))
                }
            });
            localIterations = [...localIterations, {x: localCentroids.map(centroid => centroid[0]), y: localCentroids.map(centroid => centroid[1])}]
            count++
        }
        setPrevCentroids(localPrevCentroids)
        setCentroids(localCentroids)
        setIterations(localIterations)
        setPointClassifications(allIterationPointClassifications)
        console.log(allIterationPointClassifications)
        console.log(count)
    }

    function calculateMean(points) {
        const numPoints = points.length;
        const numDimensions = 2;  
        
        let mean = new Array(numDimensions).fill(0);
      
        points.forEach(point => {
          point.forEach((value, index) => {
            mean[index] += value;
          });
        });
      
        mean = mean.map(sum => sum / numPoints);
        
        return mean;
      }
    
      function euclidean(point, data) {
        return data.map(dataPoint => {
            const squaredDifferences = dataPoint.map((value, index) => (value - point[index]) ** 2);
            
            const sumOfSquares = squaredDifferences.reduce((acc, curr) => acc + curr, 0);
            
            return Math.sqrt(sumOfSquares);
        });
      }

      function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
    
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].length !== arr2[i].length) return false; 
            for (let j = 0; j < arr1[i].length; j++) {
                if (arr1[i][j] !== arr2[i][j]) return false; 
            }
        }
        return true; 
    }

    const handleReset = (e) => {
        setCurIteration(0)
        setIterations(iterations)  
    }


    return (
        <div className='space-y-6 justify-center flex flex-col items-center'>
            <div className='mt-8 flex flex-row space-x-6'>
                <TextField
                    id="outlined-number"
                    label="Number of Clusters (k)"
                    type="number"
                    variant="outlined"
                    value={clusterNum}
                    onChange={(e) => {
                        setClusterNum(e.target.value); 
                        var localCentroids = Array.from({ length: e.target.value }, () => uniform(min, max))
                        setCentroids(localCentroids);
                        var localIterations = [{x: localCentroids.map(centroid => centroid[0]), y: localCentroids.map(centroid => centroid[1])}]
                        setIterations(localIterations)
                        setPointClassifications((Array.from({ length: localIterations.length }, () => Array.from({ length: 150 }, () => 'grey'))))
                        setCurIteration(0)
                        //Run Kmeans
                        runKMeans(data, localCentroids, localIterations, e.target.value)
                    }}
                    InputProps={{
                        inputProps: {
                          min: 1
                        },
                      }}
                />
                <Box sx={{ minWidth: 200 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Initialization Method</InputLabel>
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={initMethod}
                        label="Initialization Method"
                        defaultValue={'Random'}
                        placeholder={'Random'}
                        onChange={handleMenuChange}
                        >
                        <MenuItem value={"Random"}>Random</MenuItem>
                        <MenuItem value={"Farthest First"}>Farthest First</MenuItem>
                        <MenuItem value={"KMeans++"}>KMeans++</MenuItem>
                        <MenuItem value={"Manual"}>Manual</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Button variant="outlined" endIcon={<PlayArrow/>} onClick={handleStepThrough} disabled={curIteration >= iterations.length -1 && centroids.length > 0}>Step Through KMeans</Button>
                <Button variant="outlined" endIcon={<FastForwardIcon/>} onClick={handleConvergence} disabled={curIteration >= iterations.length -1 && centroids.length > 0}>Run to Convergence</Button>
                <Button variant="outlined" endIcon={<SparkleIcon/>} onClick={handleGenerate}>Generate New Dataset</Button>
                <Button variant="outlined" endIcon={<RestartIcon/>} onClick={handleReset}> Reset Algorithm</Button>
            </div>
            <KMeans data={data} pointClassifications={pointClassifications} setPlotlyInstance={setPlotlyInstance} iterations={iterations} curIteration={curIteration} runAnimations={runAnimations}/>
        </div>
        
    )
}


export default Interface