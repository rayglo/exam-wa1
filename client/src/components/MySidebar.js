import {Container, ListGroup} from "react-bootstrap";
import {GearFill, PlusCircleFill, Clipboard} from "react-bootstrap-icons";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";


function MySidebar(props) {
    const [activeItem, setActiveItem] = useState("");

    //For the first initialization of the active item. Executed after the initial render
    useEffect(() => {
        let url = window.location.href.toString().split("/")[3];
        switch (url) {
            case "":
                setActiveItem("sidebar-item-1");
                break;
            case "new-survey":
                setActiveItem("sidebar-item-2");
                break;
        }
    }, []);

    return (
        <Container>
            <ListGroup>
                <Link to="/">
                    <ListGroup.Item onClick={() => setActiveItem("sidebar-item-1")}
                                    active={activeItem === "sidebar-item-1"}>
                        <Clipboard/> Your Surveys
                    </ListGroup.Item>
                </Link>
                <Link to="/new-survey">
                    <ListGroup.Item onClick={() => setActiveItem("sidebar-item-2")}
                                    active={activeItem === "sidebar-item-2"}>
                        <PlusCircleFill/> New Survey
                    </ListGroup.Item>
                </Link>
            </ListGroup>
        </Container>
    );
}

export default MySidebar;