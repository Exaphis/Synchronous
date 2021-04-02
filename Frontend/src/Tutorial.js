import { Route, useHistory, NavLink, HashRouter } from "react-router-dom";
import "./Tutorial.css";

import { Avatar } from '@material-ui/core';
import s from './s.png';
import cstep1 from './Create-Step1.png';
import cstep2 from './Create-Step2.png';
import cstep3 from './Create-Step3.png';
import rostep1 from './Reopen-Step1.png';
import rostep2 from './Reopen-Step2.png';
import rostep3 from './Reopen-Step3.png';
import cnickstep1 from './Change-Nickname-Step1.png'
import cnickstep2 from './Change-Nickname-Step2.png'
import cnickstep3 from './Change-Nickname-Step3.png'
import invstep1 from './Invite-Step1.png'
import invstep2 from './Invite-Step2.png'
import bugstep1 from './Bug-Step1.png'
import bugstep2 from './Bug-Step2.png'
import bugstep3 from './Bug-Step3.png'
import cnamestep1 from './Change-Name-Step1.png'
import cnamestep2 from './Change-Name-Step2.png'
import cnamestep3 from './Change-Name-Step3.png'
import createapp from  './Create-New-App.gif'
import moveresize from  './Move-resize.gif'
import minimize from './Minimize.gif'
import chatstep from './Chat-Step.png';

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
            <h1>
                Introduction:
            </h1>
            <p class="tutorial-p"> Synchronous is positioned as a real time collaboration tool, with the ability to create virtual workspaces for teams, and offering tools and services inside the workspace that will allow for better communication and collaboration, such as a virtual whiteboard, notepad as well as file sharing, all without having to set up an account or register with the website. We envisioned it as bridging the gap between Zoom and the Google suite of applications, bringing security as well as flexibility all without the overhead of storing information or creating an account. </p>
        </div>

    );
}

function Create() {
    return (
        <div>
            <h1>
                Creating a Workspace:
            </h1>
            <p class="tutorial-p">To create a workspace follow these steps: </p>
            <br></br>
                <p class="steps">
                    Step 1: Click on "Start a new workspace" in the main menu.
                </p>
                <img src={cstep1} class="step-image"></img>
                <p class="steps">
                    Step 2: Enter your workspace name or check "Use Id?" and enter your workspace ID along with password (if set) and click on "Okay".
                </p>
                <img src={cstep2} class="step-image"></img>
                <p class="steps">
                    Your workspace is now created! Get ready for efficiency.
                </p>
                <img src={cstep3} class="step-image"></img>
        </div>

    );
}

function Open() {
    return (
        <div>
            <h1>
                Opening an Existing Workspace:
            </h1>
            <p class="tutorial-p">To open a workspace follow these steps: </p>
            <br></br>
                <p class="steps">
                    Step 1: Click on "Reopen an existing workspace" in the main menu.
                </p>
                <img src={rostep1} class="step-image"></img>
                <p class="steps">
                    Step 2: Either click on "Create Workspace" right away to create a workspace with no custom name, password and accessible by all. Else, fill in the relavent details and click on create workspace.
                </p>
                <img src={rostep2} class="step-image"></img>
                <p class="steps">
                    Your workspace is now opened! Get back to working.
                </p>
                <img src={rostep3} class="step-image"></img>

        </div>

    );
}

