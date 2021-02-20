const Sequelize = require('sequelize')
const {Op} = require("sequelize");
const bodyParser = require('body-parser')
const sequelize = require('./DB.js')
const express = require("express")
const app = express()
const fs = require('fs')
const FILE_AKTIVNOSTI = "private\\aktivnosti.txt"
const FILE_PREDMETI = "private\\predmeti.txt"
const DB = require('./DB.js')

DB.sequelize
    .sync()
    .then(() => {
        console.log("Gotovo kreiranje tabela!");
    });

const isActivityValid = (aktivnost) => {
    if (typeof aktivnost.naziv === "string" &&
        typeof aktivnost.tip === "string" &&
        typeof aktivnost.pocetak === "number" &&
        typeof aktivnost.kraj === "number" &&
        typeof aktivnost.dan === "string" &&
        aktivnost.naziv !== "" &&
        aktivnost.tip !== "" &&
        ["PONEDJELJAK", "UTORAK", "SRIJEDA", "ČETVRTAK", "CETVRTAK", "PETAK", "SUBOTA", "NEDJELJA"].includes(aktivnost.dan.toUpperCase()) &&
        aktivnost.pocetak >= 8 &&
        aktivnost.kraj <= 20 &&
        aktivnost.kraj > aktivnost.pocetak) {

        if ((aktivnost.pocetak != parseInt(aktivnost.pocetak) && aktivnost.pocetak - parseInt(aktivnost.pocetak) !== 0.5)
            || (aktivnost.kraj != parseInt(aktivnost.kraj) && aktivnost.kraj - parseInt(aktivnost.kraj) !== 0.5))
            return false
 
        const data = String(fs.readFileSync(FILE_AKTIVNOSTI, "utf-8"))
        const aktivnosti = parseActivitiesFile(data)

        for (let i = 0; i < aktivnosti.length; i++) {
            if (aktivnost.dan.toUpperCase() === aktivnosti[i].dan.toUpperCase() &&
                (aktivnost.pocetak >= aktivnosti[i].pocetak && aktivnost.kraj <= aktivnosti[i].kraj
                    || aktivnost.pocetak < aktivnosti[i].pocetak && aktivnost.kraj > aktivnosti[i].pocetak
                    || aktivnost.pocetak < aktivnosti[i].kraj && aktivnost.kraj > aktivnosti[i].kraj))
                return false
        }
        return true
    } else
        return false
}

const isActivityValidv2 = (aktivnost, aktivnosti) => {
    aktivnost.pocetak = Number(aktivnost.pocetak)
    aktivnost.kraj = Number(aktivnost.kraj)
    aktivnost.danId = Number(aktivnost.danId)

    if (typeof aktivnost.naziv === "string" &&
        aktivnost.naziv !== "" &&
        aktivnost.pocetak >= 8 &&
        aktivnost.kraj <= 20 &&
        aktivnost.kraj > aktivnost.pocetak) {

        if ((aktivnost.pocetak != parseInt(aktivnost.pocetak) && aktivnost.pocetak - parseInt(aktivnost.pocetak) !== 0.5)
            || (aktivnost.kraj != parseInt(aktivnost.kraj) && aktivnost.kraj - parseInt(aktivnost.kraj) !== 0.5))
            return false

        for (const akt of aktivnosti) {
            if (aktivnost.danId === akt.danId &&
                (aktivnost.pocetak >= akt.pocetak && aktivnost.kraj <= akt.kraj
                    || aktivnost.pocetak < akt.pocetak && aktivnost.kraj > akt.pocetak
                    || aktivnost.pocetak < akt.kraj && aktivnost.kraj > akt.kraj))
                return false
        }
        return true
    } else
        return false
}

const parseSubjectsFile = (data) => {
    let newDataArray = String(data)
        .split(/[\n\r]+/g)
        .filter(s => s !== "")
    let json = []
    newDataArray.forEach(predmet => {
        let jsonObject = {}
        jsonObject.naziv = predmet
        json.push(jsonObject)
    })
    return json
}

const parseActivitiesFile = (data, naziv = null) => {
    let newDataArray = String(data)
        .split(/[\n\r]+/g)
        .filter(s => s !== "")
    let json = []
    newDataArray.forEach(aktivnost => {
        let newActivity = aktivnost.split(",")
        let jsonObject = {}

        jsonObject.naziv = newActivity[0]
        jsonObject.tip = newActivity[1]
        jsonObject.pocetak = Number(newActivity[2])
        jsonObject.kraj = Number(newActivity[3])
        jsonObject.dan = newActivity[4]

        if (naziv === null || jsonObject.naziv === naziv.toUpperCase())
            json.push(jsonObject)
    })
    return json
}

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// --------------------------------------------
// -----------> REST V1
// --------------------------------------------

