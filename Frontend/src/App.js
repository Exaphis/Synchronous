import * as React from 'react'
import {useRef, useState} from 'react'
import {
    Tab, Tabs, Grid, Box, Avatar,
    Button, CssBaseline, TextField, FormControlLabel,
    Checkbox, Typography, Container, AppBar,
    IconButton,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
import { ProSidebar, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import { BrowserRouter as Router, Link, Route, Switch, useHistory } from "react-router-dom";
import TextareaAutosize from 'react-textarea-autosize';
import Draggable from 'react-draggable'; // Both at the same time
import {v4 as uuidv4} from 'uuid';
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import ContextMenu from "react-context-menu";
import { Widget, addResponseMessage } from 'react-chat-widget';

import logo from './logo.png';
import s from './s.png';
import './App.css';
import Workspace from './Workspace';
import { fetchAPI } from './api';

LogRocket.init('a1vl8a/synchronous');

setupLogRocketReact(LogRocket);

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
                    <Route exact path="/Workspace/:uniqueId">
                        <Workspace/>
                    </Route>
                    <Route exact path="/Chat">
                        <Chat/>
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
                  <Button
                      component={ Link }
                      to={"/Chat"}
                      type="submit"
                      fullWidth
                      variant="contained"
                      //color="primary"
                      className={classes.submit}
                      onClick={ refresh }
                  >
                      Chat Test
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

function WorkspaceApp(props) {
    const uuid = useRef(props.uuid);
    const nodeRef = useRef(null);
    const [minimized, setMinimized] = useState(false);
    const [val, setVal] = useState(props.id.toString());
    const [, setRefresh] = useState(false);

    const onDelete = () => {
        props.onDelete();
        setRefresh(e => !e);
    }

    console.log('uuid:')
    console.log(uuid.current);

    let contents;
    if (!minimized) {
        contents = <div ref={nodeRef} id={uuid.current}>
            <Button variant="contained" onClick={onDelete}>Delete</Button>
            <Button variant="contained" onClick={() => setMinimized(true)}>Minimize</Button>
            <TextareaAutosize value={val}
                              onChange={(e) => setVal(e.target.value)} />
        </div>
    } else {
        contents = <div ref={nodeRef} id={uuid.current}>
            <Button variant="contained" onClick={onDelete}>Delete</Button>
            <Button variant="contained" onClick={() => setMinimized(false)}>Maximize</Button>
        </div>
    }

    console.log('uuid:')
    console.log(uuid.current);

    if (!props.isDeleted()) {
        return (
            <div>
                <Draggable key={uuid.current} nodeRef={nodeRef}>
                {contents}
                </Draggable>
                <ContextMenu contextId={uuid.current.toString()}
                  items={[
                    {
                      label: 'Delete',
                      onClick: onDelete
                    }
                ]} />
            </div>
        )
    }

    return null;
}

function WorkspaceTab(props) {
    // console.log('props: ');
    // console.log(props.setRefresh);

    const newAppIdRef = useRef(0);
    const [apps, setApps] = useState({});
    const [, setRefresh] = useState(false);

    const deletedRef = useRef({})

    const addApp = () => {
        setApps((apps) => {
            let newAppId = newAppIdRef.current;

            const key = uuidv4();

            deletedRef.current[key] = false;
            const deleteApp = function () {
                deletedRef.current[key] = true;
                setRefresh(e => !e);
                props.setRefresh(e => !e);
            }

            const isDeleted = () => {
                console.log(deletedRef.current[key]);
                return deletedRef.current[key];
            }

            apps[newAppId] = {
                key: key,
                component: <WorkspaceApp id={newAppId} key={key}
                                         isDeleted={isDeleted} onDelete={deleteApp}
                                         uuid={key}/>,
            };
            newAppIdRef.current++;
            setRefresh(e => !e);
            props.setRefresh(e => !e);
            console.log('addApp');

            return apps;
        });
    };

    console.log(Object.keys(apps).length);
    console.log(deletedRef.current);
    return (
        // TODO: set invisible when tab switch
        <div style={{visibility: props.isVisible() ? "block" : "block"}}>
            <Button variant="contained" onClick={addApp}>Add app</Button>
            {Object.values(apps).map((app) => app.component)}
        </div>
    )
}

function Test() {
    const [, setRefresh] = useState(false);
    const [tabs, setTabs] = useState({});
    const [currTab, setCurrTab] = useState(-1);
    const numTabs = useRef(0);

    const handleTabChange = (event, newValue) => {
        setCurrTab(newValue);
    };

    function isTabVisible(tabNum) {
        return currTab === tabNum;
    }


    const createNewTab = () => {
        let newTabIdx = numTabs.current;
        let uuid = uuidv4();
        tabs[newTabIdx] = {
            component: <WorkspaceTab key={uuid} setRefresh={setRefresh}
                                     isVisible={() => isTabVisible(newTabIdx)}/>,
            idx: newTabIdx,
            uuid: uuid
        }
        setTabs(tabs);

        numTabs.current++;
        setCurrTab(newTabIdx);
        setRefresh(e => !e);
    }

    return (
        <div>        
        <Container component="main" maxWidth="xl">
        <AppBar position="static">
            <Tabs value={currTab} edge="start" onChange={handleTabChange}>
                {
                    tabs.length === 0 ? null : Object.values(tabs).map((tab) => (
                        <Tab key={tab.uuid} label={"Tab " + tab.idx.toString()}/>
                    ))
                }
            </Tabs>
            <IconButton color="inherit" edge="end" onClick={createNewTab}>
                <AddIcon />
            </IconButton>
        </AppBar>

        {
            tabs.length === 0 ? null : Object.values(tabs).map((tab) => (
                tab.component
            ))
        }

        </Container>
        <ProSidebar>
        <menu iconShape="square">
          <menuItem >Dashboard</menuItem>
          <SubMenu title="Components" >
            <menuItem>Component 1</menuItem>
            <menuItem>Component 2</menuItem>
          </SubMenu>
        </menu>
      </ProSidebar>

        </div>
    )
}

function Create() {

  const classes = useStyles();
  const [work, setWork] = useState(true);
  const history = useHistory();
  const [checked, setChecked] = React.useState(false);
  const handleChange = (event) => {
      setChecked(event.target.checked);
  };

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
                      error={!work}
                      helperText={work ? "" : "Workspace Name is invalid/taken"}
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
                      setWork,
                      checked
                  ) ? "" : setWork(false)}
              >
                Create Workspace
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link
                      to="/Open"
                      onClick={() => setWork(true)}
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

async function HandleCreate(name, password, history, work, setWork, checked) {
  let resp = await fetchAPI('POST', 'workspace/',
      {
          nickname: name.value,
          anonymous_readable: checked,
          password: password.value
      });

  if (resp.error) {
      // alert('error!');
      // alert(JSON.stringify(resp.details));
      setWork(false)
      return false
  }
  else {
      // alert('success!')
      // alert(JSON.stringify(resp));
      // alert(resp.unique_id)
      setWork(true)
      if (password.value !== "") {
          //alert("password: " + password.value)
          let auth = await fetchAPI('POST', 'api-token-auth/',
              {
                  unique_id: resp.unique_id,
                  password: password.value
              });
          //alert(JSON.stringify(auth))
          localStorage.setItem(resp.unique_id, auth.token)

      }

      await history.push('/Workspace/' + resp.unique_id);
  }
}

function Open() {
  const classes = useStyles();
  const history = useHistory();
  const [work, setWork] = React.useState(true);
  const [checked, setChecked] = React.useState(false);
    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

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
                      error={!work}
                      helperText={work ? "" : "No Workspace with given credentials"}
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
                          setWork,
                          checked
                      ) ? "" : setWork(false)}
                  >
                      Open
                  </Button>
                  <Grid container>
                      <Grid item xs>
                          <Link
                              to="/Create"
                              onClick={() => setWork(true)}
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

