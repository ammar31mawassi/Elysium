import { useState, useEffect, createContext, useContext } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

const ProfileContext = createContext(null);

function withTimeout(promise, timeout = 8000) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Profile request timed out')), timeout))]);
}

export function ProfileProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
        if (p.university_id) {
          const unis = await withTimeout(base44.entities.University.filter({ id: p.university_id }));
          if (unis.length) setUniversity(unis[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ProfileContext.Provider value={{ user, profile, university, loading, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
