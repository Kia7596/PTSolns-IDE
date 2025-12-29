const { execSync } = require('child_process');
const path = require('path');

exports.default = async function (configuration) {
  // 1. Prelim Checks
  if (process.platform !== 'win32') {
    console.log('[CustomSign] Skipping: Not on Windows.');
    return;
  }

  // 2. STRATEGY 1: Azure Trusted Signing (Priority)
  // We check if the workflow set up the Azure variables.
  if (process.env.AZURE_SIGNING_METADATA_PATH && process.env.AZURE_DLIB_PATH) {
    console.log('[CustomSign] Azure Trusted Signing configuration detected.');
    const filePath = configuration.path;
    const dlibPath = process.env.AZURE_DLIB_PATH;
    const metadataPath = process.env.AZURE_SIGNING_METADATA_PATH;

    // Use signtool with Azure Dlib
    const cmd = `signtool sign /v /debug /fd sha256 /tr http://timestamp.digicert.com /td sha256 /dlib "${dlibPath}" /dmdf "${metadataPath}" "${filePath}"`;

    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log(`[CustomSign] Successfully signed with Azure: ${path.basename(filePath)}`);
      return; // Done!
    } catch (error) {
      console.error(`[CustomSign] Azure signing failed: ${error.message}`);
      console.log('[CustomSign] Attempting fallback to legacy signing...');
    }
  }

  // 3. STRATEGY 2: Legacy eToken (Fallback)
  // This is your original code
  if (process.env.CAN_SIGN !== 'true') return;

  const SIGNTOOL_PATH = process.env.SIGNTOOL_PATH || 'signtool';
  const INSTALLER_CERT_WINDOWS_CER = process.env.INSTALLER_CERT_WINDOWS_CER;
  const CERT_PASSWORD = process.env.WIN_CERT_PASSWORD;
  const CONTAINER_NAME = process.env.WIN_CERT_CONTAINER_NAME;
  const filePath = configuration.path;

  if (INSTALLER_CERT_WINDOWS_CER && CERT_PASSWORD && CONTAINER_NAME) {
    console.log('[CustomSign] Legacy eToken configuration detected. Signing...');
    const cmd = `"${SIGNTOOL_PATH}" sign -d "PTSolns IDE" -f "${INSTALLER_CERT_WINDOWS_CER}" -csp "eToken Base Cryptographic Provider" -k "[{{${CERT_PASSWORD}}}]=${CONTAINER_NAME}" -fd sha256 -tr http://timestamp.digicert.com -td SHA256 -v "${filePath}"`;
    execSync(cmd, { stdio: 'inherit' });
  } else {
    // Only fail if we expected to sign but couldn't
    if (process.env.GITHUB_ACTIONS) {
       console.warn('[CustomSign] Failed: No valid signing configuration found.');
       process.exit(1);
    }
  }
};
