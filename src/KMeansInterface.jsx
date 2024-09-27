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
    
    const [clusterNum, setClusterNum] = React.useState(1)
    const [initMethod, setInitMethod] = React.useState('Random');
    const [data, setData] = React.useState({x: Array.from({length: 150}, () => Math.random() * 10), y: Array.from({length: 150}, () => Math.random() * 10)})
    const [centroids, setCentroids] = React.useState([])
    const [min, setMin] = React.useState([Math.min(...(data.x)), Math.min(...(data.y))]);
    const [max, setMax] = React.useState([Math.max(...(data.x)), Math.max(...(data.y))]);

    const [prevCentroids, setPrevCentroids] = React.useState([])
    // const [pointClassifications, setPointClassifications] = React.useState(new Array(clusterNum).fill().map(() => []))

    const uniform = (min, max) => {
        return min.map((minVal, i) => Math.random() * (max[i] - minVal) + minVal);
    };

    React.useEffect(() => {
        setMin([Math.min(...(data.x)), Math.min(...(data.y))]);
        setMax([Math.max(...(data.x)), Math.max(...(data.y))]);
        // console.log(min, max)
        // console.log(uniform(min, max))
    }, [data]);

    React.useEffect(() => {
        // setCentroids(Array.from({ length: clusterNum }, () => uniform(min, max)));
        // console.log("centroids", centroids)
    }, [centroids]);

    // React.useEffect(() => {
    //     // console.log("point classifications", pointClassifications)
    // }, [pointClassifications]);
    
    const handleMenuChange = (event) => {
        setInitMethod(event.target.value);
    };

    const handleStepThrough = (e) => {
        if (arraysEqual(prevCentroids, centroids) && centroids.length > 0) {
            alert("Converged")
        } else {
            kMeansIteration()
        }
    }

    const handleGenerate = (e) => {
        setData({x: Array.from({length: 150}, () => Math.random() * 10), y: Array.from({length: 150}, () => Math.random() * 10)})
        setCentroids(Array.from({ length: clusterNum }, () => uniform(min, max)));
        setPrevCentroids([])
        // console.log(data)
    }

    const handleConvergence = (e) => {
        var count = 0
        var localPrevCentroids = prevCentroids
        var localCentroids = centroids
        while (!arraysEqual(localPrevCentroids, localCentroids) && count < 300) {
            var pointClassifications = Array.from({ length: clusterNum }, () => [])
            for (let i=0; i < data['x'].length; i++) {
                var distances = euclidean([data.x[i], data.y[i]], localCentroids)
                var centroidIndex = distances.indexOf(Math.min(...distances))
                pointClassifications[centroidIndex].push([data.x[i], data.y[i]])
            }
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
            count++
        }
        setPrevCentroids(localPrevCentroids)
        setCentroids(localCentroids)
        console.log(count)
    }

    function kMeansIteration() {
        var pointClassifications = Array.from({ length: clusterNum }, () => [])
        // var curPointClassifications = pointClassifications
        for (let i=0; i < data['x'].length; i++) {
            var distances = euclidean([data.x[i], data.y[i]], centroids)
            var centroidIndex = distances.indexOf(Math.min(...distances))
            // curPointClassifications[centroidIndex].push([data.x[i], data.y[i]])
            pointClassifications[centroidIndex].push([data.x[i], data.y[i]])
        }
        // setPointClassifications(curPointClassifications)
        setPrevCentroids(centroids)
        setCentroids(pointClassifications.map(cluster => calculateMean(cluster)))
        
        centroids.forEach((centroid, i) => {
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
          console.log("Prev", prevCentroids, "cur", centroids)
          console.log("point Class", pointClassifications)
    }

    function calculateMean(points) {
        const numPoints = points.length;
        const numDimensions = 2;  // Assume all points have the same number of dimensions
        
        // Initialize an array to store the mean for each dimension
        let mean = new Array(numDimensions).fill(0);
      
        // Sum up all points for each dimension
        points.forEach(point => {
          point.forEach((value, index) => {
            mean[index] += value;
          });
        });
      
        // Divide by the number of points to get the mean
        mean = mean.map(sum => sum / numPoints);
        
        return mean;
      }
    
      function euclidean(point, data) {
        return data.map(dataPoint => {
            // console.log(point, dataPoint)
            const squaredDifferences = dataPoint.map((value, index) => (value - point[index]) ** 2);
            
            const sumOfSquares = squaredDifferences.reduce((acc, curr) => acc + curr, 0);
            
            return Math.sqrt(sumOfSquares);
        });
      }

      function arraysEqual(arr1, arr2) {
        // Check if both arrays are the same length
        if (arr1.length !== arr2.length) return false;
    
        // Check each row
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].length !== arr2[i].length) return false; // Check row length
            for (let j = 0; j < arr1[i].length; j++) {
                if (arr1[i][j] !== arr2[i][j]) return false; // Check each element
            }
        }
        return true; // All checks passed, the arrays are equal
    }


    return (
        <div className='space-y-6 justify-center flex flex-col items-center'>
            <div className='mt-8 flex flex-row space-x-6'>
                {/* <p className='text-white text-2xl mb-2'>Number of Clusters (k):</p> */}
                <TextField
                    id="outlined-number"
                    label="Number of Clusters (k)"
                    type="number"
                    variant="outlined"
                    value={clusterNum}
                    onChange={(e) => {
                        setClusterNum(e.target.value); 
                        setCentroids(Array.from({ length: e.target.value }, () => uniform(min, max)));
                        // setPointClassifications(Array.from({ length: e.target.value }, () => []))
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
                <Button variant="outlined" endIcon={<PlayArrow/>} onClick={handleStepThrough} disabled={arraysEqual(prevCentroids, centroids) && centroids.length > 0}>Step Through KMeans</Button>
                <Button variant="outlined" endIcon={<FastForwardIcon/>} onClick={handleConvergence} disabled={arraysEqual(prevCentroids, centroids) && centroids.length > 0}>Run to Convergence</Button>
                <Button variant="outlined" endIcon={<SparkleIcon/>} onClick={handleGenerate}>Generate New Dataset</Button>
                <Button variant="outlined" endIcon={<RestartIcon/>}>Reset Algorithm</Button>
            </div>
            {/* <KMeans k={clusterNum} centroids={centroids} data={data}/> */}
        </div>
        
    )
}


export default Interface