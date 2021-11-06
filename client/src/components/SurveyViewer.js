import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getSurveyAnswer, getSurveyModel} from "../adapters/SurveyViewerAdapter";
import "../styles/SurveyViewer.css"
import {questionType} from "./SurveyEditor";
import {Button, Card, Col, Container, Row} from "react-bootstrap";
import {Backdrop, Checkbox, CircularProgress, TextField} from "@material-ui/core";
import {ChevronCompactLeft, ChevronCompactRight} from "react-bootstrap-icons";

function range(start, stop) {
    let a = [start], b = start;
    while (b < stop) {
        a.push(b += 1);
    }
    return a;
}

function SurveyViewer(props) {
    let {surveyID, resultID} = useParams();

    const [surveyLoading, setSurveyLoading] = useState(true);
    const [answerLoading, setAnswerLoading] = useState(true);
    const [CS_ID, setCS_ID] = useState(resultID || 1);
    const [answer, setAnswer] = useState(null);
    const [survey, setSurvey] = useState(null);

    useEffect(async () => {
        async function getSurveyPage() {
            let json = await getSurveyModel(surveyID);
            setSurvey(json);
        }
        setSurveyLoading(true);
        await getSurveyPage(surveyID, resultID);
        setSurveyLoading(false);
    }, []);

    useEffect(async () => {
        async function updatePage() {
            let json = await getSurveyAnswer(surveyID, CS_ID);
            setAnswer(json);
        }

        setAnswerLoading(true);
        await updatePage();
        setAnswerLoading(false);
    }, [CS_ID]);

    return (
        <Container>
            {
                (surveyLoading || answerLoading) ? (<></>) :
                    <>
                        <>
                            <Row><h1 id="title">{survey.Name}</h1></Row>
                            <Row className="justify-content-between">
                                <Col><h3>User: {answer.Username}</h3></Col>
                                <Col
                                    md={2}>
                                    {CS_ID != 1 ? (<Button className="scroll-button"
                                                           onClick={() => setCS_ID(x => x - 1)}><ChevronCompactLeft/></Button>) : (<></>)}
                                    {CS_ID != survey.NumberAnswered ? (<Button
                                        onClick={() => setCS_ID(x => x + 1)}
                                        className="scroll-button"><ChevronCompactRight/></Button>) : (<></>)}</Col>
                            </Row>
                        </>
                        {
                            survey.questions.map((q) => (
                                <>
                                    {(() => {
                                        switch (q.Type) {
                                            case questionType[0]:
                                                return (<>
                                                        <div className="question-card shadow">
                                                            <Card>
                                                                <Card.Header>
                                                                    <Row className="justify-content-between">
                                                                        <Col md={4}>
                                                                            {q.Content.questionName}
                                                                        </Col>
                                                                        <Col md={2}>
                                                                            (required: {q.Content.required ? "yes" : "no"})
                                                                        </Col>
                                                                    </Row>
                                                                </Card.Header>
                                                                <Card.Body>
                                                                    <Container>
                                                                        <Row>
                                                                            {answer.Content.find((x) => x.questionID == q.QuestionID).answerContent}
                                                                        </Row>
                                                                    </Container>
                                                                </Card.Body>
                                                            </Card>
                                                        </div>
                                                    </>
                                                );
                                                break;
                                            case questionType[1]:
                                                return (
                                                    <>
                                                        <div className="question-card shadow">
                                                            <Card>
                                                                <Card.Header>
                                                                    <Row className="justify-content-between">
                                                                        <Col md={4}>
                                                                            {q.Content.questionName}
                                                                        </Col>
                                                                        <Col md={2}>
                                                                            (min: {q.Content.min},
                                                                            max: {q.Content.max})
                                                                        </Col>
                                                                    </Row>
                                                                </Card.Header>
                                                                <Card.Body>
                                                                    <Container>
                                                                        {range(0, q.Content.numberAlternatives - 1).map(a =>
                                                                            <Row>
                                                                                <Col>
                                                                                    <label>
                                                                                        <Checkbox
                                                                                            disabled
                                                                                            checked={answer.Content.find((x) => x.questionID == q.QuestionID).answerContent.includes(a.toString())}/>
                                                                                        {q.Content.alternatives[a]}
                                                                                    </label>
                                                                                </Col>
                                                                            </Row>)}
                                                                    </Container>
                                                                </Card.Body>
                                                            </Card>
                                                        </div>
                                                    </>
                                                );
                                                break;
                                        }
                                    })()}
                                </>
                            ))}
                    </>
            }
        </Container>
    );
};

export default SurveyViewer;