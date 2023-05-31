export class filter_ui {
    ui_open;
    ui_window;
    ui_button;
    fps_node;
    res_node;
    constructor() {
        // handle ui button
        this.ui_open = false;
        this.ui_window = document.getElementById("filter_window");
        this.ui_button = document.getElementById("filter_button");
        this.ui_button.addEventListener("click", () => {
            this.toggle_ui_window();
        });
    }
    toggle_ui_window() {
        this.ui_open = !this.ui_open;
        if (this.ui_open) {
            this.ui_window.style.cssText = 'scale:100%;';
            this.ui_button.style.cssText = 'background-color:white;color:rgba(0, 0, 0, 0.85);';
        }
        else {
            this.ui_window.style.cssText = 'scale:0%;';
            this.ui_button.style.cssText = '';
        }
    }
}
//# sourceMappingURL=filter_ui.js.map