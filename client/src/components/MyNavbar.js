import {Button, Col, Navbar, Row} from "react-bootstrap";
import {logOut} from "../adapters/LogInAdapter";

function MyNavbar(props) {

    return (
        <Row>
            <Navbar bg="primary" variant="dark" className="justify-content-md-between">
                <Col lg={4}>
                    <Navbar.Brand>Surveyz</Navbar.Brand>
                </Col>
                {props.username === undefined ? <></> :
                    <Col lg={3} >
                        <Navbar.Brand>Welcome {props.username}</Navbar.Brand>
                        {() => "  "}
                        <Button onClick={() => {
                            logOut();
                            props.setLoginState(s => null)
                        }} variant="danger">Logout</Button>
                    </Col>}
            </Navbar>
        </Row>
    )
}

export default MyNavbar;