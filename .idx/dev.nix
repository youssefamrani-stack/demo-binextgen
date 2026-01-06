# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
  ];

  # Sets environment variables in the workspace
  env = {};

  # This adds a file watcher to startup the firebase emulators. The emulators will only start if
  # a firebase.json file is written into the user's directory
  services.firebase.emulators = {
    # Disabling because we are using prod backends right now
    detect = false;
    projectId = "demo-app";
    services = ["auth" "firestore"];
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];

    workspace = {
      onCreate = {
        # ✅ AJOUT: installe les dépendances dès la création du workspace
        installDeps = "npm ci || npm install";

        default.openFiles = [
          "src/app/page.tsx"
        ];
      };

      # ✅ AJOUT (optionnel mais utile): réassure l’installation au démarrage
      onStart = {
        installDeps = "npm ci || npm install";
      };
    };

    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          # ✅ AJOUT: garantit que next est dispo AVANT le dev server
          command = [
            "bash"
            "-lc"
            "npm ci || npm install; npm run dev -- --port $PORT --hostname 0.0.0.0"
          ];
          manager = "web";
        };
      };
    };
  };
}
