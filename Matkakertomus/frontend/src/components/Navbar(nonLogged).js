import { NavLink } from 'react-router-dom';
import { Button, Navbar, Nav, Container } from 'react-bootstrap';
import '../styles/Navbar(nonlogged).css';

// Kirjautumattoman käyttäjän navbar. Näytetään etusivulla.
export default function Header(props) {

    const loginShown = props.loginShown;
    const signinShown = props.signinShown;

    return (
        <header>
            <Navbar id='navbar-nonLogged' expand="lg" className="bg-light">
                <Container>
                    <Navbar.Brand>Matkakertomus</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse>
                        <Nav className='me-auto'>
                            <Nav.Link as={NavLink} to='/nonLoggedEtusivu'>Etusivu</Nav.Link>
                            <Nav.Link as={NavLink} to={'/nonLoggedMatkakohteet'}>Matkakohteet</Nav.Link>
                        </Nav>
                        <Nav className='ml-auto'>
                            <Button disabled={loginShown || signinShown} className="loginsignin-btn bg-light text-dark mr-1 mt-1" onClick={() => props.setShowLoginModal(true)}>Kirjaudu sisään</Button>
                            <Button disabled={loginShown || signinShown} className="loginsignin-btn bg-light text-dark mt-1" onClick={() => props.setShowSigninModal(true)}>Rekisteröidy</Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}


