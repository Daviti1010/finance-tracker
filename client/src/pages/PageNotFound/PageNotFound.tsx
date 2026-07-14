import { useFavicon } from "../../hooks/useFavicon";
import './PageNotFound.css'

export function PageNotFound() {
    useFavicon("/error-img.png");
    
    return (
        <>
            <title>404 Error</title>

            <div className="page-not-found-message">Page Not Found!</div>
        </>
    )
}