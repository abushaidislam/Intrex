import { db } from './drizzle';
import { 
  jurisdictions, 
  obligationTemplates,
} from './schema';
import { eq, and, isNull } from 'drizzle-orm';

// Bangladesh City Corporations Data
export const bangladeshJurisdictions = [
  {
    countryCode: 'BD',
    region: 'Dhaka Division',
    district: 'Dhaka',
    cityCorporation: 'Dhaka North City Corporation',
    zone: null,
    label: 'Dhaka North City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Dhaka Division',
    district: 'Dhaka',
    cityCorporation: 'Dhaka South City Corporation',
    zone: null,
    label: 'Dhaka South City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Chattogram Division',
    district: 'Chattogram',
    cityCorporation: 'Chattogram City Corporation',
    zone: null,
    label: 'Chattogram City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Khulna Division',
    district: 'Khulna',
    cityCorporation: 'Khulna City Corporation',
    zone: null,
    label: 'Khulna City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Rajshahi Division',
    district: 'Rajshahi',
    cityCorporation: 'Rajshahi City Corporation',
    zone: null,
    label: 'Rajshahi City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Sylhet Division',
    district: 'Sylhet',
    cityCorporation: 'Sylhet City Corporation',
    zone: null,
    label: 'Sylhet City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Barishal Division',
    district: 'Barishal',
    cityCorporation: 'Barishal City Corporation',
    zone: null,
    label: 'Barishal City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Rangpur Division',
    district: 'Rangpur',
    cityCorporation: 'Rangpur City Corporation',
    zone: null,
    label: 'Rangpur City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Mymensingh Division',
    district: 'Mymensingh',
    cityCorporation: 'Mymensingh City Corporation',
    zone: null,
    label: 'Mymensingh City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Dhaka Division',
    district: 'Gazipur',
    cityCorporation: 'Gazipur City Corporation',
    zone: null,
    label: 'Gazipur City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Dhaka Division',
    district: 'Narayanganj',
    cityCorporation: 'Narayanganj City Corporation',
    zone: null,
    label: 'Narayanganj City Corporation',
  },
  {
    countryCode: 'BD',
    region: 'Dhaka Division',
    district: 'Cumilla',
    cityCorporation: 'Cumilla City Corporation',
    zone: null,
    label: 'Cumilla City Corporation',
  },
];

// Default Obligation Templates for Bangladesh
type TemplateCategory = 'trade_license' | 'fire_safety' | 'tax_vat' | 'environmental_permit' | 'inspection_renewal';
type TemplateSeverity = 'low' | 'medium' | 'high' | 'critical';
type RecurrenceType = 'annual' | 'semiannual' | 'quarterly' | 'monthly' | 'custom';

interface ObligationTemplateData {
  category: TemplateCategory;
  title: string;
  description: string;
  recurrenceType: RecurrenceType;
  defaultLeadDays: number;
  defaultGraceDays: number;
  severity: TemplateSeverity;
  isActive: boolean;
}

