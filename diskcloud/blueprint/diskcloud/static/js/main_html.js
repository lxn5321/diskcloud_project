function createDirTable(path = CURRENTPATH, data = JSONDATA) {
    // If path != "/" and path ends with a slash, remove the slash
    var pathLength = path.length
    if ( path != "/" && path.charAt(pathLength - 1) == "/"){
        path = path.slice(0,pathLength - 1);
    }
    // if dir row or file row exist,remove
    var entryRow = $("#entry_container > .entry_row");
    if(entryRow){
        entryRow.remove();
    }

    var entryContainer = $("#entry_container");
    // create folder row
    for (var n = 0; n < data[path].directories.length; n++) {
        var folderRow = $("<div class='row folder_row entry_row' id='folder_row" + (n + 1) + "'></div>");
        var nameCol = $("<div class='col-7 media d-flex align-items-center'></div>");
        var iconContainer = $("<div class='icon_container d-flex align-items-center justify-content-center'></div>");
        var icon = $("<div class='folder_icon'></div>");
        var mediaBody = $("<div class='media-body'></div>").text(data[path].directories[n][0]);
        var sizeCol = $("<div class='col-2 d-flex align-items-center'></div>");
        var mtimeCol = $("<div class='col-3 d-flex align-items-center'></div>").text(data[path].directories[n][1]);
        iconContainer.append(icon);
        nameCol.append(iconContainer,mediaBody);
        folderRow.append(nameCol,sizeCol,mtimeCol);
        entryContainer.append(folderRow);
    }
    // create file row
    for (var n = 0; n < data[path].files.length; n++) {
        var fileName = data[path].files[n][0];
        var fileRow = $("<div class='row file_row entry_row' id='file_row" + (n + 1) + "'></div>");
        var nameCol = $("<div class='col-7 media d-flex align-items-center'></div>");
        var iconContainer = $("<div class='icon_container d-flex align-items-center justify-content-center'></div>");
        var icon = $("<div></div>");
        var mediaBody = $("<div class='media-body'></div>").text(fileName);
        var sizeCol = $("<div class='col-2 d-flex align-items-center'></div>").text(data[path].files[n][2]);
        var mtimeCol = $("<div class='col-3 d-flex align-items-center'></div>").text(data[path].files[n][1]);
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
            } else if (suffix == "png" || suffix == "jpg" || suffix == "jpeg" || suffix == "git" || suffix == "ico" || suffix == "bmp") {
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
        entryContainer.append(fileRow);
    }
    //bind event function to element
    $("#entry_container > .folder_row").on({
        dblclick: folderRowDblClickHandler
    });
    $("#entry_container > .entry_row").on({
        click: entryRowClickHandler,
        contextmenu: entryContainerRightClickHandler
    });
    $("#entry_container").on({
        contextmenu: entryContainerRightClickHandler
    })
}

