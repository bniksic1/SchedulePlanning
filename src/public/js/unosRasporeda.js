const pretvoriVrijeme = (vrijeme) => {
    vrijeme = vrijeme.replace(":", ".")
    if(vrijeme.substr(3, 2) === "00")
        return vrijeme.substr(0, 2)
    else if(vrijeme.substr(3, 2) === "30")
        return vrijeme.substr(0, 3) + "5"
    return vrijeme + "1"
}

const obrisiNoviPredmet = (predmet) => {
    const delPredmet = new XMLHttpRequest()

    delPredmet.onreadystatechange = () => {
        if (delPredmet.readyState === 4 && delPredmet.status === 200)
            console.log("Novi dodani predmet obirsan !")
        else if (delPredmet.readyState === 4 && delPredmet.status === 404)
            console.log("Novi dodani predmet nije obrisan, GRESKA !")
    }

    delPredmet.open("DELETE", "http://localhost:3000/v2/predmet/" + predmet.id)
    delPredmet.send()
}

const validationAction = (isValid, poruka) => {
    const validacija = document.getElementById("validacija")

    validacija.style.display = "flex";
    isValid ? validacija.style.backgroundColor = "lightgreen" : validacija.style.backgroundColor = "lightcoral";
    validacija.innerText = poruka
    setTimeout(() => {
        validacija.style.display = "none"
    }, 2000)
}

const restartTabele = () => {
    document.getElementById("naziv").value = ""
    document.getElementById("tip").value = ""
    document.getElementById("pocetak").value = ""
    document.getElementById("kraj").value = ""
}

const zapisiNovuAktivnost = (tip, dan, statusPredmeta, predmet) => {
    const ajaxAktivnost = new XMLHttpRequest()

    let params =
        "naziv=" + predmet.naziv + " " + tip.naziv + "&"
        + "tipId=" + tip.id + "&"
        + "predmetId=" + predmet.id + "&"
        + "pocetak=" + pretvoriVrijeme(document.getElementById("pocetak").value) + "&"
        + "kraj=" + pretvoriVrijeme(document.getElementById("kraj").value) + "&"
        + "danId=" + dan.id

    ajaxAktivnost.onreadystatechange = () => {
        if(ajaxAktivnost.readyState === 4 && ajaxAktivnost.status === 200){
            validationAction(true, "Aktivnost je uspješno zapisana !")
            restartTabele();
        }
        else if(ajaxAktivnost.readyState === 4 && ajaxAktivnost.status === 400){
            validationAction(false, "Aktivnost nije validna !")
            if(statusPredmeta === 200)
                obrisiNoviPredmet(predmet)
        }
    }

    ajaxAktivnost.open('POST', "http://localhost:3000/v2/aktivnost", true);
    ajaxAktivnost.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajaxAktivnost.send(params)
}

const asyncPostNewActivity = (statusPredmeta, predmet) => {
    const ajaxDan = new XMLHttpRequest()

    ajaxDan.onreadystatechange = () => {
        if(ajaxDan.readyState === 4 && (ajaxDan.status === 200 || ajaxDan.status === 409)){

            const ajaxTip = new XMLHttpRequest()

            ajaxTip.onreadystatechange = () => {
                if(ajaxTip.readyState === 4 && (ajaxTip.status === 200 || ajaxTip.status === 409))
                    zapisiNovuAktivnost(JSON.parse(ajaxTip.response).tip, JSON.parse(ajaxDan.response).dan, statusPredmeta, predmet)

                else if(ajaxTip.readyState === 4 && ajaxTip.status === 400)
                    validationAction(false, "Greška pri zapisivanju tipa !")
            }

            ajaxTip.open('POST', "http://localhost:3000/v2/tip", true);
            ajaxTip.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            ajaxTip.send(JSON.stringify({"naziv": document.getElementById("tip").value}))

        }
        else if(ajaxDan.readyState === 4 && ajaxDan.status === 400)
            validationAction(false, "Greška pri zapisivanju dana !")

    }

    ajaxDan.open('POST', "http://localhost:3000/v2/dan", true);
    ajaxDan.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    ajaxDan.send(JSON.stringify({"naziv": document.getElementById("dan").value}))
}

const validation = () => {
    if(document.getElementById("naziv").value === "")
        validationAction(false, "Polje naziv ne smije biti prazno")
    else if(document.getElementById("tip").value === "")
        validationAction(false, "Polje tip ne smije biti prazno")
    else if(document.getElementById("pocetak").value === "")
        validationAction(false, "Unesite validan početak aktivnosti (8-20h)")
    else if(document.getElementById("kraj").value === "")
        validationAction(false, "Unesite validan kraj aktivnosti (8-20h)")
    else if(document.getElementById("pocetak").value >= document.getElementById("kraj").value)
        validationAction(false, "Vrijeme početka aktivnosti ne može biti veće od kraja")
    else
        return true
    return false

}

document.getElementById("button").addEventListener("click", () => {
    if(!validation())
        return
    const postPredmet = new XMLHttpRequest()

    postPredmet.onreadystatechange = () => {
        if (postPredmet.readyState === 4 && (postPredmet.status === 200 || postPredmet.status === 409))
            asyncPostNewActivity(postPredmet.status, JSON.parse(postPredmet.response).predmet)

        else if (postPredmet.readyState === 4 && postPredmet.status === 404)
            validationAction(false, "Greška pri zapisivanju predmeta !")
    }
    postPredmet.open("POST", "http://localhost:3000/v2/predmet")
    postPredmet.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    postPredmet.send(JSON.stringify({"naziv": document.getElementById("naziv").value}))
})


