var PlayVlc = function(container,vlcId){
    this.container = container;
    this.vlcId = vlcId;
    this.setVlc();
    this.loadVlc();
};
PlayVlc.prototype.loadVlc = function(){
    $(this.container).html(this.vlcString);
}
PlayVlc.prototype.setVlc = function () {
    var browser=navigator.appName;
    var version=parseFloat(navigator.appVersion);
    //火狐
    if ( browser=="Netscape"  && version>=4) {
        this.vlcString = '<embed pluginspage="http://www.videolan.org" '+
                  'type="application/x-vlc-plugin"  '+
                  'id="'+this.vlcId+'"'+
                  'width="100%" height="100%" mrl="" text="Waiting for video"/>';
    }
    //IE
    else if(browser=="Microsoft Internet Explorer" && version>=4) {
        this.vlcString = '<object classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" '+
                   'codebase="http://downloads.videolan.org/pub/videolan/vlc/latest/win32/axvlc.cab" '+
                   'id="'+this.vlcId+'"'+
                   'events="True">'+
                   '<param name="mrl" value=""/> '+
                   '<param name="ShowDisplay" value="false" /> '+
                   '<param name="AutoLoop" value="false" /> '+
                   '<param name="AutoPlay" value="true" /> '+
                   '<param name="Time" value="true"/> ' +
                   '</object>';
    }
}
PlayVlc.prototype.play = function (url) {
    //后续写播放操作行为
    $.ajax({
      url:app.url('Media/video_action'),
      data:{
        action:2,
        wjbh:app.tp.wjbh
      }
    })
    try{
      vlc.playlist.clear();
      vlc.playlist.add(url);
      vlc.playlist.play();
    }
    catch(e){

    }

}
PlayVlc.prototype.download = function(url){
    //后续写下载行为
    $.ajax({
      url:app.url('Media/video_action'),
      data:{
        action:1,
        wjbh:app.tp.wjbh
      }
    })
    //下载文件
    window.location.href = url;
}
PlayVlc.prototype.setWH= function(w,h){
    var vlc = document.getElementById(this.vlcId);
    vlc.width = w;
    vlc.height = h;
}
function isInsalledIEVLC(){
    var vlcObj = null;
    var vlcInstalled= false;
    try {
        vlcObj = new ActiveXObject("VideoLAN.Vlcplugin.1");
        if( vlcObj != null ){
            vlcInstalled = true
        }
    } catch (e) {
        vlcInstalled= false;
    }
    return vlcInstalled;
}

//仅适用于firefox浏览器是，并且安装有vlc插件，则返回true；
function isInsalledFFVLC(){
    var numPlugins=navigator.plugins.length;
    for  (i=0;i<numPlugins;i++){
        plugin=navigator.plugins[i];
        if(plugin.name.indexOf("VideoLAN") > -1 || plugin.name.indexOf("VLC") > -1){
            return true;
        }
    }
    return false;
}
