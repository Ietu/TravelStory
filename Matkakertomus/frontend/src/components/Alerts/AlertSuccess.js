import { Alert } from 'react-bootstrap';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

// Success-komponentti. Parseaa HTML-elementit.
export const AlertSuccess = (props) => {

    var ogSuccessMsg = props.successMsg;
    var cleanedMsg = DOMPurify.sanitize(ogSuccessMsg,
        { USE_PROFILES: { html: true } });
    var finalMsg = parse(cleanedMsg);

    return (
        <Alert id='error-alert' variant={"success"} >
            <Alert.Heading>Onnistui!</Alert.Heading>
            <p>{finalMsg}</p>
        </Alert>
    )
}