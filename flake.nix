{
  description = "discord-userdoccers";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {nixpkgs, ...}: let
    systems = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];

    forAllSystems = f:
      nixpkgs.lib.genAttrs systems (system: f (import nixpkgs {inherit system;}));
  in {
    formatter = forAllSystems (pkgs: pkgs.alejandra);

    devShells = forAllSystems (pkgs: {
      default = with pkgs;
        mkShell {
          buildInputs = [
            typescript-language-server

            nodejs
            pnpm

            nil
          ];

          shellHook = ''
            # see https://github.com/cloudflare/workerd/issues/1482
            if [[ $(uname -a) == *"NixOS"* ]] then
                if [[ ! -d node_modules/.pnpm ]] then
                    echo "You are on NixOS, please reload the dev shell after \`pnpm install\`"
                else
                    echo "Patching workerd to work on NixOS"

                    ${pkgs.fd}/bin/fd -H -I -t executable workerd node_modules/.pnpm -x ${pkgs.patchelf}/bin/patchelf --set-interpreter ${pkgs.glibc}/lib/ld-linux-x86-64.so.2
                fi
            fi
          '';
        };
    });
  };
}
