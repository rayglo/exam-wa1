import {Accordion, Button, Card, Col, Container, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import "../styles/SurveyList.css"
import {getAllSurveys, deleteSurvey} from "../adapters/SurveyListAdapter";
import {ChevronDown} from "react-bootstrap-icons";
import "../styles/LogIn.css"
import {Link} from "react-router-dom";

function SurveyList(props) {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(async () => {
        async function updateSurveys() {
            let json = await getAllSurveys();
            setSurveys(json);
        }

        setLoading(true);
        await updateSurveys();
        setLoading(false);
    }, [])

    let handleDelete = async function (surveyID) {
        setSurveys(s => s.filter(x => x.SurveyID !== surveyID));
        await deleteSurvey(surveyID);
    }

    let handleCopy = async function (surveyID) {
        let toCopy = window.location.origin + '/survey/' + surveyID;
        await navigator.clipboard.writeText(toCopy);
    }

    return (

        <Container>
            <h1 id="title">Your Surveys</h1>
            {surveys.map((s) => (
                <div id={"card-survey-" + s.SurveyID} className="survey-card shadow">
                    <Accordion>
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle className="collapse-card-button"
                                                  onClick={({target}) => target.classList.toggle('collapsed')}
                                                  eventKey={s.SurveyID}>
                                    <ChevronDown/>
                                </Accordion.Toggle>
                                {"    " + s.Name}
                            </Card.Header>
                            <Accordion.Collapse eventKey={s.SurveyID}>
                                <Card.Body>
                                    <Container>
                                        <Row className="justify-content-between">
                                            <Col md={3}>Number of answers: {s.NumberAnswered}<br/>Creation
                                                date: {s.CreationDate}</Col>
                                            <Col md={2}>
                                                {s.NumberAnswered <= 0 ? (<></>) : (
                                                    <Link to={'/survey/' + s.SurveyID + '/result/'}
                                                          id={"results-" + s.SurveyID}
                                                          className={"btn btn-primary survey-card-button"}>See
                                                        Results</Link>)}
                                                <br/>
                                                <Button id={"edit-" + s.SurveyID}
                                                        className="survey-card-button"
                                                        onClick={async () => await handleCopy(s.SurveyID)}>Copy
                                                    Link</Button><br/>
                                                <Button id={"delete-" + s.SurveyID} variant="danger"
                                                        className="survey-card-button"
                                                        onClick={async () => await handleDelete(s.SurveyID)}>Delete</Button></Col>
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                </div>))}
        </Container>
    )
}

export default SurveyList;