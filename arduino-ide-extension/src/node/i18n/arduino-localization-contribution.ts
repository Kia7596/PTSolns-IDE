import {
  LocalizationContribution,
  LocalizationRegistry,
} from '@theia/core/lib/node/i18n/localization-contribution';
import { injectable } from '@theia/core/shared/inversify';

import deJson from '../resources/i18n/de.json';
import enJson from '../resources/i18n/en.json';
import esJson from '../resources/i18n/es.json';
import frJson from '../resources/i18n/fr.json';
import zhJson from '../resources/i18n/zh.json';
import zhHantJson from '../resources/i18n/zh-Hant.json';
import zhTWJson from '../resources/i18n/zh_TW.json';

@injectable()
export class ArduinoLocalizationContribution implements LocalizationContribution {
  // keys: locales
  // values: the required JSON modules
  // If you touch the locales, please keep the alphabetical order. Also in the `package.json` for the VS Code language packs. Thank you! ❤️
  // Note that IDE2 has more translations than available VS Code language packs. (https://github.com/arduino/arduino-ide/issues/1447)
  private readonly locales: Readonly<Record<string, unknown>> = {
    de: deJson,
    en: enJson,
    es: esJson,
    fr: frJson,
    'zh-cn': zhJson,
    'zh-hant': zhHantJson,
    'zh-tw': zhTWJson,
  };

  async registerLocalizations(registry: LocalizationRegistry): Promise<void> {
    for (const [locale, module] of Object.entries(this.locales)) {
      registry.registerLocalizationFromRequire(locale, module);
    }
  }
}
