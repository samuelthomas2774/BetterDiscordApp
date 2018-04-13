
import ErrorEvent from './error';

export class PermissionsError extends ErrorEvent {
    constructor(message) {
        super(message);
        this.name = 'PermissionsError';
    }
}

export class InsufficientPermissions extends PermissionsError {
    constructor(message) {
        super(`Missing Permission — ${message}`);
        this.name = 'InsufficientPermissions';
    }
}
