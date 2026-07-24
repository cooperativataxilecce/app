let corse = JSON.parse(localStorage.getItem("corseTaxi")) || [];

let autista = localStorage.getItem("nomeTassista") || "";

let modificaId = null;



document.addEventListener("DOMContentLoaded", () => {

    controlloAccesso();

    aggiornaApp();


    document.querySelector(".save")
    .addEventListener("click", salvaCorsa);

});





// --------------------
// PRIMO ACCESSO
// --------------------


function controlloAccesso(){


let welcome =
document.getElementById("welcome");


let app =
document.getElementById("app");



if(autista){


welcome.style.display="none";

app.style.display="block";


document.getElementById("driverName")
.innerText =
"Tassista " + autista;


document.getElementById("driverInput")
.value = autista;



}else{


app.style.display="none";


}



}





function salvaPrimoAccesso(){


let nome =
document.getElementById("firstDriverName")
.value.trim();



if(nome===""){

alert("Inserisci il nome");

return;

}



localStorage.setItem(
"nomeTassista",
nome
);



autista = nome;



document.getElementById("welcome")
.style.display="none";


document.getElementById("app")
.style.display="block";


document.getElementById("driverName")
.innerText =
"Tassista " + nome;


}




// --------------------
// PAGINE
// --------------------


function openPage(page, element){


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



element.classList.add("active");


aggiornaApp();


}








// --------------------
// IMPOSTAZIONI
// --------------------


function salvaNomeTassista(){


let nome =
document.getElementById("driverInput")
.value.trim();



if(!nome)return;



localStorage.setItem(
"nomeTassista",
nome
);



autista = nome;



document.getElementById("driverName")
.innerText =
"Tassista " + nome;


}









// --------------------
// SALVA CORSA
// --------------------


function salvaCorsa(){



let corsa={


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

alert("Compila i campi obbligatori");

return;

}




if(modificaId){


corse =
corse.map(c=>

c.id===modificaId
?
corsa
:
c

);



modificaId=null;



}else{


corse.push(corsa);


}




salva();


pulisciForm();


aggiornaApp();


}








function salva(){

localStorage.setItem(
"corseTaxi",
JSON.stringify(corse)
);


}








// --------------------
// CONTROLLO TEMPI
// --------------------


function controlloCorse(){



let ora = new Date();



corse.forEach(c=>{


let data =
new Date(
`${c.data}T${c.orario || "23:59"}`
);



if(data < ora){


if(c.stato==="programmata"){


c.stato="completata";


c.completata =
Date.now();


}


}



});





corse =
corse.filter(c=>{


if(c.stato==="completata"){


return Date.now()-c.completata
<
1800000;


}


return true;


});



salva();


}









// --------------------
// AGGIORNA
// --------------------


function aggiornaApp(){


controlloCorse();


aggiornaHome();


aggiornaCorse();


}







function prossimaCorsa(){


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








// --------------------
// HOME
// --------------------


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




box.innerHTML =

`

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









// --------------------
// LE MIE CORSE
// --------------------


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
creaCorsa(next,true);

}





corse.forEach(c=>{


if(c.stato==="programmata"
&&
(!next || c.id!==next.id)){


programmate.innerHTML +=
creaCorsa(c,false);


}



if(c.stato==="completata"){


completate.innerHTML +=
creaCorsa(c,false);


}



});


}









function creaCorsa(c,evidenziata){


return `


<div class="card trip ${evidenziata?"next-card":""}"

onclick="toggleTrip(this)">



<div class="trip-header">


<div>


<div class="time">

${c.orario || "--"}

</div>


<div>

${c.cliente || "Cliente"}

</div>


<div>

${c.partenza}

</div>


</div>


<div>

▼

</div>


</div>




<div class="details">


<br>

Telefono:

${c.telefono || "-"}


<br><br>


Arrivo:

${c.arrivo || "-"}


<br><br>


Data:

${c.data}



<br><br>


Note:

${c.note || "-"}




<div class="actions">


<button onclick="event.stopPropagation(); modificaCorsa(${c.id})">

Modifica

</button>


<button class="delete"

onclick="event.stopPropagation(); eliminaCorsa(${c.id})">

Elimina

</button>


</div>



</div>


</div>


`;

}





function toggleTrip(element){

element.classList.toggle("open");

}









// --------------------
// MODIFICA
// --------------------


function modificaCorsa(id){


let c =
corse.find(x=>x.id===id);



modificaId=id;



openPage(
"add",
document.querySelector(".add")
);



cliente.value=c.cliente;

telefono.value=c.telefono;

partenza.value=c.partenza;

arrivo.value=c.arrivo;

data.value=c.data;

orario.value=c.orario;

passeggeri.value=c.passeggeri;

note.value=c.note;



}








// --------------------
// ELIMINA
// --------------------


function eliminaCorsa(id){


if(confirm("Eliminare corsa?")){


corse =
corse.filter(c=>c.id!==id);


salva();


aggiornaApp();


}


}









function pulisciForm(){


document.querySelectorAll(
"#add input,#add textarea"
)
.forEach(x=>x.value="");


}







setInterval(()=>{

aggiornaApp();

},60000);
