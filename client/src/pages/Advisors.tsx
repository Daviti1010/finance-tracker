import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getIncomingRequests, getOutgoingRequests, sendLinkRequest, revokeLink, acceptLinkRequest, getMyClients, getMyAdvisors } from "../api"
import type { AdvisorClientLink } from "../types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faUser } from '@fortawesome/free-solid-svg-icons'
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
                fetchAll();
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
                fetchAll();
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
        <div className="advisor-form">
            <form onSubmit={handleSubmit}>
                <p>Send a request</p>
                <div className="client-input-div">
                    <input value={inputValue} onChange={handleChange} type="text" name="clientEmail" id="client-email-input" />

                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>

        <div className="sent-requests-container">
            {isLoading ? <p>Loading...</p> : (
                <>
                <p id="sent-response-text">Sent — awaiting response ({outgoingRequests.length})</p>
                <div className="sent-requests-first-div">
                        {outgoingRequests.map((req) => (
                            <>
                            <div className="outgoing-reqs-div">
                                <p className="sent-requests" key={req.id}>Request to {req.clientEmail} — {req.status}</p>
                            
                                <div className="outgoing-reqs-div-right">
                                    <button>Cancel</button>
                                </div>

                            </div>
                            </>
                        ))}
                </div>
                </>
            )}
        </div>

        <div className="incoming-requests-container">
            <p id="pending-response-text">Pending — awaiting for your response ({incomingRequests.length})</p>
            <div className="sent-requests-first-div">
                {incomingRequests.map((req) => (
                    <div className="incoming-reqs-div" key={req.id}>
                        <p className="awaiting-response">Request from {req.advisorEmail} — {req.status}</p>

                        <div className="incoming-reqs-div-right">
                            <button id="accept-btn" onClick={() => handleAccept(req.id)}>Accept</button>
                            <button id="reject-btn" onClick={() => handleReject(req.id)}>Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="my-clients-div">
            <h3 id="my-clients">My clients ({acceptedClients.length})</h3>
            <div className="my-clients-first-div">
                {acceptedClients.map((link) => (
                    <div className="my-clients-second-div">
                        <span className="client" key={link.id}>
                            <FontAwesomeIcon icon={faUser} className="span-icon span-icon-user"/>
                            <p>{link.clientEmail}</p>

                        </span>

                        <div className="clients-div-right">
                            <Link to={`/clients/${link.clientId}/transactions`}>View transactions
                                <FontAwesomeIcon icon={faArrowRight} className="span-icon span-icon-arrow"/>
                            </Link>

                            <button className="revoke-btn" onClick={() => handleRevoke(link.id)}>Revoke</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="my-advisors-div">
            <h3 id="my-advisors">My Advisors ({acceptedAdvisors.length})</h3>
            <div className="my-advisors-first-div">
                {acceptedAdvisors.map((link) => (
                    <div className="my-advisors-second-div">
                        <span className="advisor" key={link.id}>
                            <FontAwesomeIcon icon={faUser} className="span-icon span-icon-user"/>
                            <p>{link.advisorEmail}</p>
                        </span>

                        <div className="clients-div-right">
                            <button className="revoke-btn" onClick={() => handleRevoke(link.id)}>Revoke</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </>
    )
}