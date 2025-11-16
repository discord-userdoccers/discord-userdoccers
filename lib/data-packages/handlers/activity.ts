import { postCommand, readLines } from "../utils";

export type Event<N extends string, T> = {
  event_type: N;
  freight_hostname?: string;
  user_flow?: string;
} & T;

// TODO(arhsm): flag events
export type Events =
  | Event<"user_flag_updated", { old_flags: string; new_flags: string }>
  | Event<"user_safety_flag_added", { smite_label: string; flag_type: number }>
  | Event<"email_sent", { email_type: string }>
  | Event<"experiment_user_triggered", ExperimentCommon>
  | Event<"experiment_user_triggered_fallback", ExperimentCommon>
  | Event<"experiment_user_triggered_ignored", ExperimentCommon>
  | Event<"experiment_guild_triggered", ExperimentCommon>
  | Event<"experiment_guild_triggered_fallback", ExperimentCommon>
  | Event<"experiment_guild_triggered_ignored", ExperimentCommon>
  | Event<"quest_aligibility_checked", { experiment?: string }>
  | Event<"ai_endpoint_requested", { experiment?: string }>
  | Event<"experiment_user_exposure_suppressed", { experiment?: string }>
  | Event<"experiment_user_evaluation_exposed", { experiment?: string }>
  | Event<"redeem_holiday_prize", { experiment_id?: string }>
  | Event<"ad_decision_final_selector_stage_decision_v2", AdDecisionCommon>
  | Event<"ad_decision_stage_decision", AdDecisionCommon>
  | Event<"ad_decision_filter_stage_decision_v2", AdDecisionCommon>
  | Event<"ad_decision_business_rule_stage_decision_v2", AdDecisionCommon>
  | Event<"ad_decision_provider_stage_decision_v2", AdDecisionCommon>
  | Event<"ads_auction_participant", AdDecisionCommon>
  | Event<"ads_auction_ml_data", AdDecisionCommon>;

export interface ExperimentCommon {
  name: string;
  bucket: string;
  revision: string;
  // only in user events
  population?: string;
  hash_result: string;
  excluded?: boolean;
  // ISO-8601 timestamp
  timestamp: string;
}

export interface AdDecisionCommon {
  budget_ab_tracking_experiment_names?: string[];
  budget_ab_hash_key?: string;
}

function dispatchEvent(event: Events) {
  // degenerate case
  if (event.event_type == null) {
    console.debug('got "event" without a type:', event);

    return;
  }

  postCommand("event_type", event.event_type);

  if (event.freight_hostname != null) {
    postCommand("freight_hostname", event.freight_hostname);
  }

  if (event.user_flow != null) {
    postCommand("user_flow", event.user_flow);
  }

  switch (event.event_type) {
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
    case "quest_aligibility_checked":
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

export async function handle(file: File) {
  await readLines(file, (line) => {
    const hopefullyEvent = JSON.parse(line);

    dispatchEvent(hopefullyEvent);
  });
}
