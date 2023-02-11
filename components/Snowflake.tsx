export default function Snowflake(props: unknown) {
  return (
    <svg
      id="Snowflake-Deconstruction-Example"
      data-name="Snowflake-Deconstruction"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 450.58 233.56"
      className="dark:text-text-dark text-text-light fill-current"
      {...props}
    >
      <text
        className="snowflake-dec-number snowflake-dec-sz-normal snowflake-dec-reduce-space"
        transform="translate(164.03 9.96)"
      >
        175928847299117063
      </text>
      <text className="snowflake-dec-text snowflake-dec-sz-small" transform="translate(233.5 39.22)">
        to binary
      </text>
      <text className="snowflake-dec-text snowflake-dec-sz-small snowflake-dec-ms" transform="translate(29.68 81.54)">
        Number of milliseconds since the Discord epoch (first second of 2015)
      </text>
      <text
        className="snowflake-dec-text snowflake-dec-sz-small snowflake-dec-worker"
        transform="translate(298.11 81.17)"
      >
        internal
        <tspan x="1.12" y="9.6">
          worker
        </tspan>
        <tspan x="9.12" y="19.2">
          ID
        </tspan>
      </text>
      <text
        className="snowflake-dec-text snowflake-dec-sz-small snowflake-dec-process"
        transform="translate(335.06 81.17)"
      >
        internal
        <tspan x="-0.89" y="9.6">
          process
        </tspan>
        <tspan x="9.12" y="19.2">
          ID
        </tspan>
      </text>
      <text
        className="snowflake-dec-text snowflake-dec-sz-small snowflake-dec-increment"
        transform="translate(369.42 81.17)"
      >
        incremented for every
        <tspan x="2.21" y="9.6">
          generated ID on that
        </tspan>
        <tspan x="24.68" y="19.2">
          process
        </tspan>
      </text>
      <text
        className="snowflake-dec-number snowflake-dec-sz-normal snowflake-dec-reduce-space cls-7"
        transform="translate(3.75 70.32)"
      >
        <tspan className="snowflake-dec-ms">000000100111000100000110010110101100000100</tspan>
        <tspan className="snowflake-dec-worker" x="292.82" y="0">
          00001
        </tspan>
        <tspan className="snowflake-dec-process" x="327.68" y="0">
          00000
        </tspan>
        <tspan className="snowflake-dec-increment" x="362.54" y="0">
          000000000111
        </tspan>
      </text>
      <g className="snowflake-dec-arrow">
        <rect x="226.41" y="21.42" width="0.53" height="25.39" />
        <polygon points="226.68 45.37 224.42 44.36 226.67 48.81 228.91 44.36 226.68 45.37" />
      </g>
      <g className="snowflake-dec-arrow">
        <rect x="89.45" y="83.72" width="0.53" height="22.9" />
        <polygon points="89.71 105.17 87.46 104.16 89.71 108.62 91.95 104.16 89.71 105.17" />
      </g>
      <g className="snowflake-dec-arrow">
        <rect x="89.45" y="143.46" width="0.53" height="12.96" />
        <polygon points="89.72 154.98 87.46 153.96 89.71 158.42 91.95 153.96 89.72 154.98" />
      </g>
      <g className="snowflake-dec-arrow">
        <rect x="89.44" y="193.26" width="0.53" height="12.96" />
        <polygon points="89.7 204.78 87.45 203.77 89.7 208.22 91.94 203.77 89.7 204.78" />
      </g>
      <text className="snowflake-dec-number snowflake-dec-sz-normal" transform="translate(51.34 129.68)">
        41944705796
      </text>
      <text className="snowflake-dec-number snowflake-dec-sz-normal" transform="translate(44.51 179.5)">
        1462015105796
      </text>
      <text className="snowflake-dec-number snowflake-dec-sz-small" transform="translate(445.78 56.28)">
        0
      </text>
      <text className="snowflake-dec-number snowflake-dec-sz-small" transform="translate(363.84 56.28)">
        12
      </text>
      <text className="snowflake-dec-number snowflake-dec-sz-small" transform="translate(323.71 56.28)">
        17
      </text>
      <text className="snowflake-dec-number snowflake-dec-sz-small" transform="translate(290.96 56.28)">
        22
      </text>
      <text className="snowflake-dec-number snowflake-dec-sz-small" transform="translate(0 56.37)">
        64
      </text>
      <text className="snowflake-dec-text snowflake-dec-sz-small" transform="translate(132.54 147.05)">
        + 1420070400000
        <tspan x="-34.99" y="9.6">
          Discord Epoch (unix timestamp in ms)
        </tspan>
      </text>
      <text className="snowflake-dec-text snowflake-dec-sz-small" transform="translate(96.64 200.66)">
        Parse unix timstamp (ms)
      </text>
      <text className="snowflake-dec-text snowflake-dec-sz-normal" transform="translate(8.05 229.66)">
        2016-04-30 11:18:25.796 UTC
      </text>
      <text className="snowflake-dec-text snowflake-dec-sz-small" transform="translate(93.2 96.22)">
        to decimal
      </text>
    </svg>
  );
}