async function HandleOpen(name, password, history, work, setWork, usedID) {
    let resp;
    if (usedID === false) {
        let unique = await fetchAPI('GET', 'workspace/nickname/?nickname=' + name.value);
        if (unique.error) {
            // alert('error!');
            // alert(JSON.stringify(unique.details));
            setWork(false);
        }

        let length = JSON.stringify(unique).length
        unique = JSON.stringify(unique).substring(14, length-2);
        if (password.value === "") {
            resp = await fetchAPI('GET', 'workspace/' + unique + "/");
            await openWithout(unique, resp, work, setWork, history)
        } else {
            resp = await fetchAPI('POST', 'api-token-auth/',
                {
                    unique_id: unique,
                    password: password.value
                });
            await openWith(unique, resp, work, setWork, history)
        }
    } else {
        if (password.value === "") {
            resp = await fetchAPI('GET', 'workspace/' + name.value);
            await openWithout(name.value, resp, work, setWork, history)
        } else {
            resp = await fetchAPI('POST', 'api-token-auth/',
                {
                    unique_id: name.value,
                    password: password.value
                });
            await openWith(name.value, resp, work, setWork, history)
        }
    }
}

// open with password
async function openWith(uniqueID, resp, work, setWork, history) {
    if (resp.error) {
        //alert('error!');
        //alert(JSON.stringify(resp.details));
        setWork(false);
    }
    else {
        // alert('success!');
        // alert(JSON.stringify(resp));
        setWork(true);
        localStorage.setItem(uniqueID, resp.token)

        await history.push('/Workspace/' + resp.unique_id);
    }
}

async function openWithout(uniqueID, resp, work, setWork, history) {
    if (resp.error) {
        //alert('error!');
        //alert(JSON.stringify(resp.details));
        setWork(false);
    }
    else {
        // alert('success!');
        // alert(JSON.stringify(resp));
        setWork(true);

        await history.push('/Workspace/' + resp.unique_id);
    }
}

function Upload() {
    return <h2>Upload: TODO</h2>
}

function Chat() {
    React.useEffect(() => {
        addResponseMessage('Welcome!');
    }, []);

    const handleNewUserMessage = (newMessage) => {
        console.log(`New message incoming! ${newMessage}`);
        // Now send the message through the backend API
        //addResponseMessage(response);
    };

    return (
        <div className="App">
            <Widget
                handleNewUserMessage={handleNewUserMessage}
                title="Chat"
                subtitle=""
                />
        </div>
    );
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function refresh() {
  sleep(250).then(() => {
    window.location.reload(false);
  })
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

const drawerWidth = 240;

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
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    title: {
        flexGrow: 1,
    },
}));

export { useStyles, Copyright };