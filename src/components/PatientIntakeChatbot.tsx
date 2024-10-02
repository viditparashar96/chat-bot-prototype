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
import { sendToClinic } from "@/services/nurse/nurse.actions";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Upload, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import InsuranceVerification from "./InsuranceVerification";
interface Message {
  content: string;
  isUser: boolean;
}

interface FormData {
  name: string;
  currentConditions: string;
  pastIllnesses: string;
  pastHospitalizations: string;
  recentImaging: string;
  currentMedications: string;
  healthConcerns: string;
  insuranceCardStatus: "uploaded" | "front_desk" | null;
  insuranceCardUrl: string | null;
  governmentIdStatus: "uploaded" | "front_desk" | null;
  governmentIdUrl: string | null;
}

export default function PatientIntakeChatbot(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [requiresAction, setRequiresAction] = useState(false);
  const [actionType, setActionType] = useState<
    "upload_insurance" | "upload_id" | null
  >(null);
  const [insuranceCardUrl, setInsuranceCardUrl] = useState<string | null>(null);
  const [governmentIdUrl, setGovernmentIdUrl] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const sendMessage = async (
    userMessage: string,
    uploadedDocument?: { type: string; url: string }
  ) => {
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
              content: m.content || "",
            })),
            { role: "user", content: userMessage },
          ],
          uploadedDocument,
        }),
      });

      const data = await response.json();
      console.log("AI response:", data);

      setRequiresAction(data.requiresAction);
      setActionType(data.actionType);

      setMessages((prev) => [
        ...prev,
        { content: data.message, isUser: false },
      ]);

      if (data.isComplete) {
        setIsFormComplete(true);
        setFormData(data.formData);
        setIsCompleted(true);
        // console.log("Form data:", data.formData);
        // console.log(
        //   "Before sendToClinic - insuranceCardUrl:",
        //   insuranceCardUrl
        // );
        // console.log("Before sendToClinic - governmentIdUrl:", governmentIdUrl);
        // const response = await sendToClinic({
        //   formData: data.formData,
        //   insuranceIDurl: insuranceCardUrl,
        //   govtIDurl: governmentIdUrl,
        // });
        // console.log("Clinic response in Client Side:", response);
        // if (response) {
        //   toast.success("Form data sent to clinic successfully.");
        // }
      }
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

  const sendinClinic = async () => {
    try {
      console.log("Before sendToClinic - insuranceCardUrl:", insuranceCardUrl);
      console.log("Before sendToClinic - governmentIdUrl:", governmentIdUrl);
      const response = await sendToClinic({
        formData: formData,
        insuranceIDurl: insuranceCardUrl,
        govtIDurl: governmentIdUrl,
      });
      console.log("Clinic response in Client Side:", response);
      if (response) {
        toast.success("Form data sent to clinic successfully.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (isCompleted) {
      sendinClinic();
    }
  }, [isCompleted]);

  console.log("Action Type:", actionType);
  console.log("Requires Action:", requiresAction);
  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
    }
  };
  const [showInsuranceVerification, setShowInsuranceVerification] =
    useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Response==>", response);
        // Here you would typically upload the file to your server or a cloud storage service
        // For this example, we'll simulate an upload by creating a fake URL
        if (response.data.document) {
          if (actionType === "upload_insurance") {
            setInsuranceCardUrl(response.data.document.url);
            setShowInsuranceVerification(true);

            await sendMessage("I've uploaded my insurance card.", {
              type: "insurance",
              url: response.data.document.url,
            });
          } else {
            setGovernmentIdUrl(response.data.document.url);
            await sendMessage("I've uploaded my government ID.", {
              type: "id",
              url: response.data.document.url,
            });
            setRequiresAction(false);
            setActionType(null);
          }
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file. Please try again.");
    }
  };
  console.log("Insurance Card URL:", insuranceCardUrl);
  console.log("Government ID URL:", governmentIdUrl);
  const handleUploadLater = () => {
    if (actionType === "upload_insurance") {
      sendMessage("I'll provide my insurance card at the front desk.");
    } else if (actionType === "upload_id") {
      sendMessage("I'll provide my government ID at the front desk.");
    }
    setRequiresAction(false);
    setActionType(null);
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
        {isCompleted ? (
          <div>
            <p className="text-lg font-semibold mb-2">
              Thank you for providing the necessary information. Your intake
              form is complete.
            </p>
          </div>
        ) : requiresAction ? (
          <div className="flex flex-col w-full space-y-2">
            <p>
              Would you like to upload your{" "}
              {actionType === "upload_insurance"
                ? "insurance card"
                : "government ID"}{" "}
              now?
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => fileInputRef.current?.click()}>
                Upload Now
                <Upload className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleUploadLater}>
                Upload at Front Desk
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
        ) : (
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInput(e.target.value)
              }
              className="flex-grow"
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        )}
      </CardFooter>
      <InsuranceVerification show={showInsuranceVerification} />
    </Card>
  );
}
