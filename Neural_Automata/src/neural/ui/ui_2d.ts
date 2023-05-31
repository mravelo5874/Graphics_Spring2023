export class ui_2d
{
    private ui_open: boolean
    private ui_window: HTMLDivElement

    constructor(canvas: HTMLCanvasElement)
    {
        // handle ui button
        this.ui_open = false
        this.ui_window = document.getElementById("ui_2d_window") as HTMLDivElement
        var main_btn = document.getElementById("ui_2d_button") as HTMLButtonElement
        main_btn.addEventListener("click", () => {
            this.toggle_ui_window()
        });
    }

    private toggle_ui_window()
    {
        this.ui_open = !this.ui_open
        if (this.ui_open)
        {
            this.ui_window.style.cssText='scale:100%;';
        }
        else
        {
            this.ui_window.style.cssText='scale:0%;';
        }
    }
}