import { Route, useHistory, NavLink, HashRouter } from "react-router-dom";
import "./Tutorial.css";
import { Avatar } from '@material-ui/core';
import s from './s.png';


export default function Tutorial() {
    const history = useHistory();

    return (
        <HashRouter>
            <div>
                <Avatar alt="s" src={s} onClick={() => history.push('/')}/>
                <ul className="header">
                    <li><NavLink to="/Introduction">Introduction</NavLink></li>
                    <li><NavLink to="/Create">Create a Workspace</NavLink></li>
                    <li><NavLink to="/Open">Open a Workspace</NavLink></li>
                    <li><NavLink to="/Workspace">Using your Workspace</NavLink></li>
                    <li><NavLink to="/Apps">Apps</NavLink></li>
                    <button class="a" onClick={() => history.push('/')}>Return Home</button>
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




