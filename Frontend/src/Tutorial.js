import { Route, useHistory, NavLink, HashRouter } from "react-router-dom";
import "./Tutorial.css";
import {
    Grid, Box, Avatar, Button, CssBaseline,
    TextField, FormControlLabel, Checkbox,
    Typography, Container
} from '@material-ui/core';
import s from './s.png';


export default function Tutorial() {
    const history = useHistory();

    console.log(window.location.href);
    let url = JSON.stringify(window.location.href);
    url = url.substring(url.lastIndexOf('/'), url.length - 1)
    console.log(url)
    console.log(url === '/Home')

    if (url === '/Home') {
        console.log('here');
        history.push('/');
        window.location.reload(false);
        refresh()
    }

    return (
        <HashRouter>
            <div>
                <Avatar alt="s" src={s} />
                <ul className="header">
                    <li><NavLink to="/Introduction">Introduction</NavLink></li>
                    <li><NavLink to="/Create">Create a Workspace</NavLink></li>
                    <li><NavLink to="/Open">Open a Workspace</NavLink></li>
                    <li><NavLink to="/Workspace">Using your Workspace</NavLink></li>
                    <li><NavLink to="/Apps">Apps</NavLink></li>
                    <li2><NavLink to="/Home" onClick={refresh}>Return Home</NavLink> </li2>
                </ul>

                <div className="content">
                    <Route path="/Introduction" component={Introduction}/>
                    <Route path="/Create" component={Create}/>
                    <Route path="/Open" component={Open}/>
                    <Route path="/Workspace" component={Workspace}/>
                    <Route path="/Apps" component={Apps}/>
                </div>
            </div>
        </HashRouter>
    );
}


function Introduction() {
    return (
        <div>
            <h2>
                Introduction:
            </h2>
            <p>Todo:</p>

        </div>

    );
}

function Create() {
    return (
        <div>
            <h2>
                Creating a Workspace:
            </h2>
            <p>Todo:</p>

        </div>

    );
}

function Open() {
    return (
        <div>
            <h2>
                Opening an Existing Workspace:
            </h2>
            <p>Todo:</p>

        </div>

    );
}

function Workspace() {
    return (
        <div>
            <h2>
                Using your Workspace:
            </h2>
            <p>Todo:</p>

        </div>

    );
}

function Apps() {
    return (
        <div>
            <h2>
                Available Apps:
            </h2>
            <p>Todo:</p>

        </div>

    );
}



function refresh() {
    sleep(125).then(() => {
        window.location.reload(false);
    })
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

