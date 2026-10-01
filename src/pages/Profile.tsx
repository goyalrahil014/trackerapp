import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../hooks/useHabits';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { HabitForm } from '../components/habits/HabitForm';
import type { HabitFormData, HabitWithStats, Habit } from '../types/habit';
import { renderHabitIcon } from '../lib/icons';
import { fetchArchivedHabits } from '../lib/habits';
import {
  Moon,
  Sun,
  Laptop,
  LogOut,
  Pencil,
  Trash2,
  RotateCcw,
  Archive,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Profile: React.FC = () => {
  const { user, profile, signOut, updateProfileName, isCloudConnected } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { habits, updateHabit, archiveHabit, restoreHabit } = useHabits();

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Habit Edit Modal State
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null);
  const [isUpdatingHabit, setIsUpdatingHabit] = useState(false);

  // Archive / Delete Confirmation State
  const [habitToArchive, setHabitToArchive] = useState<HabitWithStats | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Archived Habits State & Drawer/List
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [loadingArchived, setLoadingArchived] = useState(false);

  useEffect(() => {
    setNameInput(profile?.name || user?.name || '');
  }, [profile, user]);

  const loadArchived = async () => {
    if (!user) return;
    try {
      setLoadingArchived(true);
      const data = await fetchArchivedHabits(user.id);
      setArchivedHabits(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingArchived(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    try {
      setIsSavingName(true);
      await updateProfileName(nameInput.trim());
      setIsEditingName(false);
      toast.success('Profile name updated');
    } catch {
      toast.error('Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleEditSubmit = async (data: HabitFormData) => {
    if (!editingHabit) return;
    try {
      setIsUpdatingHabit(true);
      await updateHabit(editingHabit.id, data);
      setEditingHabit(null);
    } finally {
      setIsUpdatingHabit(false);
    }
  };

  const handleConfirmArchive = async () => {
    if (!habitToArchive) return;
    try {
      setIsArchiving(true);
      await archiveHabit(habitToArchive.id);
      setHabitToArchive(null);
      if (showArchived) {
        await loadArchived();
      }
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestore = async (habitId: string) => {
    try {
      await restoreHabit(habitId);
      setArchivedHabits((prev) => prev.filter((h) => h.id !== habitId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Manage your account, preferences, and active habits.
        </p>
      </div>

      {/* SECTION 1: PROFILE INFO */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
              {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {profile?.name || user?.name || 'HabitFlow User'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingName && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingName(true)}
                leftIcon={<Pencil className="w-3.5 h-3.5" />}
              >
                Edit Name
              </Button>
            )}
          </div>
        </div>

        {isEditingName && (
          <form onSubmit={handleSaveName} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your full name"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingName}>
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingName(false)}
            >
              Cancel
            </Button>
          </form>
        )}

        {/* Database Status Info */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Database className="w-4 h-4 text-indigo-500" />
            <span>Cloud Database Storage</span>
          </div>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full ${
              isCloudConnected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {isCloudConnected ? 'Supabase PostgreSQL' : 'Local Storage Mode'}
          </span>
        </div>
      </Card>

      {/* SECTION 2: APPEARANCE / THEME */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Appearance
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-950/40 text-indigo-400 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-700'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              theme === 'system'
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span className="text-xs">System</span>
          </button>
        </div>
      </Card>

      {/* SECTION 3: HABIT MANAGEMENT */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Habit Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Edit habit properties or remove habits from your active dashboard.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {habits.length} Active
          </span>
        </div>

        {habits.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No active habits.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {habits.map((habit) => {
              const isGood = habit.type === 'good';
              return (
                <div
                  key={habit.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {renderHabitIcon(habit.icon, 'w-4 h-4')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {habit.name}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          isGood
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {isGood ? 'Good habit' : 'Bad habit (Avoidance)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingHabit(habit)}
                      leftIcon={<Pencil className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      onClick={() => setHabitToArchive(habit)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Archived Habits Collapsible / Accordion */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              const next = !showArchived;
              setShowArchived(next);
              if (next && archivedHabits.length === 0) {
                loadArchived();
              }
            }}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Hide Archived Habits' : 'View Archived Habits'}</span>
          </button>

          {showArchived && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
              {loadingArchived ? (
                <p className="text-xs text-slate-400">Loading archived habits...</p>
              ) : archivedHabits.length === 0 ? (
                <p className="text-xs text-slate-400">No archived habits.</p>
              ) : (
                archivedHabits.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({item.type === 'good' ? 'Good' : 'Bad'})
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item.id)}
                      leftIcon={<RotateCcw className="w-3 h-3" />}
                    >
                      Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>

      {/* SECTION 4: ACCOUNT / SIGN OUT */}
      <Card className="p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Session</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Signed in as {user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={signOut}
          leftIcon={<LogOut className="w-4 h-4 text-rose-500" />}
          className="hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-800"
        >
          Sign Out
        </Button>
      </Card>

      {/* Edit Habit Modal */}
      {editingHabit && (
        <Modal
          isOpen={Boolean(editingHabit)}
          onClose={() => setEditingHabit(null)}
          title="Edit Habit"
          description="Rename, change habit type, or update icon and color."
        >
          <HabitForm
            initialData={{
              name: editingHabit.name,
              type: editingHabit.type,
              icon: editingHabit.icon,
              color: editingHabit.color,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingHabit(null)}
            isSubmitting={isUpdatingHabit}
            isEditing
          />
        </Modal>
      )}

      {/* Delete / Archive Confirmation Modal */}
      {habitToArchive && (
        <Modal
          isOpen={Boolean(habitToArchive)}
          onClose={() => setHabitToArchive(null)}
          title={`Delete "${habitToArchive.name}"?`}
          description="This will remove the habit from your active dashboard."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                To preserve your consistency data, historical habit logs will be kept. You can restore this habit anytime from Archived Habits.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setHabitToArchive(null)}
                disabled={isArchiving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmArchive}
                isLoading={isArchiving}
              >
                Delete Habit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
