import {
    AppBar,
    Box,
    Button,
    Container,
    Grid,
    IconButton,
    Paper,
    Snackbar,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from "@material-ui/core";
import * as React from "react";
import { Rnd } from "react-rnd";
import { PubSub } from "pubsub-js";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import MinimizeIcon from "@material-ui/icons/Minimize";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";
import Alert from "@material-ui/lab/Alert";

import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import DashboardModal from "@uppy/react/lib/DashboardModal";
import { useUppy } from "@uppy/react";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

import { WorkspaceUniqueIdContext, WorkspaceUserContext } from "./Workspace";
import {
    APP_TYPE,
    appendQueryParameter,
    CLIENT_MSG_TYPE,
    PUBSUB_TOPIC,
    SERVER_MSG_TYPE,
    translateAppUrl,
    TUSD_URL,
} from "./api";
import MaxWidthContainer from "./components/MaxWidthContainer";
import { Sidebar } from "./components/Sidebar";
import { useResizeDetector } from "react-resize-detector";

function AppTitleBar(props) {
    const title = props.title !== undefined ? props.title : "Untitled Window";
    return (
        <Grid
            style={{
                height: "2em",
                backgroundColor: "darkGray",
                display: "flex",
                pointerEvents: "auto", // idk why this is needed, but if not minimize button doesn't work anymore
            }}
            className="handle"
            ref={props.handleRef}
        >
            <span
                style={{
                    flexGrow: 1,
                    height: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    overflow: "hidden",
                }}
            >
                {title}
            </span>
            <IconButton
                size="small"
                style={{ height: "100%" }}
                onClick={props.onMinimize}
            >
                <MinimizeIcon fontSize="inherit" />
            </IconButton>
            <IconButton
                size="small"
                style={{ height: "100%" }}
                onClick={props.onMaximize}
            >
                <ZoomOutMapIcon fontSize="inherit" />
            </IconButton>
            <IconButton
                size="small"
                style={{ height: "100%" }}
                onClick={props.onClose}
            >
                <CloseIcon fontSize="inherit" />
            </IconButton>
        </Grid>
    );
}

function FileUploadAppContents() {
    const workspaceUniqueId = React.useContext(WorkspaceUniqueIdContext);
    const [fileComponents, setFileComponents] = React.useState([]);

    const uppy = useUppy(() => {
        return new Uppy({
            restrictions: {
                maxFileSize: 10485760, // 10 mebibytes (should be same as tusd)
            },
            meta: {
                workspaceUniqueId: workspaceUniqueId,
            },
            onBeforeUpload: (files) => {
                // modify all file ids in order to allow for duplicate file uploads
                // segregated by workspace ID
                const updatedFiles = {};
                Object.keys(files).forEach((fileId) => {
                    const newFileId = fileId + `/${workspaceUniqueId}`;
                    updatedFiles[newFileId] = {
                        ...files[fileId],
                        id: newFileId,
                    };
                });
                return updatedFiles;
            },
        }).use(Tus, { endpoint: TUSD_URL });
    });

    React.useEffect(() => {
        /**
         * @param {Object}   data                      - Websocket message sent from the server.
         * @param {Object[]} data.file_list            - List of files containing created_at, file_id, and name.
         * @param {string} data.file_list[].file_id    - File ID generated by tus for the file.
         * @param {string} data.file_list[].name       - Original name of the file when uploaded.
         * @param {string} data.file_list[].created_at - Timestamp of when the file was uploaded.
         */
        let token = PubSub.subscribe(SERVER_MSG_TYPE.FILE_LIST, (msg, data) => {
            console.log("file list received:");
            console.log(data);
            setFileComponents(
                data.file_list.map((file) => {
                    return (
                        <Box my={5} key={file.file_id}>
                            <Paper>
                                <Grid container style={{ display: "flex" }}>
                                    <Grid
                                        item
                                        style={{
                                            display: "flex",
                                            flexGrow: 1,
                                            marginLeft: "1em",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography variant="h5" gutterBottom>
                                            {file.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            color="inherit"
                                            href={TUSD_URL + file.file_id}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            <CloudDownloadIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    );
                })
            );
        });

        return function cleanup() {
            PubSub.unsubscribe(token);
        };
    });

    React.useEffect(() => {
        PubSub.publish(PUBSUB_TOPIC.WS_SEND_MSG_TOPIC, {
            type: CLIENT_MSG_TYPE.FILE_LIST_REQUEST,
        });
    }, []);

    const [isModalOpen, setModalOpen] = React.useState(false);

    return (
        <Container maxWidth="md">
            <Box my={5}>
                {fileComponents}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModalOpen(true)}
                >
                    Share a file
                </Button>
                <DashboardModal
                    uppy={uppy}
                    closeModalOnClickOutside
                    open={isModalOpen}
                    onRequestClose={() => setModalOpen(false)}
                />
            </Box>
        </Container>
    );
}

function PadAppContents(props) {
    const currUser = React.useContext(WorkspaceUserContext);
    const nickname = encodeURIComponent(currUser.nickname);
    const color = encodeURIComponent(currUser.color);

    let padUrl =
        props.padUrl +
        `?showChat=false&userName=${nickname}&userColor=${color}`;

    return <iframe style={{ flexGrow: 1 }} title={props.uuid} src={padUrl} />;
}

function WhiteboardAppContents(props) {
    const currUser = React.useContext(WorkspaceUserContext);
    const nickname = encodeURIComponent(currUser.nickname);

    let spaceUrl = appendQueryParameter(props.padUrl, "nickname", nickname);

    return <iframe style={{ flexGrow: 1 }} title={props.uuid} src={spaceUrl} />;
}

function TemplateAppContents(props) {
    return (
        <iframe
            style={{ flexGrow: 1 }}
            title={props.uuid}
            src="https://google.com?igu=1"
        />
    );
}

function OfflinePadAppContents(props) {
    return (
        <iframe
            style={{ flexGrow: 1 }}
            title={props.uuid}
            src="http://justnotepad.com/"
        />
    );
}

function WorkspaceApp(props) {
    const {
        minimized,
        onClose,
        onMinimize,
        onMaximize,
        name,
        children,
        requestTop,
        pointerEventsEnabled,
        handleRef,
    } = props;
    const appContainerRef = React.useRef();

    React.useEffect(() => {
        function onBlur(e) {
            if (
                appContainerRef.current &&
                appContainerRef.current.contains(document.activeElement)
            ) {
                requestTop();
            }
        }

        window.addEventListener("blur", onBlur);

        return function cleanup() {
            window.removeEventListener("blur", onBlur);
        };
    }, [requestTop]);

    return (
        <div
            id={props.uuid}
            ref={appContainerRef}
            style={{
                backgroundColor: "white",
                height: "100%",
                //border: "2px solid gray",
                //borderRadius: "5px",
                display: "flex",
                // fixes firefox rendering of iframes (vs. display: none)
                // firefox would have problems with rendering iframes (i.e. etherpad) when display is none.
                // instead, visibility: hidden should work the same.
                visibility: minimized ? "hidden" : "visible",
                // change position so events can be fired on apps behind them
                position: minimized ? "absolute" : "static",
                top: minimized ? "-5000px" : "auto",
                flexDirection: "column",
                pointerEvents: pointerEventsEnabled ? "auto" : "none",
            }}
        >
            <AppTitleBar
                minimized={minimized}
                onClose={onClose}
                onMinimize={onMinimize}
                onMaximize={onMaximize}
                title={name}
                handleRef={handleRef}
            />
            {children}
        </div>
    );
}

function WorkspaceTab(props) {
    // contains the info + states (i.e. position + size) of each app
    const [apps, setApps] = React.useState({});
    const [pointerEventsEnabled, setPointerEventsEnabled] =
        React.useState(true);
    const [topAppUuid, setTopAppUuid] = React.useState();
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const appHandleRefs = React.useRef({});

    const status = async () => {
        // TODO: use websocket status instead
        // let response = await fetchAPI(
        //     'GET', 'heartbeat/');
        let response = {};
        response.details = 200;
        if (response.details !== 200) {
            if (localStorage.getItem("offline") === "false") {
                setOpen(true);
                setOpen2(false);
                localStorage.setItem("offline", "true");
            }
        } else if (localStorage.getItem("offline") === "true") {
            localStorage.setItem("offline", "false");
            console.log("regain");
            setOpen2(true);
            setOpen(false);
        }
    };

    let date = new Date();
    if (date.getSeconds() % 3 === 0) {
        status();
    }

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    const handleClose2 = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen2(false);
    };

    function setAppMinimized(appId, minimizedUpdater) {
        setApps((prevApps) => {
            let apps = Object.assign({}, prevApps);
            apps[appId].minimized = minimizedUpdater(apps[appId].minimized);
            if (!apps[appId].minimized) {
                setTopAppUuid(appId);
            }
            return apps;
        });
    }

    function setAppMaximized(appId, maximizedUpdater) {
        setApps((prevApps) => {
            let apps = Object.assign({}, prevApps);
            apps[appId].maximized = maximizedUpdater(apps[appId].maximized);

            return apps;
        });
    }

    React.useEffect(() => {
        PubSub.publish(PUBSUB_TOPIC.WS_SEND_MSG_TOPIC, {
            type: CLIENT_MSG_TYPE.APP_LIST_REQUEST,
            tabId: props.tabId,
        });

        PubSub.subscribe(SERVER_MSG_TYPE.APP_LIST, (msg, data) => {
            if (data["tab_id"] !== props.tabId) {
                return;
            }

            // data['app_list']:
            //     - list of apps
            //     - each app contains `type` (enum), `unique_id`, and `data`
            console.log("app list:");
            console.log(data["app_list"]);

            // must use function to avoid apps in the dependency array
            setApps((oldApps) => {
                let newApps = {};

                data["app_list"].forEach((serializedApp) => {
                    const appId = serializedApp["unique_id"];
                    const appData = serializedApp["data"];
                    const appType = serializedApp["app_type"];
                    const appName = serializedApp["name"];

                    if (appId in oldApps) {
                        newApps[appId] = oldApps[appId];
                    } else {
                        newApps[appId] = {
                            id: appId,
                            minimized: true,
                            maximized: false, // if true, app takes up as much space as possible
                            type: appType,
                            data: appData,
                            name: appName,
                            x: 100,
                            y: 100,
                            width: "auto",
                            height: "auto",
                            switchMinimized: () => {
                                setPointerEventsEnabled(true);
                                setAppMinimized(
                                    appId,
                                    (minimized) => !minimized
                                );
                            },
                            onMinimize: () => {
                                console.log("minimize");
                                setPointerEventsEnabled(true);
                                setAppMinimized(appId, () => true);
                            },
                            onClose: () => {
                                setPointerEventsEnabled(true);
                                PubSub.publish(PUBSUB_TOPIC.WS_SEND_MSG_TOPIC, {
                                    type: CLIENT_MSG_TYPE.DELETE_APP,
                                    tabId: props.tabId,
                                    appId: appId,
                                });
                            },
                            switchMaximized: () => {
                                setPointerEventsEnabled(true);
                                setAppMaximized(
                                    appId,
                                    (maximized) => !maximized
                                );
                            },
                        };
                    }
                });

                return newApps;
            });
        });
    }, [props.tabId]);

    let hasOffline;
    for (let app in apps) {
        if (apps[app].name === "Offline Pad") {
            if (!hasOffline) {
                hasOffline = true;
            } else {
                PubSub.publish(PUBSUB_TOPIC.WS_SEND_MSG_TOPIC, {
                    type: CLIENT_MSG_TYPE.DELETE_APP,
                    tabId: props.tabId,
                    appId: app,
                });
            }
        }
    }

    function addApp(type) {
        let name;
        if (type === APP_TYPE.PAD) {
            name = "Text pad";
        } else if (type === APP_TYPE.FILE_SHARE) {
            name = "File share";
        } else if (type === APP_TYPE.TEMPLATE) {
            name = "Template";
        } else if (type === APP_TYPE.OFFLINE_PAD) {
            let app;
            for (app in apps) {
                if (apps[app].name === "Offline Pad") {
                    return;
                }
            }
            name = "Offline Pad";
        } else if (type === APP_TYPE.WHITEBOARD) {
            name = "Whiteboard";
        } else {
            console.log("Unknown app type: " + type);
            return;
        }

        PubSub.publish(PUBSUB_TOPIC.WS_SEND_MSG_TOPIC, {
            type: CLIENT_MSG_TYPE.NEW_APP,
            tabId: props.tabId,
            appType: type,
            name: name,
        });
    }

    const onAppAreaResize = React.useCallback(
        (width, height) => {
            function triggerMouseEvent(node, evtType) {
                const evt = new MouseEvent(evtType, {
                    bubbles: true,
                    cancelable: true,
                });
                node.dispatchEvent(evt);
            }

            const oldTopAppUuid = topAppUuid;
            Object.keys(appHandleRefs.current).forEach((appId) => {
                if (appId in apps && !apps[appId].minimized) {
                    const appHandleRef = appHandleRefs.current[appId];
                    // simulate handler click in order to force react-draggable to update bounds check
                    // needed to update pos x,y=0 to the top left
                    // mousemove needed when expanding to not go past end of screen
                    // causes some lag when having many (3+) windows on screen when resizing
                    triggerMouseEvent(appHandleRef, "mousedown");
                    triggerMouseEvent(appHandleRef, "mousemove");
                    triggerMouseEvent(appHandleRef, "mouseup");
                } else {
                    delete appHandleRefs.current[appId];
                }
            });

            // ensure top app is not messed up by mouse events
            setTopAppUuid(oldTopAppUuid);
        },
        [apps, topAppUuid, setTopAppUuid]
    );

    const {
        width: appAreaWidth,
        height: appAreaHeight,
        ref: appAreaRef,
    } = useResizeDetector({ onResize: onAppAreaResize });

    const appComponents = Object.values(apps).map((app) => {
        let appContents;
        if (app.type === APP_TYPE.PAD) {
            const appData = app.data;
            const iframeUrl = translateAppUrl(appData["iframe_url"]);
            appContents = <PadAppContents padUrl={iframeUrl} />;
        } else if (app.type === APP_TYPE.FILE_SHARE) {
            appContents = <FileUploadAppContents />;
        } else if (app.type === APP_TYPE.OFFLINE_PAD) {
            appContents = <OfflinePadAppContents />;
        } else if (app.type === APP_TYPE.WHITEBOARD) {
            const appData = app.data;
            const iframeUrl = translateAppUrl(appData["iframe_url"]);
            appContents = <WhiteboardAppContents padUrl={iframeUrl} />;
        } else if (app.type === APP_TYPE.TEMPLATE) {
            appContents = <TemplateAppContents />;
        } else {
            console.error("invalid app type: " + app.type);
            console.error(typeof app.type);
        }

        function sendToTop() {
            setTopAppUuid(app.id);
        }

        return (
            <Rnd
                key={app.id}
                bounds={`#appArea-${props.tabId}`}
                size={{
                    // appAreaRef should now contain the reference to the apparea element
                    width: app.maximized ? appAreaWidth : app.width,
                    height: app.maximized ? appAreaHeight : app.height,
                }}
                position={{
                    x: app.maximized ? 0 : app.x,
                    y: app.maximized ? 0 : app.y,
                }}
                onDragStart={() => {
                    setPointerEventsEnabled(false);
                    sendToTop();
                }}
                onDragStop={(e, data) => {
                    setPointerEventsEnabled(true);

                    const newApps = Object.assign({}, apps);
                    const newApp = newApps[app.id];
                    newApp.x = data.x;
                    newApp.y = data.y;
                    setApps(newApps);
                }}
                onResizeStart={() => {
                    setPointerEventsEnabled(false);
                    sendToTop();
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    setPointerEventsEnabled(true);

                    const newApps = Object.assign({}, apps);
                    const newApp = newApps[app.id];
                    newApp.width = ref.style.width;
                    newApp.height = ref.style.height;
                    // position can also change in resizing when moving the top left corner
                    newApp.x = position.x;
                    newApp.y = position.y;
                    setApps(newApps);
                }}
                dragHandleClassName="handle"
                minHeight="200px" // how to not use magic constants?
                minWidth="50px"
                style={{
                    // change z index to prioritize recently selected app
                    zIndex: topAppUuid === app.id ? "1" : "auto",
                    // allow pointer events to pass through if it is minimized as the element
                    // will still be on top
                    pointerEvents: app.minimized ? "none" : "auto",
                }}
            >
                <WorkspaceApp
                    minimized={app.minimized}
                    onClose={app.onClose}
                    onMinimize={app.onMinimize}
                    onMaximize={app.switchMaximized}
                    uuid={app.id}
                    name={app.name}
                    requestTop={sendToTop}
                    pointerEventsEnabled={pointerEventsEnabled}
                    handleRef={(c) => {
                        appHandleRefs.current[app.id] = c;
                    }}
                >
                    {appContents}
                </WorkspaceApp>
            </Rnd>
        );
    });

    return (
        <div
            style={{
                backgroundColor: "lightGray",
                height: "100%",
                width: "100%",
                // use display: none instead of returning null so any embedded iframes do not
                // have to reload when switching tabs
                // use flex so the appComponents can resize to maximum width allowed
                display: "flex",
                position: props.hidden ? "absolute" : "static",
                left: props.hidden ? "-5000px" : "auto",
            }}
        >
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleClose} severity="error">
                    You have lost connection
                </Alert>
            </Snackbar>
            <Snackbar
                open={open2}
                autoHideDuration={6000}
                onClose={handleClose2}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleClose2} severity="success">
                    You have regained connection
                </Alert>
            </Snackbar>

            <Sidebar apps={apps} addApp={addApp} />

            <div
                style={{ flexGrow: 1 }}
                id={`appArea-${props.tabId}`}
                ref={appAreaRef}
            >
                {appComponents}
            </div>
        </div>
    );
}

