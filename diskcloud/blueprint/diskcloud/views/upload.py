from flask import request,render_template,current_app
from werkzeug.utils import secure_filename

def Upload():
    if request.method == 'POST':
        files = request.files.getlist('file')
        files_name = ''
        for file in files:
            files_name += file.filename + '; '
            file.save(current_app.root_path+'/uploads/' + secure_filename(file.filename))
        return files_name
    return render_template('upload.html')
