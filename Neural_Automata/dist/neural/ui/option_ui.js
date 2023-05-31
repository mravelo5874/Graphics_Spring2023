export class option_ui {
    ui_open;
    ui_window;
    ui_button;
    auto_node;
    shade_node;
    mode_node;
    brush_node;
    zoom_node;
    constructor() {
        // handle ui button
        this.ui_open = true;
        this.ui_window = document.getElementById("opt_window");
        this.ui_button = document.getElementById("opt_button");
        this.ui_button.style.cssText = 'background-color:white;color:rgba(0, 0, 0, 0.85);';
        this.ui_button.addEventListener("click", () => {
            this.toggle_ui_window();
        });
        // add automata text element to screen
        const auto_element = document.querySelector("#auto");
        this.auto_node = document.createTextNode("");
        auto_element?.appendChild(this.auto_node);
        this.auto_node.nodeValue = '';
        // add shader text element to screen
        const shade_element = document.querySelector("#shade");
        this.shade_node = document.createTextNode("");
        shade_element?.appendChild(this.shade_node);
        this.shade_node.nodeValue = '';
        // add mode text element to screen
        const mode_element = document.querySelector("#mode");
        this.mode_node = document.createTextNode("");
        mode_element?.appendChild(this.mode_node);
        this.mode_node.nodeValue = '';
        // add brush text element to screen
        const brush_element = document.querySelector("#brush");
        this.brush_node = document.createTextNode("");
        brush_element?.appendChild(this.brush_node);
        this.brush_node.nodeValue = '';
        // add zoom text element to screen
        const zoom_element = document.querySelector("#zoom");
        this.zoom_node = document.createTextNode("");
        zoom_element?.appendChild(this.zoom_node);
        this.zoom_node.nodeValue = '';
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
//# sourceMappingURL=option_ui.js.map