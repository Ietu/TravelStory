import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Container, Modal, Button, Form } from 'react-bootstrap';
import validator from 'validator';

// Component imports
import NavBar from "./components/Nav";
import Matkakohteet from "./components/Matkakohteet";
import Kotisivu from "./components/Kotisivu";
import Neljanollanelja from "./components/404";
import OmatMatkat from './components/Omatmatkat';
import PorukanMatkat from './components/Porukanmatkat';
import Jasenet from './components/Jasenet';
import Profiili from './components/Omat_tiedot';
import NonLoggedEtusivu from './components/NonLoggedEtusivu';
import NonLoggedMatkakohteet from './components/NonLoggedMatkakohteet';
import Header from "./components/Navbar(nonLogged)";
import { AlertError } from './components/Alerts/AlertError';
import { AlertSuccess } from './components/Alerts/AlertSuccess';
import "./styles/App.css";

const App = () => {
  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState('');
  const sessAuth = sessionStorage.getItem("Auth");
  const [showSigninModal, setShowSigninModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (sessAuth) {
      setAuth(true);
    }
  }, [])

  // Alertit olisi paremmat funktioina en lähde enää muokkaamaan
  useEffect(() => {
    if (showError) {
      setTimeout(() => {
        setShowError(false);
        setErrorMsg("");
      }, 7000);
    }
  }, [showError]);

  useEffect(() => {
    if (showSuccess) {
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMsg("");
      }, 5000);
    }
  }, [showSuccess]);

  const addLoggedUser = (userData) => {
    sessionStorage.setItem("userToken", userData.userToken); //Change in future for more security
    sessionStorage.setItem("Auth", true);
    sessionStorage.setItem("username", userData.userName);
    setToken(userData.userToken);
    setAuth(true);
  }

  return (
    <Router>
      {auth ?
        <div id='app'>
          {showError ? <AlertError errorMsg={errorMsg} /> : null}
          {showSuccess ? <AlertSuccess successMsg={successMsg} /> : null}
          <header>
            <NavBar setAuth={setAuth} />
          </header>
          <Routes>
            <Route path='/' element={<Kotisivu />} />
            <Route path='/matkakohteet' element={<Matkakohteet
              setShowError={setShowError}
              setErrorMsg={setErrorMsg}
              setShowSuccess={setShowSuccess}
              setSuccessMsg={setSuccessMsg} />} />
            <Route path='/omatmatkat' element={<OmatMatkat />} />
            <Route path='/porukanmatkat' element={<PorukanMatkat />} />
            <Route path='/jasenet' element={<Jasenet
              setShowError={setShowError}
              setErrorMsg={setErrorMsg}
              setShowSuccess={setShowSuccess}
              setSuccessMsg={setSuccessMsg} />} />
            <Route path='/profiili' element={<Profiili id={token} />} />
            <Route path='*' element={<Neljanollanelja />} />
          </Routes>
        </div>
        :
        <div id='nonLogged-app'>
          <Header loginShown={showLoginModal} signinShown={showSigninModal} setShowLoginModal={setShowLoginModal} setShowSigninModal={setShowSigninModal} />
          {showError ? <AlertError errorMsg={errorMsg} /> : null}
          {showSuccess ? <AlertSuccess successMsg={successMsg} /> : null}
          <Routes>
            <Route path='/nonLoggedEtusivu' element={<NonLoggedEtusivu />} />
            <Route path='/nonLoggedMatkakohteet' element={<NonLoggedMatkakohteet setShowError={setShowError} setErrorMsg={setErrorMsg} />} />
            <Route path='*' element={<NonLoggedEtusivu />} />
          </Routes>
          <SigninModal
            show={showSigninModal}
            onHide={() => setShowSigninModal(false)}
            setShowError={setShowError}
            setErrorMsg={setErrorMsg}
            setShowSuccess={setShowSuccess}
            setSuccessMsg={setSuccessMsg} />
          <LoginModal
            show={showLoginModal}
            onHide={() => setShowLoginModal(false)}
            addLoggedUser={addLoggedUser}
            setShowError={setShowError}
            setErrorMsg={setErrorMsg} />
        </div>
      }
    </Router>
  );
}

