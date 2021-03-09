import logo from './logo.png';
import s from './s.png';
import './App.css';
import * as React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
  useParams
  //useRouteMatch,
  //withRouter
} from "react-router-dom";

import ReactDOM from 'react-dom'
//import rnd, { Rnd } from 'react-rnd'
import TextareaAutosize from 'react-textarea-autosize';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time



import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
//import FormControlLabel from '@material-ui/core/FormControlLabel';
//import Checkbox from '@material-ui/core/Checkbox';
//import {Link as uiLink} from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
//import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
//import AddIcon from '@material-ui/icons/Add'
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {useContext, useState, useCallback, useEffect} from 'react'


const workspaceContext = React.createContext(true)

export default function App() {
  const [valid, setValid] = useState(true)

  return (
      <workspaceContext.Provider value={{valid, setValid}}>
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
      </workspaceContext.Provider>
  );
}

function fetchAPI(methodType, endpoint, data=null) {
    let requestOptions = {
        method: methodType,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data !== null) {
        requestOptions.body = JSON.stringify(data);
    }

    return fetch('http://localhost:8000/' + endpoint, requestOptions)
    .then(async response => {
        let data;

        try {
            data = await response.json()
        } catch (e) {
            throw response.status;
        }

        if (!response.ok) {
            throw JSON.stringify(data);
        }

        return data;
    })
    .catch(error => {
        if (error instanceof Error) {
            return {
                error: true,
                details: error.message
            }
        }

        return {
            error: true,
            details: error
        }
    });

}

function SignIn() {
  const classes = useStyles();

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <img alt="" src={logo} width="400" height="400"/>
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
  return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © Synchronous '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

function Test() {
  return (
      ReactDOM.render(
          <Draggable>
            <div> <TextareaAutosize/></div>
          </Draggable>, document.getElementById('root')
      )
  )
}

function Workspace() {
    const { uniqueId } = useParams();  // destructuring assignment
    const [ workspace, setWorkspace ] = React.useState(null);

    // see https://stackoverflow.com/a/57856876 for async data retrieval
    const getWorkspace = async () => {
        let resp = await fetchAPI('GET', 'workspace/' + uniqueId);
        setWorkspace(resp);
    };

    React.useEffect(() => {
        if (workspace === null) {
            getWorkspace().then();
        }
    });

    let out = JSON.stringify(workspace);
    return <h1>{out}</h1>
}


function Create() {

  const classes = useStyles();
  const work = useContext(workspaceContext)
  const history = useHistory();

  if (work.valid) {
    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline/>
          <div className={classes.paper}>
            <Avatar alt="s" src={s} className={classes.sizeAvatar}/>
            <Box mt={4}>
            </Box>
            <Typography component="h2" variant="h5">
              Create a Workspace
            </Typography>
              <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Workspace Name"
                  name="workspace"
                  autoComplete="workspace"
                  autoFocus
                  required
              />
              <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="password"
                  label="Password (Optional)"
                  name="workspace"
                  type="password"
                  autoComplete="workspace"
              />
              <Box mt={2}>
              </Box>
              <Button
                  size="large"
                  //component={ Link }
                  //to={"/Test"}
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  /*onClick={() => HandleCreate(document.getElementById('name'),
                      document.getElementById('password'),
                      history
                  ) ? "" : work.setValid(false)}*/
                  onClick={() => HandleCreate(document.getElementById('name'),
                      document.getElementById('password'),
                      history
                  ) ? work.setValid(false) : work.setValid(false)}
              >
                Create Workspace
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link to="/Open">
                    Existing Workspace?
                  </Link>
                </Grid>
              </Grid>
          </div>
          <Box mt={16}>
            <Copyright/>
          </Box>
        </Container>
    );
  } else {

    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline/>
          <div className={classes.paper}>
            <Avatar alt="s" src={s} className={classes.sizeAvatar}/>
            <Box mt={4}>
            </Box>
            <Typography component="h2" variant="h5">
              Create a Workspace
            </Typography>
            <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="name"
                label="Workspace Name"
                name="workspace"
                autoComplete="workspace"
                autoFocus
                required
                error
                helperText="Workspace name is invalid/taken"
            />
            <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="password"
                label="Password (Optional)"
                name="workspace"
                type="password"
                autoComplete="workspace"
            />
            <Box mt={2}>
            </Box>
            <Button
                size="large"
                //component={ Link }
                //to={"/Test"}
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={() => HandleCreate(
                    document.getElementById('name'),
                    document.getElementById('password'),
                    history)}
                error
                helperText={"Workspace name is invalid/taken"}
            >
              Create Workspace
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="/Open">
                  Existing Workspace?
                </Link>
              </Grid>
            </Grid>
          </div>
          <Box mt={16}>
            <Copyright/>
          </Box>
        </Container>
    );
  }

}

async function HandleCreate(name, password, history) {
  let resp = await fetchAPI('POST', 'workspace/',
      {
          nickname: name.value,
          anonymous_readable: true,
          password: password.value
      });

  if (resp.error) {
      alert('error!');
      alert(JSON.stringify(resp.details));
      return false
  }
  else {
      alert('success!')
      alert(JSON.stringify(resp));

      await history.push('/Workspace/' + resp.unique_id);
  }
}

function Open() {
  const classes = useStyles();

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar  alt="s" src={s} className={classes.sizeAvatar} />
          <Box mt={4}>
          </Box>
          <Typography component="h2" variant="h5">
            Open Existing Workspace
          </Typography>
            <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="name"
                label="Workspace Name"
                name="workspace"
                autoComplete="workspace"
                autoFocus
            />
            <Box mt={2}>
            </Box>
            <Button
                size="large"
                component={ Link }
                to={"/Test"}
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={ refresh }
            >
              Open
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="/Create">
                  Need a new workspace?
                </Link>
              </Grid>
            </Grid>
        </div>
        <Box mt={16}>
          <Copyright />
        </Box>
      </Container>
  );
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
  sizeAvatar: {
    height: theme.spacing(16),
    width: theme.spacing(16),
  },
}));



