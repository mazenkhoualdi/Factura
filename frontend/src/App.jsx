import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';  // <-- IMPORT ESSENTIEL
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ClientsList } from './components/Clients/ClientsList';
import { SocietiesList } from './components/Societies/SocietiesList';
import { DevisList } from './components/Devis/DevisList';
import { BdcList } from './components/BDC/BdcList';
import { BlList } from './components/BL/BlList';
import { AttachmentsList } from './components/Attachments/AttachmentsList';
import { InvoicesList } from './components/Invoices/InvoicesList';
import { PaymentsList } from './components/Payments/PaymentsList';
import { Traceability } from './components/Traceability/Traceability';
import { Timeline } from './components/Timeline/Timeline';

// Ce composant utilise Typography, qui est maintenant importé
const SettingsPage = () => <Typography variant="h4">Paramètres - à venir</Typography>;

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