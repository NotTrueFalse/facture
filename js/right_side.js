
let devise = "€";
document.querySelector("select.devise").addEventListener("change", function (e) {
    devise = e.target.value;
    let elems = document.querySelectorAll("p.devise");
    elems.forEach(c => { c.innerText = devise });
    manage_total();
});


document.getElementById("tva_perc").addEventListener("input", function (e) {
    if(!number_precaution(e.target)) return;
    TVA = parseFloat(e.target.value);
    if (TVA > 100) {
        TVA = 100;
        e.target.value = 100;
    }
    document.getElementById("tva_title").innerText = `TVA (${TVA}%)`;
    manage_total();
});

let quantitebtn = document.querySelector(".toggle_quantity");
saved_quantities = {};
quantitebtn.addEventListener("click", function (e) {
    let me = e.target;
    let elems = document.querySelectorAll(".quantite, .total_ht");
    let prix_unit = document.querySelectorAll(".prix_unit");
    isActive = me.getAttribute("data-active") == "true";
    if (isActive) {
        me.setAttribute("data-active", "false");
        me.innerText = "Activer unitaire";
        isQuantities = false;
        elems.forEach(c => {
            if (c.tagName == "TD" && c.classList.contains("quantite")) {
                Qinput = c.querySelector("input");
                saved_quantities[c.id] = Qinput.value;
                Qinput.value = "1";
                handle_price({ target: Qinput });
            }
            c.style.setProperty("display", "none", "important");
        });
        prix_unit.forEach(c => {
            c.innerText = "Prix HT";
        });
    } else {
        me.setAttribute("data-active", "true");
        me.innerText = "Désactiver unitaire";
        isQuantities = true;
        elems.forEach(c => {
            if (c.tagName == "TD" && c.classList.contains("quantite")) {
                Qinput = c.querySelector("input");
                if (c.id in saved_quantities) {
                    Qinput.value = saved_quantities[c.id];
                } else {
                    Qinput.value = "1";
                }
                handle_price({ target: Qinput });
            }
            c.style.setProperty("display", "");
        });
        prix_unit.forEach(c => {
            c.innerText = "Prix unitaire HT";
        });
    }
});