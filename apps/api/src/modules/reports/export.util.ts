export class ExportUtil {
  /**
   * Converts an array of objects to a CSV string.
   */
  static toCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Header row
    csvRows.push(headers.join(','));
    
    // Data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        // Handle strings with commas, quotes or newlines
        if (typeof val === 'string') {
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        }
        if (val === null || val === undefined) return '';
        return val;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}