app.get("/v1/predmeti", (req, res) => {
    fs.readFile(FILE_PREDMETI, (err, data) => {
        if (err) throw err
        res.json(parseSubjectsFile(data))
    })
})

app.get("/v1/aktivnosti", (req, res) => {
    fs.readFile(FILE_AKTIVNOSTI, (err, data) => {
        if (err) throw err
        res.json(parseActivitiesFile(data))
    })
})

app.get("/v1/predmet/:naziv/aktivnost", (req, res) => {
    fs.readFile(FILE_AKTIVNOSTI, (err, data) => {
        if (err) throw err
        res.json(parseActivitiesFile(data, req.params.naziv))
    })
})

app.post("/v1/predmet", (req, res) => {
    const predmet = req.body.naziv

    fs.readFile(FILE_PREDMETI, (errR, data) => {
        if (errR) throw errR

        const newData = String(data).split(/[\s]+/g)
        if (newData.includes(predmet.toUpperCase()))
            res.json({message: "Naziv predmeta postoji!"})
        else {
            fs.appendFile(FILE_PREDMETI, predmet.toUpperCase() + "\n", (errW) => {
                if (errW) throw errW
                res.json({message: "Uspješno dodan predmet!"})
            });
        }
    })
})


app.post("/v1/aktivnost", (req, res) => {
    const aktivnost = req.body
    aktivnost.pocetak = Number(aktivnost.pocetak)
    aktivnost.kraj = Number(aktivnost.kraj)
    if (!isActivityValid(aktivnost)) {
        res.status(400)
        res.json({message: "Aktivnost nije validna!"})
    } else {
        const novaAktivnost = aktivnost["naziv"] + ","
            + aktivnost["tip"] + ","
            + aktivnost["pocetak"] + ","
            + aktivnost["kraj"] + ","
            + aktivnost["dan"] + "\n"
        fs.appendFile(FILE_AKTIVNOSTI, novaAktivnost.toUpperCase(), (err) => {
            if (err) throw err
            res.json({message: "Uspješno dodana aktivnost!"})
        });
    }
})

app.delete("/v1/aktivnost/:naziv", (req, res) => {
    const naziv = req.params.naziv.toUpperCase()

    fs.readFile(FILE_AKTIVNOSTI, (errR, data) => {
        if (errR) {
            res.json({message: "Greška - aktivnost nije obrisana!"})
            throw errR
        }

        let newDataArray = String(data).split(/[,\s]+/g)
        let isFound = false

        for (let i = 0; i < newDataArray.length; i += 5)
            if (newDataArray[i] === naziv) {
                isFound = true
                newDataArray.splice(i, 5)
                i -= 5
            }
        if (!isFound)
            res.json({message: "Greška - aktivnost nije obrisana!"})

        else {
            let newData = ""
            for (let i = 0; i < newDataArray.length; i += 5)
                newData += newDataArray.slice(i, i + 5).join(",") + "\n"

            fs.writeFile(FILE_AKTIVNOSTI, newData, errW => {
                if (errW) throw errW
                res.json({message: "Uspješno obrisana aktivnost!"})
            })
        }
    })
})

app.delete("/v1/predmet/:naziv", (req, res) => {
    const naziv = req.params.naziv.toUpperCase()

    fs.readFile(FILE_PREDMETI, (errR, data) => {
        if (errR) {
            res.json({message: "Greška - predmet nije obrisan!"})
            throw errR
        }

        let newDataArray = String(data).split(/[\s]+/g)
        let isFound = false

        const index = newDataArray.indexOf(naziv);
        if (index > -1) {
            isFound = true
            newDataArray.splice(index, 1);
        }
        if (!isFound)
            res.json({message: "Greška - predmet nije obrisan!"})

        else {
            let newData = newDataArray.join("\n")
            fs.writeFile(FILE_PREDMETI, newData, errW => {
                if (errW) {
                    res.json({message: "Greška - predmet nije obrisan!"})
                    throw errW
                }
                res.json({message: "Uspješno obrisan predmet!"})
            })
        }
    })
})

