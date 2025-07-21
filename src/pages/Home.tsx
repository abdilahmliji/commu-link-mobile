import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Plus, Users, DollarSign, AlertCircle, Check, X, Crown } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  amount: number;
  members: Array<{
    userId: string;
    userName: string;
    apartmentNumber: string;
    status: 'paid' | 'not-paid';
  }>;
  createdAt: Date;
}

const Home = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Mock community members for demo
  const mockMembers = [
    { userId: '1', userName: 'John Doe', apartmentNumber: '101' },
    { userId: '2', userName: 'Jane Smith', apartmentNumber: '102' },
    { userId: '3', userName: 'Bob Johnson', apartmentNumber: '201' },
    { userId: '4', userName: 'Alice Brown', apartmentNumber: '202' },
  ];

  const handleAddPayment = () => {
    if (!newPaymentAmount || parseFloat(newPaymentAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    const newPayment: Payment = {
      id: Date.now().toString(),
      amount: parseFloat(newPaymentAmount),
      members: mockMembers.map(member => ({
        ...member,
        status: 'not-paid' as const
      })),
      createdAt: new Date()
    };

    setPayments(prev => [...prev, newPayment]);
    setNewPaymentAmount('');
    setShowAddPayment(false);
    
    toast({
      title: "Payment added successfully",
      description: `Payment of $${newPaymentAmount} has been added for all members.`,
    });
  };

  const togglePaymentStatus = (paymentId: string, userId: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? {
            ...payment,
            members: payment.members.map(member =>
              member.userId === userId
                ? { ...member, status: member.status === 'paid' ? 'not-paid' : 'paid' }
                : member
            )
          }
        : payment
    ));
  };

  const getPaymentStatistics = () => {
    if (payments.length === 0) return { totalMembers: 0, totalPaid: 0, totalNotPaid: 0 };
    
    const latestPayment = payments[payments.length - 1];
    const totalMembers = latestPayment.members.length;
    const totalPaid = latestPayment.members.filter(m => m.status === 'paid').length;
    const totalNotPaid = totalMembers - totalPaid;
    
    return { totalMembers, totalPaid, totalNotPaid };
  };

  const stats = getPaymentStatistics();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header Profile Section */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.fullName}</h1>
                <p className="text-primary-foreground/80 text-sm">
                  Apt {user.apartmentNumber}
                  {user.role === 'admin' && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-primary-foreground/60 text-sm mt-1">
                  {user.phoneNumber || '+1 (555) 123-4567'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          
          {/* QR Code Placeholder */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/30 rounded border-2 border-dashed border-white/40"></div>
            </div>
            <p className="text-xs text-primary-foreground/80">Your QR Code</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Admin Section */}
        {user.role === 'admin' && (
          <>
            {/* Add Payment Button */}
            <Card className="shadow-card bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Payment Management
                </CardTitle>
                <CardDescription>
                  Create and manage community payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showAddPayment ? (
                  <Button 
                    onClick={() => setShowAddPayment(true)}
                    variant="default"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Payment
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Payment Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={newPaymentAmount}
                        onChange={(e) => setNewPaymentAmount(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddPayment} className="flex-1">
                        Create Payment
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddPayment(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            {payments.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <Card className="text-center shadow-soft bg-gradient-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">{stats.totalMembers}</div>
                    <div className="text-xs text-muted-foreground">Total Members</div>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-soft bg-gradient-card border-success/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-success">{stats.totalPaid}</div>
                    <div className="text-xs text-muted-foreground">Paid</div>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-soft bg-gradient-card border-destructive/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-destructive">{stats.totalNotPaid}</div>
                    <div className="text-xs text-muted-foreground">Not Paid</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Payment Table */}
        {payments.length > 0 && (
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Current Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 bg-background/50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">${payment.amount.toFixed(2)}</h4>
                      <span className="text-xs text-muted-foreground">
                        {payment.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {payment.members.map((member) => (
                        <div key={member.userId} className="flex items-center justify-between p-2 rounded bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="text-sm">
                              <div className="font-medium">{member.userName}</div>
                              <div className="text-xs text-muted-foreground">Apt {member.apartmentNumber}</div>
                            </div>
                          </div>
                          {user.role === 'admin' ? (
                            <Button
                              variant={member.status === 'paid' ? 'success' : 'destructive'}
                              size="sm"
                              onClick={() => togglePaymentStatus(payment.id, member.userId)}
                              className="text-xs"
                            >
                              {member.status === 'paid' ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Paid
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3 mr-1" />
                                  Not Paid
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className={`text-xs px-2 py-1 rounded ${
                              member.status === 'paid' 
                                ? 'bg-success/10 text-success' 
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {member.status === 'paid' ? 'Paid' : 'Not Paid'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome message for new users */}
        {payments.length === 0 && user.role !== 'admin' && (
          <Card className="text-center p-8 shadow-card bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Welcome to the Community!</CardTitle>
              <CardDescription>
                Your admin will post payments here. Check back later for updates.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;