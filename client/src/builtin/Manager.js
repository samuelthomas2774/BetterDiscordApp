import { EmoteModule, EmoteAc } from './Emotes';
import ReactDevtoolsModule from './ReactDevtoolsModule';
import VueDevtoolsModule from './VueDevToolsModule';
import TrackingProtection from './TrackingProtection';
import E2EE from './E2EE';
import ColoredText from './ColoredText';
import TwentyFourHour from './24Hour';
import KillClyde from './KillClyde';
import BlockedMessages from './BlockedMessages';
import VoiceDisconnect from './VoiceDisconnect';

export default class {
    static get modules() {
        return require('./builtin');
    }

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
