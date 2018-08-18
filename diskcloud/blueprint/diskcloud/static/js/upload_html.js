var input = document.querySelector('#file');
var preview = document.querySelector('.preview');
input.style.visibility = 'hidden';
input.addEventListener('change',updateImageDisplay);

function updateImageDisplay(){
	while(preview.firstChild){
		preview.removeChild(preview.firstChild);
	}

	var cur_files = input.files
	if(cur_files.length == 0){
		var para = document.createElement('p');
		para.textContent = 'No files currently are selected for upload'
		preview.appendChild(para);
	}else{
		var list = document.createElement('ol');
		for(var i = 0; i < cur_files.length; i++){
			var list_item = document.createElement('li');
			var para = document.createElement('p');
			if(vaildFileType(cur_files[i])){
				para.textContent = 'File name: ' + cur_files[i].name + '; File size: ' + roughSize(cur_files[i].size) + '.' ;

				list_item.appendChild(para);
			}else{
				para.textContent = 'File name:' + cur_files[i].name + ' is not vaild file type.';

				list_item.appendChild(para);
			}

			list.appendChild(list_item);
			preview.appendChild(list);
		}
	}
}

var allowed_file_type = [
	'image/jpeg',
	'image/pjpeg',
	'image/png'
]

function vaildFileType(file){
	for(var i = 0; i < allowed_file_type.length; i++){
		if(file.type === allowed_file_type[i]){
			return true;
		}
	}
	return false;
}

function roughSize(filesize){
	if(filesize < 1024){
		return filesize + ' byte';
	}
	if(filesize < 1048576){
		return (filesize/1024).toFixed(1) + ' KB';
	}
	if(filesize < 1073741824){
		return (filesize/1048576).toFixed(1) + ' MB';
	}
	else{
		return (filesize/1073741824).toFixed(1) + ' GB';
	}
}
