import { db } from '@/lib/db/drizzle';
import { domains, branches } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// CSV Import Schema
const csvRowSchema = z.object({
  hostname: z.string().min(1),
  port: z.string().optional(),
  sni_hostname: z.string().optional(),
  status: z.enum(['active', 'paused', 'deleted']).default('active'),
  branch_code: z.string().optional(),
});

// Parse CSV content
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV parsing
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// POST handler for CSV import
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const contentType = file.type;
    const fileName = file.name.toLowerCase();
    
    if (!contentType.includes('csv') && !contentType.includes('text') && !fileName.endsWith('.csv')) {
      return Response.json({ error: 'File must be CSV format' }, { status: 400 });
    }

    const content = await file.text();
    const rows = parseCSV(content);

    if (rows.length === 0) {
      return Response.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
    }

    const results = {
      imported: 0,
      errors: [] as { row: number; message: string }[],
      skipped: 0,
    };

    // Get all branches for this tenant
    const tenantBranches = await db
      .select()
      .from(branches)
      .where(eq(branches.tenantId, user.tenantId!));

    const branchMap = new Map(tenantBranches.map(b => [b.code?.toLowerCase(), b]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because CSV is 1-indexed and has header row

      const validation = csvRowSchema.safeParse(row);

      if (!validation.success) {
        results.errors.push({
          row: rowNum,
          message: `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`,
        });
        continue;
      }

      const data = validation.data;

      // Check for duplicate hostname
      const existing = await db
        .select()
        .from(domains)
        .where(
          and(
            eq(domains.tenantId, user.tenantId!),
            eq(domains.hostname, data.hostname)
          )
        );

      if (existing.length > 0) {
        results.skipped++;
        continue;
      }

      // Find branch by code if provided
      let branchId: string | null = null;
      if (data.branch_code) {
        const branch = branchMap.get(data.branch_code.toLowerCase());
        if (branch) {
          branchId = branch.id;
        }
      }

      try {
        await db.insert(domains).values({
          tenantId: user.tenantId!,
          branchId,
          hostname: data.hostname,
          port: parseInt(data.port || '443', 10),
          sniHostname: data.sni_hostname || null,
          status: data.status,
          nextCheckAt: new Date(), // Schedule immediate check
        });

        results.imported++;
      } catch (error) {
        results.errors.push({
          row: rowNum,
          message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    return Response.json({
      success: true,
      message: `Imported ${results.imported} domains`,
      results,
    });
  } catch (error) {
    return Response.json(
      { error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
