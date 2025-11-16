export interface V1 {
  version: 1;
  user: User;
  applications: Application[];
  event_types: Set<string>;
  freight_hostnames: Set<string>;
  user_flows: Set<string>;
  email_types: Set<string>;
  experiments: Experiments;
}

export interface User {
  id: string;
  flags: string[];
  payment_sources: PaymentSource[];
}

export interface PaymentSource {
  id: string;
  flags: string[];
}

export interface Application {
  id: string;
  flags: string[];
}

// TODO(arhsm): sorting
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
  // TODO(arhsm): handle this
  // timestamp: string;
}
