import React, { useEffect, useState, useMemo } from "react";

const ReadTenPrompter = ({ conversations }) => {
  // convert object to array once (memoized)
  const convArray = useMemo(() => {
    return Array.isArray(conversations)
      ? conversations
      : Object.values(conversations || {});
  }, [conversations]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!convArray || convArray.length === 0) return;

    const conv = convArray[selectedIndex];
    if (!conv?.mapping) {
      setMessages([]);
      return;
    }

    // async processing to prevent blocking UI
    const loadMessages = async () => {
      setLoading(true);

      // yield to browser to render spinner
      await new Promise((r) => setTimeout(r, 50));

      const msgs = extractMessages(conv.mapping);
      setMessages(msgs);
      setLoading(false);
    };

    loadMessages();
  }, [convArray, selectedIndex]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Dropdown */}
      <div className="p-4 bg-white border-b">
        <p>
          Select the ChatGPT conversation that was used:
          <select
            className="ml-2 p-2 border rounded"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
          >
            {convArray.map((conv, idx) => (
              <option key={idx} value={idx}>
                {conv.title || `Conversation ${idx + 1}`}
              </option>
            ))}
          </select>
        </p>
      </div>

      {/* Messages or Loader */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/70 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Loading conversation...</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-3xl mx-auto p-3 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-100 self-end text-right"
                  : "bg-white self-start text-left"
              }`}
            >
              <p className="text-sm text-gray-600 mb-1 font-semibold">
                {msg.role === "user" ? "You" : "ChatGPT"}
              </p>
              <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Flatten mapping
function extractMessages(mapping) {
  if (!mapping) return [];

  const messages = [];

  for (const [id, node] of Object.entries(mapping)) {
    if (!node?.message) continue;

    const { role } = node.message.author || {};
    const content = node.message.content?.parts?.join("\n")?.trim() || "";

    if (!content) continue;
    messages.push({ id, role, content });
  }

  return messages;
}

export default ReadTenPrompter;
