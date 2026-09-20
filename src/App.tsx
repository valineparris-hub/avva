import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfileSelect } from '@/components/ProfileSelect';
import { Dashboard } from '@/components/Dashboard';
import { KindergartenDashboard } from '@/components/KindergartenDashboard';
import { SubjectDashboard } from '@/components/SubjectDashboard';
import { SecondaryDashboard } from '@/components/SecondaryDashboard';
import { CSECDashboard } from '@/components/CSECDashboard';
import type { Profile } from '@/types';

const PRIMARY_LEVELS = new Set([
  'primary_infants_1', 'primary_infants_2',
  'standard_1', 'standard_2', 'standard_3', 'standard_4', 'standard_5',
]);

const SECONDARY_LEVELS = new Set([
  'form_1', 'form_2', 'form_3',
]);

const CSEC_LEVELS = new Set([
  'form_4', 'form_5',
]);

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const loadProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Failed to load profiles:', error.message);
    }
    setProfiles((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  async function handleCreate(data: Omit<Profile, 'id' | 'created_at'>) {
    const { data: row, error } = await supabase
      .from('profiles')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    await loadProfiles();
    setActiveProfile(row as Profile);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete profile:', error.message);
      return;
    }
    if (activeProfile?.id === id) setActiveProfile(null);
    await loadProfiles();
  }

  async function handleLevelUp(newGradeLevel: string) {
    if (!activeProfile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ grade_level: newGradeLevel })
      .eq('id', activeProfile.id);
    if (error) {
      console.error('Failed to level up:', error.message);
      return;
    }
    setActiveProfile({ ...activeProfile, grade_level: newGradeLevel });
    await loadProfiles();
  }

  if (activeProfile) {
    if (activeProfile.grade_level === 'kindergarten') {
      return (
        <KindergartenDashboard
          profile={activeProfile}
          onBack={() => setActiveProfile(null)}
          onLevelUp={handleLevelUp}
        />
      );
    }
    if (PRIMARY_LEVELS.has(activeProfile.grade_level)) {
      return <SubjectDashboard profile={activeProfile} onBack={() => setActiveProfile(null)} />;
    }
    if (SECONDARY_LEVELS.has(activeProfile.grade_level)) {
      return <SecondaryDashboard profile={activeProfile} onBack={() => setActiveProfile(null)} />;
    }
    if (CSEC_LEVELS.has(activeProfile.grade_level)) {
      return <CSECDashboard profile={activeProfile} onBack={() => setActiveProfile(null)} />;
    }
    return <Dashboard profile={activeProfile} onBack={() => setActiveProfile(null)} />;
  }

  return (
    <ProfileSelect
      profiles={profiles}
      loading={loading}
      onSelect={setActiveProfile}
      onCreate={handleCreate}
      onDelete={handleDelete}
    />
  );
}
