import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Divider,
} from "@mui/material";

const PushToGitHubModal = ({ open, onClose, onSubmit }) => {
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [branch, setBranch] = useState("");
  const [visibility, setVisibility] = useState("public");

  const handlePush = () => {
    if (!repoName || !branch)
      return alert("Repo name and branch are required.");
    onSubmit({ repoName, description, branch, visibility });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{ className: "modal-blur-backdrop" }}
    >
      <Box className="push-modal">
        <Typography variant="h6" className="push-modal-title">
          Push To Github
        </Typography>
        <Typography className="push-modal-subtext">
          Provide the required github details to push the code.
        </Typography>

        <Divider className="push-modal-divider" />

        <div className="push-form-field">
          <Typography>1️⃣ Repo Name</Typography>
          <TextField
            fullWidth
            size="small"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            error={!repoName}
            helperText={!repoName ? "Repo name is required" : ""}
          />
        </div>

        <div className="push-form-field">
          <Typography>2️⃣ Description</Typography>
          <TextField
            fullWidth
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="push-form-field">
          <Typography>3️⃣ Branch</Typography>
          <TextField
            fullWidth
            size="small"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            error={!branch || /\s/.test(branch)}
            helperText={
              !branch
                ? "Branch name is required"
                : /\s/.test(branch)
                ? "No spaces allowed in branch name"
                : ""
            }
          />
        </div>

        <div className="push-form-field">
          <Typography>4️⃣ Visibility</Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </TextField>
        </div>

        <div className="push-modal-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!repoName || !branch || /\s/.test(branch)) return;
              onSubmit({ repoName, description, branch, visibility });
              onClose();
            }}
            disabled={!repoName || !branch || /\s/.test(branch)}
          >
            Push
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default PushToGitHubModal;
