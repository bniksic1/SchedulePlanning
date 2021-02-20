const div = document.getElementById("prva");
Raspored.iscrtajRaspored(div, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 20);
// Raspored.dodajAktivnost(div, "WT", "vježbe", 12, 13.5,"ponedjeljak");
// Raspored.dodajAktivnost(div, "RMA", "predavanje", 14, 17,"ponedjeljak");
// Raspored.dodajAktivnost(div, "RMA", "vježbe", 12.5, 14,"utorak");
// Raspored.dodajAktivnost(div, "DM", "tutorijal", 14, 16,"utorak");
// Raspored.dodajAktivnost(div, "DM", "predavanje", 16, 19,"utorak");
// Raspored.dodajAktivnost(div, "OI", "predavanje", 12, 15,"srijeda");

let akt = []

fetch('http://localhost:3000/v2/aktivnost')
    .then((resp) => resp.json())
    .then(aktivnosti => {
        akt = aktivnosti
        for(let aktivnost of aktivnosti)
            Raspored.dodajAktivnost(div, aktivnost.predmet.naziv, aktivnost.tip.naziv, aktivnost.pocetak, aktivnost.kraj,aktivnost.dan.naziv);
    })

document.getElementById("button").addEventListener("click", () => {
    if(confirm("Da li ste sigurni da želite obrisati sve aktivnosti?")) {
        const deleteAktivnost = new XMLHttpRequest()

        deleteAktivnost.onreadystatechange = () => {
            if (deleteAktivnost.readyState === 4 && deleteAktivnost.status === 200)
                location.reload()
        }
        deleteAktivnost.open("DELETE", "http://localhost:3000/v2/aktivnost/all")
        deleteAktivnost.send()
    }
})



