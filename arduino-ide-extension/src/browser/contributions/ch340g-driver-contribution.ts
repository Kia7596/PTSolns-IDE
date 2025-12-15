import { Command, CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, nls } from '@theia/core/lib/common';
import { CommandService } from '@theia/core/lib/common';
import { BoardsService } from '../../common/protocol'; // Import BoardsService from common/protocol
import { BoardsPackage } from '../../common/protocol'; // Import BoardsPackage
import { inject, injectable } from 'inversify';
import { ArduinoMenus } from '../menu/arduino-menus';

export namespace Ch340gDriverCommands {
  export const INSTALL_CH340G_DRIVER: Command = {
    id: 'arduino-ide.ch340g-driver.install',
    label: nls.localize('arduino/ch340g-driver/install', 'Install Drivers'),
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
    protected boardsService: BoardsService // Type with the interface
  ) {}

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(Ch340gDriverCommands.INSTALL_CH340G_DRIVER, {
      execute: () => this.reinstallPTSolnsBoardsAndDrivers(),
    });
    commands.registerCommand(Ch340gDriverCommands.CH340G_DRIVER_INSTRUCTIONS, {
      execute: () =>
        this.commandService.executeCommand(
          'vscode.open',
          'https://ptsolns.com/CH340'
        ),
    });
  }

    protected async reinstallPTSolnsBoardsAndDrivers(): Promise<void> {
        // Trigger re-installation of ptsolns boards, which causes all the drivers to be also installed
        const packageId = 'PTSolnsAVR:avr';
        const packageNameQuery = 'PTSolnsAVR'; // Used for searching if not found directly

        try {
            const installed = await this.boardsService.getInstalledPlatforms();
            let ptsolnsPackage = installed.find((p: BoardsPackage) => p.id === packageId); // Explicitly type 'p' as BoardsPackage

            if (ptsolnsPackage) {
                console.log(`Found installed PTSolns package (${packageId}). Reinstalling...`);
                await this.boardsService.uninstall({ item: ptsolnsPackage });
                await this.boardsService.install({ item: ptsolnsPackage });
            } else {
                console.log(`PTSolns package (${packageId}) not found among installed. Searching...`);
                const allPackages = await this.boardsService.search({ query: packageNameQuery });
                const foundPtsolnsPackage = allPackages.find((p: BoardsPackage) => p.id === packageId); // Explicitly type 'p' as BoardsPackage

                if (foundPtsolnsPackage) {
                    console.log(`Found PTSolns package (${packageId}) via search. Installing...`);
                    await this.boardsService.install({ item: foundPtsolnsPackage });
                } else {
                    throw new Error(`PTSolnsAVR board package not found. Please ensure it is available or install it manually via CLI.`);
                }
            }
            console.log('PTSolns boards and drivers reinstallation process initiated successfully.');
        } catch (error) {
            console.error('Error during PTSolns boards and drivers reinstallation:', error);
            throw error; // Re-throw to indicate failure
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