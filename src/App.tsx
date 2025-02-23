import { CustomizableChatbot } from "./CustomizableChatbot";
import { ConfigProvider } from "antd";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster from Shadcn

function App() {
  return (
    <ConfigProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-900 p-8">
        <header className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">CRAG AI Chatbot</h1>
          <p className="text-xl mb-8">
            Experience the future of conversational AI with our CRAG chatbot.
          </p>
        </header>
        <main className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">How to use:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Click the chat button in the bottom right corner to open the
              chatbot.
            </li>
            <li>
              Start chatting with the AI by typing your message and pressing
              enter.
            </li>
            <li>
              Customize the chatbot's appearance by clicking the settings icon
              in the chat header.
            </li>
            <li>Enjoy a personalized AI chat experience!</li>
          </ol>
        </main>
        <CustomizableChatbot />
      </div>
      <Toaster /> 
    </ConfigProvider>
  );
}

export default App;
