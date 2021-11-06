import {Field, Form, Formik} from 'formik';
import {Checkbox, Slider, TextField} from "@material-ui/core";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getSurvey, submitFilledSurvey} from "../adapters/SurveyFormAdapter";
import {questionType} from "./SurveyEditor";
import {Button, Card, Col, Container, Row} from "react-bootstrap";
import * as Yup from "yup";
import "../styles/SurveyForm.css"
import {array, number, string, object} from "yup";


function range(start, stop) {
    let a = [start], b = start;
    while (b < stop) {
        a.push(b += 1);
    }
    return a;
}

function SurveyForm(props) {
    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState({});

    let {surveyID} = useParams();

    useEffect(async () => {
        async function updateSurvey() {
            let json = await getSurvey(surveyID);
            setSurvey(json);
        }

        setLoading(true);
        await updateSurvey();
        setLoading(false);
    }, [])

    return (
        <Container>
            {
                loading ? (<></>) : (<>
                    <h1 id="title">{survey.Name}</h1>
                    <Formik
                        initialValues={{
                            name: "",
                            answers: survey.questions.map(i => {
                                return {questionID: i.QuestionID}
                            }),
                        }}
                        validationSchema={
                            Yup.object().shape({
                                name: Yup.string().required('A name is required!'),
                                answers: Yup.array().of(
                                    Yup.lazy((value) => {
                                        let obj = survey.questions.filter(q => q.QuestionID == value.questionID)[0];
                                        switch (obj.Type) {
                                            case questionType[0]:
                                                if (obj.Content.required == false)
                                                    return object().shape({
                                                        questionID: number(),
                                                        answerContent: string(),
                                                    });
                                                else
                                                    return object().shape({
                                                        questionID: number(),
                                                        answerContent: string().required(),
                                                    });
                                                break;
                                            case questionType[1]:
                                                return object().shape({
                                                    questionID: number(),
                                                    answerContent: array().min(obj.Content.min, 'You still miss some checks').max(obj.Content.max, 'You\'ve put too many checks')
                                                });
                                                break;
                                        }
                                    })
                                )
                            })
                        }
                        onSubmit={async (values) => {
                            await submitFilledSurvey(survey.SurveyID, values);

                        }}
                        validateOnBlur={true}
                        validateOnChange={true}
                        validateOnMount={true}
                    >
                        {({values, errors, isSubmitting, isValidating, touched, setFieldValue, isValid}) =>
                            <Form>
                                <div id='survey-name'>
                                    <Field fullWidth
                                           name="name"
                                           label="Insert your name here" size='medium' as={TextField}
                                           inputProps={{style: {fontSize: "30px"}}}/>
                                </div>
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
                                                                                    <Field label="Your Answer" multiline
                                                                                           rows={4}
                                                                                           name={`answers[${q.QuestionID - 1}].answerContent`}
                                                                                           as={TextField}/>
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
                                                                                        <label>
                                                                                            <Field
                                                                                                type="checkbox"
                                                                                                name={`answers[${q.QuestionID - 1}].answerContent`}
                                                                                                value={a.toString()}
                                                                                                as={Checkbox}
                                                                                            />
                                                                                            {q.Content.alternatives[a]}
                                                                                        </label>
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
                                <Row className="justify-content-end submit-box">
                                    <Col xs={1}>
                                        {(isValid) ? (<></>) : (
                                            <div id="warning-text" className="">Please check again your answers</div>)}
                                    </Col>
                                    <Col xs={2}>
                                        <Button type="submit" disabled={isSubmitting || isValidating || !isValid}
                                                id="submit-button">Submit</Button>
                                    </Col>
                                </Row>
                            </Form>}
                    </Formik>
                </>)
            }
        </Container>);
};

export default SurveyForm;