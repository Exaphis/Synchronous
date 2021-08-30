import * as React from "react";
import {
    Grid,
    Box,
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Typography,
    Container,
    Menu,
    MenuItem,
    IconButton,
    InputLabel,
    Input,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import "react-pro-sidebar/dist/css/styles.css";
import {
    BrowserRouter,
    Link,
    Route,
    Switch,
    useHistory,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./css/styles.css";
import "./css/App.css";

import logo from "./images/logo.png";
import logoIcon from "./images/s.png";
import Workspace from "./Workspace";
import { fetchAPI } from "./api";
import Tutorial from "./Tutorial";

export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/create">
                    <CreateWorkspace />
                </Route>
                <Route exact path="/open">
                    <OpenWorkspace />
                </Route>
                <Route exact path="/">
                    <SignIn />
                </Route>
                <Route exact path="/workspace/:uniqueId">
                    <Workspace />
                </Route>
                <Route exact path="/tutorial">
                    <Tutorial />
                </Route>
            </Switch>
        </BrowserRouter>
    );
}

function SignIn() {
    const classes = useStyles();
    return (
        <Container component="main" maxWidth="xs">
            <Helmet>
                <title>Synchronous</title>
            </Helmet>
            <CssBaseline />
            <div className={classes.paper}>
                <img
                    alt="Synchronous logo"
                    src={logo}
                    width="300"
                    height="300"
                />
                <Button
                    component={Link}
                    to={"/create"}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                >
                    Start a new workspace
                </Button>
                <Button
                    component={Link}
                    to={"/open"}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                >
                    Open a workspace
                </Button>
                <Button
                    component={Link}
                    to={"/tutorial"}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    className={classes.submit}
                >
                    About
                </Button>
            </div>
            <Box mt={8}>
                <Copyright />
            </Box>
        </Container>
    );
}

