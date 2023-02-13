import '../styles/Omat_tiedot.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form'
import { Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { AlertError } from '../components/Alerts/AlertError';

export default function Profiili() {

    const [nimimerkki, setNimimerkki] = useState("");
    const [sposti, setSposti] = useState("");
    const [salasana, setSalasana] = useState("");
    const [kokonimi, setKokonimi] = useState("");
    const [esittely, setEsittely] = useState("");
    const [paikkakunta, setPaikkakunta] = useState("");
    const [kuva, setKuva] = useState("");
    const [uusikuva, setUusikuva] = useState({});
    const [id, setId] = useState();
    const [mkclicked, setMkClicked] = useState(false);
    const [tlnclicked, setTlnClicked] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [refresh, setRefresh] = useState(false);
    const handleRefresh = () => setRefresh(true);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        const parseJwt = async () => {
            let token = sessionStorage.userToken;
            var base64Payload = token.split('.')[1];
            var payload = Buffer.from(base64Payload, 'base64');
            var result = JSON.parse(payload.toString());
            setId(result.id);
            setRefresh(true);
        }
        parseJwt();
    }, []);
    // Positetaan errormessage 7 sek. jälkeen.
    useEffect(() => {
        if (showError) {
            setTimeout(() => {
                setShowError(false);
                setErrorMsg("");
            }, 7000);
        }
    }, [showError]);

    useEffect(() => {
        const fetchKayttaja = async () => {
            try {
                const response = await fetch(`http://localhost:3000/matkaaja/haeMatkaaja/${id}`, {
                    method: "GET"
                });
                const data = await response.json();
                console.log("MATKAAJA DATA: ", data)
                try {
                    if (!data || data.length === 0) {
                        setErrorMsg("Käyttäjää ei löytynyt.");
                        setShowError(true);
                        return;
                    }
                    if (response) {
                        if (response.status === 400) {
                            setErrorMsg("Virhe haettaessa käyttäjä.");
                            setShowError(true);
                            setFetchError(true);
                            return;
                        }
                        setKokonimi(data[0].etunimi + ' ' + data[0].sukunimi)
                        setNimimerkki(data[0].nimimerkki)
                        setSposti(data[0].email)
                        setSalasana(data[0].password)
                        setEsittely(data[0].esittely)
                        setPaikkakunta(data[0].paikkakunta)
                        setKuva(data[0].kuva)
                        setFetchError(false);
                        setRefresh(false);
                        setTlnClicked(false);
                        setMkClicked(false);
                    }
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                setErrorMsg("Virhe haettaessa käyttäjää. " + error);
                setShowError(true);
                setFetchError(true);
            }
        }
        if (refresh) {
            fetchKayttaja();
        }
    }, [refresh]);

    useEffect(() => {
        const pvtMatkaaja = async () => {
            var deleteimg = true;

            if (uusikuva.name == undefined || uusikuva.name == null) {
                deleteimg = false;
                uusikuva.name = kuva;
            } else if (uusikuva.name == kuva) {
                deleteimg = false;
            }
            if (uusikuva !== null || uusikuva !== undefined) {
                const matkaaja = {
                    idmatkaaja: id,
                    etunimi: kokonimi.split(" ")[0],
                    sukunimi: kokonimi.split(" ")[1],
                    nimimerkki: nimimerkki,
                    paikkakunta: paikkakunta,
                    esittely: esittely,
                    kuva: uusikuva.name,
                    email: sposti,
                    password: salasana,
                    deleteimage_bool: deleteimg,
                    deleteimage: kuva
                }
                try {
                    //Päivitetään käyttäjätiedot ja kuva
                    const updateUser = async () => {
                        const response = await fetch(`http://localhost:3000/matkaaja/updateMatkaaja`, {
                            method: "PUT",
                            headers: {
                                "Content-type": "application/json",
                            },
                            body: JSON.stringify(matkaaja),
                        });
                        if (response) {
                            if (response.status === 409) {
                                setErrorMsg("Kuva tällä nimellä löytyy jo palvelimelta, muuta kuvan tiedostonimeä!");
                                setShowError(true);
                                return;
                            } else {
                                let data = new FormData();
                                data.append('file', uusikuva)
                                await fetch("http://localhost:3000/uploadImage", {
                                    method: "POST",
                                    body: data,
                                });
                                console.log("Matkaajan päivitys onnistui!")
                            }
                        }
                        handleRefresh();
                    }
                    updateUser();
                } catch (error) {
                    console.log(error)
                }
            }
            else {
                //Jos ei ole valittu uutta kuvaa
                const matkaaja = {
                    idmatkaaja: id,
                    etunimi: kokonimi.split(" ")[0],
                    sukunimi: kokonimi.split(" ")[1],
                    nimimerkki: nimimerkki,
                    paikkakunta: paikkakunta,
                    esittely: esittely,
                    kuva: kuva,
                    email: sposti,
                    password: salasana,
                    deleteimage_bool: false,
                }
                const updateUser = async () => {
                    const response = await fetch(`http://localhost:3000/matkaaja/updateMatkaaja`, {
                        method: "PUT",
                        headers: {
                            "Content-type": "application/json",
                        },
                        body: JSON.stringify(matkaaja),
                    });
                    console.log(JSON.stringify(matkaaja));
                    if (response) {
                        if (response.status === 409) {
                            setErrorMsg("Kuva tällä nimellä löytyy jo palvelimelta, muuta kuvan tiedostonimeä!");
                            setShowError(true);
                            return;
                        } else if (response.status === 204) {
                            console.log("Matkaajan päivitys onnistui!")
                        }
                        else {
                            console.log("Jotain odottamatonta tapahtui...")
                        }
                    }
                    handleRefresh();
                }
                updateUser();
            }
        }
        if (tlnclicked) {
            pvtMatkaaja();
        }
    }, [tlnclicked])

    function handleMkClicked(e) {
        e.preventDefault();
        setMkClicked(true);
        setTlnClicked(false);
    }

    function handlePerClicked(e) {
        e.preventDefault();
        setMkClicked(false);
        setTlnClicked(false);
    }

    function handleTlnClicked(e) {
        e.preventDefault();
        setMkClicked(false);
        setTlnClicked(true);
    }

    const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setUusikuva(e.target.files[0]);
            //setKuva(e.target.files[0].name)
            console.log(e.target.files[0].name)
        }
    }

    if (!fetchError) {
        return (
            <div id='profile-container' className='container-fluid'>
                <Form onSubmit={(e) => handleTlnClicked(e)}>
                    <div className="pohja">
                        {showError ? <AlertError errorMsg={errorMsg} /> : null}
                        {!mkclicked ?
                            <div className="card profile-card">
                                <img src={"http://localhost:3000/images/" + kuva} alt="..." style={{ width: "100%", borderRadius: "18px", minHeight: "355px", maxHeight: "355px" }} />
                                <h1>{kokonimi}</h1>
                                <p>{paikkakunta}</p>
                            </div> :
                            <div>
                                <div className="card profile-card">
                                    <img src={"http://localhost:3000/images/" + kuva} alt="..." style={{ width: "100%", borderRadius: "18px", minHeight: "355px", maxHeight: "355px" }} />
                                    <h1>{kokonimi}</h1>
                                    <p>{paikkakunta}</p>
                                </div>
                                <div>
                                    <Form.Group controlId="formFile" className="mb-3 mt-1">
                                        <Form.Control type="file" accept='image/*' onChange={(e) => imageChange(e)} />
                                    </Form.Group>
                                </div>
                            </div>
                        }
                        <div className="main">
                            <h2 id="profile-header-text" style={{ color: "white" }}>Profiilin tiedot</h2>
                            <div className="box">
                                {/*{showError ? <AlertError errorMsg={errorMsg} /> : null}*/}
                                <div className="box-body">
                                    {
                                        !mkclicked ?
                                            <table>
                                                <tbody>
                                                    <tr><td>Nimi:</td><td></td><td>{kokonimi}</td></tr>
                                                    <tr><td>Nimimerkki:</td><td></td><td>{nimimerkki}</td></tr>
                                                    <tr><td>Paikkakunta:</td><td></td><td>{paikkakunta}</td></tr>
                                                    <tr><td>Jäsennumero:</td><td></td><td>{id}</td></tr>
                                                    <tr><td>Sähköposti:</td><td></td><td>{sposti}</td></tr>
                                                    <tr><td>Salasana:</td><td></td><td>{salasana}</td></tr>
                                                    <tr><td>Esittely:</td><td></td><td>{esittely}</td></tr>
                                                </tbody>
                                            </table>
                                            :
                                            <Form.Group>
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td>Nimi:</td>
                                                            <td></td>
                                                            <td><Form.Control className='profile-inputs' type="text" value={kokonimi} onChange={(e) => setKokonimi(e.target.value)} /></td>   
                                                        </tr>
                                                        <tr>
                                                            <td>Nimimerkki:</td>
                                                            <td></td>
                                                            <td><Form.Control className='profile-inputs' type="text" value={nimimerkki} onChange={(e) => setNimimerkki(e.target.value)} /></td>
                                                        </tr>
                                                        <tr>
                                                            <td>Paikkakunta:</td>
                                                            <td></td>
                                                            <td><Form.Control className='profile-inputs' type="text" value={paikkakunta} onChange={(e) => setPaikkakunta(e.target.value)} /></td>
                                                        </tr>
                                                        <tr>
                                                            <td>Jäsennumero:</td>
                                                            <td></td>
                                                            <td><Form.Control className='profile-inputs' type="text" disabled value={id} /></td>
                                                        </tr>
                                                        <tr>
                                                            <td>Sähköposti:</td>
                                                            <td></td>
                                                            <td><Form.Control className='profile-inputs' type="email" value={sposti} onChange={(e) => setSposti(e.target.value)} /></td>
                                                        </tr>
                                                        <tr>
                                                            <td>Salasana:</td>
                                                            <td></td>
                                                            <td><Form.Control className='profile-inputs' type="password" value={salasana} onChange={(e) => setSalasana(e.target.value)} /></td>
                                                        </tr>
                                                        <tr>
                                                            <td>Esittely:</td>
                                                            <td></td>
                                                            <td><Form.Control className='profile-inputs' as="textarea" style={{ resize: "none" }} rows={3} value={esittely} onChange={(e) => setEsittely(e.target.value)} /></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </Form.Group>
                                    }
                                    <div className='buttons' style={{ display: "flex" }}>
                                        <Button variant="success" style={{ width: "20%", height: "20%", margin: "2px", marginTop: mkclicked ? "-70px" : "2px", pointerEvents: mkclicked ? "auto" : "none", opacity: mkclicked ? "1" : "0.5" }} onClick={(e) => handleTlnClicked(e)}>Tallenna</Button>{' '}
                                        <Button variant="primary" style={{ width: "20%", height: "20%", margin: "2px", marginTop: mkclicked ? "-70px" : "2px" }} onClick={(e) => handleMkClicked(e)}>Muokkaa</Button>{' '}
                                        <Button variant="danger" style={{ width: "20%", height: "20%", margin: "2px", marginLeft: "200px", marginTop: mkclicked ? "-70px" : "2px" }} onClick={(e) => handlePerClicked(e)}>Peruuta</Button>{' '}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        )
    }
}