function WorkspaceArea() {
    const [tabs, setTabs] = React.useState([]);
    const [currTab, setCurrTab] = React.useState(0);

    // if true, go to the end of the tab list once the a tab list is received
    const goToEndAfterCreation = React.useRef(false);

    React.useEffect(() => {
        const token = PubSub.subscribe(
            SERVER_MSG_TYPE.TAB_LIST,
            (msg, data) => {
                const tabList = data["tab_list"];
                setTabs(tabList);

                if (goToEndAfterCreation.current) {
                    setCurrTab(tabList.length - 1);
                    goToEndAfterCreation.current = false;
                } else {
                    if (
                        tabList.length > 0 &&
                        (currTab < 0 || currTab >= tabList.length)
                    ) {
                        setCurrTab(tabList.length - 1);
                    }
                }
            }
        );

        return function cleanup() {
            PubSub.unsubscribe(token);
        };
    }, [currTab]);

    const handleTabChange = (event, newValue) => {
        setCurrTab(newValue);
    };

    function closeTab(event, uniqueId) {
        // https://stackoverflow.com/a/63277341
        // prevent close press from propagating to tab button
        event.stopPropagation();

        // use function to avoid capturing the current value of currTab
        // within closure
        setCurrTab((currTab) =>
            Math.max(0, Math.min(currTab, tabs.length - 2))
        );

        PubSub.publish(PUBSUB_TOPIC.WS_SEND_MSG_TOPIC, {
            type: CLIENT_MSG_TYPE.DELETE_TAB,
            uniqueId: uniqueId,
        });
    }

    function createNewTab() {
        goToEndAfterCreation.current = true;
        PubSub.publish(PUBSUB_TOPIC.WS_SEND_MSG_TOPIC, {
            type: CLIENT_MSG_TYPE.NEW_TAB,
            name: "Unnamed tab",
        });
    }

    let tabComponents = (
        <div
            style={{
                backgroundColor: "lightGray",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/*<Typography variant={"h4"}>*/}
            {/*    Create a new tab using <AddIcon />*/}
            {/*</Typography>*/}
        </div>
    );
    if (tabs.length > 0) {
        tabComponents = tabs.map((tab, tabIdx) => {
            return (
                <WorkspaceTab
                    key={tab.unique_id}
                    tabId={tab.unique_id}
                    hidden={currTab !== tabIdx}
                />
            );
        });
    }

    return (
        <MaxWidthContainer
            component="main"
            disableGutters={true}
            style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
            <AppBar position={"static"}>
                <Toolbar variant={"dense"}>
                    <Tabs
                        value={currTab}
                        edge="start"
                        onChange={handleTabChange}
                    >
                        {tabs.length === 0
                            ? null
                            : tabs.map((tab) => {
                                  return (
                                      <Tab
                                          key={tab.unique_id}
                                          label={
                                              <div style={{ display: "flex" }}>
                                                  <span>{tab.name}</span>
                                                  <IconButton
                                                      component="div" // https://stackoverflow.com/a/63277341
                                                      onClick={(event) =>
                                                          closeTab(
                                                              event,
                                                              tab.unique_id
                                                          )
                                                      }
                                                      color="inherit"
                                                      style={{ padding: "0px" }}
                                                  >
                                                      <CloseIcon />
                                                  </IconButton>
                                              </div>
                                          }
                                      />
                                  );
                              })}
                    </Tabs>
                    <IconButton
                        color="inherit"
                        edge="end"
                        onClick={createNewTab}
                    >
                        <AddIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <div style={{ flexGrow: 1 }}>{tabComponents}</div>
        </MaxWidthContainer>
    );
}

export { WorkspaceArea };
