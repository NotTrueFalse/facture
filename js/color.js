let label_devis = document.getElementById("color_indicator");
let color_modes = {
    "#404040":"normal",
    "#f0f0f0":"inversé",
    "#17d57c":"vert",
    "#6c3de5":"violet",
};

const colorThemes = {
    "#404040": {
        "bigTabColor": "#222",
        "tableColor": "#f0f0f0",
        "blackCells": "#000000c8",
        "whiteCells": "#959595aa",
        "white_hover": "#d2d2d2",
        "btn_remove": "#6c3de5",
        "btn_remove_hover": "#5a2fd4",
        "btn_add": "#17d57c",
        "btn_add_hover": "#0fcf7f"
    },
    "#f0f0f0": {
        "bigTabColor": "#0a0a0a",
        "tableColor": "#0a0a0a",
        "blackCells": "#ffffffc8",
        "whiteCells": "#ffffffaa",
        "white_hover": "#f5f5f5",
        "btn_remove": "#6c3de5",
        "btn_remove_hover": "#5a2fd4",
        "btn_add": "#17d57c",
        "btn_add_hover": "#0fcf7f"
    },
    "#17d57c": {
        "bigTabColor": "#0c7a45",
        "tableColor": "#0a0a0a",
        "blackCells": "#0e8f52c8",
        "whiteCells": "#17d57caa",
        "white_hover": "#15c373",
        "btn_remove": "#6c3de5",
        "btn_remove_hover": "#5a2fd4",
        "btn_add": "#0a6338",
        "btn_add_hover": "#084d2c"
    },
    "#6c3de5": {
        "bigTabColor": "#442590",
        "tableColor": "#0a0a0a",
        "blackCells": "#5732b6c8",
        "whiteCells": "#6c3de5aa",
        "white_hover": "#5f35d1",
        "btn_remove": "#17d57c",
        "btn_remove_hover": "#0fcf7f",
        "btn_add": "#452387",
        "btn_add_hover": "#371c6c"
    }
};

function applyTheme(colorKey) {
    const root = document.documentElement;
    const theme = colorThemes[colorKey];
    
    if (theme) {
        for (const [property, value] of Object.entries(theme)) {
            root.style.setProperty(`--${property}`, value);
        }
    }
}
//base theme
applyTheme("#404040");

document.querySelectorAll(".color_picker .color").forEach(c => {
    c.style.setProperty("--color", c.dataset.color);
    c.addEventListener("click", function (e) {
        let color = this.dataset.color;
        this.parentElement.querySelector(".active").classList.remove("active");
        this.classList.add("active");
        label_devis.innerText = "Vous êtes en mode: " + color_modes[color];
        applyTheme(color);
    });
});
