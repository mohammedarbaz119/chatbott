import * as React from "react";
import {
  MessageSquare,
  X,
  Send,
  Settings,
  Pause,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, SubmitHandler, set } from "react-hook-form";
import { ColorPicker, Divider, Drawer, Collapse } from "antd";
import { Color } from "antd/es/color-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Type definitions
type ChatMessage = {
  id: string;
  content: string;
  role: "user" | "bot";
  isGenerating?: boolean;
};

type ChatInput = {
  message: string;
};

type ColorScheme = {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    headerBg: string;
  };
};

// Expanded simple questions and static responses
const simpleQA = [
  {
    question: "Hi",
    answer:
      "Hello! I'm ChemBot, your chemistry assistant. How can I help you today?",
  },
  {
    question: "Hello",
    answer: "Hi there! I'm ChemBot, here to assist with chemistry questions.",
  },
  {
    question: "Who are you",
    answer:
      "I'm ChemBot, a chatbot designed to assist with chemistry-related questions and more!",
  },
  {
    question: "About you",
    answer:
      "I'm built to provide quick, accurate answers about chemistry. Ask me anything from 'What is water?' to complex queries!",
  },
  {
    question: "What can you do",
    answer:
      "I'm ChemBot, designed to answer chemistry-related questions. Ask me anything about chemistry!",
  },
  {
    question: "How are you",
    answer:
      "I'm doing great, thanks! How can I assist you with chemistry today?",
  },
  {
    question: "Bye",
    answer: "Goodbye! Come back anytime with more questions.",
  },
];

// Predefined color schemes
const colorSchemes: ColorScheme[] = [
  {
    name: "Professional Blue",
    colors: {
      primary: "#2563eb",
      secondary: "#f1f5f9",
      background: "#ffffff",
      text: "#1e293b",
      headerBg: "linear-gradient(135deg, #1e40af, #3b82f6)",
    },
  },
  {
    name: "Elegant Green",
    colors: {
      primary: "#10b981",
      secondary: "#ecfdf5",
      background: "#ffffff",
      text: "#064e3b",
      headerBg: "linear-gradient(135deg, #059669, #34d399)",
    },
  },
  {
    name: "Modern Purple",
    colors: {
      primary: "#8b5cf6",
      secondary: "#f5f3ff",
      background: "#ffffff",
      text: "#4c1d95",
      headerBg: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    },
  },
  {
    name: "Warm Orange",
    colors: {
      primary: "#f97316",
      secondary: "#fff7ed",
      background: "#ffffff",
      text: "#7c2d12",
      headerBg: "linear-gradient(135deg, #ea580c, #fb923c)",
    },
  },
  {
    name: "Cool Gray",
    colors: {
      primary: "#4b5563",
      secondary: "#f3f4f6",
      background: "#ffffff",
      text: "#1f2937",
      headerBg: "linear-gradient(135deg, #374151, #6b7280)",
    },
  },
  {
    name: "Vibrant Teal",
    colors: {
      primary: "#0d9488",
      secondary: "#ccfbf1",
      background: "#ffffff",
      text: "#134e4a",
      headerBg: "linear-gradient(135deg, #0f766e, #2dd4bf)",
    },
  },
  {
    name: "Soft Rose",
    colors: {
      primary: "#e11d48",
      secondary: "#ffe4e6",
      background: "#ffffff",
      text: "#9f1239",
      headerBg: "linear-gradient(135deg, #be123c, #fb7185)",
    },
  },
  {
    name: "Deep Ocean",
    colors: {
      primary: "#0369a1",
      secondary: "#e0f2fe",
      background: "#ffffff",
      text: "#082f49",
      headerBg: "linear-gradient(135deg, #0c4a6e, #38bdf8)",
    },
  },
];

