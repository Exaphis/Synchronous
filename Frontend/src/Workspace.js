import {Link, useParams} from "react-router-dom";
import * as React from "react";
import {useIdleTimer} from "react-idle-timer";
import {useState} from "react";
import useInterval from "@use-it/interval";
import {
    AppBar, Avatar, Box, Button, Container, CssBaseline,
    Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Menu, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Toolbar, Typography
} from "@material-ui/core";
import s from "./s.png";
import clsx from "clsx";
import Moment from "react-moment";
import EmailIcon from "@material-ui/icons/Email";

import { fetchAPI, getUrlFromEndpoint } from './api';
import { useStyles, Copyright } from './App';


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


function Workspace() {
    // TODO: allow modify nickname
    const classes = useStyles();
    const { uniqueId } = useParams();  // destructuring assignment
    const [ workspace, setWorkspace ] = React.useState(null);
    const [ userListWs, setUserListWs ] = React.useState(null);
    const [ userList, setUserList ] = React.useState({});
    const userIdRef = React.useRef(null);
    const tokenRef = React.useRef(null);
    // const [auth, setAuth] = React.useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [ validEmail, setValidEmail ] = React.useState(true)

    // for changing nickname in NicknameCell
    const [ nameDialogOpen, setNameDialogOpen ] = React.useState(false);
    const nicknameFieldValue = React.useRef('');

    //console.log(JSON.stringify(userList));

    // const handleChange = (event) => {
    //     setAuth(event.target.checked);
    // };

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
    const [, setRefresh] = useState(false);
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

                <Dialog key="dialog" open={nameDialogOpen} onClose={closeNameDialog} aria-labelledby="form-dialog-title">
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

export default Workspace;
