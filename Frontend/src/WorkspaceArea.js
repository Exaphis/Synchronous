import {v4 as uuidv4} from "uuid";
import {AppBar, Container, IconButton, Tab, Tabs, Toolbar} from "@material-ui/core";
import * as React from "react";
import {useRef, useState} from "react";
import {Rnd} from "react-rnd";
import * as rps from "react-pro-sidebar";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from '@material-ui/icons/Close';
import MinimizeIcon from '@material-ui/icons/Minimize';

import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'




const { DashboardModal, useUppy } = require('@uppy/react')
const DefaultStore = require('@uppy/store-default')




function AppTitleBar(props) {
    const title = props.title !== undefined ? props.title : "Untitled Window";
    return (
        <div style={{
            height: '2em',
            backgroundColor: 'darkGray',
            display: 'flex'
        }} className="handle">
            <span style={{flexGrow: 1, height: '100%', display: 'inline-flex',
                alignItems: 'center', overflow: 'hidden'}}>
                { title }
            </span>
            <IconButton size="small" style={{ height: '100%'}} onClick={props.onMinimize}>
                <MinimizeIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" style={{height: '100%'}} onClick={props.onClose}>
                <CloseIcon fontSize="inherit"/>
            </IconButton>
        </div>
    );
}



function WorkspaceApp(props) {
    const uppy = useUppy(() => {
        return new Uppy({
            id:'uppy',
            autoProceed:false,
            allowMultipleUploads: true,
            debug: false,
            restrictions: {
                minFileSize:null,
                maxFileSize:2000000,
                maxTotalFileSize:null,
                maxNumberOfFiles: 3,
                minNumberOfFiles: null,
                allowedFileTypes: ['image/*','video/*', 'text*']
            },
            meta:{},
            onBeforeFileAdded: (currentFile, files) => currentFile,
            onBeforeUpload: (files) => {},
            locale: {},
            store: new DefaultStore(),
            infoTimeout:5000,

        })
        .use(Tus, { endpoint: 'https://tusd.tusdemo.net/files/' })
        
      })

    return (
        <div id={props.uuid} style={{
            backgroundColor: 'white',
            height: '100%',
            border: '2px solid gray',
            borderRadius: '5px',
            display: props.minimized ? 'none' : 'flex',
            flexDirection: 'column'
        }}>
            <AppTitleBar minimized={props.minimized} onClose={props.onClose}
                         onMinimize={props.onMinimize}/>
            <iframe style={{flexGrow: 1, pointerEvents: props.pointerEventsEnabled ? 'auto' : 'none'}}
                    title={props.uuid} //src='https://google.com?igu=1'
                    />
                    
                <DashboardModal uppy={uppy} plugins={['tus']} />
        </div>
    )
}


