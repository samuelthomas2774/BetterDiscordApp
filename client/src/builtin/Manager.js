import { default as EmoteModule } from './EmoteModule';
import { default as ReactDevtoolsModule } from './ReactDevtoolsModule';
import { default as VueDevtoolsModule } from './VueDevToolsModule';
import { default as TrackingProtection } from './TrackingProtection';
import { default as E2EE } from './E2EE';
import { default as ColoredText } from './ColoredText';
import { default as TwentyFourHour } from './24Hour';
import { default as KillClyde } from './KillClyde';
import { default as BlockedMessages } from './BlockedMessages';
import { default as VoiceDisconnect } from './VoiceDisconnect';
import { default as EmoteAc } from './EmoteAc';

export default class {
    static initAll() {
        EmoteModule.init();
        ReactDevtoolsModule.init();
        VueDevtoolsModule.init();
        TrackingProtection.init();
        E2EE.init();
        ColoredText.init();
        TwentyFourHour.init();
        KillClyde.init();
        BlockedMessages.init();
        VoiceDisconnect.init();
        EmoteAc.init();
    }
}
