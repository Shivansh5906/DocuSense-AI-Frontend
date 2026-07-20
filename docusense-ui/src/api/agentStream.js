/**
 * A2UI Real-Time Stream Helper for Docusense
 * Connects React UI components to backend Multi-Agent SSE event streams.
 */

const getBaseUrl = () => {
  const isLocalhost = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  return isLocalhost
    ? "http://127.0.0.1:8000/api/v1"
    : "https://docusense-ai-backend.onrender.com/api/v1";
};

export const streamAgentWorkflow = async ({
  userGoal = "ALL",
  resumeText,
  jdText = "",
  sessionId = "",
  onEvent,
  onComplete,
  onError
}) => {
  const baseURL = getBaseUrl();
  const token = localStorage.getItem("docusense_token");

  try {
    const response = await fetch(`${baseURL}/agent/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        user_goal: userGoal,
        resume_text: resumeText,
        jd_text: jdText,
        session_id: sessionId
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Agent stream failed: ${response.status} ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop(); // Keep incomplete chunk in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.replace("data: ", "").trim());
            if (onEvent) onEvent(data);

            if (data.event === "FINAL_RESULT" && onComplete) {
              onComplete(data.payload);
            }
          } catch (e) {
            console.warn("A2UI Stream Parse Warning:", e);
          }
        }
      }
    }
  } catch (err) {
    if (onError) onError(err);
    else console.error("Stream Error:", err);
  }
};
