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
  | Cmd<"application", Output["data"]["applications"][number]>
  | Cmd<"event_type", string>
  | Cmd<"freight_hostname", string>
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
      // @ts-ignore
      user: undefined,
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
    this.#workers[this.#files % this.#workers.length]!.postMessage(file);
  }

  fileEnd() {
    this.#files--;

    if (this.#files === 0) {
      const end = performance.now();

      this.#resolve({
        data: this.#output,
        span: end - this.#start,
      });
    }
  }

  processCommand(command: Command) {
    switch (command.type) {
      case "user":
        this.#output.user = command.data;

        break;
      case "application":
        this.#output.applications.push(command.data);

        break;
      case "event_type":
        this.#output.event_types.add(command.data);

        break;
      case "freight_hostname": {
        const last = command.data.lastIndexOf("-");
        const slice = command.data.slice(
          0,
          // (almost) never -1
          last !== -1 ? last : command.data.length,
        );

        this.#output.freight_hostnames.add(slice);

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
          // TODO(arhsm): handle this
          // timestamp: common.timestamp,
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
