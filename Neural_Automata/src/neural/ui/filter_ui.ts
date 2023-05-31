export class filter_ui
{
    private ui_open: boolean
    private ui_window: HTMLDivElement
    private ui_button: HTMLButtonElement

   
    public fps_node: Text;
    public res_node: Text;

    constructor()
    {
        // handle ui button
        this.ui_open = false
        this.ui_window = document.getElementById("filter_window") as HTMLDivElement
        this.ui_button = document.getElementById("filter_button") as HTMLButtonElement
        this.ui_button.addEventListener("click", () => {
            this.toggle_ui_window()
        });
    }

    private toggle_ui_window()
    {
        this.ui_open = !this.ui_open
        if (this.ui_open)
        {
            this.ui_window.style.cssText='scale:100%;';
            this.ui_button.style.cssText='background-color:white;color:rgba(0, 0, 0, 0.85);';
        }
        else
        {
            this.ui_window.style.cssText='scale:0%;';
            this.ui_button.style.cssText='';
        }
    }
}