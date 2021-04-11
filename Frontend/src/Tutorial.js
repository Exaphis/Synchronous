import {Route, useHistory, NavLink, HashRouter} from "react-router-dom";
import "./CSS/Tutorial.css";

import {Avatar} from '@material-ui/core';
import s from './Images/s.png';
import cstep1 from './tutorial_images/Create-Step1.png';
import cstep2 from './tutorial_images/Create-Step2.png';
import cstep3 from './tutorial_images/Create-Step3.png';
import rostep1 from './tutorial_images/Reopen-Step1.png';
import rostep2 from './tutorial_images/Reopen-Step2.png';
import rostep3 from './tutorial_images/Reopen-Step3.png';
import cnickstep1 from './tutorial_images/Change-Nickname-Step1.png'
import cnickstep2 from './tutorial_images/Change-Nickname-Step2.png'
import cnickstep3 from './tutorial_images/Change-Nickname-Step3.png'
import invstep1 from './tutorial_images/Invite-Step1.png'
import invstep2 from './tutorial_images/Invite-Step2.png'
import bugstep1 from './tutorial_images/Bug-Step1.png'
import bugstep2 from './tutorial_images/Bug-Step2.png'
import bugstep3 from './tutorial_images/Bug-Step3.png'
import cnamestep1 from './tutorial_images/Change-Name-Step1.png'
import cnamestep2 from './tutorial_images/Change-Name-Step2.png'
import cnamestep3 from './tutorial_images/Change-Name-Step3.png'
import createapp from './tutorial_images/Create-New-App.gif'
import moveresize from './tutorial_images/Move-resize.gif'
import minimize from './tutorial_images/Minimize.gif'
import chatstep from './tutorial_images/Chat-Step.png';
import padstep from './tutorial_images/Pad-Step.png';
import filesharestep from './tutorial_images/FileShare-Step.png';

//trying to commit

export default function Tutorial() {
    const history = useHistory();

    console.log(window.location.href);
    let url = JSON.stringify(window.location.href);
    url = url.substring(url.lastIndexOf('/'), url.length - 1)
    console.log(url)
    console.log(url === '/home')

    if (url === '/home') {
        console.log('here');
        history.push('/');
        window.location.reload(false);
        refresh()
    }

    return (
        <HashRouter>
            <div className="tutorial">
                <Avatar alt="s" src={s}/>
                <ul className="header">
                    <li><NavLink to="/introduction">Introduction</NavLink></li>
                    <li><NavLink to="/create">Create a Workspace</NavLink></li>
                    <li><NavLink to="/open">Open a Workspace</NavLink></li>
                    <li><NavLink to="/workspace">Using your Workspace</NavLink></li>
                    <li><NavLink to="/apps">Apps</NavLink></li>
                    <button className="a" onClick={() => history.push('/')}>Return Home</button>
                </ul>

                <div className="content">
                    <Route path="/introduction" component={Introduction}/>
                    <Route path="/create" component={Create}/>
                    <Route path="/open" component={Open}/>
                    <Route path="/workspace" component={Workspace}/>
                    <Route path="/apps" component={Apps}/>
                </div>
            </div>
        </HashRouter>
    );
}


function Introduction() {
    return (
        <div>
            <h1>
                Introduction:
            </h1>
            <p className="tutorial-p">
                Synchronous is a real time collaboration tool, with the ability to create virtual
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
            <h1>
                Creating a Workspace:
            </h1>
            <p className="tutorial-p">To create a workspace follow these steps: </p>
            <br/>
            <p className="steps">
                Step 1: Click on "Start a new workspace" in the main menu.
            </p>
            <img src={cstep1} alt="Step 1 screenshot" className="step-image"/>
            <p className="steps">
                Step 2: Enter your workspace name or check "Use Id?" and enter your workspace ID along with password (if
                set) and click on "Okay".
            </p>
            <img src={cstep2} alt="Step 2 screenshot" className="step-image"/>
            <p className="steps">
                Your workspace is now created! Get ready for efficiency.
            </p>
            <img src={cstep3} alt="Step 3 screenshot" className="step-image"/>
        </div>

    );
}

function Open() {
    return (
        <div>
            <h1>
                Opening an Existing Workspace:
            </h1>
            <p className="tutorial-p">To open a workspace follow these steps: </p>
            <br/>
            <p className="steps">
                Step 1: Click on "Reopen an existing workspace" in the main menu.
            </p>
            <img src={rostep1} alt="Step 1 screenshot" className="step-image"/>
            <p className="steps">
                Step 2: Either click on "Create Workspace" right away to create a workspace with no custom name,
                password and accessible by all. Else, fill in the relavent details and click on create workspace.
            </p>
            <img src={rostep2} alt="Step 2 screenshot" className="step-image"/>
            <p className="steps">
                Your workspace is now opened! Get back to working.
            </p>
            <img src={rostep3} alt="Step 3 screenshot" className="step-image"/>

        </div>

    );
}

