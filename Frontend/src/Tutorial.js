import { BrowserRouter as Router, Link, Route, Switch, useHistory, NavLink, HashRouter } from "react-router-dom";
import React, { Component } from "react";
//import "./Tutorial.css";

export default function Tutorial() {
    return (
        <HashRouter>
            <div>
                <h1>Simple SPA</h1>
                <ul className="header">
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/stuff">Stuff</NavLink></li>
                    <li><NavLink to="/contact">Contact</NavLink></li>
                </ul>
                <div className="content">
                    <Route path="/" component={Home}/>
                    <Route path="/stuff" component={Stuff}/>
                    <Route path="/contact" component={Contact}/>
                </div>
            </div>
        </HashRouter>
    );
}

function Stuff() {
    return (
        <div>
            Stuff
        </div>

    );
}

function Contact() {
    return (
        <div>
            Contact
        </div>

    );
}

function Home() {
    return (
        <div>
            Home
        </div>

    );
}