import { h, render, } from "preact";
import { Router, Route } from "preact-router";
import Session from "./pages/session";
import Reset from "./pages/reset";


const Main = () => {

    return (
        <Router>
            <Route path="/" component={Session}></Route>
            <Route path="/reset" component={Reset}></Route>
        </Router>
    );
};

render(<Main></Main>, document.body);