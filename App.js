//修正没有console对象时，手动添加无意义的console的对象及方法
(function () {
    if (typeof window.console == 'undefined' || typeof console == 'undefined') {
        var console = {};
        console.log = function () { };
        console.error = function () { };
        console.warn = function () { };
        console.info = function () { };
    }
})();
//初始化web根目录,公共资源目录,已经加载的js,css
function App(rootPath) {
    if (typeof rootPath != 'undefined') {
        this.root = rootPath;
    } else {
        //确保App.js是第一个引入
        var first = document.getElementsByTagName('script')[0].src;
        if (first.indexOf('http') > -1) {
            this.root = '/' + first.split('/')[3] + '/';
        } else {
            this.root = '/' + first.split('/')[0] + '/';
        }
    }
    //css数组
    this.loadedCss = [];
    //js数组
    this.loadedJs = [];
    //TP后台数据，用于html页面初始化
    this.tp = {};
    //url数组
    this.urls = [];
    this.public = this.root + 'Public/';
    this.registerLoadedJs();
    this.registerLoadedCss();
}
//首字母大写
App.prototype.upString = function (string) {
    var tempString = string.split('');
    tempString[0] = tempString[0].toUpperCase();
    return tempString.join('');
}
//登记已经引入的js
App.prototype.registerLoadedJs = function () {
    this.loadedJs = [];
    var srcs = document.getElementsByTagName('script');
    for (var i = 0; i < srcs.length; i++) {
        if ((typeof srcs[i].src != 'undefined') && (srcs[i].src != '')) {
            this.registerjs(srcs[i].src);
        }
    }
    return this;
}
//登记已经引入的css
App.prototype.registerLoadedCss = function () {
    this.loadedCss = [];
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
        if ((typeof links[i].href != 'undefined') && (links[i].href != '')) {
            this.registercss(links[i].href);
        }
    }
    return this;
}
/**
 * 错误提醒机制--有console 优先使用console 否则使用 alert
 * @param  string string 错误信息
 * @return void
 */
App.prototype.error = function (string) {
    if (typeof window.console != 'undefined') {
        console.log(string);
    } else {
        alert(string);
    }
}
/**
 * 获取tp的url
 * @param  string tpstring tpUrl标准写法
 * @param  string layer      层级  无传值为Home
 * @return string
 */
App.prototype.url = function (tpstring, layer) {
    layer = (typeof layer != 'undefined') ? layer : 'Home';
    var url = this.root + 'index.php/' + layer + '/' + this.upString(tpstring) + '/';
    !this.inArray(url, this.urls) ? this.urls.push(url) : '';
    return url;
}
/**
 * 初始化一些需要的Url
 * @param  array obj [{function:'',url:''}]
 * @return viod
 */
/*App.prototype.initUrl = function(obj){
    for (var i = 0; i < obj.length; i++) {
        this[obj[i].function+'Url'] = this.url(obj[i].url);
    }
    return this;
}
*//**
 * 序列化表单  基于jquery
 * @param  string selecter 表单
 * @return object        json
 */
App.prototype.serializeJson = function (selecter) {
    if (typeof $ == 'undefined') {
        var str = '该方法是基于jquery，引入jquery后使用';
        this.error(str);
        return false;
    }
    var formArr = $(selecter).serializeArray();
    var jsonObj = {};
    for (var i = 0; i < formArr.length; i++) {
        jsonObj[formArr[i].name] = formArr[i].value;
    }
    return jsonObj;
}
/**
 * 下载单张图片  //需要后端支持
 * @param  string imageUrl 图片地址（支持本地，远程地址）
 * @return false/viod
 */
App.prototype.downImage = function (imageUrl) {
    window.open(this.url('Function/downImage') + '?imgUrl=' + imageUrl);
}
/**
 * 外部直接引入的js需要进行登记
 * @param  array/string srcArr 登记数组或者字符串
 * @return void
 */
