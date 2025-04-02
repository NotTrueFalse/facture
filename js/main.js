let TVA = 20;//20% TVA
let isQuantities = true;
let mainForm = document.querySelector("main form");
mainForm.querySelectorAll("input").forEach(c => {
    c.addEventListener("keypress", (e) => {//prevent enter from submitting
        if (e.code == '13') {
            e.preventDefault();
            return false;
        }
    });
});

document.querySelectorAll("input[value='NOWVAL']").forEach(date_input => {
    date_input.value = _now;
});
document.querySelectorAll("input[value='AFTERVAL']").forEach(date_input => {
    date_input.value = _after;
});

//get everything from societe, and duplicate for client
let temp_tableaux = {};
temp_tableaux["date_table"] = document.querySelector(".date_table tr").cloneNode(true);
temp_tableaux["tableau_objets"] = document.querySelector(".tableau_objets tr.removable.row").innerHTML;
temp_tableaux["tableau_objets_cut"] = document.querySelector(".tableau_objets tr.removable.row").cloneNode(true);
temp_tableaux["tableau_objets_cut"].querySelectorAll("td.total_ht, td.quantite").forEach(c => {
    c.style.setProperty("display", "none", "important");
});
prix_unit = temp_tableaux["tableau_objets_cut"].querySelectorAll(".prix_unit");
prix_unit.forEach(c => {
    c.innerText = "Prix HT";
});
temp_tableaux["tableau_objets_cut"] = temp_tableaux["tableau_objets_cut"].innerHTML;
let societe = document.querySelector(".societe");
let client = document.querySelector(".client");
let societeItem = [...societe.querySelectorAll("div")];
for (let item of societeItem) {
    if (item.classList.contains("removable")) continue;
    // if(item?.innerText?.includes("TVA")) continue;
    let item_clone = item.cloneNode(true);
    client.appendChild(item_clone);
}
document.querySelectorAll(".client input").forEach(client_input => {
    client_input.name = client_input.name.replace("SOCIETE", "CLIENT");
    client_input.placeholder = client_input.placeholder.replace("société", "client");
});
let SIRET_AUTO = document.querySelectorAll(".SIRET_AUTO");
SIRET_AUTO.forEach(siret_auto_button => {
    siret_auto_button.addEventListener("click", async function (e) {
        let me = e.target;
        let { value } = await Swal.fire({
            title: "Entrez un SIRET/SIREN/RNA",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "rechercher",
            showLoaderOnConfirm: true,
        });
        if (!value)return;
        let SIRET = value.strip();
        let req = await fetch("https://suggestions.pappers.fr/v2/?q=" + SIRET + "&cibles=siren,siret");
        let resp = await req.json();
        let isRNA = false;
        if (resp["resultats_siren"].length == 0) {
            if (resp["resultats_siret"].length == 0) {
                rna_req = await fetch("https://siva-integ1.cegedim.cloud/apim/api-asso/api/rna/" + SIRET,
                    {
                        mode: "no-cors"
                    });
                rna_resp = await rna_req.text();
                if (rna_resp.includes("Error")) {
                    alert("Aucun résultat trouvé");
                    return;
                } else {
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
        if (!isRNA) {
            //if we have a result from the api (siret or siren)
            societe.value = data["nom_entreprise"];
            addresse.value = data["siege"]["adresse_ligne_1"];
            codePostal.value = data["siege"]["code_postal"];
            ville.value = data["siege"]["ville"];
        } else {
            //if we have a result from the api (rna)
            societe.value = data["identite"]["nom"];
            addresse.value = data["coordonnees"]["adresse_gestion"]["voie"];
            codePostal.value = data["coordonnees"]["adresse_gestion"]["cp"];
            ville.value = data["coordonnees"]["adresse_gestion"]["commune"];
        }
        let siret_element = document.querySelector(`input[name='${prefix}_siret']`);
        if (!siret_element) {
            siret_element = document.createElement("input");
            siret_element.type = "text";
            siret_element.name = `${prefix}_siret`;
            siret_element.placeholder = "123 456 789 12345";
            let removable_div = document.createElement("div");
            removable_div.classList.add("removable");
            removable_div.appendChild(siret_element);
            init_remover(removable_div);
            siret_span_wrapper = document.createElement("div");
            let siret_span = `<span contenteditable="true" class='siretsp'>Siret:</span>`;
            siret_span_wrapper.innerHTML = siret_span;
            siret_span_wrapper.appendChild(removable_div);
            document.querySelector(`.${prefix.toLowerCase()}`).appendChild(siret_span_wrapper);
        }
        siret_element.value = SIRET;
        if (isRNA) {
            document.querySelector(`.${prefix.toLowerCase()} .siretsp`).innerText = "RNA:";
        }
        let tva_element = document.querySelector(`input[name='${prefix}_tva']`);
        if (!tva_element) {
            tva_element = document.createElement("input");
            tva_element.type = "text";
            tva_element.name = `${prefix}_tva`;
            tva_element.placeholder = "FR123456789012";
            let removable_div = document.createElement("div");
            removable_div.classList.add("removable");
            removable_div.appendChild(tva_element);
            init_remover(removable_div);
            let numero_tva_element = document.createElement("div");
            let span_tva = `<span contenteditable="true">N° TVA:</span>`;
            numero_tva_element.innerHTML = span_tva;
            numero_tva_element.appendChild(removable_div);
            document.querySelector(`.${prefix.toLowerCase()}`).appendChild(numero_tva_element);
        }
        function tvaIntracommunautaire(e) {
            var t = "".concat((12 + e % 97 * 3) % 97).concat(e);
            return "FR".concat(t)
        }
        tva_element.value = tvaIntracommunautaire(data["siren"]);
        let tel = document.querySelector(`input[name='${prefix}_tel']`);
        if (!isRNA) {
            if ("etablissement_siege" in data && data["etablissement_siege"]["telephone"] != null) {
                tel.value = data["etablissement_siege"]["telephone"];
            }
        } else {
            if (data["coordonnees"]["telephone"] != null) {
                tel.value = data["coordonnees"]["telephone"];
            
            }
        }
    });
});

function manage_total() {
    let total = 0;
    document.querySelectorAll(".tableau_objets .row span.total").forEach(c => {
        total += parseFloat(c.innerText.replace(",", "."));
    });
    // console.log(total, total.toFixed(2).replace(".",",")); //debug
    document.querySelector("span[data-name='footer_total']").innerText = total.toFixed(2).replace(".", ",");
    document.querySelector("span[data-name='footer_tva']").innerText = (total * TVA / 100).toFixed(2).replace(".", ",");
    document.querySelector("span[data-name='footer_total_ttc']").innerText = (total * (1 + TVA / 100)).toFixed(2).replace(".", ",");

}

function handle_price(e) {
    let me = e.target;
    if (me.tagName != "INPUT") {
        me = me.closest("input");
    }
    let tr = me.closest("tr");
    let val = tr.querySelector(".money input").value;
    let quantity = tr.querySelector(".quantite input").value;
    if (!number_precaution(me)) return;
    let total_span = tr.querySelector("span.total");
    total_span.innerText = (val * quantity).toFixed(2).replace(".", ",");
    let adapted_size = total_span.innerText.length - 2;
    if (adapted_size <= 0) { adapted_size = 1 }
    total_span.size = adapted_size;
    me.size = adapted_size;
    manage_total();
}

document.querySelectorAll(".tableau_objets .money input,.tableau_objets .row input.quantite").forEach(c => {
    c.addEventListener("input", handle_price, true);
});

function init_remover(removable_div) {
    let xbutton = document.createElement("button");
    xbutton.type = "button";
    xbutton.classList.add("remove");
    xbutton.innerHTML = "<img src='img/close.png' alt='remove'>";
    xbutton.addEventListener("click", function (e) {
        me = e.target;
        me = me.closest(".removable");
        if (me.classList.contains("table")) {
            me.parentElement.parentElement.remove();
            adapt_time_table();
        } else {
            me.parentElement.remove();
        }
        manage_total();
    });
    if (removable_div.nodeName == "TR") {//for when added
        div = removable_div.querySelector(".removable");
        if (div) {
            div.appendChild(xbutton);
        } else {
            let td = document.createElement("td");
            td.appendChild(xbutton);
            removable_div.appendChild(td);
            td.classList.add("removable");
        }
    } else {
        removable_div.appendChild(xbutton);
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
        xbutton.addEventListener("click", addable_handler);
        xable.appendChild(xbutton);
    }
}

function addable_handler(e) {
    let me = e.target;
    me = me.closest(".addable");
    let wrapper = me.parentElement;
    if (wrapper.className?.includes("tableau_d")) {
        let copied = temp_tableaux["date_table"].cloneNode(true);
        inp1 = copied.querySelector("input");
        inp2 = copied.querySelector("input[type='date']");
        inp1.value = "";
        inp2.value = "";
        inp1.name = "tab_new_text[]";
        inp2.name = "tab_new[]";
        inp1.placeholder = "En-tête";
        inp2.placeholder = "Contenu";
        wrapper.querySelector("tbody").appendChild(copied);
        init_remover(copied);
        adapt_time_table();
    } else if (wrapper.className?.includes("tableau_objets")) {
        let copied = document.createElement("tr");
        if (isQuantities) {
            copied.innerHTML = temp_tableaux["tableau_objets"];
        } else {
            copied.innerHTML = temp_tableaux["tableau_objets_cut"];
        }
        copied.classList.add("removable");
        copied.classList.add("row");
        wrapper.querySelector("tbody").appendChild(copied);
        copied.querySelectorAll(".money input, .row input.quantite").forEach(input => {
            input.addEventListener("input", handle_price, true);
            if (input.classList.contains("quantite")) {
                input.value = "1";
                input.closest("td").id = random_id();
            }
        });
        init_remover(copied);
    }
    else {
        let div = document.createElement("div");
        let inp1 = document.createElement("span");
        let inp2 = document.createElement("input");
        let removable_div = document.createElement("div");
        removable_div.classList.add("removable");
        inp2.placeholder = "Contenu";
        inp2.name = "new_text[]";
        inp2.type = "text";
        inp1.innerText = "En-tête: ";
        inp1.contentEditable = "true";
        div.appendChild(inp1);
        removable_div.appendChild(inp2);
        div.appendChild(removable_div);
        wrapper.appendChild(div);
        init_remover(removable_div);
    }
}


let form = document.querySelector("form");
let waiter = document.querySelector(".waiter_screen");
let waiter_bar = document.querySelector(".bar");
document.querySelector(".gen").addEventListener("click", async function (e) {
    e.preventDefault();
    waiter.classList.toggle("loading");
    waiter_bar.style.width = "10%";
    waiter_bar.style.width = "20%";
    // save as pdf (html2canvas + jsPDF) <3
    form.style.width = A4_FORMAT[0] + "px";
    form.style.minHeight = A4_FORMAT[1] + "px";
    form.style.margin = "0";
    form.style.position = "absolute";
    form.style.top = "0";
    form.style.left = "0";
    waiter_bar.style.width = "30%";
    const DEBUG = false;
    if (DEBUG) {
        let addable = document.querySelector(".tableau_objets .addable");
        for (let i = 0; i < 5; i++) {
            addable_handler({ target: addable.querySelector("button") });
        }
    }
    let background_of_form = form.style.backgroundImage;
    let url = background_of_form.replace("url(", "").replace(")", "").replace(/"/g, "");
    const background_image = background_of_form.includes("url") ? await loadImageFromUrl(url) : null;
    if (!background_image) {
        make_pdf(background_of_form, background_image, DEBUG);
    } else {
        background_image.onload = function () {
            make_pdf(background_of_form, background_image, DEBUG);
        }
    }

});

function format_everything(applyFormatting = true) {
    if (!window.inputsState && applyFormatting) {
        window.inputsState = new Map();
    }
    formatMainElements(applyFormatting);
    formatCompanyClientSections(applyFormatting);
    formatAlignmentElements(applyFormatting);
    formatDateTable(applyFormatting);
    formatItemsTable(applyFormatting);
    formatFooterElements(applyFormatting);
    if (!applyFormatting) {
        window.inputsState = null;
    }
}

function formatMainElements(applyFormatting) {
    let tva_title = document.getElementById("tva_title");
    if (applyFormatting) {
        document.querySelector(".icon_carousel").classList.add("bigger");
        document.querySelector("form").classList.add("bigger");
        document.getElementById("allowed_size").classList.add("bigger");
        document.querySelector(".gen").classList.add("hide");
        let complementaire_elem = document.querySelector(".complementaire span");
        if (complementaire_elem.value == "") {
            complementaire_elem.classList.add("hide");
        }
        if (tva_title.innerText.includes("(0%)")) {
            tva_title.style.display = "none";
            document.querySelector(".fake_table .right div:nth-child(2)").style.display = "none";
        }
        document.querySelectorAll("button.remove, button.add, .SIRET_AUTO").forEach(c => {
            c.classList.add("hide");
        });
        document.querySelectorAll(".removable.row > td.removable").forEach(c => {
            c.remove();
        });
        document.querySelectorAll(".right_stuff, .societe input, .societe span, .client input, .client span, .big, .bottomtxt, .background_carrousel, .changeBackground, .changeable").forEach(c => {
            if (c?.name?.includes("_text") || c?.contentEditable == "true") {
                c.classList.add("baking");
            } else {
                if (c?.value == "" || c.tagName == "DIV") {
                    c.classList.add("hide");
                }
            }
        });
    } else {
        document.querySelector(".icon_carousel").classList.remove("bigger");
        document.querySelector("form").classList.remove("bigger");
        document.getElementById("allowed_size").classList.remove("bigger");
        document.querySelector(".gen").classList.remove("hide");
        document.querySelectorAll("button.remove, button.add, .SIRET_AUTO").forEach(c => {
            c.classList.remove("hide");
        });
        document.querySelectorAll(".right_stuff, .societe input, .societe span, .client input, .client span, .big, .bottomtxt, .changeBackground, .background_carrousel, .changeable").forEach(c => {
            if (c?.name?.includes("_text") || c?.contentEditable == "true") {
                c.classList.remove("baking");
            } else {
                if (c?.value == "" || c.tagName == "DIV") {
                    c.classList.remove("hide");
                }
            }
        });
        if (tva_title.innerText.includes("(0%)")) {
            tva_title.style.display = "";
            document.querySelector(".fake_table .right div:nth-child(2)").style.display = "";
        }
    }
}

function formatCompanyClientSections(applyFormatting) {
    document.querySelectorAll(".societe, .client").forEach(section => {
        if (applyFormatting) {
            section.classList.add("bigger");
            section.querySelectorAll(".removable input").forEach(input => {
                if (input.value == "") input.parentElement.parentElement.remove();
            });
            section.querySelectorAll("span[contenteditable]").forEach(span => {
                span.classList.add("printable");
            });
            convertInputsToSpans(section);
        } else {
            section.classList.remove("bigger");
            restoreInputsFromSpans(section);
            section.querySelectorAll("span[contenteditable]").forEach(span => {
                span.classList.remove("printable");
            });
        }
    });
}

function formatAlignmentElements(applyFormatting) {
    if (applyFormatting) {
        document.querySelector(".aligner").classList.add("bigger");
        document.querySelectorAll(".aligner .info-block").forEach(block => {
            block.classList.add("bigger");
        });
    } else {
        document.querySelector(".aligner").classList.remove("bigger");
        document.querySelectorAll(".aligner .info-block").forEach(block => {
            block.classList.remove("bigger");
        });
    }
}

function formatDateTable(applyFormatting) {
    const dateTable = document.querySelector(".tableau_d");
    if (applyFormatting) {
        dateTable.classList.add("bigger");
        convertInputsToSpans(dateTable);
    } else {
        dateTable.classList.remove("bigger");
        restoreInputsFromSpans(dateTable);
    }
}

function formatItemsTable(applyFormatting) {
    const itemsTable = document.querySelector(".tableau_objets");
    if (applyFormatting) {
        itemsTable.classList.add("bigger");
        const inputSelectors = [
            ".lAlign input",
            ".removable.row input",
            "td.quantite input",
            "td.sub_td input"
        ];

        inputSelectors.forEach(selector => {
            itemsTable.querySelectorAll(selector).forEach(input => {
                createPrintableSpan(input);
            });
        });
        itemsTable.querySelectorAll("p, th").forEach(el => {
            el.classList.add("printable");
        });
        if (itemsTable.querySelector(".total_ht .sub_td")) {
            itemsTable.querySelector(".total_ht .sub_td").classList.add("bigger");
        }
    } else {
        itemsTable.classList.remove("bigger");
        restoreInputsFromSpans(itemsTable);
        itemsTable.querySelectorAll("p, th, span.printable").forEach(el => {
            el.classList.remove("printable");
        });
        if (itemsTable.querySelector(".total_ht .sub_td")) {
            itemsTable.querySelector(".total_ht .sub_td").classList.remove("bigger");
        }
    }
}

function formatFooterElements(applyFormatting) {
    const footer = document.querySelector(".footer");
    const footer_iban = document.getElementById("footer_text");
    const footer_bottom_text = document.querySelector(".bottomtxt");
    if (footer_iban && (footer_iban.classList.contains("placeholder") || footer_iban.value === "" || footer_iban.innerText === "")) {
        if (applyFormatting) {
            footer_iban.classList.add("empty-field");
        } else {
            footer_iban.classList.remove("empty-field");
        }
    }
    const footerTable = document.querySelector(".fake_table");
    if (applyFormatting) {
        footerTable.classList.add("bigger");
        footerTable.querySelectorAll(".left, .right").forEach(column => {
            column.classList.add("bigger");
        });
        footer_bottom_text.classList.add("bigger");
        footer.classList.add("bigger");
        positionFooterAtBottom();
    } else {
        footerTable.classList.remove("bigger");
        footerTable.querySelectorAll(".left, .right").forEach(column => {
            column.classList.remove("bigger");
        });
        footer.classList.remove("bigger");
        footer.style.setProperty("--top-position", "");
        footerTable.style.marginTop = "";
        footer_bottom_text.classList.remove("bigger");
        document.querySelector(".complementaire").classList.remove("hide");
    }
}

function convertInputsToSpans(container) {
    container.querySelectorAll("input").forEach(input => {
        createPrintableSpan(input);
    });
}

function createPrintableSpan(inputElement) {
    if (inputElement.dataset.printableId) {
        return;
    }
    const uniqueId = `input-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    window.inputsState.set(uniqueId, inputElement);
    const printableSpan = document.createElement("span");
    printableSpan.contentEditable = "true";
    printableSpan.className = "printable";
    printableSpan.dataset.for = uniqueId;
    printableSpan.textContent = inputElement.value || "";
    inputElement.dataset.printableId = uniqueId;
    inputElement.style.display = "none";
    inputElement.parentNode.insertBefore(printableSpan, inputElement.nextSibling);
}

function restoreInputsFromSpans(container) {
    container.querySelectorAll("span.printable[data-for]").forEach(span => {
        const uniqueId = span.dataset.for;
        const input = window.inputsState.get(uniqueId);
        if (input) {
            input.style.display = "";
        }
        span.remove();
    });
}

function positionFooterAtBottom() {
    const footer = document.querySelector(".footer");
    const bottomTxt = document.querySelector(".bottomtxt");
    const viewportHeight = A4_FORMAT[1];
    const bottomTxtHeight = bottomTxt.offsetHeight;
    const footerHeight = footer.offsetHeight;
    const footerPosition = viewportHeight - bottomTxtHeight - footerHeight;
    footer.style.setProperty("--top-position", `${footerPosition * 0.97}px`);
}

function make_pdf(background_of_form, background_image, DEBUG) {
    const ZOOM = 3;
    const options = {
        scale: ZOOM,
        width: A4_FORMAT[0],
        backgroundColor: null
    };
    waiter_bar.style.width = "40%";
    form.style.backgroundImage = "";
    if (background_image) form.style.background = "transparent";

    // Apply formatting for PDF generation
    format_everything(true);

    html2canvas(form, options).then(function (canvas) {
        waiter_bar.style.width = "50%";
        if (DEBUG) {
            document.body.appendChild(canvas);//debug
            // document.querySelector("form").remove();
            // document.querySelector(".utils").remove();
            // document.querySelector(".right_stuff").remove();
            waiter.style.display = "none";
            return console.debug(canvas.height, A4_FORMAT[1] * ZOOM);
        }
        window.jsPDF = window.jspdf.jsPDF;
        let doc = new jsPDF("p", "mm", "a4");
        let docWidth = doc.internal.pageSize.getWidth();
        let docHeight = doc.internal.pageSize.getHeight();
        let canvasList = [];
        //from the first canvas, create a list of canvas that are all a4 format, to cut in someway the canvas in pages
        let y = 0;
        let i = 0;
        const A4_AFTER_ZOOM = [A4_FORMAT[0] * ZOOM, A4_FORMAT[1] * ZOOM];
        waiter_bar.style.width = "65%";
        while (y < canvas.height) {
            let c = document.createElement("canvas");
            c.width = A4_AFTER_ZOOM[0];
            c.height = A4_AFTER_ZOOM[1];
            let ctx = c.getContext("2d");
            // ctx.globalCompositeOperation = "lighter";
            if (background_image) {
                ctx.drawImage(background_image, 0, 0, A4_AFTER_ZOOM[0], A4_AFTER_ZOOM[1]);
            } else {
                ctx.fillStyle = "#ACACAC";
                ctx.fillRect(0, 0, A4_AFTER_ZOOM[0], y);//fill the rest of the canvas with a color
            }
            ctx.drawImage(canvas, 0, y, A4_AFTER_ZOOM[0], A4_AFTER_ZOOM[1], 0, 0, A4_AFTER_ZOOM[0], A4_AFTER_ZOOM[1]);

            canvasList.push(c);
            y += A4_AFTER_ZOOM[1];
        }
        waiter_bar.style.width = "70%";
        //add each canvas to the pdf
        for (let c of canvasList) {
            if (i != 0) {
                doc.addPage();
            }
            if (DEBUG) {
                document.body.appendChild(c);//debug
            }
            doc.addImage(c.toDataURL("image/jpeg"), "PNG", 0, 0, docWidth, docHeight);
            i++;
        }
        waiter_bar.style.width = "85%";
        let clientName;
        try {
            clientName = document.querySelector("input[name='CLIENT_nom']").value;
        } catch (e) {
            console.error("client name not found");
            clientName = "client";
        }
        waiter_bar.style.width = "90%";
        doc.save("FactureExplicit_" + clientName + ".pdf");
        waiter_bar.style.width = "95%";
        document.querySelectorAll(".removable.row").forEach(c => {
            rmable = document.createElement("td");//notice : NEVER USE INNERHTML (value will be lost)
            rmable.classList.add("removable");
            c.appendChild(rmable);
            init_remover(rmable);
        });
        waiter_bar.style.width = "99%";
        form.style = "";
        if (background_of_form != "") {
            form.style.backgroundImage = background_of_form;
        }
        waiter.classList.toggle("loading");
        // Remove formatting to restore the editable state
        format_everything(false);
    });
}

function adapt_time_table() {
    table = document.querySelector(".tableau_d table");
    num_of_td = table.querySelectorAll("tr").length;
    // console.log(num_of_td);
    table.classList.remove("one", "two", "three");
    if (num_of_td >= 2) {
        table.classList.add("three");
    } else if (num_of_td <= 1) {
        table.classList.add("one");
    }
}

document.querySelector(".changer").addEventListener("click", (e) => {
    me = e.target;
    if (me.id == "Facture") {
        me.innerText = "Devis";
        me.id = "Devis";
        let titleEl = document.querySelector("#allowed_size.big");
        titleEl.innerText = titleEl.innerText.replace("Devis", "Facture");
        document.querySelector("div.facture").style.display = "block";
        document.querySelector("div.devis").style.display = "none";
        return;
    } else {
        me.innerText = "Facture";
        me.id = "Facture";
        let titleEl = document.querySelector("#allowed_size.big");
        titleEl.innerText = titleEl.innerText.replace("Facture", "Devis");
        document.querySelector("div.facture").style.display = "none";
        document.querySelector("div.devis").style.display = "block";
    }
    adapt_time_table();
});