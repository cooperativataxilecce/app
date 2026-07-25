// =====================
// DATABASE
// =====================

let corse = JSON.parse(localStorage.getItem("corseTaxi")) || [];

let incassi = JSON.parse(localStorage.getItem("incassiTaxi")) || [];

let autista = localStorage.getItem("nomeTassista") || "";

let modificaId = null;

let modificaIncassoId = null;

let giornoVisualizzato = new Date();

let giornoIncassi = new Date();




// =====================
// AVVIO APP
// =====================


document.addEventListener("DOMContentLoaded",()=>{

    avvioApp();

});





function avvioApp(){


    const setup =
    document.getElementById("setupPage");


    const app =
    document.getElementById("appContainer");



    if(autista){


        setup.style.display="none";

        app.style.display="block";


        document.getElementById("driverName").innerText =
        "Tassista " + autista;


    }else{


        setup.style.display="flex";

        app.style.display="none";


    }



    aggiornaUltimoBackup();

    aggiornaApp();


}









// =====================
// PRIMO ACCESSO
// =====================


function salvaPrimoAccesso(){


    let nome =
    document.getElementById("setupDriverName")
    .value
    .trim();



    if(!nome){

        alert("Inserisci il nome");

        return;

    }



    autista = nome;



    localStorage.setItem(
        "nomeTassista",
        nome
    );



    document.getElementById("setupPage")
    .style.display="none";


    document.getElementById("appContainer")
    .style.display="block";


    document.getElementById("driverName")
    .innerText =
    "Tassista " + nome;



    aggiornaApp();


}









// =====================
// NAVIGAZIONE PAGINE
// =====================


