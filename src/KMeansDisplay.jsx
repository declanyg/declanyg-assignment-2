import { Button, duration } from '@mui/material';
import { redraw } from 'plotly.js';
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js';

const KMeans = ({data, pointClassifications, setPlotlyInstance, iterations, curIteration, runAnimations}) => {

    const frames = iterations.map((centroids, idx) => (
        {
        name: `Iteration ${idx + 1}`,
        data : [
            {
                x: data.x,
                y: data.y,
                mode: 'markers',
                marker: { size: 10, color: pointClassifications[idx] },  
                name: 'Static Points',
            },
            {
                x: centroids.x,
            y: centroids.y,
            mode: 'markers',
            marker: { size: 12, color: 'red', symbol: "x"},
            name: "Centroids"}
        ]
      }));

      const initialTraces = frames[0].data.map((val, idx) => {
        if (idx == 0) {
            val.marker.color = Array.from({length: 150}, () => 'grey')
        }
        return val
      });

  return (
        <Plot
            data={initialTraces}
            layout={{
            title: 'KMeans Clustering Animation',
            xaxis: { title: 'X-axis', range: [0,10], autorange: false },
            yaxis: { title: 'Y-axis', range: [0,10], autorange: false },
            showlegend: false
            }}
            frames={frames}
            config={{ scrollZoom: false }}
            onInitialized={(figure, graphDiv) => setPlotlyInstance(graphDiv)}
            onUpdate={(figure, graphDiv) => setPlotlyInstance(graphDiv)}
        />
)}

export default KMeans