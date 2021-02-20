var Raspored = (function () {
    function iscrtajRaspored(div, dani, satPocetak, satKraj) {
        if(div == null)
            return -1;
        else if (dani.length === 0 ||
            satPocetak !== parseInt(satPocetak, 10) ||
            satPocetak < 0 ||
            satKraj !== parseInt(satKraj, 10) ||
            satKraj > 24 ||
            satPocetak >= satKraj) {
            div.innerHTML = "Greška";
            return -1;
        }

        let tabela =
            "<table class=\"tg\">" +
            "<tbody>" +
            "<tr class=\"blank-row\">" +
            "<td colspan=\"7\"></td>";

        for (let i = satPocetak; i <= satKraj; i += 1) {
            if (i === satKraj) {
                tabela +=
                    "<td></td>";
            } else if (i === satPocetak || i % 2 === 0 && i <= 12 ||
                i % 2 !== 0 && i >= 15) {
                tabela +=
                    "<td colspan=\"2\">" + ('0' + i).slice(-2) + ":00</td>";
            } else {
                tabela +=
                    "<td colspan=\"2\"></td>";
            }
        }
        tabela += "</tr>";

        for (let i = 0; i < dani.length; i++) {
            tabela +=
                "<tr>" +
                "<td class=\"align-right\"";
            if (i === 0)
                tabela += "id=\"prvi-dan\"";
            tabela +=
                "colspan=\"8\">" + dani[i] + "</td>";
            for (let j = 0; j < (satKraj - satPocetak) * 2; j++)
                tabela +=
                    "<td></td>";
        }
        tabela += "</tr>";

        tabela +=
            "</tbody>" +
            "</table>";

        div.innerHTML = tabela;
        return 1;
    }

    function dodajAktivnost(raspored, naziv, tip, vrijemePocetak, vrijemeKraj, dan) {
        if (raspored == null) {
            alert("Greška - raspored nije kreiran");
            return -1;
        }
        let redovi = raspored.firstChild.rows;

        let satPocetkaRasporeda = parseInt(redovi[0].cells[1].innerHTML.substr(0, 2));
        let satKrajaRasporeda = parseInt(satPocetkaRasporeda + redovi[0].cells.length) - 2;

        if (!(vrijemePocetak >= satPocetkaRasporeda &&
                vrijemeKraj <= satKrajaRasporeda &&
                vrijemeKraj > vrijemePocetak &&
                vrijemePocetak >= 0 &&
                vrijemeKraj <= 24
            ) || (vrijemePocetak != parseInt(vrijemePocetak) && vrijemePocetak - parseInt(vrijemePocetak) !== 0.5)
            || (vrijemeKraj != parseInt(vrijemeKraj) && vrijemeKraj - parseInt(vrijemeKraj) !== 0.5)) {
            alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
            return -1;
        }

        let opis = naziv +
            "<br>" +
            "<span class=\"tip-nastave\">" + tip + "</span>";

        for (let i = 0; i < redovi.length; i++) {
            if (redovi[i].cells[0].innerHTML.toUpperCase() === dan.toUpperCase()) {
                let trajanje = vrijemeKraj - vrijemePocetak;
                trajanje = parseInt(trajanje) * 2 + Math.ceil(trajanje - parseInt(trajanje));

                let indexPocetka = 1 + (parseInt(vrijemePocetak) - satPocetkaRasporeda) * 2;
                if (parseInt(vrijemePocetak) != vrijemePocetak)
                    indexPocetka++;

                if (provjeriPoklapanje(redovi[i], indexPocetka, trajanje)) {
                    alert("Greška - već postoji termin u rasporedu u zadanom vremenu");
                    return -1;
                }

                // kako smo bordure popravljali dodavajuci nevidljive kolone
                // u slucaju parnog colspana index pocetka casa ce se mijenjati:
                for (let j = 1; j <= indexPocetka; j++) {
                    if (redovi[i].cells[j].style.display === "none")
                        indexPocetka++;
                    else if (redovi[i].cells[j].colSpan > 1)
                        indexPocetka -= redovi[i].cells[j].colSpan - 1;
                }

                redovi[i].cells[indexPocetka].colSpan = trajanje;
                redovi[i].cells[indexPocetka].innerHTML = opis;
                redovi[i].cells[indexPocetka].classList.add("blue-special");

                for (let j = 1; j < trajanje; j++)
                    redovi[i].cells[indexPocetka + 1].remove();

                // popravak bordura dodavajuci nevidljive kolone jer smo implementirali
                // ubacivanje bordura pomocu nth-child principa u cssu
                if (trajanje % 2 === 0) {
                    if(vrijemePocetak === parseInt(vrijemePocetak))
                        redovi[i].cells[indexPocetka].style.borderStyle = "solid";
                    else
                        redovi[i].cells[indexPocetka].style.borderStyle = "dashed";

                    if(indexPocetka === 1){
                        if(redovi[i].cells.length !== 2) // samo za slucaj da jedna aktivnost popunjava cijeli dan
                            redovi[i].insertCell(indexPocetka+1).style.display = "none";
                        redovi[i].cells[indexPocetka].style.borderRightStyle = "solid";
                    }
                    else
                        redovi[i].insertCell(indexPocetka).style.display = "none";
                }

                break;
            } else if (i === redovi.length - 1) {
                alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
                return -1;
            }

        }

    }

    function provjeriPoklapanje(red, indexPocetka, trajanje) {
        let uslov = indexPocetka + trajanje;
        for (let i = 1; i < uslov; i++) {
            if(red.cells[i].style.display === "none") {
                uslov++;
                indexPocetka++;
            }
            else if(red.cells[i].colSpan !== 1) {
                uslov -= red.cells[i].colSpan - 1
                indexPocetka -= red.cells[i].colSpan - 1;
                if(i >= indexPocetka)
                    return true;
            }
        }
        return false;
    }

    return {
        iscrtajRaspored : iscrtajRaspored,
        dodajAktivnost : dodajAktivnost
    }
}());
