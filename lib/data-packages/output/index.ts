import z from "zod";
import { Schema } from "./v1";
import { Dispatch, SetStateAction, createContext } from "react";

export type Output = z.infer<typeof Schema>;

export type ExperimentType = "guild" | "user";

export interface ExperimentCommon {
  name: string;
  bucket: string;
  revision: string;
  population?: string;
  hash_result: string;
  excluded?: boolean;
  timestamp: string;
}

export type Error = {
  file: string;
  line: number;
  message: string;
  contents: string;
  // fatal       - error procuring required information, cannot download the
  //               dump as it may or may not be incomplete
  //               (ig we can short-circuit the entire operation here)
  //               TODO(arhsm): ^
  // recoverable - warn user that some information may be missing, can download
  //               the dump
  // trivial     - something went wrong, but its fine
  type: "fatal" | "recoverable" | "trivial";
};

export type Command =
  | Cmd<"user", Omit<Output["user"], "safety_flags" | "historical_flags">>
  | Cmd<"user_safety_flag", Output["user"]["safety_flags"][number]>
  | Cmd<"user_flag", Output["user"]["historical_flags"][number]>
  | Cmd<"application", Output["applications"][number]>
  | Cmd<"event_type", string>
  | Cmd<"freight_hostname", string>
  | Cmd<"domain", string>
  | Cmd<"user_flow", string>
  | Cmd<"email_type", string>
  | Cmd<"experiment", { type: ExperimentType; common: ExperimentCommon }>
  | Cmd<"experiment_name", { type: ExperimentType; name: string }>
  | Cmd<"$error", Error>
  | Cmd<"$file_size", number>
  | Cmd<"$file_advance", number>
  | Cmd<"$file_end", void>;

export type State =
  | { t: "idle" }
  | { t: "processing"; v: number }
  | {
      t: "processed";
      v: { name: string; output: Output; errors: Error[]; time: number };
    };

type StateContext = [State, Dispatch<SetStateAction<State>>];

interface Cmd<T extends string, D> {
  type: T;
  data: D;
}

// @ts-expect-error this will be provided through a component
export const PackageContext = createContext<StateContext>(null);

let workers: Worker[];

// TODO(arhsm): I dont like this class
//              only once instance can and should exist, so like...
//              can I have something else?
class EventLoop {
  // @ts-expect-error set in reset.
  totalSize: number;
  // @ts-expect-error set in reset.
  advancedSize: number;
  // @ts-expect-error set in reset.
  lastReport: number;
  // @ts-expect-error set in reset.
  startTime: number;

  // @ts-expect-error set in reset.
  errors: Error[];

  // @ts-expect-error set in reset.
  name: string;
  // @ts-expect-error set in reset.
  files: number;

  // @ts-expect-error set in reset.
  setState: StateContext[1];

  // @ts-expect-error set in reset.
  cache: {
    user: Extract<Command, { type: "user" }>["data"];
    userSafetyFlags: Set<Extract<Command, { type: "user_safety_flag" }>["data"]>;
    userHistoricalFlags: Extract<Command, { type: "user_flag" }>["data"][];
    applications: Extract<Command, { type: "application" }>["data"][];
    eventTypes: Set<string>;
    freightHostnames: Set<string>;
    domains: Set<string>;
    userFlows: Set<string>;
    emailTypes: Set<string>;
    experiments: { [K in "user" | "guild"]: Record<string, Set<Output["experiments"][K][string][number]>> };
  };

  constructor() {
    this.reset();
  }

  reset() {
    this.setState?.({ t: "idle" });

    this.totalSize = 0;
    this.advancedSize = 0;
    this.lastReport = 0;
    this.startTime = 0;
    this.errors = [];
    this.name = "data-package";
    this.files = 0;
    this.setState = () => {};

    this.cache = {
      // @ts-expect-error this will be filled in later,
      //                  in the event this can't be filled in (which is only,
      //                  when user.json handler fails) a fatal error will
      //                  be emitted
      user: null,
      userSafetyFlags: new Set(),
      userHistoricalFlags: [],
      applications: [],
      eventTypes: new Set(),
      freightHostnames: new Set(),
      domains: new Set(),
      userFlows: new Set(),
      emailTypes: new Set(),
      experiments: {
        user: {},
        guild: {},
      },
    };
  }

