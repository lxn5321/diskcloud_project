"use strict"

const SEPARATORSYMBOL = ">";
let _PATHID = 0;
let CURRENTPATH = null;
let JSONDATA = null;
let W, H;

window.onresize = function(ev) {
  resize();
}

function init_all() {
  draw_all('.');
  resize();

  $(".confirm_modal").on('shown.bs.modal', function() {
    $('#name_input').focus();
  });
  document.querySelector("#logout_btn").addEventListener("click", () => {
    document.cookie = 'login_id=;max-age=0;domian=diskcloud.ga;path=/diskcloud/;SameSite=Lax;'
    window.location.replace(PARADICT["logout_url"]);
  });
  document.querySelector(".whole-container").addEventListener("click", wholeContainerClickHandler);
  document.querySelector(".whole-container").addEventListener("contextmenu", wholeContainerRightClickHandler);
  document.querySelector(".sidebar").addEventListener("click", sidebarClickHandler);
  document.querySelector(".right-container").addEventListener("click", rightContainerClickHandler);
  document.querySelector(".right-container").addEventListener("dblclick", rightContainerDbClickHandler);
  document.querySelector(".right-container").addEventListener("contextmenu", rightContainerRightClickHandler);
  document.querySelector(".menu").addEventListener("click", menuClickHandler);
  document.querySelector(".menu").addEventListener("contextmenu", mouseMenuRightClickHandler);
  document.querySelector("#search-btn").addEventListener("click", searchBtnClickHandler);
  document.querySelector(".modal").addEventListener("contextmenu", modalRightClickHandler);
}

function resize() {
  W = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  H = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  let height = H - 53;
  $(".main-container").css("height", height);
}

function draw_all(path = CURRENTPATH, selected_name = '') {
  CURRENTPATH = path;
  function exec_func(data) {
    JSONDATA = data;
    createTable();
    createBreadCrumb();

    if(selected_name !== ''){
      let entryRows = document.querySelectorAll('.right-container .entry-row');
      let selectedElem;
      for(let i = 0; i < entryRows.length; i++){
        if(entryRows[i].querySelector('.content').innerText === selected_name){
          selectedElem = entryRows[i];
          break;
        }
      }
      select(selectedElem, '.right-container');
    }
  }
  get_json(path, exec_func);
}

function get_json(path, exec_func = null) {
  let url;
  if (path === 'star') {
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + "?star_info=1";
  } else if (path === 'share') {
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + "?share_info=1";
  } else if (path === 'trash_can') {
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + "?trash_can_info=1";
  } else if (path === 'search'){
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + "?search_info=1&search_text=" + document.querySelector('#search-input').value;
  } else {
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + "?info=1";
  }
  fetch(url, {credentials: "same-origin"})
    .then(function(response) {
      if (response.ok) {
        response.json().then(function(data) {
          if (exec_func != null) {
            exec_func(data)
          }
        })
      } else {
        // need to develop
        alert('获取数据失败')
      }
    });
}

function get_path_from_json(data = JSONDATA){
  let entry = document.querySelector(".right-container .selected");
  let path;
  let index = parseInt(entry.id.slice(-1), 10);
  if(entry.id.slice(0, -1) === 'folder-row'){
    if(CURRENTPATH === 'star'){
      path = data.directories[index][2];
    }else if(CURRENTPATH === 'share'){
      path = data.directories[index][4];
    }else{
      path = data.directories[index][3];
    }
  }else{
    if(CURRENTPATH === 'star'){
      path = data.files[index][3];
    }else{
      path = data.files[index][4];
    }
  }
  if(path !== '.'){
    path = './' + path;
  }
  return path;
}

function is_expire(time_str){
  let date = new Date('20' + time_str.slice(0, 2), parseInt(time_str.slice(2, 4)) - 1, time_str.slice(4, 6), time_str.slice(6, 8), time_str.slice(8, 10), time_str.slice(10, 12))
  let now_date = new Date()

  if(date.getTime() <= now_date.getTime()){
    return true
  }else{
    return false
  }
}

function strptime(time_str, is_expire_time = false) {
  let time;
  if(time_str === 'permanent'){
    time = '永久';
  }else{
    let year = '20' + time_str.slice(0, 2);
    let month = time_str.slice(2, 4);
    let day = time_str.slice(4, 6);
    let hour = time_str.slice(6, 8);
    let minute = time_str.slice(8, 10);
    let second = time_str.slice(10, 12);

    if(is_expire_time === true && is_expire(time_str)){
      time = '已过期';
    }else{
      time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    }
  }
  return time;
}

function parse_suffix(element, filename){
  // add icon by file name suffix
  let index = filename.lastIndexOf(".");
  let suffix = filename.slice(index + 1).toLowerCase();
  if (index === -1) {
    element.addClass("unknow_icon");
  } else {
    if (suffix === "apk") {
      element.addClass("apk_icon");
    } else if (suffix === "json" || suffix === "xml" || suffix === "py" || suffix === "java" || suffix === "bat" || suffix === "c" || suffix === "cpp" || suffix === "sh") {
      element.addClass("code_icon");
    } else if (suffix === "doc" || suffix === "docx") {
      element.addClass("doc_icon");
    } else if (suffix === "exe") {
      element.addClass("exe_icon");
    } else if (suffix === "png" || suffix === "jpg" || suffix === "jpeg" || suffix === "gif" || suffix === "ico" || suffix === "bmp") {
      element.addClass("image_icon");
    } else if (suffix === "wav" || suffix === "ape" || suffix === "flac" || suffix === "wma" || suffix === "mp3" || suffix === "aac") {
      element.addClass("music_icon");
    } else if (suffix === "pdf") {
      element.addClass("pdf_icon");
    } else if (suffix === "tar" || suffix === "bz2" || suffix === "gz" || suffix === "xz" || suffix === "wim") {
      element.addClass("tar_icon");
    } else if (suffix === "txt" || suffix === "log" || suffix === "md") {
      element.addClass("txt_icon");
    } else if (suffix === "torrent") {
      element.addClass("torrent_icon");
    } else if (suffix === "mp4" || suffix === "avi" || suffix === "mpeg" || suffix === "wmv" || suffix === "3gp" || suffix === "mkv" || suffix === "flv" || suffix === "rmvb" || suffix === "mpe" || suffix === "ogg") {
      element.addClass("video_icon");
    } else if (suffix === "zip" || suffix === "7z") {
      element.addClass("zip_icon");
    } else {
      element.addClass("unknow_icon");
    }
  }
}
function have_same_file(name, jsondata = JSONDATA) {
  let have_same = false;
  for (let n = 0; n < jsondata.directories.length; n++) {
    if (name === jsondata.directories[n][0]) {
      have_same = true;
      break;
    }
  }
  if (have_same === false) {
    for (let n = 0; n < jsondata.files.length; n++) {
      if (name === jsondata.files[n][0]) {
        have_same = true;
        break
      }
    }
  }
  return have_same;
}

