import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Box,
  List,
  ListItem,
  Typography,
  Button,
  Divider,
  TextareaAutosize,
} from "@mui/material";
import debounce from "lodash.debounce";
import { initDB, updateFilesInMessage } from "../config/chatDB";
import DiffViewerModal from "./DiffViewerModal";
import PushToGitHubModal from "./PushToGitHubModal";

const EditorModal = ({ open, onClose, files, onSave }) => {
  const fileKeys = files ? Object.keys(files) : [];
  const [selectedFile, setSelectedFile] = useState(fileKeys[0] || "");
  const [fileContents, setFileContents] = useState(files || {});
  const [saving, setSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [lastPushedFiles, setLastPushedFiles] = useState([]);
  const [viewChangesEnabled, setViewChangesEnabled] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);

  useEffect(() => {
    const syncFilesFromDB = async () => {
      if (open) {
        const db = await initDB();
        const allMsgs = await db.getAll("messages");
        const latest = [...allMsgs]
          .reverse()
          .find((m) => m.sender === "assistant" && m.files);
        if (latest?.files) {
          setSelectedFile(Object.keys(latest.files)[0]);
          setFileContents({ ...latest.files });
        }
      }
    };

    syncFilesFromDB();
  }, [open]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (newFiles) => {
      setSaving(true);
      console.log(newFiles);
      await updateFilesInMessage(newFiles);
      setSaving(false);
    }, 1000),
    []
  );

  const handleFileChange = (filename, value) => {
    const newContents = { ...fileContents, [filename]: value };
    setFileContents(newContents);

    setSaving(true);

    if (saveTimeout) clearTimeout(saveTimeout);

    const timeout = setTimeout(() => {
      setSaving(false);
    }, 1200);

    setSaveTimeout(timeout);

    debouncedSave(newContents);
  };

  const handlePush = async (gitDetails) => {
    try {
      const res = await onSave(fileContents, gitDetails);
      setLastPushedFiles(res);
      setViewChangesEnabled(true);
      setTimeout(() => setShowDiff(true), 200);
    } catch (err) {
      console.error("❌ Push failed", err);
    }
  };



  return (
    <>
    <Modal open={open} onClose={onClose}>
      <Box className="editor-modal">
        <Box className="editor-topbar">
          <Typography className="editor-title">Editor</Typography>
          <Typography className="editor-saving">
            {saving ? "Saving changes..." : "All changes saved"}
          </Typography>
        </Box>

        {fileKeys.length === 0 ? (
          <Typography className="editor-empty">No files to show.</Typography>
        ) : (
          <Box className="editor-body">
            <Box className="editor-sidebar">
              <Typography className="editor-title">Terraform Files</Typography>
              <Divider />
              <List>
                {fileKeys.map((file) => (
                  <ListItem
                    key={file}
                    button
                    selected={selectedFile === file}
                    onClick={() => setSelectedFile(file)}
                    className="editor-file-item"
                  >
                    {file}
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box className="editor-content">
              <Typography variant="subtitle1" className="editor-filename">
                {selectedFile}
              </Typography>
              <TextareaAutosize
                className="editor-textarea"
                minRows={20}
                value={fileContents[selectedFile] || ""}
                onChange={(e) => handleFileChange(selectedFile, e.target.value)}
              />
              <Box className="editor-actions">
                <Button
                    variant="outlined"
                    onClick={() => setShowDiff(true)}
                    disabled={!viewChangesEnabled}
                  >
                    View Changes
                  </Button>
                <Button variant="contained" onClick={() => setShowPushModal(true)}>
                  Push to GitHub →
                </Button>
                <Button variant="outlined" onClick={onClose}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
    <DiffViewerModal
      open={showDiff}
      onClose={() => setShowDiff(false)}
      files={lastPushedFiles}
    />
    <PushToGitHubModal
      open={showPushModal}
      onClose={() => setShowPushModal(false)}
      onSubmit={(gitDetails) => {
        setShowPushModal(false);
        handlePush(gitDetails);
      }}
    />

    </>
  );
};

export default EditorModal;
