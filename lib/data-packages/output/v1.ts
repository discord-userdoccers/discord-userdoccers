export interface V1 {
  version: 1;
  user: User;
  applications: Application[];
  event_types: Set<string>;
  freight_hostnames: Set<string>;
  domains: Set<string>;
  user_flows: Set<string>;
  email_types: Set<string>;
  experiments: Experiments;
}

export interface User {
  id: string;
  flags: string[];
  payment_sources: PaymentSource[];
  safety_flags: Set<SafetyFlags>;
  historical_flags: Set<number>;
}

interface SafetyFlags {
  type: number;
  label: string;
}

export interface PaymentSource {
  id: string;
  flags: string[];
}

export interface Application {
  id: string;
  flags: string[];
}

export interface Experiments {
  user: Record<string, Set<Experiment>>;
  guild: Record<string, Set<Experiment>>;
}

export interface Experiment {
  bucket: string;
  revision: string;
  hash_result: string;
  population?: string;
  excluded?: boolean;
  // unix timestamp in seconds
  timestamp: number;
}
