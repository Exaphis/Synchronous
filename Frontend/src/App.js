import logo from './logo.png';
import s from './s.png';
import './App.css';
import * as React from 'react'
import {useRef, useState} from 'react'
import useInterval from '@use-it/interval';
import { ProSidebar, menu, menuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';


import {BrowserRouter as Router, Link, Route, Switch, useHistory, useParams} from "react-router-dom";

import {useIdleTimer} from 'react-idle-timer'
import TextareaAutosize from 'react-textarea-autosize';
import Draggable from 'react-draggable'; // Both at the same time

import {
    Tab, Table, TableBody, TableCell,
    TableHead, TableRow, Tabs, Dialog,
    DialogTitle, DialogContent, DialogContentText,
    DialogActions, Grid, Box, Avatar,
    Button, CssBaseline, TextField, FormControlLabel,
    Checkbox, Typography, Container, AppBar,
    IconButton, Toolbar, Menu
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import {v4 as uuidv4} from 'uuid';


import {makeStyles} from '@material-ui/core/styles';
import EmailIcon from '@material-ui/icons/Email';
import clsx from 'clsx';

import Moment from 'react-moment';

import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import ContextMenu from "react-context-menu";

import { Widget, addResponseMessage} from 'react-chat-widget';

LogRocket.init('a1vl8a/synchronous');

setupLogRocketReact(LogRocket);
/*LogRocket.getSessionURL(function (sessionURL) {
  drift.track('LogRocket', { sessionURL: sessionURL });
});*/



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

function getUrlFromEndpoint(protocol, endpoint) {
    return protocol + '://localhost:8000/' + endpoint;
}

function fetchAPI(methodType, endpoint, data=null, token=null) {
    let headers = {
        'Content-Type': 'application/json'
    }
    if (token !== null) {
        headers['Authorization'] = 'Token ' + token.toString()
    }

    let requestOptions = {
        method: methodType,
        headers: headers
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
    const [refresh, setRefresh] = useState(false);

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
    const [refresh, setRefresh] = useState(false);

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
    const [refresh, setRefresh] = useState(false);
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

function Workspace() {
    // TODO: allow modify nickname
    const classes = useStyles()
    const { uniqueId } = useParams();  // destructuring assignment
    const [ workspace, setWorkspace ] = React.useState(null);
    const [ userListWs, setUserListWs ] = React.useState(null);
    const [ userList, setUserList ] = React.useState({});
    const userIdRef = React.useRef(null);
    const tokenRef = React.useRef(null);
    const [auth, setAuth] = React.useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [ validEmail, setValidEmail ] = React.useState(true)

    // for changing nickname in NicknameCell
    const [ nameDialogOpen, setNameDialogOpen ] = React.useState(false);
    const nicknameFieldValue = React.useRef('');

    //console.log(JSON.stringify(userList));

    const handleChange = (event) => {
        setAuth(event.target.checked);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        document.getElementById('email').value = ""
        document.getElementById('message').value = ""
        setValidEmail(true)
    };


    // see https://stackoverflow.com/a/57856876 for async data retrieval
    const getWorkspace = async () => {
        tokenRef.current = localStorage.getItem(uniqueId);
        let resp = await fetchAPI('GET', 'workspace/' + uniqueId, null, tokenRef.current);
        // TODO: handle response errors
        console.log(resp);
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
        let wsUri = workspace['user_list_ws'];
        let ws = new WebSocket(
            getUrlFromEndpoint('ws', wsUri)
        );

        ws.onmessage = (event) => {
            let data = JSON.parse(event.data);
            if (data.type === 'user_list') {
                setUserList(updateInactivityText(data['user_list']));
            }
            else if (data.type === 'current_user') {
                userIdRef.current = data['user_id']
            }
            else if (data.type === 'nicknameChange') {
                if (!data.success) {
                    alert(data.details);
                }
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
        setRefresh((e) => !e);  // if this isn't here it doesn't work
    }, 1000);

    React.useEffect(() => {
        if (workspace === null) {
            getWorkspace().then();
        } else if (userListWs === null) {
            userListConnect()
        }
    });

    async function updateNickname(new_nickname) {
        let resp = await fetchAPI('PATCH', 'workspace/' + uniqueId + '/',
            {
                'nickname': new_nickname
            },
            tokenRef.current
        );
        if (resp === null) {
            alert('Nickname failed to set, no response.');
        } else if ('error' in resp) {
            alert('Nickname failed to set, error: ' + JSON.stringify(resp.details));
        } else {
            await getWorkspace();
        }
    }

    async function changePassword(new_password) {
        let resp = await fetchAPI('PATCH', 'workspace/' + uniqueId + '/password/',
            {
                'password': new_password
            },
            tokenRef.current
        );
        if (resp === null) {
            alert('Password failed to set, no response.');
        } else if ('error' in resp) {
            alert('Password failed to set, error: ' + JSON.stringify(resp));
        } else {
            if (new_password === '') {
                tokenRef.current = null;
                localStorage.removeItem(uniqueId);
            }
            await getWorkspace();
        }
    }

    function NicknameCell(props) {
        function changeUserNickname() {
            userListWs.send(JSON.stringify(
                {
                    'type': 'nicknameChange',
                    'nickname': nicknameFieldValue.current
                }
            ));

            closeNameDialog();
        }

        function closeNameDialog() {
            setNameDialogOpen(false);
        }

        let user = props.user;
        if (user.id === userIdRef.current) {
            return <TableCell>
                <Typography fontWeight={900}>{user.nickname}</Typography>

                <Button variant="outlined" color="primary" onClick={() => setNameDialogOpen(true)}>
                    Change name
                </Button>

                <Dialog open={nameDialogOpen} onClose={closeNameDialog} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Change name</DialogTitle>

                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="New Nickname"
                            type="text"
                            fullWidth
                            onChange={(ev) => (nicknameFieldValue.current = ev.target.value)}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>

                        <Button onClick={changeUserNickname} color="primary">
                            Change name
                        </Button>
                    </DialogActions>
                </Dialog>
            </TableCell>
        }
        else {
            return <TableCell>
                {user.nickname}
            </TableCell>
        }
    }


    if (workspace !== null && workspace.error) {
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
                        //onClick={ refresh }
                    >
                        Return to open workspace
                    </Button>
                </div>
                <Box mt={4}>
                    <Copyright/>
                </Box>
            </Container>
        )
    }

    let workspace_details;
    if (workspace === null) {
        workspace_details = <p>Null</p>
    } else {
        let view_dialog = <p>Workspace editable</p>
        if (workspace.anonymous_readable && tokenRef.current === null) {
            view_dialog = <p>Password empty, view only</p>
        }

        workspace_details = <div>
            <p>Workspace unique_id: {workspace.unique_id}</p>
            <p>Workspace nickname: {workspace.nickname}</p>
            <p>Created at: {workspace.created_at}</p>
            <p>Password protected: {workspace.is_password_protected.toString()}</p>
            <p>Allow view only: {workspace.anonymous_readable.toString()}</p>
            {view_dialog}
        </div>
    }

    return (
        <Container component="main" maxWidth="xl">
            <AppBar position="absolute" className={clsx(classes.appBar)}>
                <Toolbar className={classes.toolbar}>
                    <Typography variant="h4" className={classes.title}>
                        {workspace !== null ?
                            (workspace.nickname !== null ?
                                "Workspace: " + JSON.stringify(workspace.nickname).substring(1, JSON.stringify(workspace.nickname).length - 1) :
                                "Workspace: " + JSON.stringify(workspace.unique_id).substring(1, JSON.stringify(workspace.unique_id).length - 1)) :
                            ""}
                    </Typography>
                    {/*<Typography variant="h6" className={classes.title}>&nbsp;&nbsp;&nbsp; Time Remaining: {time}</Typography>*/}
                    <Typography variant="h6" className={classes.title}>
                        &nbsp;&nbsp;&nbsp; Duration: {workspace !== null ? <Moment date={workspace.created_at} format="hh:mm:ss" durationFromNow /> : null }
                    </Typography>

                    {auth && (
                        <div>
                    <Button color="secondary" variant="contained" edge="end"
                            onClick={() => updateNickname(prompt("Enter the new nickname")).then()}>
                        Change nickname
                    </Button>
                    {workspace !== null && workspace.is_password_protected
                    && tokenRef.current !== null && (
                        <Button color="secondary" variant="contained" edge="end"
                                onClick={() => changePassword(prompt("Enter the new password (empty to remove)")).then()}>
                        Change password
                        </Button>
                    )}
                    <IconButton color="inherit" edge="end" onClick={handleMenu}>
                        <EmailIcon />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={open}
                        onClose={handleClose}
                    >
                        <Container component="main" maxWidth="xs">
                            <div className={classes.paper}>
                            &nbsp;{"Invite Collaborators:"}
                            <TextField
                                variant="outlined"
                                margin="normal"
                                id="email"
                                label="Email"
                                error={!validEmail}
                                helperText={validEmail ? "" : "Invalid Email"}
                                required
                                autoFocus
                            >
                            </TextField>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                id="message"
                                label="Additonal Message?"
                            >
                            </TextField>
                                <Button
                                    size="large"
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                    onClick={() => emailHandler(document.getElementById('email'),
                                        document.getElementById('message'),
                                        workspace,
                                        validEmail,
                                        setValidEmail
                                    )}
                                >
                                    Submit
                                </Button>
                            </div>
                        </Container>
                    </Menu>
                    </div>
                    )}
                </Toolbar>
            </AppBar>
            <Box mt={10}>
            </Box>
            {/*<h1>{JSON.stringify(workspace)}</h1>*/}
            {/*<p>{JSON.stringify(userList)}</p>*/}
            {workspace_details}
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
      alert('error!');
      alert(JSON.stringify(resp.details));
      setWork(false)
      return false
  }
  else {
      alert('success!')
      alert(JSON.stringify(resp));
      alert(resp.unique_id)
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
            alert('error!');
            alert(JSON.stringify(unique.details));
            setWork(false)
        }

        let length = JSON.stringify(unique).length
        unique = JSON.stringify(unique).substring(14, length-2);
        if (password.value === "") {
                resp = await fetchAPI('GET', 'workspace/' + unique + "/");
                openWithout(unique, resp, work, setWork, history)

        } else {
            resp = await fetchAPI('POST', 'api-token-auth/',
                {
                    unique_id: unique,
                    password: password.value
                });
            openWith(unique, resp, work, setWork, history)
        }
    } else {
        if (password.value === "") {
            resp = await fetchAPI('GET', 'workspace/' + name.value);
            openWithout(name.value, resp, work, setWork, history)
        } else {
            resp = await fetchAPI('POST', 'api-token-auth/',
                {
                    unique_id: name.value,
                    password: password.value
                });
            openWith(name.value, resp, work, setWork, history)
        }
    }

}


async function openWith(uniqueID, resp, work, setWork, history) {
    if (resp.error) {
        //alert('error!');
        //alert(JSON.stringify(resp.details));
        setWork(false)
    }
    else {
        alert('success!')
        alert(JSON.stringify(resp));
        setWork(true)
        localStorage.setItem(uniqueID, resp.token)

        await history.push('/Workspace/' + resp.unique_id);
    }
}

async function openWithout(uniqueID, resp, work, setWork, history) {
    if (resp.error) {
        //alert('error!');
        //alert(JSON.stringify(resp.details));
        setWork(false)
    }
    else {
        alert('success!')
        alert(JSON.stringify(resp));
        setWork(true)

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
        // Now send the message throught the backend API
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





async function emailHandler(email, message, workspace, validEmail, setValidEmail) {

    // eslint-disable-next-line
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (regex.test(email.value)) {
        let name = workspace.nickname !== null ? JSON.stringify(workspace.nickname) :
            JSON.stringify(workspace.unique_id)
        name = name.substring(1, name.length - 1)
        let key = localStorage.getItem(workspace.unique_id)
        key = key !== null ? key : "N/A"
        let resp = await fetchAPI('POST', 'send-mail/',
            {
                email: email.value,
                subject: "Workspace Invitation",
                message: "Hello,\n\n" +
                    "You are invited to join Workspace: " + name + "\n" +
                    "http://localhost:3000/Workspace/" + workspace.unique_id + "\n\n" +
                    "Password: " + key + "\n\n" +
                    "Additional Notes: " + message.value + "\n\n\n" +
                    "Best wishes,\n" +
                    "Synchronous"
            })

        if (resp.error) {
            if (JSON.stringify(resp.details).includes("200")) {
                alert('Email Sent');
                setValidEmail(true)
            } else {
                alert('error!');
                alert(JSON.stringify(resp.details))
                setValidEmail(false)
            }
        } else {
            alert('Email Sent');
            setValidEmail(true)
        }

    } else {
        alert("Invalid Email")
        setValidEmail(false)
    }
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



