let corse = JSON.parse(localStorage.getItem("corseTaxi")) || [];

let modificaId = null;



// CAMBIO PAGINE

function openPage(page, element) {

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    document.getElementById(page).classList.add("active");


    document.querySelectorAll(".nav-item").forEach(n => {
        n.classList.remove("active");
    });


    element.classList.add("active");


    aggiornaApp();

}




// APERTURA MENU A TENDINA

function toggleTrip(element) {

    element.classList.toggle("open");

}




// AVVIO APP

document.addEventListener("DOMContentLoaded", () => {


    const bottone = document.querySelector(".save");


    if (bottone) {

        bottone.addEventListener("click", salvaCorsa);

    }


    aggiornaApp();


});






// SALVA O MODIFICA CORSA

function salvaCorsa() {


    let campi = document.querySelectorAll(
        "#add input, #add textarea"
    );


    let corsa = {

        id: modificaId || Date.now(),

        cliente: campi[0].value,

        telefono: campi[1].value,

        partenza: campi[2].value,

        arrivo: campi[3].value,

        data: campi[4].value,

        orario: campi[5].value,

        passeggeri: campi[6].value,

        note: campi[7].value,

        stato: "programmata"

    };



    if (!corsa.partenza || !corsa.data) {

        alert("Compila i campi obbligatori");

        return;

    }



    if (modificaId) {


        corse = corse.map(c =>

            c.id === modificaId ? corsa : c

        );


        modificaId = null;


    } else {


        corse.push(corsa);


    }



    salvaDatabase();


    pulisciForm();


    aggiornaApp();


}






// DATABASE

function salvaDatabase() {

    localStorage.setItem(
        "corseTaxi",
        JSON.stringify(corse)
    );

}







// CONTROLLO CORSE SCADUTE

function controllaCorse() {


    let adesso = new Date();



    corse.forEach(corsa => {


        let dataCorsa = new Date(
            `${corsa.data}T${corsa.orario || "23:59"}`
        );



        if (dataCorsa < adesso) {


            if (corsa.stato === "programmata") {


                corsa.stato = "completata";


                corsa.oraCompletata = Date.now();


            }


        }


    });





    corse = corse.filter(corsa => {


        if (corsa.stato === "completata") {


            return (
                Date.now() - corsa.oraCompletata
                <
                30 * 60 * 1000
            );


        }


        return true;


    });



    salvaDatabase();


}








// AGGIORNA APP

function aggiornaApp() {


    controllaCorse();


    aggiornaHome();


    aggiornaCorse();


}








// TROVA PROSSIMA CORSA

function trovaProssima() {


    return corse

        .filter(c => c.stato === "programmata")

        .sort((a, b) => {


            return new Date(
                `${a.data}T${a.orario}`
            )
            -
            new Date(
                `${b.data}T${b.orario}`
            );


        })[0];


}








// HOME

function aggiornaHome() {


    let prossima = trovaProssima();


    if (!prossima) return;



    let home = document.querySelector(
        "#home .next-card"
    );



    home.innerHTML = `

    <div class="section-title">
    Prossima corsa
    </div>


    <div class="time">
    ${prossima.orario || "--"}
    </div>


    <div class="info">
    ${prossima.cliente || "Cliente non indicato"}
    </div>


    <div class="info">
    Partenza:<br>
    ${prossima.partenza}
    </div>


    <div class="info">
    Arrivo:<br>
    ${prossima.arrivo || "-"}
    </div>


    <div class="info">
    Telefono:<br>
    ${prossima.telefono || "-"}
    </div>

    `;


}








// PAGINA CORSE

function aggiornaCorse() {


    let pagina = document.querySelector("#corse");


    let programmate = corse.filter(
        c => c.stato === "programmata"
    );


    let completate = corse.filter(
        c => c.stato === "completata"
    );



    pagina.innerHTML = `


    <h1>Le mie corse</h1>


    <div id="prossima"></div>


    <h2>Corse programmate</h2>


    <div id="programmate"></div>



    <h2>Corse completate</h2>


    <div id="completate"></div>


    `;




    let prossima = trovaProssima();



    if (prossima) {


        document.querySelector("#prossima")
        .innerHTML =
        creaCard(prossima, true);


    }




    programmate
    .filter(c => !prossima || c.id !== prossima.id)
    .forEach(c => {


        document.querySelector("#programmate")
        .innerHTML +=
        creaCard(c, false);


    });





    completate.forEach(c => {


        document.querySelector("#completate")
        .innerHTML +=
        creaCard(c, false);


    });



}








// CREA CARD CORSA

function creaCard(corsa, evidenziata) {


return `


<div class="card trip ${evidenziata ? "next-card" : ""}"

onclick="toggleTrip(this)">



<div class="trip-header">


<div>


<div class="time">

${corsa.orario || "--"}

</div>



<div>

${corsa.cliente || "Cliente non indicato"}

</div>



<div class="trip-address">

${corsa.partenza}

</div>


</div>



<div>

▼

</div>


</div>






<div class="details">


<hr>



Telefono:

${corsa.telefono || "-"}



<br><br>



Arrivo:

${corsa.arrivo || "-"}



<br><br>



Data:

${corsa.data}



<br><br>



Passeggeri:

${corsa.passeggeri || "-"}



<br><br>



Note:

${corsa.note || "-"}





<div class="actions">


<button onclick="event.stopPropagation(); modificaCorsa(${corsa.id})">

Modifica corsa

</button>




<button class="delete"

onclick="event.stopPropagation(); eliminaCorsa(${corsa.id})">

Elimina corsa

</button>



</div>



</div>



</div>


`;

}








// ELIMINA CORSA

function eliminaCorsa(id) {


    if(confirm("Eliminare questa corsa?")) {


        corse = corse.filter(
            c => c.id !== id
        );


        salvaDatabase();


        aggiornaApp();


    }

}








// MODIFICA CORSA

function modificaCorsa(id) {


    let corsa = corse.find(
        c => c.id === id
    );


    if (!corsa) return;



    modificaId = id;



    openPage(
        "add",
        document.querySelector(".add")
    );



    let campi = document.querySelectorAll(
        "#add input, #add textarea"
    );



    campi[0].value = corsa.cliente || "";

    campi[1].value = corsa.telefono || "";

    campi[2].value = corsa.partenza || "";

    campi[3].value = corsa.arrivo || "";

    campi[4].value = corsa.data || "";

    campi[5].value = corsa.orario || "";

    campi[6].value = corsa.passeggeri || "";

    campi[7].value = corsa.note || "";



    document.querySelector(".save").innerText =
    "Salva modifiche";


}







// PULIZIA FORM

function pulisciForm() {


    document.querySelectorAll(
        "#add input, #add textarea"
    )
    .forEach(c => c.value = "");



    document.querySelector(".save").innerText =
    "Salva corsa";


}







// CONTROLLO OGNI MINUTO

setInterval(() => {

    aggiornaApp();

}, 60000);
