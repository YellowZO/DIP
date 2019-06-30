var m;
function loadGM(){
    DIP.loadImage('imgfile',function(gm){
        /*由于加载图片是个阻塞的过程,所以只能在回调函数中获取GM对象*/
        m = gm;
    });
}
function draw(i){
    DIP.drawImage('canvas0',m);
}
function test(i){
    switch(i){
        case 0:m.save();break;
        case 1:m.reverse();break;
        case 2:m.logTransform(25);break;
        case 3:m.powTransform(1,1.5);break;
        case 4:m.contrastStretch(150,30,180,230);break;
        case 5:m.histogramEqualization();break;
        case 6:draw_H();break;
        case 7:m.setBack();break;
    }
    DIP.preview('canvas0',m);
}
/*
function a_random_test(){
    var gm = DIP.newGM(300,500);
    gm.pixelLoop(function(x){
        return Math.round(Math.random())*255;
    })
    DIP.preview('canvas0',gm);
}
window.onload = function(){
   a_random_test(); 
}*/


/*绘制直方图,需导入char.js库,在test.html中已从cdn源导入*/
function draw_H(){
    var popCanvas = document.getElementById("popChart").getContext("2d");
    var barChart = new Chart(popCanvas, {
        type: 'bar',
        data: {
          labels:new Array(256).fill(''),
          datasets: [{
            label: 'Histogram',
            data: m.getHistogram(),
            backgroundColor: new Array(256).fill('rgba(255, 99, 132, 1)'),
          }]
        }
      });
}