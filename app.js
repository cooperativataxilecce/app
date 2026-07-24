let corse = JSON.parse(localStorage.getItem("corseTaxi")) || [];

let autista = localStorage.getItem("nomeTassista") || "";

let modificaId = null;

let giornoVisualizzato = new Date();




// AVVIO

document.addEventListener("DOMContentLoaded",()=>{


    avvioApp();


    document.querySelector(".save")
    .addEventListener("click", salvaCorsa);


});




// =====================
// ACCESSO
// =====================


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




function salvaPrimoAccesso(){


let nome =
document.getElementById("setupDriverName")
.value.trim();



if(nome===""){

alert("Inserisci il nome");

return;

}



localStorage.setItem(
"nomeTassista",
nome
);



autista=nome;



document.getElementById("setupPage")
.style.display="none";


document.getElementById("appContainer")
.style.display="block";


document.getElementById("driverName")
.innerText =
"Tassista " + nome;



}









// =====================
// PAGINE
// =====================


function openPage(page,element){


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








// =====================
// DATE
// =====================


function formatoData(data){


let anno =
data.getFullYear();


let mese =
String(data.getMonth()+1)
.padStart(2,"0");


let giorno =
String(data.getDate())
.padStart(2,"0");


return `${anno}-${mese}-${giorno}`;

}




function cambiaGiorno(numero){


giornoVisualizzato.setDate(

giornoVisualizzato.getDate()+numero

);



aggiornaCorse();


}









// =====================
// SALVA CORSA
// =====================


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









// =====================
// CONTROLLO AUTOMATICO
// =====================


function controlloCorse(){


let ora =
new Date();



corse.forEach(c=>{


let dataCorsa =
new Date(

`${c.data}T${c.orario || "23:59"}`

);



if(dataCorsa < ora){



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



salvaDatabase();


}









// =====================
// AGGIORNA
// =====================


function aggiornaApp(){


controlloCorse();


aggiornaHome();


aggiornaCorse();


}









// =====================
// PROSSIMA DI OGGI
// =====================


function prossimaCorsa(){


let oggi =
formatoData(new Date());



return corse

.filter(c=>

c.data===oggi

&&

c.stato==="programmata"

)



.sort((a,b)=>{


return (a.orario || "")
.localeCompare(
b.orario || ""
);


})[0];



}








// =====================
// HOME
// =====================


function aggiornaHome(){


let box =
document.getElementById("homeNext");



let corsa =
prossimaCorsa();



if(!corsa){


box.innerHTML =
"Nessuna corsa prevista oggi";


return;


}




box.innerHTML=`


<div class="time">

${corsa.orario}

</div>


<div class="info">

${corsa.cliente || "Cliente"}

</div>


<div class="info">

Partenza:

<br>

${corsa.partenza}

</div>


<div class="info">

Arrivo:

<br>

${corsa.arrivo || "-"}

</div>


`;



}









// =====================
// LE MIE CORSE
// =====================


function aggiornaCorse(){


let programmate =
document.getElementById("plannedTrips");


let completate =
document.getElementById("completedTrips");


let prossima =
document.getElementById("nextTrip");


let titolo =
document.getElementById("giornoSelezionato");




programmate.innerHTML="";

completate.innerHTML="";

prossima.innerHTML="";






let giorno =
formatoData(giornoVisualizzato);





if(titolo){



let oggi =
formatoData(new Date());



if(giorno===oggi){


titolo.innerText="Oggi";


}else{


titolo.innerText =
giornoVisualizzato
.toLocaleDateString(
"it-IT",
{
weekday:"long",
day:"numeric",
month:"long"
}
);


}



}







let lista =
corse.filter(c=>


c.data===giorno


);





let programmateGiorno =
lista.filter(c=>

c.stato==="programmata"

);





let prima =
programmateGiorno
.sort((a,b)=>

a.orario.localeCompare(
b.orario

)

)[0];






if(prima){


prossima.innerHTML =
creaCard(prima,true);


}





programmateGiorno.forEach(c=>{


if(!prima || c.id!==prima.id){


programmate.innerHTML +=
creaCard(c,false);


}



});






lista

.filter(c=>

c.stato==="completata"

)

.forEach(c=>{


completate.innerHTML +=
creaCard(c,false);


});



}









// =====================
// CARD
// =====================


function creaCard(c,evidenziata){


return `


<div class="card trip ${evidenziata?"next-card":""}"

onclick="this.classList.toggle('open')">



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


Telefono:

${c.telefono || "-"}


<br><br>


Arrivo:

${c.arrivo || "-"}


<br><br>


Passeggeri:

${c.passeggeri || "-"}


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









// =====================
// MODIFICA
// =====================


function modificaCorsa(id){


let c =
corse.find(x=>x.id===id);



if(!c)return;



modificaId=id;



openPage(
"add",
document.querySelector(".add")
);



cliente.value=c.cliente || "";

telefono.value=c.telefono || "";

partenza.value=c.partenza || "";

arrivo.value=c.arrivo || "";

data.value=c.data || "";

orario.value=c.orario || "";

passeggeri.value=c.passeggeri || "";

note.value=c.note || "";


}









// =====================
// ELIMINA
// =====================


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
"#add input,#add textarea"
)

.forEach(x=>x.value="");


}






setInterval(()=>{

// =====================
// BACKUP DATI
// =====================


function mostraBackupMessaggio(testo){


let box = document.getElementById("backupMessage");


if(box){


box.innerText = testo;


box.classList.add("show");



setTimeout(()=>{


box.classList.remove("show");


},4000);


}


}







function aggiornaUltimoBackup(){


let ultimo =
localStorage.getItem("ultimoBackup");



let box =
document.getElementById("lastBackup");



if(box && ultimo){


let data =
new Date(ultimo);



box.innerText =
"Ultimo backup: " +
data.toLocaleString("it-IT");


}



}








function esportaBackup(){



let backup = {


versione:"1.0",


dataBackup:
new Date(),


autista:
autista,


corse:
corse



};




let contenuto =
JSON.stringify(
backup,
null,
2
);




let file =
new Blob(
[contenuto],
{
type:"application/json"
}
);




let link =
document.createElement("a");



link.href =
URL.createObjectURL(file);



let data =
new Date()
.toLocaleDateString("it-IT")
.replaceAll("/","-");



link.download =
"backup-corse-taxi-"+data+".json";



link.click();





localStorage.setItem(
"ultimoBackup",
new Date()
);




aggiornaUltimoBackup();



mostraBackupMessaggio(
"Backup creato con successo"
);



}









function importaBackup(event){



let file =
event.target.files[0];



if(!file){

return;

}




let lettore =
new FileReader();




lettore.onload=function(e){



try{



let dati =
JSON.parse(e.target.result);




if(!dati.corse){


throw "errore";


}





corse =
dati.corse;



salvaDatabase();





if(dati.autista){


autista =
dati.autista;



localStorage.setItem(
"nomeTassista",
autista
);



}




aggiornaApp();



mostraBackupMessaggio(
"Backup importato correttamente"
);



}catch(error){



mostraBackupMessaggio(
"Backup non valido"
);



}



};





lettore.readAsText(file);



}







// CARICA ULTIMO BACKUP ALL'AVVIO

document.addEventListener(
"DOMContentLoaded",
()=>{


aggiornaUltimoBackup();


});
aggiornaApp();

},60000);
