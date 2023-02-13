import { Alert } from 'react-bootstrap';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

// Virhe-komponentti. Parseaa HTML-elementit.
export const AlertError = (props) => {
    
    var ogErrorMsg = props.errorMsg;
    var cleanedMsg = DOMPurify.sanitize(ogErrorMsg,
        { USE_PROFILES: { html: true } });
    var finalMsg = parse(cleanedMsg);

    return (
        <Alert id='error-alert' variant={"danger"} >
            <Alert.Heading>Virhe!</Alert.Heading>
            <p>{finalMsg}</p>
        </Alert>
    )
}
