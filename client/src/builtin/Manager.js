import { default as EmoteModule } from './EmoteModule';
import { default as ReactDevtoolsModule } from './ReactDevtoolsModule';
import { default as VueDevtoolsModule } from './VueDevToolsModule';
import { default as TrackingProtection } from './TrackingProtection';

export default class {
    static initAll() {
        EmoteModule.init();
        ReactDevtoolsModule.init();
        VueDevtoolsModule.init();
        TrackingProtection.init();
    }
}
