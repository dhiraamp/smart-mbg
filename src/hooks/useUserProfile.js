import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useUserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      if (me?.email) {
        try {
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          if (profiles.length > 0) {
            setProfile(profiles[0]);
          } else {
            const storedRole = localStorage.getItem("smartmbg_role") || "mitra";
            const newProfile = await base44.entities.UserProfile.create({
              user_id: me.id || me.email,
              user_email: me.email,
              full_name: me.full_name || "",
              role: storedRole,
              is_active: true,
            });
            setProfile(newProfile);
          }
        } catch (profileErr) {
          console.error("Failed to load/create profile:", profileErr);
        }
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    }
    setLoading(false);
  };

  const updateProfile = async (data) => {
    if (!profile?.id) return;
    const updated = await base44.entities.UserProfile.update(profile.id, data);
    setProfile(updated);
    return updated;
  };

  const mergedUser = user ? {
    ...user,
    role: profile?.role || localStorage.getItem("smartmbg_role") || user?.role || "mitra",
    organization_name: profile?.organization_name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    area: profile?.area || "",
    profile_id: profile?.id,
  } : null;

  return { user: mergedUser, profile, loading, updateProfile, reload: loadUser };
}