import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { saveMessages, loadMessages } from "../config/chatDB";
import EditorModal from "./EditorModal";
import TerraformFilePreviewCard from "./TerraformFilePreviewCard";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editableFiles, setEditableFiles] = useState(null); // opens modal
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    (async () => {
      const stored = await loadMessages();
      setMessages(stored || []);
    })();
  }, []);

  useEffect(() => {
    if (messages.length) {
      saveMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    const github_token = localStorage.getItem("github_token");
    if (!github_token) {
      alert("Please login with GitHub first.");
      return;
    }

    const userMessage = { text: prompt, sender: "user" };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const message_history = updatedMessages.map((msg) => ({
      role: msg.sender,
      content: msg.text,
    }));

    try {
      const res = await axios.post("http://localhost:8000/submit-job", {
        message_history,
        github_token,
        username: "demo-user",
        cloud_provider: "aws",
        vcs_provider: "github",
        mode: messages.length === 0 ? "create" : "reply",
      });

      const resPayload = res.data?.n8n_response?.[0];

      if (resPayload?.status === "ask") {
        const assistantMessage = {
          text: resPayload.last_question,
          sender: "assistant",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (resPayload?.files) {
        const assistantFileMsg = {
          text: "Here are your Terraform files",
          sender: "assistant",
          files: resPayload.files,
        };
        setMessages((prev) => [...prev, assistantFileMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "⚠️ Unexpected response.", sender: "assistant" },
        ]);
      }
    } catch (error) {
      console.error("❌ Error submitting prompt:", error);
      setMessages((prev) => [
        ...prev,
        { text: "❌ Failed to get response from server.", sender: "assistant" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app">
      <Paper className="chat-container" elevation={3}>
        <div className="chat-list">
          {messages.map((msg, idx) => (
            <div key={idx} className="message-row-wrapper">
              {msg.text && !msg.files && (
                <div className={`message-row ${msg.sender}`}>
                  <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
                </div>
              )}

              {msg.files && (
                <div className="file-card-wrapper">
                  <TerraformFilePreviewCard
                    files={msg.files}
                    onOpenEditor={() => setEditableFiles(msg.files)}
                  />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ✅ Modal Only Opens When User Clicks "Edit" */}
        <EditorModal
          open={!!editableFiles}
          files={editableFiles}
          onClose={() => setEditableFiles(null)}
          onSave={async (updatedFiles) => {
            const github_token = localStorage.getItem("github_token");
            try {
              const res = await axios.post("http://localhost:5678/webhook-test/github-push", {
                github_token,
                repo: "demo2",         // or your dynamic repo name
                branch: "demobranch",  // replace as needed
                edited_files: updatedFiles,
              });
              console.log(res)
              alert("✅ Files pushed to GitHub");
              setEditableFiles(null);
            } catch (err) {
              console.error("❌ Push failed", err);
              alert("Failed to push files");
            }
          }}
        />
        <Divider />
        <div className="input-container">
          <TextField
            className="chat-input"
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your prompt..."
          />
          <IconButton
            className="send-button"
            onClick={handleSend}
            color="primary"
            disabled={loading}
          >
            <SendIcon />
          </IconButton>
        </div>
      </Paper>
    </div>
  );
};

export default Chat;
