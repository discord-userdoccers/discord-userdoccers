import z from "zod";

export const PaymentSource = z.object({
  id: z.string(),
  flags: z.string().array(),
});

export const SafetyFlag = z.object({
  // (arhsm): I hate js, I can't use int64 here
  type: z.int32(),
  label: z.string(),
});

export const HistoricalFlag = z.object({
  old: z.string(),
  new: z.string(),
});

export const User = z.object({
  id: z.string(),
  flags: z.string().array(),
  payment_sources: PaymentSource.array(),
  safety_flags: SafetyFlag.array(),
  historical_flags: HistoricalFlag.array(),
});

export const Application = z.object({
  id: z.string(),
  flags: z.string().array(),
});

export const Experiment = z.object({
  bucket: z.string(),
  revision: z.string(),
  hash_result: z.string(),
  population: z.string().optional(),
  excluded: z.boolean().optional(),
  // (arhsm): I hate js, I can't use int64 here
  timestamp: z.int32(),
});

export const Experiments = z.object({
  user: z.record(z.string(), Experiment.array()),
  guild: z.record(z.string(), Experiment.array()),
});

export const Schema = z.object({
  version: z.literal(1),
  user: User,
  applications: Application.array(),
  event_types: z.string().array(),
  frieght_hostnames: z.string().array(),
  domains: z.string().array(),
  user_flows: z.string().array(),
  email_types: z.string().array(),
  experiments: Experiments,
});
