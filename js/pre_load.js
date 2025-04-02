/*EXPLICIT ALL RIGHTS RESERVED 2024
I'm not responsible for any damage caused by this code
This code is provided as is, without any warranty
 
LICENSE: CC BY-NC-SA 4.0
LINK: https://creativecommons.org/licenses/by-nc-sa/4.0/
DESCRIPTION: You are free to share and adapt, but you must give appropriate credit, provide a link to the license,
and indicate if changes were made. You may not use the material for commercial purposes. 
If you remix, transform, or build upon the material, 
you must distribute your contributions under the same license as the original.
 
//html2canvas -> Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>. Licensed under the MIT License.
//jsPDF -> Copyright (c) 2010-2021 James Hall, https://github.com/MrRio/jsPDF (c) 2015-2021 yWorks GmbH, https://www.yworks.com/
//tippy.js <- https://github.com/atomiks/tippyjs (MIT License: Copyright (c) 2017-present atomiks)
//Swal <- https://sweetalert2.github.io/ (MIT License: Copyright (c) 2014 Tristan Edwards & Limon Monte)
 
DATE OF CREATION: 2024-04-10
*/

//GLOBALS USED IN THE WHOLE PROJECT
String.prototype.strip = function () {
    return this.replace(/ |\t|\n/g, "")
}
const num_reg = /^[0-9]+$/;
const _now = new Date().toISOString().split('T')[0];
const _after = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
const A4_FORMAT = [1654, 2339];//A4 format in pixels 200dpi
const random_id = () => { return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); }

function loadScript(url) {
    let script = document.createElement("script");
    script.src = "js/" + url;
    document.head.appendChild(script);
}

function number_precaution(elem){
    flag = num_reg.test(elem.value);
    elem.value = elem.value.replace(/[^0-9.,]/g, "");
    return flag;
}

async function loadImageFromUrl(imageUrl) {
    let img = document.createElement("img");
    let resp = await fetch(imageUrl);
    let blob = await resp.blob();
    let objectURL = URL.createObjectURL(blob);
    img.src = objectURL;
    return img;
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.innerWidth / window.innerHeight <= 1) return document.body.outerHTML = "service disponible uniquement sur ordinateur.";
    //load icon_and_background.js
    loadScript("icon_and_background.js");
    loadScript("main.js");
    loadScript("right_side.js");
    loadScript("color.js");
    loadScript("span_placeholder.js");
});