// ==UserScript==
// @name         超星学习通章节资源直链下载（融合版）
// @namespace    https://github.com/KenXK/ChaoxingDownload_FusionEdition
// @version      1.3.1
// @description  超星学习通章节资源直链下载，每个资源下方单独下载按钮，支持ppt(x),doc(x),pdf,mp4等资源源文件
// @author       Github@ColdThunder11 + 西电网信院的废物rytter & B4a(Github@RytterMohn) + Github@KenXK使用Qwen&DeepSeek&豆包辅助融合修改
// @match        *://*.chaoxing.com/mycourse/studentstudy?chapterId=*&courseId=*&clazzid=*&enc=*
// @match        *://*.chaoxing.com/mooc-ans/*
// @run-at       document-start
// @grant        unsafeWindow
// @updateURL    https://github.com/KenXK/ChaoxingDownload_FusionEdition/raw/refs/heads/main/%E8%B6%85%E6%98%9F%E5%AD%A6%E4%B9%A0%E9%80%9A%E7%AB%A0%E8%8A%82%E8%B5%84%E6%BA%90%E7%9B%B4%E9%93%BE%E4%B8%8B%E8%BD%BD%EF%BC%88%E8%9E%8D%E5%90%88%E7%89%88%EF%BC%89.user.js
// @downloadURL  https://github.com/KenXK/ChaoxingDownload_FusionEdition/raw/refs/heads/main/%E8%B6%85%E6%98%9F%E5%AD%A6%E4%B9%A0%E9%80%9A%E7%AB%A0%E8%8A%82%E8%B5%84%E6%BA%90%E7%9B%B4%E9%93%BE%E4%B8%8B%E8%BD%BD%EF%BC%88%E8%9E%8D%E5%90%88%E7%89%88%EF%BC%89.user.js
// ==/UserScript==

// 如果脚本不生效（连在资源下面加一行文字都不成功），请尝试修改上方match规则，以匹配你所在单位的学习通的网址

// 本项目融合修改自以下项目，取各家所长，郑重感谢！
// UI部分：https://github.com/ColdThunder11/ChaoXingDownload，作者ColdThunder11，GPL-3.0开源协议，参考版本0.37
// 源文件下载逻辑：https://github.com/RytterMohn/chaoxingDownload，作者：西电网信院的废物rytter & 西电网信院的废物B4a，MIT开源协议，参考版本1.12，抛弃xueyinonline适配
// 基于以上上游项目开源协议，本项目采用GPL-3.0协议发布

