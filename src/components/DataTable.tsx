import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button onClick={onAdd} size="sm"><Plus className="w-4 h-4 ltr:mr-1 rtl:ml-1" />{t("add")}</Button>
      </div>
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map(col => (
                <TableHead key={col.key} className="font-semibold">{col.label}</TableHead>
              ))}
              <TableHead className="w-24">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">{t("loading")}</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">{t("noData")}</TableCell></TableRow>
            ) : (
              data.map(item => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
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
