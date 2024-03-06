point_list = document.getElementById("point_list");
robot_slider = document.getElementById("robot_slider");
skills_check = document.getElementById("skills_check");

lengthInput = document.getElementById("lengthInput");
widthInput = document.getElementById("widthInput");
speedInput = document.getElementById("speedInput");

snapInput = document.getElementById("snapInput");

playButton = document.getElementById("playButton");

newPointButton = document.getElementById("newButton");
clearButton = document.getElementById("clearButton");

copyCodeButton = document.getElementById("copyCodeButton");
exportCodeButton = document.getElementById("exportCodeButton");
exportJSONButton = document.getElementById("exportJSONButton");
importJSONButton = document.getElementById("importJSONButton");

function changeData(){
    updatePoints();
    drawCanvas();
    updatePointsList();
}

skills_check.onchange = function(){
    skills = this.checked;
    drawCanvas();
}

lengthInput.onchange = function(event){
    robot.length = parseFloat(this.value);
    drawCanvas();
}
widthInput.onchange = function(event){
    robot.width = parseFloat(this.value);
    drawCanvas();
}
speedInput.onchange = function(event){
    robot.speed = parseFloat(this.value);
}

robot_slider.oninput = function(event){
    path.progress = path.length*(this.value/robot_slider.max);
    updateRobotPosition();
    drawCanvas();
}

playButton.onclick = function (){
    if(play){
        play = false;
        playButton.value = "Play";
    }else{
        if(path.progress >= path.length){
            path.progress = 0;
        }
        play = true;
        playButton.value = "Stop";
    }
}

newPointButton.onclick = newPoint;
clearButton.onclick = clearAllPoints;

copyCodeButton.onclick = copyCode;
exportCodeButton.onclick = exportCode;
exportJSONButton.onclick = exportJSON;
importJSONButton.onclick = importJSON;

function updateInputFields(){
    snapInput.value = snapTo;
    skills_check.checked = skills;
    widthInput.value = robot.width;
    lengthInput.value = robot.length;
    speedInput.value = robot.speed;
}

function updateX(value, id, name){
    path.points[id].x = parseFloat(value);
    changeData();
    document.getElementById(name+id.toString()).focus();
}
function updateY(value, id, name){
    path.points[id].y = parseFloat(value);
    changeData();
    document.getElementById(name+id.toString()).focus();
}
function updateDistanceToNext(value, id, name){
    if(id < path.points.length-1){
        path.points[id+1].x = path.points[id].x + value*Math.cos(-(path.points[id].headingToNext-90)*Math.PI/180);
        path.points[id+1].y = path.points[id].y + value*Math.sin(-(path.points[id].headingToNext-90)*Math.PI/180);
        changeData();
        document.getElementById(name+id.toString()).focus();
    }
}
function updateHeadingToNext(value, id, name){
    if(id < path.points.length-1){
        path.points[id+1].x = path.points[id].x + path.points[id].distanceToNext*Math.cos(-(value-90)*Math.PI/180);
        path.points[id+1].y = path.points[id].y + path.points[id].distanceToNext*Math.sin(-(value-90)*Math.PI/180);
        changeData();
        document.getElementById(name+id.toString()).focus();
    }
}
function updateDistanceFromLast(value, id, name){
    if(id > 0){
        path.points[id].x = path.points[id-1].x + value*Math.cos(-(path.points[id-1].headingToNext-90)*Math.PI/180);
        path.points[id].y = path.points[id-1].y + value*Math.sin(-(path.points[id-1].headingToNext-90)*Math.PI/180);
        changeData();
        document.getElementById(name+id.toString()).focus();
    }
}
function updateHeadingFromLast(value, id, name){
    if(id > 0){
        path.points[id].x = path.points[id-1].x + path.points[id-1].distanceToNext*Math.cos(-(value-90)*Math.PI/180);
        path.points[id].y = path.points[id-1].y + path.points[id-1].distanceToNext*Math.sin(-(value-90)*Math.PI/180);
        changeData();
        document.getElementById(name+id.toString()).focus();
    }
}
function deleteButton(value, id){
    path.deletePoint(id);
    changeData();
}
function insertButton(value, id, name){
    path.points.splice(id+1,0,new Point(path.points[id].x,path.points[id].y,1000,false));
    changeData();
    document.getElementById(name+id.toString()).focus();
}
function reverseCheckButton(value, id, name){
    path.points[id].reversed = value;
    changeData();
    document.getElementById(name+id.toString()).focus();
}
function newPoint(){
    path.newPoint(0,0);
    changeData();
}
function clearAllPoints(){
    if(confirm("Changes you made may not be saved.")){
        path.clearAllPoints();
        changeData();
    }
}
snapInput.onchange = function(event){
    snapTo = parseFloat(this.value);
    changeData();   
}

