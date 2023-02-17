const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
var app = express();

app.use(cors());
app.use(express.json());

// Otetaan käyttöön body-parser, jotta voidaan html-requestista käsitellä viestin body post requestia varten... *
var bodyParser = require('body-parser');

var controller = require('./controller');

const hostname = 'localhost';
const port = 3000;

// CORS middleware
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Controll-Allow-Origin', '*');

    res.header('Access-Controll-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Controll-Allow-Headers', 'Content-Type');
    next();
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})
const upload = multer({ storage: storage })

// Otetaan käyttöön CORS säännöt:
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //* ...jsonina

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

app.use(express.static('public'));

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })
};


app.route('/User/signin')
    .post(controller.createUser);

app.route('/User/login')
    .post(controller.loginUser);

app.route('/matkakohteet')
    .get(/*authenticateToken, */controller.getMatkakohteet);

app.route('/matkakohteet/getMatka')
    .get(authenticateToken, controller.getMatkakohdeByName);

app.route('/matkakohteet/addMatka')
    .post(authenticateToken, controller.postMatkakohde);

app.route('/matkakohteet/deleteMatka')
    .post(authenticateToken, controller.deleteMatkakohde);

app.route('/matkakohteet/updateMatka')
    .put(authenticateToken, controller.updateMatkakohde);



app.route('/matkaaja/haeMatkaaja/:id')
    .get(controller.getMatkaaja);

app.route('/matkaaja/updateMatkaaja')
    .put(controller.updateMatkaaja);



app.route('/jasenet')
    .get(authenticateToken, controller.getJasenet);


app.route('/jasenet/getJasen')
    .get(authenticateToken, controller.getJasenByName);


app.route('/omatmatkat/:id')
    .get(/*authenticateToken,*/ controller.getOmatmatkat/*, controller.getTarina*/);

app.route('/porukanmatkat')
    .get(/*authenticateToken,*/ controller.getPorukanmatkat);


app.route('/tarina')
    .get(/*authenticateToken,*/ controller.getTarina);

// Image upload: Tallentaa Backendin public/images
app.post('/uploadImage', upload.single('file'), function (req, res) {
    res.json({})
})
