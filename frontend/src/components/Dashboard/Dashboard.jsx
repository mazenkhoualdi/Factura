import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EuroIcon from "@mui/icons-material/Euro";
import PaymentsIcon from "@mui/icons-material/Payments";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PendingIcon from "@mui/icons-material/Pending";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export const Dashboard = () => {
  const { clients, devis, factures, paiements } = useAppContext();

  const totalFactured = factures.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = paiements.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRemaining = totalFactured - totalPaid;

  const kpis = [
    {
      label: "Clients",
      value: clients.length,
      icon: <PeopleIcon />,
      color: "#1976d2",
    },
    {
      label: "Devis",
      value: devis.length,
      icon: <DescriptionIcon />,
      color: "#ed6c02",
    },
    {
      label: "Factures",
      value: factures.length,
      icon: <ReceiptLongIcon />,
      color: "#9c27b0",
    },
    {
      label: "Total facturé",
      value: `${totalFactured.toFixed(2)} €`,
      icon: <EuroIcon />,
      color: "#1976d2",
    },
    {
      label: "Total encaissé",
      value: `${totalPaid.toFixed(2)} €`,
      icon: <PaymentsIcon />,
      color: "#2e7d32",
    },
    {
      label: "Reste à encaisser",
      value: `${totalRemaining.toFixed(2)} €`,
      icon: <MoneyOffIcon />,
      color: "#d32f2f",
    },
    {
      label: "Dossiers en cours",
      value: devis.filter((d) => d.status === "pending").length,
      icon: <PendingIcon />,
      color: "#ed6c02",
    },
  ];

  const devisStatusData = [
    {
      name: "Acceptés",
      value: devis.filter((d) => d.status === "accepted").length,
    },
    {
      name: "En attente",
      value: devis.filter((d) => d.status === "pending").length,
    },
    {
      name: "Refusés",
      value: devis.filter((d) => d.status === "refused").length,
    },
    {
      name: "Validés",
      value: devis.filter((d) => d.status === "validated").length,
    },
  ];

  const COLORS = ["#4caf50", "#ff9800", "#f44336", "#2196f3"];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Tableau de bord
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Vue d'ensemble de votre activité commerciale
      </Typography>

      <Grid container spacing={3}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {kpi.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${kpi.color}15`,
                      color: kpi.color,
                    }}
                  >
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Répartition des devis par statut" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={devisStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {devisStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Comparaison facturé / encaissé / reste" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { name: "Facturé", value: totalFactured },
                    { name: "Encaissé", value: totalPaid },
                    { name: "Reste", value: totalRemaining },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) => `${value.toFixed(2)} €`}
                  />
                  <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
