// ==UserScript==
// @name         超星学习通章节资源直链下载（融合版）
// @namespace    https://github.com/KenXK/ChaoxingDownload_FusionEdition
// @version      1.0
// @description  超星学习通章节资源直链下载，每个资源下方单独下载按钮，支持ppt(x),doc(x),pdf,mp4等资源源文件
// @author       Github@ColdThunder11 + 西电网信院的废物rytter & B4a(Github@RytterMohn) + Github@KenXK使用Qwen&DeepSeek&豆包 辅助融合修改
// @match        *://*.chaoxing.com/mycourse/studentstudy?chapterId=*&courseId=*&clazzid=*&enc=*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

// 本项目融合修改自以下项目，取各家所长，郑重感谢！
// UI部分：https://github.com/ColdThunder11/ChaoXingDownload，作者ColdThunder11，GPL-3.0开源协议，参考版本0.37
// 源文件下载逻辑：https://github.com/RytterMohn/chaoxingDownload，作者：西电网信院的废物rytter & 西电网信院的废物B4a，MIT开源协议，参考版本1.12，抛弃xueyinonline适配、右上浮动进度条（进度条有空再补）
// 基于以上上游项目开源协议，本项目采用GPL-3.0协议发布

(function () {
    'use strict';

    // 核心下载函数（基于西电脚本改造，适配doc/x，移除进度条和xueyinonline适配）
    function downloadResource(objectid, fileName) {
        // 构建超星资源状态查询接口
        const protocolStr = document.location.protocol;
        const url = `${protocolStr}//mooc1.chaoxing.com/ananas/status/${objectid}?flag=normal`;

        console.log("【融合】现在fetch以下资源url：",url)
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
                if (fullFileName.includes(".doc") || fullFileName.includes(".docx")) {
                    // DOC/DOCX文件使用download链接（原文件），替换http为https
                    fileUrl = json.download.replace('http://', 'https://');
                    window.open(fileUrl)
                } else if (fullFileName.includes(".ppt") || fullFileName.includes(".pptx")) {
                    // PPT/PPTX文件使用download链接
                    fileUrl = json.download.replace('http://', 'https://');
                    window.open(fileUrl)
                } else if (json.pdf) {
                    // PDF文件使用pdf链接
                    fileUrl = json.pdf;
                } else if (json.http) {
                    // 视频类资源使用http链接
                    fileUrl = json.http.replace('http://', 'https://');
                } else {
                    throw new Error("未找到有效下载链接");
                }
                console.log("【融合】文件URL：",fileUrl)

                // 创建XHR下载Blob并触发浏览器下载
                const xhr = new XMLHttpRequest();
                xhr.open('GET', fileUrl, true);
                xhr.responseType = 'blob';

                xhr.onload = function () {
                    if (this.status === 200) {
                        const blob = this.response;
                        const downloadUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = downloadUrl;
                        a.download = fullFileName;
                        document.body.appendChild(a);
                        a.click();
                        // 清理资源
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(downloadUrl);
                    } else {
                        alert(`下载失败：HTTP状态码 ${this.status}`);
                    }
                };

                xhr.onerror = function () {
                    alert("下载失败：网络请求异常");
                };

                xhr.send();
            })
            .catch(error => {
                alert(`资源解析失败：${error.message}`);
                console.error("下载失败详情：", error);
            });
    }

    // 注入下载按钮（基于CT11脚本的UI逻辑）
    function injectDownloadButtons() {
        setInterval(() => {
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
                        const container = ansContainers[j];
                        // 避免重复注入按钮
                        if (container.querySelector(".cx-download-btn")) continue;

                        // 获取资源objectid和文件名
                        const resourceIframe = container.getElementsByTagName("iframe")[0];
                        if (!resourceIframe) continue;

                        const objectid = resourceIframe.getAttribute("objectid");
                        if (!objectid) continue;

                        // 解析文件名和类型
                        let fileName = resourceIframe.getAttribute("name") || "未知文件";
                        const dataAttr = resourceIframe.getAttribute("data");
                        if (dataAttr) {
                            try {
                                const dataJson = JSON.parse(dataAttr);
                                fileName = dataJson.name || fileName;
                            } catch (e) { /* 解析失败则使用默认名 */ }
                        }

                        // 创建下载按钮
                        const downloadBtn = document.createElement("div");
                        downloadBtn.className = "cx-download-btn";
                        downloadBtn.style.cssText = `
                            cursor: pointer;
                            font-size: 14px;
                            color:#30a669;
                            margin-top: 5px;
                            padding: 2px 0;
                        `;
                        downloadBtn.innerHTML = `点此下载 ${fileName}`;

                        // 绑定下载事件
                        downloadBtn.onclick = () => downloadResource(objectid, fileName);

                        // 注入按钮到资源容器
                        container.appendChild(downloadBtn);
                    }
                } catch (e) {
                    console.error("注入下载按钮失败：", e);
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