import { NavLink, useNavigate } from 'react-router-dom';
import { Button, Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import "../styles/Navbar.css";

// Kirjautuneen käyttäjän navbar. Tätä kautta kirjaudutaan sovelluksesta ulos.
export default function NavBar(props) {

    const userName = sessionStorage.getItem("username");
    let navigate = useNavigate();

    // Uloskirjautuminen
    function logOff() {
        sessionStorage.removeItem("userToken");
        sessionStorage.removeItem("Auth");
        sessionStorage.removeItem("username");
        props.setAuth(false);
        navigate('/nonLoggedEtusivu');
    }

    return (
        <Navbar id='navbar-Logged' expand="xl">
            <Container>
                <Navbar.Brand>Matkakertomus</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse>
                    <Nav className='me-auto'>
                        <Nav.Link as={NavLink} to='/'>Kotisivu</Nav.Link>
                        <Nav.Link as={NavLink} to={'/matkakohteet'}>Matkakohteet</Nav.Link>
                        <NavDropdown title="Matkat">
                            <NavDropdown.Item as={NavLink} to={'/omatmatkat'}>Omat matkat</NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to={'/porukanmatkat'}>Porukan matkat</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link as={NavLink} to={'/jasenet'}>Jäsenet</Nav.Link>
                        <Nav.Link as={NavLink} to={'/profiili'}>Omat tiedot</Nav.Link>
                    </Nav>
                    <Nav className='ml-auto'>
                        <h5 style={{ color: "white", alignSelf: "center", marginBottom: "10px", marginTop: "10px", marginRight: "10px" }}>Moikka {userName}!</h5>
                        <Button onClick={logOff} style={{ width: "fit-content", alignSelf: "center" }}>Kirjaudu ulos</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}