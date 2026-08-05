import { PrismaClient, ConsultationType, RequirementType, ServiceRequirement } from '@prisma/client';
import { prisma } from '../../database/prisma.client';
import { SaveConsultationInput } from './consultation-engine.dto';
import { addDays, isBefore } from 'date-fns';

export class ConsultationEngineService {
  /**
   * Retrieves the latest consultation records for a customer, optionally filtered by type.
   */
  static async getLatestConsultations(customerId: string, types?: ConsultationType[]) {
    const records = await prisma.consultationRecord.findMany({
      where: {
        customerId,
        ...(types && types.length > 0 ? { type: { in: types } } : {}),
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        hairConsultation: true,
        skinConsultation: true,
        medicalConsultation: true,
      },
    });

    // We only want the *latest* of each type
    const latestByType = new Map<ConsultationType, typeof records[0]>();
    
    for (const record of records) {
      if (!latestByType.has(record.type)) {
        latestByType.set(record.type, record);
      }
    }

    return Array.from(latestByType.values());
  }

  /**
   * Determines what requirements are missing or expired for a set of services.
   */
  static async determineMissingRequirements(customerId: string, serviceIds: string[]) {
    // 1. Get all requirements for the requested services
    const requirements = await prisma.serviceRequirement.findMany({
      where: {
        serviceId: { in: serviceIds },
        isRequired: true,
      },
      include: {
        service: {
          select: { name: true }
        }
      }
    });

    if (requirements.length === 0) {
      return []; // No requirements
    }

    // 2. Get latest consultations to check against freshness
    const neededConsultationTypes = Array.from(
      new Set(
        requirements
          .filter(r => r.type === RequirementType.CONSULTATION && r.consultationType)
          .map(r => r.consultationType as ConsultationType)
      )
    );

    const latestConsultations = await this.getLatestConsultations(customerId, neededConsultationTypes);
    const consultationMap = new Map(latestConsultations.map(c => [c.type, c]));

    const missingOrExpired: Array<ServiceRequirement & { reason: 'MISSING' | 'EXPIRED', serviceName: string }> = [];
    const now = new Date();

    // 3. Evaluate each requirement
    for (const req of requirements) {
      if (req.type === RequirementType.CONSULTATION && req.consultationType) {
        const latestRecord = consultationMap.get(req.consultationType);

        if (!latestRecord) {
          missingOrExpired.push({ ...req, reason: 'MISSING', serviceName: req.service.name });
        } else if (req.validityDays !== null) {
          // Check freshness
          const expirationDate = addDays(new Date(latestRecord.date), req.validityDays);
          if (isBefore(expirationDate, now)) {
            missingOrExpired.push({ ...req, reason: 'EXPIRED', serviceName: req.service.name });
          }
        }
      } else {
        // Handle PATCH_TEST or CONSENT_FORM checking logic here (if they exist in ConsultationRecord or elsewhere)
        // For now, assuming we strictly evaluate CONSULTATION types via ConsultationRecord.
        // If it's a PATCH_TEST, typically requires a specific patch test table or logic. We will flag as missing if we don't track it yet.
        missingOrExpired.push({ ...req, reason: 'MISSING', serviceName: req.service.name });
      }
    }

    // Deduplicate by requirement type and consultationType so we don't ask for HAIR consultation twice if 2 services need it
    const uniqueMissing = [];
    const seen = new Set<string>();
    
    for (const req of missingOrExpired) {
      const key = `${req.type}-${req.consultationType || 'NONE'}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMissing.push(req);
      }
    }

    return uniqueMissing;
  }

  /**
   * Saves a new consultation record. Never overwrites history.
   */
  static async saveConsultation(data: SaveConsultationInput, tx: any = prisma) {
    const { customerId, appointmentId, employeeId, type } = data;

    return await tx.consultationRecord.create({
      data: {
        customerId,
        appointmentId,
        employeeId,
        type,
        
        ...(type === ConsultationType.HAIR && data.hairConsultation && {
          hairConsultation: {
            create: data.hairConsultation
          }
        }),
        ...(type === ConsultationType.SKIN && data.skinConsultation && {
          skinConsultation: {
            create: data.skinConsultation
          }
        }),
        ...(type === ConsultationType.MEDICAL && data.medicalConsultation && {
          medicalConsultation: {
            create: data.medicalConsultation
          }
        }),
      },
      include: {
        hairConsultation: true,
        skinConsultation: true,
        medicalConsultation: true,
      }
    });
  }
}
