import { useState, useEffect, useRef } from "react";
import api from "../api/client";

export default function Chatbot({ filename, docStatus }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);

  // Fetch document suggestions dynamically when completed
  useEffect(() => {
    if (!filename) {
      setSuggestedPrompts([]);
      return;
    }

    if (docStatus !== "completed") {
      setSuggestedPrompts([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await api.post("/documents/suggestions", { filename });
        if (res.data && res.data.suggestions) {
          setSuggestedPrompts(res.data.suggestions);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
        setSuggestedPrompts([
          "What is the summary of this document?",
          "What is the main topic of this file?",
          "Can you list the key points here?",
          "Explain this document in simple terms"
        ]);
      }
    };

    fetchSuggestions();
  }, [filename, docStatus]);

  // Auto scroll to bottom when messages list changes
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Load chat history from SQLite when switching documents/loading
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get("/chats", {
          params: { filename: filename || "" }
        });
        if (res.data && res.data.history) {
          setMessages(res.data.history);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChatHistory();
  }, [filename]);

  const clearChat = async () => {
    try {
      await api.delete("/chats", {
        params: { filename: filename || "" }
      });
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat history", err);
    }
  };

  const parseInlineMarkdown = (text) => {
    if (!text) return "";
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");
    return html;
  };

  const formatMessageText = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    
    let inList = false;
    const elements = [];
    let listItems = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith("### ")) {
        if (inList) {
          elements.push(<ul key={`list-${index}`}>{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h3 key={index}>{trimmed.substring(4)}</h3>);
      } else if (trimmed.startsWith("## ")) {
        if (inList) {
          elements.push(<ul key={`list-${index}`}>{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h2 key={index}>{trimmed.substring(3)}</h2>);
      } else if (trimmed.startsWith("# ")) {
        if (inList) {
          elements.push(<ul key={`list-${index}`}>{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h1 key={index}>{trimmed.substring(2)}</h1>);
      } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        inList = true;
        const itemContent = trimmed.substring(2);
        listItems.push(
          <li 
            key={`li-${index}`} 
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(itemContent) }} 
          />
        );
      } else if (trimmed === "") {
        if (inList) {
          elements.push(<ul key={`list-${index}`}>{listItems}</ul>);
          listItems = [];
          inList = false;
        }
      } else {
        if (inList) {
          elements.push(<ul key={`list-${index}`}>{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(
          <p 
            key={index} 
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} 
          />
        );
      }
    });

    if (inList && listItems.length > 0) {
      elements.push(<ul key="list-end">{listItems}</ul>);
    }

    return elements;
  };

  const handleSend = async (customQuestion = null) => {
    const textToSend = (customQuestion || question).trim();
    if (!textToSend || loading) return;

    if (!customQuestion) {
      setQuestion("");
    }

    // Temporarily add user message to state
    const userMsg = { role: "user", text: textToSend, is_general: false };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const payload = {
        question: textToSend,
        filename: filename,
        history: messages.slice(-5) // Send last 5 messages for RAG rewriting
      };

      const res = await api.post("/query", payload);

      const botMsg = { 
        role: "bot", 
        text: res.data.answer,
        is_general: res.data.is_general
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { 
          role: "bot", 
          text: "⚠️ I encountered an error while trying to query the document backend.",
          is_general: false
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isIndexing = filename && docStatus === "indexing";
  const isFailed = filename && docStatus === "failed";

  return (
    <div className="chat-wrapper">
      <div className="chat-header-banner">
        <span>💬 Intelligent Assistant</span>
        {messages.length > 0 && (
          <button className="chat-clear-btn" onClick={clearChat}>
            Clear History
          </button>
        )}
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {isIndexing ? (
          <div className="summary-loading">
            <div className="spinner"></div>
            <p>Document is indexing... Chatbot will start automatically once complete.</p>
          </div>
        ) : isFailed ? (
          <div className="summary-empty-state">
            <div className="summary-empty-icon">⚠️</div>
            <h3>Analysis Blocked</h3>
            <p>This document is not the appropriate document for the webapp. Chatbot is disabled.</p>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="summary-empty-state">
                <div className="summary-empty-icon">🤖</div>
                <h3>How can I help you today?</h3>
                <p>
                  Ask any question about the selected document context. I'll search the document and can also answer general knowledge questions.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`bubble ${msg.role}`}>
                {msg.role === "bot" && msg.is_general && (
                  <span className="general-knowledge-badge">
                    ✨ General Knowledge (Unrelated to Document)
                  </span>
                )}
                {msg.role === "bot" ? formatMessageText(msg.text) : msg.text}
              </div>
            ))}

            {loading && (
              <div className="bubble bot bubble-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Suggested Prompts Section - Shown only for document view and when complete */}
      {suggestedPrompts.length > 0 && !isIndexing && (
        <div className="suggestion-prompts-wrapper">
          <div className="suggestion-title">Suggested Prompts:</div>
          <div className="suggestion-chips">
            {suggestedPrompts.map((pText, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSend(pText)}
                disabled={loading}
              >
                {pText}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-input">
        <div className="chat-input-wrapper">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isIndexing
                ? "Chatbot is disabled while document is indexing..."
                : isFailed
                  ? "Chatbot is disabled for invalid documents..."
                  : filename 
                    ? `Ask about "${filename}"...` 
                    : "Ask about all uploaded documents..."
            }
            disabled={loading || isIndexing || isFailed}
          />
          <button onClick={() => handleSend()} disabled={loading || isIndexing || isFailed || !question.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );

}
