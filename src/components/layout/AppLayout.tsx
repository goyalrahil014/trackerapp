import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { Modal } from '../ui/Modal';
import { HabitForm } from '../habits/HabitForm';
import { useHabits } from '../../hooks/useHabits';
import type { HabitFormData } from '../../types/habit';
import { useAuth } from '../../context/AuthContext';
import { Database } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultHabitType, setDefaultHabitType] = useState<'good' | 'bad'>('good');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addHabit } = useHabits();
  const { isCloudConnected } = useAuth();

  const handleOpenAddModal = (type: 'good' | 'bad' = 'good') => {
    setDefaultHabitType(type);
    setIsAddModalOpen(true);
  };

  const handleCreateHabit = async (data: HabitFormData) => {
    try {
      setIsSubmitting(true);
      await addHabit(data);
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row antialiased transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar onOpenAddModal={() => handleOpenAddModal('good')} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header />

        {/* Demo Mode / Cloud Setup Banner if Supabase is unconfigured */}
        {!isCloudConnected && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Data is currently saved to your browser's localStorage. To connect to Supabase PostgreSQL & Auth with RLS, add your credentials in <code>.env</code>.
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{ onOpenAddModal: handleOpenAddModal }} />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav onOpenAddModal={() => handleOpenAddModal('good')} />
      </div>

      {/* Global Add Habit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Habit"
        description="Build consistency one day at a time."
      >
        <HabitForm
          initialData={{ type: defaultHabitType }}
          onSubmit={handleCreateHabit}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};
