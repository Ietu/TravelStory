import '../styles/Jasenet.css'
import { useEffect, useState } from 'react';
import { Container, Modal, Button, Card, Spinner, InputGroup, FormControl, CloseButton } from 'react-bootstrap';

export default function Jasenet(props) {

    const [jasenet, setJasenet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingJasenet, setLoadingJasenet] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorEmpty, setErrorEmpty] = useState("");
    const [errorNormal, setErrorNormal] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [clickedDiv, setClickedDiv] = useState(null);
    const [sortClicked, setSortClicked] = useState(false);
    const [searchWord, setSearchWord] = useState("");
    const [searchClicked, setSearchClicked] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const handleRefresh = () => setRefresh(true);

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

    useEffect(() => {
        const fetchJasenet = async () => {
            try {
                const response = await fetch("http://localhost:3000/jasenet", {
                    method: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
                    }
                });
                const data = await response.json();
                try {
                    if (!data) {
                        setErrorEmpty("Jäseniä ei löytynyt... Ota yhteyttä ylläpitoon.");
                        props.setErrorMsg("Jäseniä ei löytynyt.");
                        props.setShowError(true);
                        setLoading(false);
                        return;
                    }
                    if (response) {
                        if (response.status === 400) {
                            setErrorNormal("Virhe haettaessa jäseniä. Yritä myöhemmin uudelleen tai ota yhteyttä järjestelmän ylläpitäjään.");
                            props.setErrorMsg("Virhe haettaessa jäseniä.");
                            props.setShowError(true);
                            setFetchError(true);
                            return;
                        }
                        setJasenet(data);
                        setFetchError(false);
                    }
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                setErrorNormal("Virhe haettaessa jäseniä. Yritä myöhemmin uudelleen tai ota yhteyttä järjestelmän ylläpitäjään.");
                props.setErrorMsg("Virhe haettaessa jäseniä." + "<br />" + error);
                props.setShowError(true);
                setFetchError(true);
            }
            setLoading(false);
            setLoadingJasenet(false);
            setRefresh(false);
            setSearchWord("");
            setShowModal(false);
            setClickedDiv(null);
        }
        fetchJasenet();
    }, [refresh])

    useEffect(() => {
        const fetchJasenetByName = async () => {
            try {
                setLoadingJasenet(true);
                const response = await fetch("http://localhost:3000/jasenet/getJasen?kohde=" + searchWord, {
                    method: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
                    }
                });
                const data = await response.json();
                try {
                    if (data.length == 0 || !data) {
                        props.setErrorMsg("Jäseniä annetulla hakusanalla ei löytynyt.");
                        props.setShowError(true);
                    }
                    if (response) {
                        if (response.status == 400) {
                            setErrorNormal("Virhe haettaessa jäseniä... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
                            props.setErrorMsg("Virhe haettaessa jäseniä.");
                            props.setShowError(true);
                            setFetchError(true);
                            return;
                        }
                        setJasenet(data);
                        setFetchError(false);
                    }
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                setErrorNormal("Virhe haettaessa jäseniä... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
                props.setErrorMsg("Virhe haettaessa jäseniä hakuehdoilla." + "<br />" + error);
                props.setShowError(true);
                setFetchError(true);
            }
            setRefresh(false);
            setShowModal(false);
            setClickedDiv(null);
            setLoadingJasenet(false);
        }
        if (searchClicked && searchWord != "") {
            fetchJasenetByName();
        }
        setSearchClicked(false);
    }, [searchClicked])

    const HandleDivClick = (index) => {
        setClickedDiv(index);
        setShowModal(true);
    }

    const HandleSortClick = () => {
        if (sortClicked) {
            function SortJasenet(a, b) {
                return b.nimimerkki.localeCompare(a.nimimerkki);
            }
            if (jasenet.length > 0) {
                var sortedBackwards = jasenet.sort(SortJasenet);
                setJasenet(sortedBackwards);
            }
            setSortClicked(false);
        } else {
            function SortJasenet(a, b) {
                return a.nimimerkki.localeCompare(b.nimimerkki);
            }
            if (jasenet.length > 0) {
                var sorted = jasenet.sort(SortJasenet);
                setJasenet(sorted);
            }
            setSortClicked(true);
        }
    }

    const HandleEmptyBtnClick = () => {
        setSearchWord("");
        setLoadingJasenet(true);
        setRefresh(true);
    }

    /*
        Lataa vakiokuvan jos käyttäjä ei ole lisännyt omaa kuvaa.
        Kaksi ongelmaa tässä:
        1) Pitäisi laittaa kuva jota ei tartte ladata mistään ulkopuolelta
        2) Jos tuo linkki ei toimi, niin jää ikuiseen luuppiin ladatessa
    */
    const handleOnError = (e) => {
        e.target.src = "https://images.almatalent.fi/cx0,cy1,cw1140,ch855,650x/https://assets.almatalent.fi/image/1887dfab-fdfd-3291-89a7-ad3ffa65304e";
    }

    const data = jasenet.map((item, index) => {
        try {
            return (
                <div key={index} id='jasen-div' onClick={() => HandleDivClick(index)}>
                    <img src={"http://localhost:3000/images/" + item.kuva} onError={handleOnError} alt="..." />
                    <h2 className='jasen-otsikko'>{item.nimimerkki}</h2>
                    <hr style={{ marginLeft: "20px", marginRight: "20px", border: "1px solid", borderRadius: "5px" }} />
                    <div id='jasen-info'>
                        {
                            !item.etunimi && !item.sukunimi && !item.paikkakunta ? <h6>Käyttäjä ei ole vielä lisännyt tietojaan</h6> : null
                        }
                        <h6>{item.etunimi || item.sukunimi ? <span style={{ fontWeight: "bold" }}>Nimi: </span> : null} {item.etunimi} {item.sukunimi}</h6>
                        <h6>{item.paikkakunta ? <span style={{ fontWeight: "bold" }}>Paikkakunta: </span> : null} {item.paikkakunta}</h6>
                    </div>
                </div>
            )
        } catch (error) {
            console.log(error);
            return (error);
        }
    })

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
                        <h1>Jäsenet</h1>
                        <h2>Jäsensivulla voit selata yhdistyksen rekisteröityneitä jäseniä.</h2>
                        <h2>Muistathan, että tietoja ei saa luovuttaa yhdistyksen toiminnan ulkopuolisille.</h2>
                    </div>
                    <div id="jasen-sticky-div">
                        <InputGroup id="jasen-inputgroup">
                            <FormControl placeholder='Hae jäseniä...' aria-label='Hae jäseniä...' value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
                            {
                                searchWord ? <CloseButton onClick={HandleEmptyBtnClick}
                                    style={{ alignSelf: "center", position: "absolute", zIndex: 1000, right: "60px" }} /> : null
                            }
                            <Button variant='secondary' onClick={() => setSearchClicked(true)}>Hae</Button>
                        </InputGroup>
                        <div id='sort-div-clickable' onClick={HandleSortClick}>
                            A<br />Ö<div style={!sortClicked ? triangleStyle.sorted : triangleStyle.unSorted}></div>
                        </div>
                    </div>
                    {
                        loadingJasenet ?
                            <div style={{ display: 'flex', marginTop: "10%", justifyContent: 'center' }}>
                                <Spinner animation='border' variant='primary' style={{ position: "fixed", width: '100px', height: '100px' }} />
                            </div>
                            :
                            <Container id='jasen-container' className='mt-1'>
                                {
                                    errorEmpty != "" &&
                                    <h2 className='error-headers'>{errorEmpty}</h2>
                                }
                                {
                                    jasenet.length > 0 ? data : null
                                }
                            </Container>
                    }
                    {
                        clickedDiv != null &&
                        <>
                            <JasenModal
                                show={showModal}
                                refreshPage={handleRefresh}
                                onHide={() => setShowModal(false)}
                                jasen={jasenet[clickedDiv]}
                                setShowError={props.setShowError}
                                setErrorMsg={props.setErrorMsg}
                                setShowSuccess={props.setShowSuccess}
                                setSuccessMsg={props.setSuccessMsg} style={{ marginTop: "70px", height: "90vh" }} centered />
                        </>
                    }
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

function JasenModal(props) {

    var jasen = props.jasen;

    const hideModal = () => {
        props.onHide();
    }

    // HUOM! Lataa vakiokuvan jos käyttäjällä ei omaa kuvaa. Poista jos huono.
    const handleOnError = (e) => {
        e.target.src = "https://images.almatalent.fi/cx0,cy1,cw1140,ch855,650x/https://assets.almatalent.fi/image/1887dfab-fdfd-3291-89a7-ad3ffa65304e";
    }

    if (jasen == null) {
        return null;
    } else {
        return (
            <Modal {...props} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
                <Card className="text-center" centered>
                    <Card.Img variant="top" src={"http://localhost:3000/images/" + jasen.kuva} onError={handleOnError} alt="..." />
                    <Card.Body>
                        <Card.Title><h2>{jasen.nimimerkki}</h2></Card.Title>
                        <hr style={{ border: "1px solid", borderRadius: "2px" }} />
                        <Card.Text>
                            {
                                !jasen.etunimi && !jasen.sukunimi && !jasen.paikkakunta && !jasen.esittely ? <h5>Käyttäjä ei ole vielä lisännyt tietojaan</h5> :
                                    <>
                                        <h5>{jasen.etunimi || jasen.sukunimi ? <span style={{ fontWeight: "bold" }}>Nimi: </span> : null} {jasen.etunimi} {jasen.sukunimi}</h5>
                                        <h5>{jasen.paikkakunta ? <span style={{ fontWeight: "bold" }}>Paikkakunta: </span> : null} {jasen.paikkakunta}</h5>
                                        {jasen.etunimi && jasen.sukunimi && jasen.paikkakunta ?
                                            <hr style={{ border: "1px solid", borderRadius: "2px" }} />
                                            : null
                                        }
                                        <h5>{jasen.esittely && <span style={{ fontWeight: "bold" }}>Esittely: </span>} {jasen.esittely}</h5>
                                    </>
                            }
                        </Card.Text>
                    </Card.Body>
                </Card>
                {
                    /* 
                    <Modal.Footer>
                        <Button onClick={hideModal}>Sulje</Button>
                    </Modal.Footer> 
                    */
                }
            </Modal>
        );
    }
}