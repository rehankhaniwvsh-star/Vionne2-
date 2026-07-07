import React from 'react';
import { 
  User, 
  Store, 
  Bell, 
  ShieldCheck, 
  Palette, 
  Globe,
  CreditCard,
  Mail,
  Smartphone,
  Save,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { adminService } from '../../services/adminService';

export function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Settings updated successfully');
    }, 1000);
  };

  const handleForceReset = async () => {
    if (!window.confirm('Are you sure you want to recreate the store into a Dropshipping store? This will delete all existing products, orders, and customer data, and replace them with high-converting dropship data.')) {
      return;
    }

    setIsResetting(true);
    try {
      const success = await adminService.forceResetAndSeedDropshipData();
      if (success) {
        toast.success('Store successfully recreated with top dropshipping products and demo transactions!');
      } else {
        toast.error('Failed to recreate store data. Check console.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error during store re-creation');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium italic">Configure your store environment and account preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 border border-border/50">
          <TabsTrigger value="general" className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Store className="mr-2 h-3.5 w-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Palette className="mr-2 h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Bell className="mr-2 h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" /> Store Information
                </CardTitle>
                <CardDescription className="text-xs font-medium italic">This will be displayed to your customers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="storeName" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Store Name</Label>
                  <Input id="storeName" defaultValue="VIONNE" className="rounded-xl bg-muted/20 border-border/50 h-11" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storeEmail" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Support Email</Label>
                  <Input id="storeEmail" defaultValue="suuport@vionne.com" className="rounded-xl bg-muted/20 border-border/50 h-11" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storePhone" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Business Phone</Label>
                  <Input id="storePhone" defaultValue="+91 9999999999" className="rounded-xl bg-muted/20 border-border/50 h-11" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Regional Settings
                </CardTitle>
                <CardDescription className="text-xs font-medium italic">Configure currency and timezone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="currency" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Base Currency</Label>
                  <Input id="currency" defaultValue="INR (₹)" className="rounded-xl bg-muted/20 border-border/50 h-11" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Timezone</Label>
                  <Input id="timezone" defaultValue="(GMT+05:30) India Standard Time" className="rounded-xl bg-muted/20 border-border/50 h-11" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
             <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-destructive">Danger Zone / Store Migration</CardTitle>
                <CardDescription className="text-xs font-medium italic text-destructive/80">Recreate, reset, or configure irreversible aspects of this workspace.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4 pb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-destructive/20 bg-background/50 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold tracking-tight text-destructive">Recreate Store as Dropshipping Store</p>
                    <p className="text-xs text-muted-foreground max-w-xl">
                      This will delete all current products, orders, and customer data in Firestore, and replace them with high-converting dropshipping products (Sunset Lamp, Portable Blender, Sleep Mask) and simulated purchase records.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 h-11 w-full md:w-auto flex items-center justify-center"
                    onClick={handleForceReset}
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Recreating...</>
                    ) : (
                      <><RefreshCw className="mr-2 h-4 w-4" /> Recreate & Migrate</>
                    )}
                  </Button>
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Automation Settings</CardTitle>
              <CardDescription className="text-xs font-medium italic">Control how notifications are triggered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: 'Customer Email Confirmation', desc: 'Send order details to customer after purchase.', icon: Mail, checked: true },
                { title: 'WhatsApp Admin Alerts', desc: 'Receive instant notifications on WhatsApp for new orders.', icon: Smartphone, checked: true },
                { title: 'SMS Transactional Alerts', desc: 'Send shipping updates via SMS.', icon: Smartphone, checked: false },
                { title: 'Revenue Reports', desc: 'Weekly analytics overview sent to your email.', icon: Globe, checked: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/10 group transition-colors hover:border-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={item.checked} className="data-[state=checked]:bg-primary" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <Button variant="ghost" className="rounded-xl font-bold uppercase tracking-widest text-[10px] px-8 h-12">Cancel Changes</Button>
          <Button 
            className="rounded-xl bg-primary shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-[10px] px-10 h-12"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
          </Button>
      </div>
    </div>
  );
}
