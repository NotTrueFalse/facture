(function() {
/*EXPLICIT ALL RIGHTS RESERVED 2024-2025
I'm not responsible for any damage caused by this code
This code is provided as is, without any warranty

LICENSE: CC BY-NC-SA 4.0
LINK: https://creativecommons.org/licenses/by-nc-sa/4.0/
DESCRIPTION: You are free to share and adapt, but you must give appropriate credit, provide a link to the license,
and indicate if changes were made. You may not use the material for commercial purposes. 
If you remix, transform, or build upon the material, 
you must distribute your contributions under the same license as the original.

DATE OF CREATION: 2024-04-10
*/
String.prototype.strip = function(){
    return this.replace(/ |\t|\n/g,"")
}
let TVA = 20;//20% TVA
let isQuantities = true;
let mainForm = document.querySelector(".main form");
mainForm.querySelectorAll("input").forEach(c => {
    c.addEventListener("keypress",(e)=>{//prevent enter from submitting
    if (e.code == '13') {
      event.preventDefault();
    }
});
});
const _now = new Date().toISOString().split('T')[0];
const _after = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
document.querySelectorAll("input[value='NOWVAL']").forEach(c=>{
    c.value = _now;
});
document.querySelectorAll("input[value='AFTERVAL']").forEach(c=>{
    c.value = _after;
});
//get everything from societe, and duplicate for client
let temp_tr = {};
temp_tr["date_table"] = document.querySelector(".date_table tr").cloneNode(true);
temp_tr["tableau_objets"] = document.querySelector(".tableau_objets tr.removable.row").innerHTML;
temp_tr["tableau_objets_cut"] = document.querySelector(".tableau_objets tr.removable.row").cloneNode(true);
temp_tr["tableau_objets_cut"].querySelectorAll("td.total_ht, td.quantite").forEach(c=>{
            c.style.setProperty("display","none","important");
});
prix_unit = temp_tr["tableau_objets_cut"].querySelectorAll(".prix_unit");
prix_unit.forEach(c=>{
    c.innerText = "Prix HT";
});
temp_tr["tableau_objets_cut"] = temp_tr["tableau_objets_cut"].innerHTML;
let societe = document.querySelector(".societe");
let client = document.querySelector(".client");
let societeItem = [...societe.querySelectorAll("div")];
for (let item of societeItem) {
    if (item.classList.contains("removable")) continue;
    // if(item?.innerText?.includes("TVA")) continue;
    d = item.cloneNode(true); //eh beh stylé
    client.appendChild(d);
}
document.querySelectorAll(".client input").forEach(c => {
    c.name = c.name.replace("SOCIETE", "CLIENT");
    c.placeholder = c.placeholder.replace("société", "client");
});
let SIRET_AUTO = document.querySelectorAll(".SIRET_AUTO");
SIRET_AUTO.forEach(c => {
    c.addEventListener("click", async function(e) {
        me = e.target;
        Swal.fire({
            title: "Entrez un SIRET/SIREN/RNA",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "rechercher",
            showLoaderOnConfirm: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                SIRET = result.value.strip();
                req = await fetch("https://suggestions.pappers.fr/v2/?q=" + SIRET+"&cibles=siren,siret");
                resp = await req.json();
                let isRNA = false;
                if (resp["resultats_siren"].length == 0) {
                    if (resp["resultats_siret"].length == 0) {
                        rna_req = await fetch("https://siva-integ1.cegedim.cloud/apim/api-asso/api/rna/" + SIRET,
                        {
                            mode:"no-cors"
                        });
                        rna_resp = await rna_req.text();
                        if (rna_resp.includes("Error")) {
                        alert("Aucun résultat trouvé");
                        return;
                        }else{
                            isRNA = true;
                            data = JSON.parse(rna_resp);
                        }
                    } else {
                        data = resp["resultats_siret"][0];
                    }
                } else {
                    data = resp["resultats_siren"][0];
                }
                let prefix = me.id.split("_")[0].toLocaleUpperCase();
                let societe = document.querySelector(`input[name='${prefix}_nom']`);
                let addresse = document.querySelector(`input[name='${prefix}_addresse']`);
                let codePostal = document.querySelector(`input[name='${prefix}_codePostal']`);
                let ville = document.querySelector(`input[name='${prefix}_ville']`);
                if(!isRNA){
                    //if we have a result from the api (siret or siren)
                    societe.value = data["nom_entreprise"];
                    addresse.value = data["siege"]["adresse_ligne_1"];
                    codePostal.value = data["siege"]["code_postal"];
                    ville.value = data["siege"]["ville"];
                }else{
                    //if we have a result from the api (rna)
                    societe.value = data["identite"]["nom"];
                    addresse.value = data["coordonnees"]["adresse_gestion"]["voie"];
                    codePostal.value = data["coordonnees"]["adresse_gestion"]["cp"];
                    ville.value = data["coordonnees"]["adresse_gestion"]["commune"];
                }
                let siretEl = document.querySelector(`input[name='${prefix}_siret']`);
                if(!siretEl){
                    siretEl = document.createElement("input");
                    siretEl.type = "text";
                    siretEl.name = `${prefix}_siret`;
                    siretEl.placeholder = "123 456 789 12345";
                    d = document.createElement("div");
                    d.classList.add("removable");
                    d.appendChild(siretEl);
                    init_remover(d);
                    rd = document.createElement("div");
                    p = `<span contenteditable="true" class='siretsp'>Siret:</span>`;
                    rd.innerHTML = p;
                    rd.appendChild(d);
                    document.querySelector(`.${prefix.toLowerCase()}`).appendChild(rd);
                }
                siretEl.value = SIRET;
                if(isRNA){
                    document.querySelector(`.${prefix.toLowerCase()} .siretsp`).innerText = "RNA:";
                }
                let tvaEl = document.querySelector(`input[name='${prefix}_tva']`);
                if(!tvaEl){
                    tvaEl = document.createElement("input");
                    tvaEl.type = "text";
                    tvaEl.name = `${prefix}_tva`;
                    tvaEl.placeholder = "FR123456789012";
                    d = document.createElement("div");
                    d.classList.add("removable");
                    d.appendChild(tvaEl);
                    init_remover(d);
                    rd = document.createElement("div");
                    p = `<span contenteditable="true">N° TVA:</span>`;
                    rd.innerHTML = p;
                    rd.appendChild(d);
                    document.querySelector(`.${prefix.toLowerCase()}`).appendChild(rd);
                }
                function tvaIntracommunautaire(e) {
                    var t = "".concat((12 + e % 97 * 3) % 97).concat(e);
                    return "FR".concat(t)
                }
                tvaEl.value = tvaIntracommunautaire(data["siren"]);
                let tel = document.querySelector(`input[name='${prefix}_tel']`);
                if(!isRNA){
                    if ("etablissement_siege" in data && data["etablissement_siege"]["telephone"] != null) {
                        tel.value = data["etablissement_siege"]["telephone"];
                    }
                }else{
                    if (data["coordonnees"]["telephone"] != null) {
                        tel.value = data["coordonnees"]["telephone"];
                    }
                
                }
            }
        });
    });
});

function manage_total(){
    let total = 0;
    document.querySelectorAll(".tableau_objets .row input.total").forEach(c=>{
        total += parseFloat(c.value.replace("€","").replace(",","."));
    });
    // console.log(total, total.toFixed(2).replace(".",",")); //debug
    document.querySelector("input[name='footer_total']").value = total.toFixed(2).replace(".",",");
    document.querySelector("input[name='footer_tva']").value = (total * TVA / 100).toFixed(2).replace(".",",");
    document.querySelector("input[name='footer_total_ttc']").value = (total * (1 + TVA / 100)).toFixed(2).replace(".",",");

}

function handle_price(e){
    me = e.target;
    val = parseFloat(me.value);
    tr = me.parentElement.parentElement;
    if(me.classList.contains("quantite")){
        q = tr.querySelector(".money input[type='number']").value;
    }else{
        q = tr.querySelector("input.quantite").value;
    }
    total_td_input = tr.querySelector("input.total");
    total_td_input.value = (val * q).toFixed(2).replace(".",",") + "€";
    adapted_size = total_td_input.value.length-2;
    if(adapted_size<=0){adapted_size=1}
        total_td_input.size = adapted_size;
        me.size = adapted_size;
    manage_total();
}

document.querySelectorAll(".tableau_objets .money input[type='number'],.tableau_objets .row input.quantite").forEach(c=>{
    c.addEventListener("input",handle_price,true);
});

function init_remover(d){
    let xbutton = document.createElement("button");
    xbutton.type = "button";
    xbutton.classList.add("remove");
    xbutton.innerHTML = "<img src='img/close.png' alt='remove'>";
    xbutton.addEventListener("click", function(e) {
        me = e.target;
        me = me.closest(".removable");
        if(me.classList.contains("table")){
            me.parentElement.parentElement.remove();
            adapt_time_table();
        }else{
            me.parentElement.remove();
        }
        manage_total();
    });
    if(d.nodeName == "TR"){//for when added
        div = d.querySelector(".removable");
        if(div){
            div.appendChild(xbutton);
        }else{
            a = document.createElement("td");
            a.appendChild(xbutton);
            d.appendChild(a);
            a.classList.add("removable");
        }
    }else{
        d.appendChild(xbutton);
    }
}

let xxable = document.querySelectorAll(".removable, .addable");
//add a remove button to each removable div + add button to each addable div
for (let xable of xxable) {
    if (xable.className?.includes("removable")) {
        init_remover(xable);
    } else {
        let xbutton = document.createElement("button");
        xbutton.type = "button";
        xbutton.classList.add("add");
        xbutton.innerHTML = "<img src='img/add.png' alt='add'>";
        xbutton.addEventListener("click", function(e) {
            me = e.target;
            me = me.closest(".addable");
            let all = me.parentElement;
            if (all.className?.includes("tableau_d")) {
                let copied = temp_tr["date_table"].cloneNode(true);
                inp1 = copied.querySelector("input");
                inp2 = copied.querySelector("input[type='date']");
                inp1.value = "";
                inp2.value = "";
                inp1.name = "tab_new_text[]";
                inp2.name = "tab_new[]";
                inp1.placeholder = "En-tête";
                inp2.placeholder = "Contenu";
                if(d.querySelector("button")){
                    d.querySelector("button").remove();//remove the remove button :O
                }
                all.querySelector("tbody").appendChild(copied);
                init_remover(copied);
                adapt_time_table();
            }else if(all.className?.includes("tableau_objets")){
                let copied = document.createElement("tr");
                if(isQuantities){
                    copied.innerHTML = temp_tr["tableau_objets"];
                }else{
                    copied.innerHTML = temp_tr["tableau_objets_cut"];
                }
                copied.classList.add("removable");
                copied.classList.add("row");
                all.querySelector("tbody").appendChild(copied);
                copied.querySelectorAll(".money input[type='number'], .row input.quantite").forEach(c=>{
                    c.addEventListener("input",handle_price,true);
                    if (c.classList.contains("quantite")) {
                        c.value = "1";
                        c.closest("td").id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    }
                });
                init_remover(copied);
            }
            else{
                let d = document.createElement("div");
                let inp1 = document.createElement("span");
                let inp2 = document.createElement("input");
                let rmd = document.createElement("div");
                rmd.classList.add("removable");
                inp2.placeholder = "Contenu";
                inp2.name = "new_text[]";
                inp2.type="text";
                inp1.innerText = "En-tête: ";
                inp1.contentEditable = "true";
                d.appendChild(inp1);
                rmd.appendChild(inp2);
                d.appendChild(rmd);
                all.appendChild(d);
                init_remover(rmd);
            }
        });
        xable.appendChild(xbutton);
    }
}

let form = document.querySelector("form");
let save_tab = "";
form.addEventListener("submit", function(e) {
    e.preventDefault();
    document.querySelector(".gen").classList.add("hide");
    if(document.querySelector(".complementaire textarea").value == ""){
        document.querySelector(".complementaire").classList.add("hide");
    }
    document.querySelectorAll("button.remove, button.add, .SIRET_AUTO").forEach(c => {
        c.classList.add("hide");
    });
    document.querySelector(".tableau_objets th.remove_tab").remove();
    document.querySelectorAll(".removable.row > td.removable").forEach(c=>{
        c.remove();
    });
    document.querySelectorAll(".right_stuff, .societe input, .societe span, .client input, .client span, .big, .bottomtxt, .changeBackground, .changeable").forEach(c=>{
        if(c?.name?.includes("_text") || c?.contentEditable == "true"){
            c.classList.add("baking");
        }else{
            if(c?.value == "" || c.tagName == "DIV"){
                c.classList.add("hide");
            }
        }
    });
    // save as pdf (html2canvas + jsPDF) <3
    //html2canvas -> Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>. Licensed under the MIT License.
    //jsPDF -> Copyright (c) 2010-2017 James Hall, https://github.com/MrRio/jsPDF
    // form.style.width = "100%";
    form.style.height = "100%";
    form.style.margin = "0";
    //use pdfmake
    ZOOM = 2.5;
    OUTER = 4.2;
    options = {
        background: '#ACACAC',
        scale: ZOOM,
        width: form.offsetWidth,
        height: form.offsetHeight,
    };
    html2canvas(form, options).then(function (canvas) {
        //cut in pages canvas if too big
        // document.body.appendChild(canvas);//debug
        window.jsPDF = window.jspdf.jsPDF;
        let img = canvas.toDataURL("image/jpeg");
        let imgWidth = canvas.width;
        let imgHeight = canvas.height;
        let ratio = imgWidth / imgHeight;
        let doc = new jsPDF("p", "mm", [canvas.width/(ZOOM*OUTER), canvas.height/(ZOOM*OUTER)]);
        let width = doc.internal.pageSize.getWidth();
        let height = doc.internal.pageSize.getHeight();
        let pageHeight = width / ratio;
        doc.addImage(img, 'PNG', 0, 0, width, pageHeight);
        doc.save("facture.pdf");
        // document.body.appendChild(img);
        document.querySelector(".gen").classList.remove("hide");
        //readd th.remove_tab
        document.querySelector(".tableau_objets").querySelector("thead tr").innerHTML += "<th class='remove_tab'></th>";
        document.querySelectorAll("button.remove, button.add, .SIRET_AUTO").forEach(c => {
            c.classList.remove("hide");
        });
        document.querySelectorAll(".right_stuff, .societe input, .societe span, .client input, .client span, .big, .bottomtxt, .changeBackground, .changeable").forEach(c=>{
            if(c?.name?.includes("_text") || c?.contentEditable == "true"){
                c.classList.remove("baking");
            }else{
                if(c?.value == "" || c.tagName == "DIV"){
                    c.classList.remove("hide");
                }
            }
        });
        if(document.querySelector(".complementaire textarea").value == ""){
            document.querySelector(".complementaire").classList.remove("hide");
        }
        document.querySelector(".footer").style.justifyContent =  "space-between";
        document.querySelectorAll(".removable.row").forEach(c=>{
            rmable = document.createElement("td");//notice : NEVER USE INNERHTML (value will be lost)
            rmable.classList.add("removable");
            c.appendChild(rmable);
            init_remover(rmable);
        });
        form.style = "";
    });
});

let background = document.querySelector(".changeBackground");
background.addEventListener("dragover", function(e) {
    e.preventDefault();
    e.stopPropagation();
    background.classList.add("dragover");
});
background.addEventListener("dragleave", function(e) {
    e.preventDefault();
    e.stopPropagation();
    background.classList.remove("dragover");
});
background.addEventListener("drop", function(e) {
    e.preventDefault();
    e.stopPropagation();
    background.classList.remove("dragover");
    changeBack(e,0);
});
background.addEventListener("click", function() {
    background.querySelector("input").click();
});
background.querySelector("input").addEventListener("change",(e)=>{changeBack(e,1)},true);

function changeBack(e,stat){
    let file = stat?e.target.files[0]:e.dataTransfer.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        background.querySelector("img").src = reader.result;
        document.forms[0].style.backgroundImage = `url(${reader.result})`;
    }
}