(function () {
    'use strict';

    // 核心下载函数（基于西电脚本改造，适配doc/x，移除xueyinonline适配）
    function downloadResource(objectid, fileName) {
        // 构建浮动提示框
        // ↓在当前网页中查找第一个class名为tips的HTML元素
        var tipsDiv = document.querySelector('.tips');
        // .querySelector()是document的一个方法，用于根据 CSS 选择器查找元素。
        // 参数'.tips'是一个CSS类选择器，表示“查找class包含tips的元素”。前面的点.是CSS语法，表示“类”（class）。
        // querySelector()只返回第一个匹配的元素（即使页面中有多个.tips）。*/

        if (!tipsDiv) {
            // 如果tipsDiv不存在（判断是否假值）, 创建并让它悬浮在页面右上角
            tipsDiv = document.createElement('div'); // 在内存中创建一个新的<div>元素对象（尚未插入页面）
            tipsDiv.className = 'tips';
            document.body.appendChild(tipsDiv); // appendChild将元素插入到页面的<body>末尾并显示

            tipsDiv.style.position = 'fixed'; // 元素位置相对于浏览器窗口固定
            tipsDiv.style.top = '10px'; // 距离上边框10px
            tipsDiv.style.right = '10px'; // 距离右边框10px
            tipsDiv.style.backgroundColor = 'rgb(209 232 255 / 90%)';
            tipsDiv.style.padding = '10px'; // 内边距
            tipsDiv.style.zIndex = '1000'; // Ensure it's on top of other elements
            tipsDiv.style.textAlign = 'right'; // Align text to the right
        }

        // 让浮动提示框显现
        if (tipsDiv.style.zIndex === '-1') {
            tipsDiv.style.zIndex = '1000';
        }

        // 清空浮动提示框
        tipsDiv.innerHTML = '<i></i>';

        // 构建超星资源状态查询接口
        const protocolStr = document.location.protocol;
        const apiHost = location.hostname; 
        const url = `${protocolStr}//${apiHost}/ananas/status/${objectid}?flag=normal`;

        console.log("【融合】现在fetch以下资源url：",url);
        let useXHRdownload = true;
        // 请求资源信息
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("资源请求失败");
                return response.json();
            })
            .then(json => {
                if (json.status !== "success") throw new Error("资源状态异常");

                let fileUrl, fullFileName = fileName || json.filename;

                // 区分不同文件类型的下载链接
                const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
                if (officeExtensions.some(ext => fullFileName.toLowerCase().includes(ext))) {
                    // DOC/DOCX/PPT/PPTX文件使用download链接（原文件），替换http为https
                    fileUrl = json.download.replace('http://', 'https://').replace('mooc1.chaoxing.com', apiHost);
                    window.open(fileUrl);
                    useXHRdownload = false;
                } else if (json.pdf) {
                    // PDF文件使用pdf链接
                    fileUrl = json.pdf;
                } else if (json.http) {
                    // 视频类资源使用http链接
                    fileUrl = json.http.replace('http://', 'https://');
                } else {
                    throw new Error("未找到有效下载链接");
                }
                console.log("【融合】文件名称：",fullFileName)
                console.log("【融合】文件URL：",fileUrl)

                if (useXHRdownload) {
                    // 查找当前激活的目录项
                    const activeDiv = document.querySelector('.posCatalog_select.posCatalog_active');
                    // 获取章节编号
                    const chapterNumber = activeDiv.querySelector('.posCatalog_sbar').textContent.trim();
                    console.log("当前章节编号：", chapterNumber)

                    // 创建浮动提示框中文件名的元素
                    var fileNameSpan = document.createElement('span');
                    fileNameSpan.textContent = '下载文件： ' + fullFileName;
                    fileNameSpan.style.marginRight = '10px'; // 右侧添加外边距
                    // 创建浮动提示框中文件大小、百分比的元素
                    var percentageSpan = document.createElement('span');
                    percentageSpan.textContent = '0%';
                    percentageSpan.style.marginLeft = '10px'; // 左侧添加外边距
                    percentageSpan.style.width = '60px';
                    // 创建浮动提示框中进度条元素
                    var progressBar = document.createElement('progress');
                    var fileSizeSpan = document.createElement('span');
                    progressBar.value = 0;
                    progressBar.max = 100;
                    fileSizeSpan.textContent = '文件大小：计算中……';
                    fileSizeSpan.style.marginRight = '10px'; // 右侧添加外边距
                    // 将上述元素插入到tipsDiv末尾显现
                    tipsDiv.appendChild(fileNameSpan);
                    tipsDiv.appendChild(fileSizeSpan);
                    tipsDiv.appendChild(progressBar);
                    tipsDiv.appendChild(percentageSpan);

                    // 配置XHR下载的逻辑
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', fileUrl, true);
                    xhr.responseType = 'blob';

                    // 配置XHR下载过程中要执行的逻辑（返回信息给进度条）
                    xhr.onprogress = function (event) {
                        if (event.lengthComputable) {
                            // ↑event.lengthComputable是一个布尔值（true或false），表示服务器是否提供了文件总大小
                            var percentComplete = (event.loaded / event.total) * 100;
                            progressBar.value = percentComplete; // 刷新进度条值
                            percentageSpan.textContent = percentComplete.toFixed(2) + '%'; // 刷新百分比数值
                            fileSizeSpan.textContent = '文件大小：' + (event.total / 1024 / 1024).toFixed(2) + ' MB'; // 刷新文件大小
                        }
                    };

                    // 配置XHR下载成功后触发浏览器下载的逻辑
                    xhr.onload = function () {
                        if (this.status === 200) {
                            const blob = this.response;
                            const downloadUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = downloadUrl;
                            // a.download = `${chapterNumber} ${fullFileName}`;
                            a.download = `${fullFileName}`;
                            document.body.appendChild(a);
                            a.click();
                            // 清理资源
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(downloadUrl);
                            tipsDiv.innerHTML = ''; // （可选）下载完成后清除进度条
                        } else {
                            alert(`XHR下载失败：HTTP状态码 ${this.status}`);
                        }
                        // 置底浮动窗
                        if (tipsDiv.style.position === 'fixed') {
                            tipsDiv.style.zIndex = '-1';
                        }
                    };

                    // 配置XHR出错时的逻辑
                    xhr.onerror = function () {
                        alert("XHR下载失败：网络请求异常");
                    };

                    // 发送XHR
                    xhr.send();
                }
            })
            .catch(error => {
                alert(`资源解析失败：${error.message}`);
                console.error("下载失败详情：", error);
            });
    }

    // 注入下载按钮（基于CT11脚本的UI逻辑）
    function processContainer(container) {
        // 避免重复注入按钮
        if (container.querySelector(".cx-download-btn")) return;

        // 获取资源objectid和文件名
        const resourceIframe = container.getElementsByTagName("iframe")[0];
        if (!resourceIframe) return;

        const objectid = resourceIframe.getAttribute("objectid");
        if (!objectid) return;

        // 解析文件名和类型
        let fileName = resourceIframe.getAttribute("name") || "未知文件";
        let fileSize = "未知大小";
        let fileHsize = "未知大小";
        const dataAttr = resourceIframe.getAttribute("data");
        if (dataAttr) {
            try {
                const dataJson = JSON.parse(dataAttr);
                fileName = dataJson.name || fileName;
                fileSize = dataJson.size || fileSize;
                fileHsize = dataJson.hsize || fileHsize;
            } catch (e) { /* 解析失败则使用默认名 */ }
        }

        // 创建下载按钮
        const downloadBtn = document.createElement("div");
        downloadBtn.className = "cx-download-btn";
        downloadBtn.style.cssText = `
            cursor: pointer;
            font-size: 14px;
            color: #30a669;
            margin-top: 5px;
            padding: 2px 0;
        `;
        downloadBtn.innerHTML = `点此下载　${fileName}　${fileHsize}　${fileSize} B`;

        // 绑定下载事件
        downloadBtn.onclick = () => downloadResource(objectid, fileName);

        // 注入按钮到资源容器
        container.appendChild(downloadBtn);
    }

    function injectDownloadButtons() {
        setInterval(() => {
            // 判断当前页面是否为新的目标页面
            const isNewPage = window.location.href.includes('chaoxing.com/mooc-ans/nodedetailcontroller');

            if (isNewPage) {
                console.log("【融合】匹配到chaoxing.com/mooc-ans/nodedetailcontroller")
                // --- 针对新页面 example.com/bbb/* 的逻辑 ---
                const ansContainers = document.getElementsByClassName("ans-attach-ct");
                for (let j = 0; j < ansContainers.length; j++) {
                    processContainer(ansContainers[j]);
                }
            } else {
                console.log("【融合】匹配到其他")
                // --- 原有逻辑保持不变 ---
                const iframes = document.getElementsByTagName("iframe");
                for (let i = 0; i < iframes.length; i++) {
                    try {
                        const frame = iframes[i];
                        const frameDoc = frame.contentWindow?.document;
                        if (!frameDoc) continue;

                        // 获取资源容器
                        const ansContainers = frameDoc.getElementsByClassName("ans-attach-ct");
                        if (ansContainers.length === 0) continue;

                        for (let j = 0; j < ansContainers.length; j++) {
                            processContainer(ansContainers[j]);
                        }
                    } catch (e) {
                        console.error("注入下载按钮失败：", e);
                    }
                }
            }
        }, 2000); // 每2秒检查一次，确保动态加载的资源也能注入
    }

    // 初始化执行
    try {
        // 避免跨域问题
        let href = unsafeWindow.top.location.href;
    } catch {
        location.reload();
        return;
    }

    // 只在顶层窗口执行注入
    if (unsafeWindow.top.location.href === unsafeWindow.location.href) {
        injectDownloadButtons();
    }
})();