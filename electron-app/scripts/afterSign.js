const { execSync } = require("child_process");
const path = require("path");

module.exports = async function (context) {
  const { electronPlatformName, appOutDir } = context;

  console.log("[afterSign] platform:", electronPlatformName);
  console.log("[afterSign] appOutDir:", appOutDir);

  // Linux: do nothing
  if (electronPlatformName === "linux") {
    console.log("[afterSign] Linux detected - skipping");
    return;
  }

  // Windows: deep sign
  if (electronPlatformName === "win32") {
    console.log("[afterSign] Windows detected - deep signing");
    const script = path.join(__dirname, "sign-win-unpacked.ps1");
    execSync(`pwsh -ExecutionPolicy Bypass -File "${script}" "${appOutDir}"`, {
      stdio: "inherit",
    });
    return;
  }

  // macOS: notarize
  if (electronPlatformName === "darwin") {
    console.log("[afterSign] macOS detected - notarizing");
    const notarizeMod = require("./notarize");
    const notarizeFn = notarizeMod.default || notarizeMod;
    await notarizeFn(context);
    return;
  }

  console.log("[afterSign] Unknown platform - skipping");
};
