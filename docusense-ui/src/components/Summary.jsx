import { useState, useEffect } from "react";
import api from "../api/client";

export default function Summary({ filename, status }) {
  const [summaryCache, setSummaryCache] = useState({}); // Stores summaries by filename
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentSummary = filename ? summaryCache[filename] : null;

  // Retrieve existing summary or fetch automatically on file switch
  useEffect(() => {
    if (!filename) {
      setError(null);
      return;
    }

    // If summary is already cached, don't fetch again
    if (summaryCache[filename]) {
      setError(null);
      return;
    }

    const autoFetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.post("/summary/auto", { filename });
        
        if (res.data && res.data.summary) {
          setSummaryCache((prev) => ({
            ...prev,
            [filename]: res.data.summary,
          }));
        } else if (res.data && res.data.error) {
          // Summary not generated yet or missing
          setError(res.data.error);
        }
      } catch (err) {
        console.error("Failed to automatically load summary", err);
        setError("Summary is not yet generated.");
      } finally {
        setLoading(false);
      }
    };

    autoFetchSummary();
  }, [filename, status, summaryCache]);

  const handleGenerateSummary = async () => {
    if (!filename) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/summary/auto", { filename });

      if (res.data && res.data.summary) {
        setSummaryCache((prev) => ({
          ...prev,
          [filename]: res.data.summary,
        }));
      } else if (res.data && res.data.error) {
        setError(res.data.error);
      } else {
        setError("Could not generate summary.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate summary. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  const parseInlineMarkdown = (text) => {
    if (!text) return "";
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");
    return html;
  };

  const renderSummaryMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    const elements = [];
    let listItems = [];
    let inList = false;

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

  const isIndexing = filename && status === "indexing";

  return (
    <section className="summary-panel">
      <div className="summary-card">
        <header className="summary-header">
          <div className="summary-title">
            <span>📄</span> Document Summary
          </div>
        </header>

        <div className="summary-content">
          {!filename && (
            <div className="summary-empty-state">
              <div className="summary-empty-icon">📂</div>
              <h3>No Document Selected</h3>
              <p>Select a document from the sidebar to view its summary insights.</p>
            </div>
          )}

          {filename && (loading || isIndexing) && (
            <div className="summary-loading">
              <div className="spinner"></div>
              <p>Analyzing document & generating summary...</p>
            </div>
          )}

          {filename && !(loading || isIndexing) && currentSummary && (
            <div className="summary-markdown-view animate-fade-in">
              {renderSummaryMarkdown(currentSummary)}
            </div>
          )}

          {filename && !(loading || isIndexing) && !currentSummary && (
            <div className="summary-empty-state">
              <div className="summary-empty-icon">💡</div>
              <h3>No Summary Available</h3>
              <p>
                {error || "We haven't summarized this document yet. Click below to generate one."}
              </p>
              <button 
                className="btn-generate" 
                onClick={handleGenerateSummary}
                disabled={loading}
              >
                Generate Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