function contain(selector1, element) {
  let elements = document.querySelectorAll(selector1);
  let result = false;
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].contains(element)) {
      result = elements[i];
    }
  }
  return result;
}

function success_message(mes) {
  return '<div class="hint-container"><div class="success_icon"></div><div id="success_hint" class="text-success content">' + mes + '</div></div>'
}

function error_message(mes, promt = true, jsondata = null) {
  let message;
  if (jsondata === null) {
    message = mes;
  } else {
    message = mes + jsondata.err_mes;
  }
  if (promt === true) {
    return '<div class="promt-container"><div class="error_icon"></div><div id="fail_hint" class=" text-danger content">' + message + '</div></div>';
  } else {
    return '<div class="hint-container"><div class="error_icon"></div><div id="fail_hint" class="text-danger content">' + message + '</div></div>';
  }
}

function createTable(data = JSONDATA) {
  let entryContainer = $(".entry-container");
  let entryRow = entryContainer.find(".entry-row");
  let cacheArray = new Array();
  // change title row
  let titleCol2 = $("#title-col-2");
  let titleCol3 = $("#title-col-3");
  if (CURRENTPATH === 'star') {
    titleCol2.text("大小");
    titleCol3.text("收藏日期");
  } else if (CURRENTPATH === 'trash_can'){
    titleCol2.text("大小");
    titleCol3.text("删除日期");
  } else if (CURRENTPATH === 'share') {
    titleCol2.text("分享日期");
    titleCol3.text("过期日期");
  }else{
    titleCol2.text("大小");
    titleCol3.text("修改日期");
  }
  // if dir row or file row exist,remove
  if (entryRow) {
    entryRow.remove();
  }
  // create folder row
  if(CURRENTPATH === 'star'){
    for (let n = 0; n < data.directories.length; n++) {
      let folderRow = $("<div class='folder-row entry-row' id='folder-row" + n + "'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div class='folder_icon'></div>");
      let content = $("<div class='content'></div>").text(data.directories[n][0]);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let sizeCol = $("<div class='col-2 size-col'></div>");
      let starTimeCol = $("<div class='col-2 star_time-col'></div>").text(strptime(data.directories[n][1]));
      iconContainer.append(icon);
      nameCol.append(iconContainer, content, starIcon);
      folderRow.append(nameCol, sizeCol, starTimeCol);
      cacheArray.push(folderRow);
    }
    // create file row
    for (let n = 0; n < data.files.length; n++) {
      let fileName = data.files[n][0];
      let fileRow = $("<div class='file-row entry-row' id='file-row" + n + "'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div></div>");
      let content = $("<div class='content'></div>").text(fileName);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let sizeCol = $("<div class='col-2 size-col'></div>").text(toStandardSize(data.files[n][2]));
      let starTimeCol = $("<div class='col-2 star_time-col'></div>").text(strptime(data.files[n][1]));
      parse_suffix(icon, fileName);
      iconContainer.append(icon);
      nameCol.append(iconContainer, content, starIcon);
      fileRow.append(nameCol, sizeCol, starTimeCol);
      cacheArray.push(fileRow);
    }
  }else if(CURRENTPATH === 'share'){
    for (let n = 0; n < data.directories.length; n++) {
      let folderRow = $("<div class='folder-row entry-row' id='folder-row" + n + "'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div class='folder_icon'></div>");
      let content = $("<div class='content'></div>").text(data.directories[n][0]);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let shareTimeCol = $("<div class='col-2 share_time-col'></div>").text(strptime(data.directories[n][1]));
      let expireTimeCol = $("<div class='col-2 expire_time-col'></div>").text(strptime(data.directories[n][2], true));
      iconContainer.append(icon);
      if(data.directories[n][3] === 1){
        nameCol.append(iconContainer, content, starIcon);
      }else{
        nameCol.append(iconContainer, content);
      }
      folderRow.append(nameCol, shareTimeCol, expireTimeCol);
      cacheArray.push(folderRow);
    }
    // create file row
    for (let n = 0; n < data.files.length; n++) {
      let fileName = data.files[n][0];
      let fileRow = $("<div class='file-row entry-row' id='file-row" + n + "'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div></div>");
      let content = $("<div class='content'></div>").text(fileName);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let shareTimeCol = $("<div class='col-2 share_time-col'></div>").text(strptime(data.files[n][1]));
      let expireTimeCol = $("<div class='col-2 expire_time-col'></div>").text(strptime(data.files[n][2], true));
      parse_suffix(icon, fileName);
      iconContainer.append(icon);
      if(data.files[n][3] === 1){
        nameCol.append(iconContainer, content, starIcon);
      }else{
        nameCol.append(iconContainer, content);
      }
      fileRow.append(nameCol, shareTimeCol, expireTimeCol);
      cacheArray.push(fileRow);
    }
  }else if(CURRENTPATH === 'trash_can'){
    for (let n = 0; n < data.directories.length; n++) {
      let folderRow = $("<div class='folder-row entry-row' id='folder-row" + n + "'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div class='folder_icon'></div>");
      let content = $("<div class='content'></div>").text(data.directories[n][0]);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let sizeCol = $("<div class='col-2 size-col'></div>");
      let TrashCanTimeCol = $("<div class='col-2 trash_can_time-col'></div>").text(strptime(data.directories[n][1]));
      iconContainer.append(icon);
      if(data.directories[n][2] === 1){
        nameCol.append(iconContainer, content, starIcon);
      }else{
        nameCol.append(iconContainer, content);
      }
      folderRow.append(nameCol, sizeCol, TrashCanTimeCol);
      cacheArray.push(folderRow);
    }
    // create file row
    for (let n = 0; n < data.files.length; n++) {
      let fileName = data.files[n][0];
      let fileRow = $("<div class='file-row entry-row' id='file-row" + n + "'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div></div>");
      let content = $("<div class='content'></div>").text(fileName);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let sizeCol = $("<div class='col-2 size-col'></div>").text(toStandardSize(data.files[n][3]));
      let TrashCanTimeCol = $("<div class='col-2 trash_can_time-col'></div>").text(strptime(data.files[n][1]));
      parse_suffix(icon, fileName);
      iconContainer.append(icon);
      if(data.files[n][2] === 1){
        nameCol.append(iconContainer, content, starIcon);
      }else{
        nameCol.append(iconContainer, content);
      }
      fileRow.append(nameCol, sizeCol, TrashCanTimeCol);
      cacheArray.push(fileRow);
    }
  }else if(CURRENTPATH === 'search'){
    for (let n = 0; n < data.directories.length; n++) {
      let folderRow = $("<div class='folder-row entry-row' id='folder-row" + n + "'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div class='folder_icon'></div>");
      let content = $("<div class='content'></div>").text(data.directories[n][0]);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let sizeCol = $("<div class='col-2 size-col'></div>");
      let mtimeCol = $("<div class='col-2 mtime-col'></div>").text(strptime(data.directories[n][1]));
      iconContainer.append(icon);
      if(data.directories[n][2] === 1){
        nameCol.append(iconContainer, content, starIcon);
      }else{
        nameCol.append(iconContainer, content);
      }
      folderRow.append(nameCol, sizeCol, mtimeCol);
      cacheArray.push(folderRow);
    }
    // create file row
    for (let n = 0; n < data.files.length; n++) {
      let fileName = data.files[n][0];
      let fileRow = $("<div class='file-row entry-row' id='file-row" + n + "'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div></div>");
      let content = $("<div class='content'></div>").text(fileName);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let sizeCol = $("<div class='col-2 size-col'></div>").text(toStandardSize(data.files[n][3]));
      let mtimeCol = $("<div class='col-2 mtime-col'></div>").text(strptime(data.files[n][1]));
      parse_suffix(icon, fileName);
      iconContainer.append(icon);
      if(data.files[n][2] === 1){
        nameCol.append(iconContainer, content, starIcon);
      }else{
        nameCol.append(iconContainer, content);
      }
      fileRow.append(nameCol, sizeCol, mtimeCol);
      cacheArray.push(fileRow);
    }
  }else{
    for (let n = 0; n < data.directories.length; n++) {
      let folderRow = $("<div class='folder-row entry-row'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div class='folder_icon'></div>");
      let content = $("<div class='content'></div>").text(data.directories[n][0]);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let sizeCol = $("<div class='col-2 size-col'></div>");
      let mtimeCol = $("<div class='col-2 mtime-col'></div>").text(strptime(data.directories[n][1]));
      iconContainer.append(icon);
      if(data.directories[n][2] === 1){
        nameCol.append(iconContainer, content, starIcon);
      }else{
        nameCol.append(iconContainer, content);
      }
      folderRow.append(nameCol, sizeCol, mtimeCol);
      cacheArray.push(folderRow);
    }
    // create file row
    for (let n = 0; n < data.files.length; n++) {
      let fileName = data.files[n][0];
      let fileRow = $("<div class='file-row entry-row'></div>");
      let nameCol = $("<div class='col-8 name-col'></div>");
      let iconContainer = $("<div class='icon_container'></div>");
      let icon = $("<div></div>");
      let content = $("<div class='content'></div>").text(fileName);
      let starIcon = $("<i class='far fa-star star_icon'></i>");
      let sizeCol = $("<div class='col-2 size-col'></div>").text(toStandardSize(data.files[n][3]));
      let mtimeCol = $("<div class='col-2 mtime-col'></div>").text(strptime(data.files[n][1]));
      parse_suffix(icon, fileName);
      iconContainer.append(icon);
      if(data.files[n][2] === 1){
        nameCol.append(iconContainer, content, starIcon);
      }else{
        nameCol.append(iconContainer, content);
      }
      fileRow.append(nameCol, sizeCol, mtimeCol);
      cacheArray.push(fileRow);
    }
  }
  entryContainer.append(cacheArray);
}

