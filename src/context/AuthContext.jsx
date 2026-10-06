import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const SYSTEM_USERS = [
  {
    id: "ATH-202",
    loginId: "alex",
    email: "alex.morgan@athlete.com",
    name: "Alex Morgan",
    role: "athlete",
    roleTitle: "Professional Athlete (Forward)",
    sport: "Professional Soccer",
    assignedDoctorName: "Dr. Valli (Orthopedic Surgeon)",
    assignedPhysioName: "Dr. Sarah Jenkins, PT",
    conditionId: "KNEE_001",
    conditionName: "Anterior Cruciate Ligament (ACL) Reconstruction - Post-Op Week 6",
    avatar: ""
  },
  {
    id: "PHY-301",
    loginId: "physio",
    email: "sarah.jenkins@rehab360.ai",
    name: "Dr. Sarah Jenkins, PT",
    role: "physio",
    roleTitle: "Lead Sports Physical Therapist",
    clinic: "Rehab360 Sports Performance Lab",
    avatar: ""
  },
  {
    id: "DOC-101",
    loginId: "ortho",
    email: "dr.valli@valli.com",
    name: "Dr. Valli, MD",
    role: "ortho",
    roleTitle: "Chief Orthopedic Surgeon & Sports Specialist",
    clinic: "Valli Orthopedic Hospital",
    avatar: ""
  }
];

const DEFAULT_PROFILES = {
  athlete: SYSTEM_USERS.find(u => u.role === 'athlete'),
  physio: SYSTEM_USERS.find(u => u.role === 'physio'),
  ortho: SYSTEM_USERS.find(u => u.role === 'ortho')
};

export const AuthProvider = ({ children }) => {
  const [userProfiles, setUserProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('rehab360_user_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          athlete: { ...DEFAULT_PROFILES.athlete, ...parsed.athlete },
          physio: { ...DEFAULT_PROFILES.physio, ...parsed.physio },
          ortho: { ...DEFAULT_PROFILES.ortho, ...parsed.ortho }
        };
      }
    } catch (e) {}
    return DEFAULT_PROFILES;
  });

  const [activeRole, setActiveRole] = useState(() => {
    try {
      const saved = localStorage.getItem('rehab360_active_role');
      if (saved && ['athlete', 'physio', 'ortho'].includes(saved)) return saved;
    } catch (e) {}
    return 'athlete';
  });

  const [authError, setAuthError] = useState(null);

  // Active user profile is dynamically derived based on activeRole
  const currentUser = userProfiles[activeRole] || DEFAULT_PROFILES[activeRole] || DEFAULT_PROFILES.athlete;

  useEffect(() => {
    try {
      localStorage.setItem('rehab360_user_profiles', JSON.stringify(userProfiles));
    } catch (e) {}
  }, [userProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem('rehab360_active_role', activeRole);
    } catch (e) {}
  }, [activeRole]);

  const switchRole = (role) => {
    if (['athlete', 'physio', 'ortho'].includes(role)) {
      setActiveRole(role);
    }
  };

  const getUserForRole = (role) => {
    return userProfiles[role] || DEFAULT_PROFILES[role] || DEFAULT_PROFILES.athlete;
  };

  const login = (usernameOrEmail, password, roleHint = null) => {
    setAuthError(null);
    const cleaned = usernameOrEmail?.trim().toLowerCase();

    const found = SYSTEM_USERS.find(
      (u) =>
        u.loginId.toLowerCase() === cleaned ||
        u.email.toLowerCase() === cleaned ||
        u.role === cleaned ||
        (cleaned === 'doctor' && (u.role === 'ortho' || u.role === 'physio'))
    );

    if (found) {
      if (roleHint && found.role !== roleHint && !(roleHint === 'physio' && found.role === 'ortho')) {
        setAuthError(`This login belongs to a ${found.role.toUpperCase()} account. Please select the correct portal tab.`);
        return { success: false, error: "Role mismatch" };
      }
      setActiveRole(found.role);
      return { success: true, user: userProfiles[found.role] || found };
    } else {
      setAuthError("Invalid credentials! Try demo accounts: 'alex' (Athlete), 'physio' (Physiotherapist), or 'ortho' (Orthopedic Specialist).");
      return { success: false, error: "Invalid credentials" };
    }
  };

  const logout = () => {
    setActiveRole('athlete');
  };

  const updateUserProfile = (updates, targetRole = null) => {
    const roleToUpdate = targetRole || activeRole;
    setUserProfiles((prev) => {
      const currentRoleProfile = prev[roleToUpdate] || DEFAULT_PROFILES[roleToUpdate];
      const updatedProfile = { ...currentRoleProfile, ...updates };
      const updatedMap = {
        ...prev,
        [roleToUpdate]: updatedProfile
      };
      try {
        localStorage.setItem('rehab360_user_profiles', JSON.stringify(updatedMap));
      } catch (e) {}
      return updatedMap;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        switchRole,
        getUserForRole,
        login,
        logout,
        updateUserProfile,
        authError,
        SYSTEM_USERS,
        userProfiles
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
