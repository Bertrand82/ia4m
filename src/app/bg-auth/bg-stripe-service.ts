import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BgStripeService {
  
}

function isAbonnementActif(stripeSubscription: Subscription | null, stripeSession: StripeSession | null): boolean {
  if (!stripeSubscription || !stripeSession) {
    return false;
  }
  // Consider the subscription active if it reports status 'active' or if it hasn't expired yet.

  const now = Math.floor(Date.now() / 1000);
  if (stripeSubscription.status === 'active') {
   return true
  }
  if (stripeSession.status === 'incomplete') {
    return true;// Je fais confiance a stripe pour gérer les paiements incomplets
  }

  return false;
}



export interface Price {
  id: string;
  object: "price";
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  custom_unit_amount: any | null;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Record<string, any>;
  nickname: string;
  product: string;
  recurring: {
    interval: string;
    interval_count: number;
    meter: any | null;
    trial_period_days: number | null;
    usage_type: string;
  };
  tax_behavior: string;
  tiers_mode: string | null;
  transform_quantity: any | null;
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

export interface Subscription {
  id: string;
  object: "subscription";
  application: string | null;
  application_fee_percent: number | null;
  automatic_tax: {
    disabled_reason: string | null;
    enabled: boolean;
    liability: string | null;
  };
  billing_cycle_anchor: number;
  billing_cycle_anchor_config: any | null;
  billing_mode: {
    flexible: any | null;
    type: string;
  };
  billing_thresholds: any | null;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  cancellation_details: {
    comment: string | null;
    feedback: string | null;
    reason: string | null;
  };
  collection_method: string;
  created: number;
  currency: string;
  customer: string;
  days_until_due: number | null;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: any[];
  description: string | null;
  discounts: any[];
  ended_at: number | null;
  invoice_settings: {
    account_tax_ids: any | null;
    issuer: {
      type: string;
    };
  };
  items: {
    object: string;
    data: SubscriptionItem[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  latest_invoice: string | null;
  livemode: boolean;
  metadata: Record<string, any>;
  next_pending_invoice_item_invoice: string | null;
  on_behalf_of: string | null;
  pause_collection: any | null;
  payment_settings: {
    payment_method_options: {
      acss_debit: any | null;
      bancontact: any | null;
      card: {
        network: string | null;
        request_three_d_secure: string;
      } | null;
      customer_balance: any | null;
      konbini: any | null;
      sepa_debit: any | null;
      us_bank_account: any | null;
    };
    payment_method_types: string[] | null;
    save_default_payment_method: string;
  };
  pending_invoice_item_interval: any | null;
  pending_setup_intent: any | null;
  pending_update: any | null;
  plan: Plan;
  quantity: number;
  schedule: any | null;
  start_date: number;
  status: string;
  test_clock: any | null;
  transfer_data: any | null;
  trial_end: number | null;
  trial_settings: {
    end_behavior: {
      missing_payment_method: string;
    };
  };
  trial_start: number | null;
}

export interface SubscriptionItem {
  id: string;
  object: "subscription_item";
  billing_thresholds: any | null;
  created: number;
  current_period_end: number;
  current_period_start: number;
  discounts: any[];
  metadata: Record<string, any>;
  plan: Plan;
  price: Price;
  quantity: number;
  subscription: string;
  tax_rates: any[];
}

export interface Plan {
  id: string;
  object: "plan";
  active: boolean;
  amount: number;
  amount_decimal: string;
  billing_scheme: string;
  created: number;
  currency: string;
  interval: string;
  interval_count: number;
  livemode: boolean;
  metadata: Record<string, any>;
  meter: any | null;
  nickname: string;
  product: string;
  tiers_mode: string | null;
  transform_usage: any | null;
  trial_period_days: number | null;
  usage_type: string;
}

export interface StripeSession {
  id: string;
  object: string;
  adaptive_pricing: {
    enabled: boolean;
  };
  after_expiration: any | null;
  allow_promotion_codes: boolean | null;
  amount_subtotal: number;
  amount_total: number;
  automatic_tax: {
    enabled: boolean;
    liability: any | null;
    provider: any | null;
    status: any | null;
  };
  billing_address_collection: any | null;
  branding_settings: {
    background_color: string;
    border_style: string;
    button_color: string;
    display_name: string;
    font_family: string;
    icon: string | null;
    logo: string | null;
  };
  cancel_url: string;
  client_reference_id: string | null;
  client_secret: string | null;
  collected_information: {
    business_name: string | null;
    individual_name: string | null;
    shipping_details: any | null;
  };
  consent: any | null;
  consent_collection: any | null;
  created: number;
  currency: string;
  currency_conversion: any | null;
  custom_fields: any[];
  custom_text: {
    after_submit: string | null;
    shipping_address: string | null;
    submit: string | null;
    terms_of_service_acceptance: string | null;
  };
  customer: string;
  customer_creation: string | null;
  customer_details: {
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    business_name: string | null;
    email: string | null;
    individual_name: string | null;
    name: string | null;
    phone: string | null;
    tax_ids: any[];
  };
  customer_email: string | null;
  discounts: any[];
  expires_at: number;
  invoice: string | null;
  invoice_creation: {
    enabled: boolean;
    invoice_data: {
      account_tax_ids: string[] | null;
      custom_fields: any | null;
      description: string | null;
      footer: string | null;
      issuer: any | null;
      metadata: Record<string, any>;
      rendering_options: any | null;
    };
  };
  livemode: boolean;
  locale: string | null;
  metadata: {
    [key: string]: string;
  };
  mode: string;
  origin_context: any | null;
  payment_intent: string | null;
  payment_link: string | null;
  payment_method_collection: string;
  payment_method_configuration_details: {
    id: string;
    parent: string | null;
  };
  payment_method_options: {
    card: {
      request_three_d_secure: string;
    };
  };
  payment_method_types: string[];
  payment_status: string;
  permissions: any | null;
  phone_number_collection: {
    enabled: boolean;
  };
  recovered_from: any | null;
  saved_payment_method_options: {
    allow_redisplay_filters: string[];
    payment_method_remove: string;
    payment_method_save: string | null;
  };
  setup_intent: string | null;
  shipping_address_collection: any | null;
  shipping_cost: any | null;
  shipping_options: any[];
  status: string;
  submit_type: string | null;
  subscription: string | null;
  success_url: string;
  total_details: {
    amount_discount: number;
    amount_shipping: number;
    amount_tax: number;
  };
  ui_mode: string;
  url: string | null;
  wallet_options: any | null;
}

/////////////////////////////////////

