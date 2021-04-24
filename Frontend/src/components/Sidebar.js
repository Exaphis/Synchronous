import * as rps from "react-pro-sidebar";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import AddIcon from "@material-ui/icons/Add";
import {APP_TYPE} from "../api";
import {IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import * as React from "react";


export function Sidebar(props) {
    const {apps, addApp} = props;
    const [minimized, setMinimized] = React.useState(false);

    const minMaxArrow = (
        <div style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '0px',
            cursor: 'pointer'
        }}
             onClick={() => setMinimized(m => !m)}>
            {minimized ? <ArrowRightIcon /> : <ArrowLeftIcon />}
        </div>
    );

    return (
        // settings width/minWidth as none makes the css invalid so it takes on the parent style
        <rps.ProSidebar className={minimized ? 'sidebar-minimized' : undefined} >
            <rps.Menu>
                <rps.MenuItem icon={<AddIcon />} onClick={() => addApp(APP_TYPE.FILE_SHARE)} >
                    Add file share
                </rps.MenuItem>
                <rps.MenuItem icon={<AddIcon />} onClick={() => addApp(APP_TYPE.PAD)} >
                    Add pad
                </rps.MenuItem>
                <rps.MenuItem icon={<AddIcon />} onClick={() => addApp(APP_TYPE.WHITEBOARD)} >
                    Add whiteboard
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
                            {app.name}
                        </rps.MenuItem>
                    ))
                }
            </rps.Menu>
            {minMaxArrow}
        </rps.ProSidebar>
    );
}
