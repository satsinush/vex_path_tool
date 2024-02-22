//list of points with x,y, heading, distance values, delete button, (scrollable)
//copy output to clipboard
//robot outline
//output code

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

class Point{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    headingToNext = null;
    distanceToNext = null;

    getPx_X() {
        return(inchesToPx_X(this.x));
    }
    getPx_Y() {
        return(inchesToPx_Y(this.y));
    }
}

points = [];

function newPoint(x,y){
    p = new Point(x,y);
    return(p);
}

function deletePoint(num){
    points.splice(num,1);
}

function print(message){
    console.log(message);
}
function roundToM(num, multiple){
    return((Math.round(num/multiple)*multiple));
}

function updatePoints(){
    if(points.length > 0){
        for(i=0; i<points.length-1; i++){
            points[i].distanceToNext = Math.sqrt((points[i+1].x-points[i].x)**2+(points[i+1].y-points[i].y)**2);
            if(points[i+1].x-points[i].x > 0){
                points[i].headingToNext = 90-Math.atan((points[i+1].y-points[i].y)/(points[i+1].x-points[i].x))*180/Math.PI;
            }else{
                points[i].headingToNext = 270-Math.atan((points[i+1].y-points[i].y)/(points[i+1].x-points[i].x))*180/Math.PI;
            }
        }
    }
    drawCanvas();
    updatePointsList();
}

function createInput(name, id, type, value, width, onchangeFunction){
    input = document.createElement("input");
    input.type = type;
    input.id = name+toString(id);
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
function updateDistance(value, id){
    points[id+1].x = points[id].x + value*Math.cos(-(points[id].headingToNext-90)*Math.PI/180);
    points[id+1].y = points[id].y + value*Math.sin(-(points[id].headingToNext-90)*Math.PI/180);
    updatePoints();
}
function updateHeading(value, id){
    points[id+1].x = points[id].x + points[id].distanceToNext*Math.cos(-(value-90)*Math.PI/180);
    points[id+1].y = points[id].y + points[id].distanceToNext*Math.sin(-(value-90)*Math.PI/180);
    updatePoints();
}
function deleteButton(value, id){
    deletePoint(id);
    updatePoints();
}
function insertButton(value, id){
    points.splice(id+1,0,new Point(points[id].x,points[id].y));
    updatePoints();
}

function updatePointsList(){
    //clear table
    for(i=0; i<tableSize; i++){
        point_list.deleteRow(1);
    }

    for(i=0; i<points.length; i++){
        row = point_list.insertRow(point_list.length);
        cell = row.insertCell(row.length);
        cell.innerHTML = i+1;
        cell.width = "25px";
        row.insertCell(row.length).appendChild(
            createInput("xInput", i,"number",points[i].x.toFixed(2),"50px", updateX));
        row.insertCell(row.length).appendChild(
            createInput("yInput", i,"number",points[i].y.toFixed(2),"50px", updateY));
        if(points[i].distanceToNext != null && points[i].headingToNext != null){
            row.insertCell(row.length).appendChild(
                createInput("distanceInput", i,"number",points[i].distanceToNext.toFixed(2),"50px", updateDistance));
            row.insertCell(row.length).appendChild(
                createInput("headingInput", i,"number",points[i].headingToNext.toFixed(2),"50px", updateHeading));
        }else{
            row.insertCell();
            row.insertCell();
        }
        row.insertCell(row.length).appendChild(
            createInput("insertButton", i, "button","Insert","50px",insertButton));
        row.insertCell(row.length).appendChild(
            createInput("deleteButton", i, "button","Delete","50px",deleteButton));
    }
    tableSize = points.length;
}

function pxToInches_X(input){
    x = (input-canvas.width/2)*PX_TO_INCHES;
    if(snapTo != 0){
        x = Math.round(x/(snapTo))*(snapTo);
    }
    return(x);
}
function pxToInches_Y(input){
    y = (-input+canvas.height/2)*PX_TO_INCHES;
    if(snapTo != 0){
        y = Math.round(y/(snapTo))*(snapTo);
    }
    return(y);
}

function inchesToPx_X(input){
    return(input*INCHES_TO_PX+canvas.width/2);
}
function inchesToPx_Y(input){
    return(-input*INCHES_TO_PX+canvas.height/2);
}

function getX(input){
    x = pxToInches_X(input);
    if(x > 72){
        //x = 72;
    }
    if(x < -72){
        //x = -72;
    }
    return(x);
}
function getY(input){
    y = pxToInches_Y(input);
    if(y > 72){
        //y = 72;
    }
    if(y < -72){
        //y = -72;
    }
    return(y);
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
        //draw line 
        ctx.beginPath();
        ctx.moveTo(points[0].getPx_X(), points[0].getPx_Y());
        for(i=0; i<points.length; i++){
            ctx.lineTo(points[i].getPx_X(), points[i].getPx_Y());
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
    x=getX(event.offsetX);
    y=getY(event.offsetY);
    selectedPoint = getTouching(x,y);
    if(event.button == 0){
        if(selectedPoint == null){
            points.push(newPoint(x,y));
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
    x=getX(event.offsetX);
    y=getY(event.offsetY);
    mouseDown = false;
    updatePoints();
}

canvas.onmousemove = function(event){
    x=getX(event.offsetX);
    y=getY(event.offsetY);
    if(mouseDown && selectedPoint != null){
        points[selectedPoint].x = x;
        points[selectedPoint].y = y;
    }else{
        getTouching(x,y);
    }
    updatePoints();
}

updatePoints();
//drawCanvas();