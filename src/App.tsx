/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RepositoryPage } from './pages/RepositoryPage';
import { TeachersPage } from './pages/TeachersPage';
import { PaPage } from './pages/PaPage';
import { PaCommitteePage } from './pages/PaCommitteePage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { NewsPage } from './pages/NewsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ExamLibraryPage } from './pages/ExamLibraryPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { TeacherDetailModal } from './components/TeacherDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { CommitteeLoginModal } from './components/CommitteeLoginModal';
import { AILessonPlannerModal } from './components/AILessonPlannerModal';
import { TeacherQAChatModal } from './components/TeacherQAChatModal';
import { FloatingTeacherAIBtn } from './components/FloatingTeacherAIBtn';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { MobileBottomNav } from './components/MobileBottomNav';

function MainContent() {
  const { activeTab, setActiveTab, setIsAIPlannerOpen, setIsAIChatOpen } = useApp();

  // Handle PWA shortcuts and URL query parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const tab = params.get('tab');

      if (action === 'ai-planner') {
        setIsAIPlannerOpen(true);
      } else if (action === 'ai-chat' || action === 'ai-qa') {
        setIsAIChatOpen(true);
      }
      if (tab && ['home', 'repository', 'exam-library', 'teachers', 'pa', 'pa-committee', 'subjects', 'news', 'documents', 'about', 'contact'].includes(tab)) {
        setActiveTab(tab as any);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [setActiveTab, setIsAIPlannerOpen, setIsAIChatOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-16 lg:pb-0">
      <Header />
      
      <main className="flex-1">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'repository' && <RepositoryPage />}
        {activeTab === 'exam-library' && <ExamLibraryPage />}
        {activeTab === 'teachers' && <TeachersPage />}
        {activeTab === 'pa' && <PaPage />}
        {activeTab === 'pa-committee' && <PaCommitteePage />}
        {activeTab === 'teacher-dashboard' && <TeacherDashboardPage />}
        {activeTab === 'subjects' && <SubjectsPage />}
        {activeTab === 'news' && <NewsPage />}
        {activeTab === 'documents' && <DocumentsPage />}
        {activeTab === 'about' && <AboutPage />}
        {activeTab === 'contact' && <ContactPage />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Persistent Modals */}
      <ResourceDetailModal />
      <TeacherDetailModal />
      <AdminLoginModal />
      <TeacherLoginModal />
      <TeacherProfileModal />
      <CommitteeLoginModal />
      <AILessonPlannerModal />
      <TeacherQAChatModal />
      <PWAInstallModal />

      {/* Floating Teacher AI Assistant & Mobile PWA Smart Banner */}
      <FloatingTeacherAIBtn />
      <PWAInstallBanner />

      {/* Native Mobile Bottom Dock for iOS & Android */}
      <MobileBottomNav />

      {activeTab !== 'admin' && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
