import { Command, CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, nls } from '@theia/core/lib/common';
import { CommandService } from '@theia/core/lib/common';
import { BoardsService, ExecutableService } from '../../common/protocol'; // Import BoardsService and ExecutableService from common/protocol
import { inject, injectable } from 'inversify';
import { ArduinoMenus } from '../menu/arduino-menus';

export namespace Ch340gDriverCommands {
  export const INSTALL_CH340G_DRIVER: Command = {
    id: 'arduino-ide.ch340g-driver.install',
    label: nls.localize('arduino/ch340g-driver/install', 'Install CH340G driver'),
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
    protected commandService: CommandService,
    @inject(BoardsService) // Inject the interface
    protected boardsService: BoardsService, // Type with the interface
    @inject(ExecutableService)
    protected executableService: ExecutableService
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

  protected async installCh340gDriver(): Promise<void> {
    try {
      await this.executableService.installCh340gDriver();
      console.log('CH340G driver installation initiated successfully.');
    } catch (error) {
      console.error('Failed to initiate CH340G driver installation:', error);
    }
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