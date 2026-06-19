import { useState, useEffect, createContext, useContext } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { findDefaultUniversity } from "@/lib/universities";
import { base44ErrorMessage } from "@/lib/base44LoadState";

const ProfileContext = createContext(null);

function withTimeout(promise, timeout = 8000) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Profile request timed out')), timeout))]);
}

export function ProfileProvider({ children }) {
  const navigate = useNavigate();
  const { setLocale } = useLanguage();
  const { setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const u = await withTimeout(base44.auth.me());
        setUser(u);
        const profiles = await withTimeout(base44.entities.StudentProfile.filter({ user_id: u.id }));
        if (profiles.length === 0) {
          navigate("/onboarding");
          return;
        }
        const p = profiles[0];
        setProfile(p);
        if (p.preferred_locale) setLocale(p.preferred_locale);
        if (p.theme_preference) setTheme(p.theme_preference);
        if (p.university_id) {
          const unis = await withTimeout(base44.entities.University.filter({ id: p.university_id }));
          if (unis.length) {
            setUniversity(unis[0]);
          } else {
            const fallbackUniversity = findDefaultUniversity(p.university_id);
            if (fallbackUniversity) setUniversity(fallbackUniversity);
          }
        }
      } catch (e) {
        console.error(e);
        setError(base44ErrorMessage(e, "Your profile could not be loaded."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate, setLocale, setTheme, loadKey]);

  const retryProfile = () => setLoadKey((key) => key + 1);

  return (
    <ProfileContext.Provider value={{ user, profile, university, loading, error, retryProfile, setProfile, setUniversity }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