function Workspace() {
    return (
        <div>
            <h1>
                Using your Workspace:
            </h1>
            <p className="tutorial-p"> Click on a topic to know more</p>
            <br/>
            <label className="collapsible">
                <input type="checkbox"/>
                <span className="collapser">Change workspace nickname</span>

                <div className="collapsed">
                    Step 1: Click on "Change Nickname" button

                    <img src={cnickstep1} alt="Step 1 screenshot" className="step-image-inside"/>

                    Step 2: Type in the nick name and click on "Okay"

                    <img src={cnickstep2} alt="Step 2 screenshot" className="step-image-inside"/>

                    The nick name of the workspace has now changed!

                    <img src={cnickstep3} alt="Step 3 screenshot" className="step-image-inside"/>


                </div>
            </label>

            <label className="collapsible">
                <input type="checkbox"/>

                <div className="collapser">
                    Invite collaborators
                </div>
                <div className="collapsed">
                    Step 1: Click on the mail icon button

                    <img src={invstep1} alt="Step 1 screenshot" className="step-image-inside"/>

                    Step 2: Type in the email of the collaborator. You may add a message. Click on "Submit"

                    <img src={invstep2} alt="Step 2 screenshot" className="step-image-inside"/>

                    The collaborator has been sent an email with the details of this workspace. Sit tight, help is
                    coming!

                </div>
            </label>

            <label className="collapsible">
                <input type="checkbox"/>

                <div className="collapser">
                    Submit a bug / contact us
                </div>
                <div className="collapsed">
                    Step 1: Click on the conversation bubble icon on the bottom left

                    <img src={bugstep1} alt="Step 1 screenshot" className="step-image-inside"/>

                    Step 2: To leave us a message, type your message in the text box on the bottom left and hit
                    enter <br/>
                    To send a bug report, copy paste the Google form link in the browser in a new window.
                    <img src={bugstep2} alt="Step 2 screenshot" className="step-image-inside"/>

                    Step3: Enter your bug details in the Google form and relax, as we take care of it!

                    <img src={bugstep3} alt="Step 3 screenshot" className="step-image-inside"/>


                </div>
            </label>

            <label className="collapsible">
                <input type="checkbox"/>
                <span className="collapser">Change your name</span>

                <div className="collapsed">
                    Step 1: Click on "Change name" button

                    <img src={cnamestep1} alt="Step 1 screenshot" className="step-image-inside"/>

                    Step 2: Type in the name and click on "Change name"

                    <img src={cnamestep2} alt="Step 2 screenshot" className="step-image-inside"/>

                    Your name has now changed!

                    <img src={cnamestep3} alt="Step 3 screenshot" className="step-image-inside"/>


                </div>
            </label>

        </div>

    );
}

function Apps() {
    return (
        <div>
            <h1>
                Available Apps:
            </h1>

            <p className="tutorial-p"> Click on a topic to know more</p>

            <p className="tutorial-p"> How to handle Apps</p>

            <label className="collapsible">
                <input type="checkbox"/>
                <span className="collapser">Create new App</span>

                <div className="collapsed">
                    Step 1: Click on + button to add a new tab <br/>

                    Step 2: Select the app you wish to add <br/>

                    Step 3: Open the app from the sidebar

                    <img src={createapp} alt="Create app gif" className="step-image-inside"/>


                </div>
            </label>

            <label className="collapsible">
                <input type="checkbox"/>

                <div className="collapser">
                    Move and resize app
                </div>
                <div className="collapsed">
                    Move: Click on the App and move it around <br/>

                    Resize: Hold and drag from the side you wish to resize

                    <img src={moveresize} alt="Step 1 screenshot" className="step-image-inside"/>
                </div>
            </label>

            <label className="collapsible">
                <input type="checkbox"/>

                <div className="collapser">
                    Minimize and maximize
                </div>

                <div className="collapsed">
                    Minimize: Click on the - icon on the top right of the app <br/>

                    Maximize: Click on the minimized app from the sidebar

                    <img src={minimize} alt="Step 1 screenshot" className="step-image-inside"/>
                </div>


            </label>

            <br/>

            <p className="tutorial-p"> How to use specific Apps</p>

            <label className="collapsible">
                <input type="checkbox"/>
                <span className="collapser">Text editor</span>

                <div className="collapsed">
                    The text editor app is similar to any rich text editor you might be used to using.
                    To use simply add it from the side bar.

                    <img src={padstep} alt="Step 1 screenshot" className="step-image-inside"/>
                </div>
            </label>

            <label className="collapsible">
                <input type="checkbox"/>

                <div className="collapser">
                    Chat
                </div>
                <div className="collapsed">
                    Chat app can be used to chat with other collaborators on the work space. <br>
                </br>To access it, simply click on the chat icon on the bottom right of the workspace window and start
                    typing your message!

                    <img src={chatstep} alt="Step 1 screenshot" className="step-image-inside"/>
                </div>
            </label>

            <label className="collapsible">
                <input type="checkbox"/>

                <div className="collapser">
                    File Sharing
                </div>

                <div className="collapsed">
                    The File Upload app allows for file sharing between you and your fellow team members. Just open it
                    up
                    and choose any file you would like to upload.
                    <img src={filesharestep} alt="Step 1 screenshot" className="step-image-inside"/>
                </div>

            </label>


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