function adapt_time_table(){
    table = document.querySelector(".tableau_d table");
    num_of_td = table.querySelectorAll("tr").length;
    // console.log(num_of_td);
    table.classList.remove("one","two","three");
    if (num_of_td >= 2) {
        table.classList.add("three");
    } else if (num_of_td <= 1) {
        table.classList.add("one");
    }
}

document.querySelector(".changer").addEventListener("click",(e)=>{
    me = e.target;
    if (me.id == "Facture") {
        me.innerText = "Devis";
        me.id = "Devis";
        let titleEl = document.querySelector("#allowed_size.big");
        titleEl.innerText = titleEl.innerText.replace("Devis","Facture");
        document.querySelector("div.facture").style.display = "block";
        document.querySelector("div.devis").style.display = "none";
        return;
    }else{
        me.innerText = "Facture";
        me.id = "Facture";
        let titleEl = document.querySelector("#allowed_size.big");
        titleEl.innerText = titleEl.innerText.replace("Facture","Devis");
        document.querySelector("div.facture").style.display = "none";
        document.querySelector("div.devis").style.display = "block";
    }
    adapt_time_table();
});

document.getElementById("tva_perc").addEventListener("input",function(e){
    TVA = parseFloat(e.target.value);
    if(TVA > 100){
        TVA = 100;
        e.target.value = 100;
    }
    document.getElementById("tva_title").innerText = `TVA (${TVA}%)`;
    manage_total();
}); 

