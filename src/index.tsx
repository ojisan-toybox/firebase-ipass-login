import { h, render, } from "preact";
import { Router, Route } from "preact-router";
import Session from "./pages/session";
import Action from "./pages/action";


const Main = () => {

    return (
        <Router>
            <Route path="/" component={Session}></Route>
            <Route path="/action" component={Action}></Route>
        </Router>
    );
};

render(<Main></Main>, document.body);