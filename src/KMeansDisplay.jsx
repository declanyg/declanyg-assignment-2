import { Button, duration } from '@mui/material';
import { redraw } from 'plotly.js';
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const KMeans = ({k, centroids, data}) => {

  const [frames, setFrames] = useState([]);
  const [editableCentroids, setEditableCentroids] = useState(centroids);

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

  function createKMeans() {
    var prevCentroids;
    var pointClassifications = new Array(k).fill().map(() => []);
    console.log(k, pointClassifications.length)
    while (prevCentroids !== editableCentroids) {
        for (let i=0; i < data.length; i++) {
            var distances = euclidean(data[i], editableCentroids)
            var centroidIndex = distances.indexOf(Math.min(...distances))
            pointClassifications[centroidIndex].push(data[i])
        }
        prevCentroids = editableCentroids
        setEditableCentroids(pointClassifications.map(cluster => calculateMean(cluster)))
        editableCentroids.forEach((centroid, i) => {
            // Check if any value in the centroid array is NaN
            if (centroid.some(value => isNaN(value))) {
              // If there's a NaN, replace the centroid with the corresponding previous centroid
              setEditableCentroids(editableCentroids.map((centroid, i) => {
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
          console.log("editableCentroids", editableCentroids)
          console.log("point Class", pointClassifications)
    }
    
    return
  }

  function euclidean(point, data) {
    return data.map(dataPoint => {
        const squaredDifferences = dataPoint.map((value, index) => (value - point[index]) ** 2);
        
        const sumOfSquares = squaredDifferences.reduce((acc, curr) => acc + curr, 0);
        
        return Math.sqrt(sumOfSquares);
    });
  }

  useEffect(() => {
    createKMeans()
}, [centroids, k]);

  return (
        <Plot
            data={[
                {
                type: 'scatter',
                mode: 'markers',
                x: data.x,
                y: data.y,
                marker: { color: 'blue' },
                },
            ]}
            layout={{
                title: 'KMeans Scatter Plot',
                xaxis: { title: 'X Axis' },
                yaxis: { title: 'Y Axis' },
                transition: {
                duration: 1000, // Duration of the transition animation (1 second)
                easing: 'cubic-in-out', // Smooth cubic animation
                }
            }}
            frames={frames}
            useResizeHandler={true}
            style={{ width: '720px', height: '540px' }}
        />
  );
}

export default KMeans