function createBreadCrumb(addedDirName = "") {
  let breadCrumbRow = $(".breadcrumb-row")
  let col = breadCrumbRow.find(".col-12");
  //only append
  if (addedDirName != "") {
    let separator = $("<span class='bc-separator'></span>").text(SEPARATORSYMBOL);
    let pathSpan = $("<span class='bc-path' id='bc_path" + ++_PATHID + "'></span>").text(addedDirName).one("click", breadCrumbClickHandler);
    col.append(separator, pathSpan);
  }
  //rewriting
  else {
    let cacheArray = new Array();
    let breadCrumbElements = breadCrumbRow.find("span");
    if (breadCrumbElements) {
      breadCrumbElements.remove();
    }
    if (CURRENTPATH === 'star') {
      let rootName = "我的收藏";
      let rootPath = $("<span class='bc-path' id='bc_path0'></span>").text(rootName).one("click", breadCrumbClickHandler);;
      cacheArray.push(rootPath);
    } else if (CURRENTPATH === "share") {
      let rootName = "我的分享";
      let rootPath = $("<span class='bc-path' id='bc_path0'></span>").text(rootName).one("click", breadCrumbClickHandler);;
      cacheArray.push(rootPath);
    } else if (CURRENTPATH === "trash_can") {
      let rootName = "回收站";
      let rootPath = $("<span class='bc-path' id='bc_path0'></span>").text(rootName).one("click", breadCrumbClickHandler);;
      cacheArray.push(rootPath);
    } else if (CURRENTPATH === "search") {
      let rootName = "搜索结果";
      let rootPath = $("<span class='bc-path' id='bc_path0'></span>").text(rootName).one("click", breadCrumbClickHandler);;
      cacheArray.push(rootPath);
    } else if (CURRENTPATH === ".") {
      let rootName = "根目录";
      let rootPath = $("<span class='bc-path' id='bc_path0'></span>").text(rootName).one("click", breadCrumbClickHandler);;
      cacheArray.push(rootPath);
    } else {
      let rootName = "根目录";
      let rootPath = $("<span class='bc-path' id='bc_path0'></span>").text(rootName).one("click", breadCrumbClickHandler);;
      cacheArray.push(rootPath);
      let pathArray = CURRENTPATH.slice(2, CURRENTPATH.length).split("/");
      for (let i = 0; i < pathArray.length; i++) {
        let separator = $("<span class='bc-separator'></span>").text(SEPARATORSYMBOL);
        let pathSpan = $("<span class='bc-path' id='bc_path" + (i + 1) + "'></span>").text(pathArray[i]);
        if (i != pathArray.length - 1) {
          pathSpan.one("click", breadCrumbClickHandler);
        }
        cacheArray.push(separator, pathSpan);
      }
    }
    col.append(cacheArray);
  }
}
// Reusable function
// '.' => '/'
// './foo/bar' => '/foo/bar/'
function pathParseUrl(path = CURRENTPATH) {
  if (path === '.' || path === 'trash_can' || path === 'star' || path === 'share' || path === 'search') {
    return '/';
  } else {
    return path.slice(1, path.length) + '/';
  }
}

function toStandardSize(size) {
  let unit;
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
  let standard_size = size.toString() + " " + unit;
  return standard_size;
}

function select(element, Component) {
  unselect(Component);
  element.classList.add("selected");
}

function unselect(Component) {
  let preselected = document.querySelector(Component + ' .selected');
  if (preselected) {
    preselected.classList.remove("selected");
  }
}

