import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { ClientsList } from "./components/Clients/ClientsList";
import { Traceability } from "./components/Traceability/Traceability";
import { Timeline } from "./components/Timeline/Timeline";

// Pages simplifiées pour les autres modules
const DevisList = () => <Typography variant="h4">Devis - à venir</Typography>;
const BdcList = () => <Typography variant="h4">BDC - à venir</Typography>;
const BlList = () => <Typography variant="h4">BL - à venir</Typography>;
const AttachmentsList = () => (
  <Typography variant="h4">Attachements - à venir</Typography>
);
const InvoicesList = () => (
  <Typography variant="h4">Factures - à venir</Typography>
);
const PaymentsList = () => (
  <Typography variant="h4">Encaissements - à venir</Typography>
);
const SettingsPage = () => (
  <Typography variant="h4">Paramètres - à venir</Typography>
);
const SocietiesList = () => (
  <Typography variant="h4">Sociétés - à venir</Typography>
);

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/societies" element={<SocietiesList />} />
          <Route path="/devis" element={<DevisList />} />
          <Route path="/bdc" element={<BdcList />} />
          <Route path="/bl" element={<BlList />} />
          <Route path="/attachments" element={<AttachmentsList />} />
          <Route path="/invoices" element={<InvoicesList />} />
          <Route path="/payments" element={<PaymentsList />} />
          <Route path="/traceability" element={<Traceability />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
