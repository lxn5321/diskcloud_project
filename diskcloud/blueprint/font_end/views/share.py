def Share(sid):
    from pathlib import Path
    from flask import render_template
    from diskcloud.libs.share import valid_sid
    from diskcloud.libs.file import download

    result = valid_sid(sid)
    if result == False:
        return render_template('error.html',err_mes = '错误的分享地址，该文件已不存在或已过期')
    path = Path(result[0], result[1], result[2]).as_posix()
    try:
        return download(path)
    except Exception as e:
        return render_template('error.html',err_mes = e)