export function CustomizableChatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [showQuestions, setShowQuestions] = React.useState(true);
  const { Panel } = Collapse;
  const [isSending, setIsSending] = React.useState(false);
  const [controller, setController] = React.useState<AbortController | null>(
    null
  );
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [colors, setColors] = React.useState(colorSchemes[0].colors);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<ChatInput>({
    defaultValues: { message: "" },
  });

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, showQuestions]);

  const randomQuestions = React.useMemo(() => {
    if (!showQuestions) return [];
    const shuffled = [...simpleQA].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [showQuestions]);

  const handleColorChange =
    (colorKey: keyof typeof colors) => (color: Color) => {
      setColors((prevColors) => ({
        ...prevColors,
        [colorKey]: color.toHexString(),
      }));
    };

  const handleSchemeChange = (scheme: ColorScheme) => {
    setColors(scheme.colors);
    toast.success(`Applied ${scheme.name} theme`);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const updateBotMessage = (content: string) => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (
        lastMessage &&
        lastMessage.role === "bot" &&
        lastMessage.isGenerating
      ) {
        return [...prev.slice(0, -1), { ...lastMessage, content }];
      }
      return [
        ...prev,
        { id: Date.now().toString(), content, role: "bot", isGenerating: true },
      ];
    });
  };

  const generateStaticResponse = (question: string, response: string) => {
    const userMessage = {
      id: Date.now().toString(),
      content: question,
      role: "user",
    } as ChatMessage;
    setMessages((prev) => [...prev, userMessage]);
    setShowQuestions(false);

    const botMessageId = Date.now().toString() + "-bot";
    setMessages((prev) => [
      ...prev,
      { id: botMessageId, content: response, role: "bot", isGenerating: false },
    ]);
    setTimeout(() => setShowQuestions(true), 1000);
  };

  const sendMessage = async (input: string) => {
    if (input.trim() === "") return;

    // Check for generic static responses first
    const lowerInput = input.toLowerCase().trim();
    const simpleMatch = simpleQA.find(
      (qa) => lowerInput === qa.question.toLowerCase()
    );
    if (simpleMatch) {
      generateStaticResponse(simpleMatch.question, simpleMatch.answer);
      return;
    }

    // Proceed with backend fetch for non-generic queries
    setIsSending(true);
    const newController = new AbortController();
    setController(newController);

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    } as ChatMessage;
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setShowQuestions(false);
    setLoading(true);

    try {
      const queryParam = encodeURIComponent(input);
      const url = `https://chembot-backend.onrender.com/query?text=${queryParam}`;
      const response = await fetch(url, { signal: newController.signal });

      if (!response.ok) {
        throw new Error(
          "There was some error generating a response, please try again."
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body not readable");

      const decoder = new TextDecoder();
      let accumulatedMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk.includes("[END]")) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.role === "bot" && msg.isGenerating
                ? { ...msg, isGenerating: false }
                : msg
            )
          );
          break;
        }

        if (chunk.includes("Error:")) {
          toast.error("There was an error generating a response");
          return;
        }
        setLoading(false);

        accumulatedMessage += chunk;
        updateBotMessage(accumulatedMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        } else {
          toast.error(error.message);
          console.error("Error:", error);
        }
      } else {
        console.error("Unknown error:", error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSending(false);
      setController(null);
      setShowQuestions(true);
    }
  };

  const handleAbort = (e: React.MouseEvent) => {
    e.preventDefault();
    if (controller) {
      controller.abort();
    }
  };

  const onSubmit: SubmitHandler<ChatInput> = async (data) => {
    await sendMessage(data.message);
    reset();
  };

  const handleQuestionClick = async (question: string) => {
    setValue("message", question);
    await sendMessage(question);
    reset();
  };

  return (
    <>
      {!isOpen && (
        <Button
          className="fixed right-4 bottom-4 rounded-full p-3 shadow-lg"
          style={{ backgroundColor: colors.primary }}
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" color={colors.background} />
        </Button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: "100%" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed sm:right-4 sm:bottom-4 right-2 bottom-2 left-2 sm:left-auto sm:w-[400px] h-[600px]"
          >
            <Card
              className="flex flex-col h-full shadow-xl border-0 overflow-hidden"
              style={{
                backgroundColor: colors.background,
                fontFamily: "Inter, sans-serif",
              }}
            >
              <CardHeader
                className="flex flex-row items-center justify-between space-y-0 py-4 px-6 rounded-t-xl"
                style={{ background: colors.headerBg }}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare
                    className="h-5 w-5"
                    color={colors.background}
                  />
                  <CardTitle
                    className="text-xl font-semibold"
                    style={{ color: colors.background }}
                  >
                    ChemBot
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/20"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" color={colors.background} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" color={colors.background} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent
                className="flex-grow overflow-hidden p-4 space-y-4"
                style={{
                  backgroundColor: colors.secondary,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${colors.primary}' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
              >
                <ScrollArea className="h-full w-full pr-4">
                  {messages.length === 0 && (
                    <div
                      className="text-center p-4 text-[16px] font-normal"
                      style={{ color: colors.text }}
                    >
                      Hello! I'm ChemBot, your chemistry assistant. Ask me
                      anything!
                    </div>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-4 ${
                        m.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <span
                        className={`inline-block p-3 rounded-2xl shadow-sm text-[15px] font-normal ${
                          m.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                        }`}
                        style={{
                          backgroundColor:
                            m.role === "user"
                              ? colors.primary
                              : colors.background,
                          color:
                            m.role === "user" ? colors.background : colors.text,
                          maxWidth: "85%",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {m.content}
                      </span>
                    </div>
                  ))}
                  {showQuestions && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {randomQuestions.map((qa) => (
                        <button
                          key={qa.question}
                          onClick={() => handleQuestionClick(qa.question)}
                          className="px-3 py-1.5 text-[14px] font-normal rounded-full transition-colors hover:opacity-80"
                          style={{
                            backgroundColor: colors.primary,
                            color: colors.background,
                          }}
                        >
                          {qa.question}
                        </button>
                      ))}
                    </div>
                  )}
                  {loading && (
                    <span className="inline-flex ml-2">
                      <motion.span
                        className="w-1 h-1 bg-current rounded-full mr-1"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0,
                        }}
                      />
                      <motion.span
                        className="w-1 h-1 bg-current rounded-full mr-1"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0.2,
                        }}
                      />
                      <motion.span
                        className="w-1 h-1 bg-current rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0.4,
                        }}
                      />
                    </span>
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
              <CardFooter
                className="p-4"
                style={{ backgroundColor: colors.background }}
              >
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex w-full space-x-2"
                >
                  <Input
                    {...register("message", { required: true })}
                    placeholder="Ask me anything..."
                    className="flex-grow rounded-full text-[15px] font-normal"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.text,
                      borderColor: "transparent",
                    }}
                    disabled={isSending}
                  />
                  {isSending ? (
                    <Button
                      type="button"
                      className="rounded-full"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.background,
                      }}
                      onClick={handleAbort}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="rounded-full"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.background,
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Drawer
        title="Chatbot Settings"
        placement="left"
        onClose={() => setIsSettingsOpen(false)}
        open={isSettingsOpen}
        width={400}
      >
        <div className="space-y-4" style={{ fontFamily: "Inter, sans-serif" }}>
          <Collapse
            defaultActiveKey={["1"]}
            expandIcon={({ isActive }) => (
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isActive ? "rotate-90" : ""
                }`}
              />
            )}
          >
            <Panel header="Color Schemes" key="1">
              <div className="grid grid-cols-2 gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.name}
                    onClick={() => handleSchemeChange(scheme)}
                    className="px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: scheme.colors.primary,
                      color: scheme.colors.background,
                    }}
                  >
                    {scheme.name}
                  </button>
                ))}
              </div>
            </Panel>
            <Panel header="Custom Colors" key="2">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Primary Color
                  </label>
                  <ColorPicker
                    value={colors.primary}
                    onChange={handleColorChange("primary")}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Secondary Color
                  </label>
                  <ColorPicker
                    value={colors.secondary}
                    onChange={handleColorChange("secondary")}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Background Color
                  </label>
                  <ColorPicker
                    value={colors.background}
                    onChange={handleColorChange("background")}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Text Color
                  </label>
                  <ColorPicker
                    value={colors.text}
                    onChange={handleColorChange("text")}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Header Background
                  </label>
                  <ColorPicker
                    value={colors.headerBg}
                    onChange={handleColorChange("headerBg")}
                  />
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>
      </Drawer>
    </>
  );
}