function showMenu(ev, mode) {
  let menu = document.querySelector('.menu');
  let height;
  let width;
  let htmlArray = [
    "<div class='menu_title'></div>",
    "<div class='menu_body'>"
  ];
  if(mode === 'entry'){
    let selectedElem = document.querySelector('.right-container .selected');
    let isFileRow = selectedElem.classList.contains('file-row');
    let isStared = selectedElem.querySelector('.star_icon');

    if(CURRENTPATH !== 'trash_can'){
      if(!isFileRow){
        htmlArray[2] = "<div class='menu_entry' id='menu_open'>打开</div>";
      }
      htmlArray[4] = "<div class='menu_entry' id='menu_download'>下载</div>";
      if(CURRENTPATH === 'share'){
        htmlArray[3] = "<div class='menu_entry' id='menu_redirect'>显示位置</div>"
        if(selectedElem.querySelector('.expire_time-col').innerText === '已过期'){
          htmlArray[7] = "<div class='menu_entry' id='menu_reshare'>再次分享</div>";
          htmlArray[9] = "<div class='menu_entry' id='menu_remove_share'>移除记录</div>"
        }else{
          htmlArray[5] = "<div class='menu_entry' id='menu_get_share_url'>获取分享链接</div>";
          htmlArray[8] = "<div class='menu_entry' id='menu_unshare'>取消分享</div>";
        }
      }else{
        if(CURRENTPATH !== 'star' && CURRENTPATH !== 'search'){
          htmlArray[12] = "<div class='menu_entry' id='menu_move'>移动到</div>";
        }
        htmlArray[6] = "<div class='menu_entry' id='menu_share'>分享</div>";
      }
      if(!isStared){
        htmlArray[10] = "<div class='menu_entry' id='menu_star'>收藏</div>";
      }else{
        htmlArray[11] = "<div class='menu_entry' id='menu_unstar'>取消收藏</div>";
      }
      if(CURRENTPATH === 'star' || CURRENTPATH === 'search'){
        htmlArray[3] = "<div class='menu_entry' id='menu_redirect'>显示位置</div>";
      }
      htmlArray[13] = "<div class='menu_entry' id='menu_rename'>重命名</div>";
      htmlArray[14] = "<div class='menu_entry' id='menu_remove'>删除</div>";
    }else{
      htmlArray[15] = "<div class='menu_entry' id='menu_restore'>还原</div>";
      htmlArray[16] = "<div class='menu_entry' id='menu_delete'>彻底删除</div>";
    }
  }else if(mode === 'blank'){
    htmlArray[17] = "<div class='menu_entry' id='menu_refresh'>刷新</div>";
    if(CURRENTPATH === 'trash_can'){
      htmlArray[21] = "<div class='menu_entry' id='menu_empty'>清空回收站</div>";
    }else{
      htmlArray[18] = "<div class='menu_entry' id='menu_create_file'>新建文件</div>";
      htmlArray[19] = "<div class='menu_entry' id='menu_create_folder'>新建文件夹</div>";
      htmlArray[20] ="<div class='menu_entry' id='menu_upload_file'>上传文件</div>";
    }
  }
  htmlArray.push("</div>");
  height = (htmlArray.filter(n => n).length - 3) * 30 + 15;
  if(htmlArray[5]){
    width = 122;
  }else if(htmlArray[17]){
    width = 106;
  }else if(htmlArray[3] || htmlArray[7] || htmlArray[9] || htmlArray[14] || htmlArray[16] || htmlArray[18]){
    width = 90;
  }else if(htmlArray[10] || htmlArray[11]){
    width = 74;
  }
  menu.innerHTML = htmlArray.join('');

  // display entry menu
  if (H - ev.pageY < height) {
    menu.style.top = ev.pageY - height + "px";
  } else {
    menu.style.top = ev.pageY + "px";
  }
  if (W - ev.pageX < width) {
    menu.style.left = ev.pageX - width + "px";
  } else {
    menu.style.left = ev.pageX + "px";
  }

  menu.style.display = 'flex';
}
// event handler function
function wholeContainerClickHandler(ev) {
  document.querySelector('.menu').style.display = 'none';
}
function wholeContainerRightClickHandler(ev){
  ev.preventDefault();
  document.querySelector('.menu').style.display = 'none';
}

function sidebarClickHandler(ev) {
  if (document.querySelector('#sidebar-my_file').contains(ev.target)) {
    let target = document.querySelector('#sidebar-my_file');
    if (!target.classList.contains("selected")) {
      select(target, ".sidebar");
      draw_all('.');
    }
  } else if (document.querySelector('#sidebar-my_star').contains(ev.target)) {
    let target = document.querySelector('#sidebar-my_star');
    if (!target.classList.contains("selected")) {
      select(target, ".sidebar");
      draw_all('star');
    }
  } else if (document.querySelector('#sidebar-my_share').contains(ev.target)) {
    let target = document.querySelector('#sidebar-my_share');
    if (!target.classList.contains("selected")) {
      select(target, ".sidebar");
      draw_all('share');
    }
  } else if (document.querySelector('#sidebar-trash_can').contains(ev.target)) {
    let target = document.querySelector('#sidebar-trash_can');
    if (!target.classList.contains("selected")) {
      select(target, ".sidebar");
      draw_all('trash_can');
    }
  }
}

function rightContainerClickHandler(ev) {
  let result = contain(".entry-row", ev.target);
  if (result) {
    select(result, '.right-container');
  } else {
    unselect('.right-container');
  }
}

function rightContainerDbClickHandler(ev) {
  ev.stopPropagation();
  if (contain(".folder-row", ev.target)) {
    openEntry();
  }
}

function rightContainerRightClickHandler(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  let result = contain(".entry-row", ev.target);
  if (result) {
    select(result, '.right-container');
    showMenu(ev, 'entry');
  } else {
    if (CURRENTPATH !== 'share' && CURRENTPATH !== 'star' && CURRENTPATH !== 'search') {
      unselect('.right-container');
      showMenu(ev, 'blank');
    }else{
      document.querySelector('.menu').style.display = 'none';
    }
  }
}

function mouseMenuRightClickHandler(ev) {
  ev.preventDefault();
  ev.stopPropagation();
}

function menuClickHandler(ev) {
  ev.stopPropagation();
  document.querySelector('.menu').style.display = 'none';

  if (ev.target.id === 'menu_refresh') {
    draw_all();
  } else if (ev.target.id === 'menu_create_file') {
    createFile();
  } else if (ev.target.id === 'menu_create_folder') {
    createFolder()
  } else if (ev.target.id === 'menu_upload_file') {
    $("#fileElem").click();
  } else if(ev.target.id === 'menu_empty'){
    emptyTrashCan();
  } else if (ev.target.id === 'menu_open') {
    openEntry();
  } else if (ev.target.id === 'menu_download') {
    downloadEntry();
  } else if (ev.target.id === 'menu_share' || ev.target.id === 'menu_res') {
    shareEntry();
  } else if (ev.target.id === 'menu_unshare' || ev.target.id === 'menu_remove_share'){
    unshareEntry();
  } else if (ev.target.id === 'menu_move') {
    moveEntry();
  } else if (ev.target.id === 'menu_rename') {
    renameEntry();
  } else if (ev.target.id === 'menu_star') {
    starEntry();
  } else if (ev.target.id === 'menu_unstar'){
    unstarEntry();
  } else if (ev.target.id === 'menu_remove') {
    removeEntry();
  } else if (ev.target.id === 'menu_redirect'){
    redirectEntry();
  } else if (ev.target.id === 'menu_get_share_url'){
    getShareUrl();
  } else if (ev.target.id === 'menu_restore'){
    restoreEntry();
  } else if (ev.target.id === 'menu_delete'){
    deleteEntry();
  }
}

