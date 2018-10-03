# jscode
一些js的小程序
## snakeAi.html
> 贪吃蛇Ai  待完善

## App.js
> THINKPHP 框架下的前端规范程序

- 自动识别web目录 / 或者自定义
- 可装载所有的外部引入的js，css文件
- ```App.loadjs()```动态加载js文件防止因某一个js文件的加载缓慢导致整个页面卡顿
- ```App.url(controller,method,layer)```生成带```index.php```TP标准的url资源

## tinymce-vue.js

> tinymce的vue兼容程序， 需要安装tinymce

```
npm install tinymce -S

import Editor from your/path/to/tinymce-vue


components:{
    'editor':Editor
}


<editor
    :id="'tinymce001'"  //这个地方ID不要使用tinymce
    :plugins="'image link table code codesample'"
    :init="tinymceConfig"
    :url="'/node_modules/tinymce/tinymce.min.js'"
    v-model="form.content"
    ></editor>
```