app.delete("/v1/all", (req, res) => {
    fs.writeFile(FILE_PREDMETI, "", err => {
        if (err) {
            res.json({message: "Greška - sadržaj datoteka nije moguće obrisati!"})
            throw err
        }

        fs.writeFile(FILE_AKTIVNOSTI, "", err => {
            if (err) {
                res.json({message: "Greška - sadržaj datoteka nije moguće obrisati!"})
                throw err
            } else {
                res.json({message: "Uspješno obrisan sadržaj datoteka!"})
            }
        })

    })
})

// --------------------------------------------
// -----------> REST V2
// --------------------------------------------

//
// -----------> /PREDMET
//
app.get("/v2/predmet/:id", (req, res) => {
    DB.Predmet.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(predmet =>
            res.json(predmet != null ? predmet : {message: "Ne postoji predmet sa ID " + req.params.id + "!"})
        )
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja predmeta!"})
        )
})
app.get("/v2/predmet", (req, res) => {
    DB.Predmet.findAll()
        .then(predmeti => res.json(predmeti))
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja predmeta!"})
        )
})
app.post("/v2/predmet", (req, res) => {
    DB.Predmet.findOrCreate({
        where: { naziv: req.body.naziv.toUpperCase() },
        defaults: {
            naziv: req.body.naziv.toUpperCase()
        }
    })
        .then(([predmet, isCreated]) => {
            if(isCreated)
                res.json({
                    message: "Uspješno dodan predmet!",
                    predmet: predmet
                })
            else {
                res.status(409)
                res.json({
                    message: "Predmet već postoji!",
                    predmet: predmet
                })
            }
        })
        .catch(() =>
            res.json({message: "Predmet nije uspješno dodan!"})
        )
})
app.put("/v2/predmet/:id", (req, res) => {
    DB.Predmet.update(
        req.body,
        {
            where: {
                id: Number(req.params.id)
            }
        })
        .then(() =>
            res.json({
                message: "Uspješno modifikovan predmet!",
                modifikovaniPredmet: req.body
            }))
        .catch(() =>
            res.json({message: "Predmet nije uspješno modifikovan!"})
        )
})
app.delete("/v2/predmet/:id", (req, res) => {
    DB.Predmet.destroy({
        where: {
            id: Number(req.params.id)
        }
    })
        .then(() => {
            res.json({message: "Uspješno obrisan predmet!"})
        })
        .catch(() =>
            res.json({message: "Predmet nije uspješno obrisan!"})
        )
})

//
// -----------> /GRUPA
//
app.get("/v2/grupa/:id", (req, res) => {
    DB.Grupa.findOne({
        where: {
            id: req.params.id
        },
        include: DB.Predmet,
        attributes: ['id', 'naziv']
    })
        .then(grupa =>
            res.json(grupa != null ? grupa : {message: "Ne postoji grupa sa ID " + req.params.id + "!"})
        )
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja grupe!"})
        )
})
app.get("/v2/grupa", (req, res) => {
    DB.Grupa.findAll({
        include: DB.Predmet,
        attributes: ['id', 'naziv']
    })
        .then(grupe => res.json(grupe))
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja grupa!"})
        )
})
app.post("/v2/grupa", (req, res) => {
    DB.Grupa.create(req.body)
        .then(() =>
            res.json({
                message: "Uspješno dodana grupa!",
                novaGrupa: req.body
            }))
        .catch(() =>
            res.json({message: "Grupa nije uspješno dodana!"})
        )
})
app.put("/v2/grupa/:id", (req, res) => {
    DB.Grupa.update(
        req.body,
        {
            where: {
                id: Number(req.params.id)
            }
        })
        .then(() =>
            res.json({
                message: "Uspješno modifikovana grupa!",
                modifikovanaGrupa: req.body
            }))
        .catch(() =>
            res.json({message: "Grupa nije uspješno modifikovana!"})
        )
})
app.delete("/v2/grupa/:id", (req, res) => {
    DB.Grupa.destroy({
        where: {
            id: Number(req.params.id)
        }
    })
        .then(() =>
            res.json({message: "Uspješno obrisana grupa!"})
        )
        .catch(() =>
            res.json({message: "Grupa nije uspješno obrisana!"})
        )
})

