def Share(sid):
    from diskcloud.models.share import valid_sid
    from diskcloud.models.file import download_resource
    from flask import render_template,current_app
    from pathlib import Path

    result = valid_sid(sid)
    if result == False:
        return render_template('error.html',err_mes = 'valid sid')
    path = Path(current_app.config['FILES_FOLDER'],result)
    return download_resource(path)