let quantitebtn = document.querySelector(".toggle_quantity");
saved_quantities = {};
quantitebtn.addEventListener("click",function(e){
    let me = e.target;
    let elems = document.querySelectorAll(".quantite, .total_ht");
    let prix_unit = document.querySelectorAll(".prix_unit");
    isActive = me.getAttribute("data-active") == "true";
    if(isActive){
        me.setAttribute("data-active","false");
        me.innerText = "Activer unitaire";
        isQuantities = false;
        elems.forEach(c=>{
            if(c.tagName=="TD" && c.classList.contains("quantite")){
                Qinput = c.querySelector("input");
                saved_quantities[c.id] =Qinput.value;
                Qinput.value = "1";
                handle_price({target:Qinput});
            }
            c.style.setProperty("display","none","important");
        });
        prix_unit.forEach(c=>{
            c.innerText = "Prix HT";
        });
    }else{
        me.setAttribute("data-active","true");
        me.innerText = "Désactiver unitaire";
        isQuantities = true;
        elems.forEach(c=>{
            if(c.tagName=="TD" && c.classList.contains("quantite")){
                Qinput = c.querySelector("input");
                if (c.id in saved_quantities) {
                    Qinput.value = saved_quantities[c.id];
                }else{
                    Qinput.value = "1";
                }
                handle_price({target:Qinput});
            }
            c.style.setProperty("display","");
        });
        prix_unit.forEach(c=>{
            c.innerText = "Prix unitaire HT";
        });
    }
});
})();