app.get("/v2/aktivnost/:id", (req, res) => {
    DB.Aktivnost.findOne({
        where: {
            id: req.params.id
        },
        include: [
            {model: DB.Dan},
            {model: DB.Grupa},
            {model: DB.Tip},
            {model: DB.Predmet}
        ],
        attributes: ['id', 'naziv', 'pocetak', 'kraj']
    })
        .then(aktivnost =>
            res.json(aktivnost != null ? aktivnost : {message: "Ne postoji aktivnost sa ID " + req.params.id + "!"})
        )
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja aktivnosti!"})
        )
})
app.get("/v2/aktivnost", (req, res) => {
    DB.Aktivnost.findAll({
        include: [
            {model: DB.Dan},
            {model: DB.Grupa},
            {model: DB.Tip},
            {model: DB.Predmet}
        ],
        attributes: ['id', 'naziv', 'pocetak', 'kraj']
    })
        .then(aktivnosti => res.json(aktivnosti))
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja aktivnosti!"})
        )
})
app.post("/v2/aktivnost", (req, res) => {
    DB.Aktivnost.findAll()
        .then(aktivnosti => {
            if(isActivityValidv2(req.body, aktivnosti)) {
                DB.Aktivnost.create(req.body)
                    .then(() =>
                        res.json({
                            message: "Uspješno dodana aktivnost!",
                            novaAktivnost: req.body
                        }))
                    .catch(() =>
                        res.json({message: "Aktivnost nije uspješno dodana!"})
                    )
            }
            else{
                res.status(400)
                res.json({message: "Aktivnost nije validna!"})
            }
        })
})
app.put("/v2/aktivnost/:id", (req, res) => {
    DB.Aktivnost.update(
        req.body,
        {
            where: {
                id: Number(req.params.id)
            }
        })
        .then(() =>
            res.json({
                message: "Uspješno modifikovana aktivnost!",
                modifikovanaAktivnost: req.body
            }))
        .catch(() =>
            res.json({message: "Aktivnost nije uspješno modifikovana!"})
        )
})
app.delete("/v2/aktivnost/:id", (req, res) => {
    const where = req.params.id === "all" ? {where : {}} : {where: {id: Number(req.params.id)}}
    DB.Aktivnost.destroy(where)
        .then(() => {
            res.json({message: "Uspješno obrisana aktivnost!"})
        })
        .catch(() =>
            res.json({message: "Aktivnost nije uspješno obrisana!"})
        )
})

//
// -----------> /DAN
//

app.get("/v2/dan/:id", (req, res) => {
    DB.Dan.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(dan =>
            res.json(dan != null ? dan : {message: "Ne postoji dan sa ID " + req.params.id + "!"})
        )
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja dana!"})
        )
})
app.get("/v2/dan", (req, res) => {
    DB.Dan.findAll()
        .then(dani => res.json(dani))
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja dana!"})
        )
})
app.post("/v2/dan", (req, res) => {
    DB.Dan.findOrCreate({
        where: { naziv: req.body.naziv.toUpperCase() },
        defaults: {
            naziv: req.body.naziv.toUpperCase()
        }
    })
        .then(([dan, isCreated]) => {
            if(isCreated)
                res.json({
                    message: "Uspješno dodan dan!",
                    dan: dan
                })
            else {
                res.status(409)
                res.json({
                    message: "Dan već postoji!",
                    dan: dan
                })
            }
        })
        .catch(() =>
            res.json({message: "Dan nije uspješno dodan!"})
        )
})
app.put("/v2/dan/:id", (req, res) => {
    DB.Dan.update(
        req.body,
        {
            where: {
                id: Number(req.params.id)
            }
        })
        .then(() =>
            res.json({
                message: "Uspješno modifikovan dan!",
                modifikovaniDan: req.body
            }))
        .catch(() =>
            res.json({message: "Dan nije uspješno modifikovan!"})
        )
})
app.delete("/v2/dan/:id", (req, res) => {
    DB.Dan.destroy({
        where: {
            id: Number(req.params.id)
        }
    })
        .then(() => {
            res.json({message: "Uspješno obrisan dan!"})
        })
        .catch(() =>
            res.json({message: "Dan nije uspješno obrisan!"})
        )
})

//
// -----------> /TIP
//

