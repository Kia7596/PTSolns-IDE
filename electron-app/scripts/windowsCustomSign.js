const { execSync } = require('child_process');
const path = require('path');

exports.default = async function (configuration) {
  // Only run on Windows
  if (process.platform !== 'win32') {
    console.log('[CustomSign] Skipping: Not on Windows.');
    return;
  }

  const filePath = configuration.path;
  console.log(`[CustomSign] Processing target: ${path.basename(filePath)}`);

  // ---------------------------------------------------------
  // STRATEGY 1: Azure Trusted Signing (Priority)
  // ---------------------------------------------------------
  if (process.env.AZURE_SIGNING_METADATA_PATH && process.env.AZURE_DLIB_PATH) {
    console.log('[CustomSign] Azure Trusted Signing configuration detected.');
    
    const dlibPath = process.env.AZURE_DLIB_PATH;
    const metadataPath = process.env.AZURE_SIGNING_METADATA_PATH;

    // Construct the command for Azure
    const cmd = `signtool sign /v /debug /fd sha256 /tr http://timestamp.digicert.com /td sha256 /dlib "${dlibPath}" /dmdf "${metadataPath}" "${filePath}"`;

    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log(`[CustomSign] Successfully signed with Azure: ${path.basename(filePath)}`);
      return; // Success! We are done.
    } catch (error) {
      console.error(`[CustomSign] Azure signing failed. Error: ${error.message}`);
      console.log('[CustomSign] Attempting fallback to legacy signing...');
      // We do NOT return here; we let it fall through to Strategy 2
    }
  }

  // ---------------------------------------------------------
  // STRATEGY 2: Legacy eToken / Certificate Signing (Fallback)
  // ---------------------------------------------------------
  
  if (process.env.CAN_SIGN !== 'true') {
    console.log('[CustomSign] Skipping legacy signing (CAN_SIGN is not true).');
    return;
  }

  const SIGNTOOL_PATH = process.env.SIGNTOOL_PATH || 'signtool';
  const INSTALLER_CERT_WINDOWS_CER = process.env.INSTALLER_CERT_WINDOWS_CER;
  const CERT_PASSWORD = process.env.WIN_CERT_PASSWORD;
  const CONTAINER_NAME = process.env.WIN_CERT_CONTAINER_NAME;

  if (SIGNTOOL_PATH && INSTALLER_CERT_WINDOWS_CER && CERT_PASSWORD && CONTAINER_NAME) {
    console.log('[CustomSign] Legacy eToken configuration detected. Signing...');
    
    // Your original legacy command
    const cmd = `"${SIGNTOOL_PATH}" sign -d "PTSolns IDE" -f "${INSTALLER_CERT_WINDOWS_CER}" -csp "eToken Base Cryptographic Provider" -k "[{{${CERT_PASSWORD}}}]=${CONTAINER_NAME}" -fd sha256 -tr http://timestamp.digicert.com -td SHA256 -v "${filePath}"`;

    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log(`[CustomSign] Successfully signed with Legacy eToken: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`[CustomSign] Legacy signing failed.`);
      throw error; // Fail the build if both methods fail
    }
  } else {
    // If we are in GitHub Actions and expected to sign, fail hard.
    if (process.env.GITHUB_ACTIONS) {
        console.warn(`[CustomSign] Failed: Neither Azure nor Legacy configuration was complete.`);
        process.exit(1);
    }
  }
};
