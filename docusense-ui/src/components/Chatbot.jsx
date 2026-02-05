import { useState } from "react";
import api from "../api/client";

export default function Chatbot({ filename }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const ask = async () => {
    if (!question.trim()) return;

    const userMsg = { role: "user", text: question };
    setMessages((m) => [...m, userMsg]);
    setQuestion("");

    try {
      const res = await api.post("/query", {
        question,
        filename,
      });

      const botMsg = { role: "bot", text: res.data.answer };
      setMessages((m) => [...m, botMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Error getting response" },
      ]);
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">DocuSense AI</div>

      <div className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something..."
        />
        <button onClick={ask}>Send</button>
      </div>
    </div>
  );
}
