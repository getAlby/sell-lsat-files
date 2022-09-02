import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Home";
// import Account from "./Account";
// import Accounts from "./Accounts";

export default function Swap() {
  return (
    <div className="bg-base-100">
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          {/* <Route path="/accounts">
            <Accounts />
          </Route>
          <Route path="/accounts/:account">
            <Account />
          </Route> */}
        </Switch>
      </Router>
    </div>
  );
}
