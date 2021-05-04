import * as EmailValidator from 'email-validator';
import { Link, useParams } from 'react-router-dom';
import { PubSub } from 'pubsub-js';
import * as React from 'react';
import { useIdleTimer } from 'react-idle-timer';
import useInterval from '@use-it/interval';
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    CssBaseline,
    IconButton,
    Menu,
    Snackbar,
    TextField,
    Toolbar,
    Typography,
} from '@material-ui/core';
import s from './images/s.png';
import clsx from 'clsx';
import Moment from 'react-moment';
import EmailIcon from '@material-ui/icons/Email';
import HelpIcon from '@material-ui/icons/Help';
import PeopleIcon from '@material-ui/icons/People';
import GetAppIcon from '@material-ui/icons/GetApp';
import { useHistory } from 'react-router-dom';

import {
    fetchAPI,
    getUrlFromEndpoint,
    PUBSUB_TOPIC,
    CLIENT_MSG_TYPE,
    SERVER_MSG_TYPE,
    PROTOCOL_HTTP,
    PROTOCOL_WS,
} from './api';
import { useStyles, Copyright } from './App';
import { WorkspaceArea } from './WorkspaceArea';

import { UserListDialog } from './components/UserListDialog';
import './css/styles.css';
import { WorkspaceNicknameChangeDialog } from './components/WorkspaceNicknameChangeDialog';
import { WorkspacePasswordChangeDialog } from './components/WorkspacePasswordChangeDialog';
import Alert from '@material-ui/lab/Alert';
import MaxWidthContainer from './components/MaxWidthContainer';
import { Helmet } from 'react-helmet-async';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const WorkspaceUniqueIdContext = React.createContext(undefined);
export const WorkspaceUserContext = React.createContext(undefined);

async function emailHandler(
    email,
    message,
    workspace,
    validEmail,
    setValidEmail,
    sent,
    setSent
) {
    if (!validEmail) {
        return null;
    }
    if (EmailValidator.validate(email.value)) {
        let name = workspace.unique_id;
        if (workspace.nickname !== null) {
            name = workspace.nickname;
        }

        let key = localStorage.getItem(workspace.unique_id);
        key = key !== null ? key : 'N/A';
        let resp = await fetchAPI('POST', 'send-mail/', {
            email: email.value,
            subject: 'Workspace Invitation',
            message:
                'Hello,\n\n' +
                'You are invited to join Workspace: ' +
                name +
                '\n' +
                'http://localhost:3000/Workspace/' +
                workspace.unique_id +
                '\n\n' +
                'Password: ' +
                key +
                '\n\n' +
                'Additional Notes: ' +
                message.value +
                '\n\n\n' +
                'Best wishes,\n' +
                'Synchronous',
        });

        if (resp.error) {
            if (JSON.stringify(resp.details).includes('200')) {
                setSent(true);
                setValidEmail(true);
            } else {
                console.log(JSON.stringify(resp.details));
                setValidEmail(false);
            }
        } else {
            setSent(true);
            setValidEmail(true);
        }
    } else {
        setValidEmail(false);
        console.log('invalid email address');
    }
}

