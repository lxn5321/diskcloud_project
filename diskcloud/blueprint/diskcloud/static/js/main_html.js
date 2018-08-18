document.querySelector("#logout_btn").addEventListener("click", function() {
    window.location.replace(PARADICT["logout_url"]);
}, false);

function createDirTable(path = CURRENTPATH, data = JSONDATA) {
    // If path != "/" and path ends with a slash, remove the slash
    var pathLength = path.length
    if ( path != "/" && path.charAt(pathLength - 1) == "/"){
        path = path.slice(0,pathLength - 1);
    }
    // if dir row or file row exist,remove
    var folderRows = document.querySelectorAll("div#entry_container > div.folder_row");
    if (folderRows) {
        for (var i = 0; i < folderRows.length; i++) {
            folderRows[i].remove();
        }
    }
    var fileRows = document.querySelectorAll("div#entry_container > div.file_row");
    if (fileRows) {
        for (var i = 0; i < fileRows.length; i++) {
            fileRows[i].remove();
        }
    }
    var entryContainer = document.querySelector("#entry_container");
    // create folder row
    for (var n = 0; n < data[path].directories.length; n++) {
        var num = n + 1;
        var folderRow = document.createElement("div");
        folderRow.classList.add("row", "folder_row","entry_row");
        folderRow.setAttribute("id", "folder_row" + num);
        var nameCol = document.createElement("div");
        nameCol.classList.add("col-7", "media", "d-flex", "align-items-center");
        // create icon for folder
        var iconContainer = document.createElement("div");
        iconContainer.classList.add("icon_container", "d-flex", "align-items-center", "justify-content-center");
        var icon = document.createElement("img");
        var mediaBody = document.createElement("div");
        mediaBody.classList.add("media-body");
        var size = document.createElement("div");
        size.classList.add("col-2", "d-flex", "align-items-center");
        var mtime = document.createElement("div");
        mtime.classList.add("col-3", "d-flex", "align-items-center");
        for (var m = 0; m < 2; m++) {
            if (m == 0) {
                icon.setAttribute("src", PARADICT["folder_icon"]);
                mediaBody.innerHTML = data[path].directories[n][m];
            } else {
                mtime.innerHTML = data[path].directories[n][m];
            }
        }
        iconContainer.appendChild(icon);
        nameCol.appendChild(iconContainer);
        nameCol.appendChild(mediaBody);
        folderRow.appendChild(nameCol);
        folderRow.appendChild(size);
        folderRow.appendChild(mtime);
        entryContainer.appendChild(folderRow);
    }
    // create file row
    for (var n = 0; n < data[path].files.length; n++) {
        num = n + 1;
        var fileRow = document.createElement("div");
        fileRow.classList.add("row", "file_row","entry_row");
        fileRow.setAttribute("id", "file_row" + num);
        var nameCol = document.createElement("div");
        nameCol.classList.add("col-7", "media", "d-flex", "align-items-center");
        // create icon for file
        var iconContainer = document.createElement("div");
        iconContainer.classList.add("icon_container", "d-flex", "align-items-center", "justify-content-center");
        var icon = document.createElement("img");
        var mediaBody = document.createElement("div");
        mediaBody.classList.add("media-body");
        var size = document.createElement("div");
        size.classList.add("col-2", "d-flex", "align-items-center");
        var mtime = document.createElement("div");
        mtime.classList.add("col-3", "d-flex", "align-items-center");
        for (var m = 0; m < 3; m++) {
            if (m == 0) {
                var fileName = data[path].files[n][m];
                var index = fileName.lastIndexOf(".");
                // Add the specified icon by file format
                if (index == -1) {
                    icon.setAttribute("src", PARADICT["unknow_icon"]);
                } else {
                    var suffix = fileName.slice(index + 1).toLowerCase();
                    if (suffix == "apk") {
                        icon.setAttribute("src", PARADICT["apk_icon"]);
                    } else if (suffix == "json" || suffix == "xml" || suffix == "py" || suffix == "java" || suffix == "bat" || suffix == "c" || suffix == "cpp" || suffix == "sh") {
                        icon.setAttribute("src", PARADICT["code_icon"]);
                    } else if (suffix == "doc" || suffix == "docx") {
                        icon.setAttribute("src", PARADICT["doc_icon"]);
                    } else if (suffix == "exe") {
                        icon.setAttribute("src", PARADICT["exe_icon"]);
                    } else if (suffix == "png" || suffix == "jpg" || suffix == "jpeg" || suffix == "git" || suffix == "ico" || suffix == "bmp") {
                        icon.setAttribute("src", PARADICT["image_icon"]);
                    } else if (suffix == "wav" || suffix == "ape" || suffix == "flac" || suffix == "wma" || suffix == "mp3" || suffix == "aac") {
                        icon.setAttribute("src", PARADICT["music_icon"]);
                    } else if (suffix == "pdf") {
                        icon.setAttribute("src", PARADICT["pdf_icon"]);
                    } else if (suffix == "tar" || suffix == "bz2" || suffix == "gz" || suffix == "xz" || suffix == "wim") {
                        icon.setAttribute("src", PARADICT["tar_icon"]);
                    } else if (suffix == "txt" || suffix == "log") {
                        icon.setAttribute("src", PARADICT["txt_icon"]);
                    } else if (suffix == "torrent") {
                        icon.setAttribute("src", PARADICT["torrent_icon"]);
                    } else if (suffix == "mp4" || suffix == "avi" || suffix == "mpeg" || suffix == "wmv" || suffix == "3gp" || suffix == "mkv" || suffix == "flv" || suffix == "rmvb" || suffix == "mpe" || suffix == "ogg") {
                        icon.setAttribute("src", PARADICT["video_icon"]);
                    } else if (suffix == "zip" || suffix == "7z") {
                        icon.setAttribute("src", PARADICT["zip_icon"]);
                    } else {
                        icon.setAttribute("src", PARADICT["unknow_icon"]);
                    }
                }
                mediaBody.innerHTML = fileName;
            } else if (m == 1) {
                mtime.innerHTML = data[path].files[n][m];
            } else {
                file_size = parseInt(data[path].files[n][m]);
                size.innerHTML = toStandardSize(file_size);
            }
        }
        iconContainer.appendChild(icon);
        nameCol.appendChild(iconContainer);
        nameCol.appendChild(mediaBody);
        fileRow.appendChild(nameCol);
        fileRow.appendChild(size);
        fileRow.appendChild(mtime);
        entryContainer.appendChild(fileRow);
    }
    //bind event function to element
    $("#entry_container > .folder_row").on({
        dblclick: folderRowDblClickHandler
    });
    $("#entry_container > .entry_row").on({
        click: entryRowClickHandler,
        contextmenu: entryRowRightClickHandler
    });
    $("#entry_container").on({
        contextmenu: blankAreaRightClickHandler
    })
}

