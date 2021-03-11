import logo from './logo.png';
import s from './s.png';
import './App.css';
import * as React from 'react'
import {useRef} from 'react'
import useInterval from '@use-it/interval';

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

// import ReactDOM from 'react-dom'
import ReactDOM, { render } from 'react-dom'
import { useIdleTimer } from 'react-idle-timer'
//import rnd, { Rnd } from 'react-rnd'
import TextareaAutosize from 'react-textarea-autosize';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time
import reactMinimize from 'react-minimize'

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {
    Table,
    TableRow,
    TableCell,
    TableBody,
    TableHead
} from '@material-ui/core';

//import {Link as uiLink} from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
//import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
//import AddIcon from '@material-ui/icons/Add'
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {useContext, useState } from 'react'

import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

LogRocket.init('a1vl8a/synchronous');

setupLogRocketReact(LogRocket);
/*LogRocket.getSessionURL(function (sessionURL) {
  drift.track('LogRocket', { sessionURL: sessionURL });
});*/

const WorkspaceContext = React.createContext(true);
const ElementContext = React.createContext(true);

export default function App() {
  const [valid, setValid] = useState(true)

  return (
      <WorkspaceContext.Provider value={{valid, setValid}}>
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
                <Route exact path="/Workspace/:uniqueId">
                    <Workspace/>
                </Route>
              </Switch>
            </div>
          </Router>
      </WorkspaceContext.Provider>
  );
}

