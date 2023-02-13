'use strict'
// Tänne tulee palvelimen yhteyden luonti ja SQL-queryt, jotka exportataan server.js:ään.
// server:ssa suoritetaan tuodut queryt(funktiot) riippuen minkä url:in palvelin saa.

const mysql = require('mysql');
const argon2 = require('argon2');
const fs = require('fs');
const { response } = require('express');
const jwt = require('jsonwebtoken');

// Create connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'matkakertomus'
});

//awd
// SQL-queryt objekteina(funktioina).
module.exports =
{
    // Käyttäjän lisäys
    createUser: async function (req, res) {
        var nimimerkki = req.body.nimimerkki;
        var email = req.body.email;
        var password = req.body.password;
        console.log(nimimerkki, email, password)
        var sql = 'INSERT INTO matkaaja (nimimerkki, email, password) VALUES';

        if (nimimerkki == "" || email == "" || password == "") {
            console.log("Jokin vaadituista arvoista tyhjä.");
            res.sendStatus(400);
            return;
        } else {
            var unique_email;
            var checkemail_sql = "SELECT email FROM matkaaja WHERE email='" + email + "'";

            async function CheckEmail() {
                let fetch_response = connection.query(checkemail_sql, function (error, results, fields) {
                    if (error) {
                        console.log("Virhe haettaessa dataa!: " + error);
                        res.status(400).json({ status: error });
                    } else {
                        console.log("Ei SQL virhettä, haettu Data = " + JSON.stringify(results));
                        if (results.length > 0) {
                            console.log("Annetulla sähköpostilla (" + email + ") on jo käyttäjä.");
                            res.sendStatus(409);
                            unique_email = false;
                            return;
                        } else {
                            console.log("Syötetty sähköposti uniikki.");
                            unique_email = true;
                            if (fetch_response) {
                                if (unique_email) {
                                    async function CreateUser() {
                                        password = await argon2.hash(password, { type: argon2.argon2id }); // Argon2 hashing, laita päälle kun kirjautuminen valmis ja konffaa kirjautumiseen verify
                                        sql += " ('" + nimimerkki + "', '" + email + "', '" + password + "')";
                                        console.log(sql);
                                        connection.query(sql, function (error, results, fields) {
                                            if (error) {
                                                console.log("Virhe haettaessa dataa!: " + error);
                                                res.sendStatus(400);
                                                return;
                                            } else {
                                                console.log("Ei SQL virhettä, Data = " + JSON.stringify(results));
                                                res.sendStatus(201);
                                            }
                                        });
                                        console.log("Data = " + JSON.stringify(req.body));
                                    }
                                    CreateUser();
                                }
                            }
                        }
                    }
                });
            }
            CheckEmail();
        }
    },
    // Käyttäjän kirjautuminen
    loginUser: async function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var sql = "";
        var empty = false;
        var db_password = "";

        if (email == "" || password == "") {
            console.log("Jokin vaadituista arvoista tyhjä.");
            empty = true;
        } else {
            sql = "SELECT idmatkaaja, nimimerkki, password FROM matkaaja WHERE email='" + email + "'";
        }

        async function fetchUser() {
            let fetch_response = connection.query(sql, function (error, results, fields) {
                if (error) {
                    if (empty) {
                        console.log("Tyhjiä kenttiä!");
                        res.status(400).json({ message: "Tyhjiä kenttiä!" });
                    } else {
                        console.log("Virhe haettaessa dataa!: " + error);
                        res.status(400).json({ message: "Ei toimi" });
                    }
                    return;
                } else {
                    console.log("Ei SQL virhettä, Data = " + JSON.stringify(results));
                    if (fetch_response && results.length > 0) {
                        db_password = results[0].password;
                        console.log("Data = " + JSON.stringify(req.body));
                        async function Verify() {
                            const correct = await argon2.verify(db_password, password);
                            //db_password === password VAIHDETTU JOTTA PÄÄSEE KIRJAUTUMAAN!
                            //if (db_password === password) {
                            if (correct) {
                                let userID = results[0].idmatkaaja;
                                let userName = results[0].nimimerkki;
                                console.log("Salasanat täsmää");
                                // JWT https://www.youtube.com/watch?v=mbsmsi7l3r4&ab_channel=WebDevSimplified
                                // backend-kansiossa näkyvä .env-tiedosto sisältää secret-tokenit JWT:tä varten
                                const user = {
                                    id: userID,
                                    userName: userName
                                }
                                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                                res.json({ status: 200, userName: userName, accessToken: accessToken });
                            } else {
                                console.log("Salasanat ei täsmää...");
                                res.json({ status: 204, message: "Käyttäjä tai salasana väärin!" });
                                return false;
                            }
                        }
                        Verify();
                    } else {
                        console.log("Salasanaa ei löytynyt.");
                        res.json({ status: 204, message: "Tunnuksia ei annetuilla syötteillä löytynyt." });
                    }
                }
            });
        }
        fetchUser();
    },
    // Matkakohteiden GET
    getMatkakohteet: async function (req, res) {

        var sql = "SELECT * FROM matkakohde";

        async function fetchKohteet() {
            let fetchResponse = connection.query(sql, function (error, results, fields) {
                if (error) {
                    console.log("Virhe haettaessa dataa!: " + error);
                    res.sendStatus(400);
                    return;
                } else {
                    console.log("Ei SQL virhettä getissä");
                    if (fetchResponse) {
                        res.status(200).json(results);
                    }
                }
            });
        }
        fetchKohteet();
    },
    // Matkakohteen haku nimellä
    getMatkakohdeByName: async function (req, res) {

        let kohde = req.query.kohde || '';
        var sql = `SELECT * FROM matkakohde WHERE kohdenimi like '${kohde}%' OR maa like '${kohde}%' OR paikkakunta like '${kohde}%'`;

        if (req.query == '{}') {
            console.log("Ei parametreja!");
            res.sendStatus(400);
            return;
        } else {
            async function fetchKohteet() {
                let fetchResponse = connection.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log("Virhe haettaessa dataa!: " + error);
                        res.sendStatus(400);
                        return;
                    } else {
                        console.log("Ei SQL virhettä getissä");
                        if (fetchResponse) {
                            res.status(200).json(results);
                        }
                    }
                });
            }
            fetchKohteet();
        }
    },
    // Matkakohde POST
    postMatkakohde: async function (req, res) {
        const kohde = req.body.kohdenimi;
        const maa = req.body.maa;
        const paikkakunta = req.body.paikkakunta;
        const kuvaus = req.body.kuvausteksti;
        const kuva = req.body.kuva;

        var sql = 'INSERT INTO matkakohde (kohdenimi, maa, paikkakunta, kuvausteksti, kuva) VALUES';
        sql += " ('" + kohde + "', '" + maa + "', '" + paikkakunta + "', '" + kuvaus + "', '" + kuva + "')";

        var path = './public/images/' + kuva;
        console.log("Tarkistetaan löytyykö " + kuva + " jo palvelimelta...");
        fs.access(path, fs.F_OK, (error) => {
            if (error) {
                console.log("Kuvaa ei löytynyt jipii!")
                connection.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log("Virhe syötettäessä dataa!: " + error);
                        res.sendStatus(400);
                    } else {
                        // console.log("Ei SQL virhettä, Data = " + JSON.stringify(results));
                        res.sendStatus(200);
                    }
                });
                return;
            } else {
                res.sendStatus(409);
                console.log("Kuva löytyy jo palvelimelta...");
            }
        });
    },
    // Matkakohteen poisto
    deleteMatkakohde: async function (req, res) {
        const id = req.body.id;
        var check_sql = "SELECT idmatkakohde FROM tarina WHERE idmatkakohde='" + id + "'";
        var delete_sql = "DELETE FROM matkakohde WHERE idmatkakohde='" + id + "'";

        async function poistaKuva() {
            let sql = "SELECT kuva FROM matkakohde WHERE idmatkakohde='" + id + "'";
            let response = connection.query(sql, function (error, results, fields) {
                if (error) {
                    console.log("Virhe poistettaessa dataa!: " + error);
                    res.status(400).json({ "status": "Ei toimi" });
                    return false;
                } else {
                    if (response) {
                        var kuva = results[0].kuva;
                        var path = './public/images/' + kuva;
                        console.log("Poistetaan kuva " + kuva + "...");
                        try {
                            fs.unlinkSync(path);
                            console.log("Kuva: " + kuva + " poistettu");
                            return true;
                        } catch (error) {
                            console.log(error);
                            return false;
                        }
                    }
                }
            });
        }

        async function fetchKohteet() {
            let fetchResponse = connection.query(check_sql, function (error, results, fields) {
                if (error) {
                    console.log("Virhe haettaessa dataa!: " + error);
                    res.status(400).json({ "status": "Ei toimi" });
                    return false;
                } else {
                    // console.log("Ei SQL virhettä, Data = " + JSON.stringify(results));
                    if (fetchResponse) {
                        if (results && results.length > 0) {
                            console.log("Poisto ei mahdollinen koska löytyy tarinat taulusta");
                            res.sendStatus(409);
                            return false;
                        } else {
                            async function deletebyID() {
                                await poistaKuva();
                                let response = connection.query(delete_sql, function (error, results, fields) {
                                    if (error) {
                                        console.log("Virhe poistettaessa dataa!: " + error);
                                        res.status(400).json({ "status": "Ei toimi" });
                                        return;
                                    } else {
                                        if (response) {
                                            console.log("Kohde poistettu!")
                                            res.status(200);
                                            res.json({ "status": "Poistettu" });
                                        }
                                    }
                                });
                            }
                            deletebyID();
                        }
                    }
                }
            });
        }
        fetchKohteet();
    },
    // Matkakohteen päivitys
    updateMatkakohde: async function (req, res) {
        const id = req.body.idmatkakohde;
        const kohde = req.body.kohdenimi;
        const maa = req.body.maa;
        const paikkakunta = req.body.paikkakunta;
        const kuvaus = req.body.kuvausteksti;
        const kuva = req.body.kuva;
        const deleteimg = req.body.deleteimage_bool;
        const deleteimage_name = req.body.deleteimage;

        var sql = `UPDATE matkakohde
        SET kohdenimi = '${kohde}', maa = '${maa}', paikkakunta = '${paikkakunta}', kuvausteksti = '${kuvaus}', kuva = '${kuva}' 
        WHERE idmatkakohde = '${id}';`
        var check_sql = "SELECT idmatkakohde FROM tarina WHERE idmatkakohde='" + id + "'";

        async function poistaKuva() {
            try {
                var path = './public/images/' + deleteimage_name;
                console.log("Poistetaan kuva " + deleteimage_name + "...");
                fs.unlinkSync(path);
                console.log("Kuva: " + deleteimage_name + " poistettu");
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }

        let fetchResponse = connection.query(check_sql, function (error, results, fields) {
            if (error) {
                console.log("Virhe haettaessa dataa!: " + error);
                res.statusCode = 400;
                res.json({ "status": "Ei toimi" });
                return false;
            } else {
                // console.log("Ei SQL virhettä, Data = " + JSON.stringify(results));
                if (fetchResponse) {
                    if (results && results.length > 0) {
                        console.log("Muokkaus ei mahdollinen koska löytyy tarinat taulusta");
                        res.sendStatus(409);
                        return false;
                    } else {
                        connection.query(sql, function (error, results, fields) {
                            if (error) {
                                console.log("Virhe syötettäessä dataa!: " + error);
                                res.status(400).json({ "status": "Ei toimi" });
                            } else {
                                if (deleteimg) poistaKuva();
                                res.sendStatus(204);
                                console.log("Matkan päivitys onnistui");
                            }
                        });
                    }
                }
            }
        });

    },
    // Omat tiedot - hae käyttäjä
    getMatkaaja: async function (req, res) {
        var id = req.params.id
        var sql = "SELECT etunimi, sukunimi, nimimerkki, paikkakunta, esittely, kuva, email, password FROM matkaaja WHERE idmatkaaja = ?";

        console.log("Haetaan käyttäjää ID:llä " + id + " Query: " + sql);

        async function fetchKayttaja() {
            connection.query(sql, [id], function (error, results, fields) {
                if (error) {
                    console.log("Virhe haettaessa Käyttäjä ID:llä!: " + error);
                    res.sendStatus(400);
                    return;
                } else {
                    console.log("Ei SQL virhettä getissä");
                    res.status(200).json(results);
                }
            });
        }
        fetchKayttaja();
    },
    // Omat tiedot - käyttäjän päivitys
    updateMatkaaja: async function (req, res) {
        const id = req.body.idmatkaaja;
        const etunimi = req.body.etunimi;
        const sukunimi = req.body.sukunimi;
        const nimimerkki = req.body.nimimerkki;
        const paikkakunta = req.body.paikkakunta;
        const esittely = req.body.esittely;
        const kuva = req.body.kuva;
        const email = req.body.email;
        const password = await argon2.hash(req.body.password, { type: argon2.argon2id });
        const deleteimg = req.body.deleteimage_bool;
        const deleteimage_name = req.body.deleteimage;

        var sql = `UPDATE matkaaja
        SET etunimi = ?, sukunimi = ?, nimimerkki = ?, paikkakunta = ?, esittely = ?, kuva = ?, email = ?, password = ?
        WHERE idmatkaaja = ?;`

        async function poistaKuva() {
            try {
                var path = './public/images/' + deleteimage_name;
                console.log("Poistetaan kuva " + deleteimage_name + "...");
                fs.unlinkSync(path);
                console.log("Kuva: " + deleteimage_name + " poistettu");
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }

        if (deleteimg === true) {
            try {
                poistaKuva();
                connection.query(sql, [etunimi, sukunimi, nimimerkki, paikkakunta, esittely, kuva, email, password, id], function (error, results, fields) {
                    if (error) {
                        console.log("Virhe päivittäessä dataa!: " + error);
                        res.statusCode = 400;
                        res.json({ "status": "Ei toimi" });
                        return false;
                    } else {
                        res.sendStatus(204);
                        console.log("Matkaajan päivitys onnistui");
                    }
                });
            }
            catch (error) {
                console.log("Virhe haettaessa dataa!: ", error);
                res.statusCode = 400;
                res.json({ "status": "Ei toimi" });

            }
        }
        else {
            try {
                connection.query(sql, [etunimi, sukunimi, nimimerkki, paikkakunta, esittely, kuva, email, password, id], function (error, results, fields) {
                    if (error) {
                        console.log("Virhe haettaessa dataa!: " + error);
                        res.statusCode = 400;
                        res.json({ "status": "Ei toimi" });
                        return false;
                    } else {
                        res.sendStatus(204);
                        console.log("Matkaajan päivitys onnistui");
                    }
                });
            }
            catch (error) {
                console.log("Virhe haettaessa dataa!: ", error);
                res.statusCode = 400;
                res.json({ "status": "Ei toimi" });

            }
        }
    },
    // Jäsenten GET
    getJasenet: async function (req, res) {

        var sql = "SELECT etunimi, sukunimi, nimimerkki, paikkakunta, esittely, kuva FROM matkaaja";

        async function fetchKohteet() {
            let fetchResponse = connection.query(sql, function (error, results, fields) {
                if (error) {
                    console.log("Virhe haettaessa dataa!: " + error);
                    res.sendStatus(400);
                    return;
                }
                else {
                    console.log("Ei SQL virhettä getissä");
                    if (fetchResponse) {
                        res.status(200).json(results);
                    }
                }
            });
        }
        fetchKohteet();
    },
    // Jäsenten haku nimimerkillä, etu- tai sukunimellä tai paikkakunnalla
    getJasenByName: async function (req, res) {

        let kohde = req.query.kohde || '';
        var sql = `SELECT * FROM matkaaja WHERE etunimi like '%${kohde}%' OR sukunimi like '%${kohde}%' OR nimimerkki like '%${kohde}%' OR paikkakunta like '%${kohde}%'`;

        if (req.query == '{}') {
            console.log("Ei parametreja!");
            res.sendStatus(400);
            return;
        } else {
            async function fetchKohteet() {
                let fetchResponse = connection.query(sql, function (error, results, fields) {
                    if (error) {
                        console.log("Virhe haettaessa dataa!: " + error);
                        res.sendStatus(400);
                        return;
                    } else {
                        console.log("Ei SQL virhettä getissä");
                        if (fetchResponse) {
                            res.status(200).json(results);
                        }
                    }
                });
            }
            fetchKohteet();
        }
    },
    //Omatmatkat GET
    getOmatmatkat: async function (req, res) {
        //const id = req.body.idmatkaaja;
        //let testiID = req.query.testID
        var id = req.params.id;
        var sql = `SELECT * FROM matka WHERE idmatkaaja = ${id}`;
        //var sql = "SELECT * FROM matka";
        console.log("QUERY: " + sql);

        async function fetchOmatmatkat() {
            connection.query(sql, [id], function (error, results, fields) {
                if (error) {
                    console.log("Virhe haettaessa dataa!: " + error);
                    console.log("QUERY: " + sql);
                    res.sendStatus(400);
                    return;
                }
                else {
                    console.log("Ei SQL virhettä getissä");
                    res.status(200).json(results);
                }
                console.log(results)
            });
        }
        fetchOmatmatkat();
    },
    //Porukanmatkat GET
    getPorukanmatkat: async function (req, res) {

        var sql = "SELECT * FROM matka WHERE yksityinen = 0";
        async function fetchPorukanmatkat() {
            let fetchResponse = connection.query(sql, function (error, results, fields) {
                if (error) {
                    console.log("Virhe haettaessa dataa!: " + error);
                    res.sendStatus(400);
                    return;
                }
                else {
                    console.log("Ei SQL virhettä getissä");
                    if (fetchResponse) {
                        res.status(200).json(results);
                    }
                }
            });
        }
        fetchPorukanmatkat();
    },
    getTarina: async function (req, res) {

        var sql = "SELECT * FROM tarina";
        async function fetchTarina() {
            let fetchResponse = connection.query(sql, function (error, results, fields) {
                if (error) {
                    console.log("Virhe haettaessa dataa!: " + error);
                    res.sendStatus(400);
                    return;
                }
                else {
                    console.log("Ei SQL virhettä getissä");
                    if (fetchResponse) {
                        res.status(200).json(results);
                    }
                }
            });
        }
        fetchTarina();
    },
};