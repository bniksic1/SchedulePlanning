predmetiTabela = document.getElementById("tbody-predmeti")
aktivnostiTabela = document.getElementById("tbody-aktivnosti")
studentiTabela = document.getElementById("tbody-studenti")
tipoviTabela = document.getElementById("tbody-tipovi")

const dajVrijemeZaIspis = (vrijeme) => {
    let realTime = "0" + (vrijeme | 0)
    if(vrijeme === "/")
        return "/"
    else if(vrijeme == (vrijeme | 0))
        return realTime.slice(-2) + ":00"
    else
        return realTime.slice(-2) + ":30"
}


fetch('http://localhost:3000/v2/predmet')
    .then((resp) => resp.json())
    .then(predmeti => {
        for(let predmet of predmeti){
            predmetiTabela.innerHTML +=
                "<tr>" +
                "<th scope=\"row\">" + predmet.id + "</th>" +
                "<td>" + predmet.naziv + "</td>" +
                "</tr>"
        }
    })

fetch('http://localhost:3000/v2/aktivnost')
    .then((resp) => resp.json())
    .then(aktivnosti => {
        for(let aktivnost of aktivnosti){
            aktivnostiTabela.innerHTML +=
                "<tr>" +
                    "<th scope=\"row\">" + aktivnost.id + "</th>" +
                    "<td>" + aktivnost.naziv + "</td>" +
                    "<td>" + dajVrijemeZaIspis(aktivnost.pocetak) + "</td>" +
                    "<td>" + dajVrijemeZaIspis(aktivnost.kraj) + "</td>" +
                    "<td>" + aktivnost.predmet.naziv + "</td>" +
                    "<td>" + aktivnost.dan.naziv + "</td>" +
                    "<td>" + aktivnost.tip.naziv + "</td>" +
                "</tr>"
        }
    })

fetch('http://localhost:3000/v2/tip')
    .then((resp) => resp.json())
    .then(tipovi => {
        for(let tip of tipovi){
            tipoviTabela.innerHTML +=
                "<tr>" +
                "<th scope=\"row\">" + tip.id + "</th>" +
                "<td>" + tip.naziv + "</td>" +
                "</tr>"
        }
    })

fetch('http://localhost:3000/v2/student')
    .then((resp) => resp.json())
    .then(studenti => {
        for(let student of studenti){
            studentiTabela.innerHTML +=
                "<tr>" +
                "<th scope=\"row\">" + student.id + "</th>" +
                "<td>" + student.ime + "</td>" +
                "<td>" + student.index + "</td>" +
                "</tr>"
        }
    })