function breadCrumbClickHandler(ev) {
  // update CURRENTPATH
  if(CURRENTPATH !== 'star' && CURRENTPATH !== 'share' && CURRENTPATH !== 'trash_can' && CURRENTPATH !== 'search'){
    let path;
    _PATHID = parseInt(ev.target.id.slice(7));
    if (_PATHID === 0) {
      path = ".";
    } else {
      let index = 1;
      for (let i = 0; i < _PATHID; i++) {
        index = CURRENTPATH.indexOf("/", index + 1);
      }
      path = CURRENTPATH.slice(0, index);
    }
    draw_all(path);
  }
}

function searchBtnClickHandler(ev){
  let searchText = document.querySelector('#search-input').value;
  let url = PARADICT["file_api_url"] + PARADICT["username"] + "/?search_info=1&search_text=" + searchText;

  fetch(url, {credentials: "same-origin"})
  .then(response => {
    if(response.ok){
      response.json().then(data => {
        CURRENTPATH = 'search';
        JSONDATA = data;
        unselect('.sidebar');
        createTable();
        createBreadCrumb();
      })
    }else{
      alert('获取数据失败');
    }
  })
}

function modalRightClickHandler(ev){
  ev.preventDefault();
}
// operate function
function openEntry(){
  let path;
  let name = document.querySelector('.right-container .selected .content').innerText;
  if(CURRENTPATH === 'star' || CURRENTPATH === 'share' || CURRENTPATH === 'search'){
    path = get_path_from_json();
    path = path + '/' + name;
    select(document.querySelector('.sidebar #sidebar-my_file'), '.sidebar');
    draw_all(path);
  }else if(CURRENTPATH !== 'trash_can'){
    path = CURRENTPATH + "/" + name;
    draw_all(path);
  }
}

function downloadEntry() {
  let name = document.querySelector(".right-container .selected .content").innerText;
  let isFileRow = document.querySelector('.right-container .selected').classList.contains('file-row');
  let url;
  if(CURRENTPATH == 'share' || CURRENTPATH == 'star' || CURRENTPATH == 'search'){
    url = PARADICT["file_api_url"] + PARADICT["username"] + get_path_from_json().slice(1) + '/' + name + '/'
  }else{
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + name + '/';
  }
  let modal = $(".confirm_modal");
  let content = isFileRow ? "确认下载该文件吗？" : "确认下载该文件夹吗？";
  content += "<a download href='" + url + "' class='hiden_link'></a>";
  // add content
  modal.find(".modal-title").text("确认下载");
  modal.find(".modal-body").html(content);
  modal.find(".modal-footer").html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

  modal.find(".btn-primary").off().one("click", function() {
    document.querySelector(".confirm_modal .hiden_link").click();
    modal.modal('hide');
  });
  modal.modal('show');
}

function shareEntry() {
  let name = document.querySelector(".right-container .selected .content").innerText;
  let url;
  if(CURRENTPATH == 'share' || CURRENTPATH == 'star' || CURRENTPATH == 'search'){
    url = PARADICT["file_api_url"] + PARADICT["username"] + get_path_from_json().slice(1) + '/' + name + '/?share=1'
  }else{
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + name + '/?share=1';
  }
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  // add content
  modalTitle.text("确认分享");
  modalPrompt.text("");
  modalBody.html('<div class="container"><span>有效期:</span><div class="form-check form-check-inline"><input class="form-check-input"id="radio1"type="radio"name="life"value="1" checked><label class="form-check-label"for="radio1">1小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio2"type="radio"name="life"value="6"><label class="form-check-label"for="radio2">6小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio3"type="radio"name="life"value="24"><label class="form-check-label"for="radio3">24小时</label></div><div class="form-check form-check-inline"><input class="form-check-input"id="radio4"type="radio"name="life"value="0"><label class="form-check-label"for="radio4">永久</label></div></div>');
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.one("click", function() {
    let life = modalBody.find("input:checked").val();
    fetch(url + '&life=' + life, {
        credentials: "same-origin",
        method: "PATCH"
      })
      .then(function(response) {
        confirmButton.css("display", "none");
        if (response.ok) {
          response.json().then(function(data) {
            if (life === '0') {
              life = "永久";
            } else {
              life += "小时";
            }
            if(CURRENTPATH === 'share'){
              draw_all()
            }
            modalTitle.text("分享成功");
            modalPrompt.text("");
            modalBody.html(success_message('链接创建成功,该链接有效期为' + life) + '<div class="input-group"><input type="text"class="form-control"value="' + PARADICT["share_url"] + data.sid + '/"><div class="input-group-append"><button class="btn btn-outline-primary"type="button">复制</button></div></div></div>');
            modalBody.find(".btn-outline-primary").on("click", function() {
              if (document.execCommand('copy')) {
                modalBody.find(".form-control").select();
                document.execCommand('copy');
              }
            })
          })
        } else {
          response.json().then(function(data) {
            modalTitle.text("发生了一个错误");
            modalBody.html(error_message("链接创建错误", false, data));
          })
        }
      })
  });
  modal.modal('show');
}

function unshareEntry(){
  let name = document.querySelector(".right-container .selected .content").innerText;
  let path = get_path_from_json().slice(1);
  let isFileRow = document.querySelector('.right-container .selected').classList.contains('file-row');
  let format = isFileRow ? "文件" : "文件夹";
  let url = PARADICT["file_api_url"] + PARADICT["username"] + path + '/' + name + '/?share=0';
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  // add content
  modalTitle.text("确认取消分享");
  modalPrompt.text("");
  modalBody.text("确认取消分享该" + format + "吗？");
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().one("click", function() {
    fetch(url, {
        credentials: "same-origin",
        method: "PATCH"
      })
      .then(function(response) {
        confirmButton.css("display", "none");
        if (response.ok) {
          draw_all(CURRENTPATH);
          modalPrompt.text("");
          modalTitle.text("取消分享成功");
          modalBody.html(success_message("已成功取消分享"));
        } else {
          response.json().then(function(data) {
            modalTitle.text("发生了一个错误");
            modalBody.html(error_message("取消分享失败", false, data))
          })
        }
      })
  });
  modal.modal('show');
}

