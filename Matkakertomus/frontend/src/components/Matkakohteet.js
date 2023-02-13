import '../styles/Matkakohteet.css'
import { useEffect, useState } from 'react';
import { Container, Modal, Button, Form, Card, Spinner, InputGroup, FormControl, CloseButton } from 'react-bootstrap';

export default function Matkakohteet(props) {

    const [matkat, setMatkat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMatkat, setLoadingMatkat] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorEmpty, setErrorEmpty] = useState("");
    const [errorNormal, setErrorNormal] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [clickedDiv, setClickedDiv] = useState(null);
    const [sortClicked, setSortClicked] = useState(false);
    const [searchWord, setSearchWord] = useState("");
    const [searchClicked, setSearchClicked] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const handleRefresh = () => setRefresh(true);

    // Tyylitys objekti järjestysnappulan kolmiolle :D.
    const triangleStyle = {
        sorted:
        {
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderBottom: "15px solid white",
            alignSelf: "center",
            marginLeft: "3px",
            marginBottom: "5px"
        },
        unSorted:
        {
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "15px solid white",
            alignSelf: "center",
            marginLeft: "3px"
        }
    }

    // Matkakohteiden haku.
    useEffect(() => {
        const fetchMatkat = async () => {
            try {
                const response = await fetch("http://localhost:3000/matkakohteet", {
                    method: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
                    }
                });
                const data = await response.json();
                try {
                    if (!data) {
                        setErrorEmpty("Matkakohteita ei löytynyt... tallenna sovelluksen ensimmäinen matkakohde!");
                        props.setErrorMsg("Matkakohteita ei löytynyt.");
                        props.setShowError(true);
                        setLoading(false);
                        return;
                    }
                    if (response) {
                        if (response.status == 400) {
                            setErrorNormal("Virhe haettaessa matkakohteita... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
                            props.setErrorMsg("Virhe haettaessa matkakohteita.");
                            props.setShowError(true);
                            setFetchError(true);
                            return;
                        }
                        setMatkat(data);
                        setFetchError(false);
                    }
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                setErrorNormal("Virhe haettaessa matkakohteita... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
                props.setErrorMsg("Virhe haettaessa matkakohteita." + "<br />" + error);
                props.setShowError(true);
                setFetchError(true);
            }
            setLoading(false);
            setLoadingMatkat(false);
            setRefresh(false);
            setSearchWord("");
            setShowModal(false);
            setClickedDiv(null);
            setShowAddModal(false);
            setShowUpdateModal(false);
        }
        fetchMatkat();
    }, [refresh])

    // Yksittäisen matkakohteen haku.
    useEffect(() => {
        const FetchMatkaByName = async () => {
            try {
                setLoadingMatkat(true);
                const response = await fetch("http://localhost:3000/matkakohteet/getMatka?kohde=" + searchWord, {
                    method: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
                    }
                });
                const data = await response.json();
                try {
                    if (data.length == 0 || !data) {
                        props.setErrorMsg("Matkakohteita annetulla hakusanalla ei löytynyt.");
                        props.setShowError(true);
                    }
                    if (response) {
                        if (response.status == 400) {
                            setErrorNormal("Virhe haettaessa matkakohteita... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
                            props.setErrorMsg("Virhe haettaessa matkakohteita.");
                            props.setShowError(true);
                            setFetchError(true);
                            return;
                        }
                        setMatkat(data);
                        setFetchError(false);
                    }
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                setErrorNormal("Virhe haettaessa matkakohteita... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
                props.setErrorMsg("Virhe haettaessa matkakohteita hakuehdoilla." + "<br />" + error);
                props.setShowError(true);
                setFetchError(true);
            }
            setRefresh(false);
            setShowModal(false);
            setClickedDiv(null);
            setShowAddModal(false);
            setShowUpdateModal(false);
            setLoadingMatkat(false);
        }
        if (searchClicked && searchWord != "") {
            FetchMatkaByName();
        }
        setSearchClicked(false);
    }, [searchClicked])

    // Avaa matkakohde-modalin.
    const HandleDivClick = (index) => {
        setClickedDiv(index);
        setShowModal(true);
    }

    // Matkat-muuttuja/taulukko aakkosjärjestykseen.
    const HandleSortClick = () => {
        if (sortClicked) {
            function SortMatkat(a, b) {
                return b.kohdenimi.localeCompare(a.kohdenimi);
            }
            if (matkat.length > 0) {
                var sortedBackwards = matkat.sort(SortMatkat);
                setMatkat(sortedBackwards);
            }
            setSortClicked(false);
        } else {
            function SortMatkat(a, b) {
                return a.kohdenimi.localeCompare(b.kohdenimi);
            }
            if (matkat.length > 0) {
                var sorted = matkat.sort(SortMatkat);
                setMatkat(sorted);
            }
            setSortClicked(true);
        }
    }

    // Hakukesntän X-nappulan painaminen, hakee kaikki matkakohteet uudelleen näkyviin.
    const HandleEmptyBtnClick = () => {
        setSearchWord("");
        setLoadingMatkat(true);
        setRefresh(true);
    }

    // Luodaan matkakohde-divit.
    const data = matkat.map((item, index) => {
        try {
            return (
                <div key={index} id='matkakohde-div' onClick={() => HandleDivClick(index)}>
                    <img src={"http://localhost:3000/images/" + item.kuva} alt="..." />
                    <h4 className='otsikko'>{item.kohdenimi},<p className='ala-otsikko'>{item.maa}</p></h4>
                </div>
            )
        } catch (error) {
            console.log(error);
            return (error);
        }
    })

    // UI START
    if (loading) {
        return (
            <div style={{ display: 'flex', height: '90vh', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation='border' variant='primary' style={{ width: '100px', height: '100px' }} />
            </div>
        )
    }
    else {
        if (!fetchError) {
            return (
                <div>
                    <div id='introduction-div'>
                        <h1>Matkakohteet</h1>
                        <h2>Matkakohteet sivulla voit selata, lisätä, poistaa ja päivittää matkakohteita.</h2>
                        <h2>Sellaista matkakohdetta johon on liitetty matkakertomus, ei voida poistaa tai muokata.</h2>
                    </div>
                    <div id="sticky-div">
                        <InputGroup id="inputgroup">
                            <FormControl placeholder='Hae matkakohteita...' aria-label='Hae matkakohteita...' value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
                            {
                                searchWord ? <CloseButton onClick={HandleEmptyBtnClick}
                                    style={{ alignSelf: "center", position: "absolute", zIndex: 1000, right: "60px" }} /> : null
                            }
                            <Button variant='secondary' onClick={() => setSearchClicked(true)}>Hae</Button>
                        </InputGroup>
                        <Button id="add-btn" onClick={() => setShowAddModal(true)}>Lisää matkakohde</Button>
                        <div id='sort-div-clickable' onClick={HandleSortClick}>
                            A<br />Ö<div style={!sortClicked ? triangleStyle.sorted : triangleStyle.unSorted}></div>
                        </div>
                    </div>
                    {
                        loadingMatkat ?
                            <div style={{ display: 'flex', marginTop: "10%", justifyContent: 'center' }}>
                                <Spinner animation='border' variant='primary' style={{ position: "fixed", width: '100px', height: '100px' }} />
                            </div>
                            :
                            <Container id='matkakohde-container' className='mt-1'>
                                {
                                    errorEmpty != "" &&
                                    <h2 className='error-headers'>{errorEmpty}</h2>
                                }
                                {
                                    matkat.length > 0 ? data : null
                                }
                            </Container>
                    }
                    {
                        clickedDiv != null ?
                            <>
                                <MatkakohdeModal
                                    show={showModal}
                                    refreshPage={handleRefresh}
                                    onHide={() => setShowModal(false)}
                                    showUpdateModal={() => setShowUpdateModal(true)}
                                    matka={matkat[clickedDiv]}
                                    setShowError={props.setShowError}
                                    setErrorMsg={props.setErrorMsg}
                                    setShowSuccess={props.setShowSuccess}
                                    setSuccessMsg={props.setSuccessMsg} style={{ marginTop: "70px", height: "90vh" }} centered />
                                <MatkakohdeUpdateModal
                                    show={showUpdateModal}
                                    refreshPage={handleRefresh}
                                    onHide={() => setShowUpdateModal(false)}
                                    matka={matkat[clickedDiv]}
                                    setShowError={props.setShowError}
                                    setErrorMsg={props.setErrorMsg}
                                    setShowSuccess={props.setShowSuccess}
                                    setSuccessMsg={props.setSuccessMsg} style={{ marginTop: "70px", height: "85vh" }} centered />
                            </>
                            : null
                    }
                    <MatkakohdeAddModal
                        show={showAddModal}
                        refreshPage={handleRefresh}
                        onHide={() => setShowAddModal(false)}
                        setShowError={props.setShowError}
                        setErrorMsg={props.setErrorMsg}
                        setShowSuccess={props.setShowSuccess}
                        setSuccessMsg={props.setSuccessMsg} style={{ marginTop: "70px", height: "85vh" }} centered />
                </div>
            );
        } else {
            return (
                <div>
                    {
                        errorNormal != "" &&
                        <h2 className='error-headers'>{errorNormal}</h2>
                    }
                </div>
            );
        }
    }
}

function MatkakohdeModal(props) {

    var matka = props.matka;

    const poistaKohde = () => {
        const id = matka.idmatkakohde;
        const data = {
            id: id
        }
        const poistaMatka = async () => {
            try {
                const response = await fetch("http://localhost:3000/matkakohteet/deleteMatka", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken"),
                    },
                    body: JSON.stringify(data),
                });
                if (response) {
                    if (response.status == 400) {
                        props.setErrorMsg("Palvelimen päässä tapahtui virhe...");
                        props.setShowError(true);
                    }
                    else if (response.status == 409) {
                        props.setErrorMsg("Tämän matkakohteen poisto ei ole mahdollista!");
                        props.setShowError(true);
                    } else if (response.status == 403) {
                        throw response.statusText + " (" + response.status + ")";
                    } else {
                        props.refreshPage();
                        props.setShowSuccess(true);
                        props.setSuccessMsg("Matkakohteen poisto tehty.");
                    }
                }
            } catch (error) {
                props.setErrorMsg("Virhe poistettaessa matkakohdetta.<br/>" + error);
                props.setShowError(true);
            }
        }
        poistaMatka();
    }

    const updateBtnClicked = () => {
        props.onHide();
        props.showUpdateModal();
    }

    const hideModal = () => {
        props.onHide();
    }

    if (matka == null) {
        return null;
    } else {
        return (
            <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                <Card className="text-center matkakohde-card">
                    <Card.Img variant="top" src={"http://localhost:3000/images/" + matka.kuva} />
                    <Card.Body>
                        <Card.Title><h2>{matka.kohdenimi}{matka.paikkakunta ? ", " + matka.paikkakunta : null}</h2></Card.Title>
                        <hr style={{ marginLeft: "10px", marginRight: "10px", border: "1px solid", borderRadius: "5px" }} />
                        <Card.Text>
                            <h5>{matka.kuvausteksti}</h5>
                        </Card.Text>
                    </Card.Body>
                </Card>
                <Modal.Footer>
                    <Button variant="danger" onClick={poistaKohde}>
                        Poista matkakohde
                    </Button>
                    <Button variant='primary' onClick={updateBtnClicked}>
                        Muokkaa matkakohdetta
                    </Button>
                    <Button onClick={hideModal}>Sulje</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

function MatkakohdeAddModal(props) {

    const [kohde, setKohde] = useState("");
    const [maa, setMaa] = useState("");
    const [paikkakunta, setPaikkakunta] = useState("");
    const [kuvaus, setKuvaus] = useState("");
    const [picture, setPicture] = useState("");
    const [checked, setChecked] = useState(false);

    const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setPicture(e.target.files[0]);
        }
    }

    function addMatka(event) {
        event.preventDefault();

        if (!checked) {
            props.setErrorMsg("Varmista lisäys.");
            props.setShowError(true);
        } else {
            const matka = {
                kohdenimi: kohde,
                maa: maa,
                paikkakunta: paikkakunta,
                kuvausteksti: kuvaus,
                kuva: picture.name
            }
            if (!matka.kohdenimi || !matka.maa || !matka.kuva || !matka.kuvausteksti) {
                props.setErrorMsg("Jotkin arvoista tyhjiä!<br/>Voit jättää vain paikkakunnan tyhjäksi.");
                props.setShowError(true);
                return;
            }
            else {
                const postMatka = async () => {
                    try {
                        const response = await fetch("http://localhost:3000/matkakohteet/addMatka", {
                            method: "POST",
                            headers: {
                                "Content-type": "application/json",
                                'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
                            },
                            body: JSON.stringify(matka),
                        });
                        if (response) {
                            if (response.status == 400) {
                                props.setErrorMsg("Virhe syötettäessä dataa!");
                                props.setShowError(true);
                                return;
                            }
                            if (response.status == 409) {
                                props.setErrorMsg("Kuva tällä nimellä löytyy jo palvelimelta, muuta kuvan tiedostonimeä!");
                                props.setShowError(true);
                                return;
                            } else if (response.status == 403) {
                                throw response.statusText + " (" + response.status + ")";
                            } else {
                                let data = new FormData();
                                data.append('file', picture)
                                await fetch("http://localhost:3000/uploadImage", {
                                    method: "POST",
                                    body: data,
                                });
                                setKohde("");
                                setMaa("");
                                setPaikkakunta("");
                                setKuvaus("");
                                setPicture("");
                                setChecked(false);
                                props.refreshPage();
                                props.setShowSuccess(true);
                                props.setSuccessMsg("Matkakohteen lisäys tehty!");
                            }
                        }
                    } catch (error) {
                        props.setErrorMsg("Virhe lisätessä matkakohdetta<br/>" + error);
                        props.setShowError(true);
                    }
                }
                postMatka();
            }
        }
    }

    return (
        <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Lisää matkakohde</Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Container>
                    <Form onSubmit={(e) => addMatka(e)}>
                        <Form.Group className="mb-3" controlId="formKohde">
                            <Form.Label>Kohteen nimi:</Form.Label>
                            <Form.Control value={kohde} type="text" onChange={(e) => setKohde(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formMaa">
                            <Form.Label>Maa:</Form.Label>
                            <Form.Control value={maa} type="text" onChange={(e) => setMaa(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPaikkakunta">
                            <Form.Label>Paikkakunta:</Form.Label>
                            <Form.Control value={paikkakunta} type="text" onChange={(e) => setPaikkakunta(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formKuvausteksti">
                            <Form.Label>Kuvaus:</Form.Label>
                            <Form.Control value={kuvaus} type="text" as="textarea" rows={3} onChange={(e) => setKuvaus(e.target.value)} />
                        </Form.Group>

                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Lisää kuva kohteestasi:</Form.Label>
                            <Form.Control type="file" accept='image/*' onChange={imageChange} />
                        </Form.Group>

                        {//URL.createObjectURL(picture) && <img src={URL.createObjectURL(picture)} width='100' height='100' />
                        }

                        <Form.Group className="mb-3" controlId="formBasicCheckbox">
                            <Form.Check type="checkbox" label="Olen tarkastanut syöttämäni tiedot" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                        </Form.Group>

                        <Modal.Footer>
                            <Button variant="primary" type="submit">
                                Lisää
                            </Button>
                            <Button onClick={props.onHide}>Sulje</Button>
                        </Modal.Footer>
                    </Form>
                </Container>
            </Modal.Body>
        </Modal>
    );
}

function MatkakohdeUpdateModal(props) {

    var matka = props.matka;
    const [kohde, setKohde] = useState("");
    const [maa, setMaa] = useState("");
    const [paikkakunta, setPaikkakunta] = useState("");
    const [kuvaus, setKuvaus] = useState("");
    const [picture, setPicture] = useState("");
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (matka) {
            setKohde(matka.kohdenimi);
            setMaa(matka.maa);
            setPaikkakunta(matka.paikkakunta);
            setKuvaus(matka.kuvausteksti);
        }
    }, [props.matka]);

    const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setPicture(e.target.files[0]);
        }
    }

    function updateMatka(event) {
        event.preventDefault();
        const refresh = props.refreshPage;
        var deleteimage_bool = true;

        if (!checked) {
            props.setErrorMsg("Varmista muokkaus.");
            props.setShowError(true);
            return;
        } else {
            const updatedData = {
                idmatkakohde: matka.idmatkakohde,
                kohdenimi: kohde,
                maa: maa,
                paikkakunta: paikkakunta,
                kuvausteksti: kuvaus,
                kuva: picture.name
            }
            const oldMatka = {
                idmatkakohde: matka.idmatkakohde,
                kohdenimi: matka.kohdenimi,
                maa: matka.maa,
                paikkakunta: matka.paikkakunta,
                kuvausteksti: matka.kuvausteksti,
                kuva: matka.kuva
            }
            if (updatedData.kuva == undefined || updatedData.kuva == oldMatka.kuva) {
                updatedData.kuva = oldMatka.kuva;
                deleteimage_bool = false;
            }
            if (JSON.stringify(updatedData) !== JSON.stringify(oldMatka)) {
                updatedData.deleteimage_bool = deleteimage_bool;
                updatedData.deleteimage = oldMatka.kuva;
                const putMatka = async () => {
                    try {
                        const response = await fetch("http://localhost:3000/matkakohteet/updateMatka", {
                            method: "PUT",
                            headers: {
                                "Content-type": "application/json",
                                'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
                            },
                            body: JSON.stringify(updatedData),
                        });
                        if (response) {
                            if (response.status == 400) {
                                console.log("Tapahtui virhe!")
                                props.setErrorMsg("Palvelimen päässä tapahtui virhe...");
                                props.setShowError(true);
                            }
                            else if (response.status == 409) {
                                props.setErrorMsg("Tämän matkakohteen muokkaus ei ole mahdollista!");
                                props.setShowError(true);
                                return;
                            } else if (response.status == 403) {
                                throw response.statusText + " (" + response.status + ")";
                            } else {
                                props.setShowSuccess(true);
                                props.setSuccessMsg("Matkakohteen muokkaus tehty!");
                            }
                            if (updatedData.kuva != oldMatka.kuva) {
                                let data = new FormData();
                                data.append('file', picture)
                                await fetch("http://localhost:3000/uploadImage", {
                                    method: "POST",
                                    body: data,
                                });
                                console.log("Picture Upload completed")
                            }
                            refresh();
                        }
                    } catch (error) {
                        props.setErrorMsg("Matkakohteen muokkauksessa tapahtui virhe.<br/>" + error);
                        props.setShowError(true);
                    }
                }
                putMatka();
            } else {
                props.setErrorMsg("Tiedot eivät muuttuneet.");
                props.setShowError(true);
            }
        }
    }

    return (
        <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Muokkaa matkakohdetta</Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Container>
                    <Form onSubmit={(e) => updateMatka(e)}>
                        <Form.Group className="mb-3" controlId="formKohde">
                            <Form.Label>Kohteen nimi:</Form.Label>
                            <Form.Control value={kohde} type="text" onChange={(e) => setKohde(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formMaa">
                            <Form.Label>Maa:</Form.Label>
                            <Form.Control value={maa} type="text" onChange={(e) => setMaa(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPaikkakunta">
                            <Form.Label>Paikkakunta:</Form.Label>
                            <Form.Control value={paikkakunta} type="text" onChange={(e) => setPaikkakunta(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formKuvausteksti">
                            <Form.Label>Kuvaus:</Form.Label>
                            <Form.Control value={kuvaus} type="text" as="textarea" rows={3} onChange={(e) => setKuvaus(e.target.value)} />
                        </Form.Group>

                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Lisää kuva kohteestasi:</Form.Label>
                            <Form.Control type="file" accept='image/*' onChange={imageChange} />
                        </Form.Group>

                        {//URL.createObjectURL(picture) && <img src={URL.createObjectURL(picture)} width='100' height='100' />
                        }

                        <Form.Group className="mb-3" controlId="formBasicCheckbox">
                            <Form.Check type="checkbox" label="Olen tarkastanut syöttämäni tiedot" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                        </Form.Group>

                        <Modal.Footer>
                            <Button variant="primary" type="submit">
                                Päivitä
                            </Button>
                            <Button onClick={props.onHide}>Sulje</Button>
                        </Modal.Footer>
                    </Form>
                </Container>
            </Modal.Body>
        </Modal>
    );
}