function createInput(name, id, type, value, width, onchangeFunction){
    input = document.createElement("input");
    input.type = type;
    input.id = name+id.toString();
    input.style.width = width;
    if(type == "button"){
        input.value = value;
        input.onclick = function(){
            onchangeFunction(this.value, id, name);
        }
    }
    if(type == "checkbox"){
        input.checked = value;
        input.onchange = function(){
            onchangeFunction(this.checked, id, name);
        }
    }
    if(!(type == "checkbox" || type == "button")){
        input.value = value;
        input.onchange = function(){
            onchangeFunction(this.value, id, name);
        }
    }
    input.onmouseover = function(event){
        touchingPoint = id;
        drawCanvas();
    }
    input.onmouseleave = function(event){
        touchingPoint = null;
        drawCanvas();
    }
    return(input);
}

function updatePointsList(){
    //clear table
    numRows = point_list.rows.length-1;
    for(i=0; i<numRows; i++){
        point_list.deleteRow(1);
    }

    for(i=0; i<path.points.length; i++){
        row = point_list.insertRow(point_list.length);
        row.draggable="true";
        row.insertCell(row.length).appendChild(
            createInput("goTo", i, "button", (i+1).toString(), "50px",robotGoTo));
        row.insertCell(row.length).appendChild(
            createInput("xInput", i,"number",path.points[i].x.toFixed(2),"50px", updateX));
        row.insertCell(row.length).appendChild(
            createInput("yInput", i,"number",path.points[i].y.toFixed(2),"50px", updateY));
        if(i > 0){
            row.insertCell(row.length).appendChild(
                createInput("distanceLastInput", i,"number",path.points[i].distanceFromLast.toFixed(2),"50px", updateDistanceFromLast));
            row.insertCell(row.length).appendChild(
                createInput("headingLastInput", i,"number",path.points[i].headingFromLast.toFixed(2),"50px", updateHeadingFromLast));
            row.insertCell(row.length).appendChild(
                createInput("reverseCheck", i, "checkbox",path.points[i].reversed,"20px",reverseCheckButton));
        }else{
            row.insertCell();
            row.insertCell();
            row.insertCell();
        }
        row.insertCell(row.length).appendChild(
            createInput("insertButton", i, "button","Insert","50px",insertButton));
        row.insertCell(row.length).appendChild(
            createInput("deleteButton", i, "button","Delete","50px",deleteButton));
    }
}

canvas.onmousedown = function(event){
    x=pxToInches_X(event.offsetX);
    y=pxToInches_Y(event.offsetY);
    selectedPoint = getTouching(x,y);
    if(event.button == 0){
        mouseDown = true;
        if(selectedPoint == null){
            path.newPoint(snap(x),snap(y));
            touchingPoint = path.points.length-1;
            selectedPoint = path.points.length-1;
            changeData();
        }
    }
    //right click
    if(event.button == 2){
        if(selectedPoint != null){
            path.deletePoint(selectedPoint);
            getTouching(x,y);
            changeData();
        }
    }
}

canvas.onmouseup = function(event){
    x=pxToInches_X(event.offsetX);
    y=pxToInches_Y(event.offsetY);
    mouseDown = false;
}

canvas.onmousemove = function(event){
    x=pxToInches_X(event.offsetX);
    y=pxToInches_Y(event.offsetY);
    if(mouseDown && selectedPoint != null){
        path.points[selectedPoint].x = snap(x);
        path.points[selectedPoint].y = snap(y);
        changeData();
    }else{
        lastTouching = touchingPoint;
        getTouching(x,y);
        if(touchingPoint != lastTouching){
            drawCanvas();
        }
    }
}

updateInputFields();