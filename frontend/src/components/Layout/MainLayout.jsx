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
  Breadcrumbs,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  Stack,
  Zoom,
} from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import RouteIcon from "@mui/icons-material/Route";
import TimelineIcon from "@mui/icons-material/Timeline";
import SettingsIcon from "@mui/icons-material/Settings";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Sidebar } from "./Sidebar";
import { useAppContext } from "../../context/AppContext";

const drawerWidth = 260;

// Mapping des routes vers les noms et icônes
const routeMap = {
  "/dashboard": { label: "Tableau de bord", icon: <DashboardIcon /> },
  "/clients": { label: "Clients", icon: <PeopleIcon /> },
  "/societies": { label: "Sociétés", icon: <BusinessIcon /> },
  "/devis": { label: "Devis", icon: <DescriptionIcon /> },
  "/bdc": { label: "Bons de Commande", icon: <ReceiptIcon /> },
  "/bl": { label: "Bons de Livraison", icon: <LocalShippingIcon /> },
  "/attachments": { label: "Attachements", icon: <AttachFileIcon /> },
  "/invoices": { label: "Factures", icon: <ReceiptLongIcon /> },
  "/payments": { label: "Encaissements", icon: <PaymentsIcon /> },
  "/traceability": { label: "Traçabilité", icon: <RouteIcon /> },
  "/timeline": { label: "Timeline", icon: <TimelineIcon /> },
  "/settings": { label: "Paramètres", icon: <SettingsIcon /> },
};

export const MainLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const { notifications } = useAppContext();

  const unreadCount = notifications?.filter((n) => !n.read)?.length || 0;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  // Obtenir le nom de la page actuelle
  const currentRoute = routeMap[location.pathname];
  const pageTitle = currentRoute?.label || "Page";
  const pageIcon = currentRoute?.icon || <DashboardIcon />;

  // Construire le fil d'Ariane
  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbs = [
    { path: "/", label: "Accueil", icon: <HomeIcon sx={{ fontSize: 16 }} /> },
    ...pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join("/")}`;
      const route = routeMap[to];
      return {
        path: to,
        label: route?.label || value.charAt(0).toUpperCase() + value.slice(1),
        icon: route?.icon || null,
      };
    }),
  ];

  return (
    <Box sx={{ display: "flex", overflow: "hidden" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.24)}`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: `linear-gradient(175deg, ${alpha(theme.palette.primary.main, 0.09)} 0%, ${alpha(theme.palette.secondary?.main || "#f7e6ff86", 0.02)} 100%)`,
          color: "text.primary",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "72px !important",
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          {/* Partie gauche : Menu mobile + Breadcrumb */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { sm: "none" },
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
                flexShrink: 0,
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Breadcrumbs */}
            <Breadcrumbs
              separator={
                <NavigateNextIcon
                  sx={{ fontSize: 16, color: "text.disabled" }}
                />
              }
              sx={{
                "& .MuiBreadcrumbs-ol": {
                  flexWrap: "nowrap",
                  overflow: "hidden",
                },
                "& .MuiBreadcrumbs-li": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                overflow: "hidden",
              }}
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <Box
                    key={crumb.path}
                    component={Link}
                    to={crumb.path}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      textDecoration: "none",
                      color: isLast ? "text.primary" : "text.secondary",
                      fontWeight: isLast ? 600 : 400,
                      fontSize: "0.8rem",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        color: isLast
                          ? "text.primary"
                          : theme.palette.primary.main,
                        transform: isLast ? "none" : "translateX(2px)",
                      },
                      cursor: isLast ? "default" : "pointer",
                      "& .MuiSvgIcon-root": {
                        fontSize: 16,
                      },
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      maxWidth: "150px",
                    }}
                  >
                    {crumb.icon}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: isLast ? 600 : 600,
                        color: "inherit",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {crumb.label}
                    </Typography>
                  </Box>
                );
              })}
            </Breadcrumbs>
          </Box>

          {/* Partie droite : Notifications + Avatar */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
           
            {/* Notifications */}
            <Tooltip title="Notifications" arrow>
              <IconButton
                color="inherit"
                onClick={handleNotifOpen}
                sx={{
                  bgcolor:
                    unreadCount > 0
                      ? alpha(theme.palette.primary.main, 0.04)
                      : "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.6rem",
                      height: 18,
                      minWidth: 18,
                      padding: "0 4px",
                      background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                      boxShadow: `0 2px 10px ${alpha(theme.palette.error.main, 0.3)}`,
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Menu Notifications */}
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              TransitionComponent={Zoom}
              PaperProps={{
                sx: {
                  width: 380,
                  maxHeight: 450,
                  mt: 1.5,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography fontWeight={700} fontSize="0.95rem">
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Chip
                    label={`${unreadCount} non lues`}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: "0.6rem",
                    }}
                  />
                )}
              </Box>
              <Divider />
              {(notifications || []).slice(0, 5).map((n) => (
                <MenuItem
                  key={n.id}
                  onClick={handleNotifClose}
                  sx={{
                    whiteSpace: "normal",
                    py: 1.5,
                    px: 2,
                    borderLeft: n.read
                      ? "3px solid transparent"
                      : `3px solid ${theme.palette.primary.main}`,
                    bgcolor: n.read
                      ? "transparent"
                      : alpha(theme.palette.primary.main, 0.02),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={n.read ? 400 : 600}
                      sx={{ fontSize: "0.85rem" }}
                    >
                      {n.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.25 }}
                    >
                      {n.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block", mt: 0.5, fontSize: "0.6rem" }}
                    >
                      {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem
                onClick={handleNotifClose}
                sx={{
                  justifyContent: "center",
                  py: 1.5,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <Typography
                  variant="body2"
                  color="primary"
                  fontWeight={600}
                  sx={{ fontSize: "0.8rem" }}
                >
                  Voir toutes les notifications
                </Typography>
              </MenuItem>
            </Menu>

            {/* Avatar utilisateur */}
            <Tooltip title="Profil" arrow>
              <Avatar
                sx={{
                  ml: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  width: 38,
                  height: 38,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                A
              </Avatar>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawers */}
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

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "72px",
          bgcolor: "background.default",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
