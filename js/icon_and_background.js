// disable max-width
tippy.setDefaultProps({ maxWidth: '' });
let background_upload = document.querySelector(".changeBackground");
background_upload.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    background_upload.classList.add("dragover");
});
background_upload.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    background_upload.classList.remove("dragover");
});
background_upload.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    background_upload.classList.remove("dragover");
    changeBack(e, 0);
});
background_upload.addEventListener("click", function () {
    background_upload.querySelector("input").click();
});
background_upload.querySelector("input").addEventListener("change", (e) => { changeBack(e, 1) }, true);
function changeBack(e, stat) {
    let file = stat ? e.target.files[0] : e.dataTransfer.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        background_upload.querySelector("img").src = reader.result;
        document.forms[0].style.backgroundImage = `url(${reader.result})`;
    }
}


let backgroundImages = document.querySelectorAll(".background_carrousel *[alt=bg], .changeBackground");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");
prev.addEventListener("click", change_background);
next.addEventListener("click", change_background);
function change_background() {
    let currentBackground = document.querySelector(".background_carrousel .active");
    currentBackground.classList.remove("active");
    let index = currentBackground.dataset.index;
    if (this.classList.contains("next")) {
        index++;
    }
    if (this.classList.contains("prev")) {
        index--;
    }
    if (index >= backgroundImages.length) {
        index = 0;
    }
    if (index < 0) {
        index = backgroundImages.length - 1;
    }
    currentBackground = backgroundImages[index];
    currentBackground.classList.add("active");
    if (currentBackground.classList.contains("changeBackground")) {
        if (background_upload.querySelector("img").src.includes("img/upload.png")) return;
        document.forms[0].style.backgroundImage = `url(${background_upload.querySelector("img").src})`;
        return;
    }
    if (!currentBackground || !currentBackground.alt?.includes("bg")) {
        currentBackground = backgroundImages[backgroundImages.length - 1];
    }
    if (currentBackground.src) {
        document.forms[0].style.backgroundImage = `url(${currentBackground.src})`;
    } else {
        document.forms[0].style.backgroundImage = "";
    }
}

tippy(background_upload, {
    content: `taille recommandée: ${A4_FORMAT[0]}x${A4_FORMAT[1]}px (format A4)`,
    allowHTML: true,
    theme: 'custom',
    interactive: true
});

let iconCarousel = document.querySelector(".icon_carousel");
let prevIcon = document.querySelector(".prev_icon");
let nextIcon = document.querySelector(".next_icon");
let uploadIconBtn = document.querySelector(".upload_icon");
let icons = document.querySelectorAll(".icon_carousel [data-index]");

prevIcon.addEventListener("click", change_icon);
nextIcon.addEventListener("click", change_icon);

function change_icon() {
    let currentIcon = document.querySelector(".icon_carousel img.active");
    currentIcon.classList.remove("active");
    currentIcon.style.display = "none";
    
    let index = parseInt(currentIcon.dataset.index);
    if (this.classList.contains("next_icon")) {
        index++;
    }
    if (this.classList.contains("prev_icon")) {
        index--;
    }
    
    if (index >= icons.length) {
        index = 0;
    }
    if (index < 0) {
        index = icons.length - 1;
    }
    
    let nextElement = document.querySelector(`.icon_carousel [data-index="${index}"]`);
    nextElement.classList.add("active");
    nextElement.style.display = "";
    
    if (nextElement.tagName === "BUTTON") {
        icon_upload_handler();
    }
}

uploadIconBtn.addEventListener("click", icon_upload_handler);

function icon_upload_handler() {
    // Store the current active icon before opening the dialog
    let currentIcon = document.querySelector(".icon_carousel img.active");
    
    Swal.fire({
        title: 'Choisissez un fichier',
        input: 'file',
        inputAttributes: {
            accept: 'image/*',
            'aria-label': 'Upload your profile picture'
        }
    }).then((file) => {
        if (file.value) {
            let reader = new FileReader();
            reader.readAsDataURL(file.value);
            reader.onload = function () {
                let uploadedIcon = document.querySelector(".icon_carousel img[data-uploaded='true']");
                if (!uploadedIcon) {
                    uploadedIcon = document.createElement("img");
                    uploadedIcon.setAttribute("alt", "uploaded_icon");
                    uploadedIcon.setAttribute("data-index", icons.length);
                    uploadedIcon.setAttribute("data-uploaded", "true");
                    uploadedIcon.style.display = "none";
                    iconCarousel.insertBefore(uploadedIcon, nextIcon);
                    icons = document.querySelectorAll(".icon_carousel img[data-index]");
                }
                document.querySelectorAll(".icon_carousel img").forEach(img => {
                    img.classList.remove("active");
                    img.style.display = "none";
                });
                
                uploadedIcon.src = reader.result;
                uploadedIcon.classList.add("active");
                uploadedIcon.style.display = "";
            }
        } else {
            document.querySelectorAll(".icon_carousel img").forEach(img => {
                img.classList.remove("active");
                img.style.display = "none";
            });
            
            if (currentIcon) {
                currentIcon.classList.add("active");
                currentIcon.style.display = "";
            } else {
                let firstIcon = document.querySelector(".icon_carousel img[data-index='0']");
                firstIcon.classList.add("active");
                firstIcon.style.display = "";
            }
        }
    });
}

prevIcon.setAttribute("tabindex", "0");
nextIcon.setAttribute("tabindex", "0");
uploadIconBtn.setAttribute("tabindex", "0");

document.querySelector(".icon_carousel img[data-index='0']").classList.add("active");