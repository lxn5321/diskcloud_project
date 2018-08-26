var CURRENTPATH = null;
var JSONDATA = null;
var SEPARATORSYMBOL = ">";
var _PATHID = 0;

// init all
init_all()

function init_all(){
    draw_all('/');
    document.querySelector(".logout_btn").addEventListener("click",function(){
        window.location.replace(PARADICT["logout_url"]);
    });
    $(".mouse_menu").on({
        contextmenu: mouseMenuRightClickHandler
    });
}
function draw_all(path){
    CURRENTPATH = path;
    function exec_func(data){
        JSONDATA = data;
        createDirTable();
        createBreadCrumb();
    }
    get_info_json(path,exec_func);
}
function get_info_json(path,exec_func=null){
    fetch(PARADICT["file_api_url"] + PARADICT["username"] + path + '?info=1', {credentials: "same-origin"}).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                if(exec_func != null){
                    exec_func(data)
                }
            })
        } else {
            // need to develop
            return false;
        }
    });
}
function have_same_file(name,jsondata = JSONDATA){
    var have_same = false;
    for(n = 0; n < jsondata.directories.length; n++){
        if(name == jsondata.directories[n][0]){
            have_same = true;
            break;
        }
    }
    if(have_same === false){
        for(n = 0; n < jsondata.files.length; n++){
            if(name == jsondata.files[n][0]){
                have_same = true;
                break
            }
        }
    }
    return have_same;
}
function success_message(mes){
    return '<div class="container"><div class="media"><div class="success_icon"></div><div id="success_hint"class="text-success media-body">' + mes + '</div></div>'
}
function error_message(mes,jsondata=null){
    if(jsondata === null){
        return '<div class="media"><div class="error_icon"></div><div class="rename_fail_hint text-danger">' + mes + '</div></div>';
    }
    return '<div class="media"><div class="error_icon"></div><div class="rename_fail_hint text-danger">' + mes + '\n' + jsondata.err_mes + '</div></div>';
}
function createDirTable(path = CURRENTPATH, data = JSONDATA) {
    var entryContainer = $(".entry_container");
    var entryRow = entryContainer.find(".entry_row");
    var cacheArray = new Array();
    // var pathLength = path.length
    // // If path != "/" and path ends with a slash, remove the slash
    // if ( path != "/" && path.charAt(pathLength - 1) == "/"){
    //     path = path.slice(0,pathLength - 1);
    // }
    // if dir row or file row exist,remove
    if(entryRow){
        entryRow.remove();
    }
    // create folder row
    for (var n = 0; n < data.directories.length; n++) {
        var folderRow = $("<div class='row folder_row entry_row' id='folder_row" + (n + 1) + "'></div>");
        var nameCol = $("<div class='col-7 media'></div>");
        var iconContainer = $("<div class='icon_container d-flex align-items-center justify-content-center'></div>");
        var icon = $("<div class='folder_icon'></div>");
        var mediaBody = $("<div class='media-body'></div>").text(data.directories[n][0]);
        var sizeCol = $("<div class='col-2 d-flex align-items-center'></div>");
        var mtimeCol = $("<div class='col-3 d-flex align-items-center'></div>").text('20'+data.directories[n][1]);
        iconContainer.append(icon);
        nameCol.append(iconContainer,mediaBody);
        folderRow.append(nameCol,sizeCol,mtimeCol);
        cacheArray.push(folderRow);
    }
    // create file row
    for (var n = 0; n < data.files.length; n++) {
        var fileName = data.files[n][0];
        var fileRow = $("<div class='row file_row entry_row' id='file_row" + (n + 1) + "'></div>");
        var nameCol = $("<div class='col-7 media'></div>");
        var iconContainer = $("<div class='icon_container d-flex align-items-center justify-content-center'></div>");
        var icon = $("<div></div>");
        var mediaBody = $("<div class='media-body'></div>").text(fileName);
        var sizeCol = $("<div class='col-2 d-flex align-items-center'></div>").text(toStandardSize(data.files[n][2]));
        var mtimeCol = $("<div class='col-3 d-flex align-items-center'></div>").text('20'+data.files[n][1]);
        // add icon by file name suffix
        var index = fileName.lastIndexOf(".");
        var suffix = fileName.slice(index + 1).toLowerCase();
        if (index == -1) {
            icon.addClass("unknow_icon");
        } else{
            if (suffix == "apk") {
                icon.addClass("apk_icon");
            } else if (suffix == "json" || suffix == "xml" || suffix == "py" || suffix == "java" || suffix == "bat" || suffix == "c" || suffix == "cpp" || suffix == "sh") {
                icon.addClass("code_icon");
            } else if (suffix == "doc" || suffix == "docx") {
                icon.addClass("doc_icon");
            } else if (suffix == "exe") {
                icon.addClass("exe_icon");
            } else if (suffix == "png" || suffix == "jpg" || suffix == "jpeg" || suffix == "gif" || suffix == "ico" || suffix == "bmp") {
                icon.addClass("image_icon");
            } else if (suffix == "wav" || suffix == "ape" || suffix == "flac" || suffix == "wma" || suffix == "mp3" || suffix == "aac") {
                icon.addClass("music_icon");
            } else if (suffix == "pdf") {
                icon.addClass("pdf_icon");
            } else if (suffix == "tar" || suffix == "bz2" || suffix == "gz" || suffix == "xz" || suffix == "wim") {
                icon.addClass("tar_icon");
            } else if (suffix == "txt" || suffix == "log") {
                icon.addClass("txt_icon");
            } else if (suffix == "torrent") {
                icon.addClass("torrent_icon");
            } else if (suffix == "mp4" || suffix == "avi" || suffix == "mpeg" || suffix == "wmv" || suffix == "3gp" || suffix == "mkv" || suffix == "flv" || suffix == "rmvb" || suffix == "mpe" || suffix == "ogg") {
                icon.addClass("video_icon");
            } else if (suffix == "zip" || suffix == "7z") {
                icon.addClass("zip_icon");
            } else {
                icon.addClass("unknow_icon");
            }
        }
        iconContainer.append(icon);
        nameCol.append(iconContainer,mediaBody);
        fileRow.append(nameCol,sizeCol,mtimeCol);
        cacheArray.push(fileRow);
    }
    entryContainer.append(cacheArray);
    //bind event function to element
    entryContainer.on({
        contextmenu: entryContainerRightClickHandler
    })
    entryContainer.find(".folder_row").on({
        dblclick: folderRowDblClickHandler
    });
    entryContainer.find(".entry_row").on({
        click: entryRowClickHandler,
        contextmenu: entryContainerRightClickHandler
    });
}
function createBreadCrumb(addedDirName = "") {
    var breadCrumbRow = $(".breadcrumb_row")
    var col = breadCrumbRow.find(".col-12");
    //only append
    if(addedDirName != ""){
        var separator = $("<span class='bc_separator'></span>").text(SEPARATORSYMBOL);
        var pathSpan = $("<span class='bc_path' id='bc_path" + ++_PATHID + "'></span>").text(addedDirName).one("click",breadCrumbClickHandler);
        col.append(separator,pathSpan);
    }
    //rewriting
    else{
        var cacheArray = new Array();
        var breadCrumbElements = breadCrumbRow.find("span");
        if(breadCrumbElements){
            breadCrumbElements.remove();
        }
        var rootPath = $("<span class='bc_path' id='bc_path0'></span>").text("Root").one("click",breadCrumbClickHandler);;
        cacheArray.push(rootPath);
        if(CURRENTPATH != "/"){
            var pathArray = CURRENTPATH.slice(1, CURRENTPATH.length - 1).split("/");
            for (var i = 0; i < pathArray.length; i++) {
                var separator = $("<span class='bc_separator'></span>").text(SEPARATORSYMBOL);
                var pathSpan = $("<span class='bc_path' id='bc_path" + (i + 1) + "'></span>").text(pathArray[i]);
                if(i != pathArray.length - 1){
                    pathSpan.one("click",breadCrumbClickHandler);
                }
                cacheArray.push(separator,pathSpan);
            }
        }
        col.append(cacheArray);
    }
}
// Reusable function
function jumpToDir(ev,dirName = "") {
    if(dirName === ""){
        var target = ev.currentTarget.querySelector(".media-body");
        var dirName = target.innerHTML;
    }
    path = CURRENTPATH + dirName + "/";
    draw_all(path);
}
function toStandardSize(size) {
    if (size < 1024) {
        unit = "B";
    } else if (size < 1048576) {
        size = parseInt(size / 1024);
        unit = "KB";
    } else if (size < 1073741824) {
        size = Math.round(size / 1048576 * 10) / 10;
        unit = "MB";
    } else {
        size = Math.round(size / 1073741824 * 100) / 100;
        unit = "GB";
    }
    standard_size = size.toString() + " " + unit;
    return standard_size;
}
function jumpToBCPath(ev){
    // update CURRENTPATH
    var target = ev.target;
    _PATHID = parseInt(target.id.slice(7));
    if(_PATHID == 0){
        path = "/";
    }else{
        var index = 1;
        for(var i = 0; i < _PATHID; i++){
            index = CURRENTPATH.indexOf("/",index + 1);
        }
        path = CURRENTPATH.slice(0,index + 1);
    }
    draw_all(path);
}
function selected(ev,element){
    unselected(element);
    ev.currentTarget.classList.add("selected");
}
function unselected(element){
    var preSelected = document.querySelector(element);
    if (preSelected) {
        preSelected.classList.remove("selected");
    }
}
function showEntryMenu(ev){
    ev.preventDefault();
    var entryId = ev.currentTarget.id;
    // if it is file_row,don't display open function
    var entryMenuOpen = $(".entry_menu_open");
    if(entryId.includes("file_row")){
        if(entryMenuOpen.css("display") != "none"){
            entryMenuOpen.css("display","none");
        }
    } else {
        if(entryMenuOpen.css("display") == "none"){
            entryMenuOpen.css("display","block");
        }
        // bind openEntryHandler to open element
        entryMenuOpen.off().one("click",{id: entryId},openEntryHandler);
    }
    // bind eventHandler to other entryMenuElement
    $(".entry_menu_download").off().one("click",{id: entryId},downloadEntryHandler);
    $(".entry_menu_share").off().one("click",{id: entryId},shareEntryHandler);
    $(".entry_menu_delete").off().one("click",{id: entryId},deleteEntryHandler);
    $(".entry_menu_move").off().one("click",{id: entryId},moveEntryHandler);
    $(".entry_menu_rename").off().one("click",{id: entryId},renameEntryHandler);
    // display entry menu
    $(".entry_menu").css({
        "left": ev.pageX,
        "top": ev.pageY,
        "display": "flex"
    });
}
function hideEntryMenu(ev,force){
    var entryMenu = $(".entry_menu");
    if(force == true){
        entryMenu.css("display","none");
    }
    if(!entryMenu.is(ev.target) && entryMenu.has(ev.target).length === 0){
        entryMenu.css("display","none");
    }
}
function showBlankMenu(ev){
    ev.preventDefault();
    $(".blank_menu").css({
        "left": ev.pageX,
        "top": ev.pageY,
        "display": "flex"
    });
}
function hideBlankMenu(ev,force){
    var blankMenu = $(".blank_menu");
    if(force == true){
        blankMenu.css("display","none");
    }
    if(!blankMenu.is(ev.target) && blankMenu.has(ev.target).length === 0){
        blankMenu.css("display","none");
    }
}
// event handler function
function folderRowDblClickHandler(ev) {
    jumpToDir(ev);
}
function entryRowClickHandler(ev) {
    selected(ev,".entry_container > .selected");
}
function entryContainerRightClickHandler(ev){
    ev.stopPropagation();
    unselected(".entry_container > .selected");
    if (ev.currentTarget.classList.contains("entry_container")){
        showBlankMenu(ev);
        $(document).off().one("mousedown",hideBlankMenu);
    } else {
        selected(ev,".entry_container > .selected");
        showEntryMenu(ev);
        $(document).off().one("mousedown",hideEntryMenu)
    }
}
function breadCrumbClickHandler(ev){
    jumpToBCPath(ev);
}
function openEntryHandler(ev){
    hideEntryMenu(ev,true);
    var dirName = document.querySelector("#"+ev.data.id+" .media-body").innerHTML;
    jumpToDir(ev,dirName);
}
function downloadEntryHandler(ev){
    hideEntryMenu(ev,true);
    var name = document.querySelector("#"+ev.data.id+" .media-body").innerHTML;
    var url = PARADICT["file_api_url"] + PARADICT["username"] + CURRENTPATH + name + '/';
    var modal = $(".confirm_modal");
    if(ev.data.id.includes("file_row")){
        var content = "确认下载该文件吗？";
    } else {
        var content = "确认下载该文件夹吗？";
    }
    content += "<a download href='" + url + "' class='hiden_link'></a>";
    // add content
    modal.find(".modal-title").text("确认下载");
    modal.find(".modal-body").html(content);
    modal.find(".modal-footer").html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

    modal.find(".btn-primary").off().one("click",function(){
        document.querySelector(".confirm_modal .hiden_link").click();
        modal.modal('hide');
    });
    modal.modal('show');
}
function shareEntryHandler(ev){
    hideEntryMenu(ev,true);
    var name = document.querySelector("#"+ev.data.id+" .media-body").innerHTML;
    var url = PARADICT["file_api_url"] + PARADICT["username"] + CURRENTPATH + name + '/?share=1';
    var modal = $(".confirm_modal");
    var modalTitle = modal.find(".modal-title");
    var modalPrompt = modal.find(".modal-prompt");
    var modalBody = modal.find(".modal-body");
    var modalFooter = modal.find(".modal-footer");
    // add content
    modalTitle.text("确认分享");
    modalPrompt.text("");
    modalBody.html('<div class="container"><span>有效期:</span><div class="form-check form-check-inline"><input class="form-check-input"id="radio1"type="radio"name="life"value="1" checked><label class="form-check-label"for="radio1">1小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio2"type="radio"name="life"value="6"><label class="form-check-label"for="radio2">6小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio3"type="radio"name="life"value="24"><label class="form-check-label"for="radio3">24小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio4"type="radio"name="life"value="0"><label class="form-check-label"for="radio4">永久</label></div></div>');
    modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
    var confirmButton = modalFooter.find('.btn-primary');
    confirmButton.one("click",function(){
        var life = modalBody.find("input:checked").val();
        fetch(url + '&life=' + life,{credentials: "same-origin"}).then(function(response){
            confirmButton.css("display","none");
            if (response.ok) {
                response.json().then(function(data) {
                    if (life == '0'){
                        life = "永久";
                    } else {
                        life += "小时";
                    }
                    modalPrompt.text("");
                    modalTitle.text("分享成功");
                    modalBody.html('<div class="container"><div class="media"><div class="success_icon"></div><div id="success_hint"class="text-success media-body">链接创建成功,该链接有效期为'+life+'</div></div><div class="input-group"><input type="text"class="form-control"value="'+PARADICT["share_url"]+data.sid+'/"><div class="input-group-append"><button class="btn btn-outline-primary"type="button">复制</button></div></div></div>');
                    modalBody.find(".btn-outline-primary").on("click",function(){
                        if (document.execCommand('copy')) {
                            modalBody.find(".form-control").select();
                    		document.execCommand('copy');
                    	}
                    })
                })
            } else {
                response.json().then(function(data) {
                    modalPrompt.html(error_message("链接创建错误",data));
                })
            }
        })
    });
    modal.modal('show');
}
function moveEntryHandler(ev){
    hideEntryMenu(ev,true);
    var selectedElement = $("#"+ev.data.id);
    var name = selectedElement.find(".media-body").text()
    var before_path = PARADICT['username'] + CURRENTPATH + name;
    var modal = $(".confirm_modal");
    var modalTitle = modal.find(".modal-title");
    var modalPrompt = modal.find(".modal-prompt")
    var modalBody = modal.find(".modal-body");
    var modalFooter = modal.find(".modal-footer");
    modalTitle.text("移动到");
    modalPrompt.text("");
    modalBody.text("");
    modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
    var confirmButton = modalFooter.find(".btn-primary");
    var folder_info_url = PARADICT["file_api_url"] + PARADICT["username"] + '/?folder_info=1';
    fetch(folder_info_url,{credentials: "same-origin", method: "GET"}).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                function drawSmallFolder(data,count,folderpath,insertedElement='anything'){
                    var keys = Object.keys(data);
                    var container = $('<div class="small_folder_container"></div>');
                    container.attr("id","small_folder_container" + folderpath.split('/').join('_'));
                    if(count == 0){
                        var smallFolderRowRoot = $('<div class="row small_folder_row small_folder_row_root selected"></div>');
                        smallFolderRowRoot.data("folderpath","/");
                        var media = $('<div class="media"><div class="small_folder_button"></div><div class="small_folder_icon"></div><div class="small_folder_name">根目录</div></div>');
                        smallFolderRowRoot.click(function(ev){
                            container.toggle();
                            $(this).find(".small_folder_button").toggleClass("clicked");
                            selected(ev,".confirm_modal .small_folder_container > .selected");
                        });
                        smallFolderRowRoot.contextmenu(function(ev){
                            ev.preventDefault()
                            selected(ev,".confirm_modal .small_folder_container > .selected");
                        });
                        smallFolderRowRoot.append(media);
                        containerRoot.append(smallFolderRowRoot);
                    }
                    for(var i = 0; i < keys.length; i++){
                        if(data[keys[i]] == "0"){
                            var smallFolderRow = $('<div class="row small_folder_row"></div>');
                            smallFolderRow.data("folderpath",folderpath + keys[i] + '/');
                            var media = $('<div class="media"><div class="small_folder_icon"></div><div class="small_folder_name">'+keys[i]+'</div></div>');
                            for(var k = 0; k < count + 2; k++){
                                var smallFolderBlank= $('<div class="small_folder_blank"></div>');
                                media.prepend(smallFolderBlank);
                            }
                            smallFolderRow.append(media);
                            container.append(smallFolderRow);
                        } else {
                            var smallFolderRow = $('<div class="row small_folder_row small_folder_row_expand"></div>');
                            smallFolderRow.data("folderpath",folderpath + keys[i] + '/');
                            var media = $('<div class="media"><div class="small_folder_button"></div><div class="small_folder_icon"></div><div class="small_folder_name">'+keys[i]+'</div></div>');
                            for(var k = 0; k < count + 1; k++){
                                var smallFolderBlank= $('<div class="small_folder_blank"></div>');
                                media.prepend(smallFolderBlank);
                            }
                            smallFolderRow.append(media);
                            container.append(smallFolderRow);
                        }
                    }
                    if(count == 0){
                        containerRoot.append(container);
                    }else{
                        container.insertAfter(insertedElement);
                    }
                    container.find(".small_folder_row_expand").click(function(ev){
                        var folderpath = $(ev.currentTarget).data("folderpath");
                        if($(ev.currentTarget).data("inited") != '1'){
                            var index_arr = folderpath.slice(1,-1).split('/');
                            var index = index_arr[index_arr.length-1]
                            var folderData = data[index];
                            drawSmallFolder(folderData,count+1,folderpath,ev.currentTarget);
                            $(ev.currentTarget).data("inited","1");
                        }else{
                            var childContainer = container.find("#small_folder_container"+folderpath.split('/').join('_'));
                            childContainer.toggle();
                        }
                        $(this).find(".small_folder_button").toggleClass("clicked");
                    })
                    container.find(".small_folder_row").click(function(ev){
                        selected(ev,".confirm_modal .small_folder_container > .selected");
                    })
                    container.find(".small_folder_row").contextmenu(function(ev){
                        ev.preventDefault()
                        selected(ev,".confirm_modal .small_folder_container > .selected");
                    })
                }
                var containerRoot = $('<div class="small_folder_container" id="small_folder_containerRoot"></div>');
                drawSmallFolder(data,0,'/');
                modalBody.append(containerRoot);
                confirmButton.click(function(ev){
                    var folderPath = containerRoot.find(".selected").data("folderpath").slice(0,-1);
                    var after_path = PARADICT['username'] + folderPath;
                    var bf_array = before_path.split('/');
                    var af_array = after_path.split('/');
                    var bf_last_index = bf_array.length - 1;
                    if(bf_array[bf_last_index] == af_array[bf_last_index]){
                        modalPrompt.html(error_message("不能将文件夹移动到本身或者子文件夹内"));
                    }else{
                        fetch(PARADICT["file_api_url"] + after_path + '?info=1', {credentials: "same-origin"}).then(function(response) {
                            if (response.ok) {
                                response.json().then(function(data) {
                                    let have_same = have_same_file(name,data)
                                    if(have_same === true){
                                        modalPrompt.html(error_message("该文件夹内有同名的文件或文件夹，无法移动"));
                                    } else {
                                        fetch(PARADICT["file_api_url"] + before_path + '/', {credentials: "same-origin", method: "PATCH", body: JSON.stringify({af_path: after_path}), headers: {'content-type': 'application/json'}}).then(function(response){
                                            confirmButton.css("display","none");
                                            if(response.ok){
                                                modalPrompt.text("");
                                                selectedElement.css("display","none");
                                                modalBody.html(success_message("已成功移动"));
                                            }else{
                                                response.json().then(function(data){
                                                    modalPrompt.html(error_message("服务器错误,移动失败",data));
                                                });
                                            }
                                        });
                                    }
                                })
                            } else {
                                response.json().then(function(data){
                                    modalPrompt.html(error_message("获取所选文件夹列表失败",data));
                                })
                            }
                        });
                    }
                })
            })
        } else {
            confirmButton.css("display","none");
            modalPrompt(error_message("获取文件夹列表失败",data));
        }
    })
    confirmButton.css("display","block");
    modal.modal('show');
}
function renameEntryHandler(ev){
    hideEntryMenu(ev,true);
    var namefield = document.querySelector("#"+ev.data.id+" .media-body");
    name = namefield.innerHTML
    var url = PARADICT["file_api_url"] + PARADICT["username"] + CURRENTPATH + name + '/?name=';
    var modal = $(".confirm_modal");
    var modalTitle = modal.find(".modal-title");
    var modalPrompt = modal.find(".modal-prompt");
    var modalBody = modal.find(".modal-body");
    var modalFooter = modal.find(".modal-footer");
    // add content
    modalTitle.text("重命名");
    modalPrompt.text("");
    modalBody.html('<label for="rename_input">请为其输入新名称:</label><input type="text" id="rename_input" value="'+name+'" size=35 autofocus=true>');
    modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
    var confirmButton = modalFooter.find('.btn-primary');
    var renamePromo = modalBody.find('#rename_promo');
    var rename_fail_hint = modalBody.find('#rename_fail_hint')
    renamePromo.css("display","none");
    confirmButton.off().on("click",function(){
        after_name = document.querySelector("#rename_input").value;
        if(ev.data.id.includes("file_row")){
            var re = /^[\w\u4e00-\u9fa5!@#$%,\+\-\^]{1}([ ]?[\w\u4e00-\u9fa5!@#$%,.\+\-\^])*[ ]?[\w\u4e00-\u9fa5!@#$%,\+\-\^]{1}$/;
        }else{
            var re = /^[\w\u4e00-\u9fa5!@#$%,\+\-\^]{1}([ ]?[\w\u4e00-\u9fa5!@#$%,\+\-\^])*$/;
        }
        var have_same = have_same_file(after_name,JSONDATA);
        if(re.test(after_name) && !have_same){
            url = url + after_name;
            fetch(url,{credentials: "same-origin", method: "PATCH"}).then(function(response){
                confirmButton.css("display","none");
                if(response.ok){
                    modalPrompt.text("");
                    namefield.innerHTML = after_name;
                    modalTitle.text("重命名成功");
                    modalBody.html(success_message("已成功重命名"));
                } else{
                    response.json().then(function(data){
                        modalPrompt.html(error_message("重命名失败,未知错误.",data));
                    })
                }
            })
        } else if(have_same) {
            modalPrompt.html(error_message("重命名失败,当前目录内已有同名文件夹或文件夹."));
        } else {
            modalPrompt.html(error_message("重命名失败,名称不符合规范."))
        }
    })
    modal.modal('show');
}
function deleteEntryHandler(ev){
    hideEntryMenu(ev,true);
    var name = document.querySelector("#"+ev.data.id+" .media-body").innerHTML;
    var url = PARADICT["file_api_url"] + PARADICT["username"] + CURRENTPATH + name + '/';
    var modal = $(".confirm_modal");
    if(ev.data.id.includes("file_row")){
        var format = "文件"
    } else {
        var format = "文件夹"
    }
    var modalTitle = modal.find(".modal-title");
    var modalPrompt = modal.find(".modal-prompt");
    var modalBody = modal.find(".modal-body");
    var modalFooter = modal.find(".modal-footer");
    // add content
    modalTitle.text("确认删除");
    modalPrompt.text("");
    modalBody.text("确认删除该"+format+"吗？\n一旦操作成功将无法取消");
    modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

    var confirmButton = modalFooter.find('.btn-primary');
    confirmButton.off().one("click",function(){
        fetch(url,{credentials: "same-origin", method: "DELETE"}).then(function(response){
            confirmButton.css("display","none");
            if (response.ok) {
                $("#"+ev.data.id).css("display","none");
                modalPrompt.text("");
                modalTitle.text("删除成功");
                modalBody.html(success_message("已成功删除"));
            } else {
                response.json().then(function(data) {
                    modalPrompt.html(error_message("删除失败",data))
                })
            }
        })
    });
    modal.modal('show');
}
function mouseMenuRightClickHandler(ev){
    ev.preventDefault();
    ev.stopPropagation();
}