App.prototype.registerjs = function (srcArr) {
    if (typeof srcArr == 'object') {
        this.loadedJs = this.loadedJs.concat(srcArr);
    } else {
        this.loadedJs.push(srcArr);
    }
    return this;
}
/**
 * 外部直接引入的css需要进行登记
 * @param  array/string hrefArr 登记数组或者字符串
 * @return void
 */
App.prototype.registercss = function (hrefArr) {
    if (typeof hrefArr == 'object') {
        this.loadedCss = this.loadedCss.concat(hrefArr);
    } else {
        this.loadedCss.push(hrefArr);
    }
    return this;
}
/**
 * 动态加载js，可以防止因为一个js文件加载缓慢导致整个html停顿
 * 但是无法确保加载文件的先后顺序，所以需要确保动态加载的资源之间没有相互依赖
 * @param  string src js文件地址
 * @return void
 */
App.prototype.loadjs = function (src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    document.getElementsByTagName('head')[0].appendChild(script);
    this.loadedJs.push(src);
    return this;
}
/**
 * 获取使用过的js
 * @return array
 */
App.prototype.getJsArr = function () {
    return this.loadedJs;
}
/**
 * 监听键盘事件 兼容各个浏览器
 * @param  string   key      按键
 * @param  Function callback 回调事件
 * @return
 */
App.prototype.listenKey = function (key, callback) {
    document.onkeydown = function (e) {
        var theEvent = e || window.event;
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == key) {
            callback();
        }
    }
}
/**
 * 是否在数组中
 * @param  string $search 比较的字符串
 * @param  array $arr   比较的数组
 * @return boolean
 */
App.prototype.inArray = function (search, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == search) return true;
    }
    return false;
}
/**
 * 根据值删除数组元素
 * @param  string value 值
 * @param  array arr   数组
 * @return arr       删除删除后的数组
 */
App.prototype.removeArrayItem = function (value, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == search) {
            arr.splice(i, 1);
        }
    }
    return arr;
}
//easyui 按钮控制
App.prototype.linkbutton = function (target, method) {
    if (target) $(target).linkbutton(method);
}
//应用
App.prototype.extra = function (method, param) {
    this.extra.methods[method](param);
}
App.prototype.extra.methods = {
    remove: function (param) {
        return App.prototype.remove(param);
    },
    export: function (param) {
        return App.prototype.exportExcel(param);
    },
    add_edit: function (param) {
        return App.prototype.add_edit(param);
    },
    search: function (param) {
        return App.prototype.search(param);
    }
};
/**
 * 导出excel  需要后端支持
 * @param  object  exportInfo
 * @return viod
 */
