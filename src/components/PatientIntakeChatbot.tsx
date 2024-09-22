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
import { Input } from "./ui/input";

interface Message {
  content: string;
  isUser: boolean;
}

export default function PatientIntakeChatbot(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      sendMessage("Hello, I'm here for my intake appointment.");
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async (userMessage: string) => {
    setMessages((prev) => [...prev, { content: userMessage, isUser: true }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.isUser ? "user" : "assistant",
              content: m.content,
            })),
            { role: "user", content: userMessage },
          ],
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { content: data.content, isUser: false },
      ]);
      setIsFormComplete(data.isComplete);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          content: "I'm sorry, there was an error processing your request.",
          isUser: false,
        },
      ]);
    }

    setIsTyping(false);
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
    }
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
                  {message.content}
                </div>
              </div>
            </motion.div>
          ))}
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
                <div className="px-4 py-2 rounded-lg bg-muted">Typing...</div>
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
          <Input
            placeholder={
              isFormComplete
                ? "Form complete. Any questions?"
                : "Type your message here..."
            }
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
