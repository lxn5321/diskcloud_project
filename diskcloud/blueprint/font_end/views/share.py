def Share(sid):
    from pathlib import Path
    from flask import render_template
    from diskcloud.libs.share import valid_sid
    from diskcloud.libs.file import download

    result = valid_sid(sid)
    if result == False:
        return render_template('error.html',err_mes = 'valid sid')
    path = Path(result[0], result[1], result[2]).as_posix()
    try:
        return download(path)
    except ValueError as e:
        return render_template('error.html',err_mes = e)
