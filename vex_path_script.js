//distance from last or to next?
//copy output to clipboard
//robot outline
//export as c++ auton code
//export as list of points
//import list of points

var canvas = document.getElementById("canvas");
var point_list = document.getElementById("point_list");

var skills_check = document.getElementById("skills_check");
skills_check.onchange = function(){
    skills = this.checked;
    drawCanvas();
}

canvas.width = 480;
canvas.height = 480;
pixelsPerInch = 3;
pointHitBox = 10;
pointSize = 5;
snapTo = 0;
skills = false;

PX_TO_INCHES = 1/pixelsPerInch;
INCHES_TO_PX = pixelsPerInch;

class Robot{
    constructor(x,y,width,length,heading){
        this.x=x;
        this.y=y;
        this.width=width;
        this.length=length;
        this.heading=heading;
    }
}
robot = new Robot(-1000,-1000,15,18,0);

class Point{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    headingToNext = null;
    distanceToNext = null;
    headingFromLast = null;
    distanceFromLast = null;

    getPx_X() {
        return(inchesToPx_X(this.x));
    }
    getPx_Y() {
        return(inchesToPx_Y(this.y));
    }
}

points = [];

function newPoint(x,y){
    points.push(new Point(x,y));
}
function deletePoint(num){
    points.splice(num,1);
}
function clearAllPoints(){
    points = [];
}

function print(message){
    console.log(message);
}
function roundToM(num, multiple){
    return((Math.round(num/multiple)*multiple));
}

function updatePoints(){
    if(points.length > 0){
        for(i=0; i<points.length; i++){
            //distance/heading toNext
            if(i<points.length-1){
                points[i].distanceToNext = Math.sqrt((points[i+1].x-points[i].x)**2+(points[i+1].y-points[i].y)**2);
                if(points[i+1].x-points[i].x >= 0){
                    points[i].headingToNext = 90-Math.atan((points[i+1].y-points[i].y)/(points[i+1].x-points[i].x))*180/Math.PI;
                }else{
                    points[i].headingToNext = 270-Math.atan((points[i+1].y-points[i].y)/(points[i+1].x-points[i].x))*180/Math.PI;
                }
            }
            //distance/heading fromLast
            if(i > 0){
                points[i].distanceFromLast = Math.sqrt((points[i].x-points[i-1].x)**2+(points[i].y-points[i-1].y)**2);
                if(points[i].x-points[i-1].x >= 0){
                    points[i].headingFromLast = 90-Math.atan((points[i].y-points[i-1].y)/(points[i].x-points[i-1].x))*180/Math.PI;
                }else{
                    points[i].headingFromLast = 270-Math.atan((points[i].y-points[i-1].y)/(points[i].x-points[i-1].x))*180/Math.PI;
                }
            }
        }
        robot.x = points[0].x;
        robot.y = points[0].y;
        robot.heading = points[0].headingToNext;
    }
    drawCanvas();
    updatePointsList();
}

