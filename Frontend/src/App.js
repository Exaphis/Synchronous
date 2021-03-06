import logo from './logo.png';
import './App.css';
import * as React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";

import ReactDOM from 'react-dom'
import rnd, { Rnd } from 'react-rnd'
//import { MemoryRouter as Router } from 'react-router';
import TextareaAutosize from 'react-textarea-autosize';







import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';



export default function App() {
    return (
        <Router>
          <div>
            <Switch>
              <Route exact path="/Create">
                <Create/>
              </Route>
              <Route exact path="/Open">
                <Open/>
              </Route>
              <Route exact path="/Upload">
                <Upload/>
              </Route>
              <Route exact path="/">
                <SignIn/>
              </Route>
              <Route exact path="/Test">
                <Test/>
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
                    to={"/Create"}
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
                    to={"/Open"}
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
                <Button
                    component={ Link }
                    to={"/Test"}
                    type="submit"
                    fullWidth
                    variant="contained"
                    //color="primary"
                    className={classes.submit}
                    onClick={ refresh }
                >
                  Test Workspace
                </Button>
              </div>
            </Router>
          </form>
        </div>
        <Box mt={8}>
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

function Test() {
  return(
      ReactDOM.render(
          <Rnd
              default={{
                x: 0,
                y: 0,
                width: 320,
                height: 200,
              }}
          >
            <div><TextareaAutosize /></div>
          </Rnd>,
          document.getElementById("root"))
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
  sleep(250).then(() => {
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



