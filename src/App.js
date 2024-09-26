import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Interface from './KMeansInterface';


function App() {

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="flex text-4xl font-bold flex-col items-center min-h-screen bg-gray-900 p-2">
        <h1 className='text-white p-2'>K Means Clustering Algorithm</h1>
        <Interface/>
      </div>
    </ThemeProvider>
    
  );
}

export default App;
