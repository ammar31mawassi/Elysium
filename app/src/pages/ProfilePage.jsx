import React, { useEffect, useState } from "react";
import { Edit2, GraduationCap, HelpCircle, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { LOCALE_NAMES, SUPPORTED_LOCALES } from "@/lib/i18n";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { buildTutorProfilePayload, emptyTutorForm, splitCommaList, tutorFormFromProfile, tutorStatus } from "@/lib/tutorProfile";
import { withDefaultUniversities } from "@/lib/universities";
import { productText } from "@/lib/productCopy";
import { localizedField } from "@/lib/productUtils";
import PageLayout from "@/components/layout/PageLayout";
import ElysiumMark from "@/components/elysium/ElysiumMark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { domainTones } from "@/lib/domainTones";

const YEARS = ["Preparatory", "1st Year", "2nd Year", "3rd Year", "4th Year+"];
const SPOKEN_LANGUAGES = ["English", "Hebrew", "Arabic"];

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "S";
}

export default function ProfilePage() {
  const { user, profile, university, setProfile, setUniversity } = useProfile();
  const { locale, setLocale, t } = useLanguage();
  const { preference, setTheme } = useTheme();
  const p = (key) => productText(locale, key);
  const [universities, setUniversities] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [peerHelper, setPeerHelper] = useState(null);
  const [profileForm, setProfileForm] = useState({ preferred_name: "", university_id: "", academic_year: "", field_of_study: "", preferred_language: "English" });
  const [tutorForm, setTutorForm] = useState(emptyTutorForm);
  const [helperForm, setHelperForm] = useState({ topics_raw: "", languages_raw: "", bio: "", availability: "", contact_value: "" });
  const [showTutorForm, setShowTutorForm] = useState(false);
  const [showHelperForm, setShowHelperForm] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingTutor, setSavingTutor] = useState(false);
  const [savingHelper, setSavingHelper] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      preferred_name: profile.preferred_name || user?.full_name || "",
      university_id: profile.university_id || "",
      academic_year: profile.academic_year || "",
      field_of_study: profile.field_of_study || "",
      preferred_language: profile.preferred_language || "English",
    });
  }, [profile, user?.full_name]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.University.list().catch(() => []),
      base44.entities.PrivateTeacher.filter({ user_id: user.id }).catch(() => []),
      base44.entities.PeerHelper.filter({ owner_user_id: user.id }).catch(() => []),
    ]).then(([universityRows, teachers, helpers]) => {
      setUniversities(withDefaultUniversities(universityRows));
      if (teachers?.length) {
        const record = teachers[0];
        setTeacherProfile(record);
        setTutorForm(tutorFormFromProfile(record));
      }
      if (helpers?.length) {
        const record = helpers[0];
        setPeerHelper(record);
        setHelperForm({ topics_raw: (record.help_topics || []).join(", "), languages_raw: (record.languages || []).join(", "), bio: record.bio || "", availability: record.availability || "", contact_value: record.contact_value || "" });
      }
    });
  }, [user?.id]);

  const saveProfile = async () => {
    if (!profile?.id) return;
    setSavingProfile(true);
    try {
      await base44.entities.StudentProfile.update(profile.id, profileForm);
      setProfile((current) => ({ ...current, ...profileForm }));
      setUniversity(universities.find((item) => item.id === profileForm.university_id) || university);
      toast({ title: "Profile saved", description: "Your profile information is up to date." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Profile was not saved", description: "Please try again." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLocaleChange = async (nextLocale) => {
    setLocale(nextLocale);
    if (!profile?.id) return;
    try {
      await base44.entities.StudentProfile.update(profile.id, { preferred_locale: nextLocale });
      setProfile((current) => ({ ...current, preferred_locale: nextLocale }));
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Language was not saved" });
    }
  };

  const handleThemeChange = async (nextTheme) => {
    setTheme(nextTheme);
    if (!profile?.id) return;
    try {
      await base44.entities.StudentProfile.update(profile.id, { theme_preference: nextTheme });
      setProfile((current) => ({ ...current, theme_preference: nextTheme }));
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Theme was not saved" });
    }
  };

  const handleTutorSubmit = async () => {
    const { data, error } = buildTutorProfilePayload({ user, profile, profileForm, tutorForm, existingProfile: teacherProfile });
    if (error) {
      toast({ variant: "destructive", title: "Tutor profile was not saved", description: error });
      return;
    }

    setSavingTutor(true);
    try {
      const existing = teacherProfile || (await base44.entities.PrivateTeacher.filter({ user_id: user.id }).catch(() => []))[0];
      let saved;
      if (existing) {
        saved = await base44.entities.PrivateTeacher.update(existing.id, data);
      } else {
        saved = await base44.entities.PrivateTeacher.create(data);
      }
      const persisted = saved?.id ? await base44.entities.PrivateTeacher.get(saved.id).catch(() => saved) : saved;
      setTeacherProfile(persisted || { ...existing, ...data });
      setTutorForm(tutorFormFromProfile(persisted || data));
      setShowTutorForm(false);
      toast({
        title: "Tutoring profile saved",
        description: data.is_active ? "Students can now find you in private tutors." : "Your tutor profile was resubmitted for review.",
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Tutoring profile was not saved", description: error.message || "Please try again." });
    } finally {
      setSavingTutor(false);
    }
  };

  const handleHelperSubmit = async () => {
    const whatsapp = normalizeWhatsAppNumber(helperForm.contact_value);
    if (!splitCommaList(helperForm.topics_raw).length || !splitCommaList(helperForm.languages_raw).length || !helperForm.bio.trim() || !helperForm.availability.trim() || !whatsapp) {
      toast({ variant: "destructive", title: "Complete every Peer Helper field", description: "A valid WhatsApp number is required." });
      return;
    }
    setSavingHelper(true);
    try {
      const data = {
        owner_user_id: user.id,
        university_id: profile.university_id,
        field_of_study: profileForm.field_of_study,
        academic_year: profileForm.academic_year,
        display_name: profileForm.preferred_name || user.full_name || "Student",
        help_topics: splitCommaList(helperForm.topics_raw),
        languages: splitCommaList(helperForm.languages_raw),
        bio: helperForm.bio.trim(),
        availability: helperForm.availability.trim(),
        contact_method: "whatsapp",
        contact_value: whatsapp,
        contact_consent: true,
        is_visible: true,
        moderation_status: "ok",
      };
      if (peerHelper) {
        await base44.entities.PeerHelper.update(peerHelper.id, data);
        setPeerHelper((current) => ({ ...current, ...data }));
      } else {
        setPeerHelper(await base44.entities.PeerHelper.create(data));
      }
      setShowHelperForm(false);
      toast({ title: "Peer Helper is on", description: "Students can now find your public helper profile.", duration: 5000 });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Peer Helper was not saved", description: "Your previous setting was kept. Please try again." });
    } finally {
      setSavingHelper(false);
    }
  };

  const toggleHelper = async (checked) => {
    if (!peerHelper) {
      if (checked) setShowHelperForm(true);
      return;
    }
    setSavingHelper(true);
    try {
      await base44.entities.PeerHelper.update(peerHelper.id, { is_visible: checked });
      setPeerHelper((current) => ({ ...current, is_visible: checked }));
      toast({ title: checked ? "Peer Helper is on" : "Peer Helper is off", duration: checked ? 5000 : undefined });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Peer Helper setting was not changed" });
    } finally {
      setSavingHelper(false);
    }
  };

  const teacherStatus = tutorStatus(teacherProfile);

  return (
    <PageLayout title={t("profile_title")}>
      <div className="mb-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{getInitials(profileForm.preferred_name || user?.full_name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-foreground">{profileForm.preferred_name || user?.full_name || "Student"}</p>
            {university && <p className="text-sm text-muted-foreground">{university.name}</p>}
            <p className="text-xs text-muted-foreground">{profileForm.academic_year}{profileForm.field_of_study ? ` · ${profileForm.field_of_study}` : ""}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <label htmlFor="peer-helper-toggle" className="text-xs font-semibold text-foreground">Peer Helper</label>
            <Switch id="peer-helper-toggle" className="h-7 w-12 data-[state=checked]:bg-teal-600 [&>span]:h-6 [&>span]:w-6 data-[state=checked]:[&>span]:translate-x-5" checked={Boolean(peerHelper?.is_visible)} disabled={savingHelper} onCheckedChange={toggleHelper} />
            <span className={cn("text-[11px] font-medium", peerHelper?.is_visible ? domainTones.helper.text : "text-muted-foreground")}>{peerHelper?.is_visible ? "On" : "Off"}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4"><p className="text-xs italic text-muted-foreground">{t("tagline")}</p><ElysiumMark size={28} /></div>
      </div>

      <SettingsCard title="Profile information">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Preferred name"><Input value={profileForm.preferred_name} onChange={(event) => setProfileForm((current) => ({ ...current, preferred_name: event.target.value }))} /></Field>
          <Field label="University"><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={profileForm.university_id} onChange={(event) => setProfileForm((current) => ({ ...current, university_id: event.target.value }))}>{universities.map((item) => <option key={item.id} value={item.id}>{localizedField(item, "name", locale)}</option>)}</select></Field>
          <Field label="Academic year"><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={profileForm.academic_year} onChange={(event) => setProfileForm((current) => ({ ...current, academic_year: event.target.value }))}><option value="">Select year</option>{YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></Field>
          <Field label="Field of study"><Input value={profileForm.field_of_study} onChange={(event) => setProfileForm((current) => ({ ...current, field_of_study: event.target.value }))} /></Field>
          <Field label="Preferred spoken language"><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={profileForm.preferred_language} onChange={(event) => setProfileForm((current) => ({ ...current, preferred_language: event.target.value }))}>{SPOKEN_LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}</select></Field>
        </div>
        <Button className="mt-4 w-full sm:w-auto" disabled={savingProfile || !profileForm.preferred_name.trim() || !profileForm.university_id} onClick={saveProfile}>{savingProfile ? "Saving..." : "Save profile"}</Button>
      </SettingsCard>

      <SettingsCard title={t("profile_language")}><div className="flex gap-2">{SUPPORTED_LOCALES.map((nextLocale) => <button key={nextLocale} onClick={() => handleLocaleChange(nextLocale)} className={cn("flex-1 rounded-md border py-2 text-xs font-semibold", locale === nextLocale ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40")}>{LOCALE_NAMES[nextLocale]}</button>)}</div></SettingsCard>
      <SettingsCard title={t("profile_theme")}><div className="flex gap-2">{[["light", t("profile_theme_light") || "Light", Sun], ["dark", t("profile_theme_dark") || "Dark", Moon], ["system", t("profile_theme_system") || "System", Monitor]].map(([key, label, Icon]) => <button key={key} onClick={() => handleThemeChange(key)} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-medium", preference === key ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40")}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div></SettingsCard>

      <SettingsCard title={t("profile_offer_tutoring")} icon={<GraduationCap className={cn("h-4 w-4", domainTones.tutor.text)} />}>
        <p className="mb-2 text-xs text-muted-foreground">{p("profile_public_note")}</p>
        <p className={cn("mb-3 text-xs font-semibold", teacherStatus.tone)}>{teacherStatus.label}</p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowTutorForm(true)}><Edit2 className="h-3.5 w-3.5" />{teacherProfile ? t("profile_edit") : t("profile_offer_tutoring")}</Button>
      </SettingsCard>

      <SettingsCard title="Peer Helper details" icon={<HelpCircle className={cn("h-4 w-4", domainTones.helper.text)} />}>
        <p className="mb-2 text-xs text-muted-foreground">Turn Peer Helper on in the profile header. The first time, complete these public details. Your WhatsApp number is required and is only shown while Peer Helper is on.</p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowHelperForm(true)}><Edit2 className="h-3.5 w-3.5" />{peerHelper ? "Edit helper details" : "Sign up as Peer Helper"}</Button>
      </SettingsCard>

      <TutorDialog
        open={showTutorForm}
        onOpenChange={setShowTutorForm}
        teacherProfile={teacherProfile}
        tutorForm={tutorForm}
        setTutorForm={setTutorForm}
        savingTutor={savingTutor}
        onSubmit={handleTutorSubmit}
        p={p}
        t={t}
      />

      <PeerHelperDialog
        open={showHelperForm}
        onOpenChange={setShowHelperForm}
        helperForm={helperForm}
        setHelperForm={setHelperForm}
        savingHelper={savingHelper}
        onSubmit={handleHelperSubmit}
      />

      <button onClick={() => base44.auth.logout("/")} className="mt-2 flex items-center gap-2 pb-4 text-sm text-muted-foreground hover:text-destructive"><LogOut className="h-4 w-4" />{t("profile_signout")}</button>
    </PageLayout>
  );
}

function TutorDialog({ open, onOpenChange, teacherProfile, tutorForm, setTutorForm, savingTutor, onSubmit, p, t }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{teacherProfile ? "Edit tutoring profile" : "Offer tutoring"}</DialogTitle>
            <DialogDescription>
              Share the subjects, languages, and contact details students can use to request help.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Field label={p("profile_subjects")}>
              <Input
                placeholder="Calculus, Data Structures"
                value={tutorForm.subjects_raw}
                onChange={(event) => setTutorForm((current) => ({ ...current, subjects_raw: event.target.value }))}
              />
            </Field>
            <Field label="Languages">
              <Input
                placeholder="Arabic, Hebrew, English"
                value={tutorForm.languages_raw}
                onChange={(event) => setTutorForm((current) => ({ ...current, languages_raw: event.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Minimum ILS">
                <Input
                  type="number"
                  min="0"
                  value={tutorForm.price_min}
                  onChange={(event) => setTutorForm((current) => ({ ...current, price_min: event.target.value }))}
                />
              </Field>
              <Field label="Maximum ILS">
                <Input
                  type="number"
                  min="0"
                  value={tutorForm.price_max}
                  onChange={(event) => setTutorForm((current) => ({ ...current, price_max: event.target.value }))}
                />
              </Field>
            </div>
            <Field label="Teaching mode">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={tutorForm.teaching_mode}
                onChange={(event) => setTutorForm((current) => ({ ...current, teaching_mode: event.target.value }))}
              >
                <option value="both">Online or in person</option>
                <option value="online">Online</option>
                <option value="in_person">In person</option>
              </select>
            </Field>
            <Field label="Availability">
              <Input
                placeholder="Weekdays after 18:00"
                value={tutorForm.availability}
                onChange={(event) => setTutorForm((current) => ({ ...current, availability: event.target.value }))}
              />
            </Field>
            <Field label={p("profile_phone")}>
              <Input
                inputMode="tel"
                placeholder="050-000-0000"
                value={tutorForm.phone_number}
                onChange={(event) => setTutorForm((current) => ({ ...current, phone_number: event.target.value }))}
              />
            </Field>
            <Field label={p("profile_tutor_bio")}>
              <Textarea
                rows={3}
                value={tutorForm.bio}
                onChange={(event) => setTutorForm((current) => ({ ...current, bio: event.target.value }))}
              />
            </Field>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tutorForm.contact_consent}
                onChange={(event) => setTutorForm((current) => ({ ...current, contact_consent: event.target.checked }))}
              />
              <span className="text-xs text-muted-foreground">{p("profile_contact_consent")}</span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common_cancel")}
            </Button>
            <Button type="submit" disabled={!tutorForm.subjects_raw.trim() || savingTutor}>
              {savingTutor ? t("profile_saving") : t("profile_save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PeerHelperDialog({ open, onOpenChange, helperForm, setHelperForm, savingHelper, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Sign up as a Peer Helper</DialogTitle>
            <DialogDescription>
              Share what you can help with. Your WhatsApp number is shown only while your Peer Helper profile is on.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Field label="Topics you can help with">
              <Input
                placeholder="First week, Moodle, course registration"
                value={helperForm.topics_raw}
                onChange={(event) => setHelperForm((current) => ({ ...current, topics_raw: event.target.value }))}
              />
            </Field>
            <Field label="Languages">
              <Input
                placeholder="Arabic, Hebrew, English"
                value={helperForm.languages_raw}
                onChange={(event) => setHelperForm((current) => ({ ...current, languages_raw: event.target.value }))}
              />
            </Field>
            <Field label="Short introduction">
              <Textarea
                rows={3}
                value={helperForm.bio}
                onChange={(event) => setHelperForm((current) => ({ ...current, bio: event.target.value }))}
              />
            </Field>
            <Field label="Availability">
              <Input
                placeholder="Weekdays after 18:00"
                value={helperForm.availability}
                onChange={(event) => setHelperForm((current) => ({ ...current, availability: event.target.value }))}
              />
            </Field>
            <Field label="WhatsApp number (required)">
              <Input
                inputMode="tel"
                placeholder="050-000-0000"
                value={helperForm.contact_value}
                onChange={(event) => setHelperForm((current) => ({ ...current, contact_value: event.target.value }))}
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              Saving confirms that this WhatsApp number may be shown on your public Peer Helper card while the switch is on.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={savingHelper}>
              {savingHelper ? "Saving..." : "Save and turn on"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SettingsCard({ title, icon, children }) {
  return <section className="mb-3 rounded-lg border border-border bg-card p-4"><div className="mb-3 flex items-center gap-2">{icon}<h2 className="text-sm font-semibold text-foreground">{title}</h2></div>{children}</section>;
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