export const bangladeshObligationTemplates: ObligationTemplateData[] = [
  {
    category: 'trade_license',
    title: 'Trade License Renewal',
    description: 'Annual trade license renewal for business operations within city corporation jurisdiction',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 15,
    severity: 'high',
    isActive: true,
  },
  {
    category: 'fire_safety',
    title: 'Fire Safety Certificate Renewal',
    description: 'Fire safety inspection and certificate renewal for commercial establishments',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 0,
    severity: 'critical',
    isActive: true,
  },
  {
    category: 'tax_vat',
    title: 'VAT Return Filing',
    description: 'Monthly VAT (Value Added Tax) return filing to NBR',
    recurrenceType: 'monthly',
    defaultLeadDays: 7,
    defaultGraceDays: 0,
    severity: 'high',
    isActive: true,
  },
  {
    category: 'tax_vat',
    title: 'Corporate Tax Filing',
    description: 'Annual corporate income tax return filing to NBR',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 0,
    severity: 'critical',
    isActive: true,
  },
  {
    category: 'environmental_permit',
    title: 'Environmental Clearance Certificate',
    description: 'Environmental clearance from Department of Environment (DoE)',
    recurrenceType: 'annual',
    defaultLeadDays: 45,
    defaultGraceDays: 0,
    severity: 'high',
    isActive: true,
  },
  {
    category: 'inspection_renewal',
    title: 'Factory License Renewal',
    description: 'Factory license renewal from Directorate of Inspection for Factories and Establishments (DIFE)',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 15,
    severity: 'high',
    isActive: true,
  },
  {
    category: 'inspection_renewal',
    title: 'Boiler Inspection Certificate',
    description: 'Boiler inspection and certification from Office of the Chief Inspector of Boilers',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 0,
    severity: 'critical',
    isActive: true,
  },
  {
    category: 'inspection_renewal',
    title: 'Weights & Measures License',
    description: 'Weights and measures license renewal for commercial weighing equipment',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 0,
    severity: 'medium',
    isActive: true,
  },
  {
    category: 'trade_license',
    title: 'Import Registration Certificate (IRC)',
    description: 'Import Registration Certificate renewal from Chief Controller of Imports and Exports (CCIE)',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 0,
    severity: 'high',
    isActive: true,
  },
  {
    category: 'trade_license',
    title: 'Export Registration Certificate (ERC)',
    description: 'Export Registration Certificate renewal from Chief Controller of Imports and Exports (CCIE)',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 0,
    severity: 'high',
    isActive: true,
  },
  {
    category: 'environmental_permit',
    title: 'Trade Effluent Discharge Permit',
    description: 'Permit for industrial effluent discharge to water bodies',
    recurrenceType: 'annual',
    defaultLeadDays: 30,
    defaultGraceDays: 0,
    severity: 'high',
    isActive: true,
  },
  {
    category: 'fire_safety',
    title: 'Building Fire Safety Plan Approval',
    description: 'Fire safety plan approval for new buildings/renovations',
    recurrenceType: 'annual',
    defaultLeadDays: 45,
    defaultGraceDays: 0,
    severity: 'critical',
    isActive: true,
  },
];

export async function seedBangladeshData() {
  console.log('Seeding Bangladesh jurisdictions...');

  // Insert jurisdictions
  for (const jurisdiction of bangladeshJurisdictions) {
    const existing = await db
      .select()
      .from(jurisdictions)
      .where(
        and(
          eq(jurisdictions.countryCode, jurisdiction.countryCode),
          eq(jurisdictions.cityCorporation, jurisdiction.cityCorporation)
        )
      );

    if (existing.length === 0) {
      await db.insert(jurisdictions).values(jurisdiction);
      console.log(`Inserted jurisdiction: ${jurisdiction.label}`);
    } else {
      console.log(`Jurisdiction already exists: ${jurisdiction.label}`);
    }
  }

  // Get all jurisdictions for linking templates
  const allJurisdictions = await db.select().from(jurisdictions);

  console.log('Seeding obligation templates...');

  // Insert obligation templates (system-wide, no tenant_id)
  for (const template of bangladeshObligationTemplates) {
    const existing = await db
      .select()
      .from(obligationTemplates)
      .where(
        and(
          eq(obligationTemplates.title, template.title),
          eq(obligationTemplates.category, template.category),
          isNull(obligationTemplates.tenantId)
        )
      );

    if (existing.length === 0) {
      // Link templates to all Bangladesh jurisdictions
      for (const jurisdiction of allJurisdictions.filter(j => j.countryCode === 'BD')) {
        await db.insert(obligationTemplates).values({
          tenantId: null,
          jurisdictionId: jurisdiction.id,
          category: template.category,
          title: template.title,
          description: template.description,
          recurrenceType: template.recurrenceType,
          defaultLeadDays: template.defaultLeadDays,
          defaultGraceDays: template.defaultGraceDays,
          severity: template.severity,
          isActive: template.isActive,
        });
      }
      console.log(`Inserted template: ${template.title}`);
    } else {
      console.log(`Template already exists: ${template.title}`);
    }
  }

  console.log('Bangladesh data seeding completed!');
}

// Run seed if called directly
if (require.main === module) {
  seedBangladeshData()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