app.get("/v2/tip/:id", (req, res) => {
    DB.Tip.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(tip =>
            res.json(tip != null ? tip : {message: "Ne postoji tip sa ID " + req.params.id + "!"})
        )
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja tipa!"})
        )
})
app.get("/v2/tip", (req, res) => {
    DB.Tip.findAll()
        .then(tipovi => res.json(tipovi))
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja tipova!"})
        )
})
app.post("/v2/tip", (req, res) => {
    DB.Tip.findOrCreate({
        where: { naziv: req.body.naziv.toUpperCase() },
        defaults: {
            naziv: req.body.naziv.toUpperCase()
        }
    })
        .then(([tip, isCreated]) => {
            if(isCreated)
                res.json({
                    message: "Uspješno dodan tip!",
                    tip: tip
                })
            else {
                res.status(409)
                res.json({
                    message: "Tip već postoji!",
                    tip: tip
                })
            }
        })
        .catch(() =>
            res.json({message: "Tip nije uspješno dodan!"})
        )
})
app.put("/v2/tip/:id", (req, res) => {
    DB.Tip.update(
        req.body,
        {
            where: {
                id: Number(req.params.id)
            }
        })
        .then(() =>
            res.json({
                message: "Uspješno modifikovan tip!",
                modifikovaniTip: req.body
            }))
        .catch(() =>
            res.json({message: "Tip nije uspješno modifikovan!"})
        )
})
app.delete("/v2/tip/:id", (req, res) => {
    DB.Tip.destroy({
        where: {
            id: Number(req.params.id)
        }
    })
        .then(() => {
            res.json({message: "Uspješno obrisan tip!"})
        })
        .catch(() =>
            res.json({message: "Tip nije uspješno obrisan!"})
        )
})

//
// -----------> /STUDENT
//

app.get("/v2/student/:id", (req, res) => {
    DB.Student.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(student =>
            res.json(student != null ? student : {message: "Ne postoji student sa ID " + req.params.id + "!"})
        )
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja studenta!"})
        )
})
app.get("/v2/student", (req, res) => {
    DB.Student.findAll()
        .then(studenti => res.json(studenti))
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja studenata!"})
        )
})
app.post("/v2/student", async (req, res) => {
    if(Array.isArray(req.body)){
        const noviStudenti = req.body
        let jsonMessage = ""
        for(const noviStudent of noviStudenti) {
            let student = await DB.Student.findOne( { where: {index: noviStudent.index} } )
            if(student){
                if(student.ime === noviStudent.ime){
                    student.getGrupe()
                        .then(result => result.map(g => g.dataValues))
                        .then(grupe => {
                            grupe.forEach(grupa => {
                                if(grupa.predmetId === noviStudent.predmetId)
                                    student.removeGrupe([grupa.id])
                            })
                            student.addGrupe([noviStudent.grupaId])
                        })
                }
                else
                    jsonMessage += "Student " + noviStudent.ime + " nije kreiran jer postoji student " + student.ime + " sa istim indexom " + noviStudent.index + "\n"
            }
            else
                DB.Student.create(noviStudent)
                    .then(s => s.setGrupe([noviStudent.grupaId]))
        }
        res.json({message: jsonMessage})
    }
    else
    {
        DB.Student.findOrCreate({
            where: { index: req.body.index },
            defaults: req.body
        })
            .then(([student, isCreated]) => {
                if(isCreated)
                    res.json({
                        message: "Uspješno dodan student!",
                        student: student
                    })
                else {
                    res.status(409)
                    res.json({
                        message: "Student sa indexom " + student.index + " već postoji!",
                        student: student
                    })
                }
            })
            .catch(() =>
                res.json({message: "Student nije uspješno dodan!"})
            )
    }
})
app.put("/v2/student/:id", (req, res) => {
    DB.Student.findOne({
        where: {
            index: req.body.index
        }
    })
        .then(student => {
            if(student)
                res.json({
                    message: "Student sa indexom " + student.index + " vec postoji!",
                    student: student
                })
            else{
                DB.Student.update(
                    req.body,
                    {
                        where: {
                            id: Number(req.params.id)
                        }
                    })
                    .then(() =>
                        res.json({
                            message: "Uspješno modifikovan student!",
                            modifikovaniStudent: req.body
                        }))
                    .catch(() =>
                        res.json({message: "Student nije uspješno modifikovan!"})
                    )
            }
        })
        .catch(() =>
            res.json({message: "Greška prilikom dohvaćanja studenta!"})
        )
})
app.delete("/v2/student/:id", (req, res) => {
    DB.Student.destroy({
        where: {
            id: Number(req.params.id)
        }
    })
        .then(() => {
            res.json({message: "Uspješno obrisan student!"})
        })
        .catch(() =>
            res.json({message: "Student nije uspješno obrisan!"})
        )
})

app.listen(3000)
module.exports = app