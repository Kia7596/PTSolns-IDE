const { execSync } = require("child_process");
const path = require("path");

module.exports = async function (context) {
  const { electronPlatformName, appOutDir } = context;

  console.log("afterSign hook triggered");
  console.log("Platform:", electronPlatformName);
  console.log("App output dir:", appOutDir);

  if (electronPlatformName === "win32") {
    console.log("Running Windows deep signing inside afterSign");

    const script = path.join(__dirname, "sign-win-unpacked.ps1");

    execSync(
      `powershell -ExecutionPolicy Bypass -File "${script}" "${appOutDir}"`,
      { stdio: "inherit" }
    );
  }

  if (electronPlatformName === "darwin") {
  console.log("Running macOS notarization");
  const notarizeMod = require("./notarize");
  const notarizeFn = notarizeMod.default || notarizeMod;
  await notarizeFn(context);
}

