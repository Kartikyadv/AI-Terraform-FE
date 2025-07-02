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

// 🛠️ Basic parser for Git-style patch → old/new strings
const parsePatchToDiff = (patch) => {
    console.log(patch)
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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        File Changes
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {files.map((file, idx) => {
          const { oldText, newText } = parsePatchToDiff(file.patch);
          return (
            <Box key={idx} sx={{ mb: 5 }}>
              <Typography variant="h6" gutterBottom>
                {file.filename}
                {" "}
                <Typography component="span" variant="caption" color="text.secondary">
                  ({file.status})
                </Typography>
              </Typography>
              <ReactDiffViewer
                oldValue={oldText}
                newValue={newText}
                splitView
                showDiffOnly
                hideLineNumbers={false}
                useDarkTheme={false}
              />
            </Box>
          );
        })}
      </DialogContent>
    </Dialog>
  );
};

export default DiffViewerModal;
