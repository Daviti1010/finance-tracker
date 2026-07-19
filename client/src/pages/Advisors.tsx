import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getIncomingRequests, getOutgoingRequests, sendLinkRequest, revokeLink, acceptLinkRequest, getMyClients, getMyAdvisors } from "../api"
import type { AdvisorClientLink } from "../types";
import './Advisors.css'



export function AdvisorsPage() {

    const [inputValue, setInputValue] = useState('');
    const [outgoingRequests, setOutgoingRequests] = useState<AdvisorClientLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [incomingRequests, setIncomingRequests] = useState<AdvisorClientLink[]>([]);

    const [acceptedClients, setAcceptedClients] = useState<AdvisorClientLink[]>([]);
    const [acceptedAdvisors, setAcceptedAdvisors] = useState<AdvisorClientLink[]>([]);
    


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

    const fetchOutgoingRequests = useCallback(async () => {
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
    }, [])

    const fetchIncomingRequests = useCallback(async () => {
        try {
            const response = await getIncomingRequests();
            const data = await response.json();
            if (data.success) {
                setIncomingRequests(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);


    useEffect(() => {
        fetchOutgoingRequests();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchIncomingRequests();
    }, [fetchOutgoingRequests, fetchIncomingRequests]);


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

    const fetchMyClients = useCallback(async () => {
        try {
            const response = await getMyClients();
            const data = await response.json();

            if (data.success) {
                setAcceptedClients(data.data);
            }

        } catch (err) {
            console.error(err)
        }
    }, [])


    const fetchMyAdvisors = useCallback(async () => {
        try {
            const response = await getMyAdvisors();
            const data = await response.json();

            if (data.success) {
                setAcceptedAdvisors(data.data);
            }

        } catch (err) {
            console.error(err)
        }
    }, [])


    async function handleRevoke(linkId: number) {
        try {
            const response = await revokeLink(linkId);
            const data = await response.json();

            if (data.success) {
                fetchAll();
            }

        } catch (err) {
            console.error(err);
        }
    }

    const fetchAll = useCallback(() => {
        fetchOutgoingRequests();
        fetchIncomingRequests();
        fetchMyClients();
        fetchMyAdvisors();
    }, [fetchOutgoingRequests, fetchIncomingRequests, fetchMyClients, fetchMyAdvisors]);

    
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        function handleFocus() {
            fetchAll();
        }

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchAll]);

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

        <h3 id="my-clients">My clients</h3>
            <ul>
                {acceptedClients.map((link) => (
                    <li className="client" key={link.id}>
                        <Link to={`/clients/${link.clientId}/transactions`}>Client Id: {link.clientId}</Link>
                        <button className="revoke-btn" onClick={() => handleRevoke(link.id)}>Revoke</button>
                    </li>
                ))}

            </ul>

        <h3 id="my-advisors">My Advisors</h3>
        <ul>
            {acceptedAdvisors.map((link) => (
                <li className="advisor" key={link.id}>
                    Client Id: {link.clientId}
                    <button className="revoke-btn" onClick={() => handleRevoke(link.id)}>Revoke</button>
                </li>
            ))}
        </ul>
        </>
    )
}