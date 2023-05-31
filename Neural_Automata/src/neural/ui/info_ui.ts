export class info_ui
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
        this.ui_window = document.getElementById("info_window") as HTMLDivElement
        this.ui_button = document.getElementById("info_button") as HTMLButtonElement
        this.ui_button.style.cssText='background-color:white;color:rgba(0, 0, 0, 0.85);';
        this.ui_button.addEventListener("click", () => {
            this.toggle_ui_window()
        });

        // add fps text element to screen
        const fps_element = document.querySelector("#fps")
        this.fps_node = document.createTextNode("")
        fps_element?.appendChild(this.fps_node)
        this.fps_node.nodeValue = ''

        // add res text element to screen
        const res_element = document.querySelector("#res")
        this.res_node = document.createTextNode("")
        res_element?.appendChild(this.res_node)
        this.res_node.nodeValue = ''
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