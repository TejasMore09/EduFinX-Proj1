import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, User } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

interface StudentRecord {
  id: string;
  student_id: string;
  grade_level: string;
  class_section?: string;
  parent_guardian_name?: string;
  parent_guardian_phone?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentRecord, setStudentRecord] = useState<StudentRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    student_id: "",
    grade_level: "",
    class_section: "",
    parent_guardian_name: "",
    parent_guardian_phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setFormData(prev => ({
          ...prev,
          full_name: profileData.full_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
        }));
      }

      // Load student record
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (studentData) {
        setStudentRecord(studentData);
        setFormData(prev => ({
          ...prev,
          student_id: studentData.student_id || "",
          grade_level: studentData.grade_level || "",
          class_section: studentData.class_section || "",
          parent_guardian_name: studentData.parent_guardian_name || "",
          parent_guardian_phone: studentData.parent_guardian_phone || "",
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update or create profile
      const profileData = {
        user_id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        role: "student",
      };

      if (profile) {
        await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", profile.id);
      } else {
        await supabase
          .from("profiles")
          .insert([profileData]);
      }

      // Update or create student record
      const studentData = {
        user_id: user.id,
        student_id: formData.student_id,
        grade_level: formData.grade_level,
        class_section: formData.class_section || null,
        parent_guardian_name: formData.parent_guardian_name || null,
        parent_guardian_phone: formData.parent_guardian_phone || null,
      };

      if (studentRecord) {
        await supabase
          .from("students")
          .update(studentData)
          .eq("id", studentRecord.id);
      } else {
        await supabase
          .from("students")
          .insert([studentData]);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Manage your personal details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Input
                  id="grade_level"
                  value={formData.grade_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade_level: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_section">Class Section</Label>
                <Input
                  id="class_section"
                  value={formData.class_section}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_section: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Guardian Information</CardTitle>
            <CardDescription>
              Parent or guardian contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_guardian_name">Guardian Name</Label>
                <Input
                  id="parent_guardian_name"
                  value={formData.parent_guardian_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_guardian_name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_guardian_phone">Guardian Phone</Label>
                <Input
                  id="parent_guardian_phone"
                  value={formData.parent_guardian_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_guardian_phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}