function createBreadCrumb(addedDirName = "") {
    var col = $('#breadcrumb_row > .col-12');
    //only append
    if(addedDirName != ""){
        var separator = $("<span class='bc_separator'></span>").text(SEPARATORSYMBOL);
        var path = $("<span class='bc_path' id='bc_path" + ++_PATHID + "'></span>").text(addedDirName);
        col.append(separator,path);
    }
    //rewriting
    else{
        var breadCrumbElements = $("#breadcrumb_row span[class^='bc']");
        if(breadCrumbElements){
            breadCrumbElements.remove();
        }
        var rootPath = $("<span class='bc_path' id='bc_path0'></span>").text("Root");
        col.append(rootPath);
        if(CURRENTPATH != "/"){
            var pathArray = CURRENTPATH.slice(1, CURRENTPATH.length - 1).split("/");
            for (var i = 0; i < pathArray.length; i++) {
                var separator = $("<span class='bc_separator'></span>").text(SEPARATORSYMBOL);
                var path = $("<span class='bc_path' id='bc_path" + (i + 1) + "'></span>").text(pathArray[i]);
                col.append(separator,path);
            }
        }
    }
    //bind event function to bc_paths
    var bcPaths = document.querySelectorAll("#breadcrumb_row .bc_path");
    if (bcPaths.length == 1){
        bcPaths[0].addEventListener("click",breadCrumbClickHandler,{once:true});
    }else{
        for(var i = 0; i < bcPaths.length - 1; i++){
            bcPaths[i].addEventListener("click",breadCrumbClickHandler,{once:true});
        }
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
    if(ev.currentTarget == document.querySelector("#entry_container")){
        showBlankMenu(ev);
        document.addEventListener("mousedown",hideBlankMenu);
    }else{
        selected(ev);
        showEntryMenu(ev);
        document.addEventListener("mousedown",hideEntryMenu)
    }
}
function breadCrumbClickHandler(ev){
    jumpToBCPath(ev);
}
function openEntryHandler(ev){
    var dirName = $("#" + ev.data.id).find(".media-body").text();
    jumpToDir(ev,dirName);
    hideEntryMenu(ev,true);
}
// Reusable function
function jumpToDir(ev,dirName = "") {
    if(dirName === ""){
        var target = ev.currentTarget.querySelector("div.media-body");
        var dirName = target.innerHTML;
    }
    CURRENTPATH = CURRENTPATH + dirName + "/";
    createDirTable();
    createBreadCrumb(dirName);
}
function toStandardSize(size) {
    if (size < 1024) {
        unit = "B";
    } else if (size < 1048576) {
        size = parseInt(size / 1024);
        unit = "KB";
    } else if (size < 1073741824) {
        size = parseInt(size / 1048576);
        unit = "MB";
    } else {
        size = parseInt(size / 1073741824);
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
        CURRENTPATH = "/";
    }else{
        var index = 1;
        for(var i = 0; i < _PATHID; i++){
            index = CURRENTPATH.indexOf("/",index + 1);
        }
        CURRENTPATH = CURRENTPATH.slice(0,index + 1);
    }
    createDirTable();
    createBreadCrumb();
}
function selected(ev){
    var preSelected = document.querySelector("#entry_container > div[class~='selected']");
    if (preSelected) {
        preSelected.classList.remove("selected");
    }
    ev.currentTarget.classList.add("selected");
}
function showEntryMenu(ev){
    ev.preventDefault();
    var operatObjId = ev.currentTarget.id;
    var entryMenuOpen = $("#entry_menu_open");
    if(ev.currentTarget == document.querySelector("#entry_container > .file_row")){
        if(entryMenuOpen.css("display") != "none"){
            entryMenuOpen.css("display","none");
        }
    } else {
        if(entryMenuOpen.css("display") == "none"){
            entryMenuOpen.css("display","block");
        }
        // bind openEntryHandler to open element
        $("#entry_menu_open").one("click",{id : operatObjId},openEntryHandler);
    }
    $("#entry_menu").css({
        "left": ev.pageX,
        "top": ev.pageY,
        "display": "flex"
    });
    // bind eventHandler to other entryMenuElement
}
function hideEntryMenu(ev,force){
    if(force == true){
        $("#entry_menu").css("display","none");
    }
    var notHideArea = $("#entry_menu");
    if(!notHideArea.is(ev.target) && notHideArea.has(ev.target).length === 0){
        $("#entry_menu").css("display","none");
    }
}
function showBlankMenu(ev){
    $("#blank_menu").css({
        "left": ev.pageX,
        "top": ev.pageY,
        "display": "flex"
    });
    ev.preventDefault();
}
function hideBlankMenu(ev,force){
    if(force == true){
        $("#blank_menu").css("display","none");
    }
    var notHideArea = $("#blank_menu");
    if(!notHideArea.is(ev.target) && notHideArea.has(ev.target).length === 0){
        $("#blank_menu").css("display","none");
    }
}
