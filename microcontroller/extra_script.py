Import("env")

# We reaply the build flags as they seem to be lost...
env.ProcessFlags(env.get("BUILD_FLAGS"))