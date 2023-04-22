import { app2D } from './app2D.js';
import { app3D } from './app3D.js';
import { user_input } from './user_input.js';
import { webgl_util } from './webgl_util.js';
export class neural {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.context = webgl_util.request_context(this.canvas);
        this.app2d = new app2D(this);
        this.app3d = new app3D(this);
        this.user_input = new user_input(this.canvas, this);
        this.curr_app = 'app2d';
    }
    set_2d() {
        this.curr_app = 'app2d';
        this.app3d.end();
        this.app2d.start();
    }
    set_3d() {
        this.curr_app = 'app3d';
        this.app2d.end();
        this.app3d.start();
    }
    toggle_apps() {
        if (this.curr_app == 'app2d') {
            this.set_3d();
        }
        else if (this.curr_app == 'app3d') {
            this.set_2d();
        }
    }
}
export function init_neural() {
    const single = new neural();
    single.set_2d();
}
//# sourceMappingURL=neural.js.map