function getUrlFromEndpoint(protocol, endpoint) {
    return protocol + '://localhost:8000/' + endpoint;
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

    return fetch(getUrlFromEndpoint('http', endpoint), requestOptions)
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



// const Search = () => {
//   const [showResults, setShowResults] = React.useState(false)
//   const onClick = () => setShowResults(true)
//   return (
//     <div>
//       <input type="submit" value="Search" onClick={onClick} />
//       { showResults ? <Results /> : null }
//     </div>
//   )
// }

// const Results = () => (
//   <div id="results" className="search-results">
//     Some Results
//   </div>
// )

// ReactDOM.render(<Search />, document.querySelector("#container"))

function Test() {
  const R = () => {
    const [situation, setsituation] = useState(true)
    const [val, setval] = useState('')
    const hideClick = () => setsituation(false)
    const showClick = () => setsituation(true)
    const onChange = (e) => setval(e.target.value)


    return (
      <Draggable>
      <div>
        {situation ?
        <Button variant="contained" onClick ={hideClick}>Minimize</Button>
        :
        <Button variant="contained" onClick ={showClick}>Maximize</Button>
        }

        {situation ?
           <TextareaAutosize
            value={val}
            onChange={onChange}
            />
            :
            null
          }
      </div>
      </Draggable>

    )
  }

  return (
    ReactDOM.render(
      <R/> , document.getElementById('root')
    )
  )
}

function Workspace() {
    const classes = useStyles()
    const { uniqueId } = useParams();  // destructuring assignment
    const [ workspace, setWorkspace ] = React.useState(null);
    const [ userListWs, setUserListWs ] = React.useState(null);
    const [ userList, setUserList ] = React.useState({});
    const userIdRef = React.useRef(null);
    const [ received, setReceived ] = React.useState(false);
    console.log(JSON.stringify(userList));

    /*if (!received && localStorage.getItem(uniqueId) === null) {
        checkForPassword(uniqueId, received, setReceived)
    }*/

    // see https://stackoverflow.com/a/57856876 for async data retrieval
    const getWorkspace = async () => {
        let resp = await fetchAPI('GET', 'workspace/' + uniqueId);
        // TODO: handle response errors
        setWorkspace(resp);
    };

    const updateInactivityText = (newUserList) => {
        Object.keys(newUserList).forEach((userId) => {
            let user = newUserList[userId];
            if (user.active) {
                user.activity_text = 'Active';
            }
            else {
                const inactive_since = new Date(user.went_inactive_at);
                const now = Date.now();
                const secs_inactive = Math.round(parseInt(now - inactive_since) / 1000);
                newUserList[userId].activity_text = `Inactive for ${secs_inactive} sec`;
            }
        })

        return newUserList;
    };

    // https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function
    // why does it sometimes not refresh the user list when joining an already joined workspace?
    const userListConnect = () => {
        let ws = new WebSocket(
            getUrlFromEndpoint('ws', 'ws/' + uniqueId + '/user-list/')
        );

        ws.onmessage = (event) => {
            let data = JSON.parse(event.data);
            if (data.type === 'user_list') {
                setUserList(updateInactivityText(data['user_list']));
            }
            else if (data.type === 'current_user') {
                userIdRef.current = data['user_id']
            }
        };

        setUserListWs(ws);
    }

    const sendActivityMessage = (active) => {
        if (userListWs !== null) {
            userListWs.send(JSON.stringify(
                {
                    'type': 'activity',
                    'isActive': active
                }
            ));
        }
    }

    useIdleTimer({
        timeout: 1000 * 3,  // in milliseconds
        onIdle: () => sendActivityMessage(false),
        onActive: () => sendActivityMessage(true)
    });

    // wtf why does this work
    // hack to allow inactivity text to re-render everything every second
    const [refresh, setRefresh] = useState(false);
    useInterval(() => {
        setUserList((ul) => updateInactivityText(ul));
        setRefresh((refresh) => !refresh);  // if this isn't here it doesn't work
    }, 1000);

    React.useEffect(() => {
        if (workspace === null) {
            getWorkspace().then();
        } else if (userListWs === null) {
            userListConnect()
        }
        //
        console.log('in effect');
    });
    // console.log('end: ' + JSON.stringify(userList));

    function NicknameCell(props) {
        let user = props.user;
        console.log(userIdRef.current === user.id);
        if (user.id === userIdRef.current) {
            return <TableCell>
                <Typography fontWeight={900}>{user.nickname}</Typography>
            </TableCell>
        }
        else {
            return <TableCell>
                {user.nickname}
            </TableCell>
        }
    }

    let out = JSON.stringify(workspace);
    let out2 = JSON.stringify(userList);

/*    if (localStorage.getItem(uniqueId) === null) {
        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box mt={4}>
                </Box>
                <div className={classes.paper}>
                    <Avatar alt="s" src={s} className={classes.sizeAvatar}/>
                    <Box mt={4}>
                    </Box>
                    <Typography component="h2" variant="h5">
                        You do not have access to this workspace
                    </Typography>
                    <Box mt={2}>
                    </Box>
                    <Button
                        component={ Link }
                        to={"/Open"}
                        size="large"
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={ refresh }
                    >
                        Return to open workspace
                    </Button>
                </div>
                <Box mt={4}>
                    <Copyright/>
                </Box>
            </Container>
        )
    }*/

    return (
        <Container component="main" maxWidth="xl">
            <h1>{JSON.stringify(workspace)}</h1>
            <p>{JSON.stringify(userList)}</p>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nickname</TableCell>
                        <TableCell>Activity</TableCell>
                        <TableCell>Color</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { Object.values(userList).map(user => (
                        <TableRow key={user.id}>
                            <NicknameCell user={user}/>
                            <TableCell> {user.activity_text} </TableCell>
                            <TableCell>
                                <section style={{height: "50px", 'backgroundColor': user.color}} />
                            </TableCell>
                        </TableRow>
                    )) }
                </TableBody>
            </Table>
        </Container>
    )

}

async function checkForPassword(uniqueID, received, setReceived) {
    setReceived(true)
    let resp = await fetchAPI('POST', 'api-token-auth/',
        {
            unique_id: uniqueID,
            password: 'TEST'
        });

    if (resp.error) {
        if (JSON.stringify(resp.details).includes("Workspace is globally editable")) {
            localStorage.setItem(uniqueID, "")
        }
        alert('error!');
        alert(JSON.stringify(resp.details))
    } else {
        alert('success!')
        alert(JSON.stringify(resp));
        alert(resp.unique_id)
        setReceived(false)
    }
}

function Create() {

  const classes = useStyles();
  const work = useContext(WorkspaceContext)
  const history = useHistory();
  const [checked, setChecked] = React.useState(false);
  const handleChange = (event) => {
      setChecked(event.target.checked);
  };

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
                      label="Workspace Name (Optional)"
                      name="workspace"
                      autoComplete="workspace"
                      autoFocus
                  />
              <Grid container >
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
                  <FormControlLabel
                      control={<Checkbox color="primary" />}
                      id="check"
                      label="Allow View Only?"
                      onChange={handleChange}
                  />
              </Grid>
              <Box mt={2}>
              </Box>
              <Button
                  size="large"
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={() => HandleCreate(document.getElementById('name'),
                      document.getElementById('password'),
                      history,
                      work,
                      checked
                  ) ? "" : work.setValid(false)}
              >
                Create Workspace
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link
                      to="/Open"
                      onClick={() => work.setValid(true)}
                  >
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
                label="Workspace Name (Optional)"
                name="workspace"
                autoComplete="workspace"
                autoFocus
                error
                helperText="Workspace Name is invalid/taken"
            />
            <Grid container >
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
              <FormControlLabel
                  control={<Checkbox color="primary" />}
                  id="check"
                  label="Allow View Only?"
                  onChange={handleChange}
              />
            </Grid>
            <Box mt={2}>
            </Box>
            <Button
                size="large"
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={() => HandleCreate(
                    document.getElementById('name'),
                    document.getElementById('password'),
                    history,
                    work,
                    checked)}
                error
                helperText={"Workspace name is invalid/taken"}
            >
              Create Workspace
            </Button>
            <Grid container>
              <Grid item xs>
                  <Link
                      to="/Open"
                      onClick={() => work.setValid(true)}
                  >
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

async function HandleCreate(name, password, history, work, checked) {
  let resp = await fetchAPI('POST', 'workspace/',
      {
          nickname: name.value,
          anonymous_readable: checked,
          password: password.value
      });

  if (resp.error) {
      alert('error!');
      alert(JSON.stringify(resp.details));
      work.setValid(false)
      return false
  }
  else {
      alert('success!')
      alert(JSON.stringify(resp));
      alert(resp.unique_id)
      work.setValid(true)
      if (password.value !== "") {
          //alert("password: " + password.value)
          let auth = await fetchAPI('POST', 'api-token-auth/',
              {
                  unique_id: resp.unique_id,
                  password: password.value
              });
          //alert(JSON.stringify(auth))
          localStorage.setItem(resp.unique_id, auth.token)

      } else {
          localStorage.setItem(resp.unique_id, "")
      }

      await history.push('/Workspace/' + resp.unique_id);
  }
}

function Open() {
  const classes = useStyles();
  const work = useContext(WorkspaceContext)
  const history = useHistory();

  const [checked, setChecked] = React.useState(false);
    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

  if (work.valid) {
      return (
          <Container component="main" maxWidth="xs">
              <CssBaseline/>
              <div className={classes.paper}>
                  <Avatar alt="s" src={s} className={classes.sizeAvatar}/>
                  <Box mt={4}>
                  </Box>
                  <Typography component="h2" variant="h5">
                      Open Existing Workspace
                  </Typography>
                  <Grid container >
                  <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="name"
                      label={checked ? "Workspace ID" : "Workspace Name"}
                      name="workspace"
                      autoComplete="workspace"
                      autoFocus
                      required
                  />
                  <FormControlLabel
                      control={<Checkbox color="primary" />}
                      id="check"
                      label="Use ID?"
                      onChange={handleChange}
                  />
                  </Grid>
                  <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="password"
                      label="Password (if applicable)"
                      name="workspace"
                      type="password"
                      autoComplete="workspace"
                  />
                  <Box mt={2}>
                  </Box>
                  <Button
                      size="large"
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                      onClick={() => HandleOpen(document.getElementById('name'),
                          document.getElementById('password'),
                          history,
                          work,
                          checked
                      ) ? "" : work.setValid(false)}
                  >
                      Open
                  </Button>
                  <Grid container>
                      <Grid item xs>
                          <Link
                              to="/Create"
                              onClick={() => work.setValid(true)}
                          >
                              Need a new workspace?
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
                <Grid container >
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="name"
                        label={checked ? "Workspace ID" : "Workspace Name"}
                        name="workspace"
                        autoComplete="workspace"
                        autoFocus
                        required
                        error
                        helperText={"No Workspace with given credentials"}
                    />
                    <FormControlLabel
                        control={<Checkbox color="primary" />}
                        id="check"
                        label="Use ID?"
                        onChange={handleChange}
                    />
                </Grid>
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="password"
                    label="Password (if applicable)"
                    name="workspace"
                    type="password"
                    autoComplete="workspace"
                />
                <Box mt={2}>
                </Box>
                <Button
                    size="large"
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={() => HandleOpen(document.getElementById('name'),
                        document.getElementById('password'),
                        history,
                        work,
                        checked
                    ) ? "" : work.setValid(false)}
                >
                    Open
                </Button>
                <Grid container>
                    <Grid item xs>
                        <Link
                            to="/Create"
                            onClick={() => work.setValid(true)}
                        >
                            Need a new workspace?
                        </Link>
                    </Grid>
                </Grid>
            </div>
            <Box mt={16}>
                <Copyright />
            </Box>
        </Container>
        )


}

async function HandleOpen(name, password, history, work, usedID) {
    let resp;
    if (usedID === false) {
        let unique = await fetchAPI('GET', 'workspace/nickname/?nickname=' + name.value);
        if (unique.error) {
            alert('error!');
            alert(JSON.stringify(unique.details));
            work.setValid(false)
        }

        let length = JSON.stringify(unique).length
        unique = JSON.stringify(unique).substring(14, length-2);
        if (password.value === "") {
            if (await checkPass(unique)) {
                resp = await fetchAPI('GET', 'workspace/' + unique + "/");
                openWithout(unique, resp, work, history)
            } else {
                work.setValid(false)
            }

        } else {
            resp = await fetchAPI('POST', 'api-token-auth/',
                {
                    unique_id: unique,
                    password: password.value
                });
            openWith(unique, resp, work, history)
        }
    } else {
        if (password.value === "") {
            if (await checkPass(name.value)) {
                resp = await fetchAPI('GET', 'workspace/' + name.value);
                openWithout(name.value, resp, work, history)
            } else {
                work.setValid(false)
            }
        } else {
            resp = await fetchAPI('POST', 'api-token-auth/',
                {
                    unique_id: name.value,
                    password: password.value
                });
            openWith(name.value, resp, work, history)
        }
    }


}

async function checkPass(uniqueID) {
    let resp = await fetchAPI('POST', 'api-token-auth/',
        {
            unique_id: uniqueID,
            password: 'TEST'
        });

    if (resp.error) {
        if (JSON.stringify(resp.details).includes("Workspace is globally editable")) {
            return true
        }
        alert('error!');
        alert(JSON.stringify(resp.details))
    } else {
        alert('success!')
        alert(JSON.stringify(resp));
        alert(resp.unique_id)
    }
    return false
}

async function openWith(uniqueID, resp, work, history) {
    if (resp.error) {
        alert('error!');
        alert(JSON.stringify(resp.details));
        work.setValid(false)
    }
    else {
        alert('success!')
        alert(JSON.stringify(resp));
        work.setValid(true)
        localStorage.setItem(uniqueID, resp.token)

        await history.push('/Workspace/' + resp.unique_id);
    }
}

async function openWithout(uniqueID, resp, work, history) {
    if (resp.error) {
        alert('error!');
        alert(JSON.stringify(resp.details));
        work.setValid(false)
    }
    else {
        alert('success!')
        alert(JSON.stringify(resp));
        work.setValid(true)
        localStorage.setItem(uniqueID, "")

        await history.push('/Workspace/' + resp.unique_id);
    }
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