function moveEntry() {
  let selectedElement = document.querySelector(".right-container .selected");
  let name = selectedElement.querySelector(".content").innerText;
  let before_path = PARADICT['username'] + pathParseUrl() + name;
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt")
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  modalTitle.text("移动到");
  modalPrompt.text("");
  modalBody.text("");
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
  let confirmButton = modalFooter.find(".btn-primary");
  let folder_info_url = PARADICT["file_api_url"] + PARADICT["username"] + '/?folder_info=1';
  fetch(folder_info_url, {
      credentials: "same-origin",
      method: "GET"
    })
    .then(function(response) {
      if (response.ok) {
        response.json().then(function(data) {
          function drawSmallFolder(data, count, folderpath, insertedElement = 'anything') {
            let keys = Object.keys(data);
            let container = $('<div class="small_folder_container"></div>');
            container.data("folderpath", folderpath);
            if (count === 0) {
              let smallFolderRowRoot = $('<div class="row small_folder_row small_folder_row_root selected"></div>');
              smallFolderRowRoot.data("folderpath", "/");
              let media = $('<div class="media"><div class="small_folder_button"></div><div class="small_folder_icon"></div><div class="small_folder_name">根目录</div></div>');
              smallFolderRowRoot.click(function(ev) {
                container.toggle();
                $(this).find(".small_folder_button").toggleClass("clicked");
                select(this, ".small_folder_container");
              });
              smallFolderRowRoot.contextmenu(function(ev) {
                ev.preventDefault()
                select(this, ".small_folder_container");
              });
              smallFolderRowRoot.append(media);
              containerRoot.append(smallFolderRowRoot);
            }
            for (let i = 0; i < keys.length; i++) {
              if (data[keys[i]] === "0") {
                let smallFolderRow = $('<div class="row small_folder_row"></div>');
                smallFolderRow.data("folderpath", folderpath + keys[i] + '/');
                let media = $('<div class="media"><div class="small_folder_icon"></div><div class="small_folder_name">' + keys[i] + '</div></div>');
                for (let k = 0; k < count + 2; k++) {
                  let smallFolderBlank = $('<div class="small_folder_blank"></div>');
                  media.prepend(smallFolderBlank);
                }
                smallFolderRow.append(media);
                container.append(smallFolderRow);
              } else {
                let smallFolderRow = $('<div class="row small_folder_row small_folder_row_expand"></div>');
                smallFolderRow.data("folderpath", folderpath + keys[i] + '/');
                let media = $('<div class="media"><div class="small_folder_button"></div><div class="small_folder_icon"></div><div class="small_folder_name">' + keys[i] + '</div></div>');
                for (let k = 0; k < count + 1; k++) {
                  let smallFolderBlank = $('<div class="small_folder_blank"></div>');
                  media.prepend(smallFolderBlank);
                }
                smallFolderRow.append(media);
                container.append(smallFolderRow);
              }
            }
            if (count === 0) {
              containerRoot.append(container);
            } else {
              container.insertAfter(insertedElement);
            }
            container.find(".small_folder_row_expand").click(function(ev) {
              let folderpath = $(ev.currentTarget).data("folderpath");
              if ($(ev.currentTarget).data("inited") != '1') {
                let index_arr = folderpath.slice(1, -1).split('/');
                let index = index_arr[index_arr.length - 1]
                let folderData = data[index];
                drawSmallFolder(folderData, count + 1, folderpath, ev.currentTarget);
                $(ev.currentTarget).data("inited", "1");
              } else {
                let childContainers = container.find(".small_folder_container");
                let childContainer;
                for (let i = 0; i < childContainers.length; i++) {
                  if ($(childContainers[i]).data("folderpath") === folderpath) {
                    childContainer = $(childContainers[i])
                  }
                }
                childContainer.toggle();
              }
              $(this).find(".small_folder_button").toggleClass("clicked");
            })
            container.find(".small_folder_row").click(function(ev) {
              select(this, ".small_folder_container");
            })
            container.find(".small_folder_row").contextmenu(function(ev) {
              ev.preventDefault()
              select(this, ".small_folder_container");
            })
          }
          let containerRoot = $('<div class="small_folder_container" id="small_folder_containerRoot"></div>');
          drawSmallFolder(data, 0, '/');
          modalBody.append(containerRoot);
          confirmButton.click(() => {
            let folderPath = containerRoot.find(".selected").data("folderpath").slice(0, -1);
            let after_path = PARADICT['username'] + folderPath;
            let bf_array = before_path.split('/');
            let af_array = after_path.split('/');
            let bf_last_index = bf_array.length - 1;
            if (bf_array[bf_last_index] === af_array[bf_last_index]) {
              modalPrompt.html(error_message("不能将文件夹移动到本身或者子文件夹内"));
            } else {
              fetch(PARADICT["file_api_url"] + after_path + '/?info=1', {
                  credentials: "same-origin"
                })
                .then(function(response) {
                  if (response.ok) {
                    response.json().then(function(data) {
                      let have_same = have_same_file(name, data)
                      if (have_same === true) {
                        modalPrompt.html(error_message("该文件夹内有同名的文件或文件夹，无法移动"));
                      } else {
                        fetch(PARADICT["file_api_url"] + before_path + '/', {
                            credentials: "same-origin",
                            method: "PATCH",
                            body: JSON.stringify({
                              af_path: after_path
                            }),
                            headers: {
                              'content-type': 'application/json'
                            }
                          })
                          .then(function(response) {
                            confirmButton.css("display", "none");
                            if (response.ok) {
                              draw_all();
                              modalPrompt.text("");
                              modalBody.html(success_message("已成功移动"));
                            } else {
                              response.json().then(function(data) {
                                modalTitle.text("发生了一个错误");
                                modalBody.html(error_message("移动失败", false, data));
                              });
                            }
                          });
                      }
                    })
                  } else {
                    response.json().then(function(data) {
                      modalTitle.text("发生了一个错误");
                      modalBody.html(error_message("获取所选文件夹列表失败", false, data));
                    })
                  }
                });
            }
          })
        })
      } else {
        confirmButton.css("display", "none");
        modalTitle.text("发生了一个错误");
        modalBody.html(error_message("获取文件夹列表失败", false, data));
      }
    })
  confirmButton.css("display", "block");
  modal.modal('show');
}

function renameEntry() {
  let selected = document.querySelector('.right-container .selected');
  let isFileRow = selected.classList.contains('file-row');
  let name = selected.querySelector(".content").innerText;
  let re;
  let url;
  if(CURRENTPATH == 'share' || CURRENTPATH == 'star' || CURRENTPATH == 'search'){
    url = PARADICT["file_api_url"] + PARADICT["username"] + get_path_from_json().slice(1) + '/' + name + '/'
  }else{
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + name + '/';
  }
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  // add content
  modalTitle.text("重命名");
  modalPrompt.text("");
  modalBody.html('<label for="name_input">请为其输入新名称:</label><input type="text" id="name_input" value="' + name + '" size=40>');
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().on("click", function() {
    let after_name = document.querySelector("#name_input").value;
    if (isFileRow) {
      re = /^[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)]{1}([ ]?[\w\u4e00-\u9fa5!@#$%,.\+\-\^\(\)])*?[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)]{1}$/;
    } else {
      re = /^[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)]{1}([ ]?[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)])*$/;
    }
    let have_same = have_same_file(after_name, JSONDATA);
    if (re.test(after_name) && after_name.length <= 255 && !have_same) {
      fetch(url, {
          credentials: "same-origin",
          method: "PATCH",
          body: JSON.stringify({
            af_name: after_name
          }),
          headers: {
            'content-type': 'application/json'
          }
        })
        .then(function(response) {
          confirmButton.css("display", "none");
          if (response.ok) {
            draw_all();
            modalPrompt.text("");
            modalTitle.text("重命名成功");
            modalBody.html(success_message("已成功重命名"));
          } else {
            response.json().then(function(data) {
              modalTitle.text("发生了一个错误");
              modalBody.html(error_message("重命名失败.", false, data));
            })
          }
        })
    } else if (have_same) {
      modalPrompt.html(error_message("重命名失败,当前目录内已有同名文件或文件夹."));
    } else {
      modalPrompt.html(error_message("重命名失败,名称不符合规范."))
    }
  })
  modal.modal('show');
}

