import React from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { useAppContext } from "../../context/AppContext";

export const KPIs = () => {
  const { clients, devis, factures, paiements } = useAppContext();

  const totalFactured = factures.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = paiements.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRemaining = totalFactured - totalPaid;

  const kpis = [
    { label: "Clients", value: clients.length, color: "#1976d2" },
    { label: "Devis", value: devis.length, color: "#ed6c02" },
    { label: "Factures", value: factures.length, color: "#9c27b0" },
    {
      label: "Total facturé",
      value: `${totalFactured.toFixed(2)} €`,
      color: "#1976d2",
    },
    {
      label: "Total encaissé",
      value: `${totalPaid.toFixed(2)} €`,
      color: "#2e7d32",
    },
    {
      label: "Reste à encaisser",
      value: `${totalRemaining.toFixed(2)} €`,
      color: "#d32f2f",
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={2} key={index}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                {kpi.label}
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: kpi.color }}
              >
                {kpi.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