function WorkspaceTab(props) {
    const [apps, setApps] = useState({});
    const [pointerEventsEnabled, setPointerEventsEnabled] = useState(true);
    const [topAppUuid, setTopAppUuid] = useState();

    // contains the states (i.e. position + size) of each app
    const appStatesRef = useRef({});

    function addApp() {
        setApps((apps) => {
            const uuid = uuidv4();

            function setMinimized(minimizedUpdater) {
                setApps((prevApps) => {
                    let apps = Object.assign({}, prevApps);
                    apps[uuid].minimized = minimizedUpdater(apps[uuid].minimized);
                    return apps;
                });
            }

            appStatesRef.current[uuid] = {
                x: 0,
                y: 0,
                width: 'auto',
                height: 'auto'
            };

            // nested dict
            return {...apps,
                [uuid]: {
                    id: uuid,
                    minimized: false,
                    switchMinimized: function switchMinimized() {
                        setMinimized(minimized => !minimized);
                    },
                    onMinimize: function onMinimize() {
                        setMinimized(() => true);
                    },
                    onClose: function onClose() {
                        delete appStatesRef.current[uuid];
                        setApps((prevApps) => {
                            let apps = Object.assign({}, prevApps);
                            delete apps[uuid];
                            return apps;
                        });
                    },
                }
            };
        });
    }

    const appComponents = Object.values(apps).map((app) => {
        return (
            <Rnd
                key={app.id}
                bounds='parent'
                onDragStart={(e, data) => {
                    setPointerEventsEnabled(false);
                    setTopAppUuid(app.id);
                }}
                onDragStop={(e, data) => {
                    setPointerEventsEnabled(true);
                    const appState = appStatesRef.current[app.id];
                    appState.x = data.x;
                    appState.y = data.y;
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    const appState = appStatesRef.current[app.id];
                    appState.width = ref.style.width;
                    appState.height = ref.style.height;
                    // position can also change in resizing when moving the top left corner
                    appState.x = position.x;
                    appState.y = position.y;
                }}
                default={appStatesRef.current[app.id]}
                dragHandleClassName="handle"
                minHeight='30px'  // how to not use magic constants?
                minWidth='50px'
                style={{     // change z index to prioritize recently selected app
                    zIndex: topAppUuid === app.id ? '1' : 'auto'
                }}
            >
                <WorkspaceApp minimized={app.minimized} onClose={app.onClose}
                              onMinimize={app.onMinimize} uuid={app.id}
                              pointerEventsEnabled={pointerEventsEnabled} />
            </Rnd>
        );
    });

    return (
        <div style={{
            backgroundColor: 'lightGray',
            height: '100%',
            width: '100%',
            // use display: none instead of returning null so any embedded iframes do not
            // have to reload when switching tabs
            // use flex so the appComponents can resize to maximum width allowed
            display: props.hidden ? 'none' : 'flex'
        }}>
            <rps.ProSidebar>
                <rps.Menu>
                    <rps.MenuItem icon={<AddIcon />} onClick={addApp} >
                        Add app
                    </rps.MenuItem>
                    {
                        Object.values(apps).map((app) => (
                            app.minimized &&
                            <rps.MenuItem key={app.id} onClick={app.switchMinimized}
                                icon={
                                    <IconButton component="div"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    app.onClose();
                                                }}
                                                color="inherit">
                                        <CloseIcon />
                                    </IconButton>
                                } >
                                {app.id}
                            </rps.MenuItem>
                        ))
                    }
                </rps.Menu>
            </rps.ProSidebar>

            <div style={{flexGrow: 1}}>
                { appComponents }
            </div>

        </div>
    )
}


function WorkspaceArea() {
    const [tabs, setTabs] = React.useState([]);
    const [currTab, setCurrTab] = React.useState(-1);

    const handleTabChange = (event, newValue) => {
        setCurrTab(newValue);
    };

    function closeTab(event, id) {
        // https://stackoverflow.com/a/63277341
        // prevent close press from propagating to tab button
        event.stopPropagation();

        // use function to avoid capturing the current value of currTab
        // within closure
        setCurrTab(currTab => Math.min(currTab, tabs.length - 2));

        setTabs(tabs.filter(tab => tab.id !== id));
    }

    function createNewTab() {
        const uuid = uuidv4();

        setCurrTab(tabs.length);  // new tab will be appended to the end

        setTabs((tabs) => {
            // State must not be modified (even in updater function!)
            // Must create a copy of the object instead and modify that.
            // See https://reactjs.org/docs/react-component.html#setstate
            // (state is a reference to the component state at the time the change is being applied.
            // It should not be directly mutated)

            // Using spread syntax to create copy with new object appended
            return [...tabs, {id: uuid}];
        });
    }

    let tabComponents = <p>You have no tabs. How about creating one?</p>;
    if (tabs.length > 0) {
        tabComponents = tabs.map((tab, tabIdx) => {
            return <WorkspaceTab key={tab.id} hidden={currTab !== tabIdx}/>;
        });
    }

    return (
        <Container maxWidth="xl" disableGutters={true}>
            <AppBar position="static">
                <Toolbar>
                    <Tabs value={currTab} edge="start" onChange={handleTabChange}>
                        {
                            tabs.length === 0 ? null : tabs.map((tab, tabIdx) => {
                                const labelText = "Tab " + tabIdx.toString();
                                return (
                                    <Tab key={tab.id} label={
                                        <span> {labelText}
                                            <IconButton component="div"  // https://stackoverflow.com/a/63277341
                                                        onClick={(event) => closeTab(event, tab.id)}
                                                        color="inherit">
                                               <CloseIcon />
                                            </IconButton>
                                        </span>
                                    }/>
                                );
                            })
                        }
                    </Tabs>
                    <IconButton color="inherit" edge="end" onClick={createNewTab}>
                        <AddIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <div style={{ height: "100vh" }}>
                { tabComponents }
            </div>
        </Container>
    )
}

export { WorkspaceArea };