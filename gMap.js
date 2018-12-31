/**
 * 定义一个google地图类型
 */
function LocalMapType() { }

LocalMapType.prototype.tileSize = new google.maps.Size(256, 256);
LocalMapType.prototype.maxZoom = 18;   //地图显示最大级别
LocalMapType.prototype.minZoom = 10;    //地图显示最小级别
LocalMapType.prototype.name = "本地地图";
LocalMapType.prototype.alt = "显示本地地图数据";
LocalMapType.prototype.MapPicType = 'png';
LocalMapType.prototype.getTile = function (coord, zoom, ownerDocument) {
	var img = ownerDocument.createElement("img");
	img.style.width = this.tileSize.width + "px";
	img.style.height = this.tileSize.height + "px";
	var ymax = 1 << zoom;
	var y = ymax - coord.y - 1;
	//根据页面div的高宽自动计算出coord.x以及图片张数,并从中心位置开始显示图片
	//根据不同位置，要修改路径"./googleMaps/"
	//console.log(window.googleMapPath);
	var strURL = "/googleMaps/" + zoom + "/" + coord.x + "/" + coord.y + "." + this.MapPicType;
	img.src = strURL;
	var ImgObj = new Image();
	ImgObj.src = strURL;
	ImgObj.onload = function () {
		img.src = strURL;
	};
	ImgObj.onerror = function () {
		img.src = window.googleMapPath + 'mapfiles/' + "default.png";
	};
	return img;
}
/**
 * 根据google地图点位对象返回两点之间的距离
 * @param  {[object]} latlng1 [google地图点位对象]  altlng1 = {d:31.135913723,e:121.535957289934 } d纬度 e经度
 * @param  {[object]} latlng2 [google地图点位对象]
 * @return {[int]}         [两点之间的距离]
 */
/*function getDistance(latlng1,latlng2) {
    var lat = [latlng1.d, latlng2.d]
    var lng = [latlng1.e, latlng2.e]
    var R = 6371.393;
    var dLat = (lat[1] - lat[0]) * Math.PI / 180;
    var dLng = (lng[1] - lng[0]) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat[0] * Math.PI / 180) * Math.cos(lat[1] * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return Math.round(d);
}*/

/**
 * 根据google地图点位对象返回两点之间的距离
 * @param  {object} latlng1 [google地图点位对象]  altlng1 = {d:31.135913723,e:121.535957289934 } d纬度 e经度
 * @param  {object} latlng2 [google地图点位对象]
 * @return {int}         [两点之间的距离]
 */
function distance(point1, point2) {
	var R = 6378.14; // earth's mean radius in km
	var lon1 = point1.e * Math.PI / 180;
	var lat1 = point1.d * Math.PI / 180;
	var lon2 = point2.e * Math.PI / 180;
	var lat2 = point2.d * Math.PI / 180;

	var deltaLat = lat1 - lat2
	var deltaLon = lon1 - lon2

	var step1 = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat2) * Math.cos(lat1) * Math.pow(Math.sin(deltaLon / 2), 2);
	var step2 = 2 * Math.atan2(Math.sqrt(step1), Math.sqrt(1 - step1));
	return step2 * R;
}

/**
 * 根据google地图点位对象数组返回总距离
 * @param  {[array]} latlngarray [google地图点位对象数组]
 * @return {[int]}             [所有点位总距离]
 */
function getAllDistance(latlngarray) {
	var allNum = latlngarray.length;
	var s = 0;
	for (var i = 0; i < allNum; i++) {
		if (i > 1) {
			s += distance(latlngarray[i], latlngarray[i - 1]);
		}
	}
	return s;
}
/**
 * 获取点到两点之间线段的距离  线段外的点会返回false
 * @param  {object} point1   [google地图点位对象]  altlng1 = {d:31.135913723,e:121.535957289934 } d纬度 e经度
 * @param  {object} point2   [google地图点位对象]
 * @param  {object} diepoint [google地图点位对象]
 * @return {float/false}   在线段范围内的点返回距离 范围外的点返回false
 */
function apeakdistance(point1, point2, diepoint) {
	var x1 = point1.e;
	var x2 = point2.e;
	var x3 = diepoint.e;
	var y1 = point1.d;
	var y2 = point2.d;
	var y3 = diepoint.d;
	//判断是否在线段外
	//求第一条线段的直线方程（斜率和b）
	var slope = (y2 - y1) / (x2 - x1);
	var c = y2 - slope * x2;
	//求过一点且与第一条直线垂直的直线方程斜率和b）
	var opslope = -1 / slope;
	var opc = y3 - opslope * x3;
	//求两条直线的相交点
	var x4 = (c - opc) / (opslope - slope);
	var y4 = slope * x4 + c;


	//求相交点到线段之间的距离
	var distance1 = Math.sqrt(Math.pow(x4 - x1, 2) + Math.pow(y4 - y1, 2));
	var distance2 = Math.sqrt(Math.pow(x4 - x2, 2) + Math.pow(y4 - y2, 2));
	//求线段的距离
	var distance3 = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

	// return slope; //distance = Math.abs((slope*x3-y3+c)/Math.sqrt(1+slope*slope));
	if (distance3 + 0.0001 < (distance1 + distance2)) {
		return distance3 + '-' + distance1 + '-' + distance2;
	} else {
		return Math.abs((slope * x3 - y3 + c)) / Math.sqrt(1 + slope * slope) * 100;
	}
}

