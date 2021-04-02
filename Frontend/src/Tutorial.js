import { Route, useHistory, NavLink, HashRouter } from "react-router-dom";
import "./CSS/Tutorial.css";
import { Avatar } from '@material-ui/core';
import s from './Images/s.png';
import create from './Images/Create.PNG';
import open from './Images/Open.PNG';
import workspace from './Images/Workspace.PNG';


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
            <p>Synchronous is a real time collaboration tool, with the ability to create virtual
                workspaces for teams, and offering tools and services inside the workspace that will allow for better
                communication and collaboration, such as a virtual whiteboard, notepad as well as file sharing, all
                without having to set up an account or register with the website. We envisioned it as bridging the
                gap between Zoom and the Google suite of applications, bringing security as well as flexibility all
                without the overhead of storing information or creating an account. <br/><br/>

                Collaborating with teammates on small projects is commonplace in college and the workforce, yet
                setting up a workspace for the team with existing tools is cumbersome. To set up a Zoom meeting, one
                needs an account, and there is a limited amount of minutes one would have for a free meeting, if not
                affiliated with a company or organization. Zoom also doesn’t have tools for drawing or typing, and is
                primarily a video conferencing app.<br/><br/>

                Google Drive, on the other hand, has the ability to type, chat, etc. with the added bonus of
                being able to see the changes happen in real time. However, the overhead of having to share the
                documents with each team member, and quick collaborative notepad services don’t have other useful
                features such as chat, file sharing, or whiteboards. Synchronous puts all these features in one place
                allowing teams to start working together as quickly as possible. With Synchronous, users can set up a
                workspace with a custom URL, and other members can easily join by going to the URL. With
                Synchronous, you get real-time collaboration without the need for creating an account or sending out
                invitations. We envisioned this as a really fast, super light program dedicated for quick team
                meetings or minimal conferences.<br/><br/>
            </p>

        </div>

    );
}

function Create() {
    return (
        <div>
            <img src={create} alt="" class="a" height={300} />
            <p>On the Create a Workspace page there are 2 text boxes that can be filled in. They are both optional
            <br/><br/>
            The first box is the desired name for your workspace. If the Workspace Name is already taken you will be
                notified and be allowed to input a new one.
            <br/><br/>
            The second box is for if you want to password protect your workspace. This will make it so other users
                will need to enter a password before being allowed into the workspace. <br/>
                Note: There is a checkbox that when checked will allow people viewing permissions of your workspace
                without the ability to edit.
            <br/><br/>
            Once you enter in a Name and Password (if desired) a new workspace will be created.
            </p>

        </div>

    );
}

function Open() {
    return (
        <div>
            <img src={open} alt="" className="a" height={300}/>
            <p>On the Open Existing Workspace page there are 2 text boxes that can be filled in
                <br/><br/>
                The first box is the name that you created for your workspace. If you do not have a workspace name or
                want to use the workspace ID to enter, you can check the corresponding checkbox and do so.
                <br/><br/>
                The second box is if you password protected your workspace. If you do not have a password it does not
                need to be filled in. Otherwise, it is required to gain access to the workspace.
                <br/><br/>
                Once you enter in a correct Name and Password (if applicable) you will be able to reaccess your workspace
            </p>

        </div>

    );
}

function Workspace() {
    return (
        <div>
            <img src={workspace} alt="" className="b" height={300}/>

            <p>
                <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
                Once you enter Workspace there are many features available. <br/>

                Starting with the appbar along the top you can see your Workspace name and the duration the workspace has
                been active (Remember workspace delete after 24 hours). There is also a button for changing your
                nickname that other people will see you as. Then there is an email icon where you can send out invites
                to other members of your team. Finally, there is a ? mark icon that links you to this tutorial.
                <br/><br/>
                In the bottom left corner there is an icon then when clicked will allow you to submit a bug report or
                suggest improvements. Synchronous is a work in progress, so not everything is perfect.
                <br/>
                In the bottom right corner there is a chat icon. This can be used for communicating with other people
                on the workspace.
                <br/><br/>
                Finally there is the workspace itself. <br/>
                You can create new Tabs and each tab can have its own content (Similar to a browser). For each tab
                you can choose what apps you would like to add to that specific tab. If you no longer want a tab you
                can click to delete it, and if you are done using an app that can be deleted as well.

            </p>

        </div>

    );
}

function Apps() {
    return (
        <div>
            <h2>
                Available Apps:
            </h2>
            <h3>
                Text
            </h3>
            <p>
            The Text application comes with all the necessary features. Heres a list of some of the things that are
            possible: Edit fonts, rich text editor, suggestions, file revision, and file download.
            </p>
            <h3>
                Drawing (Not yet implemented)
            </h3>
            <p>With the drawing application you can create any masterpiece you can imagine. You can use different
            marker sizes, colors, and have access to all of the standard functionality of a drawing application.
            </p>
            <h3>
                White Board (Not yet implemented)
            </h3>
            <p>
                Using the White Board app you can make simple notes and diagrams to quickly describe your task.
            </p>
            <h3>
                File Upload
            </h3>
            <p>
                The File Upload app allows for file sharing between you and your fellow team members. Just open it up
                and choose any file you would like to upload.
            </p>

        </div>

    );
}




