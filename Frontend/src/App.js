import logo from './logo.png';
import './App.css';
import ReactDOM from 'react-dom'
import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
  withRouter
} from "react-router-dom";
//import { MemoryRouter as Router } from 'react-router';



import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';


export default function App() {
    return (
        <Router>
          <div>
            <Switch>
              <Route exact path="/Create/">
                <Create/>
              </Route>
              <Route exact path="/Open/">
                <Open/>
              </Route>
              <Route exact path="/Upload">
                <Upload/>
              </Route>
              <Route exact path="/">
                <SignIn/>
              </Route>
            </Switch>
          </div>
        </Router>
    );
}

function SignIn() {
  const classes = useStyles();

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <img src={logo} width="400" height="400"/>
          <form className={classes.form} noValidate>
            <Router>
              <div>
                <Button
                    component={ Link }
                    to={"/Create/"}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={ refresh }
                >
                  Start a new workspace
                </Button>
                <Button
                    component={ Link }
                    to={"/Open/"}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={ refresh }
                >
                  Reopen an existing workspace
                </Button>
                <Button
                    component={ Link }
                    to={"/Upload"}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={ refresh }
                >
                  Upload a workspace
                </Button>
              </div>
            </Router>
          </form>
        </div>
        <Box mt={10}>
          <Copyright />
        </Box>
      </Container>
  );
}

function Copyright() {
  /*<Link color="inherit" href="https://material-ui.com/">
    Synchronous
  </Link>{' '}*/
  return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © Synchronous '}

        {new Date().getFullYear()}
        {'.'}
      </Typography>
  );
}


function Create() {
  return <h2>Create: TODO</h2>
}

function Open() {
  return <h2>Open: TODO</h2>
}

function Upload() {
  return <h2>Upload: TODO</h2>
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function refresh() {
  sleep(500).then(() => {
    window.location.reload(false);
  })
}


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },


  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(1, 0, 2),
  },
}));