function starEntry() {
  let name = document.querySelector(".right-container .selected .content").innerText;
  let isFileRow = document.querySelector('.right-container .selected').classList.contains('file-row');
  let format = isFileRow ? "文件" : "文件夹";
  let url;
  if(CURRENTPATH == 'share' || CURRENTPATH == 'star' || CURRENTPATH == 'search'){
    url = PARADICT["file_api_url"] + PARADICT["username"] + get_path_from_json().slice(1) + '/' + name + '/?star=1'
  }else{
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + name + '/?star=1';
  }
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  // add content
  modalTitle.text("确认收藏");
  modalPrompt.text("");
  modalBody.text("确认收藏该" + format + "吗？");
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().one("click", function() {
    fetch(url, {
        credentials: "same-origin",
        method: "PATCH"
      })
      .then(function(response) {
        confirmButton.css("display", "none");
        if (response.ok) {
          draw_all(CURRENTPATH);
          modalPrompt.text("");
          modalTitle.text("收藏成功");
          modalBody.html(success_message("已成功收藏"));
        } else {
          response.json().then(function(data) {
            modalTitle.text("发生了一个错误");
            modalBody.html(error_message("收藏失败", false, data))
          })
        }
      })
  });
  modal.modal('show');
}

function unstarEntry() {
  let name = document.querySelector(".right-container .selected .content").innerText;
  let isFileRow = document.querySelector('.right-container .selected').classList.contains('file-row');
  let format = isFileRow ? "文件" : "文件夹";
  let url;
  if(CURRENTPATH == 'share' || CURRENTPATH == 'star' || CURRENTPATH == 'search'){
    url = PARADICT["file_api_url"] + PARADICT["username"] + get_path_from_json().slice(1) + '/' + name + '/?star=0'
  }else{
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + name + '/?star=0';
  }
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  // add content
  modalTitle.text("确认取消收藏");
  modalPrompt.text("");
  modalBody.text("确认取消收藏该" + format + "吗？");
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().one("click", function() {
    fetch(url, {
        credentials: "same-origin",
        method: "PATCH"
      })
      .then(function(response) {
        confirmButton.css("display", "none");
        if (response.ok) {
          draw_all(CURRENTPATH);
          modalPrompt.text("");
          modalTitle.text("取消收藏成功");
          modalBody.html(success_message("已成功取消收藏"));
        } else {
          response.json().then(function(data) {
            modalTitle.text("发生了一个错误");
            modalBody.html(error_message("取消收藏失败", false, data))
          })
        }
      })
  });
  modal.modal('show');
}

function removeEntry() {
  let entry = document.querySelector(".right-container .selected");
  let name = entry.querySelector(".content").innerText;
  let isFileRow = document.querySelector('.right-container .selected').classList.contains('file-row');
  let format = isFileRow ? "文件" : "文件夹";
  let url;
  if(CURRENTPATH == 'share' || CURRENTPATH == 'star' || CURRENTPATH == 'search'){
    url = PARADICT["file_api_url"] + PARADICT["username"] + get_path_from_json().slice(1) + '/' + name + '/?trash_can=1'
  }else{
    url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + name + '/?trash_can=1';
  }
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  // add content
  modalTitle.text("确认放入回收站");
  modalPrompt.text("");
  modalBody.text("确认将该" + format + "放入回收站吗？");
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().one("click", function() {
    fetch(url, {
        credentials: "same-origin",
        method: "PATCH"
      })
      .then(function(response) {
        confirmButton.css("display", "none");
        if (response.ok) {
          draw_all()
          modalPrompt.text("");
          modalTitle.text("放入回收站成功");
          modalBody.html(success_message("已成功放入回收站"));
        } else {
          response.json().then(function(data) {
            modalTitle.text("发生了一个错误");
            modalBody.html(error_message("放入回收站失败", false, data))
          })
        }
      })
  });
  modal.modal('show');
}

function restoreEntry() {
  let entry = document.querySelector(".right-container .selected");
  let name = entry.querySelector(".content").innerText;
  let isFileRow = document.querySelector('.right-container .selected').classList.contains('file-row');
  let format = isFileRow ? "文件" : "文件夹";
  let url = PARADICT["file_api_url"] + PARADICT["username"] + get_path_from_json().slice(1) + '/' + name + '/?trash_can=0';
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  // add content
  modalTitle.text("确认还原");
  modalPrompt.text("");
  modalBody.text("确认将该" + format + "还原吗？");
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().one("click", function() {
    fetch(url, {
        credentials: "same-origin",
        method: "PATCH"
      })
      .then(function(response) {
        confirmButton.css("display", "none");
        if (response.ok) {
          entry.style.display = 'none';
          modalPrompt.text("");
          modalTitle.text("还原成功");
          modalBody.html(success_message("已成功还原"));
        } else {
          response.json().then(function(data) {
            modalTitle.text("发生了一个错误");
            modalBody.html(error_message("还原失败。", false, data))
          })
        }
      })
  });
  modal.modal('show');
}
function deleteEntry(){
  let entry = document.querySelector(".right-container .selected");
  let name = entry.querySelector(".content").innerText;
  let isFileRow = document.querySelector('.right-container .selected').classList.contains('file-row');
  let format = isFileRow ? "文件" : "文件夹";
  let url = PARADICT["file_api_url"] + PARADICT["username"] + get_path_from_json().slice(1) + '/' + name + '/';
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  // add content
  modalTitle.text("确认彻底删除");
  modalPrompt.text("");
  modalBody.text("确认将该" + format + "彻底删除？\n该操作无法撤销！");
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().one("click", function() {
    fetch(url, {
        credentials: "same-origin",
        method: "DELETE"
      })
      .then(function(response) {
        confirmButton.css("display", "none");
        if (response.ok) {
          entry.style.display = 'none';
          modalPrompt.text("");
          modalTitle.text("彻底删除成功");
          modalBody.html(success_message("已成功彻底删除"));
        } else {
          response.json().then(function(data) {
            modalTitle.text("发生了一个错误");
            modalBody.html(error_message("彻底删除失败", false, data))
          })
        }
      })
  });
  modal.modal('show');
}

function redirectEntry(){
  let name = document.querySelector('.right-container .selected .content').innerText;
  let path = get_path_from_json();
  select(document.querySelector('#sidebar-my_file'), '.sidebar');
  draw_all(path, name);
}

