import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col} from "react-bootstrap";
import MyNavbar from "./components/MyNavbar";
import MySidebar from "./components/MySidebar";
import LogIn from "./components/LogIn";
import {useEffect, useState} from "react";
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom";
import SurveyList from "./components/SurveyList";
import {SurveyEditor} from "./components/SurveyEditor";
import SurveyForm from "./components/SurveyForm";
import SurveyViewer from "./components/SurveyViewer";
import {getUserInfo} from "./adapters/LogInAdapter";

function App() {
    const [loggedIn, setLoggedIn] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                let v = await getUserInfo();
                setLoggedIn(v);
            } catch (err) {
                console.error(err.error);
            }
        };
        checkAuth();
    }, []);

    return (
        <Container fluid>
            <Router>
                {loggedIn === null ? <MyNavbar/> :
                    <MyNavbar
                        username={loggedIn.username}
                        setLoginState={setLoggedIn}/>}
                <Row>
                    {loggedIn === null ? (<></>) : (
                        <Col md={3}>
                            <MySidebar/>
                        </Col>)}
                    <Col>
                        <Switch>
                            <Route exact path="/survey/:surveyID">
                                <SurveyForm/>
                            </Route>
                            <Route exact path="/survey/:surveyID/result/:resultID?">
                                {loggedIn === null ? <Redirect to='login'/> : <SurveyViewer/>}
                            </Route>
                            <Route exact path="/login">
                                {loggedIn === null ? <LogIn
                                    setLoginState={setLoggedIn}/> : <Redirect to='/'/>}
                            </Route>
                            <Route exact path="/">
                                {loggedIn === null ? <Redirect to='/login'/> : <SurveyList/>}
                            </Route>
                            <Route exact path="/new-survey">
                                {loggedIn === null ? <Redirect to='/login'/> : <SurveyEditor/>}
                            </Route>
                        </Switch>
                    </Col>
                </Row>
            </Router>
        </Container>);
};

export default App;
