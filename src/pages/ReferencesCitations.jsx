import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import bibtexParse from "bibtex-parse-js";
// import ReadTenPrompter from "../components/ReadTenPrompter";
// import conversationData from "../data/ten_prompter.json"

// Import BibTeX file directly as a raw string
import bibText from "../data/references.bib?raw";

export default function ReferencesCitations() {
  const [citations, setCitations] = useState([]);

  useEffect(() => {
    const parsed = bibtexParse.toJSON(bibText);
    const formatted = parsed.map((entry) => formatAPA(entry.entryTags));
    setCitations(formatted);
  }, []);

  function formatAPA(tags) {
    // Convert all keys to lowercase
    const t = {};
    for (const key in tags) {
      t[key.toLowerCase()] = tags[key];
    }

    const authors = t.author
      ? t.author
          .split(" and ")
          .map((a) => {
            const parts = a.split(",").map((s) => s.trim()).filter(Boolean);
            if (parts.length === 2) {
              const [last, first] = parts;
              return `${last}, ${first[0]}.`;
            } else {
              return parts[0]; // fallback
            }
          })
          .join(", ")
      : "";

    const year = t.year ? `(${t.year}).` : "";
    const title = t.title ? `${t.title}.` : "";
    const journal = t.journal ? `<i>${t.journal}</i>.` : "";
    const publisher = t.publisher ? `${t.publisher}.` : "";
    const doi = t.doi ? `https://doi.org/${t.doi}` : "";
    const url = t.url ? t.url : "";

    return [authors, year, title, journal, publisher, doi, url].filter(Boolean).join(" ");
  }

  return (
    <PageLayout>
      <h1>References</h1>
      <hr className="my-4 border-gray-300" />
      <p>Below are the references  used for this project.</p>
      <div style={{ maxHeight: "100vh", overflowY: "auto" }}>
        {citations.map((cite, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: `${i + 1}. ${cite}` }} />
        ))}
      </div>
      {/* AI usage section */}
      <h1>AI usage</h1>
      <hr className="my-4 border-gray-300" />
      <p>ChatGPT and Claude were used to aid in bug fixing, production and development of this project. At the end of the project, we ensured that the majority of functional code was hand-written. 
      </p>
      {/* Sam said this was unneccesary but i have it here for legacy */}
      {/* <ReadTenPrompter conversations={conversationData}/> */}
    </PageLayout>
  );
}
