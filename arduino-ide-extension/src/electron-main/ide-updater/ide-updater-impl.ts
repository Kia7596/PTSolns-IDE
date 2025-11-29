import { injectable } from '@theia/core/shared/inversify';
import { UpdateInfo, CancellationToken, autoUpdater } from 'electron-updater';
import { UpdateChannel } from '../../browser/arduino-preferences';
import {
  IDEUpdater,
  IDEUpdaterClient,
} from '../../common/protocol/ide-updater';

@injectable()
export class IDEUpdaterImpl implements IDEUpdater {
  private isAlreadyChecked = false;
  private updater = autoUpdater;
  private cancellationToken?: CancellationToken;
  protected theiaFEClient?: IDEUpdaterClient;
  protected clients: Array<IDEUpdaterClient> = [];

  constructor() {
    this.updater.on('checking-for-update', (e) => {
      this.clients.forEach((c) => c.notifyCheckedForUpdate(e));
    });
    this.updater.on('update-available', (e) => {
      this.clients.forEach((c) => c.notifyUpdateAvailableFound(e));
    });
    this.updater.on('update-not-available', (e) => {
      this.clients.forEach((c) => c.notifyUpdateAvailableNotFound(e));
    });
    this.updater.on('download-progress', (e) => {
      this.clients.forEach((c) => c.notifyDownloadProgressChanged(e));
    });
    this.updater.on('update-downloaded', (e) => {
      this.clients.forEach((c) => c.notifyDownloadFinished(e));
    });
    this.updater.on('error', (e) => {
      this.clients.forEach((c) => c.notifyUpdaterFailed(e));
    });
  }

  async init(_channel: UpdateChannel, baseUrl: string): Promise<void> {
    this.updater.autoDownload = false;
    this.updater.channel = UpdateChannel.Stable; // hardcode to 'stable'

    const githubRepoUrl = new URL(baseUrl);
    const pathSegments = githubRepoUrl.pathname.split('/').filter(Boolean);
    const owner = pathSegments[0]; // 'PTSolns'
    const repo = pathSegments[1]; // 'PTSolns-IDE'

    this.updater.setFeedURL({
      provider: 'github',
      owner,
      repo,
    });
  }

  setClient(client: IDEUpdaterClient | undefined): void {
    if (client) this.clients.push(client);
  }

  async checkForUpdates(initialCheck?: boolean): Promise<UpdateInfo | void> {
    if (initialCheck) {
      if (this.isAlreadyChecked) return Promise.resolve();
      this.isAlreadyChecked = true;
    }

    const { updateInfo, cancellationToken } =
      await this.updater.checkForUpdates();

    this.cancellationToken = cancellationToken;
    if (this.updater.currentVersion.compare(updateInfo.version) === -1) {
      // electron-updater should populate releaseNotes directly from GitHub releases
      return updateInfo;
    }
  }

  async downloadUpdate(): Promise<void> {
    try {
      await this.updater.downloadUpdate(this.cancellationToken);
    } catch (e) {
      if (e.message === 'cancelled') return;
      this.clients.forEach((c) => c.notifyUpdaterFailed(e));
    }
  }

  stopDownload(): void {
    this.cancellationToken?.cancel();
  }

  quitAndInstall(): void {
    this.updater.quitAndInstall();
  }

  disconnectClient(client: IDEUpdaterClient): void {
    const index = this.clients.indexOf(client);
    if (index !== -1) {
      this.clients.splice(index, 1);
    }
  }

  dispose(): void {
    this.clients.forEach(this.disconnectClient.bind(this));
  }
}
