import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Sidebar } from "./Sidebar";
import { useAppContext } from "../../context/AppContext";

const drawerWidth = 280;

export const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const { notifications } = useAppContext();

  const unreadCount = notifications?.filter((n) => !n.read)?.length || 0;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Factura
          </Typography>
          <IconButton color="inherit" onClick={handleNotifOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ sx: { width: 360, maxHeight: 400 } }}
          >
            <Box
              sx={{ p: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Typography fontWeight={600}>Notifications</Typography>
            </Box>
            <Divider />
            {(notifications || []).slice(0, 5).map((n) => (
              <MenuItem
                key={n.id}
                onClick={handleNotifClose}
                sx={{ whiteSpace: "normal", py: 1.5 }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={n.read ? 400 : 600}>
                    {n.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {n.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {new Date(n.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            <Divider />
            <MenuItem
              onClick={handleNotifClose}
              sx={{ justifyContent: "center" }}
            >
              <Typography variant="body2" color="primary">
                Voir toutes les notifications
              </Typography>
            </MenuItem>
          </Menu>
          <Avatar sx={{ ml: 2, bgcolor: "primary.main" }}>A</Avatar>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <Sidebar />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
