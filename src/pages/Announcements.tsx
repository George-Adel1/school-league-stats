import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { Trash2, Plus, Pencil, Image, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Announcement { id: string; title: string; body: string | null; image_url: string | null; published: boolean; created_at: string; }

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const resetForm = () => { setTitle(""); setBody(""); setPublished(false); setImageFile(null); setImagePreview(null); setEditing(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (a: Announcement) => { setEditing(a); setTitle(a.title); setBody(a.body || ""); setPublished(a.published); setImagePreview(a.image_url); setImageFile(null); setDialogOpen(true); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("announcements").upload(path, file);
    if (error) { toast({ title: t("uploadFailed"), description: error.message, variant: "destructive" }); return null; }
    const { data } = supabase.storage.from("announcements").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!title.trim()) { toast({ title: t("titleRequired"), variant: "destructive" }); return; }
    setSaving(true);
    let image_url = editing?.image_url || null;
    if (imageFile) { const url = await uploadImage(imageFile); if (url) image_url = url; }
    if (editing) {
      const { error } = await supabase.from("announcements").update({ title, body: body || null, image_url, published, updated_at: new Date().toISOString() }).eq("id", editing.id);
      if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
      else toast({ title: t("announcementUpdated") });
    } else {
      const { error } = await supabase.from("announcements").insert({ title, body: body || null, image_url, published });
      if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
      else toast({ title: t("announcementCreated") });
    }
    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteAnnouncement"))) return;
    await supabase.from("announcements").delete().eq("id", id);
    toast({ title: t("deleted") });
    fetchAnnouncements();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("announcements")}</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> {t("new")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? t("editAnnouncement") : t("newAnnouncement")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("title")}</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("announcementTitle")} />
              </div>
              <div>
                <Label>{t("body")}</Label>
                <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder={t("details")} rows={3} />
              </div>
              <div>
                <Label>{t("image")}</Label>
                {imagePreview && (
                  <div className="relative mb-2">
                    <img src={imagePreview} alt="" className="w-full h-40 object-cover rounded-md border border-border" />
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={published} onCheckedChange={setPublished} />
                <Label>{t("published")}</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? t("saving") : t("save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t("loading")}</p>
      ) : announcements.length === 0 ? (
        <p className="text-muted-foreground">{t("noAnnouncements")}</p>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-4 border border-border rounded-md bg-card">
              {a.image_url ? (
                <img src={a.image_url} alt="" className="w-16 h-16 rounded object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                  <Image className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground truncate">{a.body || t("noDescription")}</p>
                <span className={`text-xs font-medium ${a.published ? "text-green-500" : "text-muted-foreground"}`}>
                  {a.published ? t("published") : t("draft")}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
