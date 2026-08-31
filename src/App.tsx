import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { LoginLockScreen } from './components/LoginLockScreen';
import { Navbar } from './components/Navbar';
import { Sidebar, ScreenTab } from './components/Sidebar';
import { Footer } from './components/Footer';
import { HoyScreen } from './components/screens/HoyScreen';
import { PipelineScreen } from './components/screens/PipelineScreen';
import { IAScreen } from './components/screens/IAScreen';
import { ReportesScreen } from './components/screens/ReportesScreen';
import { ComisionesScreen } from './components/screens/ComisionesScreen';
import { RecursosGlosarioScreen } from './components/screens/RecursosGlosarioScreen';
import { ConfiguracionScreen } from './components/screens/ConfiguracionScreen';
import { QuickLogModal } from './components/modals/QuickLogModal';
import { Lead } from './types';

function MainApp() {
  const { isAuthenticated } = useCRM();
  const [activeTab, setActiveTab] = useState<ScreenTab>('hoy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [iaTargetLead, setIaTargetLead] = useState<Lead | null>(null);
  const [quickLogModalOpen, setQuickLogModalOpen] = useState(false);

  // OBLIGATORY SECURITY GATEWAY:
  // If there is no valid session validated against the authorized email,
  // ONLY render LoginLockScreen. No workspace view, sidebar, modal, or navbar is accessible.
  if (!isAuthenticated) {
    return <LoginLockScreen />;
  }

  const handleSelectLead = (lead: Lead | null) => {
    setSelectedLead(lead);
    if (lead) {
      setActiveTab('pipeline');
    }
  };

  const handleNavigateToIA = (lead?: Lead) => {
    if (lead) {
      setIaTargetLead(lead);
    }
    setActiveTab('ia');
  };

  const handleOpenNewLeadModal = () => {
    setActiveTab('pipeline');
    // Scroll and trigger modal
    setTimeout(() => {
      const btn = document.getElementById('btn-create-lead-pipeline');
      if (btn) btn.click();
    }, 100);
  };

  return (
    <div id="app-root" className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased font-sans transition-colors">
      {/* Navbar Header */}
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Workspace Layout (Sidebar + Screen Content) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main id="main-content" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {activeTab === 'hoy' && (
            <HoyScreen
              onSelectLead={handleSelectLead}
              onNavigateToIA={handleNavigateToIA}
              onOpenNewLeadModal={handleOpenNewLeadModal}
              onOpenQuickLogModal={() => setQuickLogModalOpen(true)}
            />
          )}

          {activeTab === 'pipeline' && (
            <PipelineScreen
              selectedLeadId={selectedLead?.id || null}
              onSelectLead={setSelectedLead}
              onNavigateToIA={handleNavigateToIA}
            />
          )}

          {activeTab === 'ia' && (
            <IAScreen initialLead={iaTargetLead || selectedLead} />
          )}

          {activeTab === 'reportes' && <ReportesScreen />}

          {activeTab === 'comisiones' && (
            <ComisionesScreen onSelectLead={handleSelectLead} />
          )}

          {activeTab === 'recursos' && <RecursosGlosarioScreen />}

          {activeTab === 'configuracion' && <ConfiguracionScreen />}
        </main>
      </div>

      {/* Quick Activity Logging Modal */}
      <QuickLogModal
        isOpen={quickLogModalOpen}
        onClose={() => setQuickLogModalOpen(false)}
      />

      {/* Minimalist Required Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <MainApp />
    </CRMProvider>
  );
}
