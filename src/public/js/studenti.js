window.addEventListener('load', () => {
    const getGrupeAJAX = new XMLHttpRequest()

    getGrupeAJAX.onreadystatechange = () => {
        if (getGrupeAJAX.readyState === 4 && getGrupeAJAX.status === 200) {
            const grupe = JSON.parse(getGrupeAJAX.response)
            grupe.forEach(grupa =>
                document.getElementById('select').innerHTML += "<option value=" + grupa.id + "p" + grupa.predmet.id + ">" + grupa.naziv + "</option>"
            )
        }
        else if (getGrupeAJAX.readyState === 4 && getGrupeAJAX.status === 404)
            console.log("Greska u dohvaćanju grupa sa servera!")
    }

    getGrupeAJAX.open("GET", "http://localhost:3000/v2/grupa")
    getGrupeAJAX.send()
})

// TODO: Možda bi trebalo ispraviti da na kraju unosa može biti jedan novi red

const parseStudentsCSV = () => {
    const studenti = []
    const studentiCSV = document
        .getElementById('textarea')
        .value
        .split("\n")

    for(const student of studentiCSV){
        const studentInfo = student.split(",")
        if(studentInfo.length !== 2){
            document.getElementById('textarea').value = "NEISPRAVAN CSV FORMAT!"
            return null
        }
        console.log(document.getElementById('select').value)
        const grupaInfo = document.getElementById('select').value.split("p")

        studenti.push({
            ime: studentInfo[0],
            index: Number(studentInfo[1]),
            grupaId: Number(grupaInfo[0]),
            predmetId: Number(grupaInfo[1])
        })
    }

    return studenti
}

const postStudenti = studenti => {
    const postStudentiAJAX = new XMLHttpRequest()

    postStudentiAJAX.onreadystatechange = () => {
        if (postStudentiAJAX.readyState === 4 && postStudentiAJAX.status === 200) {
            document.getElementById('textarea').value =
                JSON.parse(postStudentiAJAX.response).message
        }
        else if (postStudentiAJAX.readyState === 4 && postStudentiAJAX.status === 404)
            console.log("Greska u dohvaćanju grupa sa servera!")
    }

    postStudentiAJAX.open("POST", "http://localhost:3000/v2/student")
    postStudentiAJAX.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    postStudentiAJAX.send(JSON.stringify(studenti))
}

document.getElementById('posalji').addEventListener('click', () => {
    if(Number(document.getElementById('select').value) !== -1) {
        const studenti = parseStudentsCSV()
        if(studenti)
            postStudenti(studenti)
    }
})
