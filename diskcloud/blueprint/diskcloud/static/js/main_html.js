var CURRENTPATH = null;
var JSONDATA = null;
var SEPARATORSYMBOL = ">";
var _PATHID = 0;

// init all
init_all()

function init_all(){
    get_json('/');
    document.querySelector(".logout_btn").addEventListener("click",function(){
        window.location.replace(PARADICT["logout_url"]);
    });
    $(".mouse_menu").on({
        contextmenu: mouseMenuRightClickHandler
    });
}

function get_json(path){
    fetch(PARADICT["json_url"] + PARADICT["username"] + path, {credentials: "same-origin"}).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                CURRENTPATH = path;
                JSONDATA = data;
                createDirTable();
                createBreadCrumb();
            })
        } else {
            // pass
        }
    });
}

function createDirTable(path = CURRENTPATH, data = JSONDATA) {
    var entryContainer = $(".entry_container");
    var entryRow = entryContainer.find(".entry_row");
    var cacheArray = new Array();
    var pathLength = path.length
    // If path != "/" and path ends with a slash, remove the slash
    if ( path != "/" && path.charAt(pathLength - 1) == "/"){
        path = path.slice(0,pathLength - 1);
    }
    // if dir row or file row exist,remove
    if(entryRow){
        entryRow.remove();
    }
    // create folder row
    for (var n = 0; n < data.directories.length; n++) {
        var folderRow = $("<div class='row folder_row entry_row' id='folder_row" + (n + 1) + "'></div>");
        var nameCol = $("<div class='col-7 media d-flex align-items-center'></div>");
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
        var nameCol = $("<div class='col-7 media d-flex align-items-center'></div>");
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
        var path = $("<span class='bc_path' id='bc_path" + ++_PATHID + "'></span>").text(addedDirName).one("click",breadCrumbClickHandler);
        col.append(separator,path);
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
                var path = $("<span class='bc_path' id='bc_path" + (i + 1) + "'></span>").text(pathArray[i]);
                if(i != pathArray.length - 1){
                    path.one("click",breadCrumbClickHandler);
                }
                cacheArray.push(separator,path);
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
    get_json(path);
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
    get_json(path);
}
function selected(ev){
    var preSelected = document.querySelector(".entry_container > div[class~='selected']");
    if (preSelected) {
        preSelected.classList.remove("selected");
    }
    ev.currentTarget.classList.add("selected");
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
    selected(ev);
}
function entryContainerRightClickHandler(ev){
    ev.stopPropagation();
    if (ev.currentTarget.className == "entry_container"){
        showBlankMenu(ev);
        $(document).off().one("mousedown",hideBlankMenu);
    } else {
        selected(ev);
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
    var path = PARADICT["file_url"] + PARADICT["username"] + CURRENTPATH + name + '/';
    var modal = $(".confirm_modal");
    if(ev.data.id.includes("file_row")){
        var content = "确认下载该文件吗？";
    } else {
        var content = "确认下载该文件夹吗？";
    }
    content += "<a download href='" + path + "' class='hiden_link'></a>";
    // add content
    modal.find(".modal-title").text("确认下载");
    modal.find(".modal-body").html(content);
    modal.find(".modal-footer").html('<button type="button" class="btn btn-primary">下载</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

    modal.find(".btn-primary").off().one("click",function(){
        document.querySelector(".confirm_modal .hiden_link").click();
        modal.modal('hide');
    });
    modal.modal('show');
}
function shareEntryHandler(ev){
    hideEntryMenu(ev,true);
    var name = document.querySelector("#"+ev.data.id+" .media-body").innerHTML;
    var path = PARADICT["generate_url"] + PARADICT["username"] + CURRENTPATH + name + '/';
    var modal = $(".confirm_modal");
    var modalTitle = modal.find(".modal-title");
    var modalBody = modal.find(".modal-body");
    // add content
    modalTitle.text("确认分享");
    modalBody.html('<div class="container"><span>有效期:</span><div class="form-check form-check-inline"><input class="form-check-input"id="radio1"type="radio"name="life"value="1" checked><label class="form-check-label"for="radio1">1小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio2"type="radio"name="life"value="6"><label class="form-check-label"for="radio2">6小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio3"type="radio"name="life"value="24"><label class="form-check-label"for="radio3">24小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio4"type="radio"name="life"value="0"><label class="form-check-label"for="radio4">永久</label></div></div>');
    modal.find(".modal-footer").html('<button type="button" class="btn btn-primary">分享</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
    var confirmButton = modal.find('.modal-footer .btn-primary');
    confirmButton.one("click",function(){
        var life = modalBody.find("input:checked").val();
        fetch(path + '?life=' + life,{credentials: "same-origin"}).then(function(response){
            if (response.ok) {
                confirmButton.css("display","none");
                response.json().then(function(data) {
                    if (life == '0'){
                        life = "永久";
                    } else {
                        life += "小时";
                    }
                    modalTitle.text("分享成功");
                    modalBody.html('<div class="container"><div class="media d-flex align-items-center justify-content-center"><div class="checked_icon"></div><div id="success_hint"class="text-success media-body">链接创建成功,该链接有效期为'+life+'</div></div><div class="input-group"><input type="text"class="form-control"value='+PARADICT["share_url"]+data.sid+'><div class="input-group-append"><button class="btn btn-outline-primary"type="button">复制</button></div></div></div>');
                    modalBody.find(".btn-outline-primary").on("click",function(){
                        if (document.execCommand('copy')) {
                            modalBody.find(".form-control").select();
                    		document.execCommand('copy');
                    	}
                    })
                })
            } else {
                response.json().then(function(data) {
                    modalBody.html('<div class="media d-flex align-items-center justify-content-center"><div class="error_icon"></div><div id="fail_hint" class="text-danger media-body">链接创建错误,' + data.err_mes + '</div></div>');
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