/**********************************************************
画圆的类
**********************************************************/
function GeoQuery() {

}

GeoQuery.prototype.CIRCLE = 'circle';        //画的形状
GeoQuery.prototype.COLORS = ["#0000ff", "#00ff00", "#ff0000"];  //圆的颜色
var COLORI = 0;             //默认颜色为0

GeoQuery.prototype = new GeoQuery();
GeoQuery.prototype._map;
GeoQuery.prototype._type;
GeoQuery.prototype._radius;
GeoQuery.prototype._dragHandle;
GeoQuery.prototype._centerHandle;
GeoQuery.prototype._polyline;
GeoQuery.prototype._color;
GeoQuery.prototype._control;
GeoQuery.prototype._points;
GeoQuery.prototype._dragHandlePosition;
GeoQuery.prototype._centerHandlePosition;

/**********************************************************
圆的初始化 返回一个可变的圆 object   myCIRCLE
**********************************************************/

GeoQuery.prototype.initializeCircle = function (radius, point, map) {
	this._type = this.CIRCLE;  //圆形
	this._radius = radius;     //半径
	this._map = map;      //地图
	//计算扩大圆的点的位置
	var distance1 = this._radius / 1000;
	var newPoint = destination(point, 180, distance1);
	distance1 = distance(point, newPoint);
	this._dragHandlePosition = destination(point, 90, distance1);

	//设置扩大圆的点的标记
	this._dragHandle = new google.maps.Marker({
		position: this._dragHandlePosition,
		map: map,
		draggable: true,
		icon: window.public + "images/pot_h.png",
		title: "半径 " + (this._radius / 1000) + " 公里"
	});
	this._dragHandle.setMap(map);

	//中心点的位置
	this._centerHandlePosition = point;

	//设置中心点的标记
	this._centerHandle = new google.maps.Marker({
		position: this._centerHandlePosition,
		map: map,
		draggable: false,
		icon: window.public + "images/pot_h.png"
	});
	this._centerHandle.setMap(map);

	//随机获取颜色
	this._color = this.COLORS[COLORI++ % 3];

	return this;
}
/********************************************************************
算法:通过原点、角度和距离计算目标点的坐标
orig:原点坐标
hdng:角度
dist:原点的到目标点的距离
@return 目标点坐标
*********************************************************************/
function destination(orig, hdng, dist) {
	var R = 6378.14; // earth's mean radius in km
	var oX, oY;
	var x, y;
	var d = dist / R;  // d = angular distance covered on earth's surface
	hdng = hdng * Math.PI / 180; // degrees to radians
	oX = orig.lng() * Math.PI / 180;
	oY = orig.lat() * Math.PI / 180;

	y = Math.asin(Math.sin(oY) * Math.cos(d) + Math.cos(oY) * Math.sin(d) * Math.cos(hdng));
	x = oX + Math.atan2(Math.sin(hdng) * Math.sin(d) * Math.cos(oY), Math.cos(d) - Math.sin(oY) * Math.sin(y));

	y = y * 180 / Math.PI;
	x = x * 180 / Math.PI;
	return new google.maps.LatLng(y, x);
}

/*********************************************************************
算法:计算两个坐标点的距离
point1:坐标点1
point2:坐标点2
@return 两点的距离
*********************************************************************/
function getdistance(point1, point2) {
	var R = 6378.14; // earth's mean radius in km
	var lon1 = point1.lng() * Math.PI / 180;
	var lat1 = point1.lat() * Math.PI / 180;
	var lon2 = point2.lng() * Math.PI / 180;
	var lat2 = point2.lat() * Math.PI / 180;

	var deltaLat = lat1 - lat2
	var deltaLon = lon1 - lon2

	var step1 = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat2) * Math.cos(lat1) * Math.pow(Math.sin(deltaLon / 2), 2);
	var step2 = 2 * Math.atan2(Math.sqrt(step1), Math.sqrt(1 - step1));
	return step2 * R;
}
/*********************************************************************
圆的渲染
*********************************************************************/
GeoQuery.prototype.render = function () {
	if (this._type == this.CIRCLE) {
		this._points = [];
		//var dis = distance(this._points[0],this._points[1])/2;
		//var newPoint = destination(this._points[0],180,dis);
		var distance = this._radius / 1000;
		for (var i = 0; i < 72; i++) {
			this._points.push(destination(this._centerHandlePosition, i * 360 / 72, distance));
		}
		this._points.push(destination(this._centerHandlePosition, 0, distance));

		this._polyline = new google.maps.Polygon({
			paths: this._points,
			strokeColor: "#FF0000",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#FF0000",
			fillOpacity: 0.3
		});
		this._polyline.setMap(this._map);
	}
}
/*********************************************************************
圆的修改
type:1:扩大缩小半径点，其他:中心点
*********************************************************************/
GeoQuery.prototype.updateCircle = function (type) {
	this._polyline.setMap(null);
	if (type == 1) {
		this._dragHandlePosition = this._dragHandle.getPosition();
		this._radius = distance(this._centerHandlePosition, this._dragHandlePosition) * 1000;//重新计算半径大小
		this.render();
	} else {
		this._centerHandlePosition = this._centerHandle.getPosition();
		this.render();
		this._dragHandle.setPosition(this.getEast());
	}
}
/*********************************************************************
圆的删除
*********************************************************************/
GeoQuery.prototype.remove = function () {
	this._polyline.setMap(null);
	this._dragHandle.setMap(null);
	this._centerHandle.setMap(null);
}
/**
 * 获取写入txt的信息
 * @param {int} cmd  调取spjkweb类型
 * @param {string} vdid 调取设备列表 每个设备用 , 隔开
 * @return {string}  信息 调取spjkweb类型|调取设备列表|窗体位子|窗体大小
 */
