import { useState, useEffect } from "react";
import { getIncomingRequests, getOutgoingRequests, sendLinkRequest, revokeLink, acceptLinkRequest } from "../api"
import type { AdvisorClientLink } from "../types";
import './Advisors.css'



export function AdvisorsPage() {

    const [inputValue, setInputValue] = useState('');
    const [outgoingRequests, setOutgoingRequests] = useState<AdvisorClientLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [incomingRequests, setIncomingRequests] = useState<AdvisorClientLink[]>([]);


    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        setInputValue(e.target.value);
        console.log(e.target.value)
    }

    const handleSubmit = async (e:  React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await sendLinkRequest(inputValue);
            const data = await response.json();

            if (data.success) {
                console.log("Success!")
                setInputValue('');
                fetchOutgoingRequests();
            } else {
                console.log("Error!")
            }

        } catch (err) {
            console.log(err)
        }

    };

    async function fetchOutgoingRequests() {
        try {
            const response = await getOutgoingRequests();
            const data = await response.json();

            if (data.success) {
                setOutgoingRequests(data.data);
            }
            
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchIncomingRequests() {
        try {
            const response = await getIncomingRequests();
            const data = await response.json();

            if (data.success) {
                setIncomingRequests(data.data);
            }
            
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchOutgoingRequests();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchIncomingRequests();
    }, []);

    async function handleAccept(linkId: number) {
        try {
            const response = await acceptLinkRequest(linkId);
            const data = await response.json();

            if (data.success) {
                fetchIncomingRequests()
            }

        } catch (err) {
            console.error(err)
        }
    }

    async function handleReject(linkId: number) {
        try {
            const response = await revokeLink(linkId);
            const data = await response.json();

            if (data.success) {
                fetchIncomingRequests();
            }

        } catch (err) {
            console.error(err);
        }
    }

    function fetchAll() {
        fetchOutgoingRequests();
        fetchIncomingRequests();
        // fetchIncomingRequests();
        // fetchOutgoingRequests(); 
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAll();
    });

    useEffect(() => {
        function handleFocus() {
            fetchAll();
        }

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    });

    return (
        <>
        <form onSubmit={handleSubmit}>
            <input value={inputValue} onChange={handleChange} type="text" name="clientEmail" id="client-email-input" />

            <button type="submit">Submit</button>
        </form>

        {isLoading ? <p>Loading...</p> : (
            <ul>
                {outgoingRequests.map((req) => (
                    <li className="requests" key={req.id}>Request to client id {req.clientId} — {req.status}</li>
                ))}
            </ul>
        )}

        <ul>
            {incomingRequests.map((req) => (
                <li className="incoming-request" key={req.id}>
                    Request from advisor id {req.advisorId} — {req.status}
                    <button onClick={() => handleAccept(req.id)}>Accept</button>
                    <button onClick={() => handleReject(req.id)}>Reject</button>
                </li>
            ))}
        </ul>
        </>
    )
}