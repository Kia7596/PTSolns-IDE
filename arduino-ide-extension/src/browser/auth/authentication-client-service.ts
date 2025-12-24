import { inject, injectable } from '@theia/core/shared/inversify';
import { Emitter } from '@theia/core/lib/common/event';
import { JsonRpcProxy } from '@theia/core/lib/common/messaging/proxy-factory';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { FrontendApplicationContribution } from '@theia/core/lib/browser/frontend-application-contribution';
import {
  CommandRegistry,
  CommandContribution,
} from '@theia/core/lib/common/command';
import {
  AuthenticationService,
  AuthenticationServiceClient,
  AuthenticationSession,
} from '../../common/protocol/authentication-service';
import { ArduinoPreferences } from '../arduino-preferences';

@injectable()
export class AuthenticationClientService
  implements
    FrontendApplicationContribution,
    CommandContribution,
    AuthenticationServiceClient
{
  @inject(AuthenticationService)
  protected readonly service: JsonRpcProxy<AuthenticationService>;

  @inject(WindowService)
  protected readonly windowService: WindowService;

  @inject(ArduinoPreferences)
  protected readonly arduinoPreferences: ArduinoPreferences;

  protected _session: AuthenticationSession | undefined;
  protected readonly toDispose = new DisposableCollection();
  protected readonly onSessionDidChangeEmitter = new Emitter<
    AuthenticationSession | undefined
  >();

  readonly onSessionDidChange = this.onSessionDidChangeEmitter.event;

  async onStart(): Promise<void> {
    this.toDispose.push(this.onSessionDidChangeEmitter);
    this.service.setClient(this);
    this.service
      .session()
      .then((session) => this.notifySessionDidChange(session));

    this.service.initAuthSession();

    this.arduinoPreferences.onPreferenceChanged((event) => {
      if (event.preferenceName.startsWith('arduino.auth.')) {
        // Removed setOptions as it was cloud-specific
      }
    });
  }

  protected updateSession(session?: AuthenticationSession | undefined) {
    this._session = session;
    this.onSessionDidChangeEmitter.fire(this._session);
  }

  get session(): AuthenticationSession | undefined {
    return this._session;
  }

  registerCommands(registry: CommandRegistry): void {
  }

  notifySessionDidChange(session: AuthenticationSession | undefined): void {
    this.updateSession(session);
  }
}
