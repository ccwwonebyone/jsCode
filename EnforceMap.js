//定义地图默认经纬度，地图级别，地图类型，地图容器
function EnforceMap(lng,lat,zoom,localMapType,map_canvas){
    zoom = zoom || 13;
    localMapType = localMapType || new LocalMapType();
    map_canvas = map_canvas || 'map_canvas';
    this.latlng = new google.maps.LatLng(lng, lat);
    this.zoom = zoom;
    this.localMapType = localMapType;
    this.map_canvas = map_canvas;
    this.markers = {};
    this.map = this.init();
}
//初始化地图
EnforceMap.prototype.init = function(){
    var mapOptions = {
          zoom: this.zoom,
          center: this.latlng,
          mapTypeControlOptions: {
            mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
/*          google.maps.MapTypeId.HYBRID,
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.TERRAIN,*/
            'localMap' ]  //定义地图类型
          },
          panControl: true,
          zoomControl: true,
          mapTypeControl: false,            //地图类型控制 默认为true需要false
          scaleControl: true,
          streetViewControl: false,
          overviewMapControl: true
        }
    var map = new google.maps.Map(document.getElementById(this.map_canvas), mapOptions);
    map.mapTypes.set('localMap', this.localMapType);   //绑定本地地图类型
    map.setMapTypeId('localMap');    //指定显示本地地图
    map.addListener('zoom_changed',function(){
        if (this.zoom <= 10) {
            map.zoom = 10;
        };
    })
    return map;
}
/**
 * 添加标记
 * @param float lng   维度
 * @param float lat   经度
 * @param string icon  图标
 * @param string title 标题
 * @param string unique 唯一标识
 * return obj
 */
EnforceMap.prototype.addScene = function(lng,lat,icon,title,unique){
    icon = icon || app.public+'image/map-icon.png';
    title = title || '';
    var latlng = new google.maps.LatLng(lng, lat);
    var marker = new google.maps.Marker({
        position: latlng,
        icon:icon
    });
    self = this;
    var info = null;
    google.maps.event.addListener(marker, 'mouseover', function() {
        info = new LabelMarkerInfo(self.map,this.position,title);
    })
    google.maps.event.addListener(marker, 'mouseout', function() {
        info.setMap(null);
    })
    marker.setMap(this.map);
    this.markers[unique] = marker;
    return marker;
}
/**
 * 移动坐标位置
 * @param string unique 唯一标识
 * @param  obj marker google地图标记
 * @param  float lng    维度
 * @param  float lat    经度
 * @return  obj
 */
EnforceMap.prototype.moveScene = function(unique,lng,lat){
    if(lng != this.markers[unique].position.d && lat !=this.markers[unique].position.e){
        this.markers[unique].position.d = lng;
        this.markers[unique].position.e = lat;
        //移动位置
        this.markers[unique].setMap(this.map);
    }
    return this.markers[unique];
}
//标记集群  实时查看时使用
EnforceMap.prototype.marker_clusterer = function(){
    var markers = [];
    for(var marker in this.markers){
        markers.push(this.markers[marker])
    }
    if(this.markerClusterers){
        this.markerClusterers.clearMarkers();
        this.markerClusterers.addMarkers(markers);
    }else{
        this.markerClusterers = new MarkerClusterer( this.map, markers , { imagePath: app.public+'plugins/mapfiles/images/' } );
    }
}
//移动标记  单个警员时使用
EnforceMap.prototype.animation = function(lines){
    var lineSymbol = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        strokeColor: '#393'
    };
    var line = [];
    // 每个路段的距离,速度
    for (var i = 0; i < lines.length-1; i++) {
        var googleLatLng1 = new google.maps.LatLng(lines[i].lat, lines[i].lng);
        var googleLatLng2 = new google.maps.LatLng(lines[i+1].lat, lines[i+1].lng);
        var v = google.maps.geometry.spherical.computeDistanceBetween(googleLatLng1,googleLatLng2);
        var s = (lines[i]['speed'] + lines[i+1]['speed'])/2;
        var t = v/s;
        var polyline = new google.maps.Polyline({
            path: [googleLatLng1,googleLatLng2],
            icons: [{
               icon: lineSymbol,
               offset: '100%'
            }],
            map: map
        });
        line.push({'p':polyline, 't':t});
        polyline.setMap(null);

    }
    var i = -1;
    animateCircle();
    function animateCircle() {
        i ++ ;
        var count = 0;
        var l = line[i]['p'];
        var t = line[i]['t'];
        var timer = window.setInterval(function(){
            l.setMap(this.map);
            if(i>=1){
                line[i-1]['p'].setMap(null);
            }
            count = (count + 1) % 200;
            var icons = l.get('icons');
            icons[0].offset = (count / 2) + '%';
            l.set('icons', icons);
            if(count == 199){
                clearInterval(timer);
                animateCircle();
            }
        },t);
        if (i >= line.length) {
            return
        };
    }
}