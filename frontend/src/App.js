import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Home from "./Home";
import Accounts from "./Accounts";
// import Account from "./Account";

export default function Swap() {
  return (
    <div className="wrapper">
      <Router>
        <div className="navbar">
          <nav className="container">
            <ul className="nav-group">
              <li className="nav-item">
                <Link to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/accounts">Accounts</Link>
              </li>
            </ul>
          </nav>
        </div>

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/accounts">
            <Accounts />
          </Route>
          {/* <Route path="/accounts/:account">
            <Account />
          </Route> */}
        </Switch>
      </Router>
    </div>
  );
}
