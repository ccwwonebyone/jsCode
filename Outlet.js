//输出
var Outlet = function(){};
//监测IE
Outlet.prototype.checkIE = function(){
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    //console.log(userAgent);
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
        return true;
    }else{
        return false;
    }
}
//设置IE属性
Outlet.prototype.setIE = function(){
    this.isIE = this.checkIE();
}
//输出日志
Outlet.prototype.log = function(string){
    //如果是IE直接结束程序
    if(this.isIE) return false;
    console.log(string);
}
//输出信息
Outlet.prototype.info = function(string){
    //如果是IE直接结束程序
    if(this.isIE) return false;
    console.info(string);
}
//输出告警
Outlet.prototype.warn = function(string){
    //如果是IE直接结束程序
    if(this.isIE) return false;
    console.warn(string);
}
//输出错误
Outlet.prototype.error = function(string){
    //如果是IE直接结束程序
    if(this.isIE) return false;
    console.error(string);
}