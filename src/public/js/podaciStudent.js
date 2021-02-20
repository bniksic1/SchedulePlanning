

const tableBody = document.getElementsByTagName("tbody")[0]

fetch('http://localhost:3000/v2/student')
    .then((resp) => resp.json())
    .then(studenti => {
        for(const student of studenti){
            tableBody.innerHTML +=
                "<tr>" +
                    "<th scope=\"row\">" + student.id + "</th>" +
                    "<td>" + student.ime + "</td>" +
                    "<td>" + student.index + "</td>" +
                "</tr>"
        }
    })