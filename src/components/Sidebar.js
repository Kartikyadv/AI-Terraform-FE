import React from "react";
import { List, ListItem, ListItemIcon, ListItemText, Button, Divider } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="new-chat-btn"
          fullWidth
        >
          New Chat
        </Button>
      </div>

      <Divider className="sidebar-divider" />

      <List className="chat-list-sidebar">
        {["Chat with AWS", "Chat with GCP", "Chat with Azure"].map((text, index) => (
          <ListItem button key={index} className="sidebar-chat-item">
            <ListItemIcon>
              <ChatIcon />
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;
