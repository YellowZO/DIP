(function(win){
    function GM(){      /*gray image object*/
        this.width = 0;
        this.height = 0;
        /*Data is a 2D array*/
        this.sData = new Array();   /*output image data*/
        this.rData = new Array();   /*input  image data*/
    }
    /*保存处理后的图像*/
    GM.prototype.save = function(){
        var i,j;
        for(i=0;i<this.height;i++)
            for(j=0;j<this.width;j++)
                this.rData[i][j] = this.sData[i][j];
    }
    /*撤回操作,即将sData设为rData*/
    GM.prototype.setBack = function(){
        var i,j;
        for(i=0;i<this.height;i++)
            for(j=0;j<this.width;j++)
                this.sData[i][j] = this.rData[i][j];
    }
    /*遍历像素*/
    GM.prototype.pixelLoop = function(callback){
        for(var i=0;i<this.height;i++)
            for(var j=0;j<this.width;j++)
                this.sData[i][j] = callback(this.rData[i][j]);
    }
    /*图像反转*/
    GM.prototype.reverse = function(){
        this.pixelLoop(function(pixel){
            return 255-pixel;
        });
    }
    /*对数变换*/
    GM.prototype.logTransform = function(c){
        this.pixelLoop(function(pixel){
            return Math.round(c*Math.log(1+pixel));
        });
    }
    /*幂律变换*/
    GM.prototype.powTransform = function(c, gama){
        this.pixelLoop(function(pixel){
            return Math.round(c*Math.pow(pixel, gama));
        });
    }
    /*分段线性变换*/
    GM.prototype.segmentTransform = function(segEnd, segFuns){
    /*
    1.segEnd is an Array, 值为每段区间终点的灰度值
    2.segFuns is an Array, 值为每段的处理函数, 函数的第一个参数必
        须预留给输入灰度值(pixel)
    4.对比度拉伸 GM.contrastStretch就是以本函数为基础编写的,可作为开发参考
    */
        this.pixelLoop(function(pixel){
            var k = 0;
            while(pixel-segEnd[k]>0)
                k++;
            return Math.round(segFuns[k](pixel));
        });
    }
    /*对比度拉伸*/
    GM.prototype.contrastStretch = function(r1,s1, r2,s2){
        /*
        由(r1,s1),(r2,s2)两点可确定唯一分段
        线性函数. 其中r1<=r2,s1<=s2.
        y1, y2, y2 是根据直线方程两点式确定的每段的函数
        */
        var y1 = function(x){
            return s1/r1*x;
        }
        var y2 = function(x){
            return (x-r1)/(r2-r1)*(s2-s1)+s1;
        }
        var y3 = function(x){
            return (x-r2)/(255-r2)*(255-s2)+s2;
        }
        this.segmentTransform([r1,r2,255],[y1,y2,y3]);
    }
    /*获取（输出图像的）直方图*/
    GM.prototype.getHistogram = function(){
        var h = new Array(256).fill(0);
        var n = this.width*this.height;
        var i, j;
        for(i=0; i<this.height; i++)
            for(j=0; j<this.width; j++)
                h[this.sData[i][j]]++;
        for(i=0;i<256;i++)
            h[i] /= n;
        return h;
    }
    /*直方图均衡*/
    GM.prototype.histogramEqualization = function(){
        var hr = this.getHistogram();
        var hs = new Array(256).fill(0);
        var sum = 0;
        for(var i=0; i<256; i++){
            sum += 255*hr[i];
            hs[i] = Math.round(sum);
        }
        this.pixelLoop(function(pixel){
            return hs[pixel];
        });
    }

    function DIP(){
        /*
        这是本库唯一的全局变量
        作用是读取图片、绘图、创建GM对象
        */
    };
    /*创建GM对象*/
    DIP.prototype.newGM = function(width,height){
        var gm = new GM();
        gm.height = height;
        gm.width = width;
        for(var i=0;i<height;i++){
            var a1 = new Array(width).fill(0);
            var a2 = new Array(width).fill(0);
            gm.rData.push(a1);
            gm.sData.push(a2);
        }
        return gm;
    }
    DIP.prototype.loadImage = function(sInputId, callback){
        var input = document.getElementById(sInputId);
        var gm = new GM();
        if (input.files && input.files[0]) {
            var f = input.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = e.target.result;
                var image = new Image();
                image.src = data;
                image.onload = function () {
                    var w = image.width;
                    var h = image.height;
                    gm.width = w;
                    gm.height = h;
                    var canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    canvas.style.display = "none";
                    var body = document.getElementsByTagName("body")[0];
                    body.appendChild(canvas);
                    var context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, w, h, 0, 0, w, h);
                    var imgData = context.getImageData(0,0,w,h);
                    var index = 0;
                    for(var i=0;i<h;i++){
                        /*
                        这里使用两个数组是为了不影响sData到rData的拷贝
                        如果只用一个a的话,sData和rData实际上是共用一块
                        存储空间的数组,无法进行拷贝*/
                        var a1 = new Array();
                        var a2 = new Array();
                        for(var j=0;j<w;j++)
                        {
                            var R = imgData.data[index];   //R(0-255)
                            var G = imgData.data[index+1]; //G(0-255)
                            var B = imgData.data[index+2]; //G(0-255)
                            var gray = Math.round((R+G+B)/3)
                            a1.push(gray);
                            a2.push(gray);
                            index += 4;
                        }
                        gm.rData.push(a1);
                        gm.sData.push(a2);
                    }
                    document.body.removeChild(canvas);
                    callback(gm);
                };
            };
            reader.readAsDataURL(f);
        }
        else
            alert('NO IMG FILE SELECTED');
    }
    function _drawImage(sCanvasId, width, height, data){
        var canvas = document.getElementById(sCanvasId);
        canvas.height = height;
        canvas.width = width;
        var context = canvas.getContext('2d');
        var imgData=context.createImageData(width, height);
        var k = 0;
        for(var i=0;i<height;i++)
            for(var j=0;j<width;j++)
            {
                imgData.data[k] = data[i][j];
                imgData.data[k+1] = data[i][j];
                imgData.data[k+2] = data[i][j];
                imgData.data[k+3] = 255;
                k += 4;
            }
        context.putImageData(imgData,0,0);
    }
    /*绘制输入(rData)图像*/
    DIP.prototype.drawImage = function(sCanvasId, gm){
        /*
        width = ("number"==typeof width)?weith:gm.width;
        height = ("number"==typeof height)?height:gm.height;
        */
        _drawImage(sCanvasId, gm.width, gm.height, gm.rData);
    }
    /*绘制输出(sData)图像*/
    DIP.prototype.preview = function(sCanvasId, gm){
        _drawImage(sCanvasId,gm.width, gm.height, gm.sData);
    }
    win.DIP = new DIP();
}(window))