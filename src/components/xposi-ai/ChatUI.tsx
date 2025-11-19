"use client";
import { useState } from "react";

export default function ChatUI({ pdf_id }: { pdf_id: string }) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    const question = input;
    setMessages([...messages, { sender: "user", text: question }]);
    setInput("");

    const res = await fetch("/api/xposi-ai/ask", {
      method: "POST",
      body: JSON.stringify({ question, pdf_id }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { sender: "ai", text: data.answer }]);
  }

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto">
      <div className="flex-1 bg-gray-50 p-4 rounded-xl shadow-sm h-[400px] overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`my-2 p-3 rounded-xl max-w-[80%] ${
              m.sender === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-white border text-black"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          className="
            flex-1 border rounded-xl p-2 
            text-black 
            placeholder:text-gray-500
            bg-white
          "
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything from your PDF..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}