function getShareUrl(){
  let path = get_path_from_json().slice(1);
  let name = document.querySelector(".right-container .selected .content").innerText;
  let url = PARADICT["file_api_url"] + PARADICT["username"] + path + '/' + name + '/?sid=1';
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.css("display", "none");
  fetch(url, {
    credentials: "same-origin",
    method: "GET"
  }).then(response => {
    if(response.ok){
      response.json().then(data => {
        modalTitle.text("获取成功");
        modalPrompt.text("");
        modalBody.html(success_message('获取分享链接成功') + '<div class="input-group"><input type="text"class="form-control"value="' + PARADICT["share_url"] + data.sid + '/"><div class="input-group-append"><button class="btn btn-outline-primary"type="button">复制</button></div></div></div>');
        modalBody.find(".btn-outline-primary").on("click", function() {
          if (document.execCommand('copy')) {
            modalBody.find(".form-control").select();
            document.execCommand('copy');
          }
        })
      })
    }else{
      response.json().then(function(data) {
        modalTitle.text("发生了一个错误");
        modalBody.html(error_message("链接获取错误", false, data));
      })
    }
  })
  modal.modal('show');
}

function uploadFiles(files) {
  let formData = new FormData();
  let url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + "?upload_files=1"
  let re = /^[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)]{1}([ ]?[\w\u4e00-\u9fa5!@#$%,.\+\-\^\(\)])*?[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)]{1}$/;
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  let same = false;
  let valid = true;

  modalFooter.html('<button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

  for (let i = 0; i < files.length; i++) {
    if (have_same_file(files[i].name, JSONDATA)) {
      same = true;
      modalTitle.text("上传失败");
      modalBody.html(error_message("当前目录内有与上传文件相同名称的文件或者文件夹.", false));
      document.querySelector('#fileElem').value = '';
      modal.modal('show');
      return
    }
    if (!re.test(files[i].name) || files[i].name.length > 255) {
      valid = false;
      modalTitle.text("上传失败");
      modalBody.html(error_message("上传文件名称不合法.", false));
      document.querySelector('#fileElem').value = '';
      modal.modal('show');
      return
    }
    formData.append('file' + i, files[i]);
  }
  if (!same && valid) {
    fetch(url, {
        credentials: "same-origin",
        method: "POST",
        body: formData
      })
      .then(function(response) {
        if (response.ok) {
          modalTitle.text("上传成功");
          modalBody.html(success_message("已成功上传文件"));
          draw_all(CURRENTPATH);
          document.querySelector('#fileElem').value = '';
          modal.modal('show');
        } else {
          response.json().then(function(data) {
            modalTitle.text("上传失败");
            modalBody.html(error_message("上传失败.", false, data));
            document.querySelector('#fileElem').value = '';
            modal.modal('show');
          })
        }
      })
  }
}

function createFile() {
  let url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + '?create_file=1&name=';
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  let re = /^[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)]{1}([ ]?[\w\u4e00-\u9fa5!@#$%,.\+\-\^\(\)])*?[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)]{1}$/;
  // add content
  modalTitle.text("创建新文件");
  modalPrompt.text("");
  modalBody.html('<label for="name_input">请为其输入名称:</label><input type="text" id="name_input" size=40>');
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().on("click", function() {
    name = document.querySelector("#name_input").value;
    let have_same = have_same_file(name, JSONDATA);
    if (re.test(name) && name.length <= 255 && !have_same) {
      url = url + name;
      fetch(url, {
          credentials: "same-origin",
          method: "POST"
        })
        .then(function(response) {
          confirmButton.css("display", "none");
          if (response.ok) {
            draw_all(CURRENTPATH);
            modalTitle.text("创建文件成功");
            modalPrompt.text("");
            modalBody.html(success_message("已成功创建文件"));
          } else {
            response.json().then(function(data) {
              modalTitle.text("发生了一个错误");
              modalBody.html(error_message("创建失败.", false, data));
            })
          }
        })
    } else if (have_same) {
      modalPrompt.html(error_message("创建失败,当前目录内已有同名文件或文件夹."));
    } else {
      modalPrompt.html(error_message("创建失败,名称不符合规范."))
    }
  })
  modal.modal('show');
}

function createFolder() {
  let url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + '?create_folder=1&name=';
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  let re = /^[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)]{1}([ ]?[\w\u4e00-\u9fa5!@#$%,\+\-\^\(\)])*$/;
  // add content
  modalTitle.text("创建新文件夹");
  modalPrompt.text("");
  modalBody.html('<label for="name_input">请为其输入名称:</label><input type="text" id="name_input" size=40>');
  modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
  let confirmButton = modalFooter.find('.btn-primary');
  confirmButton.off().on("click", function() {
    name = document.querySelector("#name_input").value;
    let have_same = have_same_file(name, JSONDATA);
    if (re.test(name) && name.length <= 255 && !have_same) {
      url = url + name;
      fetch(url, {
          credentials: "same-origin",
          method: "POST"
        })
        .then(function(response) {
          confirmButton.css("display", "none");
          if (response.ok) {
            draw_all(CURRENTPATH);
            modalTitle.text("创建文件夹成功");
            modalPrompt.text("");
            modalBody.html(success_message("已成功创建文件夹"));
          } else {
            response.json().then(function(data) {
              modalTitle.text("发生了一个错误");
              modalBody.html(error_message("创建失败.", false, data));
            })
          }
        })
    } else if (have_same) {
      modalPrompt.html(error_message("创建失败,当前目录内已有同名文件或文件夹."));
    } else {
      modalPrompt.html(error_message("创建失败,名称不符合规范."))
    }
  })
  modal.modal('show');
}

function emptyTrashCan(){
  let url = PARADICT["file_api_url"] + PARADICT["username"] + pathParseUrl() + "?empty_trash_can=1";
  let modal = $(".confirm_modal");
  let modalTitle = modal.find(".modal-title");
  let modalPrompt = modal.find(".modal-prompt");
  let modalBody = modal.find(".modal-body");
  let modalFooter = modal.find(".modal-footer");
  if(document.querySelector('.entry-row') === null){
    modalTitle.text("回收站已空");
    modalPrompt.text("");
    modalBody.text("回收站目前已空，无需清空");
    modalFooter.html('<button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');
  }else {
    modalTitle.text("确认清空回收站");
    modalPrompt.text("");
    modalBody.text("确认将回收站彻底清空？\n该操作无法撤销！");
    modalFooter.html('<button type="button" class="btn btn-primary">确认</button><button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>');

    let confirmButton = modalFooter.find('.btn-primary');
    confirmButton.off().one("click", function() {
      fetch(url, {
          credentials: "same-origin",
          method: "DELETE"
        })
        .then(function(response) {
          confirmButton.css("display", "none");
          if (response.ok) {
            draw_all()
            modalPrompt.text("");
            modalTitle.text("清空回收站成功");
            modalBody.html(success_message("已成功清空回收站"));
          } else {
            response.json().then(function(data) {
              modalTitle.text("发生了一个错误");
              modalBody.html(error_message("清空回收站失败", false, data))
            })
          }
        })
    });
  }
  
  modal.modal('show');
}
// init all

window.onload = init_all();
