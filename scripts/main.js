class Robot{
    constructor(x,y,width,length,heading,speed){
        this.x=x;
        this.y=y;
        this.width=width;
        this.length=length;
        this.heading=heading;
        this.progress = 0;
        this.speed = speed;
    }
}
robot = new Robot(0,0,15,18,90,(Math.PI*3.25*450/60));

class Point{
    constructor(x,y,t,r){
        this.x = x;
        this.y = y;
        this.timeout = t;
        this.reversed = r;
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

class Path{
    points = [];
    length = 0;
    progress = 0;

    newPoint(x,y){
        this.points.push(new Point(x,y,1000,false));
    }
    deletePoint(num){
        this.actions.splice(num,1);
        this.points.splice(num,1);
    }
    clearAllPoints(){
        this.actions = [];
        this.points = [];
    }
}

path = new Path();

class Action{
    constructor(n, p, o){
        this.name = n;
        this.parameters = p;
        this.outputString = o; 
    }
}

availableActions = []

function print(message){
    console.log(message);
}

function updatePoints(){
    if(path.points.length > 0){
        path.length = 0;
        for(i=0; i<path.points.length; i++){
            //distance/heading toNext
            if(i<path.points.length-1){
                path.points[i].distanceToNext = Math.sqrt((path.points[i+1].x-path.points[i].x)**2+(path.points[i+1].y-path.points[i].y)**2);
                if(path.points[i+1].x-path.points[i].x >= 0){
                    path.points[i].headingToNext = 90-Math.atan((path.points[i+1].y-path.points[i].y)/(path.points[i+1].x-path.points[i].x))*180/Math.PI;
                }else{
                    path.points[i].headingToNext = 270-Math.atan((path.points[i+1].y-path.points[i].y)/(path.points[i+1].x-path.points[i].x))*180/Math.PI;
                }
            }else{
                path.points[i].distanceToNext = null;
                path.points[i].headingToNext = null;
            }
            //distance/heading fromLast
            if(i > 0){
                path.points[i].distanceFromLast = Math.sqrt((path.points[i].x-path.points[i-1].x)**2+(path.points[i].y-path.points[i-1].y)**2);
                path.length += path.points[i].distanceFromLast;
                if(path.points[i].x-path.points[i-1].x >= 0){
                    path.points[i].headingFromLast = 90-Math.atan((path.points[i].y-path.points[i-1].y)/(path.points[i].x-path.points[i-1].x))*180/Math.PI;
                }else{
                    path.points[i].headingFromLast = 270-Math.atan((path.points[i].y-path.points[i-1].y)/(path.points[i].x-path.points[i-1].x))*180/Math.PI;
                }
            }else{
                path.points[i].distanceFromLast = null;
                path.points[i].headingFromLast = null;
            }
        }
        robot_slider.value = (path.progress/path.length)*robot_slider.max;
        if(path.length < path.progress){
            path.progress = path.length;
        }
    }
    updateRobotPosition();
    //drawCanvas();
    //updatePointsList();
}

function getTouching(x,y){
    wasTouching = touchingPoint;
    for(i=path.points.length-1; i>=0; i--){
        if(Math.sqrt(((x-path.points[i].x))**2+(y-path.points[i].y)**2) < pointHitBox*PX_TO_INCHES){
            touchingPoint = i;
            return(i);
        }
    }
    touchingPoint = null;
    return(null);
}

function vexHeadingtoTrigAngle(input){
    return(-input+90);
}

function robotGoTo(v,index){
    total = 0
    for(i=0; i<index; i++){
        if(i < path.points.length-1){
            total += path.points[i].distanceToNext;
        }
    }
    path.progress = total;
    robot_slider.value = (path.progress/path.length)*robot_slider.max;
    updateRobotPosition();
    drawCanvas();
}

function updateRobotPosition(){
    total = path.progress;
    index = 0;
    for(i=0; i<path.points.length; i++){
        if(total >= path.points[i].distanceToNext){
            total -= path.points[i].distanceToNext;
        }else{
            index = i;
            break;
        }
    }
    if(path.points.length > 0){
        if(path.progress >= path.length && path.points.length > 1){
            index = path.points.length-2;
            total = path.points[index].distanceToNext;
        }
        if(! isNaN(path.points[index].headingToNext)){
            robot.x = path.points[index].x + total*Math.cos(vexHeadingtoTrigAngle(path.points[index].headingToNext)*Math.PI/180);
            robot.y = path.points[index].y + total*Math.sin(vexHeadingtoTrigAngle(path.points[index].headingToNext)*Math.PI/180);
        }else{
            robot.x = path.points[index].x;
            robot.y = path.points[index].y;
        }
        robot.heading = path.points[index].headingToNext;
        if(path.points.length-1 > index){
            if(path.points[index+1].reversed){        
                robot.heading = path.points[index].headingToNext+180;
            }
        }
    }
}

fps = 60;
play = false;
function animateRobot(){
    if(play){
        if(path.progress < path.length){
            path.progress += robot.speed/fps;
        }else{
            play = !play;
            if(play){playButton.value = "Stop";
            }else{playButton.value = "Play";}
        }
        robot_slider.value = (path.progress/path.length)*robot_slider.max;
        updateRobotPosition();
        drawCanvas();
    }
}

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

//updatePoints();
setInterval(animateRobot,(1000/fps));