function exportJSON(){
    dict = {};
    dict["snapTo"] = snapTo;
    dict["skills"] = skills;
    dict["robot"] = robot;
    dict["path"] = path;
    content = JSON.stringify(dict);
    formattedContent = "";
    numTabs = 0;
    tabWidth = 2;
    for(i=0; i<content.length; i++){
        c = content[i];
        formattedContent += c;
        if("{[".includes(c)){
            numTabs++;
        }
        if("}]".includes(c)){
            numTabs--;
        }
        if(",{[".includes(c)){
            formattedContent += "\n"+" ".repeat(numTabs*tabWidth);
        }
    }


    link = document.createElement("a");
    file =  new Blob([formattedContent],{type: "text/plain"});
    link.href = URL.createObjectURL(file);
    link.download = "vex_path_data.json";
    link.click();
    URL.revokeObjectURL(link.href);
}

function importJSON(){
    if(confirm("Changes you made may not be saved.")){
        input = document.createElement('input');
        input.accept = ".json"
        input.type = 'file';
        input.onchange = function(){
            //load file
            file = input.files[0];
            const reader = new FileReader();
            reader.onload = function() {
                contents = reader.result;
                parsedObject = JSON.parse(contents);
                
                robot = parsedObject["robot"];
                //path.progress = 0;
                path = parsedObject["path"];
                p = parsedObject.path["points"];
                skills = parsedObject["skills"];
                snapTo = parsedObject["snapTo"];
                path.points = [];
                for(i=0; i<p.length; i++){
                    path.points.push(new Point(p[i].x,p[i].y,p[i].timeout,p[i].reversed));
                }

                updateInputFields();
                updatePoints();
                drawCanvas();
            };
            reader.readAsText(file);
        }
        input.click();
    }
}

function importActionsConfig(){
    fetch("../config/actions.json")
        .then(file => file.json())
        .then(object => uploadActions(object));
}

function uploadActions(object){
    availableActions = object["actions"];
    console.log(availableActions);
}

importActionsConfig();

function copyCode(){
    navigator.clipboard.writeText(getFormattedCodeString());
}

function exportCode(){
    exportTextFile(getFormattedCodeString(),"vexPathCode");
}

function getFormattedCodeString(){
    content = "";
    for(i=0; i<path.points.length; i++){
        p = path.points[i];
        content += `// Pos${i+1}\n`;
        if(i != 0){
            content += `chassis.turnTo(${p.x.toFixed(2)},${p.y.toFixed(2)},${p.timeout},${p.reversed});\n`;
        }
        content += `chassis.moveTo(${p.x.toFixed(2)},${p.y.toFixed(2)},${p.timeout});`;
        if(i != path.points.length-1){
            content += "\n\n";
        }
    }
    return(content);
}

function exportTextFile(content,name){
    link = document.createElement("a");
    file =  new Blob([content],{type: "text/plain"});
    link.href = URL.createObjectURL(file);
    link.download = name + ".txt";
    link.click();
    URL.revokeObjectURL(link.href);
}