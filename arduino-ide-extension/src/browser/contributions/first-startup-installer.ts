import { LocalStorageService } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import {
  BoardsService,
  LibraryLocation,
  LibraryService,
  ConfigService,
  Config,
} from '../../common/protocol';
import { Contribution } from './contribution';

const Arduino_BuiltIn = 'Arduino_BuiltIn';

@injectable()
export class FirstStartupInstaller extends Contribution {
  @inject(LocalStorageService)
  private readonly localStorageService: LocalStorageService;
  @inject(BoardsService)
  private readonly boardsService: BoardsService;
  @inject(LibraryService)
  private readonly libraryService: LibraryService;
  @inject(ConfigService)
  private readonly configService: ConfigService;

  override async onReady(): Promise<void> {
    const ptsolnsBoardsUrl = 'https://ptsolns.github.io/PTSolnsCore/boards.json';
    const configState = await this.configService.getConfiguration();
    const currentAdditionalUrls = configState.config?.additionalUrls || [];

    if (!currentAdditionalUrls.includes(ptsolnsBoardsUrl)) {
      const updatedAdditionalUrls = [...currentAdditionalUrls, ptsolnsBoardsUrl];
      const newConfig: Config = {
        ...configState.config!,
        additionalUrls: updatedAdditionalUrls,
      };
      await this.configService.setConfiguration(newConfig);
      console.log(`Added ${ptsolnsBoardsUrl} to additional board URLs.`);
    }

    const isFirstStartup = !(await this.localStorageService.getData(
      FirstStartupInstaller.INIT_LIBS_AND_PACKAGES
    ));

    if (isFirstStartup) {
      const boardInstallationErrors: Error[] = [];

      // Install Arduino AVR platform
      const avrPackage = await this.boardsService.getBoardPackage({
        id: 'arduino:avr',
      });
      if (avrPackage) {
        try {
          await this.boardsService.install({
            item: avrPackage,
            noOverwrite: true, // We don't want to automatically replace custom platforms the user might already have in place
          });
        } catch (e) {
          // There's no error code, I need to parse the error message: https://github.com/arduino/arduino-cli/commit/ffe4232b359fcfa87238d68acf1c3b64a1621f14#diff-10ffbdde46838dd9caa881fd1f2a5326a49f8061f6cfd7c9d430b4875a6b6895R62
          if (
            !e.message.includes(
              `Platform ${avrPackage.id}@${avrPackage.installedVersion} already installed`
            )
          ) {
            boardInstallationErrors.push(e);
          }
          console.error(`Error installing ${avrPackage.id}:`, e);
        }
      } else {
        boardInstallationErrors.push(new Error('Could not find arduino:avr platform.'));
      }

      // Fetch and install PTSolns boards
      try {
        const response = await fetch(ptsolnsBoardsUrl);
        const boardsJson = await response.json();
        const ptsolnsBoardIds = ['PTSolnsAVR:avr', 'PTSolnsESP32:esp32'];

        for (const boardId of ptsolnsBoardIds) {
          const [packager, architecture] = boardId.split(':');
          const ptsolnsPackage = boardsJson.platforms.find(
            (p: any) => p.archiveFileName.includes(packager) && p.architecture === architecture
          );

          if (ptsolnsPackage) {
            try {
              // The `boards.json` provides the package details for CLI installation.
              // I need to map this to `BoardsPackage` expected by `boardsService.install`.
              // For simplicity, I'll use `getBoardPackage` which correctly structures the data.
              const pkgToInstall = await this.boardsService.getBoardPackage({ id: boardId });
              if (pkgToInstall) {
                await this.boardsService.install({
                  item: pkgToInstall,
                  noOverwrite: true,
                });
              } else {
                boardInstallationErrors.push(new Error(`Could not find package details for ${boardId}.`));
              }
            } catch (e: any) {
              if (
                !e.message.includes(
                  `Platform ${boardId} already installed`
                )
              ) {
                boardInstallationErrors.push(e);
              }
              console.error(`Error installing ${boardId}:`, e);
            }
          } else {
            boardInstallationErrors.push(new Error(`Could not find ${boardId} in fetched boards.json.`));
          }
        }
      } catch (e: any) {
        boardInstallationErrors.push(new Error(`Failed to fetch or parse PTSolns boards JSON: ${e.message}`));
        console.error('Error fetching PTSolns boards JSON:', e);
      }

      // Install built-in library
      const builtInLibrary = (
        await this.libraryService.search({ query: Arduino_BuiltIn })
      ).find(({ name }) => name === Arduino_BuiltIn);
      if (builtInLibrary) {
        try {
          await this.libraryService.install({
            item: builtInLibrary,
            installDependencies: true,
            noOverwrite: true, // We don't want to automatically replace custom libraries the user might already have in place
            installLocation: LibraryLocation.BUILTIN,
          });
        } catch (e: any) {
          if (!/Library (.*) is already installed/.test(e.message)) {
            boardInstallationErrors.push(e);
          }
          console.error(`Error installing ${Arduino_BuiltIn} library:`, e);
        }
      } else {
        boardInstallationErrors.push(new Error('Could not find Arduino_BuiltIn library.'));
      }

      // Report all errors
      boardInstallationErrors.forEach(error => {
        if (!error.message.includes('Cannot read properties of undefined')) {
            this.messageService.error(`Could not complete initial setup: ${error.message}`);
        }
      });

      // Set flag to prevent re-execution on subsequent startups, even if some errors occurred
      await this.localStorageService.setData(
        FirstStartupInstaller.INIT_LIBS_AND_PACKAGES,
        true
      );
    }
  }
}
export namespace FirstStartupInstaller {
  export const INIT_LIBS_AND_PACKAGES = 'initializedLibsAndPackages';
}
