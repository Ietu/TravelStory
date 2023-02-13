import React, { useEffect, useState } from "react";
import {
  Container,
  Modal,
  Button,
  Form,
  Card,
  Spinner,
  InputGroup,
  FormControl,
  CloseButton,
} from "react-bootstrap";
import { Buffer } from 'buffer';
//import BootStrapTable from "react-bootstrap-table-next";
//import paginationFactory from "react-bootstrap-table2-paginator";
import axios from "axios";
import "../styles/Omatmatkat.css";

export default function OmatMatkat(props) {

  const [matkat, setMatkat] = useState([]);
  const [nimimerkki, setNimimerkki] = useState("")
  const [omatmatkat, setOmatmatkat] = useState([]);
  const [tarina, setTarina] = useState([]);
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
  const [yksityinen, setYksityinen] = useState(0);
  const [julkinen, setJulkinen] = useState(1);

  const [token, setToken] = useState(sessionStorage.userToken)
  const [id, setId] = useState()

  const handleRefresh = () => setRefresh(true);

  useEffect(() => {
    const parseJwt = async () => {
      var base64Payload = token.split('.')[1];
      var payload = Buffer.from(base64Payload, 'base64');
      var result = JSON.parse(payload.toString());
      console.log(result.id);
      setId(result.id);
    }
    parseJwt();
  }, []);
  //awd
  useEffect(() => {
    const fetchOmatmatkat = async () => {
      try {
        const response = await fetch(`http://localhost:3000/omatmatkat/${id}`, {
          method: "GET",
          /*headers: {
            Authorization: "Bearer " + sessionStorage.getItem("userToken"),
          },*/
        });
        const data = await response.json();
        console.log("QUERY ON: ", response)
        try {
          if (!data) {
            setErrorEmpty(
              "Matkoja ei löytynyt... tallenna sovelluksen ensimmäinen matkakohde!"
            );
            props.setErrorMsg("Matkoja ei löytynyt.");
            props.setShowError(true);
            setLoading(false);
            return;
          }
          if (response) {
            if (response.status == 400) {
              setErrorNormal(
                "Virhe haettaessa matkoja... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään."
              );
              props.setErrorMsg("Virhe haettaessa matkoja.");
              props.setShowError(true);
              setFetchError(true);
              return;
            }
            setOmatmatkat(data);
            setFetchError(false);
            console.log(omatmatkat)
          }
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        setErrorNormal(
          "Virhe haettaessa matkoja... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään."
        );
        props.setErrorMsg("Virhe haettaessa matkoja." + "<br />" + error);
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
    };
    if (id !== undefined) {
      fetchOmatmatkat();
    }
  }, [refresh, id]);

  useEffect(() => {
    const fetchKayttaja = async () => {
      try {
        const response = await fetch(`http://localhost:3000/matkaaja/haeMatkaaja/${id}`, {
          method: "GET"
        });
        const data = await response.json();
        try {
          if (!data || data.length === 0) {
            return;
          }
          if (response) {
            if (response.status === 400) {
              return;
            }
            setNimimerkki(data[0].nimimerkki)
            console.log("Haettu käyttäjää")
          }
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
      }
      setRefresh(false)
    }
    fetchKayttaja();
  }, [refresh, id]);

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

    }
    fetchMatkat();
  }, [refresh])

  useEffect(() => {
    const fetchTarina = async () => {
      try {
        const response = await fetch("http://localhost:3000/tarina", {
          method: "GET",
          headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
          }
        });
        const data = await response.json();
        try {
          if (!data) {
            setErrorEmpty("Tarinoita ei löytynyt... tallenna sovelluksen ensimmäinen matkakohde!");
            props.setErrorMsg("Tarinoita ei löytynyt.");
            props.setShowError(true);
            setLoading(false);
            return;
          }
          if (response) {
            if (response.status == 400) {
              setErrorNormal("Virhe haettaessa tarinoita... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
              props.setErrorMsg("Virhe haettaessa tarinoita.");
              props.setShowError(true);
              setFetchError(true);
              return;
            }
            setTarina(data);
            setFetchError(false);
          }
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        setErrorNormal("Virhe haettaessa tarinoita... Yritä myöhemmin uudestaan tai ota yhteyttä järjestelmän ylläpitäjään.");
        props.setErrorMsg("Virhe haettaessa tarinoita." + "<br />" + error);
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
    fetchTarina();
  }, [refresh])

  function MatkakohdeAddModal(props) {

    const [kohde, setKohde] = useState("");
    const [maa, setMaa] = useState("");
    const [paikkakunta, setPaikkakunta] = useState("");
    const [kuvaus, setKuvaus] = useState("");
    const [picture, setPicture] = useState("");
    const [checked, setChecked] = useState(false);
    const [checkYksityinen, setCheckYksityinen] = useState(false);

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
          <Modal.Title id="contained-modal-title-vcenter">Lisää matka</Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <Container>
            <Form onSubmit={(e) => addMatka(e)}>
              <Form.Group className="mb-3" controlId="formKohde">
                <Form.Label>Tarina:</Form.Label>
                <Form.Control value={kohde} type="text" onChange={(e) => setKohde(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formMaa">
                <Form.Label>Päivämäärä:</Form.Label>
                <Form.Control value={maa} type="text" onChange={(e) => setMaa(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPaikkakunta">
                <Form.Label>Matkakohde:</Form.Label>
                <Form.Control value={paikkakunta} type="text" onChange={(e) => setPaikkakunta(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formYksityinen">
                <Form.Label>Jos et valitse yksityinen, on matka julkinen.</Form.Label>
                <Form.Check type="checkbox" label="Yksityinen" checkYksityinen={checkYksityinen} onChange={(e) => setYksityinen(e.target.checkYksityinen)} />
              </Form.Group>

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

  const HandleDivClick = (index) => {
    setClickedDiv(index);
    setShowModal(true);
  };

  const HandleEmptyBtnClick = () => {
    setSearchWord("");
    setLoadingMatkat(true);
    setRefresh(true);
  };

  const data = omatmatkat.map((item, index) => {
    try {
      console.log("TARINAT: ", tarina);
      console.log("MATKAT: ", matkat);
      console.log("OMATMATKAT: ", omatmatkat);
      console.log("CURRENT ID: ", id);
      return (
        <div
          key={index}
          id="matkakohde-div"
          onClick={() => HandleDivClick(index)}
        >
          <img src={"http://localhost:3000/images/" + item.kuva} alt="..." />
          <h4 className="otsikko">
            {item.kohdenimi},<p className="ala-otsikko">{item.maa}</p>
          </h4>
        </div>
      );
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "90vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
    );
  } else {
    if (!fetchError) {
      return (
        <div>
          <div id="introduction-div">
            <h1>Omat matkasi</h1>
          </div>
          <div id="sticky-div">
            <Button id="add-btn" onClick={() => setShowAddModal(true)}>Lisää matka</Button>
          </div>
          {loadingMatkat ? (
            <div
              style={{
                display: "flex",
                marginTop: "10%",
                justifyContent: "center",
              }}
            >
              <Spinner
                animation="border"
                variant="primary"
                style={{ position: "fixed", width: "100px", height: "100px" }}
              />
            </div>
          ) : (
            <Container id="matkakohde-container" className="mt-1">
              {errorEmpty != "" && (
                <h2 className="error-headers">{errorEmpty}</h2>
              )}
              {omatmatkat.length > 0 ? data : null}
            </Container>
          )}
          {clickedDiv != null ? (
            <>
              <MatkakohdeModal
                show={showModal}
                refreshPage={handleRefresh}
                onHide={() => setShowModal(false)}
                showUpdateModal={() => setShowUpdateModal(true)}
                matka={omatmatkat[clickedDiv]}
                tarina={tarina[clickedDiv]}
                matkakohde={matkat[clickedDiv]}
                matkailija={nimimerkki[clickedDiv]}
                style={{ marginTop: "70px", height: "90vh" }}
                centered
              />
            </>
          ) : null
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
          {errorNormal != "" && (
            <h2 className="error-headers">{errorNormal}</h2>
          )}
        </div>
      );
    }
  }
}

function MatkakohdeModal(props) {
  var matka = props.matka;
  var tarina = props.tarina;
  var matkakohde = props.matkakohde;

  const updateBtnClicked = () => {
    props.onHide();
    props.showUpdateModal();
  };

  const hideModal = () => {
    props.onHide();
  };
  //<h5>Matkan päivämäärä: {tarina.pvm}</h5>
  if (matka == null || tarina == null || matkakohde == null) {
    return null;
  } else {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Card className="text-center matkakohde-card">
          <Card.Img
            variant="top"
            src={"http://localhost:3000/images/" + matka.kuva}
          />
          <Card.Body>
            <Card.Title><h2>Matkan kohde: {matkakohde.kohdenimi}, {matkakohde.paikkakunta}, {matkakohde.maa}</h2></Card.Title>
            <Card.Text>

              <h5>Matkan tarina: {tarina.teksti}</h5>

            </Card.Text>
            <h5>Matkan alkamispäivä: {matka.alkupvm}</h5>
            <h5>Matkan loppumispäivä: {matka.loppupvm}</h5>

          </Card.Body>
        </Card>
        <Modal.Footer>
          <Button onClick={hideModal}>Sulje</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}