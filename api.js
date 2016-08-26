YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "HiWiFi",
        "HiWiFi.dataStore",
        "HiWiFi.dialog"
    ],
    "modules": [
        "HiWiFi",
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
                }
            ]
        }
    ]
} };
});