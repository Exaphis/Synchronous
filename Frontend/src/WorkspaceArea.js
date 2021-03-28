import {v4 as uuidv4} from "uuid";
import {AppBar, Button, Container, IconButton, Tab, Tabs, Toolbar} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import * as React from "react";
import {useRef, useState} from "react";
import {Rnd} from 'react-rnd';
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
            <IconButton size="small" style={{ height: '100%'}}>
                <MinimizeIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" style={{height: '100%'}}>
                <CloseIcon fontSize="inherit" />
            </IconButton>
        </div>
    );
}


function WorkspaceTab(props) {
    const newAppIdRef = useRef(0);
    const [apps, setApps] = useState({});
    const [, setRefresh] = useState(false);
    const deletedRef = useRef({})

    const appStateRef = useRef({x: 0, y: 0, width: 'auto', height: 'auto'});

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

            const getMinimized = () => {
                console.log("called getMinimized" + newAppId)
                console.log(apps[newAppId].minimized)
                return apps[newAppId].minimized
            }

            const setMinimized = (minimized) => {
                console.log("called setMinimized " + newAppId)
                console.log("previous: " + apps[newAppId].minimized)
                apps[newAppId].minimized = minimized
                console.log("next: " + apps[newAppId].minimized)
                setRefresh(e => !e)
                props.setRefresh(e => !e);
            }

                //nested dict,
            apps[newAppId] = {
                key: key,
                newAppId: newAppId,
                minimized:false,
                isDeleted: isDeleted,
                getMinimized: getMinimized,
                setMinimized: setMinimized,
                deleteApp: deleteApp,


            };
            newAppIdRef.current++;
            setRefresh(e => !e);
            props.setRefresh(e => !e);
            console.log('addApp');

            return apps;
        });
    };

    // console.log(Object.keys(apps).length);
    // console.log(deletedRef.current);
    // return (
    //     <div>
    //         <Button variant="contained" onClick={addApp}>Add app</Button>
    //         {Object.values(apps).map((app) => {
    //            return <WorkspaceApp id={app.newAppId} key={app.key}
    //                     isDeleted={app.isDeleted} onDelete={app.deleteApp}
    //                         uuid={app.key} minimized={app.getMinimized()} setMinimized={app.setMinimized}/>})}
    //         <rps.ProSidebar>
    //         <rps.Menu>
    //            {
    //             Object.keys(apps).map((appId) => <rps.MenuItem>
    //                 <Button variant="contained" onClick={ () => apps[appId].setMinimized(!apps[appId].getMinimized())} > {appId}
    //                 </Button>
    //                 </rps.MenuItem>)
    //            }
    //         </rps.Menu>
    //     </rps.ProSidebar>
    //     </div>
    // )

    console.log(JSON.stringify(appStateRef.current));
    if (props.hidden) {
        return null;
    }

    return (
        <div style={{
            backgroundColor: 'lightGray',
            height: '100%',
            width: '100%'
        }}>
            <Rnd
                bounds='parent'
                onDragStop={(e, data) => {
                    appStateRef.current.x = data.x;
                    appStateRef.current.y = data.y;
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    appStateRef.current.width = ref.style.width;
                    appStateRef.current.height = ref.style.height;
                    // position can also change in resizing when moving the top left corner
                    appStateRef.current.x = position.x;
                    appStateRef.current.y = position.y;
                }}
                default={appStateRef.current}
                dragHandleClassName="handle"
            >
                <div style={{
                    backgroundColor: 'white',
                    height: '100%',
                    border: '2px solid gray',
                    borderRadius: '5px'
                }}>
                    <AppTitleBar />
                    <p>{props.unique_id}</p>
                </div>
            </Rnd>
        </div>
    )
}


function WorkspaceArea() {
    const [, setRefresh] = React.useState(false);
    const [tabs, setTabs] = React.useState({});
    const [currTab, setCurrTab] = React.useState(-1);
    const numTabs = React.useRef(0);

    const handleTabChange = (event, newValue) => {
        setCurrTab(newValue);
    };

    const createNewTab = () => {
        let newTabIdx = numTabs.current;
        let uuid = uuidv4();
        tabs[newTabIdx] = {
            idx: newTabIdx,
            uuid: uuid
        }
        setTabs(tabs);

        numTabs.current++;
        setCurrTab(newTabIdx);
        setRefresh(e => !e);
    }

    let currTabComponent = <p>You have no tabs. How about creating one?</p>;
    if (numTabs.current > 0) {
        currTabComponent = Object.values(tabs).map((tab) => {
            console.log(tab.idx);
            return <WorkspaceTab key={tab.uuid} unique_id={tab.uuid} setRefresh={setRefresh}
                          hidden={currTab !== tab.idx}/>;
        });
    }

    return (
        <Container maxWidth="xl" disableGutters={true}>
            <AppBar position="static">
                <Toolbar>
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
                </Toolbar>
            </AppBar>
            <div style={{ height: "100vh" }}>
                { currTabComponent }
            </div>
        </Container>
    )
}

export { WorkspaceArea };