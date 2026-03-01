import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  loading?: boolean;
}

const DataTable = <T extends { id: string }>({ title, columns, data, onAdd, onEdit, onDelete, loading }: DataTableProps<T>) => {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold uppercase">{title}</h2>
        <Button onClick={onAdd} size="sm" className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              {columns.map(col => (
                <TableHead key={col.key} className="font-semibold text-xs uppercase text-muted-foreground tracking-wider">{col.label}</TableHead>
              ))}
              <TableHead className="w-20 text-xs uppercase text-muted-foreground tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground text-sm">No data yet</TableCell></TableRow>
            ) : (
              data.map(item => (
                <TableRow key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  {columns.map(col => (
                    <TableCell key={col.key} className="text-sm">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-7 w-7">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="h-7 w-7 text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
