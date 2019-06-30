# DIP
### 一个基于JavaScript的数字图像处理库

## 1.安装
通过
`<script type='text/javascript' src="pathto/DIP.js"></script>`
标签引入到你的web页面
## 2. 打开图片
打开图片是阻塞过程，需如例子所示在回调函数中获得GM对象

    /*.html*/
    <input id='imgfile' type="file">
    
    /*.js*/
    var m;
    DIP.loadImage('imgfile', function(gm){
        m = gm;
    })

## 3. GM对象
GM对象含有四个属性与两个主要方法

    m.width  //图片宽
    m.height //图片高
    m.rData  //输入图像的灰度矩阵
    m.sData  //输出图像的灰度矩阵

    m.save()    //将`sData`（输出）的值置为`rData`（输入）的值
    m.setback() //将`rData`（输入）的值置为`sData`（输出）的值
GM的图像处理的函数从`rData`中读取像素值，再将处理完成的像素值保存在`sData`中。\
**值得注意的是，只有直方图获取函数`m.getHistogram()`是从`sData`中读取像素**。

## 4.绘图

    /*.html*/
    <canvas id="canvas"></canvas>

    /*.js*/
    DIP.drawImage('canvas',m);  //绘制输入图像
    //or
    DIP.preview('canvas',m);    //绘制输出图像

## 5.GM的函数方法

    m.reverse()                      //图像反转

    m.logTransform(c)                //对数变换 s=c*log(1+r)

    m.powTransfrom(c,gama)           //幂律变换 s=c*r^gama

    m.segmentTransform(segEnd, segFuns)//分段线性变换

分段线性变换的参数segEnd与segFuns为一维数组。segEnd为每一段结束的灰度级，segFuns为每一段的函数，它的形式需为
`function f(r){... return s;}`
例如
`m.segmentTransform([100,200,255],[f1,f2,f3])`
其中f1属于[0,100]，f2属于(100,200]，f3属于(200,255]

    m.contrastStretch(r1,s1, r2,s2) //对比度拉伸
由点(r1,s1),(r2,s2)可确定唯一对比度拉伸函数，其中r1<=r2, s1<=s2

    m.getHistogram()                //获取灰度直方图
返回值为长度为226的数组,下标0~255代表灰度级

    m.histogramEqualization()       //直方图均衡
