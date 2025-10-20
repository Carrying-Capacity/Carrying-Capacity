import React, { useEffect, useState } from "react";

const ReadTenPrompter = ({ conversations }) => {
  // convert object to array if needed
  const convArray = Array.isArray(conversations)
    ? conversations
    : Object.values(conversations || {});

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!convArray || convArray.length === 0) return;
    const conv = convArray[selectedIndex];
    if (!conv?.mapping) {
      setMessages([]);
      return;
    }
    setMessages(extractMessages(conv.mapping));
  }, [convArray, selectedIndex]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Dropdown */}
      <div className="p-4 bg-white border-b">
        <p>Select the ChatGPT conversation that was used:
        <select
          className="ml-4 p-2 border rounded"
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
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
        ))}
      </div>
    </div>
  );
};

// Flatten mapping
function extractMessages(mapping) {
  const root = mapping["client-created-root"];
  if (!root) return [];

  const messages = [];
  const queue = [...(root.children || [])];

  while (queue.length > 0) {
    const id = queue.shift();
    const node = mapping[id];
    if (!node || !node.message) continue;

    const { role } = node.message.author || {};
    const content = node.message.content?.parts?.join("\n") || "";

    messages.push({ id, role, content });

    if (node.children && node.children.length > 0) {
      queue.push(...node.children);
    }
  }

  return messages;
}

export default ReadTenPrompter;
