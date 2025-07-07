import {
  Autocomplete,
  TextField,
  CircularProgress,
  Modal,
  Box,
  Typography,
  Button,
  Divider,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";

const PushToGitHubModal = ({ open, onClose, onSubmit, githubToken }) => {
  const [repoOptions, setRepoOptions] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [branch, setBranch] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [loadingRepos, setLoadingRepos] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [formTouched, setFormTouched] = useState(false); // ✅ One state to rule them all

  useEffect(() => {
    if (!open || !githubToken) return;

    const fetchRepos = async () => {
      setLoadingRepos(true);
      setFetchError("");
      try {
        const res = await axios.get("https://api.github.com/user/repos", {
          headers: {
            Authorization: `Bearer ${githubToken}`,
          },
          params: { per_page: 100, sort: "updated" },
        });

        const names = res.data.map((repo) => repo.name);
        setRepoOptions(names);
      } catch (err) {
        setFetchError("❌ Failed to fetch repositories");
      } finally {
        setLoadingRepos(false);
      }
    };

    fetchRepos();
  }, [open, githubToken]);

  const handlePush = () => {
    setFormTouched(true);
    if (!repoName.trim() || !branch.trim() || /\s/.test(branch)) return;
    onSubmit({ repoName: repoName.trim(), description, branch, visibility });
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

        {/* Repo Name Field */}
        <div className="push-form-field">
          <Typography>
            1️⃣ Repo Name <span style={{ color: "red" }}>*</span>
          </Typography>
          <Autocomplete
            freeSolo
            options={repoOptions}
            loading={loadingRepos}
            value={repoName}
            onInputChange={(e, newValue) => setRepoName(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select or type new repo name"
                size="small"
                fullWidth
                error={formTouched && !repoName}
                helperText={
                  fetchError
                    ? fetchError
                    : formTouched && !repoName
                    ? "Repository name is required"
                    : ""
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingRepos ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>

        {/* Description */}
        <div className="push-form-field">
          <Typography>2️⃣ Description</Typography>
          <TextField
            fullWidth
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Branch Field */}
        <div className="push-form-field">
          <Typography>
            3️⃣ Branch <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            error={formTouched && (!branch || /\s/.test(branch))}
            helperText={
              formTouched &&
              (!branch
                ? "Branch name is required"
                : /\s/.test(branch)
                ? "No spaces allowed in branch name"
                : "")
            }
          />
        </div>

        {/* Visibility */}
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

        {/* Actions */}
        <div className="push-modal-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePush}
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
