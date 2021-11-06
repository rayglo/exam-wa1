import {useEffect, useReducer, useState} from "react";
import {Button, Card, Col, Container, Row} from "react-bootstrap";
import {Field, Formik, Form} from "formik";
import {Checkbox, Slider, TextField} from "@material-ui/core";
import * as Yup from 'yup';

import "../styles/SurveyEditor.css"
import {submitSurvey} from "../adapters/SurveyEditorAdapter";


const questionType = ["Open", "Close"];

function range(start, stop) {
    let a = [start], b = start;
    while (b < stop) {
        a.push(b += 1);
    }
    return a;
}

const surveyValidationSchema = Yup.object().shape({
    surveyName: Yup.string().required('Name of the survey is required!'),
    questions: Yup.array().compact(x => x.deleted === true).min(1, 'At least one question is required!').of(
        Yup.object().shape({
            type: Yup.string().required().oneOf(questionType, 'Question type not allowed!'),
            questionName: Yup.string().required(),
            min: Yup.number(),
            max: Yup.number(),
            numberAlternatives: Yup.number(),
            alternatives: Yup.array().of(Yup.string().required('Option for a question cannot be null'))
        })
    )
})


function SurveyEditor(props) {
    //It's an internal identifier, and it won't match with the identifier in the db
    const [latestID, setLatestID] = useState(1);

    return (
        <Container>
            <h1 id="title">Survey Editor</h1>
            <Formik
                initialValues={{
                    surveyName: "",
                    questions: [],
                }}
                validationSchema={surveyValidationSchema}
                onSubmit={async (values, errors) => {
                    let toSubmit = {...values};
                    toSubmit.questions = toSubmit.questions.filter(x => x.deleted === false);
                    await submitSurvey(toSubmit);
                    console.log(window.location,origin);
                    window.location.replace(window.location.origin + '/');
                }}
                validateOnChange={false}
                validateOnBlur={false}
            >
                {({values, isSubmitting, isValidating, setFieldValue, touched, errors}) =>
                    <Form>
                        <div id='survey-title'>
                            <Field error={errors.surveyName} fullWidth helperText={errors.surveyName}
                                   name="surveyName"
                                   label="Title of your survey" size='medium' as={TextField}
                                   inputProps={{style: {fontSize: "40px"}}}/>
                        </div>
                        {errors.questions && errors.questions === 'At least one question is required!' &&
                        <div className="error-message">{errors.questions}</div>}
                        {
                            values.questions.filter(q => q.deleted === false).map((q) => (
                                <>
                                    <div className="shadow question-card">
                                        <Card>
                                            <Card.Header>
                                                <Field name={`questions[${q.questionID - 1}].questionName`}
                                                       fullWidth
                                                       placeholder="Insert your question"
                                                       as={TextField}/>
                                            </Card.Header>
                                            <Card.Body>
                                                {(() => {
                                                    switch (q.type) {
                                                        case questionType[1]:
                                                            return (
                                                                <>
                                                                    <Container>
                                                                        <Row>
                                                                            <Col>
                                                                                Number of alterntives:
                                                                                <Slider name="numberAlternatives-slider"
                                                                                        valueLabelDisplay="auto"
                                                                                        min={2} max={10}
                                                                                        defaultValue={4}
                                                                                        value={values.questions[q.questionID - 1].numberAlternatives}
                                                                                        onChange={(e, val) => {
                                                                                            setFieldValue(`questions[${q.questionID - 1}].numberAlternatives`, val);
                                                                                            setFieldValue(`questions[${q.questionID - 1}].alternatives.length`, val)
                                                                                            setFieldValue(`questions[${q.questionID - 1}].min`,
                                                                                                Math.min(val, values.questions[q.questionID - 1].min));
                                                                                            setFieldValue(`questions[${q.questionID - 1}].max`,
                                                                                                Math.min(val, values.questions[q.questionID - 1].max));
                                                                                        }}/>
                                                                            </Col>
                                                                            <Col>
                                                                                Minimum required answers:
                                                                                <Slider name="min-slider"
                                                                                        valueLabelDisplay="auto"
                                                                                        min={0}
                                                                                        max={q.numberAlternatives}
                                                                                        defaultValue={1}
                                                                                        value={values.questions[q.questionID - 1].min}
                                                                                        onChange={(e, val) => {
                                                                                            setFieldValue(`questions[${q.questionID - 1}].min`, val);
                                                                                            setFieldValue(`questions[${q.questionID - 1}].max`,
                                                                                                Math.max(val, values.questions[q.questionID - 1].max));
                                                                                        }}/>
                                                                            </Col>
                                                                            <Col>
                                                                                Maximum allowed answers:
                                                                                <Slider name="max-slider"
                                                                                        valueLabelDisplay="auto"
                                                                                        min={q.min}
                                                                                        max={q.numberAlternatives}
                                                                                        defaultValue={1}
                                                                                        value={values.questions[q.questionID - 1].max}
                                                                                        onChange={(e, val) => setFieldValue(`questions[${q.questionID - 1}].max`, val)}/>
                                                                            </Col>
                                                                        </Row>
                                                                        {
                                                                            range(0, q.numberAlternatives - 1).map(i =>
                                                                                <Row>
                                                                                    <Col md={5}>
                                                                                        <div className="option-field">
                                                                                            <Field
                                                                                                fullWidth
                                                                                                name={`questions[${q.questionID - 1}].alternatives[${i}]`}
                                                                                                placeholder={"Option #" + (i + 1)}
                                                                                                as={TextField}
                                                                                            />
                                                                                        </div>
                                                                                    </Col>
                                                                                </Row>
                                                                            )
                                                                        }
                                                                    </Container>
                                                                </>);
                                                            break;
                                                        case questionType[0]:
                                                            return (<>
                                                                <Container>
                                                                    <Row>
                                                                        <Col>
                                                                            <label>
                                                                                <Field
                                                                                    type="checkbox"
                                                                                    name={`questions[${q.questionID - 1}].required`}
                                                                                    as={Checkbox}
                                                                                />
                                                                                required
                                                                            </label>
                                                                        </Col>
                                                                    </Row>
                                                                </Container>
                                                            </>);
                                                            break;
                                                    }
                                                })()}
                                                <Row className="button-delete justify-content-end">
                                                    <Col md={2}><Button id={"button-delete-question-" + q.questionID}
                                                                        className="button-delete"
                                                                        variant="danger"
                                                                        onClick={() => setFieldValue(`questions[${q.questionID - 1}].deleted`, true)}>Delete</Button></Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </>
                            ))}
                        <Container>
                            <Row className="justify-content-around">
                                <Col md={3}>
                                    <Button className="add-question-button" onClick={() => {
                                        setFieldValue(`questions[${latestID - 1}]`, {
                                            questionID: latestID,
                                            type: questionType[0],
                                            questionName: "",
                                            required: false,
                                            deleted: false,
                                        });
                                        setLatestID(i => i + 1);
                                    }}>Add Open Question</Button>
                                </Col>
                                <Col md={3}>
                                    <Button className="add-question-button" onClick={() => {
                                        setFieldValue(`questions[${latestID - 1}]`, {
                                            type: questionType[1],
                                            questionName: "",
                                            questionID: latestID,
                                            min: 1,
                                            max: 1,
                                            numberAlternatives: 4,
                                            alternatives: [null, null, null, null],
                                            deleted: false,
                                        });
                                        setLatestID(i => i + 1);
                                    }}>Add Close Question</Button>
                                </Col>
                            </Row>
                            <Row className="justify-content-around">
                                <Col md={2}>
                                    <Button type="submit" disabled={isSubmitting || isValidating}
                                            className="submit-button">Submit</Button>
                                </Col>
                            </Row>
                        </Container>
                    </Form>}
            </Formik>
        </Container>
    )
}

export {questionType, SurveyEditor};