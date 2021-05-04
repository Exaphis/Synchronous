import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HelmetProvider } from 'react-helmet-async';
import {
    unstable_createMuiStrictModeTheme,
    ThemeProvider,
} from '@material-ui/core/styles';
import { indigo, orange } from '@material-ui/core/colors';

const theme = unstable_createMuiStrictModeTheme({
    palette: {
        primary: {
            main: indigo[500],
        },
        secondary: {
            main: orange[500],
        },
    },
    spacing: 4,
});

ReactDOM.render(
    <React.StrictMode>
        <HelmetProvider>
            <ThemeProvider theme={theme}>
                <App />
            </ThemeProvider>
        </HelmetProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
