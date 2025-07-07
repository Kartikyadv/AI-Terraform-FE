import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReactDiffViewer from "react-diff-viewer-continued";
import axios from "axios"; // ⬅️ Add this at the top if not already

// 🛠️ Basic parser for Git-style patch → old/new strings
const parsePatchToDiff = (patch) => {
  if (!patch) return { oldText: "", newText: "" };

  const lines = patch.split("\n");
  const oldLines = [];
  const newLines = [];

  for (let line of lines) {
    if (line.startsWith("+") && !line.startsWith("++")) {
      newLines.push(line.slice(1));
    } else if (line.startsWith("-") && !line.startsWith("--")) {
      oldLines.push(line.slice(1));
    } else if (!line.startsWith("@@")) {
      oldLines.push(line);
      newLines.push(line);
    }
  }

  return {
    oldText: oldLines.join("\n"),
    newText: newLines.join("\n"),
  };
};

const DiffViewerModal = ({ open, onClose, files = [] }) => {
  const handleMergePR = async () => {
    try {
      const meta = files?.[0];
      if (!meta) return alert("Missing PR metadata");

      await axios.post("https://n8n.cloudsanalytics.ai/webhook/merge-pr", {
        owner: meta.owner,
        repo: meta.repo,
        branch: meta.head,
        branch: meta.head,
        pr_number: meta.pr_number,
        github_token: localStorage.getItem("github_token"),
        approved: true
      });
      
      alert("✅ PR merged successfully!");
    } catch (err) {
      console.error("❌ Merge failed:", err);
      alert("Failed to merge PR");
    }
  };
  
  const handleClosePR = async () => {
    try {
      const meta = files?.[0];
      if (!meta) return alert("Missing PR metadata");
      
      await axios.post("https://n8n.cloudsanalytics.ai/webhook/merge-pr", {
        owner: meta.owner,
        repo: meta.repo,
        branch: meta.head,
        pr_number: meta.pr_number,
        github_token: localStorage.getItem("github_token"),
        approved: false
      });

      alert("❎ PR closed.");
    } catch (err) {
      console.error("❌ Close failed:", err);
      alert("Failed to close PR");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box className="diff-header-bar">
          <Typography variant="h6" className="diff-title">
            File Changes
          </Typography>
          <Box className="diff-action-buttons">
            <button className="diff-btn danger" onClick={handleClosePR}>
              Close PR
            </button>
            <button className="diff-btn primary" onClick={handleMergePR}>
              Merge PR
            </button>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {files.map((file, idx) => {
          const { oldText, newText } = parsePatchToDiff(file.patch);
          return (
            <Box key={idx} className="diff-file-block">
              <Box className="diff-file-header">
                <Typography component="span" className="filename">
                  {file.filename}
                </Typography>
                <Typography component="span" className="status">
                  ({file.status})
                </Typography>
              </Box>
              <Box className="diff-content">
                <ReactDiffViewer
                  oldValue={oldText}
                  newValue={newText}
                  splitView={false}
                  showDiffOnly
                  hideLineNumbers={false}
                  useDarkTheme={false}
                />
              </Box>
            </Box>
          );
        })}
      </DialogContent>
    </Dialog>
  );
};

export default DiffViewerModal;