function createBreadCrumb(dirName = "") {
    var col = document.querySelector("#breadcrumb_row > .col-12");
    if (dirName != "") {
        var separator = document.createElement("span");
        separator.classList.add("bc_separator");
        separator.innerHTML = SEPARATORSYMBOL;
        col.appendChild(separator);
        var path = document.createElement("span");
        path.classList.add("bc_path");
        _PATHID++;
        path.setAttribute("id","bc_path" + _PATHID);
        path.innerHTML = dirName;
        col.appendChild(path);
    } else {
        var breadCrumbElements = document.querySelectorAll("#breadcrumb_row span[class^='bc']");
        if (breadCrumbElements) {
            for (var i = 0; i < breadCrumbElements.length; i++) {
                breadCrumbElements[i].remove();
            }
        }
        var path = document.createElement("span");
        path.classList.add("bc_path");
        path.innerHTML = "Root";
        path.setAttribute("id","bc_path0");
        col.appendChild(path);
        if (CURRENTPATH != "/"){
            var pathArray = CURRENTPATH.slice(1, CURRENTPATH.length - 1).split("/");
            var pathId = 1;
            for (var i = 0; i < pathArray.length; i++) {
                var separator = document.createElement("span");
                separator.classList.add("bc_separator");
                separator.innerHTML = SEPARATORSYMBOL;
                col.appendChild(separator);
                var path = document.createElement("span");
                path.classList.add("bc_path");
                path.setAttribute("id","bc_path" + pathId);
                pathId++;
                path.innerHTML = pathArray[i];
                col.appendChild(path);
            }
        }
    }
    //bind event function to bc_paths
    var bcPaths = document.querySelectorAll("#breadcrumb_row .bc_path");
    var bcPathsLength = bcPaths.length;
    if (bcPathsLength == 1){
        bcPaths[0].addEventListener("click",jumpToBCPath);
    }else{
        for(var i = 0; i < bcPathsLength - 1; i++){
            bcPaths[i].addEventListener("click",jumpToBCPath);
        }
    }
}

function folderRowDblClickHandler(ev) {
    var dirName = jumpToDir(ev);
    createBreadCrumb(dirName);
}

function entryRowClickHandler(ev) {
    selected(ev);
}

function entryRowRightClickHandler(ev){
    ev.stopPropagation();
    selected(ev);
    showEntryMenu(ev);
    $(document).on("mousedown",hideEntryMenu);
}

function blankAreaRightClickHandler(ev){
    ev.stopPropagation();
    showBlankMenu(ev);
    $(document).on("mousedown",hideBlankMenu);
}

function jumpToDir(ev) {
    var target = ev.currentTarget.querySelector("div.media-body");
    var dirName = target.innerHTML;
    CURRENTPATH = CURRENTPATH + dirName + '/';
    createDirTable(CURRENTPATH, JSONDATA);
    return dirName;
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
    $("#entry_menu").css({
        "left": ev.pageX,
        "top": ev.pageY,
        "display": "flex"
    });
    ev.preventDefault();
}

function hideEntryMenu(ev){
    $("#entry_menu").css("display","none");
    $(document).off("mousedown",hideEntryMenu);
}

function showBlankMenu(ev){
    $("#blank_menu").css({
        "left": ev.pageX,
        "top": ev.pageY,
        "display": "flex"
    });
    ev.preventDefault();
}

function hideBlankMenu(ev){
    $("#blank_menu").css("display","none");
    $(document).off("mousedown",hideBlankMenu);
}
