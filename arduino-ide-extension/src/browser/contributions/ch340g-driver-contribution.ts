import { Command, CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, nls } from '@theia/core/lib/common';
// import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';
import { CommandService } from '@theia/core/lib/common';
// import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { inject, injectable } from 'inversify';
import { ArduinoMenus } from '../menu/arduino-menus';

export namespace Ch340gDriverCommands {
  export const INSTALL_CH340G_DRIVER: Command = {
    id: 'arduino-ide.ch340g-driver.install',
    label: nls.localize('arduino/ch340g-driver/install', 'Install CH340G Driver'),
  };
  export const CH340G_DRIVER_INSTRUCTIONS: Command = {
    id: 'arduino-ide.ch340g-driver.instructions',
    label: nls.localize(
      'arduino/ch340g-driver/instructions',
      'CH340G Driver Installation Instructions'
    ),
  };
}

@injectable()
export class Ch340gDriverCommandContribution implements CommandContribution {
  constructor(
    @inject(CommandService)
    protected commandService: CommandService
  ) {}

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(Ch340gDriverCommands.INSTALL_CH340G_DRIVER, {
      execute: () => this.installCh340gDriver(),
    });
    commands.registerCommand(Ch340gDriverCommands.CH340G_DRIVER_INSTRUCTIONS, {
      execute: () =>
        this.commandService.executeCommand(
          'vscode.open',
          'https://ptsolns.com/CH340'
        ),
    });
  }

  protected installCh340gDriver(): void {
    // Placeholder for driver installation logic
    // console.log('Attempting to install CH340G Driver...');
    // In a real scenario, this would involve platform-specific commands
    // to execute the installer located in electron-app/resources/drivers/ch340g
    // For example, on Windows, you might execute 'start electron-app/resources/drivers/ch340g/SETUP.EXE'
    // This would require an Electron-specific IPC call to the main process
    // to execute the command outside the renderer process.
  }
}

@injectable()
export class Ch340gDriverMenuContribution implements MenuContribution {
  registerMenus(menus: MenuModelRegistry): void {
    menus.registerMenuAction(ArduinoMenus.TOOLS__CH340G_DRIVER_GROUP, {
      commandId: Ch340gDriverCommands.INSTALL_CH340G_DRIVER.id,
      label: Ch340gDriverCommands.INSTALL_CH340G_DRIVER.label,
    });
    menus.registerMenuAction(ArduinoMenus.TOOLS__CH340G_DRIVER_GROUP, {
      commandId: Ch340gDriverCommands.CH340G_DRIVER_INSTRUCTIONS.id,
      label: Ch340gDriverCommands.CH340G_DRIVER_INSTRUCTIONS.label,
    });
  }
}
