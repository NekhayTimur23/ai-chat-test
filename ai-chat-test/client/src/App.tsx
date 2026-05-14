import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) {
      setError("Введите сообщение");
      return;
    }

    setLoading(true);
    setError("");

    const newMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: message,
      },
    ];

    setMessages(newMessages);

    try {
      const response = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка сервера");
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);

      setMessage("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Что-то пошло не так");
      }
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Ваш браузер не поддерживает голосовой ввод");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "ru-RU";
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setMessage(text);
    };

    recognition.onerror = () => {
      setError("Ошибка распознавания голоса");
    };

    recognition.start();
  };

  return (
    <main className="min-h-screen bg-[#0b3470] text-white flex items-center justify-center px-6">
      <section className="w-full max-w-3xl">
        <div className="mb-12">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-10 shadow-lg">
            💬
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">Hi there!</h1>

          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            What would you like to know?
          </h2>

          <p className="text-blue-200 text-lg">
            Ask your own question and get an AI answer
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0a2b5c] border border-blue-500/40 rounded-2xl p-3 shadow-2xl">
          <button
            onClick={startVoiceInput}
            className="w-12 h-12 rounded-xl bg-blue-900 hover:bg-blue-800 transition"
            title="Voice input"
          >
            🎤
          </button>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask whatever you want"
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-blue-200"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="w-14 h-14 rounded-xl bg-blue-600 hover:bg-blue-500 transition disabled:opacity-60"
          >
            {loading ? "..." : "➜"}
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-400 text-red-100 p-4 rounded-xl">
            {error}
          </div>
        )}
        <div className="mt-8 flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 self-end"
                  : "bg-white/10 border border-white/20 self-start"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
