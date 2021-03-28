import {v4 as uuidv4} from "uuid";
import {AppBar, Container, IconButton, Tab, Tabs, Toolbar} from "@material-ui/core";
import * as React from "react";
import {useRef, useState} from "react";
import {Rnd} from "react-rnd";
import * as rps from "react-pro-sidebar";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from '@material-ui/icons/Close';
import MinimizeIcon from '@material-ui/icons/Minimize';


function AppTitleBar(props) {
    const title = props.title !== undefined ? props.title : "Untitled Window";
    return (
        <div style={{
            height: '2em',
            backgroundColor: 'darkGray',
            display: 'flex'
        }} className="handle">
            <span style={{flexGrow: 1, height: '100%', display: 'inline-flex', alignItems: 'center', overflow: 'hidden'}}>
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
            <iframe style={{flexGrow: 1, display: props.minimized ? 'none' : 'block'}}
                    src="https://google.com?igu=1"
                    title={props.uuid}/>
        </div>
    )
}


function WorkspaceTab(props) {
    const [apps, setApps] = useState({});
    const [, setRefresh] = useState(false);

    // contains the states (i.e. position + size) of each app
    const appStatesRef = useRef({});

    function addApp() {
        setApps((apps) => {
            const uuid = uuidv4();

            function switchMinimized() {
                apps[uuid].minimized = !apps[uuid].minimized;
                setRefresh(e => !e);
            }

            function onMinimize() {
                apps[uuid].minimized = true;
                setRefresh(e => !e);
            }

            function onClose() {
                delete apps[uuid];
                delete appStatesRef.current[uuid];

                setRefresh(e => !e);
            }

            appStatesRef.current[uuid] = {x: 0, y: 0, width: 'auto', height: 'auto'};

            // nested dict
            apps[uuid] = {
                uuid: uuid,
                minimized: false,
                switchMinimized: switchMinimized,
                onMinimize: onMinimize,
                onClose: onClose,
            };

            setRefresh(e => !e);
            props.setRefresh(e => !e);

            return apps;
        });
    }

    const appComponents = Object.values(apps).map((app) => {
        return (
            <Rnd
                key={app.uuid}
                bounds='parent'
                onDragStop={(e, data) => {
                    const appState = appStatesRef.current[app.uuid];
                    appState.x = data.x;
                    appState.y = data.y;
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    const appState = appStatesRef.current[app.uuid];
                    appState.width = ref.style.width;
                    appState.height = ref.style.height;
                    // position can also change in resizing when moving the top left corner
                    appState.x = position.x;
                    appState.y = position.y;
                }}
                default={appStatesRef.current[app.uuid]}
                dragHandleClassName="handle"
                minHeight='30px'  // how to not use magic constants?
                minWidth='50px'
            >
                <WorkspaceApp minimized={app.minimized} onClose={app.onClose}
                              onMinimize={app.onMinimize} uuid={app.uuid}/>
            </Rnd>
        );
    });

    // TODO: change z index to prioritize selected app

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
                            <rps.MenuItem icon={
                                <IconButton component="div"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                app.onClose();
                                            }}
                                            color="inherit">
                                    <CloseIcon />
                                </IconButton>}
                                          key={app.uuid}
                                          onClick={app.switchMinimized}>
                                {app.uuid}
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
    const [, setRefresh] = React.useState(false);
    const [tabs, setTabs] = React.useState([]);
    const [currTab, setCurrTab] = React.useState(-1);

    const handleTabChange = (event, newValue) => {
        setCurrTab(newValue);
    };

    const createNewTab = () => {
        const uuid = uuidv4();

        setTabs((tabs) => {
            function closeTab(event) {
                // https://stackoverflow.com/a/63277341
                // prevent close press from propagating to tab button
                event.stopPropagation();

                for (let i = 0; i < tabs.length; i++) {
                    if (tabs[i].uuid === uuid) {
                        tabs.splice(i, 1);
                        break;
                    }
                }

                // use function to avoid capturing the current value of currTab
                // within closure
                setCurrTab(currTab => Math.min(currTab, tabs.length - 1));
                setRefresh(e => !e);
            }

            tabs.push({
                uuid: uuid,
                closeTab: closeTab
            });

            return tabs;
        })

        setCurrTab(tabs.length - 1);
        setRefresh(e => !e);
    }

    let tabComponents = <p>You have no tabs. How about creating one?</p>;
    if (tabs.length > 0) {
        tabComponents = tabs.map((tab, tabIdx) => {
            return <WorkspaceTab key={tab.uuid} setRefresh={setRefresh}
                          hidden={currTab !== tabIdx}/>;
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
                                    <Tab key={tab.uuid} label={
                                        <span> {labelText}
                                            <IconButton component="div"  // https://stackoverflow.com/a/63277341
                                                        onClick={(event) => tab.closeTab(event)}
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