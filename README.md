# ChaoxingDownload_FusionEdition
超星学习通章节资源直链下载，每个资源下方单独下载按钮，支持ppt(x),doc(x),pdf,mp4等资源源文件  
  
欢迎提Issues、PR，也可以Email我：621818579@qq.com

### 脚本说明  
本项目融合修改自以下项目，取各家所长，郑重感谢！ 

UI部分：https://github.com/ColdThunder11/ChaoXingDownload ，作者ColdThunder11，GPL-3.0开源协议，参考版本0.37  
源文件下载逻辑：https://github.com/RytterMohn/chaoxingDownload ，作者：西电网信院的废物rytter & 西电网信院的废物B4a，MIT开源协议，参考版本1.12，我抛弃了xueyinonline适配、右上浮动进度条（进度条有空再补）  

（v1.1已引入西电网信院大佬的进度条（浮动提示框）方案）  

基于以上上游项目开源协议，本项目采用GPL-3.0协议发布  

由于小弟水平有限，修改过程使用了千问Qwen、深度求索DeepSeek、豆包Doubao等AI辅助  

### 安装注意事项
安装脚本后，如果章节页面刷新后仍没有任何变化（脚本完全不生效），尤其是首次使用油猴的用户，请在浏览器-扩展管理-油猴扩展的“详细信息”，检查是否开启“允许用户脚本”  
<img width="1000" alt="0273a096c589fb634e431e9cc0783b3e" src="https://github.com/user-attachments/assets/147180e1-4900-4c3a-a2ed-6bf411376fc3" />

### 碎碎念
最开始用的是ColdThunder11的脚本，在原页面每一个资源下方，显示“点此下载 第一章 概论.ppt”，点击这行字就可以下载，这很直观，指哪打哪，完美支持ppt、doc、mp4。  
某一天，发现它加那一行字没问题，但可能是学习通服务器升级了，点击之后下载失败。  

又找了RytterMohn的脚本，能够成功下载文件。但它只有一个下载按钮，多次点击，按顺序循环下载单个文件，这不够直观。  
而且它没有适配doc(x)文件，下载下来是pdf；  
（后来它的1.15版本改成一个列表呈现所有资源，多选下载，但是ppt和word还不支持源文件，作者说会修）

打算动手把ColdThunder11的脚本修好，但JavaScript代码和操作网页的DOM我没接触过，网页语言HTML我也只懂一丢丢。

俩脚本连注释500行+，逐段请AI解读，看了大半，实在头疼，无从下手。索性直接找AI改。

众所周知，除了微型项目，AI代码不可能一次跑通doge

经过我的胡乱修改，诶！行了！😋😋😋  

写代码名场面：  
《为啥跑不动？》  
《为啥跑得动？》