export const LoginModal = (props) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginClick, setLoginClick] = useState(false);
  var navigate = useNavigate();

  // Sisäänkirjautuminen
  useEffect(() => {
    const LoginAsync = async () => {
      try {
        var success = false;
        var userData = {};
        let data = {
          email: email,
          password: password
        }
        const response = await fetch("http://localhost:3000/User/login", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const fetchedData = await response.json();
        if (response) {
          if (fetchedData.status == 200) {
            console.log("Kirjauduit sisään jipii!")
            userData = {
              userToken: fetchedData.accessToken,
              userName: fetchedData.userName
            };
            success = true;
          } else if (fetchedData.status == 204) {
            props.setShowError(true);
            props.setErrorMsg(fetchedData.message);
            return;
          } else {
            props.setShowError(true);
            props.setErrorMsg(fetchedData.message);
            return;
          }
          setEmail("");
          setPassword("");
        }
        if (success) {
          props.addLoggedUser(userData);
          props.onHide();
          navigate('/');
        }
      } catch (error) {
        props.setErrorMsg("Virhe sisäänkirjautumisessa." + "<br />" + error);
        props.setShowError(true);
        return;
      }
    }
    if (loginClick) {
      LoginAsync();
      setLoginClick(false);
    }
  }, [loginClick])


  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <h5 className="modal-title" id="LoginModalLabel">Sisäänkirjautuminen</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Sähköpostiosoite:</Form.Label>
              <Form.Control type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Salasana:</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Peruuta</Button>
        <Button variant="primary" onClick={() => setLoginClick(true)}>Kirjaudu sisään</Button>
      </Modal.Footer>
    </Modal>
  );
}

export const SigninModal = (props) => {

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");
  const [signinClick, setsigninClick] = useState(false);
  var error = false; // Double-check jos return false ei riitä...

  useEffect(() => {
    console.log("clicked")
    const SigninAsync = async () => {
      try {
        if (!email || !username || !password || !passwordVerify) {
          console.log("Jotkin kentistä tyhjänä!");
          props.setShowError(true);
          props.setErrorMsg("Jotkin kentistä tyhjänä! Täytä tiedot jokaiseen kenttään.");
          error = true;
          return false;
        }
        if (password !== passwordVerify) {
          console.log("Salasanat eivät täsmää!");
          props.setShowError(true);
          props.setErrorMsg("Salasanat eivät täsmää!");
          error = true;
          return false;
        }
        if (password.length < 9) {
          console.log("Salasana liian lyhyt!");
          props.setShowError(true);
          props.setErrorMsg("Salasana liian lyhyt!");
          error = true;
          return false;
        }
        if (!validator.isEmail(email)) {
          console.log("Virheellinen sähköpostin muotoilu!");
          props.setShowError(true);
          props.setErrorMsg("Virheellinen sähköpostin muotoilu!");
          error = true;
          return false;
        }
        if (!error) {
          let data = {
            nimimerkki: username,
            email: email,
            password: passwordVerify
          }
          const response = await fetch("http://localhost:3000/User/signin", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify(data),
          });
          if (response) {
            if (response.status == 201) {
              console.log("Käyttäjä luotu!");
              props.setSuccessMsg("Käyttäjä luotu!");
              props.setShowSuccess(true);
            } else {
              if (response.status == 409) {
                props.setErrorMsg("Syöttämälläsi sähköpostiosoitteella on jo olemassaoleva käyttäjä.");
                props.setShowError(true);
                return;
              } else if (response.status == 404) {
                props.setShowError(true);
                props.setErrorMsg("Tapahtui virhe! Todennäköisesti yhteys palvelimeen reistailee, koita uudestaan hetken kuluttua tai ota yhteyttä ylläpitäjään.");
                return;
              } else {
                props.setErrorMsg("Käyttäjää luodessa tapahtui virhe!");
                props.setShowError(true);
                return;
              }
            }
            setEmail("");
            setUsername("");
            setPassword("");
            setPasswordVerify("");
          }
          props.onHide();
        }
      }
      catch (error) {
        props.setErrorMsg("Virhe rekisteröitymisessä." + "<br />" + error);
        props.setShowError(true);
        return;
      }
    }
    if (signinClick) {
      SigninAsync();
      setsigninClick(false);
    }
  }, [signinClick])

  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <h5 className="modal-title" id="SigninModalLabel">Käyttäjän luonti</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Sähköpostiosoite:</Form.Label>
              <Form.Control type="text" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Käyttäjä:</Form.Label>
              <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} data-testid="username" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Salasana:</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="password" />
              <small class="form-text text-muted">
                Salasanan täytyy olla vähintään 8 merkin mittainen.
              </small>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Varmista salasana:</Form.Label>
              <Form.Control type="password" value={passwordVerify} onChange={(e) => setPasswordVerify(e.target.value)} data-testid="password-verify" />
            </Form.Group>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} data-testid="cancel-btn">Peruuta</Button>
        <Button variant="primary" onClick={() => setsigninClick(true)} data-testid="signin-btn">Luo käyttäjä</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default App;
