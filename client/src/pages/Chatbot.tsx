import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown";
import { api } from "../api";
import './Chatbot.css'

interface Message {
    sender: string;
    text: string;
    key: string;
}



export function Chatbot() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [lastInteractionId, setLastInteractionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            sender: "user",
            text: inputValue,
            key: crypto.randomUUID(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await api.post("/api/chat", {
                message: userMessage.text,
                ...(lastInteractionId && { previous_interaction_id: lastInteractionId }),
            });

            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const data = await res.json();

            const modelMessage: Message = {
                sender: "model",
                text: data.response,
                key: crypto.randomUUID(),
            };

            setMessages((prev) => [...prev, modelMessage]);
            setLastInteractionId(data.responseId);

        } catch (error) {
            console.error("Chat error:", error);

            const errorMessage: Message = {
                sender: "model",
                text: "Something went wrong. Please try again in a few seconds.",
                key: crypto.randomUUID(),
            };

            setMessages((prev) => [...prev, errorMessage]);

        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const el = e.currentTarget;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
        <div className="corner-widget-div">
                {isOpen && (
                  <div className="chat-window">
                    <div className='chat-messages'>
                      {messages.map((msg) => {
                          if (msg.sender === "user") {
                              return (
                                  <div className='chat-message-user' key={msg.key}>
                                      <div className='chat-message-text'>
                                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                                      </div>
                                      <img src="user.png" alt="" />
                                  </div>
                              );
                          }
        
                          return (
                              <div className='chat-message-ai' key={msg.key}>
                                  <img src="gemini.png" alt="" />
                                  <div className='chat-message-text'>
                                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                                  </div>
                              </div>
                          );
                      })}
        
                      {isLoading && (
                              <div className='chat-message-ai'>
                              <img src="gemini.png" alt="" />
                              <div className='chat-message-text'>
                                  <div className="spinner" />
                              </div>
                              </div>
                          )}
        
                      <div ref={messagesEndRef} />
                    </div>
        
                    <div className='send-message-container'>
                      <div className='message-input'>
                        <textarea
                          placeholder="Type a message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onInput={handleInput}
                          onKeyDown={handleKeyDown}
                          rows={1}
                        />
        
                        <div>
                            <button type="submit" onClick={handleSendMessage}>Send</button>
                        </div>
        
                      </div>
                    </div>
                  </div>
                )}
        
        
                <div className="corner-widget">
                  <button onClick={() => setIsOpen((prev) => !prev)}>
                    <img src="gemini.png" alt="" />
                  </button>
                </div>
              </div>
        </>
    )
}