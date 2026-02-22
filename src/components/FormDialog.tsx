import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  children: React.ReactNode;
}

const FormDialog = ({ open, onOpenChange, title, onSubmit, loading, children }: FormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default FormDialog;
