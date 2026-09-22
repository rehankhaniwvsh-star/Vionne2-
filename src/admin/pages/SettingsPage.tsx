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
  RefreshCw,
  QrCode,
  Zap,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { adminService } from '../../services/adminService';
import { upiService, DEFAULT_UPI_CONFIG } from '../../services/upiService';

export function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  // Store & UPI Settings State
  const [upiSettings, setUpiSettings] = React.useState({
    merchantUpiId: DEFAULT_UPI_CONFIG.merchantUpiId,
    merchantName: DEFAULT_UPI_CONFIG.merchantName,
    mcc: DEFAULT_UPI_CONFIG.mcc,
    prepaidDiscountEnabled: DEFAULT_UPI_CONFIG.prepaidDiscountEnabled,
    prepaidDiscountPercent: DEFAULT_UPI_CONFIG.prepaidDiscountPercent,
    requireUtr: DEFAULT_UPI_CONFIG.requireUtr,
  });

  const [storeInfo, setStoreInfo] = React.useState({
    name: 'VIONNE',
    email: 'uzafa.shop@gmail.com',
    phone: '+91 9999999999',
    currency: 'INR (₹)',
    timezone: '(GMT+05:30) India Standard Time'
  });

  // Load existing settings
  React.useEffect(() => {
    adminService.getSettings().then((data: any) => {
      if (data) {
        if (data.upi) {
          setUpiSettings(prev => ({ ...prev, ...data.upi }));
        }
        if (data.store) {
          setStoreInfo(prev => ({ ...prev, ...data.store }));
        }
      }
    }).catch(err => {
      console.warn('Could not load settings from firestore, using defaults:', err);
    });
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await adminService.updateSettings({
        store: storeInfo,
        upi: upiSettings,
        updatedAt: new Date().toISOString()
      });
      toast.success('Settings & UPI Gateway updated successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings to cloud');
    } finally {
      setIsLoading(false);
    }
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

  // Live test preview UPI URI
  const testUpiUri = upiService.generateUpiUri({
    merchantUpiId: upiSettings.merchantUpiId,
    merchantName: upiSettings.merchantName,
    amount: 1999,
    transactionNote: 'Test Order Payment',
    transactionRef: 'TEST-' + Math.floor(1000 + Math.random() * 9000),
    mcc: upiSettings.mcc
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium italic">Configure your store environment, UPI payment gateway, and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 border border-border/50">
          <TabsTrigger value="general" className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Store className="mr-2 h-3.5 w-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm text-emerald-600 dark:text-emerald-400">
            <Smartphone className="mr-2 h-3.5 w-3.5" /> Payments & UPI
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Bell className="mr-2 h-3.5 w-3.5" /> Notifications
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

        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Form Settings (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Smartphone className="h-4 w-4" /> Merchant UPI Account
                  </CardTitle>
                  <CardDescription className="text-xs font-medium italic">
                    Configure your direct Virtual Payment Address (VPA) to receive customer payments instantly with zero gateway fees.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="merchantUpiId" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">
                        Merchant UPI ID / VPA
                      </Label>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full font-bold">
                        {upiService.detectProvider(upiSettings.merchantUpiId).provider}
                      </span>
                    </div>
                    <Input 
                      id="merchantUpiId" 
                      value={upiSettings.merchantUpiId} 
                      onChange={(e) => setUpiSettings({ ...upiSettings, merchantUpiId: e.target.value.trim() })}
                      placeholder="e.g. uzafa.shop@okaxis or yourbusiness@okhdfcbank" 
                      className="rounded-xl bg-muted/20 border-border/50 h-11 font-mono text-xs" 
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      Customer QR codes and one-tap app payments (GPay, PhonePe, Paytm, CRED) will route directly to this UPI address.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="merchantName" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">
                      Payee Business Name
                    </Label>
                    <Input 
                      id="merchantName" 
                      value={upiSettings.merchantName} 
                      onChange={(e) => setUpiSettings({ ...upiSettings, merchantName: e.target.value })}
                      placeholder="e.g. VIONNE LUXURY or UZAFA STORE" 
                      className="rounded-xl bg-muted/20 border-border/50 h-11 text-xs" 
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      Displayed on the customer's phone when their UPI app opens.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="mcc" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">
                      Merchant Category Code (MCC)
                    </Label>
                    <Input 
                      id="mcc" 
                      value={upiSettings.mcc} 
                      onChange={(e) => setUpiSettings({ ...upiSettings, mcc: e.target.value.trim() })}
                      placeholder="5499" 
                      className="rounded-xl bg-muted/20 border-border/50 h-11 font-mono text-xs" 
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      Standard NPCI code: 5499 (Retail Stores) or 5311 (Department Stores).
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Discount & Verification Rules */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> Incentive & Verification Rules
                  </CardTitle>
                  <CardDescription className="text-xs font-medium italic">
                    Encourage prepaid UPI payments and reduce costly COD return rates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/10">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold tracking-tight">Instant Prepaid UPI Discount</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically deduct {upiSettings.prepaidDiscountPercent}% from cart total when customer chooses UPI.
                      </p>
                    </div>
                    <Switch 
                      checked={upiSettings.prepaidDiscountEnabled} 
                      onCheckedChange={(val) => setUpiSettings({ ...upiSettings, prepaidDiscountEnabled: val })}
                      className="data-[state=checked]:bg-emerald-600" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/10">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold tracking-tight">Require 12-Digit UTR on Checkout</p>
                      <p className="text-xs text-muted-foreground">
                        Require buyers to provide the UPI transaction reference number for instant manual/audit matching.
                      </p>
                    </div>
                    <Switch 
                      checked={upiSettings.requireUtr} 
                      onCheckedChange={(val) => setUpiSettings({ ...upiSettings, requireUtr: val })}
                      className="data-[state=checked]:bg-emerald-600" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Live QR Preview & Testing (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border/50 bg-gradient-to-b from-card/80 to-muted/20 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden text-center">
                <CardHeader className="pb-2">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest mx-auto">
                    <Sparkles className="h-3 w-3" /> Live Customer QR Preview
                  </div>
                  <CardTitle className="text-base font-bold tracking-tight mt-2">
                    Direct Scan & Pay Test
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Scan with any phone camera, Google Pay, PhonePe, or Paytm to verify your UPI ID setup.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 flex flex-col items-center">
                  <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 shadow-lg relative group">
                    <QRCodeSVG 
                      value={testUpiUri}
                      size={180}
                      level="H"
                      className="rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 bg-white rounded-full border border-stone-200 flex items-center justify-center shadow-xs">
                        <span className="text-[8px] font-black text-emerald-800">UPI</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 w-full bg-muted/40 rounded-xl p-3 text-left space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold">Payee VPA:</span>
                      <span className="font-mono font-bold text-foreground truncate max-w-[170px]">{upiSettings.merchantUpiId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold">Business Name:</span>
                      <span className="font-bold text-foreground truncate max-w-[170px]">{upiSettings.merchantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold">Prepaid Discount:</span>
                      <span className="font-bold text-emerald-600">{upiSettings.prepaidDiscountEnabled ? `${upiSettings.prepaidDiscountPercent}% Active` : 'Disabled'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl text-xs font-bold h-10 gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(upiSettings.merchantUpiId);
                        toast.success('UPI ID copied to clipboard');
                      }}
                    >
                      Copy VPA
                    </Button>
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 gap-1.5"
                      onClick={() => {
                        window.location.href = testUpiUri;
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Test App Intent
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-border/50 text-xs text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Direct-to-Bank Settlement
                </p>
                Payments made via this UPI system land immediately in your linked bank account. No 2% aggregator deductions, zero payment gateway rental, and 100% instant cash flow for fulfillment.
              </div>
            </div>
          </div>
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
