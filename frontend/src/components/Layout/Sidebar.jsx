import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  useTheme,
  alpha,
  Collapse,
  Tooltip,
  Stack,
  Divider,
  Paper,
  Fade,
  Zoom,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
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
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import WindowIcon from "@mui/icons-material/Window";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

const menuItems = [
  {
    path: "/dashboard",
    label: "Tableau de bord",
    icon: <DashboardIcon />,
  },
  {
    path: "/clients",
    label: "Clients",
    icon: <PeopleIcon />,
  },
  {
    path: "/societies",
    label: "Sociétés",
    icon: <BusinessIcon />,
  },
  {
    path: "/devis",
    label: "Devis",
    icon: <DescriptionIcon />,
  },
  {
    path: "/bdc",
    label: "Bons de Commande",
    icon: <ReceiptIcon />,
  },
  {
    path: "/bl",
    label: "Bons de Livraison",
    icon: <LocalShippingIcon />,
  },
  {
    path: "/attachments",
    label: "Attachements",
    icon: <AttachFileIcon />,
  },
  {
    path: "/invoices",
    label: "Factures",
    icon: <ReceiptLongIcon />,
  },
  {
    path: "/payments",
    label: "Encaissements",
    icon: <PaymentsIcon />,
  },
  {
    path: "/traceability",
    label: "Traçabilité",
    icon: <RouteIcon />,
  },
  {
    path: "/timeline",
    label: "Timeline",
    icon: <TimelineIcon />,
  },
  {
    path: "/settings",
    label: "Paramètres",
    icon: <SettingsIcon />,
  },
];

// Groupes avec icônes modernes
const menuGroups = [
  {
    title: "Vue d'ensemble",
    icon: <WindowIcon sx={{ fontSize: 18 }} />,
    items: menuItems.filter((item) => ["/dashboard"].includes(item.path)),
  },
  {
    title: "Relations clients",
    icon: <PeopleIcon sx={{ fontSize: 18 }} />,
    items: menuItems.filter((item) =>
      ["/clients", "/societies"].includes(item.path),
    ),
  },
  {
    title: "Documents",
    icon: <AssignmentIcon sx={{ fontSize: 18 }} />,
    items: menuItems.filter((item) =>
      ["/devis", "/bdc", "/bl", "/attachments", "/invoices"].includes(
        item.path,
      ),
    ),
  },
  {
    title: "Finances",
    icon: <AccountBalanceIcon sx={{ fontSize: 18 }} />,
    items: menuItems.filter((item) => ["/payments"].includes(item.path)),
  },
  {
    title: "Suivi & Analyse",
    icon: <TrackChangesIcon sx={{ fontSize: 18 }} />,
    items: menuItems.filter((item) =>
      ["/traceability", "/timeline"].includes(item.path),
    ),
  },
  {
    title: "Configuration",
    icon: <SettingsIcon sx={{ fontSize: 18 }} />,
    items: menuItems.filter((item) => ["/settings"].includes(item.path)),
  },
];

