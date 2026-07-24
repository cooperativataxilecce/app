// DATABASE LOCALE

let corse = JSON.parse(localStorage.getItem("corseTaxi")) || [];

let modificaId = null;


// CAMBIO PAGINE

function openPage(page, element){

    document.querySelectorAll(".page").forEach(p=>{
        p.classList.remove("active");
    });


    document.getElementById(page).classList.add("active");


    document.querySelectorAll(".nav-item").forEach(n=>{
        n.classList.remove("active");
    });


    element.classList.add("active");


    aggiornaApp();

}






// APRI DETTAGLI CORSA

function toggleTrip(element){

    element.classList.toggle("open");

}






// SALVA CORSA

document.addEventListener("DOMContentLoaded",()=>{


const bottone = document.querySelector(".save");


if(bottone){

bottone.addEventListener("click", salvaCorsa);

}


aggiornaApp();


});





function salvaCorsa(){


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


stato:"programmata"


};




if(!corsa.partenza || !corsa.data){

alert("Compila i campi obbligatori");

return;

}




if(modificaId){


corse = corse.map(c=>

c.id === modificaId ? corsa : c

);


modificaId=null;


}else{


corse.push(corsa);


}




salvaDatabase();


pulisciForm();


aggiornaApp();



alert("Corsa salvata");


}







// SALVA DATABASE

function salvaDatabase(){

localStorage.setItem(
"corseTaxi",
JSON.stringify(corse)
);

}







// CONTROLLO STATO CORSE

function controllaCorse(){


let adesso = new Date();



corse.forEach(corsa=>{


let dataCorsa = new Date(
`${corsa.data}T${corsa.orario || "23:59"}`
);



if(dataCorsa < adesso){


if(corsa.stato==="programmata"){


corsa.stato="completata";

corsa.oraCompletata =
Date.now();


}


}



});






// ELIMINA DOPO 30 MINUTI


corse = corse.filter(c=>{


if(c.stato==="completata"){


return (
Date.now()-c.oraCompletata
<
30*60*1000
);


}


return true;


});



salvaDatabase();


}







// AGGIORNA TUTTA L'APP

function aggiornaApp(){


controllaCorse();


aggiornaHome();


aggiornaCorse();


}








// HOME

function aggiornaHome(){


let prossima = trovaProssima();



if(!prossima) return;



let home =
document.querySelector("#home .next-card");



home.innerHTML=`

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








function trovaProssima(){


return corse

.filter(c=>c.stato==="programmata")

.sort((a,b)=>{


return new Date(
a.data+"T"+a.orario
)
-
new Date(
b.data+"T"+b.orario
);


})[0];


}








// LISTA CORSE


function aggiornaCorse(){



let lista=document.querySelector("#corse");


let programmate=corse.filter(
c=>c.stato==="programmata"
);


let completate=corse.filter(
c=>c.stato==="completata"
);



lista.innerHTML=`

<h1>Le mie corse</h1>


<div id="prossima"></div>


<h2>Corse programmate</h2>


<div id="programmate"></div>


<h2>Corse completate</h2>


<div id="completate"></div>


`;



let prossima=trovaProssima();



if(prossima){


document
.querySelector("#prossima")
.innerHTML=creaCard(prossima,true);


}



programmate
.filter(c=>!prossima || c.id!==prossima.id)
.forEach(c=>{


document
.querySelector("#programmate")
.innerHTML += creaCard(c,false);


});




completate.forEach(c=>{


document
.querySelector("#completate")
.innerHTML += creaCard(c,false);


});


}







function creaCard(corsa,evidenziata){


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


<button onclick="modificaCorsa(${corsa.id})">
Modifica
</button>


<button class="delete"
onclick="eliminaCorsa(${corsa.id})">
Elimina
</button>


</div>


</div>



</div>


`;

}









// ELIMINA

function eliminaCorsa(id){


if(confirm("Eliminare questa corsa?")){


corse =
corse.filter(c=>c.id!==id);


salvaDatabase();

aggiornaApp();


}


}







// MODIFICA


function modificaCorsa(id){


let c =
corse.find(c=>c.id===id);



if(!c) return;



modificaId=id;



openPage(
"add",
document.querySelector(".add")
);



let campi =
document.querySelectorAll(
"#add input, #add textarea"
);



campi[0].value=c.cliente;
campi[1].value=c.telefono;
campi[2].value=c.partenza;
campi[3].value=c.arrivo;
campi[4].value=c.data;
campi[5].value=c.orario;
campi[6].value=c.passeggeri;
campi[7].value=c.note;


document.querySelector(".save").innerText=
"Salva modifiche";


}







function pulisciForm(){


document
.querySelectorAll("#add input, #add textarea")
.forEach(c=>c.value="");


document.querySelector(".save").innerText=
"Salva corsa";


}




// CONTROLLO OGNI MINUTO

setInterval(()=>{

aggiornaApp();

},60000);
