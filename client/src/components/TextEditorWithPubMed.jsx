import React, { useState, useEffect, useRef } from "react";
import "./SearchBarWithEditor.css";

function SearchBarWithEditor() {
  const [keyword, setKeyword] = useState("");            // For manual input keyword
  const [selectedText, setSelectedText] = useState("");  // Text selected in editor
  const [popupPos, setPopupPos] = useState(null);        // Popup button position
  const [results, setResults] = useState([]);            // Search results
  const editorRef = useRef();                            // Reference to the editable div

  // Fetch PubMed search results
  const fetchResults = async (term) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/pubmed?term=${term}`);
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      // Extract results from parsed HTML
      const elements = doc.querySelectorAll(".rslt");
      const extractedResults = Array.from(elements).slice(0, 5).map((el) => ({
        title: el.querySelector("a")?.textContent.trim(),
        link: el.querySelector("a")?.href || "#",
      }));

      setResults(extractedResults);  // Update state with fetched results
      setPopupPos(null);            // Hide the popup
    } catch (error) {
      console.error("Error fetching PubMed data:", error);
    }
  };

  // Handle form submission (manual search)
  const handleManualSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      fetchResults(keyword);
    } else {
      setResults([]);
    }
  };

  // Handle text selection in the editor
  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0 && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPopupPos({
        top: rect.top + window.scrollY - 30,
        left: rect.left + window.scrollX,
      });
    } else {
      setSelectedText("");
      setPopupPos(null);
    }
  };

  // Add and clean up event listeners for text selection
  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keyup", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keyup", handleSelection);
    };
  }, []);

  return (
    <div className="container">
      <h2>PubMed Search Tool</h2>

      {/* Manual Search Bar */}
      <form onSubmit={handleManualSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter keyword to search PubMed"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {/* Popup button near selection */}
      {popupPos && (
        <button
          className="popup-button"
          style={{
            top: popupPos.top,
            left: popupPos.left,
          }}
          onClick={() => fetchResults(selectedText)}
        >
          🔍
        </button>
      )}

      {/* Editable Text Area */}
      <div
        ref={editorRef}
        contentEditable
        className="text-editor"
      >
        {/* You can type and select text here */}
      </div>

      {/* Display Search Results */}
      {results.length > 0 && (
        <ul className="results-list">
          {results.map((element, index) => (
            <li
              key={index}
              onClick={() => window.open(element.link, "_blank")}
              className="result-item"
            >
              {element.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBarWithEditor;
