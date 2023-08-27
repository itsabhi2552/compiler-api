var langId = 7;
var lineCount = 0;

var btn = document.getElementById("btn");
var line = document.getElementById("line");
var lang = document.getElementById("lang");
var input = document.getElementById("input");
var output = document.getElementById("output");

var url_result = "https://codequotient.com/api/codeResult/";
var url_execute = "https://codequotient.com/api/executeCode";

lang.addEventListener("change", function() {
    langId = document.getElementById("lang").value;
});

input.addEventListener("scroll", function() {
    line.scrollTop = input.scrollTop;
});

input.addEventListener("keydown", function(event) {
    if(event.key === "Tab") {
        event.preventDefault();
        input.value += "\t";
    }
});

input.addEventListener("input", function() {
    var arr = [];
    var inputLineCount = input.value.split("\n").length;

    if(lineCount !== inputLineCount) {
        for(var i = 0; i < inputLineCount; i++) {
            arr[i] = i + 1;
        }
        line.value = arr.join("\n");
    }
    lineCount = inputLineCount;
});

btn.addEventListener("click", function() {
    output.innerText = "compiling...";

    var data = {
        "code": input.value,
        "langId": langId
    };

    postRequest(data);
});

function postRequest(data) {
    var request = new XMLHttpRequest();
    request.open("POST", url_execute);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(data));

    request.addEventListener("load", function() {
        var response = JSON.parse(request.responseText);
        if(response.error != "Code is null") {
            var codeId = response.codeId;
            getRequest(codeId);
        }
    });
}

function getRequest(codeId) {
    var timeout_id;
    var request = new XMLHttpRequest();
    request.open("GET", url_result + codeId);
    request.send();

    request.addEventListener("load", function() {
        var response = JSON.parse(request.responseText);
        var data = JSON.parse(response.data);
        if(data.status === "Pending") {
            timeout_id = setTimeout(function() {
                getRequest(codeId);
            }, 1000);
        } else {
            clearTimeout(timeout_id);
            if(data.errors === "") {
                output.innerText = data.output.slice(1, data.output.length - 1);
            } else {
                output.innerText = data.errors;
            }
        }
    });
}