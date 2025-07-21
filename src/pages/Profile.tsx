import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, User, CreditCard, Plus, Home, Settings, Crown, Wifi, Smartphone } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  isActive: boolean;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'High-Speed Internet', isActive: true },
    { id: '2', name: 'Cable TV', isActive: false },
    { id: '3', name: 'Gym Access', isActive: true },
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  const [showAddService, setShowAddService] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Mock data for demo
  const totalResidents = 24;
  const totalPaymentAmount = 2500.00;
  const userPaidAmount = 150.00;

  const handleAddService = () => {
    if (!newServiceName.trim()) {
      toast({
        title: "Service name required",
        description: "Please enter a service name.",
        variant: "destructive",
      });
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      name: newServiceName.trim(),
      isActive: false
    };

    setServices(prev => [...prev, newService]);
    setNewServiceName('');
    setShowAddService(false);
    
    toast({
      title: "Service added",
      description: `${newServiceName} has been added to your services.`,
    });
  };

  const toggleService = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
  };

  const handlePayment = () => {
    toast({
      title: "Payment processed",
      description: "Your payment has been processed successfully.",
    });
    setShowPayment(false);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header Profile Section */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.fullName}</h1>
                <p className="text-primary-foreground/80 text-sm">
                  Apartment {user.apartmentNumber}
                  {user.role === 'admin' && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20">
              <Edit className="w-5 h-5" />
            </Button>
          </div>
          
          {/* QR Code */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/30 rounded border-2 border-dashed border-white/40"></div>
            </div>
            <p className="text-xs text-primary-foreground/80">Your QR Code</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Community Statistics */}
        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Community Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Residents</span>
              <span className="font-semibold">{totalResidents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Payment Amount</span>
              <span className="font-semibold">${totalPaymentAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Your Paid Amount</span>
              <span className="font-semibold text-success">${userPaidAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section - Members Only */}
        {user.role === 'user' && (
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Options
              </CardTitle>
              <CardDescription>
                Manage your payment preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="payment-toggle" className="text-sm">Enable Quick Pay</Label>
                <Switch 
                  id="payment-toggle"
                  checked={showPayment}
                  onCheckedChange={setShowPayment}
                />
              </div>
              
              {showPayment && (
                <div className="animate-slide-up">
                  <Button 
                    variant="payment" 
                    className="w-full"
                    onClick={handlePayment}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Services Section */}
        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Services
                </CardTitle>
                <CardDescription>
                  Manage your community services
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddService(!showAddService)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddService && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg animate-slide-up">
                <Label htmlFor="service-name" className="text-sm">Service Name</Label>
                <Input
                  id="service-name"
                  placeholder="Enter service name"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddService} size="sm" className="flex-1">
                    Add Service
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddService(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      {service.name.includes('Internet') && <Wifi className="w-4 h-4 text-primary" />}
                      {service.name.includes('TV') && <Smartphone className="w-4 h-4 text-primary" />}
                      {service.name.includes('Gym') && <User className="w-4 h-4 text-primary" />}
                      {!service.name.includes('Internet') && !service.name.includes('TV') && !service.name.includes('Gym') && 
                        <Settings className="w-4 h-4 text-primary" />
                      }
                    </div>
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <Switch
                    checked={service.isActive}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;