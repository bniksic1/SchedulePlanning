const prethodnaAktivnost = document.getElementById("prethodna-aktivnost")
const trenutnaAktivnost = document.getElementById("trenutna-aktivnost")
const sljedecaAktivnost = document.getElementById("sljedeca-aktivnost")


fetch('http://localhost:3000/v2/aktivnost')
    .then((resp) => resp.json())
    .then(aktivnosti => {

    })