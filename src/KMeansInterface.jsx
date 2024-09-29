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
    const [manualCentroids, setManualCentroids] = React.useState([])
    
    const [prevCentroids, setPrevCentroids] = React.useState([])

    const [plotlyInstance, setPlotlyInstance] = React.useState(null);
    const [iterations, setIterations] = React.useState([{x: centroids.map(centroid => centroid[0]), y: centroids.map(centroid => centroid[1])}])
    const [allPointClassifications, setAllPointClassifications] = React.useState(Array.from({ length: iterations.length }, () => Array.from({ length: data.length }, () => 'grey')))
    const [curIteration, setCurIteration] = React.useState(0)
    
    React.useEffect(() => {
        setMin([Math.min(...(data.x)), Math.min(...(data.y))]);
        setMax([Math.max(...(data.x)), Math.max(...(data.y))]);
    }, [data]);
    
    const handleMenuChange = (event) => {
        setInitMethod(event.target.value);
        var localCentroids = initializeCentroids(data, clusterNum, event.target.value)
        var localIterations = [{x: localCentroids.map(centroid => centroid[0]), y: localCentroids.map(centroid => centroid[1])}]
        setIterations(localIterations)
        setAllPointClassifications((Array.from({ length: localIterations.length }, () => Array.from({ length: 150 }, () => 'grey'))))
        setCurIteration(0)
        //Run Kmeans
        if (event.target.value !== "Manual") {
            runKMeans(data, localCentroids, localIterations, clusterNum)
        }
    };

    function initializeCentroids(data, clusterNum, method) {

        function isPointInCentroids(x, y, centroids) {
            return centroids.some(centroid => centroid[0] === x && centroid[1] === y);
        }

        function squaredEuclidean(point1, point2) {
            return (point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2;
        }
        function weightedRandomSelection(probabilities) {
            let cumulativeSum = 0;
            const random = Math.random();
        
            for (let i = 0; i < probabilities.length; i++) {
                cumulativeSum += probabilities[i];
                if (random <= cumulativeSum) {
                    return i;
                }
            }
        }

        var localCentroids = []
        const firstCentroidIdx = Math.floor(Math.random() * 150);
        setManualCentroids([])
        switch (method) {
            case "Random":
                console.log("ranomd")
                var min = [Math.min(...(data.x)), Math.min(...(data.y))]
                var max = [Math.max(...(data.x)), Math.max(...(data.y))]
                setMin(min)
                setMax(max)
                localCentroids = Array.from({ length: clusterNum }, () => uniform(min, max))
                break;
            case "Farthest First":
                console.log("far")
                localCentroids.push([data.x[firstCentroidIdx], data.y[firstCentroidIdx]]);
                for (let i = 1; i < clusterNum; i++) {
                    // Find the point that is farthest from the existing centroids
                    var allDistances = []
                    for (let i=0; i < data['x'].length; i++) {
                        if (!isPointInCentroids(data.x[i], data.y[i], localCentroids)) {
                            var distances = euclidean([data.x[i], data.y[i]], localCentroids)
                            var centroidIndex = distances.indexOf(Math.max(...distances))
                            allDistances.push(distances[centroidIndex])
                        }
                    }
                    const nextCentroidIndex = allDistances.indexOf(Math.max(...allDistances))
                    localCentroids.push([data.x[nextCentroidIndex], data.y[nextCentroidIndex]]);
                }
                console.log(localCentroids)
                break;
            case "KMeans++":
                console.log("plus")
                localCentroids.push([data.x[firstCentroidIdx], data.y[firstCentroidIdx]]);
                for (let i = 1; i < clusterNum; i++) {
                    // Array to store the distance of each point to the nearest centroid
                    const distances = [];
            
                    // For each data point, calculate the distance to the nearest centroid
                    for (let j = 0; j < data['x'].length; j++) {
                        const currentPoint = [data.x[j], data.y[j]];
            
                        // Find the minimum distance to any of the centroids
                        const minDistance = localCentroids.reduce((minDist, centroid) => {
                            const dist = squaredEuclidean(currentPoint, centroid);
                            return Math.min(minDist, dist);
                        }, Infinity);
            
                        distances.push(minDistance);
                    }
            
                    // Step 3: Select the next centroid with a probability proportional to the distance squared
                    const sumDistances = distances.reduce((acc, dist) => acc + dist, 0);
                    const probabilities = distances.map(dist => dist / sumDistances);
            
                    // Select a new centroid based on the computed probabilities
                    const nextCentroidIndex = weightedRandomSelection(probabilities);
                    localCentroids.push([data.x[nextCentroidIndex], data.y[nextCentroidIndex]]);
                }
                break;
            case "Manual":
                console.log("man")
                break;
            default:
                break;
        }
        setCentroids(localCentroids)
        return localCentroids
    }

    const handleStepThrough = (e) => {
        if (curIteration > iterations.length && centroids.length > 0) {
            alert("Converged")
        } else {
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
        var localCentroids = initializeCentroids(localData, clusterNum, initMethod)
        setPrevCentroids([])
        var localIterations = [{x: localCentroids.map(centroid => centroid[0]), y: localCentroids.map(centroid => centroid[1])}]
        setIterations(localIterations)
        setCurIteration(0)
        if (initMethod !== "Manual") {
            runKMeans(localData, localCentroids, localIterations, clusterNum)
        }
        // console.log(data)
    }

    const handleConvergence = (e) => {
        console.log("converge")
        console.log(iterations.map( (iteration, idx) => `Iteration ${idx + 1}`).slice(curIteration),)
        console.log(allPointClassifications)
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
                // console.log(distances)
                var centroidIndex = distances.indexOf(Math.min(...distances))
                // console.log(centroidIndex)
                pointClassifications[centroidIndex].push([data.x[i], data.y[i]])
                colourPointClassification.push(centroidIndex)
            }
            // console.log(pointClassifications)
            allIterationPointClassifications.push(colourPointClassification)
            localPrevCentroids = localCentroids
            localCentroids = pointClassifications.map(cluster => calculateMean(cluster))
            // console.log(localCentroids)
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
        setAllPointClassifications(allIterationPointClassifications)
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
        return data.map((dataPoint, dataPointIdx) => {
            // const squaredDifferences = dataPoint.map((value, index) => { console.log(data, dataPoint, value, index); return (value - point[index]) ** 2});
            // console.log(squaredDifferences)
            const squaredDifferences = dataPoint.map((value, index) =>  (value - point[index]) ** 2);
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
        if (initMethod === "Manual") {
            console.log("runrunr")
            setCentroids([])
            setManualCentroids([])
            var localIterations = [{x: [].map(centroid => centroid[0]), y: [].map(centroid => centroid[1])}]
            setIterations(localIterations)
            setAllPointClassifications((Array.from({ length: localIterations.length }, () => Array.from({ length: 150 }, () => 'grey'))))
            setCurIteration(0)
        } else {
            setIterations(iterations) 
        }
    }

    const handleGraphClick = (event) => {
        if (!plotlyInstance || initMethod !== "Manual" || centroids.length >= +clusterNum ) {return; }
        const { left, top, width, height } = plotlyInstance.getBoundingClientRect();
    
        // Get the current axis ranges from the layout
        const xRange = [0,10];
        const yRange = [0,10];
    
        // Get the pixel coordinates where the user clicked
        const clickX = event.clientX - left;
        const clickY = event.clientY - top;
    
        // Convert pixel position to data space (x, y coordinates)
        const x = xRange[0] + (clickX / width) * (xRange[1] - xRange[0]);
        const y = yRange[1] - (clickY / height) * (yRange[1] - yRange[0]);
        console.log(x,y)
        // Add the new point to the state
        var tempCentroids = manualCentroids
        tempCentroids.push([x,y])
        setManualCentroids(tempCentroids)
        setCentroids(tempCentroids)
        var localIterations = [{x: tempCentroids.map(centroid => centroid[0]), y: tempCentroids.map(centroid => centroid[1])}]
        setIterations(localIterations)
        setCurIteration(0)
        runKMeans(data, tempCentroids, localIterations, tempCentroids.length)
        console.log(allPointClassifications)
      };

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
                        var localCentroids = initializeCentroids(data, e.target.value, initMethod)
                        var localIterations = [{x: localCentroids.map(centroid => centroid[0]), y: localCentroids.map(centroid => centroid[1])}]
                        setIterations(localIterations)
                        setAllPointClassifications((Array.from({ length: localIterations.length }, () => Array.from({ length: 150 }, () => 'grey'))))
                        setCurIteration(0)
                        //Run Kmeans
                        if (initMethod !== "Manual") {
                            runKMeans(data, localCentroids, localIterations, e.target.value)
                        }
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
            <KMeans data={data} pointClassifications={allPointClassifications} setPlotlyInstance={setPlotlyInstance} iterations={iterations} initMethod={initMethod} handleGraphClick={handleGraphClick}/>
        </div>
        
    )
}


export default Interface