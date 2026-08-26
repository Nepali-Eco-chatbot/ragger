{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "huggingface-sharp-env";

  # 1. Native dependencies needed at runtime/build time
  buildInputs = with pkgs; [
    nodejs
    vips
    pkg-config
    gobject-introspection
  ];

  # 2. Force the Node environment to see the missing libraries
  shellHook = ''
    export LD_LIBRARY_PATH="${with pkgs; pkgs.lib.makeLibraryPath [ 
      stdenv.cc.cc.lib 
      glibc 
      vips 
    ]}:$LD_LIBRARY_PATH"
    
    echo "✅ Nix development shell loaded with libstdc++.so.6 and libvips!"
  '';
}
