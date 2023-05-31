export class ui_2d {
    ui_open;
    ui_window;
    constructor(canvas) {
        // handle ui button
        this.ui_open = false;
        this.ui_window = document.getElementById("ui_2d_window");
        var main_btn = document.getElementById("ui_2d_button");
        main_btn.addEventListener("click", () => {
            this.toggle_ui_window();
        });
    }
    toggle_ui_window() {
        this.ui_open = !this.ui_open;
        if (this.ui_open) {
            this.ui_window.style.cssText = 'scale:100%;';
        }
        else {
            this.ui_window.style.cssText = 'scale:0%;';
        }
    }
}
//# sourceMappingURL=ui_2d.js.map