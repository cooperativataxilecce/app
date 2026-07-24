 let corse = JSON.parse(localStorage.getItem("corseTaxi")) || [];

let modificaId = null;


// AVVIO APP

document.addEventListener("DOMContentLoaded", () => {

    caricaNomeTassista();

    document.querySelector(".save")
        .addEventListener("click", salvaCorsa);

    aggiornaApp();

});




// CAMBIO PAGINA

function openPage(page, element) {

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });


    document.getElementById(page)
        .classList.add("active");


    document.querySelectorAll(".nav-item").forEach(n => {
        n.classList.remove("active");
    });


    element.classList.add("active");

    aggiornaApp();

}






// NOME TASSISTA


function salvaNomeTassista() {

    let nome =
    document.getElementById("driverInput").value.trim();



    if(nome === "") {

        alert("Inserisci il nome del tassista");

        return;

    }


    localStorage.setItem(
        "nomeTassista",
        nome
    );


    document.getElementById("driverName")
        .innerText = nome;


    alert("Nome salvato");

}





function caricaNomeTassista() {

    let nome =
    localStorage.getItem("nomeTassista");


    if(nome) {

        document.getElementById("driverName")
            .innerText = nome;


        document.getElementById("driverInput")
            .value = nome;

    }

}







// SALVA CORSA


function salvaCorsa() {


    let corsa = {


        id: modificaId || Date.now(),


        cliente:
        document.getElementById("cliente").value,


        telefono:
        document.getElementById("telefono").value,


        partenza:
        document.getElementById("partenza").value,


        arrivo:
        document.getElementById("arrivo").value,


        data:
        document.getElementById("data").value,


        orario:
        document.getElementById("orario").value,


        passeggeri:
        document.getElementById("passeggeri").value,


        note:
        document.getElementById("note").value,


        stato:"programmata"


    };





    if(!corsa.partenza || !corsa.data) {

        alert("Compila indirizzo di partenza e data");

        return;

    }






    if(modificaId) {


        corse =
        corse.map(c =>

            c.id === modificaId
            ?
            corsa
            :
            c

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







// CONTROLLO AUTOMATICO CORSE


function controllaCorse() {


    let ora = new Date();



    corse.forEach(corsa => {


        let dataCorsa =
        new Date(
            `${corsa.data}T${corsa.orario || "23:59"}`
        );



        if(dataCorsa < ora) {


            if(corsa.stato === "programmata") {


                corsa.stato="completata";


                corsa.oraCompletata =
                Date.now();


            }


        }


    });





    corse = corse.filter(corsa => {


        if(corsa.stato === "completata") {


            return (
                Date.now()
                -
                corsa.oraCompletata
                <
                1800000
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







// PROSSIMA CORSA


function trovaProssima() {


    return corse

    .filter(c => c.stato === "programmata")


    .sort((a,b)=>{


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


    let prossima =
    trovaProssima();



    let box =
    document.querySelector("#home .next-card");



    if(!prossima) {

        box.innerHTML = `

        <div class="section-title">
        Prossima corsa
        </div>

        <div class="info">
        Nessuna corsa programmata
        </div>

        `;

        return;

    }





    box.innerHTML = `

    <div class="section-title">
    Prossima corsa
    </div>


    <div class="time">
    ${prossima.orario}
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


let pagina =
document.getElementById("corse");



let programmate =
corse.filter(c=>c.stato==="programmata");



let completate =
corse.filter(c=>c.stato==="completata");



pagina.innerHTML = `


<h1>
Le mie corse
</h1>


<div id="prossima"></div>


<h2>
Corse programmate
</h2>


<div id="programmate"></div>


<h2>
Corse completate
</h2>


<div id="completate"></div>


`;



let prossima =
trovaProssima();



if(prossima) {


document.getElementById("prossima")
.innerHTML =
creaCard(prossima,true);


}



programmate.forEach(corsa=>{


if(!prossima || corsa.id !== prossima.id) {


document.getElementById("programmate")
.innerHTML +=
creaCard(corsa,false);


}


});





completate.forEach(corsa=>{


document.getElementById("completate")
.innerHTML +=
creaCard(corsa,false);


});


}







// CREA CARD


function creaCard(corsa,evidenziata) {


return `


<div class="card trip ${evidenziata ? "next-card":""}"

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







// APRI DETTAGLI


function toggleTrip(element){

element.classList.toggle("open");

}







// MODIFICA


function modificaCorsa(id){


let corsa =
corse.find(c=>c.id===id);



if(!corsa) return;



modificaId=id;



openPage(
"add",
document.querySelector(".add")
);



document.getElementById("cliente").value =
corsa.cliente;


document.getElementById("telefono").value =
corsa.telefono;


document.getElementById("partenza").value =
corsa.partenza;


document.getElementById("arrivo").value =
corsa.arrivo;


document.getElementById("data").value =
corsa.data;


document.getElementById("orario").value =
corsa.orario;


document.getElementById("passeggeri").value =
corsa.passeggeri;


document.getElementById("note").value =
corsa.note;


document.querySelector(".save")
.innerText =
"Salva modifiche";


}








// ELIMINA


function eliminaCorsa(id) {


if(confirm("Eliminare questa corsa?")) {


corse =
corse.filter(c=>c.id!==id);


salvaDatabase();

aggiornaApp();


}


}







// PULISCI FORM


function pulisciForm(){


document.querySelectorAll(
"#add input, #add textarea"
)
.forEach(c=>c.value="");


document.querySelector(".save")
.innerText="Salva corsa";


}






// CONTROLLO OGNI MINUTO


setInterval(()=>{

aggiornaApp();

},60000);
