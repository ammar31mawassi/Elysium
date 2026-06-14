import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { LOCALE_NAMES, SUPPORTED_LOCALES } from "@/lib/i18n";
import { BookOpenCheck, LogOut, Edit2, GraduationCap, HelpCircle, Sun, Moon, Monitor, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageLayout from "@/components/layout/PageLayout";
import ElysiumMark from "@/components/elysium/ElysiumMark";
import { cn } from "@/lib/utils";
import { productText } from "@/lib/productCopy";
import { DEFAULT_INTERESTS, filterLocalizedOptions, localizedOption, mergeInterestOptions, normalizeOptionName } from "@/lib/onboardingOptions";
import { courseProfileUpdate, normalizeCourseRecords } from "@/lib/profileCourses";

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
}

export default function ProfilePage() {
  const { user, profile, university, setProfile } = useProfile();
  const { locale, setLocale, t } = useLanguage();
  const p = (key) => productText(locale, key);
  const { preference, setTheme, isDark } = useTheme();
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [peerHelper, setPeerHelper] = useState(null);
  const [courseRecords, setCourseRecords] = useState([]);
  const [courseDraft, setCourseDraft] = useState({ name: '', status: 'active' });
  const [interestOptions, setInterestOptions] = useState(DEFAULT_INTERESTS);
  const [interestSearch, setInterestSearch] = useState('');
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [customInterest, setCustomInterest] = useState({ en: '', he: '' });
  const [loading, setLoading] = useState(true);
  const [showTutorForm, setShowTutorForm] = useState(false);
  const [showHelperForm, setShowHelperForm] = useState(false);
  const [tutorForm, setTutorForm] = useState({ subjects_raw: '', languages_raw: '', phone_number: '', bio: '', teaching_mode: 'both', price_min: '', price_max: '', availability: '', contact_consent: false });
  const [helperForm, setHelperForm] = useState({ topics_raw: '', languages_raw: '', bio: '', availability: '', contact_method: 'whatsapp', contact_value: '', contact_consent: false });
  const [saving, setSaving] = useState(false);
  const [savingHelper, setSavingHelper] = useState(false);

  useEffect(() => {
    setCourseRecords(normalizeCourseRecords(profile));
  }, [profile]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.PrivateTeacher.filter({ user_id: user.id }),
      base44.entities.PeerHelper.filter({ owner_user_id: user.id }),
      base44.entities.Interest.filter({ is_active: true }),
    ]).then(([teachers, helpers, interests]) => {
      if (teachers?.length) {
        const t = teachers[0];
        setTeacherProfile(t);
        setTutorForm({ subjects_raw: (t.subjects || []).join(', '), languages_raw: (t.languages || []).join(', '), phone_number: t.phone_number || '', bio: t.bio || '', teaching_mode: t.teaching_mode || 'both', price_min: t.price_min ?? '', price_max: t.price_max ?? '', availability: t.availability || '', contact_consent: t.contact_consent || false });
      }
      if (helpers?.length) {
        const h = helpers[0];
        setPeerHelper(h);
        setHelperForm({ topics_raw: (h.help_topics || []).join(', '), languages_raw: (h.languages || []).join(', '), bio: h.bio || '', availability: h.availability || '', contact_method: 'whatsapp', contact_value: h.contact_value || '', contact_consent: h.contact_consent || false });
      }
      setInterestOptions(mergeInterestOptions(interests));
      setLoading(false);
    });
  }, [user?.id]);

  const filteredInterests = useMemo(() => filterLocalizedOptions(interestOptions, interestSearch).slice(0, 24), [interestOptions, interestSearch]);

  const saveProfilePatch = async (patch) => {
    if (!profile?.id) return;
    await base44.entities.StudentProfile.update(profile.id, patch);
    setProfile((current) => ({ ...current, ...patch }));
  };

  const persistCourses = async (nextCourses) => {
    const update = courseProfileUpdate(nextCourses);
    setCourseRecords(update.course_records);
    await saveProfilePatch(update);
  };

  const addCourse = async () => {
    const name = courseDraft.name.trim();
    if (!name || courseRecords.some((course) => course.name.toLowerCase() === name.toLowerCase())) return;
    await persistCourses([...courseRecords, { name, status: courseDraft.status, grade: '', credits: '' }]);
    setCourseDraft({ name: '', status: 'active' });
  };

  const toggleInterest = async (name) => {
    const current = profile?.interests || [];
    const interests = current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
    await saveProfilePatch({ interests });
  };

  const addCustomInterest = async () => {
    const english = customInterest.en.trim();
    const hebrew = customInterest.he.trim();
    if (!english || !hebrew || !user?.id) return;
    const existing = interestOptions.find((interest) => normalizeOptionName(interest.en) === normalizeOptionName(english));
    if (existing) {
      if (!(profile?.interests || []).includes(existing.en)) await saveProfilePatch({ interests: [...(profile?.interests || []), existing.en] });
    } else {
      const record = await base44.entities.Interest.create({ name_en: english, name_he: hebrew, normalized_key: normalizeOptionName(english), created_by: user.id, is_active: true });
      const option = { id: record.id, en: english, he: hebrew, ar: english, persisted: true };
      setInterestOptions((current) => [...current, option]);
      await saveProfilePatch({ interests: [...(profile?.interests || []), english] });
    }
    setCustomInterest({ en: '', he: '' });
    setShowCustomInterest(false);
    setInterestSearch('');
  };

  const handleLocaleChange = async (l) => {
    setLocale(l);
    if (profile?.id) await base44.entities.StudentProfile.update(profile.id, { preferred_locale: l });
  };

  const handleThemeChange = async (pref) => {
    setTheme(pref);
    if (profile?.id) await base44.entities.StudentProfile.update(profile.id, { theme_preference: pref });
  };

  const handleTutorSubmit = async () => {
    setSaving(true);
    const subjects = tutorForm.subjects_raw.split(',').map(s => s.trim()).filter(Boolean);
    const languages = tutorForm.languages_raw.split(',').map(s => s.trim()).filter(Boolean);
    const data = { user_id: user.id, university_id: profile.university_id, display_name: profile?.preferred_name || user.full_name || 'Student', subjects, languages, phone_number: tutorForm.contact_consent ? tutorForm.phone_number : '', bio: tutorForm.bio, teaching_mode: tutorForm.teaching_mode, price_min: tutorForm.price_min === '' ? undefined : Number(tutorForm.price_min), price_max: tutorForm.price_max === '' ? undefined : Number(tutorForm.price_max), currency: 'ILS', availability: tutorForm.availability, contact_consent: tutorForm.contact_consent, is_approved: false, is_active: false, moderation_status: 'pending' };
    if (teacherProfile) {
      await base44.entities.PrivateTeacher.update(teacherProfile.id, data);
    } else {
      const t = await base44.entities.PrivateTeacher.create(data);
      setTeacherProfile(t);
    }
    setSaving(false);
    setShowTutorForm(false);
  };

  const handleHelperSubmit = async () => {
    setSavingHelper(true);
    const topics = helperForm.topics_raw.split(',').map(s => s.trim()).filter(Boolean);
    const languages = helperForm.languages_raw.split(',').map(s => s.trim()).filter(Boolean);
    const data = { owner_user_id: user.id, university_id: profile.university_id, faculty_id: profile.faculty_id || '', field_of_study: profile.field_of_study || '', academic_year: profile.academic_year || '', display_name: profile?.preferred_name || user.full_name || 'Student', help_topics: topics, languages, bio: helperForm.bio, availability: helperForm.availability, contact_method: 'whatsapp', contact_value: helperForm.contact_consent ? helperForm.contact_value : '', contact_consent: helperForm.contact_consent, is_visible: true, moderation_status: 'ok' };
    if (peerHelper) {
      await base44.entities.PeerHelper.update(peerHelper.id, data);
    } else {
      const h = await base44.entities.PeerHelper.create(data);
      setPeerHelper(h);
    }
    setSavingHelper(false);
    setShowHelperForm(false);
  };

  const toggleHelperVisibility = async () => {
    if (!peerHelper) return;
    await base44.entities.PeerHelper.update(peerHelper.id, { is_visible: !peerHelper.is_visible });
    setPeerHelper(p => ({ ...p, is_visible: !p.is_visible }));
  };

  return (
    <PageLayout title={t('profile_title')}>
      {/* Hero */}
      <div className="bg-card rounded-lg border border-border p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
            {getInitials(user?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-base">{user?.full_name || 'Student'}</p>
            {university && <p className="text-sm text-muted-foreground">{university.name}</p>}
            <p className="text-xs text-muted-foreground">{profile?.academic_year} {profile?.field_of_study ? `· ${profile.field_of_study}` : ''}</p>
          </div>
        </div>
        {/* Tagline + logo small */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic">{t('tagline')}</p>
          <ElysiumMark size={28} />
        </div>
      </div>

      {/* Language */}
      <SettingsCard title={t('profile_language')}>
        <div className="flex gap-2">
          {SUPPORTED_LOCALES.map(l => (
            <button key={l} onClick={() => handleLocaleChange(l)}
              className={cn("flex-1 py-2 rounded-md border text-xs font-semibold transition-all", locale === l ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
              {LOCALE_NAMES[l]}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Theme */}
      <SettingsCard title={t('profile_theme')}>
        <div className="flex gap-2">
          {[['light', t('profile_theme_light') || 'Light', Sun], ['dark', t('profile_theme_dark') || 'Dark', Moon], ['system', t('profile_theme_system') || 'System', Monitor]].map(([key, label, ThemeIcon]) => (
            <button key={key} onClick={() => handleThemeChange(key)}
              className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-xs font-medium transition-all", preference === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
                <ThemeIcon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="My courses" icon={<BookOpenCheck className="h-4 w-4 text-primary" />}>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">Active courses are used for study-group matching. Finished courses stay available in your grade tools.</p>
        <div className="space-y-2">
          {courseRecords.map((course) => (
            <div key={course.name} className="flex min-w-0 items-center gap-2 rounded-md border border-border p-2">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{course.name}</span>
              <select aria-label={`${course.name} status`} value={course.status} onChange={(event) => persistCourses(courseRecords.map((item) => item.name === course.name ? { ...item, status: event.target.value } : item))} className="h-10 rounded-md border border-input bg-background px-2 text-xs">
                <option value="active">Active</option>
                <option value="finished">Finished</option>
              </select>
              <button onClick={() => persistCourses(courseRecords.filter((item) => item.name !== course.name))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${course.name}`}><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_130px_auto]">
          <Input value={courseDraft.name} onChange={(event) => setCourseDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Add a course" />
          <select aria-label="New course status" value={courseDraft.status} onChange={(event) => setCourseDraft((current) => ({ ...current, status: event.target.value }))} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="active">Active</option><option value="finished">Finished</option></select>
          <Button variant="outline" className="gap-2" disabled={!courseDraft.name.trim()} onClick={addCourse}><Plus className="h-4 w-4" />Add</Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Interests and hobbies">
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">Your interests decide which social activities are relevant to you.</p>
        <div className="relative"><Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="ps-9" value={interestSearch} onChange={(event) => setInterestSearch(event.target.value)} placeholder="Search hobbies" /></div>
        <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto pe-1">
          {filteredInterests.map((interest) => {
            const selected = (profile?.interests || []).includes(interest.en);
            return <button key={interest.id} type="button" onClick={() => toggleInterest(interest.en)} className={cn("min-h-10 rounded-full border px-3 py-1.5 text-xs font-semibold", selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")}>{localizedOption(interest, locale)}</button>;
          })}
        </div>
        <Button type="button" variant="outline" className="mt-3 gap-2" onClick={() => setShowCustomInterest((current) => !current)}><Plus className="h-4 w-4" />Add a hobby</Button>
        {showCustomInterest && <div className="mt-3 rounded-md border border-border p-3"><p className="mb-2 text-xs text-muted-foreground">New hobbies require an English and Hebrew name so other students can find them.</p><div className="grid gap-2 sm:grid-cols-2"><Input value={customInterest.en} onChange={(event) => setCustomInterest((current) => ({ ...current, en: event.target.value }))} placeholder="English name" /><Input dir="rtl" value={customInterest.he} onChange={(event) => setCustomInterest((current) => ({ ...current, he: event.target.value }))} placeholder="Hebrew name" /></div><Button className="mt-3" disabled={!customInterest.en.trim() || !customInterest.he.trim()} onClick={addCustomInterest}>Add hobby</Button></div>}
      </SettingsCard>

      {/* Offer tutoring */}
      <SettingsCard title={t('profile_offer_tutoring')} icon={<GraduationCap className="w-4 h-4 text-purple-600" />}>
        {teacherProfile && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", teacherProfile.is_active ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400")}>
                {teacherProfile.is_active ? p('profile_active') : p('profile_pending')}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(teacherProfile.subjects || []).map(s => <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded">{s}</span>)}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-2">{p('profile_public_note')}</p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowTutorForm(f => !f)}>
          <Edit2 className="w-3.5 h-3.5" />{teacherProfile ? t('profile_edit') : t('profile_offer_tutoring')}
        </Button>
        {showTutorForm && (
          <div className="mt-3 pt-3 border-t border-border space-y-2 animate-fade-in">
            <Input className="text-sm" placeholder={p('profile_subjects')} value={tutorForm.subjects_raw} onChange={e => setTutorForm(f => ({ ...f, subjects_raw: e.target.value }))} />
            <Input className="text-sm" placeholder="Languages, separated by commas" value={tutorForm.languages_raw} onChange={e => setTutorForm(f => ({ ...f, languages_raw: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input className="text-sm" type="number" min="0" placeholder="Minimum ILS" value={tutorForm.price_min} onChange={e => setTutorForm(f => ({ ...f, price_min: e.target.value }))} />
              <Input className="text-sm" type="number" min="0" placeholder="Maximum ILS" value={tutorForm.price_max} onChange={e => setTutorForm(f => ({ ...f, price_max: e.target.value }))} />
            </div>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={tutorForm.teaching_mode} onChange={e => setTutorForm(f => ({ ...f, teaching_mode: e.target.value }))}>
              <option value="both">Online or in person</option><option value="online">Online</option><option value="in_person">In person</option>
            </select>
            <Input className="text-sm" placeholder="Availability" value={tutorForm.availability} onChange={e => setTutorForm(f => ({ ...f, availability: e.target.value }))} />
            <Input className="text-sm" placeholder={p('profile_phone')} value={tutorForm.phone_number} onChange={e => setTutorForm(f => ({ ...f, phone_number: e.target.value }))} />
            <Textarea className="text-sm resize-none" rows={2} placeholder={p('profile_tutor_bio')} value={tutorForm.bio} onChange={e => setTutorForm(f => ({ ...f, bio: e.target.value }))} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={tutorForm.contact_consent} onChange={e => setTutorForm(f => ({ ...f, contact_consent: e.target.checked }))} className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">{p('profile_contact_consent')}</span>
            </label>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" disabled={!tutorForm.subjects_raw || saving} onClick={handleTutorSubmit}>{saving ? t('profile_saving') : t('profile_save')}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowTutorForm(false)}>{t('common_cancel')}</Button>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Peer Helper */}
      <SettingsCard title={t('profile_peer_helper')} icon={<HelpCircle className="w-4 h-4 text-primary" />}>
        {peerHelper && (
          <div className="mb-3 flex items-center gap-2">
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", peerHelper.is_visible ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-muted text-muted-foreground")}>
              {peerHelper.is_visible ? p('profile_visible') : p('profile_hidden')}
            </span>
            <button onClick={toggleHelperVisibility} className="text-xs text-primary hover:underline">{peerHelper.is_visible ? p('profile_hide') : p('profile_show')}</button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-2">{p('profile_helper_note')}</p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowHelperForm(f => !f)}>
          <Edit2 className="w-3.5 h-3.5" />{peerHelper ? t('profile_edit') : p('profile_setup_helper')}
        </Button>
        {showHelperForm && (
          <div className="mt-3 pt-3 border-t border-border space-y-2 animate-fade-in">
            <Input className="text-sm" placeholder={p('profile_help_topics')} value={helperForm.topics_raw} onChange={e => setHelperForm(f => ({ ...f, topics_raw: e.target.value }))} />
            <Input className="text-sm" placeholder="Languages, separated by commas" value={helperForm.languages_raw} onChange={e => setHelperForm(f => ({ ...f, languages_raw: e.target.value }))} />
            <Textarea className="text-sm resize-none" rows={2} placeholder={p('profile_helper_bio')} value={helperForm.bio} onChange={e => setHelperForm(f => ({ ...f, bio: e.target.value }))} />
            <Input className="text-sm" placeholder={p('profile_availability')} value={helperForm.availability} onChange={e => setHelperForm(f => ({ ...f, availability: e.target.value }))} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={helperForm.contact_consent} onChange={e => setHelperForm(f => ({ ...f, contact_consent: e.target.checked }))} className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">{p('profile_public_contact')}</span>
            </label>
            {helperForm.contact_consent && (
              <Input className="text-sm" placeholder={p('profile_contact')} value={helperForm.contact_value} onChange={e => setHelperForm(f => ({ ...f, contact_value: e.target.value }))} />
            )}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" disabled={!helperForm.topics_raw || savingHelper} onClick={handleHelperSubmit}>{savingHelper ? t('profile_saving') : t('profile_save')}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowHelperForm(false)}>{t('common_cancel')}</Button>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Sign out */}
      <button onClick={() => base44.auth.logout('/')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors mt-2 pb-4">
        <LogOut className="w-4 h-4" /> {t('profile_signout')}
      </button>
    </PageLayout>
  );
}

function SettingsCard({ title, icon, children }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}
