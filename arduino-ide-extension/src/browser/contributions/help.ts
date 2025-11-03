import { inject, injectable } from '@theia/core/shared/inversify';
import { EditorManager } from '@theia/editor/lib/browser/editor-manager';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { CommandHandler } from '@theia/core/lib/common/command';
import { ArduinoMenus } from '../menu/arduino-menus';
import { QuickInputService } from '@theia/core/lib/browser/quick-input/quick-input-service';
import {
  Contribution,
  Command,
  MenuModelRegistry,
  CommandRegistry,
} from './contribution';
import { nls } from '@theia/core/lib/common';
import { IDEUpdaterCommands } from '../ide-updater/ide-updater-commands';
import { ElectronCommands } from '@theia/core/lib/electron-browser/menu/electron-menu-contribution';

@injectable()
export class Help extends Contribution {
  @inject(EditorManager)
  protected readonly editorManager: EditorManager;

  @inject(WindowService)
  protected readonly windowService: WindowService;

  @inject(QuickInputService)
  protected readonly quickInputService: QuickInputService;

  override registerCommands(registry: CommandRegistry): void {
    const open = (url: string) =>
      this.windowService.openNewWindow(url, { external: true });
    const createOpenHandler = (url: string) =>
      <CommandHandler>{
        execute: () => open(url),
      };
    registry.registerCommand(
      Help.Commands.GETTING_STARTED,
      createOpenHandler('https://www.arduino.cc/en/Guide')
    );
    registry.registerCommand(
      Help.Commands.VISIT_ARDUINO,
      createOpenHandler('https://PTSolns.com/')
    );
    registry.registerCommand(
      Help.Commands.PRIVACY_POLICY,
      createOpenHandler('https://www.arduino.cc/en/privacy-policy')
    );
  }

  override registerMenus(registry: MenuModelRegistry): void {
    registry.unregisterMenuAction({
      commandId: ElectronCommands.TOGGLE_DEVELOPER_TOOLS.id,
    });

    registry.registerMenuAction(ArduinoMenus.HELP__MAIN_GROUP, {
      commandId: Help.Commands.GETTING_STARTED.id,
      order: '0',
    });
    registry.registerMenuAction(ArduinoMenus.HELP__FIND_GROUP, {
      commandId: Help.Commands.FAQ.id,
      order: '5',
    });
    registry.registerMenuAction(ArduinoMenus.HELP__FIND_GROUP, {
      commandId: Help.Commands.VISIT_ARDUINO.id,
      order: '6',
    });
    registry.registerMenuAction(ArduinoMenus.HELP__FIND_GROUP, {
      commandId: Help.Commands.PRIVACY_POLICY.id,
      order: '7',
    });
    registry.registerMenuAction(ArduinoMenus.HELP__FIND_GROUP, {
      commandId: IDEUpdaterCommands.CHECK_FOR_UPDATES.id,
      order: '8',
    });
  }

}

export namespace Help {
  export namespace Commands {
    export const GETTING_STARTED: Command = {
      id: 'arduino-getting-started',
      label: nls.localize('arduino/help/gettingStarted', 'Getting Started'),
      category: 'Arduino',
    };
    export const FAQ: Command = {
      id: 'arduino-faq',
      label: nls.localize('arduino/help/faq', 'Frequently Asked Questions'),
      category: 'Arduino',
    };
    export const VISIT_ARDUINO: Command = {
      id: 'arduino-visit-arduino',
      label: nls.localize('arduino/help/visit', 'Visit PTSolns.com'),
      category: 'Arduino',
    };
    export const PRIVACY_POLICY: Command = {
      id: 'arduino-privacy-policy',
      label: nls.localize('arduino/help/privacyPolicy', 'Privacy Policy'),
      category: 'Arduino',
    };
  }
}
