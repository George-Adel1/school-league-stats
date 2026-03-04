import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail } from "lucide-react";

const ProfilePage = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string; email: string } | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [session?.user?.id]);

  return (
    <div className="max-w-lg mx-auto py-10">
      <Card className="bg-[#111] border-[#222]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" /> My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Display Name</p>
            <p className="text-white text-lg font-semibold">{profile?.display_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Email</p>
            <p className="text-[#b0b0b0] flex items-center gap-2">
              <Mail className="w-4 h-4" /> {profile?.email ?? session?.user?.email ?? "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
