import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
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

const menuItems = [
  { path: "/dashboard", label: "Tableau de bord", icon: <DashboardIcon /> },
  { path: "/clients", label: "Clients", icon: <PeopleIcon /> },
  { path: "/societies", label: "Sociétés", icon: <BusinessIcon /> },
  { path: "/devis", label: "Devis", icon: <DescriptionIcon /> },
  { path: "/bdc", label: "Bons de Commande", icon: <ReceiptIcon /> },
  { path: "/bl", label: "Bons de Livraison", icon: <LocalShippingIcon /> },
  { path: "/attachments", label: "Attachements", icon: <AttachFileIcon /> },
  { path: "/invoices", label: "Factures", icon: <ReceiptLongIcon /> },
  { path: "/payments", label: "Encaissements", icon: <PaymentsIcon /> },
  { path: "/traceability", label: "Traçabilité", icon: <RouteIcon /> },
  { path: "/timeline", label: "Timeline", icon: <TimelineIcon /> },
  { path: "/settings", label: "Paramètres", icon: <SettingsIcon /> },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          📊 Factura
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                "& .MuiListItemIcon-root": { color: "white" },
              },
              borderRadius: 2,
              mx: 1,
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};
