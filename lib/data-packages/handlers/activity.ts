import z from "zod";
import { Handler, postCommand, readLines } from "../utils";
import { $ZodLooseShape } from "zod/v4/core";
import { error } from "console";

type Events = z.infer<typeof EventsSchema>;

const Event = z.object({
  // event_type: z.string(),
  freight_hostname: z.string().optional(),
  domain: z.string().optional(),
  user_flow: z.string().optional(),
});

const ExperimentCommon = {
  name: z.string(),
  bucket: z.string(),
  revision: z.string(),
  // only in user events
  population: z.string().optional(),
  hash_result: z.string(),
  excluded: z.boolean().optional(),
  // ISO-8601 timestamp
  timestamp: z.iso.datetime(),
};

const AdDecisionCommon = {
  budget_ab_tracking_experiment_names: z.string().array().optional(),
  budget_ab_hash_key: z.string().optional(),
};

const ExperimentNameOptional = {
  experiment: z.string().optional(),
};

const EventsSchema = z.discriminatedUnion("event_type", [
  event("user_flag_updated", { old_flags: z.string(), new_flags: z.string() }),
  // (arhsm): I hate js, I can't use int64 here
  event("user_safety_flag_added", { smite_label: z.string(), flag_type: z.int32() }),
  event("email_sent", { email_type: z.string() }),
  event("experiment_user_triggered", ExperimentCommon),
  event("experiment_user_triggered_fallback", ExperimentCommon),
  event("experiment_user_triggered_ignored", ExperimentCommon),
  event("experiment_guild_triggered", ExperimentCommon),
  event("experiment_guild_triggered_fallback", ExperimentCommon),
  event("experiment_guild_triggered_ignored", ExperimentCommon),
  event("quest_eligibility_checked", ExperimentNameOptional),
  event("ai_endpoint_requested", ExperimentNameOptional),
  event("experiment_user_exposure_suppressed", ExperimentNameOptional),
  event("experiment_user_evaluation_exposed", ExperimentNameOptional),
  event("redeem_holiday_prize", { experiment_id: z.string().optional() }),
  event("ad_decision_final_selector_stage_decision_v2", AdDecisionCommon),
  event("ad_decision_stage_decision", AdDecisionCommon),
  event("ad_decision_filter_stage_decision_v2", AdDecisionCommon),
  event("ad_decision_business_rule_stage_decision_v2", AdDecisionCommon),
  event("ad_decision_provider_stage_decision_v2", AdDecisionCommon),
  event("ads_auction_participant", AdDecisionCommon),
  event("ads_auction_ml_data", AdDecisionCommon),
]);

const EventTypes = new Set(EventsSchema.def.options.flatMap((o) => [...o.shape.event_type.values]));

function event<const S extends string, U extends $ZodLooseShape>(type: S, shape: U) {
  return Event.extend({
    event_type: z.literal(type),
    ...shape,
  });
}

function dispatchEvent(event: Events) {
  emitCommon(event);

  switch (event.event_type) {
    case "user_flag_updated":
      postCommand("user_flag", { old: event.old_flags, new: event.new_flags });

      break;
    case "user_safety_flag_added":
      postCommand("user_safety_flag", { type: event.flag_type, label: event.smite_label });

      break;
    case "email_sent":
      postCommand("email_type", event.email_type);

      break;
    case "experiment_user_triggered":
    case "experiment_user_triggered_fallback":
    case "experiment_user_triggered_ignored":
      postCommand("experiment", { type: "user", common: event });

      break;
    case "experiment_guild_triggered":
    case "experiment_guild_triggered_fallback":
    case "experiment_guild_triggered_ignored":
      postCommand("experiment", { type: "guild", common: event });

      break;
    case "quest_eligibility_checked":
    case "ai_endpoint_requested":
    case "experiment_user_exposure_suppressed":
    case "experiment_user_evaluation_exposed":
      if (event.experiment != null) {
        postCommand("experiment_name", {
          type: "user",
          name: event.experiment,
        });
      }

      break;
    case "redeem_holiday_prize":
      if (event.experiment_id != null) {
        postCommand("experiment_name", {
          type: "user",
          name: event.experiment_id,
        });
      }

      break;
    case "ad_decision_final_selector_stage_decision_v2":
    case "ad_decision_stage_decision":
    case "ad_decision_filter_stage_decision_v2":
    case "ad_decision_business_rule_stage_decision_v2":
    case "ad_decision_provider_stage_decision_v2":
    case "ads_auction_participant":
    case "ads_auction_ml_data":
      for (const name of event.budget_ab_tracking_experiment_names ?? []) {
        postCommand("experiment_name", { type: "user", name });
      }

      if (event.budget_ab_hash_key != null) {
        postCommand("experiment_name", {
          type: "user",
          name: event.budget_ab_hash_key,
        });
      }

      break;
  }
}

function emitCommon(event: Events) {
  postCommand("event_type", event.event_type);

  if (event.freight_hostname != null) {
    postCommand("freight_hostname", event.freight_hostname);
  }

  if (event.domain != null) {
    postCommand("domain", event.domain);
  }

  if (event.user_flow != null) {
    postCommand("user_flow", event.user_flow);
  }
}

export default {
  match(path) {
    const segments = path.split("/");

    return segments.length > 2 && segments[1]!.toLowerCase() === "activity";
  },
  async handle(jsFile) {
    const file = jsFile.webkitRelativePath;

    for await (const { index: line, line: contents } of readLines(jsFile)) {
      let json;
      let jsonErrorType = "recoverable";

      try {
        json = JSON.parse(contents);

        if (typeof json != "object" || json == null) {
          throw new Error(`expected object got ${json == null ? "null" : typeof json}`);
        }

        if (json.event_type == null) {
          // (arhsm): as far as i'm aware there's only one place where this
          //          happens, which are the age and gender prediction "events"
          //          so this is a very trivial error
          jsonErrorType = "trivial";

          throw new Error("got an event without `event_type`");
        }
      } catch (e) {
        postCommand("$error", { file, line, message: (e as Error).message, contents, type: jsonErrorType });

        continue;
      }

      if (!EventTypes.has(json.event_type)) {
        emitCommon(json);

        continue;
      }

      const parsed = EventsSchema.safeParse(json);

      if (!parsed.success) {
        postCommand("$error", { file, line, message: z.prettifyError(parsed.error), contents, type: "fatal" });

        continue;
      }

      dispatchEvent(parsed.data);
    }
  },
} satisfies Handler;
