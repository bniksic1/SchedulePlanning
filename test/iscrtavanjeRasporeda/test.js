let assert = chai.assert;
window.alert=function(){} // da ne izbacuje alert u toku testiranja

describe('Raspored', function() {
    describe('iscrtajRaspored()', function() {
        Raspored.iscrtajRaspored(document.getElementById("test-iscrtaj-raspored"), ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
        let tabela = document.getElementsByTagName("table")[0];

        it('Provjera da li je tabela ispisana u proslijedjenom divu', function() {
            assert.isTrue(document.getElementById("test-iscrtaj-raspored").contains(tabela),"Tabela mora biti ispisana u prosljedjenom divu kroz parametar");
        });

        it('Provjera broja kolona rasporeda', function() {
            assert.equal(tabela.rows[1].cells.length, 27, "Broj kolona prvog reda treba biti 27");
        });

        it('Provjera broja redova rasporeda', function() {
            assert.equal(tabela.rows.length, 6,"Broj redova treba biti 6");
        });

        it('Provjera pocetnog ispisanog sata', function() {
            assert.equal(tabela.rows[0].cells[1].innerText, "08:00","Pocetni ispisani sat treba biti 08:00");
        });

        it('Provjera posljednje ispisanog sata', function() {
            let posljednji = "";
            for(let i = 0; i < tabela.rows[0].cells.length; i++)
                if(tabela.rows[0].cells[i].innerHTML !== "") posljednji = tabela.rows[0].cells[i].innerHTML;
            assert.equal(posljednji, "19:00", "Krajnji ispisani sat treba biti 19:00");
        });

        it('Provjera ispisanog niza dana na rasporedu', function() {
            let niz = [];
            for(let i = 1; i < tabela.rows.length; i++)
                niz.push(tabela.rows[i].cells[0].innerText);
            assert.equal(niz.toString(), ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"].toString(),"Niz ispisanih dana mora biti isti kao proslijeđeni parametar dani");
        });

        it('Provjera ispisanih sati na vrhu rasporeda', function() {
            let niz = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '15:00', '17:00', '19:00', '21:00', '23:00'];
            for(let i = 2; i < tabela.rows[0].cells.length; i++) {
                if(tabela.rows[0].cells[i].innerText !== "")
                    assert.isTrue(niz.includes(tabela.rows[0].cells[i].innerText),
                            "Niz ispisanih sati mora zadovoljavati ogranicenja navedena u postavci zadatka");
            }
        });

        // Testiranje grešaka:

        it('Provjera pogrešno unesenih parametara pocetka i kraja', function (){
            assert.equal(Raspored.iscrtajRaspored(document.getElementById("test-greska-iscrtaj-raspored"), ["1","2","3","4","5"], 17, 8),
                                                        -1,
                                                        "Treba ispisati greška ukoliko je sat početka veći od krajnjeg sata");
        });

        it('Provjera nenulte reference na div tabele', function (){
            assert.equal(Raspored.iscrtajRaspored(null, ["1"], 1, 2),
                                                        -1,
                                                        "Prvi parametar ne moze biti null");
        });

        it('Provjera unesenog praznog niza dani', function (){
            assert.equal(Raspored.iscrtajRaspored(document.getElementById("test-greska-iscrtaj-raspored"), [], 1, 2),
                                                    -1,
                                                    "Niz dana za rapored ne moze biti prazan");
        });

        it('Provjera negativno unesenog vremena pocetka', function (){
            assert.equal(Raspored.iscrtajRaspored(document.getElementById("test-greska-iscrtaj-raspored"), [], -8, 23),
                -1,
                "Pocetni sad ne moze biti negativan");
        });
    });


    describe('dodajAktivnost()', function() {
        Raspored.iscrtajRaspored(document.getElementById("test-dodaj-aktivnost"), ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
        let div = document.getElementById("test-dodaj-aktivnost");

        let tabela = document.getElementById("test-dodaj-aktivnost").getElementsByTagName("table")[0];

        Raspored.iscrtajRaspored(document.getElementById("test-greska-dodaj-aktivnost"), ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
        let divGreska = document.getElementById("test-greska-dodaj-aktivnost");

        it('Provjera dodavanja aktivnosti tačno na početak', function (){
            Raspored.dodajAktivnost(div, "1.", "aktivnost", 8, 12,"ponedjeljak");
            assert.equal(tabela.rows[1].cells[1].innerText, "1.\naktivnost");
        });


        it('Provjera početka i kraja aktivnosti koje su jedna iza druge', function (){
            Raspored.dodajAktivnost(div, "2.", "aktivnost", 12, 15,"ponedjeljak");
            assert.equal(tabela.rows[1].cells[4].innerText, "2.\naktivnost", "Greska izmedju 1. i 2. aktivnosti");
        });

        it('Provjera aktivnosti preko cijelog rasporeda', function (){
            Raspored.dodajAktivnost(div, "3.", "aktivnost", 8, 21,"utorak");
            assert.equal(tabela.rows[2].cells.length, 2, "Raspored za utorak bi trebao sadrzavati samo 2 celije");
        });

        it('Provjera dodavanja aktivnosti tačno na kraj', function (){
            Raspored.dodajAktivnost(div, "4.", "aktivnost", 18.5, 21,"srijeda");
            assert.equal(tabela.rows[3].lastChild, tabela.rows[3].cells[22], "Zadnji child ovog reda bi trebala biti dodana aktivnost");
        });

        // Testiranje grešaka:

        it('Provjera null parametra', function (){
            assert.equal(Raspored.dodajAktivnost(null, "WT", "predavanje", 9, 12,"ponedjeljak"),
                         -1,
                         "Prosljedjeni prvi paramater ne moze biti null referenca.");

        });

        it('Provjera neispravno unesenih parametara za vrijeme', function (){
            assert.equal(Raspored.dodajAktivnost(divGreska, "WT", "predavanje", 13, 12,"ponedjeljak"),
                -1,
                "Vrijeme kraja aktivnosti mora biti vece od pocetnog vremena");
        });

        it('Provjera decimale vremena ukoliko nije cijeli sat', function (){
            assert.equal(Raspored.dodajAktivnost(divGreska, "WT", "predavanje", 11.6, 12,"ponedjeljak"),
                -1,
                "Ukoliko nije cijeli sat, prva decimala moze biti samo 5");
        });

        it('Provjera vremena aktivnosti pocetka i kraja sa pocetkom i krajem rasporeda', function (){
            assert.equal(Raspored.dodajAktivnost(divGreska, "WT", "predavanje", 7.5, 12,"ponedjeljak"),
                -1,
                "Vrijeme pocetka aktivnosti mora biti vece od vremena pocetka rasporeda");
            assert.equal(Raspored.dodajAktivnost(divGreska, "WT", "predavanje", 7, 21.5,"ponedjeljak"),
                -1,
                "Vrijeme kraja aktivnosti mora biti manje od vremena kraja rasporeda");
        });

        it('Provjera pogresno unesenog dana', function () {
            assert.equal(Raspored.dodajAktivnost(divGreska, "WT", "predavanje", 10, 17.5,"utosrijeda"),
                -1,
                "Uneseni parametar koji predstavlja dan mora biti u nizu dana rasporeda (no case sensitive)");
        });

        it('Provjera poklapanja aktivnosti unutar rasporeda', function (){
            Raspored.dodajAktivnost(divGreska, "test1", "testni", 11, 14, "ponedjeljak");
            assert.equal(Raspored.dodajAktivnost(divGreska, "test2", "testni", 13.5, 15,"ponedjeljak"),
                -1,
                "Aktivnosti unutar rasporeda se ne mogu preklapati");
            assert.equal(Raspored.dodajAktivnost(divGreska, "test2", "testni", 8, 11.5,"ponedjeljak"),
                -1,
                "Aktivnosti unutar rasporeda se ne mogu preklapati");
        });

    });
});