App.prototype.exportExcel = function (exportInfo) {
    var self = this;
    var options = $.extend(this.exportExcel.defaults, exportInfo);
    this.linkbutton(options.linkbutton, 'disable');
    if (options.params === false) {
        $.messager.alert('操作提示', '无导出参数,请核验！', 'info');
        this.linkbutton(options.linkbutton, 'enable');
        return false;
    }
    var fields = {};
    var url = '';
    //如果拥有datagrid属性
    if (options.datagrid) {
        var option = $(options.datagrid).datagrid('options');
    }
    if (options.treegrid) {
        var option = $(options.treegrid).treegrid('options');
    }
    if (option) {
        options.params.page = option.pageNumber;
        options.params.rows = option.pageSize;
        url = option.url != null ? option.url : '';
        for (var i = 0; i < option.columns[0].length; i++) {
            //无需添加的数据
            if (options.delFields != false) {
                if (this.inArray(option.columns[0][i].field, options.delFields)) continue;
            }
            fields[option.columns[0][i].field] = option.columns[0][i].title;
        }
    }
    //如果拥有fields重置fields属性
    if (options.fields) fields = options.fields;
    //如果有url属性重置url
    if (options.url) url = options.url;

    if (options.page) options.params.page = options.page;
    if (options.rows) options.params.rows = options.rows;
    //设置导出
    options.params['export'] = true;
    //设置文本
    options.params.fields = fields;
    options.parseFileds(options.params.fields);
    if (url == '') {
        $.messager.alert('操作提示', '无导出URL,请核验！', 'info');
        this.linkbutton(options.linkbutton, 'enable');
        return false;
    }
    if (options.params.rows == false) {
        $.messager.alert('操作提示', '无导出条数,请核验！', 'info');
        this.linkbutton(options.linkbutton, 'enable');
        return false;
    }
    $.messager.show({
        title: '操作提示',
        msg: '正在导出。。。',
        timeout: 2000,
        showType: 'slide'
    });
    this.exportExcel.options = options;
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: options.params,
        success: function (r) {
            if (r.status == true) {
                window.location.href = r.fileUrl;
            } else {
                $.messager.alert('操作提示', r.message, 'info');
            }
        },
        error: function (r) {
            $.messager.alert('操作提示', '网络发生错误！', 'info');
        },
        complete: function (r, s) {
            self.linkbutton(options.linkbutton, 'enable');
        }
    })
}
//导出函数参数初始化
App.prototype.exportExcel.defaults = {
    datagrid: false,                //表格
    treegrid: false,                //树表格
    url: false,                     //重写url地址
    delFields: false,               //删除字段
    fields: false,                  //重写字段属性
    linkbutton: false,              //关联按钮
    params: false,                  //查询参数
    page: false,                    //重写查询页数
    rows: false,                    //重写查询条数
    parseFileds: function (fields) { } //解析参数
};
//增加修改
App.prototype.add_edit = function (params) {
    var self = this;
    var options = $.extend(App.prototype.add_edit.defaults, params);
    this.linkbutton(options.linkbutton, 'disable');
    if (options.url == false) {
        $.messager.alert('操作提示', 'url地址不能为空', 'info');
        this.linkbutton(options.linkbutton, 'enable');
        return false;
    }
    var request = {};
    if (options.form != false) {
        request = this.serializeJson(options.form);
        if (!$(options.form).form('validate')) {
            this.linkbutton(options.linkbutton, 'enable');
            return false;
        }
    }
    options.parsedata(request);
    this.add_edit.options = options;
    $.ajax({
        url: options.url,
        type: 'post',
        dataType: 'json',
        data: request,
        success: function (data) {
            options.success(data);
        },
        error: function (data) {
            options.error(data);
            $.messager.alert('操作提示', '网络故障', 'info');
        },
        complete: function (r, s) {
            if (options.dialog) $(options.dialog).dialog('close');
            App.prototype.linkbutton(options.linkbutton, 'enable');
        }
    });
}
//增加修改函数参数初始化
App.prototype.add_edit.defaults = {
    form: false,             //相关表单
    dialog: '#dialog',       //相关dialog
    url: false,              //发送地址
    linkbutton: false,       //相关按钮
    parsedata: function (data) { }, //数据分析
    success: function (data) { },   //成功后
    error: function (data) { }      //发送失败后

};
//删除
App.prototype.remove = function (params) {
    var options = $.extend(App.prototype.remove.defaults, params);
    this.linkbutton(options.linkbutton, 'disable');
    if (options.url == '') {
        $.messager.alert('操作提示', 'url地址不能为空', 'info');
        this.linkbutton(options.linkbutton, 'enable');
        return false;
    }
    var data = {};
    if (options.datagrid) {               //如果有datagrid
        var infos = $(options.datagrid).datagrid('getSelections');
        if (infos.length == 0) return false;
        var ids = [];
        $.each(infos, function (n, m) {
            ids.push(m[options.idFiled]);
        });
        ids = ids.join(',');
        data[options.idFiled] = ids;
    }
    options.parsedata(data);
    $.ajax({
        url: options.url,
        type: 'post',
        data: data,
        dataType: 'json',
        success: function (data) {
            options.success(data);
            if (data.message) $.messager.alert('结果提示', data.message, 'info');
        },
        error: function (data) {
            options.error(data);
            $.messager.alert('操作提示', '网络故障', 'info');
        },
        complete: function (r, s) {
            App.prototype.linkbutton(options.linkbutton, 'enable');
        }
    });
}
//删除方法默认值
App.prototype.remove.defaults = {
    url: '',         //url地址
    idFiled: 'id',     //标识主键
    datagrid: '#datagrid',    //datagrid表格
    linkbutton: false,  //相关按钮
    dialog: false,      //dialog
    parsedata: function (data) { }, //分析数据
    error: function (data) { },     //错误方法
    success: function (data) { }   //成功方法
};
//搜索
App.prototype.search = function (param) {
    var options = $.extend(App.prototype.search.defaults, param);
    this.linkbutton(options.linkbutton, 'disable');
    var data = {};
    if (options.form) data = this.serializeJson(options.form);
    options.parsedata(data);
    this.search.options = options;
    if (options.ajax) {
        $.ajax({
            url: options.url,
            type: 'post',
            dataType: 'json',
            data: data,
            success: function (result) {
                options.success(result);
                if (data.message) $.messager.alert('结果提示', data.message, 'info');
            },
            error: function (info) {
                options.error(info);
                $.messager.alert('提示', '网络发生错误！', 'info');
            },
            complete: function (r, s) {
                App.prototype.linkbutton(options.linkbutton, 'enable');
            }
        })
    } else {
        var option = $(options.datagrid).datagrid('options');
        option.showDatagrid = options.showDatagrid;
        option.otherView = options.otherView;
        $(options.datagrid).datagrid('load', data);
        App.prototype.linkbutton(options.linkbutton, 'enable');
    }
}
App.prototype.search.defaults = {
    ajax: false,         //是否为ajax搜索
    url: null,           //当ajax为true时生效
    datagrid: null,
    treegrid: null,
    showDatagrid: true,  //是否显示datagrid
    form: null,          //查询表单
    linkbutton: null,    //相关按钮
    parsedata: function (data) { }, //解析参数
    otherView: function (data) { }, //显示的信息 当showDatagrid 为false时生效,
    success: function (data) { },   //为ajax时生效
    error: function (data) { }      //为ajax时生效
};
//表格
App.prototype.datagrid = function (target, params) {
    var options = $.extend(App.prototype.datagrid.defaults, params);
    $(target).datagrid(options);
}
//设置表格默认属性
App.prototype.datagrid.defaults = {
    fitColumns: true,
    rownumbers: true,
    fit: true,
    pageSize: '20',
    pagination: true,
    showDatagrid: true,  //是否显示datagrid表格 自定义属性
    otherView: function (data) { }, //自定义属性,显示的信息 当showDatagrid 为false时生效
    loadFilter: function (data) {
        var options = $(this).datagrid('options');
        if (!options.showDatagrid) {
            var string = options.otherView(data);
            $(this).parent('.datagrid-view').children('.datagrid-view1').hide();
            $(this).parent('.datagrid-view').children('.datagrid-view2').find('.datagrid-header').hide();
            $(this).parent('.datagrid-view').children('.datagrid-view2').css('left', 0).find('.datagrid-body').html(string);
        }
        if (options.showDatagrid && data.total > 0) {
            $(this).parent('.datagrid-view').children('.datagrid-view1').show();
            $(this).parent('.datagrid-view').children('.datagrid-view2').css('left', '').find('.datagrid-header').show();
        }
        if (data.error) {
            var info = {};
            info.total = 0;
            info.rows = [];
            info.error = data.error;
            return info;
        }
        return data;
    },
    onLoadSuccess: function (data) {
        if (data.total == 0 && !$(this).datagrid('options').showDatagrid) {
            $(this).parent('.datagrid-view').find('div.datagrid-view1').hide();
            $(this).parent('.datagrid-view').children('.datagrid-view2');
            $(this).parent('.datagrid-view').children('.datagrid-view2').css('left', 0).find('div.datagrid-body').html('没有相关记录，请重新搜索！').css({ 'color': '#F00', 'text-align': 'center', 'font-size': '20px' });
        }
        if (data.error) {
            $.messager.alert('操作提示', data.error, 'info');
        }
    },
    onLoadError: function () {
        $.messager.alert('提示', '网络发生错误！', 'info');
    }
};