function WorkspaceInfoBar(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [validEmail, setValidEmail] = React.useState(true);
    const [sent, setSent] = React.useState(false);
    const open = Boolean(anchorEl);
    const classes = useStyles();

    const workspace = props.workspace;
    const isLoggedIn = props.isLoggedIn;
    const updateNickname = props.onWorkspaceNicknameUpdate;
    const changePassword = props.onPasswordChange;

    const userList = props.userList;
    const userIdRef = props.userIdRef;

    const [isUserListDialogOpen, setUserListDialogOpen] = React.useState(false);
    const [isNicknameDialogOpen, setNicknameDialogOpen] = React.useState(false);
    const [isPasswordDialogOpen, setPasswordDialogOpen] = React.useState(false);

    const handleSnack = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSent(false);
    };

    const handleSnack2 = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setValidEmail(true);
    };

    const history = useHistory();

    const handleHelp = () => {
        history.push('/tutorial');
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        document.getElementById('email').value = '';
        document.getElementById('message').value = '';
    };

    const exportWorkspace = () => {
        const link = document.createElement('a');
        link.href = getUrlFromEndpoint(
            PROTOCOL_HTTP,
            `workspace/${workspace.unique_id}/zip/`
        );
        link.target = '_blank';
        link.click();
    };

    if (
        workspace === undefined ||
        workspace === null ||
        userIdRef === null ||
        userList === {}
    ) {
        return <div />;
    }

    let username;
    if (userList[userIdRef.current] !== null) {
        username = userList[userIdRef.current];
    }

    if (username === undefined) {
        return <div />;
    }

    const canChangePassword = workspace.is_password_protected && isLoggedIn;

    return (
        <AppBar position={'static'} className={clsx(classes.appBar)}>
            <Snackbar
                open={sent}
                autoHideDuration={6000}
                onClose={handleSnack}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnack} severity="success">
                    Email Sent
                </Alert>
            </Snackbar>
            <Snackbar
                open={!validEmail}
                autoHideDuration={6000}
                onClose={handleSnack2}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnack2} severity="error">
                    Email failed to send
                </Alert>
            </Snackbar>
            <Chat workspace={workspace} username={username} />
            <Toolbar
                className={classes.toolbar}
                style={{ justifyContent: 'space-between' }}
            >
                <Typography variant="h6">
                    &nbsp;&nbsp;&nbsp; Duration:{' '}
                    {
                        <Moment
                            date={workspace.created_at}
                            format="hh:mm:ss"
                            durationFromNow
                        />
                    }
                </Typography>

                <Button
                    color="secondary"
                    onClick={() => setNicknameDialogOpen(true)}
                    style={{ textTransform: 'none', color: 'white' }}
                >
                    <Typography variant="h4" className={classes.title}>
                        {workspace.nickname !== null
                            ? workspace.nickname
                            : workspace.unique_id}
                    </Typography>
                </Button>

                <WorkspaceNicknameChangeDialog
                    isOpen={isNicknameDialogOpen}
                    onRequestClose={() => setNicknameDialogOpen(false)}
                    onNicknameUpdateAsync={updateNickname}
                />

                <div>
                    {canChangePassword && (
                        <Button
                            color="secondary"
                            variant="contained"
                            edge="end"
                            onClick={() => setPasswordDialogOpen(true)}
                        >
                            Change password
                        </Button>
                    )}

                    {canChangePassword && (
                        <WorkspacePasswordChangeDialog
                            isOpen={isPasswordDialogOpen}
                            onRequestClose={() => setPasswordDialogOpen(false)}
                            onPasswordChangeAsync={changePassword}
                        />
                    )}

                    <IconButton
                        color="inherit"
                        edge="end"
                        onClick={() => setUserListDialogOpen(true)}
                    >
                        <Badge badgeContent={Object.keys(userList).length}>
                            <PeopleIcon />
                        </Badge>
                    </IconButton>

                    <IconButton
                        color="inherit"
                        edge="end"
                        onClick={exportWorkspace}
                    >
                        <GetAppIcon />
                    </IconButton>

                    <UserListDialog
                        isOpen={isUserListDialogOpen}
                        onRequestClose={() => setUserListDialogOpen(false)}
                        userList={userList}
                        currUserId={userIdRef.current}
                    />

                    <IconButton color="inherit" edge="end" onClick={handleMenu}>
                        <EmailIcon />
                    </IconButton>

                    <IconButton
                        color="secondary"
                        edge="end"
                        onClick={handleHelp}
                    >
                        <HelpIcon />
                    </IconButton>
                </div>

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
                            &nbsp;{'Invite Collaborators:'}
                            <TextField
                                variant="outlined"
                                margin="normal"
                                id="email"
                                label="Email"
                                error={!validEmail}
                                helperText={validEmail ? '' : 'Invalid Email'}
                                required
                                autoFocus
                            ></TextField>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                id="message"
                                label="Additional Message?"
                            ></TextField>
                            <Button
                                size="large"
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={() => {
                                    emailHandler(
                                        document.getElementById('email'),
                                        document.getElementById('message'),
                                        workspace,
                                        validEmail,
                                        setValidEmail,
                                        sent,
                                        setSent
                                    ).then();
                                    handleClose();
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    </Container>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

function Workspace() {
    const classes = useStyles();
    const { uniqueId } = useParams();
    const [workspace, setWorkspace] = React.useState(null);
    const [userListWs, setUserListWs] = React.useState(null);
    const [userList, setUserList] = React.useState({});
    const userIdRef = React.useRef(null);
    const tokenRef = React.useRef(null);

    // see https://stackoverflow.com/a/57856876 for async data retrieval
    const getWorkspace = async () => {
        tokenRef.current = localStorage.getItem(uniqueId);

        let newWorkspace = await fetchAPI(
            'GET',
            'workspace/' + uniqueId,
            null,
            tokenRef.current
        );

        // TODO: handle response errors
        // console.log(newWorkspace);

        /**
         * @property {number}  nickname               - Unique nickname of the workspace.
         * @property {string}  unique_id              - Unique ID (UUID v4) of the workspace.
         * @property {string}  created_at             - Timestamp of when workspace was created.
         * @property {string}  expiration_date        - Timestamp of when workspace will be deleted.
         * @property {boolean} anonymous_readable     - Whether read-only mode is allowed in the workspace.
         *     Should be false if the workspace is not password protected.
         * @property {boolean} is_password_protected  - Whether the workspace is password protected.
         * @property {string}  user_list_ws           - URI for the WebSocket used to send user list info.
         */
        setWorkspace(newWorkspace);
    };

    function updateInactivityText(prevUserList) {
        let userList = Object.assign({}, prevUserList);

        Object.keys(userList).forEach((userId) => {
            /**
             * @property {string}  nickname          - Unique nickname of the user.
             * @property {string}  color             - Hex color of the user.
             * @property {boolean} active            - Whether the user is active.
             * @property {number}  id                - Numerical ID of the user.
             * @property {string}  went_inactive_at  - Timestamp of when the user went inactive.
             */
            let user = userList[userId];

            if (user.active) {
                user.activity_text = 'Active';
            } else {
                const inactive_since = new Date(user.went_inactive_at);
                const millis_inactive = Date.now() - inactive_since.getTime();
                const secs_inactive = Math.round(millis_inactive / 1000);
                user.activity_text = `Inactive for ${secs_inactive} sec`;
            }
        });

        return userList;
    }

    const userListConnect = () => {
        if (workspace.error) {
            return;
        }

        let wsUri = workspace['ws'];

        const options = {
            connectionTimeout: 1000,
        };
        let ws = new ReconnectingWebSocket(
            getUrlFromEndpoint(PROTOCOL_WS, wsUri),
            [],
            options
        );

        ws.onmessage = (event) => {
            let data = JSON.parse(event.data);
            PubSub.publish(data.type, data);

            if (!Object.values(SERVER_MSG_TYPE).includes(data.type)) {
                console.error('Unexpected server msg type: ' + data.type);
            }
        };

        ws.onopen = () => {
            setUserListWs(ws);

            if (tokenRef.current !== null) {
                const authPayload = {
                    type: 'auth',
                    Authorization: tokenRef.current,
                };

                ws.send(JSON.stringify(authPayload));
                console.log('sent authorization payload');
            }
        };
    };

    const sendActivityMessage = (active) => {
        if (userListWs !== null) {
            userListWs.send(
                JSON.stringify({
                    type: CLIENT_MSG_TYPE.ACTIVITY,
                    isActive: active,
                })
            );
        }
    };

    useIdleTimer({
        timeout: 1000 * 3, // in milliseconds
        onIdle: () => sendActivityMessage(false),
        onActive: () => sendActivityMessage(true),
    });

    // re-render inactivity text to re-render everything every second
    useInterval(() => {
        setUserList((ul) => updateInactivityText(ul));
    }, 1000);

    React.useEffect(() => {
        if (workspace === null) {
            getWorkspace().then();
        } else if (userListWs === null) {
            userListConnect();
        }

        let pubSubTokens = [];
        let token = PubSub.subscribe(SERVER_MSG_TYPE.USER_LIST, (msg, data) => {
            const newUserList = data['user_list'];
            setUserList(updateInactivityText(newUserList));
        });
        pubSubTokens.push(token);

        token = PubSub.subscribe(SERVER_MSG_TYPE.CURRENT_USER, (msg, data) => {
            userIdRef.current = data['user_id'];
        });
        pubSubTokens.push(token);

        token = PubSub.subscribe(
            PUBSUB_TOPIC.WS_SEND_MSG_TOPIC,
            (msg, data) => {
                if (userListWs !== null) {
                    userListWs.send(JSON.stringify(data));
                }
            }
        );
        pubSubTokens.push(token);

        return function cleanup() {
            pubSubTokens.forEach((token) => PubSub.unsubscribe(token));
        };
    });

    async function updateNickname(new_nickname) {
        let resp = await fetchAPI(
            'PATCH',
            'workspace/' + uniqueId + '/',
            {
                nickname: new_nickname,
            },
            tokenRef.current
        );
        if (resp === null) {
            throw new Error('Nickname failed to set, no response.');
        } else if ('error' in resp) {
            console.error(resp.details);
            throw new Error('Nickname failed to set.');
        } else {
            await getWorkspace();
        }
    }

    async function changePassword(new_password) {
        let resp = await fetchAPI(
            'PATCH',
            'workspace/' + uniqueId + '/password/',
            {
                password: new_password,
            },
            tokenRef.current
        );
        if (resp === null) {
            throw new Error('Password failed to set, no response.');
        } else if ('error' in resp) {
            console.error(resp.details);
            throw new Error('Password failed to set.');
        } else {
            if (new_password === '') {
                tokenRef.current = null;
                localStorage.removeItem(uniqueId);
            }
            await getWorkspace();
        }
    }

    if (workspace !== null && workspace.error) {
        return (
            <Container component="main" maxWidth="xs">
                <Helmet>
                    <title>Workspace</title>
                </Helmet>
                <CssBaseline />
                <Box mt={4}></Box>
                <div className={classes.paper}>
                    <Avatar alt="s" src={s} className={classes.sizeAvatar} />
                    <Box mt={4}></Box>
                    <Typography component="h2" variant="h5">
                        You do not have access to this workspace
                    </Typography>
                    <Box mt={2}></Box>
                    <Button
                        component={Link}
                        to={'/open'}
                        size="large"
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Return to open workspace
                    </Button>
                </div>
                <Box mt={4}>
                    <Copyright />
                </Box>
            </Container>
        );
    }

    return (
        <MaxWidthContainer
            component="main"
            disableGutters={true}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: '100vw',
            }}
        >
            <Helmet>
                <title>Workspace</title>
            </Helmet>
            <WorkspaceInfoBar
                workspace={workspace}
                isLoggedIn={tokenRef.current !== null}
                onWorkspaceNicknameUpdate={updateNickname}
                onPasswordChange={changePassword}
                userList={userList}
                userIdRef={userIdRef}
            />

            <WorkspaceUniqueIdContext.Provider
                value={workspace === null ? undefined : workspace.unique_id}
            >
                <WorkspaceUserContext.Provider
                    value={userList[userIdRef.current]}
                >
                    <WorkspaceArea />
                </WorkspaceUserContext.Provider>
            </WorkspaceUniqueIdContext.Provider>
        </MaxWidthContainer>
    );
}

function Chat(props) {
    // TODO: chat
    return null;
}

export default Workspace;
