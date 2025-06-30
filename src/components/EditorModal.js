import React, { useState, useEffect } from "react";
import { Modal, Box, List, ListItem, Typography, Button, Divider, TextareaAutosize } from "@mui/material";

const EditorModal = ({ open, onClose, files, onSave }) => {
  const fileKeys = files ? Object.keys(files) : [];
  const [selectedFile, setSelectedFile] = useState(fileKeys[0] || "");
  const [fileContents, setFileContents] = useState(files || {});

  // Update when new files are passed in
  useEffect(() => {
    if (files && Object.keys(files).length > 0) {
      setSelectedFile(Object.keys(files)[0]);
      setFileContents({ ...files });
    }
  }, [files]);

  const handleFileChange = (filename, value) => {
    setFileContents((prev) => ({ ...prev, [filename]: value }));
  };

  const handlePush = () => {
    onSave(fileContents);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="editor-modal">
        {fileKeys.length === 0 ? (
          <Typography className="editor-empty">No files to show.</Typography>
        ) : (
          <>
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
              <Typography variant="subtitle1" className="editor-filename">{selectedFile}</Typography>
              <TextareaAutosize
                className="editor-textarea"
                minRows={20}
                value={fileContents[selectedFile] || ""}
                onChange={(e) => handleFileChange(selectedFile, e.target.value)}
              />
              <Box className="editor-actions">
                <Button variant="contained" onClick={handlePush}>Push to GitHub →</Button>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default EditorModal;
