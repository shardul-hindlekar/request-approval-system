export interface CsvColumn<T> {
  header: string;       // Column header shown in the file
  key: keyof T;         // Which field to pull from each row
  format?: (val: any) => string; // Optional formatter (e.g. dates, currency)
}
 
export function exportToCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
): void {
  // Build header row
  const headerRow = columns.map((c) => `"${c.header}"`).join(",");
 
  // Build data rows — wrap every value in quotes to handle commas in text
  const dataRows = rows.map((row) =>
    columns
      .map((col) => {
        const raw = row[col.key];
        const value = col.format ? col.format(raw) : String(raw ?? "");
        // Escape any double-quotes inside the value
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
 
  const csvContent = [headerRow, ...dataRows].join("\n");
 
  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}