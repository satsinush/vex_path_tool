canvas = document.getElementById("canvas");

canvas.width = 480;
canvas.height = 480;
pixelsPerInch = 3;
pointHitBox = 10;
pointSize = 5;
snapTo = 0;
skills = false;
mouseDown = false;
selectedPoint = null;
touchingPoint = null;

PX_TO_INCHES = 1/pixelsPerInch;
INCHES_TO_PX = pixelsPerInch;

canvas.oncontextmenu = function (e) {
    e.preventDefault();
};

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

function changeData(){
    updatePoints();
    drawCanvas();
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

    if(path.points.length > 0){
        //draw lines 
        ctx.beginPath();
        ctx.moveTo(path.points[0].getPx_X(), path.points[0].getPx_Y());
        for(i=0; i<path.points.length; i++){
            x = path.points[i].x;
            y = path.points[i].y;
            ctx.lineTo(inchesToPx_X(x), inchesToPx_Y(y));
            //draw arrow
            if(path.points[i].headingFromLast != null){
                midX = (path.points[i].x+path.points[i-1].x)/2
                midY = (path.points[i].y+path.points[i-1].y)/2
                vAngle = 360+(path.points[i].headingFromLast)-90;
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

        //draw robot
        angle = 360+(robot.heading)-90;
        angle = -robot.heading+90;
        dAngle = Math.atan(robot.width/robot.length)*(180/Math.PI)
        d = Math.sqrt((robot.width/2)**2+(robot.length/2)**2);
        /*
        ctx.beginPath();
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
        */

        image = document.getElementById("robot_image");
        ctx.translate(inchesToPx_X(robot.x), inchesToPx_Y(robot.y));
        ctx.rotate(-(angle)*(Math.PI/180));
        ctx.drawImage(image, -robot.length/2*pixelsPerInch, -robot.width/2*pixelsPerInch, robot.length*pixelsPerInch, robot.width*pixelsPerInch);
        ctx.rotate((angle)*(Math.PI/180));
        ctx.translate(-inchesToPx_X(robot.x), -inchesToPx_Y(robot.y));

        //draw path.points
        for(i=0; i<path.points.length; i++){
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
            ctx.arc(path.points[i].getPx_X(), path.points[i].getPx_Y(), size, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    }
}

drawCanvas();