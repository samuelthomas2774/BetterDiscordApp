import ErrorEvent from './error';

class PermissionsError extends ErrorEvent {

    get __eventType() {
        return 'permissions-error';
    }

}

class InsufficientPermissions extends PermissionsError {

    constructor(message) {
        message = `Missing Permission — ${message}`;
        super({
            module: '',
            message,
            err: new Error(message)
        });
    }

}
