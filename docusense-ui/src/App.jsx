import { useState } from "react";
import Upload from "./components/Upload";
import Chatbot from "./components/Chatbot";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("upload");
  const [filename, setFilename] = useState(null);

  return (
    <div className="app">
      {screen === "upload" && (
        <Upload
          onUploadDone={(fname) => {
            setFilename(fname);
            setScreen("chat");
          }}
        />
      )}

      {screen === "chat" && <Chatbot filename={filename} />}
    </div>
  );
}