function GetVdString(cmd, vdid) {
	var leftPos = (typeof top.screenLeft == "number") ? top.screenLeft : top.screenX;
	var topPos = (typeof top.screenTop == "number") ? top.screenTop : top.screenY;
	var pageWidth = top.innerWidth;
	var pageHeight = top.innerHeight;
	if (typeof pageWidth != "number") {
		if (top.document.compatMode == "CSS1Compat") {
			pageWidth = top.document.documentElement.clientWidth;
			pageHeight = top.document.documentElement.clientHeight;
		}
		else {
			pageWidth = top.document.body.clientWidth;
			pageHeight = top.document.body.clientHeight;
		}
	}
	var mx = parseInt(leftPos + pageWidth / 2);
	var my = parseInt(topPos + pageHeight / 2);
	var vdstr = cmd + "|" + vdid + "|" + mx + "," + my + "|" + leftPos + "," + topPos + "," + pageWidth + "," + pageHeight + "|#";
	return vdstr;
}
function GetVdString2(apply, cmd, vdid, bTime, eTime) {
	var leftPos = (typeof top.screenLeft == "number") ? top.screenLeft : top.screenX;
	var topPos = (typeof top.screenTop == "number") ? top.screenTop : top.screenY;
	var pageWidth = top.innerWidth;
	var pageHeight = top.innerHeight;
	if (typeof pageWidth != "number") {
		pageWidth = top.document.documentElement.clientWidth;
		pageHeight = top.document.documentElement.clientHeight;
	} else {
		pageWidth = top.document.body.clientWidth;
		pageHeight = top.document.body.clientHeight;
	}
	var mx = parseInt(leftPos + pageWidth / 2);
	var my = parseInt(topPos + pageHeight / 2);
	// 应用|[操作码|相机ID集合|显示坐标|显示大小|[检索时间|]]#
	var vdstr = apply + '|' +
		cmd + '|' +
		vdid + '|' +
		mx + ',' + my + '|' +
		leftPos + "," + topPos + "," + pageWidth + "," + pageHeight + '|' +
		bTime + ',' + eTime + '|#';
	return vdstr;
}
/*		集成平台下地图标记title不显示的问题
*		{obj} latLng;    显示位置的经纬度
*		{string} title;	 可以只是一个字符串，或者可以是一段html;
*/
function LabelMarkerInfo(MAP, latLng, title) {
	this.latLng = latLng;
	this.title = title;
	this.setMap(MAP);
};
LabelMarkerInfo.prototype = new google.maps.OverlayView();
LabelMarkerInfo.prototype.onAdd = function () {
	var div = document.createElement('div');
	div.style.position = "absolute";
	div.style.backgroundColor = '#fff';
	div.style.border = '1px solid #ccc';
	div.style.borderRadius = '3px';
	div.style.boxShadow = '0 2px 6px #777';
	div.style.cursor = 'pointer';
	div.style.marginBottom = '22px';
	div.style.textAlign = 'center';
	div.style.color = '#191919';
	div.style.fontFamily = '"微软雅黑",Arial,sans-serif';
	div.style.fontSize = '13px';
	div.style.lineHeight = '28px';
	div.style.paddingLeft = '5px';
	div.style.paddingRight = '5px';
	div.style.minWidth = '68px';
	div.innerHTML = this.title;


	this.div_ = div;
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
};
LabelMarkerInfo.prototype.draw = function () {
	var overlayProjection = this.getProjection();
	var sw = overlayProjection.fromLatLngToDivPixel(this.latLng);
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = sw.y + 'px';
};
LabelMarkerInfo.prototype.onRemove = function () {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};