function openPage(page,element){


    document.querySelectorAll(".page")
    .forEach(p=>{

        p.classList.remove("active");

    });



    let pagina =
    document.getElementById(page);



    if(pagina){

        pagina.classList.add("active");

    }



    document.querySelectorAll(".nav-item")
    .forEach(n=>{

        n.classList.remove("active");

    });



    if(element){

        element.classList.add("active");

    }



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
// SALVATAGGIO CORSA
// =====================


function salvaCorsa(){


    let corsa={


        id:
        modificaId || Date.now(),


        autista:
        autista,


        cliente:
        document.getElementById("cliente").value.trim(),


        telefono:
        document.getElementById("telefono").value.trim(),


        partenza:
        document.getElementById("partenza").value.trim(),


        arrivo:
        document.getElementById("arrivo").value.trim(),


        data:
        document.getElementById("data").value,


        orario:
        document.getElementById("orario").value,


        passeggeri:
        document.getElementById("passeggeri").value,


        note:
        document.getElementById("note").value.trim(),


        stato:
        "programmata"


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






    salvaCorse();


    pulisciForm();


    aggiornaApp();


    alert("Corsa salvata");


}






function salvaCorse(){


    localStorage.setItem(

        "corseTaxi",

        JSON.stringify(corse)

    );


}









// =====================
// CONTROLLO CORSE
// =====================


function controlloCorse(){


    let ora =
    new Date();



    corse.forEach(c=>{


        let dataCorsa =
        new Date(

            `${c.data}T${c.orario || "23:59"}`

        );



        if(dataCorsa < ora && c.stato==="programmata"){


            c.stato="completata";

            c.completata =
            Date.now();


        }



    });



    // NON elimina più lo storico


    salvaCorse();


}









// =====================
// AGGIORNAMENTO GENERALE
// =====================


function aggiornaApp(){


    controlloCorse();


    aggiornaHome();


    aggiornaCorse();


}

// =====================
// HOME - PROSSIMA CORSA
// =====================


function prossimaCorsa(){


    let oggi =
    formatoData(new Date());



    return corse

    .filter(c=>

        c.data===oggi &&
        c.stato==="programmata"

    )


    .sort((a,b)=>{


        return (a.orario || "")
        .localeCompare(
            b.orario || ""
        );


    })[0];


}









function aggiornaHome(){


    let box =
    document.getElementById("homeNext");



    if(!box) return;



    let corsa =
    prossimaCorsa();



    if(!corsa){


        box.innerHTML =
        "Nessuna corsa prevista oggi";


        return;


    }





    box.innerHTML = `


    <div class="time">
        ${corsa.orario || "--"}
    </div>


    <div>
        👤 ${corsa.cliente || "Cliente"}
    </div>


    <br>


    <div>
        📍 ${corsa.partenza}
    </div>


    <div>
        ➡️ ${corsa.arrivo || "-"}
    </div>


    `;


}









// =====================
// LISTA CORSE
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



    if(!programmate || !completate)
    return;



    programmate.innerHTML="";

    completate.innerHTML="";



    if(prossima)
    prossima.innerHTML="";





    let giorno =
    formatoData(giornoVisualizzato);




    if(titolo){


        let oggi =
        formatoData(new Date());



        titolo.innerText =
        giorno===oggi
        ?
        "Oggi"
        :
        giornoVisualizzato.toLocaleDateString(
            "it-IT",
            {
                weekday:"long",
                day:"numeric",
                month:"long"
            }
        );

    }





    let lista =
    corse.filter(c=>

        c.data===giorno

    );





    lista.sort((a,b)=>

        (a.orario || "")
        .localeCompare(
            b.orario || ""
        )

    );





    lista.forEach(c=>{


        if(c.stato==="programmata"){


            programmate.innerHTML +=
            creaCard(c,false);


        }else{


            completate.innerHTML +=
            creaCard(c,false);


        }


    });





    let prima =
    lista.find(c=>

        c.stato==="programmata"

    );



    if(prima && prossima){


        prossima.innerHTML =
        creaCard(prima,true);


    }



}









// =====================
// CARD CORSA
// =====================


function creaCard(c,evidenziata){


return `


<div class="card trip ${evidenziata ? "next-card":""}">


<div class="trip-header"
onclick="this.parentElement.classList.toggle('open')">


<div>


<div class="time">

${c.orario || "--"}

</div>



<strong>

${c.cliente || "Cliente"}

</strong>


<br>


${c.partenza}


</div>


<div>
▼
</div>


</div>





<div class="details">


Telefono:
${c.telefono || "-"}


<br><br>



<button onclick="chiamaCliente('${c.telefono}')">

📞 Chiama

</button>



<br><br>



Arrivo:

${c.arrivo || "-"}



<br><br>



<button onclick="navigaCorsa('${c.partenza}','${c.arrivo}')">

📍 Naviga

</button>




<br><br>



Passeggeri:

${c.passeggeri || "-"}




<br><br>



Note:

${c.note || "-"}




<div class="actions">


<button onclick="modificaCorsa(${c.id})">

Modifica

</button>



<button 
class="delete"
onclick="eliminaCorsa(${c.id})">

Elimina

</button>


</div>


</div>


</div>


`;

}









// =====================
// MODIFICA CORSA
// =====================


function modificaCorsa(id){


    let c =
    corse.find(x=>x.id===id);



    if(!c) return;



    modificaId=id;



    openPage(
        "add",
        document.querySelector(".add")
    );



    cliente.value =
    c.cliente || "";

    telefono.value =
    c.telefono || "";

    partenza.value =
    c.partenza || "";

    arrivo.value =
    c.arrivo || "";

    data.value =
    c.data || "";

    orario.value =
    c.orario || "";

    passeggeri.value =
    c.passeggeri || "";

    note.value =
    c.note || "";



}









// =====================
// ELIMINA CORSA
// =====================


function eliminaCorsa(id){


    if(confirm("Eliminare questa corsa?")){


        corse =
        corse.filter(c=>

            c.id!==id

        );


        salvaCorse();


        aggiornaApp();


    }


}









function pulisciForm(){


    document.querySelectorAll(
        "#add input,#add textarea"
    )
    .forEach(x=>{

        x.value="";

    });


}








// =====================
// TELEFONO
// =====================


function chiamaCliente(numero){


    if(!numero){


        alert("Numero cliente mancante");


        return;

    }



    window.location.href =
    "tel:"+numero;


}








// =====================
// GOOGLE MAPS
// =====================


function navigaCorsa(partenza,arrivo){


    let url =
    "https://www.google.com/maps/dir/"
    +
    encodeURIComponent(partenza)
    +
    "/"
    +
    encodeURIComponent(arrivo);



    window.open(url,"_blank");


}









// =====================
// BACKUP
// =====================


function esportaBackup(){


    let backup={


        versione:"1.0",


        dataBackup:new Date(),


        autista:autista,


        corse:corse,


        incassi:incassi


    };





    let file =
    new Blob(

        [
            JSON.stringify(
                backup,
                null,
                2
            )
        ],

        {
            type:"application/json"
        }

    );





    let link =
    document.createElement("a");



    link.href =
    URL.createObjectURL(file);



    link.download =
    "backup-taxi-"
    +
    formatoData(new Date())
    +
    ".json";



    link.click();




    localStorage.setItem(
        "ultimoBackup",
        new Date()
    );



    aggiornaUltimoBackup();



}









function importaBackup(event){


    let file =
    event.target.files[0];



    if(!file)
    return;




    let reader =
    new FileReader();




    reader.onload=function(e){


        try{


            let dati =
            JSON.parse(e.target.result);



            corse =
            dati.corse || [];



            incassi =
            dati.incassi || [];



            salvaCorse();


            localStorage.setItem(
                "incassiTaxi",
                JSON.stringify(incassi)
            );



            alert("Backup importato");


            aggiornaApp();



        }

        catch{


            alert("Backup non valido");


        }


    };



    reader.readAsText(file);


}









function aggiornaUltimoBackup(){


    let box =
    document.getElementById("lastBackup");



    let ultimo =
    localStorage.getItem("ultimoBackup");



    if(box && ultimo){


        box.innerText =
        "Ultimo backup: "
        +
        new Date(ultimo)
        .toLocaleString("it-IT");


    }


}

// =====================
// UTILITY PANEL
// =====================


function apriUtility(){


    let overlay =
    document.getElementById("utilityOverlay");


    let panel =
    document.getElementById("utilityPanel");



    if(overlay)
    overlay.style.display="block";


    if(panel)
    panel.style.display="block";


}




function chiudiUtility(){


    let overlay =
    document.getElementById("utilityOverlay");


    let panel =
    document.getElementById("utilityPanel");



    if(overlay)
    overlay.style.display="none";


    if(panel)
    panel.style.display="none";


}







// =====================
// PAGINA INCASSI
// =====================


function apriElencoIncassi(){


    chiudiUtility();



    document.querySelectorAll(".page")
    .forEach(p=>{

        p.classList.remove("active");

    });



    let pagina =
    document.getElementById("elencoIncassi");



    if(pagina){

        pagina.classList.add("active");

    }



    aggiornaIncassi();


}









// =====================
// SALVA INCASSO
// =====================


function salvaIncasso(){


    let importo =
    Number(
        document.getElementById("importoIncasso")?.value
    );



    let nota =
    document.getElementById("notaIncasso")?.value || "";




    if(!importo || importo<=0){


        alert("Inserisci un importo valido");


        return;

    }




    let nuovoIncasso={


        id:
        modificaIncassoId || Date.now(),


        importo:
        importo,


        nota:
        nota,


        data:
        formatoData(giornoIncassi),


        ora:
        new Date()
        .toLocaleTimeString(
            "it-IT",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        )


    };







    if(modificaIncassoId){


        incassi =
        incassi.map(i=>{


            return i.id===modificaIncassoId
            ?
            nuovoIncasso
            :
            i;


        });


        modificaIncassoId=null;



    }else{


        incassi.push(nuovoIncasso);


    }






    localStorage.setItem(
        "incassiTaxi",
        JSON.stringify(incassi)
    );




    if(document.getElementById("importoIncasso"))

    document.getElementById("importoIncasso").value="";



    if(document.getElementById("notaIncasso"))

    document.getElementById("notaIncasso").value="";




    aggiornaIncassi();


}









// =====================
// CAMBIO GIORNO INCASSI
// =====================


function cambiaGiornoIncassi(numero){


    giornoIncassi.setDate(

        giornoIncassi.getDate()+numero

    );


    aggiornaIncassi();


}









// =====================
// VISUALIZZA INCASSI
// =====================


function aggiornaIncassi(){


    let listaBox =
    document.getElementById("listaIncassi");


    let totaleBox =
    document.getElementById("totaleElenco");



    let giornoBox =
    document.getElementById("giornoIncassiSelezionato");



    if(!listaBox)
    return;




    let data =
    formatoData(giornoIncassi);




    if(giornoBox){


        let oggi =
        formatoData(new Date());


        giornoBox.innerText =
        data===oggi
        ?
        "Oggi"
        :
        giornoIncassi.toLocaleDateString(
            "it-IT",
            {
                weekday:"long",
                day:"numeric",
                month:"long"
            }
        );


    }






    let lista =
    incassi.filter(i=>

        i.data===data

    );




    listaBox.innerHTML="";



    let totale=0;





    if(lista.length===0){


        listaBox.innerHTML=
        `
        <div class="card">
        Nessun incasso registrato
        </div>
        `;


    }




    lista.forEach(i=>{


        totale += i.importo;



        listaBox.innerHTML +=
        `

        <div class="card">


        <h2>
        + € ${i.importo.toFixed(2)}
        </h2>



        <p>
        ${i.nota || "Incasso"}
        </p>



        <small>
        ${i.ora}
        </small>



        <br><br>



        <button onclick="modificaIncasso(${i.id})">

        Modifica

        </button>



        <button onclick="eliminaIncasso(${i.id})">

        Elimina

        </button>



        </div>

        `;



    });







    if(totaleBox){


        totaleBox.innerText =
        "€ " + totale.toFixed(2);


    }


}









// =====================
// MODIFICA INCASSO
// =====================


function modificaIncasso(id){


    let i =
    incassi.find(x=>x.id===id);



    if(!i)
    return;



    modificaIncassoId=id;



    if(document.getElementById("importoIncasso"))

    document.getElementById("importoIncasso").value =
    i.importo;



    if(document.getElementById("notaIncasso"))

    document.getElementById("notaIncasso").value =
    i.nota || "";


}









// =====================
// ELIMINA INCASSO
// =====================


function eliminaIncasso(id){


    if(confirm("Eliminare questo incasso?")){


        incassi =
        incassi.filter(i=>

            i.id!==id

        );



        localStorage.setItem(
            "incassiTaxi",
            JSON.stringify(incassi)
        );



        aggiornaIncassi();


    }


}









// =====================
// CALCOLA RESTO
// =====================


function calcolaResto(){


    let prezzo =
    Number(
        document.getElementById("prezzoCorsa").value
    );



    let pagato =
    Number(
        document.getElementById("pagamentoCliente").value
    );



    let risultato =
    pagato-prezzo;



    document.getElementById("risultatoResto")
    .innerText =
    "€ " + risultato.toFixed(2);



}