function Workspace() {
    return (
        <div>
            <h1>
                Using your Workspace:
            </h1>
            <p class="tutorial-p"> Click on a topic to know more</p>
            <br></br>
            <label class="collapsible">
            <input type="checkbox" />
            <span class="collapser">Change workspace nickname</span>
            
            <div class="collapsed">
                Step 1: Click on "Change Nickname" button

                <img src={cnickstep1} class="step-image-inside" ></img>

                Step 2: Type in the nick name and click on "Okay"

                <img src={cnickstep2} class="step-image-inside" ></img>

                The nick name of the workspace has now changed!

                <img src={cnickstep3} class="step-image-inside" ></img>
            
        
            </div>
            </label>

            <label class="collapsible">
            <input type="checkbox" />
            
            <div class="collapser">
                Invite collaborators
            </div>
            <div class="collapsed">
                Step 1: Click on the mail icon button

                <img src={invstep1} class="step-image-inside" ></img>

                Step 2: Type in the email of the collaborator. You may add a message. Click on "Submit"

                <img src={invstep2} class="step-image-inside" ></img>

                The collaborator has been sent an email with the details of this workspace. Sit tight, help is coming!
        
            </div>
            </label>

            <label class="collapsible">
            <input type="checkbox" />
            
            <div class="collapser">
            Submit a bug / contact us
            </div>
            <div class="collapsed">
                Step 1: Click on the conversation bubble icon on the bottom left

                <img src={bugstep1} class="step-image-inside" ></img>

                Step 2: To leave us a message, type your message in the text box on the bottom left and hit enter <br></br>
                To send a bug report, copy paste the Google form link in the browser in a new window.
                <img src={bugstep2} class="step-image-inside" ></img>

                Step3: Enter your bug details in the Google form and relax, as we take care of it!

                <img src={bugstep3} class="step-image-inside" ></img>
            
        
            </div>
            </label>

            <label class="collapsible">
            <input type="checkbox" />
            <span class="collapser">Change your name</span>
            
            <div class="collapsed">
                Step 1: Click on "Change name" button

                <img src={cnamestep1} class="step-image-inside" ></img>

                Step 2: Type in the name and click on "Change name"

                <img src={cnamestep2} class="step-image-inside" ></img>

                Your name has now changed!

                <img src={cnamestep3} class="step-image-inside" ></img>
            
        
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

            <p class="tutorial-p"> Click on a topic to know more</p>

            <p class="tutorial-p"> How to handle Apps</p>
            
            <label class="collapsible">
            <input type="checkbox" />
            <span class="collapser">Create new App</span>
            
            <div class="collapsed">
            Step 1: Click on + button to add a new tab <br></br>

            Step 2: Select the app you wish to add

            <img src={createapp} class="step-image-inside" ></img>
            
        
            </div>
            </label>

            <label class="collapsible">
            <input type="checkbox" />
            
            <div class="collapser">
                Move and resize app
            </div>
            <div class="collapsed">
            Move: Click on the App and move it around <br></br>

            Resize: Hold and drag from the side you wish to resize

            <img src={moveresize} class="step-image-inside" ></img>
            </div>
            </label>

            <label class="collapsible">
            <input type="checkbox" />
            
            <div class="collapser">
                Minimize and maximize </div>

                <div class="collapsed">
                    Minimize: Click on the - icon on the top right of the app <br></br>

                    Maximize: Click on the minimized app from the sidebar 

                    <img src={minimize} class="step-image-inside" ></img>
            </div>


            </label>

            <br></br>

            <p class="tutorial-p"> How to use specific Apps</p>
            
            <label class="collapsible">
            <input type="checkbox" />
            <span class="collapser">Text editor</span>
            
            <div class="collapsed">
            The text editor app is similar to any rich text editor you might be used to using. 
            To use simply add it from the side bar.

            {/*<img src={createapp} class="step-image-inside" ></img>*/}
            
        
            </div>
            </label>

            <label class="collapsible">
            <input type="checkbox" />
            
            <div class="collapser">
                Chat
            </div>
            <div class="collapsed">
            Chat app can be used to chat with other collaborators on the work space. <br>
            </br>To access it, simply click on the chat icon on the bottom right of the workspace window and start typing your message!

            <img src={chatstep} class="step-image-inside" ></img>
            </div>
            </label>

            <label class="collapsible">
            <input type="checkbox" />
            
            <div class="collapser">
                File Sharing </div>

                <div class="collapsed">
                    #TODO

                     {/*<img src={createapp} class="step-image-inside" ></img>*/}
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

