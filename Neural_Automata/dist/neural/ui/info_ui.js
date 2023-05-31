export class info_ui {
    ui_open;
    ui_window;
    ui_button;
    fps_node;
    res_node;
    constructor() {
        // handle ui button
        this.ui_open = false;
        this.ui_window = document.getElementById("info_window");
        this.ui_button = document.getElementById("info_button");
        this.ui_button.addEventListener("click", () => {
            this.toggle_ui_window();
        });
        // add fps text element to screen
        const fps_element = document.querySelector("#fps");
        this.fps_node = document.createTextNode("");
        fps_element?.appendChild(this.fps_node);
        this.fps_node.nodeValue = '';
        // add res text element to screen
        const res_element = document.querySelector("#res");
        this.res_node = document.createTextNode("");
        res_element?.appendChild(this.res_node);
        this.res_node.nodeValue = '';
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
//# sourceMappingURL=info_ui.js.map