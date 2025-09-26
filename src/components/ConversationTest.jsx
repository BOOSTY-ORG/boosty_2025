import React, { useState } from "react";
import ConversationEngine from "../utils/conversationEngine";

const ConversationTest = () => {
  const [conversation] = useState(new ConversationEngine());
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);

    // Add user message to display
    const newMessages = [...messages, { type: "user", text: userInput }];
    setMessages(newMessages);

    try {
      // Process with conversation engine
      const response = await conversation.processUserMessage(userInput, {
        formData: {},
        location: "Lagos",
        currentPage: "voice-assistant",
      });

      // Add AI response to display
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: response.response,
          intent: response.intent,
          actions: response.actions,
        },
      ]);

      // Clear input
      setUserInput("");
    } catch (error) {
      console.error("Conversation failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setIsProcessing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Conversation Test
      </h2>

      {/* Messages Display */}
      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-500 italic">
            Start a conversation! Try: "I have a refrigerator" or "What's the
            difference between lithium and lead acid batteries?"
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-3 p-3 rounded-lg ${
              message.type === "user"
                ? "bg-blue-100 ml-8"
                : message.type === "error"
                ? "bg-red-100 mr-8"
                : "bg-white mr-8 border"
            }`}
          >
            <div className="font-semibold text-sm mb-1">
              {message.type === "user"
                ? "You"
                : message.type === "error"
                ? "Error"
                : "Boosty AI"}
              {message.intent && (
                <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">
                  {message.intent}
                </span>
              )}
            </div>
            <div className="text-gray-800">{message.text}</div>

            {/* Show actions if any */}
            {message.actions && message.actions.length > 0 && (
              <div className="mt-2 text-xs">
                <strong>Suggested Actions:</strong>
                <ul className="list-disc ml-4">
                  {message.actions.map((action, i) => (
                    <li key={i}>
                      {action.type}: {action.field} = {action.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="bg-gray-200 mr-8 p-3 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
              Boosty AI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (e.g., 'I have a refrigerator')"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isProcessing}
        />
        <button
          onClick={handleSendMessage}
          disabled={isProcessing || !userInput.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>

      {/* Test Buttons */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setUserInput("I have a refrigerator")}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
        >
          Test: "I have a refrigerator"
        </button>
        <button
          onClick={() =>
            setUserInput(
              "What's the difference between lithium and lead acid batteries?"
            )
          }
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
        >
          Test: Battery Question
        </button>
        <button
          onClick={() => setUserInput("Fill in air conditioner 1500 watts")}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
        >
          Test: Form Fill
        </button>
      </div>
    </div>
  );
};

export default ConversationTest;
