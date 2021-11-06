import {Form, Formik, Field} from "formik";
import {Container, TextField, Input} from "@material-ui/core";
import * as Yup from "yup";
import {Button, Row} from "react-bootstrap";
import {logIn} from "../adapters/LogInAdapter";

const loginValidationSchema = Yup.object().shape({
    username: Yup.string().required(),
    password: Yup.string().required().min(8),
})

function LogIn(props) {
    return (
        <div className="justify-content-center">
            <Formik
                initialValues={{
                    username: "",
                    password: "",
                }}
                validationSchema={loginValidationSchema}
                onSubmit={async (values) => {
                    let result = await logIn(values);
                    if (!result.message && !result.error)
                        props.setLoginState(result);
                }}
                validateOnChange={false}
                validateOnBlur={false}>
                {({values}) =>
                    <Form>
                        <div className="login-form">
                            <Container>
                                <Row>
                                    <Field name="username" label="Username" variant="filled" as={TextField}/>
                                </Row>
                                <Row>
                                    <Field name="password" label="Password" variant="filled" type="password"
                                           as={TextField}/>
                                </Row>
                                <Row>
                                    <Button className="login-button" type="submit">Login</Button>
                                </Row>
                            </Container>
                        </div>
                    </Form>
                }
            </Formik>
        </div>
    )
}

export default LogIn;