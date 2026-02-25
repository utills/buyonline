import { Injectable, Logger } from '@nestjs/common';
import { detectIntent } from './fallback-intents.js';
import { parsePlan } from './fallback-data.js';
import * as handlers from './fallback-handlers.js';

@Injectable()
export class FallbackChatService {
  private readonly logger = new Logger(FallbackChatService.name);

  async respond(message: string): Promise<string> {
    const q = message.toLowerCase();
    const intent = detectIntent(q);
    this.logger.debug(`Fallback intent: ${intent} for message: "${message.slice(0, 50)}"`);

    switch (intent) {
      case 'premium_lookup':
        return handlers.premiumLookup(message);

      case 'plans_overview':
        return handlers.plansOverview();

      case 'compare_plans':
        return handlers.comparePlans(message);

      case 'plan_details': {
        const detectedPlan = parsePlan(message);
        // Only respond with plan details if a specific plan was detected
        if (detectedPlan) return handlers.planDetails(detectedPlan);
        // Fall through to default if no plan detected
        return handlers.defaultResponse();
      }

      case 'addons_info':
        return handlers.addonsInfo(message);

      case 'discounts_info':
        return handlers.discountsInfo(message);

      case 'zone_info':
        return handlers.zoneInfo(message);

      case 'family_type_info':
        return handlers.familyTypeInfo(message);

      case 'waiting_period_info':
        return handlers.waitingPeriodInfo();

      case 'pre_existing_info':
        return handlers.preExistingInfo();

      case 'claim_info':
        return handlers.claimInfo();

      case 'installment_info':
        return handlers.installmentInfo();

      case 'tenure_info':
        return handlers.tenureInfo();

      case 'kyc_info':
        return handlers.kycInfo();

      case 'hospitals_info':
        return handlers.hospitalsInfo();

      case 'eligibility_info':
        return handlers.eligibilityInfo();

      case 'copay_info':
        return handlers.copayInfo();

      case 'rules_info':
        return handlers.rulesInfo();

      case 'buy_now':
        return handlers.buyNow();

      case 'greeting':
        return handlers.greeting();

      case 'thanks':
        return "You're welcome! Feel free to ask anything else about our plans, premiums, or coverage.";

      default:
        return handlers.defaultResponse();
    }
  }
}
