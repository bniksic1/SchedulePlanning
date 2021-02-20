const prethodnaAktivnost = document.getElementById("prethodna-aktivnost")
const trenutnaAktivnost = document.getElementById("trenutna-aktivnost")
const sljedecaAktivnost = document.getElementById("sljedeca-aktivnost")
const date = new Date()
const trenutniSati = date.getHours()
const trenutneMinute = date.getMinutes() < 30 ? 0 : 0.6
const trenutniDan = date.getDay()

const dajDanZaProvjeru = (dan) => {
    if(dan === 1)
        return "PONEDJELJAK"
    else if(dan === 2)
        return "UTORAK"
    else if(dan === 3)
        return "SRIJEDA"
    else if(dan === 4)
        return "ČETVRTAK"
    else if(dan === 5)
        return "PETAK"
    else if(dan === 6)
        return "SUBOTA"
    else if(dan === 7)
        return "NEDJELJA"
}

const dajVrijemeZaIspis = (vrijeme) => {
    let realTime = "0" + (vrijeme | 0)
    if(vrijeme === "/")
        return "/"
    else if(vrijeme == (vrijeme | 0))
        return realTime.slice(-2) + ":00h"
    else
        return realTime.slice(-2) + ":30h"
}

const postaviAktivnost = (aktivnost, vrijemeAktivnosti) => {
    vrijemeAktivnosti.getElementsByClassName("naslov")[0].innerHTML = aktivnost.predmet.naziv + "<br>" + aktivnost.tip.naziv + "<br>"
    vrijemeAktivnosti.getElementsByClassName("opis")[0].innerHTML =
        "Početak: " + dajVrijemeZaIspis(aktivnost.pocetak) + "<br>" +
        "Kraj: " + dajVrijemeZaIspis(aktivnost.kraj) + "<br>" +
        "Dan: " + dajDanZaProvjeru(trenutniDan)
}

postaviAktivnost({predmet:{naziv: 'Nema trenutnih '}, tip:{naziv:'aktivnosti za ovaj dan'}, pocetak:"/", kraj:"/"}, trenutnaAktivnost)
postaviAktivnost({predmet:{naziv: 'Nema prethodnih '}, tip:{naziv:'aktivnosti za ovaj dan'}, pocetak:"/", kraj:"/"}, prethodnaAktivnost)
postaviAktivnost({predmet:{naziv: 'Nema sljedecih '}, tip:{naziv:'aktivnosti za ovaj dan'}, pocetak:"/", kraj:"/"}, sljedecaAktivnost)


fetch('http://localhost:3000/v2/aktivnost')
    .then((resp) => resp.json())
    .then(aktivnosti => aktivnosti.filter(aktivnost => aktivnost.dan.naziv === dajDanZaProvjeru(trenutniDan)))
    .then(aktivnostiNaTrenutniDan => {
        for(let aktivnost of aktivnostiNaTrenutniDan)
            if(aktivnost.pocetak <= trenutniSati + trenutneMinute && aktivnost.kraj >= trenutniSati + trenutneMinute)
                postaviAktivnost(aktivnost, trenutnaAktivnost)

        const prijasnjeAktivnosti = aktivnostiNaTrenutniDan.filter(aktivnost => aktivnost.kraj < trenutniSati + trenutneMinute)
            .sort((a1, a2) => a1.kraj + a2.kraj)
        if(prijasnjeAktivnosti.length !== 0)
            postaviAktivnost(prijasnjeAktivnosti[prijasnjeAktivnosti.length - 1], prethodnaAktivnost)

        const sljedeceAktivnosti = aktivnostiNaTrenutniDan.filter(aktivnost => aktivnost.pocetak > trenutniSati + trenutneMinute)
            .sort((a1, a2) => a1.kraj + a2.kraj)
        if(sljedeceAktivnosti.length !== 0)
            postaviAktivnost(sljedeceAktivnosti[0], sljedecaAktivnost)
    })

