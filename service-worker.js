const CACHE_NAME = "cooperativa-taxi-lecce-v1";


const FILES_TO_CACHE = [

    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./logo.png",
    "./manifest.json"

];





// INSTALLAZIONE APP

self.addEventListener("install", event => {


    event.waitUntil(


        caches.open(CACHE_NAME)

        .then(cache => {


            return cache.addAll(FILES_TO_CACHE);


        })


    );


    self.skipWaiting();


});








// APERTURA APP

self.addEventListener("activate", event => {


    event.waitUntil(


        caches.keys()

        .then(keys => {


            return Promise.all(


                keys.map(key => {


                    if(key !== CACHE_NAME){


                        return caches.delete(key);


                    }


                })


            );


        })


    );


    self.clients.claim();


});








// FUNZIONAMENTO OFFLINE

self.addEventListener("fetch", event => {


    event.respondWith(


        caches.match(event.request)

        .then(response => {


            return response || fetch(event.request);


        })


    );


});









// NOTIFICHE PUSH (PRONTE PER FIREBASE)

self.addEventListener("push", event => {



    let dati = {};


    if(event.data){


        dati = event.data.json();


    }




    const titolo =
    dati.title || "Cooperativa Taxi Lecce";



    const opzioni = {


        body:
        dati.body || "Nuova comunicazione",


        icon:
        "logo.png",


        badge:
        "logo.png",


        vibrate:
        [200,100,200]


    };




    event.waitUntil(


        self.registration.showNotification(

            titolo,

            opzioni

        )


    );


});









// CLICK SULLA NOTIFICA

self.addEventListener("notificationclick", event => {


    event.notification.close();



    event.waitUntil(


        clients.openWindow("./index.html")


    );


});
