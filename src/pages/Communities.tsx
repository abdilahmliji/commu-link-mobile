import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Wifi, Building2, Send, Crown, Users } from 'lucide-react';

const Communities = () => {
  const { communities, sendInvitation, user } = useAuth();
  const navigate = useNavigate();

  const handleSendInvitation = async (communityId: string, communityName: string) => {
    const success = await sendInvitation(communityId);
    if (success) {
      toast({
        title: "Invitation sent!",
        description: `Your request to join ${communityName} has been sent to the admin.`,
      });
    } else {
      toast({
        title: "Failed to send invitation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // If user already has a community, redirect to home
  React.useEffect(() => {
    if (user?.communityId) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft mb-4">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Find Your Community
          </h1>
          <p className="text-muted-foreground">
            Browse available communities and request to join
          </p>
        </div>

        <div className="space-y-4">
          {communities.length === 0 ? (
            <Card className="text-center p-8 shadow-card bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-lg mb-2">No Communities Available</CardTitle>
                <CardDescription>
                  No communities have been created yet. Check back later or ask an admin to create one.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            communities.map((community) => (
              <Card key={community.id} className="shadow-card bg-gradient-card border-border/50 hover:shadow-elevated transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        {community.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-accent" />
                        Admin: {community.adminName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {community.members.length} member{community.members.length !== 1 ? 's' : ''}
                    </div>
                    
                    <Button
                      variant="invite"
                      size="sm"
                      onClick={() => handleSendInvitation(community.id, community.name)}
                      className="flex items-center gap-2"
                      disabled={community.invitations.some(inv => inv.userId === user?.id && inv.status === 'pending')}
                    >
                      <Send className="w-4 h-4" />
                      {community.invitations.some(inv => inv.userId === user?.id && inv.status === 'pending') 
                        ? 'Invitation Sent' 
                        : 'Send Invitation'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/login')}
            className="bg-background/50 backdrop-blur-sm"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Communities;