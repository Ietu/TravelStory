import '../styles/Matkakohteet.css';
import { useState, useEffect } from 'react';
import { Container, Modal, Card, Spinner } from 'react-bootstrap';

export default function NonLoggedMatkakohteet(props) {

    const [matkat, setMatkat] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [clickedDiv, setClickedDiv] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorEmpty, setErrorEmpty] = useState("");
    const [errorNormal, setErrorNormal] = useState("");

    // Haetaan matkakohteet
    useEffect(() => {
        const fetchMatkat = async () => {
            try {
                const response = await fetch("http://localhost:3000/matkakohteet", {
                    method: "GET"
                });
                const data = await response.json();
                try {
                    if (!data) {
                        setErrorEmpty("Matkakohteita ei löytynyt... tallenna sovelluksen ensimmäinen matkakohde!");
                        props.setErrorMsg("Matkakohteita ei löytynyt.");
                        props.setShowError(true);
                        return;
                    }
                    if (response) {
                        if (response.status == 400) {
                            setErrorNormal("Virhe haettaessa matkakohteita... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
                            props.setErrorMsg("Virhe haettaessa matkakohteita.");
                            props.setShowError(true);
                            return;
                        }
                        setMatkat(data);
                    }
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                setErrorNormal("Virhe haettaessa matkakohteita... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
                props.setErrorMsg("Virhe haettaessa matkakohteita." + "<br />" + error);
                props.setShowError(true);
            }
            setLoading(false);
        }
        fetchMatkat();
    }, [])

    const HandleDivClick = (index) => {
        setClickedDiv(index);
        setShowModal(true);
    }

    // Luodaan matkakohde divit
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

    return (
        <div id="container">
            <div className="outer">
                <div>
                    {
                        loading &&
                        <div style={{ display: 'flex', height: '90vh', justifyContent: 'center', alignItems: 'center' }}>
                            <Spinner animation='border' variant='primary' style={{ width: '100px', height: '100px' }} />
                        </div>
                    }
                    <Container id='matkakohde-container'>
                        {
                            errorEmpty != "" &&
                            <h2 className='error-headers'>{errorEmpty}</h2>
                        }
                        {
                            errorNormal != "" &&
                            <h2 className='error-headers'>{errorNormal}</h2>
                        }
                        {
                            matkat.length > 0 ? data : null
                        }
                    </Container>
                    {
                        clickedDiv != null ?
                            <MatkakohdeModal show={showModal} onHide={() => setShowModal(false)} matka={matkat[clickedDiv]} />
                            : null
                    }
                </div>
            </div>
        </div>
    )
}

// Matkakohde-modalissa esitetään tiedot matkakohteesta.
function MatkakohdeModal(props) {

    var matka = props.matka;

    const hideModal = () => {
        props.onHide();
    }

    if (matka == null) {
        return null;
    } else {
        return (
            <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                <Card className="text-center">
                    <Card.Img variant="top" src={"http://localhost:3000/images/" + matka.kuva} />
                    <Card.Body>
                        <Card.Title><h2>{matka.kohdenimi}{matka.paikkakunta ? ", " + matka.paikkakunta : null}</h2></Card.Title>
                        <Card.Text>{matka.kuvausteksti}</Card.Text>
                    </Card.Body>
                </Card>
            </Modal>
        );
    }
}