import * as React from 'react'
import {
    Grid, Box, Avatar, Button, CssBaseline,
    TextField, FormControlLabel, Checkbox,
    Typography, Container
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import 'react-pro-sidebar/dist/css/styles.css';
import { BrowserRouter as Router, Link, Route, Switch, useHistory } from "react-router-dom";
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import './CSS/styles.css';

import logo from './Images/logo.png';
import s from './Images/s.png';
import './CSS/App.css';
import Workspace from './Workspace';
import { fetchAPI } from './api';
import { WorkspaceArea } from './WorkspaceArea';
import Tutorial from './Tutorial';


LogRocket.init('a1vl8a/synchronous');

setupLogRocketReact(LogRocket);


export default function App() {
    return (
        <Router>
            <div>
                <Switch>
                    <Route exact path="/create">
                        <Create/>
                    </Route>
                    <Route exact path="/open">
                        <Open/>
                    </Route>
                    <Route exact path="/upload">
                        <Upload/>
                    </Route>
                    <Route exact path="/">
                        <SignIn/>
                    </Route>
                    <Route exact path="/test">
                        <Test/>
                    </Route>
                    <Route exact path="/workspace/:uniqueId">
                        <Workspace/>
                    </Route>
                    <Route exact path="/tutorial">
                        <Tutorial/>
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

function SignIn() {
    const classes = useStyles();

    return (
        <div>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>

                    <img alt="" src={logo} width="400" height="400"/>
                    <form className={classes.form} noValidate>
                        <Router>
                            <div>
                                <Button
                                    component={ Link }
                                    to={"/create"}
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
                                    to={"/open"}
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
                                    to={"/upload"}
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
                                    to={"/test"}
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
                                    to={"/tutorial"}
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="secondary"
                                    className={classes.submit}
                                    onClick={ refresh }
                                >
                                    Tutorial
                                </Button>
                            </div>
                        </Router>
                    </form>
                </div>
                <Box mt={8}>
                    <Copyright />
                </Box>
            </Container>
        </div>

    );
}

function Test() {
    return (
        <WorkspaceArea/>
    );
}

function Create() {
    const classes = useStyles();
    const [work, setWork] = React.useState(true);
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
                            to="/open"
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

        await history.push('/workspace/' + resp.unique_id);
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
                            to="/create"
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

        await history.push('/workspace/' + resp.unique_id);
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

        await history.push('/workspace/' + resp.unique_id);
    }
}

function Upload() {
    return <h2>Upload: TODO</h2>
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function refresh() {
    sleep(125).then(() => {
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