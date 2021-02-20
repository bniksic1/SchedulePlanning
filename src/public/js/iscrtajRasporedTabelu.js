const div = document.getElementById("prva");
Raspored.iscrtajRaspored(div, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 20);
// Raspored.dodajAktivnost(div, "WT", "vježbe", 12, 13.5,"ponedjeljak");
// Raspored.dodajAktivnost(div, "RMA", "predavanje", 14, 17,"ponedjeljak");
// Raspored.dodajAktivnost(div, "RMA", "vježbe", 12.5, 14,"utorak");
// Raspored.dodajAktivnost(div, "DM", "tutorijal", 14, 16,"utorak");
// Raspored.dodajAktivnost(div, "DM", "predavanje", 16, 19,"utorak");
// Raspored.dodajAktivnost(div, "OI", "predavanje", 12, 15,"srijeda");

fetch('http://localhost:3000/v2/aktivnost')
    .then((resp) => resp.json())
    .then(aktivnosti => {
        for(let aktivnost of aktivnosti)
            Raspored.dodajAktivnost(div, aktivnost.predmet.naziv, aktivnost.tip.naziv, aktivnost.pocetak, aktivnost.kraj,aktivnost.dan.naziv);
    })