function createInput(name, id, type, value, width, onchangeFunction){
    input = document.createElement("input");
    input.type = type;
    input.id = name+id.toString();
    input.value = value;
    input.style.width = width;
    if(type == "button"){
        input.onclick = function(){
            onchangeFunction(this.value, id);
        }
    }else{
        input.onchange = function(){
            onchangeFunction(this.value, id);
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

tableSize = 0;

function updateX(value, id){
    points[id].x = parseFloat(value);
    updatePoints();
}
function updateY(value, id){
    points[id].y = parseFloat(value);
    updatePoints();
}
function updateDistanceToNext(value, id){
    if(id < points.length-1){
        points[id+1].x = points[id].x + value*Math.cos(-(points[id].headingToNext-90)*Math.PI/180);
        points[id+1].y = points[id].y + value*Math.sin(-(points[id].headingToNext-90)*Math.PI/180);
        updatePoints();
    }
}
function updateHeadingToNext(value, id){
    if(id < points.length-1){
        points[id+1].x = points[id].x + points[id].distanceToNext*Math.cos(-(value-90)*Math.PI/180);
        points[id+1].y = points[id].y + points[id].distanceToNext*Math.sin(-(value-90)*Math.PI/180);
        updatePoints();
    }
}
function updateDistanceFromLast(value, id){
    if(id > 0){
        points[id].x = points[id-1].x + value*Math.cos(-(points[id-1].headingToNext-90)*Math.PI/180);
        points[id].y = points[id-1].y + value*Math.sin(-(points[id-1].headingToNext-90)*Math.PI/180);
        updatePoints();
    }
}
function updateHeadingFromLast(value, id){
    if(id > 0){
        points[id].x = points[id-1].x + points[id-1].distanceToNext*Math.cos(-(value-90)*Math.PI/180);
        points[id].y = points[id-1].y + points[id-1].distanceToNext*Math.sin(-(value-90)*Math.PI/180);
        updatePoints();
    }
}
function deleteButton(value, id){
    deletePoint(id);
    updatePoints();
}
function insertButton(value, id){
    points.splice(id+1,0,new Point(points[id].x,points[id].y));
    updatePoints();
}
function newPointButton(){
    newPoint(0,0);
    updatePoints();
}
function clearButton(){
    if(confirm("All points will be cleared. This action cannot be undone.")){
        clearAllPoints();
        updatePoints();
    }
}
snapInput = document.getElementById("snapInput");
snapInput.onchange = function(event){
    snapTo = parseFloat(this.value);
    updatePoints();   
}

function updatePointsList(){
    //clear table
    numRows = point_list.rows.length-1;
    for(i=0; i<numRows; i++){
        point_list.deleteRow(1);
    }

    for(i=0; i<points.length; i++){
        row = point_list.insertRow(point_list.length);
        row.draggable="true";
        cell = row.insertCell(row.length);
        cell.innerHTML = i+1;
        cell.width = "25px";
        row.insertCell(row.length).appendChild(
            createInput("xInput", i,"number",points[i].x.toFixed(2),"50px", updateX));
        row.insertCell(row.length).appendChild(
            createInput("yInput", i,"number",points[i].y.toFixed(2),"50px", updateY));
        if(i > 0){
            row.insertCell(row.length).appendChild(
                createInput("distanceLastInput", i,"number",points[i].distanceFromLast.toFixed(2),"50px", updateDistanceFromLast));
            row.insertCell(row.length).appendChild(
                createInput("headingLastInput", i,"number",points[i].headingFromLast.toFixed(2),"50px", updateHeadingFromLast));
        }else{
            row.insertCell();
            row.insertCell();
        }
        if(i < points.length-1){
            row.insertCell(row.length).appendChild(
                createInput("distanceNextInput", i,"number",points[i].distanceToNext.toFixed(2),"50px", updateDistanceToNext));
            row.insertCell(row.length).appendChild(
                createInput("headingNextInput", i,"number",points[i].headingToNext.toFixed(2),"50px", updateHeadingToNext));
        }else{
            row.insertCell();
            row.insertCell();
        }
        row.insertCell(row.length).appendChild(
            createInput("insertButton", i, "button","Insert","50px",insertButton));
        row.insertCell(row.length).appendChild(
            createInput("deleteButton", i, "button","Delete","50px",deleteButton));
    }
}

function pxToInches_X(input){
    x = (input-canvas.width/2)*PX_TO_INCHES;
    return(x);
}
function pxToInches_Y(input){
    y = (-input+canvas.height/2)*PX_TO_INCHES;
    return(y);
}

function inchesToPx_X(input){
    return(input*INCHES_TO_PX+canvas.width/2);
}
function inchesToPx_Y(input){
    return(-input*INCHES_TO_PX+canvas.height/2);
}

function snap(input){
    if(snapTo != 0){
        return(Math.round(input/(snapTo))*(snapTo));
    }else{
        return(input);
    }
}

function drawCanvas(){
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.height,canvas.width);

    ctx.globalAlpha = .65;
    imageScale = 206;
    imageH = imageScale*pixelsPerInch;
    imageW = 1024*(imageScale*pixelsPerInch)/768;
    if(!skills){
        image = document.getElementById("field_image");
        ctx.drawImage(image,(canvas.width-imageW)/2,(canvas.height-imageH)/2,imageW,imageH);
    }else{
        image = document.getElementById("skills_field_image");
        ctx.drawImage(image,(canvas.width-imageW)/2-15*pixelsPerInch,(canvas.height-imageH)/2+1*pixelsPerInch,imageW,imageH);
    }
    ctx.globalAlpha = 1;

    if(points.length > 0){
        //draw robot
        ctx.beginPath();
        angle = 360+(robot.heading)-90;
        angle = -robot.heading+90;
        print(angle);
        dAngle = Math.atan(robot.width/robot.length)*(180/Math.PI)
        d = Math.sqrt((robot.width/2)**2+(robot.length/2)**2);
        ctx.moveTo(
            inchesToPx_X(robot.x+d*Math.cos((angle+dAngle)*(Math.PI/180))),
            inchesToPx_Y(robot.y+d*Math.sin((angle+dAngle)*(Math.PI/180))));
        ctx.lineTo(
            inchesToPx_X(robot.x+d*Math.cos((angle-dAngle)*(Math.PI/180))),
            inchesToPx_Y(robot.y+d*Math.sin((angle-dAngle)*(Math.PI/180))));
        ctx.lineTo(
            inchesToPx_X(robot.x+d*Math.cos((angle+180+dAngle)*(Math.PI/180))),
            inchesToPx_Y(robot.y+d*Math.sin((angle+180+dAngle)*(Math.PI/180))));
        ctx.lineTo(
            inchesToPx_X(robot.x+d*Math.cos((angle+180-dAngle)*(Math.PI/180))),
            inchesToPx_Y(robot.y+d*Math.sin((angle+180-dAngle)*(Math.PI/180))));
        ctx.lineTo(
            inchesToPx_X(robot.x+d*Math.cos((angle+dAngle*1)*(Math.PI/180))),
            inchesToPx_Y(robot.y+d*Math.sin((angle+dAngle*1)*(Math.PI/180))));
        ctx.stroke();
        ctx.closePath(); 

        //draw line 
        ctx.beginPath();
        ctx.moveTo(points[0].getPx_X(), points[0].getPx_Y());
        for(i=0; i<points.length; i++){
            x = points[i].x;
            y = points[i].y;
            ctx.lineTo(inchesToPx_X(x), inchesToPx_Y(y));
            if(points[i].headingFromLast != null){
                midX = (points[i].x+points[i-1].x)/2
                midY = (points[i].y+points[i-1].y)/2
                vAngle = 360+(points[i].headingFromLast)-90;
                arrowSize = 10;
                ctx.moveTo(inchesToPx_X(midX),inchesToPx_Y(midY));
                ctx.lineTo(inchesToPx_X(midX)+(arrowSize)*Math.cos((vAngle+150)*(Math.PI/180)), inchesToPx_Y(midY)+(arrowSize)*Math.sin((vAngle+150)*(Math.PI/180)));
                ctx.moveTo(inchesToPx_X(midX),inchesToPx_Y(midY));
                ctx.lineTo(inchesToPx_X(midX)+(arrowSize)*Math.cos((vAngle-150)*(Math.PI/180)), inchesToPx_Y(midY)+(arrowSize)*Math.sin((vAngle-150)*(Math.PI/180)));
                ctx.moveTo(inchesToPx_X(x), inchesToPx_Y(y));
            }
        }
        ctx.stroke();
        ctx.closePath();

        //draw points
        for(i=0; i<points.length; i++){
            if(i == 0){
                ctx.fillStyle = "red";
            }else{
                ctx.fillStyle = "black";
            }
            ctx.beginPath();
            if(touchingPoint == i){
                size = pointSize*2;
            }else{
                size = pointSize;
            }
            ctx.arc(points[i].getPx_X(), points[i].getPx_Y(), size, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    }
}

function getTouching(x,y){
    for(i=points.length-1; i>=0; i--){
        if(Math.sqrt(((x-points[i].x))**2+(y-points[i].y)**2) < pointHitBox*PX_TO_INCHES){
            touchingPoint = i;
            return(i);
        }
    }
    touchingPoint = null;
    return(null);
}

canvas.oncontextmenu = function (e) {
    e.preventDefault();
};

mouseDown = false;
selectedPoint = null;
touchingPoint = null;
canvas.onmousedown = function(event){
    mouseDown = true;
    x=pxToInches_X(event.offsetX);
    y=pxToInches_Y(event.offsetY);
    selectedPoint = getTouching(x,y);
    if(event.button == 0){
        if(selectedPoint == null){
            newPoint(snap(x),snap(y));
            touchingPoint = points.length-1;
            selectedPoint = points.length-1;
        }else{
        }
    }
    //right click
    if(event.button == 2){
        if(selectedPoint != null){
            deletePoint(selectedPoint);
            getTouching();
        }
    }
    updatePoints();
}

canvas.onmouseup = function(event){
    x=pxToInches_X(event.offsetX);
    y=pxToInches_Y(event.offsetY);
    mouseDown = false;
    updatePoints();
}

canvas.onmousemove = function(event){
    x=pxToInches_X(event.offsetX);
    y=pxToInches_Y(event.offsetY);
    if(mouseDown && selectedPoint != null){
        points[selectedPoint].x = snap(x);
        points[selectedPoint].y = snap(y);
    }else{
        getTouching(x,y);
    }
    updatePoints();
}

function exportData(){
    content = "";
    content+=skills.toString()+","+snapTo.toString()+"\n";
    for(i=0; i<points.length; i++){
        content += points[i].x.toString() + "," + points[i].y.toString() +"\n";
    }

    link = document.createElement("a");
    file =  new Blob([content],{type: "text/plain"});
    link.href = URL.createObjectURL(file);
    link.download = "vex_path_data.txt";
    link.click();
    URL.revokeObjectURL(link.href);
}
function importData(){
    if(confirm("Importing a file will clear all existing points."))
    input = document.createElement('input');
    input.accept = ".txt"
    input.type = 'file';
    input.onchange = function(){
        //load file
        file = input.files[0];
        const reader = new FileReader();
        reader.onload = function() {
            contents = reader.result;
            //parse contents
            token = "";
            tokenNum = 0;
            x=0;
            y=0;
            pList = []
            for(i=0; i<contents.length; i++){
                char = contents[i];
                if(char == "," || char=="\n"){
                    if(tokenNum==0){
                        skills = (token == "true");
                        skills_check.checked = skills;
                    }
                    if(tokenNum==1){
                        snapTo = parseFloat(token);
                        snapInput.value = snapTo;
                    }
                    if(tokenNum >= 2){
                        if((tokenNum-2)%2==0){
                            //print([tokenNum,token]);
                            x = parseFloat(token);
                        }else{
                            y = parseFloat(token);
                            pList.push(new Point(x,y));
                        }
                    }
                    tokenNum++;
                    token = "";
                }else{
                    token += char;
                }
            }
            points = Array.from(pList);
            updatePoints();
        };
        reader.readAsText(file);
    }
    input.click();
}

updatePoints();