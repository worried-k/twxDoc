YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "HiWiFi",
        "HiWiFi.dataStore",
        "HiWiFi.dialog",
        "HiWiFi.i18n",
        "HiWiFi.jsRoute",
        "Openapi",
        "Openapi.mutiCall"
    ],
    "modules": [
        "HiWiFi",
        "Openapi",
        "dialog"
    ],
    "allModules": [
        {
            "displayName": "dialog",
            "name": "dialog",
            "description": "本组件用javascript的原生代码编写，不依赖其它样式表组件，可自定义配置",
            "classes": [
                {
                    "name": "HiWiFi.dialog"
                },
                {
                    "name": "HiWiFi"
                }
            ]
        },
        {
            "displayName": "HiWiFi",
            "name": "HiWiFi",
            "description": "HiWiFi为绑定在window上的综合对象",
            "classes": [
                {
                    "name": "HiWiFi.dialog"
                },
                {
                    "name": "HiWiFi"
                },
                {
                    "name": "HiWiFi.dataStore"
                },
                {
                    "name": "HiWiFi.jsRoute"
                },
                {
                    "name": "HiWiFi.i18n"
                }
            ]
        },
        {
            "displayName": "Openapi",
            "name": "Openapi",
            "description": "对调用openapi接口的一系列封装，Rely：JQuery、json3、pushstream",
            "classes": [
                {
                    "name": "Openapi"
                },
                {
                    "name": "Openapi.mutiCall"
                }
            ]
        }
    ]
} };
});