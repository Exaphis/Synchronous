import * as rps from "react-pro-sidebar";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import AddIcon from "@material-ui/icons/Add";
import { APP_TYPE } from "../api";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import * as React from "react";

export function Sidebar(props) {
    const { apps, addApp } = props;
    const [minimized, setMinimized] = React.useState(false);

    const minMaxArrow = (
        <div
            style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                right: "0px",
                cursor: "pointer",
            }}
            onClick={() => setMinimized((m) => !m)}
        >
            {minimized ? <ArrowRightIcon /> : <ArrowLeftIcon />}
        </div>
    );

    return (
        <div>
            {/*set position relative to allow apps to go underneath the sidebar and not interfere with rnd*/}
            {/*relative so we can use height relative to parent*/}
            <rps.ProSidebar
                className={minimized ? "sidebar-minimized" : undefined}
            >
                <rps.Menu>
                    <rps.MenuItem
                        icon={<AddIcon />}
                        onClick={() => addApp(APP_TYPE.FILE_SHARE)}
                    >
                        Add file share
                    </rps.MenuItem>
                    <rps.MenuItem
                        icon={<AddIcon />}
                        onClick={() => addApp(APP_TYPE.PAD)}
                    >
                        Add text pad
                    </rps.MenuItem>
                    <rps.MenuItem
                        icon={<AddIcon />}
                        onClick={() => addApp(APP_TYPE.WHITEBOARD)}
                    >
                        Add whiteboard
                    </rps.MenuItem>
                </rps.Menu>
                {/* split into two menus so there is whitespace in between buttons and apps */}
                <rps.Menu>
                    {Object.values(apps).map(
                        (app) =>
                            app.minimized && (
                                <rps.MenuItem
                                    key={app.id}
                                    onClick={app.switchMinimized}
                                    icon={
                                        <IconButton
                                            component="div"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                app.onClose();
                                            }}
                                            color="inherit"
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    }
                                >
                                    {app.name}
                                </rps.MenuItem>
                            )
                    )}
                </rps.Menu>
                {minMaxArrow}
            </rps.ProSidebar>
        </div>
    );
}
