let corse = JSON.parse(localStorage.getItem("corseTaxi")) || [];

let autista = localStorage.getItem("nomeTassista") || "";

let modificaId = null;



document.addEventListener("DOMContentLoaded", () => {


    avvioApp();


    document.querySelector(".save")
    .addEventListener("click", salvaCorsa);


});





// =========================
// AVVIO APP
// =========================


function avvioApp(){


    let setup =
    document.getElementById("setupPage");


    let app =
    document.getElementById("appContainer");



    if(autista){


        setup.style.display="none";

        app.style.display="block";


        document.getElementById("driverName")
        .innerText =
        "Tassista " + autista;



    }else{


        setup.style.display="flex";

        app.style.display="none";


    }



    aggiornaApp();


}







// =========================
// PRIMO ACCESSO
// =========================


function salvaPrimoAccesso(){


    let nome =
    document.getElementById("setupDriverName")
    .value.trim();



    if(nome===""){


        alert("Inserisci il nome del tassista");

        return;


    }



    localStorage.setItem(
        "nomeTassista",
        nome
    );


    autista = nome;



    document.getElementById("setupPage")
    .style.display="none";



    document.getElementById("appContainer")
    .style.display="block";



    document.getElementById("driverName")
    .innerText =
    "Tassista " + nome;



}









// =========================
// CAMBIO PAGINA
// =========================


function openPage(page, elemento){


    document.querySelectorAll(".page")
    .forEach(p=>{

        p.classList.remove("active");

    });



    document.getElementById(page)
    .classList.add("active");



    document.querySelectorAll(".nav-item")
    .forEach(n=>{

        n.classList.remove("active");

    });



    elemento.classList.add("active");



    aggiornaApp();


}








// =========================
// SALVA CORSA
// =========================


function salvaCorsa(){



let corsa = {


id: modificaId || Date.now(),


autista: autista,


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





if(!corsa.partenza || !corsa.data){


alert("Inserisci partenza e data");


return;


}





if(modificaId){


corse =
corse.map(c=>{


return c.id===modificaId
?
corsa
:
c;


});



modificaId=null;



}else{


corse.push(corsa);


}



salvaDatabase();


pulisciForm();


aggiornaApp();



}









function salvaDatabase(){


localStorage.setItem(
"corseTaxi",
JSON.stringify(corse)
);


}









// =========================
// CONTROLLO ORARI
// =========================


function controllaCorse(){


let ora = new Date();



corse.forEach(c=>{


let dataCorsa =
new Date(
`${c.data}T${c.orario || "23:59"}`
);



if(dataCorsa < ora){


if(c.stato==="programmata"){


c.stato="completata";

c.completata=Date.now();


}


}


});





corse =
corse.filter(c=>{


if(c.stato==="completata"){


return Date.now()-c.completata < 1800000;


}



return true;



});



salvaDatabase();


}








// =========================
// AGGIORNAMENTO
// =========================


function aggiornaApp(){


controllaCorse();


aggiornaHome();


aggiornaCorse();


}








function prossimaCorsa(){


return corse

.filter(c=>c.stato==="programmata")

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









// =========================
// HOME
// =========================


function aggiornaHome(){


let box =
document.getElementById("homeNext");


let corsa =
prossimaCorsa();



if(!corsa){


box.innerHTML =
"Nessuna corsa programmata";


return;


}




box.innerHTML = `


<div class="time">

${corsa.orario || "--"}

</div>


<div class="info">

${corsa.cliente || "Cliente"}

</div>


<div class="info">

Partenza:<br>

${corsa.partenza}

</div>


<div class="info">

Arrivo:<br>

${corsa.arrivo || "-"}

</div>


`;



}









// =========================
// PAGINA CORSE
// =========================


function aggiornaCorse(){


let programmate =
document.getElementById("plannedTrips");


let completate =
document.getElementById("completedTrips");


let prossima =
document.getElementById("nextTrip");



programmate.innerHTML="";

completate.innerHTML="";

prossima.innerHTML="";



let next =
prossimaCorsa();



if(next){


prossima.innerHTML =
creaCard(next,true);


}





corse.forEach(c=>{


if(c.stato==="programmata"
&&
(!next || c.id!==next.id)){


programmate.innerHTML +=
creaCard(c,false);


}



if(c.stato==="completata"){


completate.innerHTML +=
creaCard(c,false);


}



});


}









function creaCard(corsa,evidenziata){


return `


<div class="card trip ${evidenziata ? "next-card":""}"

onclick="apriDettagli(this)">



<div class="trip-header">


<div>


<div class="time">

${corsa.orario || "--"}

</div>


<div>

${corsa.cliente || "Cliente"}

</div>


<div>

${corsa.partenza}

</div>


</div>


<div>

▼

</div>


</div>






<div class="details">


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

Modifica

</button>



<button class="delete"
onclick="event.stopPropagation(); eliminaCorsa(${corsa.id})">

Elimina

</button>



</div>



</div>


</div>


`;

}




function apriDettagli(card){


card.classList.toggle("open");


}









// =========================
// MODIFICA
// =========================


function modificaCorsa(id){


let c =
corse.find(x=>x.id===id);



if(!c)return;



modificaId=id;



openPage(
"add",
document.querySelector(".add")
);



document.getElementById("cliente").value=c.cliente || "";

document.getElementById("telefono").value=c.telefono || "";

document.getElementById("partenza").value=c.partenza || "";

document.getElementById("arrivo").value=c.arrivo || "";

document.getElementById("data").value=c.data || "";

document.getElementById("orario").value=c.orario || "";

document.getElementById("passeggeri").value=c.passeggeri || "";

document.getElementById("note").value=c.note || "";



}








// =========================
// ELIMINA
// =========================


function eliminaCorsa(id){


if(confirm("Eliminare questa corsa?")){


corse =
corse.filter(c=>c.id!==id);


salvaDatabase();


aggiornaApp();


}


}







function pulisciForm(){


document.querySelectorAll(
"#add input, #add textarea"
)
.forEach(x=>{

x.value="";

});


}







setInterval(()=>{

aggiornaApp();

},60000);
