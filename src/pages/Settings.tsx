import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Bell, Shield, Download, Trash2, Save } from "lucide-react";

export default function Settings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    feeReminders: true,
    paymentConfirmations: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
  });
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("INR");
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage or API
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "system";
    setTheme(savedTheme);
    
    // Apply theme
    applyTheme(savedTheme);
  };

  const applyTheme = (selectedTheme: "light" | "dark" | "system") => {
    const root = window.document.documentElement;
    
    if (selectedTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", selectedTheme === "dark");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}.`,
    });
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem("settings", JSON.stringify({
      notifications,
      privacy,
      language,
      currency,
    }));

    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications and alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, email: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, push: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Fee Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming fee deadlines
              </p>
            </div>
            <Switch
              checked={notifications.feeReminders}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, feeReminders: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Payment Confirmations</Label>
              <p className="text-sm text-muted-foreground">
                Receive confirmations when payments are processed
              </p>
            </div>
            <Switch
              checked={notifications.paymentConfirmations}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, paymentConfirmations: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              value={privacy.profileVisibility}
              onValueChange={(value) =>
                setPrivacy(prev => ({ ...prev, profileVisibility: value }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Email Address</Label>
              <p className="text-sm text-muted-foreground">
                Make your email visible to other users
              </p>
            </div>
            <Switch
              checked={privacy.showEmail}
              onCheckedChange={(checked) =>
                setPrivacy(prev => ({ ...prev, showEmail: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Phone Number</Label>
              <p className="text-sm text-muted-foreground">
                Make your phone number visible to other users
              </p>
            </div>
            <Switch
              checked={privacy.showPhone}
              onCheckedChange={(checked) =>
                setPrivacy(prev => ({ ...prev, showPhone: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Storage</CardTitle>
          <CardDescription>
            Manage your data and account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export My Data
          </Button>
          
          <Separator />
          
          <div className="space-y-2">
            <Label className="text-destructive">Danger Zone</Label>
            <p className="text-sm text-muted-foreground">
              Irreversible and destructive actions.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}