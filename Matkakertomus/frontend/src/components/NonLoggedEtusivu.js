import "../styles/NonLoggedViews.css";

// Etusivun sisältö.
export default function NonLoggedEtusivu() {
    return (
        <div id="container">
            <div className="outer">
                <ul className="ml-auto sm-icons">
                    <li style={{ float: "left" }}><a className="p-3" href="#" style={{ color: "#fffafa" }}><i
                        className="bi bi-facebook"></i></a>
                    </li>
                    <li style={{ float: "left" }}><a className="p-3" href="#" style={{ color: "#fffafa" }}><i
                        className="bi bi-instagram"></i></a>
                    </li>
                    <li style={{ float: "left" }}><a className="p-3" href="#" style={{ color: "#fffafa" }}><i
                        className="bi bi-whatsapp"></i></a>
                    </li>
                </ul>
                <div className="contents">
                    <div className="p-3">
                        <h1><span className="line">Matka</span><span className="line">kertomus</span></h1>
                    </div>
                    <div className="p-3" style={{ fontFamily: 'Roboto, sans-serif; font-size: 18px' }}>
                        <p>Tervetuloa käyttämään Matkakertomus-sovellusta!<br />Sovellus on tarkoitettu jokaiselle
                            reissaajalle, kirjaudu sisään kertoaksesi matkoistasi ja liity joukkoomme!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}