export const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initialExpanded = {};
    menuGroups.forEach((group) => {
      const hasActiveItem = group.items.some(
        (item) => item.path === location.pathname,
      );
      initialExpanded[group.title] = hasActiveItem;
    });
    // Par défaut tout ouvert pour une meilleure UX
    menuGroups.forEach((group) => {
      if (group.items.length > 0 && !initialExpanded[group.title]) {
        initialExpanded[group.title] = true;
      }
    });
    return initialExpanded;
  });

  const handleGroupToggle = (groupTitle) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        width: 279,
        minWidth: 279,
        maxWidth: 280,
        bgcolor: "background.paper",
        color: "text.primary",
        position: "sticky",
        top: 0,
        overflowY: "hidden", // Pas de scroll vertical sur le Paper
        overflowX: "hidden", // PAS DE SCROLL HORIZONTAL
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: `4px 0 20px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
        "& a": {
          textDecoration: "none",
          color: "inherit",
        },
      }}
    >
      {/* Logo Premium */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary?.main || "#8b5cf6", 0.02)} 100%)`,
          flexShrink: 0,
          overflowX: "hidden", // PAS DE SCROLL HORIZONTAL
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || "#8b5cf6"} 100%)`,
              color: "white",
              fontWeight: 800,
              fontSize: 24,
              boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05) rotate(-5deg)",
                boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            F
          </Avatar>
          <Box
            sx={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "success.main",
              border: `2px solid ${theme.palette.background.paper}`,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.5 },
                "100%": { opacity: 1 },
              },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 0, overflowX: "hidden" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
              lineHeight: 1.5,
              whiteSpace: "nowrap",
            }}
          >
            Factura
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              lineHeight: 1,
              fontSize: "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
            }}
          >
            Gestion commerciale
          </Typography>
        </Box>
      </Box>

      {/* Navigation principale - SEULEMENT SCROLL VERTICAL */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto", // SEULEMENT scroll vertical
          overflowX: "hidden", // PAS DE SCROLL HORIZONTAL
          px: 2,
          py: 1,
          "&::-webkit-scrollbar": {
            width: "3px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.4),
          },
        }}
      >
        {menuGroups.map((group) => {
          if (group.items.length === 0) return null;

          const isGroupExpanded = expandedGroups[group.title] ?? true;

          return (
            <Box key={group.title} sx={{ mb: 1, overflowX: "hidden" }}>
              {/* En-tête du groupe */}
              <Box
                onClick={() => handleGroupToggle(group.title)}
                onMouseEnter={() => setHoveredItem(group.title)}
                onMouseLeave={() => setHoveredItem(null)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
                  py: 1,
                  cursor: "pointer",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  overflowX: "hidden",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    transform: "translateX(4px)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                    overflowX: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      color: "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {group.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      fontSize: "0.6rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {group.title}
                  </Typography>
                </Box>
                <Fade in={hoveredItem === group.title} timeout={200}>
                  <Box sx={{ flexShrink: 0 }}>
                    {isGroupExpanded ? (
                      <ExpandLess
                        sx={{ fontSize: 16, color: "text.disabled" }}
                      />
                    ) : (
                      <ExpandMore
                        sx={{ fontSize: 16, color: "text.disabled" }}
                      />
                    )}
                  </Box>
                </Fade>
              </Box>

              {/* Éléments du groupe */}
              <Collapse in={isGroupExpanded} timeout={300}>
                <List sx={{ py: 0.5, pl: 1, overflowX: "hidden" }}>
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Zoom
                        in
                        key={item.path}
                        style={{ transitionDelay: "50ms" }}
                      >
                        <ListItem
                          component={Link}
                          to={item.path}
                          selected={active}
                          onMouseEnter={() => setHoveredItem(item.path)}
                          onMouseLeave={() => setHoveredItem(null)}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            px: 1.5,
                            py: 0.75,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            color: "text.primary",
                            overflowX: "hidden",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              transform: "translateX(8px)",
                              "& .MuiListItemIcon-root": {
                                transform: "scale(1.1)",
                              },
                            },
                            "&.Mui-selected": {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              borderRight: `3px solid ${theme.palette.primary.main}`,
                              "& .MuiListItemIcon-root": {
                                color: theme.palette.primary.main,
                              },
                              "& .MuiListItemText-primary": {
                                color: theme.palette.text.primary,
                                fontWeight: 600,
                              },
                              "&::before": {
                                display: "none",
                              },
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.12,
                                ),
                              },
                            },
                          }}
                        >
                          <Tooltip title={item.label} placement="right" arrow>
                            <ListItemIcon
                              sx={{
                                minWidth: 36,
                                color: active
                                  ? theme.palette.primary.main
                                  : "text.secondary",
                                transition: "all 0.3s ease",
                                position: "relative",
                                flexShrink: 0,
                              }}
                            >
                              {item.icon}
                            </ListItemIcon>
                          </Tooltip>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              variant: "body2",
                              sx: {
                                fontSize: "0.8rem",
                                fontWeight: active ? 600 : 400,
                                color: active
                                  ? theme.palette.text.primary
                                  : "text.secondary",
                                transition: "color 0.3s ease",
                                whiteSpace: "nowrap",
                              },
                            }}
                            sx={{
                              minWidth: 0,
                            }}
                          />
                          {active && (
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: theme.palette.primary.main,
                                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                                animation: "pulse 2s infinite",
                                flexShrink: 0,
                                ml: 1,
                              }}
                            />
                          )}
                        </ListItem>
                      </Zoom>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* Pied de page */}
      <Box
        sx={{
          p: 2.5,
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          textAlign: "center",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary?.main || "#8b5cf6", 0.02)} 100%)`,
          position: "relative",
          flexShrink: 0,
          overflowX: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -1,
            left: "20%",
            right: "20%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.15)}, transparent)`,
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.7rem",
            color: "text.secondary",
            letterSpacing: "0.5px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            "& span": {
              transition: "all 0.3s ease",
            },
            "&:hover span": {
              color: theme.palette.primary.main,
            },
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: "primary.main",
                opacity: 0.3,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": { opacity: 0.3 },
                  "50%": { opacity: 0.8 },
                  "100%": { opacity: 0.3 },
                },
              }}
            />
            <Box
              component="span"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Factura
            </Box>
            <Box
              component="span"
              sx={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                bgcolor: "text.disabled",
                opacity: 0.5,
              }}
            />
            <Box component="span">© {new Date().getFullYear()}</Box>
            <Box
              component="span"
              sx={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                bgcolor: "text.disabled",
                opacity: 0.5,
              }}
            />
            <Box component="span" sx={{ fontWeight: 400 }}>
              Tous droits réservés
            </Box>
          </Box>
        </Typography>
      </Box>
    </Paper>
  );
};
