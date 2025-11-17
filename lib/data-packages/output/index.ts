import { Setters } from "@components/data-packages/PackageView";
import type { ExperimentCommon } from "../handlers/activity";
import type { V1 } from "./v1";

export type Output = {
  data: V1;
  // in milliseconds
  span: number;
};

export type ExperimentType = "user" | "guild";

export type Command =
  | Cmd<"user", Output["data"]["user"]>
  | Cmd<"user_safety_flag", Output["data"]["user"]["safety_flags"] extends Set<infer T> ? T : never>
  | Cmd<"user_flag", { old: string; new: string }>
  | Cmd<"application", Output["data"]["applications"][number]>
  | Cmd<"event_type", string>
  | Cmd<"freight_hostname", string>
  | Cmd<"domain", string>
  | Cmd<"user_flow", string>
  | Cmd<"email_type", string>
  | Cmd<"experiment", { type: ExperimentType; common: ExperimentCommon }>
  | Cmd<"experiment_name", { type: ExperimentType; name: string }>
  | Cmd<"__file_size", number>
  | Cmd<"__file_advance", number>
  | Cmd<"__file_end", void>;

interface Cmd<T extends string, D> {
  type: T;
  data: D;
}

export class EventLoop {
  #output: Output["data"];
  #start: number;
  #setters: Setters;

  #files: number;
  #workers: Worker[];

  #resolve: (output: Output) => void;

  constructor(files: number, workers: Worker[], resolve: (output: Output) => void, setters: Setters) {
    this.#output = {
      version: 1,
      user: {
        // @ts-expect-error filled in later
        id: undefined,
        // @ts-expect-error filled in later
        flags: undefined,
        // @ts-expect-error filled in later
        payment_sources: undefined,
        safety_flags: new Set(),
        historical_flags: new Set(),
      },
      applications: [],
      event_types: new Set(),
      freight_hostnames: new Set(),
      user_flows: new Set(),
      email_types: new Set(),
      experiments: {
        user: {},
        guild: {},
      },
    };
    this.#start = performance.now();
    this.#setters = setters;

    this.#files = files;
    this.#workers = workers;

    this.#resolve = resolve;

    if (this.#workers.length === 0) {
      throw new Error("no workers");
    }

    for (const worker of this.#workers) {
      worker.addEventListener("message", (event) => {
        this.processCommand(event.data);
      });
    }
  }

  addFile(file: File) {
    // TODO(arhsm): maybe a better scheduling stratergy
    //              since there are more than 4 files being handled
    //              (4 being the minimum amount of workers spawned)
    //              there needs to be a better way to schedule workers
    //              something based on work completion?
    this.#workers[this.#files % this.#workers.length]!.postMessage(file);
  }

  fileEnd() {
    this.#files--;

    if (this.#files === 0) {
      const end = performance.now();

      sortExperiments(this.#output.experiments.user);
      sortExperiments(this.#output.experiments.guild);

      this.#resolve({
        data: this.#output,
        span: end - this.#start,
      });
    }
  }

  processCommand(command: Command) {
    switch (command.type) {
      case "user":
        command.data.safety_flags = this.#output.user.safety_flags;
        command.data.historical_flags = this.#output.user.historical_flags;

        this.#output.user = command.data;

        break;
      case "user_flag":
        for (const offset of toBitOffsets(command.data.old).concat(toBitOffsets(command.data.new))) {
          this.#output.user.historical_flags.add(offset);
        }

        break;
      case "user_safety_flag":
        this.#output.user.safety_flags.add(command.data);

        break;
      case "application":
        this.#output.applications.push(command.data);

        break;
      case "event_type":
        this.#output.event_types.add(command.data);

        break;
      case "freight_hostname": {
        let last = command.data.lastIndexOf("-");
        let slice = command.data.slice(
          0,
          // (almost) never -1
          last !== -1 ? last : command.data.length,
        );

        last = slice.lastIndexOf("-");

        // remove anything that looks like a hex string
        if (/^[0-9a-f]+$/i.test(slice.slice(last + 1))) {
          slice = slice.slice(0, last);
        }

        this.#output.freight_hostnames.add(slice);

        break;
      }
      case "domain": {
        this.#output.domains.add(command.data);

        break;
      }
      case "user_flow":
        this.#output.user_flows.add(command.data);

        break;
      case "email_type":
        this.#output.email_types.add(command.data);

        break;
      case "experiment": {
        const { type, common } = command.data;
        const target = this.#output.experiments[type];

        target[common.name] ??= new Set();
        target[common.name]!.add({
          bucket: common.bucket,
          revision: common.revision,
          hash_result: common.hash_result,
          population: common.population,
          excluded: common.excluded,
          timestamp: Date.parse(common.timestamp) / 1000,
        });

        break;
      }
      case "experiment_name": {
        const { type, name } = command.data;
        const target = this.#output.experiments[type];

        target[name] ??= new Set();

        break;
      }
      case "__file_size":
        this.#setters.target((old) => old + command.data);

        break;
      case "__file_advance":
        this.#setters.progress((old) => old + command.data);

        break;
      case "__file_end":
        this.fileEnd();

        break;
    }
  }
}

function sortExperiments(experiments: Output["data"]["experiments"]["user"]) {
  for (const [name, set] of Object.entries(experiments)) {
    // @ts-expect-error i don't care!
    experiments[name] = Array.from(set).sort((a, b) => a.timestamp - b.timestamp);
  }
}

function toBitOffsets(str: string) {
  let num = BigInt(str);
  let offset = 0;

  const offsets: number[] = [];

  while (num > 0) {
    if ((num & 1n) == 1n) {
      offsets.push(offset);
    }

    num >>= 1n;

    offset++;
  }

  return offsets;
}
