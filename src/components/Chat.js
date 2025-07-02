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
  // 🔄 State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editableFiles, setEditableFiles] = useState(null);
  const messagesEndRef = useRef(null);

  // 🔁 Scroll on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🗂 Load chat history on mount
  useEffect(() => {
    (async () => {
      const stored = await loadMessages();
      setMessages(stored || []);
    })();
  }, []);

  // 💾 Save messages to IndexedDB
  useEffect(() => {
    if (messages.length) saveMessages(messages);
  }, [messages]);

  // ⬇ Scroll to latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🚀 Send user prompt and receive files/response
  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    const github_token = localStorage.getItem("github_token");
    if (!github_token) return alert("Please login with GitHub first.");

    const userMessage = { text: prompt, sender: "user" };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const message_history = updatedMessages.map(({ sender, text }) => ({
      role: sender,
      content: text,
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
        setMessages((prev) => [...prev, {
          text: resPayload.last_question,
          sender: "assistant",
        }]);
      } else if (resPayload?.files) {
        setMessages((prev) => [...prev, {
          text: "Here are your Terraform files",
          sender: "assistant",
          files: resPayload.files,
        }]);
      } else {
        setMessages((prev) => [...prev, {
          text: "⚠️ Unexpected response.",
          sender: "assistant",
        }]);
      }
    } catch (error) {
      console.error("❌ Error submitting prompt:", error);
      setMessages((prev) => [...prev, {
        text: "❌ Failed to get response from server.",
        sender: "assistant",
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ Enter key support
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveFiles = async (updatedFiles) => {
    const github_token = localStorage.getItem("github_token");
    try {
      const res = await axios.post("http://localhost:5678/webhook-test/github-push", {
        github_token,
        repo: "demo4",
        branch: "demobranch",
        edited_files: updatedFiles,
      });
      alert("✅ Files pushed to GitHub");
      setEditableFiles(null);
      return res.data; // 🔥 return pushed file diff metadata
    } catch (err) {
      console.error("❌ Push failed", err);
      alert("Failed to push files");
      return []; // fallback return to prevent crash
    }
  };


  // 🧱 UI
  return (
    <div className="app">
      <Paper className="chat-container" elevation={3}>
        <div className="chat-list">
          {messages.map((msg, idx) => (
            <div key={idx} className="message-row-wrapper">
              {msg.text && !msg.files && (
                <div className={`message-row ${msg.sender}`}>
                  <div className={`message-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
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

        <EditorModal
          open={!!editableFiles}
          files={editableFiles}
          onClose={() => setEditableFiles(null)}
          onSave={handleSaveFiles}
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