  start(files: FileList, setState: StateContext[1]) {
    if (workers == null) {
      workers = new Array(Math.min(4, navigator.hardwareConcurrency)).fill(undefined).map((_, i) => {
        const worker = new Worker(new URL("../worker", import.meta.url), {
          type: "module",
          name: `worker-${i}`,
        });

        worker.addEventListener("message", (event) => this.processCommand(event.data));

        return worker;
      });
    }

    this.startTime = performance.now();

    // caller holds the responsibility for ensuring non zero files
    this.name = files.item(0)!.webkitRelativePath.split("/")[0];
    this.files = files.length;

    this.setState = setState;

    this.reportProgress();

    for (const file of files) {
      // TODO(arhsm): maybe a better scheduling stratergy
      //              since there are more than 4 files being handled
      //              (4 being the minimum amount of workers spawned (unless
      //              max hw concurrency is less than 4))
      //              there needs to be a better way to schedule workers
      //              something based on work completion/freelist?
      workers[this.files % workers.length]!.postMessage(file);
    }
  }

  reportProgress() {
    const { totalSize, advancedSize } = this;

    const now = performance.now();

    if (now - this.lastReport < 2000) return;

    this.lastReport = now;

    if (totalSize === 0 || advancedSize === 0) {
      this.setState({ t: "processing", v: 0 });

      return;
    }

    const progress = (advancedSize / totalSize) * 100;

    this.setState({ t: "processing", v: progress });
  }

  static sortExperiments(exp: EventLoop["cache"]["experiments"]["user" | "guild"]) {
    return Object.fromEntries(
      Object.entries(exp).map(([name, set]) => [name, Array.from(set).sort((a, b) => a.timestamp - b.timestamp)]),
    );
  }

  fileEnd() {
    this.files--;

    if (this.files === 0) {
      const end = performance.now();
      const time = (end - this.startTime) / 1000;

      this.setState({
        t: "processed",
        v: {
          name: this.name,
          output: Schema.parse({
            version: 1,
            user: {
              ...this.cache.user,
              safety_flags: Array.from(this.cache.userSafetyFlags),
              historical_flags: this.cache.userHistoricalFlags,
            },
            applications: this.cache.applications,
            event_types: Array.from(this.cache.eventTypes),
            frieght_hostnames: Array.from(this.cache.freightHostnames),
            domains: Array.from(this.cache.domains),
            user_flows: Array.from(this.cache.userFlows),
            email_types: Array.from(this.cache.emailTypes),
            experiments: {
              user: EventLoop.sortExperiments(this.cache.experiments.user),
              guild: EventLoop.sortExperiments(this.cache.experiments.guild),
            },
          }),
          errors: this.errors,
          time,
        },
      });
    }
  }

  processCommand(command: Command) {
    switch (command.type) {
      case "user":
        this.cache.user = command.data;

        break;
      case "user_safety_flag":
        this.cache.userSafetyFlags.add(command.data);

        break;
      case "user_flag":
        this.cache.userHistoricalFlags.push(command.data);

        break;
      case "application":
        this.cache.applications.push(command.data);

        break;
      case "event_type":
        this.cache.eventTypes.add(command.data);

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

        this.cache.freightHostnames.add(slice);

        break;
      }
      case "domain":
        this.cache.domains.add(command.data);

        break;
      case "user_flow":
        this.cache.userFlows.add(command.data);

        break;
      case "email_type":
        this.cache.emailTypes.add(command.data);

        break;
      case "experiment": {
        const { type, common } = command.data;
        const target = this.cache.experiments[type];

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
        const target = this.cache.experiments[type];

        target[name] ??= new Set();

        break;
      }
      case "$error":
        this.errors.push(command.data);

        break;
      case "$file_size":
        this.totalSize += command.data;
        this.reportProgress();

        break;
      case "$file_advance":
        this.advancedSize += command.data;
        this.reportProgress();

        break;
      case "$file_end":
        this.fileEnd();

        break;
    }
  }
}

export const LOOP = new EventLoop();
