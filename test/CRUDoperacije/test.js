//
//
// TESTOVI SU REALIZIRANI POMOCU MOCHA i CHAI PACKAGE-A
// OVAJ NAM PAKET OMOGUCUJE LAHKU SINHRONIZACIJU TESTA SA SERVEROM
//
// -----------------------------------------------------------------
// ----> TODO: ZA POKRETANJE TESTOVA UKUCAJTE U KONZOLU: mocha test
// -----------------------------------------------------------------
//
//
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../src/server.js')
const should = chai.should()
const fs = require('fs')
const FILE_TEST = "testniPodaci.txt"

chai.use(chaiHttp)

const parseCSVfileToObjectArray = (data) => {
    let objectArray = []
    data = data
        .replace(/\\/gi, "")
        .split(/[\n\r]+/g)

    data
        .slice(1, data.length)
        .forEach(red => {
            let object = {}
            let newDataArray = red.split(",")

            object.operacija = newDataArray[0]
            object.ruta = "/v1" + newDataArray[1]

            if(red.startsWith("GET,/aktivnosti")
                || red.startsWith("POST,/aktivnost")
                || red.startsWith("GET,/predmet/")){

                let aktivnost = ""

                if(newDataArray[0] === "GET"){
                    for(let i = 3; i < newDataArray.length; i++){
                        aktivnost += newDataArray[i]
                        if(i !== newDataArray.length - 1)
                            aktivnost += ","
                    }
                    object.ulaz = JSON.parse(newDataArray[2])
                    object.izlaz = JSON.parse(aktivnost)
                }
                else {
                    for (let i = 2; i < newDataArray.length - 1; i++) {
                        aktivnost += newDataArray[i]
                        if(i !== newDataArray.length - 2)
                            aktivnost += ","
                    }
                    object.ulaz = JSON.parse(aktivnost)
                    object.izlaz = JSON.parse(newDataArray[newDataArray.length - 1])
                }
            }
            else{
                object.ulaz = JSON.parse(newDataArray[2])
                object.izlaz = JSON.parse(newDataArray[3])
            }
            objectArray.push(object)
        })
    return objectArray
}

const tests = parseCSVfileToObjectArray(
    fs.readFileSync(FILE_TEST, "utf-8")
)

describe('Testiranje REST metoda aplikacije', () => {
    for(let i = 0; i < tests.length; i++){

        let operacija = tests[i].operacija
        let ruta = tests[i].ruta
        let ulaz = tests[i].ulaz
        let izlaz = tests[i].izlaz

        console.log(ruta)

        it(operacija + " " + ruta, done => {
            if(operacija === "GET"){
                chai.request(server)
                    .get(ruta)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.a('array')
                        res.body.length.should.be.eql(izlaz.length)
                        for(let i = 0; i < izlaz.length; i++){
                            if(ruta === "/predmeti"){
                                res.body[i].should.have
                                    .property("naziv")
                                    .eql(izlaz[i].naziv.toUpperCase())
                            }
                            else{
                                res.body[i].should.have
                                    .property("naziv").eql(izlaz[i].naziv.toUpperCase())
                                res.body[i].should.have
                                    .property("tip").eql(izlaz[i].tip.toUpperCase())
                                res.body[i].should.have
                                    .property("pocetak").eql(izlaz[i].pocetak)
                                res.body[i].should.have
                                    .property("kraj").eql(izlaz[i].kraj)
                                res.body[i].should.have
                                    .property("dan").eql(izlaz[i].dan.toUpperCase())
                            }
                        }
                        done()
                    })
            }
            else if(operacija === "POST"){
                chai.request(server)
                    .post(ruta)
                    .send(ulaz)
                    .end((err, res) => {
                        res.body.should.be.a('object')
                        res.body.should.have
                            .property('message')
                            .eql(izlaz.message)
                        done()
                    })
            }
            else {
                chai.request(server)
                    .delete(ruta)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.a('object')
                        res.body.should.have
                            .property('message')
                            .eql(izlaz.message)
                        done()
                    })
            }
        })
    }
})