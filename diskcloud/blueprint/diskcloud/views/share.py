def Share(sid):
    from pathlib import Path
    from flask import render_template,current_app
    from diskcloud.models.share import valid_sid
    from diskcloud.models.file import download

    result = valid_sid(sid)
    if result == False:
        return render_template('error.html',err_mes = 'valid sid')
    path = Path(current_app.config['FILES_FOLDER'],result)
    try:
        result = download(path)
        return result
    except ValueError as e:
        return render_template('error.html',err_mes = e)
