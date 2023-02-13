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
import axios from "axios";
import "../styles/Porukanmatkat.css";

export default function PorukanMatkat(props) {
  const [matkat, setMatkat] = useState([]);
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

  const [token, setToken] = useState(sessionStorage.userToken);
  const [id, setId] = useState();

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

  useEffect(() => {
    const fetchPorukanmatkat = async () => {
      try {
        const response = await fetch("http://localhost:3000/porukanmatkat", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("userToken"),
          },
        });
        const data = await response.json();
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
    fetchPorukanmatkat();
  }, [refresh]);

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
            <h1>Kaikki julkiset matkat</h1>
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
                style={{ marginTop: "70px", height: "90vh" }}
                centered
              />
            </>
          ) : null}
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