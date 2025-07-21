import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  fullName: string;
  apartmentNumber: string;
  role: UserRole;
  communityId?: string;
  communityName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface Community {
  id: string;
  name: string;
  adminId: string;
  adminName: string;
  members: User[];
  invitations: Invitation[];
}

export interface Invitation {
  id: string;
  userId: string;
  userName: string;
  communityId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  communities: Community[];
  login: (credentials: { apartmentNumber: string; password: string }) => Promise<boolean>;
  signup: (data: { fullName: string; password: string; apartmentNumber: string; role: UserRole; communityName?: string }) => Promise<boolean>;
  logout: () => void;
  sendInvitation: (communityId: string) => Promise<boolean>;
  acceptInvitation: (invitationId: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('communityApp_user');
    const savedCommunities = localStorage.getItem('communityApp_communities');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedCommunities) {
      setCommunities(JSON.parse(savedCommunities));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('communityApp_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('communityApp_communities', JSON.stringify(communities));
  }, [communities]);

  const login = async (credentials: { apartmentNumber: string; password: string }): Promise<boolean> => {
    // Simulate API call - in real app, this would call your backend
    const savedUsers = JSON.parse(localStorage.getItem('communityApp_users') || '[]');
    const foundUser = savedUsers.find((u: any) => 
      u.apartmentNumber === credentials.apartmentNumber && u.password === credentials.password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const signup = async (data: { 
    fullName: string; 
    password: string; 
    apartmentNumber: string; 
    role: UserRole; 
    communityName?: string 
  }): Promise<boolean> => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem('communityApp_users') || '[]');
      
      // Check if user already exists
      if (savedUsers.some((u: any) => u.apartmentNumber === data.apartmentNumber)) {
        return false;
      }

      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        fullName: data.fullName,
        apartmentNumber: data.apartmentNumber,
        role: data.role,
        password: data.password,
      };

      // If admin, create community
      if (data.role === 'admin' && data.communityName) {
        const communityId = Date.now().toString();
        newUser.communityId = communityId;
        newUser.communityName = data.communityName;

        const newCommunity: Community = {
          id: communityId,
          name: data.communityName,
          adminId: newUser.id,
          adminName: data.fullName,
          members: [newUser],
          invitations: []
        };

        setCommunities(prev => [...prev, newCommunity]);
      }

      savedUsers.push(newUser);
      localStorage.setItem('communityApp_users', JSON.stringify(savedUsers));

      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('communityApp_user');
  };

  const sendInvitation = async (communityId: string): Promise<boolean> => {
    if (!user) return false;

    const invitation: Invitation = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.fullName,
      communityId,
      status: 'pending',
      createdAt: new Date()
    };

    setCommunities(prev => prev.map(community => 
      community.id === communityId 
        ? { ...community, invitations: [...community.invitations, invitation] }
        : community
    ));

    return true;
  };

  const acceptInvitation = async (invitationId: string): Promise<boolean> => {
    if (!user) return false;

    setCommunities(prev => prev.map(community => {
      const invitation = community.invitations.find(inv => inv.id === invitationId);
      if (invitation && invitation.userId === user.id) {
        return {
          ...community,
          members: [...community.members, user],
          invitations: community.invitations.map(inv => 
            inv.id === invitationId ? { ...inv, status: 'accepted' as const } : inv
          )
        };
      }
      return community;
    }));

    // Update user's community info
    const targetCommunity = communities.find(c => 
      c.invitations.some(inv => inv.id === invitationId)
    );

    if (targetCommunity) {
      setUser(prev => prev ? {
        ...prev,
        communityId: targetCommunity.id,
        communityName: targetCommunity.name
      } : null);
    }

    return true;
  };

  const value: AuthContextType = {
    user,
    communities,
    login,
    signup,
    logout,
    sendInvitation,
    acceptInvitation,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};