function CreateWorkspace() {
    const classes = useStyles();
    const [lastError, setLastError] = React.useState(null);
    const history = useHistory();
    const [allowReadOnly, setAllowReadOnly] = React.useState(false);
    const nameRef = React.useRef({ value: "" });
    const passwordRef = React.useRef({ value: "" });
    const importZipRef = React.useRef({ files: [] });

    function onReadOnlyChange(event) {
        setAllowReadOnly(event.target.checked);
    }

    async function handleCreateWorkspace(
        name,
        password,
        history,
        allowReadOnly,
        importZipFile
    ) {
        let resp = await fetchAPI("POST", "workspace/", {
            nickname: name,
            anonymous_readable: allowReadOnly,
            password: password,
        });

        const unique_id = resp.unique_id;

        if (password !== "") {
            let auth = await fetchAPI("POST", "api-token-auth/", {
                unique_id: unique_id,
                password: password,
            });
            localStorage.setItem(resp.unique_id, auth.token);
        }

        if (importZipFile !== null) {
            const formData = new FormData();
            formData.append("zip", importZipFile);

            // must not include headers for uploading form because it will be rejected
            // by nginx
            let resp = await fetchAPI(
                "POST",
                `workspace/${unique_id}/import/`,
                formData,
                localStorage.getItem(unique_id),
                null,
                false
            );
            console.log(resp);
        }

        await history.push("/workspace/" + resp.unique_id);
    }

    function onCreateClick() {
        handleCreateWorkspace(
            nameRef.current.value,
            passwordRef.current.value,
            history,
            allowReadOnly,
            importZipRef.current.files.length > 0
                ? importZipRef.current.files[0]
                : null
        )
            .then(() => setLastError(null))
            .catch((err) => setLastError(err));
    }

    return (
        <Container component="main" maxWidth="xs">
            <Helmet>
                <title>Create Workspace</title>
            </Helmet>
            <CssBaseline />
            <div className={classes.paper}>
                <Box mb={4}>
                    <Avatar
                        alt="Synchronous icon"
                        src={logoIcon}
                        className={classes.sizeAvatar}
                    />
                </Box>
                <Typography component="h2" variant="h5">
                    Create a Workspace
                </Typography>
                <TextField
                    inputRef={nameRef}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="Workspace Name (Optional)"
                    name="workspace"
                    autoComplete="workspace"
                    autoFocus
                    error={lastError !== null}
                    helperText={lastError !== null ? lastError.message : ""}
                />
                <TextField
                    inputRef={passwordRef}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="password"
                    label="Password (Optional)"
                    name="workspace"
                    type="password"
                    autoComplete="workspace"
                />
                <Grid container direction="column">
                    <FormControlLabel
                        control={<Checkbox color="primary" />}
                        id="check"
                        label="Allow View Only?"
                        onChange={onReadOnlyChange}
                    />
                    <Box mt={2} />
                    <InputLabel htmlFor="import-button">
                        Import with ZIP (optional)
                        <Input
                            inputRef={importZipRef}
                            id="import-button"
                            inputProps={{
                                accept: "application/zip",
                            }}
                            type="file"
                            disableUnderline={true}
                        />
                    </InputLabel>
                </Grid>
                <Box mt={2} />
                <Button
                    size="large"
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={onCreateClick}
                >
                    Create Workspace
                </Button>
                <Grid container>
                    <Grid item xs>
                        <Link to="/open" onClick={() => setLastError(null)}>
                            Existing Workspace?
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

function OpenWorkspace() {
    const classes = useStyles();
    const history = useHistory();
    const [lastOpenError, setLastOpenError] = React.useState(null);
    const [useId, setUseId] = React.useState(false);
    const [nameValue, setNameValue] = React.useState("");
    const passwordRef = React.useRef({ value: "" });
    const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
    const [previousWorkspaces, setPreviousWorkspaces] = React.useState(
        getPreviousWorkspaces()
    );

    function onUseIdChange(event) {
        setUseId(event.target.checked);
    }

    function getPreviousWorkspaces() {
        const prevWorkspaces = localStorage.getItem("prevWorkspaces");
        if (prevWorkspaces === null) {
            return {};
        }

        const prevWorkspacesObj = JSON.parse(prevWorkspaces);

        // all this to stop pycharm from showing an error later
        // could just return the JSON.parse value
        let out = {};
        for (let workspaceName in prevWorkspacesObj) {
            if (prevWorkspacesObj.hasOwnProperty(workspaceName)) {
                out[workspaceName] = prevWorkspacesObj[workspaceName];
            }
        }
        return out;
    }

    function addPreviousWorkspace(name, password, useId) {
        const newPrev = Object.assign({}, previousWorkspaces);
        newPrev[name] = {
            name: name,
            // password: password,
            // don't store password in plaintext
            useId: useId,
        };

        setPreviousWorkspaces(newPrev);

        localStorage.setItem("prevWorkspaces", JSON.stringify(newPrev));
    }

    function handlePrevWorkspaceDelete(event, name) {
        event.stopPropagation();

        if (name in previousWorkspaces) {
            const newPrev = Object.assign({}, previousWorkspaces);
            delete newPrev[name];
            setPreviousWorkspaces(newPrev);
            localStorage.setItem("prevWorkspaces", JSON.stringify(newPrev));
        }
    }

    async function handleOpenWorkspace(name, password, history, useId) {
        // let any errors thrown by fetchAPI get caught later
        let uniqueId = name;
        if (!useId) {
            let resp = await fetchAPI(
                "GET",
                "workspace/nickname/?nickname=" + name
            );
            uniqueId = resp["unique_id"];
        }

        if (password === "") {
            let resp = await fetchAPI("GET", "workspace/" + uniqueId);
            addPreviousWorkspace(name, password, useId);
            await history.push("/workspace/" + resp.unique_id);
        } else {
            const resp = await fetchAPI("POST", "api-token-auth/", {
                unique_id: uniqueId,
                password: password,
            });

            localStorage.setItem(uniqueId, resp.token);
            addPreviousWorkspace(name, password, useId);
            await history.push("/workspace/" + uniqueId);
        }

        return true;
    }

    function onOpenClick() {
        handleOpenWorkspace(
            nameValue,
            passwordRef.current.value,
            history,
            useId
        )
            .then(() => setLastOpenError(null))
            .catch((error) => {
                setLastOpenError(error);
            });
    }

    function handleMenuClick(event) {
        setMenuAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setMenuAnchorEl(null);
    }

    function handleMenuItemClick(workspaceObj) {
        setNameValue(workspaceObj["name"]);
        setUseId(workspaceObj["useId"]);
        console.log(workspaceObj);
        handleMenuClose();
    }

    const prevWorkspaceMenuBox = (
        <Box mt={4} mb={4}>
            <Helmet>
                <title>Open Workspace</title>
            </Helmet>
            <Button variant="contained" onClick={handleMenuClick}>
                Open Previous Workspace
            </Button>
            <Menu
                id="prev-workspace-menu"
                anchorEl={menuAnchorEl}
                keepMounted
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                {Object.keys(previousWorkspaces).length === 0 ? (
                    <MenuItem onClick={handleMenuClose}>
                        No previous workspaces
                    </MenuItem>
                ) : (
                    Object.values(previousWorkspaces).map((workspaceObj) => (
                        <MenuItem
                            key={workspaceObj["name"]}
                            onClick={() => handleMenuItemClick(workspaceObj)}
                        >
                            {workspaceObj["name"]}
                            <IconButton
                                onClick={(event) =>
                                    handlePrevWorkspaceDelete(
                                        event,
                                        workspaceObj["name"]
                                    )
                                }
                            >
                                <DeleteIcon />
                            </IconButton>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </Box>
    );

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Box mb={4}>
                    <Avatar
                        alt="Synchronous icon"
                        src={logoIcon}
                        className={classes.sizeAvatar}
                    />
                </Box>
                <Typography component="h2" variant="h5">
                    Open Existing Workspace
                </Typography>
                <Grid container>
                    <TextField
                        value={nameValue}
                        onChange={(event) => setNameValue(event.target.value)}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        label={useId ? "Workspace ID" : "Workspace Name"}
                        name="workspace"
                        autoComplete="workspace"
                        autoFocus
                        error={lastOpenError !== null}
                        helperText={lastOpenError ? lastOpenError.message : ""}
                        required
                    />
                    <FormControlLabel
                        control={<Checkbox color="primary" />}
                        id="check"
                        label="Use ID?"
                        checked={useId}
                        onChange={onUseIdChange}
                    />
                </Grid>
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    inputRef={passwordRef}
                    label="Password (if applicable)"
                    name="workspace"
                    type="password"
                    autoComplete="workspace"
                />
                <Button
                    size="large"
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={onOpenClick}
                >
                    Open
                </Button>

                {prevWorkspaceMenuBox}

                <Grid container>
                    <Grid item xs>
                        <Link to="/create">Need a new workspace?</Link>
                    </Grid>
                </Grid>
            </div>
            <Box mt={16}>
                <Copyright />
            </Box>
        </Container>
    );
}

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {"Copyright © Synchronous "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    );
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
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
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    title: {
        flexGrow: 1,
    },
}));

export { useStyles, Copyright };
