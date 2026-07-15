import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { SettingsPage } from './components/Settings/SettingsPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ClientsList } from './components/Clients/ClientsList';
import { SocietiesList } from './components/Societies/SocietiesList';
import { DevisList } from './components/Devis/DevisList';
import { BdcList } from './components/BDC/BdcList';
import { BlList } from './components/BL/BlList';
import { AttachmentsList } from './components/Attachments/AttachmentsList';
import { InvoicesList } from './components/Invoices/InvoicesList';
import { DevisAchatList } from './components/DevisAchat/DevisAchatList';
import { FactureAchatList } from './components/FactureAchat/FactureAchatList';
import { PaymentsList } from './components/Payments/PaymentsList';
import { Traceability } from './components/Traceability/Traceability';
import { Timeline } from './components/Timeline/Timeline';

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
                    <Route path="/devis-achats" element={<DevisAchatList />} />
                    <Route path="/factures-achats" element={<FactureAchatList />} />
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