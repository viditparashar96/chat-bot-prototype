"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
interface Question {
  id: string;
  question: string;
  required: boolean;
  type: "text" | "button";
  options?: string[];
}
const questions: Question[] = [
  { id: "name", question: "What's your name?", required: true, type: "text" },
  {
    id: "age",
    question: "How old are you, {name}?",
    required: true,
    type: "text",
  },
  {
    id: "gender",
    question: "What's your gender, {name}?",
    required: false,
    type: "button",
    options: ["Male", "Female", "Other"],
  },
  {
    id: "phone",
    question: "What's your phone number?",
    required: true,
    type: "text",
  },
  {
    id: "email",
    question: "What's your email address?",
    required: true,
    type: "text",
  },
  {
    id: "address",
    question: "What's your home address?",
    required: true,
    type: "text",
  },
  {
    id: "symptoms",
    question: "What symptoms are you experiencing?",
    required: true,
    type: "text",
  },
  {
    id: "diabetic",
    question: "Are you diabetic?",
    required: true,
    type: "button",
    options: ["Yes", "No"],
  },
  {
    id: "allergies",
    question: "Do you have any allergies?",
    required: false,
    type: "text",
  },
  {
    id: "medications",
    question: "Are you currently taking any medications?",
    required: false,
    type: "text",
  },
  {
    id: "medicalHistory",
    question: "Do you have any significant medical history?",
    required: false,
    type: "text",
  },
];

interface Message {
  content: string;
  isUser: boolean;
  options?: string[];
}

interface PatientData {
  [key: string]: string;
}

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [text, currentIndex]);

  return <>{displayText}</>;
};
const TypingAnimation: React.FC = () => (
  <motion.div
    className="flex space-x-1 mt-2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        delay: 0.1,
      }}
    />
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        delay: 0.2,
      }}
    />
  </motion.div>
);

export default function PatientIntakeChatbot(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        "Hello! I'm here to help you with your patient intake. Let's get started with some questions.",
      isUser: false,
    },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [input, setInput] = useState("");
  const [patientData, setPatientData] = useState<PatientData>({});
  const [isTyping, setIsTyping] = useState(false);

  const isOptionQuestion = questions[currentQuestion]?.type === "button";

  useEffect(() => {
    if (currentQuestion < questions.length) {
      askNextQuestion();
    } else if (currentQuestion === questions.length) {
      finishIntake();
    }
  }, [currentQuestion]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null); // This will track the bottom of the messages

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const askNextQuestion = () => {
    setIsTyping(true);
    setTimeout(() => {
      const question = questions[currentQuestion];
      let content = question.question;
      if (patientData.name) {
        content = content.replace("{name}", patientData.name);
      }
      setMessages((prev) => [
        ...prev,
        {
          content,
          isUser: false,
          options: question.type === "button" ? question.options : undefined,
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (input.trim()) {
      const answer = input.trim();
      setMessages((prev) => [...prev, { content: answer, isUser: true }]);
      setPatientData((prev) => ({
        ...prev,
        [questions[currentQuestion].id]: answer,
      }));
      setInput("");
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleButtonClick = (option: string) => {
    setMessages((prev) => [...prev, { content: option, isUser: true }]);
    setPatientData((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: option,
    }));
    setCurrentQuestion((prev) => prev + 1);
  };

  const finishIntake = () => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          content: `Thank you ${patientData.name} for providing your information. Your intake is complete!`,
          isUser: false,
        },
      ]);
      console.log("Patient Data:", patientData);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <Card className="w-full md:w-1/2 h-screen mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Patient Intake Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100vh-200px)] overflow-auto">
        <ScrollArea className="pr-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex ${
                  message.isUser ? "flex-row-reverse" : "flex-row"
                } items-end`}
              >
                <Avatar
                  className={`w-8 h-8 ${message.isUser ? "ml-2" : "mr-2"}`}
                >
                  <AvatarFallback>
                    {message.isUser ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.isUser ? (
                    message.content
                  ) : (
                    <TypewriterText text={message.content} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {messages[messages.length - 1]?.options && (
            <div className="flex justify-start space-x-2 mb-4">
              {messages[messages.length - 1].options!.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleButtonClick(option)}
                  variant="outline"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start mb-4"
              >
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="px-4 py-2 rounded-lg bg-muted">
                  <TypingAnimation />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef}></div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Textarea
            placeholder={
              isOptionQuestion
                ? "Please select an option above"
                : "Type your message here..."
            }
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            className="flex-grow"
            disabled={isOptionQuestion}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isOptionQuestion || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
